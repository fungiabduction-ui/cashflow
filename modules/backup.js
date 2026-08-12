import { ld, sd } from '../core/storage.js';

// ── PAYLOAD ──
// Arma el objeto único de respaldo: motoredge_v4 completo + las claves satélite
// de localStorage que no viven en motoredge_v4. Única fuente de verdad de "qué es
// un backup" — usada por ghBackupNow/ghLoadLatest/ghRestoreBackup (modules/github.js)
// y expJSON/impJSONFile (modules/io.js). Antes esto estaba triplicado y ya había
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
  delete data._exportedAt;

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
