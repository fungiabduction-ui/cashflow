import { ld, sd } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { DEFAULT_PRODUCTS, DPT, DCT, DHT, DGP, DPP } from '../core/constants.js';
import { fv, uid } from '../core/formatters.js';
import { getListasPrecios, getTramosProducto } from './listas-precios.js';
import { getActualQty, getStockStatus } from './stock.js';

// ── PRODUCT CATALOG ──
export function getProductos(){
  const d=ld();
  let prods;
  if(d.productos&&Array.isArray(d.productos)&&d.productos.length){
    prods=d.productos;
  } else {
    prods=DEFAULT_PRODUCTS.map(p=>JSON.parse(JSON.stringify(p)));
  }
  // Migración: si hay un producto 'p-past' tipo grupo, expandirlo en individuales
  const pastIdx=prods.findIndex(p=>p.id==='p-past'&&p.agrupacion==='grupo');
  if(pastIdx>=0){
    const past=prods[pastIdx];
    const individuales=[
      {id:'v-cal',emoji:'💀',nombre:'Calaveras',unit:'ud',costo:past.costo||5075,tipo:'tramos',listaPrecioId:'lp-past',tramos:(past.tramos||DPT).map(x=>({...x})),activo:true,legacyKey:'calaveras'},
      {id:'v-ted',emoji:'🧸',nombre:'Teddy',unit:'ud',costo:past.costo||5075,tipo:'tramos',listaPrecioId:'lp-past',tramos:(past.tramos||DPT).map(x=>({...x})),activo:true,legacyKey:'teddy'},
      {id:'v-lck',emoji:'🐱',nombre:'Lucky Cat',unit:'ud',costo:past.costo||5075,tipo:'tramos',listaPrecioId:'lp-past',tramos:(past.tramos||DPT).map(x=>({...x})),activo:true,legacyKey:'lucky'},
      {id:'v-gen',emoji:'💊',nombre:'Genéricas',unit:'ud',costo:past.costo||5075,tipo:'tramos',listaPrecioId:'lp-past',tramos:(past.tramos||DPT).map(x=>({...x})),activo:true,legacyKey:'genericas'},
    ];
    prods.splice(pastIdx,1,...individuales);
    saveProductos(prods);
  }
  return prods;
}

export function saveProductos(prods){const d=ld();d.productos=prods;sd(d);}

export function updateClientesDatalist(){
  const d=ld();
  const orders=d.orders||[];
  const clientesSet=new Set();
  orders.forEach(o=>{if(o.cliente&&o.cliente.trim())clientesSet.add(o.cliente.trim());});
  const sorted=Array.from(clientesSet).sort();
  const dl=document.getElementById('clientes-list');
  if(dl)dl.innerHTML=sorted.map(c=>`<option value="${c}">`).join('');
}

