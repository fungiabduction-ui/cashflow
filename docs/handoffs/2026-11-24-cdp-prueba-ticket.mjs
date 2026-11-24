// Prueba 3.1 en Chrome headless con perfil temporal y datos de prueba (backup de agosto).
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
  console.log('restore:', await ev(`const d=await fetch('/backup_2026-08-13_1626.json').then(r=>r.json());restoreBackupPayload(d);return gO().length;`));
  console.log('nuevo:', JSON.stringify(await ev(`
    document.getElementById('fecha').value='2026-11-24';
    document.getElementById('cliente').value='Cliente Prueba Zeta';
    const p=getProductos().find(x=>document.getElementById('q-'+x.id));
    document.getElementById('q-'+p.id).value='5'; upd(); generarTicket();
    const o=gO().at(-1);
    return {prod:p.id,id:o.id,cliente:o.cliente,clienteId:o.clienteId,tkOut:document.getElementById('tkOut').textContent,
      aud:document.getElementById('audOut').textContent,ticketText:o.ticketText,auditText:o.auditText};`), null, 1));
  console.log('vTk viejo:', JSON.stringify(await ev(`
    const o=gO().find(x=>/\\n👤 Cliente: /.test(x.ticketText||''));
    vTk(o.id); const r={id:o.id,guardadoTieneCliente:o.ticketText.includes(o.cliente),
      mTk:document.getElementById('mTk').textContent,mBody:document.getElementById('mBody').textContent}; clM(); return r;`), null, 1));
  console.log('vTk nuevo:', JSON.stringify(await ev(`
    const o=gO().at(-1); vTk(o.id); const r={mTkTieneCliente:document.getElementById('mTk').textContent.includes('Zeta'),
      mBody:document.getElementById('mBody').textContent}; clM(); return r;`), null, 1));
  console.log('errores:', errs.length ? errs : 'ninguno');
} catch (e) { console.log('FALLO:', e.message); }
finally { try { ws?.close(); } catch {} chrome.kill(); }
