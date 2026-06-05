import { ld, sd, gO, gOConf, dO } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fv, fi, fu, hoy, d2s, d2m, mL, mLong, pn } from '../core/formatters.js';
import { nId } from '../core/ids.js';
import { ghAutoPush } from './github.js';
import { getProductos } from './productos.js';

let showTotalsRow = false;

export function sO(o){const d=ld();d.orders.push(o);sd(d);ghAutoPush();window.updateClientesDatalist?.();}

export function confirmarOrden(id){
  const d=ld();const o=(d.orders||[]).find(x=>x.id===id);if(!o)return;
  o.estado='confirmada';o.fechaConfirmacion=new Date().toISOString();
  sd(d);ghAutoPush();window.rfM?.();rH();rS();window.renderDash?.();window.renderDashFlowChart?.();window.uhd?.();
  sN('✓ '+id+' — CONFIRMADA');
}

export function anularByIdModal(){window.showInputModal?.('🟢 Anular Venta por ID','ID de la venta (ej: V-202603-0001):',true,'uppercase',function(raw){if(!raw)return;const id=raw.toUpperCase();const o=gO().find(x=>x.id===id);if(!o){sN(`${id} no encontrado`,true);return;}if(!confirm(`¿Anular ${id}?\n${o.fechaDisplay} — ${fv(o.totales.totalGeneral)}`))return;dO(id);window.rfM?.();rH();rS();window.renderDash?.();sN(`${id} anulada`);window.uhd?.();window.clM?.();});}

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
    const isActual=mes===mesActual;
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
        montoDisplay=fv(o.totales.totalGeneral);
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
    const t=o.totales;
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
      const tARS=arr.reduce((a,o)=>a+(o.totales.totalGeneral||0),0);
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

