import { CASES, calculate } from './chemistry.js';
import { particleFrame } from './particles.js';
const $ = id => document.getElementById(id);
let selected = 2, progress = 0, animation = null;
const colors = { 'H⁺': '#db9b5d', 'OH⁻': '#7aa6c6', 'H₂O': '#70ac89', 'Na⁺': '#abbdb2', 'Cl⁻': '#abbdb2' };
const fmt = n => n.toFixed(2);
function current() { return calculate(...CASES[selected], Number($('initial').value)); }
$('case-buttons').innerHTML = CASES.map(([a,b],i)=>`<button class="case" data-case="${i}" aria-pressed="false"><small>실험 0${i+1}</small>${a} / ${b} mL</button>`).join('');
function drawParticles(t) {
  const particles = particleFrame(...CASES[selected], progress);
  $('particles').innerHTML = particles.map(({ id, label, x, y }, i) => {
    const wobble = progress > 0 && progress < 1 ? Math.sin(t / 700 + i) * 2 : 0;
    return `<g data-particle="${id}" data-label="${label}" transform="translate(${x + wobble},${y})"><circle r="16" fill="${colors[label]}" opacity=".22"/><text text-anchor="middle" dominant-baseline="central" fill="${colors[label]}" font-size="12" font-weight="600">${label}</text></g>`;
  }).join('');
}
function drawChart(initial, delta) {
  const points = Array.from({length:61},(_,i)=>{const p=i/60;return `${26+p*240},${115-p*delta*85}`;});
  const count = Math.floor(progress*60)+1;
  $('chart').innerHTML = [0,.5,1].map(v=>`<line x1="26" y1="${115-v*85}" x2="266" y2="${115-v*85}" stroke="#e9eeea" stroke-dasharray="3 4"/><text x="0" y="${118-v*85}" font-size="8" fill="#98a99b">${(initial+v).toFixed(1)}</text>`).join('') + `<text x="26" y="138" font-size="8" fill="#98a99b">0%</text><text x="244" y="138" font-size="8" fill="#98a99b">100%</text><polyline fill="none" stroke="#4a8a65" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${points.slice(0,count).join(' ')}"/>`;
}
function render(t=0) {
  const r=current(), thermal=progress, initial=Number($('initial').value);
  $('temperature').textContent=fmt(initial+r.deltaC*thermal);
  $('rise').textContent=`+${fmt(r.deltaC*thermal)} °C`;
  $('mercury').style.height=`${15+(initial+r.deltaC*thermal-15)*4}%`;
  $('heat').textContent= progress ? `${fmt(r.heatJ*progress)} J` : '—';
  $('water').textContent=progress ? `${fmt(r.reactedMmol*progress)} mmol` : '—';
  $('state').textContent=progress===1 ? r.state : '—';
  $('ph').textContent=progress===1 ? fmt(r.pH) : '—';
  drawParticles(t); drawChart(initial,r.deltaC);
}
function reset() {
  cancelAnimationFrame(animation); animation=null; progress=0;
  $('start').disabled=false; $('start').textContent='▶  용액 혼합하기';
  $('status').textContent='혼합 전'; $('solution').classList.remove('mixed');
  $('reaction-caption').textContent='조합을 선택하거나 혼합 버튼을 눌러 반응을 시작하세요.';
  $('initial-value').textContent=`${$('initial').value} °C`;
  const [a,b]=CASES[selected]; $('acid-volume').textContent=`${a} mL`; $('base-volume').textContent=`${b} mL`;
  document.querySelectorAll('.case').forEach((button,i)=>{button.classList.toggle('active',i===selected);button.setAttribute('aria-pressed',String(i===selected));});
  $('comparison').innerHTML=CASES.map(([a,b],i)=>{const r=calculate(a,b);return `<tr class="${i===selected?'selected':''}"><td>실험 0${i+1}</td><td>${a} mL / ${b} mL</td><td>${fmt(r.reactedMmol)} mmol</td><td>${fmt(r.heatJ)} J</td><td><strong>+${fmt(r.deltaC)} °C</strong></td><td><span class="pill">${r.state}</span></td></tr>`;}).join('');
  render();
}
$('case-buttons').addEventListener('click',event=>{const button=event.target.closest('[data-case]');if(button){selected=Number(button.dataset.case);reset();startReaction();}});
$('initial').addEventListener('input',reset); $('reset').addEventListener('click',reset);
function startReaction() {
  cancelAnimationFrame(animation); progress=0; $('start').disabled=true; $('status').textContent='반응 중'; $('solution').classList.add('mixed');
  $('reaction-caption').textContent='H⁺와 OH⁻가 만나 물이 생성되고 열이 발생합니다.';
  const begin=performance.now(), duration=matchMedia('(prefers-reduced-motion: reduce)').matches?1:4200;
  function tick(now){progress=Math.min((now-begin)/duration,1);render(now);
    if(progress<1) animation=requestAnimationFrame(tick);
    else {const r=current();$('status').textContent='반응 완료';$('start').disabled=false;$('start').textContent='▶  다시 혼합하기';$('reaction-caption').textContent=r.state==='중성'?'H⁺와 OH⁻가 모두 반응했습니다. Na⁺와 Cl⁻는 용액에 남습니다.':`${r.state==='산성'?'H⁺':'OH⁻'} ${fmt(r.excessMmol)} mmol이 남습니다. Na⁺와 Cl⁻는 반응에 참여하지 않습니다.`;}
  } animation=requestAnimationFrame(tick);
}
$('start').addEventListener('click', startReaction);
reset();
