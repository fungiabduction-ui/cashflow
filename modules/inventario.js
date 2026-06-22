import { ld, sd, gOConf } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fi, fu, hoy, d2s, mL, uid } from '../core/formatters.js';
import { getProductos, saveProductos } from './productos.js';
import { getStock, saveStock, getLotes, saveLotes, getLotesItem, getUmbrales, saveUmbrales, addStockMov, getStockStatus, getAllStockItems, getCostoPromedio, getActualQty, getStockMovs, getStockFromLotes, eliminarMov } from './stock.js';
import { newIngresoId } from '../core/ids.js';
import { loadConfig } from '../core/config.js';
import { getTramosProducto } from './listas-precios.js';

// ── Data layer ──
export function getIngresos(){const d=ld();return d.ingresos||[];}
export function saveIngreso(ing){
  const d=ld();if(!d.ingresos)d.ingresos=[];
  const idx=d.ingresos.findIndex(x=>x.id===ing.id);
  if(idx>=0)d.ingresos[idx]=ing;else d.ingresos.push(ing);
  sd(d);
}
export function deleteIngreso(id){
  const d=ld();d.ingresos=(d.ingresos||[]).filter(x=>x.id!==id);sd(d);
}

// ── consumirStock FIFO ──
export function consumirStock(itemId,qty){
  const lotes=getLotes();
  if(!lotes[itemId])return;
  let restante=qty;
  lotes[itemId].sort((a,b)=>a.fecha.localeCompare(b.fecha));
  for(let l of lotes[itemId]){
    if(l.qty_restante<=0||restante<=0)continue;
    const consume=Math.min(l.qty_restante,restante);
    l.qty_restante-=consume;restante-=consume;
  }
  saveLotes(lotes);
}

// ── Período vendido ──
function _invFilterOrders(orders){
  const p=document.getElementById('invPeriodo')?.value||'all';
  if(!p||p==='all')return orders;
  if(p==='rango'){
    const desde=document.getElementById('invPeriodoDesde')?.value||'';
    const hasta=document.getElementById('invPeriodoHasta')?.value||'';
    if(desde)orders=orders.filter(o=>o.fecha>=desde);
    if(hasta)orders=orders.filter(o=>o.fecha<=hasta);
    return orders;
  }
  // Month code like '202604'
  return orders.filter(o=>o.mesActual===p);
}

function getInvPeriodoSoldMap(){
  const orders=_invFilterOrders(gOConf());
  const soldMap={};
  orders.forEach(o=>{
    const p=o.productos;if(!p)return;
    if(p._lineas&&p._lineas.length){
      p._lineas.forEach(ln=>{
        const k=ln.varId||ln.prodId;
        soldMap[k]=(soldMap[k]||0)+(ln.qty||0);
      });
    } else {
      // formato legacy: {calaveras,teddy,lucky,genericas,cristales,hongos,goteros,petri}
      const leg=[['v-cal','calaveras'],['v-ted','teddy'],['v-lck','lucky'],['v-gen','genericas'],
                 ['p-cris','cristales'],['p-hong','hongos'],['p-got','goteros'],['p-pet','petri']];
      leg.forEach(([k,f])=>{if((p[f]||0)>0)soldMap[k]=(soldMap[k]||0)+(p[f]||0);});
    }
  });
  return soldMap;
}

function getInvPeriodoRevenueMap(){
  // Returns {prodId: totalARS} for the selected period — real revenue from confirmed sales
  const orders=_invFilterOrders(gOConf());
  const revMap={};
  orders.forEach(o=>{
    const p=o.productos;if(!p)return;
    if(p._lineas&&p._lineas.length){
      p._lineas.forEach(ln=>{
        const k=ln.varId||ln.prodId;
        revMap[k]=(revMap[k]||0)+(ln.subtotal||0);
      });
    } else {
      // formato legacy: distribuir revenue desde campos totales
      const t=o.totales||{};
      const totalPast=(p.calaveras||0)+(p.teddy||0)+(p.lucky||0)+(p.genericas||0);
      if(totalPast>0&&(t.totalPastillasLinea||0)>0){
        const ppas=t.totalPastillasLinea/totalPast;
        [['v-cal','calaveras'],['v-ted','teddy'],['v-lck','lucky'],['v-gen','genericas']].forEach(([k,f])=>{
          if((p[f]||0)>0)revMap[k]=(revMap[k]||0)+((p[f]||0)*ppas);
        });
      }
      if((p.cristales||0)>0&&t.totalCristales) revMap['p-cris']=(revMap['p-cris']||0)+t.totalCristales;
      if((p.hongos||0)>0&&t.totalHongos)       revMap['p-hong']=(revMap['p-hong']||0)+t.totalHongos;
      if((p.goteros||0)>0&&t.totalGoteros)     revMap['p-got']=(revMap['p-got']||0)+t.totalGoteros;
      if((p.petri||0)>0&&t.totalPetri)         revMap['p-pet']=(revMap['p-pet']||0)+t.totalPetri;
    }
  });
  return revMap;
}

function getPeriodoLabel(){
  const p=document.getElementById('invPeriodo')?.value||'all';
  if(!p||p==='all')return'TODO';
  if(p==='rango'){
    const d=document.getElementById('invPeriodoDesde')?.value||'';
    const h=document.getElementById('invPeriodoHasta')?.value||'';
    if(d&&h)return d.slice(5)+' → '+h.slice(5);return'RANGO';
  }
  // Month code
  return mL(p);
}

export function onInvPeriodoChange(){
  const v=document.getElementById('invPeriodo')?.value||'all';
  const dw=document.getElementById('invPeriodoDesdeWrap'),hw=document.getElementById('invPeriodoHastaWrap');
  if(v==='rango'){
    if(dw)dw.style.display='';if(hw)hw.style.display='';
    const h=hoy();
    const dEl=document.getElementById('invPeriodoDesde');
    const hEl=document.getElementById('invPeriodoHasta');
    if(dEl&&!dEl.value)dEl.value=h.substring(0,8)+'01';
    if(hEl&&!hEl.value)hEl.value=h;
  } else {
    if(dw)dw.style.display='none';if(hw)hw.style.display='none';
  }
  renderInvStock();
}

// ── Sub-navegación ──
export function invSubNav(sub){
  ['ingresos','precios','stock','movs','price-adjust','price-log'].forEach(s=>{
    const pane=document.getElementById('inv-sub-'+s);
    const btn=document.getElementById('isb-'+s);
    if(pane)pane.style.display=s===sub?'':'none';
    if(btn){btn.classList.toggle('active',s===sub);}
  });
  if(sub==='ingresos'){renderIngresoForm();renderProductosRegistrados();}
  if(sub==='precios'){window.renderListasPrecios?.();window.renderAsignacionPrecios?.();}
  if(sub==='stock')renderInvStock();
  if(sub==='movs')renderStockHistorial();
  if(sub==='price-adjust')window.renderPriceAdjust?.();
  if(sub==='price-log')window.renderPriceLog?.();
}

// ── Badge de estado ──
function stBadge(st){
  const m={
    empty:{cls:'badge-zero',txt:'⛔ Sin stock'},
    crit :{cls:'badge-crit',txt:'🔴 Riesgo'},
    warn :{cls:'badge-warn',txt:'🟡 Atención'},
    ok   :{cls:'badge-ok',  txt:'🟢 OK'}
  }[st]||{cls:'',txt:'—'};
  return'<span class="badge-st '+m.cls+'">'+m.txt+'</span>';
}