// ── PRODUCT MANAGER ──
export function renderPM(){
  const prods=getProductos();
  const cont=document.getElementById('pmList2')||document.getElementById('pmList');if(!cont)return;
  if(!prods.length){cont.innerHTML='<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:20px">Sin productos</div>';return;}
  let html='';
  prods.forEach(p=>{
    const inact=!p.activo;
    const tipoLabel=p.tipo==='fijo'?`<span class="pm-badge pm-fijo">PRECIO FIJO</span>`:`<span class="pm-badge pm-tramo">TRAMOS ×${(p.tramos||[]).length}</span>`;
    const costoLabel=p.costo!=null?`Costo: ${fv(p.costo)}/${p.unit}`:'Sin costo definido';
    const inactLabel=inact?`<span class="pm-badge" style="background:rgba(255,68,85,.12);color:var(--er);border:1px solid rgba(255,68,85,.2)">INACTIVO</span>`:'';
    const tramos=getTramosProducto(p);
    const basePrice=tramos[0]?.p||0;
    html+=`<div class="pm-card${inact?' inactive':''}">
      <div class="pm-accent-bar"></div>
      <div class="pm-card-top">
        <div class="pm-emoji">${p.emoji}</div>
        <div class="pm-info">
          <div class="pm-name">${p.nombre}</div>
          <div class="pm-meta">${costoLabel} · ${p.unit}${basePrice?` · Precio base: ${fv(basePrice)}`:''}</div>
          <div class="pm-badges">${tipoLabel} ${inactLabel}</div>
        </div>
        <div class="pm-actions">
          <button class="pm-btn" onclick="duplicarProducto('${p.id}')" title="Duplicar">🔁 Dup.</button>
          <button class="pm-btn" onclick="editarProducto('${p.id}')">✏️ Editar</button>
          <button class="pm-btn del" onclick="toggleActivoProducto('${p.id}')">${inact?'✓ Activar':'⊘ Desact.'}</button>
        </div>
      </div>
      ${p.tipo==='tramos'?`
      <button onclick="toggleTramoEditor('${p.id}')" style="width:100%;background:var(--s2);border:none;border-top:1px solid var(--br);color:var(--ac2);font-family:var(--mo);font-size:9px;padding:8px 14px;cursor:pointer;text-align:left;letter-spacing:.8px;transition:background .15s" onmouseover="this.style.background='var(--s3)'" onmouseout="this.style.background='var(--s2)'">▸ EDITAR TRAMOS DE PRECIO</button>
      <div class="tramo-editor" style="display:none" id="te-${p.id}">
        <div class="tramo-editor-hdr">
          <div class="tramo-editor-title">📋 Lista de precios</div>
          <div class="pct-controls">
            <span class="pct-label">Ajuste global:</span>
            <div class="pct-wrap"><input type="number" id="pct-${p.id}" value="5" min="1" max="99"><span>%</span></div>
            <button class="pct-btn up" onclick="aplicarPctTodos('${p.id}',+1)">▲ Subir</button>
            <button class="pct-btn down" onclick="aplicarPctTodos('${p.id}',-1)">▼ Bajar</button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:55px 1fr 60px 28px 28px 28px;gap:4px;padding:0 0 6px;border-bottom:1px solid var(--br);margin-bottom:6px">
          <div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:2px 4px">DESDE</div>
          <div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:2px 4px">PRECIO</div>
          <div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;text-align:center">DESC%</div>
          <div></div><div></div><div></div>
        </div>
        ${renderTramoRows(p)}
        <div class="tramo-actions">
          <button class="btn btn-p" style="font-size:9px;height:36px;padding:0 12px" onclick="agregarTramo('${p.id}')">+ Tramo</button>
          <button class="btn btn-s" style="font-size:9px;height:36px;padding:0 12px" onclick="guardarTramos('${p.id}')">💾 Guardar</button>
          <button class="btn btn-d" style="font-size:9px;height:36px;padding:0 12px" onclick="restablecerTramos('${p.id}')">↺ Restablecer</button>
        </div>
      </div>`:''}
    </div>`;
  });
  cont.innerHTML=html;
}

export function aplicarPctTodos(pid,dir){
  const pctEl=document.getElementById('pct-'+pid);
  const pct=Math.max(0.1,parseFloat(pctEl?.value)||5);
  let i=0;let count=0;
  while(document.getElementById(`trow-${pid}-${i}`)){
    const priceEl=document.getElementById(`tp-${pid}-${i}`);
    if(priceEl){
      const cur=parseFloat(priceEl.value)||0;
      if(cur>0){
        const nuevo=dir>0?Math.round(cur*(1+pct/100)):Math.round(cur*(1-pct/100));
        priceEl.value=Math.max(1,nuevo);
        count++;
      }
    }
    i++;
  }
  updTramoDisc(pid);
  const sign=dir>0?'↑':'↓';
  sN(`${sign} ${pct}% aplicado a ${count} tramos`);
}

export function restablecerTramos(pid){
  if(!confirm('¿Restaurar precios originales de este producto desde el catálogo base?'))return;
  const defProds=[
    {id:'v-cal',tramos:DPT},{id:'v-ted',tramos:DPT},{id:'v-lck',tramos:DPT},{id:'v-gen',tramos:DPT},
    {id:'p-cris',tramos:DCT},{id:'p-hong',tramos:DHT},
    {id:'p-got',tramos:[{t:1,p:DGP}]},{id:'p-pet',tramos:[{t:1,p:DPP}]}
  ];
  const def=defProds.find(x=>x.id===pid);
  if(!def){sN('No hay precios default para este producto',true);return;}
  const prods=getProductos();const p=prods.find(x=>x.id===pid);if(!p)return;
  p.tramos=def.tramos.map(x=>({...x}));
  saveProductos(prods);window.loadConfig?.();window.buildTicketUI?.();window.upd?.();window.renderInventarioTabla?.();
  setTimeout(()=>{const te=document.getElementById('te-'+pid);if(te)te.style.display='block';},80);
  sN(`✓ Precios de ${p.nombre} restablecidos`);
}

