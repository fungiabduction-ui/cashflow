import { ld, sd, gO, gOConf, gE, gInv, gLiqExterna } from '../core/storage.js';
import { sN } from '../ui/notif.js';
import { fv, fi, hoy, d2s, d2m, parseDate, pn, trunc } from '../core/formatters.js';
import { getProductos } from './productos.js';
import { getLotes, getUmbrales, getStockMovs, getStock, getAllStockItems, getActualQty, getStockStatus, getStockFromLotes, getCostoPromedio } from './stock.js';
import { getListasPrecios, getTramosProducto } from './listas-precios.js';
import { getIngresos } from './inventario.js';
import { saveDistSlices, saveKpiHidden } from './inversiones.js';
import { saveLiqSlices } from './liquidez.js';
// XLSX is a global from CDN script — available as window.XLSX


// ── Helpers de XLSX: asignar fórmulas con valor precalculado ──
export function xlsxCell(v,f){
  // SheetJS acepta {v,f,t} para celdas con fórmula
  if(f) return {v:v,f:f,t:typeof v==='number'?'n':'s'};
  if(v===null||v===undefined||v==='') return {v:'',t:'s'};
  if(typeof v==='number') return {v:v,t:'n'};
  return {v:String(v),t:'s'};
}
export function xlsxSetCell(ws,col,row,v,f){
  const addr=col+row;
  ws[addr]=xlsxCell(v,f);
  if(!ws['!ref']){ws['!ref']=addr+':'+addr;}
  else{
    const [r1,r2]=ws['!ref'].split(':');
    function colN(c){let n=0;for(let i=0;i<c.length;i++)n=n*26+c.charCodeAt(i)-64;return n;}
    function rowN(r){return parseInt(r.replace(/[A-Z]/g,''));}
    function colL(n){let s='';while(n>0){s=String.fromCharCode((n-1)%26+65)+s;n=Math.floor((n-1)/26);}return s;}
    const c1=r1.replace(/\d/g,''),rr1=rowN(r1),c2=r2.replace(/\d/g,''),rr2=rowN(r2);
    const nc=colL(Math.max(colN(c1),colN(c2),colN(col)));
    const nr=Math.max(rr1,rr2,row);
    const mc=colL(Math.min(colN(c1),colN(c2),colN(col)));
    const mr=Math.min(rr1,rr2,row);
    ws['!ref']=mc+mr+':'+nc+nr;
  }
}
// Convierte array-of-arrays con celdas mixtas a worksheet
export function xlsxAoaToSheet(data){
  const ws={};
  data.forEach((row,ri)=>{
    row.forEach((cell,ci)=>{
      const col=String.fromCharCode(65+ci);
      const r=ri+1;
      const addr=col+r;
      if(cell&&typeof cell==='object'&&'f' in cell){ws[addr]=cell;}
      else if(cell&&typeof cell==='object'&&'v' in cell){ws[addr]=cell;}
      else{ws[addr]=xlsxCell(cell);}
    });
  });
  if(data.length&&data[0].length){
    const lastCol=String.fromCharCode(64+data[0].length);
    ws['!ref']='A1:'+lastCol+data.length;
  }
  return ws;
}

// ── Obtener lineas de un pedido para el excel (privado) ──
function _getLineasOrden(o){
  const p=o.productos||{};
  if(p._lineas&&p._lineas.length){
    return p._lineas.map(l=>{
      const prod=getProductos().find(x=>x.id===(l.varId||l.prodId)||x.id===l.prodId);
      return{
        nombre:prod?prod.emoji+' '+prod.nombre:(l.varId||l.prodId||'—'),
        qty:l.qty||0, precio:l.precio||0, subtotal:l.subtotal||0
      };
    });
  }
  // fallback legacy
  const lineas=[];
  const prods=getProductos();
  function addL(prodId,legacyId,qty,precio){
    if(!qty)return;
    const prod=prods.find(x=>x.id===prodId||x.legacyKey===legacyId);
    const nombre=prod?prod.emoji+' '+prod.nombre:(legacyId||prodId);
    lineas.push({nombre,qty,precio,subtotal:qty*precio});
  }
  addL('v-cal','calaveras',p.calaveras||0,p.precioPastilla||0);
  addL('v-ted','teddy',p.teddy||0,p.precioPastilla||0);
  addL('v-lck','lucky',p.lucky||0,p.precioPastilla||0);
  addL('v-gen','genericas',p.genericas||0,p.precioPastilla||0);
  addL('p-cris',null,p.cristales||0,p.precioCristales||0);
  addL('p-hong',null,p.hongos||0,p.precioHongos||0);
  addL('p-got',null,p.goteros||0,0);
  addL('p-pet',null,p.petri||0,0);
  if(p.variable>0)lineas.push({nombre:'💲 Variable',qty:1,precio:p.variable,subtotal:p.variable});
  return lineas;
}