// ════════════════════════════════════════
// MÓDULO 2 — STOCK Y UMBRALES
// ════════════════════════════════════════
export function renderInvStockTabla(){
  const prods=getProductos().filter(p=>p.activo!==false);
  const umbrales=getUmbrales();
  const soldMap=getInvPeriodoSoldMap();
  const revMap=getInvPeriodoRevenueMap();
  const periodoLbl=getPeriodoLabel();
  const cont=document.getElementById('inv-stock-body');
  if(!cont)return;
  if(!prods.length){cont.innerHTML='<div style="padding:20px;font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center">Sin productos.</div>';return;}

  let rows='';
  prods.forEach(p=>{
    const pid=p.id;
    const unit=p.unit||'ud';
    const qty=getActualQty(pid);      // lotes si existen y > 0, fallback a plano
    const costoPromLotes=getCostoPromedio(pid);
    const costoRef=costoPromLotes||p.costo||0;  // fallback a costo del producto
    const u=umbrales[pid]||{};
    const w=u.warn!=null?u.warn:15;const cr=u.crit!=null?u.crit:5;
    const st=getStockStatus(qty,pid);
    const sold=soldMap[pid]||0;
    const rev=revMap[pid]||0;  // ingresos reales ARS del período

    // Margen real del período:
    // Si hay ventas en el período → margen = (revenue - costo_vendido) / revenue
    // Si no → margen teórico desde lista de precios
    let margen=null, margenCls='color:var(--tx3)', margenTip='';
    if(sold>0 && rev>0 && costoRef>0){
      const costoVendido=sold*costoRef;
      margen=((rev-costoVendido)/rev*100);
      margenTip='real '+periodoLbl;
    } else if(costoRef>0){
      const tramos=getTramosProducto(p);
      const precioBase=tramos[0]?.p||0;
      if(precioBase>0){
        margen=((precioBase-costoRef)/precioBase*100);
        margenTip='teórico';
      }
    }
    if(margen!=null){
      margenCls=margen>40?'color:var(--ac)':margen>25?'color:var(--wn)':'color:var(--er)';
    }

    const costoDisplay=costoPromLotes
      ?'$'+fi(Math.round(costoPromLotes))
      :costoRef
        ?'<span style="color:var(--tx3)">$'+fi(costoRef)+'</span>'
        :'—';

    rows+='<tr>'
      +'<td>'+p.emoji+' '+p.nombre+' <span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">('+unit+')</span></td>'
      +'<td>'+stBadge(st)+'</td>'
      +'<td style="text-align:right;font-weight:700;color:var(--tx)">'+qty+' <span style="font-size:8px;font-weight:400;color:var(--tx3)">'+unit+'</span></td>'
      // Sold column: qty + revenue
      +'<td style="text-align:right">'
        +(sold
          ?'<div style="font-family:var(--mo);font-size:11px;font-weight:700;color:var(--tx)">'+sold+' <span style="font-size:8px;font-weight:400;color:var(--tx3)">'+unit+'</span></div>'
           +(rev?'<div style="font-family:var(--mo);font-size:9px;color:var(--ac)">$'+fi(Math.round(rev))+'</div>':'')
          :'<span style="color:var(--tx3)">—</span>')
      +'</td>'
      +'<td style="text-align:right;font-family:var(--mo);color:var(--ac2)">'+costoDisplay+'</td>'
      // Margin: real if sales exist, theoretical otherwise
      +'<td style="text-align:right;font-family:var(--mo);font-size:10px">'
        +(margen!=null
          ?'<div style="font-weight:700;'+margenCls+'">'+margen.toFixed(1)+'%</div>'
           +(margenTip?'<div style="font-size:7px;color:var(--tx3)">'+margenTip+'</div>':'')
          :'<span style="color:var(--tx3)">—</span>')
      +'</td>'
      +'<td style="text-align:center"><input type="number" class="inv-umbral-input" data-uid="'+pid+'" data-type="warn" value="'+w+'" style="width:44px;text-align:center;font-family:var(--mo);font-size:10px;background:var(--bg);border:1px solid rgba(255,170,0,.3);color:var(--wn);padding:3px;outline:none" title="Umbral atención"></td>'
      +'<td style="text-align:center"><input type="number" class="inv-umbral-input" data-uid="'+pid+'" data-type="crit" value="'+cr+'" style="width:44px;text-align:center;font-family:var(--mo);font-size:10px;background:var(--bg);border:1px solid rgba(255,68,85,.3);color:var(--er);padding:3px;outline:none" title="Umbral riesgo"></td>'
      +'<td><button class="pm-btn" data-ver-lotes="'+pid+'" data-label="'+p.emoji+' '+p.nombre+'" style="font-size:8px">lotes</button></td>'
      +'</tr>';
  });

  const divergencia=_calcDivergencia();
  const warnDiv=divergencia>0
    ?'<div style="padding:10px 14px;background:rgba(255,170,0,.08);border-top:1px solid rgba(255,170,0,.3);display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
      +'<span style="font-family:var(--mo);font-size:9px;color:var(--wn);font-weight:700">⚠ Lotes desincronizados con stock plano (drift='+divergencia+' ud)</span>'
      +'<span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">Los valores mostrados pueden diferir del dashboard. Reconciliar para unificar ambas fuentes.</span>'
      +'<button class="btn btn-p" data-reconciliar="1" style="font-size:9px;height:28px;margin-left:auto">🔄 Reconciliar lotes</button>'
      +'</div>'
    :'<div style="padding:6px 14px;background:rgba(0,229,160,.04);border-top:1px solid rgba(0,229,160,.1)">'
      +'<span style="font-family:var(--mo);font-size:8px;color:var(--ac)">✓ Lotes sincronizados con stock plano</span>'
      +'</div>';

  const tbl='<table class="inv-stock-tbl">'
    +'<thead><tr>'
    +'<th>Producto</th>'
    +'<th>Estado</th>'
    +'<th style="text-align:right">Stock actual</th>'
    +'<th style="text-align:right">Vendido — '+periodoLbl+'</th>'
    +'<th style="text-align:right">Costo prom.</th>'
    +'<th style="text-align:right">Margen</th>'
    +'<th style="text-align:center">🟡 Atn ≤</th>'
    +'<th style="text-align:center">🔴 Rsg ≤</th>'
    +'<th></th>'
    +'</tr></thead>'
    +'<tbody>'+rows+'</tbody>'
    +'</table>'
    +warnDiv
    +'<div style="padding:8px 14px;border-top:1px solid var(--br);display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
    +'<span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">Margen <b>real</b>: calculado sobre ventas confirmadas del período. Margen <b>teórico</b>: desde lista de precios cuando no hay ventas.</span>'
    +'</div>'
    +'<div style="padding:8px 14px;border-top:1px solid var(--br);display:flex;align-items:center;gap:10px">'
    +'<span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">Umbrales →</span>'
    +'<button class="btn btn-p" data-guardar-umbrales="1" style="font-size:9px;height:32px">💾 Guardar umbrales</button>'
    +'<span id="umbral-save-msg" style="font-family:var(--mo);font-size:9px;color:var(--ac)"></span>'
    +'</div>';

  cont.innerHTML=tbl;

  cont.onclick=function(e){
    const verLotes=e.target.closest('[data-ver-lotes]');
    if(verLotes){
      abrirLotesPanel(verLotes.getAttribute('data-ver-lotes'),verLotes.getAttribute('data-label'));
      return;
    }
    const guardar=e.target.closest('[data-guardar-umbrales]');
    if(guardar){guardarUmbralesDesdeTabla();return;}
    const reconciliar=e.target.closest('[data-reconciliar]');
    if(reconciliar){
      if(!confirm('¿Reconciliar lotes con stock plano?\n\nAjustará las cantidades restantes de cada lote para que coincidan exactamente con el stock histórico (stock plano). Esta operación es idempotente y no toca órdenes ni movimientos.'))return;
      reconcileLotesConStock();
      return;
    }
  };
}

export function guardarUmbralesDesdeTabla(){
  const u=getUmbrales();
  document.querySelectorAll('.inv-umbral-input').forEach(inp=>{
    const uid=inp.getAttribute('data-uid');
    const tipo=inp.getAttribute('data-type');
    const val=parseFloat(inp.value)||0;
    if(!u[uid])u[uid]={warn:15,crit:5};
    u[uid][tipo]=val;
  });
  saveUmbrales(u);
  const msg=document.getElementById('umbral-save-msg');
  if(msg){msg.textContent='✓ Guardado';setTimeout(()=>msg.textContent='',2000);}
  renderStockMiniPanel();window.buildTicketUI?.();window.upd?.();sN('✓ Umbrales guardados');
}

