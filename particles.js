// One displayed ion represents 0.1 mmol. Stable identities keep excess ions
// and spectator ions visible while each reacting pair approaches its midpoint.
export function particleFrame(acidMl, baseMl, progress) {
  const fraction = Math.max(0, Math.min(1, progress));
  const pairs = Math.min(acidMl, baseMl);
  const particles = [];
  const add = (id, label, x, y) => particles.push({ id, label, x, y });
  for (let i = 0; i < pairs; i++) {
    const x = 45 + (i % 4) * 120;
    const y = 40 + Math.floor(i / 4) * 65;
    const phase = Math.max(0, Math.min(1, fraction * 1.6 - i / pairs * .6));
    if (phase >= 1) add(`water-${i}`, 'H₂O', x, y);
    else {
      add(`acid-${i}`, 'H⁺', x - 23 * (1 - phase), y - 13 * (1 - phase));
      add(`base-${i}`, 'OH⁻', x + 23 * (1 - phase), y + 13 * (1 - phase));
    }
  }
  for (let i = 0; i < Math.abs(acidMl - baseMl); i++) {
    add(`excess-${i}`, acidMl > baseMl ? 'H⁺' : 'OH⁻', 28 + i * 57, 125);
  }
  for (let i = 0; i < acidMl + baseMl; i++) {
    add(`spectator-${i}`, i < baseMl ? 'Na⁺' : 'Cl⁻', 28 + (i % 6) * 80, 168 + Math.floor(i / 6) * 32);
  }
  return particles;
}
