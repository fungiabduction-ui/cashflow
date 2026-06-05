import { gOConf, gE, gInv } from '../core/storage.js';
import { fi, fv, fu, mL, mLong } from '../core/formatters.js';
import { COSTS } from '../core/config.js';
import { actualizarPreciosDash } from './inversiones.js';
import { renderDashStock } from './inventario.js';

// ── CHART TOGGLE ──
let hiddenCharts={bar:false,dough:false,line:false,cost:false};
export function toggleChart(k){
  hiddenCharts[k]=!hiddenCharts[k];
  const wid='wrap'+k.charAt(0).toUpperCase()+k.slice(1);
  const bid='tog'+k.charAt(0).toUpperCase()+k.slice(1);
  const wrap=document.getElementById(wid),btn=document.getElementById(bid);
  if(wrap)wrap.style.display=hiddenCharts[k]?'none':'';
  if(btn){btn.textContent=hiddenCharts[k]?'🙈':'👁';btn.style.opacity=hiddenCharts[k]?'.4':'1';}
  if(!hiddenCharts[k])renderDash();
}

// ── DASHBOARD ──
let dashCharts={};
export function destroyCharts(){Object.values(dashCharts).forEach(c=>{try{c.destroy();}catch(e){}});dashCharts={};}

export function onDashMesChange(){
  const v=document.getElementById('dashMes').value;
  const dw=document.getElementById('dashDesdeWrap'),hw=document.getElementById('dashHastaWrap');
  if(v==='rango'){if(dw)dw.style.display='';if(hw)hw.style.display='';const h=new Date().toISOString().split('T')[0];document.getElementById('dashDesde').value=h.substring(0,8)+'01';document.getElementById('dashHasta').value=h;}
  else{if(dw)dw.style.display='none';if(hw)hw.style.display='none';}
  renderDash();
  renderDashFlowChart();
}

// ── BALANCE MULTIMONEDA ──
export function calcBalance(){
  const orders=gOConf();
  const eg=gE();
  const inv=gInv();
  const bal={ars:0,usd:0,usdt:0};

  orders.forEach(o=>{
    const pm=o.payment;
    if(pm&&pm.modo==='MIX'){
      bal.ars+=(pm.ars||0);
      bal.usd+=(pm.usd||0);
      bal.usdt+=(pm.usdt||0);
    } else if(pm&&pm.modo==='USDT'){
      bal.usdt+=(pm.usdt||0);
    } else if(pm&&pm.modo==='USD'){
      bal.usd+=(pm.usd||0);
    } else {
      bal.ars+=(o.totales?.totalGeneral||0);
    }
  });

  eg.forEach(e=>{ bal.ars-=(e.impactoCaja||0); });

  inv.forEach(x=>{
    const activo=(x.activo||'').toUpperCase();
    const monto=x.montoARS||0;
    const unidades=x.unidad||0;
    if(activo==='USDT'||activo==='BTC'){
      bal.ars-=monto;
      bal.usdt+=unidades;
    } else if(activo==='USD_BLUE'||activo==='USD'){
      bal.ars-=monto;
      bal.usd+=unidades;
    }
  });

  return bal;
}