export function renderTramoRows(p){
  const base=p.tramos[0]?.p||1;
  let h='';
  p.tramos.forEach((t,i)=>{
    const disc=i===0?0:base>0?parseFloat(((1-t.p/base)*100).toFixed(1)):0;
    const discTxt=i===0?'—':'-'+disc.toFixed(1)+'%';
    const discColor=i===0?'var(--tx3)':disc>20?'#ff6b35':disc>10?'#ffaa00':'var(--ac)';
    const pmBtns=i===0?'<div></div><div></div>':`
      <button class="qb minus" style="width:28px;height:28px;font-size:14px;flex-shrink:0" onclick="adjTramoDisc('${p.id}',${i},-1)" title="-1%">−</button>
      <button class="qb plus" style="width:28px;height:28px;font-size:14px;flex-shrink:0" onclick="adjTramoDisc('${p.id}',${i},+1)" title="+1%">+</button>`;
    h+=`<div style="display:grid;grid-template-columns:55px 1fr 60px 28px 28px 28px;gap:4px;align-items:center;margin-bottom:5px" id="trow-${p.id}-${i}">
      <input type="number" id="tq-${p.id}-${i}" value="${t.t}" placeholder="Desde" min="1" style="min-height:34px;padding:4px 7px;font-size:11px" oninput="updTramoDisc('${p.id}')">
      <input type="number" id="tp-${p.id}-${i}" value="${t.p}" placeholder="Precio" min="0" style="min-height:34px;padding:4px 7px;font-size:11px;font-weight:700" oninput="updTramoDisc('${p.id}')">
      <div class="tramo-disc" id="td-${p.id}-${i}" style="text-align:center;font-weight:700;color:${discColor}">${discTxt}</div>
      ${pmBtns}
      ${i===0?'<div></div>':`<button class="qrst" onclick="eliminarTramo('${p.id}',${i})">×</button>`}
    </div>`;
  });
  return h;
}

export function toggleTramoEditor(pid){
  const el=document.getElementById('te-'+pid);
  if(!el)return;
  el.style.display=el.style.display==='block'?'none':'block';
}

export function updTramoDisc(pid){
  const base=parseFloat(document.getElementById(`tp-${pid}-0`)?.value)||1;
  let i=0;
  while(document.getElementById(`trow-${pid}-${i}`)){
    const del=document.getElementById(`td-${pid}-${i}`);
    const np=parseFloat(document.getElementById(`tp-${pid}-${i}`)?.value)||0;
    if(del)del.textContent=i===0?'—':base>0?'-'+((1-np/base)*100).toFixed(1)+'%':'—';
    i++;
  }
}

// Adjust tramo price by ±1% discount relative to base price
export function adjTramoDisc(pid,idx,delta){
  const baseEl=document.getElementById(`tp-${pid}-0`);
  const priceEl=document.getElementById(`tp-${pid}-${idx}`);
  const discEl=document.getElementById(`td-${pid}-${idx}`);
  if(!baseEl||!priceEl||!discEl)return;
  const base=parseFloat(baseEl.value)||0;
  if(base<=0)return;
  const curPrice=parseFloat(priceEl.value)||0;
  const curDisc=(1-curPrice/base)*100;
  const newDisc=Math.max(0,Math.min(99,parseFloat((curDisc-delta).toFixed(1)))); // delta=-1 means +1% discount
  const newPrice=Math.round(base*(1-newDisc/100));
  priceEl.value=newPrice;
  discEl.textContent='-'+newDisc.toFixed(1)+'%';
}

export function agregarTramo(pid){
  const prods=getProductos();const p=prods.find(x=>x.id===pid);if(!p)return;
  const last=p.tramos[p.tramos.length-1];
  p.tramos.push({t:(last?.t||0)+10,p:Math.round((last?.p||0)*0.9)});
  saveProductos(prods);window.loadConfig?.();window.renderInventarioTabla?.();
  setTimeout(()=>{document.getElementById('te-'+pid).style.display='block';},50);
}

