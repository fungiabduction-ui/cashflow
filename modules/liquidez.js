import { ld, sd, gLiqExterna, dLiqExterna, gInv } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fv, fi, fu, hoy, d2s } from '../core/formatters.js';
import { ghAutoPush } from './github.js';

// Separate dist slices for liquidez externa
const LIQ_DIST_DEFAULTS=[{id:'ls1',label:'Bitcoin',pct:50,color:'#ff6b35',activo:'BTC'},{id:'ls2',label:'Dolar Blue',pct:50,color:'#ffaa00',activo:'USD_BLUE'}];
let liqDistSlices=JSON.parse(localStorage.getItem('me_liq_dist_slices')||'null')||LIQ_DIST_DEFAULTS.map(function(x){return Object.assign({},x);});

export function sLiqExterna(l) {
  const d = ld();
  if (!d.liquidezExterna) d.liquidezExterna = [];
  d.liquidezExterna.push(l);
  sd(d);
  ghAutoPush();
}

export function saveLiqSlices(){localStorage.setItem('me_liq_dist_slices',JSON.stringify(liqDistSlices));}

export function autoBalanceLiq(ci){
  const tot=liqDistSlices.reduce(function(a,s){return a+s.pct;},0);
  if(Math.abs(tot-100)<0.1)return;
  const diff=100-tot;const others=liqDistSlices.filter(function(_,i){return i!==ci;});
  if(!others.length)return;
  const pp=diff/others.length;others.forEach(function(s){s.pct=Math.max(0,parseFloat((s.pct+pp).toFixed(1)));});
  const nt=liqDistSlices.reduce(function(a,s){return a+s.pct;},0);
  if(Math.abs(nt-100)>0.1){const li=liqDistSlices.length-1===ci?liqDistSlices.length-2:liqDistSlices.length-1;if(liqDistSlices[li])liqDistSlices[li].pct=parseFloat(Math.max(0,liqDistSlices[li].pct+(100-nt)).toFixed(1));}
}

export function renderLiqDistConfig(){
  const cont=document.getElementById('liqDistSlices');if(!cont)return;
  const COLS=['#ff6b35','#ffaa00','#00e5a0','#7c6fff','#ff4455','#44aaff','#e0c080','#cc88ff'];
  let html='';
  liqDistSlices.forEach(function(s,i){
    html+='<div style="display:grid;grid-template-columns:22px 1fr 60px 28px;gap:6px;align-items:center;margin-bottom:6px">'
      +'<div style="width:16px;height:16px;background:'+s.color+';border-radius:2px;cursor:pointer" onclick="cycleLiqColor('+i+')"></div>'
      +'<input type="text" value="'+s.label+'" oninput="liqDistSlices['+i+'].label=this.value;saveLiqSlices()" style="min-height:34px;font-size:11px;padding:4px 8px">'
      +'<div style="display:flex;align-items:center;gap:2px"><input type="number" min="0" max="100" value="'+s.pct+'" onchange="liqDistSlices['+i+'].pct=Math.max(0,Math.min(100,parseFloat(this.value)||0));autoBalanceLiq('+i+');saveLiqSlices();renderLiqDistConfig();renderLiqExterna()" style="min-height:34px;font-size:11px;padding:4px 4px;width:42px"><span style="font-family:var(--mo);font-size:9px;color:var(--tx3)">%</span></div>'
      +(liqDistSlices.length>1?'<button class="qrst" onclick="removeLiqSlice('+i+')" style="height:34px">x</button>':'<div></div>')
      +'</div>';
  });
  const tot=liqDistSlices.reduce(function(a,s){return a+s.pct;},0);
  html+='<div style="font-family:var(--mo);font-size:9px;color:'+(Math.abs(tot-100)<0.5?'var(--ac)':'var(--er)')+'">'+(Math.abs(tot-100)<0.5?'✓ Balanceado':'Auto-balance pendiente')+' · Total: '+tot.toFixed(1)+'%</div>';
  cont.innerHTML=html;
}

export function cycleLiqColor(i){const cols=['#ff6b35','#ffaa00','#00e5a0','#7c6fff','#ff4455','#44aaff','#e0c080','#cc88ff'];const cur=liqDistSlices[i].color;const idx=cols.indexOf(cur);liqDistSlices[i].color=cols[(idx+1)%cols.length];saveLiqSlices();renderLiqDistConfig();}