// ── Panel de lotes (expandible, bajo Stock) ──
export function abrirLotesPanel(itemId,label){
  const panel=document.getElementById('inv-lotes-panel');
  const title=document.getElementById('inv-lotes-title');
  const body=document.getElementById('inv-lotes-body');
  if(!panel||!body)return;
  document.getElementById('inv-lotes-title').textContent='📦 Lotes — '+(label||itemId);
  panel.style.display='';
  panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  renderLotesDetalle(itemId);
}
export function cerrarLotesPanel(){
  const panel=document.getElementById('inv-lotes-panel');
  if(panel)panel.style.display='none';
}
export function renderLotesDetalle(itemId){
  const body=document.getElementById('inv-lotes-body');if(!body)return;
  const todos=getLotesItem(itemId);
  if(!todos.length){
    body.innerHTML='<div style="padding:20px;font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center">Sin lotes registrados. Registrá un ingreso en la pestaña 📥 Ingresos.</div>';
    return;
  }
  // Resumen
  const activos=todos.filter(l=>l.qty_restante>0);
  const totStock=activos.reduce((a,l)=>a+l.qty_restante,0);
  const costoP=totStock?activos.reduce((a,l)=>a+l.qty_restante*l.costo_unitario,0)/totStock:0;
  let html='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--br);border-bottom:1px solid var(--br)">'
    +'<div style="background:var(--s2);padding:12px 16px"><div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;margin-bottom:4px">STOCK TOTAL</div><div style="font-family:var(--mo);font-size:20px;font-weight:700;color:var(--ac)">'+totStock+'</div></div>'
    +'<div style="background:var(--s2);padding:12px 16px"><div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;margin-bottom:4px">COSTO PROM. POND.</div><div style="font-family:var(--mo);font-size:20px;font-weight:700;color:var(--ac2)">'+(costoP?'$'+fi(Math.round(costoP)):'—')+'</div></div>'
    +'<div style="background:var(--s2);padding:12px 16px"><div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;margin-bottom:4px">LOTES ACTIVOS</div><div style="font-family:var(--mo);font-size:20px;font-weight:700;color:var(--wn)">'+activos.length+'</div></div>'
    +'</div>';

  // Tabla lotes
  html+='<table class="inv-lote-tbl">'
    +'<thead><tr><th>ID Lote / Fecha</th><th style="text-align:right">Inicial</th><th style="text-align:right">Restante</th><th style="text-align:right">Costo/ud</th><th>Proveedor</th><th>Nota</th><th>Estado</th><th></th></tr></thead>'
    +'<tbody>';
  todos.forEach((l,i)=>{
    const agotado=l.qty_restante<=0;
    const pct=l.qty_inicial>0?Math.round(l.qty_restante/l.qty_inicial*100):0;
    const esPrimero=!agotado&&activos[0]&&activos[0].id===l.id;
    const estadoHtml=agotado
      ?'<span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">✓ Agotado</span>'
      :esPrimero
        ?'<span class="badge-st badge-ok">▶ Activo FIFO</span>'
        :'<span class="badge-st badge-warn">⏳ En espera</span>';
    html+='<tr style="opacity:'+(agotado?.5:1)+'">'
      +'<td><div style="font-family:var(--mo);font-size:9px;font-weight:700;color:var(--ac)">'+l.id+'</div><div style="font-family:var(--mo);font-size:8px;color:var(--tx3)">'+d2s(l.fecha.substring(0,10))+'</div></td>'
      +'<td style="text-align:right;font-family:var(--mo)">'+l.qty_inicial+'</td>'
      +'<td style="text-align:right;font-family:var(--mo);font-weight:700;color:'+(agotado?'var(--tx3)':'var(--tx)')+'">'+l.qty_restante+' <span style="font-size:8px;font-weight:400;color:var(--tx3)">('+pct+'%)</span></td>'
      +'<td style="text-align:right;font-family:var(--mo);color:var(--ac2)">$'+fi(l.costo_unitario)+'</td>'
      +'<td style="font-family:var(--mo);color:var(--tx2)">'+(l.proveedor||'—')+'</td>'
      +'<td style="font-family:var(--mo);font-size:9px;color:var(--tx3)">'+(l.nota||'—')+'</td>'
      +'<td>'+estadoHtml+'</td>'
      +'<td><button class="pm-btn del" data-del-lote="'+l.id+'" data-lote-item="'+itemId+'" style="font-size:8px">×</button></td>'
      +'</tr>';
  });
  html+='</tbody></table>';
  body.innerHTML=html;

  body.onclick=function(e){
    const delBtn=e.target.closest('[data-del-lote]');
    if(delBtn){
      const loteId=delBtn.getAttribute('data-del-lote');
      const iid=delBtn.getAttribute('data-lote-item');
      if(!confirm('¿Eliminar este lote? El stock se recalculará.'))return;
      const lotes=getLotes();
      if(lotes[iid])lotes[iid]=lotes[iid].filter(l=>l.id!==loteId);
      saveLotes(lotes);renderInvStock();renderLotesDetalle(iid);renderStockMiniPanel();sN('Lote eliminado');
    }
  };
}

// ════════════════════════════════════════
// MÓDULO INGRESOS
// ════════════════════════════════════════
export function renderIngresoForm(){
  const prods=getProductos().filter(p=>p.activo!==false);
  const cont=document.getElementById('inv-ingreso-form');if(!cont)return;

  let prodOpts='<option value="">— Seleccioná un producto —</option>';
  prods.forEach(p=>{prodOpts+='<option value="'+p.id+'">'+p.emoji+' '+p.nombre+' ('+(p.unit||'ud')+')</option>';});

  const IS='width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:9px 11px;outline:none;min-height:var(--touch)';
  const LB='font-family:var(--mo);font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase';

  cont.innerHTML='<div class="inv-ingreso-grid">'
    +'<div><label style="'+LB+'">Producto</label><select id="ing-prod" style="'+IS+'">'+prodOpts+'</select></div>'
    +'<div><label style="'+LB+'">Fecha</label><input type="date" id="ing-fecha" value="'+hoy()+'" style="'+IS+'"></div>'
    +'<div><label style="'+LB+'">Cantidad</label><input type="number" id="ing-qty" min="1" placeholder="0" style="'+IS+'" oninput="ingPreview()"></div>'
    +'<div><label style="'+LB+'">Costo unitario (ARS)</label><input type="number" id="ing-costo" min="0" step="any" placeholder="0" style="'+IS+'" oninput="ingPreview()"></div>'
    +'<div><label style="'+LB+'">Proveedor (texto libre)</label><input type="text" id="ing-prov" placeholder="ej: Juan" style="'+IS+'"></div>'
    +'<div><label style="'+LB+'">Nota (texto libre)</label><input type="text" id="ing-nota" placeholder="ej: Lote verano" style="'+IS+'"></div>'
    +'</div>'
    +'<div id="ing-preview" style="padding:10px 16px;background:var(--s2);border-top:1px solid var(--br);border-bottom:1px solid var(--br);font-family:var(--mo);font-size:9px;color:var(--tx3);min-height:28px"></div>'
    +'<div style="padding:14px 16px;display:flex;gap:10px;align-items:center">'
    +'<button class="gbtn" id="ing-btn" onclick="registrarIngreso()" style="min-height:48px;font-size:10px;max-width:300px">📥 REGISTRAR INGRESO</button>'
    +'<span id="ing-msg" style="font-family:var(--mo);font-size:9px;color:var(--ac)"></span>'
    +'</div>';
}

export function ingPreview(){
  const qty=parseFloat(document.getElementById('ing-qty')?.value)||0;
  const costo=parseFloat(document.getElementById('ing-costo')?.value)||0;
  const prev=document.getElementById('ing-preview');if(!prev)return;
  if(qty>0&&costo>0){
    prev.innerHTML='<span style="color:var(--ac)">Total lote: <b>$'+fi(qty*costo)+'</b></span>'
      +' · '+qty+' ud × $'+fi(costo)+'/ud';
  } else prev.textContent='';
}