export function renderDash(){
  destroyCharts();
  actualizarPreciosDash();
  const f=document.getElementById('dashMes').value;
  let orders=gOConf(),eg=gE();
  if(f==='rango'){const desde=document.getElementById('dashDesde').value;const hasta=document.getElementById('dashHasta').value;if(desde)orders=orders.filter(o=>o.fecha>=desde);if(hasta)orders=orders.filter(o=>o.fecha<=hasta);if(desde)eg=eg.filter(e=>e.fecha>=desde);if(hasta)eg=eg.filter(e=>e.fecha<=hasta);}
  else if(f!=='all'){orders=orders.filter(o=>o.mesActual===f);eg=eg.filter(e=>e.mesActual===f);}
  const cont=document.getElementById('dashContent');
  if(!orders.length&&!eg.length){cont.innerHTML=`<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:30px">Sin datos</div>`;return;}
  const totV=orders.reduce((a,o)=>a+(o.totales.totalGeneral||0),0);
  const totE=eg.reduce((a,e)=>a+(e.impactoCaja||0),0);
  const neto=totV-totE;const totC=orders.reduce((a,o)=>a+(o.costo||0),0);
  const gan=totV-totC;const mgp=totV>0?((gan/totV)*100).toFixed(1):0;
  const fondoRepo=totC;const totOrd=orders.length;const tprom=totOrd?totV/totOrd:0;
  const netoReal=neto-totC;

  const byTP={ARS:0,USD:0,USDT:0};
  const ventasEnARS={ARS:0,USD:0,USDT:0};
  const tcPromedio={USD:{sumUsd:0,sumArs:0},USDT:{sumUsdt:0,sumArs:0}};
  orders.forEach(o=>{
    const p=o.payment||{};
    if(p.modo==='ARS'||p.modo===undefined){
      byTP.ARS+=o.totales.totalGeneral||0;
      ventasEnARS.ARS+=o.totales.totalGeneral||0;
    } else if(p.modo==='USD'){
      byTP.USD+=p.usd||0;
      ventasEnARS.USD+=(p.usd||0)*(p.tc_usd||1);
      if(p.usd>0){tcPromedio.USD.sumUsd+=p.usd;tcPromedio.USD.sumArs+=(p.usd*(p.tc_usd||1));}
    } else if(p.modo==='USDT'){
      byTP.USDT+=p.usdt||0;
      ventasEnARS.USDT+=(p.usdt||0)*(p.tc_usdt||1);
      if(p.usdt>0){tcPromedio.USDT.sumUsdt+=p.usdt;tcPromedio.USDT.sumArs+=(p.usdt*(p.tc_usdt||1));}
    } else if(p.modo==='MIX'){
      byTP.ARS+=p.ars||0;
      ventasEnARS.ARS+=p.ars||0;
      if(p.usd>0){byTP.USD+=p.usd;ventasEnARS.USD+=(p.usd*(p.tc_usd||1));tcPromedio.USD.sumUsd+=p.usd;tcPromedio.USD.sumArs+=(p.usd*(p.tc_usd||1));}
      if(p.usdt>0){byTP.USDT+=p.usdt;ventasEnARS.USDT+=(p.usdt*(p.tc_usdt||1));tcPromedio.USDT.sumUsdt+=p.usdt;tcPromedio.USDT.sumArs+=(p.usdt*(p.tc_usdt||1));}
    } else {
      byTP.ARS+=o.totales.totalGeneral||0;
      ventasEnARS.ARS+=o.totales.totalGeneral||0;
    }
  });

  const tcActualUSD=window._blueARS||0;
  const tcActualUSDT=window._usdtARS||0;
  const tcPromUSD=tcPromedio.USD.sumUsd>0?(tcPromedio.USD.sumArs/tcPromedio.USD.sumUsd):0;
  const tcPromUSDT=tcPromedio.USDT.sumUsdt>0?(tcPromedio.USDT.sumArs/tcPromedio.USDT.sumUsdt):0;
  const ganFlotUSD=tcActualUSD>0&&tcPromedio.USD.sumUsd>0?(tcActualUSD-tcPromUSD)*tcPromedio.USD.sumUsd:0;
  const ganFlotUSDT=tcActualUSDT>0&&tcPromedio.USDT.sumUsdt>0?(tcActualUSDT-tcPromUSDT)*tcPromedio.USDT.sumUsdt:0;
  const pctUSD=tcPromUSD>0?((tcActualUSD/tcPromUSD-1)*100).toFixed(1):0;
  const pctUSDT=tcPromUSDT>0?((tcActualUSDT/tcPromUSDT-1)*100).toFixed(1):0;

  const _PAST_IDS=new Set(['p-past','v-cal','v-ted','v-lck','v-gen']);
  const qPast=orders.reduce((a,o)=>a+((o.productos._lineas?o.productos._lineas.filter(l=>_PAST_IDS.has(l.prodId)).reduce((s,l)=>s+(l.qty||0),0):(o.productos.calaveras||0)+(o.productos.teddy||0)+(o.productos.lucky||0)+(o.productos.genericas||0))||0),0);
  const qCris=orders.reduce((a,o)=>a+((o.productos._lineas?o.productos._lineas.filter(l=>l.prodId==='p-cris').reduce((s,l)=>s+(l.qty||0),0):o.productos.cristales||0)||0),0);
  const qHong=orders.reduce((a,o)=>a+((o.productos._lineas?o.productos._lineas.filter(l=>l.prodId==='p-hong').reduce((s,l)=>s+(l.qty||0),0):o.productos.hongos||0)||0),0);
  const qGot=orders.reduce((a,o)=>a+((o.productos._lineas?o.productos._lineas.filter(l=>l.prodId==='p-got').reduce((s,l)=>s+(l.qty||0),0):o.productos.goteros||0)||0),0);
  const qPetr=orders.reduce((a,o)=>a+((o.productos._lineas?o.productos._lineas.filter(l=>l.prodId==='p-pet').reduce((s,l)=>s+(l.qty||0),0):o.productos.petri||0)||0),0);
  const vPast=orders.reduce((a,o)=>a+((o.totales.totalPastillasLinea||0)+(o.totales.totalPastillasBase||0)),0);
  const vCris=orders.reduce((a,o)=>a+(o.totales.totalCristales||0),0);
  const vHong=orders.reduce((a,o)=>a+(o.totales.totalHongos||0),0);
  const vGot=orders.reduce((a,o)=>a+(o.totales.totalGoteros||0),0);
  const vPetr=orders.reduce((a,o)=>a+(o.totales.totalPetri||0),0);
  const vVar=orders.reduce((a,o)=>a+(o.productos.variable||0),0);

  const cPast=qPast*COSTS.past,cCris=qCris*COSTS.cris,cHong=qHong*COSTS.hong,cGot=qGot*COSTS.got,cPetr=qPetr*COSTS.pet;
  const allM=[...new Set([...orders.map(o=>o.mesActual),...eg.map(e=>e.mesActual)])].sort();
  const pm={};allM.forEach(m=>{pm[m]={v:0,e:0,c:0,n:0};});
  orders.forEach(o=>{if(pm[o.mesActual]){pm[o.mesActual].v+=o.totales.totalGeneral||0;pm[o.mesActual].c+=o.costo||0;pm[o.mesActual].n++;}});
  eg.forEach(e=>{if(pm[e.mesActual])pm[e.mesActual].e+=e.impactoCaja||0;});
  const ratio=totE>0?((totV/totE)*100).toFixed(0):100;const estadoTxt=neto>0?'🟢 Crecimiento':'🔴 Déficit';
  function mgClass(v){return v>70?'margin-ok':v>40?'margin-wn':'margin-er';}
  function mgRow(emoji,qty,unit,ventas,costo){if(!ventas)return'';const mg=ventas>0?((ventas-costo)/ventas*100).toFixed(1):0;return`<tr><td>${emoji}</td><td class="mu">${qty}${unit}</td><td class="ac">${fv(ventas)}</td><td class="er">${fv(costo)}</td><td class="ac">${fv(ventas-costo)}</td><td class="${mgClass(parseFloat(mg))}">${mg}%</td></tr>`;}
  const bal=calcBalance();
  const saldos=[];
  if(Math.abs(bal.ars)>1) saldos.push({label:'ARS',val:fv(bal.ars),color:bal.ars>=0?'var(--ac)':'var(--er)',neg:bal.ars<0});
  if(Math.abs(bal.usd)>0.001) saldos.push({label:'USD',val:(bal.usd>=0?'':'−')+fu(Math.abs(bal.usd)),color:bal.usd>=0?'#ffaa00':'var(--er)',neg:bal.usd<0});
  if(Math.abs(bal.usdt)>0.001) saldos.push({label:'USDT',val:(bal.usdt>=0?'':'−')+fu(Math.abs(bal.usdt)),color:bal.usdt>=0?'var(--ac2)':'var(--er)',neg:bal.usdt<0});
  const saldoHTML=saldos.length===0?'':`
  <div class="kpi-grid" style="margin-bottom:14px">
    ${saldos.map(m=>`<div class="kpi ${m.neg?'neg':''}"><div class="klbl">Saldo ${m.label}</div><div class="kval" style="color:${m.color}">${m.val}</div><div class="ksub">${m.label==='ARS'?'Pesos':m.label==='USD'?'Dólar':'Tether'}</div></div>`).join('')}
  </div>`;
  cont.innerHTML=`
  <!-- Header con Precios en Tiempo Real -->
  ${(window._blueARS||window._usdtARS)?`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding:8px 12px;background:var(--s2);border:1px solid var(--br)">
    <div style="font-family:var(--mo);font-size:9px;color:var(--tx2)">📡 TC Actual:</div>
    <div style="display:flex;gap:16px;font-family:var(--mo);font-size:10px">
      ${window._blueARS?`<span>USD <strong style="color:var(--wn)">${fi(window._blueARS)}</strong></span>`:''}
      ${window._usdtARS?`<span>USDT <strong style="color:var(--ac2)">${fi(window._usdtARS)}</strong></span>`:''}
    </div>
  </div>`:''}

  <!-- Resumen General -->
  <div class="card" style="padding:12px;margin-bottom:16px">
    <div style="font-family:var(--mo);font-size:8px;color:var(--tx2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px">Resumen General</div>
    <div class="kpi-grid" style="gap:12px">
      <div class="kpi"><div class="klbl">Ingresos Totales</div><div class="kval" style="font-size:16px">${fv(totV)}</div><div class="ksub">${totOrd} órdenes · promedio ${fv(tprom)}</div></div>
      <div class="kpi neg"><div class="klbl">Egresos</div><div class="kval neg">-${fv(totE)}</div><div class="ksub">${eg.length} gastos</div></div>
      <div class="kpi ${neto>=0?'ok':'neg'}" style="border-top:3px solid ${neto>=0?'var(--ac)':'var(--er)'}"><div class="klbl">Resultado Neto</div><div class="kval ${neto>=0?'':'neg'}" style="font-size:20px">${neto>=0?fv(neto):'-'+fv(Math.abs(neto))}</div><div class="ksub">Ingresos - Egresos</div></div>
    </div>
  </div>

  <!-- Moneda Recibida -->
  <div class="card" style="padding:12px;margin-bottom:16px">
    <div style="font-family:var(--mo);font-size:8px;color:var(--tx2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px">Moneda Recibida <span style="color:var(--tx3);font-weight:400">— en la moneda que pagó el cliente</span></div>
    <div class="kpi-grid" style="gap:12px">
      <div class="kpi"><div class="klbl">Pesos (ARS)</div><div class="kval" style="font-size:16px">${fv(byTP.ARS)}</div><div class="ksub">Ventas en pesos</div></div>
      ${byTP.USD>0?`<div class="kpi wn"><div class="klbl">Dólares (USD)</div><div class="kval wn" style="font-size:16px">${fu(byTP.USD)}</div><div class="ksub">≈ ${fv(ventasEnARS.USD)} ARS · TC ${fi(Math.round(tcPromedio.USD.sumArs/tcPromedio.USD.sumUsd))}</div></div>`:''}
      ${byTP.USDT>0?`<div class="kpi pur"><div class="klbl">Cripto (USDT)</div><div class="kval pur" style="font-size:16px">${fu(byTP.USDT)}</div><div class="ksub">≈ ${fv(ventasEnARS.USDT)} ARS · TC ${fi(Math.round(tcPromedio.USDT.sumArs/tcPromedio.USDT.sumUsdt))}</div></div>`:''}
    </div>
  </div>

  <!-- Ganancia Flotante (si hay USD/USDT) -->
  ${(tcPromedio.USD.sumUsd>0||tcPromedio.USDT.sumUsdt>0)?`
  <div class="card" style="padding:12px;margin-bottom:16px">
    <div style="font-family:var(--mo);font-size:8px;color:var(--tx2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px">Ganancia Flotante <span style="color:var(--tx3);font-weight:400">— cuánto ganás/perdés si vendés hoy</span></div>
    ${tcPromedio.USD.sumUsd>0?`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px">
      <div style="padding:10px;background:var(--s2);border:1px solid var(--br)">
        <div style="font-family:var(--mo);font-size:9px;color:var(--wn);margin-bottom:4px">USD</div>
        <div style="font-family:var(--mo);font-size:12px">Tenés: <strong>${fu(tcPromedio.USD.sumUsd)} USD</strong></div>
        <div style="font-family:var(--mo);font-size:9px;color:var(--tx3)">TC compra: ${fi(Math.round(tcPromUSD))} → TC actual: ${fi(tcActualUSD)}</div>
      </div>
      <div style="padding:10px;background:var(--s2);border:1px solid var(--br);text-align:center">
        <div style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-bottom:4px">Ganancia/Pérdida</div>
        <div style="font-family:var(--mo);font-size:16px;font-weight:700;color:${ganFlotUSD>=0?'var(--ac)':'var(--er)'}">${ganFlotUSD>=0?'+':''}${fv(Math.round(ganFlotUSD))}</div>
        <div style="font-family:var(--mo);font-size:9px;color:${ganFlotUSD>=0?'var(--ac)':'var(--er)'}">${ganFlotUSD>=0?'+':''}${pctUSD}%</div>
      </div>
    </div>`:''}
    ${tcPromedio.USDT.sumUsdt>0?`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="padding:10px;background:var(--s2);border:1px solid var(--br)">
        <div style="font-family:var(--mo);font-size:9px;color:var(--ac2);margin-bottom:4px">USDT</div>
        <div style="font-family:var(--mo);font-size:12px">Tenés: <strong>${fu(tcPromedio.USDT.sumUsdt)} USDT</strong></div>
        <div style="font-family:var(--mo);font-size:9px;color:var(--tx3)">TC compra: ${fi(Math.round(tcPromUSDT))} → TC actual: ${fi(tcActualUSDT)}</div>
      </div>
      <div style="padding:10px;background:var(--s2);border:1px solid var(--br);text-align:center">
        <div style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-bottom:4px">Ganancia/Pérdida</div>
        <div style="font-family:var(--mo);font-size:16px;font-weight:700;color:${ganFlotUSDT>=0?'var(--ac)':'var(--er)'}">${ganFlotUSDT>=0?'+':''}${fv(Math.round(ganFlotUSDT))}</div>
        <div style="font-family:var(--mo);font-size:9px;color:${ganFlotUSDT>=0?'var(--ac)':'var(--er)'}">${ganFlotUSDT>=0?'+':''}${pctUSDT}%</div>
      </div>
    </div>`:''}
  </div>`:''}

  <!-- Rentabilidad -->
  <div class="card" style="padding:12px;margin-bottom:16px">
    <div style="font-family:var(--mo);font-size:8px;color:var(--tx2);text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px">Rentabilidad</div>
    <div class="kpi-grid" style="gap:12px">
      <div class="kpi org"><div class="klbl">Margen</div><div class="kval org" style="font-size:20px">${mgp}%</div><div class="ksub">Ganancia / Ventas</div></div>
      <div class="kpi wn"><div class="klbl">Fondo Reposición</div><div class="kval wn" style="font-size:14px">${fv(fondoRepo)}</div><div class="ksub">Costo de reponer stock</div></div>
      <div class="kpi ${netoReal>=0?'ok':'neg'}"><div class="klbl">Resultado Real</div><div class="kval ${netoReal>=0?'':'neg'}" style="font-size:16px">${netoReal>=0?fv(netoReal):'-'+fv(Math.abs(netoReal))}</div><div class="ksub">Neto - costos repo</div></div>
      <div class="kpi"><div class="klbl">Estado</div><div class="kval" style="font-size:14px">${estadoTxt}</div><div class="ksub">Ratio ${ratio}%</div></div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div><div class="ct" style="margin-bottom:4px">Ingresos vs Egresos <button class="btn btn-s" onclick="toggleChart('bar')" id="togBar" style="font-size:8px;height:22px;padding:0 7px;margin-left:4px">👁</button></div><div class="cw2" id="wrapBar"><canvas id="cBar"></canvas></div></div>
    <div><div class="ct" style="margin-bottom:4px">Mix de productos <button class="btn btn-s" onclick="toggleChart('dough')" id="togDough" style="font-size:8px;height:22px;padding:0 7px;margin-left:4px">👁</button></div><div class="cw2" id="wrapDough"><canvas id="cDough"></canvas></div></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div><div class="ct" style="margin-bottom:4px">Resultado neto mensual <button class="btn btn-s" onclick="toggleChart('line')" id="togLine" style="font-size:8px;height:22px;padding:0 7px;margin-left:4px">👁</button></div><div class="cw" id="wrapLine"><canvas id="cLine"></canvas></div></div>
    <div><div class="ct" style="margin-bottom:4px">Ventas vs Costos repo <button class="btn btn-s" onclick="toggleChart('cost')" id="togCost" style="font-size:8px;height:22px;padding:0 7px;margin-left:4px">👁</button></div><div class="cw" id="wrapCost"><canvas id="cCost"></canvas></div></div>
  </div>
  <div class="ct" style="margin-top:14px;margin-bottom:8px">Análisis de margen por producto</div>
  <div class="tw"><table><thead><tr><th>Producto</th><th>Cant.</th><th>Ventas ARS</th><th>Costo Repo</th><th>Ganancia</th><th>Margen %</th></tr></thead><tbody>
    ${mgRow('💊 Pastillas',qPast,'ud',vPast,cPast)}${mgRow('💎 Cristales',qCris,'g',vCris,cCris)}${mgRow('🍄 Hongos',qHong,'g',vHong,cHong)}${mgRow('💧 Goteros',qGot,'ud',vGot,cGot)}${mgRow('🧫 Petri',qPetr,'ud',vPetr,cPetr)}${vVar?`<tr><td>💲 Variable</td><td class="mu">—</td><td class="ac">${fv(vVar)}</td><td class="mu">—</td><td class="ac">${fv(vVar)}</td><td class="mu">—</td></tr>`:''}
    <tr class="total-row"><td>TOTAL</td><td></td><td class="ac">${fv(totV)}</td><td class="er">${fv(totC)}</td><td class="ac">${fv(gan)}</td><td class="${mgClass(parseFloat(mgp))}">${mgp}%</td></tr>
  </tbody></table></div>
  <div class="ct" style="margin-top:14px;margin-bottom:8px">Histórico mensual</div>
  <div class="tw"><table><thead><tr><th>Mes</th><th>Ventas</th><th>Egresos</th><th>Neto</th><th>Margen</th><th>Órd.</th></tr></thead><tbody>
    ${allM.map(m=>{const mn=pm[m].v-pm[m].e;const mg2=pm[m].v>0?((pm[m].v-pm[m].c)/pm[m].v*100).toFixed(1):'—';return`<tr><td class="ac">${mLong(m)}</td><td>${fv(pm[m].v)}</td><td class="er">-${fv(pm[m].e)}</td><td class="${mn>=0?'ac':'er'}">${mn>=0?fv(mn):'-'+fv(Math.abs(mn))}</td><td class="wn">${mg2!=='—'?mg2+'%':'—'}</td><td class="mu">${pm[m].n}</td></tr>`;}).join('')}
  </tbody></table></div>`;
  setTimeout(()=>{
    const gs={responsive:true,maintainAspectRatio:false};const tx={color:'#55556a',font:{family:'Space Mono',size:8}};const gr={color:'rgba(42,42,58,.4)'};const fY=v=>'$'+fi(v);
    const cBar=document.getElementById('cBar');
    if(cBar&&!hiddenCharts.bar)dashCharts.bar=new Chart(cBar,{type:'bar',data:{labels:allM.map(m=>mL(m)),datasets:[
      {label:'Ingresos',data:allM.map(m=>pm[m].v),backgroundColor:'rgba(0,229,160,.7)',borderColor:'#00e5a0',borderWidth:1},
      {label:'Egresos',data:allM.map(m=>pm[m].e),backgroundColor:'rgba(255,68,85,.6)',borderColor:'#ff4455',borderWidth:1},
      {label:'Resultado Real',data:allM.map(m=>Math.max(0,pm[m].v-pm[m].e-pm[m].c)),backgroundColor:'rgba(255,170,0,.8)',borderColor:'#ffaa00',borderWidth:1}
    ]},options:{...gs,plugins:{legend:{display:true,labels:{color:'#8888a0',font:{family:'Space Mono',size:7},boxWidth:8,padding:6}}},scales:{x:{grid:gr,ticks:tx},y:{grid:gr,ticks:{...tx,callback:fY}}}}});
    const md=[],ml=[],mc=['#00e5a0','#7c6fff','#ff6b35','#ffaa00','#ff4455','#44aaff'];
    if(vPast>0){ml.push('💊');md.push(vPast);}if(vCris>0){ml.push('💎');md.push(vCris);}if(vHong>0){ml.push('🍄');md.push(vHong);}if(vGot>0){ml.push('💧');md.push(vGot);}if(vPetr>0){ml.push('🧫');md.push(vPetr);}if(vVar>0){ml.push('💲');md.push(vVar);}
    const cD=document.getElementById('cDough');
    if(cD&&md.length&&!hiddenCharts.dough)dashCharts.dough=new Chart(cD,{type:'doughnut',data:{labels:ml,datasets:[{data:md,backgroundColor:mc.slice(0,md.length),borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:'bottom',labels:{color:'#8888a0',font:{family:'Space Mono',size:8},boxWidth:8,padding:5}}}}});
    const cLine=document.getElementById('cLine');
    if(cLine&&!hiddenCharts.line)dashCharts.line=new Chart(cLine,{type:'line',data:{labels:allM.map(m=>mL(m)),datasets:[{data:allM.map(m=>pm[m].v-pm[m].e),borderColor:'#7c6fff',backgroundColor:'rgba(124,111,255,.12)',tension:.4,fill:true,pointBackgroundColor:'#7c6fff',pointRadius:4}]},options:{...gs,plugins:{legend:{display:false}},scales:{x:{grid:gr,ticks:tx},y:{grid:gr,ticks:{...tx,callback:fY}}}}});
    const cCost=document.getElementById('cCost');
    if(cCost&&!hiddenCharts.cost)dashCharts.cost=new Chart(cCost,{type:'bar',data:{labels:allM.map(m=>mL(m)),datasets:[{label:'Ventas',data:allM.map(m=>pm[m].v),backgroundColor:'rgba(0,229,160,.6)',borderColor:'#00e5a0',borderWidth:1},{label:'Costo repo',data:allM.map(m=>pm[m].c),backgroundColor:'rgba(255,107,53,.6)',borderColor:'#ff6b35',borderWidth:1}]},options:{...gs,plugins:{legend:{display:true,labels:{color:'#8888a0',font:{family:'Space Mono',size:7},boxWidth:8,padding:6}}},scales:{x:{grid:gr,ticks:tx},y:{grid:gr,ticks:{...tx,callback:fY}}}}});
  },100);
  window.renderDashInversiones?.(cont,f);
  renderDashStock(f);
}



