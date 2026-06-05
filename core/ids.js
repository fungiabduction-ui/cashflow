import { gO, gE, gInv, ld } from './storage.js';
import { hoy, d2m } from './formatters.js';

export function nId(mes){const dm=gO().filter(o=>o.id.substring(2,8)===mes);if(!dm.length)return`V-${mes}-0001`;const mx=Math.max(...dm.map(o=>parseInt(o.id.substring(9))));return`V-${mes}-${String(mx+1).padStart(4,'0')}`;}

export function nEId(mes){const dm=gE().filter(e=>e.id.substring(2,8)===mes);if(!dm.length)return`E-${mes}-0001`;const mx=Math.max(...dm.map(e=>parseInt(e.id.substring(9))));return`E-${mes}-${String(mx+1).padStart(4,'0')}`;}

export function newIngresoId(){
  const mes=d2m(hoy());
  const d=ld();
  if(!d.ingresos||!d.ingresos.length)return'ING-'+mes+'-0001';
  const del_mes=d.ingresos.filter(x=>x.id&&x.id.startsWith('ING-'+mes+'-'));
  if(!del_mes.length)return'ING-'+mes+'-0001';
  // Usar Math.max como nId/nEId para evitar colisiones tras eliminaciones
  const mx=Math.max(...del_mes.map(x=>parseInt(x.id.split('-')[2])||0));
  return'ING-'+mes+'-'+String(mx+1).padStart(4,'0');
}

export function invNuevoId(mes){
  var del_mes=gInv().filter(function(x){return x.mesActual===mes;});
  if(!del_mes.length)return 'I-'+mes+'-0001';
  var max=Math.max.apply(null,del_mes.map(function(x){return parseInt(x.id.split('-')[2])||0;}));
  return 'I-'+mes+'-'+String(max+1).padStart(4,'0');
}
