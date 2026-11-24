import { ld, sd } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fi } from '../core/formatters.js';
import { newPriceLogId } from '../core/ids.js';
import { getListasPrecios, getTramosProducto } from './listas-precios.js';
import { getProductos } from './productos.js';
import { getCostoPromedio } from './stock.js';
import { ghCfg, safeB64Encode } from './github.js';

// ── LOG STORAGE — vive dentro de motoredge_v4 como d.priceLog ──
// Incluido automáticamente en todos los backup/restore via ld()/sd().
export function getPriceLog(){
  const d=ld();
  if(!Array.isArray(d.priceLog)){
    // Migración única desde clave legada me_price_log
    try{const raw=localStorage.getItem('me_price_log');d.priceLog=raw?JSON.parse(raw):[];}
    catch(e){d.priceLog=[];}
    sd(d);
    localStorage.removeItem('me_price_log');
  }
  return d.priceLog;
}
function savePriceLog(log){const d=ld();d.priceLog=log;sd(d);}

// ── MATH ──
// Redondeo r=0: Math.trunc, nunca sube (22785 × 1.10 = 25063.5 → 25063).
// r>0 ($100 / $500 / $1.000): al múltiplo de r más cercano.
export function ajustarPrecio(p,pct,r=0){const x=p*(1+pct/100);return r?Math.round(x/r)*r:Math.trunc(x);}
function calcNuevosTramos(tramos,pct,r){return tramos.map(t=>({t:t.t,p:ajustarPrecio(t.p,pct,r)}));}
// "Desde" de los tramos que quedan con el mismo precio que el anterior (pasa al redondear)
export function tramosRepetidos(tramos){return tramos.filter((t,i)=>i>0&&t.p===tramos[i-1].p).map(t=>t.t);}

// Productos activos agrupados por lista: los que comparten lista se ajustan juntos.
export function agruparProductosPorLista(){
  const listas=getListasPrecios();
  const grupos=[],sinLista=[];
  getProductos().filter(p=>p.activo!==false).forEach(p=>{
    const lista=p.listaPrecioId?listas.find(l=>l.id===p.listaPrecioId):null;
    if(!lista){sinLista.push(p);return;}
    let g=grupos.find(x=>x.listaId===lista.id);
    if(!g){g={listaId:lista.id,listaNombre:lista.nombre,productos:[]};grupos.push(g);}
    g.productos.push(p);
  });
  return{grupos,sinLista};
}

// ── VALIDATION ──
export function validarAjuste(listaIds,pct,r=0){
  if(!listaIds?.length)return'Elegí al menos un producto';
  if(!pct)return'El porcentaje debe ser distinto de cero';
  for(const lista of getListasPrecios().filter(l=>listaIds.includes(l.id))){
    for(const t of lista.tramos||[]){
      const nuevo=ajustarPrecio(t.p,pct,r);
      if(nuevo<=0)return`El ajuste llevaría "${lista.nombre}" (tramo ≥${t.t}) a $${nuevo}. Reducí el porcentaje o el redondeo.`;
    }
  }
  return null;
}

// ── PREVIEW (no escribe nada) ──
export function previewAjuste(listaIds,pct,r=0){
  return getListasPrecios().filter(l=>listaIds.includes(l.id)).map(lista=>({
    listaId:lista.id,listaNombre:lista.nombre,
    before:lista.tramos.map(t=>({...t})),
    after:calcNuevosTramos(lista.tramos,pct,r)
  }));
}