// ── JSON BACKUP COMPLETO (incluye distSlices) ──
export function expJSON(){
  const d=ld();
  // Guardia: si el storage devuelve 0 órdenes, posible corrupción silenciosa
  if(!(d.orders||[]).length&&!confirm('⚠ El backup tiene 0 ventas. El storage podría estar vacío o corrupto. ¿Descargar igual?'))return;
  // Configuraciones separadas de localStorage
  d._distSlices=window._getDistSlices?.();
  d._liqDistSlices=window._getLiqDistSlices?.();
  d._distKpiHidden=window._getDistKpiHidden?.();
  try{const ap=localStorage.getItem('me_apariencia');if(ap)d._apariencia=JSON.parse(ap);}catch(e){}
  const _th=localStorage.getItem('me_theme');if(_th)d._theme=_th;
  d._exportedAt=new Date().toISOString();
  d._version='motoredge_v5';
  d._meta={
    orders:(d.orders||[]).length,
    egresos:(d.egresos||[]).length,
    inversiones:(d.inversiones||[]).length,
    productos:(d.productos||[]).length,
    listasPrecios:(d.listasPrecios||[]).length,
    ingresos:(d.ingresos||[]).length,
    lotesItems:Object.keys(d.lotes||{}).length,
    stockSeedDone:!!d.stockSeedDone,
    contactos:(d.contactos||[]).length,
  };
  const blob=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');
  a.href=url;a.download=`motoredge_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();URL.revokeObjectURL(url);
  sN(`✓ Backup completo: ${d._meta.orders}v · ${d._meta.egresos}e · ${d._meta.ingresos} ingresos stock`);
}

// ── CSV ──
export function expCSV(tipo){
  const d=ld();let csv='',filename='';
  function csvRow(arr){return arr.map(v=>{const s=String(v===null||v===undefined?'':v);return s.includes(',')||s.includes('"')||s.includes('\n')?'"'+s.replace(/"/g,'""')+'"':s;}).join(',');}
  if(tipo==='ventas'){
    const orders=d.orders||[];if(!orders.length){sN('Sin ventas para exportar',true);return;}
    const hdr=['ID','Fecha','Cliente','Nota','Tipo Pago','TC USD','TC USDT','Modo Pago','Subtotal Bruto ARS','Ajuste Neto ARS','Total ARS','Total USD','Total USDT','Costo ARS','Margen %','Lineas Detalle'];
    csv=hdr.join(',')+'\n';
    orders.forEach(o=>{
      const t=o.totales||{};const pm=t.payment||o.payment||{};
      const lineas=_getLineasOrden(o).map(l=>`${l.nombre}:${l.qty}x$${l.precio}`).join(' | ');
      csv+=csvRow([o.id,o.fechaDisplay,o.cliente||'',o.nota||'',o.tipoPago,pm.tc_usd||'',pm.tc_usdt||'',pm.modo||o.tipoPago,t.subtotalBruto||t.totalGeneral||0,t.ajusteNeto||0,t.totalGeneral||0,pm.usd||'',pm.usdt||t.totalUSDT||'',o.costo||0,o.margen||0,lineas])+'\n';
    });
    filename='motoredge_ventas_'+new Date().toISOString().slice(0,10)+'.csv';
  }else if(tipo==='egresos'){
    const egresos=d.egresos||[];if(!egresos.length){sN('Sin egresos para exportar',true);return;}
    const hdr=['ID','Fecha','Concepto','Monto Total','Cuota Base','Ultima Cuota','Impacto Caja','Cuotas Total','Cuotas Restantes','Finaliza','Medio de Pago','Observaciones'];
    csv=hdr.join(',')+'\n';
    egresos.forEach(e=>{csv+=csvRow([e.id,e.fechaDisplay,e.concepto,e.montoTotal,e.cuotaBase||e.impactoCaja,e.ultimaCuota||e.impactoCaja,e.impactoCaja,e.cuotasTotales,e.cuotasRestantes,e.finaliza,e.medio,e.obs||''])+'\n';});
    filename='motoredge_egresos_'+new Date().toISOString().slice(0,10)+'.csv';
  }else if(tipo==='inversiones'){
    const inv=d.inversiones||[];const liq=d.liquidezExterna||[];
    if(!inv.length&&!liq.length){sN('Sin inversiones para exportar',true);return;}
    csv='=== INVERSIONES ===\nID,Fecha,Activo,Fuente,Moneda Origen,Monto Origen,Monto ARS,Precio Compra,Cantidad,Estado,Resultado Flotante ARS,Nota\n';
    inv.forEach(x=>{csv+=csvRow([x.id,x.fechaDisplay,x.activo,x.fuente||'',x.monedaOrigen||x.moneda||'ARS',x.monto||x.montoOriginal||x.montoARS,x.montoARS,x.precioCompra||x.precioActivo||'',x.cantidad||x.unidad||'',x.estado||'ACTIVA',x.resultadoFlotante||0,x.nota||''])+'\n';});
    csv+='\n=== LIQUIDEZ EXTERNA ===\nID,Fecha,Moneda,Monto,Equivalente ARS,Descripcion\n';
    liq.forEach(x=>{csv+=csvRow([x.id,x.fechaDisplay,x.moneda,x.monto,x.arsEquivalente,x.descripcion||''])+'\n';});
    filename='motoredge_inversiones_'+new Date().toISOString().slice(0,10)+'.csv';
  }else if(tipo==='inventario'){
    const prods=getProductos();
    const lotes=getLotes();
    const ingresos=getIngresos();
    if(!prods.length){sN('Sin productos para exportar',true);return;}
    // Sheet 1: Productos
    csv='=== PRODUCTOS ===\nID,Nombre,Unidad,Costo Adquisicion,Tipo Precio,Lista Precio,Stock Actual,Costo Prom Ponderado\n';
    prods.forEach(p=>{
      const stock=getStockFromLotes(p.id);
      const cProm=getCostoPromedio(p.id)||p.costo||0;
      const lista=getListasPrecios().find(l=>l.id===p.listaPrecioId);
      csv+=csvRow([p.id,p.nombre,p.unit||'ud',p.costo||0,p.tipo,lista?lista.nombre:'(propio)',stock,Math.round(cProm)])+'\n';
    });
    // Sheet 2: Lotes
    csv+='\n=== LOTES DE STOCK ===\nID Lote,ID Ingreso,Producto,Fecha,Cant. Inicial,Cant. Restante,Costo Unitario,Proveedor,Nota,Estado\n';
    Object.entries(lotes).forEach(([pid,arr])=>{
      const p=prods.find(x=>x.id===pid);
      const nombre=p?p.nombre:pid;
      (arr||[]).forEach(l=>{
        const estado=l.qty_restante<=0?'Agotado':l.qty_restante===l.qty_inicial?'Íntegro':'Parcial';
        csv+=csvRow([l.id,l.ingreso_id||'',nombre,d2s((l.fecha||'').substring(0,10)),l.qty_inicial,l.qty_restante,l.costo_unitario,l.proveedor||'',l.nota||'',estado])+'\n';
      });
    });
    // Sheet 3: Ingresos
    csv+='\n=== HISTORIAL DE INGRESOS ===\nID Ingreso,Fecha,Producto,Cantidad,Costo Unitario,Total,Proveedor,Nota\n';
    ingresos.slice().sort((a,b)=>a.fecha.localeCompare(b.fecha)).forEach(ing=>{
      const p=prods.find(x=>x.id===ing.prod_id);
      csv+=csvRow([ing.id,ing.fecha_display,p?p.nombre:ing.prod_id,ing.qty,ing.costo_unitario,ing.total,ing.proveedor||'',ing.nota||''])+'\n';
    });
    filename='motoredge_inventario_'+new Date().toISOString().slice(0,10)+'.csv';
  }
  const blob=new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);sN('CSV exportado');
}

// ── EXCEL COMPLETO CON FÓRMULAS ──
export function expXLSX(){
  const d=ld();
  const orders=d.orders||[];const egresos=d.egresos||[];
  const inv=d.inversiones||[];const liq=d.liquidezExterna||[];
  const prods=getProductos();const stock=getStock();const stockMovs=d.stockMovs||[];
  if(!orders.length&&!egresos.length&&!inv.length&&!liq.length){sN('Sin datos para exportar',true);return;}
  const wb=XLSX.utils.book_new();
  const fecha_exp=new Date().toISOString().slice(0,10);

  // ══ HOJA: RESUMEN ══
  {
    const totalVentas=orders.reduce((a,o)=>(o.totales?.totalGeneral||0)+a,0);
    const totalEgresos=egresos.reduce((a,e)=>(e.montoTotal||0)+a,0);
    const totalInv=inv.reduce((a,x)=>(x.montoARS||0)+a,0);
    const neto=totalVentas-totalEgresos;
    const data=[
      ['MOTOR EDGE — RESUMEN FINANCIERO','',''],
      ['Exportado:',fecha_exp,''],
      ['','',''],
      ['VENTAS','',''],
      ['Total ventas (ARS):',{v:totalVentas,t:'n',z:'#,##0'},''],
      ['Cantidad de órdenes:',{v:orders.length,t:'n'},''],
      ['','',''],
      ['EGRESOS','',''],
      ['Total egresos (ARS):',{v:totalEgresos,t:'n',z:'#,##0'},''],
      ['Cantidad de egresos:',{v:egresos.length,t:'n'},''],
      ['','',''],
      ['RESULTADO','',''],
      ['Resultado neto (ARS):',{v:neto,t:'n',z:'#,##0',f:'B5-B9'},''],
      ['Margen promedio %:',{v:orders.length?parseFloat((orders.reduce((a,o)=>a+(o.margen||0),0)/orders.length).toFixed(1)):0,t:'n',z:'0.0%'},''],
      ['','',''],
      ['INVERSIONES','',''],
      ['Total invertido (ARS):',{v:totalInv,t:'n',z:'#,##0'},''],
      ['Cantidad inversiones:',{v:inv.length,t:'n'},''],
    ];
    const ws=xlsxAoaToSheet(data);
    ws['!cols']=[{wch:28},{wch:18},{wch:10}];
    XLSX.utils.book_append_sheet(wb,ws,'RESUMEN');
  }

  // ══ HOJA: INGRESOS (con fórmulas) ══
  if(orders.length){
    // Encabezados
    const HDR=['ID','Fecha','Cliente','Nota','Tipo Pago','TC USD','TC USDT',
      'Subtotal Bruto','Ajuste Neto','Total ARS','Total USD','Total USDT',
      'Costo ARS','Ganancia ARS','Margen %',
      'Calaveras','Teddy','Lucky','Genericas','Cristales(g)','Hongos(g)','Goteros','Petri','Variable'];
    const dataRows=orders.map((o,i)=>{
      const ri=i+2; // fila en excel (1=header)
      const t=o.totales||{};const pm=t.payment||o.payment||{};
      const p=o.productos||{};
      // Extrae qty por producto desde _lineas o legacy
      function getQty(prodId,varId){
        if(p._lineas)return p._lineas.filter(l=>varId?l.varId===varId:l.prodId===prodId&&!l.varId).reduce((a,l)=>a+(l.qty||0),0);
        if(varId==='v-cal')return p.calaveras||0;if(varId==='v-ted')return p.teddy||0;
        if(varId==='v-lck')return p.lucky||0;if(varId==='v-gen')return p.genericas||0;
        if(prodId==='p-cris')return p.cristales||0;if(prodId==='p-hong')return p.hongos||0;
        if(prodId==='p-got')return p.goteros||0;if(prodId==='p-pet')return p.petri||0;
        return 0;
      }
      const totalARS=t.totalGeneral||0;
      const costo=o.costo||0;
      const subtotal=t.subtotalBruto||totalARS;
      const ajuste=t.ajusteNeto||0;
      return[
        {v:o.id,t:'s'},{v:o.fechaDisplay,t:'s'},{v:o.cliente||'',t:'s'},{v:o.nota||'',t:'s'},
        {v:o.tipoPago||'ARS',t:'s'},
        {v:pm.tc_usd||0,t:'n'},{v:pm.tc_usdt||0,t:'n'},
        {v:subtotal,t:'n',z:'#,##0'},{v:ajuste,t:'n',z:'#,##0'},
        {v:totalARS,t:'n',z:'#,##0',f:`H${ri}+I${ri}`},   // Total = Subtotal + Ajuste
        {v:pm.usd||0,t:'n',z:'#,##0.00'},{v:pm.usdt||t.totalUSDT||0,t:'n',z:'#,##0.00'},
        {v:costo,t:'n',z:'#,##0'},
        {v:totalARS-costo,t:'n',z:'#,##0',f:`J${ri}-M${ri}`},  // Ganancia = Total - Costo
        {v:totalARS>0?parseFloat(((totalARS-costo)/totalARS*100).toFixed(2)):0,t:'n',z:'0.00"%"',f:`IF(J${ri}>0,(J${ri}-M${ri})/J${ri}*100,0)`},
        {v:getQty('p-past','v-cal'),t:'n'},{v:getQty('p-past','v-ted'),t:'n'},
        {v:getQty('p-past','v-lck'),t:'n'},{v:getQty('p-past','v-gen'),t:'n'},
        {v:getQty('p-cris',null),t:'n'},{v:getQty('p-hong',null),t:'n'},
        {v:getQty('p-got',null),t:'n'},{v:getQty('p-pet',null),t:'n'},
        {v:p.variable||0,t:'n'},
      ];
    });
    // Fila de totales con fórmulas SUMA
    const lastR=orders.length+1;
    const totRow=[
      {v:'TOTALES',t:'s'},{v:'',t:'s'},{v:'',t:'s'},{v:'',t:'s'},{v:'',t:'s'},{v:'',t:'s'},{v:'',t:'s'},
      {v:orders.reduce((a,o)=>a+(o.totales?.subtotalBruto||o.totales?.totalGeneral||0),0),t:'n',z:'#,##0',f:`SUM(H2:H${lastR})`},
      {v:orders.reduce((a,o)=>a+(o.totales?.ajusteNeto||0),0),t:'n',z:'#,##0',f:`SUM(I2:I${lastR})`},
      {v:orders.reduce((a,o)=>a+(o.totales?.totalGeneral||0),0),t:'n',z:'#,##0',f:`SUM(J2:J${lastR})`},
      {v:orders.reduce((a,o)=>a+(o.totales?.payment?.usd||0),0),t:'n',z:'#,##0.00',f:`SUM(K2:K${lastR})`},
      {v:orders.reduce((a,o)=>a+(o.totales?.payment?.usdt||o.totales?.totalUSDT||0),0),t:'n',z:'#,##0.00',f:`SUM(L2:L${lastR})`},
      {v:orders.reduce((a,o)=>a+(o.costo||0),0),t:'n',z:'#,##0',f:`SUM(M2:M${lastR})`},
      {v:orders.reduce((a,o)=>a+(o.totales?.totalGeneral||0)-(o.costo||0),0),t:'n',z:'#,##0',f:`SUM(N2:N${lastR})`},
      {v:0,t:'n',z:'0.00"%"',f:`IF(J${lastR+1}>0,N${lastR+1}/J${lastR+1}*100,0)`},
      ...Array(9).fill({v:'',t:'s'})
    ];
    const ws=xlsxAoaToSheet([[...HDR.map(h=>({v:h,t:'s'}))], ...dataRows, totRow]);
    ws['!cols']=[{wch:20},{wch:10},{wch:14},{wch:16},{wch:9},{wch:9},{wch:9},{wch:13},{wch:11},{wch:13},{wch:11},{wch:11},{wch:12},{wch:13},{wch:10},{wch:9},{wch:9},{wch:9},{wch:9},{wch:11},{wch:10},{wch:9},{wch:9},{wch:10}];
    XLSX.utils.book_append_sheet(wb,ws,'INGRESOS');
  }

  // ══ HOJA: DETALLE LÍNEAS (una fila por producto en cada pedido) ══
  if(orders.length){
    const HDR2=['ID Orden','Fecha','Cliente','Producto','Cantidad','Precio Unit ARS','Subtotal ARS','Tipo Pago','Total Orden ARS'];
    const rows2=[];
    orders.forEach(o=>{
      const lineas=_getLineasOrden(o);
      const t=o.totales||{};
      lineas.forEach((l,li)=>{
        rows2.push([
          {v:o.id,t:'s'},{v:o.fechaDisplay,t:'s'},{v:o.cliente||'',t:'s'},
          {v:l.nombre,t:'s'},{v:l.qty,t:'n'},{v:l.precio,t:'n',z:'#,##0'},
          {v:l.subtotal,t:'n',z:'#,##0',f:`E${rows2.length+2}*F${rows2.length+2}`},
          {v:o.tipoPago||'ARS',t:'s'},
          li===0?{v:t.totalGeneral||0,t:'n',z:'#,##0'}:{v:'',t:'s'},
        ]);
      });
    });
    const ws2=xlsxAoaToSheet([[...HDR2.map(h=>({v:h,t:'s'}))], ...rows2]);
    ws2['!cols']=[{wch:20},{wch:10},{wch:14},{wch:20},{wch:9},{wch:14},{wch:13},{wch:9},{wch:14}];
    XLSX.utils.book_append_sheet(wb,ws2,'LINEAS_DETALLE');
  }

  // ══ HOJA: EGRESOS ══
  if(egresos.length){
    const HDR=['ID','Fecha','Concepto','Monto Total','Cuota Base','Ultima Cuota','Impacto Caja','Cuotas Total','Cuotas Rest.','Finaliza','Medio de Pago','Observaciones'];
    const rows=egresos.map((e,i)=>{
      const ri=i+2;
      return[
        {v:e.id,t:'s'},{v:e.fechaDisplay,t:'s'},{v:e.concepto,t:'s'},
        {v:e.montoTotal,t:'n',z:'#,##0'},{v:e.cuotaBase||e.impactoCaja,t:'n',z:'#,##0'},
        {v:e.ultimaCuota||e.impactoCaja,t:'n',z:'#,##0'},{v:e.impactoCaja,t:'n',z:'#,##0'},
        {v:e.cuotasTotales,t:'n'},{v:e.cuotasRestantes,t:'n'},
        {v:e.finaliza,t:'s'},{v:e.medio,t:'s'},{v:e.obs||'',t:'s'},
      ];
    });
    const lastR=egresos.length+1;
    const totRow=[{v:'TOTALES',t:'s'},{v:'',t:'s'},{v:'',t:'s'},
      {v:egresos.reduce((a,e)=>a+(e.montoTotal||0),0),t:'n',z:'#,##0',f:`SUM(D2:D${lastR})`},
      {v:'',t:'s'},{v:'',t:'s'},
      {v:egresos.reduce((a,e)=>a+(e.impactoCaja||0),0),t:'n',z:'#,##0',f:`SUM(G2:G${lastR})`},
      ...Array(5).fill({v:'',t:'s'})
    ];
    const ws=xlsxAoaToSheet([[...HDR.map(h=>({v:h,t:'s'}))], ...rows, totRow]);
    ws['!cols']=[{wch:20},{wch:10},{wch:26},{wch:13},{wch:12},{wch:12},{wch:12},{wch:12},{wch:12},{wch:11},{wch:16},{wch:24}];
    XLSX.utils.book_append_sheet(wb,ws,'EGRESOS');
  }

  // ══ HOJA: INVERSIONES ══
  if(inv.length){
    const HDR=['ID','Fecha','Activo','Fuente','Moneda Origen','Monto Origen','Monto ARS','Precio Compra','Cantidad','Estado','Resultado Flotante ARS','Nota'];
    const rows=inv.map((x,i)=>{
      const ri=i+2;
      return[
        {v:x.id,t:'s'},{v:x.fechaDisplay,t:'s'},{v:x.activo,t:'s'},{v:x.fuente||'',t:'s'},
        {v:x.monedaOrigen||x.moneda||'ARS',t:'s'},
        {v:x.monto||x.montoOriginal||x.montoARS,t:'n',z:'#,##0.00'},
        {v:x.montoARS,t:'n',z:'#,##0'},
        {v:x.precioCompra||x.precioActivo||0,t:'n',z:'#,##0.00'},
        {v:x.cantidad||x.unidad||'',t:'s'},
        {v:x.estado||'ACTIVA',t:'s'},
        {v:x.resultadoFlotante||0,t:'n',z:'#,##0'},
        {v:x.nota||'',t:'s'},
      ];
    });
    const lastR=inv.length+1;
    const totRow=[{v:'TOTALES',t:'s'},...Array(5).fill({v:'',t:'s'}),
      {v:inv.reduce((a,x)=>a+(x.montoARS||0),0),t:'n',z:'#,##0',f:`SUM(G2:G${lastR})`},
      {v:'',t:'s'},{v:'',t:'s'},{v:'',t:'s'},
      {v:inv.reduce((a,x)=>a+(x.resultadoFlotante||0),0),t:'n',z:'#,##0',f:`SUM(K2:K${lastR})`},
      {v:'',t:'s'}
    ];
    const ws=xlsxAoaToSheet([[...HDR.map(h=>({v:h,t:'s'}))], ...rows, totRow]);
    ws['!cols']=[{wch:20},{wch:10},{wch:12},{wch:18},{wch:12},{wch:13},{wch:13},{wch:14},{wch:14},{wch:10},{wch:18},{wch:24}];
    XLSX.utils.book_append_sheet(wb,ws,'INVERSIONES');
  }

  // ══ HOJA: LIQUIDEZ EXTERNA ══
  if(liq.length){
    const HDR=['ID','Fecha','Moneda','Monto','Equivalente ARS','Descripcion'];
    const rows=liq.map(x=>[
      {v:x.id,t:'s'},{v:x.fechaDisplay,t:'s'},{v:x.moneda,t:'s'},
      {v:x.monto,t:'n',z:'#,##0.00'},{v:x.arsEquivalente,t:'n',z:'#,##0'},{v:x.descripcion||'',t:'s'}
    ]);
    const lastR=liq.length+1;
    const totRow=[{v:'TOTALES',t:'s'},{v:'',t:'s'},{v:'',t:'s'},
      {v:liq.reduce((a,x)=>a+(x.monto||0),0),t:'n',z:'#,##0.00',f:`SUM(D2:D${lastR})`},
      {v:liq.reduce((a,x)=>a+(x.arsEquivalente||0),0),t:'n',z:'#,##0',f:`SUM(E2:E${lastR})`},
      {v:'',t:'s'}
    ];
    const ws=xlsxAoaToSheet([[...HDR.map(h=>({v:h,t:'s'}))], ...rows, totRow]);
    ws['!cols']=[{wch:18},{wch:10},{wch:8},{wch:13},{wch:16},{wch:30}];
    XLSX.utils.book_append_sheet(wb,ws,'LIQUIDEZ_EXTERNA');
  }

  // ══ HOJA: PRODUCTOS (catálogo completo con tramos) ══
  if(prods.length){
    const HDR=['ID','Emoji','Nombre','Tipo','Unidad','Costo/ud','Activo','Tramo 1 (desde)','Tramo 1 (precio)','Tramo 2','Precio 2','Tramo 3','Precio 3','Tramo 4','Precio 4','Tramo 5','Precio 5'];
    const rows=prods.map(p=>{
      const ts=getTramosProducto?.(p)||[];
      const tr=[];for(let i=0;i<5;i++){tr.push(ts[i]?ts[i].t:'');tr.push(ts[i]?ts[i].p:'');}
      return[
        {v:p.id,t:'s'},{v:p.emoji,t:'s'},{v:p.nombre,t:'s'},{v:p.tipo,t:'s'},
        {v:p.unit||'ud',t:'s'},{v:p.costo||0,t:'n',z:'#,##0'},{v:p.activo?'SI':'NO',t:'s'},
        ...tr.map((v,i)=>i%2===0?{v:v||'',t:v?'n':'s'}:{v:v||0,t:v?'n':'s',z:v?'#,##0':''})
      ];
    });
    const ws=xlsxAoaToSheet([[...HDR.map(h=>({v:h,t:'s'}))], ...rows]);
    ws['!cols']=[{wch:14},{wch:6},{wch:18},{wch:10},{wch:12},{wch:8},{wch:10},{wch:7},...Array(10).fill({wch:10})];
    XLSX.utils.book_append_sheet(wb,ws,'PRODUCTOS');
  }

  // ══ HOJA: STOCK ACTUAL ══
  {
    const items=getAllStockItems()??[];
    const umbrales=getStockUmbObj();
    if(items.length){
      const HDR=['ID','Emoji','Nombre','Unidad','Stock Actual','Umbral Bajo','Umbral Critico','Estado'];
      const rows=items.map(it=>{
        const qty=getActualQty?.(it.id,stock);const st=getStockStatus?.(qty,it.id);
        const u=umbrales[it.id]||{warn:15,crit:5};
        return[
          {v:it.id,t:'s'},{v:it.emoji,t:'s'},{v:it.nombre,t:'s'},{v:it.unit||'ud',t:'s'},
          {v:qty,t:'n'},{v:u.warn,t:'n'},{v:u.crit,t:'n'},
          {v:st==='ok'?'OK':st==='warn'?'BAJO':st==='crit'?'CRITICO':'SIN STOCK',t:'s'}
        ];
      });
      const ws=xlsxAoaToSheet([[...HDR.map(h=>({v:h,t:'s'}))], ...rows]);
      ws['!cols']=[{wch:14},{wch:6},{wch:18},{wch:8},{wch:12},{wch:11},{wch:13},{wch:12}];
      XLSX.utils.book_append_sheet(wb,ws,'STOCK_ACTUAL');
    }
  }

  // ══ HOJA: STOCK_MOVIMIENTOS ══
  if(stockMovs.length){
    const HDR=['ID','Fecha','Tipo','Producto ID','Nombre','Antes','Delta','Despues','Nota'];
    const rows=stockMovs.slice(0,2000).map(m=>{
      const d=new Date(m.fecha);const fs=`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      return[
        {v:m.id||'',t:'s'},{v:fs,t:'s'},{v:m.tipo,t:'s'},{v:m.prodId,t:'s'},
        {v:(m.emoji||'')+' '+(m.nombre||m.prodId),t:'s'},
        {v:m.antes||0,t:'n'},{v:m.delta||0,t:'n'},{v:m.despues||0,t:'n'},{v:m.nota||'',t:'s'}
      ];
    });
    const ws=xlsxAoaToSheet([[...HDR.map(h=>({v:h,t:'s'}))], ...rows]);
    ws['!cols']=[{wch:20},{wch:17},{wch:11},{wch:14},{wch:20},{wch:7},{wch:7},{wch:8},{wch:28}];
    XLSX.utils.book_append_sheet(wb,ws,'STOCK_MOVIMIENTOS');
  }

  XLSX.writeFile(wb,`motoredge_${fecha_exp}.xlsx`);
  sN(`✓ Excel exportado — ${wb.SheetNames.length} hojas`);
}

