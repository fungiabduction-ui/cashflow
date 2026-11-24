import { resetStorage } from './helpers/env.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nId, nEId, newIngresoId, invNuevoId } from '../core/ids.js';
import { hoy, d2m } from '../core/formatters.js';

test('ventas y egresos: Math.max del mes, no conteo (hueco por eliminación)', ()=>{
  resetStorage({orders:[{id:'V-202611-0001'},{id:'V-202611-0005'},{id:'V-202610-0009'}],
    egresos:[{id:'E-202611-0003'}]});
  assert.equal(nId('202611'),'V-202611-0006');
  assert.equal(nId('202612'),'V-202612-0001');
  assert.equal(nEId('202611'),'E-202611-0004');
});
test('ingresos e inversiones: Math.max del mes', ()=>{
  const mes=d2m(hoy());
  resetStorage({orders:[],egresos:[],ingresos:[{id:`ING-${mes}-0002`},{id:`ING-${mes}-0007`}],
    inversiones:[{id:'I-202611-0004',mesActual:'202611'},{id:'I-202611-0001',mesActual:'202611'}]});
  assert.equal(newIngresoId(),`ING-${mes}-0008`);
  assert.equal(invNuevoId('202611'),'I-202611-0005');
});
