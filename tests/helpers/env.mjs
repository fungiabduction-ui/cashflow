// tests/helpers/env.mjs — importar ANTES que cualquier módulo fuente.
// localStorage en memoria y stubs mínimos de window/document: los tests nunca tocan datos del navegador.
const store=new Map();
const ls={
  getItem:k=>store.has(k)?store.get(k):null,
  setItem:(k,v)=>{store.set(k,String(v));},
  removeItem:k=>{store.delete(k);},
  clear:()=>store.clear(),
};
Object.defineProperty(globalThis,'localStorage',{value:ls,configurable:true,writable:true});
const el=()=>({textContent:'',innerHTML:'',value:'',style:{},className:'',disabled:false,
  classList:{add(){},remove(){},toggle(){},contains:()=>false},
  appendChild(){},remove(){},querySelector:()=>null,querySelectorAll:()=>[]});
globalThis.document={getElementById:()=>el(),querySelector:()=>null,querySelectorAll:()=>[],createElement:()=>el()};
globalThis.window=globalThis;
globalThis.confirm=()=>true;
export function resetStorage(data){store.clear();if(data)store.set('motoredge_v4',JSON.stringify(data));}
export function leer(){return JSON.parse(store.get('motoredge_v4'));}
// Cuenta escrituras de motoredge_v4 durante fn()
export function contarEscrituras(fn){
  let n=0;const orig=ls.setItem;
  ls.setItem=(k,v)=>{if(k==='motoredge_v4')n++;orig(k,v);};
  try{fn();}finally{ls.setItem=orig;}
  return n;
}
