# Unificar sistema de guardado (tab Config) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar los 3 sistemas de guardado duplicados de CASHFLOW (auto-push mutable, backup timestamped manual, export/import local) por un único flujo manual con payload/restore compartidos, eliminando el auto-save silencioso y agregando descarga individual + carga del backup más reciente.

**Architecture:** Módulo nuevo `modules/backup.js` (sin conocimiento de GitHub) provee `buildBackupPayload()`, `restoreBackupPayload(data)` y `backupFingerprint(dataObj)`. `modules/github.js` e `modules/io.js` se reescriben para consumir esas 3 funciones en vez de duplicar la lógica. Se eliminan `ghPush`/`ghPull`/`ghAutoPush` y sus 11 call sites — el guardado a GitHub pasa a ser manual, con un indicador de "cambios sin guardar" basado en fingerprint.

**Tech Stack:** JS vanilla ES modules (sin bundler, `build.ps1` concatena a `bundle.js`), sin framework de testing — la verificación es build + revisión manual en navegador (no existe suite de tests en este proyecto).

**Nota sobre "tests":** Este proyecto no tiene test runner (confirmado: sin package.json, sin Jest/Mocha/Vitest). La verificación de cada tarea es: (1) `build.bat` sin errores, (2) `grep` sobre `bundle.js` para confirmar que el código nuevo quedó incluido, y en las tareas finales (3) prueba manual real en navegador. No inventar un framework de testing nuevo — fuera de alcance.

---

## Contexto que el implementador necesita saber (no está en el spec, lo relevé antes de escribir este plan)

- `build.ps1` concatena archivos en un orden fijo (array `$files`). El nuevo `modules/backup.js` debe insertarse **entre `core/config.js` y `modules/github.js`** — `backup.js` solo necesita `ld/sd` (storage) y `sN` (notif), ambos ya cargados antes; `github.js` e `io.js` lo consumen después.
- Los 11 call sites reales de `ghAutoPush()` (verificado con `grep -n "ghAutoPush()" modules/*.js`, excluyendo la definición de la función):
  - `modules/contactos.js:108` y `:483`
  - `modules/egresos.js:7` (dentro de `sE()`)
  - `modules/liquidez.js:15`
  - `modules/mp-import.js:128`
  - `modules/price-manager.js:114` y `:366`
  - `modules/inversiones.js:22` (dentro de `sInv()`) y `:895`
  - `modules/ventas.js:10` (dentro de `sO()`) y `:15`
- `main.js` importa y expone a `window` funciones de `github.js`/`io.js` en 3 puntos: línea 7 (import), línea 53 (comentario que menciona ghAutoPush), línea 156 (`Object.assign(window,...)`).
- `index.html` tiene el `<script src="bundle.js"></script>` en la línea 989, justo antes de `</body>` (991). El tab Config con las cards GitHub Sync / Backup / Datos / Reload Cache / Zona de Peligro está en las líneas ~866-952.
- `ghRestoreBackup`/`ghPull` actuales usan la Contents API directa, que **omite el contenido inline si el archivo supera 1MB** (`encoding:"none"`) — hay que agregar el fallback a la Blobs API (patrón ya validado en `biolab-app/cfg/cfg_app.js` → `ghApiBlob`), porque los backups de producción ya superaron varios cientos de KB (el leak de junio tenía 14.114 líneas).
- El código actual restaura `_distSlices`/`_liqDistSlices`/`_distKpiHidden` llamando `saveDistSlices()`/`saveLiqSlices()`/`saveKpiHidden()` **sin `window.` y sin import explícito** en `github.js` — funciona porque `build.ps1` aplana todo a un solo scope global en `bundle.js` (el único artefacto que se usa en producción). Es un patrón preexistente, no se toca ni se "arregla": se replica igual en el código nuevo.
- El guard `ghIsUnsafeRepo()` (agregado en un fix previo, ya en producción) se mantiene intacto — protege `ghSaveToken` y debe seguir protegiendo `ghBackupNow`.

---

### Task 1: Crear `modules/backup.js` y registrarlo en el build

**Files:**
- Create: `modules/backup.js`
- Modify: `build.ps1:8-36`

- [ ] **Step 1: Crear el archivo**

