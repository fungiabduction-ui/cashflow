import { ld, sd, gO, gOConf, dO } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fv, fi, fu, hoy, d2s, d2m, mL, mLong, pn } from '../core/formatters.js';
import { nId } from '../core/ids.js';
import { getProductos } from './productos.js';
import { autoRegistrarContacto, normNombre } from './contactos.js';
import { moverStockEdicion } from './inventario.js';

let showTotalsRow = false;

export function sO(o){const d=ld();d.orders.push(o);const ok=sd(d);window.updateClientesDatalist?.();return ok;}

export function confirmarOrden(id){
  const d=ld();const o=(d.orders||[]).find(x=>x.id===id);if(!o)return false;
  o.estado='confirmada';o.fechaConfirmacion=new Date().toISOString();
  if(!sd(d))return false;
  window.rfM?.();rH();rS();window.renderDash?.();window.renderDashFlowChart?.();window.uhd?.();
  sN('✓ '+id+' — CONFIRMADA');
  return true;
}

export function anularByIdModal(){window.showInputModal?.('🟢 Anular Venta por ID','ID de la venta (ej: V-202603-0001):',true,'uppercase',function(raw){if(!raw)return;const id=raw.toUpperCase();const o=gO().find(x=>x.id===id);if(!o){sN(`${id} no encontrado`,true);return;}if(!confirm(`¿Anular ${id}?\n${o.fechaDisplay} — ${fv(o.totales?.totalGeneral||0)}`))return;dO(id);window.rfM?.();rH();rS();window.renderDash?.();sN(`${id} anulada`);window.uhd?.();window.clM?.();});}

