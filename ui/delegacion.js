import { sN } from '../ui/notif.js';
import { bO, openEditVenta } from '../modules/ventas.js';
import { bE, openEditEgr } from '../modules/egresos.js';
import { getProductos } from '../modules/productos.js';
import { getStockStatus, skPill } from '../modules/stock.js';

export function setupDelegation(){
  ['hCont','eCont','tSeg'].forEach(cid=>{
    const el=document.getElementById(cid);if(!el)return;
    el.addEventListener('click',function(e){
      const delBtn=e.target.closest('[data-del]');
      if(delBtn){e.stopPropagation();const id=delBtn.getAttribute('data-del');const type=delBtn.getAttribute('data-type');if(type==='venta')bO(id);else if(type==='egr')bE(id);return;}
      const editBtn=e.target.closest('[data-edit]');
      if(editBtn){e.stopPropagation();const id=editBtn.getAttribute('data-edit');const type=editBtn.getAttribute('data-type');if(type==='venta')openEditVenta(id);else if(type==='egr')openEditEgr(id);return;}
      const item=e.target.closest('[data-type]');
      if(item){const id=item.getAttribute('data-id');const type=item.getAttribute('data-type');if(type==='venta')window.vTk?.(id);else if(type==='egr')window.vEgr?.(id);}
    });
  });
}

export function setupDrop(){
  // dropZone eliminado — importación XLSX removida
}

export function invSubTab(name){
  ['stock','productos','umbrales','historial'].forEach(n=>{
    const p=document.getElementById('invp-'+n);
    const b=document.getElementById('inv-sub-'+n);
    if(p)p.style.display=n===name?'':'none';
    if(b){
      b.style.color=n===name?'var(--ac)':'var(--tx2)';
      b.style.borderBottom=n===name?'2px solid var(--ac)':'2px solid transparent';
    }
  });
  if(name==='stock'){window.renderInventario?.();}
  if(name==='productos'){window.renderInventarioTabla?.();}
  if(name==='umbrales'){window.renderUmbrales?.();}
  if(name==='historial'){window.renderStockHistorial?.();}
}

export function toggleStockGroup(pid){
  const el=document.getElementById('sk-grp-vars-'+pid);
  const arrow=document.getElementById('sk-grp-arrow-'+pid);
  const sub=document.getElementById('sg-sub-'+pid);
  if(!el)return;
  const open=el.style.display==='none'||!el.style.display;
  el.style.display=open?'flex':'none';
  if(arrow)arrow.textContent=open?'▾':'▸';
  if(sub){const unit=sub.textContent.split('·')[0].trim();sub.innerHTML=`suma variantes · ${open?'<span style="color:var(--ac2)">▾ colapsar</span>':'<span style="color:var(--ac2)">▸ expandir</span>'}`;}
}

export function onVariantInput(vid,pid){
  window.previewStockCard?.(vid);
  // recalc group total from all variant inputs
  const p=getProductos().find(x=>x.id===pid);if(!p)return;
  const grpId='grp-'+pid;
  const sum=p.variantes.reduce((a,v)=>{const el=document.getElementById('si-'+v.id);return a+(el?Math.max(0,parseFloat(el.value)||0):0);},0);
  const grpSt=getStockStatus(sum,grpId);
  const unit=p.unit||'ud';
  // update group card displays
  const sv=document.getElementById('sqv-'+grpId);if(sv){sv.textContent=sum+' '+unit;sv.className='sk-stat-val '+grpSt;}
  const pill=document.getElementById('sg-pill-'+grpId);if(pill)pill.innerHTML=skPill(grpSt,sum,unit);
  const card=document.getElementById('srow-'+grpId);if(card){card.className='sk-card '+grpSt;}
}
