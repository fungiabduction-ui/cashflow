import { ld, sd, gO, gOConf } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fv, d2s } from '../core/formatters.js';
import { ghAutoPush } from './github.js';
import { getProductos } from './productos.js';

let _ctSort='ultima'; // 'ultima' | 'total'

export function setCtSort(s){
  _ctSort=s;
  ['ultima','total'].forEach(k=>{
    const b=document.getElementById('ct-sort-'+k);
    if(b)b.style.color=_ctSort===k?'var(--ac)':'var(--tx3)';
  });
  renderContactos();
}

// Resuelve líneas de una orden para display (nuevo formato + legacy)
function getLineasDisplay(o,prodMap){
  const lns=o.productos?._lineas;
  if(lns&&lns.length){
    return lns.map(l=>{
      const p=prodMap[l.prodId];
      return{emoji:p?.emoji||'',nombre:p?.nombre||l.prodId,unit:p?.unit||'ud',qty:l.qty,precio:l.precio,subtotal:l.subtotal};
    });
  }
  // Legacy
  const pr=o.productos||{};const r=[];
  const pastTot=(pr.calaveras||0)+(pr.teddy||0)+(pr.lucky||0)+(pr.genericas||0);
  if(pastTot>0)r.push({emoji:'💊',nombre:'Pastillas',unit:'ud',qty:pastTot,precio:pr.precioPastilla||0,subtotal:pr.totalPastillasLinea||0});
  if(pr.cristales>0)r.push({emoji:'💎',nombre:'Cristales',unit:'g',qty:pr.cristales,precio:pr.precioCristales||0,subtotal:pr.totalCristales||0});
  if(pr.hongos>0)r.push({emoji:'🍄',nombre:'Hongos',unit:'g',qty:pr.hongos,precio:pr.precioHongos||0,subtotal:pr.totalHongos||0});
  if(pr.goteros>0)r.push({emoji:'💧',nombre:'Goteros',unit:'ud',qty:pr.goteros,precio:0,subtotal:pr.totalGoteros||0});
  if(pr.petri>0)r.push({emoji:'🧫',nombre:'Petri',unit:'ud',qty:pr.petri,precio:0,subtotal:pr.totalPetri||0});
  if(pr.variable>0)r.push({emoji:'💲',nombre:'Precio libre',unit:'',qty:1,precio:pr.variable,subtotal:pr.variable});
  return r;
}

// ── NORMALIZACIÓN ──
export function normNombre(s){
  if(!s)return'';
  return s.trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/\s+/g,' ');
}

// ── ID GENERATOR (Math.max invariant — nunca conteo) ──
function nCtId(mes){
  const d=ld();
  const existing=(d.contactos||[])
    .filter(c=>c.id&&c.id.startsWith('CT-'+mes+'-'))
    .map(c=>parseInt(c.id.split('-')[2])||0);
  if(!existing.length)return`CT-${mes}-0001`;
  return`CT-${mes}-${String(Math.max(...existing)+1).padStart(4,'0')}`;
}

// ── GETTERS ──
export function getContactos(){return ld().contactos||[];}

export function getContactoById(id){return getContactos().find(c=>c.id===id)||null;}

export function getContactoByNorm(norm){return getContactos().find(c=>c.nombreNorm===norm)||null;}

// ── HISTORIAL: resolución dual (ID exacto + fallback por nombre normalizado) ──
export function getHistorialContacto(ct){
  return gOConf()
    .filter(o=>o.clienteId===ct.id||(!o.clienteId&&normNombre(o.cliente||'')===ct.nombreNorm))
    .sort((a,b)=>b.fecha.localeCompare(a.fecha));
}

