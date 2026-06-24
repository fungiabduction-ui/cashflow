import { getApariencia, loadAparienciaForm, updateThemeCards } from './apariencia.js';
import { ld } from '../core/storage.js';
import { sN } from '../ui/notif.js';

export function renderSettings(){
  loadAparienciaForm();
  const saved=getApariencia();
  const activePreset=saved?._preset||'dark';
  updateThemeCards(activePreset);
  _renderMigracionTcBtn();
}

function _renderMigracionTcBtn(){
  const cont=document.getElementById('settingsMaintTools');
  if(!cont)return;
  const d=ld();
  const count=(d.orders||[]).filter(o=>o.tc===null||o.tc===undefined).length;
  const existing=document.getElementById('btnMigraTcNull');
  if(existing)existing.remove();
  if(count===0)return;
  const btn=document.createElement('button');
  btn.id='btnMigraTcNull';
  btn.textContent='⚙ Migrar TC nulo ('+count+' órdenes)';
  btn.style.cssText='margin-top:8px;font-family:var(--mo);font-size:9px;padding:6px 14px;background:var(--wn);color:#000;border:none;cursor:pointer';
  btn.onclick=function(){
    const r=window.migrarTcNull?.();
    if(r)sN('✓ TC migrado en '+r.migradas+' órdenes');
    btn.remove();
  };
  cont.appendChild(btn);
}
