import test from 'node:test';
import assert from 'node:assert/strict';
import { CASES, calculate } from '../chemistry.js';
test('four experiments conserve matter and use the limiting reagent',()=>{
  const expected = [0.2,0.4,0.6,0.4];
  CASES.forEach(([a,b],i)=>{
    const r=calculate(a,b);
    assert.ok(Math.abs(r.reactedMmol-expected[i])<1e-12);
    assert.ok(Math.abs(r.heatJ-expected[i]*57.3)<1e-10);
    assert.ok(Math.abs(r.deltaC-r.heatJ/(12*4.18))<1e-12);
    assert.ok(Math.abs(r.excessMmol-Math.abs(a-b)*.1)<1e-12);
  });
});
test('equivalence maximizes heat; excess acid/base sets pH',()=>{
  assert.equal(calculate(6,6).pH,7);
  assert.equal(calculate(2,10).state,'염기성');
  assert.equal(calculate(8,4).state,'산성');
  assert.ok(calculate(6,6).deltaC>calculate(4,8).deltaC);
  assert.equal(calculate(4,8).deltaC,calculate(8,4).deltaC);
  assert.ok(Math.abs(calculate(4,8).pH+calculate(8,4).pH-14)<1e-12);
});
test('initial temperature shifts final temperature without changing heat',()=>{
  const a=calculate(6,6,15), b=calculate(6,6,30);
  assert.ok(Math.abs(b.finalC-a.finalC-15)<1e-12);
  assert.equal(a.heatJ,b.heatJ);
  assert.throws(()=>calculate(0,0),RangeError);
});