```js
import { ld, sd } from '../core/storage.js';

// ── PAYLOAD ──
// Arma el objeto único de respaldo: motoredge_v4 completo + las claves satélite
// de localStorage que no viven ahí. Única fuente de verdad de "qué es un backup" —
// usada por ghBackupNow/ghLoadLatest/ghRestoreBackup (modules/github.js) y
// expJSON/impJSONFile (modules/io.js). Antes esto estaba triplicado y ya había
// divergido entre los 3 (ver docs/superpowers/specs/2026-08-12-unificar-backup-cfg-design.md).
export function buildBackupPayload(){
  const d=ld();
  d._distSlices=window._getDistSlices?.();
  d._liqDistSlices=window._getLiqDistSlices?.();
  d._distKpiHidden=window._getDistKpiHidden?.();
  try{const ap=localStorage.getItem('me_apariencia');if(ap)d._apariencia=JSON.parse(ap);}catch(e){}
  const th=localStorage.getItem('me_theme');if(th)d._theme=th;
  d._version='motoredge_v5';
  d._savedAt=new Date().toISOString();
  d._meta={
    orders:(d.orders||[]).length,
    egresos:(d.egresos||[]).length,
    inversiones:(d.inversiones||[]).length,
    productos:(d.productos||[]).length,
    listasPrecios:(d.listasPrecios||[]).length,
    ingresos:(d.ingresos||[]).length,
    lotesItems:Object.keys(d.lotes||{}).length,
    contactos:(d.contactos||[]).length,
  };
  return d;
}

// ── FINGERPRINT ──
// FNV-1a doble sobre el payload SIN _savedAt/_meta (para que no cambie solo por
// la hora al recalcularlo dos veces seguidas sin cambios reales). Usado para el
// indicador "cambios sin guardar" en el tab Config.
export function backupFingerprint(dataObj){
  const clean={...dataObj};
  delete clean._savedAt;delete clean._meta;
  const str=JSON.stringify(clean);
  let h1=0x811c9dc5,h2=0x811c9dc5;
  for(let i=0;i<str.length;i++){
    const c=str.charCodeAt(i);
    h1=(h1^c)>>>0;h1=(h1*0x01000193)>>>0;
    h2=(h2^(c+i))>>>0;h2=(h2*0x01000193)>>>0;
  }
  return h1.toString(16)+h2.toString(16)+':'+str.length;
}

// ── RESTORE ──
// Valida, descarga backup de seguridad del estado ACTUAL antes de sobreescribir
// (universaliza lo que antes solo hacía impJSONFile), reintegra las claves
// satélite, aplica compat de priceLog, guarda y dispara el re-render completo.
// Usada por ghRestoreBackup/ghLoadLatest (modules/github.js) e impJSONFile
// (modules/io.js). Retorna la cantidad de ventas restauradas (para el mensaje
// de confirmación de cada caller). Lanza Error si el formato es inválido —
// el caller decide cómo mostrarlo (sN, ghStatus, etc).
export function restoreBackupPayload(data){
  if(!data||!Array.isArray(data.orders))throw new Error('Formato inválido: falta orders[]');
  try{
    const cur=ld();
    if((cur.orders||[]).length>0){
      const blob=new Blob([JSON.stringify(cur,null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob);const a=document.createElement('a');
      a.href=url;a.download='motoredge_pre-restore_'+new Date().toISOString().slice(0,16).replace('T','_').replace(':','-')+'.json';
      a.click();URL.revokeObjectURL(url);
    }
  }catch(bkErr){/* no bloquear la restauración si el backup de seguridad falla */}

  if(data._distSlices){window._setDistSlices?.(data._distSlices);saveDistSlices();}
  if(data._liqDistSlices){window._setLiqDistSlices?.(data._liqDistSlices);saveLiqSlices();}
  if(data._distKpiHidden){window._setDistKpiHidden?.(data._distKpiHidden);saveKpiHidden();}
  if(data._priceLog&&!data.priceLog){data.priceLog=data._priceLog;}
  if(!Array.isArray(data.priceLog)){
    const cur=ld();
    if(Array.isArray(cur.priceLog)&&cur.priceLog.length){data.priceLog=cur.priceLog;}
    else{try{const r=localStorage.getItem('me_price_log');data.priceLog=r?JSON.parse(r):[];localStorage.removeItem('me_price_log');}catch(e){data.priceLog=[];}}
  }
  if(data._apariencia){try{localStorage.setItem('me_apariencia',JSON.stringify(data._apariencia));window.applyApariencia?.(data._apariencia);}catch(e){}}
  if(data._theme){try{localStorage.setItem('me_theme',data._theme);}catch(e){}}
  delete data._distSlices;delete data._liqDistSlices;delete data._distKpiHidden;delete data._priceLog;
  delete data._apariencia;delete data._theme;delete data._version;delete data._savedAt;delete data._meta;

  sd(data);
  window.loadConfig?.();window.buildTicketUI?.();window.upd?.();
  window.rfM?.();window.rH?.();window.rS?.();window.rEH?.();window.rES?.();
  window.renderDash?.();window.renderSettings?.();
  try{window.renderInventario?.();}catch(e){}
  try{window.renderInvAll?.();}catch(e){}
  try{window.rfInvM?.();}catch(e){}
  window.updateClientesDatalist?.();window.uhd?.();
  window.renderPriceTerminal?.();window.renderPriceLog?.();
  return (data.orders||[]).length;
}
```

- [ ] **Step 2: Registrar el archivo en `build.ps1`**

En `build.ps1:8-36`, el array `$files` tiene esto:

```powershell
$files = @(
    "core/formatters.js",
    "ui/notif.js",
    "core/constants.js",
    "core/storage.js",
    "core/ids.js",
    "core/config.js",
    "modules/github.js",
```

Cambiar a:

```powershell
$files = @(
    "core/formatters.js",
    "ui/notif.js",
    "core/constants.js",
    "core/storage.js",
    "core/ids.js",
    "core/config.js",
    "modules/backup.js",
    "modules/github.js",
```

(el resto del array no cambia)

- [ ] **Step 3: Build y verificación mecánica**

Run: `powershell -File build.bat` (o `.\build.bat` desde PowerShell en la raíz del proyecto)
Expected: `bundle.js: NNNN lineas / NNN.N KB (28 archivos)` — el conteo de archivos sube de 27 a 28, sin `[!] No encontrado`.