let _dashFlowChart=null;
let _fcPeriod=30;

export function setFlowPer(days){
  _fcPeriod=days;
  ['7','30','90','All'].forEach(k=>{
    const b=document.getElementById('fcPer'+k);
    if(b){b.style.background='var(--bg)';b.style.color='var(--tx3)';b.style.fontWeight='';}
  });
  const key=days===7?'7':days===30?'30':days===90?'90':'All';
  const b=document.getElementById('fcPer'+key);
  if(b){b.style.background='var(--ac)';b.style.color='#000';b.style.fontWeight='700';}
  renderDashFlowChart();
}

function _fcMA(data,n){
  return data.map((_,i)=>{
    const slice=data.slice(Math.max(0,i-n+1),i+1).filter(v=>v!=null);
    return slice.length?slice.reduce((a,b)=>a+b,0)/slice.length:null;
  });
}

export function renderDashFlowChart(){
  const canvas=document.getElementById('dashFlowChart');
  if(!canvas)return;

  const orders=gOConf();
  const eg=gE();

  let cutoff=null;
  if(_fcPeriod>0){const c=new Date();c.setDate(c.getDate()-_fcPeriod);cutoff=c.toISOString().split('T')[0];}

  const f=document.getElementById('dashMes')?.value||'all';
  let fOrders=orders,fEg=eg;
  if(f==='rango'){
    const desde=document.getElementById('dashDesde')?.value;
    const hasta=document.getElementById('dashHasta')?.value;
    if(desde)fOrders=fOrders.filter(o=>o.fecha>=desde);
    if(hasta)fOrders=fOrders.filter(o=>o.fecha<=hasta);
    if(desde)fEg=fEg.filter(e=>e.fecha>=desde);
    if(hasta)fEg=fEg.filter(e=>e.fecha<=hasta);
  } else if(f&&f!=='all'){
    fOrders=fOrders.filter(o=>o.mesActual===f);
    fEg=fEg.filter(e=>e.mesActual===f);
  } else if(cutoff){
    fOrders=fOrders.filter(o=>o.fecha>=cutoff);
    fEg=fEg.filter(e=>e.fecha>=cutoff);
  }

  if(!fOrders.length&&!fEg.length){
    const wrap=canvas.parentElement;
    if(!document.getElementById('dashFlowChart')){
      const c=document.createElement('canvas');c.id='dashFlowChart';wrap.appendChild(c);
    }
    const kpi=document.getElementById('fc-kpi-strip');
    if(kpi)kpi.innerHTML='';
    return;
  }

  const byDate={};
  fOrders.forEach(o=>{
    const d=o.fecha;if(!d)return;
    if(!byDate[d])byDate[d]={v:0,e:0};
    byDate[d].v+=parseFloat(o.totales?.totalGeneral||0);
  });
  fEg.forEach(e=>{
    const d=e.fecha;if(!d)return;
    if(!byDate[d])byDate[d]={v:0,e:0};
    byDate[d].e+=parseFloat(e.impactoCaja||0);
  });

  const fechas=Object.keys(byDate).sort();
  const ventas=fechas.map(d=>byDate[d].v);
  const egresos=fechas.map(d=>byDate[d].e);

  let acV=0,acE=0;
  const acumV=ventas.map(v=>(acV+=v,acV));
  const acumE=egresos.map(v=>(acE+=v,acE));
  const neto=fechas.map((_,i)=>acumV[i]-acumE[i]);
  const netoDiario=fechas.map((_,i)=>ventas[i]-egresos[i]);
  const maVentas=_fcMA(ventas,7);

  const labels=fechas.map(d=>{const[,m,dd]=d.split('-');return dd+'/'+m;});

  const totV=acumV[acumV.length-1]||0;
  const totE=acumE[acumE.length-1]||0;
  const totN=totV-totE;
  const maxV=Math.max(...ventas)||0;
  const kpi=document.getElementById('fc-kpi-strip');
  if(kpi){
    const k=(label,val,col)=>`<div style="background:var(--s1);padding:8px 12px"><div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;margin-bottom:3px">${label}</div><div style="font-family:var(--mo);font-size:13px;font-weight:700;color:${col}">$${fi(Math.round(val))}</div></div>`;
    kpi.innerHTML=k('VENTAS PERÍODO',totV,'var(--ac2)')+k('EGRESOS PERÍODO',totE,'var(--er)')+k('NETO',totN,totN>=0?'var(--ac)':'var(--er)')+k('PICO DIARIO',maxV,'var(--wn)');
  }

  const toggleWrap=document.getElementById('fc-series-toggles');
  if(toggleWrap&&!toggleWrap.dataset.built){
    toggleWrap.dataset.built='1';
    const series=[
      {id:'fcT-v',  label:'Ventas',   col:'#7c6fff',def:true},
      {id:'fcT-e',  label:'Egresos',  col:'#ff4455',def:true},
      {id:'fcT-av', label:'Ac.Ventas',col:'#00e5a0',def:true},
      {id:'fcT-ae', label:'Ac.Egr',   col:'#ffaa00',def:false},
      {id:'fcT-n',  label:'Neto',     col:'#00bfff', def:true},
    ];
    series.forEach(s=>{
      const btn=document.createElement('button');
      btn.id=s.id;
      btn.dataset.active=s.def?'1':'0';
      btn.style.cssText=`font-family:var(--mo);font-size:8px;padding:2px 7px;border:1px solid ${s.col};background:${s.def?s.col+'33':'transparent'};color:${s.def?s.col:'var(--tx3)'};cursor:pointer`;
      btn.textContent=s.label;
      btn.onclick=()=>{
        btn.dataset.active=btn.dataset.active==='1'?'0':'1';
        const on=btn.dataset.active==='1';
        btn.style.background=on?s.col+'33':'transparent';
        btn.style.color=on?s.col:'var(--tx3)';
        renderDashFlowChart();
      };
      toggleWrap.appendChild(btn);
    });
  }

  const isOn=id=>document.getElementById(id)?.dataset.active==='1';
  const globalType=document.getElementById('fcGlobalType')?.value||'mixed';
  const smooth=document.getElementById('fcSmooth')?.checked!==false;
  const showMA=document.getElementById('fcShowMA')?.checked;
  const showNet=document.getElementById('fcShowNet')?.checked!==false;
  const tension=smooth?0.4:0;

  const mkLine=(label,data,color,opts={})=>({
    type:'line',label,data,
    borderColor:color,
    backgroundColor:opts.fill?color+'22':'transparent',
    borderWidth:opts.width||2,
    tension,
    fill:!!opts.fill,
    pointRadius:data.length>40?0:3,
    pointHoverRadius:5,
    pointBackgroundColor:color,
    borderDash:opts.dash||[],
    yAxisID:opts.yAxis||'y',
    ...opts.extra
  });
  const mkBar=(label,data,color,opts={})=>({
    type:'bar',label,data,
    backgroundColor:color+'99',
    borderColor:color,
    borderWidth:1,
    borderRadius:2,
    yAxisID:opts.yAxis||'y',
    ...opts.extra
  });

  const datasets=[];

  if(isOn('fcT-v')){
    const color='#7c6fff';
    if(globalType==='bar'||globalType==='mixed') datasets.push(mkBar('Ventas diarias',ventas,color));
    else datasets.push(mkLine('Ventas diarias',ventas,color,{fill:globalType==='area',width:2}));
  }
  if(isOn('fcT-e')){
    const color='#ff4455';
    if(globalType==='bar'||globalType==='mixed') datasets.push(mkBar('Egresos diarios',egresos,color));
    else datasets.push(mkLine('Egresos diarios',egresos,color,{fill:globalType==='area',width:2}));
  }
  if(isOn('fcT-av')){
    datasets.push(mkLine('Acum. Ventas',acumV,'#00e5a0',{fill:globalType==='area',width:2,yAxis:'y2'}));
  }
  if(isOn('fcT-ae')){
    datasets.push(mkLine('Acum. Egresos',acumE,'#ffaa00',{dash:[6,3],width:1.5,yAxis:'y2'}));
  }
  if(showNet){
    const netColor='#00bfff';
    datasets.push({
      type:'line',label:'Neto acum.',data:neto,
      borderColor:netColor,
      backgroundColor:neto.map(v=>v>=0?netColor+'15':'#ff445515'),
      borderWidth:2.5,tension,fill:true,
      pointRadius:0,pointHoverRadius:5,
      segment:{borderColor:ctx=>neto[ctx.p1DataIndex]>=0?netColor:'#ff4455'},
      yAxisID:'y2'
    });
  }
  if(showMA){
    datasets.push(mkLine('MA7 Ventas',maVentas,'#ffaa00',{dash:[3,3],width:1.5,extra:{pointRadius:0}}));
  }

  if(_dashFlowChart){try{_dashFlowChart.destroy();}catch(e){}_dashFlowChart=null;}
  let cv=document.getElementById('dashFlowChart');
  if(!cv){
    const wrap=document.querySelector('[style*="height:260px"]');
    cv=document.createElement('canvas');cv.id='dashFlowChart';
    if(wrap)wrap.appendChild(cv);else return;
  }

  const txCol='#55556a';
  const gridCol='rgba(255,255,255,0.04)';
  const moFont={family:'Space Mono, monospace',size:9};

  _dashFlowChart=new Chart(cv,{
    data:{labels,datasets},
    options:{
      responsive:true,
      maintainAspectRatio:false,
      animation:{duration:400,easing:'easeInOutQuart'},
      interaction:{mode:'index',intersect:false},
      plugins:{
        legend:{
          display:true,position:'top',
          labels:{color:'#8888a0',font:moFont,boxWidth:8,boxHeight:8,padding:12,
            usePointStyle:true,pointStyle:'circle'}
        },
        tooltip:{
          backgroundColor:'rgba(10,10,20,0.92)',
          borderColor:'rgba(255,255,255,0.08)',
          borderWidth:1,
          titleColor:'#00e5a0',
          titleFont:moFont,
          bodyColor:'#c0c0d0',
          bodyFont:moFont,
          padding:10,
          callbacks:{
            title:ctx=>'📅 '+labels[ctx[0].dataIndex],
            label:ctx=>{
              const v=ctx.raw;
              if(v==null)return null;
              const sign=v<0?'':'';
              return ` ${ctx.dataset.label}: $${fi(Math.round(Math.abs(v)))}${v<0?' ▼':''}`
            },
            afterBody:ctx=>{
              const i=ctx[0].dataIndex;
              const nd=netoDiario[i];
              return[`  ─────────────────`,`  Neto del día: ${nd>=0?'+':''}$${fi(Math.round(nd))}`];
            }
          }
        }
      },
      scales:{
        x:{
          grid:{color:gridCol,drawTicks:false},
          ticks:{color:txCol,font:moFont,maxTicksLimit:10,maxRotation:0},
          border:{color:'rgba(255,255,255,0.06)'}
        },
        y:{
          position:'left',
          grid:{color:gridCol,drawTicks:false},
          ticks:{color:txCol,font:moFont,callback:v=>'$'+fi(Math.round(v))},
          border:{color:'rgba(255,255,255,0.06)',dash:[3,3]},
          title:{display:true,text:'DIARIO',color:'#55556a',font:{...moFont,size:7}}
        },
        y2:{
          position:'right',
          grid:{display:false},
          ticks:{color:'#4a6',font:moFont,callback:v=>'$'+fi(Math.round(v))},
          border:{color:'rgba(255,255,255,0.06)',dash:[3,3]},
          title:{display:true,text:'ACUMULADO',color:'#55556a',font:{...moFont,size:7}}
        }
      },
      onHover:(e,els)=>{
        const bar=document.getElementById('fc-crosshair-bar');
        if(!bar)return;
        if(!els.length){bar.innerHTML='<span style="font-family:var(--mo);font-size:9px;color:var(--tx3)">Deslizá sobre el gráfico para ver datos</span>';return;}
        const i=els[0].index;
        const items=[
          {label:'Ventas',val:ventas[i],col:'#7c6fff'},
          {label:'Egresos',val:egresos[i],col:'#ff4455'},
          {label:'Neto día',val:netoDiario[i],col:netoDiario[i]>=0?'#00e5a0':'#ff4455'},
          {label:'Ac.Ventas',val:acumV[i],col:'#00e5a0'},
          {label:'Neto acum.',val:neto[i],col:neto[i]>=0?'#00bfff':'#ff4455'},
        ];
        bar.innerHTML=`<span style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin-right:4px">${labels[i]}</span>`
          +items.map(it=>`<span style="font-family:var(--mo);font-size:9px"><span style="color:var(--tx3)">${it.label}:</span> <b style="color:${it.col}">$${fi(Math.round(Math.abs(it.val||0)))}${(it.val||0)<0?' ▼':''}</b></span>`).join(' · ');
      }
    }
  });

  const bar=document.getElementById('fc-crosshair-bar');
  if(bar)bar.innerHTML='<span style="font-family:var(--mo);font-size:9px;color:var(--tx3)">Deslizá sobre el gráfico para ver datos</span>';
}
