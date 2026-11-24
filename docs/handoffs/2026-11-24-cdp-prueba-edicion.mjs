// Prueba 3.2 (edición de ventas) en Chrome headless, perfil temporal y datos de prueba.
// Uso: node <este script> <carpeta-perfil-en-scratchpad>  (servidor en 127.0.0.1:7432 y backup de prueba en la raíz)
import { spawn } from 'node:child_process';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PROF = process.argv[2];
const URL = 'http://127.0.0.1:7432/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=9333', '--user-data-dir=' + PROF,
  '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });
let ws, seq = 0; const pend = new Map(); const errs = [];
function send(method, params = {}) {
  const id = ++seq; ws.send(JSON.stringify({ id, method, params }));
  return new Promise((res, rej) => pend.set(id, { res, rej }));
}
async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: `(async()=>{${expr}})()`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) return { EXC: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
  return r.result.value;
}
const out = (k, v) => console.log(k + ':', JSON.stringify(v, null, 1));
// En la página: abre el modal de una venta, cambia inputs disparando 'input' (como al tipear) y toca 💾 Guardar
const EDITAR = `
  window.__editar=(id,cambios)=>{
    openEditVenta(id);
    for(const[k,v]of Object.entries(cambios)){const el=document.getElementById(k);el.value=String(v);el.dispatchEvent(new Event('input'));}
    document.querySelector('#mFooter .btn-p').click();
    return document.getElementById('notif').textContent;
  };
  window.__idxVted=o=>(o.productos._lineas||[]).filter(l=>l.prodId!=='__var').findIndex(l=>(l.varId||l.prodId)==='v-ted');`;
try {
  let targets;
  for (let i = 0; i < 20; i++) { try { targets = await (await fetch('http://127.0.0.1:9333/json/list')).json(); break; } catch { await sleep(500); } }
  const page = targets.find(t => t.type === 'page');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  ws.onmessage = m => {
    const d = JSON.parse(m.data);
    if (d.id && pend.has(d.id)) { pend.get(d.id).res(d.result || d); pend.delete(d.id); }
    if (d.method === 'Page.javascriptDialogOpening') { errs.push('DIALOG: ' + d.params.message); send('Page.handleJavaScriptDialog', { accept: true }); }
    if (d.method === 'Runtime.exceptionThrown') errs.push('EXC: ' + (d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text).split('\n')[0]);
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url: URL }); await sleep(2500);
  await ev(`localStorage.setItem('me_pin_h','x');localStorage.setItem('me_pin_s',String(Date.now()+86400000));location.reload();`);
  await sleep(3500);
  out('1 restore', await ev(`const d=await fetch('/backup_2026-08-13_1626.json').then(r=>r.json());return restoreBackupPayload(d);`));
  await ev(EDITAR);

  // 2. Abrir y guardar sin tocar: la orden no cambia, no se guarda
  out('2 sin cambios', await ev(`
    const o=gO().find(x=>x.tipoPago==='ARS'&&!x.totales?.ajusteNeto&&__idxVted(x)>=0);
    const antes=JSON.stringify(o),movs=ld().stockMovs.length;
    const notif=__editar(o.id,{});
    return {id:o.id,igual:JSON.stringify(gO().find(x=>x.id===o.id))===antes,movsIgual:ld().stockMovs.length===movs,notif,
      modalCerrado:!document.getElementById('modal').classList.contains('open')};`));

  // 3. Subir 1 la cantidad de v-ted: total, stock, movimiento y ticket nuevos
  out('3 cantidad +1', await ev(`
    const o=gO().find(x=>x.tipoPago==='ARS'&&!x.totales?.ajusteNeto&&__idxVted(x)>=0);
    const i=__idxVted(o),l=o.productos._lineas.filter(x=>x.prodId!=='__var')[i];
    const stock=ld().stock['v-ted'];
    const notif=__editar(o.id,{['edit-qty-'+i]:l.qty+1});
    const n=gO().find(x=>x.id===o.id),mov=ld().stockMovs[0];
    window.__caso={id:o.id,i,qty:l.qty,stock,total:o.totales.totalGeneral};
    return {id:o.id,notif,total:[o.totales.totalGeneral,n.totales.totalGeneral,'esperado',o.totales.totalGeneral+l.precio],
      stock:[stock,ld().stock['v-ted']],mov:[mov.tipo,mov.delta,mov.nota],
      ticketNuevo:n.ticketText.includes(' '+(l.qty+1)+' ud × '),editada:n.auditText.split('\\n').at(-1)};`));

  // 4. Volver a la cantidad original: el stock vuelve
  out('4 cantidad original', await ev(`
    const c=window.__caso;
    const notif=__editar(c.id,{['edit-qty-'+c.i]:c.qty});
    const n=gO().find(x=>x.id===c.id),mov=ld().stockMovs[0];
    return {notif,total:[n.totales.totalGeneral,c.total],stock:[ld().stock['v-ted'],c.stock],mov:[mov.tipo,mov.delta],
      ediciones:n.auditText.split('\\n').filter(x=>x.startsWith('✏')).length};`));

  // 5. Venta USD: cambiar cantidad conserva los TC
  out('5 USD', await ev(`
    const o=gO().find(x=>x.tipoPago==='USD'&&x.payment);
    const l=o.productos._lineas[0];
    const notif=__editar(o.id,{'edit-qty-0':l.qty+1});
    const n=gO().find(x=>x.id===o.id);
    return {id:o.id,notif,tc:[o.tc,n.tc],tcUsdt:[o.tcUsdt,n.tcUsdt],tc_usd:[o.payment.tc_usd,n.payment.tc_usd],
      tc_usdt:[o.payment.tc_usdt,n.payment.tc_usdt],usd:[o.payment.usd,n.payment.usd],totalUSD:n.totales.totalUSD};`));

  // 6. El modal: variable, MIX visible al elegirlo, total escrito a mano avisa como libre; cancelar no guarda
  out('6 modal', await ev(`
    const o=gO().find(x=>x.tipoPago==='ARS');const antes=JSON.stringify(o);
    openEditVenta(o.id);
    editSetMode('MIX');
    const r={variable:!!document.getElementById('edit-var'),mix:getComputedStyle(document.getElementById('em-mix')).display,
      tcUsd:getComputedStyle(document.getElementById('em-tcusd')).display,eq:document.getElementById('edit-eq').textContent,
      tcVacio:document.getElementById('edit-tc-usd').value,placeholder:document.getElementById('edit-tc-usd').placeholder};
    clM();
    r.sinGuardar=JSON.stringify(gO().find(x=>x.id===o.id))===antes;
    return r;`));
  console.log('errores:', errs.length ? errs : 'ninguno');
} catch (e) { console.log('FALLO:', e.message); }
finally { try { ws?.close(); } catch {} chrome.kill(); }
