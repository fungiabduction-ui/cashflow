import { getApariencia, loadAparienciaForm, updateThemeCards } from './apariencia.js';
import { sN } from '../ui/notif.js';

export function renderSettings(){
  loadAparienciaForm();
  const saved=getApariencia();
  const activePreset=saved?._preset||'dark';
  updateThemeCards(activePreset);
  const cont=document.getElementById('settingsMaintTools');
  if(cont)cont.innerHTML='';
  _renderMigracionTcBtn();
  _renderMigracionLineasBtn();
  if(cont&&!cont.querySelector('button')){
    cont.innerHTML='<span style="font-family:var(--mo);font-size:9px;color:var(--tx3)">✓ Sin migraciones pendientes</span>';
  }
}

function _renderMigracionTcBtn(){
  const cont=document.getElementById('settingsMaintTools');
  if(!cont)return;
  // Conteo via dry-run de la propia migración (no un filtro propio) — así el número
  // mostrado siempre coincide con lo que realmente va a tocar. Antes el conteo solo
  // miraba tc===null e ignoraba tcUsdt===null, mostrando menos órdenes de las que
  // realmente migraba al confirmar.
  const count=(window.migrarTcNull?.(true)?.cambios||[]).length;
  const existing=document.getElementById('btnMigraTcNull');
  if(existing)existing.remove();
  document.getElementById('btnMigraTcNull-desc')?.remove();
  if(count===0)return;
  const desc=document.createElement('div');
  desc.id='btnMigraTcNull-desc';
  desc.style.cssText='margin-top:8px;font-family:var(--mo);font-size:8px;color:var(--tx3);line-height:1.5';
  desc.textContent='Completa el tipo de cambio (tc/tcUsdt) en órdenes viejas guardadas sin TC: usa 1 si era ARS, o el TC cargado en el pago si era USD/USDT. No modifica montos ni totales, solo ese campo histórico.';
  cont.appendChild(desc);
  const btn=document.createElement('button');
  btn.id='btnMigraTcNull';
  btn.textContent='⚙ Migrar TC nulo ('+count+' órdenes)';
  btn.style.cssText='margin-top:6px;font-family:var(--mo);font-size:9px;padding:6px 14px;background:var(--wn);color:#000;border:none;cursor:pointer';
  btn.onclick=function(){
    const preview=window.migrarTcNull?.(true);
    if(!preview||!preview.cambios.length)return;
    const detalle=preview.cambios.map(c=>
      `• ${c.id} (${c.tipoPago}): tc ${c.before.tc??'null'} → ${c.after.tc} · tcUsdt ${c.before.tcUsdt??'null'} → ${c.after.tcUsdt}`
    ).join('\n');
    const msg=`⚙ MIGRAR TC NULO (${preview.cambios.length} órdenes)\n\nSe va a completar así:\n\n${detalle}\n\nNo se tocan montos ni totales, solo tc/tcUsdt.\n\n¿Confirmar?`;
    if(!confirm(msg))return;
    const r=window.migrarTcNull?.();
    if(r)sN('✓ TC migrado en '+r.migradas+' órdenes');
    btn.remove();
    document.getElementById('btnMigraTcNull-desc')?.remove();
  };
  cont.appendChild(btn);
}

function _renderMigracionLineasBtn(){
  const cont=document.getElementById('settingsMaintTools');
  if(!cont)return;
  // Conteo via dry-run — el filtro propio anterior solo miraba lineas sin nombre/emoji
  // e ignoraba órdenes que solo necesitaban costoTotal, subestimando el total real.
  const count=(window.migrarLineasYTotales?.(true)?.cambios||[]).length;
  const existing=document.getElementById('btnMigraLineas');
  if(existing)existing.remove();
  document.getElementById('btnMigraLineas-desc')?.remove();
  if(count===0)return;
  const desc=document.createElement('div');
  desc.id='btnMigraLineas-desc';
  desc.style.cssText='margin-top:8px;font-family:var(--mo);font-size:8px;color:var(--tx3);line-height:1.5';
  desc.textContent='Completa nombre/emoji faltante en el detalle de productos de órdenes viejas, buscando el producto actual por ID. También completa costoTotal en órdenes que no lo tenían, usando el campo legado costo. No cambia importes de venta.';
  cont.appendChild(desc);
  const btn=document.createElement('button');
  btn.id='btnMigraLineas';
  btn.textContent='⚙ Migrar detalle productos ('+count+' órdenes)';
  btn.style.cssText='margin-top:6px;font-family:var(--mo);font-size:9px;padding:6px 14px;background:var(--wn);color:#000;border:none;cursor:pointer';
  btn.onclick=function(){
    const preview=window.migrarLineasYTotales?.(true);
    if(!preview||!preview.cambios.length)return;
    const detalle=preview.cambios.map(c=>{
      const partes=[];
      c.lineas.forEach(l=>partes.push(`${l.prodId||'?'}: "${l.before.nombre||'—'}"/${l.before.emoji||'—'} → "${l.after.nombre||'—'}"/${l.after.emoji||'—'}`));
      if(c.costoTotal)partes.push(`costoTotal: null → ${c.costoTotal.after}`);
      return `• ${c.id}: ${partes.join(' · ')}`;
    }).join('\n');
    const msg=`⚙ MIGRAR DETALLE PRODUCTOS (${preview.cambios.length} órdenes)\n\nSe va a completar así:\n\n${detalle}\n\nNo se tocan importes de venta.\n\n¿Confirmar?`;
    if(!confirm(msg))return;
    const r=window.migrarLineasYTotales?.();
    if(r)sN('✓ Migradas: '+r.migradasLineas+' órdenes con productos, '+r.migradasTotales+' con costos');
    btn.remove();
    document.getElementById('btnMigraLineas-desc')?.remove();
  };
  cont.appendChild(btn);
}
