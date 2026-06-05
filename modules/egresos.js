import { ld, sd, gE, dE } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fv, fi, hoy, d2s, d2m, mL, mLong, pn, trunc, addMon } from '../core/formatters.js';
import { nEId } from '../core/ids.js';
import { ghAutoPush } from './github.js';

export function sE(e){const d=ld();if(!d.egresos)d.egresos=[];d.egresos.push(e);sd(d);ghAutoPush();}

export function updEgreso(){
  const monto=parseFloat(document.getElementById('e-monto').value)||0;const cuotas=Math.max(1,parseInt(document.getElementById('e-cuotas').value)||1);
  const prev=document.getElementById('e-preview');if(monto<=0){prev.style.display='none';return;}
  const base=trunc(monto/cuotas),ultima=monto-(base*(cuotas-1));prev.style.display='block';
  if(cuotas===1)prev.innerHTML=`<span style="color:var(--er)">💰 Impacto en caja: -${fv(monto)}</span><br><span style="color:var(--tx3)">Pago único</span>`;
  else prev.innerHTML=`<span style="color:var(--tx2)">Cuota base: ${fv(base)} × ${cuotas-1} cuotas</span><br><span style="color:var(--tx2)">Última cuota: ${fv(ultima)}</span><br><span style="color:var(--er)">💰 Impacto período actual: -${fv(base)}</span><br><span style="color:var(--tx3)">Cuotas restantes: ${cuotas-1}</span>`;
}

export function generarEgreso(){
  const fecha=document.getElementById('e-fecha').value,concepto=document.getElementById('e-concepto').value.trim();
  const monto=parseFloat(document.getElementById('e-monto').value)||0;const medio=document.getElementById('e-medio').value;
  const cuotasN=Math.max(1,parseInt(document.getElementById('e-cuotas').value)||1);const obs=document.getElementById('e-obs').value.trim();
  if(!fecha){sN('ERROR: Fecha requerida',true);return;}if(!concepto){sN('ERROR: Concepto requerido',true);return;}if(monto<=0){sN('ERROR: Monto requerido',true);return;}
  const mes=d2m(fecha),id=nEId(mes),fd=d2s(fecha);
  const base=trunc(monto/cuotasN),ultima=monto-(base*(cuotasN-1)),impacto=cuotasN===1?monto:base,resta=cuotasN-1,finaliza=addMon(mes,cuotasN-1);
  let tk=`📅 Fecha: ${fd}\nID Egreso: ${id}\n\n📉 Egreso:\nConcepto: ${concepto}\nMonto: ${fv(monto)}\nMedio de pago: ${medio}`;
  if(cuotasN>1)tk+=`\nCuotas: ${cuotasN} (base ${fv(base)}, última ${fv(ultima)})`;
  if(obs)tk+=`\n📝 Observaciones: ${obs}`;
  tk+=`\n\n━━━━━━━━━━━━━━━━━━━━━\n💰 Impacto en caja: -${fv(impacto)}`;
  if(cuotasN>1)tk+=`\nCuotas restantes: ${resta}\nFinaliza: ${finaliza}`;else tk+=`\nFinaliza: ${addMon(mes,0)}`;
  const egreso={id,fecha,fechaDisplay:fd,mesActual:mes,concepto,montoTotal:monto,cuotaBase:base,ultimaCuota:ultima,impactoCaja:impacto,cuotasTotales:cuotasN,cuotasRestantes:resta,finaliza,medio,obs:obs||null,ticketText:tk};
  sE(egreso);window.rfM?.();rEH();rES();window.renderDash?.();document.getElementById('e-tkOut').textContent=tk;document.getElementById('e-outA').style.display='block';document.getElementById('e-outA').scrollIntoView({behavior:'smooth'});sN(`✓ ${id} registrado`);window.uhd?.();
}

export function limpiarEgr(){['e-concepto','e-monto','e-obs'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});document.getElementById('e-fecha').value=hoy();document.getElementById('e-cuotas').value='1';document.getElementById('e-preview').style.display='none';document.getElementById('e-outA').style.display='none';}

export function limpiarEgresos(){if(!confirm('¿Eliminar TODOS los egresos?'))return;const d=ld();d.egresos=[];sd(d);window.rfM?.();rEH();rES();window.renderDash?.();sN('Egresos eliminados');window.uhd?.();}