export function registrarIngreso(){
  const prod=document.getElementById('ing-prod')?.value;
  const fecha=document.getElementById('ing-fecha')?.value||hoy();
  const qty=parseFloat(document.getElementById('ing-qty')?.value)||0;
  const costo=parseFloat(document.getElementById('ing-costo')?.value)||0;
  const prov=document.getElementById('ing-prov')?.value.trim()||'';
  const nota=document.getElementById('ing-nota')?.value.trim()||'';

  if(!prod){sN('Seleccioná un producto',true);return;}
  if(!qty||qty<=0){sN('Cantidad requerida',true);return;}
  if(!costo||costo<=0){sN('Costo unitario requerido',true);return;}

  const id=newIngresoId();
  const ts=new Date().toISOString();

  // Crear lote
  const lotes=getLotes();
  if(!lotes[prod])lotes[prod]=[];
  const loteId=id+'-L1';
  lotes[prod].push({id:loteId,ingreso_id:id,fecha:ts,qty_inicial:qty,qty_restante:qty,
    costo_unitario:costo,proveedor:prov,nota});
  saveLotes(lotes);

  // Guardar ingreso
  const ing={id,fecha:ts,fecha_display:d2s(fecha)+' '+ts.substring(11,16),
    prod_id:prod,qty,costo_unitario:costo,total:qty*costo,proveedor:prov,nota,lote_id:loteId};
  saveIngreso(ing);

  // Mov
  addStockMov({fecha:ts,tipo:'S-TICKET',prodId:prod,
    nombre:getAllStockItems().find(x=>x.id===prod)?.nombre||prod,
    emoji:getAllStockItems().find(x=>x.id===prod)?.emoji||'📦',
    delta:qty,antes:getStockFromLotes(prod)-qty,despues:getStockFromLotes(prod),
    nota:'Ingreso '+id});

  // Reset form
  ['ing-qty','ing-costo','ing-prov','ing-nota'].forEach(fid=>{
    const el=document.getElementById(fid);if(el)el.value='';
  });
  document.getElementById('ing-preview').textContent='';
  const msg=document.getElementById('ing-msg');
  if(msg){msg.textContent='✓ '+id+' registrado';setTimeout(()=>msg.textContent='',3000);}
  renderProductosRegistrados();renderInvStock();renderStockMiniPanel();window.buildTicketUI?.();window.upd?.();
  // Auto-open product panel after registro
  setTimeout(()=>{
    const body=document.getElementById('preg-body-'+prod);
    const arr=document.getElementById('preg-arr-'+prod);
    if(body){body.style.display='';if(arr)arr.textContent='▾';}
    body?.scrollIntoView({behavior:'smooth',block:'nearest'});
  },100);
  sN('✓ Ingreso '+id+' registrado');
}