Run: `grep -n "function buildBackupPayload\|function backupFingerprint\|function restoreBackupPayload" bundle.js`
Expected: las 3 funciones aparecen (sin `export` — el build lo quita).

- [ ] **Step 4: Commit**

```bash
git add modules/backup.js build.ps1
git commit -m "feat: modulo backup.js — payload/restore/fingerprint unificados"
```

---

### Task 2: Reescribir `modules/github.js`

**Files:**
- Modify: `modules/github.js` (todo el bloque desde `const GH_SK='me_gh_config';` en adelante — líneas 60-437 de la versión actual)

- [ ] **Step 1: Reemplazar el import del tope del archivo**

Buscar (línea 1-2 de `modules/github.js`):

```js
import { sN } from '../ui/notif.js';
import { SK, ld, sd } from '../core/storage.js';
```

Reemplazar por:

```js
import { sN } from '../ui/notif.js';
import { ld } from '../core/storage.js';
import { buildBackupPayload, restoreBackupPayload, backupFingerprint } from './backup.js';
```

(`sd` y `SK` no se usan en ningún otro lado de `github.js` fuera de `ghPull`, que se elimina en este mismo task — sin esto quedarían imports muertos)

- [ ] **Step 2: Reemplazar todo el bloque desde `const GH_SK=` hasta el final del archivo**

Buscar el bloque completo desde:
```js
const GH_SK='me_gh_config';
```
hasta el final del archivo (la función `ghInit` y su cierre).

Reemplazar por:

```js
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
    const files=await r.json();
    if(!files.length){if(el)el.innerHTML='<div style="font-family:var(--mo);font-size:9px;color:var(--tx3)">Sin backups.</div>';return;}
    var html='<div style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin-bottom:6px;letter-spacing:1px">'+files.length+' BACKUPS GUARDADOS</div>';
    files.slice().reverse().forEach(function(f){
      html+='<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:var(--s2);border:1px solid var(--br);margin-bottom:4px">'
        +'<span style="font-family:var(--mo);font-size:9px;color:var(--tx)">'+f.name+'</span>'
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
    const files=await r.json();
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
```

- [ ] **Step 3: Build y verificación mecánica**

Run: `.\build.bat`
Expected: sin errores, sin `[!] No encontrado`.

Run: `grep -c "function ghPush\|function ghPull\|function ghAutoPush\|function ghGetFileSha" bundle.js`
Expected: `0` (las 4 funciones ya no existen)

Run: `grep -n "function ghLoadLatest\|function ghDownloadBackup\|function ghApiBlob" bundle.js`
Expected: las 3 aparecen.

- [ ] **Step 4: Commit**

```bash
git add modules/github.js
git commit -m "refactor: github.js usa backup.js — elimina ghPush/ghPull/ghAutoPush, agrega ghLoadLatest/ghDownloadBackup"
```

---

### Task 3: Reescribir `modules/io.js` (expJSON/impJSONFile/hardReset)

**Files:**
- Modify: `modules/io.js:92-120` (expJSON)
- Modify: `modules/io.js:442-~495` (impJSONFile — buscar la función completa)
- Modify: `modules/io.js:553-575` (hardReset)

- [ ] **Step 1: Agregar el import de backup.js al tope de `modules/io.js`**

Buscar la primera línea del archivo (el import existente de storage/notif — leer las primeras líneas del archivo real antes de editar, ya que puede haber más imports de los que muestra este plan). Agregar esta línea junto a los demás imports del tope del archivo:

```js
import { buildBackupPayload, restoreBackupPayload } from './backup.js';
```

- [ ] **Step 2: Reemplazar `expJSON()` (líneas 92-120)**

Buscar el bloque completo de `export function expJSON(){...}` (desde `export function expJSON(){` hasta su `}` de cierre, línea 120).

Reemplazar por:

```js
export function expJSON(){
  const d=buildBackupPayload();
  if(!(d.orders||[]).length&&!confirm('⚠ El backup tiene 0 ventas. El storage podría estar vacío o corrupto. ¿Descargar igual?'))return;
  const blob=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');
  a.href=url;a.download=`motoredge_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();URL.revokeObjectURL(url);
  sN(`✓ Backup completo: ${d._meta.orders}v · ${d._meta.egresos}e · ${d._meta.ingresos} ingresos stock`);
}
```

- [ ] **Step 3: Reemplazar `impJSONFile()` (líneas 442 en adelante)**

Buscar el bloque completo de `export function impJSONFile(input){...}` (desde `export function impJSONFile(input){` hasta su `}` de cierre — el bloque termina antes de la siguiente función exportada del archivo; leer el archivo real para confirmar el rango exacto antes de reemplazar, dado que puede haber corrido código entre la lectura de este plan y la implementación).

Reemplazar por:

```js
export function impJSONFile(input){
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
      const n=restoreBackupPayload(d);
      if(resEl)resEl.innerHTML=`<span style="color:var(--ac)">✓ Restaurado (${n} ventas)</span>`;
      sN(`✓ Sistema restaurado desde ${file.name}`);
    }catch(err){
      if(resEl)resEl.innerHTML=`<span style="color:var(--er)">ERROR: ${err.message}</span>`;
      sN('ERROR al restaurar: '+err.message,true);
    }
  };
  reader.readAsText(file);
}
```

Nota: la versión anterior de `impJSONFile` hacía manualmente todo el trabajo de re-render (`window.loadConfig?.()`, `window.rfM?.()`, etc — unas 10 líneas) — eso ahora vive dentro de `restoreBackupPayload()` (Task 1), no hace falta repetirlo acá.

- [ ] **Step 4: Actualizar `hardReset()` (líneas 553-575) — cache-bust en el reload final**

Buscar:

```js
  sN('✓ Reset completo. Recargando...');
  setTimeout(()=>location.reload(),1500);
