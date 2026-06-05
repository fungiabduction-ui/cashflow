import { ld, sd, gO, gOConf, gE, gInv, dInv, gLiqExterna } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fi, fv, fu, hoy, d2s, d2m, mL, mLong } from '../core/formatters.js';
import { invNuevoId, nEId } from '../core/ids.js';
import { COSTS } from '../core/config.js';
import { ghAutoPush } from './github.js';

// ── State ──
let _btcPrecioUSD=null,_blueARS=null,_usdtARS=null,_blueCompra=null,_usdtCompra=null;
let _btcChart=null,_distChart=null,_liqDistChart=null;
let _btcDays=30;

const DIST_DEFAULTS=[{id:'s1',label:'Bitcoin',pct:50,color:'#ff6b35',activo:'BTC'},{id:'s2',label:'Dolar Blue',pct:50,color:'#ffaa00',activo:'USD_BLUE'}];
let distSlices=JSON.parse(localStorage.getItem('me_dist_slices')||'null')||DIST_DEFAULTS.map(x=>Object.assign({},x));

const DIST_KPIS=['kpiNetoNeto','kpiFondo','kpiReal','kpiYaInv','kpiDisp'];
let distKpiHidden=JSON.parse(localStorage.getItem('me_dist_kpi_hidden')||'{}');

const _distChartRef={chart:null},_liqChartRef={chart:null};

// ── Storage helper (local, includes ghAutoPush) ──
function sInv(x){var d=ld();if(!d.inversiones)d.inversiones=[];d.inversiones.push(x);sd(d);ghAutoPush();}

// ── Window bridges for cross-module access ──
window._getDistSlices=()=>distSlices;
window._setDistSlices=(v)=>{distSlices=v;};
window._getDistKpiHidden=()=>distKpiHidden;
window._setDistKpiHidden=(v)=>{distKpiHidden=v;};

// ── Period filter ──
export function filtrarPorPeriodo(arr,filtro){
  if(!filtro||filtro.tipo==='mes'){if(filtro&&filtro.mes&&filtro.mes!=='all')return arr.filter(x=>x.mesActual===filtro.mes);return arr;}
  let r=arr;if(filtro.desde)r=r.filter(x=>x.fecha>=filtro.desde);if(filtro.hasta)r=r.filter(x=>x.fecha<=filtro.hasta);return r;
}
export function getInvFiltro(){
  const globalSel=document.getElementById('invGlobalMes');
  const f=globalSel?globalSel.value:(document.getElementById('invDistMes')?.value||'all');
  if(f==='rango'){
    return{tipo:'rango',
      desde:document.getElementById('invGlobalDesde')?document.getElementById('invGlobalDesde').value:(document.getElementById('invDesde')?document.getElementById('invDesde').value:''),
      hasta:document.getElementById('invGlobalHasta')?document.getElementById('invGlobalHasta').value:(document.getElementById('invHasta')?document.getElementById('invHasta').value:'')
    };
  }
  return{tipo:'mes',mes:f};
}
export function rfInvM(){
  const inv=gInv(),liq=gLiqExterna();
  const meses=[...new Set([...inv.map(x=>x.mesActual),...liq.map(x=>x.mesActual)])].sort();
  const sel=document.getElementById('invMes');if(!sel)return;
  const cv=sel.value;
  sel.innerHTML='<option value="all">Todo el período</option>';
  meses.forEach(m=>{const op=document.createElement('option');op.value=m;op.textContent=mLong(m);sel.appendChild(op);});
  const ro=document.createElement('option');ro.value='rango';ro.textContent='📅 Rango de fechas...';sel.appendChild(ro);
  if(cv)sel.value=cv;
}
export function onInvMesChange(){
  const v=document.getElementById('invMes').value;
  const dw=document.getElementById('invDesdeWrap'),hw=document.getElementById('invHastaWrap');
  if(v==='rango'){if(dw)dw.style.display='';if(hw)hw.style.display='';const h=hoy();if(document.getElementById('invDesde'))document.getElementById('invDesde').value=h.substring(0,8)+'01';if(document.getElementById('invHasta'))document.getElementById('invHasta').value=h;}
  else{if(dw)dw.style.display='none';if(hw)hw.style.display='none';}
  renderInvAll();
}
export function onInvGlobalMesChange(){
  const v=document.getElementById('invGlobalMes').value;
  const dw=document.getElementById('invGlobalDesdeWrap'),hw=document.getElementById('invGlobalHastaWrap');
  if(v==='rango'){
    if(dw)dw.style.display='';if(hw)hw.style.display='';
    const h=hoy();
    if(document.getElementById('invGlobalDesde'))document.getElementById('invGlobalDesde').value=h.substring(0,8)+'01';
    if(document.getElementById('invGlobalHasta'))document.getElementById('invGlobalHasta').value=h;
  } else {if(dw)dw.style.display='none';if(hw)hw.style.display='none';}
  const sel=document.getElementById('invDistMes');if(sel)sel.value=v;
  renderInvAll();
}

// ── Dist slices config ──
export function saveDistSlices(){localStorage.setItem('me_dist_slices',JSON.stringify(distSlices));}
export function saveKpiHidden(){localStorage.setItem('me_dist_kpi_hidden',JSON.stringify(distKpiHidden));}
export function toggleDistEdit(){
  const panel=document.getElementById('distKpiEditPanel');
  if(!panel)return;
  panel.style.display=panel.style.display==='none'?'block':'none';
}
export function toggleDistKpi(id){
  distKpiHidden[id]=!distKpiHidden[id];
  saveKpiHidden();
  renderInvDist();
}
export function kpiVisible(id){return !distKpiHidden[id];}

export function calcDistBase(){
  const orders=gOConf(),eg=gE();
  const totV=orders.reduce(function(a,o){return a+(o.totales.totalGeneral||0);},0);
  const totE=eg.reduce(function(a,e){return a+(e.impactoCaja||0);},0);
  const totC=orders.reduce(function(a,o){return a+(o.costo||0);},0);
  const netoNeto=totV-totE;
  const netoReal=netoNeto-totC;
  return {netoNeto:netoNeto,netoReal:netoReal,totalC:totC,totV:totV,totE:totE};
}

export function buildSmartDefaults(){
  const orders=gOConf(),eg=gE();
  const totV=orders.reduce(function(a,o){return a+(o.totales.totalGeneral||0);},0);
  const totE=eg.reduce(function(a,e){return a+(e.impactoCaja||0);},0);
  const totC=orders.reduce(function(a,o){return a+(o.costo||0);},0);
  const netoNeto=totV-totE;
  const btcSlice={id:'sd1',label:'Bitcoin',pct:50,color:'#ff6b35',activo:'BTC'};
  const blueSlice={id:'sd2',label:'Dolar Blue',pct:50,color:'#ffaa00',activo:'USD_BLUE'};
  if(netoNeto>0&&totC>0&&totC<netoNeto){
    const fondoPct=parseFloat(Math.min(99,((totC/netoNeto)*100)).toFixed(1));
    const rest=parseFloat((100-fondoPct).toFixed(1));
    const fondoSlice={id:'sd0',label:'Fondo Reposicion',pct:fondoPct,color:'#00e5a0',activo:'STOCK'};
    btcSlice.pct=parseFloat((rest/2).toFixed(1));
    blueSlice.pct=parseFloat((rest-btcSlice.pct).toFixed(1));
    return[fondoSlice,btcSlice,blueSlice];
  }
  return[btcSlice,blueSlice];
}

