import { gOConf, gO, gE, gInv, ld } from '../core/storage.js';
import { mLong, d2m, hoy } from '../core/formatters.js';
import { rfInvM, renderInvAll, invSelFuente, fetchPrecios } from '../modules/inversiones.js';
import { destroyCharts, onDashMesChange, renderDashFlowChart } from '../modules/dashboard.js';
import { rS, rH } from '../modules/ventas.js';
import { rES, rEH } from '../modules/egresos.js';
import { renderSettings } from '../modules/settings.js';
import { renderInventario } from '../modules/inventario.js';
import { ghInit, renderIOStatus } from '../modules/github.js';

export function rfM(){
  const orders=gOConf(),eg=gE();const mV=[...new Set(orders.map(o=>o.mesActual))].sort();const mE=[...new Set(eg.map(e=>e.mesActual))].sort();const mI=[...new Set(gInv().map(x=>x.mesActual))].sort();const mAll=[...new Set([...mV,...mE,...mI])].sort();
  const mesActual=d2m(hoy());

  function fillWithRango(id,meses,lbl,defaultMes){
    const sel=document.getElementById(id);if(!sel)return;
    const cv=sel.value;
    sel.innerHTML='<option value="all">'+lbl+'</option>';
    meses.forEach(m=>{const op=document.createElement('option');op.value=m;op.textContent=mLong(m);sel.appendChild(op);});
    const ro=document.createElement('option');ro.value='rango';ro.textContent='📅 Rango de fechas...';sel.appendChild(ro);
    if(cv&&(meses.includes(cv)||cv==='rango'))sel.value=cv;
    else if(defaultMes&&meses.includes(defaultMes))sel.value=defaultMes;
  }

  // Ventas: selector unificado
  fillWithRango('ventasMes',mV,'Todo el período',mesActual);
  const vv=document.getElementById('ventasMes')?.value;
  const vdw=document.getElementById('ventasDesdeWrap'),vhw=document.getElementById('ventasHastaWrap');
  if(vdw&&vhw){vdw.style.display=vv==='rango'?'':'none';vhw.style.display=vv==='rango'?'':'none';}

  // Egresos: selector unificado
  fillWithRango('egresosMes',mE,'Todo el período',mesActual);
  const ev=document.getElementById('egresosMes')?.value;
  const edw=document.getElementById('egresosDesdeWrap'),ehw=document.getElementById('egresosHastaWrap');
  if(edw&&ehw){edw.style.display=ev==='rango'?'':'none';ehw.style.display=ev==='rango'?'':'none';}

  // Inversiones: selector unificado global
  fillWithRango('invGlobalMes',mAll,'Todo el período',null);
  const igv=document.getElementById('invGlobalMes')?.value;
  const igdw=document.getElementById('invGlobalDesdeWrap'),ighw=document.getElementById('invGlobalHastaWrap');
  if(igdw&&ighw){igdw.style.display=igv==='rango'?'':'none';ighw.style.display=igv==='rango'?'':'none';}

  // Mantener invDistMes en sync (lo necesita renderInvDist internamente)
  fill('invDistMes',mAll,'Todo el período');

  // Dashboard
  const ds=document.getElementById('dashMes');if(ds){
    const cv=ds.value;
    ds.innerHTML='<option value="all">Todo el período</option>';
    mAll.forEach(m=>{const op=document.createElement('option');op.value=m;op.textContent=mLong(m);ds.appendChild(op);});
    const ro=document.createElement('option');ro.value='rango';ro.textContent='📅 Rango de fechas...';ds.appendChild(ro);
    if(cv&&mAll.includes(cv)){ds.value=cv;}
    else if(mAll.includes(mesActual)){ds.value=mesActual;}
  }
  const dw=document.getElementById('dashDesdeWrap'),hw=document.getElementById('dashHastaWrap');
  const curV=document.getElementById('dashMes')?document.getElementById('dashMes').value:'all';
  if(dw&&hw){dw.style.display=curV==='rango'?'':'none';hw.style.display=curV==='rango'?'':'none';}
  rfInvM();

  // Stock & Umbrales: selector por mes igual que dashboard
  fillWithRango('invPeriodo',mV,'Todo el período',mesActual);
  const ipv=document.getElementById('invPeriodo')?.value;
  const ipdw=document.getElementById('invPeriodoDesdeWrap'),iphw=document.getElementById('invPeriodoHastaWrap');
  if(ipdw&&iphw){ipdw.style.display=ipv==='rango'?'':'none';iphw.style.display=ipv==='rango'?'':'none';}

  function fill(id,meses,lbl){const sel=document.getElementById(id);if(!sel)return;const cv=sel.value;sel.innerHTML='<option value="all">'+lbl+'</option>';meses.forEach(m=>{const op=document.createElement('option');op.value=m;op.textContent=mLong(m);sel.appendChild(op);});if(meses.includes(cv))sel.value=cv;}
}

export function onVentasMesChange(){
  const v=document.getElementById('ventasMes').value;
  const dw=document.getElementById('ventasDesdeWrap'),hw=document.getElementById('ventasHastaWrap');
  if(v==='rango'){
    if(dw)dw.style.display='';if(hw)hw.style.display='';
    const h=hoy();
    if(document.getElementById('ventasDesde'))document.getElementById('ventasDesde').value=h.substring(0,8)+'01';
    if(document.getElementById('ventasHasta'))document.getElementById('ventasHasta').value=h;
  } else {if(dw)dw.style.display='none';if(hw)hw.style.display='none';}
  rS();rH();
}

export function onEgresosMesChange(){
  const v=document.getElementById('egresosMes').value;
  const dw=document.getElementById('egresosDesdeWrap'),hw=document.getElementById('egresosHastaWrap');
  if(v==='rango'){
    if(dw)dw.style.display='';if(hw)hw.style.display='';
    const h=hoy();
    if(document.getElementById('egresosDesde'))document.getElementById('egresosDesde').value=h.substring(0,8)+'01';
    if(document.getElementById('egresosHasta'))document.getElementById('egresosHasta').value=h;
  } else {if(dw)dw.style.display='none';if(hw)hw.style.display='none';}
  rES();rEH();
}

export function showTab(n,btn){
  destroyCharts();
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+n).classList.add('active');if(btn)btn.classList.add('active');
  if(n==='ventas'){rS();rH();}
  if(n==='egresos'){rES();rEH();if(!document.getElementById('e-fecha').value)document.getElementById('e-fecha').value=hoy();}
  if(n==='dashboard'){onDashMesChange();renderDashFlowChart();}
  if(n==='inversiones'){renderInvAll();document.getElementById('inv-fecha').value=hoy();if(!document.getElementById('liq-fecha').value)document.getElementById('liq-fecha').value=hoy();invSelFuente('distribucion');fetchPrecios();}
  if(n==='settings'){renderSettings();ghInit();renderIOStatus();}
  if(n==='inventario'){renderInventario();}
  if(n==='contactos'){
    const _d=ld();
    if(!_d.contactosMigDone&&(_d.orders||[]).some(o=>o.cliente)){
      window.mostrarMigracionContactos?.();
    } else {
      window.renderContactos?.();
    }
  }
}

export function uhd(){const d=new Date();const dd=String(d.getDate()).padStart(2,'0'),mm=String(d.getMonth()+1).padStart(2,'0'),yyyy=d.getFullYear(),hh=String(d.getHours()).padStart(2,'0'),mi=String(d.getMinutes()).padStart(2,'0'),ss=String(d.getSeconds()).padStart(2,'0');document.getElementById('hm').innerHTML=`${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}<br>${gO().length}v · ${gE().length}e`;}