export function eliminarTramo(pid,idx){
  const prods=getProductos();const p=prods.find(x=>x.id===pid);if(!p||p.tramos.length<=1)return;
  p.tramos.splice(idx,1);saveProductos(prods);window.loadConfig?.();window.renderInventarioTabla?.();
  setTimeout(()=>{document.getElementById('te-'+pid).style.display='block';},50);
}

export function guardarTramos(pid){
  const prods=getProductos();const p=prods.find(x=>x.id===pid);if(!p)return;
  const newTramos=[];
  p.tramos.forEach((_,i)=>{
    const tEl=document.getElementById(`tq-${pid}-${i}`);
    const pEl=document.getElementById(`tp-${pid}-${i}`);
    if(!tEl||!pEl)return;
    newTramos.push({t:parseFloat(tEl.value)||1,p:parseFloat(pEl.value)||0});
  });
  newTramos.sort((a,b)=>a.t-b.t);
  p.tramos=newTramos;
  saveProductos(prods);window.loadConfig?.();window.buildTicketUI?.();window.upd?.();window.renderInventarioTabla?.();
  sN(`✓ Tramos de ${p.nombre} guardados`);window.renderInventarioTabla?.();
  setTimeout(()=>{const el=document.getElementById('te-'+pid);if(el)el.style.display='block';},50);
}

export function toggleActivoProducto(pid){
  const prods=getProductos();const p=prods.find(x=>x.id===pid);if(!p)return;
  p.activo=!p.activo;
  saveProductos(prods);window.loadConfig?.();window.buildTicketUI?.();window.upd?.();window.renderInventarioTabla?.();
  sN(`${p.nombre} ${p.activo?'reactivado':'desactivado'}`);
}

export function duplicarProducto(pid){
  const prods=getProductos();const orig=prods.find(x=>x.id===pid);if(!orig)return;
  const copia=JSON.parse(JSON.stringify(orig));
  const nuevoId=uid();
  copia.id=nuevoId;
  copia.nombre=orig.nombre+' (copia)';
  copia.activo=true;
  delete copia.legacyKey;
  prods.push(copia);
  saveProductos(prods);
  window.loadConfig?.();window.buildTicketUI?.();window.upd?.();window.renderInventarioTabla?.();
  sN(`✓ ${orig.nombre} duplicado`);
  setTimeout(()=>editarProducto(nuevoId),80);
}

// ── PRODUCT EDITOR MODAL ──
let _editProdId=null;
let _editTramos=[];
let _editVariantes=[];

export function abrirNuevoProducto(){
  _editProdId=null;
  _editTramos=[{t:1,p:0}];
  openProdModal({id:null,emoji:'📦',nombre:'',unit:'ud',costo:0,tipo:'fijo',tramos:[{t:1,p:0}],activo:true});
}

export function editarProducto(pid){
  const prods=getProductos();const p=prods.find(x=>x.id===pid);if(!p)return;
  _editProdId=pid;
  _editTramos=JSON.parse(JSON.stringify(p.tramos||[{t:1,p:0}]));
  openProdModal(p);
}

export function openProdModal(p){
  document.getElementById('mTitEl').textContent=p.id?`✏ Editar — ${p.nombre}`:'➕ Nuevo Producto';
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal';
  document.getElementById('mTk').style.display='none';
  document.getElementById('mBody').innerHTML=buildProdModalHTML(p);
  document.getElementById('mFooter').innerHTML=`<button class="btn btn-p" onclick="guardarProductoModal()">💾 Guardar</button><button class="btn btn-s" onclick="clM()">✕ Cancelar</button>`;
  document.getElementById('modal').classList.add('open');
  syncProdModalUI();
}

export function toggleStockGroup(pid){
  const el=document.getElementById(`sk-grp-vars-${pid}`);if(!el)return;
  const isHidden=el.style.display==='none';
  el.style.display=isHidden?'flex':'none';
  const sub=document.getElementById(`sg-sub-${pid}`);
  if(sub){
    const p=getProductos().find(x=>x.id===pid);
    sub.innerHTML=isHidden?`suma variantes · ${p.unit||'ud'} · <span style="color:var(--er)">▾ colapsar</span>` : `suma variantes · ${p.unit||'ud'} · <span style="color:var(--ac2)">▸ expandir</span>`;
  }
}

