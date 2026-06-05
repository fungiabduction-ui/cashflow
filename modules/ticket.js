import { ld } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fv, fi, fu, pn, hoy, d2m, d2s, gtr } from '../core/formatters.js';
import { PT, CT, HT, GP, PP, COSTS } from '../core/config.js';
import { nId } from '../core/ids.js';
import { sO, confirmarOrden } from './ventas.js';
import { getProductos } from './productos.js';
import { getTramosProducto } from './listas-precios.js';
import { descontarStockPorTicket, renderStockMiniPanel } from './inventario.js';
import { getActualQty, getStockStatus } from './stock.js';

// ── TICKET DINÁMICO ──
let tipoPago='ARS';
let _lastTicketId=null;

export function setTP(t){
  tipoPago=t;
  const sel=document.getElementById('selTP');
  if(sel&&sel.value!==t)sel.value=t;
  const tcBlock=document.getElementById('tcBlock');
  const tcLabel=document.getElementById('tcLabel');
  if(tcBlock) tcBlock.style.display=(t==='USD'||t==='USDT')?'block':'none';
  if(tcLabel) tcLabel.textContent=t==='USD'?'TC — ARS por 1 USD':'TC — ARS por 1 USDT';
  // auto-fill TC from precios if available
  const inp=document.getElementById('tc-valor');
  if(inp&&!inp.value){
    if(t==='USD'&&window._blueARS)  inp.value=window._blueARS;
    if(t==='USDT'&&window._usdtARS) inp.value=window._usdtARS;
  }
  upd();
}

export function buildTicketUI(){
  const prods=getProductos().filter(p=>p.activo);
  const cont=document.getElementById('prodRows');
  if(!cont)return;
  function stockHint(id){
    return`<span id="sh-${id}" class="tk-stock-hint"></span>`;
  }
  let html='';
  prods.forEach(prod=>{
    const isGram=prod.unit==='g';
    html+=`<div class="prod-row"><div class="pi">${prod.emoji}</div><div class="pinfo"><div class="pname">${prod.nombre}${isGram?' ('+prod.unit+')':''}</div><div class="psub"><span class="pup" id="up-${prod.id}">—</span><span class="plt" id="p-${prod.id}"></span>${stockHint(prod.id)}</div></div><div class="qwrap"><div class="qc"><button class="qb minus" onclick="adj('${prod.id}',-1)">−</button><input class="${isGram?'qv dec':'qv'}" type="number" min="0" step="1" id="q-${prod.id}" placeholder="0" oninput="upd()"><button class="qb plus" onclick="adj('${prod.id}',1)">+</button></div><button class="qrst" onclick="rstDel('${prod.id}')">×</button></div></div>`;
    html+=`<div class="dv"></div>`;
  });
  html+=`<div class="var-row"><div class="pi">💲</div><div class="pinfo"><div class="pname">Variable</div><div style="font-size:8px;color:var(--tx3);font-family:var(--mo)">monto directo</div></div><input type="number" min="0" id="q-var" placeholder="0" oninput="upd()" style="min-height:var(--touch)"><button class="qrst" onclick="rst('var')">×</button></div>`;
  cont.innerHTML=html;
  updStockHints();
}

// ── Stock hints en el ticket (semáforo por producto) ──
export function updStockHints(){
  const prods=getProductos().filter(p=>p.activo);
  function qInTicket(id){return parseFloat(document.getElementById('q-'+id)?.value)||0;}
  prods.forEach(prod=>{
    const pStock=getActualQty(prod.id);
    const pRest=pStock-qInTicket(prod.id);// negativo = oversell permitido con aviso
    _setHint(prod.id,pRest,prod.unit||'ud');
  });
}
function _setHint(id,pRest,unit){
  const el=document.getElementById('sh-'+id);
  if(!el)return;
  if(pRest<0){
    el.textContent=`⚠ falta ${Math.abs(pRest)}${unit}`;
    el.className='tk-stock-hint oversell';
    return;
  }
  const st=getStockStatus(pRest,id);
  const labels={empty:'⛔ sin stock',crit:`🔴 ${pRest}${unit}`,warn:`🟡 ${pRest}${unit}`,ok:`🟢 ${pRest}${unit}`};
  el.textContent=labels[st]||'';
  el.className='tk-stock-hint'+(st==='ok'&&pRest>0?' ok':st==='warn'?' warn':st==='crit'?' crit':st==='empty'?' empty':'');
}