// ── APPLY (una sola sd()) ──
export function applyPriceAdjustment({listaIds,pct,redondeo=0,motivo='',productos=[]}){
  const err=validarAjuste(listaIds,pct,redondeo);
  if(err){sN(err,true);return{ok:false};}

  const d=ld();
  const listas=getListasPrecios(); // handles defaults
  const cambios=[];

  listas.forEach(lista=>{
    if(!listaIds.includes(lista.id))return;
    const before=lista.tramos.map(t=>({...t}));
    const after=calcNuevosTramos(lista.tramos,pct,redondeo);
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

  // Ensure d.priceLog existe (migration inline)
  if(!Array.isArray(d.priceLog)){
    try{const _r=localStorage.getItem('me_price_log');d.priceLog=_r?JSON.parse(_r):[];}
    catch(e){d.priceLog=[];}
    localStorage.removeItem('me_price_log');
  }
  const entry={
    id:newPriceLogId(d.priceLog),
    ts:new Date().toISOString(),
    motivo:motivo||'',
    tipo:'pct',
    valor:pct,
    redondeo,
    scope:listaIds.length>=listas.length?'all':[...listaIds],
    productos:productos.map(p=>({id:p.id,nombre:p.nombre,emoji:p.emoji})),
    tc:window._blueARS||null,
    cambios
  };
  d.listasPrecios=listas;
  d.priceLog.push(entry);
  sd(d); // atomic: listas + productos + priceLog en un solo write

  // Refresh live config so ticket engine uses new prices immediately
  window.loadConfig?.();
  window.buildTicketUI?.();
  window.upd?.();
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

// Estado de la calculadora pública: compara lo que se publicaría hoy con el payload de la última sync.
// 'ok' igual · 'stale' distinto · 'unverified' la última sync no guardó payload (o nunca hubo sync).
export function calcSyncStatus(){
  const last=getPriceLog().filter(e=>e.tipo==='sync').at(-1);
  if(!last?.payload)return'unverified';
  const {updated,...actual}=buildPreciosJson();
  return JSON.stringify(actual)===JSON.stringify(last.payload)?'ok':'stale';
}

// Entrada más reciente del log con TC que tocó alguna de estas listas (base del % sugerido)
function ultimoAjusteConTc(listaIds){
  return getPriceLog().slice().reverse().find(e=>e.tc&&(e.cambios||[]).some(c=>listaIds.includes(c.listaId)))||null;
}
export function pctSugerido(listaIds,blue){
  const e=blue?ultimoAjusteConTc(listaIds):null;
  return e?{pct:Math.round((blue/e.tc-1)*1000)/10,tc:e.tc,ts:e.ts}:null;
}

export async function ghSyncCalc(){
  const cfg=ghCfg();
  if(!cfg.token){sN('Configurá GitHub primero en el tab GitHub',true);return;}
  const btn=document.getElementById('btn-sync-calc');
  if(btn){btn.disabled=true;btn.textContent='↑ Sincronizando...';}
  try{
    const pj=buildPreciosJson();
    const json=JSON.stringify(pj,null,2);
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
      // payload = el precios.json publicado sin 'updated': base del aviso "calculadora desactualizada"
      const {updated,...payload}=pj;
      const sl=getPriceLog();
      sl.push({id:newPriceLogId(sl),ts:new Date().toISOString(),tipo:'sync',motivo:'Sync calculadora pública',repo:CALC_REPO,valor:null,scope:null,cambios:[],payload});
      savePriceLog(sl);
      renderCalcStatus();
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

// Aviso "calculadora desactualizada": punto en el sub-tab Lista de Precios y en el tab Inventario + banner
export function renderCalcStatus(){
  const stale=calcSyncStatus()==='stale';
  [document.getElementById('isb-precios'),document.querySelector('.tab-btn[data-tab="inventario"]')].forEach(el=>{
    if(!el)return;
    let dot=el.querySelector('.calc-dot');
    if(stale&&!dot){
      dot=document.createElement('span');dot.className='calc-dot';dot.title='Calculadora desactualizada';
      dot.style.cssText='display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--wn);margin-left:6px;vertical-align:middle';
      el.appendChild(dot);
    }
    if(!stale&&dot)dot.remove();
  });
  renderSyncBanner();
}

function renderSyncBanner(){
  const el=document.getElementById('price-sync-banner');if(!el)return;
  const last=localStorage.getItem(CALC_KEY);
  const st=calcSyncStatus();
  const estado=st==='stale'?'<span style="color:var(--wn);font-weight:700">⚠ Calculadora desactualizada</span>'
    :st==='ok'?'<span style="color:var(--ac)">✓ Calculadora al día</span>'
    :'<span style="color:var(--tx3)">Estado sin verificar (se verifica desde la próxima sincronización)</span>';
  el.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;background:var(--s1);border:1px solid var(--ac2)30;margin-bottom:12px">
    <div>
      <div style="font-family:var(--mo);font-size:9px;font-weight:700;color:var(--ac2);margin-bottom:3px">🔗 Calculadora Pública</div>
      <div style="font-family:var(--mo);font-size:9px;margin-bottom:3px">${estado}</div>
      <div style="font-family:var(--mo);font-size:8px;color:var(--tx3)">${last?'Última sync: '+last+' · precios.json · <a href="'+CALC_URL+'" target="_blank" style="color:var(--ac2);text-decoration:none">'+CALC_REPO+'</a>':'Sin sync registrada en este dispositivo'}</div>
    </div>
    <button id="btn-sync-calc" class="btn btn-s" style="font-size:9px;height:32px;white-space:nowrap" onclick="ghSyncCalc()">↑ SINCRONIZAR CALCULADORA</button>
  </div>`;
}

// ── PANEL "CAMBIO DE PRECIOS" ──
let _paSel=new Set();     // listas elegidas (por producto; las compartidas van juntas)
let _paPreviewKey=null;   // parámetros de la última vista previa: APLICAR exige que coincidan
let _blueFetch=null;      // una sola consulta del blue si no estaba cargado

function paParams(){
  const rawPct=parseFloat(document.getElementById('pa-pct')?.value||'0');
  const tipo=parseInt(document.getElementById('pa-tipo')?.value||'1');
  const redondeo=parseInt(document.getElementById('pa-redondeo')?.value||'0');
  return{listaIds:[..._paSel],pct:rawPct*tipo,redondeo};
}
const paKey=p=>JSON.stringify([[...p.listaIds].sort(),p.pct,p.redondeo]);

// Cualquier cambio de parámetros invalida la vista previa: hay que volver a previsualizar para aplicar
export function paInvalidar(){
  _paPreviewKey=null;
  const w=document.getElementById('pa-preview-wrap');if(w)w.style.display='none';
  const b=document.getElementById('pa-apply');if(b){b.disabled=true;b.className='btn btn-s';}
}
export function paSelTodos(on){
  _paSel=new Set(on?agruparProductosPorLista().grupos.map(g=>g.listaId):[]);
  renderPaProductos();paInvalidar();renderPaSugerido();
}
export function paUsarSugerido(pct){
  const p=document.getElementById('pa-pct'),t=document.getElementById('pa-tipo');
  if(p)p.value=Math.abs(pct);
  if(t)t.value=pct<0?'-1':'1';
  paInvalidar();
}

function renderPaProductos(){
  const el=document.getElementById('pa-prods');if(!el)return;
  const {grupos,sinLista}=agruparProductosPorLista();
  const CH='display:inline-flex;align-items:center;gap:6px;padding:6px 10px;font-family:var(--mo);font-size:10px;background:var(--bg)';
  el.innerHTML=grupos.map(g=>{
    const on=_paSel.has(g.listaId);
    return`<button type="button" data-pa-lista="${escHtml(g.listaId)}" style="${CH};cursor:pointer;border:1px solid ${on?'var(--ac)':'var(--br)'};color:${on?'var(--ac)':'var(--tx2)'}">${on?'☑':'☐'} ${g.productos.map(p=>escHtml(p.emoji+' '+p.nombre)).join(' + ')}${g.productos.length>1?` <span style="font-size:8px;color:var(--tx3)">comparten ${escHtml(g.listaNombre)}</span>`:''}</button>`;
  }).join('')+sinLista.map(p=>`<button type="button" disabled style="${CH};cursor:not-allowed;opacity:.5;border:1px dashed var(--br);color:var(--tx3)">☐ ${escHtml(p.emoji+' '+p.nombre)} <span style="font-size:8px">asigná una lista</span></button>`).join('');
  el.onclick=e=>{
    const b=e.target.closest('[data-pa-lista]');if(!b)return;
    const id=b.getAttribute('data-pa-lista');
    if(_paSel.has(id))_paSel.delete(id);else _paSel.add(id);
    renderPaProductos();paInvalidar();renderPaSugerido();
  };
}

// "% sugerido por dólar": blue actual vs TC del último ajuste de las listas elegidas. Sin datos previos: oculto.
async function renderPaSugerido(){
  const el=document.getElementById('pa-sug');if(!el)return;
  if(!ultimoAjusteConTc([..._paSel])){el.innerHTML='';return;}
  if(!window._blueARS){
    el.innerHTML='<span style="color:var(--tx3)">consultando dólar blue…</span>';
    _blueFetch=_blueFetch||Promise.resolve(window.actualizarPreciosDash?.()).catch(()=>{});
    await _blueFetch;
  }
  const s=pctSugerido([..._paSel],window._blueARS);
  if(!s){el.innerHTML='';return;}
  const f=new Date(s.ts).toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit'});
  const txt=s.pct===0?'el blue no cambió':`el blue ${s.pct>0?'subió':'bajó'} ${Math.abs(s.pct)}%`;
  el.innerHTML=`Desde el último ajuste de estas listas (${f}, TC $${fi(s.tc)}) ${txt}`
    +(s.pct?` → <button type="button" class="pm-btn" style="font-size:8px;height:24px;padding:0 10px" onclick="paUsarSugerido(${s.pct})">usar ${Math.abs(s.pct)}%</button>`:'');
}

export function renderPriceAdjust(){
  const cont=document.getElementById('inv-price-adjust-wrap');if(!cont)return;
  const IS='background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:11px;padding:7px 10px;outline:none';
  const LB='font-family:var(--mo);font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase';
  const SB='font-size:8px;height:24px;padding:0 10px';
  _paSel=new Set(agruparProductosPorLista().grupos.map(g=>g.listaId));
  _paPreviewKey=null;

  cont.innerHTML=`<div id="price-sync-banner"></div>
  <div style="background:var(--s1);border:1px solid var(--br);padding:14px;margin-bottom:12px">
    <div style="font-family:var(--mo);font-size:9px;letter-spacing:1px;color:var(--ac);text-transform:uppercase;margin-bottom:12px">💸 Cambio de precios</div>
    <div style="margin-bottom:10px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <label style="${LB};margin:0">Productos</label>
        <span style="display:flex;gap:6px"><button type="button" class="pm-btn" style="${SB}" onclick="paSelTodos(true)">Todos</button><button type="button" class="pm-btn" style="${SB}" onclick="paSelTodos(false)">Ninguno</button></span>
      </div>
      <div id="pa-prods" style="display:flex;flex-wrap:wrap;gap:6px"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:8px">
      <div><label style="${LB}">Variación %</label>
        <div style="display:flex">
          <input type="number" id="pa-pct" value="10" step="0.1" style="${IS};flex:1;border-right:none;min-width:0" oninput="paInvalidar()">
          <div style="background:var(--s3);border:1px solid var(--br);border-left:none;padding:7px 10px;font-family:var(--mo);font-size:11px;color:var(--ac)">%</div>
        </div>
      </div>
      <div><label style="${LB}">Tipo</label>
        <select id="pa-tipo" style="${IS};width:100%" onchange="paInvalidar()">
          <option value="1">↑ Aumento</option>
          <option value="-1">↓ Descuento</option>
        </select>
      </div>
      <div><label style="${LB}">Redondeo</label>
        <select id="pa-redondeo" style="${IS};width:100%" onchange="paInvalidar()">
          <option value="0">Sin redondeo</option>
          <option value="100">$100</option>
          <option value="500">$500</option>
          <option value="1000">$1.000</option>
        </select>
      </div>
    </div>
    <div id="pa-sug" style="font-family:var(--mo);font-size:9px;color:var(--tx2);margin-bottom:10px"></div>
    <div style="margin-bottom:12px"><label style="${LB}">Motivo (aparece en el log de auditoría)</label><input type="text" id="pa-motivo" placeholder="ej: Actualización junio 2026 · inflación +12%" style="${IS};width:100%"></div>
    <div style="display:flex;align-items:center;gap:8px">
      <button class="btn btn-s" onclick="renderPricePreview()" style="font-size:9px;height:32px">👁 PREVISUALIZAR</button>
      <button id="pa-apply" class="btn btn-s" disabled onclick="applyPriceFromUI()" style="font-size:9px;height:32px" title="Previsualizá primero">✓ APLICAR CAMBIO</button>
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

  renderPaProductos();
  renderPaSugerido();
  renderSyncBanner();
  renderPriceTerminal();
}

export function renderPricePreview(){
  const prm=paParams();
  const err=validarAjuste(prm.listaIds,prm.pct,prm.redondeo);
  if(err){sN(err,true);return;}
  const cambios=previewAjuste(prm.listaIds,prm.pct,prm.redondeo);
  const {grupos}=agruparProductosPorLista();
  const wrap=document.getElementById('pa-preview-wrap');if(!wrap)return;

  const fi2=n=>('$'+fi(n));
  const mg=(precio,costo)=>{
    if(!costo||!precio)return'<span style="color:var(--tx3)">—</span>';
    const m=(precio-costo)/precio*100;
    return`<span style="font-weight:700;color:${m>30?'var(--ac)':m>15?'var(--wn)':'var(--er)'}">${m.toFixed(1)}%</span>`;
  };
  const redTxt=prm.redondeo?' · redondeo '+fi2(prm.redondeo):'';
  let html=`<div style="background:var(--s1);border:1px solid var(--ac)30;margin-bottom:12px">
    <div style="background:var(--bg);padding:8px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--br)">
      <span style="font-family:var(--mo);font-size:8px;letter-spacing:1px;color:var(--ac)">PREVIEW · ${cambios.length} lista(s) · ${prm.pct>0?'+':''}${prm.pct}%${redTxt}</span>
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
    html+=`<tr><td colspan="4" style="font-family:var(--mo);font-size:8px;letter-spacing:1px;color:var(--ac2);background:var(--s2);padding:5px 12px;border-bottom:1px solid var(--br)">${escHtml(c.listaNombre)}</td></tr>`;
    // Por producto: costo promedio y margen del tramo base actual → nuevo
    (grupos.find(g=>g.listaId===c.listaId)?.productos||[]).forEach(p=>{
      const costo=getCostoPromedio(p.id);
      html+=`<tr><td colspan="4" style="font-family:var(--mo);font-size:9px;color:var(--tx2);padding:5px 12px;border-bottom:1px solid var(--s2)">${escHtml(p.emoji+' '+p.nombre)} · costo prom. ${costo?fi2(costo):'—'} · margen base ${mg(c.before[0]?.p,costo)} → ${mg(c.after[0]?.p,costo)}</td></tr>`;
    });
    const rep=tramosRepetidos(c.after);
    if(rep.length){
      html+=`<tr><td colspan="4" style="font-family:var(--mo);font-size:9px;color:var(--wn);padding:5px 12px;border-bottom:1px solid var(--s2)">⚠ Con este redondeo quedan con el mismo precio que el tramo anterior: ≥ ${rep.join(', ≥ ')}</td></tr>`;
    }
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
  _paPreviewKey=paKey(prm);
  const b=document.getElementById('pa-apply');if(b){b.disabled=false;b.className='btn btn-p';}
}

export function applyPriceFromUI(){
  const prm=paParams();
  if(!_paPreviewKey||_paPreviewKey!==paKey(prm)){sN('Previsualizá el cambio antes de aplicarlo',true);return;}
  const motivo=(document.getElementById('pa-motivo')?.value||'').trim();
  if(Math.abs(prm.pct)>50&&!confirm(`Vas a aplicar un ajuste de ${prm.pct>0?'+':''}${prm.pct}%. ¿Confirmar?`))return;
  const productos=agruparProductosPorLista().grupos.filter(g=>prm.listaIds.includes(g.listaId)).flatMap(g=>g.productos);
  const res=applyPriceAdjustment({...prm,motivo,productos});
  if(res.ok){
    paInvalidar();
    const mEl=document.getElementById('pa-motivo');if(mEl)mEl.value='';
    renderPriceTerminal();
    renderPriceLog();
    window.renderListasPrecios?.();
    window.renderAsignacionPrecios?.();
    window.renderWAText?.();
    renderCalcStatus();
    renderPaSugerido();
    abrirModalSyncCalc(res.entry);
  }
}

// Después de aplicar: modal propio (no confirm()) para sincronizar la calculadora online
function abrirModalSyncCalc(entry){
  const n=entry.cambios.length;
  const resumen=`✓ Precios actualizados (${entry.valor>0?'+':''}${entry.valor}% · ${n} lista${n===1?'':'s'}).`;
  const tieneToken=!!ghCfg().token;
  document.getElementById('mTitEl').textContent='💲 Precios actualizados';
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal';
  document.getElementById('mTk').style.display='none';
  document.getElementById('mBody').innerHTML=`<div style="font-family:var(--mo);font-size:11px;line-height:1.8">${resumen}<br>`
    +(tieneToken?'¿Sincronizar la calculadora online ahora?'
      :'Para sincronizar la calculadora online falta el token de GitHub: en ⚙️ Config → GitHub pegalo y tocá 🔑 Acceso. Después usá «↑ SINCRONIZAR CALCULADORA» en este panel.')
    +'</div>';
  document.getElementById('mFooter').innerHTML=tieneToken
    ?'<button class="btn btn-p" onclick="clM();ghSyncCalc()">↑ Sincronizar ahora</button><button class="btn btn-s" onclick="clM()">Más tarde</button>'
    :'<button class="btn btn-s" onclick="clM()">Entendido</button>';
  document.getElementById('modal').classList.add('open');
}

export function restoreFromPriceLog(entryId){
  const log=getPriceLog();
  const entry=log.find(e=>e.id===entryId);
  if(!entry||!entry.cambios?.length){sN('Entrada no encontrada en el log',true);return;}
  const d=new Date(entry.ts);
  const fechaStr=d.toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'numeric'});
  const horaStr=d.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
  const desc=entry.motivo?`"${entry.motivo}"`:'entrada '+entry.id;
  if(!confirm(`¿Restaurar precios al estado ANTES del ajuste ${desc} (${fechaStr} ${horaStr})?\n\nEsto sobreescribirá los precios actuales.`))return;
  const data=ld();
  const listas=getListasPrecios();
  // Capturar estado actual ANTES de aplicar (para el audit trail del restore)
  const cambiosRestore=entry.cambios.map(c=>{
    const actual=listas.find(l=>l.id===c.listaId);
    return{listaId:c.listaId,listaNombre:c.listaNombre,
      before:actual?actual.tramos.map(t=>({...t})):c.after.map(t=>({...t})),
      after:c.before.map(t=>({...t}))
    };
  });
  // Aplicar el "before" de la entrada original (estado pre-ajuste)
  entry.cambios.forEach(c=>{
    const idx=listas.findIndex(l=>l.id===c.listaId);
    if(idx>=0)listas[idx].tramos=c.before.map(t=>({...t}));
  });
  // Sincronizar productos que referencian listas modificadas
  const modIds=new Set(entry.cambios.map(c=>c.listaId));
  (data.productos||[]).forEach(p=>{
    if(p.listaPrecioId&&modIds.has(p.listaPrecioId)){
      const lista=listas.find(l=>l.id===p.listaPrecioId);
      if(lista)p.tramos=lista.tramos.map(t=>({...t}));
    }
  });
  data.listasPrecios=listas;
  // Registrar la restauración en el log (append-only, trazabilidad completa) — mismo sd() que las listas
  if(!Array.isArray(data.priceLog))data.priceLog=[];
  data.priceLog.push({
    id:newPriceLogId(data.priceLog),
    ts:new Date().toISOString(),
    tipo:'restore',
    motivo:'Restauración desde '+entryId,
    restoreFrom:entryId,
    tc:window._blueARS||null,
    scope:entry.scope,
    cambios:cambiosRestore
  });
  sd(data);
  window.loadConfig?.();window.buildTicketUI?.();window.upd?.();
  renderPriceTerminal();
  renderPriceLog();
  window.renderListasPrecios?.();
  window.renderAsignacionPrecios?.();
  window.renderWAText?.();
  renderCalcStatus();
  sN('✓ Precios restaurados al estado anterior a '+entryId);
}

// Etiqueta de alcance: 'all' → todas; si no, los nombres de cambios[] (sirve para entradas viejas y nuevas)
function etiquetaListas(e){
  if(e.scope==='all')return'Todas las listas';
  return(e.cambios||[]).map(c=>c.listaNombre).filter(Boolean).join(' · ')||(Array.isArray(e.scope)?e.scope.join(' · '):e.scope)||'—';
}

export function renderPriceLog(){
  const cont=document.getElementById('inv-price-log-wrap');if(!cont)return;
  const log=getPriceLog().slice().reverse();
  if(!log.length){
    cont.innerHTML='<div style="padding:20px;font-family:var(--mo);font-size:10px;color:var(--tx3);text-align:center">Sin cambios de precios registrados.</div>';
    return;
  }
  const fi2=n=>('$'+fi(n));
  const thS='font-family:var(--mo);font-size:7px;color:var(--tx3);padding:4px 8px;border-bottom:1px solid var(--br)';
  const tdS='font-family:var(--mo);font-size:9px;padding:4px 8px;border-bottom:1px solid var(--s2)';
  let html='';
  log.forEach((entry,idx)=>{
    const d=new Date(entry.ts);
    const fecha=d.toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'numeric'});
    const hora=d.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    // Badge derecho según tipo
    let badge='';
    if(entry.tipo==='pct'){const signo=entry.valor>0?'+':'';const col=entry.valor>0?'var(--ac)':'var(--er)';badge=`<div style="font-family:var(--mo);font-size:13px;font-weight:700;color:${col};text-align:right;white-space:nowrap">${signo}${entry.valor}%</div>`;}
    else if(entry.tipo==='restore'){badge='<div style="font-family:var(--mo);font-size:10px;font-weight:700;color:var(--ac2);white-space:nowrap">↩ REVERT</div>';}
    else if(entry.tipo==='sync'){badge='<div style="font-family:var(--mo);font-size:10px;font-weight:700;color:#58a6ff;white-space:nowrap">↑ SYNC</div>';}
    else if(entry.tipo==='edit'){badge='<div style="font-family:var(--mo);font-size:10px;font-weight:700;color:var(--wn);white-space:nowrap">✏ EDIT</div>';}
    const scopeLabel=escHtml(etiquetaListas(entry));
    const tramosTotal=(entry.cambios||[]).reduce((a,c)=>a+(c.before?.length||0),0);
    // Contenido expandido
    let detail='';
    if(entry.tipo==='sync'){
      detail=`<div style="font-family:var(--mo);font-size:9px;color:var(--tx3)">Sync → <b style="color:var(--ac2)">${escHtml(entry.repo||CALC_REPO)}</b></div>`;
    }else{
      const hasTC=!!entry.tc;
      const cambioRows=(entry.cambios||[]).map(c=>{
        const nT=Math.max(c.before?.length||0,c.after?.length||0);
        const rows=Array.from({length:nT},(_,i)=>{const b=c.before?.[i],a=c.after?.[i];const dt=a&&b?a.p-b.p:null;
          const tr=b&&a&&a.t!==b.t?`≥ ${b.t} → ≥ ${a.t}`:`≥ ${(b||a).t}`;return`<tr>
          <td style="${tdS};color:var(--tx3)">${tr}</td>
          <td style="${tdS};color:var(--tx3);text-decoration:line-through;text-align:right">${b?fi2(b.p):'—'}</td>
          ${hasTC?`<td style="${tdS};color:var(--tx3);text-align:right">${b?'u$s'+(b.p/entry.tc).toFixed(2):'—'}</td>`:''}
          <td style="${tdS};color:var(--ac);font-weight:700;text-align:right">${a?fi2(a.p):'—'}</td>
          ${hasTC?`<td style="${tdS};color:var(--ac2);text-align:right">${a?'u$s'+(a.p/entry.tc).toFixed(2):'—'}</td>`:''}
          <td style="${tdS};color:${dt===null?'var(--tx3)':dt>=0?'var(--wn)':'var(--er)'};text-align:right">${dt===null?(a?'nuevo':'quitado'):(dt>=0?'+':'')+fi2(dt)}</td>
        </tr>`;}).join('');
        return`<div style="font-family:var(--mo);font-size:8px;letter-spacing:1px;color:var(--ac2);padding:8px 0 4px">${escHtml(c.listaNombre||'')}</div>
        <table style="width:100%;border-collapse:collapse"><thead><tr>
          <th style="${thS};text-align:left">Tramo</th>
          <th style="${thS};text-align:right">Antes ARS</th>
          ${hasTC?`<th style="${thS};text-align:right">Antes USD</th>`:''}
          <th style="${thS};text-align:right">Después ARS</th>
          ${hasTC?`<th style="${thS};text-align:right">Después USD</th>`:''}
          <th style="${thS};text-align:right">Δ ARS</th>
        </tr></thead><tbody>${rows}</tbody></table>`;
      }).join('');
      const tcNote=hasTC?`<div style="font-family:var(--mo);font-size:8px;color:var(--tx3);padding:2px 0 8px">TC al ajuste: <b style="color:var(--ac2)">$${fi(entry.tc)}</b> por u$s 1</div>`:'';
      const extra=[
        entry.productos?.length?'Productos: '+escHtml(entry.productos.map(p=>p.emoji+' '+p.nombre).join(', ')):'',
        entry.redondeo?'Redondeo: '+fi2(entry.redondeo):''
      ].filter(Boolean).map(t=>`<div style="font-family:var(--mo);font-size:8px;color:var(--tx3);padding:0 0 4px">${t}</div>`).join('');
      const footer=entry.tipo==='pct'
        ?`<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--s2)"><button onclick="restoreFromPriceLog('${entry.id}')" style="background:none;border:1px solid var(--ac2);color:var(--ac2);font-family:var(--mo);font-size:9px;padding:4px 14px;cursor:pointer">↩ Restaurar precios al estado anterior a este ajuste</button></div>`
        :(entry.restoreFrom?`<div style="margin-top:8px;font-family:var(--mo);font-size:8px;color:var(--tx3)">Restauración desde <span style="color:var(--ac2)">${escHtml(entry.restoreFrom)}</span></div>`:'');
      detail=tcNote+extra+cambioRows+footer;
    }
    html+=`<div style="border-bottom:1px solid var(--s2)">
      <div style="display:grid;grid-template-columns:auto 1fr auto auto;gap:12px;align-items:center;padding:10px 14px;cursor:pointer" onclick="togglePriceLogEntry(${idx})">
        <div style="font-family:var(--mo);font-size:8px;color:var(--tx3);white-space:nowrap">${fecha}<br>${hora}</div>
        <div>
          <div style="font-family:var(--mo);font-size:10px;color:var(--tx)">${entry.motivo?escHtml(entry.motivo):'<em style="color:var(--tx3)">Sin motivo</em>'}</div>
          <div style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin-top:2px">ID: <span style="color:var(--ac2)">${entry.id}</span> · ${(entry.cambios||[]).length} lista(s) · ${tramosTotal} tramos</div>
        </div>
        <div style="font-family:var(--mo);font-size:8px;background:var(--s2);border:1px solid var(--br);color:var(--tx3);padding:2px 8px;white-space:nowrap">${scopeLabel}</div>
        ${badge}
      </div>
      <div id="ple-${idx}" style="display:none;border-top:1px solid var(--s2);padding:8px 14px 12px">
        ${detail}
      </div>
    </div>`;
  });
  cont.innerHTML=`<div style="background:var(--s1);border:1px solid var(--br)">${html}</div>`;
}

export function togglePriceLogEntry(idx){
  const el=document.getElementById('ple-'+idx);
  if(el)el.style.display=el.style.display==='none'?'':'none';
}

// ── TERMINAL ACTIVITY LOG (append-only: sin borrado) ──

export function renderPriceTerminal(){
  const cont=document.getElementById('price-terminal');if(!cont)return;
  const log=getPriceLog();
  if(!log.length){
    cont.innerHTML='<span style="color:#555">sin actividad registrada.</span>';
    return;
  }
  const lines=log.map(e=>{
    const d=new Date(e.ts);
    const ts=d.toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit',year:'2-digit'})+' '+
              d.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    if(e.tipo==='sync'){
      return `<div><span><span style="color:#484f58">[${ts}]</span> <span style="color:#58a6ff">SYNC ↑</span>  <span style="color:#8b949e">precios.json → ${escHtml(e.repo||CALC_REPO)}</span>  <span style="color:#3fb950">✓ OK</span>  <span style="color:#484f58">[${e.id}]</span></span></div>`;
    }
    if(e.tipo==='restore'){
      const rscope=escHtml(etiquetaListas(e));
      const rmot=e.motivo?`  <span style="color:#e6edf3">"${escHtml(e.motivo)}"</span>`:'';
      return `<div><span><span style="color:#484f58">[${ts}]</span> <span style="color:#d2a8ff;font-weight:700">↩ REVERT</span>  <span style="color:#8b949e">← ${escHtml(e.restoreFrom||'?')} · ${rscope}</span>${rmot}  <span style="color:#484f58">[${e.id}]</span></span></div>`;
    }
    const tramosTotal=(e.cambios||[]).reduce((a,c)=>a+(c.after?.length||0),0);
    const mot=e.motivo?`  <span style="color:#e6edf3">"${escHtml(e.motivo)}"</span>`:'';
    if(e.tipo==='edit'){
      return `<div><span><span style="color:#484f58">[${ts}]</span> <span style="color:#e3b341;font-weight:700">✏ EDIT</span>  <span style="color:#8b949e">${escHtml(etiquetaListas(e))} · ${tramosTotal} tramo(s)</span>${mot}  <span style="color:#484f58">[${e.id}]</span></span></div>`;
    }
    const signo=e.valor>0?'+':'';
    const col=e.valor>0?'#3fb950':'#f85149';
    const tipo=e.valor>0?'AUMENTO':'DESCUENTO';
    const scope=escHtml(etiquetaListas(e))+(e.redondeo?' · redondeo $'+fi(e.redondeo):'');
    return `<div><span><span style="color:#484f58">[${ts}]</span> <span style="color:${col};font-weight:700">${signo}${e.valor}%</span> <span style="color:${col}">${tipo}</span>  <span style="color:#8b949e">${scope} · ${(e.cambios||[]).length} lista(s) · ${tramosTotal} tramo(s)</span>${mot}  <span style="color:#484f58">[${e.id}]</span></span></div>`;
  });
  cont.innerHTML=lines.join('');
  cont.scrollTop=cont.scrollHeight;
}