// ════════════════════════════════════════
// PRODUCTOS REGISTRADOS — expandible con historial de lotes
// ════════════════════════════════════════
export function renderProductosRegistrados(){
  const cont=document.getElementById('inv-productos-registrados');if(!cont)return;
  const prods=getProductos().filter(p=>p.activo!==false);
  const ingresos=getIngresos();
  const SS='font-family:var(--mo);font-size:';
  let html='';

  prods.forEach(p=>{
    const pid=p.id;
    const stock=getStockFromLotes(pid);
    const costoLotes=getCostoPromedio(pid);  // from active lots
    const costoRef=costoLotes||p.costo||0;   // fallback to product cost
    const lotes=getLotesItem(pid);
    const ingProd=ingresos.filter(x=>x.prod_id===pid);
    const st=getStockStatus(stock,pid);
    const stCol=st==='ok'?'var(--ac)':st==='warn'?'var(--wn)':st==='crit'?'var(--er)':'var(--tx3)';
    const unit=p.unit||'ud';
    const sinLotes=!lotes.length;

    // Cost display: show lot cost if available, else show product defined cost
    const costoDisplay=costoLotes
      ?'$'+fi(Math.round(costoLotes))+'/'+unit+' <span style="'+SS+'8px;color:var(--tx3)">(prom. lotes)</span>'
      :p.costo
        ?'$'+fi(p.costo)+'/'+unit+' <span style="'+SS+'8px;color:var(--tx3)">(costo base — sin lotes)</span>'
        :'<span style="color:var(--er)">sin costo definido</span>';

    html+='<div class="preg-card" id="preg-'+pid+'">';
    // Header row — clickable
    html+='<div class="preg-hdr" data-preg-toggle="'+pid+'" style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;border-bottom:1px solid var(--br);transition:background .15s">'
      +'<span style="font-size:20px">'+p.emoji+'</span>'
      +'<div style="flex:1">'
        +'<div style="'+SS+'11px;font-weight:700;color:var(--tx)">'+p.nombre+'</div>'
        +'<div style="'+SS+'9px;color:var(--tx3);margin-top:2px">'
          +'<span style="'+SS+'9px;color:var(--tx2)">'+unit+'</span>'
          +' · ID: <span style="color:var(--ac2)">'+pid+'</span>'
          +(p.legacyKey?' · legacy: '+p.legacyKey:'')
        +'</div>'
        +'<div style="'+SS+'9px;margin-top:3px">'+costoDisplay+'</div>'
      +'</div>'
      +'<div style="text-align:right;margin-right:4px">'
        +'<div style="'+SS+'18px;font-weight:700;color:'+stCol+'">'+stock+' <span style="'+SS+'9px;font-weight:400;color:var(--tx3)">'+unit+'</span></div>'
        +(sinLotes?'<div style="'+SS+'8px;color:var(--wn)">⚠ sin lotes</div>':'')
      +'</div>'
      +'<div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">'
        +'<button class="pm-btn" data-edit-prod="'+pid+'" style="font-size:8px;white-space:nowrap">EDIT</button>'
        +'<button class="pm-btn del" data-del-prod="'+pid+'" style="font-size:8px;white-space:nowrap">✕</button>'
      +'</div>'
      +'<span class="preg-arrow" id="preg-arr-'+pid+'" style="'+SS+'14px;color:var(--tx3);margin-left:6px;transition:transform .2s">▸</span>'
    +'</div>';

    // Expandable body
    html+='<div id="preg-body-'+pid+'" style="display:none">';

    // Lotes section
    if(!lotes.length){
      const costoSugerido=p.costo||0;
      const qtySugerida=p.unit==='g'?500:50;
      html+='<div style="padding:16px;background:rgba(255,170,0,.04);border-bottom:1px solid rgba(255,170,0,.15)">'
        +'<div style="'+SS+'10px;color:var(--wn);font-weight:700;margin-bottom:8px">⚠ Sin lotes registrados</div>'
        +'<div style="'+SS+'9px;color:var(--tx3);margin-bottom:12px">Este producto tiene costo de adquisición definido ($'+fi(costoSugerido)+') pero no tiene lotes de stock. Podés registrar el primer ingreso:</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'
          +'<div><label style="'+SS+'8px;color:var(--tx2);display:block;margin-bottom:4px;letter-spacing:.8px;text-transform:uppercase">Cantidad inicial</label>'
            +'<input type="number" id="seed-qty-'+pid+'" value="'+qtySugerida+'" min="1" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:8px 10px;outline:none"></div>'
          +'<div><label style="'+SS+'8px;color:var(--tx2);display:block;margin-bottom:4px;letter-spacing:.8px;text-transform:uppercase">Costo/ud (ARS)</label>'
            +'<input type="number" id="seed-costo-'+pid+'" value="'+costoSugerido+'" min="0" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:8px 10px;outline:none"></div>'
        +'</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'
          +'<div><label style="'+SS+'8px;color:var(--tx2);display:block;margin-bottom:4px;letter-spacing:.8px;text-transform:uppercase">Proveedor (opcional)</label>'
            +'<input type="text" id="seed-prov-'+pid+'" placeholder="ej: Stock inicial" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:8px 10px;outline:none"></div>'
          +'<div><label style="'+SS+'8px;color:var(--tx2);display:block;margin-bottom:4px;letter-spacing:.8px;text-transform:uppercase">Nota (opcional)</label>'
            +'<input type="text" id="seed-nota-'+pid+'" placeholder="ej: Stock inicial" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:8px 10px;outline:none"></div>'
        +'</div>'
        +'<button class="btn btn-p" data-seed-prod="'+pid+'" style="font-size:10px;height:40px;padding:0 20px">📥 Registrar primer lote</button>'
      +'</div>';
    } else {
      // Summary strip
      const activos=lotes.filter(l=>l.qty_restante>0);
      const totStock=activos.reduce((a,l)=>a+l.qty_restante,0);
      const costoProm=totStock?activos.reduce((a,l)=>a+l.qty_restante*l.costo_unitario,0)/totStock:0;
      html+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--br)">';
      html+='<div style="background:var(--s2);padding:10px 14px"><div style="'+SS+'7px;color:var(--tx3);letter-spacing:1px;margin-bottom:3px">STOCK TOTAL</div><div style="'+SS+'18px;font-weight:700;color:var(--ac)">'+totStock+' '+unit+'</div></div>';
      html+='<div style="background:var(--s2);padding:10px 14px"><div style="'+SS+'7px;color:var(--tx3);letter-spacing:1px;margin-bottom:3px">COSTO PROM.</div><div style="'+SS+'18px;font-weight:700;color:var(--ac2)">'+(costoProm?'$'+fi(Math.round(costoProm)):'—')+'</div></div>';
      html+='<div style="background:var(--s2);padding:10px 14px"><div style="'+SS+'7px;color:var(--tx3);letter-spacing:1px;margin-bottom:3px">LOTES ACTIVOS</div><div style="'+SS+'18px;font-weight:700;color:var(--wn)">'+activos.length+'</div></div>';
      html+='</div>';

      // Lotes table
      html+='<div style="overflow-x:auto"><table class="inv-lote-tbl">'
        +'<thead><tr>'
        +'<th>ID Lote / Fecha</th>'
        +'<th style="text-align:right">Inicial</th>'
        +'<th style="text-align:right">Restante</th>'
        +'<th style="text-align:right">Costo/ud</th>'
        +'<th>Proveedor</th>'
        +'<th>Nota</th>'
        +'<th>Estado</th>'
        +'<th></th>'
        +'</tr></thead><tbody>';

      lotes.forEach(l=>{
        const agotado=l.qty_restante<=0;
        const pct=l.qty_inicial>0?Math.round(l.qty_restante/l.qty_inicial*100):0;
        const esPrimero=!agotado&&activos[0]&&activos[0].id===l.id;
        const estadoHtml=agotado
          ?'<span style="'+SS+'8px;color:var(--tx3)">✓ Agotado</span>'
          :esPrimero
            ?'<span class="badge-st badge-ok">▶ Activo</span>'
            :'<span class="badge-st badge-warn">⏳ En espera</span>';
        // Find associated ingreso for edit
        const ingId=l.ingreso_id||'';
        html+='<tr style="opacity:'+(agotado?.5:1)+'">'
          +'<td><div style="'+SS+'9px;font-weight:700;color:var(--ac)">'+l.id+'</div>'
            +'<div style="'+SS+'8px;color:var(--tx3)">'+d2s((l.fecha||'').substring(0,10))+'</div>'
            +(ingId?'<div style="'+SS+'7px;color:var(--tx3)">'+ingId+'</div>':'')
          +'</td>'
          +'<td style="text-align:right;'+SS+'11px">'+l.qty_inicial+'</td>'
          +'<td style="text-align:right;'+SS+'11px;font-weight:700;color:'+(agotado?'var(--tx3)':'var(--tx)')+'">'+l.qty_restante+' <span style="'+SS+'8px;font-weight:400;color:var(--tx3)">('+pct+'%)</span></td>'
          +'<td style="text-align:right;'+SS+'11px;color:var(--ac2)">$'+fi(l.costo_unitario)+'</td>'
          +'<td style="'+SS+'10px;color:var(--tx2)">'+(l.proveedor||'—')+'</td>'
          +'<td style="'+SS+'9px;color:var(--tx3)">'+(l.nota||'—')+'</td>'
          +'<td>'+estadoHtml+'</td>'
          +'<td style="display:flex;gap:3px;padding:4px">'
            +(ingId?'<button class="pm-btn" data-edit-ing="'+ingId+'" style="'+SS+'8px">✏</button>':'')
            +'<button class="pm-btn del" data-del-lote="'+l.id+'" data-lote-prod="'+pid+'" style="'+SS+'8px">×</button>'
          +'</td>'
          +'</tr>';
      });
      html+='</tbody></table></div>';
    }

    // Ingresos relacionados count
    html+='<div style="padding:10px 14px;border-top:1px solid var(--br);display:flex;align-items:center;justify-content:space-between">'
      +'<span style="'+SS+'9px;color:var(--tx3)">'+ingProd.length+' ingresos registrados</span>'
      +'<button class="btn btn-p" data-nuevo-ing="'+pid+'" style="'+SS+'9px;height:30px;padding:0 12px">+ Registrar nuevo ingreso</button>'
    +'</div>';

    html+='</div>';// /preg-body
    html+='</div>';// /preg-card
  });

  cont.innerHTML=html||'<div style="padding:20px;font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center">Sin productos registrados.</div>';

  // Event delegation
  cont.onclick=function(e){
    const toggle=e.target.closest('[data-preg-toggle]');
    if(toggle&&!e.target.closest('button')){
      const pid=toggle.getAttribute('data-preg-toggle');
      const body=document.getElementById('preg-body-'+pid);
      const arr=document.getElementById('preg-arr-'+pid);
      if(!body)return;
      const open=body.style.display==='none';
      body.style.display=open?'':'none';
      if(arr)arr.textContent=open?'▾':'▸';
      toggle.style.background=open?'var(--s2)':'';
      return;
    }
    const editProd=e.target.closest('[data-edit-prod]');
    if(editProd){window.editarProducto?.(editProd.getAttribute('data-edit-prod'));return;}

    const delProd=e.target.closest('[data-del-prod]');
    if(delProd){eliminarProductoRegistrado(delProd.getAttribute('data-del-prod'));return;}

    const editIng=e.target.closest('[data-edit-ing]');
    if(editIng){editarIngreso(editIng.getAttribute('data-edit-ing'));return;}

    const delLote=e.target.closest('[data-del-lote]');
    if(delLote){
      const loteId=delLote.getAttribute('data-del-lote');
      const pid=delLote.getAttribute('data-lote-prod');
      if(!confirm('¿Eliminar este lote? El stock se recalculará.'))return;
      // Also delete associated ingreso
      const ingresos=getIngresos();
      const ing=ingresos.find(x=>x.lote_id===loteId);
      const lotes=getLotes();
      if(lotes[pid])lotes[pid]=lotes[pid].filter(l=>l.id!==loteId);
      saveLotes(lotes);
      if(ing)deleteIngreso(ing.id);
      renderProductosRegistrados();renderInvStock();renderStockMiniPanel();sN('Lote eliminado');
      // Re-open the panel
      setTimeout(()=>{
        const body=document.getElementById('preg-body-'+pid);
        const arr=document.getElementById('preg-arr-'+pid);
        if(body){body.style.display='';if(arr)arr.textContent='▾';}
      },50);
      return;
    }

    const nuevoIng=e.target.closest('[data-nuevo-ing]');
    if(nuevoIng){
      const pid=nuevoIng.getAttribute('data-nuevo-ing');
      // Pre-select product in form and scroll up
      invSubNav('ingresos');
      setTimeout(()=>{
        const sel=document.getElementById('ing-prod');
        if(sel){sel.value=pid;ingPreview();}
        document.getElementById('inv-ingreso-form')?.scrollIntoView({behavior:'smooth',block:'start'});
      },80);
      return;
    }

    const seedBtn=e.target.closest('[data-seed-prod]');
    if(seedBtn){
      const pid=seedBtn.getAttribute('data-seed-prod');
      const qty=parseFloat(document.getElementById('seed-qty-'+pid)?.value)||1;
      const costo=parseFloat(document.getElementById('seed-costo-'+pid)?.value)||0;
      const prov=document.getElementById('seed-prov-'+pid)?.value.trim()||'Stock inicial';
      const nota=document.getElementById('seed-nota-'+pid)?.value.trim()||'Lote inicial';
      if(!costo){sN('Ingresá el costo unitario',true);return;}
      // Register as a proper ingreso
      const id=newIngresoId();
      const ts=new Date().toISOString();
      const fecha_display=d2s(hoy())+' '+ts.substring(11,16);
      const lotes=getLotes();
      if(!lotes[pid])lotes[pid]=[];
      const loteId=id+'-L1';
      lotes[pid].push({id:loteId,ingreso_id:id,fecha:ts,qty_inicial:qty,qty_restante:qty,costo_unitario:costo,proveedor:prov,nota});
      saveLotes(lotes);
      saveIngreso({id,fecha:ts,fecha_display,prod_id:pid,qty,costo_unitario:costo,total:qty*costo,proveedor:prov,nota,lote_id:loteId});
      addStockMov({fecha:ts,tipo:'S-TICKET',prodId:pid,nombre:getAllStockItems().find(x=>x.id===pid)?.nombre||pid,emoji:getAllStockItems().find(x=>x.id===pid)?.emoji||'📦',delta:qty,antes:0,despues:qty,nota:'Lote inicial '+id});
      renderProductosRegistrados();renderInvStock();renderStockMiniPanel();window.buildTicketUI?.();window.upd?.();
      sN('✓ '+id+' — lote inicial registrado');
      // Re-open this product's panel
      setTimeout(()=>{
        const body=document.getElementById('preg-body-'+pid);
        const arr=document.getElementById('preg-arr-'+pid);
        if(body){body.style.display='';if(arr)arr.textContent='▾';}
      },80);
      return;
    }
  };
}