export function buildProdModalHTML(p){
  const IS='width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:9px 11px;outline:none;min-height:44px';
  const LB='font-family:var(--mo);font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:5px;text-transform:uppercase';
  const listas=getListasPrecios();
  let listaOpts='<option value="">— Sin lista (tramos propios) —</option>';
  listas.forEach(l=>{listaOpts+=`<option value="${l.id}"${p.listaPrecioId===l.id?' selected':''}>${l.nombre}</option>`;});
  listaOpts+='<option value="__nueva">✚ Crear nueva lista en 💲 Lista de Precios</option>';
  const usaLista=!!(p.listaPrecioId&&listas.find(l=>l.id===p.listaPrecioId));
  const modoFijo=!usaLista&&p.tipo==='fijo';
  const modoTramos=!usaLista&&p.tipo!=='fijo';
  return`<div style="display:flex;flex-direction:column;gap:12px">
  <div style="display:grid;grid-template-columns:64px 1fr;gap:10px">
    <div><label style="${LB}">Emoji</label><input type="text" id="pm-emoji" value="${p.emoji||'📦'}" style="${IS};font-size:22px;text-align:center;padding:6px"></div>
    <div><label style="${LB}">Nombre</label><input type="text" id="pm-nombre" value="${p.nombre||''}" placeholder="Nombre del producto" style="${IS}"></div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    <div><label style="${LB}">Costo de adquisición (ARS)</label><input type="number" id="pm-costo" value="${p.costo||0}" placeholder="0" min="0" style="${IS}"></div>
    <div><label style="${LB}">Unidad</label><select id="pm-unit" style="${IS}"><option value="ud"${p.unit==='ud'?' selected':''}>Unidades (ud)</option><option value="g"${p.unit==='g'?' selected':''}>Gramos (g)</option></select></div>
  </div>
  <div>
    <label style="${LB}">Lista de precios asignada</label>
    <select id="pm-lista-id" style="${IS}" onchange="onPmListaChange()">
      ${listaOpts}
    </select>
    <div style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin-top:4px">Podés crear y editar listas en la pestaña 💲 Lista de Precios</div>
  </div>
  <div id="pm-precio-modo" style="display:${usaLista?'none':'block'}">
    <label style="${LB}">Precio propio del producto</label>
    <div class="tipo-selector" style="margin-bottom:10px">
      <button type="button" class="tipo-btn${modoFijo?' active':''}" id="tb-fijo" onclick="setProdTipo('fijo')">Precio fijo</button>
      <button type="button" class="tipo-btn${modoTramos?' active-pur':''}" id="tb-tram" onclick="setProdTipo('tramos')">Por tramos</button>
    </div>
    <div id="pm-tramos-wrap" style="display:${modoTramos?'block':'none'}">
      <div style="display:grid;grid-template-columns:70px 1fr 70px 28px;gap:6px;margin-bottom:4px">
        <span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">DESDE</span>
        <span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">PRECIO</span>
        <span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">DESC.</span>
        <span></span>
      </div>
      <div id="pm-tramos-list">${renderTramosEditor()}</div>
      <button type="button" class="btn btn-s" style="font-size:9px;height:34px;margin-top:6px" onclick="addTramoEditor()">+ Tramo</button>
    </div>
    <div id="pm-fijo-wrap" style="display:${modoFijo?'block':'none'}">
      <label style="${LB}">Precio único</label>
      <input type="number" id="pm-precio-fijo" value="${(p.tramos||[])[0]?.p||0}" placeholder="0" min="0" style="${IS}">
    </div>
  </div>
  ${p.id?`<div style="font-family:var(--mo);font-size:8px;color:var(--tx3)">ID: <b style="color:var(--ac2)">${p.id}</b></div>`:''}
</div>`;
}

export function onPmListaChange(){
  const val=document.getElementById('pm-lista-id')?.value;
  if(val==='__nueva'){
    document.getElementById('pm-lista-id').value='';
    sN('Creá la lista en 💲 Lista de Precios y volvé a asignarla acá');
    return;
  }
  document.getElementById('pm-precio-modo').style.display=val?'none':'block';
}

