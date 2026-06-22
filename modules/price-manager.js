import { ld, sd } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { getListasPrecios, getTramosProducto } from './listas-precios.js';
import { getProductos } from './productos.js';
import { ghCfg, safeB64Encode } from './github.js';

// ── LOG STORAGE ──
export function getPriceLog(){
  try{return JSON.parse(localStorage.getItem('me_price_log')||'[]');}
  catch(e){return[];}
}
function savePriceLog(log){
  localStorage.setItem('me_price_log',JSON.stringify(log));
}
function newPriceLogId(){
  const mes=new Date().toISOString().slice(0,7).replace('-','');
  const log=getPriceLog();
  const del_mes=log.filter(e=>e.id.startsWith('PCH-'+mes));
  const nums=del_mes.map(e=>parseInt(e.id.split('-')[2])||0);
  const n=(Math.max(0,...nums)+1).toString().padStart(3,'0');
  return `PCH-${mes}-${n}`;
}

// ── MATH ──
// Math.trunc: 22785 * 1.10 = 25063.5 → 25063. Never rounds up.
function ajustarPrecio(p,pct){return Math.trunc(p*(1+pct/100));}
function calcNuevosTramos(tramos,pct){return tramos.map(t=>({t:t.t,p:ajustarPrecio(t.p,pct)}));}

// ── VALIDATION ──
export function validarAjuste(scope,pct){
  if(!pct||pct===0)return'El porcentaje debe ser distinto de cero';
  const todas=getListasPrecios();
  const listas=scope==='all'?todas:todas.filter(l=>l.id===scope);
  for(const lista of listas){
    for(const t of lista.tramos||[]){
      const nuevo=ajustarPrecio(t.p,pct);
      if(nuevo<=0)return`El ajuste llevaría "${lista.nombre}" (tramo ≥${t.t}) a $${nuevo}. Reducí el porcentaje.`;
    }
  }
  return null;
}

// ── PREVIEW (no escribe nada) ──
export function previewAjuste(scope,pct){
  const todas=getListasPrecios();
  const listas=scope==='all'?todas:todas.filter(l=>l.id===scope);
  return listas.map(lista=>({
    listaId:lista.id,
    listaNombre:lista.nombre,
    before:lista.tramos.map(t=>({...t})),
    after:calcNuevosTramos(lista.tramos,pct)
  }));
}

// ── APPLY (una sola sd()) ──
export function applyPriceAdjustment(scope,pct,motivo){
  const err=validarAjuste(scope,pct);
  if(err){sN(err,true);return{ok:false};}

  const d=ld();
  const listas=getListasPrecios(); // handles defaults
  const cambios=[];

  listas.forEach(lista=>{
    if(scope!=='all'&&lista.id!==scope)return;
    const before=lista.tramos.map(t=>({...t}));
    const after=calcNuevosTramos(lista.tramos,pct);
    lista.tramos=after;
    cambios.push({listaId:lista.id,listaNombre:lista.nombre,before,after});
  });

  // Sync product .tramos for products that reference an affected lista
  const modIds=new Set(cambios.map(c=>c.listaId));
  (d.productos||[]).forEach(p=>{
    if(p.listaPrecioId&&modIds.has(p.listaPrecioId)){
      const lista=listas.find(l=>l.id===p.listaPrecioId);
      if(lista)p.tramos=lista.tramos.map(t=>({...t}));
    }
  });

  d.listasPrecios=listas;
  sd(d); // ONE write for listas + productos

  // Refresh live config so ticket engine uses new prices immediately
  window.loadConfig?.();
  window.buildTicketUI?.();
  window.upd?.();

  // Write audit log entry (separate key, append-only)
  const entry={
    id:newPriceLogId(),
    ts:new Date().toISOString(),
    motivo:motivo||'',
    tipo:'pct',
    valor:pct,
    scope,
    cambios
  };
  const log=getPriceLog();
  log.push(entry);
  savePriceLog(log);

  sN(`✓ Precios actualizados — ${cambios.length} lista(s) · ${pct>0?'+':''}${pct}%`);
  return{ok:true,entry};
}

// ── CALCULADORA SYNC ──
const CALC_REPO='fungiabduction-ui/calculadora';
const CALC_URL='https://fungiabduction-ui.github.io/calculadora/index.html';
const CALC_KEY='me_gh_calc_last';

// Maps MotorEdge product IDs to precios.json keys
const CALC_MAP={
  'v-cal':'pastillas',
  'p-cris':'cristales',
  'p-hong':'hongos',
  'p-got':'goteros',
  'p-pet':'petri'
};