```

Reemplazar por:

```js
  sN('✓ Reset completo. Recargando...');
  setTimeout(()=>{location.href=location.pathname+'?v='+Date.now();},1500);
```

- [ ] **Step 5: Build y verificación mecánica**

Run: `.\build.bat`
Expected: sin errores.

Run: `grep -n "function expJSON\|function impJSONFile" bundle.js`
Expected: ambas funciones aparecen, con cuerpos cortos (delegando a `buildBackupPayload`/`restoreBackupPayload`).

- [ ] **Step 6: Commit**

```bash
git add modules/io.js
git commit -m "refactor: io.js usa backup.js para expJSON/impJSONFile, cache-bust en hardReset"
```

---

### Task 4: Eliminar los 11 call sites de `ghAutoPush()`

**Files:**
- Modify: `modules/contactos.js:108,483`
- Modify: `modules/egresos.js:7`
- Modify: `modules/liquidez.js:15`
- Modify: `modules/mp-import.js:128`
- Modify: `modules/price-manager.js:114,366`
- Modify: `modules/inversiones.js:22,895`
- Modify: `modules/ventas.js:10,15`

Para cada archivo: la única acción es borrar la línea `ghAutoPush();` (o, cuando está inline en la misma línea que otro código como en `egresos.js:7`/`inversiones.js:22`/`ventas.js:10`, borrar solo el fragmento `ghAutoPush();` de esa línea, dejando el resto intacto). También borrar el `import { ghAutoPush } from './github.js';` de cada uno de estos archivos si `ghAutoPush` no se usa para nada más ahí (verificar con grep antes de tocar cada import — no asumir).

- [ ] **Step 1: `modules/egresos.js:7`**

Buscar:
```js
export function sE(e){const d=ld();if(!d.egresos)d.egresos=[];d.egresos.push(e);sd(d);ghAutoPush();}
```
Reemplazar por:
```js
export function sE(e){const d=ld();if(!d.egresos)d.egresos=[];d.egresos.push(e);sd(d);}
```
Y borrar la línea de import `import { ghAutoPush } from './github.js';` de `modules/egresos.js` (confirmar primero con `grep -n "ghAutoPush" modules/egresos.js` que no queda ningún otro uso).

- [ ] **Step 2: `modules/inversiones.js:22` y `:895`**

Buscar:
```js
function sInv(x){var d=ld();if(!d.inversiones)d.inversiones=[];d.inversiones.push(x);sd(d);ghAutoPush();}
```
Reemplazar por:
```js
function sInv(x){var d=ld();if(!d.inversiones)d.inversiones=[];d.inversiones.push(x);sd(d);}
```
Y en la línea 895, buscar la línea exacta:
```js
  ghAutoPush();
```
(dos espacios de indentación, sola en su línea — confirmado con `grep -n "ghAutoPush()" modules/inversiones.js`) y borrarla por completo.
Borrar el import de `ghAutoPush` en `modules/inversiones.js` si no queda ningún otro uso.

- [ ] **Step 3: `modules/ventas.js:10` y `:15`**

Buscar:
```js
export function sO(o){const d=ld();d.orders.push(o);sd(d);ghAutoPush();window.updateClientesDatalist?.();}
```
Reemplazar por:
```js
export function sO(o){const d=ld();d.orders.push(o);sd(d);window.updateClientesDatalist?.();}
```
Buscar (línea 15):
```js
  sd(d);ghAutoPush();window.rfM?.();rH();rS();window.renderDash?.();window.renderDashFlowChart?.();window.uhd?.();
```
Reemplazar por:
```js
  sd(d);window.rfM?.();rH();rS();window.renderDash?.();window.renderDashFlowChart?.();window.uhd?.();
```
Borrar el import de `ghAutoPush` en `modules/ventas.js` si no queda ningún otro uso.

- [ ] **Step 4: `modules/liquidez.js:15`**

Buscar la línea exacta (confirmado con `grep -n "ghAutoPush()" modules/liquidez.js`):
```js
  ghAutoPush();
```
Borrarla por completo. Borrar el import si no queda otro uso.

- [ ] **Step 5: `modules/contactos.js:108` y `:483`**

Ambas ocurrencias son la misma línea exacta, sola en su línea (confirmado con `grep -n "ghAutoPush()" modules/contactos.js`):
```js
  ghAutoPush();
```
Borrar las dos (línea 108 y línea 483). Borrar el import si no queda otro uso.

- [ ] **Step 6: `modules/mp-import.js:128`**

Buscar la línea exacta (confirmado con `grep -n "ghAutoPush()" modules/mp-import.js`):
```js
  ghAutoPush();