export function eliminarProductoRegistrado(pid){
  const p=getProductos().find(x=>x.id===pid);if(!p)return;
  const stock=getStockFromLotes(pid);
  const msg=stock>0
    ?`¿Eliminar ${p.emoji} ${p.nombre}? Tiene ${stock} ${p.unit||'ud'} en stock. También se eliminarán todos sus lotes e ingresos.`
    :`¿Eliminar ${p.emoji} ${p.nombre} del sistema?`;
  if(!confirm(msg))return;
  // Remove lotes
  const lotes=getLotes();
  delete lotes[pid];
  saveLotes(lotes);
  // Remove ingresos
  const d=ld();
  d.ingresos=(d.ingresos||[]).filter(x=>x.prod_id!==pid);
  // Deactivate product (safer than full delete for legacy compat)
  const prods=getProductos();
  const idx=prods.findIndex(x=>x.id===pid);
  if(idx>=0)prods.splice(idx,1);
  d.productos=prods;
  sd(d);
  loadConfig();window.buildTicketUI?.();window.upd?.();renderProductosRegistrados();renderInvStock();renderStockMiniPanel();
  sN(`${p.nombre} eliminado`);
}

export function renderIngresosHistorial(){
  // Legacy alias — now rendered inside renderProductosRegistrados
  renderProductosRegistrados();
}

export function editarIngreso(id){
  const ing=getIngresos().find(x=>x.id===id);if(!ing)return;
  const IS='width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:8px 10px;outline:none;min-height:40px';
  const LB='font-family:var(--mo);font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase';

  document.getElementById('mTitEl').textContent='✏ Editar Ingreso — '+id;
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal';
  document.getElementById('mTk').style.display='none';
  document.getElementById('mBody').innerHTML=
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
    +'<div style="grid-column:1/-1"><label style="'+LB+'">ID</label><input style="'+IS+';color:var(--tx3)" value="'+id+'" disabled></div>'
    +'<div><label style="'+LB+'">Cantidad</label><input type="number" id="edit-ing-qty" value="'+ing.qty+'" style="'+IS+'"></div>'
    +'<div><label style="'+LB+'">Costo unitario</label><input type="number" id="edit-ing-costo" value="'+ing.costo_unitario+'" style="'+IS+'"></div>'
    +'<div><label style="'+LB+'">Proveedor</label><input type="text" id="edit-ing-prov" value="'+(ing.proveedor||'')+'" style="'+IS+'"></div>'
    +'<div><label style="'+LB+'">Nota</label><input type="text" id="edit-ing-nota" value="'+(ing.nota||'')+'" style="'+IS+'"></div>'
    +'</div>';
  document.getElementById('mFooter').innerHTML=
    '<button class="btn btn-p" id="edit-ing-save">💾 Guardar</button>'
    +'<button class="btn btn-s" onclick="clM()">✕ Cancelar</button>';
  document.getElementById('edit-ing-save').onclick=function(){
    const qty=parseFloat(document.getElementById('edit-ing-qty').value)||0;
    const costo=parseFloat(document.getElementById('edit-ing-costo').value)||0;
    if(!qty||!costo){sN('Cantidad y costo requeridos',true);return;}
    const diff=qty-ing.qty;
    ing.qty=qty;ing.costo_unitario=costo;ing.total=qty*costo;
    ing.proveedor=document.getElementById('edit-ing-prov').value.trim();
    ing.nota=document.getElementById('edit-ing-nota').value.trim();
    saveIngreso(ing);
    // Update lote
    const lotes=getLotes();
    if(lotes[ing.prod_id]){
      const lote=lotes[ing.prod_id].find(l=>l.id===ing.lote_id);
      if(lote){lote.qty_inicial=qty;lote.qty_restante=Math.max(0,lote.qty_restante+diff);
        lote.costo_unitario=costo;lote.proveedor=ing.proveedor;lote.nota=ing.nota;}
      saveLotes(lotes);
    }
    window.clM?.();renderProductosRegistrados();renderInvStock();renderStockMiniPanel();sN('✓ Ingreso actualizado');
  };
  document.getElementById('modal').classList.add('open');
}

export function eliminarIngreso(id){
  if(!confirm('¿Eliminar ingreso '+id+'? El lote asociado también se eliminará.'))return;
  const ing=getIngresos().find(x=>x.id===id);
  if(ing){
    const lotes=getLotes();
    if(lotes[ing.prod_id])lotes[ing.prod_id]=lotes[ing.prod_id].filter(l=>l.id!==ing.lote_id);
    saveLotes(lotes);
  }
  deleteIngreso(id);
  renderProductosRegistrados();renderInvStock();renderStockMiniPanel();sN('Ingreso eliminado');
}

// ════════════════════════════════════════
// RECONCILIACIÓN LOTES ↔ STOCK PLANO
// ════════════════════════════════════════
// Propósito: sincronizar qty_restante de lotes con el stock plano (fuente de verdad histórica).
// Necesario cuando lotes fueron seeded con valor distinto al stock real acumulado.
// Es idempotente: si ya están sincronizados, no modifica nada.
export function reconcileLotesConStock(){
  const stock=getStock();
  const lotes=getLotes();
  const prods=Object.keys(lotes);
  if(!prods.length){sN('Sin lotes registrados para reconciliar');return;}

  let cambios=0;
  const detalle=[];
  prods.forEach(prodId=>{
    const plano=stock[prodId]||0;
    const items=lotes[prodId]||[];
    items.sort((a,b)=>a.fecha.localeCompare(b.fecha));// FIFO: más antiguo primero
    const totalRest=items.reduce((a,l)=>a+l.qty_restante,0);
    if(totalRest===plano)return;// ya sincronizados
    const diff=plano-totalRest;// + = necesita agregar, - = necesita drenar
    const prod=getProductos().find(p=>p.id===prodId);
    const nombre=(prod?prod.nombre:prodId);const emoji=(prod?prod.emoji:'📦');
    if(diff>0){
      // Plano tiene más que lotes: agregar al lote más reciente
      const last=items[items.length-1];
      if(last){
        last.qty_restante+=diff;cambios++;detalle.push(`${prodId}: +${diff}`);
        addStockMov({fecha:new Date().toISOString(),tipo:'AJUSTE',prodId,nombre,emoji,delta:diff,antes:totalRest,despues:plano,nota:'Reconciliación lotes↔plano'});
      }
    } else {
      // Lotes tienen más que plano: drenar desde el más antiguo (FIFO)
      let aDrenar=-diff;
      for(const l of items){
        if(aDrenar<=0)break;
        const consume=Math.min(l.qty_restante,aDrenar);
        l.qty_restante-=consume;aDrenar-=consume;
      }
      cambios++;detalle.push(`${prodId}: -${-diff}`);
      addStockMov({fecha:new Date().toISOString(),tipo:'AJUSTE',prodId,nombre,emoji,delta:diff,antes:totalRest,despues:plano,nota:'Reconciliación lotes↔plano'});
    }
  });

  if(cambios>0){
    saveLotes(lotes);
    renderInvStock();renderStockMiniPanel();window.buildTicketUI?.();window.upd?.();
    sN(`✓ ${cambios} producto(s) reconciliados: ${detalle.join(', ')}`);
  } else {
    sN('✓ Lotes ya sincronizados con stock plano — sin cambios');
  }
}

// Calcula divergencia total entre lotes y stock plano (para mostrar warning)
function _calcDivergencia(){
  const stock=getStock();const lotes=getLotes();
  let total=0;
  Object.keys(lotes).forEach(prodId=>{
    const plano=stock[prodId]||0;
    const loteRest=(lotes[prodId]||[]).reduce((a,l)=>a+l.qty_restante,0);
    total+=Math.abs(loteRest-plano);
  });
  return total;
}

// ── Render principal ──
export function renderInvStock(){
  renderInvStockTabla();
}

export function renderInventario(){
  invSubNav('ingresos');
}

export function renderInventarioTabla(){renderInvStockTabla();}

