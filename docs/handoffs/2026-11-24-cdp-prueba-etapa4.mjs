// Verificación Etapa 4 en Chrome headless con perfil temporal y datos de prueba (backup de agosto).
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PROF = process.argv[2];
const SHOT = process.argv[3];
const URL = 'http://127.0.0.1:7432/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9333', '--user-data-dir=' + PROF,
  '--no-first-run', '--no-default-browser-check', '--window-size=1280,2400', 'about:blank'], { stdio: 'ignore' });
let ws, seq = 0; const pend = new Map(); const errs = [];
function send(method, params = {}) {
  const id = ++seq; ws.send(JSON.stringify({ id, method, params }));
  return new Promise((res) => pend.set(id, { res }));
}
async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: `(async()=>{${expr}})()`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) return { EXC: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
  return r.result.value;
}
const log = (k, v) => console.log(k + ':', typeof v === 'string' ? v : JSON.stringify(v, null, 1));
try {
  let targets;
  for (let i = 0; i < 20; i++) { try { targets = await (await fetch('http://127.0.0.1:9333/json/list')).json(); break; } catch { await sleep(500); } }
  const page = targets.find(t => t.type === 'page');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  ws.onmessage = m => {
    const d = JSON.parse(m.data);
    if (d.id && pend.has(d.id)) { pend.get(d.id).res(d.result || d); pend.delete(d.id); }
    if (d.method === 'Page.javascriptDialogOpening') { errs.push('DIALOG: ' + d.params.message.split('\n')[0]); send('Page.handleJavaScriptDialog', { accept: true }); }
    if (d.method === 'Runtime.exceptionThrown') errs.push('EXC: ' + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text).split('\n')[0]);
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: URL }); await sleep(2500);
  await ev(`localStorage.setItem('me_pin_h','x');localStorage.setItem('me_pin_s',String(Date.now()+86400000));location.reload();`);
  await sleep(3500);
  log('restore', await ev(`const d=await fetch('/backup_2026-08-13_1626.json').then(r=>r.json());restoreBackupPayload(d);return gO().length;`));
  // Simular una sync previa con payload = precios actuales → estado "al día"
  log('sync simulada', await ev(`
    const d=ld();const {updated,...payload}=buildPreciosJson();
    d.priceLog.push({id:'PCH-209901-001',ts:new Date().toISOString(),tipo:'sync',motivo:'test',repo:'x',valor:null,scope:null,cambios:[],payload});
    sd(d);renderCalcStatus();return {estado:calcSyncStatus(),dotTab:!!document.querySelector('.tab-btn[data-tab="inventario"] .calc-dot')};`));
  await ev(`showTab('inventario',document.querySelector('.tab-btn[data-tab="inventario"]'));invSubNav('precios');`);
  await sleep(3000); // deja terminar la consulta del blue para el % sugerido
  log('panel', await ev(`return {prods:[...document.querySelectorAll('#pa-prods button')].map(b=>(b.disabled?'[off] ':'')+b.textContent.trim()),
    applyDisabled:document.getElementById('pa-apply').disabled, sug:document.getElementById('pa-sug').textContent,
    banner:document.getElementById('price-sync-banner').textContent.replace(/\\s+/g,' ').trim(), blue:window._blueARS};`));
  log('aplicar sin preview', await ev(`applyPriceFromUI();return document.getElementById('notif').textContent;`));
  // Solo Pastillas (comparten) + redondeo $100, +10%
  log('preview', await ev(`
    paSelTodos(false);
    document.querySelector('#pa-prods [data-pa-lista]').click();
    document.getElementById('pa-pct').value='10';document.getElementById('pa-redondeo').value='100';
    document.getElementById('pa-redondeo').dispatchEvent(new Event('change'));
    renderPricePreview();
    return {sel:[...document.querySelectorAll('#pa-prods button')].filter(b=>b.textContent.includes('☑')).map(b=>b.textContent.trim()),
      preview:document.getElementById('pa-preview-wrap').innerText.split('\\n').filter(Boolean).slice(0,14),
      applyDisabled:document.getElementById('pa-apply').disabled};`));
  log('cambiar % invalida', await ev(`const i=document.getElementById('pa-pct');i.value='11';i.dispatchEvent(new Event('input'));
    const r={applyDisabled:document.getElementById('pa-apply').disabled,previewOculto:document.getElementById('pa-preview-wrap').style.display};
    i.value='10';i.dispatchEvent(new Event('input'));renderPricePreview();return r;`));
  const shotPanel = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
    clip: await ev(`const r=document.getElementById('inv-price-adjust-wrap').getBoundingClientRect();return {x:0,y:r.top+scrollY,width:1280,height:Math.min(r.height,1400),scale:1};`) });
  writeFileSync(SHOT + '-panel.png', Buffer.from(shotPanel.data, 'base64'));
  log('aplicar', await ev(`
    const antes=getListasPrecios().map(l=>[l.id,l.tramos[0].p]);
    document.getElementById('pa-motivo').value='prueba etapa 4';applyPriceFromUI();
    const e=getPriceLog().at(-1);
    return {antes,despues:getListasPrecios().map(l=>[l.id,l.tramos[0].p]),
      entry:{tipo:e.tipo,valor:e.valor,redondeo:e.redondeo,scope:e.scope,productos:e.productos,tc:e.tc,listas:e.cambios.map(c=>c.listaNombre)},
      modalAbierto:document.getElementById('modal').classList.contains('open'),
      modal:document.getElementById('mBody').innerText, botones:[...document.querySelectorAll('#mFooter button')].map(b=>b.textContent),
      estado:calcSyncStatus(), dotSub:!!document.querySelector('#isb-precios .calc-dot'),
      dotTab:!!document.querySelector('.tab-btn[data-tab="inventario"] .calc-dot'),
      banner:document.getElementById('price-sync-banner').textContent.replace(/\\s+/g,' ').trim()};`));
  const shotModal = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(SHOT + '-modal.png', Buffer.from(shotModal.data, 'base64'));
  await ev(`clM();`);
  log('edición manual', await ev(`
    const lc=getListasPrecios().find(l=>l.id!==getPriceLog().at(-1).cambios[0].listaId);
    abrirEditarLista(lc.id);
    const inp=document.querySelector('#te-wrap input[data-field="p"]');const viejo=inp.value;inp.value=String(+viejo+1000);inp.dispatchEvent(new Event('input'));
    document.getElementById('el-save').click();
    const e=getPriceLog().at(-1);
    return {lista:lc.nombre,viejo,entry:{tipo:e.tipo,motivo:e.motivo,scope:e.scope,before0:e.cambios[0].before[0],after0:e.cambios[0].after[0]},
      prodSync:getProductos().filter(p=>p.listaPrecioId===lc.id).map(p=>[p.id,p.tramos[0].p]),
      terminalUlt:document.getElementById('price-terminal').lastElementChild.textContent,
      terminalTieneX:document.getElementById('price-terminal').textContent.includes('×')};`));
  log('restaurar', await ev(`
    const pct=getPriceLog().filter(e=>e.tipo==='pct').at(-1);
    restoreFromPriceLog(pct.id);
    const e=getPriceLog().at(-1);
    return {restoreFrom:e.restoreFrom,tipo:e.tipo,listas:getListasPrecios().filter(l=>pct.cambios.some(c=>c.listaId===l.id)).map(l=>[l.id,l.tramos[0].p,pct.cambios.find(c=>c.listaId===l.id).before[0].p])};`));
  log('log detallado', await ev(`renderPriceLog();const t=document.getElementById('inv-price-log-wrap').innerText;
    return {edit:t.includes('✏ EDIT'),revert:t.includes('↩ REVERT'),sync:t.includes('↑ SYNC'),primeras:t.split('\\n').filter(Boolean).slice(0,12)};`));
  log('backup restaura estado', await ev(`const d=await fetch('/backup_2026-08-13_1626.json').then(r=>r.json());restoreBackupPayload(d);
    return {estado:calcSyncStatus(),dotTab:!!document.querySelector('.tab-btn[data-tab="inventario"] .calc-dot')};`));
  log('errores', errs.length ? errs : 'ninguno');
} catch (e) { console.log('FALLO:', e.message); }
finally { try { ws?.close(); } catch {} chrome.kill(); }