export function resetDistDefaults(){
  distSlices=buildSmartDefaults();
  saveDistSlices();renderDistConfig();renderInvDist();
  sN('Distribucion restablecida');
}
export function autoBalancePct(ci){
  const tot=distSlices.reduce(function(a,s){return a+s.pct;},0);
  if(Math.abs(tot-100)<0.1)return;
  const diff=100-tot;const others=distSlices.filter(function(_,i){return i!==ci;});
  if(!others.length)return;
  const pp=diff/others.length;others.forEach(function(s){s.pct=Math.max(0,parseFloat((s.pct+pp).toFixed(1)));});
  const nt=distSlices.reduce(function(a,s){return a+s.pct;},0);
  if(Math.abs(nt-100)>0.1){const li=distSlices.length-1===ci?distSlices.length-2:distSlices.length-1;if(distSlices[li])distSlices[li].pct=parseFloat(Math.max(0,distSlices[li].pct+(100-nt)).toFixed(1));}
}
export function renderDistConfig(){
  const cont=document.getElementById('distSlices');if(!cont)return;
  const COLS=['#ff6b35','#ffaa00','#00e5a0','#7c6fff','#ff4455','#44aaff','#e0c080','#cc88ff','#55ddff','#ff88cc'];
  let html='';
  distSlices.forEach(function(s,i){
    html+='<div style="display:grid;grid-template-columns:22px 1fr 60px 28px;gap:6px;align-items:center;margin-bottom:6px">'
      +'<div style="width:16px;height:16px;background:'+s.color+';border-radius:2px;cursor:pointer" onclick="cycleColor('+i+')"></div>'
      +'<input type="text" value="'+s.label+'" oninput="distSlices['+i+'].label=this.value;saveDistSlices()" style="min-height:34px;font-size:11px;padding:4px 8px">'
      +'<div style="display:flex;align-items:center;gap:2px"><input type="number" min="0" max="100" value="'+s.pct+'" onchange="distSlices['+i+'].pct=Math.max(0,Math.min(100,parseFloat(this.value)||0));autoBalancePct('+i+');saveDistSlices();renderDistConfig();renderInvDist()" style="min-height:34px;font-size:11px;padding:4px 4px;width:42px"><span style="font-family:var(--mo);font-size:9px;color:var(--tx3)">%</span></div>'
      +(distSlices.length>1?'<button class="qrst" onclick="removeDistSlice('+i+')" style="height:34px">x</button>':'<div></div>')
      +'</div>';
  });
  const tot=distSlices.reduce(function(a,s){return a+s.pct;},0);
  html+='<div style="font-family:var(--mo);font-size:9px;color:'+(Math.abs(tot-100)<0.5?'var(--ac)':'var(--er)')+'">Total: '+tot.toFixed(1)+'% '+(Math.abs(tot-100)<0.5?'OK balanceado':'AUTO-BALANCE PENDIENTE')+'</div>';
  cont.innerHTML=html;
}
export function cycleColor(i){const cols=['#ff6b35','#ffaa00','#00e5a0','#7c6fff','#ff4455','#44aaff','#e0c080','#cc88ff','#55ddff','#ff88cc'];const cur=distSlices[i].color;const idx=cols.indexOf(cur);distSlices[i].color=cols[(idx+1)%cols.length];saveDistSlices();renderDistConfig();}
export function addDistSlice(){
  const cols=['#ff6b35','#ffaa00','#00e5a0','#7c6fff','#ff4455','#44aaff','#e0c080','#cc88ff'];
  const n=distSlices.length+1;const pe=parseFloat((100/n).toFixed(1));
  distSlices.forEach(function(s){s.pct=pe;});
  distSlices.push({id:'s'+Date.now(),label:'Destino',pct:pe,color:cols[(n-1)%cols.length],activo:'OTRO'});
  const tot=distSlices.reduce(function(a,s){return a+s.pct;},0);distSlices[distSlices.length-1].pct=parseFloat((distSlices[distSlices.length-1].pct+(100-tot)).toFixed(1));
  saveDistSlices();renderDistConfig();
}
export function removeDistSlice(i){
  if(distSlices.length<=1)return;distSlices.splice(i,1);
  const pe=parseFloat((100/distSlices.length).toFixed(1));distSlices.forEach(function(s){s.pct=pe;});
  const tot=distSlices.reduce(function(a,s){return a+s.pct;},0);distSlices[distSlices.length-1].pct=parseFloat((distSlices[distSlices.length-1].pct+(100-tot)).toFixed(1));
  saveDistSlices();renderDistConfig();
}

