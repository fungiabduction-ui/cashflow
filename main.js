import { gtr, fi, fv, fu, hoy, d2s, d2m, mL, mLong, trunc, addMon, pn, parseDate, uid } from './core/formatters.js';
import { sN } from './ui/notif.js';
import { DPT, DCT, DHT, DGP, DPP, DCOSTS, DEFAULT_PRODUCTS, DEFAULT_LISTAS_PRECIOS } from './core/constants.js';
import { SK, ld, sd, gO, gOConf, gE, dO, dE, gInv, dInv, gLiqExterna, dLiqExterna } from './core/storage.js';
import { nId, nEId, newIngresoId, invNuevoId } from './core/ids.js';
import { PT, CT, HT, GP, PP, COSTS, loadConfig, initConfigDeps } from './core/config.js';
import { renderIOStatus, ghCfg, ghStatus, ghSyncInfo, safeB64Encode, safeB64Decode, ghSaveToken, ghLoadConfig, ghTestConn, ghPush, ghPull, ghAutoPush, ghBackupNow, ghListBackups, ghInit } from './modules/github.js';
import { getApariencia, saveApariencia, applyApariencia, lighten, loadAparienciaForm, syncColorFromHex, applyPreset, updateThemeCards, toggleAparienciaAvanzada, guardarApariencia, resetApariencia } from './modules/apariencia.js';
import { getStock, saveStock, getUmbrales, saveUmbrales, getStockMovs, addStockMov, limpiarMovsStock, eliminarMov, getStockStatus, skPill, stockStatusBadge, getAllStockItems, getLotes, saveLotes, getLotesItem, getLotesActivos, getStockFromLotes, getCostoPromedio, getStockGrupo, getCostoPromedioGrupo, getActualQty } from './modules/stock.js';
import { getListasPrecios, saveListasPrecios, newListaId, getTramosProducto, renderListasPrecios, renderAsignacionPrecios, abrirNuevaLista, abrirEditarLista, eliminarLista, renderInvPrecios } from './modules/listas-precios.js';
import { getProductos, saveProductos, updateClientesDatalist, renderPM, aplicarPctTodos, restablecerTramos, renderTramoRows, toggleTramoEditor, updTramoDisc, adjTramoDisc, agregarTramo, eliminarTramo, guardarTramos, toggleActivoProducto, duplicarProducto, abrirNuevoProducto, editarProducto, openProdModal, buildProdModalHTML, onPmListaChange, renderTramosEditor, renderVariantesEditor, setProdTipo, setProdAgrup, syncProdModalUI, addTramoEditor, removeTramoEditor, addVarianteEditor, removeVarianteEditor, updModalDiscs, guardarProductoModal, renderMaestra, abrirTramosEnMaestra, guardarTramosYCerrar, guardarMaestra } from './modules/productos.js';
import { sE, updEgreso, generarEgreso, limpiarEgr, limpiarEgresos, anularEgresoByIdModal, rEH, rES, openEditEgr, saveEditEgr, bE } from './modules/egresos.js';
import { renderMPImportModal } from './modules/mp-import.js';
import { sO, confirmarOrden, rH, rS, toggleHistGrp, toggleTotals, openEditVenta, editRecalcTotal, editUpdateEquiv, editSetMode, saveEditVenta, bO, anularByIdModal, confirLimpiar } from './modules/ventas.js';
import { getIngresos, saveIngreso, deleteIngreso, consumirStock, renderInvStockTabla, guardarUmbralesDesdeTabla, abrirLotesPanel, cerrarLotesPanel, renderLotesDetalle, renderIngresoForm, ingPreview, registrarIngreso, renderProductosRegistrados, eliminarProductoRegistrado, renderIngresosHistorial, editarIngreso, eliminarIngreso, renderInvStock, renderInventario, renderInventarioTabla, renderStockHistorial, descontarStockPorTicket, renderStockMiniPanel, renderDashStock, renderStockEntryForm, generarStockTicket, invSubNav, onInvPeriodoChange } from './modules/inventario.js';
import { renderSettings } from './modules/settings.js';
import { sLiqExterna, saveLiqSlices, autoBalanceLiq, renderLiqDistConfig, cycleLiqColor, addLiqSlice, removeLiqSlice, setLiqView, updLiqPreview, toggleLiqExterna, registrarLiqExterna, renderLiqExterna } from './modules/liquidez.js';
import { filtrarPorPeriodo, getInvFiltro, rfInvM, onInvMesChange, onInvGlobalMesChange, saveDistSlices, saveKpiHidden, toggleDistEdit, toggleDistKpi, kpiVisible, calcDistBase, buildSmartDefaults, resetDistDefaults, autoBalancePct, renderDistConfig, cycleColor, addDistSlice, removeDistSlice, fetchPrecios, actualizarPreciosDash, setBtcDays, fetchBtcHistorico, renderInvRepo, distRow, distRowUSD, renderDistChart, renderInvDist, getDisponibleDist, getDisponibleLiq, invGetDisponibleActual, invUsarPct, invMostrarPct, invSelFuente, invActualizarCampos, invCalcular, invReset, invGenerar, invRfMes, invRenderHistorial, invActualizarFlotantes, invLiquidarModal, invConfirmarLiquidacion, invEliminar, invAnularModal, invLimpiar, renderInvAll, onInvActivoChange, onInvFuenteChange, buildInvForm, calcInvResult, updInvTicket, limpiarInversiones, rfInvHistMes, renderDashInversiones } from './modules/inversiones.js';
import { destroyCharts, toggleChart, onDashMesChange, calcBalance, renderDash, renderDashFlowChart, setFlowPer } from './modules/dashboard.js';
import { setTP, buildTicketUI, updStockHints, adj, rst, rstDel, gn, resetTodo, getTC, autoFillTC, syncAjuste, getPayment, calc, upd, generarTicket, confirmarDesdeOutput, limpiar } from './modules/ticket.js';
import { xlsxCell, xlsxSetCell, xlsxAoaToSheet, expJSON, expCSV, expXLSX, getStockUmbObj, impJSONFile, hardReset } from './modules/io.js';
import { showInputModal, vTk, vEgr, clM, cpM } from './ui/modal.js';
import { showTab, rfM, uhd, onVentasMesChange, onEgresosMesChange } from './ui/tabs.js';
import { normNombre, getContactos, getContactoById, getHistorialContacto, autoRegistrarContacto, guardarInfoContacto, renderContactos, abrirContacto, volverListaContactos, filtrarContactos, setCtSort, mostrarMigracionContactos, ejecutarMigracionContactos } from './modules/contactos.js';
import { setupDelegation, setupDrop, invSubTab, toggleStockGroup, onVariantInput } from './ui/delegacion.js';
import { getPriceLog, buildPreciosJson, ghSyncCalc, renderPriceAdjust, renderPricePreview, applyPriceFromUI, renderPriceLog, togglePriceLogEntry } from './modules/price-manager.js';
// =====================================================================
// MOTOR EDGE 3.8-E — Sistema dinámico de productos
// =====================================================================