export function anularEgresoByIdModal(){window.showInputModal?.('🔴 Anular Egreso por ID','ID del egreso (ej: E-202603-0001):',true,'uppercase',function(raw){if(!raw)return;const id=raw.toUpperCase();const e=gE().find(x=>x.id===id);if(!e){sN(`${id} no encontrado`,true);return;}if(!confirm(`¿Anular ${id}?\n${e.concepto} — ${fv(e.montoTotal)}`))return;dE(id);window.rfM?.();rEH();rES();window.renderDash?.();sN(`${id} anulado`);window.uhd?.();window.clM?.();});}

export function rEH(){
  const f=document.getElementById('egresosMes').value;
  const desde=document.getElementById('egresosDesde')?.value||'';
  const hasta=document.getElementById('egresosHasta')?.value||'';
  let eg=gE();
  eg.sort((a,b)=>a.fecha<b.fecha?-1:a.fecha>b.fecha?1:a.id.localeCompare(b.id));
  if(f==='rango'){if(desde)eg=eg.filter(e=>e.fecha>=desde);if(hasta)eg=eg.filter(e=>e.fecha<=hasta);}
  else if(f!=='all')eg=eg.filter(e=>e.mesActual===f);
  const c=document.getElementById('eCont');
  if(!eg.length){c.innerHTML=`<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:20px">Sin egresos</div>`;return;}
  const g={};eg.forEach(e=>{if(!g[e.mesActual])g[e.mesActual]=[];g[e.mesActual].push(e);});
  const mesActual=d2m(hoy());
  let html='';
  Object.keys(g).sort().forEach(mes=>{
    const isActual=mes===mesActual;
    const grpTotal=g[mes].reduce((a,e)=>a+(e.montoTotal||0),0);
    const collapseId='egrp-'+mes;
    html+=`<div style="margin-bottom:4px">
      <div onclick="toggleHistGrp('${collapseId}')" style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--s2);border:1px solid var(--br);cursor:pointer;border-left:3px solid ${isActual?'var(--er)':'var(--br)'}">
        <div style="display:flex;align-items:center;gap:8px">
          <span id="${collapseId}-arrow" style="font-family:var(--mo);font-size:10px;color:var(--tx3)">${isActual?'▾':'▸'}</span>
          <span style="font-family:var(--mo);font-size:9px;font-weight:700;color:${isActual?'var(--er)':'var(--tx2)'}">${mLong(mes)}</span>
          <span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">${g[mes].length} reg.</span>
        </div>
        <span style="font-family:var(--mo);font-size:10px;color:var(--er)">-${fv(grpTotal)}</span>
      </div>
      <div id="${collapseId}" style="display:${isActual?'block':'none'}">`;
    g[mes].forEach(e=>{
      const eid=e.id;
      html+=`<div class="hi egr" data-id="${eid}" data-type="egr"><div><div class="hid red">${eid}</div><div class="hdate">${e.fechaDisplay}</div><div class="hclient">${e.concepto}</div></div><span class="badge ber">${e.cuotasTotales>1?e.cuotasTotales+'c':''}</span><div class="htot er">-${fv(e.montoTotal)}</div><button class="hedit" data-edit="${eid}" data-type="egr">EDIT</button><button class="hdel" data-del="${eid}" data-type="egr">×</button></div>`;
    });
    html+=`</div></div>`;
  });
  c.innerHTML=html;
}

