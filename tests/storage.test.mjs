import { resetStorage, leer, contarEscrituras } from './helpers/env.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ld, sd, escrituraBloqueada, desbloquearEscritura } from '../core/storage.js';

const clavesCorrupt=()=>[...globalThis.__store.keys()].filter(k=>k.startsWith('motoredge_v4_corrupt_'));

test('storage vacío no es corrupción: arranque normal y sd() escribe', ()=>{
  resetStorage();
  assert.deepEqual(ld().orders,[]);
  assert.equal(escrituraBloqueada(),false);
  assert.equal(sd({orders:[{id:'V-1'}],egresos:[]}),true);
  assert.equal(leer().orders[0].id,'V-1');
});
test('sd() devuelve false si setItem tira (storage lleno)', ()=>{
  resetStorage();
  const orig=localStorage.setItem;
  localStorage.setItem=()=>{const e=new Error('lleno');e.name='QuotaExceededError';throw e;};
  try{assert.equal(sd({orders:[]}),false);}finally{localStorage.setItem=orig;}
});
test('JSON corrupto: copia el texto crudo una vez, bloquea y sd() no escribe', ()=>{
  globalThis.__store.clear();globalThis.__store.set('motoredge_v4','{"orders":[ROTO');
  assert.deepEqual(ld().orders,[]);
  ld(); // segunda lectura en la misma carga: no hace otra copia
  assert.equal(escrituraBloqueada(),true);
  const ks=clavesCorrupt();
  assert.equal(ks.length,1);
  assert.match(ks[0],/^motoredge_v4_corrupt_\d{8}-\d{4}$/);
  assert.equal(globalThis.__store.get(ks[0]),'{"orders":[ROTO');
  assert.equal(contarEscrituras(()=>assert.equal(sd({orders:[]}),false)),0);
  assert.equal(globalThis.__store.get('motoredge_v4'),'{"orders":[ROTO'); // intacto
});
test('desbloquearEscritura() levanta el bloqueo', ()=>{
  desbloquearEscritura();
  assert.equal(escrituraBloqueada(),false);
  assert.equal(sd({orders:[],egresos:[]}),true);
  assert.deepEqual(leer().orders,[]);
});

import { restoreBackupPayload } from '../modules/backup.js';
test('restoreBackupPayload levanta el bloqueo y guarda', ()=>{
  globalThis.__store.clear();globalThis.__store.set('motoredge_v4','{roto');
  ld();assert.equal(escrituraBloqueada(),true);
  assert.equal(restoreBackupPayload({orders:[{id:'V-202611-0001'}],egresos:[],priceLog:[]}),1);
  assert.equal(escrituraBloqueada(),false);
  assert.equal(leer().orders[0].id,'V-202611-0001');
});
test('restoreBackupPayload lanza si el guardado falla (no informa éxito)', ()=>{
  resetStorage({orders:[],egresos:[]});
  const orig=localStorage.setItem;
  localStorage.setItem=(k,v)=>{if(k==='motoredge_v4'){const e=new Error('lleno');e.name='QuotaExceededError';throw e;}orig(k,v);};
  try{assert.throws(()=>restoreBackupPayload({orders:[{id:'V-1'}],egresos:[],priceLog:[]}),/No se pudo guardar/);}
  finally{localStorage.setItem=orig;}
});