export function renderTramosEditor(){
  return _editTramos.map((t,i)=>{
    const base=_editTramos[0]?.p||1;
    const disc=i===0?'—':base>0?'-'+((1-t.p/base)*100).toFixed(1)+'%':'—';
    return`<div class="tramo-row" id="etrow-${i}">
      <input type="number" id="etq-${i}" value="${t.t}" placeholder="Desde" min="1" oninput="updModalDiscs()">
      <input type="number" id="etp-${i}" value="${t.p}" placeholder="Precio" min="0" oninput="updModalDiscs()">
      <div class="tramo-disc" id="etd-${i}">${disc}</div>
      ${i===0?'<div></div>':`<button class="qrst" onclick="removeTramoEditor(${i})">×</button>`}
    </div>`;
  }).join('');
}

export function renderVariantesEditor(){
  return _editVariantes.map((v,i)=>`<div class="variante-row" id="evrow-${i}">
    <input type="text" id="evemoji-${i}" value="${v.emoji||'📦'}" style="font-size:14px;text-align:center">
    <input type="text" id="evname-${i}" value="${v.nombre||''}" placeholder="Nombre">
    <button class="qrst" onclick="removeVarianteEditor(${i})">×</button>
  </div>`).join('');
}

export function setProdTipo(t){
  document.getElementById('pm-tramos-wrap').style.display=t==='tramos'?'block':'none';
  document.getElementById('pm-fijo-wrap').style.display=t==='fijo'?'block':'none';
  document.getElementById('tb-fijo').className='tipo-btn'+(t==='fijo'?' active':'');
  document.getElementById('tb-tram').className='tipo-btn'+(t==='tramos'?' active-pur':'');
}
export function setProdAgrup(a){
  document.getElementById('pm-variantes-wrap').style.display=a==='grupo'?'block':'none';
  document.getElementById('tb-ind').className='tipo-btn'+(a==='individual'?' active':'');
  document.getElementById('tb-grp').className='tipo-btn'+(a==='grupo'?' active-pur':'');
}
export function syncProdModalUI(){}

export function addTramoEditor(){
  const last=_editTramos[_editTramos.length-1];
  _editTramos.push({t:(last?.t||0)+10,p:Math.round((last?.p||0)*0.9)});
  document.getElementById('pm-tramos-list').innerHTML=renderTramosEditor();
}
export function removeTramoEditor(i){
  if(_editTramos.length<=1)return;
  _editTramos.splice(i,1);
  document.getElementById('pm-tramos-list').innerHTML=renderTramosEditor();
}
export function addVarianteEditor(){
  _editVariantes.push({id:uid(),emoji:'📦',nombre:''});
  document.getElementById('pm-variantes').innerHTML=renderVariantesEditor();
}
export function removeVarianteEditor(i){
  _editVariantes.splice(i,1);
  document.getElementById('pm-variantes').innerHTML=renderVariantesEditor();
}
export function updModalDiscs(){
  const base=parseFloat(document.getElementById('etp-0')?.value)||1;
  _editTramos.forEach((_,i)=>{
    const np=parseFloat(document.getElementById(`etp-${i}`)?.value)||0;
    const del=document.getElementById(`etd-${i}`);
    if(del)del.textContent=i===0?'—':base>0?'-'+((1-np/base)*100).toFixed(1)+'%':'—';
  });
}