// ── AUTO-REGISTRO: llamado desde generarTicket() ──
// Crea el contacto si no existe. Retorna clienteId. Single sd() write.
export function autoRegistrarContacto(nombre,fechaOrden){
  if(!nombre||!nombre.trim())return null;
  const norm=normNombre(nombre);
  const d=ld();
  const contactos=d.contactos||[];
  const existente=contactos.find(c=>c.nombreNorm===norm);
  if(existente)return existente.id;
  // Derivar AAAAMM del mes de la orden para el ID
  const mes=fechaOrden
    ?fechaOrden.replace(/-/g,'').substring(0,6)
    :(()=>{const n=new Date();return String(n.getFullYear())+String(n.getMonth()+1).padStart(2,'0');})();
  const id=nCtId(mes);
  contactos.push({
    id,
    nombre:nombre.trim(),
    nombreNorm:norm,
    tel:null,email:null,instagram:null,notas:null,
    fechaAlta:new Date().toISOString(),
    mergedFrom:[]
  });
  d.contactos=contactos;
  sd(d);
  return id;
}

// ── GUARDAR INFO EDITABLE ──
export function guardarInfoContacto(id){
  const d=ld();
  const ct=(d.contactos||[]).find(c=>c.id===id);
  if(!ct){sN('Contacto no encontrado',true);return;}
  ct.tel=document.getElementById('ct-tel')?.value.trim()||null;
  ct.email=document.getElementById('ct-email')?.value.trim()||null;
  ct.instagram=document.getElementById('ct-ig')?.value.trim()||null;
  ct.notas=document.getElementById('ct-notas')?.value.trim()||null;
  sd(d);
  ghAutoPush();
  sN(`✓ ${ct.nombre} actualizado`);
}

// ── RENDER LISTA DE CONTACTOS ──
export function renderContactos(){
  const listEl=document.getElementById('ct-lista');
  if(!listEl)return;
  const search=(document.getElementById('ct-search')?.value||'').toLowerCase();
  const cts=getContactos();
  const allOrds=gOConf();

  // Pre-computar stats por contacto (una pasada sobre las órdenes)
  const statsById=new Map();   // ct.id → stats
  const statsByNorm=new Map(); // ct.nombreNorm → stats (fallback para órdenes legacy)
  cts.forEach(ct=>{
    const s={total:0,count:0,ultima:null};
    statsById.set(ct.id,s);
    statsByNorm.set(ct.nombreNorm,s);
  });
  allOrds.forEach(o=>{
    let s=null;
    if(o.clienteId&&statsById.has(o.clienteId))s=statsById.get(o.clienteId);
    else if(!o.clienteId&&o.cliente){
      const n=normNombre(o.cliente);
      if(statsByNorm.has(n))s=statsByNorm.get(n);
    }
    if(!s)return;
    s.total+=(o.totales?.totalGeneral||0);
    s.count++;
    if(!s.ultima||o.fecha>s.ultima)s.ultima=o.fecha;
  });

  let filtered=cts.filter(ct=>{
    if(!search)return true;
    return ct.nombre.toLowerCase().includes(search)||
      (ct.tel&&ct.tel.includes(search))||
      (ct.instagram&&ct.instagram.toLowerCase().includes(search))||
      (ct.email&&ct.email.toLowerCase().includes(search));
  });

  // Ordenar según criterio activo
  if(_ctSort==='total'){
    filtered.sort((a,b)=>(statsById.get(b.id)?.total||0)-(statsById.get(a.id)?.total||0));
  } else {
    filtered.sort((a,b)=>{
      const ua=statsById.get(a.id)?.ultima||a.fechaAlta;
      const ub=statsById.get(b.id)?.ultima||b.fechaAlta;
      return ub.localeCompare(ua);
    });
  }
  // Reflejar estado en botones de sort
  ['ultima','total'].forEach(k=>{
    const b=document.getElementById('ct-sort-'+k);
    if(b)b.style.color=_ctSort===k?'var(--ac)':'var(--tx3)';
  });

  // Actualizar contador
  const cntEl=document.getElementById('ct-count');
  if(cntEl)cntEl.textContent=`${cts.length} contacto${cts.length!==1?'s':''}`;

  if(!filtered.length){
    listEl.innerHTML=`<div style="font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center;padding:24px">${cts.length?'Sin resultados para "'+search+'"':'Sin contactos registrados'}</div>`;
    return;
  }

  const MO='font-family:var(--mo);';
  let html='';
  filtered.forEach(ct=>{
    const s=statsById.get(ct.id)||{total:0,count:0,ultima:null};
    const meta=[ct.tel,ct.instagram,ct.email].filter(Boolean).join(' · ');
    const ultimaDisp=s.ultima?d2s(s.ultima):'—';
    html+=`<div onclick="abrirContacto('${ct.id}')" style="cursor:pointer;padding:12px 16px;border-bottom:1px solid var(--br);display:flex;justify-content:space-between;align-items:center;gap:12px;transition:background .12s" onmouseover="this.style.background='var(--s2)'" onmouseout="this.style.background=''">
      <div style="flex:1;min-width:0">
        <div style="${MO}font-size:12px;font-weight:700;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ct.nombre}</div>
        ${meta?`<div style="${MO}font-size:9px;color:var(--tx3);margin-top:2px">${meta}</div>`:''}
      </div>
      <div style="flex-shrink:0;text-align:right">
        <div style="${MO}font-size:10px;font-weight:700;color:var(--ac)">${s.count>0?fv(s.total):'—'}</div>
        <div style="${MO}font-size:8px;color:var(--tx3)">${s.count>0?s.count+' órd · '+ultimaDisp:'sin órdenes'}</div>
      </div>
    </div>`;
  });
  listEl.innerHTML=html;
}

