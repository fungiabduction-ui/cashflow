// Prueba Etapa 2 (modo protegido + guardado verificado) en Chrome headless, perfil temporal y datos de prueba.
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

  // 2. Camino feliz: ticket → pendiente con stock descontado → confirmar
  out('2 ticket normal', await ev(`
    const p=getProductos().find(x=>x.activo&&document.getElementById('q-'+x.id)&&(ld().stock?.[x.id]||0)>5);
    const antes=ld().stock?.[p.id];
    document.getElementById('fecha').value='2026-11-24';
    document.getElementById('q-'+p.id).value='2'; upd(); generarTicket();
    const o=gO().at(-1); confirmarDesdeOutput();
    return {prod:p.id,id:o.id,stockAntes:antes,stockDespues:ld().stock?.[p.id],
      estado:gO().find(x=>x.id===o.id).estado,badge:document.getElementById('outA-estado-badge')?.textContent};`));

  // 3. Storage lleno al guardar la orden: no hay orden, no se descuenta stock, no se muestra éxito
  out('3 storage lleno', await ev(`
    const p=getProductos().find(x=>x.activo&&document.getElementById('q-'+x.id)&&(ld().stock?.[x.id]||0)>5);
    const prox=nId(d2m('2026-11-24'));
    const stock=JSON.stringify(ld().stock),lotes=JSON.stringify(ld().lotes),n=gO().length;
    const orig=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){if(k==='motoredge_v4'&&String(v).includes(prox))throw new DOMException('lleno','QuotaExceededError');return orig.call(this,k,v);};
    try{document.getElementById('fecha').value='2026-11-24';document.getElementById('q-'+p.id).value='3';upd();generarTicket();}
    finally{Storage.prototype.setItem=orig;}
    return {prox,ordenes:gO().length===n,sinOrden:!gO().some(o=>o.id===prox),
      stockIgual:JSON.stringify(ld().stock)===stock,lotesIgual:JSON.stringify(ld().lotes)===lotes,
      tkOutSinId:!document.getElementById('tkOut').textContent.includes(prox),
      formularioLleno:document.getElementById('q-'+p.id).value,notif:document.getElementById('notif').textContent};`));

  // 4. Datos corruptos → modo protegido → restaurar
  await ev(`localStorage.setItem('motoredge_v4','{"orders":[ROTO');location.reload();`);
  await sleep(3500);
  out('4a corrupto', await ev(`
    const av=document.getElementById('me-bloqueo');
    const copias=Object.keys(localStorage).filter(k=>k.startsWith('motoredge_v4_corrupt_'));
    document.getElementById('e-fecha').value='2026-11-24';document.getElementById('e-concepto').value='Prueba bloqueo';
    document.getElementById('e-monto').value='1000';generarEgreso();
    return {aviso:av?.textContent,avisoVisible:!!av&&getComputedStyle(av).display!=='none',copias,
      copiaIgual:copias.length?localStorage.getItem(copias[0])==='{"orders":[ROTO':null,
      crudoIntacto:localStorage.getItem('motoredge_v4')==='{"orders":[ROTO',notif:document.getElementById('notif').textContent};`));
  out('4b restaurar', await ev(`
    const d=await fetch('/backup_2026-08-13_1626.json').then(r=>r.json());const n=restoreBackupPayload(d);
    document.getElementById('e-fecha').value='2026-11-24';document.getElementById('e-concepto').value='Prueba desbloqueo';
    document.getElementById('e-monto').value='1000';generarEgreso();
    return {n,aviso:!!document.getElementById('me-bloqueo'),ordenes:gO().length,
      egresoGuardado:gE().some(e=>e.concepto==='Prueba desbloqueo'),sinEgresoBloqueado:!gE().some(e=>e.concepto==='Prueba bloqueo')};`));
  console.log('errores:', errs.length ? errs : 'ninguno');
} catch (e) { console.log('FALLO:', e.message); }
finally { try { ws?.close(); } catch {} chrome.kill(); }