```
Borrarla por completo. Borrar el import si no queda otro uso.

- [ ] **Step 7: `modules/price-manager.js:114` y `:366`**

Leer el contexto real de ambas líneas, borrar cada línea `ghAutoPush();` completa. Este archivo también importa `ghCfg` y `safeB64Encode` de `github.js` (usados por `ghSyncCalc()`, que NO se toca) — al editar el import, dejar `ghCfg, safeB64Encode` y quitar solo `ghAutoPush`.

- [ ] **Step 8: Verificación**

Run: `grep -rn "ghAutoPush" modules/*.js`
Expected: sin resultados (ni imports ni llamadas).

Run: `.\build.bat`
Expected: sin errores.

Run: `grep -c "ghAutoPush" bundle.js`
Expected: `0`

- [ ] **Step 9: Commit**

```bash
git add modules/contactos.js modules/egresos.js modules/liquidez.js modules/mp-import.js modules/price-manager.js modules/inversiones.js modules/ventas.js
git commit -m "refactor: eliminar ghAutoPush() y sus 11 call sites — guardado pasa a ser manual"
```

---

### Task 5: Actualizar `main.js`

**Files:**
- Modify: `main.js:7,53,156`

- [ ] **Step 1: Línea 7 — import de github.js**

Buscar:
```js
import { renderIOStatus, ghCfg, ghStatus, ghSyncInfo, safeB64Encode, safeB64Decode, ghSaveToken, ghLoadConfig, ghTestConn, ghPush, ghPull, ghAutoPush, ghBackupNow, ghListBackups, ghRestoreBackup, ghInit } from './modules/github.js';
```
Reemplazar por:
```js
import { renderIOStatus, ghCfg, ghStatus, ghSyncInfo, safeB64Encode, safeB64Decode, ghSaveToken, ghLoadConfig, ghTestConn, ghBackupNow, ghListBackups, ghRestoreBackup, ghLoadLatest, ghDownloadBackup, ghInit } from './modules/github.js';
```

- [ ] **Step 2: Línea 53 — comentario**

Buscar:
```js
getPriceLog(); // migración temprana: me_price_log → d.priceLog antes del primer ghAutoPush
```
Reemplazar por:
```js
getPriceLog(); // migración temprana: me_price_log → d.priceLog antes del primer backup
```

- [ ] **Step 3: Línea 156 — exposición a window**

Buscar:
```js
  // github
  ghSaveToken, ghTestConn, ghPush, ghPull, ghBackupNow, ghListBackups, ghRestoreBackup,
```
Reemplazar por:
```js
  // github
  ghSaveToken, ghTestConn, ghBackupNow, ghListBackups, ghRestoreBackup, ghLoadLatest, ghDownloadBackup,
```

- [ ] **Step 4: Build y verificación**

Run: `.\build.bat`
Expected: sin errores.

Run: `grep -n "window.ghLoadLatest\|window.ghDownloadBackup" bundle.js`
(el build no antepone `window.` automáticamente — esto en realidad hay que buscarlo dentro del bloque `Object.assign(window,{...})` del bundle)

Run: `grep -n "ghLoadLatest, ghDownloadBackup" bundle.js`
Expected: aparece dentro del bloque de exposición a `window`.

- [ ] **Step 5: Commit**

```bash
git add main.js
git commit -m "refactor: main.js — actualizar imports/exposicion tras eliminar ghPush/ghPull/ghAutoPush"
```

---

### Task 6: Reescribir la sección Config de `index.html`

**Files:**
- Modify: `index.html:866-928` (cards GitHub Sync + Backup + Datos)
- Modify: `index.html:930-940` (Reload Cache)
- Modify: `index.html:989` (script tag de bundle.js)

- [ ] **Step 1: Reemplazar las cards "GitHub Sync" + "Backup de seguridad" (líneas 866-914) por una sola card unificada**

Buscar el bloque completo:

```html
  <!-- GITHUB SYNC -->
  <div class="card">
    <div class="ct">☁ GitHub Sync</div>
    <div style="font-family:var(--mo);font-size:9px;color:var(--tx2);margin-bottom:12px;line-height:1.8">
      Guardá y sincronizá tus datos en GitHub.<br>
      El token se guarda solo en este dispositivo (localStorage).
    </div>
    <div id="ghStatus" style="font-family:var(--mo);font-size:10px;margin-bottom:10px;padding:8px;background:var(--s2);border:1px solid var(--br);display:none"></div>
    <div class="fr2" style="margin-bottom:10px">
      <div>
        <label>GitHub Token (Personal Access Token)</label>
        <input type="password" id="ghToken" placeholder="ghp_xxxxxxxxxxxx" style="font-size:11px">
      </div>
      <div>
        <label>Usuario / Repo</label>
        <input type="text" id="ghRepo" placeholder="fungiabduction-ui/cashflow" value="fungiabduction-ui/cashflow" style="font-size:11px">
      </div>
      <div>
        <label>Archivo de datos</label>
        <input type="text" id="ghFile" placeholder="datos.json" value="datos.json" style="font-size:11px">
      </div>
    </div>
    <div class="btn-row" style="margin-bottom:10px">
      <button class="btn btn-s" onclick="ghSaveToken()">🔑 Acceso</button>
      <button class="btn btn-s" onclick="ghTestConn()">🔌 Probar conexión</button>
    </div>
    <div class="dv"></div>
    <div style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin:10px 0 6px;letter-spacing:1px">SINCRONIZACIÓN</div>
    <div class="btn-row">
      <button class="btn btn-s" onclick="ghPush(true)" id="ghPushBtn">⚠️ Guardar en GitHub</button>
      <button class="btn btn-s" onclick="ghPull(true)" id="ghPullBtn">⬇ Cargar desde GitHub</button>
    </div>
    <div id="ghSyncInfo" style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-top:8px"></div>
    <div style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin-top:10px;line-height:1.8;background:var(--s2);border:1px solid var(--br);padding:8px">
      Auto-sync: se guarda en GitHub automáticamente cada vez que registrás una venta, egreso o inversión.
    </div>
    <div class="dv" style="margin-top:14px"></div>
    <div style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin:10px 0 6px;letter-spacing:1px">🔒 BACKUP DE SEGURIDAD (INMUTABLE POR FECHA)</div>
    <div style="font-family:var(--mo);font-size:9px;color:var(--tx2);margin-bottom:10px;line-height:1.7">
      Copia de seguridad manual que <b>nunca se sobreescribe</b>.<br>
      Se guarda en una carpeta <code style="background:var(--s3);padding:1px 4px">backups/</code> con fecha en el nombre.
    </div>
    <div id="ghBackupStatus" style="font-family:var(--mo);font-size:10px;margin-bottom:10px;padding:8px;background:var(--s2);border:1px solid var(--br);display:none"></div>
    <div class="btn-row">
      <button class="btn btn-s-glow" onclick="ghBackupNow()">🔒 Guardar backup ahora</button>
      <button class="btn btn-s" onclick="ghListBackups()">📋 Ver backups</button>
    </div>
    <div id="ghBackupList" style="margin-top:10px"></div>
  </div>
```

Reemplazar por:

```html
  <!-- GITHUB BACKUPS -->
  <div class="card">
    <div class="ct">☁ Backups en GitHub</div>
    <div style="font-family:var(--mo);font-size:9px;color:var(--tx2);margin-bottom:12px;line-height:1.8">
      Backups manuales con fecha, nunca se sobreescriben.<br>
      El token se guarda solo en este dispositivo (localStorage).
    </div>
    <div id="ghStatus" style="font-family:var(--mo);font-size:10px;margin-bottom:10px;padding:8px;background:var(--s2);border:1px solid var(--br);display:none"></div>
    <div class="fr2" style="margin-bottom:10px">
      <div>
        <label>GitHub Token (Personal Access Token)</label>
        <input type="password" id="ghToken" placeholder="ghp_xxxxxxxxxxxx" style="font-size:11px">
      </div>
      <div>
        <label>Usuario / Repo</label>
        <input type="text" id="ghRepo" placeholder="fungiabduction-ui/motoredge-data" value="fungiabduction-ui/motoredge-data" style="font-size:11px">
      </div>
    </div>
    <div class="btn-row" style="margin-bottom:10px">
      <button class="btn btn-s" onclick="ghSaveToken()">🔑 Acceso</button>
      <button class="btn btn-s" onclick="ghTestConn()">🔌 Probar conexión</button>
    </div>
    <div id="ghUnsavedStatus" style="font-family:var(--mo);font-size:10px;margin-bottom:10px;padding:8px;background:var(--s2);border:1px solid var(--br);display:none"></div>
    <div id="ghBackupStatus" style="font-family:var(--mo);font-size:10px;margin-bottom:10px;padding:8px;background:var(--s2);border:1px solid var(--br);display:none"></div>
    <div class="btn-row">
      <button class="btn btn-s-glow" onclick="ghBackupNow()">🔒 Guardar backup ahora</button>
      <button class="btn btn-s" onclick="ghLoadLatest()">⬇ Cargar el más reciente</button>
      <button class="btn btn-s" onclick="ghListBackups()">📋 Ver todos los backups</button>
    </div>
    <div id="ghSyncInfo" style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-top:8px"></div>
    <div id="ghBackupList" style="margin-top:10px"></div>
  </div>
```

- [ ] **Step 2: Reemplazar el botón de "Forzar recarga" (dentro del bloque `<!-- RELOAD CACHE -->`, líneas 930-940)**

Buscar:
```html
    <button class="btn btn-s" onclick="location.reload(true)">
      🔄 Forzar recarga (limpiar caché)
    </button>
```
Reemplazar por:
```html
    <button class="btn btn-s" onclick="location.href=location.pathname+'?v='+Date.now()">
      🔄 Forzar recarga (limpiar caché)
    </button>
```

- [ ] **Step 3: Cache-bust en la carga de `bundle.js` (línea 989)**

Buscar:
```html
<script src="bundle.js"></script>
```
Reemplazar por:
```html
<script>
(function(){
  var v=new URLSearchParams(location.search).get('v')||'1';
  var s=document.createElement('script');
  s.src='bundle.js?v='+v;
  s.async=false;
  document.body.appendChild(s);
})();
</script>
```

- [ ] **Step 4: Verificación mecánica**

Run: `grep -n "ghPush\|ghPull\|ghFile\|value=\"fungiabduction-ui/cashflow\"" index.html`
Expected: sin resultados.

Run: `grep -n "ghLoadLatest\|ghUnsavedStatus\|motoredge-data" index.html`
Expected: aparecen.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: tab Config — fusionar cards GitHub, agregar Cargar-mas-reciente, fix cache-bust y repo default"
```

---

### Task 7: Build final y verificación en navegador (flujos locales, sin token real)

**Files:** ninguno (solo verificación)

- [ ] **Step 1: Build**

Run: `.\build.bat`
Expected: `bundle.js: NNNN lineas / NNN.N KB (28 archivos)` sin advertencias.

- [ ] **Step 2: Abrir la app en un navegador (chrome-devtools) y revisar la consola**

Abrir `index.html` (ruta local `file://` o vía `serve.bat`) en una pestaña nueva. Navegar a la pestaña Config (⚙). Revisar la consola del navegador (`list_console_messages`).
Expected: sin errores JS (en particular, sin `ReferenceError` relacionados a `ghPush`/`ghPull`/`ghAutoPush`/`ghFile`).

- [ ] **Step 3: Verificar visualmente la card "Backups en GitHub"**

Expected: el input "Usuario / Repo" muestra `fungiabduction-ui/motoredge-data` por defecto (no `cashflow`). No hay campo "Archivo de datos". No hay botones "Guardar en GitHub" / "Cargar desde GitHub". Sí hay "Guardar backup ahora", "Cargar el más reciente", "Ver todos los backups".

- [ ] **Step 4: Probar el flujo local (Descargar / Restaurar .json) sin necesidad de token**

Click en "⬇ Descargar backup JSON" → debe descargar un archivo `motoredge_backup_FECHA.json`. Abrir el archivo descargado y confirmar que tiene `_meta`, `_version`, `_savedAt`, `orders`, `egresos`, etc.

Click en "📂 Restaurar desde .json" y seleccionar el archivo recién descargado → debe aparecer el `confirm()` con el resumen de ventas/egresos/inversiones, y al confirmar, debe restaurar sin error de consola y mostrar el mensaje de éxito.

- [ ] **Step 5: Probar "Forzar recarga"**

Click en "🔄 Forzar recarga (limpiar caché)". Expected: la URL cambia a `...?v=<timestamp>` y la página recarga sin errores.

---

### Task 8: Verificación real contra GitHub (con el token de producción)

**Files:** ninguno (solo verificación, usa `token github.txt` en la raíz del proyecto per `CLAUDE.md`)

- [ ] **Step 1: Leer el token**

Run (PowerShell): `(Get-Content "token github.txt")[1].Trim()`

- [ ] **Step 2: Cargar el token+repo en la app y guardar**

En el navegador (Config → GitHub), pegar el token, confirmar que el repo dice `fungiabduction-ui/motoredge-data`, click "🔑 Acceso". Click "🔌 Probar conexión" → Expected: `OK — Repo: fungiabduction-ui/motoredge-data · Visibilidad: Privado`.

- [ ] **Step 3: Guardar un backup real**

Click "🔒 Guardar backup ahora". Expected: mensaje `✅ Backup guardado: backups/backup_FECHA_HORA.json` con conteo de ventas/egresos/inversiones reales.

Verificar del lado del repo (Bash, en este mismo entorno, no en el navegador):
Run: `gh api repos/fungiabduction-ui/motoredge-data/contents/backups --jq 'sort_by(.name) | .[-1].name'`
Expected: el archivo recién subido, con timestamp de ahora.

- [ ] **Step 4: Verificar el indicador de "cambios sin guardar"**

Después de guardar (paso anterior), recargar el tab Config (o cambiar de tab y volver) → Expected: indicador en verde "✓ Todo guardado.". Hacer cualquier cambio de datos (ej. registrar una venta de prueba y anularla, o editar y guardar apariencia) y volver al tab Config → Expected: indicador cambia a amarillo "⚠ Cambios sin guardar desde el último backup.".

- [ ] **Step 5: Probar "Ver todos los backups" + descargar individual**

Click "📋 Ver todos los backups". Expected: lista con fecha, botón "⬇ descargar" y "↩ restaurar" por fila. Click "⬇ descargar" en el backup recién creado → debe bajar el archivo tal cual está en GitHub.

- [ ] **Step 6: Probar "Cargar el más reciente"**

Click "⬇ Cargar el más reciente" → confirmar el diálogo → Expected: restaura sin error, muestra cantidad de ventas restauradas, el indicador vuelve a verde con `lastBackupSource:'load'`.

- [ ] **Step 7: Confirmar que el guard de seguridad sigue activo**

En el campo repo, escribir `fungiabduction-ui/cashflow` y click "🔑 Acceso". Expected: error `ERROR: fungiabduction-ui/cashflow es el repo PUBLICO...`, la config NO se guarda con ese valor. Volver a poner `fungiabduction-ui/motoredge-data` y guardar de nuevo antes de seguir.

---

### Task 9: Actualizar `CLAUDE.md`

**Files:**
- Modify: `CLAUDE.md` (invariante #8, tabla "Flujos de backup", grafo de dependencias, "Estructura de archivos")

- [ ] **Step 1: Reemplazar el invariante #8**

Buscar (dentro de la sección "Invariantes críticos"):
```
8. **`ghAutoPush()`**: se llama automáticamente después de `sO()`, `sE()`, `sLiqExterna()`, `sInv()`. No sacarlo de esas funciones. Tiene debounce de 8 segundos (`_autoPushTimer`) — múltiples operaciones rápidas se agrupan en un solo push para evitar race conditions con el SHA de GitHub.
```
Reemplazar por:
```
8. **Guardado 100% manual (desde 2026-08)**: NO existe auto-save. `buildBackupPayload()`/`restoreBackupPayload()`/`backupFingerprint()` (`modules/backup.js`) son la única fuente de verdad de qué es un backup y cómo se restaura — usadas por `ghBackupNow`/`ghLoadLatest`/`ghRestoreBackup` (GitHub) y `expJSON`/`impJSONFile` (local). El indicador de "cambios sin guardar" en el tab Config compara el fingerprint actual contra `me_gh_config.lastBackupFp`. Si se agrega un nuevo flujo de guardado en el futuro, DEBE pasar por `buildBackupPayload()`, no reimplementar la recolección de datos a mano — así se evitó que volviera a divergir como pasó entre `ghPush`/`ghBackupNow`/`expJSON` (ver `docs/superpowers/specs/2026-08-12-unificar-backup-cfg-design.md`).
```

- [ ] **Step 2: Reescribir la tabla "Flujos de backup — cobertura completa"**

Buscar:
```
**Flujos de backup — cobertura completa:**
| Flujo | Escribe | Lee/restaura |
|---|---|---|
| `ghPush()` | Sube todo al repo privado (`datos.json`) | — |
| `ghPull()` | — | Restaura todo desde `datos.json` |
| `ghBackupNow()` | Sube snapshot a `backups/backup_FECHA.json` | — |
| `ghRestoreBackup(path)` | — | Restaura desde backup puntual |
| `expJSON()` | Descarga JSON local | — |
| `impJSONFile(input)` | — | Restaura desde JSON local |
```
Reemplazar por:
```
**Flujos de backup — cobertura completa:**
| Flujo | Escribe | Lee/restaura |
|---|---|---|
| `ghBackupNow()` | Sube snapshot a `backups/backup_FECHA_HORA.json` (repo privado, nunca se pisa) | — |
| `ghLoadLatest()` | — | Restaura el backup más reciente de `backups/` |
| `ghDownloadBackup(path)` | — | Descarga un backup puntual como archivo local (sin restaurar) |
| `ghRestoreBackup(path)` | — | Restaura desde un backup puntual elegido de la lista |
| `expJSON()` | Descarga JSON local | — |
| `impJSONFile(input)` | — | Restaura desde JSON local |

Todos los flujos de escritura usan `buildBackupPayload()` y todos los de restauración usan `restoreBackupPayload()` (`modules/backup.js`) — sin duplicación de la lógica de qué se guarda o cómo se restaura.
```

- [ ] **Step 3: Actualizar el grafo de dependencias de módulos**

Buscar (dentro de la sección "Dependencias entre módulos"):
```
github     ←── storage, notif
```
Reemplazar por:
```
backup     ←── storage
github     ←── storage, notif, backup
```
Y buscar:
```
io         ←── storage, notif, formatters, productos, stock, inventario, listas-precios
```
Reemplazar por:
```
io         ←── storage, notif, formatters, productos, stock, inventario, listas-precios, backup
```

- [ ] **Step 4: Actualizar "Estructura de archivos"**

Buscar la línea exacta del árbol de `modules/` (la descripción de `github.js` menciona funciones que ya no existen):
```
│   ├── github.js       ← ghAutoPush(), ghPush(), ghPull(), ghInit(), safeB64Encode/Decode()
```
Reemplazar por:
```
│   ├── backup.js       ← buildBackupPayload(), restoreBackupPayload(data), backupFingerprint(dataObj)
│   │                      Única fuente de verdad de "qué es un backup" — usada por github.js e io.js
│   ├── github.js       ← ghBackupNow(), ghListBackups(), ghRestoreBackup(), ghLoadLatest(), ghDownloadBackup(), ghInit(), safeB64Encode/Decode()
```

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md — documentar backup.js y el nuevo modelo de guardado manual"
```

---

### Task 10: Push final

**Files:** ninguno

- [ ] **Step 1: Confirmar que todos los commits anteriores están en `clean-main` local**

Run: `git log --oneline -12`
Expected: los commits de las Tasks 1-9 en orden.

- [ ] **Step 2: Push**

Run:
```powershell
$TOKEN = (Get-Content "token github.txt" -Raw).Trim()
git push "https://$TOKEN@github.com/fungiabduction-ui/cashflow.git" clean-main:main
```

- [ ] **Step 3: Verificar sincronía**

Run: `git fetch origin main -q; git log HEAD..origin/main --oneline; git log origin/main..HEAD --oneline`
Expected: sin diferencias en ninguna dirección.

Run: `curl -s -o /dev/null -w "%{http_code}" https://fungiabduction-ui.github.io/cashflow/`
Expected: `200` (el sitio sigue vivo tras el deploy).