export function guardarProductoModal(){
  const emoji=document.getElementById('pm-emoji')?.value.trim()||'📦';
  const nombre=document.getElementById('pm-nombre')?.value.trim();
  const costo=parseFloat(document.getElementById('pm-costo')?.value)||0;
  const unit=document.getElementById('pm-unit')?.value||'ud';
  if(!nombre){sN('ERROR: Nombre requerido',true);return;}
  const listaPrecioId=document.getElementById('pm-lista-id')?.value||null;
  const usaLista=listaPrecioId&&listaPrecioId!=='__nueva';
  const tipoFijo=document.getElementById('tb-fijo')?.classList.contains('active');
  const tipo=tipoFijo?'fijo':'tramos';
  let tramos;
  if(usaLista){
    // tramos se derivan de la lista — guardamos los de la lista como copia
    const lista=getListasPrecios().find(l=>l.id===listaPrecioId);
    tramos=lista?lista.tramos.map(t=>({...t})):[{t:1,p:0}];
  } else if(tipo==='fijo'){
    const pf=parseFloat(document.getElementById('pm-precio-fijo')?.value)||0;
    tramos=[{t:1,p:pf}];
  } else {
    tramos=_editTramos.map((_,i)=>({t:parseFloat(document.getElementById(`etq-${i}`)?.value)||1,p:parseFloat(document.getElementById(`etp-${i}`)?.value)||0}));
    tramos.sort((a,b)=>a.t-b.t);
  }
  const prods=getProductos();
  if(_editProdId){
    const idx=prods.findIndex(x=>x.id===_editProdId);if(idx<0)return;
    prods[idx]={...prods[idx],emoji,nombre,costo,unit,tipo,tramos,listaPrecioId:usaLista?listaPrecioId:null};
  } else {
    prods.push({id:uid(),emoji,nombre,costo,unit,tipo,tramos,listaPrecioId:usaLista?listaPrecioId:null,activo:true});
  }
  saveProductos(prods);window.loadConfig?.();window.buildTicketUI?.();window.upd?.();
  window.renderProductosRegistrados?.();window.renderInvStock?.();window.renderSettings?.();window.clM?.();
  sN(`✓ ${nombre} guardado`);
}

// ── TABLA MAESTRA (legacy settings) ──
export function renderMaestra(){
  const prods=getProductos();
  const cont=document.getElementById('maestraTable');
  if(!cont)return;
  if(!prods.length){cont.innerHTML='<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);padding:20px;text-align:center">Sin productos.</div>';return;}
  const IS=`style="background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:10px;padding:4px 6px;min-height:30px;outline:none;border-radius:0;-webkit-appearance:none;width:88px;text-align:right"`;
  const TH=`style="padding:7px 10px;text-align:left;border-bottom:2px solid var(--br);font-family:var(--mo);font-size:7px;letter-spacing:1px;white-space:nowrap"`;
  let html=`<table style="width:100%;border-collapse:collapse;font-size:9px">
  <thead style="background:var(--s3)"><tr>
    <th ${TH} style="color:var(--ac)">PRODUCTO</th>
    <th ${TH} style="color:var(--ac);text-align:center">ESTADO</th>
    <th ${TH} style="color:var(--ac);text-align:right">STOCK</th>
    <th ${TH} style="color:var(--ac2);text-align:right">PRECIO BASE</th>
    <th ${TH} style="color:var(--er);text-align:right">COSTO/ud</th>
    <th ${TH} style="color:var(--tx3)">ACCIONES</th>
  </tr></thead><tbody>`;
  prods.forEach(p=>{
    const inact=!p.activo;const op=inact?'opacity:.45':'';
    const tramos=getTramosProducto(p);
    const baseP=tramos[0]?.p||0;
    const TD=`style="padding:7px 10px;border-bottom:1px solid rgba(42,42,58,.3);vertical-align:middle;${op}"`;
    const qty=getActualQty(p.id);const st=getStockStatus(qty,p.id);
    const dot=`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;background:${st==='ok'?'#00e5a0':st==='warn'?'#ffaa00':'#ff4455'}"></span>`;
    html+=`<tr style="${op}">
      <td ${TD}>${p.emoji} ${p.nombre} <span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">(${p.unit})</span></td>
      <td ${TD} style="text-align:center">${dot}<span style="font-family:var(--mo);font-size:8px;color:var(--tx3)">${st.toUpperCase()}</span></td>
      <td ${TD} style="text-align:right"><input type="number" ${IS} id="ms-${p.id}" value="${qty}"></td>
      <td ${TD} style="text-align:right"><input type="number" ${IS} id="mp-${p.id}" value="${baseP}"></td>
      <td ${TD} style="text-align:right"><input type="number" ${IS} id="mc-${p.id}" value="${p.costo||0}"></td>
      <td ${TD}>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          ${p.tipo==='tramos'?`<button class="pm-btn" style="font-size:8px;padding:3px 7px" onclick="abrirTramosEnMaestra('${p.id}')">▸ Tramos</button>`:''}
          <button class="pm-btn" style="font-size:8px;padding:3px 7px" onclick="editarProducto('${p.id}')">✏</button>
          <button class="pm-btn del" style="font-size:8px;padding:3px 7px" onclick="toggleActivoProducto('${p.id}')">${inact?'✓':'⊘'}</button>
        </div>
      </td>
    </tr>`;
  });
  html+='</tbody></table>';
  cont.innerHTML=html;
}