// ── ABRIR DETALLE DE CONTACTO ──
export function abrirContacto(id){
  const ct=getContactoById(id);if(!ct)return;
  const detEl=document.getElementById('ct-detalle');
  const listEl=document.getElementById('ct-lista');
  const swEl=document.getElementById('ct-search-wrap');
  if(!detEl)return;
  if(listEl)listEl.style.display='none';
  if(swEl)swEl.style.display='none';

  const ords=getHistorialContacto(ct);
  const total=ords.reduce((s,o)=>s+(o.totales?.totalGeneral||0),0);
  const ticketProm=ords.length?total/ords.length:0;

  // Producto favorito (por qty)
  const prodQty={};
  ords.forEach(o=>{
    (o.productos?._lineas||[]).forEach(l=>{
      const k=(l.nombre||l.prodId);
      prodQty[k]=(prodQty[k]||0)+l.qty;
    });
  });
  const fav=Object.entries(prodQty).sort((a,b)=>b[1]-a[1])[0];
  const ultimaDisp=ords.length?d2s(ords[0].fecha):'—';
  const altaDisp=new Date(ct.fechaAlta).toLocaleString('es-AR',{dateStyle:'short',timeStyle:'short'});

  const MO='font-family:var(--mo);';
  const IS=`width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);${MO}font-size:12px;padding:8px 10px;outline:none;min-height:38px;box-sizing:border-box`;

  const prodMap={};
  getProductos().forEach(p=>{prodMap[p.id]=p;});

  let ordsHtml='';
  ords.forEach(o=>{
    const lineas=getLineasDisplay(o,prodMap);
    const lineasStr=lineas.map(l=>
      `${l.emoji} ${l.qty}${l.unit?` ${l.unit}`:''}${l.precio?` × ${fv(l.precio)}`:''}${l.subtotal?` = ${fv(l.subtotal)}`:''}`
    ).join('<br>');
    ordsHtml+=`<tr style="border-top:1px solid var(--br)">
      <td style="padding:8px 10px 4px;${MO}font-size:9px;color:var(--tx3);vertical-align:top;white-space:nowrap">${o.fechaDisplay||o.fecha}</td>
      <td style="padding:8px 10px 4px;${MO}font-size:9px;color:var(--ac2);vertical-align:top;white-space:nowrap">${o.id}</td>
      <td style="padding:8px 10px 4px;vertical-align:top">
        <div style="${MO}font-size:9px;color:var(--tx3);line-height:1.8">${lineasStr||'—'}</div>
      </td>
      <td style="padding:8px 10px 4px;${MO}font-size:10px;font-weight:700;text-align:right;color:var(--ac);vertical-align:top;white-space:nowrap">${fv(o.totales?.totalGeneral||0)}</td>
      <td style="padding:8px 10px 4px;text-align:center;vertical-align:top"><button class="pm-btn" style="font-size:8px;padding:3px 8px" onclick="vTk('${o.id}')">👁</button></td>
    </tr>`;
  });
  if(!ords.length)ordsHtml=`<tr><td colspan="5" style="${MO}font-size:10px;color:var(--tx3);text-align:center;padding:16px">Sin órdenes registradas</td></tr>`;

  const kpi=(label,val,color='var(--tx)')=>
    `<div style="background:var(--s2);border:1px solid var(--br);padding:10px 12px">
      <div style="${MO}font-size:7px;color:var(--tx3);letter-spacing:.8px;margin-bottom:4px">${label}</div>
      <div style="${MO}font-size:12px;font-weight:700;color:${color}">${val}</div>
    </div>`;

  detEl.innerHTML=`<div class="card">
    <div class="ct" style="justify-content:space-between">
      <span>👤 ${ct.nombre}</span>
      <button class="pm-btn" onclick="volverListaContactos()" style="font-size:9px">← Volver</button>
    </div>
    <div style="${MO}font-size:8px;color:var(--tx3);margin-bottom:14px">
      ${ct.id} · Alta: ${altaDisp}${ct.mergedFrom?.length?` · fusionado de: ${ct.mergedFrom.join(', ')}`:''}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;margin-bottom:16px">
      ${kpi('TOTAL COMPRADO',fv(total),'var(--ac)')}
      ${kpi('ÓRDENES',ords.length,'var(--tx)')}
      ${kpi('TICKET PROM.',fv(ticketProm),'var(--ac2)')}
      ${kpi('ÚLTIMA COMPRA',ultimaDisp)}
      ${fav?kpi('PROD. FAV.',`${fav[0]} (×${fav[1]})`,'var(--tx3)'):''}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      <div><label style="${MO}font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Teléfono</label><input type="tel" id="ct-tel" value="${ct.tel||''}" placeholder="+54 9 11..." style="${IS}"></div>
      <div><label style="${MO}font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Instagram</label><input type="text" id="ct-ig" value="${ct.instagram||''}" placeholder="@usuario" style="${IS}"></div>
      <div><label style="${MO}font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Email</label><input type="email" id="ct-email" value="${ct.email||''}" placeholder="mail@ejemplo.com" style="${IS}"></div>
      <div><label style="${MO}font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase">Notas</label><input type="text" id="ct-notas" value="${ct.notas||''}" placeholder="Notas..." style="${IS}"></div>
    </div>
    <button class="btn btn-p" style="height:36px;font-size:10px;padding:0 16px" onclick="guardarInfoContacto('${ct.id}')">💾 Guardar info</button>
    <div style="margin-top:18px">
      <div style="${MO}font-size:8px;letter-spacing:.8px;color:var(--tx3);margin-bottom:8px">HISTORIAL (${ords.length} órdenes confirmadas)</div>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr style="background:var(--s3)">
          <th style="padding:6px 10px;${MO}font-size:7px;letter-spacing:.8px;color:var(--tx3);text-align:left;white-space:nowrap">FECHA</th>
          <th style="padding:6px 10px;${MO}font-size:7px;letter-spacing:.8px;color:var(--tx3);text-align:left;white-space:nowrap">ID</th>
          <th style="padding:6px 10px;${MO}font-size:7px;letter-spacing:.8px;color:var(--tx3);text-align:left">PRODUCTOS</th>
          <th style="padding:6px 10px;${MO}font-size:7px;letter-spacing:.8px;color:var(--tx3);text-align:right;white-space:nowrap">TOTAL</th>
          <th></th>
        </tr></thead>
        <tbody>${ordsHtml}</tbody>
      </table>
    </div>
  </div>`;
  detEl.style.display='block';
}

