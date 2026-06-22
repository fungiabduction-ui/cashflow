// MOTOR EDGE 3.9-E - bundle.js
// Generado automaticamente por build.bat. No editar directamente.
// Para modificar: editar los archivos fuente y correr build.bat

// ===== core/formatters.js =====
function gtr(tb,q){if(q<=0)return null;let p=tb[0].p,t=tb[0].t;for(let i=0;i<tb.length;i++){if(q>=tb[i].t){p=tb[i].p;t=tb[i].t;}}return{p,t};}
function fi(n){return Math.round(n).toLocaleString('en-US').replace(/\./g,',');}
function fv(n){return '$ '+fi(n);}
function fu(n){return parseFloat(n.toFixed(2)).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});}
function hoy(){return new Date().toISOString().split('T')[0];}
function d2s(iso){if(!iso)return'';const[y,m,d]=iso.split('-');return`${d}/${m}/${y}`;}
function d2m(iso){if(!iso)return'';const[y,m]=iso.split('-');return`${y}${m}`;}
function mL(mm){const ms=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];return`${ms[parseInt(mm.substring(4,6))-1]} ${mm.substring(0,4)}`;}
function mLong(mm){const ms=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];return`${ms[parseInt(mm.substring(4,6))-1]} ${mm.substring(0,4)}`;}
function trunc(n){return Math.trunc(n);}
function addMon(aaaamm,n){const y=parseInt(aaaamm.substring(0,4));const m=parseInt(aaaamm.substring(4,6))-1;const dt=new Date(y,m+n,1);return`${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;}
function pn(v){if(v==null||v==='')return 0;const s=String(v).replace(/[$\s]/g,'').replace(/[.,](?=\d{3}(?:[.,]|$))/g,'').replace(',','.');return parseFloat(s)||0;}
function parseDate(v){
  if(!v)return null;
  if(v instanceof Date){const y=v.getFullYear();const m=String(v.getMonth()+1).padStart(2,'0');const d=String(v.getDate()).padStart(2,'0');return`${y}-${m}-${d}`;}
  const s=String(v).trim();
  if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;
  const p=s.split(/[\/\-]/);
  if(p.length===3){
    if(p[2]&&p[2].length===4)return`${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`;
    if(p[0]&&p[0].length===4)return`${p[0]}-${p[1].padStart(2,'0')}-${p[2].padStart(2,'0')}`;
  }
  return null;
}
function uid(){return 'p-'+Math.random().toString(36).substring(2,9);}


// ===== ui/notif.js =====
function sN(msg, err = false) {
  const el = document.getElementById('notif');
  el.textContent = msg;
  el.className = 'notif show' + (err ? ' err' : '');
  clearTimeout(window._nt);
  window._nt = setTimeout(() => el.classList.remove('show'), 3000);
}


// ===== core/constants.js =====
const DPT=[{t:5,p:22785},{t:10,p:21735},{t:15,p:20580},{t:20,p:19367},{t:30,p:18228},{t:40,p:17089},{t:50,p:14810},{t:100,p:12750},{t:200,p:10800},{t:300,p:10050},{t:400,p:9450},{t:500,p:9000}];
const DCT=[{t:1,p:79968},{t:3,p:73500},{t:5,p:67972},{t:10,p:63974},{t:15,p:59976},{t:20,p:55977},{t:30,p:51979},{t:40,p:47980},{t:50,p:43982}];
const DHT=[{t:5,p:14000},{t:10,p:12000},{t:20,p:10000},{t:50,p:8500},{t:100,p:8000},{t:200,p:7000},{t:500,p:5000},{t:1000,p:3500}];
const DGP=85000;
const DPP=56000;
const DCOSTS={past:5075,cris:7975,hong:2000,got:5000,pet:2000};
const DEFAULT_PRODUCTS=[
  {id:'v-cal',emoji:'💀',nombre:'Calaveras',unit:'ud',costo:5075,tipo:'tramos',listaPrecioId:'lp-past',
   tramos:DPT.map(x=>({...x})),activo:true,legacyKey:'calaveras'},
  {id:'v-ted',emoji:'🧸',nombre:'Teddy',unit:'ud',costo:5075,tipo:'tramos',listaPrecioId:'lp-past',
   tramos:DPT.map(x=>({...x})),activo:true,legacyKey:'teddy'},
  {id:'v-lck',emoji:'🐱',nombre:'Lucky Cat',unit:'ud',costo:5075,tipo:'tramos',listaPrecioId:'lp-past',
   tramos:DPT.map(x=>({...x})),activo:true,legacyKey:'lucky'},
  {id:'v-gen',emoji:'💊',nombre:'Genéricas',unit:'ud',costo:5075,tipo:'tramos',listaPrecioId:'lp-past',
   tramos:DPT.map(x=>({...x})),activo:true,legacyKey:'genericas'},
  {id:'p-cris',emoji:'💎',nombre:'Cristales',unit:'g',costo:7975,tipo:'tramos',listaPrecioId:'lp-cris',
   tramos:DCT.map(x=>({...x})),activo:true,maxConsulta:60,legacyKey:'cristales'},
  {id:'p-hong',emoji:'🍄',nombre:'Hongos',unit:'g',costo:2000,tipo:'tramos',listaPrecioId:'lp-hong',
   tramos:DHT.map(x=>({...x})),activo:true,legacyKey:'hongos'},
  {id:'p-got',emoji:'💧',nombre:'Goteros',unit:'ud',costo:5000,tipo:'fijo',listaPrecioId:'lp-got',
   tramos:[{t:1,p:DGP}],activo:true,legacyKey:'goteros'},
  {id:'p-pet',emoji:'🧫',nombre:'Petri',unit:'ud',costo:2000,tipo:'fijo',listaPrecioId:'lp-pet',
   tramos:[{t:1,p:DPP}],activo:true,legacyKey:'petri'},
];
const DEFAULT_LISTAS_PRECIOS=[
  {id:'lp-past',nombre:'Pastillas GRP',tramos:DPT.map(x=>({...x}))},
  {id:'lp-cris',nombre:'Cristales',tramos:DCT.map(x=>({...x}))},
  {id:'lp-hong',nombre:'Hongos',tramos:DHT.map(x=>({...x}))},
  {id:'lp-got',nombre:'Goteros Fijo',tramos:[{t:1,p:DGP}]},
  {id:'lp-pet',nombre:'Petri Fijo',tramos:[{t:1,p:DPP}]},
];


// ===== core/storage.js =====

const SK='motoredge_v4';
function ld(){
  try{const r=localStorage.getItem(SK);return r?JSON.parse(r):{orders:[],egresos:[],precios:null,costos:null,productos:null};}
  catch(e){
    // JSON corrupto en localStorage — notificar después de que el DOM esté listo
    setTimeout(()=>sN('⚠ Storage corrupto — datos no cargados. Restaurá desde backup JSON.',true),800);
    return{orders:[],egresos:[],precios:null,costos:null,productos:null};
  }
}
function sd(d){try{localStorage.setItem(SK,JSON.stringify(d));}catch(e){if(e.name==='QuotaExceededError'||e.code===22)sN('⚠ Storage LLENO — exportá un backup JSON y borrá meses viejos desde Configuración',true);else sN('Error al guardar',true);}}
function gO(){return ld().orders||[];}
function gOConf(){return gO().filter(o=>o.estado!=='pendiente');}
function gE(){return ld().egresos||[];}
function dO(id){const d=ld();d.orders=d.orders.filter(o=>o.id!==id);sd(d);window.updateClientesDatalist?.();}
function dE(id){const d=ld();d.egresos=(d.egresos||[]).filter(e=>e.id!==id);sd(d);}
function gInv(){var d=ld();return d.inversiones||[];}
function dInv(id){var d=ld();d.inversiones=(d.inversiones||[]).filter(function(x){return x.id!==id;});sd(d);}
function gLiqExterna(){const d=ld();return d.liquidezExterna||[];}
function dLiqExterna(id){const d=ld();d.liquidezExterna=(d.liquidezExterna||[]).filter(function(x){return x.id!==id;});sd(d);}


// ===== core/ids.js =====

function nId(mes){const dm=gO().filter(o=>o.id.substring(2,8)===mes);if(!dm.length)return`V-${mes}-0001`;const mx=Math.max(...dm.map(o=>parseInt(o.id.substring(9))));return`V-${mes}-${String(mx+1).padStart(4,'0')}`;}

function nEId(mes){const dm=gE().filter(e=>e.id.substring(2,8)===mes);if(!dm.length)return`E-${mes}-0001`;const mx=Math.max(...dm.map(e=>parseInt(e.id.substring(9))));return`E-${mes}-${String(mx+1).padStart(4,'0')}`;}

function newIngresoId(){
  const mes=d2m(hoy());
  const d=ld();
  if(!d.ingresos||!d.ingresos.length)return'ING-'+mes+'-0001';
  const del_mes=d.ingresos.filter(x=>x.id&&x.id.startsWith('ING-'+mes+'-'));
  if(!del_mes.length)return'ING-'+mes+'-0001';
  // Usar Math.max como nId/nEId para evitar colisiones tras eliminaciones
  const mx=Math.max(...del_mes.map(x=>parseInt(x.id.split('-')[2])||0));
  return'ING-'+mes+'-'+String(mx+1).padStart(4,'0');
}

function invNuevoId(mes){
  var del_mes=gInv().filter(function(x){return x.mesActual===mes;});
  if(!del_mes.length)return 'I-'+mes+'-0001';
  var max=Math.max.apply(null,del_mes.map(function(x){return parseInt(x.id.split('-')[2])||0;}));
  return 'I-'+mes+'-'+String(max+1).padStart(4,'0');
}


// ===== core/config.js =====

let PT, CT, HT, GP, PP, COSTS;

// Dependency injection — set these before calling loadConfig()
let _getProductos = () => [];
let _updateClientesDatalist = () => {};

function initConfigDeps(getProductosFn, updateClientesFn) {
  _getProductos = getProductosFn;
  _updateClientesDatalist = updateClientesFn;
}

function loadConfig(){
  const d=ld();
  if(d.precios){PT=d.precios.PT||DPT.map(x=>({...x}));CT=d.precios.CT||DCT.map(x=>({...x}));HT=d.precios.HT||DHT.map(x=>({...x}));GP=d.precios.GP||DGP;PP=d.precios.PP||DPP;}
  else{PT=DPT.map(x=>({...x}));CT=DCT.map(x=>({...x}));HT=DHT.map(x=>({...x}));GP=DGP;PP=DPP;}
  COSTS=d.costos||{...DCOSTS};
  // Sync PT/CT/HT from product catalog if available
  const prods=_getProductos();
  // Sync PT from first active pastilla (calaveras)
  const calp=prods.find(p=>p.id==='v-cal');if(calp&&calp.tramos)PT=calp.tramos;
  const cp=prods.find(p=>p.id==='p-cris');if(cp&&cp.tramos)CT=cp.tramos;
  const hp=prods.find(p=>p.id==='p-hong');if(hp&&hp.tramos)HT=hp.tramos;
  const gp=prods.find(p=>p.id==='p-got');if(gp&&gp.tramos&&gp.tramos[0])GP=gp.tramos[0].p;
  const petp=prods.find(p=>p.id==='p-pet');if(petp&&petp.tramos&&petp.tramos[0])PP=petp.tramos[0].p;
  // Sync COSTS from catalog
  prods.forEach(p=>{if(p.legacyKey&&p.costo!=null){if(p.legacyKey==='calaveras'||p.id==='p-past')COSTS.past=p.costo;else if(p.legacyKey==='cristales')COSTS.cris=p.costo;else if(p.legacyKey==='hongos')COSTS.hong=p.costo;else if(p.legacyKey==='goteros')COSTS.got=p.costo;else if(p.legacyKey==='petri')COSTS.pet=p.costo;}});
  _updateClientesDatalist();
}


// ===== modules/github.js =====

// ── GITHUB SYNC ──
function renderIOStatus(){
  const cont=document.getElementById('io-status-body');if(!cont)return;
  const d=ld();
  const orders=d.orders||[];
  const conf=orders.filter(o=>o.estado!=='pendiente');
  const pend=orders.filter(o=>o.estado==='pendiente');
  const egresos=d.egresos||[];
  const inversiones=d.inversiones||[];
  const productos=d.productos||[];
  const listas=d.listasPrecios||[];
  const ingresos=d.ingresos||[];
  const lotes=d.lotes||{};
  const lotesTotal=Object.values(lotes).reduce((a,arr)=>a+(arr?.length||0),0);
  const lotesActivos=Object.values(lotes).reduce((a,arr)=>a+(arr?.filter(l=>l.qty_restante>0).length||0),0);
  const stockMovs=d.stockMovs||[];
  const umbrales=d.stockUmbrales||{};

  // Estimate localStorage usage
  let lsSize=0;
  try{const raw=localStorage.getItem('motoredge_v4');lsSize=raw?new Blob([raw]).size:0;}catch(e){}
  const lsKB=(lsSize/1024).toFixed(1);
  const lsPct=Math.min(100,(lsSize/(5*1024*1024)*100)).toFixed(1);

  const row=(icon,label,val,sub,col)=>`<div style="background:var(--s1);padding:10px 14px">
    <div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;margin-bottom:3px">${icon} ${label}</div>
    <div style="font-family:var(--mo);font-size:16px;font-weight:700;color:${col||'var(--tx)'};">${val}</div>
    ${sub?`<div style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin-top:2px">${sub}</div>`:''}
  </div>`;

  cont.innerHTML=`<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--br);margin-bottom:1px">
    ${row('🧾','VENTAS TOTALES',orders.length,conf.length+' confirmadas · '+pend.length+' pendientes','var(--ac)')}
    ${row('🔴','EGRESOS',egresos.length,'','var(--er)')}
    ${row('📊','INVERSIONES',inversiones.length,'','var(--ac2)')}
    ${row('📦','PRODUCTOS',productos.length,listas.length+' listas de precios','var(--tx)')}
  </div>
  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--br);margin-bottom:1px">
    ${row('📥','INGRESOS STOCK',ingresos.length,'movimientos de compra registrados','var(--wn)')}
    ${row('📦','LOTES',lotesTotal,lotesActivos+' activos · '+Object.keys(lotes).length+' productos con lotes','var(--wn)')}
    ${row('📋','MOVS. STOCK',stockMovs.length,'historial de movimientos','var(--tx3)')}
    ${row('⚙','UMBRALES',Object.keys(umbrales).length,'productos con umbrales configurados','var(--tx3)')}
  </div>
  <div style="display:grid;grid-template-columns:1fr;gap:1px;background:var(--br)">
    <div style="background:var(--s1);padding:10px 14px">
      <div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;margin-bottom:5px">💾 ALMACENAMIENTO LOCAL</div>
      <div style="display:flex;align-items:center;gap:10px">
        <div style="flex:1;height:6px;background:var(--s3);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${lsPct}%;background:${parseFloat(lsPct)>80?'var(--er)':parseFloat(lsPct)>50?'var(--wn)':'var(--ac)'};transition:width .3s"></div>
        </div>
        <span style="font-family:var(--mo);font-size:10px;font-weight:700;color:var(--tx);white-space:nowrap">${lsKB} KB <span style="font-weight:400;color:var(--tx3)">/ 5120 KB (${lsPct}%)</span></span>
      </div>
      <div style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin-top:6px">Clave: motoredge_v4 · Última versión guardada: ${d._version||'v4'}</div>
    </div>
  </div>`;
}

const GH_SK='me_gh_config';

function ghCfg(){
  try{return JSON.parse(localStorage.getItem(GH_SK)||'{}');}catch(e){return{};}
}

function ghStatus(msg,isErr){
  const el=document.getElementById('ghStatus');
  if(!el)return;
  el.style.display='block';
  el.style.borderLeft='3px solid '+(isErr?'var(--er)':'var(--ac)');
  el.style.color=isErr?'var(--er)':'var(--ac)';
  el.innerHTML=msg;
}

function ghSyncInfo(msg){
  const el=document.getElementById('ghSyncInfo');
  if(el)el.textContent=msg;
}

// Encode JSON to base64 safely — handles all unicode / $ / accented chars
function safeB64Encode(str){
  // TextEncoder → Uint8Array → base64
  const bytes=new TextEncoder().encode(str);
  let bin='';
  for(let i=0;i<bytes.byteLength;i++)bin+=String.fromCharCode(bytes[i]);
  return btoa(bin);
}

// Decode base64 to string safely
function safeB64Decode(b64){
  const bin=atob(b64);
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function ghSaveToken(){
  const token=(document.getElementById('ghToken').value||'').trim();
  const repo=(document.getElementById('ghRepo').value||'').trim();
  const file=(document.getElementById('ghFile').value||'datos.json').trim();
  if(!token){ghStatus('ERROR: Token requerido',true);return;}
  if(!repo||!repo.includes('/')){ghStatus('ERROR: Repo invalido — debe ser usuario/repo',true);return;}
  localStorage.setItem(GH_SK,JSON.stringify({token,repo,file}));
  ghStatus('Config guardada en este dispositivo.<br>El token nunca sale de tu browser.',false);
  sN('GitHub config guardada');
}

function ghLoadConfig(){
  const cfg=ghCfg();
  const tf=document.getElementById('ghToken');
  const rf=document.getElementById('ghRepo');
  const ff=document.getElementById('ghFile');
  if(tf&&cfg.token)tf.value=cfg.token;
  if(rf&&cfg.repo)rf.value=cfg.repo;
  if(ff&&cfg.file)ff.value=cfg.file;
}

async function ghTestConn(){
  const cfg=ghCfg();
  if(!cfg.token){ghStatus('ERROR: Primero guarda el token con "Guardar config"',true);return;}
  if(!cfg.repo){ghStatus('ERROR: Falta el nombre del repo (usuario/repo)',true);return;}
  ghStatus('Probando conexion con GitHub...', false);
  try{
    const r=await fetch('https://api.github.com/repos/'+cfg.repo,{
      headers:{'Authorization':'token '+cfg.token,'Accept':'application/vnd.github.v3+json'}
    });
    const d=await r.json();
    if(r.ok){
      ghStatus('OK — Repo: <b>'+d.full_name+'</b><br>Visibilidad: '+(d.private?'Privado':'Publico')+'<br>Permiso de escritura verificado.',false);
    } else {
      ghStatus('ERROR '+r.status+': '+(d.message||'Sin acceso')+'<br>Revisa que el token tenga scope "repo".',true);
    }
  }catch(e){ghStatus('ERROR de red: '+e.message,true);}
}

async function ghGetFileSha(cfg){
  try{
    const r=await fetch('https://api.github.com/repos/'+cfg.repo+'/contents/'+cfg.file+'?t='+Date.now(),{
      headers:{'Authorization':'token '+cfg.token,'Accept':'application/vnd.github.v3+json'}
    });
    if(r.ok){const d=await r.json();return d.sha||null;}
    return null;
  }catch(e){return null;}
}

async function ghPush(showNotif){
  const cfg=ghCfg();
  if(!cfg.token||!cfg.repo){
    if(showNotif)ghStatus('ERROR: Configura GitHub primero (token + repo)',true);
    return;
  }
  if(showNotif)ghStatus('Guardando en GitHub...', false);
  try{
    const data=ld();
    // Incluir configuraciones separadas para backup completo
    data._distSlices=window._getDistSlices?.();
    data._liqDistSlices=window._getLiqDistSlices?.();
    data._distKpiHidden=window._getDistKpiHidden?.();
    data._version='motoredge_v5';
    data._savedAt=new Date().toISOString();
    // Metadata para verificación rápida
    data._meta={
      orders:(data.orders||[]).length,
      egresos:(data.egresos||[]).length,
      inversiones:(data.inversiones||[]).length,
      productos:(data.productos||[]).length,
      listasPrecios:(data.listasPrecios||[]).length,
      ingresos:(data.ingresos||[]).length,
      lotesItems:Object.keys(data.lotes||{}).length,
      contactos:(data.contactos||[]).length,
    };
    const jsonStr=JSON.stringify(data,null,2);
    const encoded=safeB64Encode(jsonStr);
    const sha=await ghGetFileSha(cfg);
    const msgParts=[
      'sync '+new Date().toISOString().slice(0,16).replace('T',' '),
      (data.orders||[]).length+'v',
      (data.egresos||[]).length+'e',
      (data.ingresos||[]).length+'ing',
    ];
    const body={
      message:msgParts.join(' · '),
      content:encoded
    };
    if(sha)body.sha=sha;
    const r=await fetch('https://api.github.com/repos/'+cfg.repo+'/contents/'+cfg.file,{
      method:'PUT',
      headers:{
        'Authorization':'token '+cfg.token,
        'Accept':'application/vnd.github.v3+json',
        'Content-Type':'application/json'
      },
      body:JSON.stringify(body)
    });
    const resp=await r.json();
    if(r.ok){
      const now=new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
      localStorage.setItem('me_gh_last_push',now);
      const syncEl=document.getElementById('ghSyncInfo');
      if(syncEl)syncEl.textContent='Guardado en GitHub: '+now;
      if(showNotif){
        ghStatus('OK guardado en GitHub a las '+now+'<br>Archivo: '+cfg.file+' en '+cfg.repo,false);
        sN('Guardado en GitHub');
      }
    } else {
      const errMsg='ERROR '+r.status+': '+(resp.message||JSON.stringify(resp));
      if(showNotif)ghStatus(errMsg+'<br>Repo: '+cfg.repo+'<br>Archivo: '+cfg.file,true);
      console.error('ghPush error:',r.status,resp);
    }
  }catch(e){
    if(showNotif)ghStatus('ERROR inesperado: '+e.message,true);
    console.error('ghPush exception:',e);
  }
}

async function ghPull(showNotif){
  const cfg=ghCfg();
  if(!cfg.token||!cfg.repo){
    if(showNotif)ghStatus('ERROR: Configura GitHub primero',true);
    return;
  }
  if(showNotif)ghStatus('Cargando datos desde GitHub...', false);
  try{
    const r=await fetch('https://api.github.com/repos/'+cfg.repo+'/contents/'+cfg.file+'?t='+Date.now(),{
      headers:{'Authorization':'token '+cfg.token,'Accept':'application/vnd.github.v3+json'}
    });
    if(r.status===404){
      if(showNotif)ghStatus('El archivo <b>'+cfg.file+'</b> todavia no existe en el repo.<br>Hace un "Guardar en GitHub" primero.',false);
      return;
    }
    if(!r.ok){
      const d=await r.json();
      if(showNotif)ghStatus('ERROR '+r.status+': '+(d.message||'Error al leer'),true);
      return;
    }
    const meta=await r.json();
    const jsonStr=safeB64Decode(meta.content.replace(/\n/g,''));
    const decoded=JSON.parse(jsonStr);
    if(!decoded.orders||!Array.isArray(decoded.orders))throw new Error('Formato de datos invalido');
    // Restaurar configuraciones separadas si vienen en el payload
    if(decoded._distSlices){window._setDistSlices?.(decoded._distSlices);saveDistSlices();delete decoded._distSlices;}
    if(decoded._liqDistSlices){window._setLiqDistSlices?.(decoded._liqDistSlices);saveLiqSlices();delete decoded._liqDistSlices;}
    if(decoded._distKpiHidden){window._setDistKpiHidden?.(decoded._distKpiHidden);saveKpiHidden();delete decoded._distKpiHidden;}
    delete decoded._version;delete decoded._savedAt;delete decoded._meta;
    sd(decoded);
    // Full refresh — inventario incluido
    loadConfig();buildTicketUI();upd();
    rfM();rH();rS();rEH();rES();renderDash();renderSettings();
    try{renderInventario();}catch(e){}
    try{if(typeof renderInvAll==='function')renderInvAll();}catch(e){}
    try{rfInvM();}catch(e){}
    updateClientesDatalist();uhd();
    const now=new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
    const syncEl=document.getElementById('ghSyncInfo');
    if(syncEl)syncEl.textContent='Cargado desde GitHub: '+now;
    if(showNotif){
      const m=decoded._meta||{};
      ghStatus('OK — datos cargados desde GitHub<br>'
        +(decoded.orders||[]).length+' ventas · '+(decoded.egresos||[]).length+' egresos · '
        +(decoded.inversiones||[]).length+' inversiones · '
        +(decoded.ingresos||[]).length+' ingresos stock · '
        +Object.keys(decoded.lotes||{}).length+' productos con lotes',false);
      sN('Datos cargados desde GitHub');
    }
  }catch(e){
    if(showNotif)ghStatus('ERROR: '+e.message,true);
    console.error('ghPull exception:',e);
  }
}

// Auto-push silencioso con debounce — agrupa operaciones rápidas en un solo push
let _autoPushTimer=null;
function ghAutoPush(){
  const cfg=ghCfg();
  if(!cfg.token||!cfg.repo)return;
  clearTimeout(_autoPushTimer);
  _autoPushTimer=setTimeout(function(){
    ghPush(false).catch(function(e){console.error('ghAutoPush failed:',e);});
  },8000);
}

// ── BACKUP DE SEGURIDAD POR FECHA ──
async function ghBackupNow(){
  const cfg=ghCfg();
  if(!cfg.token||!cfg.repo){
    const el=document.getElementById('ghBackupStatus');
    if(el){el.style.display='';el.style.color='var(--er)';el.innerHTML='ERROR: Configura GitHub primero (token + repo)';}
    return;
  }
  const el=document.getElementById('ghBackupStatus');
  if(el){el.style.display='';el.style.color='var(--tx2)';el.innerHTML='Guardando backup...';}
  try{
    const data=ld();
    const jsonStr=JSON.stringify(data,null,2);
    const encoded=safeB64Encode(jsonStr);
    const now=new Date();
    const dateStr=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
    const timeStr=String(now.getHours()).padStart(2,'0')+String(now.getMinutes()).padStart(2,'0');
    const backupFile='backups/backup_'+dateStr+'_'+timeStr+'.json';
    // Backups NUNCA se sobreescriben — no buscamos SHA
    const body={
      message:'backup manual '+dateStr+' '+timeStr,
      content:encoded
    };
    const r=await fetch('https://api.github.com/repos/'+cfg.repo+'/contents/'+backupFile,{
      method:'PUT',
      headers:{
        'Authorization':'token '+cfg.token,
        'Accept':'application/vnd.github.v3+json',
        'Content-Type':'application/json'
      },
      body:JSON.stringify(body)
    });
    const resp=await r.json();
    if(r.ok){
      if(el){el.style.color='var(--ac)';el.innerHTML='✅ Backup guardado: <b>'+backupFile+'</b><br>'+data.orders.length+' ventas · '+(data.egresos||[]).length+' egresos · '+(data.inversiones||[]).length+' inversiones';}
      sN('Backup guardado en GitHub');
    } else {
      if(el){el.style.color='var(--er)';el.innerHTML='ERROR '+r.status+': '+(resp.message||JSON.stringify(resp));}
    }
  }catch(e){
    if(el){el.style.color='var(--er)';el.innerHTML='ERROR: '+e.message;}
  }
}

async function ghListBackups(){
  const cfg=ghCfg();
  if(!cfg.token||!cfg.repo){sN('Configura GitHub primero',true);return;}
  const el=document.getElementById('ghBackupList');
  if(el)el.innerHTML='<div style="font-family:var(--mo);font-size:9px;color:var(--tx3)">Buscando backups...</div>';
  try{
    const r=await fetch('https://api.github.com/repos/'+cfg.repo+'/contents/backups',{
      headers:{'Authorization':'token '+cfg.token,'Accept':'application/vnd.github.v3+json'}
    });
    if(r.status===404){
      const repoR=await fetch('https://api.github.com/repos/'+cfg.repo,{headers:{'Authorization':'token '+cfg.token,'Accept':'application/vnd.github.v3+json'}});
      if(!repoR.ok){if(el)el.innerHTML='<div style="font-family:var(--mo);font-size:9px;color:var(--er)">ERROR '+repoR.status+': Sin acceso al repo. Verificá el token en la configuración de GitHub.</div>';return;}
      if(el)el.innerHTML='<div style="font-family:var(--mo);font-size:9px;color:var(--tx3)">No hay backups guardados todavía.</div>';return;
    }
    if(!r.ok){const d=await r.json().catch(()=>({}));if(el)el.innerHTML='<div style="font-family:var(--mo);font-size:9px;color:var(--er)">Error '+r.status+': '+(d.message||'Error al listar backups.')+'</div>';return;}
    const files=await r.json();
    if(!files.length){if(el)el.innerHTML='<div style="font-family:var(--mo);font-size:9px;color:var(--tx3)">Sin backups.</div>';return;}
    var html='<div style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin-bottom:6px;letter-spacing:1px">'+files.length+' BACKUPS GUARDADOS</div>';
    files.slice().reverse().forEach(function(f){
      html+='<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:var(--s2);border:1px solid var(--br);margin-bottom:4px">'
        +'<span style="font-family:var(--mo);font-size:9px;color:var(--tx)">'+f.name+'</span>'
        +'<a href="'+f.download_url+'" target="_blank" style="font-family:var(--mo);font-size:8px;color:var(--ac2);text-decoration:none">⬇ descargar</a>'
        +'</div>';
    });
    if(el)el.innerHTML=html;
  }catch(e){if(el)el.innerHTML='<div style="font-family:var(--mo);font-size:9px;color:var(--er)">ERROR: '+e.message+'</div>';}
}

function ghInit(){
  ghLoadConfig();
  const last=localStorage.getItem('me_gh_last_push');
  if(last){const el=document.getElementById('ghSyncInfo');if(el)el.textContent='Ultimo guardado: '+last;}
}


// ===== modules/apariencia.js =====

const PRESETS={
  dark:  {ac:'#00e5a0',bg:'#0a0a0f',tx:'#e8e8f0',tx2:'#8888a0',s1:'#111118',br:'#2a2a3a',theme:'dark'},
  light: {ac:'#00c888',bg:'#f0f0f5',tx:'#111118',tx2:'#44445a',s1:'#ffffff', br:'#c8c8d8',theme:'light'},
  blue:  {ac:'#4488ff',bg:'#080c18',tx:'#ddeeff',tx2:'#6688aa',s1:'#0e1428', br:'#1a2a44',theme:'dark'},
  red:   {ac:'#ff4455',bg:'#0f0808',tx:'#f0e0e0',tx2:'#aa7070',s1:'#1a0e0e', br:'#3a1a1a',theme:'dark'},
  purple:{ac:'#b066ff',bg:'#0a080f',tx:'#e8e0f0',tx2:'#9977bb',s1:'#130e1a', br:'#2a1a3a',theme:'dark'},
  modern:{ac:'#f5a623',bg:'#050a0e',tx:'#e2f0fa',tx2:'#6b8fa8',s1:'#0d1e2d', br:'#1a3a52',theme:'modern'},
};

function getApariencia(){
  try{const r=localStorage.getItem('me_apariencia');return r?JSON.parse(r):null;}catch(e){return null;}
}
function saveApariencia(a){localStorage.setItem('me_apariencia',JSON.stringify(a));}

function applyApariencia(a){
  if(!a)return;
  const root=document.documentElement;
  // Apply theme attribute first (enables modern CSS)
  if(a.theme){
    if(a.theme==='modern'){
      document.body.setAttribute('data-theme','modern');
    } else if(a.theme==='light'){
      document.body.setAttribute('data-theme','light');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }
  if(a.ac)root.style.setProperty('--ac',a.ac);
  if(a.bg)root.style.setProperty('--bg',a.bg);
  if(a.tx)root.style.setProperty('--tx',a.tx);
  if(a.tx2){root.style.setProperty('--tx2',a.tx2);root.style.setProperty('--tx3',lighten(a.tx2,-20));}
  if(a.s1){
    root.style.setProperty('--s1',a.s1);
    root.style.setProperty('--s2',lighten(a.s1,8));
    root.style.setProperty('--s3',lighten(a.s1,15));
  }
  if(a.br)root.style.setProperty('--br',a.br);
  if(a.nombre){
    const h1=document.querySelector('.logo h1');
    if(h1){
      const parts=(a.nombre||'MOTOR EDGE').split(' ');
      const last=parts.length>1?parts.pop():'';
      h1.innerHTML=`${parts.join(' ')} <span>${last}</span>`;
    }
  }
  if(a.version){const lb=document.querySelector('.lb');if(lb)lb.textContent='V'+a.version;}
  if(a.nombre||a.version){document.title=(a.nombre||'MOTOR EDGE')+' '+(a.version||'3.9-E');}
}

function lighten(hex,amount){
  try{
    hex=hex.replace('#','');
    const r=Math.min(255,Math.max(0,parseInt(hex.substring(0,2),16)+amount));
    const g=Math.min(255,Math.max(0,parseInt(hex.substring(2,4),16)+amount));
    const b=Math.min(255,Math.max(0,parseInt(hex.substring(4,6),16)+amount));
    return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
  }catch(e){return '#'+hex;}
}

function loadAparienciaForm(){
  const root=document.documentElement;
  function getVar(v){return getComputedStyle(root).getPropertyValue(v).trim();}
  const fields=[
    ['ap-ac','ap-ac-hex','--ac','#00e5a0'],
    ['ap-bg','ap-bg-hex','--bg','#0a0a0f'],
    ['ap-tx','ap-tx-hex','--tx','#e8e8f0'],
    ['ap-tx2','ap-tx2-hex','--tx2','#8888a0'],
    ['ap-s1','ap-s1-hex','--s1','#111118'],
    ['ap-br','ap-br-hex','--br','#2a2a3a'],
  ];
  fields.forEach(([pickId,hexId,cssVar,fallback])=>{
    const val=(getVar(cssVar)||fallback).trim();
    const picker=document.getElementById(pickId);
    const hexEl=document.getElementById(hexId);
    if(picker){picker.value=val;picker.oninput=()=>{const v=picker.value;if(hexEl)hexEl.value=v;const key=pickId.replace('ap-','');const saved=getApariencia()||{};applyApariencia({[key]:v,theme:saved.theme||'dark'});};}
    if(hexEl)hexEl.value=val;
  });
  const saved=getApariencia();
  const nom=document.getElementById('ap-nombre');if(nom)nom.value=saved?.nombre||'';
  const ver=document.getElementById('ap-version');if(ver)ver.value=saved?.version||'';
}

function syncColorFromHex(pickerId,hexId){
  const hex=document.getElementById(hexId)?.value.trim();
  const picker=document.getElementById(pickerId);
  if(!hex||!picker)return;
  if(/^#[0-9a-fA-F]{6}$/.test(hex)){
    picker.value=hex;
    const key=pickerId.replace('ap-','');
    const saved=getApariencia()||{};
    applyApariencia({[key]:hex,theme:saved.theme||'dark'});
  }
}

function applyPreset(name){
  const p=PRESETS[name];if(!p)return;
  applyApariencia(p);
  // Save theme name so it persists
  const saved=getApariencia()||{};
  saveApariencia({...saved,...p,_preset:name});
  loadAparienciaForm();
  updateThemeCards(name);
  sN('Tema "'+name+'" aplicado');
}

function updateThemeCards(activeName){
  const names=['dark','modern','light','blue','red','purple'];
  names.forEach(n=>{
    const card=document.getElementById('tc-'+n);
    const badge=document.getElementById('tc-'+n+'-badge');
    if(!card)return;
    const isActive=n===activeName;
    const accentColors={dark:'#00e5a0',modern:'#f5a623',light:'#00c888',blue:'#4488ff',red:'#ff4455',purple:'#b066ff'};
    const ac=accentColors[n]||'#00e5a0';
    card.style.borderColor=isActive?ac:'var(--br)';
    card.style.boxShadow=isActive?`0 0 0 1px ${ac}33`:'none';
    if(badge)badge.style.display=isActive?'inline':'none';
  });
}

function toggleAparienciaAvanzada(){
  const body=document.getElementById('ap-avanzada');
  const icon=document.getElementById('ap-adv-icon');
  if(!body)return;
  const open=body.style.display==='none'||!body.style.display;
  body.style.display=open?'block':'none';
  if(icon)icon.textContent=open?'▴':'▼';
  if(open)loadAparienciaForm();
}

function guardarApariencia(){
  const get=id=>document.getElementById(id)?.value||'';
  const saved=getApariencia()||{};
  const a={
    ac:get('ap-ac'),bg:get('ap-bg'),tx:get('ap-tx'),tx2:get('ap-tx2'),
    s1:get('ap-s1'),br:get('ap-br'),
    nombre:get('ap-nombre').trim(),
    version:get('ap-version').trim(),
    theme:saved.theme||'dark',
    _preset:saved._preset||'dark',
  };
  saveApariencia(a);applyApariencia(a);
  const res=document.getElementById('apRes');
  if(res)res.innerHTML=`<span style="color:var(--ac)">✓ Apariencia guardada</span>`;
  sN('Apariencia guardada');
}

function resetApariencia(){
  if(!confirm('¿Restaurar apariencia por defecto?'))return;
  localStorage.removeItem('me_apariencia');
  const root=document.documentElement;
  ['--ac','--bg','--tx','--tx2','--tx3','--s1','--s2','--s3','--br'].forEach(v=>root.style.removeProperty(v));
  const h1=document.querySelector('.logo h1');if(h1)h1.innerHTML='MOTOR <span>EDGE</span>';
  const lb=document.querySelector('.lb');if(lb)lb.textContent='V3.9-E';
  document.title='MOTOR EDGE 3.9-E';
  loadAparienciaForm();
  sN('Apariencia restaurada');
}


// ===== modules/stock.js =====

function getStock(){const d=ld();return d.stock||{};}
function saveStock(s){const d=ld();d.stock=s;sd(d);}
function getUmbrales(){const d=ld();return d.stockUmbrales||{};}
function saveUmbrales(u){const d=ld();d.stockUmbrales=u;sd(d);}
function getStockMovs(){const d=ld();return d.stockMovs||[];}
function addStockMov(mov){const d=ld();if(!d.stockMovs)d.stockMovs=[];d.stockMovs.unshift(mov);if(d.stockMovs.length>1000)d.stockMovs=d.stockMovs.slice(0,1000);sd(d);}
function limpiarMovsStock(){if(!confirm('¿Eliminar todo el historial de movimientos de stock?'))return;const d=ld();d.stockMovs=[];sd(d);window.renderStockHistorial?.();sN('Historial limpiado');}
function eliminarMov(idx){const d=ld();if(!d.stockMovs||!d.stockMovs[idx])return;d.stockMovs.splice(idx,1);sd(d);window.renderStockHistorial?.();}

// ── helpers ──
function getStockStatus(qty,uid){
  const u=getUmbrales()[uid]||{};
  const crit=u.crit!=null?u.crit:5;
  const warn=u.warn!=null?u.warn:15;
  if(qty<=0)return'empty';
  if(qty<=crit)return'crit';
  if(qty<=warn)return'warn';
  return'ok';
}
function skPill(st,qty,unit){
  if(st==='empty')return`<span class="sk-pill empty">⛔ SIN STOCK</span>`;
  if(st==='crit')return`<span class="sk-pill crit">🔴 RIESGO · ${qty}${unit}</span>`;
  if(st==='warn')return`<span class="sk-pill warn">🟡 ATENCIÓN · ${qty}${unit}</span>`;
  return`<span class="sk-pill ok">🟢 OK · ${qty}${unit}</span>`;
}
// legacy alias kept for mini-panel
function stockStatusBadge(qty,uid,unit){
  const realQty = getActualQty(uid);
  return skPill(getStockStatus(realQty,uid),realQty,unit);
}

function getAllStockItems(){
  const prods=(window.getProductos?.())||[];
  return prods.map(p=>({
    id:p.id,prodId:p.id,nombre:p.nombre,emoji:p.emoji,
    unit:p.unit||'ud',isGroup:false,parentId:null
  }));
}

// ── Datos: Lotes ──
function getLotes(){const d=ld();return d.lotes||{};}
function saveLotes(l){const d=ld();d.lotes=l;sd(d);}

function getLotesItem(itemId){
  return(getLotes()[itemId]||[]).sort((a,b)=>a.fecha.localeCompare(b.fecha));
}
function getLotesActivos(itemId){
  return getLotesItem(itemId).filter(l=>l.qty_restante>0);
}
function getStockFromLotes(itemId){
  return getLotesActivos(itemId).reduce((a,l)=>a+l.qty_restante,0);
}
function getCostoPromedio(itemId){
  const activos=getLotesActivos(itemId);
  const tot=activos.reduce((a,l)=>a+l.qty_restante,0);
  if(!tot)return 0;
  return activos.reduce((a,l)=>a+l.qty_restante*l.costo_unitario,0)/tot;
}
function getStockGrupo(prodId){
  const p=(window.getProductos?.())||[];
  const prod=p.find(x=>x.id===prodId);
  if(!prod||!prod.variantes)return 0;
  return prod.variantes.reduce((a,v)=>a+getStockFromLotes(v.id),0);
}
function getCostoPromedioGrupo(prodId){
  const p=(window.getProductos?.())||[];
  const prod=p.find(x=>x.id===prodId);
  if(!prod||!prod.variantes)return getCostoPromedio(prodId);
  let totQty=0,totCosto=0;
  prod.variantes.forEach(v=>{
    const activos=getLotesActivos(v.id);
    activos.forEach(l=>{totQty+=l.qty_restante;totCosto+=l.qty_restante*l.costo_unitario;});
  });
  return totQty?totCosto/totQty:0;
}

// ── getActualQty actualizado para usar lotes ──
function getActualQty(id,_stock){
  const fromLotes=getStockFromLotes(id);
  if(fromLotes>0)return fromLotes;
  // fallback legacy stock
  return getStock()[id]||0;
}


// ===== modules/listas-precios.js =====

function getListasPrecios(){
  const d=ld();
  if(!d.listasPrecios||!d.listasPrecios.length){
    return DEFAULT_LISTAS_PRECIOS.map(l=>({...l,tramos:l.tramos.map(t=>({...t}))}));
  }
  return d.listasPrecios;
}
function saveListasPrecios(listas){const d=ld();d.listasPrecios=listas;sd(d);}
function newListaId(){
  const listas=getListasPrecios();
  const nums=listas.map(l=>parseInt(l.id.replace(/\D/g,''))||0);
  return 'lp-'+(Math.max(0,...nums)+1).toString().padStart(3,'0');
}

// Obtener tramos efectivos para un producto (respeta asignación de lista)
function getTramosProducto(prod){
  if(prod.listaPrecioId){
    const lista=getListasPrecios().find(l=>l.id===prod.listaPrecioId);
    if(lista)return lista.tramos;
  }
  return prod.tramos||[];
}

// ════════════════════════════════════════
// MÓDULO LISTA DE PRECIOS — render
// ════════════════════════════════════════
function renderListasPrecios(){
  const cont=document.getElementById('inv-listas-body');if(!cont)return;
  const listas=getListasPrecios();
  if(!listas.length){cont.innerHTML='<div style="padding:20px;font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center">Sin listas. Creá una con ➕.</div>';return;}

  let html='';
  listas.forEach(lista=>{
    const lid=lista.id;
    const tramos=lista.tramos||[];
    const prodsAsignados=window.getProductos?.().filter(p=>p.listaPrecioId===lid)||[];
    const base=tramos[0]?.p||0;

    html+='<div id="lpg-'+lid+'" style="border:1px solid var(--br);margin-bottom:8px;background:var(--s1)">';

    // ── Header ──
    html+='<div style="display:grid;grid-template-columns:1fr auto;align-items:start;padding:12px 14px;gap:12px">'
      // Left: name + meta
      +'<div>'
      +'<div style="font-family:var(--mo);font-size:12px;font-weight:700;color:var(--tx);margin-bottom:4px">'+lista.nombre+'</div>'
      +'<div style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin-bottom:3px">ID: <span style="color:var(--ac2)">'+lid+'</span> · '+tramos.length+' tramos'+(base?' · Precio base: <span style="color:var(--ac)">$'+fi(base)+'</span>':'')+'</div>'
      +(prodsAsignados.length
        ?'<div style="font-family:var(--mo);font-size:8px;color:var(--tx2)">Asignada a: '+prodsAsignados.map(p=>'<span style="background:var(--s3);padding:1px 5px;margin-right:3px">'+p.emoji+' '+p.nombre+'</span>').join('')+'</div>'
        :'<div style="font-family:var(--mo);font-size:8px;color:var(--er)">Sin productos asignados</div>'
      )
      +'</div>'
      // Right: action buttons
      +'<div style="display:flex;gap:6px;align-items:center;flex-shrink:0">'
      +'<button class="pm-btn" data-edit-lista="'+lid+'" style="font-size:8px;height:28px;padding:0 10px">EDIT</button>'
      +'<button class="pm-btn del" data-del-lista="'+lid+'" style="font-size:8px;height:28px;width:28px;padding:0;text-align:center">✕</button>'
      +'<button data-lista-toggle="'+lid+'" style="background:none;border:1px solid var(--br);color:var(--tx3);font-family:var(--mo);font-size:10px;width:28px;height:28px;cursor:pointer;padding:0;text-align:center" id="lpa-'+lid+'">▸</button>'
      +'</div>'
      +'</div>';

    // ── Tramos expandible ──
    html+='<div id="lpt-'+lid+'" style="display:none;border-top:1px solid var(--br)">';
    if(tramos.length){
      html+='<table style="width:100%;border-collapse:collapse">'
        +'<thead><tr>'
        +'<th style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:8px 14px;text-align:left;background:var(--s2);border-bottom:1px solid var(--br)">DESDE</th>'
        +'<th style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:8px 14px;text-align:right;background:var(--s2);border-bottom:1px solid var(--br)">PRECIO</th>'
        +'<th style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:8px 14px;text-align:right;background:var(--s2);border-bottom:1px solid var(--br)">DTO. BASE</th>'
        +'</tr></thead><tbody>';
      tramos.forEach((t,i)=>{
        const disc=i===0?'—':'-'+((1-t.p/base)*100).toFixed(1)+'%';
        html+='<tr style="'+(i===0?'background:rgba(0,229,160,.03)':'')+';">'
          +'<td style="font-family:var(--mo);font-size:10px;padding:8px 14px;border-bottom:1px solid rgba(42,42,58,.15);color:var(--tx3)">≥ '+t.t+'</td>'
          +'<td style="font-family:var(--mo);font-size:11px;font-weight:700;padding:8px 14px;border-bottom:1px solid rgba(42,42,58,.15);text-align:right;color:var(--ac)">$'+fi(t.p)+'</td>'
          +'<td style="font-family:var(--mo);font-size:10px;padding:8px 14px;border-bottom:1px solid rgba(42,42,58,.15);text-align:right;color:var(--wn)">'+disc+'</td>'
          +'</tr>';
      });
      html+='</tbody></table>';
    } else {
      html+='<div style="padding:14px;font-family:var(--mo);font-size:10px;color:var(--tx3)">Sin tramos configurados.</div>';
    }
    html+='</div>';// /lpt
    html+='</div>';// /lpg
  });

  cont.innerHTML=html;
  cont.onclick=function(e){
    const toggleBtn=e.target.closest('[data-lista-toggle]');
    if(toggleBtn){
      const lid=toggleBtn.getAttribute('data-lista-toggle');
      const body=document.getElementById('lpt-'+lid);
      const arrow=document.getElementById('lpa-'+lid);
      if(!body)return;
      const open=body.style.display==='none';
      body.style.display=open?'':'none';
      if(arrow)arrow.textContent=open?'▾':'▸';
      return;
    }
    const editBtn=e.target.closest('[data-edit-lista]');
    if(editBtn){abrirEditarLista(editBtn.getAttribute('data-edit-lista'));return;}
    const delBtn=e.target.closest('[data-del-lista]');
    if(delBtn){eliminarLista(delBtn.getAttribute('data-del-lista'));return;}
  };
}

function renderAsignacionPrecios(){
  const cont=document.getElementById('inv-asignacion-body');if(!cont)return;
  const prods=(window.getProductos?.()||[]).filter(p=>p.activo!==false);
  const listas=getListasPrecios();
  const IS='background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:11px;padding:5px 8px;outline:none;width:100%';

  let html='<div style="overflow-x:auto"><table class="inv-stock-tbl"><thead><tr><th>Producto</th><th>Lista asignada</th><th>Precio base</th><th>Costo prom.</th><th>Margen base</th></tr></thead><tbody>';
  prods.forEach(p=>{
    const tramos=getTramosProducto(p);
    const precioBase=tramos[0]?.p||0;
    const costo=getCostoPromedio(p.id);
    const margen=costo&&precioBase?((precioBase-costo)/precioBase*100):null;
    const margenCls=margen==null?'color:var(--tx3)':margen>30?'color:var(--ac)':margen>15?'color:var(--wn)':'color:var(--er)';

    let opts='<option value="">— Sin lista —</option>';
    listas.forEach(l=>{opts+='<option value="'+l.id+'"'+(p.listaPrecioId===l.id?' selected':'')+'>'+l.nombre+'</option>';});

    html+='<tr>'
      +'<td>'+p.emoji+' '+p.nombre+'</td>'
      +'<td><select style="'+IS+'" data-asig-prod="'+p.id+'">'+opts+'</select></td>'
      +'<td style="text-align:right;font-family:var(--mo);color:var(--ac)">'+(precioBase?'$'+fi(precioBase):'—')+'</td>'
      +'<td style="text-align:right;font-family:var(--mo);color:var(--ac2)">'+(costo?'$'+fi(Math.round(costo)):'—')+'</td>'
      +'<td style="text-align:right;font-family:var(--mo);font-weight:700;'+margenCls+'">'+(margen!=null?margen.toFixed(1)+'%':'—')+'</td>'
      +'</tr>';
  });
  html+='</tbody></table></div>';
  html+='<div style="padding:10px 14px;border-top:1px solid var(--br);display:flex;align-items:center;gap:10px">'
    +'<button class="btn btn-p" id="btn-guardar-asig" style="font-size:9px;height:32px">💾 Guardar asignaciones</button>'
    +'<span id="asig-msg" style="font-family:var(--mo);font-size:9px;color:var(--ac)"></span>'
    +'</div>';
  cont.innerHTML=html;

  document.getElementById('btn-guardar-asig').onclick=function(){
    const prods=window.getProductos?.()||[];
    cont.querySelectorAll('[data-asig-prod]').forEach(sel=>{
      const pid=sel.getAttribute('data-asig-prod');
      const p=prods.find(x=>x.id===pid);
      if(p)p.listaPrecioId=sel.value||null;
    });
    window.saveProductos?.(prods);window.loadConfig?.();window.buildTicketUI?.();window.upd?.();
    const msg=document.getElementById('asig-msg');
    if(msg){msg.textContent='✓ Guardado';setTimeout(()=>msg.textContent='',2000);}
    renderAsignacionPrecios();sN('✓ Asignaciones guardadas');
  };
}

function abrirNuevaLista(){
  abrirEditarLista(null);
}

function abrirEditarLista(lid){
  const listas=getListasPrecios();
  const lista=lid?listas.find(l=>l.id===lid):null;
  const esNueva=!lista;
  const tramos=lista?JSON.parse(JSON.stringify(lista.tramos||[])):[];

  const IS='width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:8px 10px;outline:none;min-height:40px';
  const LB='font-family:var(--mo);font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase';

  document.getElementById('mTitEl').textContent=(esNueva?'➕ Nueva Lista de Precios':'✏ Editar Lista — '+(lista?.nombre||lid));
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal';
  document.getElementById('mTk').style.display='none';

  function renderTramosEditor(){
    let th='<table style="width:100%;border-collapse:collapse"><thead><tr>'
      +'<th style="font-family:var(--mo);font-size:8px;color:var(--tx3);padding:4px 8px;text-align:left;border-bottom:1px solid var(--br)">Desde (cant.)</th>'
      +'<th style="font-family:var(--mo);font-size:8px;color:var(--tx3);padding:4px 8px;text-align:right;border-bottom:1px solid var(--br)">Precio</th>'
      +'<th style="padding:4px 4px;border-bottom:1px solid var(--br)"></th>'
      +'</tr></thead><tbody id="te-tbody">';
    tramos.forEach((t,i)=>{
      th+='<tr>'
        +'<td style="padding:4px 8px"><input type="number" min="1" value="'+t.t+'" style="'+IS+';min-height:36px;font-size:11px" data-ti="'+i+'" data-field="t"></td>'
        +'<td style="padding:4px 8px"><input type="number" min="0" value="'+t.p+'" style="'+IS+';min-height:36px;font-size:11px" data-ti="'+i+'" data-field="p"></td>'
        +'<td style="padding:4px 4px;text-align:center"><button class="pm-btn del" data-del-t="'+i+'" style="font-size:9px">×</button></td>'
        +'</tr>';
    });
    th+='</tbody></table>';
    return th;
  }

  document.getElementById('mBody').innerHTML=
    '<div style="display:flex;flex-direction:column;gap:12px">'
    +'<div><label style="'+LB+'">Nombre de la lista</label><input type="text" id="el-nombre" value="'+(lista?.nombre||'')+'" placeholder="ej: Pastillas Premium" style="'+IS+'"></div>'
    +(lid?'<div style="font-family:var(--mo);font-size:9px;color:var(--tx3)">ID: <b style="color:var(--ac2)">'+lid+'</b></div>':'')
    +'<div>'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
    +'<label style="'+LB+';margin:0">Tramos de precio</label>'
    +'<button class="pm-btn" id="te-add" style="font-size:8px">+ Agregar tramo</button>'
    +'</div>'
    +'<div id="te-wrap">'+renderTramosEditor()+'</div>'
    +'</div>'
    +'</div>';

  document.getElementById('te-add').onclick=function(){
    const last=tramos[tramos.length-1];
    tramos.push({t:(last?.t||0)+10,p:Math.round((last?.p||0)*0.9)||0});
    document.getElementById('te-wrap').innerHTML=renderTramosEditor();
    bindTramoEvents();
  };

  function bindTramoEvents(){
    const wrap=document.getElementById('te-wrap');
    wrap.querySelectorAll('input[data-ti]').forEach(inp=>{
      inp.oninput=function(){tramos[parseInt(inp.getAttribute('data-ti'))][inp.getAttribute('data-field')]=parseFloat(inp.value)||0;};
    });
    wrap.querySelectorAll('[data-del-t]').forEach(btn=>{
      btn.onclick=function(){
        tramos.splice(parseInt(btn.getAttribute('data-del-t')),1);
        document.getElementById('te-wrap').innerHTML=renderTramosEditor();
        bindTramoEvents();
      };
    });
  }
  bindTramoEvents();

  document.getElementById('mFooter').innerHTML=
    '<button class="btn btn-p" id="el-save">💾 Guardar lista</button>'
    +'<button class="btn btn-s" onclick="clM()">✕ Cancelar</button>';

  document.getElementById('el-save').onclick=function(){
    const nombre=document.getElementById('el-nombre').value.trim();
    if(!nombre){sN('El nombre es requerido',true);return;}
    if(!tramos.length){sN('Agregá al menos un tramo',true);return;}
    const listas=getListasPrecios();
    if(esNueva){
      const newId=newListaId();
      listas.push({id:newId,nombre,tramos:tramos.map(t=>({...t}))});
    } else {
      const idx=listas.findIndex(l=>l.id===lid);
      if(idx>=0)listas[idx]={id:lid,nombre,tramos:tramos.map(t=>({...t}))};
    }
    saveListasPrecios(listas);
    // Sincronizar tramos a productos que usan esta lista
    if(!esNueva){
      const prods=window.getProductos?.()||[];
      prods.forEach(p=>{if(p.listaPrecioId===lid){p.tramos=tramos.map(t=>({...t}));}});
      window.saveProductos?.(prods);window.loadConfig?.();window.buildTicketUI?.();window.upd?.();
    }
    window.clM?.();renderListasPrecios();renderAsignacionPrecios();sN('✓ Lista '+(esNueva?'creada':'actualizada'));
  };
  document.getElementById('modal').classList.add('open');
}

function eliminarLista(lid){
  const prods=(window.getProductos?.()||[]).filter(p=>p.listaPrecioId===lid);
  if(prods.length){
    if(!confirm('Esta lista está asignada a: '+prods.map(p=>p.nombre).join(', ')+'. ¿Eliminar igual? Los productos quedarán sin lista.'))return;
    const todos=window.getProductos?.()||[];todos.forEach(p=>{if(p.listaPrecioId===lid)p.listaPrecioId=null;});
    window.saveProductos?.(todos);
  } else {
    if(!confirm('¿Eliminar la lista de precios?'))return;
  }
  const listas=getListasPrecios().filter(l=>l.id!==lid);
  saveListasPrecios(listas);
  renderListasPrecios();renderAsignacionPrecios();sN('Lista eliminada');
}

// ── renderInvPrecios mantiene compatibilidad (ya no se usa en sub-stock) ──
function renderInvPrecios(){renderListasPrecios();}


// ===== modules/productos.js =====

// ── PRODUCT CATALOG ──
function getProductos(){
  const d=ld();
  let prods;
  if(d.productos&&Array.isArray(d.productos)&&d.productos.length){
    prods=d.productos;
  } else {
    prods=DEFAULT_PRODUCTS.map(p=>JSON.parse(JSON.stringify(p)));
  }
  // Migración: si hay un producto 'p-past' tipo grupo, expandirlo en individuales
  const pastIdx=prods.findIndex(p=>p.id==='p-past'&&p.agrupacion==='grupo');
  if(pastIdx>=0){
    const past=prods[pastIdx];
    const individuales=[
      {id:'v-cal',emoji:'💀',nombre:'Calaveras',unit:'ud',costo:past.costo||5075,tipo:'tramos',listaPrecioId:'lp-past',tramos:(past.tramos||DPT).map(x=>({...x})),activo:true,legacyKey:'calaveras'},
      {id:'v-ted',emoji:'🧸',nombre:'Teddy',unit:'ud',costo:past.costo||5075,tipo:'tramos',listaPrecioId:'lp-past',tramos:(past.tramos||DPT).map(x=>({...x})),activo:true,legacyKey:'teddy'},
      {id:'v-lck',emoji:'🐱',nombre:'Lucky Cat',unit:'ud',costo:past.costo||5075,tipo:'tramos',listaPrecioId:'lp-past',tramos:(past.tramos||DPT).map(x=>({...x})),activo:true,legacyKey:'lucky'},
      {id:'v-gen',emoji:'💊',nombre:'Genéricas',unit:'ud',costo:past.costo||5075,tipo:'tramos',listaPrecioId:'lp-past',tramos:(past.tramos||DPT).map(x=>({...x})),activo:true,legacyKey:'genericas'},
    ];
    prods.splice(pastIdx,1,...individuales);
    saveProductos(prods);
  }
  return prods;
}

function saveProductos(prods){const d=ld();d.productos=prods;sd(d);}

function updateClientesDatalist(){
  const d=ld();
  const orders=d.orders||[];
  const clientesSet=new Set();
  orders.forEach(o=>{if(o.cliente&&o.cliente.trim())clientesSet.add(o.cliente.trim());});
  const sorted=Array.from(clientesSet).sort();
  const dl=document.getElementById('clientes-list');
  if(dl)dl.innerHTML=sorted.map(c=>`<option value="${c}">`).join('');
}

// ── PRODUCT MANAGER ──
function renderPM(){
  const prods=getProductos();
  const cont=document.getElementById('pmList2')||document.getElementById('pmList');if(!cont)return;
  if(!prods.length){cont.innerHTML='<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:20px">Sin productos</div>';return;}
  let html='';
  prods.forEach(p=>{
    const inact=!p.activo;
    const tipoLabel=p.tipo==='fijo'?`<span class="pm-badge pm-fijo">PRECIO FIJO</span>`:`<span class="pm-badge pm-tramo">TRAMOS ×${(p.tramos||[]).length}</span>`;
    const costoLabel=p.costo!=null?`Costo: ${fv(p.costo)}/${p.unit}`:'Sin costo definido';
    const inactLabel=inact?`<span class="pm-badge" style="background:rgba(255,68,85,.12);color:var(--er);border:1px solid rgba(255,68,85,.2)">INACTIVO</span>`:'';
    const tramos=getTramosProducto(p);
    const basePrice=tramos[0]?.p||0;
    html+=`<div class="pm-card${inact?' inactive':''}">
      <div class="pm-accent-bar"></div>
      <div class="pm-card-top">
        <div class="pm-emoji">${p.emoji}</div>
        <div class="pm-info">
          <div class="pm-name">${p.nombre}</div>
          <div class="pm-meta">${costoLabel} · ${p.unit}${basePrice?` · Precio base: ${fv(basePrice)}`:''}</div>
          <div class="pm-badges">${tipoLabel} ${inactLabel}</div>
        </div>
        <div class="pm-actions">
          <button class="pm-btn" onclick="duplicarProducto('${p.id}')" title="Duplicar">🔁 Dup.</button>
          <button class="pm-btn" onclick="editarProducto('${p.id}')">✏️ Editar</button>
          <button class="pm-btn del" onclick="toggleActivoProducto('${p.id}')">${inact?'✓ Activar':'⊘ Desact.'}</button>
        </div>
      </div>
      ${p.tipo==='tramos'?`
      <button onclick="toggleTramoEditor('${p.id}')" style="width:100%;background:var(--s2);border:none;border-top:1px solid var(--br);color:var(--ac2);font-family:var(--mo);font-size:9px;padding:8px 14px;cursor:pointer;text-align:left;letter-spacing:.8px;transition:background .15s" onmouseover="this.style.background='var(--s3)'" onmouseout="this.style.background='var(--s2)'">▸ EDITAR TRAMOS DE PRECIO</button>
      <div class="tramo-editor" style="display:none" id="te-${p.id}">
        <div class="tramo-editor-hdr">
          <div class="tramo-editor-title">📋 Lista de precios</div>
          <div class="pct-controls">
            <span class="pct-label">Ajuste global:</span>
            <div class="pct-wrap"><input type="number" id="pct-${p.id}" value="5" min="1" max="99"><span>%</span></div>
            <button class="pct-btn up" onclick="aplicarPctTodos('${p.id}',+1)">▲ Subir</button>
            <button class="pct-btn down" onclick="aplicarPctTodos('${p.id}',-1)">▼ Bajar</button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:55px 1fr 60px 28px 28px 28px;gap:4px;padding:0 0 6px;border-bottom:1px solid var(--br);margin-bottom:6px">
          <div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:2px 4px">DESDE</div>
          <div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:2px 4px">PRECIO</div>
          <div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;text-align:center">DESC%</div>
          <div></div><div></div><div></div>
        </div>
        ${renderTramoRows(p)}
        <div class="tramo-actions">
          <button class="btn btn-p" style="font-size:9px;height:36px;padding:0 12px" onclick="agregarTramo('${p.id}')">+ Tramo</button>
          <button class="btn btn-s" style="font-size:9px;height:36px;padding:0 12px" onclick="guardarTramos('${p.id}')">💾 Guardar</button>
          <button class="btn btn-d" style="font-size:9px;height:36px;padding:0 12px" onclick="restablecerTramos('${p.id}')">↺ Restablecer</button>
        </div>
      </div>`:''}
    </div>`;
  });
  cont.innerHTML=html;
}

function aplicarPctTodos(pid,dir){
  const pctEl=document.getElementById('pct-'+pid);
  const pct=Math.max(0.1,parseFloat(pctEl?.value)||5);
  let i=0;let count=0;
  while(document.getElementById(`trow-${pid}-${i}`)){
    const priceEl=document.getElementById(`tp-${pid}-${i}`);
    if(priceEl){
      const cur=parseFloat(priceEl.value)||0;
      if(cur>0){
        const nuevo=dir>0?Math.round(cur*(1+pct/100)):Math.round(cur*(1-pct/100));
        priceEl.value=Math.max(1,nuevo);
        count++;
      }
    }
    i++;
  }
  updTramoDisc(pid);
  const sign=dir>0?'↑':'↓';
  sN(`${sign} ${pct}% aplicado a ${count} tramos`);
}

function restablecerTramos(pid){
  if(!confirm('¿Restaurar precios originales de este producto desde el catálogo base?'))return;
  const defProds=[
    {id:'v-cal',tramos:DPT},{id:'v-ted',tramos:DPT},{id:'v-lck',tramos:DPT},{id:'v-gen',tramos:DPT},
    {id:'p-cris',tramos:DCT},{id:'p-hong',tramos:DHT},
    {id:'p-got',tramos:[{t:1,p:DGP}]},{id:'p-pet',tramos:[{t:1,p:DPP}]}
  ];
  const def=defProds.find(x=>x.id===pid);
  if(!def){sN('No hay precios default para este producto',true);return;}
  const prods=getProductos();const p=prods.find(x=>x.id===pid);if(!p)return;
  p.tramos=def.tramos.map(x=>({...x}));
  saveProductos(prods);window.loadConfig?.();window.buildTicketUI?.();window.upd?.();window.renderInventarioTabla?.();
  setTimeout(()=>{const te=document.getElementById('te-'+pid);if(te)te.style.display='block';},80);
  sN(`✓ Precios de ${p.nombre} restablecidos`);
}

function renderTramoRows(p){
  const base=p.tramos[0]?.p||1;
  let h='';
  p.tramos.forEach((t,i)=>{
    const disc=i===0?0:base>0?parseFloat(((1-t.p/base)*100).toFixed(1)):0;
    const discTxt=i===0?'—':'-'+disc.toFixed(1)+'%';
    const discColor=i===0?'var(--tx3)':disc>20?'#ff6b35':disc>10?'#ffaa00':'var(--ac)';
    const pmBtns=i===0?'<div></div><div></div>':`
      <button class="qb minus" style="width:28px;height:28px;font-size:14px;flex-shrink:0" onclick="adjTramoDisc('${p.id}',${i},-1)" title="-1%">−</button>
      <button class="qb plus" style="width:28px;height:28px;font-size:14px;flex-shrink:0" onclick="adjTramoDisc('${p.id}',${i},+1)" title="+1%">+</button>`;
    h+=`<div style="display:grid;grid-template-columns:55px 1fr 60px 28px 28px 28px;gap:4px;align-items:center;margin-bottom:5px" id="trow-${p.id}-${i}">
      <input type="number" id="tq-${p.id}-${i}" value="${t.t}" placeholder="Desde" min="1" style="min-height:34px;padding:4px 7px;font-size:11px" oninput="updTramoDisc('${p.id}')">
      <input type="number" id="tp-${p.id}-${i}" value="${t.p}" placeholder="Precio" min="0" style="min-height:34px;padding:4px 7px;font-size:11px;font-weight:700" oninput="updTramoDisc('${p.id}')">
      <div class="tramo-disc" id="td-${p.id}-${i}" style="text-align:center;font-weight:700;color:${discColor}">${discTxt}</div>
      ${pmBtns}
      ${i===0?'<div></div>':`<button class="qrst" onclick="eliminarTramo('${p.id}',${i})">×</button>`}
    </div>`;
  });
  return h;
}

function toggleTramoEditor(pid){
  const el=document.getElementById('te-'+pid);
  if(!el)return;
  el.style.display=el.style.display==='block'?'none':'block';
}

function updTramoDisc(pid){
  const base=parseFloat(document.getElementById(`tp-${pid}-0`)?.value)||1;
  let i=0;
  while(document.getElementById(`trow-${pid}-${i}`)){
    const del=document.getElementById(`td-${pid}-${i}`);
    const np=parseFloat(document.getElementById(`tp-${pid}-${i}`)?.value)||0;
    if(del)del.textContent=i===0?'—':base>0?'-'+((1-np/base)*100).toFixed(1)+'%':'—';
    i++;
  }
}

// Adjust tramo price by ±1% discount relative to base price
function adjTramoDisc(pid,idx,delta){
  const baseEl=document.getElementById(`tp-${pid}-0`);
  const priceEl=document.getElementById(`tp-${pid}-${idx}`);
  const discEl=document.getElementById(`td-${pid}-${idx}`);
  if(!baseEl||!priceEl||!discEl)return;
  const base=parseFloat(baseEl.value)||0;
  if(base<=0)return;
  const curPrice=parseFloat(priceEl.value)||0;
  const curDisc=(1-curPrice/base)*100;
  const newDisc=Math.max(0,Math.min(99,parseFloat((curDisc-delta).toFixed(1)))); // delta=-1 means +1% discount
  const newPrice=Math.round(base*(1-newDisc/100));
  priceEl.value=newPrice;
  discEl.textContent='-'+newDisc.toFixed(1)+'%';
}

function agregarTramo(pid){
  const prods=getProductos();const p=prods.find(x=>x.id===pid);if(!p)return;
  const last=p.tramos[p.tramos.length-1];
  p.tramos.push({t:(last?.t||0)+10,p:Math.round((last?.p||0)*0.9)});
  saveProductos(prods);window.loadConfig?.();window.renderInventarioTabla?.();
  setTimeout(()=>{document.getElementById('te-'+pid).style.display='block';},50);
}

function eliminarTramo(pid,idx){
  const prods=getProductos();const p=prods.find(x=>x.id===pid);if(!p||p.tramos.length<=1)return;
  p.tramos.splice(idx,1);saveProductos(prods);window.loadConfig?.();window.renderInventarioTabla?.();
  setTimeout(()=>{document.getElementById('te-'+pid).style.display='block';},50);
}

function guardarTramos(pid){
  const prods=getProductos();const p=prods.find(x=>x.id===pid);if(!p)return;
  const newTramos=[];
  p.tramos.forEach((_,i)=>{
    const tEl=document.getElementById(`tq-${pid}-${i}`);
    const pEl=document.getElementById(`tp-${pid}-${i}`);
    if(!tEl||!pEl)return;
    newTramos.push({t:parseFloat(tEl.value)||1,p:parseFloat(pEl.value)||0});
  });
  newTramos.sort((a,b)=>a.t-b.t);
  p.tramos=newTramos;
  saveProductos(prods);window.loadConfig?.();window.buildTicketUI?.();window.upd?.();window.renderInventarioTabla?.();
  sN(`✓ Tramos de ${p.nombre} guardados`);window.renderInventarioTabla?.();
  setTimeout(()=>{const el=document.getElementById('te-'+pid);if(el)el.style.display='block';},50);
}

function toggleActivoProducto(pid){
  const prods=getProductos();const p=prods.find(x=>x.id===pid);if(!p)return;
  p.activo=!p.activo;
  saveProductos(prods);window.loadConfig?.();window.buildTicketUI?.();window.upd?.();window.renderInventarioTabla?.();
  sN(`${p.nombre} ${p.activo?'reactivado':'desactivado'}`);
}

function duplicarProducto(pid){
  const prods=getProductos();const orig=prods.find(x=>x.id===pid);if(!orig)return;
  const copia=JSON.parse(JSON.stringify(orig));
  const nuevoId=uid();
  copia.id=nuevoId;
  copia.nombre=orig.nombre+' (copia)';
  copia.activo=true;
  delete copia.legacyKey;
  prods.push(copia);
  saveProductos(prods);
  window.loadConfig?.();window.buildTicketUI?.();window.upd?.();window.renderInventarioTabla?.();
  sN(`✓ ${orig.nombre} duplicado`);
  setTimeout(()=>editarProducto(nuevoId),80);
}

// ── PRODUCT EDITOR MODAL ──
let _editProdId=null;
let _editTramos=[];
let _editVariantes=[];

function abrirNuevoProducto(){
  _editProdId=null;
  _editTramos=[{t:1,p:0}];
  openProdModal({id:null,emoji:'📦',nombre:'',unit:'ud',costo:0,tipo:'fijo',tramos:[{t:1,p:0}],activo:true});
}

function editarProducto(pid){
  const prods=getProductos();const p=prods.find(x=>x.id===pid);if(!p)return;
  _editProdId=pid;
  _editTramos=JSON.parse(JSON.stringify(p.tramos||[{t:1,p:0}]));
  openProdModal(p);
}

function openProdModal(p){
  document.getElementById('mTitEl').textContent=p.id?`✏ Editar — ${p.nombre}`:'➕ Nuevo Producto';
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal';
  document.getElementById('mTk').style.display='none';
  document.getElementById('mBody').innerHTML=buildProdModalHTML(p);
  document.getElementById('mFooter').innerHTML=`<button class="btn btn-p" onclick="guardarProductoModal()">💾 Guardar</button><button class="btn btn-s" onclick="clM()">✕ Cancelar</button>`;
  document.getElementById('modal').classList.add('open');
  syncProdModalUI();
}

function toggleStockGroup(pid){
  const el=document.getElementById(`sk-grp-vars-${pid}`);if(!el)return;
  const isHidden=el.style.display==='none';
  el.style.display=isHidden?'flex':'none';
  const sub=document.getElementById(`sg-sub-${pid}`);
  if(sub){
    const p=getProductos().find(x=>x.id===pid);
    sub.innerHTML=isHidden?`suma variantes · ${p.unit||'ud'} · <span style="color:var(--er)">▾ colapsar</span>` : `suma variantes · ${p.unit||'ud'} · <span style="color:var(--ac2)">▸ expandir</span>`;
  }
}

function buildProdModalHTML(p){
  const IS='width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:9px 11px;outline:none;min-height:44px';
  const LB='font-family:var(--mo);font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:5px;text-transform:uppercase';
  const listas=getListasPrecios();
  let listaOpts='<option value="">— Sin lista (tramos propios) —</option>';
  listas.forEach(l=>{listaOpts+=`<option value="${l.id}"${p.listaPrecioId===l.id?' selected':''}>${l.nombre}</option>`;});
  listaOpts+='<option value="__nueva">✚ Crear nueva lista en 💲 Lista de Precios</option>';
  const usaLista=!!(p.listaPrecioId&&listas.find(l=>l.id===p.listaPrecioId));
  const modoFijo=!usaLista&&p.tipo==='fijo';
  const modoTramos=!usaLista&&p.tipo!=='fijo';
  return`<div style="display:flex;flex-direction:column;gap:12px">
  <div style="display:grid;grid-template-columns:64px 1fr;gap:10px">
    <div><label style="${LB}">Emoji</label><input type="text" id="pm-emoji" value="${p.emoji||'📦'}" style="${IS};font-size:22px;text-align:center;padding:6px"></div>
    <div><label style="${LB}">Nombre</label><input type="text" id="pm-nombre" value="${p.nombre||''}" placeholder="Nombre del producto" style="${IS}"></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <div><label style="${LB}">Costo de adquisición (ARS)</label><input type="number" id="pm-costo" value="${p.costo||0}" placeholder="0" min="0" style="${IS}"></div>
    <div><label style="${LB}">Unidad</label><select id="pm-unit" style="${IS}"><option value="ud"${p.unit==='ud'?' selected':''}>Unidades (ud)</option><option value="g"${p.unit==='g'?' selected':''}>Gramos (g)</option></select></div>
  </div>
  <div>
    <label style="${LB}">Lista de precios asignada</label>
    <select id="pm-lista-id" style="${IS}" onchange="onPmListaChange()">
      ${listaOpts}
    </select>
    <div style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin-top:4px">Podés crear y editar listas en la pestaña 💲 Lista de Precios</div>
  </div>
  <div id="pm-precio-modo" style="display:${usaLista?'none':'block'}">
    <label style="${LB}">Precio propio del producto</label>
    <div class="tipo-selector" style="margin-bottom:10px">
      <button type="button" class="tipo-btn${modoFijo?' active':''}" id="tb-fijo" onclick="setProdTipo('fijo')">Precio fijo</button>
      <button type="button" class="tipo-btn${modoTramos?' active-pur':''}" id="tb-tram" onclick="setProdTipo('tramos')">Por tramos</button>
    </div>
    <div id="pm-tramos-wrap" style="display:${modoTramos?'block':'none'}">
      <div style="display:grid;grid-template-columns:70px 1fr 70px 28px;gap:6px;margin-bottom:4px">
        <span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">DESDE</span>
        <span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">PRECIO</span>
        <span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">DESC.</span>
        <span></span>
      </div>
      <div id="pm-tramos-list">${renderTramosEditor()}</div>
      <button type="button" class="btn btn-s" style="font-size:9px;height:34px;margin-top:6px" onclick="addTramoEditor()">+ Tramo</button>
    </div>
    <div id="pm-fijo-wrap" style="display:${modoFijo?'block':'none'}">
      <label style="${LB}">Precio único</label>
      <input type="number" id="pm-precio-fijo" value="${(p.tramos||[])[0]?.p||0}" placeholder="0" min="0" style="${IS}">
    </div>
  </div>
  ${p.id?`<div style="font-family:var(--mo);font-size:8px;color:var(--tx3)">ID: <b style="color:var(--ac2)">${p.id}</b></div>`:''}
</div>`;
}

function onPmListaChange(){
  const val=document.getElementById('pm-lista-id')?.value;
  if(val==='__nueva'){
    document.getElementById('pm-lista-id').value='';
    sN('Creá la lista en 💲 Lista de Precios y volvé a asignarla acá');
    return;
  }
  document.getElementById('pm-precio-modo').style.display=val?'none':'block';
}

function renderTramosEditor(){
  return _editTramos.map((t,i)=>{
    const base=_editTramos[0]?.p||1;
    const disc=i===0?'—':base>0?'-'+((1-t.p/base)*100).toFixed(1)+'%':'—';
    return`<div class="tramo-row" id="etrow-${i}">
      <input type="number" id="etq-${i}" value="${t.t}" placeholder="Desde" min="1" oninput="updModalDiscs()">
      <input type="number" id="etp-${i}" value="${t.p}" placeholder="Precio" min="0" oninput="updModalDiscs()">
      <div class="tramo-disc" id="etd-${i}">${disc}</div>
      ${i===0?'<div></div>':`<button class="qrst" onclick="removeTramoEditor(${i})">×</button>`}
    </div>`;
  }).join('');
}

function renderVariantesEditor(){
  return _editVariantes.map((v,i)=>`<div class="variante-row" id="evrow-${i}">
    <input type="text" id="evemoji-${i}" value="${v.emoji||'📦'}" style="font-size:14px;text-align:center">
    <input type="text" id="evname-${i}" value="${v.nombre||''}" placeholder="Nombre">
    <button class="qrst" onclick="removeVarianteEditor(${i})">×</button>
  </div>`).join('');
}

function setProdTipo(t){
  document.getElementById('pm-tramos-wrap').style.display=t==='tramos'?'block':'none';
  document.getElementById('pm-fijo-wrap').style.display=t==='fijo'?'block':'none';
  document.getElementById('tb-fijo').className='tipo-btn'+(t==='fijo'?' active':'');
  document.getElementById('tb-tram').className='tipo-btn'+(t==='tramos'?' active-pur':'');
}
function setProdAgrup(a){
  document.getElementById('pm-variantes-wrap').style.display=a==='grupo'?'block':'none';
  document.getElementById('tb-ind').className='tipo-btn'+(a==='individual'?' active':'');
  document.getElementById('tb-grp').className='tipo-btn'+(a==='grupo'?' active-pur':'');
}
function syncProdModalUI(){}

function addTramoEditor(){
  const last=_editTramos[_editTramos.length-1];
  _editTramos.push({t:(last?.t||0)+10,p:Math.round((last?.p||0)*0.9)});
  document.getElementById('pm-tramos-list').innerHTML=renderTramosEditor();
}
function removeTramoEditor(i){
  if(_editTramos.length<=1)return;
  _editTramos.splice(i,1);
  document.getElementById('pm-tramos-list').innerHTML=renderTramosEditor();
}
function addVarianteEditor(){
  _editVariantes.push({id:uid(),emoji:'📦',nombre:''});
  document.getElementById('pm-variantes').innerHTML=renderVariantesEditor();
}
function removeVarianteEditor(i){
  _editVariantes.splice(i,1);
  document.getElementById('pm-variantes').innerHTML=renderVariantesEditor();
}
function updModalDiscs(){
  const base=parseFloat(document.getElementById('etp-0')?.value)||1;
  _editTramos.forEach((_,i)=>{
    const np=parseFloat(document.getElementById(`etp-${i}`)?.value)||0;
    const del=document.getElementById(`etd-${i}`);
    if(del)del.textContent=i===0?'—':base>0?'-'+((1-np/base)*100).toFixed(1)+'%':'—';
  });
}

function guardarProductoModal(){
  const emoji=document.getElementById('pm-emoji')?.value.trim()||'📦';
  const nombre=document.getElementById('pm-nombre')?.value.trim();
  const costo=parseFloat(document.getElementById('pm-costo')?.value)||0;
  const unit=document.getElementById('pm-unit')?.value||'ud';
  if(!nombre){sN('ERROR: Nombre requerido',true);return;}
  const listaPrecioId=document.getElementById('pm-lista-id')?.value||null;
  const usaLista=listaPrecioId&&listaPrecioId!=='__nueva';
  const tipoFijo=document.getElementById('tb-fijo')?.classList.contains('active');
  const tipo=tipoFijo?'fijo':'tramos';
  let tramos;
  if(usaLista){
    // tramos se derivan de la lista — guardamos los de la lista como copia
    const lista=getListasPrecios().find(l=>l.id===listaPrecioId);
    tramos=lista?lista.tramos.map(t=>({...t})):[{t:1,p:0}];
  } else if(tipo==='fijo'){
    const pf=parseFloat(document.getElementById('pm-precio-fijo')?.value)||0;
    tramos=[{t:1,p:pf}];
  } else {
    tramos=_editTramos.map((_,i)=>({t:parseFloat(document.getElementById(`etq-${i}`)?.value)||1,p:parseFloat(document.getElementById(`etp-${i}`)?.value)||0}));
    tramos.sort((a,b)=>a.t-b.t);
  }
  const prods=getProductos();
  if(_editProdId){
    const idx=prods.findIndex(x=>x.id===_editProdId);if(idx<0)return;
    prods[idx]={...prods[idx],emoji,nombre,costo,unit,tipo,tramos,listaPrecioId:usaLista?listaPrecioId:null};
  } else {
    prods.push({id:uid(),emoji,nombre,costo,unit,tipo,tramos,listaPrecioId:usaLista?listaPrecioId:null,activo:true});
  }
  saveProductos(prods);window.loadConfig?.();window.buildTicketUI?.();window.upd?.();
  window.renderProductosRegistrados?.();window.renderInvStock?.();window.renderSettings?.();window.clM?.();
  sN(`✓ ${nombre} guardado`);
}

// ── TABLA MAESTRA (legacy settings) ──
function renderMaestra(){
  const prods=getProductos();
  const cont=document.getElementById('maestraTable');
  if(!cont)return;
  if(!prods.length){cont.innerHTML='<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);padding:20px;text-align:center">Sin productos.</div>';return;}
  const IS=`style="background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:10px;padding:4px 6px;min-height:30px;outline:none;border-radius:0;-webkit-appearance:none;width:88px;text-align:right"`;
  const TH=`style="padding:7px 10px;text-align:left;border-bottom:2px solid var(--br);font-family:var(--mo);font-size:7px;letter-spacing:1px;white-space:nowrap"`;
  let html=`<table style="width:100%;border-collapse:collapse;font-size:9px">
  <thead style="background:var(--s3)"><tr>
    <th ${TH} style="color:var(--ac)">PRODUCTO</th>
    <th ${TH} style="color:var(--ac);text-align:center">ESTADO</th>
    <th ${TH} style="color:var(--ac);text-align:right">STOCK</th>
    <th ${TH} style="color:var(--ac2);text-align:right">PRECIO BASE</th>
    <th ${TH} style="color:var(--er);text-align:right">COSTO/ud</th>
    <th ${TH} style="color:var(--tx3)">ACCIONES</th>
  </tr></thead><tbody>`;
  prods.forEach(p=>{
    const inact=!p.activo;const op=inact?'opacity:.45':'';
    const tramos=getTramosProducto(p);
    const baseP=tramos[0]?.p||0;
    const TD=`style="padding:7px 10px;border-bottom:1px solid rgba(42,42,58,.3);vertical-align:middle;${op}"`;
    const qty=getActualQty(p.id);const st=getStockStatus(qty,p.id);
    const dot=`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;background:${st==='ok'?'#00e5a0':st==='warn'?'#ffaa00':'#ff4455'}"></span>`;
    html+=`<tr style="${op}">
      <td ${TD}>${p.emoji} ${p.nombre} <span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">(${p.unit})</span></td>
      <td ${TD} style="text-align:center">${dot}<span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">${st.toUpperCase()}</span></td>
      <td ${TD} style="text-align:right"><input type="number" ${IS} id="ms-${p.id}" value="${qty}"></td>
      <td ${TD} style="text-align:right"><input type="number" ${IS} id="mp-${p.id}" value="${baseP}"></td>
      <td ${TD} style="text-align:right"><input type="number" ${IS} id="mc-${p.id}" value="${p.costo||0}"></td>
      <td ${TD}>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${p.tipo==='tramos'?`<button class="pm-btn" style="font-size:8px;padding:3px 7px" onclick="abrirTramosEnMaestra('${p.id}')">▸ Tramos</button>`:''}
          <button class="pm-btn" style="font-size:8px;padding:3px 7px" onclick="editarProducto('${p.id}')">✏</button>
          <button class="pm-btn del" style="font-size:8px;padding:3px 7px" onclick="toggleActivoProducto('${p.id}')">${inact?'✓':'⊘'}</button>
        </div>
      </td>
    </tr>`;
  });
  html+='</tbody></table>';
  cont.innerHTML=html;
}

function abrirTramosEnMaestra(pid){
  const p=getProductos().find(x=>x.id===pid);if(!p)return;
  const wrap=document.getElementById('maestraTramoWrap');
  const card=document.getElementById('maestraTramoCard');
  if(!wrap||!card)return;
  wrap.style.display='block';
  wrap.scrollIntoView({behavior:'smooth'});
  card.innerHTML=`
    <div class="ct">${p.emoji} ${p.nombre} — Tramos</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap;background:var(--s2);padding:10px;border:1px solid var(--br)">
      <span style="font-family:var(--mo);font-size:8px;color:var(--tx3);letter-spacing:.8px">AJUSTE GLOBAL:</span>
      <div style="display:flex;border:1px solid var(--br);overflow:hidden;flex-shrink:0">
        <input type="number" id="pct-${p.id}" value="5" min="1" max="99" style="width:46px;min-height:32px;text-align:center;font-family:var(--mo);font-size:12px;font-weight:700;background:var(--bg);border:none;color:var(--tx);outline:none;padding:0">
        <span style="font-family:var(--mo);font-size:10px;color:var(--tx3);padding:0 6px;background:var(--s2);display:flex;align-items:center">%</span>
      </div>
      <button class="pm-btn" style="color:#00e5a0;border-color:rgba(0,229,160,.4);padding:5px 12px" onclick="aplicarPctTodos('${p.id}',+1)">▲ Subir</button>
      <button class="pm-btn" style="color:#ff4455;border-color:rgba(255,68,85,.4);padding:5px 12px" onclick="aplicarPctTodos('${p.id}',-1)">▼ Bajar</button>
      <button class="pm-btn" style="color:var(--wn);border-color:rgba(255,170,0,.4);padding:5px 12px" onclick="restablecerTramos('${p.id}')">↺ Restablecer</button>
    </div>
    <div style="display:grid;grid-template-columns:55px 1fr 60px 28px 28px 28px;gap:4px;padding:0 0 6px;border-bottom:1px solid var(--br);margin-bottom:6px">
      <div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:2px 4px">DESDE</div>
      <div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:2px 4px">PRECIO</div>
      <div style="font-family:var(--mo);font-size:7px;color:var(--tx3);text-align:center">DESC%</div>
      <div></div><div></div><div></div>
    </div>
    ${renderTramoRows(p)}
    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
      <button class="btn btn-p" style="font-size:9px;height:36px;padding:0 12px" onclick="agregarTramo('${p.id}')">+ Tramo</button>
      <button class="btn btn-p" style="font-size:9px;height:36px;padding:0 12px" onclick="guardarTramosYCerrar('${p.id}')">💾 Guardar</button>
      <button class="btn btn-s" style="font-size:9px;height:36px;padding:0 12px" onclick="document.getElementById('maestraTramoWrap').style.display='none'">✕ Cancelar</button>
    </div>`;
}

function guardarTramosYCerrar(pid){
  guardarTramos(pid);
  document.getElementById('maestraTramoWrap').style.display='none';
  window.renderInventarioTabla?.();
}

function guardarMaestra(){
  const prods=getProductos();let changed=false;
  prods.forEach(p=>{
    const pEl=document.getElementById('mp-'+p.id);const cEl=document.getElementById('mc-'+p.id);
    if(pEl&&p.tramos?.length){const nP=parseFloat(pEl.value)||p.tramos[0].p;if(nP!==p.tramos[0].p){p.tramos[0].p=nP;changed=true;}}
    if(cEl){const nC=parseFloat(cEl.value)||0;if(nC!==p.costo){p.costo=nC;changed=true;}}
  });
  if(changed){saveProductos(prods);window.loadConfig?.();window.buildTicketUI?.();window.upd?.();}
  const msg=document.getElementById('invSaveMsg');
  if(msg){msg.textContent='✓ Guardado';setTimeout(()=>msg.textContent='',2500);}
  sN('✓ Maestra guardada');window.renderInventarioTabla?.();
}


// ===== modules/price-manager.js =====

// ── LOG STORAGE ──
function getPriceLog(){
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
function validarAjuste(scope,pct){
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
function previewAjuste(scope,pct){
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
function applyPriceAdjustment(scope,pct,motivo){
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
const CALC_KEY='me_gh_calc_last';

// Maps MotorEdge product IDs to precios.json keys
const CALC_MAP={
  'v-cal':'pastillas',
  'p-cris':'cristales',
  'p-hong':'hongos',
  'p-got':'goteros',
  'p-pet':'petri'
};

function buildPreciosJson(){
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

async function ghSyncCalc(){
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
      renderSyncBanner(); // refresh status
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
      <div style="font-family:var(--mo);font-size:8px;color:var(--tx3)">${last?'Última sync: '+last+' · precios.json · '+CALC_REPO:'Sin sync registrada en este dispositivo'}</div>
    </div>
    <button id="btn-sync-calc" class="btn btn-s" style="font-size:9px;height:32px;white-space:nowrap" onclick="ghSyncCalc()">↑ SINCRONIZAR CALCULADORA</button>
  </div>`;
}

function renderPriceAdjust(){
  const cont=document.getElementById('inv-sub-price-adjust');if(!cont)return;
  const listas=getListasPrecios();
  const IS='background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:11px;padding:7px 10px;outline:none';
  const LB='font-family:var(--mo);font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase';

  let optsScope='<option value="all">▸ Todas las listas</option>';
  listas.forEach(l=>{optsScope+=`<option value="${l.id}">${l.nombre}</option>`;});

  cont.innerHTML=`<div id="price-sync-banner"></div>
  <div style="background:var(--s1);border:1px solid var(--br);padding:14px;margin-bottom:12px">
    <div style="font-family:var(--mo);font-size:9px;letter-spacing:1px;color:var(--ac);text-transform:uppercase;margin-bottom:12px">🎚 Ajustar precios en bulk</div>
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
  <div id="pa-preview-wrap" style="display:none"></div>`;

  renderSyncBanner();
}

function renderPricePreview(){
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

function applyPriceFromUI(){
  const scope=document.getElementById('pa-scope')?.value||'all';
  const rawPct=parseFloat(document.getElementById('pa-pct')?.value||'0');
  const tipo=parseInt(document.getElementById('pa-tipo')?.value||'1');
  const pct=rawPct*tipo;
  const motivo=(document.getElementById('pa-motivo')?.value||'').trim();
  if(Math.abs(pct)>50&&!confirm(`Vas a aplicar un ajuste de ${pct>0?'+':''}${pct}%. ¿Confirmar?`))return;
  const res=applyPriceAdjustment(scope,pct,motivo);
  if(res.ok){
    // Reset preview and motivo
    const wrap=document.getElementById('pa-preview-wrap');if(wrap)wrap.style.display='none';
    const mEl=document.getElementById('pa-motivo');if(mEl)mEl.value='';
    renderPriceLog(); // refresh historial tab if open
  }
}

function renderPriceLog(){
  const cont=document.getElementById('inv-sub-price-log');if(!cont)return;
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

function togglePriceLogEntry(idx){
  const el=document.getElementById('ple-'+idx);
  if(el)el.style.display=el.style.display==='none'?'':'none';
}


// ===== modules/egresos.js =====

function sE(e){const d=ld();if(!d.egresos)d.egresos=[];d.egresos.push(e);sd(d);ghAutoPush();}

function updEgreso(){
  const monto=parseFloat(document.getElementById('e-monto').value)||0;const cuotas=Math.max(1,parseInt(document.getElementById('e-cuotas').value)||1);
  const prev=document.getElementById('e-preview');if(monto<=0){prev.style.display='none';return;}
  const base=trunc(monto/cuotas),ultima=monto-(base*(cuotas-1));prev.style.display='block';
  if(cuotas===1)prev.innerHTML=`<span style="color:var(--er)">💰 Impacto en caja: -${fv(monto)}</span><br><span style="color:var(--tx3)">Pago único</span>`;
  else prev.innerHTML=`<span style="color:var(--tx2)">Cuota base: ${fv(base)} × ${cuotas-1} cuotas</span><br><span style="color:var(--tx2)">Última cuota: ${fv(ultima)}</span><br><span style="color:var(--er)">💰 Impacto período actual: -${fv(base)}</span><br><span style="color:var(--tx3)">Cuotas restantes: ${cuotas-1}</span>`;
}

function generarEgreso(){
  const fecha=document.getElementById('e-fecha').value,concepto=document.getElementById('e-concepto').value.trim();
  const monto=parseFloat(document.getElementById('e-monto').value)||0;const medio=document.getElementById('e-medio').value;
  const cuotasN=Math.max(1,parseInt(document.getElementById('e-cuotas').value)||1);const obs=document.getElementById('e-obs').value.trim();
  if(!fecha){sN('ERROR: Fecha requerida',true);return;}if(!concepto){sN('ERROR: Concepto requerido',true);return;}if(monto<=0){sN('ERROR: Monto requerido',true);return;}
  const mes=d2m(fecha),id=nEId(mes),fd=d2s(fecha);
  const base=trunc(monto/cuotasN),ultima=monto-(base*(cuotasN-1)),impacto=cuotasN===1?monto:base,resta=cuotasN-1,finaliza=addMon(mes,cuotasN-1);
  let tk=`📅 Fecha: ${fd}\nID Egreso: ${id}\n\n📉 Egreso:\nConcepto: ${concepto}\nMonto: ${fv(monto)}\nMedio de pago: ${medio}`;
  if(cuotasN>1)tk+=`\nCuotas: ${cuotasN} (base ${fv(base)}, última ${fv(ultima)})`;
  if(obs)tk+=`\n📝 Observaciones: ${obs}`;
  tk+=`\n\n━━━━━━━━━━━━━━━━━━━━━\n💰 Impacto en caja: -${fv(impacto)}`;
  if(cuotasN>1)tk+=`\nCuotas restantes: ${resta}\nFinaliza: ${finaliza}`;else tk+=`\nFinaliza: ${addMon(mes,0)}`;
  const egreso={id,fecha,fechaDisplay:fd,mesActual:mes,concepto,montoTotal:monto,cuotaBase:base,ultimaCuota:ultima,impactoCaja:impacto,cuotasTotales:cuotasN,cuotasRestantes:resta,finaliza,medio,obs:obs||null,ticketText:tk};
  sE(egreso);window.rfM?.();rEH();rES();window.renderDash?.();document.getElementById('e-tkOut').textContent=tk;document.getElementById('e-outA').style.display='block';document.getElementById('e-outA').scrollIntoView({behavior:'smooth'});sN(`✓ ${id} registrado`);window.uhd?.();
}

function limpiarEgr(){['e-concepto','e-monto','e-obs'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});document.getElementById('e-fecha').value=hoy();document.getElementById('e-cuotas').value='1';document.getElementById('e-preview').style.display='none';document.getElementById('e-outA').style.display='none';}

function limpiarEgresos(){if(!confirm('¿Eliminar TODOS los egresos?'))return;const d=ld();d.egresos=[];sd(d);window.rfM?.();rEH();rES();window.renderDash?.();sN('Egresos eliminados');window.uhd?.();}

function anularEgresoByIdModal(){window.showInputModal?.('🔴 Anular Egreso por ID','ID del egreso (ej: E-202603-0001):',true,'uppercase',function(raw){if(!raw)return;const id=raw.toUpperCase();const e=gE().find(x=>x.id===id);if(!e){sN(`${id} no encontrado`,true);return;}if(!confirm(`¿Anular ${id}?\n${e.concepto} — ${fv(e.montoTotal)}`))return;dE(id);window.rfM?.();rEH();rES();window.renderDash?.();sN(`${id} anulado`);window.uhd?.();window.clM?.();});}

function rEH(){
  const f=document.getElementById('egresosMes').value;
  const desde=document.getElementById('egresosDesde')?.value||'';
  const hasta=document.getElementById('egresosHasta')?.value||'';
  let eg=gE();
  eg.sort((a,b)=>a.fecha<b.fecha?-1:a.fecha>b.fecha?1:a.id.localeCompare(b.id));
  if(f==='rango'){if(desde)eg=eg.filter(e=>e.fecha>=desde);if(hasta)eg=eg.filter(e=>e.fecha<=hasta);}
  else if(f!=='all')eg=eg.filter(e=>e.mesActual===f);
  const c=document.getElementById('eCont');
  if(!eg.length){c.innerHTML=`<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:20px">Sin egresos</div>`;return;}
  const g={};eg.forEach(e=>{if(!g[e.mesActual])g[e.mesActual]=[];g[e.mesActual].push(e);});
  const mesActual=d2m(hoy());
  let html='';
  Object.keys(g).sort().forEach(mes=>{
    const isActual=mes===mesActual;
    const grpTotal=g[mes].reduce((a,e)=>a+(e.montoTotal||0),0);
    const collapseId='egrp-'+mes;
    html+=`<div style="margin-bottom:4px">
      <div onclick="toggleHistGrp('${collapseId}')" style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--s2);border:1px solid var(--br);cursor:pointer;border-left:3px solid ${isActual?'var(--er)':'var(--br)'}">
        <div style="display:flex;align-items:center;gap:8px">
          <span id="${collapseId}-arrow" style="font-family:var(--mo);font-size:10px;color:var(--tx3)">${isActual?'▾':'▸'}</span>
          <span style="font-family:var(--mo);font-size:9px;font-weight:700;color:${isActual?'var(--er)':'var(--tx2)'}">${mLong(mes)}</span>
          <span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">${g[mes].length} reg.</span>
        </div>
        <span style="font-family:var(--mo);font-size:10px;color:var(--er)">-${fv(grpTotal)}</span>
      </div>
      <div id="${collapseId}" style="display:${isActual?'block':'none'}">`;
    g[mes].forEach(e=>{
      const eid=e.id;
      const mpBadge=e.mpRefId?`<span style="font-family:var(--mo);font-size:8px;background:var(--s2);color:var(--tx3);padding:0 4px;margin-left:4px;border-radius:2px;vertical-align:middle">MP</span>`:'';
      html+=`<div class="hi egr" data-id="${eid}" data-type="egr"><div><div class="hid red">${eid}</div><div class="hdate">${e.fechaDisplay}</div><div class="hclient">${e.concepto}${mpBadge}</div></div><span class="badge ber">${e.cuotasTotales>1?e.cuotasTotales+'c':''}</span><div class="htot er">-${fv(e.montoTotal)}</div><button class="hedit" data-edit="${eid}" data-type="egr">EDIT</button><button class="hdel" data-del="${eid}" data-type="egr">×</button></div>`;
    });
    html+=`</div></div>`;
  });
  c.innerHTML=html;
}

function rES(){
  const f=document.getElementById('egresosMes').value;
  const desde=document.getElementById('egresosDesde')?.value||'';
  const hasta=document.getElementById('egresosHasta')?.value||'';
  let eg=gE();
  eg.sort((a,b)=>a.fecha<b.fecha?-1:a.fecha>b.fecha?1:a.id.localeCompare(b.id));
  if(f==='rango'){if(desde)eg=eg.filter(e=>e.fecha>=desde);if(hasta)eg=eg.filter(e=>e.fecha<=hasta);}
  else if(f!=='all')eg=eg.filter(e=>e.mesActual===f);
  const c=document.getElementById('eStruc');
  if(!eg.length){c.innerHTML=`<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:20px">Sin datos</div>`;return;}
  const total=eg.length;const lastId=eg[eg.length-1].id;
  let rows=eg.map(e=>`<tr><td class="er">${e.id}</td><td class="mu">${e.fechaDisplay}</td><td>${e.concepto}</td><td class="er">${fv(e.montoTotal)}</td><td class="er">-${fv(e.impactoCaja)}</td><td class="mu">${e.cuotasTotales}</td><td class="mu">${e.cuotasRestantes}</td><td class="wn">${e.finaliza||''}</td><td class="mu">${e.medio}</td></tr>`).join('');
  const totMonto=eg.reduce((a,e)=>a+e.montoTotal,0);const totImpacto=eg.reduce((a,e)=>a+e.impactoCaja,0);
  rows+=`<tr class="total-row"><td colspan="3" class="mu">TOTAL (${total} registros) · Último: ${lastId}</td><td class="er">${fv(totMonto)}</td><td class="er">-${fv(totImpacto)}</td><td colspan="4"></td></tr>`;
  c.innerHTML=`<table><thead><tr><th>ID Egreso</th><th>Fecha</th><th>Concepto</th><th>Monto</th><th>Impacto</th><th>C.Tot</th><th>C.Rest</th><th>Finaliza</th><th>Medio</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function openEditEgr(id){
  const d=ld();const e=(d.egresos||[]).find(x=>x.id===id);if(!e)return;
  document.getElementById('mTitEl').textContent='✏ Editar Egreso '+id;document.getElementById('mTitEl').className='mtit red';document.getElementById('modalBox').className='modal red';document.getElementById('mTk').style.display='none';
  document.getElementById('mBody').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div><label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Fecha</label><input type="date" id="edit-e-fecha" value="${e.fecha}" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none"></div>
      <div><label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Concepto</label><input type="text" id="edit-e-concepto" value="${e.concepto||''}" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none"></div>
      <div><label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Monto Total</label><input type="number" id="edit-e-monto" value="${e.montoTotal}" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none"></div>
      <div><label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Impacto Caja</label><input type="number" id="edit-e-impacto" value="${e.impactoCaja}" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none"></div>
      <div><label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Medio de pago</label><input type="text" id="edit-e-medio" value="${e.medio||''}" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none"></div>
      <div><label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Observaciones</label><input type="text" id="edit-e-obs" value="${e.obs||''}" placeholder="opcional" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none"></div>
    </div>`;
  document.getElementById('mFooter').innerHTML=`<button class="btn btn-p" onclick="saveEditEgr('${id}')">💾 Guardar</button><button class="btn btn-s" onclick="clM()">✕ Cancelar</button>`;
  document.getElementById('modal').classList.add('open');
}

function saveEditEgr(id){
  const d=ld();if(!d.egresos)return;const idx=d.egresos.findIndex(x=>x.id===id);if(idx<0)return;
  const nuevaFecha=document.getElementById('edit-e-fecha').value;
  const nuevoConcepto=document.getElementById('edit-e-concepto').value.trim();
  const nuevoMonto=parseFloat(document.getElementById('edit-e-monto').value);
  const nuevoImpacto=parseFloat(document.getElementById('edit-e-impacto').value);
  const nuevoMedio=document.getElementById('edit-e-medio').value.trim();
  const nuevoObs=document.getElementById('edit-e-obs').value.trim();
  if(!nuevoConcepto){sN('ERROR: Concepto requerido',true);return;}
  if(isNaN(nuevoMonto)||nuevoMonto<=0){sN('ERROR: Monto inválido',true);return;}
  if(nuevaFecha){d.egresos[idx].fecha=nuevaFecha;d.egresos[idx].fechaDisplay=d2s(nuevaFecha);d.egresos[idx].mesActual=d2m(nuevaFecha);}
  d.egresos[idx].concepto=nuevoConcepto;
  d.egresos[idx].montoTotal=nuevoMonto;
  d.egresos[idx].impactoCaja=isNaN(nuevoImpacto)||nuevoImpacto<=0?nuevoMonto:nuevoImpacto;
  d.egresos[idx].medio=nuevoMedio||d.egresos[idx].medio;d.egresos[idx].obs=nuevoObs||null;
  sd(d);window.rfM?.();rEH();rES();window.renderDash?.();window.clM?.();sN(`✓ ${id} actualizado`);window.uhd?.();
}

function bE(id){if(!confirm(`¿Eliminar egreso ${id}?`))return;dE(id);window.rfM?.();rEH();rES();window.renderDash?.();sN(`${id} eliminado`);window.uhd?.();}


// ===== modules/mp-import.js =====

// ── HTML escape helper ──────────────────────────────────────────────────
function _escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Parser ──────────────────────────────────────────────────────────────
function parseMPCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const headerIdx = lines.findIndex(l => l.startsWith('RELEASE_DATE'));
  if (headerIdx < 0) return null;
  const result = [];
  for (const line of lines.slice(headerIdx + 1)) {
    if (!line.trim()) continue;
    const parts = line.split(';');
    if (parts.length < 4) continue;
    const [fechaRaw, tipo, refId, montoRaw] = parts;
    const montoStr = montoRaw.replace(/\./g, '').replace(',', '.');
    const monto = parseFloat(montoStr);
    if (isNaN(monto) || monto >= 0) continue;
    const [dd, mm, yyyy] = fechaRaw.split('-');
    const fecha = `${yyyy}-${mm}-${dd}`;
    result.push({ fecha, concepto: tipo.trim(), monto: Math.abs(monto), refId: refId.trim() });
  }
  return result;
}

// ── ID generator para batch (opera sobre d.egresos en memoria) ──────────
function _nEIdLocal(d, mes) {
  const dm = (d.egresos || []).filter(e => e.id && e.id.substring(2, 8) === mes);
  if (!dm.length) return `E-${mes}-0001`;
  const mx = Math.max(...dm.map(e => parseInt(e.id.substring(9))));
  return `E-${mes}-${String(mx + 1).padStart(4, '0')}`;
}

// ── State ────────────────────────────────────────────────────────────────
let _mpFilas = [];

// ── Helpers del modal ────────────────────────────────────────────────────
function cerrarMPModal() {
  const el = document.getElementById('mp-modal');
  if (el) el.remove();
}

function _mpHandleDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) _mpHandleFile(file);
}

function _mpHandleFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => _mpLoadCsv(ev.target.result);
  reader.readAsText(file, 'ISO-8859-1');
}

function _mpLoadCsv(text) {
  const filas = parseMPCsv(text);
  if (!filas) { sN('Archivo inválido: no es un CSV de MercadoPago', true); return; }
  if (!filas.length) { sN('No se encontraron egresos en el archivo', true); return; }
  _mpFilas = filas;
  const body = document.getElementById('mp-body');
  if (body) { body.innerHTML = _mpPreviewHTML(filas); _mpUpdateFooter(); }
}

function _mpUpdateFooter() {
  const tbody = document.getElementById('mp-rows');
  if (!tbody) return;
  const checks = [...tbody.querySelectorAll('input[type=checkbox]:not([disabled])')];
  const sel = checks.filter(c => c.checked).length;
  const info = document.getElementById('mp-footer-info');
  const btn = document.getElementById('mp-import-btn');
  if (info) info.textContent = `${sel} seleccionado(s)`;
  if (btn) btn.textContent = `Importar ${sel} egreso${sel !== 1 ? 's' : ''} →`;
}

function _mpToggleRow() { _mpUpdateFooter(); }

function _mpEditConcepto(idx, val) { _mpFilas[idx].concepto = val; }

function _mpSelAll(sel) {
  const checks = document.querySelectorAll('#mp-rows input[type=checkbox]:not([disabled])');
  checks.forEach(c => { c.checked = sel; });
  _mpUpdateFooter();
}

function _mpConfirmar() {
  const tbody = document.getElementById('mp-rows');
  if (!tbody) return;
  const checks = [...tbody.querySelectorAll('input[type=checkbox]:not([disabled])')];
  const selIndices = checks.map((c, i) => c.checked ? i : -1).filter(i => i >= 0);
  if (!selIndices.length) { sN('Seleccioná al menos un egreso', true); return; }

  const d = ld();
  if (!d.egresos) d.egresos = [];

  selIndices.forEach(idx => {
    const f = _mpFilas[idx];
    const mes = d2m(f.fecha);
    const id = _nEIdLocal(d, mes);
    const fd = d2s(f.fecha);
    const tk = `📅 Fecha: ${fd}\nID Egreso: ${id}\n\n📉 Egreso:\nConcepto: ${f.concepto}\nMonto: ${fv(f.monto)}\nMedio de pago: Mercado Pago\n\n━━━━━━━━━━━━━━━━━━━━━\n💰 Impacto en caja: -${fv(f.monto)}`;
    d.egresos.push({
      id, fecha: f.fecha, fechaDisplay: fd, mesActual: mes,
      concepto: f.concepto, montoTotal: f.monto,
      cuotaBase: f.monto, ultimaCuota: f.monto,
      impactoCaja: f.monto, cuotasTotales: 1, cuotasRestantes: 0,
      finaliza: addMon(mes, 0), medio: 'Mercado Pago',
      obs: null, mpRefId: f.refId, ticketText: tk
    });
  });

  sd(d);
  ghAutoPush();
  window.rfM?.();
  window.rEH?.();
  window.rES?.();
  window.renderDash?.();
  window.uhd?.();
  cerrarMPModal();
  sN(`✓ ${selIndices.length} egreso(s) importados desde MercadoPago`);
}

// ── HTML builders ─────────────────────────────────────────────────────────
function _mpDropZoneHTML() {
  return `
    <div id="mp-dropzone"
         style="border:2px dashed var(--er);border-radius:6px;padding:40px;text-align:center;cursor:pointer"
         onclick="document.getElementById('mp-file-input').click()"
         ondragover="event.preventDefault()"
         ondrop="_mpHandleDrop(event)">
      <div style="font-size:28px;margin-bottom:8px;color:var(--er)">⬆</div>
      <div style="font-family:var(--mo);font-size:12px;color:var(--tx)">Arrastrá el CSV de MercadoPago acá</div>
      <div style="font-family:var(--mo);font-size:10px;color:var(--tx3);margin:4px 0 12px">o hacé click para seleccionar</div>
      <span style="font-family:var(--mo);font-size:10px;background:var(--s2);border:1px solid var(--br);padding:4px 14px;border-radius:3px">Seleccionar archivo</span>
    </div>
    <input type="file" id="mp-file-input" accept=".csv" style="display:none" onchange="_mpHandleFile(this.files[0])">
    <div style="font-family:var(--mo);font-size:9px;color:var(--tx3);text-align:center;margin-top:10px">
      MercadoPago → Actividad → Exportar → CSV
    </div>`;
}

function _mpPreviewHTML(filas) {
  const importados = new Set(gE().filter(e => e.mpRefId).map(e => e.mpRefId));
  const total = filas.reduce((a, f) => a + f.monto, 0);
  let rows = '';
  filas.forEach((f, i) => {
    const ya = importados.has(f.refId);
    const badge = ya ? `<span style="font-family:var(--mo);font-size:8px;background:var(--s2);color:var(--tx3);padding:1px 5px;border-radius:2px;margin-left:4px">ya importado</span>` : '';
    const inputStyle = ya
      ? 'background:var(--s2);color:var(--tx3);border-color:var(--br);'
      : 'background:var(--bg);color:var(--tx);border-color:var(--br);';
    rows += `
      <tr style="${ya ? 'opacity:0.45' : ''};border-bottom:1px solid var(--br)">
        <td style="padding:6px 4px;text-align:center">
          <input type="checkbox" ${ya ? 'disabled' : `checked onchange="_mpToggleRow()"`} style="accent-color:var(--er)">
        </td>
        <td style="padding:6px 4px;font-family:var(--mo);font-size:10px;color:var(--tx3);white-space:nowrap">${d2s(f.fecha).slice(0,5)}</td>
        <td style="padding:6px 4px">${badge}<input type="text" value="${_escHtml(f.concepto)}" ${ya ? 'disabled' : `onchange="_mpEditConcepto(${i},this.value)"`} style="font-family:var(--mo);font-size:10px;padding:2px 6px;width:90%;border:1px solid;border-radius:2px;outline:none;${inputStyle}"></td>
        <td style="padding:6px 4px;font-family:var(--mo);font-size:10px;color:var(--er);text-align:right;white-space:nowrap">-${fv(f.monto)}</td>
      </tr>`;
  });
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
      <span style="font-family:var(--mo);font-size:10px;color:var(--tx3)">${filas.length} egresos · ${fv(total)} ARS</span>
      <span>
        <span style="font-family:var(--mo);font-size:10px;color:var(--er);cursor:pointer;margin-right:8px" onclick="_mpSelAll(true)">☑ todos</span>
        <span style="font-family:var(--mo);font-size:10px;color:var(--tx3);cursor:pointer" onclick="_mpSelAll(false)">☐ ninguno</span>
      </span>
    </div>
    <div style="overflow-x:auto;max-height:50vh;overflow-y:auto">
      <table style="width:100%;border-collapse:collapse">
        <thead style="position:sticky;top:0;background:var(--bg)">
          <tr style="font-family:var(--mo);font-size:9px;color:var(--tx3);border-bottom:1px solid var(--br)">
            <th style="padding:4px;width:30px">☑</th>
            <th style="padding:4px;text-align:left">FECHA</th>
            <th style="padding:4px;text-align:left">CONCEPTO</th>
            <th style="padding:4px;text-align:right">MONTO</th>
          </tr>
        </thead>
        <tbody id="mp-rows">${rows}</tbody>
      </table>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid var(--br)">
      <span id="mp-footer-info" style="font-family:var(--mo);font-size:9px;color:var(--tx3)"></span>
      <button id="mp-import-btn" onclick="_mpConfirmar()" style="font-family:var(--mo);font-size:10px;background:var(--er);color:#fff;border:none;padding:6px 16px;border-radius:3px;cursor:pointer">Importar — egresos →</button>
    </div>`;
}

// ── Export público ────────────────────────────────────────────────────────
function renderMPImportModal() {
  // Exponer helpers a window para que funcionen en bundle Y en ES module mode
  Object.assign(window, {
    cerrarMPModal, _mpHandleDrop, _mpHandleFile,
    _mpToggleRow, _mpEditConcepto, _mpSelAll, _mpConfirmar
  });

  const existing = document.getElementById('mp-modal');
  if (existing) existing.remove();
  _mpFilas = [];

  const div = document.createElement('div');
  div.id = 'mp-modal';
  div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box';
  div.onclick = e => { if (e.target === div) cerrarMPModal(); };
  div.innerHTML = `
    <div style="background:var(--bg);border:1px solid var(--er);max-width:640px;width:100%;max-height:90vh;overflow-y:auto;border-radius:4px">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--br)">
        <span style="font-family:var(--mo);font-size:12px;font-weight:700;color:var(--er)">⬆ Importar desde MercadoPago</span>
        <button onclick="cerrarMPModal()" style="background:none;border:none;color:var(--tx3);cursor:pointer;font-size:18px;line-height:1">✕</button>
      </div>
      <div id="mp-body" style="padding:16px">${_mpDropZoneHTML()}</div>
    </div>`;
  document.body.appendChild(div);
}


// ===== modules/ventas.js =====

let showTotalsRow = false;

function sO(o){const d=ld();d.orders.push(o);sd(d);ghAutoPush();window.updateClientesDatalist?.();}

function confirmarOrden(id){
  const d=ld();const o=(d.orders||[]).find(x=>x.id===id);if(!o)return;
  o.estado='confirmada';o.fechaConfirmacion=new Date().toISOString();
  sd(d);ghAutoPush();window.rfM?.();rH();rS();window.renderDash?.();window.renderDashFlowChart?.();window.uhd?.();
  sN('✓ '+id+' — CONFIRMADA');
}

function anularByIdModal(){window.showInputModal?.('🟢 Anular Venta por ID','ID de la venta (ej: V-202603-0001):',true,'uppercase',function(raw){if(!raw)return;const id=raw.toUpperCase();const o=gO().find(x=>x.id===id);if(!o){sN(`${id} no encontrado`,true);return;}if(!confirm(`¿Anular ${id}?\n${o.fechaDisplay} — ${fv(o.totales.totalGeneral)}`))return;dO(id);window.rfM?.();rH();rS();window.renderDash?.();sN(`${id} anulada`);window.uhd?.();window.clM?.();});}

function rH(){
  const f=document.getElementById('ventasMes').value;
  const desde=document.getElementById('ventasDesde')?.value||'';
  const hasta=document.getElementById('ventasHasta')?.value||'';
  const q=(document.getElementById('buscar').value||'').toLowerCase();
  let orders=gO();orders.sort((a,b)=>a.fecha<b.fecha?-1:a.fecha>b.fecha?1:a.id.localeCompare(b.id));
  if(f==='rango'){if(desde)orders=orders.filter(o=>o.fecha>=desde);if(hasta)orders=orders.filter(o=>o.fecha<=hasta);}
  else if(f!=='all')orders=orders.filter(o=>o.mesActual===f);
  if(q)orders=orders.filter(o=>o.id.toLowerCase().includes(q)||(o.nota||'').toLowerCase().includes(q)||(o.cliente||'').toLowerCase().includes(q));
  const c=document.getElementById('hCont');
  if(!orders.length){c.innerHTML=`<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:20px">Sin órdenes</div>`;return;}
  const g={};orders.forEach(o=>{if(!g[o.mesActual])g[o.mesActual]=[];g[o.mesActual].push(o);});
  const mesMeses=Object.keys(g).sort();
  const mesActual=d2m(hoy());
  let html='';
  mesMeses.forEach(mes=>{
    const isActual=mes===mesActual;
    const grpTotal=g[mes].filter(o=>o.estado!=='pendiente').reduce((a,o)=>a+(o.totales?.totalGeneral||0),0);
    const pendCount=g[mes].filter(o=>o.estado==='pendiente').length;
    const pendStr=pendCount?` <span style="font-family:var(--mo);font-size:7px;color:var(--wn);background:rgba(255,170,0,.12);border:1px solid rgba(255,170,0,.3);padding:1px 5px">${pendCount} pendiente${pendCount>1?'s':''}</span>`:'';
    const collapseId='hgrp-'+mes;
    html+=`<div style="margin-bottom:4px">
      <div onclick="toggleHistGrp('${collapseId}')" style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--s2);border:1px solid var(--br);cursor:pointer;border-left:3px solid ${isActual?'var(--ac)':'var(--br)'}">
        <div style="display:flex;align-items:center;gap:8px">
          <span id="${collapseId}-arrow" style="font-family:var(--mo);font-size:10px;color:var(--tx3)">${isActual?'▾':'▸'}</span>
          <span style="font-family:var(--mo);font-size:9px;font-weight:700;color:${isActual?'var(--ac)':'var(--tx2)'}">${mLong(mes)}</span>
        <span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">${g[mes].length} órd.</span>
          ${pendStr}
        </div>
        <span style="font-family:var(--mo);font-size:10px;color:var(--ac)">${fv(grpTotal)}</span>
      </div>
      <div id="${collapseId}" style="display:${isActual?'block':'none'}">`;
    g[mes].forEach(o=>{
      const oid=o.id;
      const badgeCls=o.tipoPago==='USDT'?'busdt':o.tipoPago==='USD'?'busd':'bok';
      let montoDisplay='';
      if(o.tipoPago==='USD'){
        montoDisplay=`<span style="color:var(--wn)">${fu(o.payment?.usd||0)} USD</span>`;
      } else if(o.tipoPago==='USDT'){
        montoDisplay=`<span style="color:var(--wn)">${fu(o.payment?.usdt||0)} USDT</span>`;
      } else {
        montoDisplay=fv(o.totales.totalGeneral);
      }
      const isPend=o.estado==='pendiente';
      const cardBorderCol=isPend?'rgba(255,170,0,.5)':'var(--br)';
      html+=`<div class="hi" data-id="${oid}" data-type="venta" style="border-left-color:${cardBorderCol};flex-direction:column;align-items:stretch;gap:0;padding:0;cursor:default">
        <!-- Row 1: ID + badge + amount + actions -->
        <div style="display:flex;align-items:center;gap:8px;padding:10px 12px">
          <div style="flex:1;min-width:0">
            <div class="hid">${oid}</div>
            <div class="hdate">${o.fechaDisplay}${o.cliente?` · 👤 ${o.cliente}`:''}</div>
          </div>
          <span class="badge ${badgeCls}">${o.tipoPago||'ARS'}</span>
          <div class="htot" style="font-size:13px">${montoDisplay}</div>
          <button class="hedit" data-edit="${oid}" data-type="venta" style="flex-shrink:0">EDIT</button>
          <button class="hdel" data-del="${oid}" data-type="venta" style="flex-shrink:0">×</button>
        </div>
        <!-- Row 2: estado bar (only shown) -->
        ${isPend
          ? `<div style="display:flex;align-items:center;gap:8px;padding:7px 12px;background:rgba(255,170,0,.06);border-top:1px solid rgba(255,170,0,.2)">
               <span style="font-family:var(--mo);font-size:8px;color:var(--wn);font-weight:700;letter-spacing:.5px">🕐 PAGO PENDIENTE</span>
               <button onclick="confirmarOrden('${oid}')" style="margin-left:auto;font-family:var(--mo);font-size:9px;font-weight:700;height:28px;padding:0 14px;background:rgba(0,229,160,.15);border:1px solid var(--ac);color:var(--ac);cursor:pointer">✓ CONFIRMAR PAGO</button>
             </div>`
          : `<div style="padding:4px 12px;background:rgba(0,229,160,.03);border-top:1px solid rgba(0,229,160,.08)">
               <span style="font-family:var(--mo);font-size:7px;color:var(--ac);letter-spacing:.5px">✓ CONFIRMADA</span>
             </div>`
        }
      </div>`;
    });
    html+=`</div></div>`;
  });
  c.innerHTML=html;
}

function toggleHistGrp(id){
  const el=document.getElementById(id);const arrow=document.getElementById(id+'-arrow');
  if(!el)return;
  const open=el.style.display==='none';
  el.style.display=open?'block':'none';
  if(arrow)arrow.textContent=open?'▾':'▸';
}

function toggleTotals(){showTotalsRow=!showTotalsRow;rS();}

// ── MAPA DE PRODUCTOS FIJO ──
// Define las columnas que siempre se muestran
const PRODUCT_COLUMNS=[
  {id:'v-cal',label:'💀',getQty:o=>{const p=o.productos||{};if(p._lineas)return p._lineas.filter(l=>l.varId==='v-cal'||l.prodId==='v-cal').reduce((s,l)=>s+(l.qty||0),0);return p.calaveras||0;}},
  {id:'v-ted',label:'🧸',getQty:o=>{const p=o.productos||{};if(p._lineas)return p._lineas.filter(l=>l.varId==='v-ted'||l.prodId==='v-ted').reduce((s,l)=>s+(l.qty||0),0);return p.teddy||0;}},
  {id:'v-lck',label:'🐱',getQty:o=>{const p=o.productos||{};if(p._lineas)return p._lineas.filter(l=>l.varId==='v-lck'||l.prodId==='v-lck').reduce((s,l)=>s+(l.qty||0),0);return p.lucky||0;}},
  {id:'v-gen',label:'💊',getQty:o=>{const p=o.productos||{};if(p._lineas)return p._lineas.filter(l=>l.varId==='v-gen'||l.prodId==='v-gen').reduce((s,l)=>s+(l.qty||0),0);return p.genericas||0;}},
  {id:'p-cris',label:'💎',getQty:o=>{const p=o.productos||{};if(p._lineas)return p._lineas.filter(l=>l.prodId==='p-cris').reduce((s,l)=>s+(l.qty||0),0);return p.cristales||0;}},
  {id:'p-hong',label:'🍄',getQty:o=>{const p=o.productos||{};if(p._lineas)return p._lineas.filter(l=>l.prodId==='p-hong').reduce((s,l)=>s+(l.qty||0),0);return p.hongos||0;}},
  {id:'p-got',label:'💧',getQty:o=>{const p=o.productos||{};if(p._lineas)return p._lineas.filter(l=>l.prodId==='p-got').reduce((s,l)=>s+(l.qty||0),0);return p.goteros||0;}},
  {id:'p-pet',label:'🧫',getQty:o=>{const p=o.productos||{};if(p._lineas)return p._lineas.filter(l=>l.prodId==='p-pet').reduce((s,l)=>s+(l.qty||0),0);return p.petri||0;}},
  {id:'variable',label:'💲',getQty:o=>{const p=o.productos||{};return p.variable||0;}},
];

function rS(){
  const f=document.getElementById('ventasMes').value;
  const desde=document.getElementById('ventasDesde')?.value||'';
  const hasta=document.getElementById('ventasHasta')?.value||'';
  let orders=gO();orders.sort((a,b)=>a.fecha<b.fecha?-1:a.fecha>b.fecha?1:a.id.localeCompare(b.id));
  // rS shows only confirmed orders
  orders=orders.filter(o=>o.estado!=='pendiente');
  const allOrders=orders;
  if(f==='rango'){if(desde)orders=orders.filter(o=>o.fecha>=desde);if(hasta)orders=orders.filter(o=>o.fecha<=hasta);}
  else if(f!=='all')orders=orders.filter(o=>o.mesActual===f);
  const c=document.getElementById('tSeg');
  if(!orders.length){c.innerHTML=`<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:20px">Sin datos</div>`;return;}

  // ── Build rows ──
  let rows='';
  orders.forEach(o=>{
    const t=o.totales;
    const cells=PRODUCT_COLUMNS.map(col=>{
      const v=col.getQty(o);
      if(!v||v===0)return`<td class="mu"></td>`;
      if(col.id==='variable')return`<td class="mu">${fi(v)}</td>`;
      return`<td class="mu">${v}</td>`;
    }).join('');
    rows+=`<tr><td>${o.fechaDisplay}</td><td class="ac">${o.id}</td><td class="mu">${o.cliente||''}</td>${cells}<td class="ac">${fi(t.totalGeneral)}</td><td class="mu">${t.totalUSDT?fu(t.totalUSDT):''}</td><td class="mu">${o.nota||''}</td><td><button class="hedit" data-edit="${o.id}" data-type="venta" style="font-size:7px;height:22px;padding:0 6px">EDIT</button></td></tr>`;
  });

  // ── Totals row ──
  if(showTotalsRow){
    function buildTotalRow(arr,cls){
      const cells=PRODUCT_COLUMNS.map(col=>{
        const sum=arr.reduce((a,o)=>a+(col.getQty(o)||0),0);
        if(!sum)return`<td></td>`;
        if(col.id==='variable')return`<td class="${cls}">${fi(sum)}</td>`;
        return`<td class="${cls}">${sum}</td>`;
      }).join('');
      const tARS=arr.reduce((a,o)=>a+(o.totales.totalGeneral||0),0);
      const tUSDT=arr.reduce((a,o)=>a+(o.totales.totalUSDT||0),0);
      return`${cells}<td class="${cls}">${fi(tARS)}</td><td class="${cls}">${tUSDT?fu(tUSDT):''}</td><td></td><td></td>`;
    }
    rows+=`<tr class="total-row"><td colspan="3" class="mu" style="font-size:8px">TOTAL FILTRADO (${orders.length})</td>${buildTotalRow(orders,'ac')}</tr>`;
    if(f!=='all'&&f!=='rango'){
      rows+=`<tr class="total-row"><td colspan="3" class="mu" style="font-size:8px">TOTAL HISTÓRICO (${allOrders.length})</td>${buildTotalRow(allOrders,'wn')}</tr>`;
    }
  }

  // ── Header ──
  const dynHeaders=PRODUCT_COLUMNS.map(col=>`<th>${col.label}</th>`).join('');
  c.innerHTML=`<table><thead><tr><th>Fecha</th><th>ID</th><th>Cliente</th>${dynHeaders}<th>Total ARS</th><th>USDT</th><th>Nota</th><th></th></tr></thead><tbody>${rows}</tbody></table>`;
}

function bO(id){if(!confirm(`¿Eliminar venta ${id}?`))return;dO(id);window.rfM?.();rH();rS();window.renderDash?.();sN(`${id} eliminada`);window.uhd?.();}

function confirLimpiar(){if(!confirm('¿Eliminar TODO el historial de ventas?'))return;const d=ld();d.orders=[];sd(d);window.rfM?.();rH();rS();window.renderDash?.();sN('Historial eliminado');window.uhd?.();}

function openEditVenta(id){
  const d=ld();const o=d.orders.find(x=>x.id===id);if(!o)return;
  const pm=o.payment||{ars:o.totales?.totalGeneral||0,usd:0,usdt:o.totales?.totalUSDT||0,tc_usd:0,tc_usdt:o.tc||0,modo:o.tipoPago||'ARS'};
  const IS='width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none';
  const LB='font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase';
  document.getElementById('mTitEl').textContent='EDIT — '+id;
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal modal-wide';
  document.getElementById('mTk').style.display='none';

  const catalog=getProductos();
  let editLineas=[];

  if(o.productos?._lineas&&o.productos._lineas.length){
    editLineas=o.productos._lineas.map(ln=>{
      const prod=catalog.find(p=>p.id===(ln.varId||ln.prodId)||p.id===ln.prodId);
      const nombre=prod?prod.nombre:(ln.varId||ln.prodId);
      const emoji=prod?prod.emoji:'📦';
      return{key:ln.varId||ln.prodId,prodId:ln.prodId,varId:ln.varId||null,nombre,emoji,qty:ln.qty,precio:ln.precio||0};
    });
  } else {
    const p=o.productos||{};
    const pastProd=catalog.find(x=>x.id==='p-past');
    const pastPrice=o.productos?.precioPastilla||pastProd?.tramos?.[0]?.p||0;
    const varMap={calaveras:'v-cal',teddy:'v-ted',lucky:'v-lck',genericas:'v-gen'};
    const varEmoji={calaveras:'💀',teddy:'🧸',lucky:'🐱',genericas:'💊'};
    const varName={calaveras:'Calaveras',teddy:'Teddy',lucky:'Lucky Cat',genericas:'Genéricas'};
    ['calaveras','teddy','lucky','genericas'].forEach(k=>{
      if((p[k]||0)>0) editLineas.push({key:'p-past-'+varMap[k],prodId:'p-past',varId:varMap[k],nombre:varName[k],emoji:varEmoji[k],qty:p[k],precio:pastPrice});
    });
    const legMap=[
      {key:'cristales',prodId:'p-cris',emoji:'💎',nombre:'Cristales',qtyField:'cristales',priceField:'precioCristales'},
      {key:'hongos',   prodId:'p-hong',emoji:'🍄',nombre:'Hongos',   qtyField:'hongos',   priceField:'precioHongos'},
      {key:'goteros',  prodId:'p-got', emoji:'💧',nombre:'Goteros',  qtyField:'goteros',  priceField:null},
      {key:'petri',    prodId:'p-pet', emoji:'🧫',nombre:'Petri',    qtyField:'petri',    priceField:null},
    ];
    legMap.forEach(({key,prodId,emoji,nombre,qtyField,priceField})=>{
      const qty=p[qtyField]||0;if(!qty)return;
      const prod=catalog.find(x=>x.id===prodId);
      const precio=(priceField&&p[priceField])||prod?.tramos?.[0]?.p||0;
      editLineas.push({key,prodId,varId:null,nombre,emoji,qty,precio});
    });
    if((p.variable||0)>0) editLineas.push({key:'variable',prodId:'__var',varId:null,nombre:'Variable',emoji:'💲',qty:1,precio:p.variable});
  }

  const prodRows=editLineas.length
    ? editLineas.map(ln=>`
      <div style="display:grid;grid-template-columns:1fr 80px 95px;gap:6px;align-items:center;margin-bottom:5px;padding:6px;background:var(--s2);border:1px solid var(--br)">
        <div style="font-family:var(--mo);font-size:10px;color:var(--tx)">${ln.emoji} ${ln.nombre}</div>
        <input type="number" style="${IS};min-height:30px;padding:3px 6px;font-size:12px;text-align:center" placeholder="qty" value="${ln.qty}" id="edit-qty-${ln.key}">
        <input type="number" style="${IS};min-height:30px;padding:3px 6px;font-size:12px;text-align:right" placeholder="$ ARS" value="${ln.precio}" id="edit-prc-${ln.key}">
      </div>`).join('')
    : `<div style="font-family:var(--mo);font-size:9px;color:var(--tx3);padding:8px">Sin productos detectados</div>`;

  const modoActual=pm.modo||'ARS';
  // Calcular equivalentes USD para mostrar
  const tcUsdVal=pm.tc_usd||0;
  const tcUsdtVal=pm.tc_usdt||o.tc||0;
  const eqUsd=tcUsdVal>0?(o.totales?.totalGeneral||0)/tcUsdVal:0;
  const eqUsdt=tcUsdtVal>0?(o.totales?.totalGeneral||0)/tcUsdtVal:0;

  document.getElementById('mBody').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div><label style="${LB}">Fecha</label><input type="date" id="edit-fecha" value="${o.fecha}" style="${IS}"></div>
      <div><label style="${LB}">Cliente</label><input type="text" id="edit-cliente" value="${o.cliente||''}" placeholder="opcional" style="${IS}"></div>
      <div style="grid-column:1/-1"><label style="${LB}">Nota</label><input type="text" id="edit-nota" value="${o.nota||''}" placeholder="opcional" style="${IS}"></div>
    </div>
    <div style="margin-bottom:10px">
      <div style="font-family:var(--mo);font-size:8px;color:var(--ac);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Productos · Cantidad · Precio (ARS)</div>
      ${prodRows}
      <button onclick="editRecalcTotal()" style="margin-top:8px;background:var(--s2);border:1px solid var(--br);color:var(--ac);font-family:var(--mo);font-size:9px;padding:6px 12px;cursor:pointer">⟳ Recalcular total</button>
    </div>
    <div style="background:var(--s2);border:1px solid var(--br);padding:10px">
      <div style="font-family:var(--mo);font-size:8px;color:var(--tx2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px">Modo de pago</div>
      <div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap">
        <button class="tgb ${modoActual==='ARS' ?'active':''}" id="em-btnARS"  onclick="editSetMode('ARS')"  style="font-size:9px;min-height:28px;flex:1">ARS</button>
        <button class="tgb ${modoActual==='USD' ?'active':''}" id="em-btnUSD"  onclick="editSetMode('USD')"  style="font-size:9px;min-height:28px;flex:1">USD</button>
        <button class="tgb ${modoActual==='USDT'?'active':''}" id="em-btnUSDT" onclick="editSetMode('USDT')" style="font-size:9px;min-height:28px;flex:1">USDT</button>
      </div>
      <input type="hidden" id="edit-modo" value="${modoActual}">
      <div id="em-ars" style="display:${modoActual==='ARS'?'block':'none'}">
        <label style="${LB}">Total ARS</label>
        <input type="number" id="edit-total-ars" value="${o.totales?.totalGeneral||0}" style="${IS}">
      </div>
      <div id="em-usd" style="display:${modoActual==='USD'?'block':'none'}">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div><label style="${LB}">TC ARS/USD</label><input type="number" id="edit-tc-usd" value="${tcUsdVal||window._blueARS||''}" placeholder="ej: 1400" style="${IS}"></div>
          <div><label style="${LB}">Equivalente USD</label><input type="text" id="edit-eq-usd" value="${fu(eqUsd)}" style="${IS};background:var(--s3);color:var(--wn)" readonly></div>
        </div>
        <div style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-top:6px">Total en ARS se calcula desde productos</div>
      </div>
      <div id="em-usdt" style="display:${modoActual==='USDT'?'block':'none'}">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div><label style="${LB}">TC ARS/USDT</label><input type="number" id="edit-tc-usdt" value="${tcUsdtVal||window._usdtARS||''}" placeholder="ej: 1450" style="${IS}"></div>
          <div><label style="${LB}">Equivalente USDT</label><input type="text" id="edit-eq-usdt" value="${fu(eqUsdt)}" style="${IS};background:var(--s3);color:var(--wn)" readonly></div>
        </div>
        <div style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-top:6px">Total en ARS se calcula desde productos</div>
      </div>
    </div>`;
  document.getElementById('mFooter').innerHTML=`<button class="btn btn-p" onclick="saveEditVenta('${id}')">💾 Guardar</button><button class="btn btn-s" onclick="clM()">✕ Cancelar</button>`;
  document.getElementById('modal').classList.add('open');
  window._editLineas=editLineas;
}

function editRecalcTotal(){
  const editLineas=window._editLineas||[];
  let sum=0;
  editLineas.forEach(ln=>{
    const qEl=document.getElementById('edit-qty-'+ln.key);
    const pEl=document.getElementById('edit-prc-'+ln.key);
    if(qEl&&pEl){
      const q=Math.max(0,parseFloat(qEl.value)||0);
      const p=parseFloat(pEl.value)||0;
      sum+=q*p;
    }
  });
  document.getElementById('edit-total-ars').value=Math.round(sum);
  editUpdateEquiv();
}

function editUpdateEquiv(){
  const totalARS=parseFloat(document.getElementById('edit-total-ars')?.value)||0;
  const tcUsd=parseFloat(document.getElementById('edit-tc-usd')?.value)||0;
  const tcUsdt=parseFloat(document.getElementById('edit-tc-usdt')?.value)||0;
  const eqUsd=tcUsd>0?(totalARS/tcUsd).toFixed(2):0;
  const eqUsdt=tcUsdt>0?(totalARS/tcUsdt).toFixed(2):0;
  const eqUsdEl=document.getElementById('edit-eq-usd');
  const eqUsdtEl=document.getElementById('edit-eq-usdt');
  if(eqUsdEl)eqUsdEl.value=fu(eqUsd);
  if(eqUsdtEl)eqUsdtEl.value=fu(eqUsdt);
}

function editSetMode(m){
  document.getElementById('edit-modo').value=m;
  ['ARS','USD','USDT'].forEach(x=>{const b=document.getElementById('em-btn'+x);if(b)b.classList.toggle('active',x===m);});
  ['ars','usd','usdt'].forEach(x=>{const el=document.getElementById('em-'+x);if(el)el.style.display=x===m.toLowerCase()?'block':'none';});
}

function saveEditVenta(id){
  const d=ld();const idx=d.orders.findIndex(x=>x.id===id);if(idx<0)return;
  const o=d.orders[idx];
  const nuevaFecha=document.getElementById('edit-fecha').value;
  const nuevoCliente=document.getElementById('edit-cliente').value.trim();
  const nuevaNota=document.getElementById('edit-nota').value.trim();
  const modo=document.getElementById('edit-modo')?.value||'ARS';

  // Recalcular total desde líneas editadas
  const editLineas=window._editLineas||[];
  let nuevoTotal=parseFloat(document.getElementById('edit-total-ars')?.value)||0;
  const newLineas=[];
  if(editLineas.length){
    let sum=0;
    editLineas.forEach(ln=>{
      const qEl=document.getElementById('edit-qty-'+ln.key);
      const pEl=document.getElementById('edit-prc-'+ln.key);
      const q=qEl?Math.max(0,parseFloat(qEl.value)||0):ln.qty;
      const p=pEl?parseFloat(pEl.value)||0:ln.precio;
      if(q>0) newLineas.push({prodId:ln.prodId,varId:ln.varId,qty:q,precio:p,subtotal:q*p});
      sum+=q*p;
    });
    if(sum>0) nuevoTotal=sum;
    if(!o.productos) o.productos={};
    o.productos._lineas=newLineas;
  }

  // Recalcular campos legacy para compatibilidad
  const p=o.productos;
  if(p&&p._lineas){
    p.calaveras=p._lineas.filter(l=>l.varId==='v-cal'||l.prodId==='v-cal').reduce((a,l)=>a+(l.qty||0),0);
    p.teddy=p._lineas.filter(l=>l.varId==='v-ted'||l.prodId==='v-ted').reduce((a,l)=>a+(l.qty||0),0);
    p.lucky=p._lineas.filter(l=>l.varId==='v-lck'||l.prodId==='v-lck').reduce((a,l)=>a+(l.qty||0),0);
    p.genericas=p._lineas.filter(l=>l.varId==='v-gen'||l.prodId==='v-gen').reduce((a,l)=>a+(l.qty||0),0);
    p.cristales=p._lineas.filter(l=>l.prodId==='p-cris').reduce((a,l)=>a+(l.qty||0),0);
    p.hongos=p._lineas.filter(l=>l.prodId==='p-hong').reduce((a,l)=>a+(l.qty||0),0);
    p.goteros=p._lineas.filter(l=>l.prodId==='p-got').reduce((a,l)=>a+(l.qty||0),0);
    p.petri=p._lineas.filter(l=>l.prodId==='p-pet').reduce((a,l)=>a+(l.qty||0),0);
    p.variable=p._lineas.filter(l=>l.prodId==='__var').reduce((a,l)=>a+(l.subtotal||0),0);
    p.totalPastillas=p.calaveras+p.teddy+p.lucky+p.genericas;
    p.totalPastillasLinea=newLineas.filter(l=>l.prodId==='p-past').reduce((a,l)=>a+(l.subtotal||0),0);
    p.totalCristales=newLineas.filter(l=>l.prodId==='p-cris').reduce((a,l)=>a+(l.subtotal||0),0);
    p.totalHongos=newLineas.filter(l=>l.prodId==='p-hong').reduce((a,l)=>a+(l.subtotal||0),0);
    p.totalGoteros=newLineas.filter(l=>l.prodId==='p-got').reduce((a,l)=>a+(l.subtotal||0),0);
    p.totalPetri=newLineas.filter(l=>l.prodId==='p-pet').reduce((a,l)=>a+(l.subtotal||0),0);
  }

  // Payment
  let payment;
  const tcUsd =parseFloat(document.getElementById('edit-tc-usd')?.value)||0;
  const tcUsdt=parseFloat(document.getElementById('edit-tc-usdt')?.value)||0;

  if(modo==='USD'){
    const usdCalc=tcUsd>0?parseFloat((nuevoTotal/tcUsd).toFixed(2)):0;
    payment={ars:0,usd:usdCalc,usdt:0,tc:tcUsd,tc_usd:tcUsd,tc_usdt:tcUsdt,total_ars:nuevoTotal,total_usdt:null,modo:'USD'};
  } else if(modo==='USDT'){
    const usdtCalc=tcUsdt>0?parseFloat((nuevoTotal/tcUsdt).toFixed(2)):0;
    payment={ars:0,usd:0,usdt:usdtCalc,tc:tcUsdt,tc_usd:tcUsd,tc_usdt:tcUsdt,total_ars:nuevoTotal,total_usdt:usdtCalc,modo:'USDT'};
  } else {
    payment={ars:nuevoTotal,usd:0,usdt:0,tc:0,tc_usd:0,tc_usdt:0,total_ars:nuevoTotal,total_usdt:null,modo:'ARS'};
  }

  if(nuevaFecha){o.fecha=nuevaFecha;o.fechaDisplay=d2s(nuevaFecha);o.mesActual=d2m(nuevaFecha);}
  o.cliente=nuevoCliente||null; o.nota=nuevaNota||null;
  o.tipoPago=modo; o.tc=modo==='USDT'?tcUsdt:modo==='USD'?tcUsd:null; o.payment=payment;
  o.totales={...o.totales,totalGeneral:nuevoTotal,totalUSDT:payment.total_usdt,payment};
  const costo=o.costo||0;
  o.margen=nuevoTotal>0?parseFloat(((nuevoTotal-costo)/nuevoTotal*100).toFixed(1)):0;
  sd(d);window.rfM?.();rH();rS();window.renderDash?.();window.clM?.();sN(`✓ ${id} actualizada`);window.uhd?.();window.updateClientesDatalist?.();
  delete window._editLineas;
}


// ===== modules/inventario.js =====

// ── Data layer ──
function getIngresos(){const d=ld();return d.ingresos||[];}
function saveIngreso(ing){
  const d=ld();if(!d.ingresos)d.ingresos=[];
  const idx=d.ingresos.findIndex(x=>x.id===ing.id);
  if(idx>=0)d.ingresos[idx]=ing;else d.ingresos.push(ing);
  sd(d);
}
function deleteIngreso(id){
  const d=ld();d.ingresos=(d.ingresos||[]).filter(x=>x.id!==id);sd(d);
}

// ── consumirStock FIFO ──
function consumirStock(itemId,qty){
  const lotes=getLotes();
  if(!lotes[itemId])return;
  let restante=qty;
  lotes[itemId].sort((a,b)=>a.fecha.localeCompare(b.fecha));
  for(let l of lotes[itemId]){
    if(l.qty_restante<=0||restante<=0)continue;
    const consume=Math.min(l.qty_restante,restante);
    l.qty_restante-=consume;restante-=consume;
  }
  saveLotes(lotes);
}

// ── Período vendido ──
function _invFilterOrders(orders){
  const p=document.getElementById('invPeriodo')?.value||'all';
  if(!p||p==='all')return orders;
  if(p==='rango'){
    const desde=document.getElementById('invPeriodoDesde')?.value||'';
    const hasta=document.getElementById('invPeriodoHasta')?.value||'';
    if(desde)orders=orders.filter(o=>o.fecha>=desde);
    if(hasta)orders=orders.filter(o=>o.fecha<=hasta);
    return orders;
  }
  // Month code like '202604'
  return orders.filter(o=>o.mesActual===p);
}

function getInvPeriodoSoldMap(){
  const orders=_invFilterOrders(gOConf());
  const soldMap={};
  orders.forEach(o=>{
    const p=o.productos;if(!p)return;
    if(p._lineas&&p._lineas.length){
      p._lineas.forEach(ln=>{
        const k=ln.varId||ln.prodId;
        soldMap[k]=(soldMap[k]||0)+(ln.qty||0);
      });
    } else {
      // formato legacy: {calaveras,teddy,lucky,genericas,cristales,hongos,goteros,petri}
      const leg=[['v-cal','calaveras'],['v-ted','teddy'],['v-lck','lucky'],['v-gen','genericas'],
                 ['p-cris','cristales'],['p-hong','hongos'],['p-got','goteros'],['p-pet','petri']];
      leg.forEach(([k,f])=>{if((p[f]||0)>0)soldMap[k]=(soldMap[k]||0)+(p[f]||0);});
    }
  });
  return soldMap;
}

function getInvPeriodoRevenueMap(){
  // Returns {prodId: totalARS} for the selected period — real revenue from confirmed sales
  const orders=_invFilterOrders(gOConf());
  const revMap={};
  orders.forEach(o=>{
    const p=o.productos;if(!p)return;
    if(p._lineas&&p._lineas.length){
      p._lineas.forEach(ln=>{
        const k=ln.varId||ln.prodId;
        revMap[k]=(revMap[k]||0)+(ln.subtotal||0);
      });
    } else {
      // formato legacy: distribuir revenue desde campos totales
      const t=o.totales||{};
      const totalPast=(p.calaveras||0)+(p.teddy||0)+(p.lucky||0)+(p.genericas||0);
      if(totalPast>0&&(t.totalPastillasLinea||0)>0){
        const ppas=t.totalPastillasLinea/totalPast;
        [['v-cal','calaveras'],['v-ted','teddy'],['v-lck','lucky'],['v-gen','genericas']].forEach(([k,f])=>{
          if((p[f]||0)>0)revMap[k]=(revMap[k]||0)+((p[f]||0)*ppas);
        });
      }
      if((p.cristales||0)>0&&t.totalCristales) revMap['p-cris']=(revMap['p-cris']||0)+t.totalCristales;
      if((p.hongos||0)>0&&t.totalHongos)       revMap['p-hong']=(revMap['p-hong']||0)+t.totalHongos;
      if((p.goteros||0)>0&&t.totalGoteros)     revMap['p-got']=(revMap['p-got']||0)+t.totalGoteros;
      if((p.petri||0)>0&&t.totalPetri)         revMap['p-pet']=(revMap['p-pet']||0)+t.totalPetri;
    }
  });
  return revMap;
}

function getPeriodoLabel(){
  const p=document.getElementById('invPeriodo')?.value||'all';
  if(!p||p==='all')return'TODO';
  if(p==='rango'){
    const d=document.getElementById('invPeriodoDesde')?.value||'';
    const h=document.getElementById('invPeriodoHasta')?.value||'';
    if(d&&h)return d.slice(5)+' → '+h.slice(5);return'RANGO';
  }
  // Month code
  return mL(p);
}

function onInvPeriodoChange(){
  const v=document.getElementById('invPeriodo')?.value||'all';
  const dw=document.getElementById('invPeriodoDesdeWrap'),hw=document.getElementById('invPeriodoHastaWrap');
  if(v==='rango'){
    if(dw)dw.style.display='';if(hw)hw.style.display='';
    const h=hoy();
    const dEl=document.getElementById('invPeriodoDesde');
    const hEl=document.getElementById('invPeriodoHasta');
    if(dEl&&!dEl.value)dEl.value=h.substring(0,8)+'01';
    if(hEl&&!hEl.value)hEl.value=h;
  } else {
    if(dw)dw.style.display='none';if(hw)hw.style.display='none';
  }
  renderInvStock();
}

// ── Sub-navegación ──
function invSubNav(sub){
  ['ingresos','precios','stock','movs','price-adjust','price-log'].forEach(s=>{
    const pane=document.getElementById('inv-sub-'+s);
    const btn=document.getElementById('isb-'+s);
    if(pane)pane.style.display=s===sub?'':'none';
    if(btn){btn.classList.toggle('active',s===sub);}
  });
  if(sub==='ingresos'){renderIngresoForm();renderProductosRegistrados();}
  if(sub==='precios'){window.renderListasPrecios?.();window.renderAsignacionPrecios?.();}
  if(sub==='stock')renderInvStock();
  if(sub==='movs')renderStockHistorial();
  if(sub==='price-adjust')window.renderPriceAdjust?.();
  if(sub==='price-log')window.renderPriceLog?.();
}

// ── Badge de estado ──
function stBadge(st){
  const m={
    empty:{cls:'badge-zero',txt:'⛔ Sin stock'},
    crit :{cls:'badge-crit',txt:'🔴 Riesgo'},
    warn :{cls:'badge-warn',txt:'🟡 Atención'},
    ok   :{cls:'badge-ok',  txt:'🟢 OK'}
  }[st]||{cls:'',txt:'—'};
  return'<span class="badge-st '+m.cls+'">'+m.txt+'</span>';
}

// ════════════════════════════════════════
// MÓDULO 2 — STOCK Y UMBRALES
// ════════════════════════════════════════
function renderInvStockTabla(){
  const prods=getProductos().filter(p=>p.activo!==false);
  const umbrales=getUmbrales();
  const soldMap=getInvPeriodoSoldMap();
  const revMap=getInvPeriodoRevenueMap();
  const periodoLbl=getPeriodoLabel();
  const cont=document.getElementById('inv-stock-body');
  if(!cont)return;
  if(!prods.length){cont.innerHTML='<div style="padding:20px;font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center">Sin productos.</div>';return;}

  let rows='';
  prods.forEach(p=>{
    const pid=p.id;
    const unit=p.unit||'ud';
    const qty=getActualQty(pid);      // lotes si existen y > 0, fallback a plano
    const costoPromLotes=getCostoPromedio(pid);
    const costoRef=costoPromLotes||p.costo||0;  // fallback a costo del producto
    const u=umbrales[pid]||{};
    const w=u.warn!=null?u.warn:15;const cr=u.crit!=null?u.crit:5;
    const st=getStockStatus(qty,pid);
    const sold=soldMap[pid]||0;
    const rev=revMap[pid]||0;  // ingresos reales ARS del período

    // Margen real del período:
    // Si hay ventas en el período → margen = (revenue - costo_vendido) / revenue
    // Si no → margen teórico desde lista de precios
    let margen=null, margenCls='color:var(--tx3)', margenTip='';
    if(sold>0 && rev>0 && costoRef>0){
      const costoVendido=sold*costoRef;
      margen=((rev-costoVendido)/rev*100);
      margenTip='real '+periodoLbl;
    } else if(costoRef>0){
      const tramos=getTramosProducto(p);
      const precioBase=tramos[0]?.p||0;
      if(precioBase>0){
        margen=((precioBase-costoRef)/precioBase*100);
        margenTip='teórico';
      }
    }
    if(margen!=null){
      margenCls=margen>40?'color:var(--ac)':margen>25?'color:var(--wn)':'color:var(--er)';
    }

    const costoDisplay=costoPromLotes
      ?'$'+fi(Math.round(costoPromLotes))
      :costoRef
        ?'<span style="color:var(--tx3)">$'+fi(costoRef)+'</span>'
        :'—';

    rows+='<tr>'
      +'<td>'+p.emoji+' '+p.nombre+' <span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">('+unit+')</span></td>'
      +'<td>'+stBadge(st)+'</td>'
      +'<td style="text-align:right;font-weight:700;color:var(--tx)">'+qty+' <span style="font-size:8px;font-weight:400;color:var(--tx3)">'+unit+'</span></td>'
      // Sold column: qty + revenue
      +'<td style="text-align:right">'
        +(sold
          ?'<div style="font-family:var(--mo);font-size:11px;font-weight:700;color:var(--tx)">'+sold+' <span style="font-size:8px;font-weight:400;color:var(--tx3)">'+unit+'</span></div>'
           +(rev?'<div style="font-family:var(--mo);font-size:9px;color:var(--ac)">$'+fi(Math.round(rev))+'</div>':'')
          :'<span style="color:var(--tx3)">—</span>')
      +'</td>'
      +'<td style="text-align:right;font-family:var(--mo);color:var(--ac2)">'+costoDisplay+'</td>'
      // Margin: real if sales exist, theoretical otherwise
      +'<td style="text-align:right;font-family:var(--mo);font-size:10px">'
        +(margen!=null
          ?'<div style="font-weight:700;'+margenCls+'">'+margen.toFixed(1)+'%</div>'
           +(margenTip?'<div style="font-size:7px;color:var(--tx3)">'+margenTip+'</div>':'')
          :'<span style="color:var(--tx3)">—</span>')
      +'</td>'
      +'<td style="text-align:center"><input type="number" class="inv-umbral-input" data-uid="'+pid+'" data-type="warn" value="'+w+'" style="width:44px;text-align:center;font-family:var(--mo);font-size:10px;background:var(--bg);border:1px solid rgba(255,170,0,.3);color:var(--wn);padding:3px;outline:none" title="Umbral atención"></td>'
      +'<td style="text-align:center"><input type="number" class="inv-umbral-input" data-uid="'+pid+'" data-type="crit" value="'+cr+'" style="width:44px;text-align:center;font-family:var(--mo);font-size:10px;background:var(--bg);border:1px solid rgba(255,68,85,.3);color:var(--er);padding:3px;outline:none" title="Umbral riesgo"></td>'
      +'<td><button class="pm-btn" data-ver-lotes="'+pid+'" data-label="'+p.emoji+' '+p.nombre+'" style="font-size:8px">lotes</button></td>'
      +'</tr>';
  });

  const divergencia=_calcDivergencia();
  const warnDiv=divergencia>0
    ?'<div style="padding:10px 14px;background:rgba(255,170,0,.08);border-top:1px solid rgba(255,170,0,.3);display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
      +'<span style="font-family:var(--mo);font-size:9px;color:var(--wn);font-weight:700">⚠ Lotes desincronizados con stock plano (drift='+divergencia+' ud)</span>'
      +'<span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">Los valores mostrados pueden diferir del dashboard. Reconciliar para unificar ambas fuentes.</span>'
      +'<button class="btn btn-p" data-reconciliar="1" style="font-size:9px;height:28px;margin-left:auto">🔄 Reconciliar lotes</button>'
      +'</div>'
    :'<div style="padding:6px 14px;background:rgba(0,229,160,.04);border-top:1px solid rgba(0,229,160,.1)">'
      +'<span style="font-family:var(--mo);font-size:8px;color:var(--ac)">✓ Lotes sincronizados con stock plano</span>'
      +'</div>';

  const tbl='<table class="inv-stock-tbl">'
    +'<thead><tr>'
    +'<th>Producto</th>'
    +'<th>Estado</th>'
    +'<th style="text-align:right">Stock actual</th>'
    +'<th style="text-align:right">Vendido — '+periodoLbl+'</th>'
    +'<th style="text-align:right">Costo prom.</th>'
    +'<th style="text-align:right">Margen</th>'
    +'<th style="text-align:center">🟡 Atn ≤</th>'
    +'<th style="text-align:center">🔴 Rsg ≤</th>'
    +'<th></th>'
    +'</tr></thead>'
    +'<tbody>'+rows+'</tbody>'
    +'</table>'
    +warnDiv
    +'<div style="padding:8px 14px;border-top:1px solid var(--br);display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
    +'<span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">Margen <b>real</b>: calculado sobre ventas confirmadas del período. Margen <b>teórico</b>: desde lista de precios cuando no hay ventas.</span>'
    +'</div>'
    +'<div style="padding:8px 14px;border-top:1px solid var(--br);display:flex;align-items:center;gap:10px">'
    +'<span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">Umbrales →</span>'
    +'<button class="btn btn-p" data-guardar-umbrales="1" style="font-size:9px;height:32px">💾 Guardar umbrales</button>'
    +'<span id="umbral-save-msg" style="font-family:var(--mo);font-size:9px;color:var(--ac)"></span>'
    +'</div>';

  cont.innerHTML=tbl;

  cont.onclick=function(e){
    const verLotes=e.target.closest('[data-ver-lotes]');
    if(verLotes){
      abrirLotesPanel(verLotes.getAttribute('data-ver-lotes'),verLotes.getAttribute('data-label'));
      return;
    }
    const guardar=e.target.closest('[data-guardar-umbrales]');
    if(guardar){guardarUmbralesDesdeTabla();return;}
    const reconciliar=e.target.closest('[data-reconciliar]');
    if(reconciliar){
      if(!confirm('¿Reconciliar lotes con stock plano?\n\nAjustará las cantidades restantes de cada lote para que coincidan exactamente con el stock histórico (stock plano). Esta operación es idempotente y no toca órdenes ni movimientos.'))return;
      reconcileLotesConStock();
      return;
    }
  };
}

function guardarUmbralesDesdeTabla(){
  const u=getUmbrales();
  document.querySelectorAll('.inv-umbral-input').forEach(inp=>{
    const uid=inp.getAttribute('data-uid');
    const tipo=inp.getAttribute('data-type');
    const val=parseFloat(inp.value)||0;
    if(!u[uid])u[uid]={warn:15,crit:5};
    u[uid][tipo]=val;
  });
  saveUmbrales(u);
  const msg=document.getElementById('umbral-save-msg');
  if(msg){msg.textContent='✓ Guardado';setTimeout(()=>msg.textContent='',2000);}
  renderStockMiniPanel();window.buildTicketUI?.();window.upd?.();sN('✓ Umbrales guardados');
}

// ── Panel de lotes (expandible, bajo Stock) ──
function abrirLotesPanel(itemId,label){
  const panel=document.getElementById('inv-lotes-panel');
  const title=document.getElementById('inv-lotes-title');
  const body=document.getElementById('inv-lotes-body');
  if(!panel||!body)return;
  document.getElementById('inv-lotes-title').textContent='📦 Lotes — '+(label||itemId);
  panel.style.display='';
  panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  renderLotesDetalle(itemId);
}
function cerrarLotesPanel(){
  const panel=document.getElementById('inv-lotes-panel');
  if(panel)panel.style.display='none';
}
function renderLotesDetalle(itemId){
  const body=document.getElementById('inv-lotes-body');if(!body)return;
  const todos=getLotesItem(itemId);
  if(!todos.length){
    body.innerHTML='<div style="padding:20px;font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center">Sin lotes registrados. Registrá un ingreso en la pestaña 📥 Ingresos.</div>';
    return;
  }
  // Resumen
  const activos=todos.filter(l=>l.qty_restante>0);
  const totStock=activos.reduce((a,l)=>a+l.qty_restante,0);
  const costoP=totStock?activos.reduce((a,l)=>a+l.qty_restante*l.costo_unitario,0)/totStock:0;
  let html='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--br);border-bottom:1px solid var(--br)">'
    +'<div style="background:var(--s2);padding:12px 16px"><div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;margin-bottom:4px">STOCK TOTAL</div><div style="font-family:var(--mo);font-size:20px;font-weight:700;color:var(--ac)">'+totStock+'</div></div>'
    +'<div style="background:var(--s2);padding:12px 16px"><div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;margin-bottom:4px">COSTO PROM. POND.</div><div style="font-family:var(--mo);font-size:20px;font-weight:700;color:var(--ac2)">'+(costoP?'$'+fi(Math.round(costoP)):'—')+'</div></div>'
    +'<div style="background:var(--s2);padding:12px 16px"><div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;margin-bottom:4px">LOTES ACTIVOS</div><div style="font-family:var(--mo);font-size:20px;font-weight:700;color:var(--wn)">'+activos.length+'</div></div>'
    +'</div>';

  // Tabla lotes
  html+='<table class="inv-lote-tbl">'
    +'<thead><tr><th>ID Lote / Fecha</th><th style="text-align:right">Inicial</th><th style="text-align:right">Restante</th><th style="text-align:right">Costo/ud</th><th>Proveedor</th><th>Nota</th><th>Estado</th><th></th></tr></thead>'
    +'<tbody>';
  todos.forEach((l,i)=>{
    const agotado=l.qty_restante<=0;
    const pct=l.qty_inicial>0?Math.round(l.qty_restante/l.qty_inicial*100):0;
    const esPrimero=!agotado&&activos[0]&&activos[0].id===l.id;
    const estadoHtml=agotado
      ?'<span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">✓ Agotado</span>'
      :esPrimero
        ?'<span class="badge-st badge-ok">▶ Activo FIFO</span>'
        :'<span class="badge-st badge-warn">⏳ En espera</span>';
    html+='<tr style="opacity:'+(agotado?.5:1)+'">'
      +'<td><div style="font-family:var(--mo);font-size:9px;font-weight:700;color:var(--ac)">'+l.id+'</div><div style="font-family:var(--mo);font-size:8px;color:var(--tx3)">'+d2s(l.fecha.substring(0,10))+'</div></td>'
      +'<td style="text-align:right;font-family:var(--mo)">'+l.qty_inicial+'</td>'
      +'<td style="text-align:right;font-family:var(--mo);font-weight:700;color:'+(agotado?'var(--tx3)':'var(--tx)')+'">'+l.qty_restante+' <span style="font-size:8px;font-weight:400;color:var(--tx3)">('+pct+'%)</span></td>'
      +'<td style="text-align:right;font-family:var(--mo);color:var(--ac2)">$'+fi(l.costo_unitario)+'</td>'
      +'<td style="font-family:var(--mo);color:var(--tx2)">'+(l.proveedor||'—')+'</td>'
      +'<td style="font-family:var(--mo);font-size:9px;color:var(--tx3)">'+(l.nota||'—')+'</td>'
      +'<td>'+estadoHtml+'</td>'
      +'<td><button class="pm-btn del" data-del-lote="'+l.id+'" data-lote-item="'+itemId+'" style="font-size:8px">×</button></td>'
      +'</tr>';
  });
  html+='</tbody></table>';
  body.innerHTML=html;

  body.onclick=function(e){
    const delBtn=e.target.closest('[data-del-lote]');
    if(delBtn){
      const loteId=delBtn.getAttribute('data-del-lote');
      const iid=delBtn.getAttribute('data-lote-item');
      if(!confirm('¿Eliminar este lote? El stock se recalculará.'))return;
      const lotes=getLotes();
      if(lotes[iid])lotes[iid]=lotes[iid].filter(l=>l.id!==loteId);
      saveLotes(lotes);renderInvStock();renderLotesDetalle(iid);renderStockMiniPanel();sN('Lote eliminado');
    }
  };
}

// ════════════════════════════════════════
// MÓDULO INGRESOS
// ════════════════════════════════════════
function renderIngresoForm(){
  const prods=getProductos().filter(p=>p.activo!==false);
  const cont=document.getElementById('inv-ingreso-form');if(!cont)return;

  let prodOpts='<option value="">— Seleccioná un producto —</option>';
  prods.forEach(p=>{prodOpts+='<option value="'+p.id+'">'+p.emoji+' '+p.nombre+' ('+(p.unit||'ud')+')</option>';});

  const IS='width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:9px 11px;outline:none;min-height:var(--touch)';
  const LB='font-family:var(--mo);font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase';

  cont.innerHTML='<div class="inv-ingreso-grid">'
    +'<div><label style="'+LB+'">Producto</label><select id="ing-prod" style="'+IS+'">'+prodOpts+'</select></div>'
    +'<div><label style="'+LB+'">Fecha</label><input type="date" id="ing-fecha" value="'+hoy()+'" style="'+IS+'"></div>'
    +'<div><label style="'+LB+'">Cantidad</label><input type="number" id="ing-qty" min="1" placeholder="0" style="'+IS+'" oninput="ingPreview()"></div>'
    +'<div><label style="'+LB+'">Costo unitario (ARS)</label><input type="number" id="ing-costo" min="0" step="any" placeholder="0" style="'+IS+'" oninput="ingPreview()"></div>'
    +'<div><label style="'+LB+'">Proveedor (texto libre)</label><input type="text" id="ing-prov" placeholder="ej: Juan" style="'+IS+'"></div>'
    +'<div><label style="'+LB+'">Nota (texto libre)</label><input type="text" id="ing-nota" placeholder="ej: Lote verano" style="'+IS+'"></div>'
    +'</div>'
    +'<div id="ing-preview" style="padding:10px 16px;background:var(--s2);border-top:1px solid var(--br);border-bottom:1px solid var(--br);font-family:var(--mo);font-size:9px;color:var(--tx3);min-height:28px"></div>'
    +'<div style="padding:14px 16px;display:flex;gap:10px;align-items:center">'
    +'<button class="gbtn" id="ing-btn" onclick="registrarIngreso()" style="min-height:48px;font-size:10px;max-width:300px">📥 REGISTRAR INGRESO</button>'
    +'<span id="ing-msg" style="font-family:var(--mo);font-size:9px;color:var(--ac)"></span>'
    +'</div>';
}

function ingPreview(){
  const qty=parseFloat(document.getElementById('ing-qty')?.value)||0;
  const costo=parseFloat(document.getElementById('ing-costo')?.value)||0;
  const prev=document.getElementById('ing-preview');if(!prev)return;
  if(qty>0&&costo>0){
    prev.innerHTML='<span style="color:var(--ac)">Total lote: <b>$'+fi(qty*costo)+'</b></span>'
      +' · '+qty+' ud × $'+fi(costo)+'/ud';
  } else prev.textContent='';
}

function registrarIngreso(){
  const prod=document.getElementById('ing-prod')?.value;
  const fecha=document.getElementById('ing-fecha')?.value||hoy();
  const qty=parseFloat(document.getElementById('ing-qty')?.value)||0;
  const costo=parseFloat(document.getElementById('ing-costo')?.value)||0;
  const prov=document.getElementById('ing-prov')?.value.trim()||'';
  const nota=document.getElementById('ing-nota')?.value.trim()||'';

  if(!prod){sN('Seleccioná un producto',true);return;}
  if(!qty||qty<=0){sN('Cantidad requerida',true);return;}
  if(!costo||costo<=0){sN('Costo unitario requerido',true);return;}

  const id=newIngresoId();
  const ts=new Date().toISOString();

  // Crear lote
  const lotes=getLotes();
  if(!lotes[prod])lotes[prod]=[];
  const loteId=id+'-L1';
  lotes[prod].push({id:loteId,ingreso_id:id,fecha:ts,qty_inicial:qty,qty_restante:qty,
    costo_unitario:costo,proveedor:prov,nota});
  saveLotes(lotes);

  // Guardar ingreso
  const ing={id,fecha:ts,fecha_display:d2s(fecha)+' '+ts.substring(11,16),
    prod_id:prod,qty,costo_unitario:costo,total:qty*costo,proveedor:prov,nota,lote_id:loteId};
  saveIngreso(ing);

  // Mov
  addStockMov({fecha:ts,tipo:'S-TICKET',prodId:prod,
    nombre:getAllStockItems().find(x=>x.id===prod)?.nombre||prod,
    emoji:getAllStockItems().find(x=>x.id===prod)?.emoji||'📦',
    delta:qty,antes:getStockFromLotes(prod)-qty,despues:getStockFromLotes(prod),
    nota:'Ingreso '+id});

  // Reset form
  ['ing-qty','ing-costo','ing-prov','ing-nota'].forEach(fid=>{
    const el=document.getElementById(fid);if(el)el.value='';
  });
  document.getElementById('ing-preview').textContent='';
  const msg=document.getElementById('ing-msg');
  if(msg){msg.textContent='✓ '+id+' registrado';setTimeout(()=>msg.textContent='',3000);}
  renderProductosRegistrados();renderInvStock();renderStockMiniPanel();window.buildTicketUI?.();window.upd?.();
  // Auto-open product panel after registro
  setTimeout(()=>{
    const body=document.getElementById('preg-body-'+prod);
    const arr=document.getElementById('preg-arr-'+prod);
    if(body){body.style.display='';if(arr)arr.textContent='▾';}
    body?.scrollIntoView({behavior:'smooth',block:'nearest'});
  },100);
  sN('✓ Ingreso '+id+' registrado');
}

// ════════════════════════════════════════
// PRODUCTOS REGISTRADOS — expandible con historial de lotes
// ════════════════════════════════════════
function renderProductosRegistrados(){
  const cont=document.getElementById('inv-productos-registrados');if(!cont)return;
  const prods=getProductos().filter(p=>p.activo!==false);
  const ingresos=getIngresos();
  const SS='font-family:var(--mo);font-size:';
  let html='';

  prods.forEach(p=>{
    const pid=p.id;
    const stock=getStockFromLotes(pid);
    const costoLotes=getCostoPromedio(pid);  // from active lots
    const costoRef=costoLotes||p.costo||0;   // fallback to product cost
    const lotes=getLotesItem(pid);
    const ingProd=ingresos.filter(x=>x.prod_id===pid);
    const st=getStockStatus(stock,pid);
    const stCol=st==='ok'?'var(--ac)':st==='warn'?'var(--wn)':st==='crit'?'var(--er)':'var(--tx3)';
    const unit=p.unit||'ud';
    const sinLotes=!lotes.length;

    // Cost display: show lot cost if available, else show product defined cost
    const costoDisplay=costoLotes
      ?'$'+fi(Math.round(costoLotes))+'/'+unit+' <span style="'+SS+'8px;color:var(--tx3)">(prom. lotes)</span>'
      :p.costo
        ?'$'+fi(p.costo)+'/'+unit+' <span style="'+SS+'8px;color:var(--tx3)">(costo base — sin lotes)</span>'
        :'<span style="color:var(--er)">sin costo definido</span>';

    html+='<div class="preg-card" id="preg-'+pid+'">';
    // Header row — clickable
    html+='<div class="preg-hdr" data-preg-toggle="'+pid+'" style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;border-bottom:1px solid var(--br);transition:background .15s">'
      +'<span style="font-size:20px">'+p.emoji+'</span>'
      +'<div style="flex:1">'
        +'<div style="'+SS+'11px;font-weight:700;color:var(--tx)">'+p.nombre+'</div>'
        +'<div style="'+SS+'9px;color:var(--tx3);margin-top:2px">'
          +'<span style="'+SS+'9px;color:var(--tx2)">'+unit+'</span>'
          +' · ID: <span style="color:var(--ac2)">'+pid+'</span>'
          +(p.legacyKey?' · legacy: '+p.legacyKey:'')
        +'</div>'
        +'<div style="'+SS+'9px;margin-top:3px">'+costoDisplay+'</div>'
      +'</div>'
      +'<div style="text-align:right;margin-right:4px">'
        +'<div style="'+SS+'18px;font-weight:700;color:'+stCol+'">'+stock+' <span style="'+SS+'9px;font-weight:400;color:var(--tx3)">'+unit+'</span></div>'
        +(sinLotes?'<div style="'+SS+'8px;color:var(--wn)">⚠ sin lotes</div>':'')
      +'</div>'
      +'<div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">'
        +'<button class="pm-btn" data-edit-prod="'+pid+'" style="font-size:8px;white-space:nowrap">EDIT</button>'
        +'<button class="pm-btn del" data-del-prod="'+pid+'" style="font-size:8px;white-space:nowrap">✕</button>'
      +'</div>'
      +'<span class="preg-arrow" id="preg-arr-'+pid+'" style="'+SS+'14px;color:var(--tx3);margin-left:6px;transition:transform .2s">▸</span>'
    +'</div>';

    // Expandable body
    html+='<div id="preg-body-'+pid+'" style="display:none">';

    // Lotes section
    if(!lotes.length){
      const costoSugerido=p.costo||0;
      const qtySugerida=p.unit==='g'?500:50;
      html+='<div style="padding:16px;background:rgba(255,170,0,.04);border-bottom:1px solid rgba(255,170,0,.15)">'
        +'<div style="'+SS+'10px;color:var(--wn);font-weight:700;margin-bottom:8px">⚠ Sin lotes registrados</div>'
        +'<div style="'+SS+'9px;color:var(--tx3);margin-bottom:12px">Este producto tiene costo de adquisición definido ($'+fi(costoSugerido)+') pero no tiene lotes de stock. Podés registrar el primer ingreso:</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'
          +'<div><label style="'+SS+'8px;color:var(--tx2);display:block;margin-bottom:4px;letter-spacing:.8px;text-transform:uppercase">Cantidad inicial</label>'
            +'<input type="number" id="seed-qty-'+pid+'" value="'+qtySugerida+'" min="1" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:8px 10px;outline:none"></div>'
          +'<div><label style="'+SS+'8px;color:var(--tx2);display:block;margin-bottom:4px;letter-spacing:.8px;text-transform:uppercase">Costo/ud (ARS)</label>'
            +'<input type="number" id="seed-costo-'+pid+'" value="'+costoSugerido+'" min="0" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:8px 10px;outline:none"></div>'
        +'</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'
          +'<div><label style="'+SS+'8px;color:var(--tx2);display:block;margin-bottom:4px;letter-spacing:.8px;text-transform:uppercase">Proveedor (opcional)</label>'
            +'<input type="text" id="seed-prov-'+pid+'" placeholder="ej: Stock inicial" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:8px 10px;outline:none"></div>'
          +'<div><label style="'+SS+'8px;color:var(--tx2);display:block;margin-bottom:4px;letter-spacing:.8px;text-transform:uppercase">Nota (opcional)</label>'
            +'<input type="text" id="seed-nota-'+pid+'" placeholder="ej: Stock inicial" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:8px 10px;outline:none"></div>'
        +'</div>'
        +'<button class="btn btn-p" data-seed-prod="'+pid+'" style="font-size:10px;height:40px;padding:0 20px">📥 Registrar primer lote</button>'
      +'</div>';
    } else {
      // Summary strip
      const activos=lotes.filter(l=>l.qty_restante>0);
      const totStock=activos.reduce((a,l)=>a+l.qty_restante,0);
      const costoProm=totStock?activos.reduce((a,l)=>a+l.qty_restante*l.costo_unitario,0)/totStock:0;
      html+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--br)">';
      html+='<div style="background:var(--s2);padding:10px 14px"><div style="'+SS+'7px;color:var(--tx3);letter-spacing:1px;margin-bottom:3px">STOCK TOTAL</div><div style="'+SS+'18px;font-weight:700;color:var(--ac)">'+totStock+' '+unit+'</div></div>';
      html+='<div style="background:var(--s2);padding:10px 14px"><div style="'+SS+'7px;color:var(--tx3);letter-spacing:1px;margin-bottom:3px">COSTO PROM.</div><div style="'+SS+'18px;font-weight:700;color:var(--ac2)">'+(costoProm?'$'+fi(Math.round(costoProm)):'—')+'</div></div>';
      html+='<div style="background:var(--s2);padding:10px 14px"><div style="'+SS+'7px;color:var(--tx3);letter-spacing:1px;margin-bottom:3px">LOTES ACTIVOS</div><div style="'+SS+'18px;font-weight:700;color:var(--wn)">'+activos.length+'</div></div>';
      html+='</div>';

      // Lotes table
      html+='<div style="overflow-x:auto"><table class="inv-lote-tbl">'
        +'<thead><tr>'
        +'<th>ID Lote / Fecha</th>'
        +'<th style="text-align:right">Inicial</th>'
        +'<th style="text-align:right">Restante</th>'
        +'<th style="text-align:right">Costo/ud</th>'
        +'<th>Proveedor</th>'
        +'<th>Nota</th>'
        +'<th>Estado</th>'
        +'<th></th>'
        +'</tr></thead><tbody>';

      lotes.forEach(l=>{
        const agotado=l.qty_restante<=0;
        const pct=l.qty_inicial>0?Math.round(l.qty_restante/l.qty_inicial*100):0;
        const esPrimero=!agotado&&activos[0]&&activos[0].id===l.id;
        const estadoHtml=agotado
          ?'<span style="'+SS+'8px;color:var(--tx3)">✓ Agotado</span>'
          :esPrimero
            ?'<span class="badge-st badge-ok">▶ Activo</span>'
            :'<span class="badge-st badge-warn">⏳ En espera</span>';
        // Find associated ingreso for edit
        const ingId=l.ingreso_id||'';
        html+='<tr style="opacity:'+(agotado?.5:1)+'">'
          +'<td><div style="'+SS+'9px;font-weight:700;color:var(--ac)">'+l.id+'</div>'
            +'<div style="'+SS+'8px;color:var(--tx3)">'+d2s((l.fecha||'').substring(0,10))+'</div>'
            +(ingId?'<div style="'+SS+'7px;color:var(--tx3)">'+ingId+'</div>':'')
          +'</td>'
          +'<td style="text-align:right;'+SS+'11px">'+l.qty_inicial+'</td>'
          +'<td style="text-align:right;'+SS+'11px;font-weight:700;color:'+(agotado?'var(--tx3)':'var(--tx)')+'">'+l.qty_restante+' <span style="'+SS+'8px;font-weight:400;color:var(--tx3)">('+pct+'%)</span></td>'
          +'<td style="text-align:right;'+SS+'11px;color:var(--ac2)">$'+fi(l.costo_unitario)+'</td>'
          +'<td style="'+SS+'10px;color:var(--tx2)">'+(l.proveedor||'—')+'</td>'
          +'<td style="'+SS+'9px;color:var(--tx3)">'+(l.nota||'—')+'</td>'
          +'<td>'+estadoHtml+'</td>'
          +'<td style="display:flex;gap:3px;padding:4px">'
            +(ingId?'<button class="pm-btn" data-edit-ing="'+ingId+'" style="'+SS+'8px">✏</button>':'')
            +'<button class="pm-btn del" data-del-lote="'+l.id+'" data-lote-prod="'+pid+'" style="'+SS+'8px">×</button>'
          +'</td>'
          +'</tr>';
      });
      html+='</tbody></table></div>';
    }

    // Ingresos relacionados count
    html+='<div style="padding:10px 14px;border-top:1px solid var(--br);display:flex;align-items:center;justify-content:space-between">'
      +'<span style="'+SS+'9px;color:var(--tx3)">'+ingProd.length+' ingresos registrados</span>'
      +'<button class="btn btn-p" data-nuevo-ing="'+pid+'" style="'+SS+'9px;height:30px;padding:0 12px">+ Registrar nuevo ingreso</button>'
    +'</div>';

    html+='</div>';// /preg-body
    html+='</div>';// /preg-card
  });

  cont.innerHTML=html||'<div style="padding:20px;font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center">Sin productos registrados.</div>';

  // Event delegation
  cont.onclick=function(e){
    const toggle=e.target.closest('[data-preg-toggle]');
    if(toggle&&!e.target.closest('button')){
      const pid=toggle.getAttribute('data-preg-toggle');
      const body=document.getElementById('preg-body-'+pid);
      const arr=document.getElementById('preg-arr-'+pid);
      if(!body)return;
      const open=body.style.display==='none';
      body.style.display=open?'':'none';
      if(arr)arr.textContent=open?'▾':'▸';
      toggle.style.background=open?'var(--s2)':'';
      return;
    }
    const editProd=e.target.closest('[data-edit-prod]');
    if(editProd){window.editarProducto?.(editProd.getAttribute('data-edit-prod'));return;}

    const delProd=e.target.closest('[data-del-prod]');
    if(delProd){eliminarProductoRegistrado(delProd.getAttribute('data-del-prod'));return;}

    const editIng=e.target.closest('[data-edit-ing]');
    if(editIng){editarIngreso(editIng.getAttribute('data-edit-ing'));return;}

    const delLote=e.target.closest('[data-del-lote]');
    if(delLote){
      const loteId=delLote.getAttribute('data-del-lote');
      const pid=delLote.getAttribute('data-lote-prod');
      if(!confirm('¿Eliminar este lote? El stock se recalculará.'))return;
      // Also delete associated ingreso
      const ingresos=getIngresos();
      const ing=ingresos.find(x=>x.lote_id===loteId);
      const lotes=getLotes();
      if(lotes[pid])lotes[pid]=lotes[pid].filter(l=>l.id!==loteId);
      saveLotes(lotes);
      if(ing)deleteIngreso(ing.id);
      renderProductosRegistrados();renderInvStock();renderStockMiniPanel();sN('Lote eliminado');
      // Re-open the panel
      setTimeout(()=>{
        const body=document.getElementById('preg-body-'+pid);
        const arr=document.getElementById('preg-arr-'+pid);
        if(body){body.style.display='';if(arr)arr.textContent='▾';}
      },50);
      return;
    }

    const nuevoIng=e.target.closest('[data-nuevo-ing]');
    if(nuevoIng){
      const pid=nuevoIng.getAttribute('data-nuevo-ing');
      // Pre-select product in form and scroll up
      invSubNav('ingresos');
      setTimeout(()=>{
        const sel=document.getElementById('ing-prod');
        if(sel){sel.value=pid;ingPreview();}
        document.getElementById('inv-ingreso-form')?.scrollIntoView({behavior:'smooth',block:'start'});
      },80);
      return;
    }

    const seedBtn=e.target.closest('[data-seed-prod]');
    if(seedBtn){
      const pid=seedBtn.getAttribute('data-seed-prod');
      const qty=parseFloat(document.getElementById('seed-qty-'+pid)?.value)||1;
      const costo=parseFloat(document.getElementById('seed-costo-'+pid)?.value)||0;
      const prov=document.getElementById('seed-prov-'+pid)?.value.trim()||'Stock inicial';
      const nota=document.getElementById('seed-nota-'+pid)?.value.trim()||'Lote inicial';
      if(!costo){sN('Ingresá el costo unitario',true);return;}
      // Register as a proper ingreso
      const id=newIngresoId();
      const ts=new Date().toISOString();
      const fecha_display=d2s(hoy())+' '+ts.substring(11,16);
      const lotes=getLotes();
      if(!lotes[pid])lotes[pid]=[];
      const loteId=id+'-L1';
      lotes[pid].push({id:loteId,ingreso_id:id,fecha:ts,qty_inicial:qty,qty_restante:qty,costo_unitario:costo,proveedor:prov,nota});
      saveLotes(lotes);
      saveIngreso({id,fecha:ts,fecha_display,prod_id:pid,qty,costo_unitario:costo,total:qty*costo,proveedor:prov,nota,lote_id:loteId});
      addStockMov({fecha:ts,tipo:'S-TICKET',prodId:pid,nombre:getAllStockItems().find(x=>x.id===pid)?.nombre||pid,emoji:getAllStockItems().find(x=>x.id===pid)?.emoji||'📦',delta:qty,antes:0,despues:qty,nota:'Lote inicial '+id});
      renderProductosRegistrados();renderInvStock();renderStockMiniPanel();window.buildTicketUI?.();window.upd?.();
      sN('✓ '+id+' — lote inicial registrado');
      // Re-open this product's panel
      setTimeout(()=>{
        const body=document.getElementById('preg-body-'+pid);
        const arr=document.getElementById('preg-arr-'+pid);
        if(body){body.style.display='';if(arr)arr.textContent='▾';}
      },80);
      return;
    }
  };
}

function eliminarProductoRegistrado(pid){
  const p=getProductos().find(x=>x.id===pid);if(!p)return;
  const stock=getStockFromLotes(pid);
  const msg=stock>0
    ?`¿Eliminar ${p.emoji} ${p.nombre}? Tiene ${stock} ${p.unit||'ud'} en stock. También se eliminarán todos sus lotes e ingresos.`
    :`¿Eliminar ${p.emoji} ${p.nombre} del sistema?`;
  if(!confirm(msg))return;
  // Remove lotes
  const lotes=getLotes();
  delete lotes[pid];
  saveLotes(lotes);
  // Remove ingresos
  const d=ld();
  d.ingresos=(d.ingresos||[]).filter(x=>x.prod_id!==pid);
  // Deactivate product (safer than full delete for legacy compat)
  const prods=getProductos();
  const idx=prods.findIndex(x=>x.id===pid);
  if(idx>=0)prods.splice(idx,1);
  d.productos=prods;
  sd(d);
  loadConfig();window.buildTicketUI?.();window.upd?.();renderProductosRegistrados();renderInvStock();renderStockMiniPanel();
  sN(`${p.nombre} eliminado`);
}

function renderIngresosHistorial(){
  // Legacy alias — now rendered inside renderProductosRegistrados
  renderProductosRegistrados();
}

function editarIngreso(id){
  const ing=getIngresos().find(x=>x.id===id);if(!ing)return;
  const IS='width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:8px 10px;outline:none;min-height:40px';
  const LB='font-family:var(--mo);font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase';

  document.getElementById('mTitEl').textContent='✏ Editar Ingreso — '+id;
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal';
  document.getElementById('mTk').style.display='none';
  document.getElementById('mBody').innerHTML=
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
    +'<div style="grid-column:1/-1"><label style="'+LB+'">ID</label><input style="'+IS+';color:var(--tx3)" value="'+id+'" disabled></div>'
    +'<div><label style="'+LB+'">Cantidad</label><input type="number" id="edit-ing-qty" value="'+ing.qty+'" style="'+IS+'"></div>'
    +'<div><label style="'+LB+'">Costo unitario</label><input type="number" id="edit-ing-costo" value="'+ing.costo_unitario+'" style="'+IS+'"></div>'
    +'<div><label style="'+LB+'">Proveedor</label><input type="text" id="edit-ing-prov" value="'+(ing.proveedor||'')+'" style="'+IS+'"></div>'
    +'<div><label style="'+LB+'">Nota</label><input type="text" id="edit-ing-nota" value="'+(ing.nota||'')+'" style="'+IS+'"></div>'
    +'</div>';
  document.getElementById('mFooter').innerHTML=
    '<button class="btn btn-p" id="edit-ing-save">💾 Guardar</button>'
    +'<button class="btn btn-s" onclick="clM()">✕ Cancelar</button>';
  document.getElementById('edit-ing-save').onclick=function(){
    const qty=parseFloat(document.getElementById('edit-ing-qty').value)||0;
    const costo=parseFloat(document.getElementById('edit-ing-costo').value)||0;
    if(!qty||!costo){sN('Cantidad y costo requeridos',true);return;}
    const diff=qty-ing.qty;
    ing.qty=qty;ing.costo_unitario=costo;ing.total=qty*costo;
    ing.proveedor=document.getElementById('edit-ing-prov').value.trim();
    ing.nota=document.getElementById('edit-ing-nota').value.trim();
    saveIngreso(ing);
    // Update lote
    const lotes=getLotes();
    if(lotes[ing.prod_id]){
      const lote=lotes[ing.prod_id].find(l=>l.id===ing.lote_id);
      if(lote){lote.qty_inicial=qty;lote.qty_restante=Math.max(0,lote.qty_restante+diff);
        lote.costo_unitario=costo;lote.proveedor=ing.proveedor;lote.nota=ing.nota;}
      saveLotes(lotes);
    }
    window.clM?.();renderProductosRegistrados();renderInvStock();renderStockMiniPanel();sN('✓ Ingreso actualizado');
  };
  document.getElementById('modal').classList.add('open');
}

function eliminarIngreso(id){
  if(!confirm('¿Eliminar ingreso '+id+'? El lote asociado también se eliminará.'))return;
  const ing=getIngresos().find(x=>x.id===id);
  if(ing){
    const lotes=getLotes();
    if(lotes[ing.prod_id])lotes[ing.prod_id]=lotes[ing.prod_id].filter(l=>l.id!==ing.lote_id);
    saveLotes(lotes);
  }
  deleteIngreso(id);
  renderProductosRegistrados();renderInvStock();renderStockMiniPanel();sN('Ingreso eliminado');
}

// ════════════════════════════════════════
// RECONCILIACIÓN LOTES ↔ STOCK PLANO
// ════════════════════════════════════════
// Propósito: sincronizar qty_restante de lotes con el stock plano (fuente de verdad histórica).
// Necesario cuando lotes fueron seeded con valor distinto al stock real acumulado.
// Es idempotente: si ya están sincronizados, no modifica nada.
function reconcileLotesConStock(){
  const stock=getStock();
  const lotes=getLotes();
  const prods=Object.keys(lotes);
  if(!prods.length){sN('Sin lotes registrados para reconciliar');return;}

  let cambios=0;
  const detalle=[];
  prods.forEach(prodId=>{
    const plano=stock[prodId]||0;
    const items=lotes[prodId]||[];
    items.sort((a,b)=>a.fecha.localeCompare(b.fecha));// FIFO: más antiguo primero
    const totalRest=items.reduce((a,l)=>a+l.qty_restante,0);
    if(totalRest===plano)return;// ya sincronizados
    const diff=plano-totalRest;// + = necesita agregar, - = necesita drenar
    const prod=getProductos().find(p=>p.id===prodId);
    const nombre=(prod?prod.nombre:prodId);const emoji=(prod?prod.emoji:'📦');
    if(diff>0){
      // Plano tiene más que lotes: agregar al lote más reciente
      const last=items[items.length-1];
      if(last){
        last.qty_restante+=diff;cambios++;detalle.push(`${prodId}: +${diff}`);
        addStockMov({fecha:new Date().toISOString(),tipo:'AJUSTE',prodId,nombre,emoji,delta:diff,antes:totalRest,despues:plano,nota:'Reconciliación lotes↔plano'});
      }
    } else {
      // Lotes tienen más que plano: drenar desde el más antiguo (FIFO)
      let aDrenar=-diff;
      for(const l of items){
        if(aDrenar<=0)break;
        const consume=Math.min(l.qty_restante,aDrenar);
        l.qty_restante-=consume;aDrenar-=consume;
      }
      cambios++;detalle.push(`${prodId}: -${-diff}`);
      addStockMov({fecha:new Date().toISOString(),tipo:'AJUSTE',prodId,nombre,emoji,delta:diff,antes:totalRest,despues:plano,nota:'Reconciliación lotes↔plano'});
    }
  });

  if(cambios>0){
    saveLotes(lotes);
    renderInvStock();renderStockMiniPanel();window.buildTicketUI?.();window.upd?.();
    sN(`✓ ${cambios} producto(s) reconciliados: ${detalle.join(', ')}`);
  } else {
    sN('✓ Lotes ya sincronizados con stock plano — sin cambios');
  }
}

// Calcula divergencia total entre lotes y stock plano (para mostrar warning)
function _calcDivergencia(){
  const stock=getStock();const lotes=getLotes();
  let total=0;
  Object.keys(lotes).forEach(prodId=>{
    const plano=stock[prodId]||0;
    const loteRest=(lotes[prodId]||[]).reduce((a,l)=>a+l.qty_restante,0);
    total+=Math.abs(loteRest-plano);
  });
  return total;
}

// ── Render principal ──
function renderInvStock(){
  renderInvStockTabla();
}

function renderInventario(){
  invSubNav('ingresos');
}

function renderInventarioTabla(){renderInvStockTabla();}

// ── Historial de movimientos global (tab movs) ──
function renderStockHistorial(){
  const allMovs=getStockMovs();
  const cont=document.getElementById('stockHistorial');if(!cont)return;
  const filtType=document.getElementById('filtSMov')?.value||'all';
  const indexed=allMovs.map((m,i)=>({m,i})).reverse();
  let filtered=indexed;
  if(filtType==='VENTA')filtered=indexed.filter(x=>x.m.tipo==='VENTA');
  else if(filtType==='AJUSTE')filtered=indexed.filter(x=>x.m.tipo==='AJUSTE');

  if(!filtered.length){
    cont.innerHTML='<div style="padding:20px;font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center">Sin movimientos.</div>';
    return;
  }
  const groups={};
  filtered.forEach(x=>{
    const dia=x.m.fecha?x.m.fecha.substring(0,10):'—';
    if(!groups[dia])groups[dia]=[];groups[dia].push(x);
  });
  const dias=Object.keys(groups).sort().reverse();
  const hoyStr=hoy();let html='';
  dias.forEach(dia=>{
    const isHoy=dia===hoyStr;
    const items=groups[dia];
    const colId='smov-'+dia.replace(/-/g,'');
    const totD=items.reduce((a,x)=>a+(x.m.delta||0),0);
    const dCls=totD>0?'var(--ac)':'var(--er)';
    html+='<div style="margin-bottom:4px">'
      +'<div data-toggle-grp="'+colId+'" style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--s2);border:1px solid var(--br);cursor:pointer;border-left:3px solid '+(isHoy?'var(--ac)':'var(--br)')+'">'
      +'<div style="display:flex;align-items:center;gap:8px"><span id="'+colId+'-arrow" style="font-family:var(--mo);font-size:10px;color:var(--tx3)">'+(isHoy?'▾':'▸')+'</span>'
      +'<span style="font-family:var(--mo);font-size:9px;font-weight:700;color:'+(isHoy?'var(--ac)':'var(--tx2)')+'">'+d2s(dia)+'</span>'
      +'<span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">'+items.length+' mov.</span></div>'
      +'<span style="font-family:var(--mo);font-size:10px;color:'+dCls+'">'+(totD>0?'+':'')+totD+'</span></div>'
      +'<div id="'+colId+'" style="display:'+(isHoy?'block':'none')+'">';
    items.forEach(({m,i})=>{
      const d=new Date(m.fecha);
      const hora=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
      const dc=m.delta>0?'var(--ac)':'var(--er)';
      const tp={
        'VENTA':   {bg:'rgba(255,68,85,.1)',   col:'#ff4455',  lbl:'VENTA'},
        'S-TICKET':{bg:'rgba(0,229,160,.1)',   col:'#00e5a0',  lbl:'INGRESO'},
        'AJUSTE':  {bg:'rgba(255,170,0,.1)',   col:'#ffaa00',  lbl:'AJUSTE'},
      }[m.tipo]||{bg:'rgba(136,136,160,.1)',col:'var(--tx3)',lbl:m.tipo||'—'};
      // Show ingreso ID from nota if available
      const notaStr=m.nota?(' · <span style="color:var(--ac2)">'+m.nota+'</span>'):'';
      html+='<div style="display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:1px solid rgba(42,42,58,.2);background:var(--s1)">'
        +'<span style="font-family:var(--mo);font-size:8px;color:var(--tx3);width:32px;flex-shrink:0">'+hora+'</span>'
        +'<span style="font-family:var(--mo);font-size:7px;font-weight:700;padding:2px 6px;background:'+tp.bg+';color:'+tp.col+';border:1px solid '+tp.col+'40;flex-shrink:0">'+tp.lbl+'</span>'
        +'<span style="font-size:12px;flex-shrink:0">'+(m.emoji||'')+'</span>'
        +'<span style="font-family:var(--mo);font-size:10px;color:var(--tx2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(m.nombre||m.prodId||'')+notaStr+'</span>'
        +'<span style="font-family:var(--mo);font-size:9px;color:var(--tx3);flex-shrink:0">'+m.antes+'</span>'
        +'<span style="font-family:var(--mo);font-size:11px;font-weight:700;color:'+dc+';flex-shrink:0">'+(m.delta>0?'+':'')+m.delta+'</span>'
        +'<span style="font-family:var(--mo);font-size:11px;font-weight:700;color:var(--tx);flex-shrink:0">'+m.despues+'</span>'
        +'<button data-del-mov="'+i+'" style="background:none;border:1px solid var(--br);color:var(--tx3);font-size:11px;width:22px;height:22px;cursor:pointer;flex-shrink:0">×</button>'
        +'</div>';
    });
    html+='</div></div>';
  });
  cont.innerHTML=html;
  cont.onclick=function(e){
    const delBtn=e.target.closest('[data-del-mov]');
    if(delBtn){const idx=parseInt(delBtn.getAttribute('data-del-mov'));if(!confirm('¿Eliminar?'))return;eliminarMov(idx);return;}
    const tog=e.target.closest('[data-toggle-grp]');
    if(tog){const id=tog.getAttribute('data-toggle-grp');const el=document.getElementById(id);const ar=document.getElementById(id+'-arrow');if(!el)return;const open=el.style.display==='none';el.style.display=open?'block':'none';if(ar)ar.textContent=open?'▾':'▸';}
  };
}


// ── ticket stock discount ──
// INVARIANTE: stock plano (d.stock) es la fuente de verdad histórica — se decrementa
// con su propia matemática. consumirStock decrementa lotes en paralelo (FIFO cost tracking).
// NO usar getActualQty() para calcular 'despues' — los lotes pueden estar desincronizados
// con el plano hasta que el usuario corra reconcileLotesConStock().
function descontarStockPorTicket(lineas){
  const stock=getStock();const fecha=new Date().toISOString();
  lineas.forEach(ln=>{
    if(ln.consulta||!ln.qty)return;
    const key=ln.varId||ln.prodId;
    consumirStock(key,ln.qty);              // decrementa FIFO en d.lotes (si existen)
    const antes=stock[key]||0;             // plano: fuente de verdad histórica
    const despues=Math.max(0,antes-ln.qty);
    stock[key]=despues;
    addStockMov({fecha,tipo:'VENTA',prodId:key,nombre:ln.nombre,emoji:ln.emoji,delta:-(antes-despues),antes,despues,nota:'Ticket generado'});
    if(ln.varId&&ln.prodId){
      const grpKey='grp-'+ln.prodId;
      if(stock[grpKey]!=null){
        const gA=stock[grpKey]||0;const gD=Math.max(0,gA-ln.qty);stock[grpKey]=gD;
      }
    }
  });
  saveStock(stock);
}

// ── ticket mini-panel alerts ──
function renderStockMiniPanel(){
  // Panel de advertencias eliminado — stock visible en 📦 Inventario
}

// ── dashboard stock panel (sin KPI counters) ──
function renderDashStock(f){
  const allItems=getAllStockItems();const stock=getStock();
  let orders=gOConf();
  const cont=document.getElementById('dashStockPanel');if(!cont)return;

  let periodDays=30,periodLabel='mes';
  if(f==='rango'){
    const desde=document.getElementById('dashDesde')?.value;
    const hasta=document.getElementById('dashHasta')?.value;
    if(desde&&hasta){
      orders=orders.filter(o=>o.fecha>=desde&&o.fecha<=hasta);
      const d1=new Date(desde),d2=new Date(hasta);
      periodDays=Math.max(1,Math.round((d2-d1)/(1000*60*60*24)));
      periodLabel=`${periodDays}d`;
    }
  } else if(f!=='all'){
    orders=orders.filter(o=>o.mesActual===f);
    periodLabel=mL(f);
  }

  const topItems=allItems.filter(it=>!it.parentId||it.isGroup);
  const childItems=allItems.filter(it=>it.parentId&&!it.isGroup);

  const soldMap={};
  orders.forEach(o=>{
    const p=o.productos||{};
    if(p._lineas&&p._lineas.length){
      p._lineas.forEach(ln=>{
        const k=ln.varId||ln.prodId;
        soldMap[k]=(soldMap[k]||0)+(ln.qty||0);
        if(ln.varId){soldMap['grp-'+ln.prodId]=(soldMap['grp-'+ln.prodId]||0)+(ln.qty||0);}
      });
    } else {
      if((p.calaveras||0)>0){soldMap['p-past']=(soldMap['p-past']||0)+(p.calaveras||0);soldMap['v-cal']=(soldMap['v-cal']||0)+(p.calaveras||0);}
      if((p.teddy||0)>0){soldMap['p-past']=(soldMap['p-past']||0)+(p.teddy||0);soldMap['v-ted']=(soldMap['v-ted']||0)+(p.teddy||0);}
      if((p.lucky||0)>0){soldMap['p-past']=(soldMap['p-past']||0)+(p.lucky||0);soldMap['v-lck']=(soldMap['v-lck']||0)+(p.lucky||0);}
      if((p.genericas||0)>0){soldMap['p-past']=(soldMap['p-past']||0)+(p.genericas||0);soldMap['v-gen']=(soldMap['v-gen']||0)+(p.genericas||0);}
      if((p.cristales||0)>0) soldMap['p-cris']=(soldMap['p-cris']||0)+(p.cristales||0);
      if((p.hongos||0)>0) soldMap['p-hong']=(soldMap['p-hong']||0)+(p.hongos||0);
      if((p.goteros||0)>0) soldMap['p-got']=(soldMap['p-got']||0)+(p.goteros||0);
      if((p.petri||0)>0) soldMap['p-pet']=(soldMap['p-pet']||0)+(p.petri||0);
    }
  });

  function stEmoji(st){
    if(st==='empty') return'⛔';
    if(st==='crit')  return'🔴';
    if(st==='warn')  return'🟡';
    return'🟢';
  }
  function qtyStr(qty,unit,st){
    const col=st==='ok'?'var(--ac)':st==='warn'?'var(--wn)':'var(--er)';
    return`<span style="font-family:var(--mo);font-weight:700;color:${col}">${qty}${unit}</span>`;
  }
  function daysLeft(qty,sold){
    if(sold<=0||qty<=0)return'—';
    const r=sold/periodDays;
    return r>0?'~'+Math.floor(qty/r)+'d':'—';
  }

  let rows='';
  topItems.forEach(it=>{
    const qty=stock[it.id]||0;
    const st=getStockStatus(qty,it.id);
    const unit=it.unit||'ud';
    const sold=soldMap[it.id]||0;

    if(it.isGroup){
      const children=childItems.filter(c=>c.parentId===it.id);
      rows+=`<tr style="background:rgba(124,111,255,.06)">
        <td><span style="color:var(--ac2);font-size:10px">▸</span> ${it.emoji} ${it.nombre} <span style="font-family:var(--mo);font-size:7px;color:var(--ac2)">GRP</span></td>
        <td>${stEmoji(st)} ${qtyStr(qty,unit,st)}</td>
        <td class="mu">${sold||'—'}</td>
        <td class="mu">${daysLeft(qty,sold)}</td>
      </tr>`;
      children.forEach(c=>{
        const cqty=stock[c.id]||0;const cst=getStockStatus(cqty,c.id);const csold=soldMap[c.id]||0;
        rows+=`<tr style="opacity:.85">
          <td style="padding-left:20px"><span style="color:var(--tx3)">↳</span> ${c.emoji} ${c.nombre}</td>
          <td>${stEmoji(cst)} ${qtyStr(cqty,unit,cst)}</td>
          <td class="mu">${csold||'—'}</td>
          <td class="mu">${daysLeft(cqty,csold)}</td>
        </tr>`;
      });
    } else {
      rows+=`<tr>
        <td>${it.emoji} ${it.nombre}</td>
        <td>${stEmoji(st)} ${qtyStr(qty,unit,st)}</td>
        <td class="mu">${sold||'—'}</td>
        <td class="mu">${daysLeft(qty,sold)}</td>
      </tr>`;
    }
  });

  cont.innerHTML=`<div class="tw"><table>
    <thead><tr><th>Producto</th><th>Stock</th><th>Vendido ${periodLabel}</th><th>Días est.</th></tr></thead>
    <tbody>${rows||'<tr><td colspan="4" style="text-align:center;color:var(--tx3);padding:20px">Sin datos</td></tr>'}</tbody>
  </table></div>`;
}

// ══════════════════════════════════════════════════════

function renderStockEntryForm(){
  const items=getAllStockItems();
  const cont=document.getElementById('stockEntryForm');if(!cont)return;
  let options = items.map(it=>`<option value="${it.nombre}" data-id="${it.id}">`).join('');
  cont.innerHTML=`
    <div style="background:var(--s1);padding:15px;border:1px solid var(--br);border-radius:4px">
      <div style="font-family:var(--mo);font-size:11px;color:var(--ac);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:8px">
        <span>📥 Registrar Entrada de Mercadería</span>
        <span style="font-size:8px;color:var(--tx3);background:var(--s2);padding:2px 6px;border-radius:10px">S-TICKET</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
        <div>
          <label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Producto / Variante</label>
          <input type="text" id="s-prod-name" list="prodList" placeholder="Escribe o selecciona..." style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none">
          <datalist id="prodList">${options}</datalist>
        </div>
        <div>
          <label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Fecha</label>
          <input type="date" id="s-fecha" value="${hoy()}" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:15px">
        <div>
          <label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Cantidad</label>
          <input type="number" id="s-qty" placeholder="0.00" step="any" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none">
        </div>
        <div>
          <label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Costo Reposición (opcional)</label>
          <input type="number" id="s-costo" placeholder="$ 0.00" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none">
        </div>
        <div>
          <label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Nota / Lote</label>
          <input type="text" id="s-nota" placeholder="Ej: Lote A1" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none">
        </div>
      </div>
      <button class="btn btn-p" style="width:100%;height:44px" onclick="generarStockTicket()">💾 Registrar Entrada y Generar S-Ticket</button>
    </div>`;
}

function generarStockTicket(){
  const name=document.getElementById('s-prod-name').value.trim();
  const qty=parseFloat(document.getElementById('s-qty').value)||0;
  const costoUsd=parseFloat(document.getElementById('s-costo').value)||0;
  const fecha=document.getElementById('s-fecha').value||hoy();
  const nota=document.getElementById('s-nota').value.trim();
  if(!name||qty<=0){sN('ERROR: Producto y cantidad requeridos',true);return;}
  const prods=getProductos();const items=getAllStockItems();
  const matched=items.find(it=>it.nombre.toLowerCase()===name.toLowerCase());
  let targetId=null;let emoji='📦';let displayName=name;let unit='ud';
  if(matched){
    targetId=matched.id;emoji=matched.emoji;displayName=matched.nombre;unit=matched.unit;
  } else {
    if(!confirm(`El producto "${name}" no existe. ¿Crearlo automáticamente?`))return;
    const newId=uid();
    prods.push({id:newId,emoji:'📦',nombre:name,costo:0,unit:'ud',tipo:'fijo',agrupacion:'individual',tramos:[{t:1,p:0}],variantes:[],activo:true});
    saveProductos(prods);loadConfig();window.buildTicketUI?.();window.upd?.();
    targetId=newId;
  }
  // Crear lote FIFO
  agregarLote(targetId,{qty,costoUsd:costoUsd||0,fecha,nota:nota||'Entrada de mercadería'});
  const tc=window._blueARS||window._usdtARS||1;
  const costoArs=costoUsd?costoUsd*tc:0;
  const fd=d2s(fecha);
  let tk=`🧾 S-Ticket Entrada\n📅 Fecha: ${fd}\n📦 ${emoji} ${displayName}\n📥 +${qty} ${unit}`;
  if(costoUsd)tk+=`\n💵 Costo: US$${fu(costoUsd)}/ud · TC $${fi(Math.round(tc))} = $${fi(Math.round(costoArs))}/ud`;
  if(nota)tk+=`\n📝 ${nota}`;
  tk+=`\n📊 Stock nuevo: ${getActualQty(targetId)} ${unit}`;
  sN(`✓ Lote registrado: ${qty} ud`);
  renderInventario();
  document.getElementById('mTitEl').textContent='📥 Entrada Registrada';
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal';
  document.getElementById('mTk').style.display='block';
  document.getElementById('mTk').className='mtk';
  document.getElementById('mTk').textContent=tk;
  document.getElementById('mBody').innerHTML='';
  document.getElementById('mFooter').innerHTML=`<button class="btn btn-s" onclick="cpM()">⎘ Copiar</button><button class="btn btn-s" onclick="clM()">✕ Cerrar</button>`;
  document.getElementById('modal').classList.add('open');
}


// ===== modules/settings.js =====

function renderSettings(){
  loadAparienciaForm();
  const saved=getApariencia();
  const activePreset=saved?._preset||'dark';
  updateThemeCards(activePreset);
}


// ===== modules/liquidez.js =====

// Separate dist slices for liquidez externa
const LIQ_DIST_DEFAULTS=[{id:'ls1',label:'Bitcoin',pct:50,color:'#ff6b35',activo:'BTC'},{id:'ls2',label:'Dolar Blue',pct:50,color:'#ffaa00',activo:'USD_BLUE'}];
let liqDistSlices=JSON.parse(localStorage.getItem('me_liq_dist_slices')||'null')||LIQ_DIST_DEFAULTS.map(function(x){return Object.assign({},x);});

function sLiqExterna(l) {
  const d = ld();
  if (!d.liquidezExterna) d.liquidezExterna = [];
  d.liquidezExterna.push(l);
  sd(d);
  ghAutoPush();
}

function saveLiqSlices(){localStorage.setItem('me_liq_dist_slices',JSON.stringify(liqDistSlices));}

function autoBalanceLiq(ci){
  const tot=liqDistSlices.reduce(function(a,s){return a+s.pct;},0);
  if(Math.abs(tot-100)<0.1)return;
  const diff=100-tot;const others=liqDistSlices.filter(function(_,i){return i!==ci;});
  if(!others.length)return;
  const pp=diff/others.length;others.forEach(function(s){s.pct=Math.max(0,parseFloat((s.pct+pp).toFixed(1)));});
  const nt=liqDistSlices.reduce(function(a,s){return a+s.pct;},0);
  if(Math.abs(nt-100)>0.1){const li=liqDistSlices.length-1===ci?liqDistSlices.length-2:liqDistSlices.length-1;if(liqDistSlices[li])liqDistSlices[li].pct=parseFloat(Math.max(0,liqDistSlices[li].pct+(100-nt)).toFixed(1));}
}

function renderLiqDistConfig(){
  const cont=document.getElementById('liqDistSlices');if(!cont)return;
  const COLS=['#ff6b35','#ffaa00','#00e5a0','#7c6fff','#ff4455','#44aaff','#e0c080','#cc88ff'];
  let html='';
  liqDistSlices.forEach(function(s,i){
    html+='<div style="display:grid;grid-template-columns:22px 1fr 60px 28px;gap:6px;align-items:center;margin-bottom:6px">'
      +'<div style="width:16px;height:16px;background:'+s.color+';border-radius:2px;cursor:pointer" onclick="cycleLiqColor('+i+')"></div>'
      +'<input type="text" value="'+s.label+'" oninput="liqDistSlices['+i+'].label=this.value;saveLiqSlices()" style="min-height:34px;font-size:11px;padding:4px 8px">'
      +'<div style="display:flex;align-items:center;gap:2px"><input type="number" min="0" max="100" value="'+s.pct+'" onchange="liqDistSlices['+i+'].pct=Math.max(0,Math.min(100,parseFloat(this.value)||0));autoBalanceLiq('+i+');saveLiqSlices();renderLiqDistConfig();renderLiqExterna()" style="min-height:34px;font-size:11px;padding:4px 4px;width:42px"><span style="font-family:var(--mo);font-size:9px;color:var(--tx3)">%</span></div>'
      +(liqDistSlices.length>1?'<button class="qrst" onclick="removeLiqSlice('+i+')" style="height:34px">x</button>':'<div></div>')
      +'</div>';
  });
  const tot=liqDistSlices.reduce(function(a,s){return a+s.pct;},0);
  html+='<div style="font-family:var(--mo);font-size:9px;color:'+(Math.abs(tot-100)<0.5?'var(--ac)':'var(--er)')+'">'+(Math.abs(tot-100)<0.5?'✓ Balanceado':'Auto-balance pendiente')+' · Total: '+tot.toFixed(1)+'%</div>';
  cont.innerHTML=html;
}

function cycleLiqColor(i){const cols=['#ff6b35','#ffaa00','#00e5a0','#7c6fff','#ff4455','#44aaff','#e0c080','#cc88ff'];const cur=liqDistSlices[i].color;const idx=cols.indexOf(cur);liqDistSlices[i].color=cols[(idx+1)%cols.length];saveLiqSlices();renderLiqDistConfig();}

function addLiqSlice(){
  const cols=['#ff6b35','#ffaa00','#00e5a0','#7c6fff','#ff4455','#44aaff','#e0c080','#cc88ff'];
  const n=liqDistSlices.length+1;const pe=parseFloat((100/n).toFixed(1));
  liqDistSlices.forEach(function(s){s.pct=pe;});
  liqDistSlices.push({id:'ls'+Date.now(),label:'Destino',pct:pe,color:cols[(n-1)%cols.length],activo:'OTRO'});
  const tot=liqDistSlices.reduce(function(a,s){return a+s.pct;},0);liqDistSlices[liqDistSlices.length-1].pct=parseFloat((liqDistSlices[liqDistSlices.length-1].pct+(100-tot)).toFixed(1));
  saveLiqSlices();renderLiqDistConfig();
}

function removeLiqSlice(i){
  if(liqDistSlices.length<=1)return;liqDistSlices.splice(i,1);
  const pe=parseFloat((100/liqDistSlices.length).toFixed(1));liqDistSlices.forEach(function(s){s.pct=pe;});
  const tot=liqDistSlices.reduce(function(a,s){return a+s.pct;},0);liqDistSlices[liqDistSlices.length-1].pct=parseFloat((liqDistSlices[liqDistSlices.length-1].pct+(100-tot)).toFixed(1));
  saveLiqSlices();renderLiqDistConfig();
}

let _liqView='ars';
function setLiqView(v){
  _liqView=v;
  ['ARS','BTC','USD'].forEach(function(k){const b=document.getElementById('liqView'+k);if(b)b.className='tgb'+(v===k.toLowerCase()?' active':'');});
  renderLiqExterna();
}

function updLiqPreview(){
  const monto=parseFloat(document.getElementById('liq-monto').value)||0;
  const prev=document.getElementById('liq-preview');
  if(!monto){prev.style.display='none';return;}
  let arsEq='',btcEq='';
  if(window._blueARS)arsEq=fv(monto*window._blueARS)+' ARS';
  if(window._btcPrecioUSD&&window._blueARS)btcEq=(monto*window._blueARS/(window._btcPrecioUSD*window._blueARS)).toFixed(6)+' BTC ('+(monto/window._btcPrecioUSD).toFixed(6)+' BTC)';
  prev.style.display='block';
  prev.innerHTML='<span style="color:#44aaff">'+monto+' USD</span>'
    +(arsEq?' = <span style="color:var(--ac)">'+arsEq+'</span>':'')
    +(btcEq?' = <span style="color:#ff6b35">'+btcEq+'</span>':'');
}

function toggleLiqExterna(){
  var body=document.getElementById('liq-body');
  var icon=document.getElementById('liq-collapse-icon');
  if(!body)return;
  var open=body.style.display!=='none';
  body.style.display=open?'none':'';
  if(icon)icon.textContent=open?'▶':'▼';
}

function registrarLiqExterna(){
  const fecha=document.getElementById('liq-fecha').value;
  const monto=parseFloat(document.getElementById('liq-monto').value)||0;
  const desc=document.getElementById('liq-desc').value.trim();
  if(!fecha||!monto){sN('Completa fecha y monto USD',true);return;}
  const parts=fecha.split('-');const mes=parts[0]+parts[1];
  const arsEq=window._blueARS?Math.round(monto*window._blueARS):0;
  const btcEq=(window._btcPrecioUSD&&window._blueARS)?parseFloat((monto/window._btcPrecioUSD).toFixed(8)):0;
  const id='L-'+mes+'-'+String(gLiqExterna().filter(function(x){return x.mesActual===mes;}).length+1).padStart(4,'0');
  sLiqExterna({id:id,fecha:fecha,fechaDisplay:d2s(fecha),mesActual:mes,moneda:'USD',monto:monto,arsEquivalente:arsEq,btcEquivalente:btcEq,descripcion:desc||null});
  document.getElementById('liq-monto').value='';document.getElementById('liq-desc').value='';document.getElementById('liq-preview').style.display='none';
  window.rfInvM?.();renderLiqExterna();window.renderDash?.();window.uhd?.();window.invActualizarCampos?.();sN('OK '+id+' registrado');
}

function renderLiqExterna(){
  const filtro=window.getInvFiltro();
  const liq=window.filtrarPorPeriodo(gLiqExterna(),filtro);
  const inv=window.filtrarPorPeriodo(gInv(),filtro).filter(function(x){return x.fuente==='liquidez_externa'||x.fuente==='mixto';});
  const totalUSD=liq.reduce(function(a,x){return a+x.monto;},0);
  const totalARS=liq.reduce(function(a,x){return a+(x.arsEquivalente||0);},0);
  const totalBTC=liq.reduce(function(a,x){return a+(x.btcEquivalente||0);},0);
  // Track USD spent: use montoOriginal directly when moneda=USD, else convert from ARS
  const yaUsadoUSD=inv.reduce(function(a,x){
    if(x.moneda==='USD')return a+(x.montoOriginal||0);
    if(x.moneda==='USDT')return a+(x.montoOriginal||0); // USDT ~ USD for tracking
    return a+((x.montoARS||0)/(window._blueARS||1));
  },0);
  const yaUsadoUSDrounded=parseFloat(yaUsadoUSD.toFixed(2));
  const yaUsadoARS=Math.round(yaUsadoUSD*(window._blueARS||0));
  const dispUSD=Math.max(0,parseFloat((totalUSD-yaUsadoUSDrounded).toFixed(2)));
  const dispARS=Math.max(0,totalARS-yaUsadoARS);
  const dispBTC=window._btcPrecioUSD&&window._blueARS&&dispARS?parseFloat((dispARS/(window._btcPrecioUSD*window._blueARS)).toFixed(8)):0;

  renderLiqDistConfig();

  const res=document.getElementById('liqExternaResumen');
  if(res){
    if(!liq.length){res.innerHTML='<div style="font-family:var(--mo);font-size:11px;color:var(--tx3)">Sin liquidez registrada</div>';}
    else{
      const fu=fu;
      res.innerHTML='<div class="kpi-grid" style="margin-bottom:8px">'
        +'<div class="kpi" style="border-top-color:#44aaff"><div class="kicon">💰</div><div class="klbl">Total USD</div><div class="kval" style="color:#44aaff">'+fu(totalUSD)+' USD</div><div class="ksub">'+liq.length+' registros</div></div>'
        +'<div class="kpi neg"><div class="kicon">↗</div><div class="klbl">Invertido</div><div class="kval neg">-'+fu(yaUsadoUSD)+' USD</div></div>'
        +'<div class="kpi '+(dispUSD>0?'':'neg')+'" style="grid-column:1/-1"><div class="kicon">💵</div><div class="klbl">Disponible</div><div class="kval '+(dispUSD>0?'ac':'neg')+'" style="font-size:16px">'+fu(dispUSD)+' USD</div></div>'
        +'</div>'
        +'<div class="tw" style="margin-bottom:8px"><table><thead><tr><th>ID</th><th>Fecha</th><th>USD</th><th>ARS equiv.</th><th>BTC equiv.</th><th>Desc.</th><th></th></tr></thead><tbody>'
        +liq.map(function(x){return '<tr><td style="color:#44aaff">'+x.id+'</td><td class="mu">'+x.fechaDisplay+'</td><td class="ac">'+fu(x.monto)+' USD</td><td class="mu">'+(x.arsEquivalente?fv(x.arsEquivalente):'—')+'</td><td class="mu" style="color:#ff6b35">'+(x.btcEquivalente?x.btcEquivalente.toFixed(6):'—')+'</td><td class="mu">'+(x.descripcion||'')+'</td><td><button class="qrst" onclick="dLiqExterna(\''+x.id+'\');renderLiqExterna()">x</button></td></tr>';}).join('')
        +'</tbody></table></div>';
    }
  }

  // View toggles: ARS / BTC / USD
  const vc=document.getElementById('liqValoresContent');
  if(vc&&liq.length){
    const fu=fu;
    if(_liqView==='ars'){
      vc.innerHTML='<div class="kpi-grid">'
        +'<div class="kpi"><div class="klbl">Total Liquidez</div><div class="kval ac">'+fv(totalARS)+'</div><div class="ksub">'+fu(totalUSD)+' USD</div></div>'
        +'<div class="kpi '+(dispARS>=0?'':'neg')+'"><div class="klbl">Disponible</div><div class="kval '+(dispARS>=0?'ac':'neg')+'">'+fv(dispARS)+'</div><div class="ksub">-'+fv(yaUsadoARS)+' invertido</div></div>'
        +'</div>';
    } else if(_liqView==='btc'){
      const totalBTCcalc=(window._btcPrecioUSD&&window._blueARS)?parseFloat((totalARS/(window._btcPrecioUSD*window._blueARS)).toFixed(8)):totalBTC;
      const dispBTCcalc=(window._btcPrecioUSD&&window._blueARS)?parseFloat((dispARS/(window._btcPrecioUSD*window._blueARS)).toFixed(8)):0;
      vc.innerHTML='<div class="kpi-grid">'
        +'<div class="kpi org"><div class="klbl">Total en BTC</div><div class="kval org">'+totalBTCcalc.toFixed(8)+'</div><div class="ksub">'+fu(totalUSD)+' USD'+((window._btcPrecioUSD?(' @ US$ '+fi(window._btcPrecioUSD)):''))+'</div></div>'
        +'<div class="kpi '+(dispBTCcalc>=0?'org':'neg')+'"><div class="klbl">Disponible BTC</div><div class="kval '+(dispBTCcalc>=0?'org':'neg')+'">'+dispBTCcalc.toFixed(8)+'</div><div class="ksub">'+fv(dispARS)+' ARS</div></div>'
        +'</div>'
        +(!window._btcPrecioUSD?'<div style="font-family:var(--mo);font-size:9px;color:var(--wn);margin-top:6px">Actualiza precios para ver en BTC</div>':'');
    } else {
      const fu=fu;
      vc.innerHTML='<div class="kpi-grid">'
        +'<div class="kpi" style="border-top-color:#44aaff"><div class="klbl">Total USD</div><div class="kval" style="color:#44aaff">'+fu(totalUSD)+' USD</div></div>'
        +'<div class="kpi '+(dispUSD>=0?'':'neg')+'"><div class="klbl">Disponible USD</div><div class="kval '+(dispUSD>=0?'ac':'neg')+'">'+fu(dispUSD)+' USD</div><div class="ksub">-'+fu(yaUsadoUSD)+' USD invertido</div></div>'
        +'</div>';
    }
  } else if(vc){vc.innerHTML='';}

  // Distribution chart using liqDistSlices
  const dc=document.getElementById('liqDistContent');if(!dc)return;
  if(!liq.length||dispARS<=0){dc.innerHTML='<div style="font-family:var(--mo);font-size:9px;color:var(--tx3)">Sin liquidez disponible para distribuir</div>';return;}
  const totPct=liqDistSlices.reduce(function(a,s){return a+s.pct;},0)||100;
  // Use USD as base for liquidez externa distribution
  const rows=liqDistSlices.map(function(s){return window.distRowUSD(s,dispUSD*(s.pct/totPct));});
  dc.innerHTML='<div style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-bottom:8px">Disponible: <span style="color:#44aaff">'+fu(dispUSD)+' USD</span></div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:6px;margin-bottom:10px">'
    +rows.map(function(r){return '<div style="background:var(--s2);border:1px solid var(--br);border-top:2px solid '+r.color+';padding:8px"><div style="font-family:var(--mo);font-size:7px;color:var(--tx3);text-transform:uppercase;margin-bottom:2px">'+r.pct.toFixed(1)+'% '+r.label+'</div><div style="font-family:var(--mo);font-size:11px;font-weight:700;color:'+r.color+'">'+r.displayVal+'</div><div style="font-family:var(--mo);font-size:8px;color:var(--tx3)">'+r.equiv+'</div></div>';}).join('')
    +'</div><div style="position:relative;height:150px"><canvas id="cLiqTorta"></canvas></div>';
  window.renderDistChart('cLiqTorta',rows,window._liqChartRef,150);
}

window._getLiqDistSlices = () => liqDistSlices;
window._setLiqDistSlices = (v) => { liqDistSlices = v; };


// ===== modules/inversiones.js =====

// ── State ──
let _btcPrecioUSD=null,_blueARS=null,_usdtARS=null,_blueCompra=null,_usdtCompra=null;
let _btcChart=null,_distChart=null,_liqDistChart=null;
let _btcDays=30;

const DIST_DEFAULTS=[{id:'s1',label:'Bitcoin',pct:50,color:'#ff6b35',activo:'BTC'},{id:'s2',label:'Dolar Blue',pct:50,color:'#ffaa00',activo:'USD_BLUE'}];
let distSlices=JSON.parse(localStorage.getItem('me_dist_slices')||'null')||DIST_DEFAULTS.map(x=>Object.assign({},x));

const DIST_KPIS=['kpiNetoNeto','kpiFondo','kpiReal','kpiYaInv','kpiDisp'];
let distKpiHidden=JSON.parse(localStorage.getItem('me_dist_kpi_hidden')||'{}');

const _distChartRef={chart:null},_liqChartRef={chart:null};

// ── Storage helper (local, includes ghAutoPush) ──
function sInv(x){var d=ld();if(!d.inversiones)d.inversiones=[];d.inversiones.push(x);sd(d);ghAutoPush();}

// ── Window bridges for cross-module access ──
window._getDistSlices=()=>distSlices;
window._setDistSlices=(v)=>{distSlices=v;};
window._getDistKpiHidden=()=>distKpiHidden;
window._setDistKpiHidden=(v)=>{distKpiHidden=v;};

// ── Period filter ──
function filtrarPorPeriodo(arr,filtro){
  if(!filtro||filtro.tipo==='mes'){if(filtro&&filtro.mes&&filtro.mes!=='all')return arr.filter(x=>x.mesActual===filtro.mes);return arr;}
  let r=arr;if(filtro.desde)r=r.filter(x=>x.fecha>=filtro.desde);if(filtro.hasta)r=r.filter(x=>x.fecha<=filtro.hasta);return r;
}
function getInvFiltro(){
  const globalSel=document.getElementById('invGlobalMes');
  const f=globalSel?globalSel.value:(document.getElementById('invDistMes')?.value||'all');
  if(f==='rango'){
    return{tipo:'rango',
      desde:document.getElementById('invGlobalDesde')?document.getElementById('invGlobalDesde').value:(document.getElementById('invDesde')?document.getElementById('invDesde').value:''),
      hasta:document.getElementById('invGlobalHasta')?document.getElementById('invGlobalHasta').value:(document.getElementById('invHasta')?document.getElementById('invHasta').value:'')
    };
  }
  return{tipo:'mes',mes:f};
}
function rfInvM(){
  const inv=gInv(),liq=gLiqExterna();
  const meses=[...new Set([...inv.map(x=>x.mesActual),...liq.map(x=>x.mesActual)])].sort();
  const sel=document.getElementById('invMes');if(!sel)return;
  const cv=sel.value;
  sel.innerHTML='<option value="all">Todo el período</option>';
  meses.forEach(m=>{const op=document.createElement('option');op.value=m;op.textContent=mLong(m);sel.appendChild(op);});
  const ro=document.createElement('option');ro.value='rango';ro.textContent='📅 Rango de fechas...';sel.appendChild(ro);
  if(cv)sel.value=cv;
}
function onInvMesChange(){
  const v=document.getElementById('invMes').value;
  const dw=document.getElementById('invDesdeWrap'),hw=document.getElementById('invHastaWrap');
  if(v==='rango'){if(dw)dw.style.display='';if(hw)hw.style.display='';const h=hoy();if(document.getElementById('invDesde'))document.getElementById('invDesde').value=h.substring(0,8)+'01';if(document.getElementById('invHasta'))document.getElementById('invHasta').value=h;}
  else{if(dw)dw.style.display='none';if(hw)hw.style.display='none';}
  renderInvAll();
}
function onInvGlobalMesChange(){
  const v=document.getElementById('invGlobalMes').value;
  const dw=document.getElementById('invGlobalDesdeWrap'),hw=document.getElementById('invGlobalHastaWrap');
  if(v==='rango'){
    if(dw)dw.style.display='';if(hw)hw.style.display='';
    const h=hoy();
    if(document.getElementById('invGlobalDesde'))document.getElementById('invGlobalDesde').value=h.substring(0,8)+'01';
    if(document.getElementById('invGlobalHasta'))document.getElementById('invGlobalHasta').value=h;
  } else {if(dw)dw.style.display='none';if(hw)hw.style.display='none';}
  const sel=document.getElementById('invDistMes');if(sel)sel.value=v;
  renderInvAll();
}

// ── Dist slices config ──
function saveDistSlices(){localStorage.setItem('me_dist_slices',JSON.stringify(distSlices));}
function saveKpiHidden(){localStorage.setItem('me_dist_kpi_hidden',JSON.stringify(distKpiHidden));}
function toggleDistEdit(){
  const panel=document.getElementById('distKpiEditPanel');
  if(!panel)return;
  panel.style.display=panel.style.display==='none'?'block':'none';
}
function toggleDistKpi(id){
  distKpiHidden[id]=!distKpiHidden[id];
  saveKpiHidden();
  renderInvDist();
}
function kpiVisible(id){return !distKpiHidden[id];}

function calcDistBase(){
  const orders=gOConf(),eg=gE();
  const totV=orders.reduce(function(a,o){return a+(o.totales.totalGeneral||0);},0);
  const totE=eg.reduce(function(a,e){return a+(e.impactoCaja||0);},0);
  const totC=orders.reduce(function(a,o){return a+(o.costo||0);},0);
  const netoNeto=totV-totE;
  const netoReal=netoNeto-totC;
  return {netoNeto:netoNeto,netoReal:netoReal,totalC:totC,totV:totV,totE:totE};
}

function buildSmartDefaults(){
  const orders=gOConf(),eg=gE();
  const totV=orders.reduce(function(a,o){return a+(o.totales.totalGeneral||0);},0);
  const totE=eg.reduce(function(a,e){return a+(e.impactoCaja||0);},0);
  const totC=orders.reduce(function(a,o){return a+(o.costo||0);},0);
  const netoNeto=totV-totE;
  const btcSlice={id:'sd1',label:'Bitcoin',pct:50,color:'#ff6b35',activo:'BTC'};
  const blueSlice={id:'sd2',label:'Dolar Blue',pct:50,color:'#ffaa00',activo:'USD_BLUE'};
  if(netoNeto>0&&totC>0&&totC<netoNeto){
    const fondoPct=parseFloat(Math.min(99,((totC/netoNeto)*100)).toFixed(1));
    const rest=parseFloat((100-fondoPct).toFixed(1));
    const fondoSlice={id:'sd0',label:'Fondo Reposicion',pct:fondoPct,color:'#00e5a0',activo:'STOCK'};
    btcSlice.pct=parseFloat((rest/2).toFixed(1));
    blueSlice.pct=parseFloat((rest-btcSlice.pct).toFixed(1));
    return[fondoSlice,btcSlice,blueSlice];
  }
  return[btcSlice,blueSlice];
}

function resetDistDefaults(){
  distSlices=buildSmartDefaults();
  saveDistSlices();renderDistConfig();renderInvDist();
  sN('Distribucion restablecida');
}
function autoBalancePct(ci){
  const tot=distSlices.reduce(function(a,s){return a+s.pct;},0);
  if(Math.abs(tot-100)<0.1)return;
  const diff=100-tot;const others=distSlices.filter(function(_,i){return i!==ci;});
  if(!others.length)return;
  const pp=diff/others.length;others.forEach(function(s){s.pct=Math.max(0,parseFloat((s.pct+pp).toFixed(1)));});
  const nt=distSlices.reduce(function(a,s){return a+s.pct;},0);
  if(Math.abs(nt-100)>0.1){const li=distSlices.length-1===ci?distSlices.length-2:distSlices.length-1;if(distSlices[li])distSlices[li].pct=parseFloat(Math.max(0,distSlices[li].pct+(100-nt)).toFixed(1));}
}
function renderDistConfig(){
  const cont=document.getElementById('distSlices');if(!cont)return;
  const COLS=['#ff6b35','#ffaa00','#00e5a0','#7c6fff','#ff4455','#44aaff','#e0c080','#cc88ff','#55ddff','#ff88cc'];
  let html='';
  distSlices.forEach(function(s,i){
    html+='<div style="display:grid;grid-template-columns:22px 1fr 60px 28px;gap:6px;align-items:center;margin-bottom:6px">'
      +'<div style="width:16px;height:16px;background:'+s.color+';border-radius:2px;cursor:pointer" onclick="cycleColor('+i+')"></div>'
      +'<input type="text" value="'+s.label+'" oninput="distSlices['+i+'].label=this.value;saveDistSlices()" style="min-height:34px;font-size:11px;padding:4px 8px">'
      +'<div style="display:flex;align-items:center;gap:2px"><input type="number" min="0" max="100" value="'+s.pct+'" onchange="distSlices['+i+'].pct=Math.max(0,Math.min(100,parseFloat(this.value)||0));autoBalancePct('+i+');saveDistSlices();renderDistConfig();renderInvDist()" style="min-height:34px;font-size:11px;padding:4px 4px;width:42px"><span style="font-family:var(--mo);font-size:9px;color:var(--tx3)">%</span></div>'
      +(distSlices.length>1?'<button class="qrst" onclick="removeDistSlice('+i+')" style="height:34px">x</button>':'<div></div>')
      +'</div>';
  });
  const tot=distSlices.reduce(function(a,s){return a+s.pct;},0);
  html+='<div style="font-family:var(--mo);font-size:9px;color:'+(Math.abs(tot-100)<0.5?'var(--ac)':'var(--er)')+'">Total: '+tot.toFixed(1)+'% '+(Math.abs(tot-100)<0.5?'OK balanceado':'AUTO-BALANCE PENDIENTE')+'</div>';
  cont.innerHTML=html;
}
function cycleColor(i){const cols=['#ff6b35','#ffaa00','#00e5a0','#7c6fff','#ff4455','#44aaff','#e0c080','#cc88ff','#55ddff','#ff88cc'];const cur=distSlices[i].color;const idx=cols.indexOf(cur);distSlices[i].color=cols[(idx+1)%cols.length];saveDistSlices();renderDistConfig();}
function addDistSlice(){
  const cols=['#ff6b35','#ffaa00','#00e5a0','#7c6fff','#ff4455','#44aaff','#e0c080','#cc88ff'];
  const n=distSlices.length+1;const pe=parseFloat((100/n).toFixed(1));
  distSlices.forEach(function(s){s.pct=pe;});
  distSlices.push({id:'s'+Date.now(),label:'Destino',pct:pe,color:cols[(n-1)%cols.length],activo:'OTRO'});
  const tot=distSlices.reduce(function(a,s){return a+s.pct;},0);distSlices[distSlices.length-1].pct=parseFloat((distSlices[distSlices.length-1].pct+(100-tot)).toFixed(1));
  saveDistSlices();renderDistConfig();
}
function removeDistSlice(i){
  if(distSlices.length<=1)return;distSlices.splice(i,1);
  const pe=parseFloat((100/distSlices.length).toFixed(1));distSlices.forEach(function(s){s.pct=pe;});
  const tot=distSlices.reduce(function(a,s){return a+s.pct;},0);distSlices[distSlices.length-1].pct=parseFloat((distSlices[distSlices.length-1].pct+(100-tot)).toFixed(1));
  saveDistSlices();renderDistConfig();
}

// ── Prices / BTC ──
async function fetchPrecios(){
  document.getElementById('preciosStatus').textContent='Cargando...';
  try{const r=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');const d=await r.json();_btcPrecioUSD=d.bitcoin.usd;const chg=d.bitcoin.usd_24h_change||0;document.getElementById('btcPrecio').textContent='US$ '+fi(_btcPrecioUSD);document.getElementById('btcCambio').textContent=(chg>=0?'+ ':'- ')+Math.abs(chg).toFixed(2)+'% 24h';document.getElementById('btcCambio').style.color=chg>=0?'#00e5a0':'#ff4455';}catch(e){document.getElementById('btcPrecio').textContent='Error';}
  try{const r=await fetch('https://dolarapi.com/v1/dolares/blue');const d=await r.json();_blueCompra=d.compra;_blueARS=d.venta;document.getElementById('bluePrecio').textContent='$ '+fi(_blueARS);document.getElementById('blueSub').textContent='C: $'+fi(_blueCompra)+' V: $'+fi(_blueARS);}
  catch(e){try{const r2=await fetch('https://api.bluelytics.com.ar/v2/latest');const d2=await r2.json();_blueCompra=d2.blue.value_buy;_blueARS=d2.blue.value_sell;document.getElementById('bluePrecio').textContent='$ '+fi(_blueARS);document.getElementById('blueSub').textContent='C: $'+fi(_blueCompra)+' V: $'+fi(_blueARS);}catch(e2){document.getElementById('bluePrecio').textContent='Error';}}
  try{const r=await fetch('https://dolarapi.com/v1/dolares/cripto');const d=await r.json();_usdtCompra=d.compra;_usdtARS=d.venta;document.getElementById('usdtPrecio').textContent='$ '+fi(_usdtARS);document.getElementById('usdtSub').textContent='C: $'+fi(_usdtCompra)+' V: $'+fi(_usdtARS);}
  catch(e){if(_blueARS){_usdtARS=Math.round(_blueARS*1.04);_usdtCompra=Math.round(_blueARS*1.03);document.getElementById('usdtPrecio').textContent='$ '+fi(_usdtARS);document.getElementById('usdtSub').textContent='aprox blue+4%';}else{document.getElementById('usdtPrecio').textContent='Error';}}
  document.getElementById('preciosStatus').textContent='OK '+new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
  // Update window cache for other modules
  window._btcPrecioUSD=_btcPrecioUSD;
  window._blueARS=_blueARS;
  window._usdtARS=_usdtARS;
  renderInvDist();window.renderLiqExterna?.();fetchBtcHistorico();
}

async function actualizarPreciosDash(){
  try{const r=await fetch('https://dolarapi.com/v1/dolares/blue');const d=await r.json();_blueARS=d.venta;}
  catch(e){try{const r2=await fetch('https://api.bluelytics.com.ar/v2/latest');const d2=await r2.json();_blueARS=d2.blue.value_sell;}catch(e2){}}
  try{const r=await fetch('https://dolarapi.com/v1/dolares/cripto');const d=await r.json();_usdtARS=d.venta;}
  catch(e){if(_blueARS)_usdtARS=Math.round(_blueARS*1.04);}
  window._btcPrecioUSD=_btcPrecioUSD;
  window._blueARS=_blueARS;
  window._usdtARS=_usdtARS;
}

function setBtcDays(d){
  _btcDays=d;
  ['30','60','90'].forEach(function(n){
    const b=document.getElementById('btcDays'+n);
    if(b)b.className='tgb'+(d===parseInt(n)?' active':'');
  });
  const lbl=document.getElementById('btcChartLabel');
  if(lbl)lbl.textContent='Ultimos '+d+' dias · CoinGecko API';
  fetchBtcHistorico();
}
async function fetchBtcHistorico(){
  const days=_btcDays||30;
  const interval=days<=30?'daily':'daily';
  try{
    const res=await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days='+days+'&interval='+interval);
    const data=await res.json();const prices=data.prices;
    const labels=prices.map(function(p){const d=new Date(p[0]);return d.getDate()+'/'+(d.getMonth()+1);});
    const vals=prices.map(function(p){return p[1];});
    if(_btcChart){try{_btcChart.destroy();}catch(e){}}
    const canvas=document.getElementById('cBtcHistorico');if(!canvas)return;
    const gs={responsive:true,maintainAspectRatio:false},tx={color:'#55556a',font:{family:'Space Mono',size:8}},gr={color:'rgba(42,42,58,.4)'};
    _btcChart=new Chart(canvas,{type:'line',data:{labels:labels,datasets:[{data:vals,borderColor:'#ff6b35',backgroundColor:'rgba(255,107,53,.12)',tension:.4,fill:true,pointBackgroundColor:'#ff6b35',pointRadius:2,borderWidth:2}]},options:{...gs,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ctx){return 'US$ '+fi(ctx.raw);}}}},scales:{x:{grid:gr,ticks:{color:tx.color,font:tx.font,maxTicksLimit:12}},y:{grid:gr,ticks:{color:tx.color,font:tx.font,callback:function(v){return '$'+fi(v);}}}}}});
  }catch(e){console.warn('BTC chart error',e);}
}

// ── Inv Repo ──
function renderInvRepo(){
  const filtro=getInvFiltro();
  const orders=filtrarPorPeriodo(gO(),filtro);
  const inv=filtrarPorPeriodo(gInv(),filtro).filter(function(x){return x.activo&&x.activo.indexOf('STOCK_')===0;});
  const totC=orders.reduce(function(a,o){return a+(o.costo||0);},0);
  const qPast=orders.reduce(function(a,o){return a+(o.productos.totalPastillas||0);},0);
  const qCris=orders.reduce(function(a,o){return a+(o.productos.cristales||0);},0);
  const qHong=orders.reduce(function(a,o){return a+(o.productos.hongos||0);},0);
  const qGot=orders.reduce(function(a,o){return a+(o.productos.goteros||0);},0);
  const qPetr=orders.reduce(function(a,o){return a+(o.productos.petri||0);},0);
  const cPast=qPast*COSTS.past,cCris=qCris*COSTS.cris,cHong=qHong*COSTS.hong,cGot=qGot*COSTS.got,cPetr=qPetr*COSTS.pet;
  function repuOf(activo){return inv.filter(function(x){return x.activo===activo;}).reduce(function(a,x){return a+(x.montoARS||0);},0);}
  const rPast=repuOf('STOCK_PAST'),rCris=repuOf('STOCK_CRIS'),rHong=repuOf('STOCK_HONG'),rGot=repuOf('STOCK_GOT'),rPetr=repuOf('STOCK_PETR');
  const totalRep=rPast+rCris+rHong+rGot+rPetr;
  const pend=Math.max(0,totC-totalRep);
  const cont=document.getElementById('invRepoContent');
  if(!orders.length){cont.innerHTML='<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:20px">Sin datos</div>';return;}
  function rr(e,q,u,c,r){if(!q)return'';const p=Math.max(0,c-r);return'<tr><td>'+e+'</td><td class="mu">'+q+u+'</td><td class="er">'+fv(c)+'</td><td class="ac">'+(r>0?'-'+fv(r):'')+'</td><td class="'+(p>0?'wn':'ac')+'">'+(p>0?fv(p):'✅ Cubierto')+'</td></tr>';}
  cont.innerHTML='<div class="kpi-grid" style="margin-bottom:10px">'
    +'<div class="kpi wn"><div class="kicon">💼</div><div class="klbl">Fondo Total</div><div class="kval wn">'+fv(totC)+'</div></div>'
    +'<div class="kpi"><div class="kicon">✅</div><div class="klbl">Repuesto</div><div class="kval ac">'+fv(totalRep)+'</div></div>'
    +'<div class="kpi '+(pend>0?'neg':'')+'"><div class="kicon">'+(pend>0?'⚠️':'✅')+'</div><div class="klbl">Pendiente</div><div class="kval '+(pend>0?'neg':'ac')+'">'+fv(pend)+'</div></div>'
    +'</div>'
    +'<div class="tw"><table><thead><tr><th>Producto</th><th>Qty</th><th>Costo</th><th>Repuesto</th><th>Pendiente</th></tr></thead><tbody>'
    +rr('Pastillas',qPast,'ud',cPast,rPast)+rr('Cristales',qCris,'g',cCris,rCris)+rr('Hongos',qHong,'g',cHong,rHong)+rr('Goteros',qGot,'ud',cGot,rGot)+rr('Petri',qPetr,'ud',cPetr,rPetr)
    +'<tr class="total-row"><td>TOTAL</td><td></td><td class="wn">'+fv(totC)+'</td><td class="ac">'+fv(totalRep)+'</td><td class="'+(pend>0?'wn':'ac')+'">'+fv(pend)+'</td></tr>'
    +'</tbody></table></div>';
}

function distRow(s,monto){
  let equiv='';
  if(s.activo==='BTC'&&_btcPrecioUSD&&_blueARS)equiv=(monto/(_btcPrecioUSD*_blueARS)).toFixed(6)+' BTC';
  else if(s.activo==='USD_BLUE'&&_blueARS)equiv=fu(monto/_blueARS)+' USD';
  else if(s.activo==='USDT'&&_usdtARS)equiv=fu(monto/_usdtARS)+' USDT';
  return {monto:monto,equiv:equiv,color:s.color,label:s.label,pct:s.pct,displayVal:fv(monto)};
}
function distRowUSD(s,montoUSD){
  let equiv='';
  if(s.activo==='BTC'&&_btcPrecioUSD)equiv=(montoUSD/_btcPrecioUSD).toFixed(6)+' BTC';
  else if(s.activo==='USD_BLUE')equiv=fu(montoUSD)+' USD';
  else if(s.activo==='USDT')equiv=fu(montoUSD)+' USDT';
  return {monto:montoUSD,equiv:equiv,color:s.color,label:s.label,pct:s.pct,displayVal:fu(montoUSD)+' USD'};
}

function renderDistChart(canvasId,rows,chartRef,height){
  setTimeout(function(){
    if(chartRef&&chartRef.chart){try{chartRef.chart.destroy();}catch(e){}}
    const cv=document.getElementById(canvasId);if(!cv)return;
    chartRef.chart=new Chart(cv,{type:'doughnut',data:{labels:rows.map(function(r){return r.label+' '+r.pct.toFixed(0)+'%';}),datasets:[{data:rows.map(function(r){return Math.max(0,r.monto);}),backgroundColor:rows.map(function(r){return r.color;}),borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'58%',plugins:{legend:{display:true,position:'right',labels:{color:'#8888a0',font:{family:'Space Mono',size:8},boxWidth:10,padding:8}},tooltip:{callbacks:{label:function(ctx){return ctx.label+': '+fv(ctx.raw);}}}}}});
  },80);
}

function renderInvDist(){
  const filtro=getInvFiltro();
  const orders=filtrarPorPeriodo(gO(),filtro);
  const eg=filtrarPorPeriodo(gE(),filtro);
  const totV=orders.reduce(function(a,o){return a+(o.totales.totalGeneral||0);},0);
  const totE=eg.reduce(function(a,e){return a+(e.impactoCaja||0);},0);
  const totC=orders.reduce(function(a,o){return a+(o.costo||0);},0);
  const netoNeto=totV-totE;
  const netoReal=netoNeto-totC;
  const invReal=filtrarPorPeriodo(gInv(),filtro).filter(function(x){return x.fuente==='distribucion'||x.fuente==='mixto';});
  const yaInv=invReal.reduce(function(a,x){return a+(x.montoARS||0);},0);
  const disponible=Math.max(0,netoNeto-yaInv);
  const cont=document.getElementById('invDistContent');
  renderDistConfig();
  if(netoNeto<=0){cont.innerHTML='<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:20px">Resultado Neto menor o igual a 0 en este periodo.</div>';return;}
  const totPct=distSlices.reduce(function(a,s){return a+s.pct;},0)||100;
  const rows=distSlices.map(function(s){return distRow(s,disponible*(s.pct/totPct));});
  function kpiCard(id,cls,icon,lbl,val,sub,fullWidth){
    if(!kpiVisible(id))return'';
    return'<div class="kpi '+cls+'"'+(fullWidth?' style="grid-column:1/-1"':'')+'>'+
      '<div class="kicon">'+icon+'</div>'+
      '<div class="klbl">'+lbl+'</div>'+
      '<div class="kval '+(cls||'')+'">'+val+'</div>'+
      (sub?'<div class="ksub">'+sub+'</div>':'')+
    '</div>';
  }
  const editPanel='<div id="distKpiEditPanel" style="display:none;background:var(--s2);border:1px solid var(--br);padding:10px;margin-bottom:10px;font-family:var(--mo);font-size:9px">'
    +'<div style="color:var(--tx3);margin-bottom:8px;letter-spacing:1px">MOSTRAR / OCULTAR MÉTRICAS</div>'
    +'<div style="display:flex;flex-wrap:wrap;gap:6px">'
    +[['kpiNetoNeto','📊 Resultado Neto'],['kpiFondo','💼 Fondo Reposicion'],['kpiReal','📈 Resultado Real'],['kpiYaInv','↗ Ya Invertido'],['kpiDisp','💰 Disponible']].map(function(k){
      return'<label style="display:flex;align-items:center;gap:5px;cursor:pointer;background:var(--s3);padding:5px 9px;border:1px solid var(--br)">'
        +'<input type="checkbox"'+(kpiVisible(k[0])?' checked':'')
        +' onchange="toggleDistKpi(\''+k[0]+'\')" style="cursor:pointer;width:14px;height:14px;min-height:unset">'
        +k[1]+'</label>';
    }).join('')
    +'</div></div>';
  cont.innerHTML=editPanel
    +'<div class="kpi-grid" style="margin-bottom:10px">'
    +kpiCard('kpiNetoNeto','','📊','Resultado Neto',fv(netoNeto),'Base de distribucion',false)
    +kpiCard('kpiFondo','wn','💼','Fondo Reposicion',fv(totC),(netoNeto>0?parseFloat((totC/netoNeto*100).toFixed(1))+'% del neto':'—'),false)
    +kpiCard('kpiReal','org','📈','Resultado Real',fv(netoReal),'Neto - Fondo',false)
    +kpiCard('kpiYaInv','neg','↗','Ya Invertido','-'+fv(yaInv),'',false)
    +kpiCard('kpiDisp',(disponible>=0?'':'neg'),'💰','Disponible para distribuir',
      '<span style="font-size:16px">'+fv(disponible)+'</span>',
      (!_blueARS?'Actualiza precios para ver equivalencias':''),true)
    +'</div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin-bottom:12px">'
    +rows.map(function(r){return '<div style="background:var(--s2);border:1px solid var(--br);border-top:2px solid '+r.color+';padding:10px"><div style="font-family:var(--mo);font-size:7px;color:var(--tx3);text-transform:uppercase;margin-bottom:3px">'+r.pct.toFixed(1)+'% '+r.label+'</div><div style="font-family:var(--mo);font-size:12px;font-weight:700;color:'+r.color+'">'+fv(r.monto)+'</div><div style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-top:2px">'+r.equiv+'</div></div>';}).join('')
    +'</div><div style="position:relative;height:180px"><canvas id="cDistTorta"></canvas></div>';
  renderDistChart('cDistTorta',rows,_distChartRef,180);
}

// ── Disponible ──
function getDisponibleDist(){
  var orders=gOConf(),eg=gE();
  var totV=orders.reduce(function(a,o){return a+(o.totales.totalGeneral||0);},0);
  var totE=eg.reduce(function(a,e){return a+(e.impactoCaja||0);},0);
  var netoNeto=totV-totE;
  var inv=gInv().filter(function(x){return x.fuente==='distribucion'||x.fuente==='mixto';});
  var yaInv=inv.reduce(function(a,x){return a+(x.montoARS||0);},0);
  return Math.max(0,netoNeto-yaInv);
}

function getDisponibleLiq(){
  var liq=gLiqExterna();
  var totalUSD=liq.reduce(function(a,x){return a+x.monto;},0);
  var inv=gInv().filter(function(x){return x.fuente==='liquidez_externa'||x.fuente==='mixto';});
  var yaUSD=inv.reduce(function(a,x){
    if(x.moneda==='USD'||x.moneda==='USDT')return a+(x.montoOriginal||0);
    return a+((x.montoARS||0)/(_blueARS||1));
  },0);
  return Math.max(0,parseFloat((totalUSD-yaUSD).toFixed(2)));
}

// ── Form helpers ──
function invGetDisponibleActual(){
  var fuente=document.getElementById('inv-fuente')?document.getElementById('inv-fuente').value:'distribucion';
  if(fuente==='liquidez_externa') return getDisponibleLiq();
  return getDisponibleDist();
}
function invUsarPct(pct){
  var disp=invGetDisponibleActual();
  var val=Math.floor(disp*(pct/100)*100)/100;
  var el=document.getElementById('inv-monto');
  if(el){ el.value=val; invCalcular(); invMostrarPct(); }
  document.querySelectorAll('.inv-pct-btn').forEach(function(b){ b.classList.remove('active'); });
}
function invMostrarPct(){
  var monto=parseFloat(document.getElementById('inv-monto').value)||0;
  var disp=invGetDisponibleActual();
  var el=document.getElementById('inv-pct-display');
  if(!el)return;
  if(!monto||!disp){ el.textContent=''; return; }
  var pct=Math.round((monto/disp)*1000)/10;
  el.textContent='= '+pct.toFixed(1)+'% del disponible';
  el.style.color=pct>100?'var(--er)':'var(--tx3)';
}

function invSelFuente(fuente){
  document.getElementById('inv-fuente').value=fuente;
  var dDist=document.getElementById('inv-fuente-dist');
  var dLext=document.getElementById('inv-fuente-lext');
  if(dDist&&dLext){
    if(fuente==='distribucion'){
      dDist.style.borderColor='var(--ac)'; dDist.style.opacity='1';
      dLext.style.borderColor='var(--br)'; dLext.style.opacity='.6';
    } else {
      dLext.style.borderColor='var(--wn)'; dLext.style.opacity='1';
      dDist.style.borderColor='var(--br)'; dDist.style.opacity='.6';
    }
  }
  invActualizarCampos();
}

function invActualizarCampos(){
  var fuente=document.getElementById('inv-fuente')?document.getElementById('inv-fuente').value:'distribucion';
  var monedaOrigenSel=document.getElementById('inv-moneda-origen');
  var monedaDestSel=document.getElementById('inv-moneda-destino');
  var wrapPrecio=document.getElementById('inv-wrap-precio');
  var lblPrecio=document.getElementById('inv-lbl-precio');
  var lblMonto=document.getElementById('inv-lbl-monto');

  var dispDist=getDisponibleDist();
  var dispLiq=getDisponibleLiq();
  var elDistDisp=document.getElementById('inv-dist-disp');
  var elLextDisp=document.getElementById('inv-lext-disp');
  if(elDistDisp) elDistDisp.textContent=fv(dispDist);
  if(elLextDisp) elLextDisp.textContent=fu(dispLiq)+' USD';

  if(monedaOrigenSel){
    var prevOrigen=monedaOrigenSel.value;
    monedaOrigenSel.innerHTML='';
    if(fuente==='distribucion'){
      monedaOrigenSel.innerHTML='<option value="ARS">🪙 ARS</option>';
      monedaOrigenSel.value='ARS';
    } else {
      var liqItems=gLiqExterna();
      monedaOrigenSel.innerHTML='<option value="USD">💵 USD</option>';
      monedaOrigenSel.value='USD';
    }
  }

  var monedaOrigen=monedaOrigenSel?monedaOrigenSel.value:'ARS';
  var monedaDest=monedaDestSel?monedaDestSel.value:'BTC';
  if(lblMonto) lblMonto.textContent='Monto a usar ('+monedaOrigen+')';

  var needsPrecio=(monedaOrigen!==monedaDest);
  if(wrapPrecio) wrapPrecio.style.display=needsPrecio?'':'none';
  if(lblPrecio&&needsPrecio){
    lblPrecio.textContent='Precio de compra ('+monedaOrigen+'/'+monedaDest+')';
    var precioEl=document.getElementById('inv-precio');
    if(precioEl&&!precioEl.value){
      if(monedaOrigen==='ARS'&&monedaDest==='USD'&&_blueARS) precioEl.value=_blueARS.toFixed(0);
      else if(monedaOrigen==='ARS'&&monedaDest==='USDT'&&_usdtARS) precioEl.value=_usdtARS.toFixed(0);
      else if(monedaOrigen==='ARS'&&monedaDest==='BTC'&&_btcPrecioUSD&&_blueARS) precioEl.value=(_btcPrecioUSD*_blueARS).toFixed(0);
      else if(monedaOrigen==='USD'&&monedaDest==='BTC'&&_btcPrecioUSD) precioEl.value=_btcPrecioUSD.toFixed(2);
      else if(monedaOrigen==='USDT'&&monedaDest==='BTC'&&_btcPrecioUSD) precioEl.value=_btcPrecioUSD.toFixed(2);
    }
  }

  invCalcular();
  invMostrarPct();
}

function invCalcular(){
  var monedaOrigen=document.getElementById('inv-moneda-origen')?document.getElementById('inv-moneda-origen').value:'USDT';
  var monedaDestino=document.getElementById('inv-moneda-destino')?document.getElementById('inv-moneda-destino').value:'BTC';
  var modalidad='COMPRA';
  var monto=parseFloat(document.getElementById('inv-monto').value)||0;
  var precio=parseFloat(document.getElementById('inv-precio').value)||0;
  var tbar=document.getElementById('inv-tbar');
  var resDiv=document.getElementById('inv-resultado');
  var cantEl=document.getElementById('inv-cantidad');
  var impEl=document.getElementById('inv-impacto');

  if(!monto){
    if(tbar)tbar.style.display='none';
    if(resDiv){resDiv.textContent='Completá los campos para ver el resultado.';resDiv.style.color='var(--tx3)';}
    return;
  }

  var cantidad='', montoARS=0, resText='', impactoStr='';

  var r_blue=_blueARS||0;
  var r_usdt=_usdtARS||r_blue||0;
  var r_btc_usd=_btcPrecioUSD||0;
  var r_btc_ars=r_btc_usd*r_blue;

  if(monedaOrigen==='ARS') montoARS=monto;
  else if(monedaOrigen==='USD') montoARS=Math.round(monto*r_blue);
  else if(monedaOrigen==='USDT') montoARS=Math.round(monto*r_usdt);
  else if(monedaOrigen==='BTC') montoARS=Math.round(monto*r_btc_ars);

  if(monedaOrigen!==monedaDestino&&precio>0){
    var qty=0;
    if(modalidad==='COMPRA'){
      qty=monto/precio;
      if(monedaDestino==='BTC') qty=Math.floor(qty*1e8)/1e8;
      else qty=Math.floor(qty*100)/100;
      cantidad=qty.toLocaleString('es-AR',{maximumFractionDigits:8})+' '+monedaDestino;
    } else {
      qty=monto*precio;
      if(monedaDestino==='BTC') qty=Math.floor(qty*1e8)/1e8;
      else qty=Math.round(qty);
      cantidad=qty.toLocaleString('es-AR',{maximumFractionDigits:8})+' '+monedaDestino;
    }
  }

  var modalIcon=modalidad==='COMPRA'?'🟢':'🔴';
  resText=modalIcon+' '+monto.toLocaleString('es-AR')+' '+monedaOrigen+(cantidad?' → '+cantidad:'');
  impactoStr=(modalidad==='COMPRA'?'-':'+')+(monedaOrigen==='ARS'?fv(montoARS):monto.toLocaleString('es-AR')+' '+monedaOrigen)+' en fuente';

  if(resDiv){resDiv.style.color='var(--ac)';resDiv.textContent=resText;}
  if(cantEl)cantEl.textContent=cantidad||(monto.toLocaleString('es-AR')+' '+monedaDestino);
  if(impEl)impEl.textContent=impactoStr;
  if(tbar)tbar.style.display='';

  tbar.dataset.montoARS=String(Math.abs(montoARS));
  tbar.dataset.cantidad=cantidad;
  tbar.dataset.montoOrig=String(monto);
}

function invReset(){
  document.getElementById('inv-monto').value='';
  document.getElementById('inv-precio').value='';
  document.getElementById('inv-nota').value='';
  document.getElementById('inv-fecha').value=hoy();
  if(document.getElementById('inv-tbar'))document.getElementById('inv-tbar').style.display='none';
  if(document.getElementById('inv-resultado')){document.getElementById('inv-resultado').textContent='Completá los campos para ver el resultado.';document.getElementById('inv-resultado').style.color='var(--tx3)';}
  if(document.getElementById('inv-outA'))document.getElementById('inv-outA').style.display='none';
  invSelFuente('distribucion');
}

function invGenerar(){
  var fecha=document.getElementById('inv-fecha').value;
  var activo=document.getElementById('inv-activo')?document.getElementById('inv-activo').value:'OTRO';
  var fuente=document.getElementById('inv-fuente').value;
  var monedaOrigen=document.getElementById('inv-moneda-origen')?document.getElementById('inv-moneda-origen').value:'ARS';
  var monedaDestino=document.getElementById('inv-moneda-destino')?document.getElementById('inv-moneda-destino').value:'USD';
  var modalidad='COMPRA';
  var monto=parseFloat(document.getElementById('inv-monto').value)||0;
  var precio=parseFloat(document.getElementById('inv-precio').value)||0;
  var nota=document.getElementById('inv-nota').value.trim();
  var tbar=document.getElementById('inv-tbar');

  if(!fecha){sN('Completá la fecha',true);return;}
  if(!monto){sN('Completá el monto',true);return;}
  if(monedaOrigen!==monedaDestino&&!precio){sN('Completá el precio de conversión',true);return;}

  if(fuente==='liquidez_externa'){
    var liqTotal=gLiqExterna().reduce(function(a,x){return a+x.monto;},0);
    if(liqTotal<=0){
      sN('⚠ No hay liquidez externa registrada. Registrá liquidez primero.',true);
      return;
    }
    var dispLiq=getDisponibleLiq();
    var montoUSD=(activo==='BTC')?monto:monto/(_blueARS||1);
    if(montoUSD>dispLiq+0.01){
      if(!confirm('⚠ ADVERTENCIA: El monto supera el disponible en Liquidez Externa.\n\nDisponible: '+fu(dispLiq)+' USD\nMonto a invertir: '+fu(montoUSD.toFixed(2))+' USD\n\n¿Querés continuar de todas formas?'))return;
    }
  }

  if(fuente==='distribucion'){
    var dispDist=getDisponibleDist();
    var montoARSest=0;
    if(activo==='BTC') montoARSest=Math.round(monto*(_usdtARS||_blueARS||1));
    else montoARSest=monto;
    if(montoARSest>dispDist+1){
      if(!confirm('⚠ ADVERTENCIA: El monto supera el Resultado Neto disponible en Distribución.\n\nDisponible: '+fv(dispDist)+'\nMonto a invertir: '+fv(montoARSest)+'\n\n¿Querés continuar de todas formas?'))return;
    }
  }

  invCalcular();

  var montoARS=parseFloat(tbar.dataset.montoARS)||0;
  var cantidad=tbar.dataset.cantidad||'';

  var parts=fecha.split('-');var mes=parts[0]+parts[1];
  var id=invNuevoId(mes);

  var resultadoFlotante=0, precioActualStr='—';
  if(activo==='BTC'&&_btcPrecioUSD&&_blueARS&&precio>0){
    var q=Math.floor((monto/precio)*1e8)/1e8;
    var precioCompraARS=Math.round(precio*_blueARS);
    var precioActualARS=Math.round(_btcPrecioUSD*_blueARS);
    resultadoFlotante=Math.round((precioActualARS-precioCompraARS)*q);
    precioActualStr='$ '+fi(precioActualARS);
  } else if(activo==='USD_BLUE'&&_blueARS&&precio>0){
    var q2=Math.floor((monto/precio)*100)/100;
    var precioActualARS2=_blueARS;
    resultadoFlotante=Math.round((precioActualARS2-precio)*q2);
    precioActualStr='$ '+fi(Math.round(_blueARS));
  }

  var ALAB={BTC:'Bitcoin (BTC)',USD_BLUE:'Dólar Blue (USD)',REPO:'Fondo Reposición (REPO)'};
  var FLAB={DIST:'Distribución (DIST)',LEXT:'Liquidez Externa (LEXT)'};
  var tk='📅 Fecha: '+d2s(fecha)+'\n';
  tk+='ID Inversión: '+id+'\n';
  tk+='📈 Inversión:\n';
  tk+='  Activo: '+(ALAB[activo]||activo)+'\n';
  tk+='  Fuente: '+(FLAB[fuente]||fuente)+'\n';
  tk+='  Monto invertido: '+(activo==='BTC'?fu(monto)+' USDT':fv(monto))+'\n';
  if(activo!=='REPO'){
    tk+='  Precio de compra: '+fv(Math.round(precio*(activo==='BTC'?(_blueARS||1):1)))+' ARS'+
        (activo==='BTC'?' (US$ '+fu(precio)+')':'')+'\n';
    if(cantidad) tk+='  Cantidad adquirida: '+cantidad+'\n';
  }
  tk+='━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  tk+='💰 Impacto en fuente: -'+fv(montoARS)+'\n';
  if(activo!=='REPO'&&precioActualStr!=='—'){
    tk+='📊 Precio actual: '+precioActualStr+'\n';
    tk+='📈 Resultado flotante: '+(resultadoFlotante>=0?'+':'')+fv(resultadoFlotante)+'\n';
  }
  tk+='🔗 Ref. EGRESOS: 🟡 INVERSIÓN — '+(ALAB[activo]||activo)+'\n';
  if(nota) tk+='📝 Nota: '+nota+'\n';

  var r_blue=_blueARS||0;
  var r_usdt=_usdtARS||r_blue||0;
  var montoARSreg=0;
  if(monedaOrigen==='ARS') montoARSreg=monto;
  else if(monedaOrigen==='USD') montoARSreg=Math.round(monto*r_blue);
  else if(monedaOrigen==='USDT') montoARSreg=Math.round(monto*r_usdt);
  else if(monedaOrigen==='BTC') montoARSreg=Math.round(monto*(_btcPrecioUSD||0)*r_blue);
  var cantidadReg=tbar.dataset.cantidad||'';
  var registro={
    id:id, fecha:fecha, fechaDisplay:d2s(fecha), mesActual:mes,
    activo:monedaDestino, fuente:fuente,
    modalidad:modalidad, monedaOrigen:monedaOrigen, monedaDestino:monedaDestino,
    monto:monto, moneda:monedaOrigen, montoARS:montoARSreg,
    precioCompra:precio||0, cantidad:cantidadReg,
    precioActual:monedaDestino==='BTC'?(_btcPrecioUSD||0):(monedaDestino==='USD'?(_blueARS||0):0),
    resultadoFlotante:resultadoFlotante,
    estado:'ACTIVA', fechaCierre:null,
    nota:nota||null, ticketText:tk
  };

  sInv(registro);
  invRfMes();
  invRenderHistorial();
  renderInvDist();
  window.renderLiqExterna?.();
  window.renderDash?.();
  window.uhd?.();
  invActualizarCampos();
  document.getElementById('inv-tkOut').textContent=tk;
  document.getElementById('inv-outA').style.display='block';
  document.getElementById('inv-outA').scrollIntoView({behavior:'smooth'});
  sN('OK '+id+' registrada');
}

// ── Historial ──
function invRfMes(){
  var inv=gInv();
  var meses=[...new Set(inv.map(function(x){return x.mesActual;}))].sort();
  var sel=document.getElementById('filtInvMes');
  if(!sel)return;
  var cv=sel.value;
  sel.innerHTML='<option value="all">Todos los meses</option>';
  meses.forEach(function(m){
    var op=document.createElement('option');op.value=m;op.textContent=mLong(m);sel.appendChild(op);
  });
  if(cv)sel.value=cv;
}

function invRenderHistorial(){
  invActualizarFlotantes();

  var filtro=getInvFiltro();
  var fAct=document.getElementById('filtInvActivo')?document.getElementById('filtInvActivo').value:'all';
  var fEst=document.getElementById('filtInvEstado')?document.getElementById('filtInvEstado').value:'all';
  var inv=filtrarPorPeriodo(gInv(),filtro).sort(function(a,b){return a.fecha<b.fecha?-1:1;});
  if(fAct!=='all')inv=inv.filter(function(x){return x.activo===fAct;});
  if(fEst!=='all')inv=inv.filter(function(x){return x.estado===fEst;});
  var cont=document.getElementById('invHistorial');
  if(!cont)return;
  if(!inv.length){cont.innerHTML='<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:20px">Sin inversiones</div>';return;}

  var ALAB={BTC:'₿ BTC',USD_BLUE:'💵 Blue',REPO:'📦 REPO'};
  var FLAB={distribucion:'DIST',liquidez_externa:'LEXT'};
  var totActivas=inv.filter(function(x){return x.estado==='ACTIVA';}).length;
  var totLiquidadas=inv.filter(function(x){return x.estado==='LIQUIDADA';}).length;

  var grupos={};
  inv.forEach(function(x){if(!grupos[x.mesActual])grupos[x.mesActual]=[];grupos[x.mesActual].push(x);});
  var html='';
  Object.keys(grupos).sort().forEach(function(mes){
    html+='<div class="mhdr">'+mLong(mes)+'</div>';
    grupos[mes].forEach(function(x){
      var flotStr='—';
      if(x.activo!=='REPO'&&x.resultadoFlotante!==undefined){
        var flot=x.resultadoFlotante||0;
        flotStr=(flot>=0?'<span style="color:var(--ac)">+'+fv(flot)+'</span>':'<span style="color:var(--er)">'+fv(flot)+'</span>');
      }
      var estadoStyle=x.estado==='ACTIVA'?'color:var(--ac)':'color:var(--tx3)';
      html+='<div class="hi" style="flex-direction:column;align-items:stretch;gap:6px;cursor:default">'
        +'<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">'
        +'<div>'
        +'<div class="hid" style="color:var(--wn)">'+x.id+'</div>'
        +'<div class="hdate">'+x.fechaDisplay+' &nbsp;|&nbsp; '+(ALAB[x.activo]||x.activo)+' &nbsp;|&nbsp; '+(FLAB[x.fuente]||x.fuente)+'</div>'
        +'</div>'
        +'<span style="font-family:var(--mo);font-size:9px;'+estadoStyle+'">'+x.estado+'</span>'
        +'<div class="htot" style="color:var(--wn)">'+(x.moneda==='USDT'?fu(x.monto)+' USDT':fv(x.montoARS))+'</div>'
        +'</div>'
        +(x.activo!=='REPO'?'<div style="font-family:var(--mo);font-size:9px;color:var(--tx2);display:flex;gap:12px;flex-wrap:wrap">'
          +(x.cantidad?'<span>Cant: <b>'+x.cantidad+'</b></span>':'')
          +'<span>Flotante: '+flotStr+'</span>'
          +'</div>':'')
        +(x.estado==='ACTIVA'&&x.activo!=='REPO'
          ?'<button class="btn btn-s" style="font-size:9px;height:30px;padding:0 10px;margin-right:4px" onclick="invLiquidarModal(\''+x.id+'\')">💱 Liquidar</button>'
          :'')
        +'<button class="btn btn-d" style="font-size:13px;height:30px;width:30px;padding:0;margin-top:4px" onclick="invEliminar(\''+x.id+'\')">✕</button>'
        +'</div>';
    });
  });

  html+='<div style="margin-top:10px;background:var(--s2);border:1px solid var(--br);padding:10px;font-family:var(--mo);font-size:9px">'
    +'<div style="color:var(--tx3);letter-spacing:1px;margin-bottom:6px">RESUMEN DEL PERÍODO</div>'
    +'<div style="display:flex;gap:16px;flex-wrap:wrap">'
    +'<span>Total registros: <b style="color:var(--tx)">'+inv.length+'</b></span>'
    +'<span>Activas: <b style="color:var(--ac)">'+totActivas+'</b></span>'
    +'<span>Liquidadas: <b style="color:var(--tx3)">'+totLiquidadas+'</b></span>'
    +'<span>Último ID: <b style="color:var(--wn)">'+(inv[inv.length-1]?inv[inv.length-1].id:'—')+'</b></span>'
    +'</div></div>';

  cont.innerHTML=html;
}

function invActualizarFlotantes(){
  var d=ld();
  if(!d.inversiones||!d.inversiones.length)return;
  var changed=false;
  d.inversiones.forEach(function(x){
    if(x.estado!=='ACTIVA')return;
    var dest=x.monedaDestino||x.activo||'';
    var origen=x.monedaOrigen||x.moneda||'ARS';
    if(!x.precioCompra||x.precioCompra<=0)return;
    var q=0,flotante=0;
    if(dest==='BTC'){
      if(!_btcPrecioUSD||!_blueARS)return;
      q=Math.floor((x.monto/x.precioCompra)*1e8)/1e8;
      var pcARS2=(origen==='ARS')?x.precioCompra:Math.round(x.precioCompra*(_blueARS||1));
      var paARS2=Math.round(_btcPrecioUSD*_blueARS);
      flotante=Math.round((paARS2-pcARS2)*q);
      x.precioActual=_btcPrecioUSD;
      x.resultadoFlotante=flotante;
      changed=true;
    } else if(dest==='USD'||dest==='USD_BLUE'){
      if(!_blueARS)return;
      q=Math.floor((x.monto/x.precioCompra)*100)/100;
      flotante=Math.round((_blueARS-x.precioCompra)*q);
      x.precioActual=_blueARS;
      x.resultadoFlotante=flotante;
      changed=true;
    } else if(dest==='USDT'){
      if(!_usdtARS)return;
      q=Math.floor((x.monto/x.precioCompra)*100)/100;
      flotante=Math.round((_usdtARS-x.precioCompra)*q);
      x.precioActual=_usdtARS;
      x.resultadoFlotante=flotante;
      changed=true;
    }
  });
  if(changed)sd(d);
}

function invLiquidarModal(id){
  var inv=gInv().find(function(x){return x.id===id;});
  if(!inv)return;
  var dest=inv.monedaDestino||inv.activo||'';
  var origen=inv.monedaOrigen||inv.moneda||'ARS';
  var precioSug=0;
  if(dest==='BTC')precioSug=_btcPrecioUSD||0;
  else if(dest==='USD'||dest==='USD_BLUE')precioSug=_blueARS||0;
  else if(dest==='USDT')precioSug=_usdtARS||0;
  var precioLbl='Precio de venta ('+origen+'/'+dest+')';
  var flot=inv.resultadoFlotante||0;
  var flotColor=flot>=0?'var(--ac)':'var(--er)';
  var flotStr='<span style="color:'+flotColor+'">'+(flot>=0?'+':'')+fv(flot)+'</span>';
  document.getElementById('mTitEl').textContent='💱 Liquidar '+id;
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal';
  document.getElementById('mTk').style.display='none';
  var info='<div style="font-family:var(--mo);font-size:10px;margin-bottom:12px;line-height:1.8;background:var(--s2);border:1px solid var(--br);padding:10px">';
  info+='<b>'+id+'</b> — '+dest+'<br>';
  info+='Invertido: <b>'+inv.monto.toLocaleString('es-AR')+' '+origen+'</b>'+(inv.cantidad?' → '+inv.cantidad:'')+'<br>';
  info+='Precio compra: <b>'+inv.precioCompra.toLocaleString('es-AR')+'</b><br>';
  info+='Flotante actual: '+flotStr;
  info+='</div>';
  info+='<div><label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px">'+precioLbl+'</label>';
  info+='<input type="number" id="inv-precio-venta" value="'+precioSug+'" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:14px;padding:9px;outline:none;min-height:44px"></div>';
  document.getElementById('mBody').innerHTML=info;
  document.getElementById('mFooter').innerHTML='<button class="btn btn-p" onclick="invConfirmarLiquidacion(\''+id+'\')" >💱 Confirmar liquidación</button><button class="btn btn-s" onclick="clM()">✕ Cancelar</button>';
  document.getElementById('modal').classList.add('open');
}

function invConfirmarLiquidacion(id){
  var precioVenta=parseFloat(document.getElementById('inv-precio-venta').value)||0;
  if(!precioVenta){sN('Completá el precio de venta',true);return;}
  var d=ld();
  var inv=d.inversiones?d.inversiones.find(function(x){return x.id===id;}):null;
  if(!inv){sN('No encontrado',true);window.clM?.();return;}

  var dest=inv.monedaDestino||inv.activo||'';
  var origen=inv.monedaOrigen||inv.moneda||'ARS';
  var q=0;
  if(dest==='BTC') q=Math.floor((inv.monto/inv.precioCompra)*1e8)/1e8;
  else q=Math.floor((inv.monto/inv.precioCompra)*100)/100;

  var factor=1;
  if(dest==='BTC') factor=_blueARS||1;
  else if(dest==='USD'||dest==='USD_BLUE') factor=1;
  else if(dest==='USDT') factor=1;
  var pvARS=Math.round(precioVenta*factor);
  var pcARS=Math.round(inv.precioCompra*factor);
  var resultadoRealizado=Math.round((pvARS-pcARS)*q);
  var capitalRecuperado=Math.round((inv.montoARS||0)+resultadoRealizado);

  inv.estado='LIQUIDADA';
  inv.fechaCierre=hoy();
  inv.precioVenta=precioVenta;
  inv.resultadoRealizado=resultadoRealizado;
  inv.capitalRecuperado=capitalRecuperado;
  sd(d);

  var mes=d2m(hoy());
  var fecha=hoy();
  var signo=resultadoRealizado>=0?'+':'';
  var concepto='🟡 LIQ. INVERSIÓN '+id+' ('+dest+') — Resultado: '+signo+fv(resultadoRealizado);
  // Import sE dynamically via window to avoid circular dep
  const sE=window.sE;
  if(resultadoRealizado>=0){
    var eId=nEId(mes);
    var eObj={
      id:eId, fecha:fecha, fechaDisplay:d2s(fecha), mesActual:mes,
      concepto:concepto,
      montoTotal:capitalRecuperado,
      impactoCaja:-capitalRecuperado,
      cuotasTotales:1, cuotasRestantes:0, finaliza:fecha,
      medio:'Liquidación Inversión',
      obs:'Ref: '+id+' | Capital recuperado: '+fv(capitalRecuperado),
      esLiquidacionInv:true, invRef:id
    };
    if(sE)sE(eObj);
  } else {
    var eId2=nEId(mes);
    var eObj2={
      id:eId2, fecha:fecha, fechaDisplay:d2s(fecha), mesActual:mes,
      concepto:concepto,
      montoTotal:Math.abs(resultadoRealizado),
      impactoCaja:Math.abs(resultadoRealizado),
      cuotasTotales:1, cuotasRestantes:0, finaliza:fecha,
      medio:'Pérdida Inversión',
      obs:'Ref: '+id+' | Capital original: '+fv(inv.montoARS||0),
      esLiquidacionInv:true, invRef:id
    };
    if(sE)sE(eObj2);
  }

  invRfMes();
  invRenderHistorial();
  renderInvDist();
  window.renderLiqExterna?.();
  window.rfM?.(); window.rEH?.(); window.rES?.();
  window.renderDash?.();
  window.uhd?.();
  invActualizarCampos();
  window.clM?.();
  sN(id+' liquidada — '+signo+fv(resultadoRealizado)+' → '+(resultadoRealizado>=0?'INGRESO':'EGRESO')+' generado');
}

function invEliminar(id){
  if(!confirm('¿Eliminar '+id+'?\nEsta acción no se puede deshacer.'))return;
  dInv(id);
  invRfMes();
  invRenderHistorial();
  renderInvDist();
  window.renderLiqExterna?.();
  window.renderDash?.();
  window.uhd?.();
  invActualizarCampos();
  sN(id+' eliminado');
}

function invAnularModal(){
  window.showInputModal?.('🟡 Anular Inversión por ID','ID (ej: I-202603-0001):',true,'uppercase',function(raw){
    if(!raw)return;
    var id=raw.toUpperCase();
    var inv=gInv().find(function(x){return x.id===id;});
    if(!inv){sN(id+' no encontrado',true);return;}
    if(!confirm('Anular '+id+'?'))return;
    dInv(id);invRfMes();invRenderHistorial();
    sN(id+' anulada');window.clM?.();
  });
}

function invLimpiar(){
  if(!confirm('Eliminar TODAS las inversiones y liquidez externa?'))return;
  var d=ld();d.inversiones=[];d.liquidezExterna=[];sd(d);
  invRfMes();invRenderHistorial();
  sN('Todo limpio');
}

function renderInvAll(){
  if(!localStorage.getItem('me_dist_slices')){
    distSlices=buildSmartDefaults();
  }
  renderInvRepo();renderInvDist();invRenderHistorial();window.renderLiqExterna?.();
  if(document.getElementById('inv-activo'))buildInvForm();
  rfInvHistMes();
  if(document.getElementById('inv-activo'))updInvTicket();
}

// ── Aliases ──
function onInvActivoChange(){invActualizarCampos();}
function onInvFuenteChange(){}
function buildInvForm(){invActualizarCampos();}
function calcInvResult(){invCalcular();}
function updInvTicket(){invCalcular();}
function limpiarInversiones(){invLimpiar();}
function rfInvHistMes(){invRfMes();}

// ── Dashboard inversiones ──
function renderDashInversiones(cont,f){
  var invAll=gInv();
  if(!invAll.length)return;
  var filtInv;
  if(f==='rango'){
    var desdeEl=document.getElementById('dashDesde');
    var hastaEl=document.getElementById('dashHasta');
    var desde=desdeEl?desdeEl.value:'';
    var hasta=hastaEl?hastaEl.value:'';
    filtInv=invAll.filter(function(o){return(!desde||o.fecha>=desde)&&(!hasta||o.fecha<=hasta);});
  } else if(f!=='all'){
    filtInv=invAll.filter(function(o){return o.mesActual===f;});
  } else {
    filtInv=invAll;
  }
  if(!filtInv.length)return;
  var totInvARS=filtInv.reduce(function(a,x){return a+(x.montoARS||0);},0);
  var byA={};
  filtInv.forEach(function(x){
    var k=x.activo&&x.activo.indexOf('STOCK_')===0?'STOCK':x.activo;
    byA[k]=(byA[k]||0)+(x.montoARS||0);
  });
  var AC2={BTC:'#ff6b35',USD_BLUE:'#ffaa00',USDT:'#7c6fff',ORO:'#e0c080',STOCK:'#00e5a0',OTRO:'#8888a0'};
  var AL2={BTC:'BTC',USD_BLUE:'Dolar Blue',USDT:'USDT',ORO:'Oro',STOCK:'Stock',OTRO:'Otro'};
  var html='<div class="ct" style="margin-top:14px;margin-bottom:8px">Inversiones del período</div>';
  html+='<div class="kpi-grid">';
  html+='<div class="kpi" style="border-top-color:var(--wn)"><div class="klbl">Total Invertido</div><div class="kval wn">'+fv(totInvARS)+'</div><div class="ksub">'+filtInv.length+' registros</div></div>';
  Object.entries(byA).forEach(function(e){
    var col=AC2[e[0]]||'#888';
    html+='<div class="kpi" style="border-top-color:'+col+'"><div class="klbl">'+(AL2[e[0]]||e[0])+'</div><div class="kval" style="color:'+col+'">'+fv(e[1])+'</div></div>';
  });
  html+='</div>';
  cont.innerHTML+=html;
}


// ===== modules/dashboard.js =====

// ── CHART TOGGLE ──
let hiddenCharts={bar:false,dough:false,line:false,cost:false};
function toggleChart(k){
  hiddenCharts[k]=!hiddenCharts[k];
  const wid='wrap'+k.charAt(0).toUpperCase()+k.slice(1);
  const bid='tog'+k.charAt(0).toUpperCase()+k.slice(1);
  const wrap=document.getElementById(wid),btn=document.getElementById(bid);
  if(wrap)wrap.style.display=hiddenCharts[k]?'none':'';
  if(btn){btn.textContent=hiddenCharts[k]?'🙈':'👁';btn.style.opacity=hiddenCharts[k]?'.4':'1';}
  if(!hiddenCharts[k])renderDash();
}

// ── DASHBOARD ──
let dashCharts={};
function destroyCharts(){Object.values(dashCharts).forEach(c=>{try{c.destroy();}catch(e){}});dashCharts={};}

function onDashMesChange(){
  const v=document.getElementById('dashMes').value;
  const dw=document.getElementById('dashDesdeWrap'),hw=document.getElementById('dashHastaWrap');
  if(v==='rango'){if(dw)dw.style.display='';if(hw)hw.style.display='';const h=new Date().toISOString().split('T')[0];document.getElementById('dashDesde').value=h.substring(0,8)+'01';document.getElementById('dashHasta').value=h;}
  else{if(dw)dw.style.display='none';if(hw)hw.style.display='none';}
  renderDash();
  renderDashFlowChart();
}

// ── BALANCE MULTIMONEDA ──
function calcBalance(){
  const orders=gOConf();
  const eg=gE();
  const inv=gInv();
  const bal={ars:0,usd:0,usdt:0};

  orders.forEach(o=>{
    const pm=o.payment;
    if(pm&&pm.modo==='MIX'){
      bal.ars+=(pm.ars||0);
      bal.usd+=(pm.usd||0);
      bal.usdt+=(pm.usdt||0);
    } else if(pm&&pm.modo==='USDT'){
      bal.usdt+=(pm.usdt||0);
    } else if(pm&&pm.modo==='USD'){
      bal.usd+=(pm.usd||0);
    } else {
      bal.ars+=(o.totales?.totalGeneral||0);
    }
  });

  eg.forEach(e=>{ bal.ars-=(e.impactoCaja||0); });

  inv.forEach(x=>{
    const activo=(x.activo||'').toUpperCase();
    const monto=x.montoARS||0;
    const unidades=x.unidad||0;
    if(activo==='USDT'||activo==='BTC'){
      bal.ars-=monto;
      bal.usdt+=unidades;
    } else if(activo==='USD_BLUE'||activo==='USD'){
      bal.ars-=monto;
      bal.usd+=unidades;
    }
  });

  return bal;
}

function renderDash(){
  destroyCharts();
  actualizarPreciosDash();
  const f=document.getElementById('dashMes').value;
  let orders=gOConf(),eg=gE();
  if(f==='rango'){const desde=document.getElementById('dashDesde').value;const hasta=document.getElementById('dashHasta').value;if(desde)orders=orders.filter(o=>o.fecha>=desde);if(hasta)orders=orders.filter(o=>o.fecha<=hasta);if(desde)eg=eg.filter(e=>e.fecha>=desde);if(hasta)eg=eg.filter(e=>e.fecha<=hasta);}
  else if(f!=='all'){orders=orders.filter(o=>o.mesActual===f);eg=eg.filter(e=>e.mesActual===f);}
  const cont=document.getElementById('dashContent');
  if(!orders.length&&!eg.length){cont.innerHTML=`<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:30px">Sin datos</div>`;return;}
  const totV=orders.reduce((a,o)=>a+(o.totales.totalGeneral||0),0);
  const totE=eg.reduce((a,e)=>a+(e.impactoCaja||0),0);
  const neto=totV-totE;const totC=orders.reduce((a,o)=>a+(o.costo||0),0);
  const gan=totV-totC;const mgp=totV>0?((gan/totV)*100).toFixed(1):0;
  const fondoRepo=totC;const totOrd=orders.length;const tprom=totOrd?totV/totOrd:0;
  const netoReal=neto-totC;

  const byTP={ARS:0,USD:0,USDT:0};
  const ventasEnARS={ARS:0,USD:0,USDT:0};
  const tcPromedio={USD:{sumUsd:0,sumArs:0},USDT:{sumUsdt:0,sumArs:0}};
  orders.forEach(o=>{
    const p=o.payment||{};
    if(p.modo==='ARS'||p.modo===undefined){
      byTP.ARS+=o.totales.totalGeneral||0;
      ventasEnARS.ARS+=o.totales.totalGeneral||0;
    } else if(p.modo==='USD'){
      byTP.USD+=p.usd||0;
      ventasEnARS.USD+=(p.usd||0)*(p.tc_usd||1);
      if(p.usd>0){tcPromedio.USD.sumUsd+=p.usd;tcPromedio.USD.sumArs+=(p.usd*(p.tc_usd||1));}
    } else if(p.modo==='USDT'){
      byTP.USDT+=p.usdt||0;
      ventasEnARS.USDT+=(p.usdt||0)*(p.tc_usdt||1);
      if(p.usdt>0){tcPromedio.USDT.sumUsdt+=p.usdt;tcPromedio.USDT.sumArs+=(p.usdt*(p.tc_usdt||1));}
    } else if(p.modo==='MIX'){
      byTP.ARS+=p.ars||0;
      ventasEnARS.ARS+=p.ars||0;
      if(p.usd>0){byTP.USD+=p.usd;ventasEnARS.USD+=(p.usd*(p.tc_usd||1));tcPromedio.USD.sumUsd+=p.usd;tcPromedio.USD.sumArs+=(p.usd*(p.tc_usd||1));}
      if(p.usdt>0){byTP.USDT+=p.usdt;ventasEnARS.USDT+=(p.usdt*(p.tc_usdt||1));tcPromedio.USDT.sumUsdt+=p.usdt;tcPromedio.USDT.sumArs+=(p.usdt*(p.tc_usdt||1));}
    } else {
      byTP.ARS+=o.totales.totalGeneral||0;
      ventasEnARS.ARS+=o.totales.totalGeneral||0;
    }
  });

  const tcActualUSD=window._blueARS||0;
  const tcActualUSDT=window._usdtARS||0;
  const tcPromUSD=tcPromedio.USD.sumUsd>0?(tcPromedio.USD.sumArs/tcPromedio.USD.sumUsd):0;
  const tcPromUSDT=tcPromedio.USDT.sumUsdt>0?(tcPromedio.USDT.sumArs/tcPromedio.USDT.sumUsdt):0;
  const ganFlotUSD=tcActualUSD>0&&tcPromedio.USD.sumUsd>0?(tcActualUSD-tcPromUSD)*tcPromedio.USD.sumUsd:0;
  const ganFlotUSDT=tcActualUSDT>0&&tcPromedio.USDT.sumUsdt>0?(tcActualUSDT-tcPromUSDT)*tcPromedio.USDT.sumUsdt:0;
  const pctUSD=tcPromUSD>0?((tcActualUSD/tcPromUSD-1)*100).toFixed(1):0;
  const pctUSDT=tcPromUSDT>0?((tcActualUSDT/tcPromUSDT-1)*100).toFixed(1):0;

  const _PAST_IDS=new Set(['p-past','v-cal','v-ted','v-lck','v-gen']);
  const qPast=orders.reduce((a,o)=>a+((o.productos._lineas?o.productos._lineas.filter(l=>_PAST_IDS.has(l.prodId)).reduce((s,l)=>s+(l.qty||0),0):(o.productos.calaveras||0)+(o.productos.teddy||0)+(o.productos.lucky||0)+(o.productos.genericas||0))||0),0);
  const qCris=orders.reduce((a,o)=>a+((o.productos._lineas?o.productos._lineas.filter(l=>l.prodId==='p-cris').reduce((s,l)=>s+(l.qty||0),0):o.productos.cristales||0)||0),0);
  const qHong=orders.reduce((a,o)=>a+((o.productos._lineas?o.productos._lineas.filter(l=>l.prodId==='p-hong').reduce((s,l)=>s+(l.qty||0),0):o.productos.hongos||0)||0),0);
  const qGot=orders.reduce((a,o)=>a+((o.productos._lineas?o.productos._lineas.filter(l=>l.prodId==='p-got').reduce((s,l)=>s+(l.qty||0),0):o.productos.goteros||0)||0),0);
  const qPetr=orders.reduce((a,o)=>a+((o.productos._lineas?o.productos._lineas.filter(l=>l.prodId==='p-pet').reduce((s,l)=>s+(l.qty||0),0):o.productos.petri||0)||0),0);
  const vPast=orders.reduce((a,o)=>a+((o.totales.totalPastillasLinea||0)+(o.totales.totalPastillasBase||0)),0);
  const vCris=orders.reduce((a,o)=>a+(o.totales.totalCristales||0),0);
  const vHong=orders.reduce((a,o)=>a+(o.totales.totalHongos||0),0);
  const vGot=orders.reduce((a,o)=>a+(o.totales.totalGoteros||0),0);
  const vPetr=orders.reduce((a,o)=>a+(o.totales.totalPetri||0),0);
  const vVar=orders.reduce((a,o)=>a+(o.productos.variable||0),0);

  const cPast=qPast*COSTS.past,cCris=qCris*COSTS.cris,cHong=qHong*COSTS.hong,cGot=qGot*COSTS.got,cPetr=qPetr*COSTS.pet;
  const allM=[...new Set([...orders.map(o=>o.mesActual),...eg.map(e=>e.mesActual)])].sort();
  const pm={};allM.forEach(m=>{pm[m]={v:0,e:0,c:0,n:0};});
  orders.forEach(o=>{if(pm[o.mesActual]){pm[o.mesActual].v+=o.totales.totalGeneral||0;pm[o.mesActual].c+=o.costo||0;pm[o.mesActual].n++;}});
  eg.forEach(e=>{if(pm[e.mesActual])pm[e.mesActual].e+=e.impactoCaja||0;});
  const ratio=totE>0?((totV/totE)*100).toFixed(0):100;const estadoTxt=neto>0?'🟢 Crecimiento':'🔴 Déficit';
  function mgClass(v){return v>70?'margin-ok':v>40?'margin-wn':'margin-er';}
  function mgRow(emoji,qty,unit,ventas,costo){if(!ventas)return'';const mg=ventas>0?((ventas-costo)/ventas*100).toFixed(1):0;return`<tr><td>${emoji}</td><td class="mu">${qty}${unit}</td><td class="ac">${fv(ventas)}</td><td class="er">${fv(costo)}</td><td class="ac">${fv(ventas-costo)}</td><td class="${mgClass(parseFloat(mg))}">${mg}%</td></tr>`;}
  const bal=calcBalance();
  const saldos=[];
  if(Math.abs(bal.ars)>1) saldos.push({label:'ARS',val:fv(bal.ars),color:bal.ars>=0?'var(--ac)':'var(--er)',neg:bal.ars<0});
  if(Math.abs(bal.usd)>0.001) saldos.push({label:'USD',val:(bal.usd>=0?'':'−')+fu(Math.abs(bal.usd)),color:bal.usd>=0?'#ffaa00':'var(--er)',neg:bal.usd<0});
  if(Math.abs(bal.usdt)>0.001) saldos.push({label:'USDT',val:(bal.usdt>=0?'':'−')+fu(Math.abs(bal.usdt)),color:bal.usdt>=0?'var(--ac2)':'var(--er)',neg:bal.usdt<0});
  const saldoHTML=saldos.length===0?'':`
  <div class="kpi-grid" style="margin-bottom:14px">
    ${saldos.map(m=>`<div class="kpi ${m.neg?'neg':''}"><div class="klbl">Saldo ${m.label}</div><div class="kval" style="color:${m.color}">${m.val}</div><div class="ksub">${m.label==='ARS'?'Pesos':m.label==='USD'?'Dólar':'Tether'}</div></div>`).join('')}
  </div>`;
  cont.innerHTML=`
  <!-- Header con Precios en Tiempo Real -->
  ${(window._blueARS||window._usdtARS)?`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding:8px 12px;background:var(--s2);border:1px solid var(--br)">
    <div style="font-family:var(--mo);font-size:9px;color:var(--tx2)">📡 TC Actual:</div>
    <div style="display:flex;gap:16px;font-family:var(--mo);font-size:10px">
      ${window._blueARS?`<span>USD <strong style="color:var(--wn)">${fi(window._blueARS)}</strong></span>`:''}
      ${window._usdtARS?`<span>USDT <strong style="color:var(--ac2)">${fi(window._usdtARS)}</strong></span>`:''}
    </div>
  </div>`:''}

  <!-- Resumen General -->
  <div class="card" style="padding:12px;margin-bottom:16px">
    <div style="font-family:var(--mo);font-size:8px;color:var(--tx2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px">Resumen General</div>
    <div class="kpi-grid" style="gap:12px">
      <div class="kpi"><div class="klbl">Ingresos Totales</div><div class="kval" style="font-size:16px">${fv(totV)}</div><div class="ksub">${totOrd} órdenes · promedio ${fv(tprom)}</div></div>
      <div class="kpi neg"><div class="klbl">Egresos</div><div class="kval neg">-${fv(totE)}</div><div class="ksub">${eg.length} gastos</div></div>
      <div class="kpi ${neto>=0?'ok':'neg'}" style="border-top:3px solid ${neto>=0?'var(--ac)':'var(--er)'}"><div class="klbl">Resultado Neto</div><div class="kval ${neto>=0?'':'neg'}" style="font-size:20px">${neto>=0?fv(neto):'-'+fv(Math.abs(neto))}</div><div class="ksub">Ingresos - Egresos</div></div>
    </div>
  </div>

  <!-- Moneda Recibida -->
  <div class="card" style="padding:12px;margin-bottom:16px">
    <div style="font-family:var(--mo);font-size:8px;color:var(--tx2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px">Moneda Recibida <span style="color:var(--tx3);font-weight:400">— en la moneda que pagó el cliente</span></div>
    <div class="kpi-grid" style="gap:12px">
      <div class="kpi"><div class="klbl">Pesos (ARS)</div><div class="kval" style="font-size:16px">${fv(byTP.ARS)}</div><div class="ksub">Ventas en pesos</div></div>
      ${byTP.USD>0?`<div class="kpi wn"><div class="klbl">Dólares (USD)</div><div class="kval wn" style="font-size:16px">${fu(byTP.USD)}</div><div class="ksub">≈ ${fv(ventasEnARS.USD)} ARS · TC ${fi(Math.round(tcPromedio.USD.sumArs/tcPromedio.USD.sumUsd))}</div></div>`:''}
      ${byTP.USDT>0?`<div class="kpi pur"><div class="klbl">Cripto (USDT)</div><div class="kval pur" style="font-size:16px">${fu(byTP.USDT)}</div><div class="ksub">≈ ${fv(ventasEnARS.USDT)} ARS · TC ${fi(Math.round(tcPromedio.USDT.sumArs/tcPromedio.USDT.sumUsdt))}</div></div>`:''}
    </div>
  </div>

  <!-- Ganancia Flotante (si hay USD/USDT) -->
  ${(tcPromedio.USD.sumUsd>0||tcPromedio.USDT.sumUsdt>0)?`
  <div class="card" style="padding:12px;margin-bottom:16px">
    <div style="font-family:var(--mo);font-size:8px;color:var(--tx2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px">Ganancia Flotante <span style="color:var(--tx3);font-weight:400">— cuánto ganás/perdés si vendés hoy</span></div>
    ${tcPromedio.USD.sumUsd>0?`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px">
      <div style="padding:10px;background:var(--s2);border:1px solid var(--br)">
        <div style="font-family:var(--mo);font-size:9px;color:var(--wn);margin-bottom:4px">USD</div>
        <div style="font-family:var(--mo);font-size:12px">Tenés: <strong>${fu(tcPromedio.USD.sumUsd)} USD</strong></div>
        <div style="font-family:var(--mo);font-size:9px;color:var(--tx3)">TC compra: ${fi(Math.round(tcPromUSD))} → TC actual: ${fi(tcActualUSD)}</div>
      </div>
      <div style="padding:10px;background:var(--s2);border:1px solid var(--br);text-align:center">
        <div style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-bottom:4px">Ganancia/Pérdida</div>
        <div style="font-family:var(--mo);font-size:16px;font-weight:700;color:${ganFlotUSD>=0?'var(--ac)':'var(--er)'}">${ganFlotUSD>=0?'+':''}${fv(Math.round(ganFlotUSD))}</div>
        <div style="font-family:var(--mo);font-size:9px;color:${ganFlotUSD>=0?'var(--ac)':'var(--er)'}">${ganFlotUSD>=0?'+':''}${pctUSD}%</div>
      </div>
    </div>`:''}
    ${tcPromedio.USDT.sumUsdt>0?`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="padding:10px;background:var(--s2);border:1px solid var(--br)">
        <div style="font-family:var(--mo);font-size:9px;color:var(--ac2);margin-bottom:4px">USDT</div>
        <div style="font-family:var(--mo);font-size:12px">Tenés: <strong>${fu(tcPromedio.USDT.sumUsdt)} USDT</strong></div>
        <div style="font-family:var(--mo);font-size:9px;color:var(--tx3)">TC compra: ${fi(Math.round(tcPromUSDT))} → TC actual: ${fi(tcActualUSDT)}</div>
      </div>
      <div style="padding:10px;background:var(--s2);border:1px solid var(--br);text-align:center">
        <div style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-bottom:4px">Ganancia/Pérdida</div>
        <div style="font-family:var(--mo);font-size:16px;font-weight:700;color:${ganFlotUSDT>=0?'var(--ac)':'var(--er)'}">${ganFlotUSDT>=0?'+':''}${fv(Math.round(ganFlotUSDT))}</div>
        <div style="font-family:var(--mo);font-size:9px;color:${ganFlotUSDT>=0?'var(--ac)':'var(--er)'}">${ganFlotUSDT>=0?'+':''}${pctUSDT}%</div>
      </div>
    </div>`:''}
  </div>`:''}

  <!-- Rentabilidad -->
  <div class="card" style="padding:12px;margin-bottom:16px">
    <div style="font-family:var(--mo);font-size:8px;color:var(--tx2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px">Rentabilidad</div>
    <div class="kpi-grid" style="gap:12px">
      <div class="kpi org"><div class="klbl">Margen</div><div class="kval org" style="font-size:20px">${mgp}%</div><div class="ksub">Ganancia / Ventas</div></div>
      <div class="kpi wn"><div class="klbl">Fondo Reposición</div><div class="kval wn" style="font-size:14px">${fv(fondoRepo)}</div><div class="ksub">Costo de reponer stock</div></div>
      <div class="kpi ${netoReal>=0?'ok':'neg'}"><div class="klbl">Resultado Real</div><div class="kval ${netoReal>=0?'':'neg'}" style="font-size:16px">${netoReal>=0?fv(netoReal):'-'+fv(Math.abs(netoReal))}</div><div class="ksub">Neto - costos repo</div></div>
      <div class="kpi"><div class="klbl">Estado</div><div class="kval" style="font-size:14px">${estadoTxt}</div><div class="ksub">Ratio ${ratio}%</div></div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div><div class="ct" style="margin-bottom:4px">Ingresos vs Egresos <button class="btn btn-s" onclick="toggleChart('bar')" id="togBar" style="font-size:8px;height:22px;padding:0 7px;margin-left:4px">👁</button></div><div class="cw2" id="wrapBar"><canvas id="cBar"></canvas></div></div>
    <div><div class="ct" style="margin-bottom:4px">Mix de productos <button class="btn btn-s" onclick="toggleChart('dough')" id="togDough" style="font-size:8px;height:22px;padding:0 7px;margin-left:4px">👁</button></div><div class="cw2" id="wrapDough"><canvas id="cDough"></canvas></div></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div><div class="ct" style="margin-bottom:4px">Resultado neto mensual <button class="btn btn-s" onclick="toggleChart('line')" id="togLine" style="font-size:8px;height:22px;padding:0 7px;margin-left:4px">👁</button></div><div class="cw" id="wrapLine"><canvas id="cLine"></canvas></div></div>
    <div><div class="ct" style="margin-bottom:4px">Ventas vs Costos repo <button class="btn btn-s" onclick="toggleChart('cost')" id="togCost" style="font-size:8px;height:22px;padding:0 7px;margin-left:4px">👁</button></div><div class="cw" id="wrapCost"><canvas id="cCost"></canvas></div></div>
  </div>
  <div class="ct" style="margin-top:14px;margin-bottom:8px">Análisis de margen por producto</div>
  <div class="tw"><table><thead><tr><th>Producto</th><th>Cant.</th><th>Ventas ARS</th><th>Costo Repo</th><th>Ganancia</th><th>Margen %</th></tr></thead><tbody>
    ${mgRow('💊 Pastillas',qPast,'ud',vPast,cPast)}${mgRow('💎 Cristales',qCris,'g',vCris,cCris)}${mgRow('🍄 Hongos',qHong,'g',vHong,cHong)}${mgRow('💧 Goteros',qGot,'ud',vGot,cGot)}${mgRow('🧫 Petri',qPetr,'ud',vPetr,cPetr)}${vVar?`<tr><td>💲 Variable</td><td class="mu">—</td><td class="ac">${fv(vVar)}</td><td class="mu">—</td><td class="ac">${fv(vVar)}</td><td class="mu">—</td></tr>`:''}
    <tr class="total-row"><td>TOTAL</td><td></td><td class="ac">${fv(totV)}</td><td class="er">${fv(totC)}</td><td class="ac">${fv(gan)}</td><td class="${mgClass(parseFloat(mgp))}">${mgp}%</td></tr>
  </tbody></table></div>
  <div class="ct" style="margin-top:14px;margin-bottom:8px">Histórico mensual</div>
  <div class="tw"><table><thead><tr><th>Mes</th><th>Ventas</th><th>Egresos</th><th>Neto</th><th>Margen</th><th>Órd.</th></tr></thead><tbody>
    ${allM.map(m=>{const mn=pm[m].v-pm[m].e;const mg2=pm[m].v>0?((pm[m].v-pm[m].c)/pm[m].v*100).toFixed(1):'—';return`<tr><td class="ac">${mLong(m)}</td><td>${fv(pm[m].v)}</td><td class="er">-${fv(pm[m].e)}</td><td class="${mn>=0?'ac':'er'}">${mn>=0?fv(mn):'-'+fv(Math.abs(mn))}</td><td class="wn">${mg2!=='—'?mg2+'%':'—'}</td><td class="mu">${pm[m].n}</td></tr>`;}).join('')}
  </tbody></table></div>`;
  setTimeout(()=>{
    const gs={responsive:true,maintainAspectRatio:false};const tx={color:'#55556a',font:{family:'Space Mono',size:8}};const gr={color:'rgba(42,42,58,.4)'};const fY=v=>'$'+fi(v);
    const cBar=document.getElementById('cBar');
    if(cBar&&!hiddenCharts.bar)dashCharts.bar=new Chart(cBar,{type:'bar',data:{labels:allM.map(m=>mL(m)),datasets:[
      {label:'Ingresos',data:allM.map(m=>pm[m].v),backgroundColor:'rgba(0,229,160,.7)',borderColor:'#00e5a0',borderWidth:1},
      {label:'Egresos',data:allM.map(m=>pm[m].e),backgroundColor:'rgba(255,68,85,.6)',borderColor:'#ff4455',borderWidth:1},
      {label:'Resultado Real',data:allM.map(m=>Math.max(0,pm[m].v-pm[m].e-pm[m].c)),backgroundColor:'rgba(255,170,0,.8)',borderColor:'#ffaa00',borderWidth:1}
    ]},options:{...gs,plugins:{legend:{display:true,labels:{color:'#8888a0',font:{family:'Space Mono',size:7},boxWidth:8,padding:6}}},scales:{x:{grid:gr,ticks:tx},y:{grid:gr,ticks:{...tx,callback:fY}}}}});
    const md=[],ml=[],mc=['#00e5a0','#7c6fff','#ff6b35','#ffaa00','#ff4455','#44aaff'];
    if(vPast>0){ml.push('💊');md.push(vPast);}if(vCris>0){ml.push('💎');md.push(vCris);}if(vHong>0){ml.push('🍄');md.push(vHong);}if(vGot>0){ml.push('💧');md.push(vGot);}if(vPetr>0){ml.push('🧫');md.push(vPetr);}if(vVar>0){ml.push('💲');md.push(vVar);}
    const cD=document.getElementById('cDough');
    if(cD&&md.length&&!hiddenCharts.dough)dashCharts.dough=new Chart(cD,{type:'doughnut',data:{labels:ml,datasets:[{data:md,backgroundColor:mc.slice(0,md.length),borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:'bottom',labels:{color:'#8888a0',font:{family:'Space Mono',size:8},boxWidth:8,padding:5}}}}});
    const cLine=document.getElementById('cLine');
    if(cLine&&!hiddenCharts.line)dashCharts.line=new Chart(cLine,{type:'line',data:{labels:allM.map(m=>mL(m)),datasets:[{data:allM.map(m=>pm[m].v-pm[m].e),borderColor:'#7c6fff',backgroundColor:'rgba(124,111,255,.12)',tension:.4,fill:true,pointBackgroundColor:'#7c6fff',pointRadius:4}]},options:{...gs,plugins:{legend:{display:false}},scales:{x:{grid:gr,ticks:tx},y:{grid:gr,ticks:{...tx,callback:fY}}}}});
    const cCost=document.getElementById('cCost');
    if(cCost&&!hiddenCharts.cost)dashCharts.cost=new Chart(cCost,{type:'bar',data:{labels:allM.map(m=>mL(m)),datasets:[{label:'Ventas',data:allM.map(m=>pm[m].v),backgroundColor:'rgba(0,229,160,.6)',borderColor:'#00e5a0',borderWidth:1},{label:'Costo repo',data:allM.map(m=>pm[m].c),backgroundColor:'rgba(255,107,53,.6)',borderColor:'#ff6b35',borderWidth:1}]},options:{...gs,plugins:{legend:{display:true,labels:{color:'#8888a0',font:{family:'Space Mono',size:7},boxWidth:8,padding:6}}},scales:{x:{grid:gr,ticks:tx},y:{grid:gr,ticks:{...tx,callback:fY}}}}});
  },100);
  window.renderDashInversiones?.(cont,f);
  renderDashStock(f);
}



let _dashFlowChart=null;
let _fcPeriod=30;

function setFlowPer(days){
  _fcPeriod=days;
  ['7','30','90','All'].forEach(k=>{
    const b=document.getElementById('fcPer'+k);
    if(b){b.style.background='var(--bg)';b.style.color='var(--tx3)';b.style.fontWeight='';}
  });
  const key=days===7?'7':days===30?'30':days===90?'90':'All';
  const b=document.getElementById('fcPer'+key);
  if(b){b.style.background='var(--ac)';b.style.color='#000';b.style.fontWeight='700';}
  renderDashFlowChart();
}

function _fcMA(data,n){
  return data.map((_,i)=>{
    const slice=data.slice(Math.max(0,i-n+1),i+1).filter(v=>v!=null);
    return slice.length?slice.reduce((a,b)=>a+b,0)/slice.length:null;
  });
}

function renderDashFlowChart(){
  const canvas=document.getElementById('dashFlowChart');
  if(!canvas)return;

  const orders=gOConf();
  const eg=gE();

  let cutoff=null;
  if(_fcPeriod>0){const c=new Date();c.setDate(c.getDate()-_fcPeriod);cutoff=c.toISOString().split('T')[0];}

  const f=document.getElementById('dashMes')?.value||'all';
  let fOrders=orders,fEg=eg;
  if(f==='rango'){
    const desde=document.getElementById('dashDesde')?.value;
    const hasta=document.getElementById('dashHasta')?.value;
    if(desde)fOrders=fOrders.filter(o=>o.fecha>=desde);
    if(hasta)fOrders=fOrders.filter(o=>o.fecha<=hasta);
    if(desde)fEg=fEg.filter(e=>e.fecha>=desde);
    if(hasta)fEg=fEg.filter(e=>e.fecha<=hasta);
  } else if(f&&f!=='all'){
    fOrders=fOrders.filter(o=>o.mesActual===f);
    fEg=fEg.filter(e=>e.mesActual===f);
  } else if(cutoff){
    fOrders=fOrders.filter(o=>o.fecha>=cutoff);
    fEg=fEg.filter(e=>e.fecha>=cutoff);
  }

  if(!fOrders.length&&!fEg.length){
    const wrap=canvas.parentElement;
    if(!document.getElementById('dashFlowChart')){
      const c=document.createElement('canvas');c.id='dashFlowChart';wrap.appendChild(c);
    }
    const kpi=document.getElementById('fc-kpi-strip');
    if(kpi)kpi.innerHTML='';
    return;
  }

  const byDate={};
  fOrders.forEach(o=>{
    const d=o.fecha;if(!d)return;
    if(!byDate[d])byDate[d]={v:0,e:0};
    byDate[d].v+=parseFloat(o.totales?.totalGeneral||0);
  });
  fEg.forEach(e=>{
    const d=e.fecha;if(!d)return;
    if(!byDate[d])byDate[d]={v:0,e:0};
    byDate[d].e+=parseFloat(e.impactoCaja||0);
  });

  const fechas=Object.keys(byDate).sort();
  const ventas=fechas.map(d=>byDate[d].v);
  const egresos=fechas.map(d=>byDate[d].e);

  let acV=0,acE=0;
  const acumV=ventas.map(v=>(acV+=v,acV));
  const acumE=egresos.map(v=>(acE+=v,acE));
  const neto=fechas.map((_,i)=>acumV[i]-acumE[i]);
  const netoDiario=fechas.map((_,i)=>ventas[i]-egresos[i]);
  const maVentas=_fcMA(ventas,7);

  const labels=fechas.map(d=>{const[,m,dd]=d.split('-');return dd+'/'+m;});

  const totV=acumV[acumV.length-1]||0;
  const totE=acumE[acumE.length-1]||0;
  const totN=totV-totE;
  const maxV=Math.max(...ventas)||0;
  const kpi=document.getElementById('fc-kpi-strip');
  if(kpi){
    const k=(label,val,col)=>`<div style="background:var(--s1);padding:8px 12px"><div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;margin-bottom:3px">${label}</div><div style="font-family:var(--mo);font-size:13px;font-weight:700;color:${col}">$${fi(Math.round(val))}</div></div>`;
    kpi.innerHTML=k('VENTAS PERÍODO',totV,'var(--ac2)')+k('EGRESOS PERÍODO',totE,'var(--er)')+k('NETO',totN,totN>=0?'var(--ac)':'var(--er)')+k('PICO DIARIO',maxV,'var(--wn)');
  }

  const toggleWrap=document.getElementById('fc-series-toggles');
  if(toggleWrap&&!toggleWrap.dataset.built){
    toggleWrap.dataset.built='1';
    const series=[
      {id:'fcT-v',  label:'Ventas',   col:'#7c6fff',def:true},
      {id:'fcT-e',  label:'Egresos',  col:'#ff4455',def:true},
      {id:'fcT-av', label:'Ac.Ventas',col:'#00e5a0',def:true},
      {id:'fcT-ae', label:'Ac.Egr',   col:'#ffaa00',def:false},
      {id:'fcT-n',  label:'Neto',     col:'#00bfff', def:true},
    ];
    series.forEach(s=>{
      const btn=document.createElement('button');
      btn.id=s.id;
      btn.dataset.active=s.def?'1':'0';
      btn.style.cssText=`font-family:var(--mo);font-size:8px;padding:2px 7px;border:1px solid ${s.col};background:${s.def?s.col+'33':'transparent'};color:${s.def?s.col:'var(--tx3)'};cursor:pointer`;
      btn.textContent=s.label;
      btn.onclick=()=>{
        btn.dataset.active=btn.dataset.active==='1'?'0':'1';
        const on=btn.dataset.active==='1';
        btn.style.background=on?s.col+'33':'transparent';
        btn.style.color=on?s.col:'var(--tx3)';
        renderDashFlowChart();
      };
      toggleWrap.appendChild(btn);
    });
  }

  const isOn=id=>document.getElementById(id)?.dataset.active==='1';
  const globalType=document.getElementById('fcGlobalType')?.value||'mixed';
  const smooth=document.getElementById('fcSmooth')?.checked!==false;
  const showMA=document.getElementById('fcShowMA')?.checked;
  const showNet=document.getElementById('fcShowNet')?.checked!==false;
  const tension=smooth?0.4:0;

  const mkLine=(label,data,color,opts={})=>({
    type:'line',label,data,
    borderColor:color,
    backgroundColor:opts.fill?color+'22':'transparent',
    borderWidth:opts.width||2,
    tension,
    fill:!!opts.fill,
    pointRadius:data.length>40?0:3,
    pointHoverRadius:5,
    pointBackgroundColor:color,
    borderDash:opts.dash||[],
    yAxisID:opts.yAxis||'y',
    ...opts.extra
  });
  const mkBar=(label,data,color,opts={})=>({
    type:'bar',label,data,
    backgroundColor:color+'99',
    borderColor:color,
    borderWidth:1,
    borderRadius:2,
    yAxisID:opts.yAxis||'y',
    ...opts.extra
  });

  const datasets=[];

  if(isOn('fcT-v')){
    const color='#7c6fff';
    if(globalType==='bar'||globalType==='mixed') datasets.push(mkBar('Ventas diarias',ventas,color));
    else datasets.push(mkLine('Ventas diarias',ventas,color,{fill:globalType==='area',width:2}));
  }
  if(isOn('fcT-e')){
    const color='#ff4455';
    if(globalType==='bar'||globalType==='mixed') datasets.push(mkBar('Egresos diarios',egresos,color));
    else datasets.push(mkLine('Egresos diarios',egresos,color,{fill:globalType==='area',width:2}));
  }
  if(isOn('fcT-av')){
    datasets.push(mkLine('Acum. Ventas',acumV,'#00e5a0',{fill:globalType==='area',width:2,yAxis:'y2'}));
  }
  if(isOn('fcT-ae')){
    datasets.push(mkLine('Acum. Egresos',acumE,'#ffaa00',{dash:[6,3],width:1.5,yAxis:'y2'}));
  }
  if(showNet){
    const netColor='#00bfff';
    datasets.push({
      type:'line',label:'Neto acum.',data:neto,
      borderColor:netColor,
      backgroundColor:neto.map(v=>v>=0?netColor+'15':'#ff445515'),
      borderWidth:2.5,tension,fill:true,
      pointRadius:0,pointHoverRadius:5,
      segment:{borderColor:ctx=>neto[ctx.p1DataIndex]>=0?netColor:'#ff4455'},
      yAxisID:'y2'
    });
  }
  if(showMA){
    datasets.push(mkLine('MA7 Ventas',maVentas,'#ffaa00',{dash:[3,3],width:1.5,extra:{pointRadius:0}}));
  }

  if(_dashFlowChart){try{_dashFlowChart.destroy();}catch(e){}_dashFlowChart=null;}
  let cv=document.getElementById('dashFlowChart');
  if(!cv){
    const wrap=document.querySelector('[style*="height:260px"]');
    cv=document.createElement('canvas');cv.id='dashFlowChart';
    if(wrap)wrap.appendChild(cv);else return;
  }

  const txCol='#55556a';
  const gridCol='rgba(255,255,255,0.04)';
  const moFont={family:'Space Mono, monospace',size:9};

  _dashFlowChart=new Chart(cv,{
    data:{labels,datasets},
    options:{
      responsive:true,
      maintainAspectRatio:false,
      animation:{duration:400,easing:'easeInOutQuart'},
      interaction:{mode:'index',intersect:false},
      plugins:{
        legend:{
          display:true,position:'top',
          labels:{color:'#8888a0',font:moFont,boxWidth:8,boxHeight:8,padding:12,
            usePointStyle:true,pointStyle:'circle'}
        },
        tooltip:{
          backgroundColor:'rgba(10,10,20,0.92)',
          borderColor:'rgba(255,255,255,0.08)',
          borderWidth:1,
          titleColor:'#00e5a0',
          titleFont:moFont,
          bodyColor:'#c0c0d0',
          bodyFont:moFont,
          padding:10,
          callbacks:{
            title:ctx=>'📅 '+labels[ctx[0].dataIndex],
            label:ctx=>{
              const v=ctx.raw;
              if(v==null)return null;
              const sign=v<0?'':'';
              return ` ${ctx.dataset.label}: $${fi(Math.round(Math.abs(v)))}${v<0?' ▼':''}`
            },
            afterBody:ctx=>{
              const i=ctx[0].dataIndex;
              const nd=netoDiario[i];
              return[`  ─────────────────`,`  Neto del día: ${nd>=0?'+':''}$${fi(Math.round(nd))}`];
            }
          }
        }
      },
      scales:{
        x:{
          grid:{color:gridCol,drawTicks:false},
          ticks:{color:txCol,font:moFont,maxTicksLimit:10,maxRotation:0},
          border:{color:'rgba(255,255,255,0.06)'}
        },
        y:{
          position:'left',
          grid:{color:gridCol,drawTicks:false},
          ticks:{color:txCol,font:moFont,callback:v=>'$'+fi(Math.round(v))},
          border:{color:'rgba(255,255,255,0.06)',dash:[3,3]},
          title:{display:true,text:'DIARIO',color:'#55556a',font:{...moFont,size:7}}
        },
        y2:{
          position:'right',
          grid:{display:false},
          ticks:{color:'#4a6',font:moFont,callback:v=>'$'+fi(Math.round(v))},
          border:{color:'rgba(255,255,255,0.06)',dash:[3,3]},
          title:{display:true,text:'ACUMULADO',color:'#55556a',font:{...moFont,size:7}}
        }
      },
      onHover:(e,els)=>{
        const bar=document.getElementById('fc-crosshair-bar');
        if(!bar)return;
        if(!els.length){bar.innerHTML='<span style="font-family:var(--mo);font-size:9px;color:var(--tx3)">Deslizá sobre el gráfico para ver datos</span>';return;}
        const i=els[0].index;
        const items=[
          {label:'Ventas',val:ventas[i],col:'#7c6fff'},
          {label:'Egresos',val:egresos[i],col:'#ff4455'},
          {label:'Neto día',val:netoDiario[i],col:netoDiario[i]>=0?'#00e5a0':'#ff4455'},
          {label:'Ac.Ventas',val:acumV[i],col:'#00e5a0'},
          {label:'Neto acum.',val:neto[i],col:neto[i]>=0?'#00bfff':'#ff4455'},
        ];
        bar.innerHTML=`<span style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin-right:4px">${labels[i]}</span>`
          +items.map(it=>`<span style="font-family:var(--mo);font-size:9px"><span style="color:var(--tx3)">${it.label}:</span> <b style="color:${it.col}">$${fi(Math.round(Math.abs(it.val||0)))}${(it.val||0)<0?' ▼':''}</b></span>`).join(' · ');
      }
    }
  });

  const bar=document.getElementById('fc-crosshair-bar');
  if(bar)bar.innerHTML='<span style="font-family:var(--mo);font-size:9px;color:var(--tx3)">Deslizá sobre el gráfico para ver datos</span>';
}


// ===== modules/contactos.js =====

let _ctSort='ultima'; // 'ultima' | 'total'

function setCtSort(s){
  _ctSort=s;
  ['ultima','total'].forEach(k=>{
    const b=document.getElementById('ct-sort-'+k);
    if(b)b.style.color=_ctSort===k?'var(--ac)':'var(--tx3)';
  });
  renderContactos();
}

// Resuelve líneas de una orden para display (nuevo formato + legacy)
function getLineasDisplay(o,prodMap){
  const lns=o.productos?._lineas;
  if(lns&&lns.length){
    return lns.map(l=>{
      const p=prodMap[l.prodId];
      return{emoji:p?.emoji||'',nombre:p?.nombre||l.prodId,unit:p?.unit||'ud',qty:l.qty,precio:l.precio,subtotal:l.subtotal};
    });
  }
  // Legacy
  const pr=o.productos||{};const r=[];
  const pastTot=(pr.calaveras||0)+(pr.teddy||0)+(pr.lucky||0)+(pr.genericas||0);
  if(pastTot>0)r.push({emoji:'💊',nombre:'Pastillas',unit:'ud',qty:pastTot,precio:pr.precioPastilla||0,subtotal:pr.totalPastillasLinea||0});
  if(pr.cristales>0)r.push({emoji:'💎',nombre:'Cristales',unit:'g',qty:pr.cristales,precio:pr.precioCristales||0,subtotal:pr.totalCristales||0});
  if(pr.hongos>0)r.push({emoji:'🍄',nombre:'Hongos',unit:'g',qty:pr.hongos,precio:pr.precioHongos||0,subtotal:pr.totalHongos||0});
  if(pr.goteros>0)r.push({emoji:'💧',nombre:'Goteros',unit:'ud',qty:pr.goteros,precio:0,subtotal:pr.totalGoteros||0});
  if(pr.petri>0)r.push({emoji:'🧫',nombre:'Petri',unit:'ud',qty:pr.petri,precio:0,subtotal:pr.totalPetri||0});
  if(pr.variable>0)r.push({emoji:'💲',nombre:'Precio libre',unit:'',qty:1,precio:pr.variable,subtotal:pr.variable});
  return r;
}

// ── NORMALIZACIÓN ──
function normNombre(s){
  if(!s)return'';
  return s.trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/\s+/g,' ');
}

// ── ID GENERATOR (Math.max invariant — nunca conteo) ──
function nCtId(mes){
  const d=ld();
  const existing=(d.contactos||[])
    .filter(c=>c.id&&c.id.startsWith('CT-'+mes+'-'))
    .map(c=>parseInt(c.id.split('-')[2])||0);
  if(!existing.length)return`CT-${mes}-0001`;
  return`CT-${mes}-${String(Math.max(...existing)+1).padStart(4,'0')}`;
}

// ── GETTERS ──
function getContactos(){return ld().contactos||[];}

function getContactoById(id){return getContactos().find(c=>c.id===id)||null;}

function getContactoByNorm(norm){return getContactos().find(c=>c.nombreNorm===norm)||null;}

// ── HISTORIAL: resolución dual (ID exacto + fallback por nombre normalizado) ──
function getHistorialContacto(ct){
  return gOConf()
    .filter(o=>o.clienteId===ct.id||(!o.clienteId&&normNombre(o.cliente||'')===ct.nombreNorm))
    .sort((a,b)=>b.fecha.localeCompare(a.fecha));
}

// ── AUTO-REGISTRO: llamado desde generarTicket() ──
// Crea el contacto si no existe. Retorna clienteId. Single sd() write.
function autoRegistrarContacto(nombre,fechaOrden){
  if(!nombre||!nombre.trim())return null;
  const norm=normNombre(nombre);
  const d=ld();
  const contactos=d.contactos||[];
  const existente=contactos.find(c=>c.nombreNorm===norm);
  if(existente)return existente.id;
  // Derivar AAAAMM del mes de la orden para el ID
  const mes=fechaOrden
    ?fechaOrden.replace(/-/g,'').substring(0,6)
    :(()=>{const n=new Date();return String(n.getFullYear())+String(n.getMonth()+1).padStart(2,'0');})();
  const id=nCtId(mes);
  contactos.push({
    id,
    nombre:nombre.trim(),
    nombreNorm:norm,
    tel:null,email:null,instagram:null,notas:null,
    fechaAlta:new Date().toISOString(),
    mergedFrom:[]
  });
  d.contactos=contactos;
  sd(d);
  return id;
}

// ── GUARDAR INFO EDITABLE ──
function guardarInfoContacto(id){
  const d=ld();
  const ct=(d.contactos||[]).find(c=>c.id===id);
  if(!ct){sN('Contacto no encontrado',true);return;}
  ct.tel=document.getElementById('ct-tel')?.value.trim()||null;
  ct.email=document.getElementById('ct-email')?.value.trim()||null;
  ct.instagram=document.getElementById('ct-ig')?.value.trim()||null;
  ct.notas=document.getElementById('ct-notas')?.value.trim()||null;
  sd(d);
  ghAutoPush();
  sN(`✓ ${ct.nombre} actualizado`);
}

// ── RENDER LISTA DE CONTACTOS ──
function renderContactos(){
  const listEl=document.getElementById('ct-lista');
  if(!listEl)return;
  const search=(document.getElementById('ct-search')?.value||'').toLowerCase();
  const cts=getContactos();
  const allOrds=gOConf();

  // Pre-computar stats por contacto (una pasada sobre las órdenes)
  const statsById=new Map();   // ct.id → stats
  const statsByNorm=new Map(); // ct.nombreNorm → stats (fallback para órdenes legacy)
  cts.forEach(ct=>{
    const s={total:0,count:0,ultima:null};
    statsById.set(ct.id,s);
    statsByNorm.set(ct.nombreNorm,s);
  });
  allOrds.forEach(o=>{
    let s=null;
    if(o.clienteId&&statsById.has(o.clienteId))s=statsById.get(o.clienteId);
    else if(!o.clienteId&&o.cliente){
      const n=normNombre(o.cliente);
      if(statsByNorm.has(n))s=statsByNorm.get(n);
    }
    if(!s)return;
    s.total+=(o.totales?.totalGeneral||0);
    s.count++;
    if(!s.ultima||o.fecha>s.ultima)s.ultima=o.fecha;
  });

  let filtered=cts.filter(ct=>{
    if(!search)return true;
    return ct.nombre.toLowerCase().includes(search)||
      (ct.tel&&ct.tel.includes(search))||
      (ct.instagram&&ct.instagram.toLowerCase().includes(search))||
      (ct.email&&ct.email.toLowerCase().includes(search));
  });

  // Ordenar según criterio activo
  if(_ctSort==='total'){
    filtered.sort((a,b)=>(statsById.get(b.id)?.total||0)-(statsById.get(a.id)?.total||0));
  } else {
    filtered.sort((a,b)=>{
      const ua=statsById.get(a.id)?.ultima||a.fechaAlta;
      const ub=statsById.get(b.id)?.ultima||b.fechaAlta;
      return ub.localeCompare(ua);
    });
  }
  // Reflejar estado en botones de sort
  ['ultima','total'].forEach(k=>{
    const b=document.getElementById('ct-sort-'+k);
    if(b)b.style.color=_ctSort===k?'var(--ac)':'var(--tx3)';
  });

  // Actualizar contador
  const cntEl=document.getElementById('ct-count');
  if(cntEl)cntEl.textContent=`${cts.length} contacto${cts.length!==1?'s':''}`;

  if(!filtered.length){
    listEl.innerHTML=`<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:24px">${cts.length?'Sin resultados para "'+search+'"':'Sin contactos registrados'}</div>`;
    return;
  }

  const MO='font-family:var(--mo);';
  let html='';
  filtered.forEach(ct=>{
    const s=statsById.get(ct.id)||{total:0,count:0,ultima:null};
    const meta=[ct.tel,ct.instagram,ct.email].filter(Boolean).join(' · ');
    const ultimaDisp=s.ultima?d2s(s.ultima):'—';
    html+=`<div onclick="abrirContacto('${ct.id}')" style="cursor:pointer;padding:12px 16px;border-bottom:1px solid var(--br);display:flex;justify-content:space-between;align-items:center;gap:12px;transition:background .12s" onmouseover="this.style.background='var(--s2)'" onmouseout="this.style.background=''">
      <div style="flex:1;min-width:0">
        <div style="${MO}font-size:12px;font-weight:700;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ct.nombre}</div>
        ${meta?`<div style="${MO}font-size:9px;color:var(--tx3);margin-top:2px">${meta}</div>`:''}
      </div>
      <div style="flex-shrink:0;text-align:right">
        <div style="${MO}font-size:10px;font-weight:700;color:var(--ac)">${s.count>0?fv(s.total):'—'}</div>
        <div style="${MO}font-size:8px;color:var(--tx3)">${s.count>0?s.count+' órd · '+ultimaDisp:'sin órdenes'}</div>
      </div>
    </div>`;
  });
  listEl.innerHTML=html;
}

// ── ABRIR DETALLE DE CONTACTO ──
function abrirContacto(id){
  const ct=getContactoById(id);if(!ct)return;
  const detEl=document.getElementById('ct-detalle');
  const listEl=document.getElementById('ct-lista');
  const swEl=document.getElementById('ct-search-wrap');
  if(!detEl)return;
  if(listEl)listEl.style.display='none';
  if(swEl)swEl.style.display='none';

  const ords=getHistorialContacto(ct);
  const total=ords.reduce((s,o)=>s+(o.totales?.totalGeneral||0),0);
  const ticketProm=ords.length?total/ords.length:0;

  // Producto favorito (por qty)
  const prodQty={};
  ords.forEach(o=>{
    (o.productos?._lineas||[]).forEach(l=>{
      const k=(l.nombre||l.prodId);
      prodQty[k]=(prodQty[k]||0)+l.qty;
    });
  });
  const fav=Object.entries(prodQty).sort((a,b)=>b[1]-a[1])[0];
  const ultimaDisp=ords.length?d2s(ords[0].fecha):'—';
  const altaDisp=new Date(ct.fechaAlta).toLocaleString('es-AR',{dateStyle:'short',timeStyle:'short'});

  const MO='font-family:var(--mo);';
  const IS=`width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);${MO}font-size:12px;padding:8px 10px;outline:none;min-height:38px;box-sizing:border-box`;

  const prodMap={};
  getProductos().forEach(p=>{prodMap[p.id]=p;});

  let ordsHtml='';
  ords.forEach(o=>{
    const lineas=getLineasDisplay(o,prodMap);
    const lineasStr=lineas.map(l=>
      `${l.emoji} ${l.qty}${l.unit?` ${l.unit}`:''}${l.precio?` × ${fv(l.precio)}`:''}${l.subtotal?` = ${fv(l.subtotal)}`:''}`
    ).join('<br>');
    ordsHtml+=`<tr style="border-top:1px solid var(--br)">
      <td style="padding:8px 10px 4px;${MO}font-size:9px;color:var(--tx3);vertical-align:top;white-space:nowrap">${o.fechaDisplay||o.fecha}</td>
      <td style="padding:8px 10px 4px;${MO}font-size:9px;color:var(--ac2);vertical-align:top;white-space:nowrap">${o.id}</td>
      <td style="padding:8px 10px 4px;vertical-align:top">
        <div style="${MO}font-size:9px;color:var(--tx3);line-height:1.8">${lineasStr||'—'}</div>
      </td>
      <td style="padding:8px 10px 4px;${MO}font-size:10px;font-weight:700;text-align:right;color:var(--ac);vertical-align:top;white-space:nowrap">${fv(o.totales?.totalGeneral||0)}</td>
      <td style="padding:8px 10px 4px;text-align:center;vertical-align:top"><button class="pm-btn" style="font-size:8px;padding:3px 8px" onclick="vTk('${o.id}')">👁</button></td>
    </tr>`;
  });
  if(!ords.length)ordsHtml=`<tr><td colspan="5" style="${MO}font-size:10px;color:var(--tx3);text-align:center;padding:16px">Sin órdenes registradas</td></tr>`;

  const kpi=(label,val,color='var(--tx)')=>
    `<div style="background:var(--s2);border:1px solid var(--br);padding:10px 12px">
      <div style="${MO}font-size:7px;color:var(--tx3);letter-spacing:.8px;margin-bottom:4px">${label}</div>
      <div style="${MO}font-size:12px;font-weight:700;color:${color}">${val}</div>
    </div>`;

  detEl.innerHTML=`<div class="card">
    <div class="ct" style="justify-content:space-between">
      <span>👤 ${ct.nombre}</span>
      <button class="pm-btn" onclick="volverListaContactos()" style="font-size:9px">← Volver</button>
    </div>
    <div style="${MO}font-size:8px;color:var(--tx3);margin-bottom:14px">
      ${ct.id} · Alta: ${altaDisp}${ct.mergedFrom?.length?` · fusionado de: ${ct.mergedFrom.join(', ')}`:''}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:16px">
      ${kpi('TOTAL COMPRADO',fv(total),'var(--ac)')}
      ${kpi('ÓRDENES',ords.length,'var(--tx)')}
      ${kpi('TICKET PROM.',fv(ticketProm),'var(--ac2)')}
      ${kpi('ÚLTIMA COMPRA',ultimaDisp)}
      ${fav?kpi('PROD. FAV.',`${fav[0]} (×${fav[1]})`,'var(--tx3)'):''}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      <div><label style="${MO}font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Teléfono</label><input type="tel" id="ct-tel" value="${ct.tel||''}" placeholder="+54 9 11..." style="${IS}"></div>
      <div><label style="${MO}font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Instagram</label><input type="text" id="ct-ig" value="${ct.instagram||''}" placeholder="@usuario" style="${IS}"></div>
      <div><label style="${MO}font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Email</label><input type="email" id="ct-email" value="${ct.email||''}" placeholder="mail@ejemplo.com" style="${IS}"></div>
      <div><label style="${MO}font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Notas</label><input type="text" id="ct-notas" value="${ct.notas||''}" placeholder="Notas..." style="${IS}"></div>
    </div>
    <button class="btn btn-p" style="height:36px;font-size:10px;padding:0 16px" onclick="guardarInfoContacto('${ct.id}')">💾 Guardar info</button>
    <div style="margin-top:18px">
      <div style="${MO}font-size:8px;letter-spacing:.8px;color:var(--tx3);margin-bottom:8px">HISTORIAL (${ords.length} órdenes confirmadas)</div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:var(--s3)">
          <th style="padding:6px 10px;${MO}font-size:7px;letter-spacing:.8px;color:var(--tx3);text-align:left;white-space:nowrap">FECHA</th>
          <th style="padding:6px 10px;${MO}font-size:7px;letter-spacing:.8px;color:var(--tx3);text-align:left;white-space:nowrap">ID</th>
          <th style="padding:6px 10px;${MO}font-size:7px;letter-spacing:.8px;color:var(--tx3);text-align:left">PRODUCTOS</th>
          <th style="padding:6px 10px;${MO}font-size:7px;letter-spacing:.8px;color:var(--tx3);text-align:right;white-space:nowrap">TOTAL</th>
          <th></th>
        </tr></thead>
        <tbody>${ordsHtml}</tbody>
      </table>
    </div>
  </div>`;
  detEl.style.display='block';
}

function volverListaContactos(){
  document.getElementById('ct-detalle').style.display='none';
  const listEl=document.getElementById('ct-lista');
  const swEl=document.getElementById('ct-search-wrap');
  if(listEl)listEl.style.display='';
  if(swEl)swEl.style.display='';
}

function filtrarContactos(){renderContactos();}

// ── MIGRACIÓN ──

let _migData=null; // estado de migración (entre mostrar modal y confirmar)

function mostrarMigracionContactos(){
  const orders=gO();

  // Agrupar nombres por forma normalizada
  const normMap=new Map(); // norm → { nombres: Set, fechaMin }
  orders.forEach(o=>{
    if(!o.cliente||!o.cliente.trim())return;
    const norm=normNombre(o.cliente);
    const trimmed=o.cliente.trim();
    if(!normMap.has(norm))normMap.set(norm,{nombres:new Set(),fechaMin:o.fecha});
    normMap.get(norm).nombres.add(trimmed);
    if(o.fecha<normMap.get(norm).fechaMin)normMap.get(norm).fechaMin=o.fecha;
  });

  // Detectar los que ya están registrados (idempotencia)
  const existentes=new Set((ld().contactos||[]).map(c=>c.nombreNorm));

  const unicos=[];
  const nearDups=[];
  normMap.forEach(({nombres,fechaMin},norm)=>{
    if(existentes.has(norm))return; // ya migrado
    const arr=Array.from(nombres).sort();
    if(arr.length===1)unicos.push({norm,nombre:arr[0],fechaMin});
    else nearDups.push({norm,nombres:arr,fechaMin});
  });

  const totalNuevos=unicos.length+nearDups.length;
  const totalOrdenes=orders.filter(o=>o.cliente).length;

  if(!totalNuevos){
    sN('✓ Todos los contactos ya están registrados');
    renderContactos();
    return;
  }

  _migData={unicos,nearDups};

  const MO='font-family:var(--mo);';

  let ndHtml='';
  nearDups.forEach((g,i)=>{
    const RD='width:16px;height:16px;flex-shrink:0;cursor:pointer;accent-color:var(--ac)';
    const radios=g.nombres.map((n,j)=>
      `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:5px 0;border-bottom:1px solid var(--br)">
        <input type="radio" name="nd-${i}" value="${j}" ${j===0?'checked':''} style="${RD}">
        <span style="${MO}font-size:12px;color:var(--tx)">${n}</span>
      </label>`
    ).join('');
    ndHtml+=`<div style="background:var(--s2);border:1px solid var(--br);padding:10px 14px;margin-bottom:8px">
      <div style="${MO}font-size:8px;color:var(--tx3);letter-spacing:.5px;margin-bottom:8px">Norm: "${g.norm}"</div>
      <div style="margin-bottom:10px">${radios}</div>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding-top:4px">
        <input type="checkbox" id="nd-merge-${i}" checked style="${RD}">
        <span style="${MO}font-size:10px;color:var(--ac)">Fusionar en un solo contacto con el nombre elegido</span>
      </label>
    </div>`;
  });

  const bodyHtml=`<div style="overflow-y:auto;max-height:55vh">
    <div style="${MO}font-size:10px;color:var(--tx3);margin-bottom:14px;padding:10px;background:var(--s2);border:1px solid var(--br)">
      Se van a crear <b style="color:var(--ac)">${totalNuevos} contacto${totalNuevos!==1?'s':''}</b> desde <b>${totalOrdenes}</b> órdenes históricas.
      <br>Los datos de contacto (tel, mail, ig) se podrán cargar después desde la ficha.
    </div>
    ${nearDups.length?`<div style="${MO}font-size:8px;letter-spacing:.8px;color:var(--wn);margin-bottom:8px">⚠ DUPLICADOS DETECTADOS (${nearDups.length}) — mismo nombre al normalizar</div>${ndHtml}`:''}
    ${unicos.length?`<details><summary style="${MO}font-size:9px;color:var(--tx3);cursor:pointer;padding:6px 0">Contactos únicos (${unicos.length}) — click para ver lista</summary>
      <div style="margin-top:8px;max-height:160px;overflow-y:auto;border:1px solid var(--br);padding:8px">
        ${unicos.map(u=>`<div style="${MO}font-size:10px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.04);color:var(--tx)">${u.nombre}</div>`).join('')}
      </div></details>`:''}
  </div>`;

  document.getElementById('mTitEl').textContent='📋 Migración de Contactos Históricos';
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal';
  document.getElementById('mTk').style.display='none';
  document.getElementById('mBody').innerHTML=bodyHtml;
  document.getElementById('mFooter').innerHTML=`
    <button class="btn btn-p" onclick="ejecutarMigracionContactos()">🚀 Ejecutar migración</button>
    <button class="btn btn-s" onclick="clM()">Cancelar</button>`;
  document.getElementById('modal').classList.add('open');
}

function ejecutarMigracionContactos(){
  if(!_migData){sN('Error: sin datos de migración',true);return;}
  const{unicos,nearDups}=_migData;
  _migData=null;

  const d=ld();
  const existentes=d.contactos||[];
  const existNorms=new Set(existentes.map(c=>c.nombreNorm));
  const normToId=new Map(existentes.map(c=>[c.nombreNorm,c.id]));

  // Construir lista de nuevos contactos (sin IDs aún)
  const nuevos=[];

  unicos.forEach(u=>{
    if(existNorms.has(u.norm))return;
    nuevos.push({
      _norm:u.norm,
      nombre:u.nombre,
      nombreNorm:u.norm,
      tel:null,email:null,instagram:null,notas:null,
      fechaAlta:u.fechaMin+'T00:00:00.000Z',
      mergedFrom:[]
    });
  });

  nearDups.forEach((g,i)=>{
    if(existNorms.has(g.norm)){
      // ya existe bajo esta norma — solo mapeamos variantes al ID existente
      g.nombres.forEach(n=>normToId.set(normNombre(n),normToId.get(g.norm)));
      return;
    }
    const mergeEl=document.getElementById(`nd-merge-${i}`);
    const doMerge=mergeEl?mergeEl.checked:true;
    if(doMerge){
      // Elegir nombre canónico según radio seleccionado
      let canonIdx=0;
      for(let j=0;j<g.nombres.length;j++){
        const r=document.querySelector(`input[name="nd-${i}"][value="${j}"]`);
        if(r&&r.checked){canonIdx=j;break;}
      }
      const canon=g.nombres[canonIdx];
      nuevos.push({
        _norm:g.norm,
        nombre:canon,
        nombreNorm:g.norm,
        tel:null,email:null,instagram:null,notas:null,
        fechaAlta:g.fechaMin+'T00:00:00.000Z',
        mergedFrom:g.nombres.filter(n=>n!==canon)
      });
      // Todas las variantes deben apuntar a esta norma
      g.nombres.forEach(n=>normToId.set(normNombre(n),g.norm)); // temporal — se reemplaza con ID real abajo
    } else {
      // Mantener separados: cada variante con su propia norma
      g.nombres.forEach(n=>{
        const norm2=normNombre(n);
        if(!existNorms.has(norm2))nuevos.push({
          _norm:norm2,
          nombre:n,
          nombreNorm:norm2,
          tel:null,email:null,instagram:null,notas:null,
          fechaAlta:g.fechaMin+'T00:00:00.000Z',
          mergedFrom:[]
        });
      });
    }
  });

  // Asignar IDs (Math.max invariant por mes)
  const mesCount=new Map();
  // Inicializar contadores con los existentes
  existentes.forEach(c=>{
    const mes=c.id.substring(3,9);
    const n=parseInt(c.id.split('-')[2])||0;
    if(!mesCount.has(mes)||mesCount.get(mes)<n)mesCount.set(mes,n);
  });

  nuevos.forEach(ct=>{
    const mes=ct.fechaAlta.replace(/-/g,'').substring(0,6);
    const n=(mesCount.get(mes)||0)+1;
    mesCount.set(mes,n);
    ct.id=`CT-${mes}-${String(n).padStart(4,'0')}`;
    normToId.set(ct._norm,ct.id);
    // Variantes del mismo grupo también apuntan a este ID
    delete ct._norm;
  });

  // Vincular órdenes: añadir clienteId a todas las que tengan cliente
  let linked=0;
  (d.orders||[]).forEach(o=>{
    if(!o.cliente)return;
    const norm=normNombre(o.cliente);
    const ctId=normToId.get(norm);
    if(ctId&&!o.clienteId){o.clienteId=ctId;linked++;}
  });

  // Commit atómico — único sd()
  d.contactos=[...existentes,...nuevos];
  d.contactosMigDone=true;
  sd(d);
  ghAutoPush();

  window.clM?.();
  sN(`✓ ${nuevos.length} contactos creados · ${linked} órdenes vinculadas`);
  renderContactos();
}


// ===== modules/ticket.js =====

// Ofusca el nombre del cliente para el ticket visible (DOM only — ticketText almacenado siempre tiene nombre real)
function obfuscarNombreTicket(nombre){
  if(!nombre)return nombre;
  const pool='!@#$%&*0123456789';
  return nombre.split(' ').map((w,i)=>{
    const keep=i===0?2:1;
    if(w.length<=keep)return w;
    return w.slice(0,keep)+Array.from({length:w.length-keep},()=>pool[Math.floor(Math.random()*pool.length)]).join('');
  }).join(' ');
}

// ── TICKET DINÁMICO ──
let tipoPago='ARS';
let _lastTicketId=null;

function setTP(t){
  tipoPago=t;
  const sel=document.getElementById('selTP');
  if(sel&&sel.value!==t)sel.value=t;
  const tcBlock=document.getElementById('tcBlock');
  const tcLabel=document.getElementById('tcLabel');
  if(tcBlock) tcBlock.style.display=(t==='USD'||t==='USDT')?'block':'none';
  if(tcLabel) tcLabel.textContent=t==='USD'?'TC — ARS por 1 USD':'TC — ARS por 1 USDT';
  // auto-fill TC from precios if available
  const inp=document.getElementById('tc-valor');
  if(inp&&!inp.value){
    if(t==='USD'&&window._blueARS)  inp.value=window._blueARS;
    if(t==='USDT'&&window._usdtARS) inp.value=window._usdtARS;
  }
  upd();
}

function buildTicketUI(){
  const prods=getProductos().filter(p=>p.activo);
  const cont=document.getElementById('prodRows');
  if(!cont)return;
  function stockHint(id){
    return`<span id="sh-${id}" class="tk-stock-hint"></span>`;
  }
  let html='';
  prods.forEach(prod=>{
    const isGram=prod.unit==='g';
    html+=`<div class="prod-row"><div class="pi">${prod.emoji}</div><div class="pinfo"><div class="pname">${prod.nombre}${isGram?' ('+prod.unit+')':''}</div><div class="psub"><span class="pup" id="up-${prod.id}">—</span><span class="plt" id="p-${prod.id}"></span>${stockHint(prod.id)}</div></div><div class="qwrap"><div class="qc"><button class="qb minus" onclick="adj('${prod.id}',-1)">−</button><input class="${isGram?'qv dec':'qv'}" type="number" min="0" step="1" id="q-${prod.id}" placeholder="0" oninput="upd()"><button class="qb plus" onclick="adj('${prod.id}',1)">+</button></div><button class="qrst" onclick="rstDel('${prod.id}')">×</button></div></div>`;
    html+=`<div class="dv"></div>`;
  });
  html+=`<div class="var-row"><div class="pi">💲</div><div class="pinfo"><div class="pname">Variable</div><div style="font-size:8px;color:var(--tx3);font-family:var(--mo)">monto directo</div></div><input type="number" min="0" id="q-var" placeholder="0" oninput="upd()" style="min-height:var(--touch)"><button class="qrst" onclick="rst('var')">×</button></div>`;
  cont.innerHTML=html;
  updStockHints();
}

// ── Stock hints en el ticket (semáforo por producto) ──
function updStockHints(){
  const prods=getProductos().filter(p=>p.activo);
  function qInTicket(id){return parseFloat(document.getElementById('q-'+id)?.value)||0;}
  prods.forEach(prod=>{
    const pStock=getActualQty(prod.id);
    const pRest=pStock-qInTicket(prod.id);// negativo = oversell permitido con aviso
    _setHint(prod.id,pRest,prod.unit||'ud');
  });
}
function _setHint(id,pRest,unit){
  const el=document.getElementById('sh-'+id);
  if(!el)return;
  if(pRest<0){
    el.textContent=`⚠ falta ${Math.abs(pRest)}${unit}`;
    el.className='tk-stock-hint oversell';
    return;
  }
  const st=getStockStatus(pRest,id);
  const labels={empty:'⛔ sin stock',crit:`🔴 ${pRest}${unit}`,warn:`🟡 ${pRest}${unit}`,ok:`🟢 ${pRest}${unit}`};
  el.textContent=labels[st]||'';
  el.className='tk-stock-hint'+(st==='ok'&&pRest>0?' ok':st==='warn'?' warn':st==='crit'?' crit':st==='empty'?' empty':'');
}

function adj(k,delta){const el=document.getElementById('q-'+k);if(!el)return;const cur=parseFloat(el.value)||0;const n=Math.max(0,parseFloat((cur+delta).toFixed(2)));el.value=n===0?'':n;upd();}
function rst(k){const el=document.getElementById('q-'+k);if(el){el.value='';upd();}}
function rstDel(k){
  if(k==='var'){
    const el=document.getElementById('q-var');
    const val=parseFloat(el?.value)||0;
    if(val>0){el.value='';upd();}
    else if(!confirm('¿Eliminar "Variable" del sistema?\nPodrás volver a agregarlo desde Configuración.'))return;
    return;
  }
  const el=document.getElementById('q-'+k);
  const val=parseFloat(el?.value)||0;
  if(val>0){el.value='';upd();return;}
  window.eliminarProducto?.(k);
}
function gn(id){return parseFloat(document.getElementById(id)?.value)||0;}

function resetTodo(){
  if(!confirm('¿Resetear?'))return;
  const prods=getProductos().filter(p=>p.activo);
  prods.forEach(prod=>rst(prod.id));
  rst('var');
  ['nota','cliente'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('fecha').value=hoy();
  ['ajuste-valor','tc-valor'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const at=document.getElementById('ajuste-tipo');if(at)at.value='ninguno';
  const ap=document.getElementById('ajuste-preview');if(ap)ap.style.display='none';
  setTP('ARS');
  document.getElementById('outA').style.display='none';
  upd();window.scrollTo({top:0,behavior:'smooth'});
}

// ── TC helpers ──
function getTC(){
  const v=parseFloat(document.getElementById('tc-valor')?.value)||0;
  if(tipoPago==='USD')  return{usd:v,usdt:window._usdtARS||v,usdUsdt:window._usdtARS&&window._blueARS?window._usdtARS/window._blueARS:1};
  if(tipoPago==='USDT') return{usd:window._blueARS||v,usdt:v,usdUsdt:window._usdtARS&&window._blueARS?window._usdtARS/window._blueARS:1};
  return{usd:window._blueARS||0,usdt:window._usdtARS||0,usdUsdt:1};
}
function autoFillTC(){
  const inp=document.getElementById('tc-valor');
  if(!inp)return;
  if(tipoPago==='USD'&&window._blueARS)  {inp.value=window._blueARS; upd();}
  else if(tipoPago==='USDT'&&window._usdtARS){inp.value=window._usdtARS;upd();}
}

// ── Sincronizar campos legacy de ajuste desde selector ──
function syncAjuste(){
  const tipo=document.getElementById('ajuste-tipo')?.value||'ninguno';
  const val=parseFloat(document.getElementById('ajuste-valor')?.value)||0;
  const valInput=document.getElementById('ajuste-valor');
  if(valInput)valInput.placeholder=tipo==='libre'?'monto final':'0';
  const fields=['rec-pct','rec-fijo','desc-pct','desc-fijo'];
  fields.forEach(id=>{const el=document.getElementById(id);if(el)el.value='0';});
  if(tipo!=='ninguno'&&tipo!=='libre'){const el=document.getElementById(tipo);if(el)el.value=val||0;}
}

// ── HELPER: leer composición de pago según modo ──
function getPayment(totalFinal){
  const tcV=parseFloat(document.getElementById('tc-valor')?.value)||0;
  if(tipoPago==='USD'){
    const usdCalc=tcV>0?parseFloat((totalFinal/tcV).toFixed(2)):totalFinal;
    const arsFromUsd=tcV>0?Math.round(usdCalc*tcV):totalFinal;
    return{ars:0,usd:usdCalc,usdt:0,tc:tcV,tc_usd:tcV,tc_usdt:window._usdtARS||0,total_ars:arsFromUsd,total_usdt:null,modo:'USD'};
  }
  if(tipoPago==='USDT'){
    const usdtCalc=tcV>0?parseFloat((totalFinal/tcV).toFixed(2)):totalFinal;
    const arsFromUsdt=tcV>0?Math.round(usdtCalc*tcV):totalFinal;
    return{ars:0,usd:0,usdt:usdtCalc,tc:tcV,tc_usd:window._blueARS||0,tc_usdt:tcV,total_ars:arsFromUsdt,total_usdt:usdtCalc,modo:'USDT'};
  }
  return{ars:totalFinal,usd:0,usdt:0,tc:0,tc_usd:0,tc_usdt:0,total_ars:totalFinal,total_usdt:null,modo:'ARS'};
}

function calc(){
  const prods=getProductos().filter(p=>p.activo);
  const lineas=[];
  let tot=0,costo=0;
  const legacyMap={};

  // ── PASO 1: agrupar cantidades por listaPrecioId (solo tipo 'tramos') ──
  const gruposVol={};// {listaPrecioId: totalQty}
  prods.forEach(prod=>{
    const q=gn('q-'+prod.id);
    if(q>0&&prod.tipo==='tramos'&&prod.listaPrecioId&&!(prod.maxConsulta&&q>=prod.maxConsulta)){
      gruposVol[prod.listaPrecioId]=(gruposVol[prod.listaPrecioId]||0)+q;
    }
  });

  prods.forEach(prod=>{
    const q=gn('q-'+prod.id);
    if(q>0){
      const tramos=getTramosProducto(prod);
      if(prod.maxConsulta&&q>=prod.maxConsulta){
        lineas.push({emoji:prod.emoji,nombre:prod.nombre,qty:q,unit:prod.unit,consulta:true,prodId:prod.id,legacyKey:prod.legacyKey});
      } else {
        let precio=null,tramo=null;
        if(prod.tipo==='fijo'){precio=tramos[0]?.p||0;}
        else{
          // ── PASO 2: usar qty agrupada del grupo si aplica ──
          const qEval=(prod.listaPrecioId&&gruposVol[prod.listaPrecioId]>q)
            ?gruposVol[prod.listaPrecioId]:q;
          const r=gtr(tramos,qEval);if(r){precio=r.p;tramo=r.t;}
        }
        const subtotal=q*(precio||0);
        lineas.push({emoji:prod.emoji,nombre:prod.nombre,qty:q,unit:prod.unit,precio,tramo,subtotal,prodId:prod.id,legacyKey:prod.legacyKey,qGrupo:gruposVol[prod.listaPrecioId]||q});
        tot+=subtotal;
        if(prod.legacyKey)legacyMap[prod.legacyKey]={qty:q,precio,tramo,subtotal};
        costo+=q*(prod.costo||0);
        // Legacy pastillas map (suma todas las variantes)
        if(['v-cal','v-ted','v-lck','v-gen'].includes(prod.id)){
          legacyMap['_totalPastillas']=(legacyMap['_totalPastillas']||0)+q;
          legacyMap['_precioPastilla']=precio;
          legacyMap['_tramoInfo']=tramo;
          legacyMap['_totalPastillasLinea']=(legacyMap['_totalPastillasLinea']||0)+subtotal;
        }
      }
    }
  });

  const qV=gn('q-var');
  tot+=qV;

  // Ajuste recargo/descuento/libre
  const _ajusteTipo=document.getElementById('ajuste-tipo')?.value||'ninguno';
  const recargoPct  = parseFloat(document.getElementById('rec-pct')?.value)  || 0;
  const recargoFijo = parseFloat(document.getElementById('rec-fijo')?.value) || 0;
  const descPct     = parseFloat(document.getElementById('desc-pct')?.value) || 0;
  const descFijo    = parseFloat(document.getElementById('desc-fijo')?.value) || 0;
  const recargoPctMonto  = tot * (recargoPct / 100);
  const recargoFijoMonto = recargoFijo;
  const descPctMonto     = tot * (descPct / 100);
  const descFijoMonto    = descFijo;
  let ajusteNeto = recargoPctMonto + recargoFijoMonto - descPctMonto - descFijoMonto;
  let totalFinal = tot + ajusteNeto;
  let libreTotal = 0;
  if(_ajusteTipo==='libre'){
    libreTotal=parseFloat(document.getElementById('ajuste-valor')?.value)||tot;
    totalFinal=libreTotal;
    ajusteNeto=libreTotal-tot;
  }
  const ajuste = {recargoPct,recargoFijo,descPct,descFijo,recargoPctMonto,recargoFijoMonto,descPctMonto,descFijoMonto,ajusteNeto,libreTotal,tipo:_ajusteTipo};

  return{lineas,tot,totalFinal,costo,qV,legacyMap,ajuste};
}

function upd(){
  syncAjuste(); // sync select→hidden fields before calc
  const{lineas,tot,totalFinal,legacyMap,ajuste}=calc();
  const prods=getProductos().filter(p=>p.activo);

  // Clear all displays first
  prods.forEach(prod=>{
    const u=document.getElementById('up-'+prod.id),pp=document.getElementById('p-'+prod.id);
    if(u){u.textContent='—';u.style.color='var(--tx3)';}if(pp)pp.textContent='';
  });

  // Update from calc results
  lineas.forEach(ln=>{
    if(ln.consulta){
      const u=document.getElementById('up-'+ln.prodId);
      if(u){u.textContent=ln.qty+'+ CONSULTAR';u.style.color='var(--wn)';}
      return;
    }
    const key=ln.varId||ln.prodId;
    const u=document.getElementById('up-'+key),pp=document.getElementById('p-'+key);
    if(u&&ln.precio!=null){u.textContent=fv(ln.precio)+'/'+ln.unit;u.style.color='var(--ac2)';}
    if(pp&&ln.subtotal!=null){pp.textContent=' → '+fv(ln.subtotal);pp.style.color='var(--ac)';}
  });

  document.getElementById('totD').textContent=fv(totalFinal);

  // Preview de ajuste
  const prev=document.getElementById('ajuste-preview');
  if(prev){
    const lineasAj=[];
    if(ajuste.tipo==='libre'&&ajuste.libreTotal>0){lineasAj.push(`✏️ Total libre: ${fv(ajuste.libreTotal)}`);}
    else{
      if(ajuste.recargoPctMonto>0) lineasAj.push(`📈 Recargo ${ajuste.recargoPct}% → +${fv(ajuste.recargoPctMonto)}`);
      if(ajuste.recargoFijoMonto>0) lineasAj.push(`📈 Recargo fijo → +${fv(ajuste.recargoFijoMonto)}`);
      if(ajuste.descPctMonto>0)     lineasAj.push(`📉 Descuento ${ajuste.descPct}% → -${fv(ajuste.descPctMonto)}`);
      if(ajuste.descFijoMonto>0)    lineasAj.push(`📉 Descuento fijo → -${fv(ajuste.descFijoMonto)}`);
    }
    if(lineasAj.length){
      prev.style.display='block';
      prev.innerHTML=`<span style="color:var(--tx3)">Subtotal: ${fv(tot)}</span><br>`+lineasAj.join('<br>')+`<br><span style="color:var(--ac);font-weight:700">Total final: ${fv(totalFinal)}</span>`;
    } else {
      prev.style.display='none';
    }
  }

  // Tramo info (pastillas group)
  const ti=document.getElementById('trI');
  if(legacyMap['_totalPastillas']>0&&legacyMap['_tramoInfo']&&ti){
    const totP=legacyMap['_totalPastillas'];
    ti.innerHTML=`<span class="tchip">GRP ${totP}ud → TRAMO ${legacyMap['_tramoInfo']} · ${fv(legacyMap['_precioPastilla'])}/ud</span>`;
  }else if(ti)ti.textContent='';

  const uEl=document.getElementById('totU');
  const tcPrev=document.getElementById('tcPreview');
  if(tipoPago==='ARS'){
    if(uEl)uEl.style.display='none';
    if(tcPrev)tcPrev.textContent='';
  } else {
    const pm=getPayment(totalFinal);
    const tcV=parseFloat(document.getElementById('tc-valor')?.value)||0;
    if(uEl&&tcV>0){
      uEl.textContent=tipoPago==='USD'?`${fu(pm.usd)} USD ≈ ${fv(pm.total_ars)}`:
                      tipoPago==='USDT'?`${fu(pm.usdt)} USDT ≈ ${fv(pm.total_ars)}`:'';
      uEl.style.display='block';
    } else if(uEl) uEl.style.display='none';
    if(tcPrev&&tcV>0)
      tcPrev.textContent=tipoPago==='USD'?`1 USD = ${fv(tcV)}`:tipoPago==='USDT'?`1 USDT = ${fv(tcV)}`:'';
    else if(tcPrev) tcPrev.textContent='';
  }
  renderStockMiniPanel();
  updStockHints();
}

function generarTicket(){
  const fecha=document.getElementById('fecha').value,nota=document.getElementById('nota')?.value.trim(),cliente=document.getElementById('cliente')?.value.trim();
  if(!fecha){sN('ERROR: Fecha requerida',true);return;}
  const{lineas,tot,totalFinal,costo,qV,legacyMap,ajuste}=calc();
  const hasConsulta=lineas.some(l=>l.consulta);
  if(hasConsulta){sN('ERROR: Hay productos que requieren consulta',true);return;}
  if(!lineas.length&&!qV){sN('ERROR: Ingresá al menos un producto',true);return;}
  if((tipoPago==='USD'||tipoPago==='USDT')&&!(parseFloat(document.getElementById('tc-valor')?.value)||0)){sN('AVISO: Ingresá TC para conversión correcta',false);}

  const payment=getPayment(totalFinal);
  const mes=d2m(fecha),id=nId(mes),fd=d2s(fecha);
  const clienteObs=cliente?obfuscarNombreTicket(cliente):null;
  let tk=`🧾 Orden de Venta: ${id}\n📅 Fecha: ${fd}`;
  if(cliente)tk+=`\n👤 Cliente: ${cliente}`;
  const _tkHeaderEnd=tk.length;
  tk+=`\n\n🛒 Pedido\n\n`;
  const lns=lineas.map(ln=>`${ln.emoji} ${ln.qty} ${ln.unit} × ${fv(ln.precio)} = ${fv(ln.subtotal)}`);
  if(qV>0)lns.push(`💲 ${fv(qV)}`);

  // Ajuste
  const lineasAjTk=[];
  if(ajuste.tipo==='libre'&&ajuste.libreTotal>0){lineasAjTk.push(`✏️ Total libre: ${fv(ajuste.libreTotal)}`);}
  else{
    if(ajuste.recargoPctMonto>0) lineasAjTk.push(`📈 Recargo ${ajuste.recargoPct}%: +${fv(ajuste.recargoPctMonto)}`);
    if(ajuste.recargoFijoMonto>0) lineasAjTk.push(`📈 Recargo fijo: +${fv(ajuste.recargoFijoMonto)}`);
    if(ajuste.descPctMonto>0)     lineasAjTk.push(`📉 Descuento ${ajuste.descPct}%: -${fv(ajuste.descPctMonto)}`);
    if(ajuste.descFijoMonto>0)    lineasAjTk.push(`📉 Descuento fijo: -${fv(ajuste.descFijoMonto)}`);
  }
  let tkLineas=lns.join('\n');
  if(lineasAjTk.length) tkLineas+=`\n\n${lineasAjTk.join('\n')}\n━━━━━━━━━━━━━━━━━━━━━`;
  tk+=tkLineas+`\n\n💰 Total: ${fv(totalFinal)} ARS`;
  if(ajuste.ajusteNeto!==0) tk+=`\n   (subtotal ${fv(tot)} ${ajuste.ajusteNeto>0?'+':'-'} ajuste ${fv(Math.abs(ajuste.ajusteNeto))})`;

  // Equivalente en USD/USDT si no es ARS
  if(tipoPago==='USD')  tk+=`\n💵 Total USD: ${fu(payment.usd)} (TC ${fi(payment.tc_usd)})`;
  if(tipoPago==='USDT') tk+=`\n🔵 Total USDT: ${fu(payment.usdt)} (TC ${fi(payment.tc_usdt)})`;
  if(tipoPago==='MIX'){
    const parts=[];
    if(payment.ars>0)  parts.push(`ARS ${fv(payment.ars)}`);
    if(payment.usd>0)  parts.push(`USD ${fu(payment.usd)}`);
    if(payment.usdt>0) parts.push(`USDT ${fu(payment.usdt)}`);
    if(parts.length)   tk+=`\n💳 Pago: ${parts.join(' + ')}`;
    if(payment.total_usdt!=null) tk+=` ≈ ${fu(payment.total_usdt)} USDT`;
  }

  // Nota
  const notaAjParts=[];
  if(ajuste.tipo==='libre'&&ajuste.libreTotal>0) notaAjParts.push(`Total libre ${fv(ajuste.libreTotal)}`);
  else{
    if(ajuste.recargoPct>0)  notaAjParts.push(`Recargo ${ajuste.recargoPct}%`);
    if(ajuste.recargoFijo>0) notaAjParts.push(`Recargo fijo ${fv(ajuste.recargoFijo)}`);
    if(ajuste.descPct>0)     notaAjParts.push(`Dto ${ajuste.descPct}%`);
    if(ajuste.descFijo>0)    notaAjParts.push(`Dto fijo ${fv(ajuste.descFijo)}`);
  }
  const notaFinal=[nota, notaAjParts.join(' | ')].filter(Boolean).join(' | ');
  if(notaFinal)tk+=`\n📝 Nota: ${notaFinal}`;

  const lm=legacyMap;
  const productos={
    calaveras:lm.calaveras?.qty||0,teddy:lm.teddy?.qty||0,lucky:lm.lucky?.qty||0,genericas:lm.genericas?.qty||0,
    totalPastillas:lm._totalPastillas||0,precioPastilla:lm._precioPastilla||null,tramoInfo:lm._tramoInfo||null,
    totalPastillasLinea:lm._totalPastillasLinea||0,
    cristales:lm.cristales?.qty||0,precioCristales:lm.cristales?.precio||null,totalCristales:lm.cristales?.subtotal||0,
    hongos:lm.hongos?.qty||0,precioHongos:lm.hongos?.precio||null,totalHongos:lm.hongos?.subtotal||0,
    goteros:lm.goteros?.qty||0,totalGoteros:lm.goteros?.subtotal||0,
    petri:lm.petri?.qty||0,totalPetri:lm.petri?.subtotal||0,
    variable:qV,
    _lineas:lineas.map(l=>({prodId:l.prodId,varId:l.varId||null,qty:l.qty,precio:l.precio,subtotal:l.subtotal}))
  };
  const totales={
    totalPastillasLinea:productos.totalPastillasLinea,totalCristales:productos.totalCristales,
    totalHongos:productos.totalHongos,totalGoteros:productos.totalGoteros,totalPetri:productos.totalPetri,
    totalGeneral:totalFinal,subtotalBruto:tot,ajusteNeto:ajuste.ajusteNeto,
    totalUSDT:payment.total_usdt,
    payment  // ← objeto completo {ars,usd,usdt,tc,total_ars,total_usdt,modo}
  };
  const margen=totalFinal>0?parseFloat(((totalFinal-costo)/totalFinal*100).toFixed(1)):0;
  const aud=`--- AUDITORÍA ---\nSubtotal: ${fv(tot)} | Ajuste: ${ajuste.ajusteNeto>=0?'+':''}${fv(ajuste.ajusteNeto)} | Total: ${fv(totalFinal)} | Pago: ${payment.modo} | Costo: ${fv(costo)} | Margen: ${margen}% | ID: ${id}`;

  // Oversell: detectar líneas que superan el stock disponible ANTES de descontar
  const oversold=lineas.filter(ln=>{if(ln.consulta||!ln.qty)return false;return ln.qty>getActualQty(ln.varId||ln.prodId);});
  if(oversold.length>0){
    tk+='\n⚠ STOCK INSUFICIENTE:'+oversold.map(ln=>{const avail=getActualQty(ln.varId||ln.prodId);return` ${ln.emoji} ${ln.nombre} (pide ${ln.qty}, hay ${avail})`;}).join(' |');
  }

  const clienteId=autoRegistrarContacto(cliente,fecha);
  sO({id,fecha,fechaDisplay:fd,mesActual:mes,tipoPago,tc:payment.tc_usdt||payment.tc_usd||null,payment,nota:notaFinal||null,cliente:cliente||null,clienteId:clienteId||null,productos,totales,costo,margen,ajuste,ticketText:tk,auditText:aud,estado:'pendiente'});
  descontarStockPorTicket(lineas);
  updStockHints();
  window.rfM?.();
  const tkDisplay=clienteObs?`🧾 Orden de Venta: ${id}\n📅 Fecha: ${fd}\n👤 Cliente: ${clienteObs}`+tk.slice(_tkHeaderEnd):tk;
  document.getElementById('tkOut').textContent=tkDisplay;
  document.getElementById('audOut').textContent=aud;
  document.getElementById('outA').style.display='block';
  // Store ID for confirm button + show pendiente state
  document.getElementById('outA').dataset.currentId=id;
  const badge=document.getElementById('outA-estado-badge');
  const confirmBtn=document.getElementById('outA-confirmar-btn');
  const infoBar=confirmBtn?.parentElement;
  if(badge){badge.textContent='🕐 PENDIENTE';badge.style.color='var(--wn)';badge.style.background='rgba(255,170,0,.12)';badge.style.border='1px solid rgba(255,170,0,.3)';}
  if(confirmBtn){confirmBtn.style.display='';infoBar&&(infoBar.style.display='flex');}
  document.getElementById('outA').scrollIntoView({behavior:'smooth'});
  sN(`✓ ${id} generada — pendiente de confirmación`);window.uhd?.();
}

function confirmarDesdeOutput(){
  const id=document.getElementById('outA')?.dataset.currentId;
  if(!id){sN('Sin orden activa',true);return;}
  confirmarOrden(id);
  // Update output UI to confirmed state
  const badge=document.getElementById('outA-estado-badge');
  const confirmBtn=document.getElementById('outA-confirmar-btn');
  const infoBar=confirmBtn?.parentElement;
  if(badge){badge.textContent='✓ CONFIRMADA';badge.style.color='var(--ac)';badge.style.background='rgba(0,229,160,.08)';badge.style.border='1px solid rgba(0,229,160,.2)';}
  if(confirmBtn)confirmBtn.style.display='none';
  if(infoBar)infoBar.style.display='none';
}

function limpiar(){
  const prods=getProductos().filter(p=>p.activo);
  prods.forEach(prod=>rst(prod.id));
  rst('var');
  ['nota','cliente'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('fecha').value=hoy();setTP('ARS');
  const tc=document.getElementById('tc');if(tc)tc.value='';
  document.getElementById('outA').style.display='none';upd();window.scrollTo({top:0,behavior:'smooth'});
}


// ===== modules/io.js =====
// XLSX is a global from CDN script — available as window.XLSX


// ── Helpers de XLSX: asignar fórmulas con valor precalculado ──
function xlsxCell(v,f){
  // SheetJS acepta {v,f,t} para celdas con fórmula
  if(f) return {v:v,f:f,t:typeof v==='number'?'n':'s'};
  if(v===null||v===undefined||v==='') return {v:'',t:'s'};
  if(typeof v==='number') return {v:v,t:'n'};
  return {v:String(v),t:'s'};
}
function xlsxSetCell(ws,col,row,v,f){
  const addr=col+row;
  ws[addr]=xlsxCell(v,f);
  if(!ws['!ref']){ws['!ref']=addr+':'+addr;}
  else{
    const [r1,r2]=ws['!ref'].split(':');
    function colN(c){let n=0;for(let i=0;i<c.length;i++)n=n*26+c.charCodeAt(i)-64;return n;}
    function rowN(r){return parseInt(r.replace(/[A-Z]/g,''));}
    function colL(n){let s='';while(n>0){s=String.fromCharCode((n-1)%26+65)+s;n=Math.floor((n-1)/26);}return s;}
    const c1=r1.replace(/\d/g,''),rr1=rowN(r1),c2=r2.replace(/\d/g,''),rr2=rowN(r2);
    const nc=colL(Math.max(colN(c1),colN(c2),colN(col)));
    const nr=Math.max(rr1,rr2,row);
    const mc=colL(Math.min(colN(c1),colN(c2),colN(col)));
    const mr=Math.min(rr1,rr2,row);
    ws['!ref']=mc+mr+':'+nc+nr;
  }
}
// Convierte array-of-arrays con celdas mixtas a worksheet
function xlsxAoaToSheet(data){
  const ws={};
  data.forEach((row,ri)=>{
    row.forEach((cell,ci)=>{
      const col=String.fromCharCode(65+ci);
      const r=ri+1;
      const addr=col+r;
      if(cell&&typeof cell==='object'&&'f' in cell){ws[addr]=cell;}
      else if(cell&&typeof cell==='object'&&'v' in cell){ws[addr]=cell;}
      else{ws[addr]=xlsxCell(cell);}
    });
  });
  if(data.length&&data[0].length){
    const lastCol=String.fromCharCode(64+data[0].length);
    ws['!ref']='A1:'+lastCol+data.length;
  }
  return ws;
}

// ── Obtener lineas de un pedido para el excel (privado) ──
function _getLineasOrden(o){
  const p=o.productos||{};
  if(p._lineas&&p._lineas.length){
    return p._lineas.map(l=>{
      const prod=getProductos().find(x=>x.id===(l.varId||l.prodId)||x.id===l.prodId);
      return{
        nombre:prod?prod.emoji+' '+prod.nombre:(l.varId||l.prodId||'—'),
        qty:l.qty||0, precio:l.precio||0, subtotal:l.subtotal||0
      };
    });
  }
  // fallback legacy
  const lineas=[];
  const prods=getProductos();
  function addL(prodId,legacyId,qty,precio){
    if(!qty)return;
    const prod=prods.find(x=>x.id===prodId||x.legacyKey===legacyId);
    const nombre=prod?prod.emoji+' '+prod.nombre:(legacyId||prodId);
    lineas.push({nombre,qty,precio,subtotal:qty*precio});
  }
  addL('v-cal','calaveras',p.calaveras||0,p.precioPastilla||0);
  addL('v-ted','teddy',p.teddy||0,p.precioPastilla||0);
  addL('v-lck','lucky',p.lucky||0,p.precioPastilla||0);
  addL('v-gen','genericas',p.genericas||0,p.precioPastilla||0);
  addL('p-cris',null,p.cristales||0,p.precioCristales||0);
  addL('p-hong',null,p.hongos||0,p.precioHongos||0);
  addL('p-got',null,p.goteros||0,0);
  addL('p-pet',null,p.petri||0,0);
  if(p.variable>0)lineas.push({nombre:'💲 Variable',qty:1,precio:p.variable,subtotal:p.variable});
  return lineas;
}

// ── JSON BACKUP COMPLETO (incluye distSlices) ──
function expJSON(){
  const d=ld();
  // Guardia: si el storage devuelve 0 órdenes, posible corrupción silenciosa
  if(!(d.orders||[]).length&&!confirm('⚠ El backup tiene 0 ventas. El storage podría estar vacío o corrupto. ¿Descargar igual?'))return;
  // Configuraciones separadas de localStorage
  d._distSlices=window._getDistSlices?.();
  d._liqDistSlices=window._getLiqDistSlices?.();
  d._distKpiHidden=window._getDistKpiHidden?.();
  d._priceLog=JSON.parse(localStorage.getItem('me_price_log')||'[]');
  d._exportedAt=new Date().toISOString();
  d._version='motoredge_v5';
  d._meta={
    orders:(d.orders||[]).length,
    egresos:(d.egresos||[]).length,
    inversiones:(d.inversiones||[]).length,
    productos:(d.productos||[]).length,
    listasPrecios:(d.listasPrecios||[]).length,
    ingresos:(d.ingresos||[]).length,
    lotesItems:Object.keys(d.lotes||{}).length,
    stockSeedDone:!!d.stockSeedDone,
    contactos:(d.contactos||[]).length,
  };
  const blob=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');
  a.href=url;a.download=`motoredge_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();URL.revokeObjectURL(url);
  sN(`✓ Backup completo: ${d._meta.orders}v · ${d._meta.egresos}e · ${d._meta.ingresos} ingresos stock`);
}

// ── CSV ──
function expCSV(tipo){
  const d=ld();let csv='',filename='';
  function csvRow(arr){return arr.map(v=>{const s=String(v===null||v===undefined?'':v);return s.includes(',')||s.includes('"')||s.includes('\n')?'"'+s.replace(/"/g,'""')+'"':s;}).join(',');}
  if(tipo==='ventas'){
    const orders=d.orders||[];if(!orders.length){sN('Sin ventas para exportar',true);return;}
    const hdr=['ID','Fecha','Cliente','Nota','Tipo Pago','TC USD','TC USDT','Modo Pago','Subtotal Bruto ARS','Ajuste Neto ARS','Total ARS','Total USD','Total USDT','Costo ARS','Margen %','Lineas Detalle'];
    csv=hdr.join(',')+'\n';
    orders.forEach(o=>{
      const t=o.totales||{};const pm=t.payment||o.payment||{};
      const lineas=_getLineasOrden(o).map(l=>`${l.nombre}:${l.qty}x$${l.precio}`).join(' | ');
      csv+=csvRow([o.id,o.fechaDisplay,o.cliente||'',o.nota||'',o.tipoPago,pm.tc_usd||'',pm.tc_usdt||'',pm.modo||o.tipoPago,t.subtotalBruto||t.totalGeneral||0,t.ajusteNeto||0,t.totalGeneral||0,pm.usd||'',pm.usdt||t.totalUSDT||'',o.costo||0,o.margen||0,lineas])+'\n';
    });
    filename='motoredge_ventas_'+new Date().toISOString().slice(0,10)+'.csv';
  }else if(tipo==='egresos'){
    const egresos=d.egresos||[];if(!egresos.length){sN('Sin egresos para exportar',true);return;}
    const hdr=['ID','Fecha','Concepto','Monto Total','Cuota Base','Ultima Cuota','Impacto Caja','Cuotas Total','Cuotas Restantes','Finaliza','Medio de Pago','Observaciones'];
    csv=hdr.join(',')+'\n';
    egresos.forEach(e=>{csv+=csvRow([e.id,e.fechaDisplay,e.concepto,e.montoTotal,e.cuotaBase||e.impactoCaja,e.ultimaCuota||e.impactoCaja,e.impactoCaja,e.cuotasTotales,e.cuotasRestantes,e.finaliza,e.medio,e.obs||''])+'\n';});
    filename='motoredge_egresos_'+new Date().toISOString().slice(0,10)+'.csv';
  }else if(tipo==='inversiones'){
    const inv=d.inversiones||[];const liq=d.liquidezExterna||[];
    if(!inv.length&&!liq.length){sN('Sin inversiones para exportar',true);return;}
    csv='=== INVERSIONES ===\nID,Fecha,Activo,Fuente,Moneda Origen,Monto Origen,Monto ARS,Precio Compra,Cantidad,Estado,Resultado Flotante ARS,Nota\n';
    inv.forEach(x=>{csv+=csvRow([x.id,x.fechaDisplay,x.activo,x.fuente||'',x.monedaOrigen||x.moneda||'ARS',x.monto||x.montoOriginal||x.montoARS,x.montoARS,x.precioCompra||x.precioActivo||'',x.cantidad||x.unidad||'',x.estado||'ACTIVA',x.resultadoFlotante||0,x.nota||''])+'\n';});
    csv+='\n=== LIQUIDEZ EXTERNA ===\nID,Fecha,Moneda,Monto,Equivalente ARS,Descripcion\n';
    liq.forEach(x=>{csv+=csvRow([x.id,x.fechaDisplay,x.moneda,x.monto,x.arsEquivalente,x.descripcion||''])+'\n';});
    filename='motoredge_inversiones_'+new Date().toISOString().slice(0,10)+'.csv';
  }else if(tipo==='inventario'){
    const prods=getProductos();
    const lotes=getLotes();
    const ingresos=getIngresos();
    if(!prods.length){sN('Sin productos para exportar',true);return;}
    // Sheet 1: Productos
    csv='=== PRODUCTOS ===\nID,Nombre,Unidad,Costo Adquisicion,Tipo Precio,Lista Precio,Stock Actual,Costo Prom Ponderado\n';
    prods.forEach(p=>{
      const stock=getStockFromLotes(p.id);
      const cProm=getCostoPromedio(p.id)||p.costo||0;
      const lista=getListasPrecios().find(l=>l.id===p.listaPrecioId);
      csv+=csvRow([p.id,p.nombre,p.unit||'ud',p.costo||0,p.tipo,lista?lista.nombre:'(propio)',stock,Math.round(cProm)])+'\n';
    });
    // Sheet 2: Lotes
    csv+='\n=== LOTES DE STOCK ===\nID Lote,ID Ingreso,Producto,Fecha,Cant. Inicial,Cant. Restante,Costo Unitario,Proveedor,Nota,Estado\n';
    Object.entries(lotes).forEach(([pid,arr])=>{
      const p=prods.find(x=>x.id===pid);
      const nombre=p?p.nombre:pid;
      (arr||[]).forEach(l=>{
        const estado=l.qty_restante<=0?'Agotado':l.qty_restante===l.qty_inicial?'Íntegro':'Parcial';
        csv+=csvRow([l.id,l.ingreso_id||'',nombre,d2s((l.fecha||'').substring(0,10)),l.qty_inicial,l.qty_restante,l.costo_unitario,l.proveedor||'',l.nota||'',estado])+'\n';
      });
    });
    // Sheet 3: Ingresos
    csv+='\n=== HISTORIAL DE INGRESOS ===\nID Ingreso,Fecha,Producto,Cantidad,Costo Unitario,Total,Proveedor,Nota\n';
    ingresos.slice().sort((a,b)=>a.fecha.localeCompare(b.fecha)).forEach(ing=>{
      const p=prods.find(x=>x.id===ing.prod_id);
      csv+=csvRow([ing.id,ing.fecha_display,p?p.nombre:ing.prod_id,ing.qty,ing.costo_unitario,ing.total,ing.proveedor||'',ing.nota||''])+'\n';
    });
    filename='motoredge_inventario_'+new Date().toISOString().slice(0,10)+'.csv';
  }
  const blob=new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);sN('CSV exportado');
}

// ── EXCEL COMPLETO CON FÓRMULAS ──
function expXLSX(){
  const d=ld();
  const orders=d.orders||[];const egresos=d.egresos||[];
  const inv=d.inversiones||[];const liq=d.liquidezExterna||[];
  const prods=getProductos();const stock=getStock();const stockMovs=d.stockMovs||[];
  if(!orders.length&&!egresos.length&&!inv.length&&!liq.length){sN('Sin datos para exportar',true);return;}
  const wb=XLSX.utils.book_new();
  const fecha_exp=new Date().toISOString().slice(0,10);

  // ══ HOJA: RESUMEN ══
  {
    const totalVentas=orders.reduce((a,o)=>(o.totales?.totalGeneral||0)+a,0);
    const totalEgresos=egresos.reduce((a,e)=>(e.montoTotal||0)+a,0);
    const totalInv=inv.reduce((a,x)=>(x.montoARS||0)+a,0);
    const neto=totalVentas-totalEgresos;
    const data=[
      ['MOTOR EDGE — RESUMEN FINANCIERO','',''],
      ['Exportado:',fecha_exp,''],
      ['','',''],
      ['VENTAS','',''],
      ['Total ventas (ARS):',{v:totalVentas,t:'n',z:'#,##0'},''],
      ['Cantidad de órdenes:',{v:orders.length,t:'n'},''],
      ['','',''],
      ['EGRESOS','',''],
      ['Total egresos (ARS):',{v:totalEgresos,t:'n',z:'#,##0'},''],
      ['Cantidad de egresos:',{v:egresos.length,t:'n'},''],
      ['','',''],
      ['RESULTADO','',''],
      ['Resultado neto (ARS):',{v:neto,t:'n',z:'#,##0',f:'B5-B9'},''],
      ['Margen promedio %:',{v:orders.length?parseFloat((orders.reduce((a,o)=>a+(o.margen||0),0)/orders.length).toFixed(1)):0,t:'n',z:'0.0%'},''],
      ['','',''],
      ['INVERSIONES','',''],
      ['Total invertido (ARS):',{v:totalInv,t:'n',z:'#,##0'},''],
      ['Cantidad inversiones:',{v:inv.length,t:'n'},''],
    ];
    const ws=xlsxAoaToSheet(data);
    ws['!cols']=[{wch:28},{wch:18},{wch:10}];
    XLSX.utils.book_append_sheet(wb,ws,'RESUMEN');
  }

  // ══ HOJA: INGRESOS (con fórmulas) ══
  if(orders.length){
    // Encabezados
    const HDR=['ID','Fecha','Cliente','Nota','Tipo Pago','TC USD','TC USDT',
      'Subtotal Bruto','Ajuste Neto','Total ARS','Total USD','Total USDT',
      'Costo ARS','Ganancia ARS','Margen %',
      'Calaveras','Teddy','Lucky','Genericas','Cristales(g)','Hongos(g)','Goteros','Petri','Variable'];
    const dataRows=orders.map((o,i)=>{
      const ri=i+2; // fila en excel (1=header)
      const t=o.totales||{};const pm=t.payment||o.payment||{};
      const p=o.productos||{};
      // Extrae qty por producto desde _lineas o legacy
      function getQty(prodId,varId){
        if(p._lineas)return p._lineas.filter(l=>varId?l.varId===varId:l.prodId===prodId&&!l.varId).reduce((a,l)=>a+(l.qty||0),0);
        if(varId==='v-cal')return p.calaveras||0;if(varId==='v-ted')return p.teddy||0;
        if(varId==='v-lck')return p.lucky||0;if(varId==='v-gen')return p.genericas||0;
        if(prodId==='p-cris')return p.cristales||0;if(prodId==='p-hong')return p.hongos||0;
        if(prodId==='p-got')return p.goteros||0;if(prodId==='p-pet')return p.petri||0;
        return 0;
      }
      const totalARS=t.totalGeneral||0;
      const costo=o.costo||0;
      const subtotal=t.subtotalBruto||totalARS;
      const ajuste=t.ajusteNeto||0;
      return[
        {v:o.id,t:'s'},{v:o.fechaDisplay,t:'s'},{v:o.cliente||'',t:'s'},{v:o.nota||'',t:'s'},
        {v:o.tipoPago||'ARS',t:'s'},
        {v:pm.tc_usd||0,t:'n'},{v:pm.tc_usdt||0,t:'n'},
        {v:subtotal,t:'n',z:'#,##0'},{v:ajuste,t:'n',z:'#,##0'},
        {v:totalARS,t:'n',z:'#,##0',f:`H${ri}+I${ri}`},   // Total = Subtotal + Ajuste
        {v:pm.usd||0,t:'n',z:'#,##0.00'},{v:pm.usdt||t.totalUSDT||0,t:'n',z:'#,##0.00'},
        {v:costo,t:'n',z:'#,##0'},
        {v:totalARS-costo,t:'n',z:'#,##0',f:`J${ri}-M${ri}`},  // Ganancia = Total - Costo
        {v:totalARS>0?parseFloat(((totalARS-costo)/totalARS*100).toFixed(2)):0,t:'n',z:'0.00"%"',f:`IF(J${ri}>0,(J${ri}-M${ri})/J${ri}*100,0)`},
        {v:getQty('p-past','v-cal'),t:'n'},{v:getQty('p-past','v-ted'),t:'n'},
        {v:getQty('p-past','v-lck'),t:'n'},{v:getQty('p-past','v-gen'),t:'n'},
        {v:getQty('p-cris',null),t:'n'},{v:getQty('p-hong',null),t:'n'},
        {v:getQty('p-got',null),t:'n'},{v:getQty('p-pet',null),t:'n'},
        {v:p.variable||0,t:'n'},
      ];
    });
    // Fila de totales con fórmulas SUMA
    const lastR=orders.length+1;
    const totRow=[
      {v:'TOTALES',t:'s'},{v:'',t:'s'},{v:'',t:'s'},{v:'',t:'s'},{v:'',t:'s'},{v:'',t:'s'},{v:'',t:'s'},
      {v:orders.reduce((a,o)=>a+(o.totales?.subtotalBruto||o.totales?.totalGeneral||0),0),t:'n',z:'#,##0',f:`SUM(H2:H${lastR})`},
      {v:orders.reduce((a,o)=>a+(o.totales?.ajusteNeto||0),0),t:'n',z:'#,##0',f:`SUM(I2:I${lastR})`},
      {v:orders.reduce((a,o)=>a+(o.totales?.totalGeneral||0),0),t:'n',z:'#,##0',f:`SUM(J2:J${lastR})`},
      {v:orders.reduce((a,o)=>a+(o.totales?.payment?.usd||0),0),t:'n',z:'#,##0.00',f:`SUM(K2:K${lastR})`},
      {v:orders.reduce((a,o)=>a+(o.totales?.payment?.usdt||o.totales?.totalUSDT||0),0),t:'n',z:'#,##0.00',f:`SUM(L2:L${lastR})`},
      {v:orders.reduce((a,o)=>a+(o.costo||0),0),t:'n',z:'#,##0',f:`SUM(M2:M${lastR})`},
      {v:orders.reduce((a,o)=>a+(o.totales?.totalGeneral||0)-(o.costo||0),0),t:'n',z:'#,##0',f:`SUM(N2:N${lastR})`},
      {v:0,t:'n',z:'0.00"%"',f:`IF(J${lastR+1}>0,N${lastR+1}/J${lastR+1}*100,0)`},
      ...Array(9).fill({v:'',t:'s'})
    ];
    const ws=xlsxAoaToSheet([[...HDR.map(h=>({v:h,t:'s'}))], ...dataRows, totRow]);
    ws['!cols']=[{wch:20},{wch:10},{wch:14},{wch:16},{wch:9},{wch:9},{wch:9},{wch:13},{wch:11},{wch:13},{wch:11},{wch:11},{wch:12},{wch:13},{wch:10},{wch:9},{wch:9},{wch:9},{wch:9},{wch:11},{wch:10},{wch:9},{wch:9},{wch:10}];
    XLSX.utils.book_append_sheet(wb,ws,'INGRESOS');
  }

  // ══ HOJA: DETALLE LÍNEAS (una fila por producto en cada pedido) ══
  if(orders.length){
    const HDR2=['ID Orden','Fecha','Cliente','Producto','Cantidad','Precio Unit ARS','Subtotal ARS','Tipo Pago','Total Orden ARS'];
    const rows2=[];
    orders.forEach(o=>{
      const lineas=_getLineasOrden(o);
      const t=o.totales||{};
      lineas.forEach((l,li)=>{
        rows2.push([
          {v:o.id,t:'s'},{v:o.fechaDisplay,t:'s'},{v:o.cliente||'',t:'s'},
          {v:l.nombre,t:'s'},{v:l.qty,t:'n'},{v:l.precio,t:'n',z:'#,##0'},
          {v:l.subtotal,t:'n',z:'#,##0',f:`E${rows2.length+2}*F${rows2.length+2}`},
          {v:o.tipoPago||'ARS',t:'s'},
          li===0?{v:t.totalGeneral||0,t:'n',z:'#,##0'}:{v:'',t:'s'},
        ]);
      });
    });
    const ws2=xlsxAoaToSheet([[...HDR2.map(h=>({v:h,t:'s'}))], ...rows2]);
    ws2['!cols']=[{wch:20},{wch:10},{wch:14},{wch:20},{wch:9},{wch:14},{wch:13},{wch:9},{wch:14}];
    XLSX.utils.book_append_sheet(wb,ws2,'LINEAS_DETALLE');
  }

  // ══ HOJA: EGRESOS ══
  if(egresos.length){
    const HDR=['ID','Fecha','Concepto','Monto Total','Cuota Base','Ultima Cuota','Impacto Caja','Cuotas Total','Cuotas Rest.','Finaliza','Medio de Pago','Observaciones'];
    const rows=egresos.map((e,i)=>{
      const ri=i+2;
      return[
        {v:e.id,t:'s'},{v:e.fechaDisplay,t:'s'},{v:e.concepto,t:'s'},
        {v:e.montoTotal,t:'n',z:'#,##0'},{v:e.cuotaBase||e.impactoCaja,t:'n',z:'#,##0'},
        {v:e.ultimaCuota||e.impactoCaja,t:'n',z:'#,##0'},{v:e.impactoCaja,t:'n',z:'#,##0'},
        {v:e.cuotasTotales,t:'n'},{v:e.cuotasRestantes,t:'n'},
        {v:e.finaliza,t:'s'},{v:e.medio,t:'s'},{v:e.obs||'',t:'s'},
      ];
    });
    const lastR=egresos.length+1;
    const totRow=[{v:'TOTALES',t:'s'},{v:'',t:'s'},{v:'',t:'s'},
      {v:egresos.reduce((a,e)=>a+(e.montoTotal||0),0),t:'n',z:'#,##0',f:`SUM(D2:D${lastR})`},
      {v:'',t:'s'},{v:'',t:'s'},
      {v:egresos.reduce((a,e)=>a+(e.impactoCaja||0),0),t:'n',z:'#,##0',f:`SUM(G2:G${lastR})`},
      ...Array(5).fill({v:'',t:'s'})
    ];
    const ws=xlsxAoaToSheet([[...HDR.map(h=>({v:h,t:'s'}))], ...rows, totRow]);
    ws['!cols']=[{wch:20},{wch:10},{wch:26},{wch:13},{wch:12},{wch:12},{wch:12},{wch:12},{wch:12},{wch:11},{wch:16},{wch:24}];
    XLSX.utils.book_append_sheet(wb,ws,'EGRESOS');
  }

  // ══ HOJA: INVERSIONES ══
  if(inv.length){
    const HDR=['ID','Fecha','Activo','Fuente','Moneda Origen','Monto Origen','Monto ARS','Precio Compra','Cantidad','Estado','Resultado Flotante ARS','Nota'];
    const rows=inv.map((x,i)=>{
      const ri=i+2;
      return[
        {v:x.id,t:'s'},{v:x.fechaDisplay,t:'s'},{v:x.activo,t:'s'},{v:x.fuente||'',t:'s'},
        {v:x.monedaOrigen||x.moneda||'ARS',t:'s'},
        {v:x.monto||x.montoOriginal||x.montoARS,t:'n',z:'#,##0.00'},
        {v:x.montoARS,t:'n',z:'#,##0'},
        {v:x.precioCompra||x.precioActivo||0,t:'n',z:'#,##0.00'},
        {v:x.cantidad||x.unidad||'',t:'s'},
        {v:x.estado||'ACTIVA',t:'s'},
        {v:x.resultadoFlotante||0,t:'n',z:'#,##0'},
        {v:x.nota||'',t:'s'},
      ];
    });
    const lastR=inv.length+1;
    const totRow=[{v:'TOTALES',t:'s'},...Array(5).fill({v:'',t:'s'}),
      {v:inv.reduce((a,x)=>a+(x.montoARS||0),0),t:'n',z:'#,##0',f:`SUM(G2:G${lastR})`},
      {v:'',t:'s'},{v:'',t:'s'},{v:'',t:'s'},
      {v:inv.reduce((a,x)=>a+(x.resultadoFlotante||0),0),t:'n',z:'#,##0',f:`SUM(K2:K${lastR})`},
      {v:'',t:'s'}
    ];
    const ws=xlsxAoaToSheet([[...HDR.map(h=>({v:h,t:'s'}))], ...rows, totRow]);
    ws['!cols']=[{wch:20},{wch:10},{wch:12},{wch:18},{wch:12},{wch:13},{wch:13},{wch:14},{wch:14},{wch:10},{wch:18},{wch:24}];
    XLSX.utils.book_append_sheet(wb,ws,'INVERSIONES');
  }

  // ══ HOJA: LIQUIDEZ EXTERNA ══
  if(liq.length){
    const HDR=['ID','Fecha','Moneda','Monto','Equivalente ARS','Descripcion'];
    const rows=liq.map(x=>[
      {v:x.id,t:'s'},{v:x.fechaDisplay,t:'s'},{v:x.moneda,t:'s'},
      {v:x.monto,t:'n',z:'#,##0.00'},{v:x.arsEquivalente,t:'n',z:'#,##0'},{v:x.descripcion||'',t:'s'}
    ]);
    const lastR=liq.length+1;
    const totRow=[{v:'TOTALES',t:'s'},{v:'',t:'s'},{v:'',t:'s'},
      {v:liq.reduce((a,x)=>a+(x.monto||0),0),t:'n',z:'#,##0.00',f:`SUM(D2:D${lastR})`},
      {v:liq.reduce((a,x)=>a+(x.arsEquivalente||0),0),t:'n',z:'#,##0',f:`SUM(E2:E${lastR})`},
      {v:'',t:'s'}
    ];
    const ws=xlsxAoaToSheet([[...HDR.map(h=>({v:h,t:'s'}))], ...rows, totRow]);
    ws['!cols']=[{wch:18},{wch:10},{wch:8},{wch:13},{wch:16},{wch:30}];
    XLSX.utils.book_append_sheet(wb,ws,'LIQUIDEZ_EXTERNA');
  }

  // ══ HOJA: PRODUCTOS (catálogo completo con tramos) ══
  if(prods.length){
    const HDR=['ID','Emoji','Nombre','Tipo','Unidad','Costo/ud','Activo','Tramo 1 (desde)','Tramo 1 (precio)','Tramo 2','Precio 2','Tramo 3','Precio 3','Tramo 4','Precio 4','Tramo 5','Precio 5'];
    const rows=prods.map(p=>{
      const ts=getTramosProducto?.(p)||[];
      const tr=[];for(let i=0;i<5;i++){tr.push(ts[i]?ts[i].t:'');tr.push(ts[i]?ts[i].p:'');}
      return[
        {v:p.id,t:'s'},{v:p.emoji,t:'s'},{v:p.nombre,t:'s'},{v:p.tipo,t:'s'},
        {v:p.unit||'ud',t:'s'},{v:p.costo||0,t:'n',z:'#,##0'},{v:p.activo?'SI':'NO',t:'s'},
        ...tr.map((v,i)=>i%2===0?{v:v||'',t:v?'n':'s'}:{v:v||0,t:v?'n':'s',z:v?'#,##0':''})
      ];
    });
    const ws=xlsxAoaToSheet([[...HDR.map(h=>({v:h,t:'s'}))], ...rows]);
    ws['!cols']=[{wch:14},{wch:6},{wch:18},{wch:10},{wch:12},{wch:8},{wch:10},{wch:7},...Array(10).fill({wch:10})];
    XLSX.utils.book_append_sheet(wb,ws,'PRODUCTOS');
  }

  // ══ HOJA: STOCK ACTUAL ══
  {
    const items=getAllStockItems()??[];
    const umbrales=getStockUmbObj();
    if(items.length){
      const HDR=['ID','Emoji','Nombre','Unidad','Stock Actual','Umbral Bajo','Umbral Critico','Estado'];
      const rows=items.map(it=>{
        const qty=getActualQty?.(it.id,stock);const st=getStockStatus?.(qty,it.id);
        const u=umbrales[it.id]||{warn:15,crit:5};
        return[
          {v:it.id,t:'s'},{v:it.emoji,t:'s'},{v:it.nombre,t:'s'},{v:it.unit||'ud',t:'s'},
          {v:qty,t:'n'},{v:u.warn,t:'n'},{v:u.crit,t:'n'},
          {v:st==='ok'?'OK':st==='warn'?'BAJO':st==='crit'?'CRITICO':'SIN STOCK',t:'s'}
        ];
      });
      const ws=xlsxAoaToSheet([[...HDR.map(h=>({v:h,t:'s'}))], ...rows]);
      ws['!cols']=[{wch:14},{wch:6},{wch:18},{wch:8},{wch:12},{wch:11},{wch:13},{wch:12}];
      XLSX.utils.book_append_sheet(wb,ws,'STOCK_ACTUAL');
    }
  }

  // ══ HOJA: STOCK_MOVIMIENTOS ══
  if(stockMovs.length){
    const HDR=['ID','Fecha','Tipo','Producto ID','Nombre','Antes','Delta','Despues','Nota'];
    const rows=stockMovs.slice(0,2000).map(m=>{
      const d=new Date(m.fecha);const fs=`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      return[
        {v:m.id||'',t:'s'},{v:fs,t:'s'},{v:m.tipo,t:'s'},{v:m.prodId,t:'s'},
        {v:(m.emoji||'')+' '+(m.nombre||m.prodId),t:'s'},
        {v:m.antes||0,t:'n'},{v:m.delta||0,t:'n'},{v:m.despues||0,t:'n'},{v:m.nota||'',t:'s'}
      ];
    });
    const ws=xlsxAoaToSheet([[...HDR.map(h=>({v:h,t:'s'}))], ...rows]);
    ws['!cols']=[{wch:20},{wch:17},{wch:11},{wch:14},{wch:20},{wch:7},{wch:7},{wch:8},{wch:28}];
    XLSX.utils.book_append_sheet(wb,ws,'STOCK_MOVIMIENTOS');
  }

  XLSX.writeFile(wb,`motoredge_${fecha_exp}.xlsx`);
  sN(`✓ Excel exportado — ${wb.SheetNames.length} hojas`);
}

// helper para getUmbrales en expXLSX (ya existe getUmbrales pero lo aliasamos)
function getStockUmbObj(){return getUmbrales();}

// ── RESTAURAR JSON DESDE FILE PICKER (auto-restore al seleccionar) ──
function impJSONFile(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    input.value='';
    const resEl=document.getElementById('impRes');
    try{
      const d=JSON.parse(e.target.result);
      if(!d.orders||!Array.isArray(d.orders))throw new Error('Formato inválido: falta orders[]');
      const meta=`${d.orders.length} ventas · ${(d.egresos||[]).length} egresos · ${(d.inversiones||[]).length} inversiones`;
      if(!confirm(`¿Restaurar desde "${file.name}"?\n\n${meta}\n\nEsto REEMPLAZA todos los datos actuales. No se puede deshacer.`)){
        if(resEl)resEl.innerHTML='<span style="color:var(--tx3)">Cancelado</span>';
        return;
      }
      // Backup automático silencioso del estado actual antes de sobreescribir
      const cur=ld();
      if((cur.orders||[]).length>0){
        try{
          const blob=new Blob([JSON.stringify(cur,null,2)],{type:'application/json'});
          const url=URL.createObjectURL(blob);const a=document.createElement('a');
          a.href=url;a.download=`motoredge_pre-restore_${new Date().toISOString().slice(0,16).replace('T','_').replace(':','-')}.json`;
          a.click();URL.revokeObjectURL(url);
        }catch(bkErr){/* no bloquear si el backup falla */}
      }
      if(d._distSlices){window._setDistSlices?.(d._distSlices);saveDistSlices();}
      if(d._liqDistSlices){window._setLiqDistSlices?.(d._liqDistSlices);saveLiqSlices();}
      if(d._distKpiHidden){window._setDistKpiHidden?.(d._distKpiHidden);saveKpiHidden();}
      if(d._priceLog&&Array.isArray(d._priceLog)){localStorage.setItem('me_price_log',JSON.stringify(d._priceLog));}
      delete d._distSlices;delete d._liqDistSlices;delete d._distKpiHidden;delete d._priceLog;
      delete d._exportedAt;delete d._version;delete d._meta;delete d._savedAt;
      sd(d);
      window.loadConfig?.();window.buildTicketUI?.();window.upd?.();
      window.rfM?.();window.rH?.();window.rS?.();window.rEH?.();window.rES?.();window.renderDash?.();window.renderSettings?.();
      try{window.renderInventario?.();}catch(er){}
      try{if(typeof window.renderInvAll==='function')window.renderInvAll?.();}catch(er){}
      try{window.rfInvM?.();}catch(er){}
      window.updateClientesDatalist?.();window.uhd?.();
      const lotesItems=Object.keys(d.lotes||{}).length;
      if(resEl)resEl.innerHTML=`<span style="color:var(--ac)">✓ Restaurado: ${d.orders.length} ventas · ${(d.egresos||[]).length} egresos<br>${(d.productos||[]).length} productos · ${(d.ingresos||[]).length} ingresos stock · ${lotesItems} lotes</span>`;
      sN('✓ Datos restaurados completamente');window.uhd?.();
    }catch(er){
      if(resEl)resEl.innerHTML=`<span style="color:var(--er)">ERROR: ${er.message}</span>`;
      sN('Error al restaurar',true);
    }
  };
  reader.readAsText(file,'utf-8');
}

// ── HARD RESET — borra todo el localStorage del sistema ──
function hardReset(){
  const KEYS=[
    {k:'motoredge_v4',    d:'Todos los datos financieros (ventas, egresos, inversiones, stock)'},
    {k:'me_gh_config',    d:'Configuración GitHub Sync (token, repo, archivo)'},
    {k:'me_dist_slices',  d:'Distribución de capital (inversiones)'},
    {k:'me_liq_dist_slices',d:'Distribución de liquidez'},
    {k:'me_dist_kpi_hidden',d:'KPIs ocultos en distribución'},
    {k:'me_apariencia',   d:'Colores y tema personalizados'},
    {k:'me_theme',        d:'Preferencia de tema (dark/light/modern)'},
    {k:'me_gh_last_push', d:'Timestamp del último push a GitHub'},
    {k:'me_price_log',    d:'Log de cambios de precios (auditoría)'},
    {k:'me_gh_calc_last', d:'Timestamp del último sync con la calculadora'},
  ];
  const present=KEYS.filter(x=>localStorage.getItem(x.k)!==null);
  if(!present.length){sN('No hay datos que borrar');return;}
  const list=present.map(x=>`• ${x.d}`).join('\n');
  const msg=`⚠️  HARD RESET\n\nSe va a borrar permanentemente:\n\n${list}\n\n──────────────────────────\nSe descargará un backup JSON antes de continuar.\n\n¿Confirmar?`;
  if(!confirm(msg))return;
  expJSON();
  present.forEach(x=>{try{localStorage.removeItem(x.k);}catch(e){}});
  sN('✓ Reset completo. Recargando...');
  setTimeout(()=>location.reload(),1500);
}



// ===== ui/modal.js =====

function showInputModal(title,placeholder,isText,style,callback){
  document.getElementById('mTitEl').textContent=title;document.getElementById('mTitEl').className='mtit';document.getElementById('modalBox').className='modal';
  document.getElementById('mTk').style.display='none';
  const inp=`<input type="${isText?'text':'number'}" id="modalInput" placeholder="${placeholder}" style="text-transform:${style||'none'};margin-bottom:12px">`;
  document.getElementById('mBody').innerHTML=inp;
  document.getElementById('mFooter').innerHTML=`<button class="btn btn-p" onclick="(function(){const v=document.getElementById('modalInput').value;clM();(${callback.toString()})(v)})()">Confirmar</button><button class="btn btn-s" onclick="clM()">✕ Cancelar</button>`;
  document.getElementById('modal').classList.add('open');setTimeout(()=>{const el=document.getElementById('modalInput');if(el)el.focus();},100);
}
function vTk(id){const o=gO().find(x=>x.id===id);if(!o)return;document.getElementById('mTitEl').textContent='🧾 Detalle';document.getElementById('mTitEl').className='mtit';document.getElementById('modalBox').className='modal';document.getElementById('mTk').style.display='block';document.getElementById('mTk').className='mtk';document.getElementById('mTk').textContent=o.ticketText;document.getElementById('mBody').innerHTML='';document.getElementById('mFooter').innerHTML=`<button class="btn btn-s" onclick="cpM()">⎘ Copiar</button><button class="btn btn-s" onclick="clM()">✕ Cerrar</button>`;document.getElementById('modal').classList.add('open');}
function vEgr(id){const e=gE().find(x=>x.id===id);if(!e)return;document.getElementById('mTitEl').textContent='📉 Egreso';document.getElementById('mTitEl').className='mtit red';document.getElementById('modalBox').className='modal red';document.getElementById('mTk').style.display='block';document.getElementById('mTk').className='mtk red';document.getElementById('mTk').textContent=e.ticketText;document.getElementById('mBody').innerHTML='';document.getElementById('mFooter').innerHTML=`<button class="btn btn-s" onclick="cpM()">⎘ Copiar</button><button class="btn btn-s" onclick="clM()">✕ Cerrar</button>`;document.getElementById('modal').classList.add('open');}
function clM(){document.getElementById('modal').classList.remove('open');document.getElementById('mTk').style.display='none';document.getElementById('mBody').innerHTML='';}
function cpM(){navigator.clipboard.writeText(document.getElementById('mTk').textContent).then(()=>sN('Copiado'));}


// ===== ui/tabs.js =====

function rfM(){
  const orders=gOConf(),eg=gE();const mV=[...new Set(orders.map(o=>o.mesActual))].sort();const mE=[...new Set(eg.map(e=>e.mesActual))].sort();const mAll=[...new Set([...mV,...mE])].sort();
  const mesActual=d2m(hoy());

  function fillWithRango(id,meses,lbl,defaultMes){
    const sel=document.getElementById(id);if(!sel)return;
    const cv=sel.value;
    sel.innerHTML='<option value="all">'+lbl+'</option>';
    meses.forEach(m=>{const op=document.createElement('option');op.value=m;op.textContent=mLong(m);sel.appendChild(op);});
    const ro=document.createElement('option');ro.value='rango';ro.textContent='📅 Rango de fechas...';sel.appendChild(ro);
    if(cv&&(meses.includes(cv)||cv==='rango'))sel.value=cv;
    else if(defaultMes&&meses.includes(defaultMes))sel.value=defaultMes;
  }

  // Ventas: selector unificado
  fillWithRango('ventasMes',mV,'Todo el período',mesActual);
  const vv=document.getElementById('ventasMes')?.value;
  const vdw=document.getElementById('ventasDesdeWrap'),vhw=document.getElementById('ventasHastaWrap');
  if(vdw&&vhw){vdw.style.display=vv==='rango'?'':'none';vhw.style.display=vv==='rango'?'':'none';}

  // Egresos: selector unificado
  fillWithRango('egresosMes',mE,'Todo el período',mesActual);
  const ev=document.getElementById('egresosMes')?.value;
  const edw=document.getElementById('egresosDesdeWrap'),ehw=document.getElementById('egresosHastaWrap');
  if(edw&&ehw){edw.style.display=ev==='rango'?'':'none';ehw.style.display=ev==='rango'?'':'none';}

  // Inversiones: selector unificado global
  fillWithRango('invGlobalMes',mAll,'Todo el período',null);
  const igv=document.getElementById('invGlobalMes')?.value;
  const igdw=document.getElementById('invGlobalDesdeWrap'),ighw=document.getElementById('invGlobalHastaWrap');
  if(igdw&&ighw){igdw.style.display=igv==='rango'?'':'none';ighw.style.display=igv==='rango'?'':'none';}

  // Mantener invDistMes en sync (lo necesita renderInvDist internamente)
  fill('invDistMes',mAll,'Todo el período');

  // Dashboard
  const ds=document.getElementById('dashMes');if(ds){
    const cv=ds.value;
    ds.innerHTML='<option value="all">Todo el período</option>';
    mAll.forEach(m=>{const op=document.createElement('option');op.value=m;op.textContent=mLong(m);ds.appendChild(op);});
    const ro=document.createElement('option');ro.value='rango';ro.textContent='📅 Rango de fechas...';ds.appendChild(ro);
    if(cv&&mAll.includes(cv)){ds.value=cv;}
    else if(mAll.includes(mesActual)){ds.value=mesActual;}
  }
  const dw=document.getElementById('dashDesdeWrap'),hw=document.getElementById('dashHastaWrap');
  const curV=document.getElementById('dashMes')?document.getElementById('dashMes').value:'all';
  if(dw&&hw){dw.style.display=curV==='rango'?'':'none';hw.style.display=curV==='rango'?'':'none';}
  rfInvM();

  // Stock & Umbrales: selector por mes igual que dashboard
  fillWithRango('invPeriodo',mV,'Todo el período',mesActual);
  const ipv=document.getElementById('invPeriodo')?.value;
  const ipdw=document.getElementById('invPeriodoDesdeWrap'),iphw=document.getElementById('invPeriodoHastaWrap');
  if(ipdw&&iphw){ipdw.style.display=ipv==='rango'?'':'none';iphw.style.display=ipv==='rango'?'':'none';}

  function fill(id,meses,lbl){const sel=document.getElementById(id);if(!sel)return;const cv=sel.value;sel.innerHTML='<option value="all">'+lbl+'</option>';meses.forEach(m=>{const op=document.createElement('option');op.value=m;op.textContent=mLong(m);sel.appendChild(op);});if(meses.includes(cv))sel.value=cv;}
}

function onVentasMesChange(){
  const v=document.getElementById('ventasMes').value;
  const dw=document.getElementById('ventasDesdeWrap'),hw=document.getElementById('ventasHastaWrap');
  if(v==='rango'){
    if(dw)dw.style.display='';if(hw)hw.style.display='';
    const h=hoy();
    if(document.getElementById('ventasDesde'))document.getElementById('ventasDesde').value=h.substring(0,8)+'01';
    if(document.getElementById('ventasHasta'))document.getElementById('ventasHasta').value=h;
  } else {if(dw)dw.style.display='none';if(hw)hw.style.display='none';}
  rS();rH();
}

function onEgresosMesChange(){
  const v=document.getElementById('egresosMes').value;
  const dw=document.getElementById('egresosDesdeWrap'),hw=document.getElementById('egresosHastaWrap');
  if(v==='rango'){
    if(dw)dw.style.display='';if(hw)hw.style.display='';
    const h=hoy();
    if(document.getElementById('egresosDesde'))document.getElementById('egresosDesde').value=h.substring(0,8)+'01';
    if(document.getElementById('egresosHasta'))document.getElementById('egresosHasta').value=h;
  } else {if(dw)dw.style.display='none';if(hw)hw.style.display='none';}
  rES();rEH();
}

function showTab(n,btn){
  destroyCharts();
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+n).classList.add('active');if(btn)btn.classList.add('active');
  if(n==='ventas'){rS();rH();}
  if(n==='egresos'){rES();rEH();if(!document.getElementById('e-fecha').value)document.getElementById('e-fecha').value=hoy();}
  if(n==='dashboard'){onDashMesChange();renderDashFlowChart();}
  if(n==='inversiones'){renderInvAll();document.getElementById('inv-fecha').value=hoy();if(!document.getElementById('liq-fecha').value)document.getElementById('liq-fecha').value=hoy();invSelFuente('distribucion');fetchPrecios();}
  if(n==='settings'){renderSettings();ghInit();renderIOStatus();}
  if(n==='inventario'){renderInventario();}
  if(n==='contactos'){
    const _d=ld();
    if(!_d.contactosMigDone&&(_d.orders||[]).some(o=>o.cliente)){
      window.mostrarMigracionContactos?.();
    } else {
      window.renderContactos?.();
    }
  }
}

function uhd(){const d=new Date();const dd=String(d.getDate()).padStart(2,'0'),mm=String(d.getMonth()+1).padStart(2,'0'),yyyy=d.getFullYear(),hh=String(d.getHours()).padStart(2,'0'),mi=String(d.getMinutes()).padStart(2,'0'),ss=String(d.getSeconds()).padStart(2,'0');document.getElementById('hm').innerHTML=`${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}<br>${gO().length}v · ${gE().length}e`;}


// ===== ui/delegacion.js =====

function setupDelegation(){
  ['hCont','eCont','tSeg'].forEach(cid=>{
    const el=document.getElementById(cid);if(!el)return;
    el.addEventListener('click',function(e){
      const delBtn=e.target.closest('[data-del]');
      if(delBtn){e.stopPropagation();const id=delBtn.getAttribute('data-del');const type=delBtn.getAttribute('data-type');if(type==='venta')bO(id);else if(type==='egr')bE(id);return;}
      const editBtn=e.target.closest('[data-edit]');
      if(editBtn){e.stopPropagation();const id=editBtn.getAttribute('data-edit');const type=editBtn.getAttribute('data-type');if(type==='venta')openEditVenta(id);else if(type==='egr')openEditEgr(id);return;}
      const item=e.target.closest('[data-type]');
      if(item){const id=item.getAttribute('data-id');const type=item.getAttribute('data-type');if(type==='venta')window.vTk?.(id);else if(type==='egr')window.vEgr?.(id);}
    });
  });
}

function setupDrop(){
  // dropZone eliminado — importación XLSX removida
}

function invSubTab(name){
  ['stock','productos','umbrales','historial'].forEach(n=>{
    const p=document.getElementById('invp-'+n);
    const b=document.getElementById('inv-sub-'+n);
    if(p)p.style.display=n===name?'':'none';
    if(b){
      b.style.color=n===name?'var(--ac)':'var(--tx2)';
      b.style.borderBottom=n===name?'2px solid var(--ac)':'2px solid transparent';
    }
  });
  if(name==='stock'){window.renderInventario?.();}
  if(name==='productos'){window.renderInventarioTabla?.();}
  if(name==='umbrales'){window.renderUmbrales?.();}
  if(name==='historial'){window.renderStockHistorial?.();}
}

function toggleStockGroup(pid){
  const el=document.getElementById('sk-grp-vars-'+pid);
  const arrow=document.getElementById('sk-grp-arrow-'+pid);
  const sub=document.getElementById('sg-sub-'+pid);
  if(!el)return;
  const open=el.style.display==='none'||!el.style.display;
  el.style.display=open?'flex':'none';
  if(arrow)arrow.textContent=open?'▾':'▸';
  if(sub){const unit=sub.textContent.split('·')[0].trim();sub.innerHTML=`suma variantes · ${open?'<span style="color:var(--ac2)">▾ colapsar</span>':'<span style="color:var(--ac2)">▸ expandir</span>'}`;}
}

function onVariantInput(vid,pid){
  window.previewStockCard?.(vid);
  // recalc group total from all variant inputs
  const p=getProductos().find(x=>x.id===pid);if(!p)return;
  const grpId='grp-'+pid;
  const sum=p.variantes.reduce((a,v)=>{const el=document.getElementById('si-'+v.id);return a+(el?Math.max(0,parseFloat(el.value)||0):0);},0);
  const grpSt=getStockStatus(sum,grpId);
  const unit=p.unit||'ud';
  // update group card displays
  const sv=document.getElementById('sqv-'+grpId);if(sv){sv.textContent=sum+' '+unit;sv.className='sk-stat-val '+grpSt;}
  const pill=document.getElementById('sg-pill-'+grpId);if(pill)pill.innerHTML=skPill(grpSt,sum,unit);
  const card=document.getElementById('srow-'+grpId);if(card){card.className='sk-card '+grpSt;}
}


// ===== main.js =====
// =====================================================================
// MOTOR EDGE 3.8-E — Sistema dinámico de productos
// =====================================================================

// ── Price shims: inversiones.js sets window._blueARS/window._usdtARS after each fetch ──
// Ticket UI reads these. Use window.* directly for latest values.

// ── COPY ──
function cpTk(){navigator.clipboard.writeText(document.getElementById('tkOut').textContent).then(()=>sN('Ticket copiado'));}
function cpEgr(){navigator.clipboard.writeText(document.getElementById('e-tkOut').textContent).then(()=>sN('Copiado'));}


// ── NOTIF ──

// ── THEME ──
function toggleTheme(){const isLight=document.body.getAttribute('data-theme')==='light';if(isLight)document.body.removeAttribute('data-theme');else document.body.setAttribute('data-theme','light');document.getElementById('themeBtn').textContent=isLight?'🌙':'☀️';localStorage.setItem('me_theme',isLight?'dark':'light');}


// ══════════════════════════════════════════════════════
// STOCK ENGINE
// ══════════════════════════════════════════════════════


// ── INIT ──
initConfigDeps(getProductos, updateClientesDatalist);
loadConfig();

// ── Seed stock inicial (corre una sola vez) ──
function seedStockInicial(){
  const d=ld();
  if(d.stockSeedDone)return; // ya corrió
  const lotes=getLotes();
  const ingresos=getIngresos();
  const ts='2025-01-01T10:00:00.000Z';
  const fecha_display='01/01/2025 10:00';

  // [prodId, qty, costo_unitario, unidad_display]
  const seed=[
    ['v-cal',  700,  5075, 'ud'],   // Calaveras
    ['v-ted',  1400, 5075, 'ud'],   // Teddy
    // Lucky Cat: 0 — no se carga lote vacío
    // Genéricas: 0 — no se carga lote vacío
    ['p-cris', 800,  7975, 'g'],    // Cristales
    ['p-hong', 500,  2000, 'g'],    // Hongos
    ['p-got',  10,   5000, 'ud'],   // Goteros
    ['p-pet',  10,   2000, 'ud'],   // Petri
  ];

  seed.forEach(([pid,qty,costo],seedIdx)=>{
    const mes='202501';
    const nnn=String(seedIdx+1).padStart(4,'0');
    const id='ING-'+mes+'-'+nnn;
    const loteId=id+'-L1';
    if(!lotes[pid])lotes[pid]=[];
    lotes[pid].push({
      id:loteId,ingreso_id:id,fecha:ts,
      qty_inicial:qty,qty_restante:qty,
      costo_unitario:costo,proveedor:'Stock inicial',nota:'Seed automático'
    });
    ingresos.push({
      id,fecha:ts,fecha_display,
      prod_id:pid,qty,costo_unitario:costo,
      total:qty*costo,proveedor:'Stock inicial',
      nota:'Seed automático',lote_id:loteId
    });
  });

  saveLotes(lotes);
  d.ingresos=ingresos;
  d.stockSeedDone=true;
  sd(d);
}
seedStockInicial();
ghInit();
const savedTheme=localStorage.getItem('me_theme');
if(savedTheme==='light'){document.body.setAttribute('data-theme','light');document.getElementById('themeBtn')&&(document.getElementById('themeBtn').textContent='☀️');}
// Apply saved appearance (including theme attribute)
const _savedAp=getApariencia();if(_savedAp)applyApariencia(_savedAp);
document.getElementById('fecha').value=hoy();document.getElementById('e-fecha').value=hoy();
buildTicketUI();upd();rfM();uhd();setInterval(uhd,1000);
document.getElementById('modal').addEventListener('click',function(e){if(e.target===this)clM();});
setupDelegation();setupDrop();

// ── WINDOW EXPOSURE — required for HTML onclick/onchange handlers ──
Object.assign(window, {
  // ticket
  setTP, buildTicketUI, upd, calc, adj, rst, rstDel, resetTodo,
  autoFillTC, syncAjuste, generarTicket, confirmarDesdeOutput, limpiar,
  // ventas
  rH, rS, toggleHistGrp, toggleTotals, bO, anularByIdModal, confirLimpiar,
  openEditVenta, editRecalcTotal, editUpdateEquiv, editSetMode, saveEditVenta,
  // egresos
  sE, updEgreso, generarEgreso, limpiarEgr, limpiarEgresos, rEH, rES, bE,
  openEditEgr, saveEditEgr, anularEgresoByIdModal, renderMPImportModal,
  // dashboard
  renderDash, onDashMesChange, renderDashFlowChart, setFlowPer, setBtcDays,
  fetchBtcHistorico, toggleChart,
  // inversiones
  renderInvAll, renderInvDist, renderInvRepo,
  rfInvM, onInvMesChange, onInvGlobalMesChange, invSelFuente, invSubNav, fetchPrecios,
  actualizarPreciosDash, invActualizarCampos, invCalcular, invGenerar,
  invReset, invLimpiar, invRenderHistorial,
  invLiquidarModal, invConfirmarLiquidacion, invEliminar, invAnularModal,
  invUsarPct, onInvPeriodoChange,
  // liquidez
  renderLiqExterna, registrarLiqExterna, toggleLiqExterna, updLiqPreview,
  setLiqView, saveDistSlices, saveLiqSlices, autoBalancePct, autoBalanceLiq,
  toggleDistEdit, toggleDistKpi, resetDistDefaults, cycleColor, cycleLiqColor,
  addDistSlice, removeDistSlice, addLiqSlice, removeLiqSlice, dLiqExterna,
  // inventario / stock
  renderInventario, renderInventarioTabla, renderInvStock, renderStockHistorial, renderIngresoForm,
  registrarIngreso, ingPreview, limpiarMovsStock,
  abrirLotesPanel, cerrarLotesPanel, renderLotesDetalle,
  generarStockTicket, renderStockEntryForm, eliminarMov,
  // productos
  renderPM, renderMaestra, abrirNuevoProducto, editarProducto,
  guardarProductoModal, toggleActivoProducto, duplicarProducto,
  abrirTramosEnMaestra, guardarTramosYCerrar, guardarMaestra,
  aplicarPctTodos, restablecerTramos, toggleTramoEditor,
  agregarTramo, eliminarTramo, guardarTramos, adjTramoDisc, updTramoDisc,
  addTramoEditor, removeTramoEditor, addVarianteEditor, removeVarianteEditor,
  setProdTipo, onPmListaChange, updModalDiscs,
  // listas de precios
  renderListasPrecios, renderAsignacionPrecios, abrirNuevaLista,
  abrirEditarLista, eliminarLista, renderInvPrecios,
  // io
  expJSON, expCSV, expXLSX, impJSONFile, hardReset,
  // github
  ghSaveToken, ghTestConn, ghPush, ghPull, ghBackupNow, ghListBackups,
  // apariencia
  guardarApariencia, resetApariencia, applyPreset, syncColorFromHex,
  toggleAparienciaAvanzada, loadAparienciaForm, updateThemeCards,
  // settings
  renderSettings,
  // contactos
  getContactos, getContactoById, autoRegistrarContacto, guardarInfoContacto,
  renderContactos, abrirContacto, volverListaContactos, filtrarContactos, setCtSort,
  mostrarMigracionContactos, ejecutarMigracionContactos,
  // price management
  getPriceLog, buildPreciosJson, ghSyncCalc,
  renderPriceAdjust, renderPricePreview, applyPriceFromUI, renderPriceLog, togglePriceLogEntry,
  // tabs / ui
  showTab, rfM, uhd, onVentasMesChange, onEgresosMesChange,
  // modals
  showInputModal, vTk, vEgr, clM, cpM, cpTk, cpEgr,
  confirmarOrden, toggleTheme,
  // stock utils
  getStockUmbObj, guardarUmbralesDesdeTabla, toggleStockGroup,
  onVariantInput, invMostrarPct, sN,
});