export function addLiqSlice(){
  const cols=['#ff6b35','#ffaa00','#00e5a0','#7c6fff','#ff4455','#44aaff','#e0c080','#cc88ff'];
  const n=liqDistSlices.length+1;const pe=parseFloat((100/n).toFixed(1));
  liqDistSlices.forEach(function(s){s.pct=pe;});
  liqDistSlices.push({id:'ls'+Date.now(),label:'Destino',pct:pe,color:cols[(n-1)%cols.length],activo:'OTRO'});
  const tot=liqDistSlices.reduce(function(a,s){return a+s.pct;},0);liqDistSlices[liqDistSlices.length-1].pct=parseFloat((liqDistSlices[liqDistSlices.length-1].pct+(100-tot)).toFixed(1));
  saveLiqSlices();renderLiqDistConfig();
}

export function removeLiqSlice(i){
  if(liqDistSlices.length<=1)return;liqDistSlices.splice(i,1);
  const pe=parseFloat((100/liqDistSlices.length).toFixed(1));liqDistSlices.forEach(function(s){s.pct=pe;});
  const tot=liqDistSlices.reduce(function(a,s){return a+s.pct;},0);liqDistSlices[liqDistSlices.length-1].pct=parseFloat((liqDistSlices[liqDistSlices.length-1].pct+(100-tot)).toFixed(1));
  saveLiqSlices();renderLiqDistConfig();
}

let _liqView='ars';
export function setLiqView(v){
  _liqView=v;
  ['ARS','BTC','USD'].forEach(function(k){const b=document.getElementById('liqView'+k);if(b)b.className='tgb'+(v===k.toLowerCase()?' active':'');});
  renderLiqExterna();
}

export function updLiqPreview(){
  const monto=parseFloat(document.getElementById('liq-monto').value)||0;
  const prev=document.getElementById('liq-preview');
  if(!monto){prev.style.display='none';return;}
  let arsEq='',btcEq='';
  if(window._blueARS)arsEq=fv(monto*window._blueARS)+' ARS';
  if(window._btcPrecioUSD&&window._blueARS)btcEq=(monto*window._blueARS/(window._btcPrecioUSD*window._blueARS)).toFixed(6)+' BTC ('+(monto/window._btcPrecioUSD).toFixed(6)+' BTC)';
  prev.style.display='block';
  prev.innerHTML='<span style="color:#44aaff">'+monto+' USD</span>'
    +(arsEq?' = <span style="color:var(--ac)">'+arsEq+'</span>':'')
    +(btcEq?' = <span style="color:#ff6b35">'+btcEq+'</span>':'');
}

export function toggleLiqExterna(){
  var body=document.getElementById('liq-body');
  var icon=document.getElementById('liq-collapse-icon');
  if(!body)return;
  var open=body.style.display!=='none';
  body.style.display=open?'none':'';
  if(icon)icon.textContent=open?'▶':'▼';
}

export function registrarLiqExterna(){
  const fecha=document.getElementById('liq-fecha').value;
  const monto=parseFloat(document.getElementById('liq-monto').value)||0;
  const desc=document.getElementById('liq-desc').value.trim();
  if(!fecha||!monto){sN('Completa fecha y monto USD',true);return;}
  const parts=fecha.split('-');const mes=parts[0]+parts[1];
  const arsEq=window._blueARS?Math.round(monto*window._blueARS):0;
  const btcEq=(window._btcPrecioUSD&&window._blueARS)?parseFloat((monto/window._btcPrecioUSD).toFixed(8)):0;
  const id='L-'+mes+'-'+String(gLiqExterna().filter(function(x){return x.mesActual===mes;}).length+1).padStart(4,'0');
  sLiqExterna({id:id,fecha:fecha,fechaDisplay:d2s(fecha),mesActual:mes,moneda:'USD',monto:monto,arsEquivalente:arsEq,btcEquivalente:btcEq,descripcion:desc||null});
  document.getElementById('liq-monto').value='';document.getElementById('liq-desc').value='';document.getElementById('liq-preview').style.display='none';
  window.rfInvM?.();renderLiqExterna();window.renderDash?.();window.uhd?.();window.invActualizarCampos?.();sN('OK '+id+' registrado');
}

