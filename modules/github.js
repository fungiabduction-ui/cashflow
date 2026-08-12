import { sN } from '../ui/notif.js';
import { ld } from '../core/storage.js';
import { buildBackupPayload, restoreBackupPayload, backupFingerprint } from './backup.js';

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

// Invariante de seguridad: datos.json/backups SOLO pueden ir al repo privado.
// fungiabduction-ui/cashflow es publico (codigo fuente) — nunca destino de datos financieros.
const GH_PUBLIC_REPO='fungiabduction-ui/cashflow';
function ghIsUnsafeRepo(repo){
  return (repo||'').trim().toLowerCase()===GH_PUBLIC_REPO;
}

export function ghCfg(){
  try{return JSON.parse(localStorage.getItem(GH_SK)||'{}');}catch(e){return{};}
}

function ghSetSyncState(fp,source){
  const cfg=ghCfg();
  cfg.lastBackupFp=fp;
  cfg.lastBackupSource=source;
  localStorage.setItem(GH_SK,JSON.stringify(cfg));
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
  if(!token){ghStatus('ERROR: Token requerido',true);return;}
  if(!repo||!repo.includes('/')){ghStatus('ERROR: Repo invalido — debe ser usuario/repo',true);return;}
  if(ghIsUnsafeRepo(repo)){ghStatus('ERROR: '+GH_PUBLIC_REPO+' es el repo PUBLICO (codigo fuente). Los datos financieros van a fungiabduction-ui/motoredge-data.',true);return;}
  const prev=ghCfg();
  const sameRepo=prev.repo===repo;
  localStorage.setItem(GH_SK,JSON.stringify({
    token,repo,
    lastBackupFp:sameRepo?prev.lastBackupFp:null,
    lastBackupSource:sameRepo?prev.lastBackupSource:null,
  }));
  ghStatus('Config guardada en este dispositivo.<br>El token nunca sale de tu browser.',false);
  ghLoadConfig();
  sN('GitHub config guardada');
}

export function ghLoadConfig(){
  const cfg=ghCfg();
  const tf=document.getElementById('ghToken');
  const rf=document.getElementById('ghRepo');
  if(tf&&cfg.token)tf.value=cfg.token;
  if(rf&&cfg.repo)rf.value=cfg.repo;
  const last=localStorage.getItem('me_gh_last_push');
  const syncEl=document.getElementById('ghSyncInfo');
  if(syncEl)syncEl.textContent=last?'Último backup: '+last:'Sin backups todavía';
  ghRenderUnsaved(cfg);
}

function ghRenderUnsaved(cfg){
  const el=document.getElementById('ghUnsavedStatus');
  if(!el)return;
  if(!cfg.token||!cfg.repo){el.style.display='none';return;}
  if(!cfg.lastBackupFp){
    el.style.display='block';
    el.style.borderLeft='3px solid var(--wn)';el.style.color='var(--wn)';
    el.innerHTML='⚠ Todavía no hiciste ningún backup en GitHub.';
    return;
  }
  const current=backupFingerprint(buildBackupPayload());
  const dirty=current!==cfg.lastBackupFp;
  el.style.display='block';
  if(dirty){
    el.style.borderLeft='3px solid var(--wn)';el.style.color='var(--wn)';
    el.innerHTML='⚠ Cambios sin guardar desde el último backup.';
  }else{
    el.style.borderLeft='3px solid var(--ac)';el.style.color='var(--ac)';
    el.innerHTML='✓ Todo guardado.';
  }
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

// Descarga (Blobs API) y decodifica el contenido completo de un blob de GitHub.
// La Contents API omite el content inline para archivos >1MB (encoding:"none").
async function ghApiBlob(cfg,sha){
  const r=await fetch('https://api.github.com/repos/'+cfg.repo+'/git/blobs/'+sha,{
    headers:{'Authorization':'token '+cfg.token,'Accept':'application/vnd.github.v3+json'}
  });
  if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.message||('ERROR '+r.status+' al leer blob'));}
  return r.json();
}