// ── Price shims: inversiones.js sets window._blueARS/window._usdtARS after each fetch ──
// Ticket UI reads these. Use window.* directly for latest values.

// ── COPY ──
function cpTk(){navigator.clipboard.writeText(document.getElementById('tkOut').textContent).then(()=>sN('Ticket copiado'));}
function cpEgr(){navigator.clipboard.writeText(document.getElementById('e-tkOut').textContent).then(()=>sN('Copiado'));}


// ── NOTIF ──

// ── THEME ──
function toggleTheme(){const isLight=document.body.getAttribute('data-theme')==='light';if(isLight)document.body.removeAttribute('data-theme');else document.body.setAttribute('data-theme','light');document.getElementById('themeBtn').textContent=isLight?'🌙':'☀️';localStorage.setItem('me_theme',isLight?'dark':'light');}


// ══════════════════════════════════════════════════════
// STOCK ENGINE
// ══════════════════════════════════════════════════════


// ── INIT ──
initConfigDeps(getProductos, updateClientesDatalist);
loadConfig();

// ── Seed stock inicial (corre una sola vez) ──
function seedStockInicial(){
  const d=ld();
  if(d.stockSeedDone)return; // ya corrió
  const lotes=getLotes();
  const ingresos=getIngresos();
  const ts='2025-01-01T10:00:00.000Z';
  const fecha_display='01/01/2025 10:00';

  // [prodId, qty, costo_unitario, unidad_display]
  const seed=[
    ['v-cal',  700,  5075, 'ud'],   // Calaveras
    ['v-ted',  1400, 5075, 'ud'],   // Teddy
    // Lucky Cat: 0 — no se carga lote vacío
    // Genéricas: 0 — no se carga lote vacío
    ['p-cris', 800,  7975, 'g'],    // Cristales
    ['p-hong', 500,  2000, 'g'],    // Hongos
    ['p-got',  10,   5000, 'ud'],   // Goteros
    ['p-pet',  10,   2000, 'ud'],   // Petri
  ];

  seed.forEach(([pid,qty,costo],seedIdx)=>{
    const mes='202501';
    const nnn=String(seedIdx+1).padStart(4,'0');
    const id='ING-'+mes+'-'+nnn;
    const loteId=id+'-L1';
    if(!lotes[pid])lotes[pid]=[];
    lotes[pid].push({
      id:loteId,ingreso_id:id,fecha:ts,
      qty_inicial:qty,qty_restante:qty,
      costo_unitario:costo,proveedor:'Stock inicial',nota:'Seed automático'
    });
    ingresos.push({
      id,fecha:ts,fecha_display,
      prod_id:pid,qty,costo_unitario:costo,
      total:qty*costo,proveedor:'Stock inicial',
      nota:'Seed automático',lote_id:loteId
    });
  });

  saveLotes(lotes);
  d.ingresos=ingresos;
  d.stockSeedDone=true;
  sd(d);
}
seedStockInicial();
ghInit();
const savedTheme=localStorage.getItem('me_theme');
if(savedTheme==='light'){document.body.setAttribute('data-theme','light');document.getElementById('themeBtn')&&(document.getElementById('themeBtn').textContent='☀️');}
// Apply saved appearance (including theme attribute)
const _savedAp=getApariencia();if(_savedAp)applyApariencia(_savedAp);
document.getElementById('fecha').value=hoy();document.getElementById('e-fecha').value=hoy();
buildTicketUI();upd();rfM();uhd();setInterval(uhd,1000);
document.getElementById('modal').addEventListener('click',function(e){if(e.target===this)clM();});
setupDelegation();setupDrop();

