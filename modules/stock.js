import { ld, sd } from '../core/storage.js';
import { sN } from '../ui/notif.js';

export function getStock(){const d=ld();return d.stock||{};}
export function saveStock(s){const d=ld();d.stock=s;sd(d);}
export function getUmbrales(){const d=ld();return d.stockUmbrales||{};}
export function saveUmbrales(u){const d=ld();d.stockUmbrales=u;sd(d);}
export function getStockMovs(){const d=ld();return d.stockMovs||[];}
export function addStockMov(mov){const d=ld();if(!d.stockMovs)d.stockMovs=[];d.stockMovs.unshift(mov);if(d.stockMovs.length>1000)d.stockMovs=d.stockMovs.slice(0,1000);sd(d);}
export function limpiarMovsStock(){if(!confirm('¿Eliminar todo el historial de movimientos de stock?'))return;const d=ld();d.stockMovs=[];sd(d);window.renderStockHistorial?.();sN('Historial limpiado');}
export function eliminarMov(idx){const d=ld();if(!d.stockMovs||!d.stockMovs[idx])return;d.stockMovs.splice(idx,1);sd(d);window.renderStockHistorial?.();}

// ── helpers ──
export function getStockStatus(qty,uid){
  const u=getUmbrales()[uid]||{};
  const crit=u.crit!=null?u.crit:5;
  const warn=u.warn!=null?u.warn:15;
  if(qty<=0)return'empty';
  if(qty<=crit)return'crit';
  if(qty<=warn)return'warn';
  return'ok';
}
export function skPill(st,qty,unit){
  if(st==='empty')return`<span class="sk-pill empty">⛔ SIN STOCK</span>`;
  if(st==='crit')return`<span class="sk-pill crit">🔴 RIESGO · ${qty}${unit}</span>`;
  if(st==='warn')return`<span class="sk-pill warn">🟡 ATENCIÓN · ${qty}${unit}</span>`;
  return`<span class="sk-pill ok">🟢 OK · ${qty}${unit}</span>`;
}
// legacy alias kept for mini-panel
export function stockStatusBadge(qty,uid,unit){
  const realQty = getActualQty(uid);
  return skPill(getStockStatus(realQty,uid),realQty,unit);
}

export function getAllStockItems(){
  const prods=(window.getProductos?.())||[];
  return prods.map(p=>({
    id:p.id,prodId:p.id,nombre:p.nombre,emoji:p.emoji,
    unit:p.unit||'ud',isGroup:false,parentId:null
  }));
}

// ── Datos: Lotes ──
export function getLotes(){const d=ld();return d.lotes||{};}
export function saveLotes(l){const d=ld();d.lotes=l;sd(d);}

export function getLotesItem(itemId){
  return(getLotes()[itemId]||[]).sort((a,b)=>a.fecha.localeCompare(b.fecha));
}
export function getLotesActivos(itemId){
  return getLotesItem(itemId).filter(l=>l.qty_restante>0);
}
export function getStockFromLotes(itemId){
  return getLotesActivos(itemId).reduce((a,l)=>a+l.qty_restante,0);
}
export function getCostoPromedio(itemId){
  const activos=getLotesActivos(itemId);
  const tot=activos.reduce((a,l)=>a+l.qty_restante,0);
  if(!tot)return 0;
  return activos.reduce((a,l)=>a+l.qty_restante*l.costo_unitario,0)/tot;
}
export function getStockGrupo(prodId){
  const p=(window.getProductos?.())||[];
  const prod=p.find(x=>x.id===prodId);
  if(!prod||!prod.variantes)return 0;
  return prod.variantes.reduce((a,v)=>a+getStockFromLotes(v.id),0);
}
export function getCostoPromedioGrupo(prodId){
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
export function getActualQty(id,_stock){
  const fromLotes=getStockFromLotes(id);
  if(fromLotes>0)return fromLotes;
  // fallback legacy stock
  return getStock()[id]||0;
}