export function buildPreciosJson(){
  const prods=getProductos();
  const out={updated:new Date().toISOString(),motoredge_version:'3.9-E'};
  Object.entries(CALC_MAP).forEach(([prodId,key])=>{
    const prod=prods.find(p=>p.id===prodId);
    if(prod){
      const tramos=getTramosProducto(prod);
      if(tramos&&tramos.length)out[key]=tramos.map(t=>({t:t.t,p:t.p}));
    }
  });
  return out;
}

export async function ghSyncCalc(){
  const cfg=ghCfg();
  if(!cfg.token){sN('Configurá GitHub primero en el tab GitHub',true);return;}
  const btn=document.getElementById('btn-sync-calc');
  if(btn){btn.disabled=true;btn.textContent='↑ Sincronizando...';}
  try{
    const json=JSON.stringify(buildPreciosJson(),null,2);
    const encoded=safeB64Encode(json);
    const headers={'Authorization':'token '+cfg.token,'Accept':'application/vnd.github.v3+json','Content-Type':'application/json'};

    // Get current SHA (needed for update; null for first-time create)
    let sha=null;
    const getR=await fetch('https://api.github.com/repos/'+CALC_REPO+'/contents/precios.json?t='+Date.now(),{headers});
    if(getR.ok){const gd=await getR.json();sha=gd.sha||null;}

    const body={message:'sync precios '+new Date().toISOString().slice(0,16).replace('T',' '),content:encoded};
    if(sha)body.sha=sha;

    const putR=await fetch('https://api.github.com/repos/'+CALC_REPO+'/contents/precios.json',{
      method:'PUT',headers,body:JSON.stringify(body)
    });
    if(putR.ok){
      const now=new Date().toLocaleString('es-AR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
      localStorage.setItem(CALC_KEY,now);
      // Write sync event to unified log
      const syncEntry={id:newPriceLogId(),ts:new Date().toISOString(),tipo:'sync',motivo:'Sync calculadora pública',repo:CALC_REPO,valor:null,scope:null,cambios:[]};
      const sl=getPriceLog();sl.push(syncEntry);savePriceLog(sl);
      renderSyncBanner();
      renderPriceTerminal();
      sN('✓ Calculadora sincronizada — precios.json actualizado');
    } else {
      const err=await putR.json();
      sN('Error sync calculadora: '+(err.message||putR.status),true);
    }
  }catch(e){
    sN('Error sync calculadora: '+e.message,true);
  }finally{
    if(btn){btn.disabled=false;btn.textContent='↑ SINCRONIZAR CALCULADORA';}
  }
}

// ── UI HELPERS ──
// fi() ya está disponible desde core/formatters.js en el bundle
const escHtml=s=>s?s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'):'';

function renderSyncBanner(){
  const el=document.getElementById('price-sync-banner');if(!el)return;
  const last=localStorage.getItem(CALC_KEY);
  el.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;background:var(--s1);border:1px solid var(--ac2)30;margin-bottom:12px">
    <div>
      <div style="font-family:var(--mo);font-size:9px;font-weight:700;color:var(--ac2);margin-bottom:3px">🔗 Calculadora Pública</div>
      <div style="font-family:var(--mo);font-size:8px;color:var(--tx3)">${last?'Última sync: '+last+' · precios.json · <a href="'+CALC_URL+'" target="_blank" style="color:var(--ac2);text-decoration:none">'+CALC_REPO+'</a>':'Sin sync registrada en este dispositivo'}</div>
    </div>
    <button id="btn-sync-calc" class="btn btn-s" style="font-size:9px;height:32px;white-space:nowrap" onclick="ghSyncCalc()">↑ SINCRONIZAR CALCULADORA</button>
  </div>`;
}

export function renderPriceAdjust(){
  const cont=document.getElementById('inv-price-adjust-wrap');if(!cont)return;
  const listas=getListasPrecios();
  const IS='background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:11px;padding:7px 10px;outline:none';
  const LB='font-family:var(--mo);font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase';

  let optsScope='<option value="all">▸ Todas las listas</option>';
  listas.forEach(l=>{optsScope+=`<option value="${l.id}">${l.nombre}</option>`;});

  cont.innerHTML=`<div id="price-sync-banner"></div>
  <div style="background:var(--s1);border:1px solid var(--br);padding:14px;margin-bottom:12px">
    <div style="font-family:var(--mo);font-size:9px;letter-spacing:1px;color:var(--ac);text-transform:uppercase;margin-bottom:12px">💸 Cambio de precios</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:10px">
      <div><label style="${LB}">Alcance</label><select id="pa-scope" style="${IS};width:100%">${optsScope}</select></div>
      <div><label style="${LB}">Variación %</label>
        <div style="display:flex">
          <input type="number" id="pa-pct" value="10" step="0.1" style="${IS};flex:1;border-right:none" oninput="document.getElementById('pa-preview-wrap').style.display='none'">
          <div style="background:var(--s3);border:1px solid var(--br);border-left:none;padding:7px 10px;font-family:var(--mo);font-size:11px;color:var(--ac)">%</div>
        </div>
      </div>
      <div><label style="${LB}">Tipo</label>
        <select id="pa-tipo" style="${IS};width:100%">
          <option value="1">↑ Aumento</option>
          <option value="-1">↓ Descuento</option>
        </select>
      </div>
    </div>
    <div style="margin-bottom:12px"><label style="${LB}">Motivo (aparece en el log de auditoría)</label><input type="text" id="pa-motivo" placeholder="ej: Actualización junio 2026 · inflación +12%" style="${IS};width:100%"></div>
    <div style="display:flex;align-items:center;gap:8px">
      <button class="btn btn-s" onclick="renderPricePreview()" style="font-size:9px;height:32px">👁 PREVISUALIZAR</button>
      <button class="btn btn-p" onclick="applyPriceFromUI()" style="font-size:9px;height:32px">✓ APLICAR CAMBIO</button>
    </div>
  </div>
  <div id="pa-preview-wrap" style="display:none"></div>
  <div style="margin-top:4px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      <span style="font-family:var(--mo);font-size:8px;letter-spacing:1px;color:#555;text-transform:uppercase">▸ activity log</span>
      <span style="font-family:var(--mo);font-size:7px;color:#555">scroll para ver historial completo</span>
    </div>
    <div id="price-terminal" style="background:#0d1117;border:1px solid #21262d;padding:10px 14px;height:220px;overflow-y:auto;font-family:'Courier New',Courier,monospace;font-size:10px;line-height:1.7;color:#c9d1d9;box-sizing:border-box"><span style="color:#555">cargando...</span></div>
  </div>`;

  renderSyncBanner();
  renderPriceTerminal();
}

export function renderPricePreview(){
  const scope=document.getElementById('pa-scope')?.value||'all';
  const rawPct=parseFloat(document.getElementById('pa-pct')?.value||'0');
  const tipo=parseInt(document.getElementById('pa-tipo')?.value||'1');
  const pct=rawPct*tipo;
  const err=validarAjuste(scope,pct);
  if(err){sN(err,true);return;}
  const cambios=previewAjuste(scope,pct);
  const wrap=document.getElementById('pa-preview-wrap');if(!wrap)return;

  const fi2=n=>('$'+fi(n));
  let html=`<div style="background:var(--s1);border:1px solid var(--ac)30;margin-bottom:12px">
    <div style="background:var(--bg);padding:8px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--br)">
      <span style="font-family:var(--mo);font-size:8px;letter-spacing:1px;color:var(--ac)">PREVIEW · ${scope==='all'?'Todas las listas':(cambios[0]?.listaNombre||scope)} · ${pct>0?'+':''}${pct}%</span>
      <span style="font-family:var(--mo);font-size:8px;background:var(--ac)20;border:1px solid var(--ac)30;color:var(--ac);padding:2px 8px">ANTES DE CONFIRMAR</span>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr>
        <th style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:7px 12px;text-align:left;background:var(--bg);border-bottom:1px solid var(--br)">Lista / Tramo</th>
        <th style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:7px 12px;text-align:right;background:var(--bg);border-bottom:1px solid var(--br)">Precio actual</th>
        <th style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:7px 12px;text-align:right;background:var(--bg);border-bottom:1px solid var(--br)">Precio nuevo</th>
        <th style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:7px 12px;text-align:right;background:var(--bg);border-bottom:1px solid var(--br)">Δ</th>
      </tr></thead><tbody>`;
  cambios.forEach(c=>{
    html+=`<tr><td colspan="4" style="font-family:var(--mo);font-size:8px;letter-spacing:1px;color:var(--ac2);background:var(--s2);padding:5px 12px;border-bottom:1px solid var(--br)">${c.listaNombre}</td></tr>`;
    const maxRows=4;
    c.before.slice(0,maxRows).forEach((b,i)=>{
      const a=c.after[i];
      const delta=a.p-b.p;
      html+=`<tr style="border-bottom:1px solid var(--s2)">
        <td style="font-family:var(--mo);font-size:9px;color:var(--tx3);padding:6px 12px">≥ ${b.t}</td>
        <td style="font-family:var(--mo);font-size:10px;color:var(--tx3);text-decoration:line-through;text-align:right;padding:6px 12px">${fi2(b.p)}</td>
        <td style="font-family:var(--mo);font-size:10px;font-weight:700;color:var(--ac);text-align:right;padding:6px 12px">${fi2(a.p)}</td>
        <td style="font-family:var(--mo);font-size:9px;color:${delta>=0?'var(--wn)':'var(--er)'};text-align:right;padding:6px 12px">${delta>=0?'+':''}${fi2(delta)}</td>
      </tr>`;
    });
    if(c.before.length>maxRows){
      html+=`<tr><td colspan="4" style="font-family:var(--mo);font-size:8px;color:var(--tx3);padding:5px 12px;font-style:italic">… ${c.before.length-maxRows} tramos más</td></tr>`;
    }
  });
  html+='</tbody></table></div>';
  wrap.innerHTML=html;
  wrap.style.display='';
}

export function applyPriceFromUI(){
  const scope=document.getElementById('pa-scope')?.value||'all';
  const rawPct=parseFloat(document.getElementById('pa-pct')?.value||'0');
  const tipo=parseInt(document.getElementById('pa-tipo')?.value||'1');
  const pct=rawPct*tipo;
  const motivo=(document.getElementById('pa-motivo')?.value||'').trim();
  if(Math.abs(pct)>50&&!confirm(`Vas a aplicar un ajuste de ${pct>0?'+':''}${pct}%. ¿Confirmar?`))return;
  const res=applyPriceAdjustment(scope,pct,motivo);
  if(res.ok){
    const wrap=document.getElementById('pa-preview-wrap');if(wrap)wrap.style.display='none';
    const mEl=document.getElementById('pa-motivo');if(mEl)mEl.value='';
    renderPriceTerminal();
    renderPriceLog();
    window.renderListasPrecios?.();
    window.renderAsignacionPrecios?.();
    window.renderWAText?.();
  }
}

export function renderPriceLog(){
  const cont=document.getElementById('inv-price-log-wrap');if(!cont)return;
  const log=getPriceLog().slice().reverse(); // más reciente primero
  if(!log.length){
    cont.innerHTML='<div style="padding:20px;font-family:var(--mo);font-size:10px;color:var(--tx3);text-align:center">Sin cambios de precios registrados.</div>';
    return;
  }
  const fi2=n=>('$'+fi(n));
  let html='';
  log.forEach((entry,idx)=>{
    const d=new Date(entry.ts);
    const fecha=d.toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'numeric'});
    const hora=d.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const signo=entry.valor>0?'+':'';
    const color=entry.valor>0?'var(--ac)':'var(--er)';
    const scopeLabel=entry.scope==='all'?'Todas las listas':(entry.cambios[0]?.listaNombre||entry.scope);
    const tramosTotal=entry.cambios.reduce((a,c)=>a+c.before.length,0);
    html+=`<div style="border-bottom:1px solid var(--s2)">
      <div style="display:grid;grid-template-columns:auto 1fr auto auto;gap:12px;align-items:center;padding:10px 14px;cursor:pointer" onclick="togglePriceLogEntry(${idx})">
        <div style="font-family:var(--mo);font-size:8px;color:var(--tx3);white-space:nowrap">${fecha}<br>${hora}</div>
        <div>
          <div style="font-family:var(--mo);font-size:10px;color:var(--tx)">${entry.motivo?escHtml(entry.motivo):'<em style="color:var(--tx3)">Sin motivo</em>'}</div>
          <div style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin-top:2px">ID: <span style="color:var(--ac2)">${entry.id}</span> · ${entry.cambios.length} lista(s) · ${tramosTotal} tramos</div>
        </div>
        <div style="font-family:var(--mo);font-size:8px;background:var(--s2);border:1px solid var(--br);color:var(--tx3);padding:2px 8px;white-space:nowrap">${scopeLabel}</div>
        <div style="font-family:var(--mo);font-size:13px;font-weight:700;color:${color};text-align:right">${signo}${entry.valor}%</div>
      </div>
      <div id="ple-${idx}" style="display:none;border-top:1px solid var(--s2);padding:0 14px 12px">
        ${entry.cambios.map(c=>`
          <div style="font-family:var(--mo);font-size:8px;letter-spacing:1px;color:var(--ac2);padding:8px 0 4px">${c.listaNombre}</div>
          <table style="width:100%;border-collapse:collapse">
            <thead><tr>
              <th style="font-family:var(--mo);font-size:7px;color:var(--tx3);padding:4px 8px;text-align:left;border-bottom:1px solid var(--br)">Tramo</th>
              <th style="font-family:var(--mo);font-size:7px;color:var(--tx3);padding:4px 8px;text-align:right;border-bottom:1px solid var(--br)">Antes</th>
              <th style="font-family:var(--mo);font-size:7px;color:var(--tx3);padding:4px 8px;text-align:right;border-bottom:1px solid var(--br)">Después</th>
              <th style="font-family:var(--mo);font-size:7px;color:var(--tx3);padding:4px 8px;text-align:right;border-bottom:1px solid var(--br)">Δ</th>
            </tr></thead><tbody>
            ${c.before.map((b,i)=>{const a=c.after[i];const dt=a.p-b.p;return`<tr style="border-bottom:1px solid var(--s2)">
              <td style="font-family:var(--mo);font-size:9px;color:var(--tx3);padding:4px 8px">≥ ${b.t}</td>
              <td style="font-family:var(--mo);font-size:9px;color:var(--tx3);text-decoration:line-through;text-align:right;padding:4px 8px">${fi2(b.p)}</td>
              <td style="font-family:var(--mo);font-size:9px;color:var(--ac);font-weight:700;text-align:right;padding:4px 8px">${fi2(a.p)}</td>
              <td style="font-family:var(--mo);font-size:9px;color:${dt>=0?'var(--wn)':'var(--er)'};text-align:right;padding:4px 8px">${dt>=0?'+':''}${fi2(dt)}</td>
            </tr>`;}).join('')}
            </tbody>
          </table>`).join('')}
      </div>
    </div>`;
  });
  cont.innerHTML=`<div style="background:var(--s1);border:1px solid var(--br)">${html}</div>`;
}

export function togglePriceLogEntry(idx){
  const el=document.getElementById('ple-'+idx);
  if(el)el.style.display=el.style.display==='none'?'':'none';
}

// ── TERMINAL ACTIVITY LOG ──
export function deletePriceLogEntry(id){
  const log=getPriceLog().filter(e=>e.id!==id);
  savePriceLog(log);
  renderPriceTerminal();
  renderPriceLog();
}

export function renderPriceTerminal(){
  const cont=document.getElementById('price-terminal');if(!cont)return;
  const log=getPriceLog();
  if(!log.length){
    cont.innerHTML='<span style="color:#555">sin actividad registrada.</span>';
    return;
  }
  const DEL=id=>`<span onclick="deletePriceLogEntry('${id}')" title="eliminar" style="color:#484f58;cursor:pointer;margin-left:10px;flex-shrink:0;user-select:none" onmouseover="this.style.color='#f85149'" onmouseout="this.style.color='#484f58'">×</span>`;
  const lines=log.map(e=>{
    const d=new Date(e.ts);
    const ts=d.toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'2-digit'})+' '+
              d.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    if(e.tipo==='sync'){
      return `<div style="display:flex;justify-content:space-between;align-items:baseline"><span><span style="color:#484f58">[${ts}]</span> <span style="color:#58a6ff">SYNC ↑</span>  <span style="color:#8b949e">precios.json → ${escHtml(e.repo||CALC_REPO)}</span>  <span style="color:#3fb950">✓ OK</span>  <span style="color:#484f58">[${e.id}]</span></span>${DEL(e.id)}</div>`;
    }
    const signo=e.valor>0?'+':'';
    const col=e.valor>0?'#3fb950':'#f85149';
    const tipo=e.valor>0?'AUMENTO':'DESCUENTO';
    const tramosTotal=(e.cambios||[]).reduce((a,c)=>a+c.before.length,0);
    const scope=e.scope==='all'?'todas las listas':escHtml(e.cambios[0]?.listaNombre||e.scope||'');
    const mot=e.motivo?`  <span style="color:#e6edf3">"${escHtml(e.motivo)}"</span>`:'';
    return `<div style="display:flex;justify-content:space-between;align-items:baseline"><span><span style="color:#484f58">[${ts}]</span> <span style="color:${col};font-weight:700">${signo}${e.valor}%</span> <span style="color:${col}">${tipo}</span>  <span style="color:#8b949e">${scope} · ${(e.cambios||[]).length} lista(s) · ${tramosTotal} tramo(s)</span>${mot}  <span style="color:#484f58">[${e.id}]</span></span>${DEL(e.id)}</div>`;
  });
  cont.innerHTML=lines.join('');
  cont.scrollTop=cont.scrollHeight;
}
