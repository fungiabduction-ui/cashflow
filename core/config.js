import { ld } from './storage.js';
import { DPT, DCT, DHT, DGP, DPP, DCOSTS } from './constants.js';

export let PT, CT, HT, GP, PP, COSTS;

// Dependency injection — set these before calling loadConfig()
let _getProductos = () => [];
let _updateClientesDatalist = () => {};

export function initConfigDeps(getProductosFn, updateClientesFn) {
  _getProductos = getProductosFn;
  _updateClientesDatalist = updateClientesFn;
}

export function loadConfig(){
  const d=ld();
  if(d.precios){PT=d.precios.PT||DPT.map(x=>({...x}));CT=d.precios.CT||DCT.map(x=>({...x}));HT=d.precios.HT||DHT.map(x=>({...x}));GP=d.precios.GP||DGP;PP=d.precios.PP||DPP;}
  else{PT=DPT.map(x=>({...x}));CT=DCT.map(x=>({...x}));HT=DHT.map(x=>({...x}));GP=DGP;PP=DPP;}
  COSTS=d.costos||{...DCOSTS};
  // Sync PT/CT/HT from product catalog if available
  const prods=_getProductos();
  // Sync PT from first active pastilla (calaveras)
  const calp=prods.find(p=>p.id==='v-cal');if(calp&&calp.tramos)PT=calp.tramos;
  const cp=prods.find(p=>p.id==='p-cris');if(cp&&cp.tramos)CT=cp.tramos;
  const hp=prods.find(p=>p.id==='p-hong');if(hp&&hp.tramos)HT=hp.tramos;
  const gp=prods.find(p=>p.id==='p-got');if(gp&&gp.tramos&&gp.tramos[0])GP=gp.tramos[0].p;
  const petp=prods.find(p=>p.id==='p-pet');if(petp&&petp.tramos&&petp.tramos[0])PP=petp.tramos[0].p;
  // Sync COSTS from catalog
  prods.forEach(p=>{if(p.legacyKey&&p.costo!=null){if(p.legacyKey==='calaveras'||p.id==='p-past')COSTS.past=p.costo;else if(p.legacyKey==='cristales')COSTS.cris=p.costo;else if(p.legacyKey==='hongos')COSTS.hong=p.costo;else if(p.legacyKey==='goteros')COSTS.got=p.costo;else if(p.legacyKey==='petri')COSTS.pet=p.costo;}});
  _updateClientesDatalist();
}