export function volverListaContactos(){
  document.getElementById('ct-detalle').style.display='none';
  const listEl=document.getElementById('ct-lista');
  const swEl=document.getElementById('ct-search-wrap');
  if(listEl)listEl.style.display='';
  if(swEl)swEl.style.display='';
}

export function filtrarContactos(){renderContactos();}

// ── MIGRACIÓN ──

let _migData=null; // estado de migración (entre mostrar modal y confirmar)

export function mostrarMigracionContactos(){
  const orders=gO();

  // Agrupar nombres por forma normalizada
  const normMap=new Map(); // norm → { nombres: Set, fechaMin }
  orders.forEach(o=>{
    if(!o.cliente||!o.cliente.trim())return;
    const norm=normNombre(o.cliente);
    const trimmed=o.cliente.trim();
    if(!normMap.has(norm))normMap.set(norm,{nombres:new Set(),fechaMin:o.fecha});
    normMap.get(norm).nombres.add(trimmed);
    if(o.fecha<normMap.get(norm).fechaMin)normMap.get(norm).fechaMin=o.fecha;
  });

  // Detectar los que ya están registrados (idempotencia)
  const existentes=new Set((ld().contactos||[]).map(c=>c.nombreNorm));

  const unicos=[];
  const nearDups=[];
  normMap.forEach(({nombres,fechaMin},norm)=>{
    if(existentes.has(norm))return; // ya migrado
    const arr=Array.from(nombres).sort();
    if(arr.length===1)unicos.push({norm,nombre:arr[0],fechaMin});
    else nearDups.push({norm,nombres:arr,fechaMin});
  });

  const totalNuevos=unicos.length+nearDups.length;
  const totalOrdenes=orders.filter(o=>o.cliente).length;

  if(!totalNuevos){
    sN('✓ Todos los contactos ya están registrados');
    renderContactos();
    return;
  }

  _migData={unicos,nearDups};

  const MO='font-family:var(--mo);';

  let ndHtml='';
  nearDups.forEach((g,i)=>{
    const RD='width:16px;height:16px;flex-shrink:0;cursor:pointer;accent-color:var(--ac)';
    const radios=g.nombres.map((n,j)=>
      `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:5px 0;border-bottom:1px solid var(--br)">
        <input type="radio" name="nd-${i}" value="${j}" ${j===0?'checked':''} style="${RD}">
        <span style="${MO}font-size:12px;color:var(--tx)">${n}</span>
      </label>`
    ).join('');
    ndHtml+=`<div style="background:var(--s2);border:1px solid var(--br);padding:10px 14px;margin-bottom:8px">
      <div style="${MO}font-size:8px;color:var(--tx3);letter-spacing:.5px;margin-bottom:8px">Norm: "${g.norm}"</div>
      <div style="margin-bottom:10px">${radios}</div>
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding-top:4px">
        <input type="checkbox" id="nd-merge-${i}" checked style="${RD}">
        <span style="${MO}font-size:10px;color:var(--ac)">Fusionar en un solo contacto con el nombre elegido</span>
      </label>
    </div>`;
  });

  const bodyHtml=`<div style="overflow-y:auto;max-height:55vh">
    <div style="${MO}font-size:10px;color:var(--tx3);margin-bottom:14px;padding:10px;background:var(--s2);border:1px solid var(--br)">
      Se van a crear <b style="color:var(--ac)">${totalNuevos} contacto${totalNuevos!==1?'s':''}</b> desde <b>${totalOrdenes}</b> órdenes históricas.
      <br>Los datos de contacto (tel, mail, ig) se podrán cargar después desde la ficha.
    </div>
    ${nearDups.length?`<div style="${MO}font-size:8px;letter-spacing:.8px;color:var(--wn);margin-bottom:8px">⚠ DUPLICADOS DETECTADOS (${nearDups.length}) — mismo nombre al normalizar</div>${ndHtml}`:''}
    ${unicos.length?`<details><summary style="${MO}font-size:9px;color:var(--tx3);cursor:pointer;padding:6px 0">Contactos únicos (${unicos.length}) — click para ver lista</summary>
      <div style="margin-top:8px;max-height:160px;overflow-y:auto;border:1px solid var(--br);padding:8px">
        ${unicos.map(u=>`<div style="${MO}font-size:10px;padding:3px 0;border-bottom:1px solid rgba(255,255,255,.04);color:var(--tx)">${u.nombre}</div>`).join('')}
      </div></details>`:''}
  </div>`;

  document.getElementById('mTitEl').textContent='📋 Migración de Contactos Históricos';
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal';
  document.getElementById('mTk').style.display='none';
  document.getElementById('mBody').innerHTML=bodyHtml;
  document.getElementById('mFooter').innerHTML=`
    <button class="btn btn-p" onclick="ejecutarMigracionContactos()">🚀 Ejecutar migración</button>
    <button class="btn btn-s" onclick="clM()">Cancelar</button>`;
  document.getElementById('modal').classList.add('open');
}

