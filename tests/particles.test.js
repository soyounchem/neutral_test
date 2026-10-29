import test from 'node:test';
import assert from 'node:assert/strict';
import { CASES } from '../chemistry.js';
import { particleFrame } from '../particles.js';
for (const [acid, base] of CASES) {
  test(`${acid}/${base}: each ion pair reacts and excess/spectator ions persist`, () => {
    const start = particleFrame(acid, base, 0);
    assert.equal(start.length, 24);
    const final = particleFrame(acid, base, 1);
    const count = label => final.filter(p => p.label === label).length;
    assert.equal(count('H₂O'), Math.min(acid, base));
    assert.equal(count('H⁺'), Math.max(acid - base, 0));
    assert.equal(count('OH⁻'), Math.max(base - acid, 0));
    assert.equal(count('Na⁺'), base);
    assert.equal(count('Cl⁻'), acid);
    const spectators = frame => frame.filter(p => p.id.startsWith('spectator-'));
    assert.deepEqual(spectators(start), spectators(final));
    for (const progress of [0, .25, .5, .75, 1]) {
      const frame = particleFrame(acid, base, progress);
      assert.equal(new Set(frame.map(p => p.id)).size, frame.length);
      assert.ok(frame.every(p => Number.isFinite(p.x) && Number.isFinite(p.y)));
    }
  });
}