export function abrirTramosEnMaestra(pid){
  const p=getProductos().find(x=>x.id===pid);if(!p)return;
  const wrap=document.getElementById('maestraTramoWrap');
  const card=document.getElementById('maestraTramoCard');
  if(!wrap||!card)return;
  wrap.style.display='block';
  wrap.scrollIntoView({behavior:'smooth'});
  card.innerHTML=`
    <div class="ct">${p.emoji} ${p.nombre} — Tramos</div>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap;background:var(--s2);padding:10px;border:1px solid var(--br)">
      <span style="font-family:var(--mo);font-size:8px;color:var(--tx3);letter-spacing:.8px">AJUSTE GLOBAL:</span>
      <div style="display:flex;border:1px solid var(--br);overflow:hidden;flex-shrink:0">
        <input type="number" id="pct-${p.id}" value="5" min="1" max="99" style="width:46px;min-height:32px;text-align:center;font-family:var(--mo);font-size:12px;font-weight:700;background:var(--bg);border:none;color:var(--tx);outline:none;padding:0">
        <span style="font-family:var(--mo);font-size:10px;color:var(--tx3);padding:0 6px;background:var(--s2);display:flex;align-items:center">%</span>
      </div>
      <button class="pm-btn" style="color:#00e5a0;border-color:rgba(0,229,160,.4);padding:5px 12px" onclick="aplicarPctTodos('${p.id}',+1)">▲ Subir</button>
      <button class="pm-btn" style="color:#ff4455;border-color:rgba(255,68,85,.4);padding:5px 12px" onclick="aplicarPctTodos('${p.id}',-1)">▼ Bajar</button>
      <button class="pm-btn" style="color:var(--wn);border-color:rgba(255,170,0,.4);padding:5px 12px" onclick="restablecerTramos('${p.id}')">↺ Restablecer</button>
    </div>
    <div style="display:grid;grid-template-columns:55px 1fr 60px 28px 28px 28px;gap:4px;padding:0 0 6px;border-bottom:1px solid var(--br);margin-bottom:6px">
      <div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:2px 4px">DESDE</div>
      <div style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:2px 4px">PRECIO</div>
      <div style="font-family:var(--mo);font-size:7px;color:var(--tx3);text-align:center">DESC%</div>
      <div></div><div></div><div></div>
    </div>
    ${renderTramoRows(p)}
    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
      <button class="btn btn-p" style="font-size:9px;height:36px;padding:0 12px" onclick="agregarTramo('${p.id}')">+ Tramo</button>
      <button class="btn btn-p" style="font-size:9px;height:36px;padding:0 12px" onclick="guardarTramosYCerrar('${p.id}')">💾 Guardar</button>
      <button class="btn btn-s" style="font-size:9px;height:36px;padding:0 12px" onclick="document.getElementById('maestraTramoWrap').style.display='none'">✕ Cancelar</button>
    </div>`;
}

export function guardarTramosYCerrar(pid){
  guardarTramos(pid);
  document.getElementById('maestraTramoWrap').style.display='none';
  window.renderInventarioTabla?.();
}

export function guardarMaestra(){
  const prods=getProductos();let changed=false;
  prods.forEach(p=>{
    const pEl=document.getElementById('mp-'+p.id);const cEl=document.getElementById('mc-'+p.id);
    if(pEl&&p.tramos?.length){const nP=parseFloat(pEl.value)||p.tramos[0].p;if(nP!==p.tramos[0].p){p.tramos[0].p=nP;changed=true;}}
    if(cEl){const nC=parseFloat(cEl.value)||0;if(nC!==p.costo){p.costo=nC;changed=true;}}
  });
  if(changed){saveProductos(prods);window.loadConfig?.();window.buildTicketUI?.();window.upd?.();}
  const msg=document.getElementById('invSaveMsg');
  if(msg){msg.textContent='✓ Guardado';setTimeout(()=>msg.textContent='',2500);}
  sN('✓ Maestra guardada');window.renderInventarioTabla?.();
}