export function rES(){
  const f=document.getElementById('egresosMes').value;
  const desde=document.getElementById('egresosDesde')?.value||'';
  const hasta=document.getElementById('egresosHasta')?.value||'';
  let eg=gE();
  eg.sort((a,b)=>a.fecha<b.fecha?-1:a.fecha>b.fecha?1:a.id.localeCompare(b.id));
  if(f==='rango'){if(desde)eg=eg.filter(e=>e.fecha>=desde);if(hasta)eg=eg.filter(e=>e.fecha<=hasta);}
  else if(f!=='all')eg=eg.filter(e=>e.mesActual===f);
  const c=document.getElementById('eStruc');
  if(!eg.length){c.innerHTML=`<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:20px">Sin datos</div>`;return;}
  const total=eg.length;const lastId=eg[eg.length-1].id;
  let rows=eg.map(e=>`<tr><td class="er">${e.id}</td><td class="mu">${e.fechaDisplay}</td><td>${e.concepto}</td><td class="er">${fv(e.montoTotal)}</td><td class="er">-${fv(e.impactoCaja)}</td><td class="mu">${e.cuotasTotales}</td><td class="mu">${e.cuotasRestantes}</td><td class="wn">${e.finaliza||''}</td><td class="mu">${e.medio}</td></tr>`).join('');
  const totMonto=eg.reduce((a,e)=>a+e.montoTotal,0);const totImpacto=eg.reduce((a,e)=>a+e.impactoCaja,0);
  rows+=`<tr class="total-row"><td colspan="3" class="mu">TOTAL (${total} registros) · Último: ${lastId}</td><td class="er">${fv(totMonto)}</td><td class="er">-${fv(totImpacto)}</td><td colspan="4"></td></tr>`;
  c.innerHTML=`<table><thead><tr><th>ID Egreso</th><th>Fecha</th><th>Concepto</th><th>Monto</th><th>Impacto</th><th>C.Tot</th><th>C.Rest</th><th>Finaliza</th><th>Medio</th></tr></thead><tbody>${rows}</tbody></table>`;
}

export function openEditEgr(id){
  const d=ld();const e=(d.egresos||[]).find(x=>x.id===id);if(!e)return;
  document.getElementById('mTitEl').textContent='✏ Editar Egreso '+id;document.getElementById('mTitEl').className='mtit red';document.getElementById('modalBox').className='modal red';document.getElementById('mTk').style.display='none';
  document.getElementById('mBody').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div><label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Fecha</label><input type="date" id="edit-e-fecha" value="${e.fecha}" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none"></div>
      <div><label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Concepto</label><input type="text" id="edit-e-concepto" value="${e.concepto||''}" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none"></div>
      <div><label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Monto Total</label><input type="number" id="edit-e-monto" value="${e.montoTotal}" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none"></div>
      <div><label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Impacto Caja</label><input type="number" id="edit-e-impacto" value="${e.impactoCaja}" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none"></div>
      <div><label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Medio de pago</label><input type="text" id="edit-e-medio" value="${e.medio||''}" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none"></div>
      <div><label style="font-family:var(--mo);font-size:8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Observaciones</label><input type="text" id="edit-e-obs" value="${e.obs||''}" placeholder="opcional" style="width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:12px;padding:8px;outline:none;min-height:40px;border-radius:0;-webkit-appearance:none"></div>
    </div>`;
  document.getElementById('mFooter').innerHTML=`<button class="btn btn-p" onclick="saveEditEgr('${id}')">💾 Guardar</button><button class="btn btn-s" onclick="clM()">✕ Cancelar</button>`;
  document.getElementById('modal').classList.add('open');
}

export function saveEditEgr(id){
  const d=ld();if(!d.egresos)return;const idx=d.egresos.findIndex(x=>x.id===id);if(idx<0)return;
  const nuevaFecha=document.getElementById('edit-e-fecha').value;
  const nuevoConcepto=document.getElementById('edit-e-concepto').value.trim();
  const nuevoMonto=parseFloat(document.getElementById('edit-e-monto').value)||d.egresos[idx].montoTotal;
  const nuevoImpacto=parseFloat(document.getElementById('edit-e-impacto').value)||d.egresos[idx].impactoCaja;
  const nuevoMedio=document.getElementById('edit-e-medio').value.trim();
  const nuevoObs=document.getElementById('edit-e-obs').value.trim();
  if(nuevaFecha){d.egresos[idx].fecha=nuevaFecha;d.egresos[idx].fechaDisplay=d2s(nuevaFecha);d.egresos[idx].mesActual=d2m(nuevaFecha);}
  if(nuevoConcepto)d.egresos[idx].concepto=nuevoConcepto;
  d.egresos[idx].montoTotal=nuevoMonto;d.egresos[idx].impactoCaja=nuevoImpacto;
  if(nuevoMedio)d.egresos[idx].medio=nuevoMedio;d.egresos[idx].obs=nuevoObs||null;
  sd(d);window.rfM?.();rEH();rES();window.renderDash?.();window.clM?.();sN(`✓ ${id} actualizado`);window.uhd?.();
}

export function bE(id){if(!confirm(`¿Eliminar egreso ${id}?`))return;dE(id);window.rfM?.();rEH();rES();window.renderDash?.();sN(`${id} eliminado`);window.uhd?.();}