// Lee el contenido de un archivo de backup vía Contents API, con fallback
// automático a la Blobs API si el archivo supera 1MB.
async function ghFetchBackupContent(cfg,path){
  const r=await fetch('https://api.github.com/repos/'+cfg.repo+'/contents/'+path+'?t='+Date.now(),{
    headers:{'Authorization':'token '+cfg.token,'Accept':'application/vnd.github.v3+json'}
  });
  if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error('ERROR '+r.status+': '+(d.message||'No se pudo leer'));}
  const meta=await r.json();
  if(meta.content){
    return safeB64Decode(meta.content.replace(/\n/g,''));
  }
  const blob=await ghApiBlob(cfg,meta.sha);
  return safeB64Decode(blob.content.replace(/\n/g,''));
}

export async function ghBackupNow(){
  const cfg=ghCfg();
  if(!cfg.token||!cfg.repo){
    const el=document.getElementById('ghBackupStatus');
    if(el){el.style.display='';el.style.color='var(--er)';el.innerHTML='ERROR: Configura GitHub primero (token + repo)';}
    return;
  }
  if(ghIsUnsafeRepo(cfg.repo)){
    const elBlk=document.getElementById('ghBackupStatus');
    if(elBlk){elBlk.style.display='';elBlk.style.color='var(--er)';elBlk.innerHTML='BLOQUEADO: la config apunta al repo PUBLICO ('+cfg.repo+'). Corregi el repo en Settings.';}
    console.error('ghBackupNow bloqueado: repo publico detectado en config',cfg.repo);
    return;
  }
  const el=document.getElementById('ghBackupStatus');
  if(el){el.style.display='';el.style.color='var(--tx2)';el.innerHTML='Guardando backup...';}
  try{
    const data=buildBackupPayload();
    const jsonStr=JSON.stringify(data,null,2);
    const encoded=safeB64Encode(jsonStr);
    const now=new Date();
    const dateStr=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
    const timeStr=String(now.getHours()).padStart(2,'0')+String(now.getMinutes()).padStart(2,'0');
    const backupFile='backups/backup_'+dateStr+'_'+timeStr+'.json';
    const body={message:'backup manual '+dateStr+' '+timeStr,content:encoded};
    const r=await fetch('https://api.github.com/repos/'+cfg.repo+'/contents/'+backupFile,{
      method:'PUT',
      headers:{'Authorization':'token '+cfg.token,'Accept':'application/vnd.github.v3+json','Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    const resp=await r.json();
    if(r.ok){
      const nowStr=new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
      localStorage.setItem('me_gh_last_push',nowStr);
      ghSetSyncState(backupFingerprint(data),'save');
      const syncEl=document.getElementById('ghSyncInfo');
      if(syncEl)syncEl.textContent='Último backup: '+nowStr;
      ghRenderUnsaved(ghCfg());
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
    const files=(await r.json()).filter(function(f){return f.type==='file'&&/^backup_\d{4}-\d{2}-\d{2}_\d{4}\.json$/.test(f.name);});
    if(!files.length){if(el)el.innerHTML='<div style="font-family:var(--mo);font-size:9px;color:var(--tx3)">Sin backups.</div>';return;}
    var html='<div style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin-bottom:6px;letter-spacing:1px">'+files.length+' BACKUPS GUARDADOS</div>';
    // Mas nuevo primero. sortedAsc queda mas viejo primero, para comparar cada
    // backup contra el que se guardo justo antes en el tiempo (su "anterior").
    const sortedAsc=files.slice().sort(function(a,b){return a.name.localeCompare(b.name);});
    const sortedDesc=sortedAsc.slice().reverse();
    sortedDesc.forEach(function(f){
      const kb=f.size!=null?(f.size/1024).toFixed(1)+' KB':'—';
      const idxAsc=sortedAsc.indexOf(f);
      const prev=idxAsc>0?sortedAsc[idxAsc-1]:null; // backup guardado justo antes
      let kbColor='var(--tx3)';
      if(prev&&f.size!=null&&prev.size!=null){
        kbColor=f.size>prev.size?'var(--ac)':(f.size===prev.size?'var(--wn)':'var(--er)');
      }
      html+='<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:var(--s2);border:1px solid var(--br);margin-bottom:4px">'
        +'<span style="font-family:var(--mo);font-size:9px;color:var(--tx)">'+f.name+'</span>'
        +'<span style="font-family:var(--mo);font-size:8px;color:'+kbColor+';margin-right:10px">'+kb+'</span>'
        +'<span>'
        +'<button onclick="ghDownloadBackup(\''+f.path+'\')" style="background:none;border:1px solid var(--tx3);color:var(--tx2);font-family:var(--mo);font-size:8px;padding:3px 8px;cursor:pointer;margin-right:4px">⬇ descargar</button>'
        +'<button onclick="ghRestoreBackup(\''+f.path+'\')" style="background:none;border:1px solid var(--ac2);color:var(--ac2);font-family:var(--mo);font-size:8px;padding:3px 8px;cursor:pointer">↩ restaurar</button>'
        +'</span>'
        +'</div>';
    });
    if(el)el.innerHTML=html;
  }catch(e){if(el)el.innerHTML='<div style="font-family:var(--mo);font-size:9px;color:var(--er)">ERROR: '+e.message+'</div>';}
}

export async function ghDownloadBackup(path){
  const cfg=ghCfg();
  if(!cfg.token||!cfg.repo){sN('Configura GitHub primero',true);return;}
  try{
    const jsonStr=await ghFetchBackupContent(cfg,path);
    const blob=new Blob([jsonStr],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');
    a.href=url;a.download=path.split('/').pop();
    a.click();URL.revokeObjectURL(url);
    sN('Descargado: '+a.download);
  }catch(e){sN('Error al descargar: '+e.message,true);}
}

export async function ghRestoreBackup(path){
  const name=path.split('/').pop();
  if(!confirm('¿Restaurar desde "'+name+'"?\nEsto sobreescribirá los datos actuales.'))return;
  const cfg=ghCfg();
  sN('Restaurando...');
  try{
    const jsonStr=await ghFetchBackupContent(cfg,path);
    const decoded=JSON.parse(jsonStr);
    const n=restoreBackupPayload(decoded);
    ghSetSyncState(backupFingerprint(buildBackupPayload()),'load');
    ghRenderUnsaved(ghCfg());
    sN('✓ Restaurado desde '+name+' ('+n+' ventas)');
    ghStatus('OK — restaurado desde backup: <b>'+name+'</b>',false);
  }catch(e){sN('ERROR al restaurar: '+e.message,true);}
}

export async function ghLoadLatest(){
  const cfg=ghCfg();
  if(!cfg.token||!cfg.repo){ghStatus('ERROR: Configura GitHub primero',true);return;}
  if(!confirm('¿Cargar el backup más reciente? Esto sobreescribirá los datos actuales.'))return;
  ghStatus('Buscando el último backup...',false);
  try{
    const r=await fetch('https://api.github.com/repos/'+cfg.repo+'/contents/backups',{
      headers:{'Authorization':'token '+cfg.token,'Accept':'application/vnd.github.v3+json'}
    });
    if(!r.ok){ghStatus('ERROR: No se encontraron backups todavía.',true);return;}
    const files=(await r.json()).filter(function(f){return f.type==='file'&&/^backup_\d{4}-\d{2}-\d{2}_\d{4}\.json$/.test(f.name);});
    if(!files.length){ghStatus('Sin backups todavía — usá "Guardar backup ahora" primero.',true);return;}
    files.sort(function(a,b){return a.name.localeCompare(b.name);});
    const latest=files[files.length-1];
    ghStatus('Cargando '+latest.name+'...',false);
    const jsonStr=await ghFetchBackupContent(cfg,latest.path);
    const decoded=JSON.parse(jsonStr);
    const n=restoreBackupPayload(decoded);
    ghSetSyncState(backupFingerprint(buildBackupPayload()),'load');
    ghRenderUnsaved(ghCfg());
    ghStatus('OK — cargado '+latest.name+' ('+n+' ventas)',false);
    sN('Backup más reciente cargado');
  }catch(e){ghStatus('ERROR: '+e.message,true);}
}

export function ghInit(){
  ghLoadConfig();
}
