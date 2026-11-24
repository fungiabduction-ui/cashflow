import { sN } from '../ui/notif.js';

export const SK='motoredge_v4';
const VACIO=()=>({orders:[],egresos:[],precios:null,costos:null,productos:null});
// Modo protegido: si motoredge_v4 no parsea, se bloquea toda escritura para que el estado vacío que devuelve ld()
// nunca pise los datos. Solo restoreBackupPayload() y hardReset() lo levantan (desbloquearEscritura()).
let _bloqueado=false,_copiaHecha=false;
export function escrituraBloqueada(){return _bloqueado;}
export function desbloquearEscritura(){_bloqueado=false;try{document.getElementById('me-bloqueo')?.remove();}catch(e){}}
function sello(){const n=new Date(),p=x=>String(x).padStart(2,'0');return`${n.getFullYear()}${p(n.getMonth()+1)}${p(n.getDate())}-${p(n.getHours())}${p(n.getMinutes())}`;}
function avisoBloqueo(){
  try{
    if(!document.body||document.getElementById('me-bloqueo'))return;
    const el=document.createElement('div');el.id='me-bloqueo';
    el.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#c0392b;color:#fff;font:bold 13px/1.4 monospace;padding:10px 14px;text-align:center';
    el.textContent='⚠ Datos dañados — escrituras bloqueadas. Restaurá un backup desde Config';
    document.body.prepend(el);
  }catch(e){}
}
export function ld(){
  let r=null;
  try{r=localStorage.getItem(SK);if(r)return JSON.parse(r);}
  catch(e){
    if(r){
      _bloqueado=true;
      if(!_copiaHecha){_copiaHecha=true;try{localStorage.setItem(SK+'_corrupt_'+sello(),r);}catch(e2){/* sin espacio: se sigue igual */}}
      avisoBloqueo();
    }
  }
  return VACIO();
}
export function sd(d){
  if(_bloqueado){sN('⚠ Escrituras bloqueadas: datos dañados. Restaurá un backup desde Config',true);return false;}
  try{localStorage.setItem(SK,JSON.stringify(d));return true;}
  catch(e){if(e.name==='QuotaExceededError'||e.code===22)sN('⚠ Storage LLENO — exportá un backup JSON y borrá meses viejos desde Configuración',true);else sN('Error al guardar',true);return false;}
}
export function gO(){return ld().orders||[];}
export function gOConf(){return gO().filter(o=>o.estado!=='pendiente');}
export function gE(){return ld().egresos||[];}
export function dO(id){const d=ld();d.orders=d.orders.filter(o=>o.id!==id);sd(d);window.updateClientesDatalist?.();}
export function dE(id){const d=ld();d.egresos=(d.egresos||[]).filter(e=>e.id!==id);sd(d);}
export function gInv(){var d=ld();return d.inversiones||[];}
export function dInv(id){var d=ld();d.inversiones=(d.inversiones||[]).filter(function(x){return x.id!==id;});sd(d);}
export function gLiqExterna(){const d=ld();return d.liquidezExterna||[];}
export function dLiqExterna(id){const d=ld();d.liquidezExterna=(d.liquidezExterna||[]).filter(function(x){return x.id!==id;});sd(d);}
