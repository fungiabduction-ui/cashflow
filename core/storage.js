import { sN } from '../ui/notif.js';

export const SK='motoredge_v4';
export function ld(){
  try{const r=localStorage.getItem(SK);return r?JSON.parse(r):{orders:[],egresos:[],precios:null,costos:null,productos:null};}
  catch(e){
    // JSON corrupto en localStorage — notificar después de que el DOM esté listo
    setTimeout(()=>sN('⚠ Storage corrupto — datos no cargados. Restaurá desde backup JSON.',true),800);
    return{orders:[],egresos:[],precios:null,costos:null,productos:null};
  }
}
export function sd(d){try{localStorage.setItem(SK,JSON.stringify(d));}catch(e){if(e.name==='QuotaExceededError'||e.code===22)sN('⚠ Storage LLENO — exportá un backup JSON y borrá meses viejos desde Configuración',true);else sN('Error al guardar',true);}}
export function gO(){return ld().orders||[];}
export function gOConf(){return gO().filter(o=>o.estado!=='pendiente');}
export function gE(){return ld().egresos||[];}
export function dO(id){const d=ld();d.orders=d.orders.filter(o=>o.id!==id);sd(d);window.updateClientesDatalist?.();}
export function dE(id){const d=ld();d.egresos=(d.egresos||[]).filter(e=>e.id!==id);sd(d);}
export function gInv(){var d=ld();return d.inversiones||[];}
export function dInv(id){var d=ld();d.inversiones=(d.inversiones||[]).filter(function(x){return x.id!==id;});sd(d);}
export function gLiqExterna(){const d=ld();return d.liquidezExterna||[];}
export function dLiqExterna(id){const d=ld();d.liquidezExterna=(d.liquidezExterna||[]).filter(function(x){return x.id!==id;});sd(d);}
