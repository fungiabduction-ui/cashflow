import { gO, gE } from '../core/storage.js';
import { sN } from '../ui/notif.js';

export function showInputModal(title,placeholder,isText,style,callback){
  document.getElementById('mTitEl').textContent=title;document.getElementById('mTitEl').className='mtit';document.getElementById('modalBox').className='modal';
  document.getElementById('mTk').style.display='none';
  const inp=`<input type="${isText?'text':'number'}" id="modalInput" placeholder="${placeholder}" style="text-transform:${style||'none'};margin-bottom:12px">`;
  document.getElementById('mBody').innerHTML=inp;
  document.getElementById('mFooter').innerHTML=`<button class="btn btn-p" onclick="(function(){const v=document.getElementById('modalInput').value;clM();(${callback.toString()})(v)})()">Confirmar</button><button class="btn btn-s" onclick="clM()">✕ Cancelar</button>`;
  document.getElementById('modal').classList.add('open');setTimeout(()=>{const el=document.getElementById('modalInput');if(el)el.focus();},100);
}
export function vTk(id){const o=gO().find(x=>x.id===id);if(!o)return;document.getElementById('mTitEl').textContent='🧾 Detalle';document.getElementById('mTitEl').className='mtit';document.getElementById('modalBox').className='modal';document.getElementById('mTk').style.display='block';document.getElementById('mTk').className='mtk';document.getElementById('mTk').textContent=o.ticketText;document.getElementById('mBody').innerHTML='';document.getElementById('mFooter').innerHTML=`<button class="btn btn-s" onclick="cpM()">⎘ Copiar</button><button class="btn btn-s" onclick="clM()">✕ Cerrar</button>`;document.getElementById('modal').classList.add('open');}
export function vEgr(id){const e=gE().find(x=>x.id===id);if(!e)return;document.getElementById('mTitEl').textContent='📉 Egreso';document.getElementById('mTitEl').className='mtit red';document.getElementById('modalBox').className='modal red';document.getElementById('mTk').style.display='block';document.getElementById('mTk').className='mtk red';document.getElementById('mTk').textContent=e.ticketText;document.getElementById('mBody').innerHTML='';document.getElementById('mFooter').innerHTML=`<button class="btn btn-s" onclick="cpM()">⎘ Copiar</button><button class="btn btn-s" onclick="clM()">✕ Cerrar</button>`;document.getElementById('modal').classList.add('open');}
export function clM(){document.getElementById('modal').classList.remove('open');document.getElementById('mTk').style.display='none';document.getElementById('mBody').innerHTML='';}
export function cpM(){navigator.clipboard.writeText(document.getElementById('mTk').textContent).then(()=>sN('Copiado'));}