// ── Historial de movimientos global (tab movs) ──
export function renderStockHistorial(){
  const allMovs=getStockMovs();
  const cont=document.getElementById('stockHistorial');if(!cont)return;
  const filtType=document.getElementById('filtSMov')?.value||'all';
  const indexed=allMovs.map((m,i)=>({m,i})).reverse();
  let filtered=indexed;
  if(filtType==='VENTA')filtered=indexed.filter(x=>x.m.tipo==='VENTA');
  else if(filtType==='AJUSTE')filtered=indexed.filter(x=>x.m.tipo==='AJUSTE');

  if(!filtered.length){
    cont.innerHTML='<div style="padding:20px;font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center">Sin movimientos.</div>';
    return;
  }
  const groups={};
  filtered.forEach(x=>{
    const dia=x.m.fecha?x.m.fecha.substring(0,10):'—';
    if(!groups[dia])groups[dia]=[];groups[dia].push(x);
  });
  const dias=Object.keys(groups).sort().reverse();
  const hoyStr=hoy();let html='';
  dias.forEach(dia=>{
    const isHoy=dia===hoyStr;
    const items=groups[dia];
    const colId='smov-'+dia.replace(/-/g,'');
    const totD=items.reduce((a,x)=>a+(x.m.delta||0),0);
    const dCls=totD>0?'var(--ac)':'var(--er)';
    html+='<div style="margin-bottom:4px">'
      +'<div data-toggle-grp="'+colId+'" style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--s2);border:1px solid var(--br);cursor:pointer;border-left:3px solid '+(isHoy?'var(--ac)':'var(--br)')+'">'
      +'<div style="display:flex;align-items:center;gap:8px"><span id="'+colId+'-arrow" style="font-family:var(--mo);font-size:10px;color:var(--tx3)">'+(isHoy?'▾':'▸')+'</span>'
      +'<span style="font-family:var(--mo);font-size:9px;font-weight:700;color:'+(isHoy?'var(--ac)':'var(--tx2)')+'">'+d2s(dia)+'</span>'
      +'<span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">'+items.length+' mov.</span></div>'
      +'<span style="font-family:var(--mo);font-size:10px;color:'+dCls+'">'+(totD>0?'+':'')+totD+'</span></div>'
      +'<div id="'+colId+'" style="display:'+(isHoy?'block':'none')+'">';
    items.forEach(({m,i})=>{
      const d=new Date(m.fecha);
      const hora=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
      const dc=m.delta>0?'var(--ac)':'var(--er)';
      const tp={
        'VENTA':   {bg:'rgba(255,68,85,.1)',   col:'#ff4455',  lbl:'VENTA'},
        'S-TICKET':{bg:'rgba(0,229,160,.1)',   col:'#00e5a0',  lbl:'INGRESO'},
        'AJUSTE':  {bg:'rgba(255,170,0,.1)',   col:'#ffaa00',  lbl:'AJUSTE'},
      }[m.tipo]||{bg:'rgba(136,136,160,.1)',col:'var(--tx3)',lbl:m.tipo||'—'};
      // Show ingreso ID from nota if available
      const notaStr=m.nota?(' · <span style="color:var(--ac2)">'+m.nota+'</span>'):'';
      html+='<div style="display:flex;align-items:center;gap:8px;padding:7px 12px;border-bottom:1px solid rgba(42,42,58,.2);background:var(--s1)">'
        +'<span style="font-family:var(--mo);font-size:8px;color:var(--tx3);width:32px;flex-shrink:0">'+hora+'</span>'
        +'<span style="font-family:var(--mo);font-size:7px;font-weight:700;padding:2px 6px;background:'+tp.bg+';color:'+tp.col+';border:1px solid '+tp.col+'40;flex-shrink:0">'+tp.lbl+'</span>'
        +'<span style="font-size:12px;flex-shrink:0">'+(m.emoji||'')+'</span>'
        +'<span style="font-family:var(--mo);font-size:10px;color:var(--tx2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(m.nombre||m.prodId||'')+notaStr+'</span>'
        +'<span style="font-family:var(--mo);font-size:9px;color:var(--tx3);flex-shrink:0">'+m.antes+'</span>'
        +'<span style="font-family:var(--mo);font-size:11px;font-weight:700;color:'+dc+';flex-shrink:0">'+(m.delta>0?'+':'')+m.delta+'</span>'
        +'<span style="font-family:var(--mo);font-size:11px;font-weight:700;color:var(--tx);flex-shrink:0">'+m.despues+'</span>'
        +'<button data-del-mov="'+i+'" style="background:none;border:1px solid var(--br);color:var(--tx3);font-size:11px;width:22px;height:22px;cursor:pointer;flex-shrink:0">×</button>'
        +'</div>';
    });
    html+='</div></div>';
  });
  cont.innerHTML=html;
  cont.onclick=function(e){
    const delBtn=e.target.closest('[data-del-mov]');
    if(delBtn){const idx=parseInt(delBtn.getAttribute('data-del-mov'));if(!confirm('¿Eliminar?'))return;eliminarMov(idx);return;}
    const tog=e.target.closest('[data-toggle-grp]');
    if(tog){const id=tog.getAttribute('data-toggle-grp');const el=document.getElementById(id);const ar=document.getElementById(id+'-arrow');if(!el)return;const open=el.style.display==='none';el.style.display=open?'block':'none';if(ar)ar.textContent=open?'▾':'▸';}
  };
}


// ── ticket stock discount ──
// INVARIANTE: stock plano (d.stock) es la fuente de verdad histórica — se decrementa
// con su propia matemática. consumirStock decrementa lotes en paralelo (FIFO cost tracking).
// NO usar getActualQty() para calcular 'despues' — los lotes pueden estar desincronizados
// con el plano hasta que el usuario corra reconcileLotesConStock().
export function descontarStockPorTicket(lineas){
  const stock=getStock();const fecha=new Date().toISOString();
  lineas.forEach(ln=>{
    if(ln.consulta||!ln.qty)return;
    const key=ln.varId||ln.prodId;
    consumirStock(key,ln.qty);              // decrementa FIFO en d.lotes (si existen)
    const antes=stock[key]||0;             // plano: fuente de verdad histórica
    const despues=Math.max(0,antes-ln.qty);
    stock[key]=despues;
    addStockMov({fecha,tipo:'VENTA',prodId:key,nombre:ln.nombre,emoji:ln.emoji,delta:-(antes-despues),antes,despues,nota:'Ticket generado'});
    if(ln.varId&&ln.prodId){
      const grpKey='grp-'+ln.prodId;
      if(stock[grpKey]!=null){
        const gA=stock[grpKey]||0;const gD=Math.max(0,gA-ln.qty);stock[grpKey]=gD;
      }
    }
  });
  saveStock(stock);
}

// ── ticket mini-panel alerts ──
export function renderStockMiniPanel(){
  // Panel de advertencias eliminado — stock visible en 📦 Inventario
}