// helper para getUmbrales en expXLSX (ya existe getUmbrales pero lo aliasamos)
export function getStockUmbObj(){return getUmbrales();}

// ── RESTAURAR JSON DESDE FILE PICKER (auto-restore al seleccionar) ──
export function impJSONFile(input){
  const file=input.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    input.value='';
    const resEl=document.getElementById('impRes');
    try{
      const d=JSON.parse(e.target.result);
      if(!d.orders||!Array.isArray(d.orders))throw new Error('Formato inválido: falta orders[]');
      const meta=`${d.orders.length} ventas · ${(d.egresos||[]).length} egresos · ${(d.inversiones||[]).length} inversiones`;
      if(!confirm(`¿Restaurar desde "${file.name}"?\n\n${meta}\n\nEsto REEMPLAZA todos los datos actuales. No se puede deshacer.`)){
        if(resEl)resEl.innerHTML='<span style="color:var(--tx3)">Cancelado</span>';
        return;
      }
      // Backup automático silencioso del estado actual antes de sobreescribir
      const cur=ld();
      if((cur.orders||[]).length>0){
        try{
          const blob=new Blob([JSON.stringify(cur,null,2)],{type:'application/json'});
          const url=URL.createObjectURL(blob);const a=document.createElement('a');
          a.href=url;a.download=`motoredge_pre-restore_${new Date().toISOString().slice(0,16).replace('T','_').replace(':','-')}.json`;
          a.click();URL.revokeObjectURL(url);
        }catch(bkErr){/* no bloquear si el backup falla */}
      }
      if(d._distSlices){window._setDistSlices?.(d._distSlices);saveDistSlices();}
      if(d._liqDistSlices){window._setLiqDistSlices?.(d._liqDistSlices);saveLiqSlices();}
      if(d._distKpiHidden){window._setDistKpiHidden?.(d._distKpiHidden);saveKpiHidden();}
      // Compat: backups viejos tenian _priceLog separado
      if(d._priceLog&&!d.priceLog){d.priceLog=d._priceLog;}
      // Si el backup no tiene priceLog (anterior al feature), preservar el log local en lugar de perderlo
      if(!Array.isArray(d.priceLog)){
        const _cur=ld();
        if(Array.isArray(_cur.priceLog)&&_cur.priceLog.length){d.priceLog=_cur.priceLog;}
        else{try{const _r=localStorage.getItem('me_price_log');d.priceLog=_r?JSON.parse(_r):[];localStorage.removeItem('me_price_log');}catch(_e){d.priceLog=[];}}
      }
      if(d._apariencia){try{localStorage.setItem('me_apariencia',JSON.stringify(d._apariencia));window.applyApariencia?.(d._apariencia);}catch(e){}}
      if(d._theme){try{localStorage.setItem('me_theme',d._theme);}catch(e){}}
      delete d._distSlices;delete d._liqDistSlices;delete d._distKpiHidden;delete d._priceLog;
      delete d._apariencia;delete d._theme;
      delete d._exportedAt;delete d._version;delete d._meta;delete d._savedAt;
      sd(d);
      window.loadConfig?.();window.buildTicketUI?.();window.upd?.();
      window.rfM?.();window.rH?.();window.rS?.();window.rEH?.();window.rES?.();window.renderDash?.();window.renderSettings?.();
      try{window.renderInventario?.();}catch(er){}
      try{if(typeof window.renderInvAll==='function')window.renderInvAll?.();}catch(er){}
      try{window.rfInvM?.();}catch(er){}
      window.updateClientesDatalist?.();window.uhd?.();
      const lotesItems=Object.keys(d.lotes||{}).length;
      if(resEl)resEl.innerHTML=`<span style="color:var(--ac)">✓ Restaurado: ${d.orders.length} ventas · ${(d.egresos||[]).length} egresos<br>${(d.productos||[]).length} productos · ${(d.ingresos||[]).length} ingresos stock · ${lotesItems} lotes</span>`;
      sN('✓ Datos restaurados completamente');window.uhd?.();
    }catch(er){
      if(resEl)resEl.innerHTML=`<span style="color:var(--er)">ERROR: ${er.message}</span>`;
      sN('Error al restaurar',true);
    }
  };
  reader.readAsText(file,'utf-8');
}