export function ejecutarMigracionContactos(){
  if(!_migData){sN('Error: sin datos de migración',true);return;}
  const{unicos,nearDups}=_migData;
  _migData=null;

  const d=ld();
  const existentes=d.contactos||[];
  const existNorms=new Set(existentes.map(c=>c.nombreNorm));
  const normToId=new Map(existentes.map(c=>[c.nombreNorm,c.id]));

  // Construir lista de nuevos contactos (sin IDs aún)
  const nuevos=[];

  unicos.forEach(u=>{
    if(existNorms.has(u.norm))return;
    nuevos.push({
      _norm:u.norm,
      nombre:u.nombre,
      nombreNorm:u.norm,
      tel:null,email:null,instagram:null,notas:null,
      fechaAlta:u.fechaMin+'T00:00:00.000Z',
      mergedFrom:[]
    });
  });

  nearDups.forEach((g,i)=>{
    if(existNorms.has(g.norm)){
      // ya existe bajo esta norma — solo mapeamos variantes al ID existente
      g.nombres.forEach(n=>normToId.set(normNombre(n),normToId.get(g.norm)));
      return;
    }
    const mergeEl=document.getElementById(`nd-merge-${i}`);
    const doMerge=mergeEl?mergeEl.checked:true;
    if(doMerge){
      // Elegir nombre canónico según radio seleccionado
      let canonIdx=0;
      for(let j=0;j<g.nombres.length;j++){
        const r=document.querySelector(`input[name="nd-${i}"][value="${j}"]`);
        if(r&&r.checked){canonIdx=j;break;}
      }
      const canon=g.nombres[canonIdx];
      nuevos.push({
        _norm:g.norm,
        nombre:canon,
        nombreNorm:g.norm,
        tel:null,email:null,instagram:null,notas:null,
        fechaAlta:g.fechaMin+'T00:00:00.000Z',
        mergedFrom:g.nombres.filter(n=>n!==canon)
      });
      // Todas las variantes deben apuntar a esta norma
      g.nombres.forEach(n=>normToId.set(normNombre(n),g.norm)); // temporal — se reemplaza con ID real abajo
    } else {
      // Mantener separados: cada variante con su propia norma
      g.nombres.forEach(n=>{
        const norm2=normNombre(n);
        if(!existNorms.has(norm2))nuevos.push({
          _norm:norm2,
          nombre:n,
          nombreNorm:norm2,
          tel:null,email:null,instagram:null,notas:null,
          fechaAlta:g.fechaMin+'T00:00:00.000Z',
          mergedFrom:[]
        });
      });
    }
  });

  // Asignar IDs (Math.max invariant por mes)
  const mesCount=new Map();
  // Inicializar contadores con los existentes
  existentes.forEach(c=>{
    const mes=c.id.substring(3,9);
    const n=parseInt(c.id.split('-')[2])||0;
    if(!mesCount.has(mes)||mesCount.get(mes)<n)mesCount.set(mes,n);
  });

  nuevos.forEach(ct=>{
    const mes=ct.fechaAlta.replace(/-/g,'').substring(0,6);
    const n=(mesCount.get(mes)||0)+1;
    mesCount.set(mes,n);
    ct.id=`CT-${mes}-${String(n).padStart(4,'0')}`;
    normToId.set(ct._norm,ct.id);
    // Variantes del mismo grupo también apuntan a este ID
    delete ct._norm;
  });

  // Vincular órdenes: añadir clienteId a todas las que tengan cliente
  let linked=0;
  (d.orders||[]).forEach(o=>{
    if(!o.cliente)return;
    const norm=normNombre(o.cliente);
    const ctId=normToId.get(norm);
    if(ctId&&!o.clienteId){o.clienteId=ctId;linked++;}
  });

  // Commit atómico — único sd()
  d.contactos=[...existentes,...nuevos];
  d.contactosMigDone=true;
  sd(d);
  ghAutoPush();

  window.clM?.();
  sN(`✓ ${nuevos.length} contactos creados · ${linked} órdenes vinculadas`);
  renderContactos();
}