// ── dashboard stock panel (sin KPI counters) ──
export function renderDashStock(f){
  const allItems=getAllStockItems();const stock=getStock();
  let orders=gOConf();
  const cont=document.getElementById('dashStockPanel');if(!cont)return;

  let periodDays=30,periodLabel='mes';
  if(f==='rango'){
    const desde=document.getElementById('dashDesde')?.value;
    const hasta=document.getElementById('dashHasta')?.value;
    if(desde&&hasta){
      orders=orders.filter(o=>o.fecha>=desde&&o.fecha<=hasta);
      const d1=new Date(desde),d2=new Date(hasta);
      periodDays=Math.max(1,Math.round((d2-d1)/(1000*60*60*24)));
      periodLabel=`${periodDays}d`;
    }
  } else if(f!=='all'){
    orders=orders.filter(o=>o.mesActual===f);
    periodLabel=mL(f);
  }

  const topItems=allItems.filter(it=>!it.parentId||it.isGroup);
  const childItems=allItems.filter(it=>it.parentId&&!it.isGroup);

  const soldMap={};
  orders.forEach(o=>{
    const p=o.productos||{};
    if(p._lineas&&p._lineas.length){
      p._lineas.forEach(ln=>{
        const k=ln.varId||ln.prodId;
        soldMap[k]=(soldMap[k]||0)+(ln.qty||0);
        if(ln.varId){soldMap['grp-'+ln.prodId]=(soldMap['grp-'+ln.prodId]||0)+(ln.qty||0);}
      });
    } else {
      if((p.calaveras||0)>0){soldMap['p-past']=(soldMap['p-past']||0)+(p.calaveras||0);soldMap['v-cal']=(soldMap['v-cal']||0)+(p.calaveras||0);}
      if((p.teddy||0)>0){soldMap['p-past']=(soldMap['p-past']||0)+(p.teddy||0);soldMap['v-ted']=(soldMap['v-ted']||0)+(p.teddy||0);}
      if((p.lucky||0)>0){soldMap['p-past']=(soldMap['p-past']||0)+(p.lucky||0);soldMap['v-lck']=(soldMap['v-lck']||0)+(p.lucky||0);}
      if((p.genericas||0)>0){soldMap['p-past']=(soldMap['p-past']||0)+(p.genericas||0);soldMap['v-gen']=(soldMap['v-gen']||0)+(p.genericas||0);}
      if((p.cristales||0)>0) soldMap['p-cris']=(soldMap['p-cris']||0)+(p.cristales||0);
      if((p.hongos||0)>0) soldMap['p-hong']=(soldMap['p-hong']||0)+(p.hongos||0);
      if((p.goteros||0)>0) soldMap['p-got']=(soldMap['p-got']||0)+(p.goteros||0);
      if((p.petri||0)>0) soldMap['p-pet']=(soldMap['p-pet']||0)+(p.petri||0);
    }
  });

  function stEmoji(st){
    if(st==='empty') return'⛔';
    if(st==='crit')  return'🔴';
    if(st==='warn')  return'🟡';
    return'🟢';
  }
  function qtyStr(qty,unit,st){
    const col=st==='ok'?'var(--ac)':st==='warn'?'var(--wn)':'var(--er)';
    return`<span style="font-family:var(--mo);font-weight:700;color:${col}">${qty}${unit}</span>`;
  }
  function daysLeft(qty,sold){
    if(sold<=0||qty<=0)return'—';
    const r=sold/periodDays;
    return r>0?'~'+Math.floor(qty/r)+'d':'—';
  }

  let rows='';
  topItems.forEach(it=>{
    const qty=stock[it.id]||0;
    const st=getStockStatus(qty,it.id);
    const unit=it.unit||'ud';
    const sold=soldMap[it.id]||0;

    if(it.isGroup){
      const children=childItems.filter(c=>c.parentId===it.id);
      rows+=`<tr style="background:rgba(124,111,255,.06)">
        <td><span style="color:var(--ac2);font-size:10px">▸</span> ${it.emoji} ${it.nombre} <span style="font-family:var(--mo);font-size:7px;color:var(--ac2)">GRP</span></td>
        <td>${stEmoji(st)} ${qtyStr(qty,unit,st)}</td>
        <td class="mu">${sold||'—'}</td>
        <td class="mu">${daysLeft(qty,sold)}</td>
      </tr>`;
      children.forEach(c=>{
        const cqty=stock[c.id]||0;const cst=getStockStatus(cqty,c.id);const csold=soldMap[c.id]||0;
        rows+=`<tr style="opacity:.85">
          <td style="padding-left:20px"><span style="color:var(--tx3)">↳</span> ${c.emoji} ${c.nombre}</td>
          <td>${stEmoji(cst)} ${qtyStr(cqty,unit,cst)}</td>
          <td class="mu">${csold||'—'}</td>
          <td class="mu">${daysLeft(cqty,csold)}</td>
        </tr>`;
      });
    } else {
      rows+=`<tr>
        <td>${it.emoji} ${it.nombre}</td>
        <td>${stEmoji(st)} ${qtyStr(qty,unit,st)}</td>
        <td class="mu">${sold||'—'}</td>
        <td class="mu">${daysLeft(qty,sold)}</td>
      </tr>`;
    }
  });

  cont.innerHTML=`<div class="tw"><table>
    <thead><tr><th>Producto</th><th>Stock</th><th>Vendido ${periodLabel}</th><th>Días est.</th></tr></thead>
    <tbody>${rows||'<tr><td colspan="4" style="text-align:center;color:var(--tx3);padding:20px">Sin datos</td></tr>'}</tbody>
  </table></div>`;
}

// ══════════════════════════════════════════════════════

export function renderStockEntryForm(){
  const items=getAllStockItems();
  const cont=document.getElementById('stockEntryForm');if(!cont)return;
  let options = items.map(it=>`<option value="${it.nombre}" data-id="${it.id}">`).join('');
  cont.innerHTML=`
    <div style="background:var(--s1);padding:15px;border:1px solid var(--br);border-radius:4px">
      <div style="font-family:var(--mo);font-size:11px;color:var(--ac);letter-spacing:1px;text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:8px">
        <span>📥 Registrar Entrada de Mercadería</span>
        <span style="font-size:8px;color:var(--tx3);background:var(--s2);padding:2px 6px;border-radius:10px">S-TICKET</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
        <div>
          <label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Producto / Variante</label>
          <input type="text" id="s-prod-name" list="prodList" placeholder="Escribe o selecciona..." style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none">
          <datalist id="prodList">${options}</datalist>
        </div>
        <div>
          <label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Fecha</label>
          <input type="date" id="s-fecha" value="${hoy()}" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:15px">
        <div>
          <label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Cantidad</label>
          <input type="number" id="s-qty" placeholder="0.00" step="any" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none">
        </div>
        <div>
          <label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Costo Reposición (opcional)</label>
          <input type="number" id="s-costo" placeholder="$ 0.00" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none">
        </div>
        <div>
          <label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Nota / Lote</label>
          <input type="text" id="s-nota" placeholder="Ej: Lote A1" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none">
        </div>
      </div>
      <button class="btn btn-p" style="width:100%;height:44px" onclick="generarStockTicket()">💾 Registrar Entrada y Generar S-Ticket</button>
    </div>`;
}

export function generarStockTicket(){
  const name=document.getElementById('s-prod-name').value.trim();
  const qty=parseFloat(document.getElementById('s-qty').value)||0;
  const costoUsd=parseFloat(document.getElementById('s-costo').value)||0;
  const fecha=document.getElementById('s-fecha').value||hoy();
  const nota=document.getElementById('s-nota').value.trim();
  if(!name||qty<=0){sN('ERROR: Producto y cantidad requeridos',true);return;}
  const prods=getProductos();const items=getAllStockItems();
  const matched=items.find(it=>it.nombre.toLowerCase()===name.toLowerCase());
  let targetId=null;let emoji='📦';let displayName=name;let unit='ud';
  if(matched){
    targetId=matched.id;emoji=matched.emoji;displayName=matched.nombre;unit=matched.unit;
  } else {
    if(!confirm(`El producto "${name}" no existe. ¿Crearlo automáticamente?`))return;
    const newId=uid();
    prods.push({id:newId,emoji:'📦',nombre:name,costo:0,unit:'ud',tipo:'fijo',agrupacion:'individual',tramos:[{t:1,p:0}],variantes:[],activo:true});
    saveProductos(prods);loadConfig();window.buildTicketUI?.();window.upd?.();
    targetId=newId;
  }
  // Crear lote FIFO
  agregarLote(targetId,{qty,costoUsd:costoUsd||0,fecha,nota:nota||'Entrada de mercadería'});
  const tc=window._blueARS||window._usdtARS||1;
  const costoArs=costoUsd?costoUsd*tc:0;
  const fd=d2s(fecha);
  let tk=`🧾 S-Ticket Entrada\n📅 Fecha: ${fd}\n📦 ${emoji} ${displayName}\n📥 +${qty} ${unit}`;
  if(costoUsd)tk+=`\n💵 Costo: US$${fu(costoUsd)}/ud · TC $${fi(Math.round(tc))} = $${fi(Math.round(costoArs))}/ud`;
  if(nota)tk+=`\n📝 ${nota}`;
  tk+=`\n📊 Stock nuevo: ${getActualQty(targetId)} ${unit}`;
  sN(`✓ Lote registrado: ${qty} ud`);
  renderInventario();
  document.getElementById('mTitEl').textContent='📥 Entrada Registrada';
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal';
  document.getElementById('mTk').style.display='block';
  document.getElementById('mTk').className='mtk';
  document.getElementById('mTk').textContent=tk;
  document.getElementById('mBody').innerHTML='';
  document.getElementById('mFooter').innerHTML=`<button class="btn btn-s" onclick="cpM()">⎘ Copiar</button><button class="btn btn-s" onclick="clM()">✕ Cerrar</button>`;
  document.getElementById('modal').classList.add('open');
}