export function rH(){
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
    const isActual=mes===mesActual||mes===f;
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
        montoDisplay=fv(o.totales?.totalGeneral||0);
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

export function toggleHistGrp(id){
  const el=document.getElementById(id);const arrow=document.getElementById(id+'-arrow');
  if(!el)return;
  const open=el.style.display==='none';
  el.style.display=open?'block':'none';
  if(arrow)arrow.textContent=open?'▾':'▸';
}

export function toggleTotals(){showTotalsRow=!showTotalsRow;rS();}

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

export function rS(){
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
    const t=o.totales||{};
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
      const tARS=arr.reduce((a,o)=>a+(o.totales?.totalGeneral||0),0);
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

export function bO(id){if(!confirm(`¿Eliminar venta ${id}?`))return;dO(id);window.rfM?.();rH();rS();window.renderDash?.();sN(`${id} eliminada`);window.uhd?.();}

export function confirLimpiar(){if(!confirm('¿Eliminar TODO el historial de ventas?'))return;const d=ld();d.orders=[];sd(d);window.rfM?.();rH();rS();window.renderDash?.();sN('Historial eliminado');window.uhd?.();}

// ── Texto del ticket y de auditoría a partir de la orden: los usan generarTicket() y la edición ──
// El cliente no va en el ticket (dato interno): queda en o.cliente y en la auditoría.
export function buildTicketText(o){
  const p=o.productos||{},t=o.totales||{},aj=o.ajuste||{ajusteNeto:t.ajusteNeto||0},pm=o.payment||{};
  const prods=getProductos();
  const unidad=l=>prods.find(x=>x.id===(l.varId||l.prodId))?.unit||'ud';
  const total=t.totalGeneral||0;
  let tk=`🧾 Orden de Venta: ${o.id}\n📅 Fecha: ${o.fechaDisplay}`;
  tk+=`\n\n🛒 Pedido\n\n`;
  const lns=(p._lineas||[]).filter(l=>l.prodId!=='__var').map(l=>`${l.emoji} ${l.qty} ${unidad(l)} × ${fv(l.precio)} = ${fv(l.subtotal)}`);
  if(p.variable>0)lns.push(`💲 ${fv(p.variable)}`);
  const ajTk=[];
  if(aj.tipo==='libre'&&aj.libreTotal>0)ajTk.push(`✏️ Total libre: ${fv(aj.libreTotal)}`);
  else{
    if(aj.recargoPctMonto>0)ajTk.push(`📈 Recargo ${aj.recargoPct}%: +${fv(aj.recargoPctMonto)}`);
    if(aj.recargoFijoMonto>0)ajTk.push(`📈 Recargo fijo: +${fv(aj.recargoFijoMonto)}`);
    if(aj.descPctMonto>0)ajTk.push(`📉 Descuento ${aj.descPct}%: -${fv(aj.descPctMonto)}`);
    if(aj.descFijoMonto>0)ajTk.push(`📉 Descuento fijo: -${fv(aj.descFijoMonto)}`);
  }
  let tkLineas=lns.join('\n');
  if(ajTk.length)tkLineas+=`\n\n${ajTk.join('\n')}\n━━━━━━━━━━━━━━━━━━━━━`;
  tk+=tkLineas+`\n\n💰 Total: ${fv(total)} ARS`;
  if(aj.ajusteNeto)tk+=`\n   (subtotal ${fv(t.subtotalBruto??total)} ${aj.ajusteNeto>0?'+':'-'} ajuste ${fv(Math.abs(aj.ajusteNeto))})`;
  if(o.tipoPago==='USD')tk+=`\n💵 Total USD: ${fu(pm.usd||0)} (TC ${fi(pm.tc_usd||0)})`;
  if(o.tipoPago==='USDT')tk+=`\n🔵 Total USDT: ${fu(pm.usdt||0)} (TC ${fi(pm.tc_usdt||0)})`;
  if(o.tipoPago==='MIX'){
    const parts=[];
    if(pm.ars>0)parts.push(`ARS ${fv(pm.ars)}`);
    if(pm.usd>0)parts.push(`USD ${fu(pm.usd)}`);
    if(pm.usdt>0)parts.push(`USDT ${fu(pm.usdt)}`);
    if(parts.length)tk+=`\n💳 Pago: ${parts.join(' + ')}`;
    if(pm.total_usdt!=null)tk+=` ≈ ${fu(pm.total_usdt)} USDT`;
  }
  if(o.nota)tk+=`\n📝 Nota: ${o.nota}`;
  return tk;
}
export function buildAuditText(o){
  const t=o.totales||{},total=t.totalGeneral||0,aj=t.ajusteNeto??o.ajuste?.ajusteNeto??0;
  return`--- AUDITORÍA ---\nSubtotal: ${fv(t.subtotalBruto??total)} | Ajuste: ${aj>=0?'+':''}${fv(aj)} | Total: ${fv(total)} | Pago: ${o.payment?.modo||o.tipoPago||'ARS'} | Costo: ${fv(o.costo||0)} | Margen: ${o.margen}% | ID: ${o.id}${o.cliente?` | Cliente: ${o.cliente}`:''}`;
}

// ── EDICIÓN DE VENTAS ──
function escV(s){return String(s??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// Líneas editables: _lineas (formato nuevo) o campos legacy. «Variable» va aparte (productos.variable).
function lineasDeOrden(o){
  const p=o.productos||{};
  if(p._lineas?.length)return p._lineas.filter(l=>l.prodId!=='__var').map(l=>({prodId:l.prodId,varId:l.varId||null,nombre:l.nombre||'',emoji:l.emoji||'',qty:l.qty||0,precio:l.precio||0,subtotal:l.subtotal??(l.qty||0)*(l.precio||0),costo:l.costo}));
  const catalog=getProductos();
  const precioCat=id=>catalog.find(x=>x.id===id)?.tramos?.[0]?.p||0;
  const out=[],pastPrice=p.precioPastilla||precioCat('p-past');
  [['calaveras','v-cal','💀','Calaveras'],['teddy','v-ted','🧸','Teddy'],['lucky','v-lck','🐱','Lucky Cat'],['genericas','v-gen','💊','Genéricas']].forEach(([k,varId,emoji,nombre])=>{
    if((p[k]||0)>0)out.push({prodId:'p-past',varId,nombre,emoji,qty:p[k],precio:pastPrice,subtotal:p[k]*pastPrice});
  });
  [['cristales','p-cris','💎','Cristales','precioCristales'],['hongos','p-hong','🍄','Hongos','precioHongos'],['goteros','p-got','💧','Goteros',null],['petri','p-pet','🧫','Petri',null]].forEach(([k,prodId,emoji,nombre,pf])=>{
    const qty=p[k]||0;if(!qty)return;const precio=(pf&&p[pf])||precioCat(prodId);
    out.push({prodId,varId:null,nombre,emoji,qty,precio,subtotal:qty*precio});
  });
  return out;
}

// Lee el modal: líneas, variable y total con el mismo cálculo que el ticket (calc()): subtotal ± ajuste original.
function leerEdicion(o,ed){
  const num=id=>parseFloat(document.getElementById(id)?.value)||0;
  const lineas=ed.lineas.map((l,i)=>({...l,q:Math.max(0,num('edit-qty-'+i)),p:num('edit-prc-'+i)}));
  const variable=Math.max(0,num('edit-var'));
  const subtotal=lineas.reduce((a,l)=>a+l.q*l.p,0)+variable;
  const cambio=variable!==ed.variable0||lineas.some(l=>l.q!==l.qty||l.p!==l.precio);
  const total0=o.totales?.totalGeneral||0;
  if(!cambio)return{cambio,lineas,variable,subtotal,ajuste:o.ajuste,total:total0};
  const aj=o.ajuste;
  if(aj?.tipo==='libre'){const total=aj.libreTotal||subtotal;return{cambio,lineas,variable,subtotal,ajuste:{...aj,ajusteNeto:total-subtotal},total};}
  if(aj){
    const rp=subtotal*((aj.recargoPct||0)/100),dp=subtotal*((aj.descPct||0)/100),neto=rp+(aj.recargoFijo||0)-dp-(aj.descFijo||0);
    return{cambio,lineas,variable,subtotal,ajuste:{...aj,recargoPctMonto:rp,descPctMonto:dp,ajusteNeto:neto},total:subtotal+neto};
  }
  // Sin detalle de ajuste (órdenes viejas): se conserva la diferencia original entre total y subtotal
  const sub0=ed.lineas.reduce((a,l)=>a+l.subtotal,0)+ed.variable0;
  return{cambio,lineas,variable,subtotal,ajuste:null,total:subtotal+(total0-sub0)};
}

// Composición del pago con los TC de la orden (mismo criterio que getPayment() del ticket)
function pagoEdicion(modo,total,tcUsd,tcUsdt,mix){
  if(modo==='USD'){const usd=parseFloat((total/tcUsd).toFixed(2));return{ars:0,usd,usdt:0,tc:tcUsd,tc_usd:tcUsd,tc_usdt:tcUsdt,total_ars:Math.round(usd*tcUsd),total_usdt:null,modo};}
  if(modo==='USDT'){const usdt=parseFloat((total/tcUsdt).toFixed(2));return{ars:0,usd:0,usdt,tc:tcUsdt,tc_usd:tcUsd,tc_usdt:tcUsdt,total_ars:Math.round(usdt*tcUsdt),total_usdt:usdt,modo};}
  if(modo==='MIX'){const ta=Math.round(mix.ars+mix.usd*tcUsd+mix.usdt*tcUsdt);return{ars:mix.ars,usd:mix.usd,usdt:mix.usdt,tc:0,tc_usd:tcUsd,tc_usdt:tcUsdt,total_ars:ta,total_usdt:tcUsdt>0?parseFloat((ta/tcUsdt).toFixed(2)):null,modo};}
  return{ars:total,usd:0,usdt:0,tc:0,tc_usd:0,tc_usdt:0,total_ars:total,total_usdt:null,modo:'ARS'};
}

export function openEditVenta(id){
  const o=ld().orders.find(x=>x.id===id);if(!o)return;
  const pm=o.payment||{};
  const modo0=pm.modo||o.tipoPago||'ARS';
  const total0=o.totales?.totalGeneral||0;
  // TC de la orden, nunca el del día (ese solo como placeholder)
  const tcUsd0=pm.tc_usd||(o.tipoPago==='USD'&&o.tc>1?o.tc:0);
  const tcUsdt0=pm.tc_usdt||(o.tipoPago==='USDT'&&o.tc>1?o.tc:0);
  const mix0=modo0==='MIX'?{ars:pm.ars||0,usd:pm.usd||0,usdt:pm.usdt||0}
    :{ars:modo0==='ARS'?total0:0,usd:modo0==='USD'?(pm.usd||0):0,usdt:modo0==='USDT'?(pm.usdt||0):0};
  const lineas=lineasDeOrden(o),variable0=o.productos?.variable||0;
  window._editVenta={id,o,lineas,variable0,tcUsd0,tcUsdt0,mix0};
  const IS='width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none';
  const LB='font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase';
  const NI=`${IS};min-height:30px;padding:3px 6px;font-size:12px`;
  const vis=(on,disp='block')=>`display:${on?disp:'none'}`;
  document.getElementById('mTitEl').textContent='EDIT — '+id;
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal modal-wide';
  document.getElementById('mTk').style.display='none';
  const catalog=getProductos();
  const filas=lineas.map((l,i)=>{const prod=catalog.find(x=>x.id===(l.varId||l.prodId));return`
      <div style="display:grid;grid-template-columns:1fr 80px 95px;gap:6px;align-items:center;margin-bottom:5px;padding:6px;background:var(--s2);border:1px solid var(--br)">
        <div style="font-family:var(--mo);font-size:10px;color:var(--tx)">${escV(l.emoji||prod?.emoji||'📦')} ${escV(l.nombre||prod?.nombre||l.varId||l.prodId)}</div>
        <input type="number" style="${NI};text-align:center" placeholder="qty" value="${l.qty}" id="edit-qty-${i}" oninput="editRecalcTotal()">
        <input type="number" style="${NI};text-align:right" placeholder="$ ARS" value="${l.precio}" id="edit-prc-${i}" oninput="editRecalcTotal()">
      </div>`;}).join('');
  const ajN=o.totales?.ajusteNeto||0;
  const ajInfo=(o.ajuste?.tipo==='libre'?'Total libre. ':ajN?`Incluye ajuste ${ajN>0?'+':'-'}${fv(Math.abs(ajN))}. `:'')+'Si lo cambiás a mano queda como total libre.';
  document.getElementById('mBody').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div><label style="${LB}">Fecha</label><input type="date" id="edit-fecha" value="${escV(o.fecha)}" style="${IS}"></div>
      <div><label style="${LB}">Cliente</label><input type="text" id="edit-cliente" value="${escV(o.cliente)}" placeholder="opcional" list="clientes-list" style="${IS}"></div>
      <div style="grid-column:1/-1"><label style="${LB}">Nota</label><input type="text" id="edit-nota" value="${escV(o.nota)}" placeholder="opcional" style="${IS}"></div>
    </div>
    <div style="margin-bottom:10px">
      <div style="font-family:var(--mo);font-size:8px;color:var(--ac);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Productos · Cantidad · Precio (ARS)</div>
      ${filas||'<div style="font-family:var(--mo);font-size:9px;color:var(--tx3);padding:8px">Sin productos detectados</div>'}
      <div style="display:grid;grid-template-columns:1fr 181px;gap:6px;align-items:center;padding:6px;background:var(--s2);border:1px solid var(--br)">
        <div style="font-family:var(--mo);font-size:10px;color:var(--tx)">💲 Variable</div>
        <input type="number" style="${NI};text-align:right" value="${variable0}" id="edit-var" oninput="editRecalcTotal()">
      </div>
    </div>
    <div style="margin-bottom:10px"><label style="${LB}">Total ARS</label>
      <input type="number" id="edit-total-ars" value="${total0}" oninput="editUpdateEquiv()" style="${IS}">
      <div style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-top:4px">${escV(ajInfo)}</div>
    </div>
    <div style="background:var(--s2);border:1px solid var(--br);padding:10px">
      <div style="font-family:var(--mo);font-size:8px;color:var(--tx2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px">Modo de pago</div>
      <div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap">
        ${['ARS','USD','USDT','MIX'].map(m=>`<button class="tgb ${modo0===m?'active':''}" id="em-btn${m}" onclick="editSetMode('${m}')" style="font-size:9px;min-height:28px;flex:1">${m}</button>`).join('')}
      </div>
      <input type="hidden" id="edit-modo" value="${escV(modo0)}">
      <div id="em-mix" style="${vis(modo0==='MIX','grid')};grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px">
        <div><label style="${LB}">ARS</label><input type="number" id="edit-mix-ars" value="${mix0.ars}" oninput="editUpdateEquiv()" style="${IS}"></div>
        <div><label style="${LB}">USD</label><input type="number" id="edit-mix-usd" value="${mix0.usd}" oninput="editUpdateEquiv()" style="${IS}"></div>
        <div><label style="${LB}">USDT</label><input type="number" id="edit-mix-usdt" value="${mix0.usdt}" oninput="editUpdateEquiv()" style="${IS}"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div id="em-tcusd" style="${vis(modo0==='USD'||modo0==='MIX')}"><label style="${LB}">TC ARS/USD</label><input type="number" id="edit-tc-usd" value="${tcUsd0||''}" placeholder="${window._blueARS?'hoy '+window._blueARS:'ej: 1400'}" oninput="editUpdateEquiv()" style="${IS}"></div>
        <div id="em-tcusdt" style="${vis(modo0==='USDT'||modo0==='MIX')}"><label style="${LB}">TC ARS/USDT</label><input type="number" id="edit-tc-usdt" value="${tcUsdt0||''}" placeholder="${window._usdtARS?'hoy '+window._usdtARS:'ej: 1450'}" oninput="editUpdateEquiv()" style="${IS}"></div>
      </div>
      <div id="edit-eq" style="font-family:var(--mo);font-size:10px;color:var(--wn);margin-top:6px"></div>
    </div>`;
  document.getElementById('mFooter').innerHTML=`<button class="btn btn-p" onclick="saveEditVenta('${id}')">💾 Guardar</button><button class="btn btn-s" onclick="clM()">✕ Cancelar</button>`;
  document.getElementById('modal').classList.add('open');
  editUpdateEquiv();
}

export function editRecalcTotal(){
  const ed=window._editVenta;if(!ed)return;
  const el=document.getElementById('edit-total-ars');
  if(el)el.value=String(Math.round(leerEdicion(ed.o,ed).total*100)/100);
  editUpdateEquiv();
}

export function editUpdateEquiv(){
  const el=document.getElementById('edit-eq');if(!el)return;
  const num=id=>parseFloat(document.getElementById(id)?.value)||0;
  const m=document.getElementById('edit-modo')?.value||'ARS',total=num('edit-total-ars'),tcU=num('edit-tc-usd'),tcT=num('edit-tc-usdt');
  if(m==='USD')el.textContent=tcU>0?`≈ ${fu(total/tcU)} USD`:'';
  else if(m==='USDT')el.textContent=tcT>0?`≈ ${fu(total/tcT)} USDT`:'';
  else if(m==='MIX')el.textContent=`Pago: ${fv(num('edit-mix-ars')+num('edit-mix-usd')*tcU+num('edit-mix-usdt')*tcT)} · total ${fv(total)}`;
  else el.textContent='';
}

export function editSetMode(m){
  document.getElementById('edit-modo').value=m;
  ['ARS','USD','USDT','MIX'].forEach(x=>document.getElementById('em-btn'+x)?.classList.toggle('active',x===m));
  const show=(id,on,disp='block')=>{const el=document.getElementById(id);if(el)el.style.display=on?disp:'none';};
  show('em-mix',m==='MIX','grid');show('em-tcusd',m==='USD'||m==='MIX');show('em-tcusdt',m==='USDT'||m==='MIX');
  editUpdateEquiv();
}

export function saveEditVenta(id){
  const ed=window._editVenta;if(!ed||ed.id!==id)return;
  const val=k=>String(document.getElementById(k)?.value??'');
  const num=k=>parseFloat(val(k))||0;
  const modo=val('edit-modo')||'ARS';
  const tcUsd=num('edit-tc-usd'),tcUsdt=num('edit-tc-usdt');
  const mix={ars:num('edit-mix-ars'),usd:num('edit-mix-usd'),usdt:num('edit-mix-usdt')};
  if((modo==='USD'||(modo==='MIX'&&mix.usd>0))&&!(tcUsd>0)){sN('Ingresá el TC ARS/USD',true);return;}
  if((modo==='USDT'||(modo==='MIX'&&mix.usdt>0))&&!(tcUsdt>0)){sN('Ingresá el TC ARS/USDT',true);return;}
  const r0=leerEdicion(ed.o,ed);
  if(!r0.lineas.some(l=>l.q>0)&&!r0.variable){sN('La venta no puede quedar sin productos',true);return;}
  const cli=val('edit-cliente').trim(),nota=val('edit-nota').trim(),fecha=val('edit-fecha');
  // Cliente distinto: se registra antes de leer d (autoRegistrarContacto guarda solo, como en generarTicket;
  // leer d después evita pisar el contacto nuevo)
  const cambiaContacto=normNombre(cli)!==normNombre(ed.o.cliente||'');
  const clienteId=cambiaContacto?(autoRegistrarContacto(cli,fecha||ed.o.fecha)||null):null;
  const d=ld();const idx=(d.orders||[]).findIndex(x=>x.id===id);if(idx<0)return;
  const o0=d.orders[idx],o=JSON.parse(JSON.stringify(o0));
  const total0=o0.totales?.totalGeneral||0;

  if(fecha&&fecha!==o.fecha){o.fecha=fecha;o.fechaDisplay=d2s(fecha);o.mesActual=d2m(fecha);}
  if(cli!==(o.cliente||'').trim()){o.cliente=cli||null;if(cambiaContacto)o.clienteId=clienteId;}
  if(nota!==(o.nota||'').trim())o.nota=nota||null;

  // Productos, costo y stock: solo si cambió alguna línea o la variable
  const r=leerEdicion(o0,ed);
  const deltas=[];
  if(r.cambio){
    const subL=ed.lineas.reduce((a,l)=>a+l.subtotal,0);
    const nuevas=[];
    r.lineas.forEach(l=>{
      // costo de la línea: el guardado o, en órdenes viejas, o.costo prorrateado por subtotal; escala con la cantidad
      const c0=l.costo!=null?l.costo:(subL>0?(o0.costo||0)*l.subtotal/subL:0);
      if(l.q>0)nuevas.push({prodId:l.prodId,varId:l.varId,nombre:l.nombre,emoji:l.emoji,qty:l.q,precio:l.p,subtotal:l.q*l.p,costo:Math.round(l.q===l.qty?c0:c0*l.q/l.qty)});
      const key=l.varId||l.prodId;
      if(l.q!==l.qty&&key!=='p-past')deltas.push({key,prodId:l.prodId,varId:l.varId,nombre:l.nombre,emoji:l.emoji,delta:l.q-l.qty});
    });
    const q=f=>nuevas.filter(f).reduce((a,l)=>a+l.qty,0),s=f=>nuevas.filter(f).reduce((a,l)=>a+l.subtotal,0);
    const es=(...ids)=>l=>ids.includes(l.varId)||ids.includes(l.prodId);
    const PAST=['v-cal','v-ted','v-lck','v-gen'];
    const p={...o.productos,_lineas:nuevas,variable:r.variable,
      calaveras:q(es('v-cal')),teddy:q(es('v-ted')),lucky:q(es('v-lck')),genericas:q(es('v-gen')),
      totalPastillas:q(es(...PAST)),totalPastillasLinea:s(es(...PAST)),
      cristales:q(es('p-cris')),totalCristales:s(es('p-cris')),hongos:q(es('p-hong')),totalHongos:s(es('p-hong')),
      goteros:q(es('p-got')),totalGoteros:s(es('p-got')),petri:q(es('p-pet')),totalPetri:s(es('p-pet'))};
    o.productos=p;
    o.totales={...o.totales,totalPastillasLinea:p.totalPastillasLinea,totalCristales:p.totalCristales,totalHongos:p.totalHongos,totalGoteros:p.totalGoteros,totalPetri:p.totalPetri};
    if(r.lineas.some(l=>l.q!==l.qty)){const costo=nuevas.reduce((a,l)=>a+l.costo,0);o.costo=costo;o.totales.costoTotal=costo;}
  }

  // Total: el calculado como el ticket; si el usuario lo escribió a mano, queda como ajuste libre
  const tIn=parseFloat(val('edit-total-ars'));
  const manual=!isNaN(tIn)&&Math.abs(tIn-r.total)>0.01;
  const total=manual?tIn:r.total;
  const ajuste=manual?{recargoPct:0,recargoFijo:0,descPct:0,descFijo:0,recargoPctMonto:0,recargoFijoMonto:0,descPctMonto:0,descFijoMonto:0,ajusteNeto:tIn-r.subtotal,libreTotal:tIn,tipo:'libre'}:r.ajuste;
  if(r.cambio||manual){
    o.totales={...o.totales,totalGeneral:total,subtotalBruto:r.subtotal,ajusteNeto:total-r.subtotal};
    if(ajuste)o.ajuste=ajuste;
  }
  if(total!==total0||o.costo!==o0.costo)o.margen=total>0?parseFloat(((total-(o.costo||0))/total*100).toFixed(1)):0;

  // Pago: se conservan payment y TC salvo que cambie el modo, un TC, el desglose MIX o el total (fuera de MIX)
  const modo0=o0.payment?.modo||o0.tipoPago||'ARS';
  const tcCambio=((modo==='USD'||modo==='MIX')&&tcUsd!==ed.tcUsd0)||((modo==='USDT'||modo==='MIX')&&tcUsdt!==ed.tcUsdt0);
  const mixCambio=modo==='MIX'&&(mix.ars!==ed.mix0.ars||mix.usd!==ed.mix0.usd||mix.usdt!==ed.mix0.usdt);
  if(modo!==modo0||tcCambio||mixCambio||(modo!=='MIX'&&total!==total0)){
    const pago=pagoEdicion(modo,total,tcUsd,tcUsdt,mix);
    o.payment=pago;o.tipoPago=modo;
    if(modo!==modo0||tcCambio){o.tc=modo==='ARS'?1:(pago.tc_usd||pago.tc_usdt||null);o.tcUsdt=pago.tc_usdt||1;}
    o.totales={...o.totales,totalUSDT:pago.total_usdt,totalUSD:pago.usd||null,payment:pago};
  }

  if(JSON.stringify(o)===JSON.stringify(o0)){window.clM?.();sN('Sin cambios');delete window._editVenta;return;}
  o.ticketText=buildTicketText(o);
  const ediciones=(o0.auditText||'').split('\n').filter(l=>l.startsWith('✏ Editada'));
  o.auditText=[buildAuditText(o),...ediciones,`✏ Editada ${d2s(hoy())}: total ${fv(total0)} → ${fv(total)}`].join('\n');
  d.orders[idx]=o;
  moverStockEdicion(d,deltas,id);          // stock plano + lotes + movimientos, en el mismo d
  if(!sd(d))return;                        // un solo guardado; si falla, el modal queda abierto con lo editado
  window.rfM?.();rH();rS();window.renderDash?.();window.clM?.();sN(`✓ ${id} actualizada`);window.uhd?.();window.updateClientesDatalist?.();
  delete window._editVenta;
}
