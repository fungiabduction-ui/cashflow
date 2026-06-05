import { ld, sd } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { DEFAULT_LISTAS_PRECIOS } from '../core/constants.js';
import { fi } from '../core/formatters.js';
import { getCostoPromedio } from './stock.js';

export function getListasPrecios(){
  const d=ld();
  if(!d.listasPrecios||!d.listasPrecios.length){
    return DEFAULT_LISTAS_PRECIOS.map(l=>({...l,tramos:l.tramos.map(t=>({...t}))}));
  }
  return d.listasPrecios;
}
export function saveListasPrecios(listas){const d=ld();d.listasPrecios=listas;sd(d);}
export function newListaId(){
  const listas=getListasPrecios();
  const nums=listas.map(l=>parseInt(l.id.replace(/\D/g,''))||0);
  return 'lp-'+(Math.max(0,...nums)+1).toString().padStart(3,'0');
}

// Obtener tramos efectivos para un producto (respeta asignación de lista)
export function getTramosProducto(prod){
  if(prod.listaPrecioId){
    const lista=getListasPrecios().find(l=>l.id===prod.listaPrecioId);
    if(lista)return lista.tramos;
  }
  return prod.tramos||[];
}

// ════════════════════════════════════════
// MÓDULO LISTA DE PRECIOS — render
// ════════════════════════════════════════
export function renderListasPrecios(){
  const cont=document.getElementById('inv-listas-body');if(!cont)return;
  const listas=getListasPrecios();
  if(!listas.length){cont.innerHTML='<div style="padding:20px;font-family:var(--mo);font-size:11px;color:var(--tx3);text-align:center">Sin listas. Creá una con ➕.</div>';return;}

  let html='';
  listas.forEach(lista=>{
    const lid=lista.id;
    const tramos=lista.tramos||[];
    const prodsAsignados=window.getProductos?.().filter(p=>p.listaPrecioId===lid)||[];
    const base=tramos[0]?.p||0;

    html+='<div id="lpg-'+lid+'" style="border:1px solid var(--br);margin-bottom:8px;background:var(--s1)">';

    // ── Header ──
    html+='<div style="display:grid;grid-template-columns:1fr auto;align-items:start;padding:12px 14px;gap:12px">'
      // Left: name + meta
      +'<div>'
      +'<div style="font-family:var(--mo);font-size:12px;font-weight:700;color:var(--tx);margin-bottom:4px">'+lista.nombre+'</div>'
      +'<div style="font-family:var(--mo);font-size:8px;color:var(--tx3);margin-bottom:3px">ID: <span style="color:var(--ac2)">'+lid+'</span> · '+tramos.length+' tramos'+(base?' · Precio base: <span style="color:var(--ac)">$'+fi(base)+'</span>':'')+'</div>'
      +(prodsAsignados.length
        ?'<div style="font-family:var(--mo);font-size:8px;color:var(--tx2)">Asignada a: '+prodsAsignados.map(p=>'<span style="background:var(--s3);padding:1px 5px;margin-right:3px">'+p.emoji+' '+p.nombre+'</span>').join('')+'</div>'
        :'<div style="font-family:var(--mo);font-size:8px;color:var(--er)">Sin productos asignados</div>'
      )
      +'</div>'
      // Right: action buttons
      +'<div style="display:flex;gap:6px;align-items:center;flex-shrink:0">'
      +'<button class="pm-btn" data-edit-lista="'+lid+'" style="font-size:8px;height:28px;padding:0 10px">EDIT</button>'
      +'<button class="pm-btn del" data-del-lista="'+lid+'" style="font-size:8px;height:28px;width:28px;padding:0;text-align:center">✕</button>'
      +'<button data-lista-toggle="'+lid+'" style="background:none;border:1px solid var(--br);color:var(--tx3);font-family:var(--mo);font-size:10px;width:28px;height:28px;cursor:pointer;padding:0;text-align:center" id="lpa-'+lid+'">▸</button>'
      +'</div>'
      +'</div>';

    // ── Tramos expandible ──
    html+='<div id="lpt-'+lid+'" style="display:none;border-top:1px solid var(--br)">';
    if(tramos.length){
      html+='<table style="width:100%;border-collapse:collapse">'
        +'<thead><tr>'
        +'<th style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:8px 14px;text-align:left;background:var(--s2);border-bottom:1px solid var(--br)">DESDE</th>'
        +'<th style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:8px 14px;text-align:right;background:var(--s2);border-bottom:1px solid var(--br)">PRECIO</th>'
        +'<th style="font-family:var(--mo);font-size:7px;color:var(--tx3);letter-spacing:1px;padding:8px 14px;text-align:right;background:var(--s2);border-bottom:1px solid var(--br)">DTO. BASE</th>'
        +'</tr></thead><tbody>';
      tramos.forEach((t,i)=>{
        const disc=i===0?'—':'-'+((1-t.p/base)*100).toFixed(1)+'%';
        html+='<tr style="'+(i===0?'background:rgba(0,229,160,.03)':'')+';">'
          +'<td style="font-family:var(--mo);font-size:10px;padding:8px 14px;border-bottom:1px solid rgba(42,42,58,.15);color:var(--tx3)">≥ '+t.t+'</td>'
          +'<td style="font-family:var(--mo);font-size:11px;font-weight:700;padding:8px 14px;border-bottom:1px solid rgba(42,42,58,.15);text-align:right;color:var(--ac)">$'+fi(t.p)+'</td>'
          +'<td style="font-family:var(--mo);font-size:10px;padding:8px 14px;border-bottom:1px solid rgba(42,42,58,.15);text-align:right;color:var(--wn)">'+disc+'</td>'
          +'</tr>';
      });
      html+='</tbody></table>';
    } else {
      html+='<div style="padding:14px;font-family:var(--mo);font-size:10px;color:var(--tx3)">Sin tramos configurados.</div>';
    }
    html+='</div>';// /lpt
    html+='</div>';// /lpg
  });

  cont.innerHTML=html;
  cont.onclick=function(e){
    const toggleBtn=e.target.closest('[data-lista-toggle]');
    if(toggleBtn){
      const lid=toggleBtn.getAttribute('data-lista-toggle');
      const body=document.getElementById('lpt-'+lid);
      const arrow=document.getElementById('lpa-'+lid);
      if(!body)return;
      const open=body.style.display==='none';
      body.style.display=open?'':'none';
      if(arrow)arrow.textContent=open?'▾':'▸';
      return;
    }
    const editBtn=e.target.closest('[data-edit-lista]');
    if(editBtn){abrirEditarLista(editBtn.getAttribute('data-edit-lista'));return;}
    const delBtn=e.target.closest('[data-del-lista]');
    if(delBtn){eliminarLista(delBtn.getAttribute('data-del-lista'));return;}
  };
}