// ── WINDOW EXPOSURE — required for HTML onclick/onchange handlers ──
Object.assign(window, {
  // ticket
  setTP, buildTicketUI, upd, calc, adj, rst, rstDel, resetTodo,
  autoFillTC, syncAjuste, generarTicket, confirmarDesdeOutput, limpiar,
  // ventas
  rH, rS, toggleHistGrp, toggleTotals, bO, anularByIdModal, confirLimpiar,
  openEditVenta, editRecalcTotal, editUpdateEquiv, editSetMode, saveEditVenta,
  // egresos
  sE, updEgreso, generarEgreso, limpiarEgr, limpiarEgresos, rEH, rES, bE,
  openEditEgr, saveEditEgr, anularEgresoByIdModal, renderMPImportModal,
  // dashboard
  renderDash, onDashMesChange, renderDashFlowChart, setFlowPer, setBtcDays,
  fetchBtcHistorico, toggleChart,
  // inversiones
  renderInvAll, renderInvDist, renderInvRepo,
  rfInvM, onInvMesChange, onInvGlobalMesChange, invSelFuente, invSubNav, fetchPrecios,
  actualizarPreciosDash, invActualizarCampos, invCalcular, invGenerar,
  invReset, invLimpiar, invRenderHistorial,
  invLiquidarModal, invConfirmarLiquidacion, invEliminar, invAnularModal,
  invUsarPct, onInvPeriodoChange,
  // liquidez
  renderLiqExterna, registrarLiqExterna, toggleLiqExterna, updLiqPreview,
  setLiqView, saveDistSlices, saveLiqSlices, autoBalancePct, autoBalanceLiq,
  toggleDistEdit, toggleDistKpi, resetDistDefaults, cycleColor, cycleLiqColor,
  addDistSlice, removeDistSlice, addLiqSlice, removeLiqSlice, dLiqExterna,
  // inventario / stock
  renderInventario, renderInventarioTabla, renderInvStock, renderStockHistorial, renderIngresoForm,
  registrarIngreso, ingPreview, limpiarMovsStock,
  abrirLotesPanel, cerrarLotesPanel, renderLotesDetalle,
  generarStockTicket, renderStockEntryForm, eliminarMov,
  // productos
  renderPM, renderMaestra, abrirNuevoProducto, editarProducto,
  guardarProductoModal, toggleActivoProducto, duplicarProducto,
  abrirTramosEnMaestra, guardarTramosYCerrar, guardarMaestra,
  aplicarPctTodos, restablecerTramos, toggleTramoEditor,
  agregarTramo, eliminarTramo, guardarTramos, adjTramoDisc, updTramoDisc,
  addTramoEditor, removeTramoEditor, addVarianteEditor, removeVarianteEditor,
  setProdTipo, onPmListaChange, updModalDiscs,
  // listas de precios
  renderListasPrecios, renderAsignacionPrecios, abrirNuevaLista,
  abrirEditarLista, eliminarLista, renderInvPrecios,
  // io
  expJSON, expCSV, expXLSX, impJSONFile, hardReset,
  // github
  ghSaveToken, ghTestConn, ghPush, ghPull, ghBackupNow, ghListBackups,
  // apariencia
  guardarApariencia, resetApariencia, applyPreset, syncColorFromHex,
  toggleAparienciaAvanzada, loadAparienciaForm, updateThemeCards,
  // settings
  renderSettings,
  // contactos
  getContactos, getContactoById, autoRegistrarContacto, guardarInfoContacto,
  renderContactos, abrirContacto, volverListaContactos, filtrarContactos, setCtSort,
  mostrarMigracionContactos, ejecutarMigracionContactos,
  // price management
  getPriceLog, buildPreciosJson, ghSyncCalc,
  renderPriceAdjust, renderPricePreview, applyPriceFromUI, renderPriceLog, togglePriceLogEntry,
  // tabs / ui
  showTab, rfM, uhd, onVentasMesChange, onEgresosMesChange,
  // modals
  showInputModal, vTk, vEgr, clM, cpM, cpTk, cpEgr,
  confirmarOrden, toggleTheme,
  // stock utils
  getStockUmbObj, guardarUmbralesDesdeTabla, toggleStockGroup,
  onVariantInput, invMostrarPct, sN,
});