// ── Prices / BTC ──
export async function fetchPrecios(){
  document.getElementById('preciosStatus').textContent='Cargando...';
  try{const r=await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');const d=await r.json();_btcPrecioUSD=d.bitcoin.usd;const chg=d.bitcoin.usd_24h_change||0;document.getElementById('btcPrecio').textContent='US$ '+fi(_btcPrecioUSD);document.getElementById('btcCambio').textContent=(chg>=0?'+ ':'- ')+Math.abs(chg).toFixed(2)+'% 24h';document.getElementById('btcCambio').style.color=chg>=0?'#00e5a0':'#ff4455';}catch(e){document.getElementById('btcPrecio').textContent='Error';}
  try{const r=await fetch('https://dolarapi.com/v1/dolares/blue');const d=await r.json();_blueCompra=d.compra;_blueARS=d.venta;document.getElementById('bluePrecio').textContent='$ '+fi(_blueARS);document.getElementById('blueSub').textContent='C: $'+fi(_blueCompra)+' V: $'+fi(_blueARS);}
  catch(e){try{const r2=await fetch('https://api.bluelytics.com.ar/v2/latest');const d2=await r2.json();_blueCompra=d2.blue.value_buy;_blueARS=d2.blue.value_sell;document.getElementById('bluePrecio').textContent='$ '+fi(_blueARS);document.getElementById('blueSub').textContent='C: $'+fi(_blueCompra)+' V: $'+fi(_blueARS);}catch(e2){document.getElementById('bluePrecio').textContent='Error';}}
  try{const r=await fetch('https://dolarapi.com/v1/dolares/cripto');const d=await r.json();_usdtCompra=d.compra;_usdtARS=d.venta;document.getElementById('usdtPrecio').textContent='$ '+fi(_usdtARS);document.getElementById('usdtSub').textContent='C: $'+fi(_usdtCompra)+' V: $'+fi(_usdtARS);}
  catch(e){if(_blueARS){_usdtARS=Math.round(_blueARS*1.04);_usdtCompra=Math.round(_blueARS*1.03);document.getElementById('usdtPrecio').textContent='$ '+fi(_usdtARS);document.getElementById('usdtSub').textContent='aprox blue+4%';}else{document.getElementById('usdtPrecio').textContent='Error';}}
  document.getElementById('preciosStatus').textContent='OK '+new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
  // Update window cache for other modules
  window._btcPrecioUSD=_btcPrecioUSD;
  window._blueARS=_blueARS;
  window._usdtARS=_usdtARS;
  renderInvDist();window.renderLiqExterna?.();fetchBtcHistorico();
}

export async function actualizarPreciosDash(){
  try{const r=await fetch('https://dolarapi.com/v1/dolares/blue');const d=await r.json();_blueARS=d.venta;}
  catch(e){try{const r2=await fetch('https://api.bluelytics.com.ar/v2/latest');const d2=await r2.json();_blueARS=d2.blue.value_sell;}catch(e2){}}
  try{const r=await fetch('https://dolarapi.com/v1/dolares/cripto');const d=await r.json();_usdtARS=d.venta;}
  catch(e){if(_blueARS)_usdtARS=Math.round(_blueARS*1.04);}
  window._btcPrecioUSD=_btcPrecioUSD;
  window._blueARS=_blueARS;
  window._usdtARS=_usdtARS;
}

export function setBtcDays(d){
  _btcDays=d;
  ['30','60','90'].forEach(function(n){
    const b=document.getElementById('btcDays'+n);
    if(b)b.className='tgb'+(d===parseInt(n)?' active':'');
  });
  const lbl=document.getElementById('btcChartLabel');
  if(lbl)lbl.textContent='Ultimos '+d+' dias · CoinGecko API';
  fetchBtcHistorico();
}
export async function fetchBtcHistorico(){
  const days=_btcDays||30;
  const interval=days<=30?'daily':'daily';
  try{
    const res=await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days='+days+'&interval='+interval);
    const data=await res.json();const prices=data.prices;
    const labels=prices.map(function(p){const d=new Date(p[0]);return d.getDate()+'/'+(d.getMonth()+1);});
    const vals=prices.map(function(p){return p[1];});
    if(_btcChart){try{_btcChart.destroy();}catch(e){}}
    const canvas=document.getElementById('cBtcHistorico');if(!canvas)return;
    const gs={responsive:true,maintainAspectRatio:false},tx={color:'#55556a',font:{family:'Space Mono',size:8}},gr={color:'rgba(42,42,58,.4)'};
    _btcChart=new Chart(canvas,{type:'line',data:{labels:labels,datasets:[{data:vals,borderColor:'#ff6b35',backgroundColor:'rgba(255,107,53,.12)',tension:.4,fill:true,pointBackgroundColor:'#ff6b35',pointRadius:2,borderWidth:2}]},options:{...gs,plugins:{legend:{display:false},tooltip:{callbacks:{label:function(ctx){return 'US$ '+fi(ctx.raw);}}}},scales:{x:{grid:gr,ticks:{color:tx.color,font:tx.font,maxTicksLimit:12}},y:{grid:gr,ticks:{color:tx.color,font:tx.font,callback:function(v){return '$'+fi(v);}}}}}});
  }catch(e){console.warn('BTC chart error',e);}
}

// ── Inv Repo ──
export function renderInvRepo(){
  const filtro=getInvFiltro();
  const orders=filtrarPorPeriodo(gO(),filtro);
  const inv=filtrarPorPeriodo(gInv(),filtro).filter(function(x){return x.activo&&x.activo.indexOf('STOCK_')===0;});
  const totC=orders.reduce(function(a,o){return a+(o.costo||0);},0);
  const qPast=orders.reduce(function(a,o){return a+(o.productos.totalPastillas||0);},0);
  const qCris=orders.reduce(function(a,o){return a+(o.productos.cristales||0);},0);
  const qHong=orders.reduce(function(a,o){return a+(o.productos.hongos||0);},0);
  const qGot=orders.reduce(function(a,o){return a+(o.productos.goteros||0);},0);
  const qPetr=orders.reduce(function(a,o){return a+(o.productos.petri||0);},0);
  const cPast=qPast*COSTS.past,cCris=qCris*COSTS.cris,cHong=qHong*COSTS.hong,cGot=qGot*COSTS.got,cPetr=qPetr*COSTS.pet;
  function repuOf(activo){return inv.filter(function(x){return x.activo===activo;}).reduce(function(a,x){return a+(x.montoARS||0);},0);}
  const rPast=repuOf('STOCK_PAST'),rCris=repuOf('STOCK_CRIS'),rHong=repuOf('STOCK_HONG'),rGot=repuOf('STOCK_GOT'),rPetr=repuOf('STOCK_PETR');
  const totalRep=rPast+rCris+rHong+rGot+rPetr;
  const pend=Math.max(0,totC-totalRep);
  const cont=document.getElementById('invRepoContent');
  if(!orders.length){cont.innerHTML='<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:20px">Sin datos</div>';return;}
  function rr(e,q,u,c,r){if(!q)return'';const p=Math.max(0,c-r);return'<tr><td>'+e+'</td><td class="mu">'+q+u+'</td><td class="er">'+fv(c)+'</td><td class="ac">'+(r>0?'-'+fv(r):'')+'</td><td class="'+(p>0?'wn':'ac')+'">'+(p>0?fv(p):'✅ Cubierto')+'</td></tr>';}
  cont.innerHTML='<div class="kpi-grid" style="margin-bottom:10px">'
    +'<div class="kpi wn"><div class="kicon">💼</div><div class="klbl">Fondo Total</div><div class="kval wn">'+fv(totC)+'</div></div>'
    +'<div class="kpi"><div class="kicon">✅</div><div class="klbl">Repuesto</div><div class="kval ac">'+fv(totalRep)+'</div></div>'
    +'<div class="kpi '+(pend>0?'neg':'')+'"><div class="kicon">'+(pend>0?'⚠️':'✅')+'</div><div class="klbl">Pendiente</div><div class="kval '+(pend>0?'neg':'ac')+'">'+fv(pend)+'</div></div>'
    +'</div>'
    +'<div class="tw"><table><thead><tr><th>Producto</th><th>Qty</th><th>Costo</th><th>Repuesto</th><th>Pendiente</th></tr></thead><tbody>'
    +rr('Pastillas',qPast,'ud',cPast,rPast)+rr('Cristales',qCris,'g',cCris,rCris)+rr('Hongos',qHong,'g',cHong,rHong)+rr('Goteros',qGot,'ud',cGot,rGot)+rr('Petri',qPetr,'ud',cPetr,rPetr)
    +'<tr class="total-row"><td>TOTAL</td><td></td><td class="wn">'+fv(totC)+'</td><td class="ac">'+fv(totalRep)+'</td><td class="'+(pend>0?'wn':'ac')+'">'+fv(pend)+'</td></tr>'
    +'</tbody></table></div>';
}

export function distRow(s,monto){
  let equiv='';
  if(s.activo==='BTC'&&_btcPrecioUSD&&_blueARS)equiv=(monto/(_btcPrecioUSD*_blueARS)).toFixed(6)+' BTC';
  else if(s.activo==='USD_BLUE'&&_blueARS)equiv=fu(monto/_blueARS)+' USD';
  else if(s.activo==='USDT'&&_usdtARS)equiv=fu(monto/_usdtARS)+' USDT';
  return {monto:monto,equiv:equiv,color:s.color,label:s.label,pct:s.pct,displayVal:fv(monto)};
}
export function distRowUSD(s,montoUSD){
  let equiv='';
  if(s.activo==='BTC'&&_btcPrecioUSD)equiv=(montoUSD/_btcPrecioUSD).toFixed(6)+' BTC';
  else if(s.activo==='USD_BLUE')equiv=fu(montoUSD)+' USD';
  else if(s.activo==='USDT')equiv=fu(montoUSD)+' USDT';
  return {monto:montoUSD,equiv:equiv,color:s.color,label:s.label,pct:s.pct,displayVal:fu(montoUSD)+' USD'};
}

export function renderDistChart(canvasId,rows,chartRef,height){
  setTimeout(function(){
    if(chartRef&&chartRef.chart){try{chartRef.chart.destroy();}catch(e){}}
    const cv=document.getElementById(canvasId);if(!cv)return;
    chartRef.chart=new Chart(cv,{type:'doughnut',data:{labels:rows.map(function(r){return r.label+' '+r.pct.toFixed(0)+'%';}),datasets:[{data:rows.map(function(r){return Math.max(0,r.monto);}),backgroundColor:rows.map(function(r){return r.color;}),borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'58%',plugins:{legend:{display:true,position:'right',labels:{color:'#8888a0',font:{family:'Space Mono',size:8},boxWidth:10,padding:8}},tooltip:{callbacks:{label:function(ctx){return ctx.label+': '+fv(ctx.raw);}}}}}});
  },80);
}

export function renderInvDist(){
  const filtro=getInvFiltro();
  const orders=filtrarPorPeriodo(gO(),filtro);
  const eg=filtrarPorPeriodo(gE(),filtro);
  const totV=orders.reduce(function(a,o){return a+(o.totales.totalGeneral||0);},0);
  const totE=eg.reduce(function(a,e){return a+(e.impactoCaja||0);},0);
  const totC=orders.reduce(function(a,o){return a+(o.costo||0);},0);
  const netoNeto=totV-totE;
  const netoReal=netoNeto-totC;
  const invReal=filtrarPorPeriodo(gInv(),filtro).filter(function(x){return x.fuente==='distribucion'||x.fuente==='mixto';});
  const yaInv=invReal.reduce(function(a,x){return a+(x.montoARS||0);},0);
  const disponible=Math.max(0,netoNeto-yaInv);
  const cont=document.getElementById('invDistContent');
  renderDistConfig();
  if(netoNeto<=0){cont.innerHTML='<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:20px">Resultado Neto menor o igual a 0 en este periodo.</div>';return;}
  const totPct=distSlices.reduce(function(a,s){return a+s.pct;},0)||100;
  const rows=distSlices.map(function(s){return distRow(s,disponible*(s.pct/totPct));});
  function kpiCard(id,cls,icon,lbl,val,sub,fullWidth){
    if(!kpiVisible(id))return'';
    return'<div class="kpi '+cls+'"'+(fullWidth?' style="grid-column:1/-1"':'')+'>'+
      '<div class="kicon">'+icon+'</div>'+
      '<div class="klbl">'+lbl+'</div>'+
      '<div class="kval '+(cls||'')+'">'+val+'</div>'+
      (sub?'<div class="ksub">'+sub+'</div>':'')+
    '</div>';
  }
  const editPanel='<div id="distKpiEditPanel" style="display:none;background:var(--s2);border:1px solid var(--br);padding:10px;margin-bottom:10px;font-family:var(--mo);font-size:9px">'
    +'<div style="color:var(--tx3);margin-bottom:8px;letter-spacing:1px">MOSTRAR / OCULTAR MÉTRICAS</div>'
    +'<div style="display:flex;flex-wrap:wrap;gap:6px">'
    +[['kpiNetoNeto','📊 Resultado Neto'],['kpiFondo','💼 Fondo Reposicion'],['kpiReal','📈 Resultado Real'],['kpiYaInv','↗ Ya Invertido'],['kpiDisp','💰 Disponible']].map(function(k){
      return'<label style="display:flex;align-items:center;gap:5px;cursor:pointer;background:var(--s3);padding:5px 9px;border:1px solid var(--br)">'
        +'<input type="checkbox"'+(kpiVisible(k[0])?' checked':'')
        +' onchange="toggleDistKpi(\''+k[0]+'\')" style="cursor:pointer;width:14px;height:14px;min-height:unset">'
        +k[1]+'</label>';
    }).join('')
    +'</div></div>';
  cont.innerHTML=editPanel
    +'<div class="kpi-grid" style="margin-bottom:10px">'
    +kpiCard('kpiNetoNeto','','📊','Resultado Neto',fv(netoNeto),'Base de distribucion',false)
    +kpiCard('kpiFondo','wn','💼','Fondo Reposicion',fv(totC),(netoNeto>0?parseFloat((totC/netoNeto*100).toFixed(1))+'% del neto':'—'),false)
    +kpiCard('kpiReal','org','📈','Resultado Real',fv(netoReal),'Neto - Fondo',false)
    +kpiCard('kpiYaInv','neg','↗','Ya Invertido','-'+fv(yaInv),'',false)
    +kpiCard('kpiDisp',(disponible>=0?'':'neg'),'💰','Disponible para distribuir',
      '<span style="font-size:16px">'+fv(disponible)+'</span>',
      (!_blueARS?'Actualiza precios para ver equivalencias':''),true)
    +'</div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin-bottom:12px">'
    +rows.map(function(r){return '<div style="background:var(--s2);border:1px solid var(--br);border-top:2px solid '+r.color+';padding:10px"><div style="font-family:var(--mo);font-size:7px;color:var(--tx3);text-transform:uppercase;margin-bottom:3px">'+r.pct.toFixed(1)+'% '+r.label+'</div><div style="font-family:var(--mo);font-size:12px;font-weight:700;color:'+r.color+'">'+fv(r.monto)+'</div><div style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-top:2px">'+r.equiv+'</div></div>';}).join('')
    +'</div><div style="position:relative;height:180px"><canvas id="cDistTorta"></canvas></div>';
  renderDistChart('cDistTorta',rows,_distChartRef,180);
}

// ── Disponible ──
export function getDisponibleDist(){
  var orders=gOConf(),eg=gE();
  var totV=orders.reduce(function(a,o){return a+(o.totales.totalGeneral||0);},0);
  var totE=eg.reduce(function(a,e){return a+(e.impactoCaja||0);},0);
  var netoNeto=totV-totE;
  var inv=gInv().filter(function(x){return x.fuente==='distribucion'||x.fuente==='mixto';});
  var yaInv=inv.reduce(function(a,x){return a+(x.montoARS||0);},0);
  return Math.max(0,netoNeto-yaInv);
}

export function getDisponibleLiq(){
  var liq=gLiqExterna();
  var totalUSD=liq.reduce(function(a,x){return a+x.monto;},0);
  var inv=gInv().filter(function(x){return x.fuente==='liquidez_externa'||x.fuente==='mixto';});
  var yaUSD=inv.reduce(function(a,x){
    if(x.moneda==='USD'||x.moneda==='USDT')return a+(x.montoOriginal||0);
    return a+((x.montoARS||0)/(_blueARS||1));
  },0);
  return Math.max(0,parseFloat((totalUSD-yaUSD).toFixed(2)));
}

// ── Form helpers ──
export function invGetDisponibleActual(){
  var fuente=document.getElementById('inv-fuente')?document.getElementById('inv-fuente').value:'distribucion';
  if(fuente==='liquidez_externa') return getDisponibleLiq();
  return getDisponibleDist();
}
export function invUsarPct(pct){
  var disp=invGetDisponibleActual();
  var val=Math.floor(disp*(pct/100)*100)/100;
  var el=document.getElementById('inv-monto');
  if(el){ el.value=val; invCalcular(); invMostrarPct(); }
  document.querySelectorAll('.inv-pct-btn').forEach(function(b){ b.classList.remove('active'); });
}
export function invMostrarPct(){
  var monto=parseFloat(document.getElementById('inv-monto').value)||0;
  var disp=invGetDisponibleActual();
  var el=document.getElementById('inv-pct-display');
  if(!el)return;
  if(!monto||!disp){ el.textContent=''; return; }
  var pct=Math.round((monto/disp)*1000)/10;
  el.textContent='= '+pct.toFixed(1)+'% del disponible';
  el.style.color=pct>100?'var(--er)':'var(--tx3)';
}

export function invSelFuente(fuente){
  document.getElementById('inv-fuente').value=fuente;
  var dDist=document.getElementById('inv-fuente-dist');
  var dLext=document.getElementById('inv-fuente-lext');
  if(dDist&&dLext){
    if(fuente==='distribucion'){
      dDist.style.borderColor='var(--ac)'; dDist.style.opacity='1';
      dLext.style.borderColor='var(--br)'; dLext.style.opacity='.6';
    } else {
      dLext.style.borderColor='var(--wn)'; dLext.style.opacity='1';
      dDist.style.borderColor='var(--br)'; dDist.style.opacity='.6';
    }
  }
  invActualizarCampos();
}

export function invActualizarCampos(){
  var fuente=document.getElementById('inv-fuente')?document.getElementById('inv-fuente').value:'distribucion';
  var monedaOrigenSel=document.getElementById('inv-moneda-origen');
  var monedaDestSel=document.getElementById('inv-moneda-destino');
  var wrapPrecio=document.getElementById('inv-wrap-precio');
  var lblPrecio=document.getElementById('inv-lbl-precio');
  var lblMonto=document.getElementById('inv-lbl-monto');

  var dispDist=getDisponibleDist();
  var dispLiq=getDisponibleLiq();
  var elDistDisp=document.getElementById('inv-dist-disp');
  var elLextDisp=document.getElementById('inv-lext-disp');
  if(elDistDisp) elDistDisp.textContent=fv(dispDist);
  if(elLextDisp) elLextDisp.textContent=fu(dispLiq)+' USD';

  if(monedaOrigenSel){
    var prevOrigen=monedaOrigenSel.value;
    monedaOrigenSel.innerHTML='';
    if(fuente==='distribucion'){
      monedaOrigenSel.innerHTML='<option value="ARS">🪙 ARS</option>';
      monedaOrigenSel.value='ARS';
    } else {
      var liqItems=gLiqExterna();
      monedaOrigenSel.innerHTML='<option value="USD">💵 USD</option>';
      monedaOrigenSel.value='USD';
    }
  }

  var monedaOrigen=monedaOrigenSel?monedaOrigenSel.value:'ARS';
  var monedaDest=monedaDestSel?monedaDestSel.value:'BTC';
  if(lblMonto) lblMonto.textContent='Monto a usar ('+monedaOrigen+')';

  var needsPrecio=(monedaOrigen!==monedaDest);
  if(wrapPrecio) wrapPrecio.style.display=needsPrecio?'':'none';
  if(lblPrecio&&needsPrecio){
    lblPrecio.textContent='Precio de compra ('+monedaOrigen+'/'+monedaDest+')';
    var precioEl=document.getElementById('inv-precio');
    if(precioEl&&!precioEl.value){
      if(monedaOrigen==='ARS'&&monedaDest==='USD'&&_blueARS) precioEl.value=_blueARS.toFixed(0);
      else if(monedaOrigen==='ARS'&&monedaDest==='USDT'&&_usdtARS) precioEl.value=_usdtARS.toFixed(0);
      else if(monedaOrigen==='ARS'&&monedaDest==='BTC'&&_btcPrecioUSD&&_blueARS) precioEl.value=(_btcPrecioUSD*_blueARS).toFixed(0);
      else if(monedaOrigen==='USD'&&monedaDest==='BTC'&&_btcPrecioUSD) precioEl.value=_btcPrecioUSD.toFixed(2);
      else if(monedaOrigen==='USDT'&&monedaDest==='BTC'&&_btcPrecioUSD) precioEl.value=_btcPrecioUSD.toFixed(2);
    }
  }

  invCalcular();
  invMostrarPct();
}

export function invCalcular(){
  var monedaOrigen=document.getElementById('inv-moneda-origen')?document.getElementById('inv-moneda-origen').value:'USDT';
  var monedaDestino=document.getElementById('inv-moneda-destino')?document.getElementById('inv-moneda-destino').value:'BTC';
  var modalidad='COMPRA';
  var monto=parseFloat(document.getElementById('inv-monto').value)||0;
  var precio=parseFloat(document.getElementById('inv-precio').value)||0;
  var tbar=document.getElementById('inv-tbar');
  var resDiv=document.getElementById('inv-resultado');
  var cantEl=document.getElementById('inv-cantidad');
  var impEl=document.getElementById('inv-impacto');

  if(!monto){
    if(tbar)tbar.style.display='none';
    if(resDiv){resDiv.textContent='Completá los campos para ver el resultado.';resDiv.style.color='var(--tx3)';}
    return;
  }

  var cantidad='', montoARS=0, resText='', impactoStr='';

  var r_blue=_blueARS||0;
  var r_usdt=_usdtARS||r_blue||0;
  var r_btc_usd=_btcPrecioUSD||0;
  var r_btc_ars=r_btc_usd*r_blue;

  if(monedaOrigen==='ARS') montoARS=monto;
  else if(monedaOrigen==='USD') montoARS=Math.round(monto*r_blue);
  else if(monedaOrigen==='USDT') montoARS=Math.round(monto*r_usdt);
  else if(monedaOrigen==='BTC') montoARS=Math.round(monto*r_btc_ars);

  if(monedaOrigen!==monedaDestino&&precio>0){
    var qty=0;
    if(modalidad==='COMPRA'){
      qty=monto/precio;
      if(monedaDestino==='BTC') qty=Math.floor(qty*1e8)/1e8;
      else qty=Math.floor(qty*100)/100;
      cantidad=qty.toLocaleString('es-AR',{maximumFractionDigits:8})+' '+monedaDestino;
    } else {
      qty=monto*precio;
      if(monedaDestino==='BTC') qty=Math.floor(qty*1e8)/1e8;
      else qty=Math.round(qty);
      cantidad=qty.toLocaleString('es-AR',{maximumFractionDigits:8})+' '+monedaDestino;
    }
  }

  var modalIcon=modalidad==='COMPRA'?'🟢':'🔴';
  resText=modalIcon+' '+monto.toLocaleString('es-AR')+' '+monedaOrigen+(cantidad?' → '+cantidad:'');
  impactoStr=(modalidad==='COMPRA'?'-':'+')+(monedaOrigen==='ARS'?fv(montoARS):monto.toLocaleString('es-AR')+' '+monedaOrigen)+' en fuente';

  if(resDiv){resDiv.style.color='var(--ac)';resDiv.textContent=resText;}
  if(cantEl)cantEl.textContent=cantidad||(monto.toLocaleString('es-AR')+' '+monedaDestino);
  if(impEl)impEl.textContent=impactoStr;
  if(tbar)tbar.style.display='';

  tbar.dataset.montoARS=String(Math.abs(montoARS));
  tbar.dataset.cantidad=cantidad;
  tbar.dataset.montoOrig=String(monto);
}

export function invReset(){
  document.getElementById('inv-monto').value='';
  document.getElementById('inv-precio').value='';
  document.getElementById('inv-nota').value='';
  document.getElementById('inv-fecha').value=hoy();
  if(document.getElementById('inv-tbar'))document.getElementById('inv-tbar').style.display='none';
  if(document.getElementById('inv-resultado')){document.getElementById('inv-resultado').textContent='Completá los campos para ver el resultado.';document.getElementById('inv-resultado').style.color='var(--tx3)';}
  if(document.getElementById('inv-outA'))document.getElementById('inv-outA').style.display='none';
  invSelFuente('distribucion');
}

export function invGenerar(){
  var fecha=document.getElementById('inv-fecha').value;
  var activo=document.getElementById('inv-activo')?document.getElementById('inv-activo').value:'OTRO';
  var fuente=document.getElementById('inv-fuente').value;
  var monedaOrigen=document.getElementById('inv-moneda-origen')?document.getElementById('inv-moneda-origen').value:'ARS';
  var monedaDestino=document.getElementById('inv-moneda-destino')?document.getElementById('inv-moneda-destino').value:'USD';
  var modalidad='COMPRA';
  var monto=parseFloat(document.getElementById('inv-monto').value)||0;
  var precio=parseFloat(document.getElementById('inv-precio').value)||0;
  var nota=document.getElementById('inv-nota').value.trim();
  var tbar=document.getElementById('inv-tbar');

  if(!fecha){sN('Completá la fecha',true);return;}
  if(!monto){sN('Completá el monto',true);return;}
  if(monedaOrigen!==monedaDestino&&!precio){sN('Completá el precio de conversión',true);return;}

  if(fuente==='liquidez_externa'){
    var liqTotal=gLiqExterna().reduce(function(a,x){return a+x.monto;},0);
    if(liqTotal<=0){
      sN('⚠ No hay liquidez externa registrada. Registrá liquidez primero.',true);
      return;
    }
    var dispLiq=getDisponibleLiq();
    var montoUSD=(activo==='BTC')?monto:monto/(_blueARS||1);
    if(montoUSD>dispLiq+0.01){
      if(!confirm('⚠ ADVERTENCIA: El monto supera el disponible en Liquidez Externa.\n\nDisponible: '+fu(dispLiq)+' USD\nMonto a invertir: '+fu(montoUSD.toFixed(2))+' USD\n\n¿Querés continuar de todas formas?'))return;
    }
  }

  if(fuente==='distribucion'){
    var dispDist=getDisponibleDist();
    var montoARSest=0;
    if(activo==='BTC') montoARSest=Math.round(monto*(_usdtARS||_blueARS||1));
    else montoARSest=monto;
    if(montoARSest>dispDist+1){
      if(!confirm('⚠ ADVERTENCIA: El monto supera el Resultado Neto disponible en Distribución.\n\nDisponible: '+fv(dispDist)+'\nMonto a invertir: '+fv(montoARSest)+'\n\n¿Querés continuar de todas formas?'))return;
    }
  }

  invCalcular();

  var montoARS=parseFloat(tbar.dataset.montoARS)||0;
  var cantidad=tbar.dataset.cantidad||'';

  var parts=fecha.split('-');var mes=parts[0]+parts[1];
  var id=invNuevoId(mes);

  var resultadoFlotante=0, precioActualStr='—';
  if(activo==='BTC'&&_btcPrecioUSD&&_blueARS&&precio>0){
    var q=Math.floor((monto/precio)*1e8)/1e8;
    var precioCompraARS=Math.round(precio*_blueARS);
    var precioActualARS=Math.round(_btcPrecioUSD*_blueARS);
    resultadoFlotante=Math.round((precioActualARS-precioCompraARS)*q);
    precioActualStr='$ '+fi(precioActualARS);
  } else if(activo==='USD_BLUE'&&_blueARS&&precio>0){
    var q2=Math.floor((monto/precio)*100)/100;
    var precioActualARS2=_blueARS;
    resultadoFlotante=Math.round((precioActualARS2-precio)*q2);
    precioActualStr='$ '+fi(Math.round(_blueARS));
  }

  var ALAB={BTC:'Bitcoin (BTC)',USD_BLUE:'Dólar Blue (USD)',REPO:'Fondo Reposición (REPO)'};
  var FLAB={DIST:'Distribución (DIST)',LEXT:'Liquidez Externa (LEXT)'};
  var tk='📅 Fecha: '+d2s(fecha)+'\n';
  tk+='ID Inversión: '+id+'\n';
  tk+='📈 Inversión:\n';
  tk+='  Activo: '+(ALAB[activo]||activo)+'\n';
  tk+='  Fuente: '+(FLAB[fuente]||fuente)+'\n';
  tk+='  Monto invertido: '+(activo==='BTC'?fu(monto)+' USDT':fv(monto))+'\n';
  if(activo!=='REPO'){
    tk+='  Precio de compra: '+fv(Math.round(precio*(activo==='BTC'?(_blueARS||1):1)))+' ARS'+
        (activo==='BTC'?' (US$ '+fu(precio)+')':'')+'\n';
    if(cantidad) tk+='  Cantidad adquirida: '+cantidad+'\n';
  }
  tk+='━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  tk+='💰 Impacto en fuente: -'+fv(montoARS)+'\n';
  if(activo!=='REPO'&&precioActualStr!=='—'){
    tk+='📊 Precio actual: '+precioActualStr+'\n';
    tk+='📈 Resultado flotante: '+(resultadoFlotante>=0?'+':'')+fv(resultadoFlotante)+'\n';
  }
  tk+='🔗 Ref. EGRESOS: 🟡 INVERSIÓN — '+(ALAB[activo]||activo)+'\n';
  if(nota) tk+='📝 Nota: '+nota+'\n';

  var r_blue=_blueARS||0;
  var r_usdt=_usdtARS||r_blue||0;
  var montoARSreg=0;
  if(monedaOrigen==='ARS') montoARSreg=monto;
  else if(monedaOrigen==='USD') montoARSreg=Math.round(monto*r_blue);
  else if(monedaOrigen==='USDT') montoARSreg=Math.round(monto*r_usdt);
  else if(monedaOrigen==='BTC') montoARSreg=Math.round(monto*(_btcPrecioUSD||0)*r_blue);
  var cantidadReg=tbar.dataset.cantidad||'';
  var registro={
    id:id, fecha:fecha, fechaDisplay:d2s(fecha), mesActual:mes,
    activo:monedaDestino, fuente:fuente,
    modalidad:modalidad, monedaOrigen:monedaOrigen, monedaDestino:monedaDestino,
    monto:monto, moneda:monedaOrigen, montoARS:montoARSreg,
    precioCompra:precio||0, cantidad:cantidadReg,
    precioActual:monedaDestino==='BTC'?(_btcPrecioUSD||0):(monedaDestino==='USD'?(_blueARS||0):0),
    resultadoFlotante:resultadoFlotante,
    estado:'ACTIVA', fechaCierre:null,
    nota:nota||null, ticketText:tk
  };

  sInv(registro);
  invRfMes();
  invRenderHistorial();
  renderInvDist();
  window.renderLiqExterna?.();
  window.renderDash?.();
  window.uhd?.();
  invActualizarCampos();
  document.getElementById('inv-tkOut').textContent=tk;
  document.getElementById('inv-outA').style.display='block';
  document.getElementById('inv-outA').scrollIntoView({behavior:'smooth'});
  sN('OK '+id+' registrada');
}

// ── Historial ──
export function invRfMes(){
  var inv=gInv();
  var meses=[...new Set(inv.map(function(x){return x.mesActual;}))].sort();
  var sel=document.getElementById('filtInvMes');
  if(!sel)return;
  var cv=sel.value;
  sel.innerHTML='<option value="all">Todos los meses</option>';
  meses.forEach(function(m){
    var op=document.createElement('option');op.value=m;op.textContent=mLong(m);sel.appendChild(op);
  });
  if(cv)sel.value=cv;
}

export function invRenderHistorial(){
  invActualizarFlotantes();

  var filtro=getInvFiltro();
  var fAct=document.getElementById('filtInvActivo')?document.getElementById('filtInvActivo').value:'all';
  var fEst=document.getElementById('filtInvEstado')?document.getElementById('filtInvEstado').value:'all';
  var inv=filtrarPorPeriodo(gInv(),filtro).sort(function(a,b){return a.fecha<b.fecha?-1:1;});
  if(fAct!=='all')inv=inv.filter(function(x){return x.activo===fAct;});
  if(fEst!=='all')inv=inv.filter(function(x){return x.estado===fEst;});
  var cont=document.getElementById('invHistorial');
  if(!cont)return;
  if(!inv.length){cont.innerHTML='<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:20px">Sin inversiones</div>';return;}

  var ALAB={BTC:'₿ BTC',USD_BLUE:'💵 Blue',REPO:'📦 REPO'};
  var FLAB={distribucion:'DIST',liquidez_externa:'LEXT'};
  var totActivas=inv.filter(function(x){return x.estado==='ACTIVA';}).length;
  var totLiquidadas=inv.filter(function(x){return x.estado==='LIQUIDADA';}).length;

  var grupos={};
  inv.forEach(function(x){if(!grupos[x.mesActual])grupos[x.mesActual]=[];grupos[x.mesActual].push(x);});
  var html='';
  Object.keys(grupos).sort().forEach(function(mes){
    html+='<div class="mhdr">'+mLong(mes)+'</div>';
    grupos[mes].forEach(function(x){
      var flotStr='—';
      if(x.activo!=='REPO'&&x.resultadoFlotante!==undefined){
        var flot=x.resultadoFlotante||0;
        flotStr=(flot>=0?'<span style="color:var(--ac)">+'+fv(flot)+'</span>':'<span style="color:var(--er)">'+fv(flot)+'</span>');
      }
      var estadoStyle=x.estado==='ACTIVA'?'color:var(--ac)':'color:var(--tx3)';
      html+='<div class="hi" style="flex-direction:column;align-items:stretch;gap:6px;cursor:default">'
        +'<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">'
        +'<div>'
        +'<div class="hid" style="color:var(--wn)">'+x.id+'</div>'
        +'<div class="hdate">'+x.fechaDisplay+' &nbsp;|&nbsp; '+(ALAB[x.activo]||x.activo)+' &nbsp;|&nbsp; '+(FLAB[x.fuente]||x.fuente)+'</div>'
        +'</div>'
        +'<span style="font-family:var(--mo);font-size:9px;'+estadoStyle+'">'+x.estado+'</span>'
        +'<div class="htot" style="color:var(--wn)">'+(x.moneda==='USDT'?fu(x.monto)+' USDT':fv(x.montoARS))+'</div>'
        +'</div>'
        +(x.activo!=='REPO'?'<div style="font-family:var(--mo);font-size:9px;color:var(--tx2);display:flex;gap:12px;flex-wrap:wrap">'
          +(x.cantidad?'<span>Cant: <b>'+x.cantidad+'</b></span>':'')
          +'<span>Flotante: '+flotStr+'</span>'
          +'</div>':'')
        +(x.estado==='ACTIVA'&&x.activo!=='REPO'
          ?'<button class="btn btn-s" style="font-size:9px;height:30px;padding:0 10px;margin-right:4px" onclick="invLiquidarModal(\''+x.id+'\')">💱 Liquidar</button>'
          :'')
        +'<button class="btn btn-d" style="font-size:13px;height:30px;width:30px;padding:0;margin-top:4px" onclick="invEliminar(\''+x.id+'\')">✕</button>'
        +'</div>';
    });
  });

  html+='<div style="margin-top:10px;background:var(--s2);border:1px solid var(--br);padding:10px;font-family:var(--mo);font-size:9px">'
    +'<div style="color:var(--tx3);letter-spacing:1px;margin-bottom:6px">RESUMEN DEL PERÍODO</div>'
    +'<div style="display:flex;gap:16px;flex-wrap:wrap">'
    +'<span>Total registros: <b style="color:var(--tx)">'+inv.length+'</b></span>'
    +'<span>Activas: <b style="color:var(--ac)">'+totActivas+'</b></span>'
    +'<span>Liquidadas: <b style="color:var(--tx3)">'+totLiquidadas+'</b></span>'
    +'<span>Último ID: <b style="color:var(--wn)">'+(inv[inv.length-1]?inv[inv.length-1].id:'—')+'</b></span>'
    +'</div></div>';

  cont.innerHTML=html;
}

export function invActualizarFlotantes(){
  var d=ld();
  if(!d.inversiones||!d.inversiones.length)return;
  var changed=false;
  d.inversiones.forEach(function(x){
    if(x.estado!=='ACTIVA')return;
    var dest=x.monedaDestino||x.activo||'';
    var origen=x.monedaOrigen||x.moneda||'ARS';
    if(!x.precioCompra||x.precioCompra<=0)return;
    var q=0,flotante=0;
    if(dest==='BTC'){
      if(!_btcPrecioUSD||!_blueARS)return;
      q=Math.floor((x.monto/x.precioCompra)*1e8)/1e8;
      var pcARS2=(origen==='ARS')?x.precioCompra:Math.round(x.precioCompra*(_blueARS||1));
      var paARS2=Math.round(_btcPrecioUSD*_blueARS);
      flotante=Math.round((paARS2-pcARS2)*q);
      x.precioActual=_btcPrecioUSD;
      x.resultadoFlotante=flotante;
      changed=true;
    } else if(dest==='USD'||dest==='USD_BLUE'){
      if(!_blueARS)return;
      q=Math.floor((x.monto/x.precioCompra)*100)/100;
      flotante=Math.round((_blueARS-x.precioCompra)*q);
      x.precioActual=_blueARS;
      x.resultadoFlotante=flotante;
      changed=true;
    } else if(dest==='USDT'){
      if(!_usdtARS)return;
      q=Math.floor((x.monto/x.precioCompra)*100)/100;
      flotante=Math.round((_usdtARS-x.precioCompra)*q);
      x.precioActual=_usdtARS;
      x.resultadoFlotante=flotante;
      changed=true;
    }
  });
  if(changed)sd(d);
}

export function invLiquidarModal(id){
  var inv=gInv().find(function(x){return x.id===id;});
  if(!inv)return;
  var dest=inv.monedaDestino||inv.activo||'';
  var origen=inv.monedaOrigen||inv.moneda||'ARS';
  var precioSug=0;
  if(dest==='BTC')precioSug=_btcPrecioUSD||0;
  else if(dest==='USD'||dest==='USD_BLUE')precioSug=_blueARS||0;
  else if(dest==='USDT')precioSug=_usdtARS||0;
  var precioLbl='Precio de venta ('+origen+'/'+dest+')';
  var flot=inv.resultadoFlotante||0;
  var flotColor=flot>=0?'var(--ac)':'var(--er)';
  var flotStr='<span style="color:'+flotColor+'">'+(flot>=0?'+':'')+fv(flot)+'</span>';
  document.getElementById('mTitEl').textContent='💱 Liquidar '+id;
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal';
  document.getElementById('mTk').style.display='none';
  var info='<div style="font-family:var(--mo);font-size:10px;margin-bottom:12px;line-height:1.8;background:var(--s2);border:1px solid var(--br);padding:10px">';
  info+='<b>'+id+'</b> — '+dest+'<br>';
  info+='Invertido: <b>'+inv.monto.toLocaleString('es-AR')+' '+origen+'</b>'+(inv.cantidad?' → '+inv.cantidad:'')+'<br>';
  info+='Precio compra: <b>'+inv.precioCompra.toLocaleString('es-AR')+'</b><br>';
  info+='Flotante actual: '+flotStr;
  info+='</div>';
  info+='<div><label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px">'+precioLbl+'</label>';
  info+='<input type="number" id="inv-precio-venta" value="'+precioSug+'" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:14px;padding:9px;outline:none;min-height:44px"></div>';
  document.getElementById('mBody').innerHTML=info;
  document.getElementById('mFooter').innerHTML='<button class="btn btn-p" onclick="invConfirmarLiquidacion(\''+id+'\')" >💱 Confirmar liquidación</button><button class="btn btn-s" onclick="clM()">✕ Cancelar</button>';
  document.getElementById('modal').classList.add('open');
}

export function invConfirmarLiquidacion(id){
  var precioVenta=parseFloat(document.getElementById('inv-precio-venta').value)||0;
  if(!precioVenta){sN('Completá el precio de venta',true);return;}
  var d=ld();
  var inv=d.inversiones?d.inversiones.find(function(x){return x.id===id;}):null;
  if(!inv){sN('No encontrado',true);window.clM?.();return;}

  var dest=inv.monedaDestino||inv.activo||'';
  var origen=inv.monedaOrigen||inv.moneda||'ARS';
  var q=0;
  if(dest==='BTC') q=Math.floor((inv.monto/inv.precioCompra)*1e8)/1e8;
  else q=Math.floor((inv.monto/inv.precioCompra)*100)/100;

  var factor=1;
  if(dest==='BTC') factor=_blueARS||1;
  else if(dest==='USD'||dest==='USD_BLUE') factor=1;
  else if(dest==='USDT') factor=1;
  var pvARS=Math.round(precioVenta*factor);
  var pcARS=Math.round(inv.precioCompra*factor);
  var resultadoRealizado=Math.round((pvARS-pcARS)*q);
  var capitalRecuperado=Math.round((inv.montoARS||0)+resultadoRealizado);

  inv.estado='LIQUIDADA';
  inv.fechaCierre=hoy();
  inv.precioVenta=precioVenta;
  inv.resultadoRealizado=resultadoRealizado;
  inv.capitalRecuperado=capitalRecuperado;
  sd(d);

  var mes=d2m(hoy());
  var fecha=hoy();
  var signo=resultadoRealizado>=0?'+':'';
  var concepto='🟡 LIQ. INVERSIÓN '+id+' ('+dest+') — Resultado: '+signo+fv(resultadoRealizado);
  // Import sE dynamically via window to avoid circular dep
  const sE=window.sE;
  if(resultadoRealizado>=0){
    var eId=nEId(mes);
    var eObj={
      id:eId, fecha:fecha, fechaDisplay:d2s(fecha), mesActual:mes,
      concepto:concepto,
      montoTotal:capitalRecuperado,
      impactoCaja:-capitalRecuperado,
      cuotasTotales:1, cuotasRestantes:0, finaliza:fecha,
      medio:'Liquidación Inversión',
      obs:'Ref: '+id+' | Capital recuperado: '+fv(capitalRecuperado),
      esLiquidacionInv:true, invRef:id
    };
    if(sE)sE(eObj);
  } else {
    var eId2=nEId(mes);
    var eObj2={
      id:eId2, fecha:fecha, fechaDisplay:d2s(fecha), mesActual:mes,
      concepto:concepto,
      montoTotal:Math.abs(resultadoRealizado),
      impactoCaja:Math.abs(resultadoRealizado),
      cuotasTotales:1, cuotasRestantes:0, finaliza:fecha,
      medio:'Pérdida Inversión',
      obs:'Ref: '+id+' | Capital original: '+fv(inv.montoARS||0),
      esLiquidacionInv:true, invRef:id
    };
    if(sE)sE(eObj2);
  }

  invRfMes();
  invRenderHistorial();
  renderInvDist();
  window.renderLiqExterna?.();
  window.rfM?.(); window.rEH?.(); window.rES?.();
  window.renderDash?.();
  window.uhd?.();
  invActualizarCampos();
  window.clM?.();
  sN(id+' liquidada — '+signo+fv(resultadoRealizado)+' → '+(resultadoRealizado>=0?'INGRESO':'EGRESO')+' generado');
}

export function invEliminar(id){
  if(!confirm('¿Eliminar '+id+'?\nEsta acción no se puede deshacer.'))return;
  dInv(id);
  invRfMes();
  invRenderHistorial();
  renderInvDist();
  window.renderLiqExterna?.();
  window.renderDash?.();
  window.uhd?.();
  invActualizarCampos();
  sN(id+' eliminado');
}

export function invAnularModal(){
  window.showInputModal?.('🟡 Anular Inversión por ID','ID (ej: I-202603-0001):',true,'uppercase',function(raw){
    if(!raw)return;
    var id=raw.toUpperCase();
    var inv=gInv().find(function(x){return x.id===id;});
    if(!inv){sN(id+' no encontrado',true);return;}
    if(!confirm('Anular '+id+'?'))return;
    dInv(id);invRfMes();invRenderHistorial();
    sN(id+' anulada');window.clM?.();
  });
}

export function invLimpiar(){
  if(!confirm('Eliminar TODAS las inversiones y liquidez externa?'))return;
  var d=ld();d.inversiones=[];d.liquidezExterna=[];sd(d);
  invRfMes();invRenderHistorial();
  sN('Todo limpio');
}

export function renderInvAll(){
  if(!localStorage.getItem('me_dist_slices')){
    distSlices=buildSmartDefaults();
  }
  renderInvRepo();renderInvDist();invRenderHistorial();window.renderLiqExterna?.();
  if(document.getElementById('inv-activo'))buildInvForm();
  rfInvHistMes();
  if(document.getElementById('inv-activo'))updInvTicket();
}

// ── Aliases ──
export function onInvActivoChange(){invActualizarCampos();}
export function onInvFuenteChange(){}
export function buildInvForm(){invActualizarCampos();}
export function calcInvResult(){invCalcular();}
export function updInvTicket(){invCalcular();}
export function limpiarInversiones(){invLimpiar();}
export function rfInvHistMes(){invRfMes();}

// ── Dashboard inversiones ──
export function renderDashInversiones(cont,f){
  var invAll=gInv();
  if(!invAll.length)return;
  var filtInv;
  if(f==='rango'){
    var desdeEl=document.getElementById('dashDesde');
    var hastaEl=document.getElementById('dashHasta');
    var desde=desdeEl?desdeEl.value:'';
    var hasta=hastaEl?hastaEl.value:'';
    filtInv=invAll.filter(function(o){return(!desde||o.fecha>=desde)&&(!hasta||o.fecha<=hasta);});
  } else if(f!=='all'){
    filtInv=invAll.filter(function(o){return o.mesActual===f;});
  } else {
    filtInv=invAll;
  }
  if(!filtInv.length)return;
  var totInvARS=filtInv.reduce(function(a,x){return a+(x.montoARS||0);},0);
  var byA={};
  filtInv.forEach(function(x){
    var k=x.activo&&x.activo.indexOf('STOCK_')===0?'STOCK':x.activo;
    byA[k]=(byA[k]||0)+(x.montoARS||0);
  });
  var AC2={BTC:'#ff6b35',USD_BLUE:'#ffaa00',USDT:'#7c6fff',ORO:'#e0c080',STOCK:'#00e5a0',OTRO:'#8888a0'};
  var AL2={BTC:'BTC',USD_BLUE:'Dolar Blue',USDT:'USDT',ORO:'Oro',STOCK:'Stock',OTRO:'Otro'};
  var html='<div class="ct" style="margin-top:14px;margin-bottom:8px">Inversiones del período</div>';
  html+='<div class="kpi-grid">';
  html+='<div class="kpi" style="border-top-color:var(--wn)"><div class="klbl">Total Invertido</div><div class="kval wn">'+fv(totInvARS)+'</div><div class="ksub">'+filtInv.length+' registros</div></div>';
  Object.entries(byA).forEach(function(e){
    var col=AC2[e[0]]||'#888';
    html+='<div class="kpi" style="border-top-color:'+col+'"><div class="klbl">'+(AL2[e[0]]||e[0])+'</div><div class="kval" style="color:'+col+'">'+fv(e[1])+'</div></div>';
  });
  html+='</div>';
  cont.innerHTML+=html;
}