export function renderAsignacionPrecios(){
  const cont=document.getElementById('inv-asignacion-body');if(!cont)return;
  const prods=(window.getProductos?.()||[]).filter(p=>p.activo!==false);
  const listas=getListasPrecios();
  const IS='background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:11px;padding:5px 8px;outline:none;width:100%';

  let html='<div style="overflow-x:auto"><table class="inv-stock-tbl"><thead><tr><th>Producto</th><th>Lista asignada</th><th>Precio base</th><th>Costo prom.</th><th>Margen base</th></tr></thead><tbody>';
  prods.forEach(p=>{
    const tramos=getTramosProducto(p);
    const precioBase=tramos[0]?.p||0;
    const costo=getCostoPromedio(p.id);
    const margen=costo&&precioBase?((precioBase-costo)/precioBase*100):null;
    const margenCls=margen==null?'color:var(--tx3)':margen>30?'color:var(--ac)':margen>15?'color:var(--wn)':'color:var(--er)';

    let opts='<option value="">— Sin lista —</option>';
    listas.forEach(l=>{opts+='<option value="'+l.id+'"'+(p.listaPrecioId===l.id?' selected':'')+'>'+l.nombre+'</option>';});

    html+='<tr>'
      +'<td>'+p.emoji+' '+p.nombre+'</td>'
      +'<td><select style="'+IS+'" data-asig-prod="'+p.id+'">'+opts+'</select></td>'
      +'<td style="text-align:right;font-family:var(--mo);color:var(--ac)">'+(precioBase?'$'+fi(precioBase):'—')+'</td>'
      +'<td style="text-align:right;font-family:var(--mo);color:var(--ac2)">'+(costo?'$'+fi(Math.round(costo)):'—')+'</td>'
      +'<td style="text-align:right;font-family:var(--mo);font-weight:700;'+margenCls+'">'+(margen!=null?margen.toFixed(1)+'%':'—')+'</td>'
      +'</tr>';
  });
  html+='</tbody></table></div>';
  html+='<div style="padding:10px 14px;border-top:1px solid var(--br);display:flex;align-items:center;gap:10px">'
    +'<button class="btn btn-p" id="btn-guardar-asig" style="font-size:9px;height:32px">💾 Guardar asignaciones</button>'
    +'<span id="asig-msg" style="font-family:var(--mo);font-size:9px;color:var(--ac)"></span>'
    +'</div>';
  cont.innerHTML=html;

  document.getElementById('btn-guardar-asig').onclick=function(){
    const prods=window.getProductos?.()||[];
    cont.querySelectorAll('[data-asig-prod]').forEach(sel=>{
      const pid=sel.getAttribute('data-asig-prod');
      const p=prods.find(x=>x.id===pid);
      if(p)p.listaPrecioId=sel.value||null;
    });
    window.saveProductos?.(prods);window.loadConfig?.();window.buildTicketUI?.();window.upd?.();
    const msg=document.getElementById('asig-msg');
    if(msg){msg.textContent='✓ Guardado';setTimeout(()=>msg.textContent='',2000);}
    renderAsignacionPrecios();sN('✓ Asignaciones guardadas');
  };
}