// ── MIGRAR TC NULL — one-shot fix para órdenes con tc: null ──
export function migrarTcNull(){
  const d=ld();
  const orders=d.orders||[];
  let migradas=0;
  orders.forEach(o=>{
    const needsFix=(o.tc===null||o.tc===undefined)||(o.tcUsdt===null||o.tcUsdt===undefined);
    if(!needsFix)return;
    if(o.tc===null||o.tc===undefined){
      if(o.tipoPago==='ARS'){o.tc=1;}
      else if(o.tipoPago==='USD'&&o.payment?.tc_usd>0){o.tc=o.payment.tc_usd;}
      else if(o.tipoPago==='USDT'&&o.payment?.tc_usdt>0){o.tc=o.payment.tc_usdt;}
      else{o.tc=1;}
    }
    if(o.tcUsdt===null||o.tcUsdt===undefined){
      o.tcUsdt=o.payment?.tc_usdt||1;
    }
    migradas++;
  });
  if(migradas>0){sd(d);}
  return{migradas};
}

// ── HARD RESET — borra todo el localStorage del sistema ──
export function hardReset(){
  const KEYS=[
    {k:'motoredge_v4',    d:'Todos los datos financieros (ventas, egresos, inversiones, stock)'},
    {k:'me_gh_config',    d:'Configuración GitHub Sync (token, repo, archivo)'},
    {k:'me_dist_slices',  d:'Distribución de capital (inversiones)'},
    {k:'me_liq_dist_slices',d:'Distribución de liquidez'},
    {k:'me_dist_kpi_hidden',d:'KPIs ocultos en distribución'},
    {k:'me_apariencia',   d:'Colores y tema personalizados'},
    {k:'me_theme',        d:'Preferencia de tema (dark/light/modern)'},
    {k:'me_gh_last_push', d:'Timestamp del último push a GitHub'},
    {k:'me_price_log',    d:'Log de cambios de precios (auditoría)'},
    {k:'me_gh_calc_last', d:'Timestamp del último sync con la calculadora'},
  ];
  const present=KEYS.filter(x=>localStorage.getItem(x.k)!==null);
  if(!present.length){sN('No hay datos que borrar');return;}
  const list=present.map(x=>`• ${x.d}`).join('\n');
  const msg=`⚠️  HARD RESET\n\nSe va a borrar permanentemente:\n\n${list}\n\n──────────────────────────\nSe descargará un backup JSON antes de continuar.\n\n¿Confirmar?`;
  if(!confirm(msg))return;
  expJSON();
  present.forEach(x=>{try{localStorage.removeItem(x.k);}catch(e){}});
  sN('✓ Reset completo. Recargando...');
  setTimeout(()=>location.reload(),1500);
}