export function adj(k,delta){const el=document.getElementById('q-'+k);if(!el)return;const cur=parseFloat(el.value)||0;const n=Math.max(0,parseFloat((cur+delta).toFixed(2)));el.value=n===0?'':n;upd();}
export function rst(k){const el=document.getElementById('q-'+k);if(el){el.value='';upd();}}
export function rstDel(k){
  if(k==='var'){
    const el=document.getElementById('q-var');
    const val=parseFloat(el?.value)||0;
    if(val>0){el.value='';upd();}
    else if(!confirm('¿Eliminar "Variable" del sistema?\nPodrás volver a agregarlo desde Configuración.'))return;
    return;
  }
  const el=document.getElementById('q-'+k);
  const val=parseFloat(el?.value)||0;
  if(val>0){el.value='';upd();return;}
  window.eliminarProducto?.(k);
}
export function gn(id){return parseFloat(document.getElementById(id)?.value)||0;}

export function resetTodo(){
  if(!confirm('¿Resetear?'))return;
  const prods=getProductos().filter(p=>p.activo);
  prods.forEach(prod=>rst(prod.id));
  rst('var');
  ['nota','cliente'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('fecha').value=hoy();
  ['ajuste-valor','tc-valor'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const at=document.getElementById('ajuste-tipo');if(at)at.value='ninguno';
  const ap=document.getElementById('ajuste-preview');if(ap)ap.style.display='none';
  setTP('ARS');
  document.getElementById('outA').style.display='none';
  upd();window.scrollTo({top:0,behavior:'smooth'});
}

// ── TC helpers ──
export function getTC(){
  const v=parseFloat(document.getElementById('tc-valor')?.value)||0;
  if(tipoPago==='USD')  return{usd:v,usdt:window._usdtARS||v,usdUsdt:window._usdtARS&&window._blueARS?window._usdtARS/window._blueARS:1};
  if(tipoPago==='USDT') return{usd:window._blueARS||v,usdt:v,usdUsdt:window._usdtARS&&window._blueARS?window._usdtARS/window._blueARS:1};
  return{usd:window._blueARS||0,usdt:window._usdtARS||0,usdUsdt:1};
}
export function autoFillTC(){
  const inp=document.getElementById('tc-valor');
  if(!inp)return;
  if(tipoPago==='USD'&&window._blueARS)  {inp.value=window._blueARS; upd();}
  else if(tipoPago==='USDT'&&window._usdtARS){inp.value=window._usdtARS;upd();}
}

// ── Sincronizar campos legacy de ajuste desde selector ──
export function syncAjuste(){
  const tipo=document.getElementById('ajuste-tipo')?.value||'ninguno';
  const val=parseFloat(document.getElementById('ajuste-valor')?.value)||0;
  const fields=['rec-pct','rec-fijo','desc-pct','desc-fijo'];
  fields.forEach(id=>{const el=document.getElementById(id);if(el)el.value='0';});
  if(tipo!=='ninguno'){const el=document.getElementById(tipo);if(el)el.value=val||0;}
}

// ── HELPER: leer composición de pago según modo ──
export function getPayment(totalFinal){
  const tcV=parseFloat(document.getElementById('tc-valor')?.value)||0;
  if(tipoPago==='USD'){
    const usdCalc=tcV>0?parseFloat((totalFinal/tcV).toFixed(2)):totalFinal;
    const arsFromUsd=tcV>0?Math.round(usdCalc*tcV):totalFinal;
    return{ars:0,usd:usdCalc,usdt:0,tc:tcV,tc_usd:tcV,tc_usdt:window._usdtARS||0,total_ars:arsFromUsd,total_usdt:null,modo:'USD'};
  }
  if(tipoPago==='USDT'){
    const usdtCalc=tcV>0?parseFloat((totalFinal/tcV).toFixed(2)):totalFinal;
    const arsFromUsdt=tcV>0?Math.round(usdtCalc*tcV):totalFinal;
    return{ars:0,usd:0,usdt:usdtCalc,tc:tcV,tc_usd:window._blueARS||0,tc_usdt:tcV,total_ars:arsFromUsdt,total_usdt:usdtCalc,modo:'USDT'};
  }
  return{ars:totalFinal,usd:0,usdt:0,tc:0,tc_usd:0,tc_usdt:0,total_ars:totalFinal,total_usdt:null,modo:'ARS'};
}

export function calc(){
  const prods=getProductos().filter(p=>p.activo);
  const lineas=[];
  let tot=0,costo=0;
  const legacyMap={};

  // ── PASO 1: agrupar cantidades por listaPrecioId (solo tipo 'tramos') ──
  const gruposVol={};// {listaPrecioId: totalQty}
  prods.forEach(prod=>{
    const q=gn('q-'+prod.id);
    if(q>0&&prod.tipo==='tramos'&&prod.listaPrecioId&&!(prod.maxConsulta&&q>=prod.maxConsulta)){
      gruposVol[prod.listaPrecioId]=(gruposVol[prod.listaPrecioId]||0)+q;
    }
  });

  prods.forEach(prod=>{
    const q=gn('q-'+prod.id);
    if(q>0){
      const tramos=getTramosProducto(prod);
      if(prod.maxConsulta&&q>=prod.maxConsulta){
        lineas.push({emoji:prod.emoji,nombre:prod.nombre,qty:q,unit:prod.unit,consulta:true,prodId:prod.id,legacyKey:prod.legacyKey});
      } else {
        let precio=null,tramo=null;
        if(prod.tipo==='fijo'){precio=tramos[0]?.p||0;}
        else{
          // ── PASO 2: usar qty agrupada del grupo si aplica ──
          const qEval=(prod.listaPrecioId&&gruposVol[prod.listaPrecioId]>q)
            ?gruposVol[prod.listaPrecioId]:q;
          const r=gtr(tramos,qEval);if(r){precio=r.p;tramo=r.t;}
        }
        const subtotal=q*(precio||0);
        lineas.push({emoji:prod.emoji,nombre:prod.nombre,qty:q,unit:prod.unit,precio,tramo,subtotal,prodId:prod.id,legacyKey:prod.legacyKey,qGrupo:gruposVol[prod.listaPrecioId]||q});
        tot+=subtotal;
        if(prod.legacyKey)legacyMap[prod.legacyKey]={qty:q,precio,tramo,subtotal};
        costo+=q*(prod.costo||0);
        // Legacy pastillas map (suma todas las variantes)
        if(['v-cal','v-ted','v-lck','v-gen'].includes(prod.id)){
          legacyMap['_totalPastillas']=(legacyMap['_totalPastillas']||0)+q;
          legacyMap['_precioPastilla']=precio;
          legacyMap['_tramoInfo']=tramo;
          legacyMap['_totalPastillasLinea']=(legacyMap['_totalPastillasLinea']||0)+subtotal;
        }
      }
    }
  });

  const qV=gn('q-var');
  tot+=qV;

  // Ajuste recargo/descuento
  const recargoPct  = parseFloat(document.getElementById('rec-pct')?.value)  || 0;
  const recargoFijo = parseFloat(document.getElementById('rec-fijo')?.value) || 0;
  const descPct     = parseFloat(document.getElementById('desc-pct')?.value) || 0;
  const descFijo    = parseFloat(document.getElementById('desc-fijo')?.value) || 0;
  const recargoPctMonto  = tot * (recargoPct / 100);
  const recargoFijoMonto = recargoFijo;
  const descPctMonto     = tot * (descPct / 100);
  const descFijoMonto    = descFijo;
  const ajusteNeto = recargoPctMonto + recargoFijoMonto - descPctMonto - descFijoMonto;
  const totalFinal = tot + ajusteNeto;
  const ajuste = {recargoPct,recargoFijo,descPct,descFijo,recargoPctMonto,recargoFijoMonto,descPctMonto,descFijoMonto,ajusteNeto};

  return{lineas,tot,totalFinal,costo,qV,legacyMap,ajuste};
}

export function upd(){
  syncAjuste(); // sync select→hidden fields before calc
  const{lineas,tot,totalFinal,legacyMap,ajuste}=calc();
  const prods=getProductos().filter(p=>p.activo);

  // Clear all displays first
  prods.forEach(prod=>{
    const u=document.getElementById('up-'+prod.id),pp=document.getElementById('p-'+prod.id);
    if(u){u.textContent='—';u.style.color='var(--tx3)';}if(pp)pp.textContent='';
  });

  // Update from calc results
  lineas.forEach(ln=>{
    if(ln.consulta){
      const u=document.getElementById('up-'+ln.prodId);
      if(u){u.textContent=ln.qty+'+ CONSULTAR';u.style.color='var(--wn)';}
      return;
    }
    const key=ln.varId||ln.prodId;
    const u=document.getElementById('up-'+key),pp=document.getElementById('p-'+key);
    if(u&&ln.precio!=null){u.textContent=fv(ln.precio)+'/'+ln.unit;u.style.color='var(--ac2)';}
    if(pp&&ln.subtotal!=null){pp.textContent=' → '+fv(ln.subtotal);pp.style.color='var(--ac)';}
  });

  document.getElementById('totD').textContent=fv(totalFinal);

  // Preview de ajuste
  const prev=document.getElementById('ajuste-preview');
  if(prev){
    const lineasAj=[];
    if(ajuste.recargoPctMonto>0) lineasAj.push(`📈 Recargo ${ajuste.recargoPct}% → +${fv(ajuste.recargoPctMonto)}`);
    if(ajuste.recargoFijoMonto>0) lineasAj.push(`📈 Recargo fijo → +${fv(ajuste.recargoFijoMonto)}`);
    if(ajuste.descPctMonto>0)     lineasAj.push(`📉 Descuento ${ajuste.descPct}% → -${fv(ajuste.descPctMonto)}`);
    if(ajuste.descFijoMonto>0)    lineasAj.push(`📉 Descuento fijo → -${fv(ajuste.descFijoMonto)}`);
    if(lineasAj.length){
      prev.style.display='block';
      prev.innerHTML=`<span style="color:var(--tx3)">Subtotal: ${fv(tot)}</span><br>`+lineasAj.join('<br>')+`<br><span style="color:var(--ac);font-weight:700">Total final: ${fv(totalFinal)}</span>`;
    } else {
      prev.style.display='none';
    }
  }

  // Tramo info (pastillas group)
  const ti=document.getElementById('trI');
  if(legacyMap['_totalPastillas']>0&&legacyMap['_tramoInfo']&&ti){
    const totP=legacyMap['_totalPastillas'];
    ti.innerHTML=`<span class="tchip">GRP ${totP}ud → TRAMO ${legacyMap['_tramoInfo']} · ${fv(legacyMap['_precioPastilla'])}/ud</span>`;
  }else if(ti)ti.textContent='';

  const uEl=document.getElementById('totU');
  const tcPrev=document.getElementById('tcPreview');
  if(tipoPago==='ARS'){
    if(uEl)uEl.style.display='none';
    if(tcPrev)tcPrev.textContent='';
  } else {
    const pm=getPayment(totalFinal);
    const tcV=parseFloat(document.getElementById('tc-valor')?.value)||0;
    if(uEl&&tcV>0){
      uEl.textContent=tipoPago==='USD'?`${fu(pm.usd)} USD ≈ ${fv(pm.total_ars)}`:
                      tipoPago==='USDT'?`${fu(pm.usdt)} USDT ≈ ${fv(pm.total_ars)}`:'';
      uEl.style.display='block';
    } else if(uEl) uEl.style.display='none';
    if(tcPrev&&tcV>0)
      tcPrev.textContent=tipoPago==='USD'?`1 USD = ${fv(tcV)}`:tipoPago==='USDT'?`1 USDT = ${fv(tcV)}`:'';
    else if(tcPrev) tcPrev.textContent='';
  }
  renderStockMiniPanel();
  updStockHints();
}

export function generarTicket(){
  const fecha=document.getElementById('fecha').value,nota=document.getElementById('nota')?.value.trim(),cliente=document.getElementById('cliente')?.value.trim();
  if(!fecha){sN('ERROR: Fecha requerida',true);return;}
  const{lineas,tot,totalFinal,costo,qV,legacyMap,ajuste}=calc();
  const hasConsulta=lineas.some(l=>l.consulta);
  if(hasConsulta){sN('ERROR: Hay productos que requieren consulta',true);return;}
  if(!lineas.length&&!qV){sN('ERROR: Ingresá al menos un producto',true);return;}
  if((tipoPago==='USD'||tipoPago==='USDT')&&!(parseFloat(document.getElementById('tc-valor')?.value)||0)){sN('AVISO: Ingresá TC para conversión correcta',false);}

  const payment=getPayment(totalFinal);
  const mes=d2m(fecha),id=nId(mes),fd=d2s(fecha);
  let tk=`🧾 Orden de Venta: ${id}\n📅 Fecha: ${fd}`;
  if(cliente)tk+=`\n👤 Cliente: ${cliente}`;
  tk+=`\n\n🛒 Pedido\n\n`;
  const lns=lineas.map(ln=>`${ln.emoji} ${ln.qty} ${ln.unit} × ${fv(ln.precio)} = ${fv(ln.subtotal)}`);
  if(qV>0)lns.push(`💲 ${fv(qV)}`);

  // Ajuste
  const lineasAjTk=[];
  if(ajuste.recargoPctMonto>0) lineasAjTk.push(`📈 Recargo ${ajuste.recargoPct}%: +${fv(ajuste.recargoPctMonto)}`);
  if(ajuste.recargoFijoMonto>0) lineasAjTk.push(`📈 Recargo fijo: +${fv(ajuste.recargoFijoMonto)}`);
  if(ajuste.descPctMonto>0)     lineasAjTk.push(`📉 Descuento ${ajuste.descPct}%: -${fv(ajuste.descPctMonto)}`);
  if(ajuste.descFijoMonto>0)    lineasAjTk.push(`📉 Descuento fijo: -${fv(ajuste.descFijoMonto)}`);
  let tkLineas=lns.join('\n');
  if(lineasAjTk.length) tkLineas+=`\n\n${lineasAjTk.join('\n')}\n━━━━━━━━━━━━━━━━━━━━━`;
  tk+=tkLineas+`\n\n💰 Total: ${fv(totalFinal)} ARS`;
  if(ajuste.ajusteNeto!==0) tk+=`\n   (subtotal ${fv(tot)} ${ajuste.ajusteNeto>0?'+':'-'} ajuste ${fv(Math.abs(ajuste.ajusteNeto))})`;

  // Equivalente en USD/USDT si no es ARS
  if(tipoPago==='USD')  tk+=`\n💵 Total USD: ${fu(payment.usd)} (TC ${fi(payment.tc_usd)})`;
  if(tipoPago==='USDT') tk+=`\n🔵 Total USDT: ${fu(payment.usdt)} (TC ${fi(payment.tc_usdt)})`;
  if(tipoPago==='MIX'){
    const parts=[];
    if(payment.ars>0)  parts.push(`ARS ${fv(payment.ars)}`);
    if(payment.usd>0)  parts.push(`USD ${fu(payment.usd)}`);
    if(payment.usdt>0) parts.push(`USDT ${fu(payment.usdt)}`);
    if(parts.length)   tk+=`\n💳 Pago: ${parts.join(' + ')}`;
    if(payment.total_usdt!=null) tk+=` ≈ ${fu(payment.total_usdt)} USDT`;
  }

  // Nota
  const notaAjParts=[];
  if(ajuste.recargoPct>0)  notaAjParts.push(`Recargo ${ajuste.recargoPct}%`);
  if(ajuste.recargoFijo>0) notaAjParts.push(`Recargo fijo ${fv(ajuste.recargoFijo)}`);
  if(ajuste.descPct>0)     notaAjParts.push(`Dto ${ajuste.descPct}%`);
  if(ajuste.descFijo>0)    notaAjParts.push(`Dto fijo ${fv(ajuste.descFijo)}`);
  const notaFinal=[nota, notaAjParts.join(' | ')].filter(Boolean).join(' | ');
  if(notaFinal)tk+=`\n📝 Nota: ${notaFinal}`;

  const lm=legacyMap;
  const productos={
    calaveras:lm.calaveras?.qty||0,teddy:lm.teddy?.qty||0,lucky:lm.lucky?.qty||0,genericas:lm.genericas?.qty||0,
    totalPastillas:lm._totalPastillas||0,precioPastilla:lm._precioPastilla||null,tramoInfo:lm._tramoInfo||null,
    totalPastillasLinea:lm._totalPastillasLinea||0,
    cristales:lm.cristales?.qty||0,precioCristales:lm.cristales?.precio||null,totalCristales:lm.cristales?.subtotal||0,
    hongos:lm.hongos?.qty||0,precioHongos:lm.hongos?.precio||null,totalHongos:lm.hongos?.subtotal||0,
    goteros:lm.goteros?.qty||0,totalGoteros:lm.goteros?.subtotal||0,
    petri:lm.petri?.qty||0,totalPetri:lm.petri?.subtotal||0,
    variable:qV,
    _lineas:lineas.map(l=>({prodId:l.prodId,varId:l.varId||null,qty:l.qty,precio:l.precio,subtotal:l.subtotal}))
  };
  const totales={
    totalPastillasLinea:productos.totalPastillasLinea,totalCristales:productos.totalCristales,
    totalHongos:productos.totalHongos,totalGoteros:productos.totalGoteros,totalPetri:productos.totalPetri,
    totalGeneral:totalFinal,subtotalBruto:tot,ajusteNeto:ajuste.ajusteNeto,
    totalUSDT:payment.total_usdt,
    payment  // ← objeto completo {ars,usd,usdt,tc,total_ars,total_usdt,modo}
  };
  const margen=totalFinal>0?parseFloat(((totalFinal-costo)/totalFinal*100).toFixed(1)):0;
  const aud=`--- AUDITORÍA ---\nSubtotal: ${fv(tot)} | Ajuste: ${ajuste.ajusteNeto>=0?'+':''}${fv(ajuste.ajusteNeto)} | Total: ${fv(totalFinal)} | Pago: ${payment.modo} | Costo: ${fv(costo)} | Margen: ${margen}% | ID: ${id}`;

  // Oversell: detectar líneas que superan el stock disponible ANTES de descontar
  const oversold=lineas.filter(ln=>{if(ln.consulta||!ln.qty)return false;return ln.qty>getActualQty(ln.varId||ln.prodId);});
  if(oversold.length>0){
    tk+='\n⚠ STOCK INSUFICIENTE:'+oversold.map(ln=>{const avail=getActualQty(ln.varId||ln.prodId);return` ${ln.emoji} ${ln.nombre} (pide ${ln.qty}, hay ${avail})`;}).join(' |');
  }

  sO({id,fecha,fechaDisplay:fd,mesActual:mes,tipoPago,tc:payment.tc_usdt||payment.tc_usd||null,payment,nota:notaFinal||null,cliente:cliente||null,productos,totales,costo,margen,ajuste,ticketText:tk,auditText:aud,estado:'pendiente'});
  descontarStockPorTicket(lineas);
  updStockHints();
  window.rfM?.();
  document.getElementById('tkOut').textContent=tk;
  document.getElementById('audOut').textContent=aud;
  document.getElementById('outA').style.display='block';
  // Store ID for confirm button + show pendiente state
  document.getElementById('outA').dataset.currentId=id;
  const badge=document.getElementById('outA-estado-badge');
  const confirmBtn=document.getElementById('outA-confirmar-btn');
  const infoBar=confirmBtn?.parentElement;
  if(badge){badge.textContent='🕐 PENDIENTE';badge.style.color='var(--wn)';badge.style.background='rgba(255,170,0,.12)';badge.style.border='1px solid rgba(255,170,0,.3)';}
  if(confirmBtn){confirmBtn.style.display='';infoBar&&(infoBar.style.display='flex');}
  document.getElementById('outA').scrollIntoView({behavior:'smooth'});
  sN(`✓ ${id} generada — pendiente de confirmación`);window.uhd?.();
}

export function confirmarDesdeOutput(){
  const id=document.getElementById('outA')?.dataset.currentId;
  if(!id){sN('Sin orden activa',true);return;}
  confirmarOrden(id);
  // Update output UI to confirmed state
  const badge=document.getElementById('outA-estado-badge');
  const confirmBtn=document.getElementById('outA-confirmar-btn');
  const infoBar=confirmBtn?.parentElement;
  if(badge){badge.textContent='✓ CONFIRMADA';badge.style.color='var(--ac)';badge.style.background='rgba(0,229,160,.08)';badge.style.border='1px solid rgba(0,229,160,.2)';}
  if(confirmBtn)confirmBtn.style.display='none';
  if(infoBar)infoBar.style.display='none';
}

export function limpiar(){
  const prods=getProductos().filter(p=>p.activo);
  prods.forEach(prod=>rst(prod.id));
  rst('var');
  ['nota','cliente'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('fecha').value=hoy();setTP('ARS');
  const tc=document.getElementById('tc');if(tc)tc.value='';
  document.getElementById('outA').style.display='none';upd();window.scrollTo({top:0,behavior:'smooth'});
}
