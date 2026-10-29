export const CASES = [[2, 10], [4, 8], [6, 6], [8, 4]];
export function calculate(acidMl, baseMl, initialC = 22) {
  if (![acidMl, baseMl, initialC].every(Number.isFinite) || acidMl < 0 || baseMl < 0 || acidMl + baseMl === 0) throw new RangeError('올바른 부피와 온도를 입력하세요.');
  const acidMmol = acidMl * 0.1;
  const baseMmol = baseMl * 0.1;
  const reactedMmol = Math.min(acidMmol, baseMmol);
  const heatJ = reactedMmol * 57.3;
  const deltaC = heatJ / ((acidMl + baseMl) * 4.18);
  const excessMmol = Math.abs(acidMmol - baseMmol);
  const excessM = excessMmol / (acidMl + baseMl);
  const pH = excessM < 1e-12 ? 7 : acidMl > baseMl ? -Math.log10(excessM) : 14 + Math.log10(excessM);
  return {acidMmol, baseMmol, reactedMmol, heatJ, deltaC, finalC: initialC + deltaC, excessMmol, pH, state: acidMl === baseMl ? '중성' : acidMl > baseMl ? '산성' : '염기성'};
}
