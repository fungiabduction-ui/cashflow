import { resetStorage } from './helpers/env.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ld, sd, escrituraBloqueada } from '../core/storage.js';

// Archivo aparte = proceso aparte = módulo recién cargado (la copia es "una vez por carga").
test('si la copia del texto crudo falla por espacio, se bloquea igual', ()=>{
  resetStorage();globalThis.__store.set('motoredge_v4','{roto');
  const orig=localStorage.setItem;
  localStorage.setItem=(k,v)=>{if(k.startsWith('motoredge_v4_corrupt_')){const e=new Error('lleno');e.name='QuotaExceededError';throw e;}orig(k,v);};
  try{assert.deepEqual(ld().orders,[]);}finally{localStorage.setItem=orig;}
  assert.equal(escrituraBloqueada(),true);
  assert.equal(sd({orders:[]}),false);
});