export function openEditVenta(id){
  const d=ld();const o=d.orders.find(x=>x.id===id);if(!o)return;
  const pm=o.payment||{ars:o.totales?.totalGeneral||0,usd:0,usdt:o.totales?.totalUSDT||0,tc_usd:0,tc_usdt:o.tc||0,modo:o.tipoPago||'ARS'};
  const IS='width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none';
  const LB='font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase';
  document.getElementById('mTitEl').textContent='EDIT — '+id;
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal modal-wide';
  document.getElementById('mTk').style.display='none';

  const catalog=getProductos();
  let editLineas=[];

  if(o.productos?._lineas&&o.productos._lineas.length){
    editLineas=o.productos._lineas.map(ln=>{
      const prod=catalog.find(p=>p.id===(ln.varId||ln.prodId)||p.id===ln.prodId);
      const nombre=prod?prod.nombre:(ln.varId||ln.prodId);
      const emoji=prod?prod.emoji:'📦';
      return{key:ln.varId||ln.prodId,prodId:ln.prodId,varId:ln.varId||null,nombre,emoji,qty:ln.qty,precio:ln.precio||0};
    });
  } else {
    const p=o.productos||{};
    const pastProd=catalog.find(x=>x.id==='p-past');
    const pastPrice=o.productos?.precioPastilla||pastProd?.tramos?.[0]?.p||0;
    const varMap={calaveras:'v-cal',teddy:'v-ted',lucky:'v-lck',genericas:'v-gen'};
    const varEmoji={calaveras:'💀',teddy:'🧸',lucky:'🐱',genericas:'💊'};
    const varName={calaveras:'Calaveras',teddy:'Teddy',lucky:'Lucky Cat',genericas:'Genéricas'};
    ['calaveras','teddy','lucky','genericas'].forEach(k=>{
      if((p[k]||0)>0) editLineas.push({key:'p-past-'+varMap[k],prodId:'p-past',varId:varMap[k],nombre:varName[k],emoji:varEmoji[k],qty:p[k],precio:pastPrice});
    });
    const legMap=[
      {key:'cristales',prodId:'p-cris',emoji:'💎',nombre:'Cristales',qtyField:'cristales',priceField:'precioCristales'},
      {key:'hongos',   prodId:'p-hong',emoji:'🍄',nombre:'Hongos',   qtyField:'hongos',   priceField:'precioHongos'},
      {key:'goteros',  prodId:'p-got', emoji:'💧',nombre:'Goteros',  qtyField:'goteros',  priceField:null},
      {key:'petri',    prodId:'p-pet', emoji:'🧫',nombre:'Petri',    qtyField:'petri',    priceField:null},
    ];
    legMap.forEach(({key,prodId,emoji,nombre,qtyField,priceField})=>{
      const qty=p[qtyField]||0;if(!qty)return;
      const prod=catalog.find(x=>x.id===prodId);
      const precio=(priceField&&p[priceField])||prod?.tramos?.[0]?.p||0;
      editLineas.push({key,prodId,varId:null,nombre,emoji,qty,precio});
    });
    if((p.variable||0)>0) editLineas.push({key:'variable',prodId:'__var',varId:null,nombre:'Variable',emoji:'💲',qty:1,precio:p.variable});
  }

  const prodRows=editLineas.length
    ? editLineas.map(ln=>`
      <div style="display:grid;grid-template-columns:1fr 80px 95px;gap:6px;align-items:center;margin-bottom:5px;padding:6px;background:var(--s2);border:1px solid var(--br)">
        <div style="font-family:var(--mo);font-size:10px;color:var(--tx)">${ln.emoji} ${ln.nombre}</div>
        <input type="number" style="${IS};min-height:30px;padding:3px 6px;font-size:12px;text-align:center" placeholder="qty" value="${ln.qty}" id="edit-qty-${ln.key}">
        <input type="number" style="${IS};min-height:30px;padding:3px 6px;font-size:12px;text-align:right" placeholder="$ ARS" value="${ln.precio}" id="edit-prc-${ln.key}">
      </div>`).join('')
    : `<div style="font-family:var(--mo);font-size:9px;color:var(--tx3);padding:8px">Sin productos detectados</div>`;

  const modoActual=pm.modo||'ARS';
  // Calcular equivalentes USD para mostrar
  const tcUsdVal=pm.tc_usd||0;
  const tcUsdtVal=pm.tc_usdt||o.tc||0;
  const eqUsd=tcUsdVal>0?(o.totales?.totalGeneral||0)/tcUsdVal:0;
  const eqUsdt=tcUsdtVal>0?(o.totales?.totalGeneral||0)/tcUsdtVal:0;

  document.getElementById('mBody').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div><label style="${LB}">Fecha</label><input type="date" id="edit-fecha" value="${o.fecha}" style="${IS}"></div>
      <div><label style="${LB}">Cliente</label><input type="text" id="edit-cliente" value="${o.cliente||''}" placeholder="opcional" style="${IS}"></div>
      <div style="grid-column:1/-1"><label style="${LB}">Nota</label><input type="text" id="edit-nota" value="${o.nota||''}" placeholder="opcional" style="${IS}"></div>
    </div>
    <div style="margin-bottom:10px">
      <div style="font-family:var(--mo);font-size:8px;color:var(--ac);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Productos · Cantidad · Precio (ARS)</div>
      ${prodRows}
      <button onclick="editRecalcTotal()" style="margin-top:8px;background:var(--s2);border:1px solid var(--br);color:var(--ac);font-family:var(--mo);font-size:9px;padding:6px 12px;cursor:pointer">⟳ Recalcular total</button>
    </div>
    <div style="background:var(--s2);border:1px solid var(--br);padding:10px">
      <div style="font-family:var(--mo);font-size:8px;color:var(--tx2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px">Modo de pago</div>
      <div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap">
        <button class="tgb ${modoActual==='ARS' ?'active':''}" id="em-btnARS"  onclick="editSetMode('ARS')"  style="font-size:9px;min-height:28px;flex:1">ARS</button>
        <button class="tgb ${modoActual==='USD' ?'active':''}" id="em-btnUSD"  onclick="editSetMode('USD')"  style="font-size:9px;min-height:28px;flex:1">USD</button>
        <button class="tgb ${modoActual==='USDT'?'active':''}" id="em-btnUSDT" onclick="editSetMode('USDT')" style="font-size:9px;min-height:28px;flex:1">USDT</button>
      </div>
      <input type="hidden" id="edit-modo" value="${modoActual}">
      <div id="em-ars" style="display:${modoActual==='ARS'?'block':'none'}">
        <label style="${LB}">Total ARS</label>
        <input type="number" id="edit-total-ars" value="${o.totales?.totalGeneral||0}" style="${IS}">
      </div>
      <div id="em-usd" style="display:${modoActual==='USD'?'block':'none'}">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div><label style="${LB}">TC ARS/USD</label><input type="number" id="edit-tc-usd" value="${tcUsdVal||window._blueARS||''}" placeholder="ej: 1400" style="${IS}"></div>
          <div><label style="${LB}">Equivalente USD</label><input type="text" id="edit-eq-usd" value="${fu(eqUsd)}" style="${IS};background:var(--s3);color:var(--wn)" readonly></div>
        </div>
        <div style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-top:6px">Total en ARS se calcula desde productos</div>
      </div>
      <div id="em-usdt" style="display:${modoActual==='USDT'?'block':'none'}">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div><label style="${LB}">TC ARS/USDT</label><input type="number" id="edit-tc-usdt" value="${tcUsdtVal||window._usdtARS||''}" placeholder="ej: 1450" style="${IS}"></div>
          <div><label style="${LB}">Equivalente USDT</label><input type="text" id="edit-eq-usdt" value="${fu(eqUsdt)}" style="${IS};background:var(--s3);color:var(--wn)" readonly></div>
        </div>
        <div style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-top:6px">Total en ARS se calcula desde productos</div>
      </div>
    </div>`;
  document.getElementById('mFooter').innerHTML=`<button class="btn btn-p" onclick="saveEditVenta('${id}')">💾 Guardar</button><button class="btn btn-s" onclick="clM()">✕ Cancelar</button>`;
  document.getElementById('modal').classList.add('open');
  window._editLineas=editLineas;
}

export function editRecalcTotal(){
  const editLineas=window._editLineas||[];
  let sum=0;
  editLineas.forEach(ln=>{
    const qEl=document.getElementById('edit-qty-'+ln.key);
    const pEl=document.getElementById('edit-prc-'+ln.key);
    if(qEl&&pEl){
      const q=Math.max(0,parseFloat(qEl.value)||0);
      const p=parseFloat(pEl.value)||0;
      sum+=q*p;
    }
  });
  document.getElementById('edit-total-ars').value=Math.round(sum);
  editUpdateEquiv();
}

export function editUpdateEquiv(){
  const totalARS=parseFloat(document.getElementById('edit-total-ars')?.value)||0;
  const tcUsd=parseFloat(document.getElementById('edit-tc-usd')?.value)||0;
  const tcUsdt=parseFloat(document.getElementById('edit-tc-usdt')?.value)||0;
  const eqUsd=tcUsd>0?(totalARS/tcUsd).toFixed(2):0;
  const eqUsdt=tcUsdt>0?(totalARS/tcUsdt).toFixed(2):0;
  const eqUsdEl=document.getElementById('edit-eq-usd');
  const eqUsdtEl=document.getElementById('edit-eq-usdt');
  if(eqUsdEl)eqUsdEl.value=fu(eqUsd);
  if(eqUsdtEl)eqUsdtEl.value=fu(eqUsdt);
}

export function editSetMode(m){
  document.getElementById('edit-modo').value=m;
  ['ARS','USD','USDT'].forEach(x=>{const b=document.getElementById('em-btn'+x);if(b)b.classList.toggle('active',x===m);});
  ['ars','usd','usdt'].forEach(x=>{const el=document.getElementById('em-'+x);if(el)el.style.display=x===m.toLowerCase()?'block':'none';});
}

export function saveEditVenta(id){
  const d=ld();const idx=d.orders.findIndex(x=>x.id===id);if(idx<0)return;
  const o=d.orders[idx];
  const nuevaFecha=document.getElementById('edit-fecha').value;
  const nuevoCliente=document.getElementById('edit-cliente').value.trim();
  const nuevaNota=document.getElementById('edit-nota').value.trim();
  const modo=document.getElementById('edit-modo')?.value||'ARS';

  // Recalcular total desde líneas editadas
  const editLineas=window._editLineas||[];
  let nuevoTotal=parseFloat(document.getElementById('edit-total-ars')?.value)||0;
  const newLineas=[];
  if(editLineas.length){
    let sum=0;
    editLineas.forEach(ln=>{
      const qEl=document.getElementById('edit-qty-'+ln.key);
      const pEl=document.getElementById('edit-prc-'+ln.key);
      const q=qEl?Math.max(0,parseFloat(qEl.value)||0):ln.qty;
      const p=pEl?parseFloat(pEl.value)||0:ln.precio;
      if(q>0) newLineas.push({prodId:ln.prodId,varId:ln.varId,qty:q,precio:p,subtotal:q*p});
      sum+=q*p;
    });
    if(sum>0) nuevoTotal=sum;
    if(!o.productos) o.productos={};
    o.productos._lineas=newLineas;
  }

  // Recalcular campos legacy para compatibilidad
  const p=o.productos;
  if(p&&p._lineas){
    p.calaveras=p._lineas.filter(l=>l.varId==='v-cal'||l.prodId==='v-cal').reduce((a,l)=>a+(l.qty||0),0);
    p.teddy=p._lineas.filter(l=>l.varId==='v-ted'||l.prodId==='v-ted').reduce((a,l)=>a+(l.qty||0),0);
    p.lucky=p._lineas.filter(l=>l.varId==='v-lck'||l.prodId==='v-lck').reduce((a,l)=>a+(l.qty||0),0);
    p.genericas=p._lineas.filter(l=>l.varId==='v-gen'||l.prodId==='v-gen').reduce((a,l)=>a+(l.qty||0),0);
    p.cristales=p._lineas.filter(l=>l.prodId==='p-cris').reduce((a,l)=>a+(l.qty||0),0);
    p.hongos=p._lineas.filter(l=>l.prodId==='p-hong').reduce((a,l)=>a+(l.qty||0),0);
    p.goteros=p._lineas.filter(l=>l.prodId==='p-got').reduce((a,l)=>a+(l.qty||0),0);
    p.petri=p._lineas.filter(l=>l.prodId==='p-pet').reduce((a,l)=>a+(l.qty||0),0);
    p.variable=p._lineas.filter(l=>l.prodId==='__var').reduce((a,l)=>a+(l.subtotal||0),0);
    p.totalPastillas=p.calaveras+p.teddy+p.lucky+p.genericas;
    p.totalPastillasLinea=newLineas.filter(l=>l.prodId==='p-past').reduce((a,l)=>a+(l.subtotal||0),0);
    p.totalCristales=newLineas.filter(l=>l.prodId==='p-cris').reduce((a,l)=>a+(l.subtotal||0),0);
    p.totalHongos=newLineas.filter(l=>l.prodId==='p-hong').reduce((a,l)=>a+(l.subtotal||0),0);
    p.totalGoteros=newLineas.filter(l=>l.prodId==='p-got').reduce((a,l)=>a+(l.subtotal||0),0);
    p.totalPetri=newLineas.filter(l=>l.prodId==='p-pet').reduce((a,l)=>a+(l.subtotal||0),0);
  }

  // Payment
  let payment;
  const tcUsd =parseFloat(document.getElementById('edit-tc-usd')?.value)||0;
  const tcUsdt=parseFloat(document.getElementById('edit-tc-usdt')?.value)||0;

  if(modo==='USD'){
    const usdCalc=tcUsd>0?parseFloat((nuevoTotal/tcUsd).toFixed(2)):0;
    payment={ars:0,usd:usdCalc,usdt:0,tc:tcUsd,tc_usd:tcUsd,tc_usdt:tcUsdt,total_ars:nuevoTotal,total_usdt:null,modo:'USD'};
  } else if(modo==='USDT'){
    const usdtCalc=tcUsdt>0?parseFloat((nuevoTotal/tcUsdt).toFixed(2)):0;
    payment={ars:0,usd:0,usdt:usdtCalc,tc:tcUsdt,tc_usd:tcUsd,tc_usdt:tcUsdt,total_ars:nuevoTotal,total_usdt:usdtCalc,modo:'USDT'};
  } else {
    payment={ars:nuevoTotal,usd:0,usdt:0,tc:0,tc_usd:0,tc_usdt:0,total_ars:nuevoTotal,total_usdt:null,modo:'ARS'};
  }

  if(nuevaFecha){o.fecha=nuevaFecha;o.fechaDisplay=d2s(nuevaFecha);o.mesActual=d2m(nuevaFecha);}
  o.cliente=nuevoCliente||null; o.nota=nuevaNota||null;
  o.tipoPago=modo; o.tc=modo==='USDT'?tcUsdt:modo==='USD'?tcUsd:null; o.payment=payment;
  o.totales={...o.totales,totalGeneral:nuevoTotal,totalUSDT:payment.total_usdt,payment};
  const costo=o.costo||0;
  o.margen=nuevoTotal>0?parseFloat(((nuevoTotal-costo)/nuevoTotal*100).toFixed(1)):0;
  sd(d);window.rfM?.();rH();rS();window.renderDash?.();window.clM?.();sN(`✓ ${id} actualizada`);window.uhd?.();window.updateClientesDatalist?.();
  delete window._editLineas;
}
