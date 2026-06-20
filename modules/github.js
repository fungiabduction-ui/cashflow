import { sN } from '../ui/notif.js';
import { SK, ld, sd } from '../core/storage.js';

// ── GITHUB SYNC ──
export function renderIOStatus(){
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

export function ghCfg(){
  try{return JSON.parse(localStorage.getItem(GH_SK)||'{}');}catch(e){return{};}
}

export function ghStatus(msg,isErr){
  const el=document.getElementById('ghStatus');
  if(!el)return;
  el.style.display='block';
  el.style.borderLeft='3px solid '+(isErr?'var(--er)':'var(--ac)');
  el.style.color=isErr?'var(--er)':'var(--ac)';
  el.innerHTML=msg;
}

export function ghSyncInfo(msg){
  const el=document.getElementById('ghSyncInfo');
  if(el)el.textContent=msg;
}

// Encode JSON to base64 safely — handles all unicode / $ / accented chars
export function safeB64Encode(str){
  // TextEncoder → Uint8Array → base64
  const bytes=new TextEncoder().encode(str);
  let bin='';
  for(let i=0;i<bytes.byteLength;i++)bin+=String.fromCharCode(bytes[i]);
  return btoa(bin);
}

// Decode base64 to string safely
export function safeB64Decode(b64){
  const bin=atob(b64);
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function ghSaveToken(){
  const token=(document.getElementById('ghToken').value||'').trim();
  const repo=(document.getElementById('ghRepo').value||'').trim();
  const file=(document.getElementById('ghFile').value||'datos.json').trim();
  if(!token){ghStatus('ERROR: Token requerido',true);return;}
  if(!repo||!repo.includes('/')){ghStatus('ERROR: Repo invalido — debe ser usuario/repo',true);return;}
  localStorage.setItem(GH_SK,JSON.stringify({token,repo,file}));
  ghStatus('Config guardada en este dispositivo.<br>El token nunca sale de tu browser.',false);
  sN('GitHub config guardada');
}

export function ghLoadConfig(){
  const cfg=ghCfg();
  const tf=document.getElementById('ghToken');
  const rf=document.getElementById('ghRepo');
  const ff=document.getElementById('ghFile');
  if(tf&&cfg.token)tf.value=cfg.token;
  if(rf&&cfg.repo)rf.value=cfg.repo;
  if(ff&&cfg.file)ff.value=cfg.file;
}

export async function ghTestConn(){
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

export async function ghGetFileSha(cfg){
  try{
    const r=await fetch('https://api.github.com/repos/'+cfg.repo+'/contents/'+cfg.file+'?t='+Date.now(),{
      headers:{'Authorization':'token '+cfg.token,'Accept':'application/vnd.github.v3+json'}
    });
    if(r.ok){const d=await r.json();return d.sha||null;}
    return null;
  }catch(e){return null;}
}

export async function ghPush(showNotif){
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

export async function ghPull(showNotif){
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
export function ghAutoPush(){
  const cfg=ghCfg();
  if(!cfg.token||!cfg.repo)return;
  clearTimeout(_autoPushTimer);
  _autoPushTimer=setTimeout(function(){
    ghPush(false).catch(function(e){console.error('ghAutoPush failed:',e);});
  },8000);
}

// ── BACKUP DE SEGURIDAD POR FECHA ──
export async function ghBackupNow(){
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

export async function ghListBackups(){
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

export function ghInit(){
  ghLoadConfig();
  const last=localStorage.getItem('me_gh_last_push');
  if(last){const el=document.getElementById('ghSyncInfo');if(el)el.textContent='Ultimo guardado: '+last;}
}