export function renderLiqExterna(){
  const filtro=window.getInvFiltro();
  const liq=window.filtrarPorPeriodo(gLiqExterna(),filtro);
  const inv=window.filtrarPorPeriodo(gInv(),filtro).filter(function(x){return x.fuente==='liquidez_externa'||x.fuente==='mixto';});
  const totalUSD=liq.reduce(function(a,x){return a+x.monto;},0);
  const totalARS=liq.reduce(function(a,x){return a+(x.arsEquivalente||0);},0);
  const totalBTC=liq.reduce(function(a,x){return a+(x.btcEquivalente||0);},0);
  // Track USD spent: use montoOriginal directly when moneda=USD, else convert from ARS
  const yaUsadoUSD=inv.reduce(function(a,x){
    if(x.moneda==='USD')return a+(x.montoOriginal||0);
    if(x.moneda==='USDT')return a+(x.montoOriginal||0); // USDT ~ USD for tracking
    return a+((x.montoARS||0)/(window._blueARS||1));
  },0);
  const yaUsadoUSDrounded=parseFloat(yaUsadoUSD.toFixed(2));
  const yaUsadoARS=Math.round(yaUsadoUSD*(window._blueARS||0));
  const dispUSD=Math.max(0,parseFloat((totalUSD-yaUsadoUSDrounded).toFixed(2)));
  const dispARS=Math.max(0,totalARS-yaUsadoARS);
  const dispBTC=window._btcPrecioUSD&&window._blueARS&&dispARS?parseFloat((dispARS/(window._btcPrecioUSD*window._blueARS)).toFixed(8)):0;

  renderLiqDistConfig();

  const res=document.getElementById('liqExternaResumen');
  if(res){
    if(!liq.length){res.innerHTML='<div style="font-family:var(--mo);font-size:11px;color:var(--tx3)">Sin liquidez registrada</div>';}
    else{
      const fu=fu;
      res.innerHTML='<div class="kpi-grid" style="margin-bottom:8px">'
        +'<div class="kpi" style="border-top-color:#44aaff"><div class="kicon">💰</div><div class="klbl">Total USD</div><div class="kval" style="color:#44aaff">'+fu(totalUSD)+' USD</div><div class="ksub">'+liq.length+' registros</div></div>'
        +'<div class="kpi neg"><div class="kicon">↗</div><div class="klbl">Invertido</div><div class="kval neg">-'+fu(yaUsadoUSD)+' USD</div></div>'
        +'<div class="kpi '+(dispUSD>0?'':'neg')+'" style="grid-column:1/-1"><div class="kicon">💵</div><div class="klbl">Disponible</div><div class="kval '+(dispUSD>0?'ac':'neg')+'" style="font-size:16px">'+fu(dispUSD)+' USD</div></div>'
        +'</div>'
        +'<div class="tw" style="margin-bottom:8px"><table><thead><tr><th>ID</th><th>Fecha</th><th>USD</th><th>ARS equiv.</th><th>BTC equiv.</th><th>Desc.</th><th></th></tr></thead><tbody>'
        +liq.map(function(x){return '<tr><td style="color:#44aaff">'+x.id+'</td><td class="mu">'+x.fechaDisplay+'</td><td class="ac">'+fu(x.monto)+' USD</td><td class="mu">'+(x.arsEquivalente?fv(x.arsEquivalente):'—')+'</td><td class="mu" style="color:#ff6b35">'+(x.btcEquivalente?x.btcEquivalente.toFixed(6):'—')+'</td><td class="mu">'+(x.descripcion||'')+'</td><td><button class="qrst" onclick="dLiqExterna(\''+x.id+'\');renderLiqExterna()">x</button></td></tr>';}).join('')
        +'</tbody></table></div>';
    }
  }

  // View toggles: ARS / BTC / USD
  const vc=document.getElementById('liqValoresContent');
  if(vc&&liq.length){
    const fu=fu;
    if(_liqView==='ars'){
      vc.innerHTML='<div class="kpi-grid">'
        +'<div class="kpi"><div class="klbl">Total Liquidez</div><div class="kval ac">'+fv(totalARS)+'</div><div class="ksub">'+fu(totalUSD)+' USD</div></div>'
        +'<div class="kpi '+(dispARS>=0?'':'neg')+'"><div class="klbl">Disponible</div><div class="kval '+(dispARS>=0?'ac':'neg')+'">'+fv(dispARS)+'</div><div class="ksub">-'+fv(yaUsadoARS)+' invertido</div></div>'
        +'</div>';
    } else if(_liqView==='btc'){
      const totalBTCcalc=(window._btcPrecioUSD&&window._blueARS)?parseFloat((totalARS/(window._btcPrecioUSD*window._blueARS)).toFixed(8)):totalBTC;
      const dispBTCcalc=(window._btcPrecioUSD&&window._blueARS)?parseFloat((dispARS/(window._btcPrecioUSD*window._blueARS)).toFixed(8)):0;
      vc.innerHTML='<div class="kpi-grid">'
        +'<div class="kpi org"><div class="klbl">Total en BTC</div><div class="kval org">'+totalBTCcalc.toFixed(8)+'</div><div class="ksub">'+fu(totalUSD)+' USD'+((window._btcPrecioUSD?(' @ US$ '+fi(window._btcPrecioUSD)):''))+'</div></div>'
        +'<div class="kpi '+(dispBTCcalc>=0?'org':'neg')+'"><div class="klbl">Disponible BTC</div><div class="kval '+(dispBTCcalc>=0?'org':'neg')+'">'+dispBTCcalc.toFixed(8)+'</div><div class="ksub">'+fv(dispARS)+' ARS</div></div>'
        +'</div>'
        +(!window._btcPrecioUSD?'<div style="font-family:var(--mo);font-size:9px;color:var(--wn);margin-top:6px">Actualiza precios para ver en BTC</div>':'');
    } else {
      const fu=fu;
      vc.innerHTML='<div class="kpi-grid">'
        +'<div class="kpi" style="border-top-color:#44aaff"><div class="klbl">Total USD</div><div class="kval" style="color:#44aaff">'+fu(totalUSD)+' USD</div></div>'
        +'<div class="kpi '+(dispUSD>=0?'':'neg')+'"><div class="klbl">Disponible USD</div><div class="kval '+(dispUSD>=0?'ac':'neg')+'">'+fu(dispUSD)+' USD</div><div class="ksub">-'+fu(yaUsadoUSD)+' USD invertido</div></div>'
        +'</div>';
    }
  } else if(vc){vc.innerHTML='';}

  // Distribution chart using liqDistSlices
  const dc=document.getElementById('liqDistContent');if(!dc)return;
  if(!liq.length||dispARS<=0){dc.innerHTML='<div style="font-family:var(--mo);font-size:9px;color:var(--tx3)">Sin liquidez disponible para distribuir</div>';return;}
  const totPct=liqDistSlices.reduce(function(a,s){return a+s.pct;},0)||100;
  // Use USD as base for liquidez externa distribution
  const rows=liqDistSlices.map(function(s){return window.distRowUSD(s,dispUSD*(s.pct/totPct));});
  dc.innerHTML='<div style="font-family:var(--mo);font-size:9px;color:var(--tx3);margin-bottom:8px">Disponible: <span style="color:#44aaff">'+fu(dispUSD)+' USD</span></div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:6px;margin-bottom:10px">'
    +rows.map(function(r){return '<div style="background:var(--s2);border:1px solid var(--br);border-top:2px solid '+r.color+';padding:8px"><div style="font-family:var(--mo);font-size:7px;color:var(--tx3);text-transform:uppercase;margin-bottom:2px">'+r.pct.toFixed(1)+'% '+r.label+'</div><div style="font-family:var(--mo);font-size:11px;font-weight:700;color:'+r.color+'">'+r.displayVal+'</div><div style="font-family:var(--mo);font-size:8px;color:var(--tx3)">'+r.equiv+'</div></div>';}).join('')
    +'</div><div style="position:relative;height:150px"><canvas id="cLiqTorta"></canvas></div>';
  window.renderDistChart('cLiqTorta',rows,window._liqChartRef,150);
}

window._getLiqDistSlices = () => liqDistSlices;
window._setLiqDistSlices = (v) => { liqDistSlices = v; };