export function abrirNuevaLista(){
  abrirEditarLista(null);
}

export function abrirEditarLista(lid){
  const listas=getListasPrecios();
  const lista=lid?listas.find(l=>l.id===lid):null;
  const esNueva=!lista;
  const tramos=lista?JSON.parse(JSON.stringify(lista.tramos||[])):[];

  const IS='width:100%;background:var(--bg);border:1px solid var(--br);color:var(--tx);font-family:var(--mo);font-size:13px;padding:8px 10px;outline:none;min-height:40px';
  const LB='font-family:var(--mo);font-size:8px;letter-spacing:.8px;color:var(--tx2);display:block;margin-bottom:4px;text-transform:uppercase';

  document.getElementById('mTitEl').textContent=(esNueva?'➕ Nueva Lista de Precios':'✏ Editar Lista — '+(lista?.nombre||lid));
  document.getElementById('mTitEl').className='mtit';
  document.getElementById('modalBox').className='modal';
  document.getElementById('mTk').style.display='none';

  function renderTramosEditor(){
    let th='<table style="width:100%;border-collapse:collapse"><thead><tr>'
      +'<th style="font-family:var(--mo);font-size:8px;color:var(--tx3);padding:4px 8px;text-align:left;border-bottom:1px solid var(--br)">Desde (cant.)</th>'
      +'<th style="font-family:var(--mo);font-size:8px;color:var(--tx3);padding:4px 8px;text-align:right;border-bottom:1px solid var(--br)">Precio</th>'
      +'<th style="padding:4px 4px;border-bottom:1px solid var(--br)"></th>'
      +'</tr></thead><tbody id="te-tbody">';
    tramos.forEach((t,i)=>{
      th+='<tr>'
        +'<td style="padding:4px 8px"><input type="number" min="1" value="'+t.t+'" style="'+IS+';min-height:36px;font-size:11px" data-ti="'+i+'" data-field="t"></td>'
        +'<td style="padding:4px 8px"><input type="number" min="0" value="'+t.p+'" style="'+IS+';min-height:36px;font-size:11px" data-ti="'+i+'" data-field="p"></td>'
        +'<td style="padding:4px 4px;text-align:center"><button class="pm-btn del" data-del-t="'+i+'" style="font-size:9px">×</button></td>'
        +'</tr>';
    });
    th+='</tbody></table>';
    return th;
  }

  document.getElementById('mBody').innerHTML=
    '<div style="display:flex;flex-direction:column;gap:12px">'
    +'<div><label style="'+LB+'">Nombre de la lista</label><input type="text" id="el-nombre" value="'+(lista?.nombre||'')+'" placeholder="ej: Pastillas Premium" style="'+IS+'"></div>'
    +(lid?'<div style="font-family:var(--mo);font-size:9px;color:var(--tx3)">ID: <b style="color:var(--ac2)">'+lid+'</b></div>':'')
    +'<div>'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
    +'<label style="'+LB+';margin:0">Tramos de precio</label>'
    +'<button class="pm-btn" id="te-add" style="font-size:8px">+ Agregar tramo</button>'
    +'</div>'
    +'<div id="te-wrap">'+renderTramosEditor()+'</div>'
    +'</div>'
    +'</div>';

  document.getElementById('te-add').onclick=function(){
    const last=tramos[tramos.length-1];
    tramos.push({t:(last?.t||0)+10,p:Math.round((last?.p||0)*0.9)||0});
    document.getElementById('te-wrap').innerHTML=renderTramosEditor();
    bindTramoEvents();
  };

  function bindTramoEvents(){
    const wrap=document.getElementById('te-wrap');
    wrap.querySelectorAll('input[data-ti]').forEach(inp=>{
      inp.oninput=function(){tramos[parseInt(inp.getAttribute('data-ti'))][inp.getAttribute('data-field')]=parseFloat(inp.value)||0;};
    });
    wrap.querySelectorAll('[data-del-t]').forEach(btn=>{
      btn.onclick=function(){
        tramos.splice(parseInt(btn.getAttribute('data-del-t')),1);
        document.getElementById('te-wrap').innerHTML=renderTramosEditor();
        bindTramoEvents();
      };
    });
  }
  bindTramoEvents();

  document.getElementById('mFooter').innerHTML=
    '<button class="btn btn-p" id="el-save">💾 Guardar lista</button>'
    +'<button class="btn btn-s" onclick="clM()">✕ Cancelar</button>';

  document.getElementById('el-save').onclick=function(){
    const nombre=document.getElementById('el-nombre').value.trim();
    if(!nombre){sN('El nombre es requerido',true);return;}
    if(!tramos.length){sN('Agregá al menos un tramo',true);return;}
    const listas=getListasPrecios();
    if(esNueva){
      const newId=newListaId();
      listas.push({id:newId,nombre,tramos:tramos.map(t=>({...t}))});
    } else {
      const idx=listas.findIndex(l=>l.id===lid);
      if(idx>=0)listas[idx]={id:lid,nombre,tramos:tramos.map(t=>({...t}))};
    }
    saveListasPrecios(listas);
    // Sincronizar tramos a productos que usan esta lista
    if(!esNueva){
      const prods=window.getProductos?.()||[];
      prods.forEach(p=>{if(p.listaPrecioId===lid){p.tramos=tramos.map(t=>({...t}));}});
      window.saveProductos?.(prods);window.loadConfig?.();window.buildTicketUI?.();window.upd?.();
    }
    window.clM?.();renderListasPrecios();renderAsignacionPrecios();sN('✓ Lista '+(esNueva?'creada':'actualizada'));
  };
  document.getElementById('modal').classList.add('open');
}

export function eliminarLista(lid){
  const prods=(window.getProductos?.()||[]).filter(p=>p.listaPrecioId===lid);
  if(prods.length){
    if(!confirm('Esta lista está asignada a: '+prods.map(p=>p.nombre).join(', ')+'. ¿Eliminar igual? Los productos quedarán sin lista.'))return;
    const todos=window.getProductos?.()||[];todos.forEach(p=>{if(p.listaPrecioId===lid)p.listaPrecioId=null;});
    window.saveProductos?.(todos);
  } else {
    if(!confirm('¿Eliminar la lista de precios?'))return;
  }
  const listas=getListasPrecios().filter(l=>l.id!==lid);
  saveListasPrecios(listas);
  renderListasPrecios();renderAsignacionPrecios();sN('Lista eliminada');
}

// ── renderInvPrecios mantiene compatibilidad (ya no se usa en sub-stock) ──
export function renderInvPrecios(){renderListasPrecios();}
