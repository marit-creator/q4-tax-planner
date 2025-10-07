import { computeResults, currency } from './calc_tax.js';
import * as C from './constants.js';

let current = 1;
const totalSteps = 11; // visual count; we'll add more pages later

const stepEls = () => Array.from(document.querySelectorAll('.step'));
const bar = () => document.getElementById('bar');
const stepText = () => document.getElementById('stepText');

function showStep(n){
  current = Math.max(1, Math.min(n, stepEls().length));
  stepEls().forEach(el => { el.classList.remove('active'); el.setAttribute('hidden',''); });
  const active = document.querySelector(`.step[data-step="${current}"]`);
  if (active){ active.classList.add('active'); active.removeAttribute('hidden'); }
  if (bar()) bar().style.width = Math.round((current/totalSteps)*100) + '%';
  if (stepText()) stepText().textContent = `Step ${current} of ${totalSteps}`;
}

// Deduction UI behavior
function syncItemizedVisibility(){
  const sel = document.getElementById('deductionType');
  const box = document.getElementById('itemizedBox');
  if (!sel || !box) return;
  if (sel.value === 'itemized') box.classList.remove('hide'); else box.classList.add('hide');
}

// nav events (event delegation)
document.addEventListener('click', (e) => {
  const id = e.target.id;
  if (!id) return;

  if (id === 'next1') { e.preventDefault(); showStep(2); }
  if (id === 'back2') { e.preventDefault(); showStep(1); }
  if (id === 'next2') { e.preventDefault(); showStep(3); }
  if (id === 'back3') { e.preventDefault(); showStep(2); }
  if (id === 'next3') { e.preventDefault(); showStep(4); }
  if (id === 'back4') { e.preventDefault(); showStep(3); }
  if (id === 'calcBtn') { e.preventDefault(); handleCalculate(); }
});

// react to deduction change
document.addEventListener('change', (e) => {
  if (e.target.id === 'deductionType') syncItemizedVisibility();
});

function getFilingStatus(){
  const r = document.querySelector('input[name="fs"]:checked');
  return r ? r.value : 'single';
}

function handleCalculate(){
  const state = {
    filingStatus: getFilingStatus(),
    deductionType: document.getElementById('deductionType').value,
    itemized: +document.getElementById('itemized')?.value || 0,

    wages: +document.getElementById('wages').value || 0,
    sched_c_profit: +document.getElementById('sched_c_profit').value || 0,
    other_income: +document.getElementById('other_income').value || 0,
    ltcg: +document.getElementById('ltcg').value || 0,

    retirement_contrib: +document.getElementById('retirement_contrib').value || 0,
    hsa_contrib: +document.getElementById('hsa_contrib').value || 0
  };

  const r = computeResults(state, C);
  const box = document.getElementById('results');
  box.style.display = 'block';
  box.innerHTML = `
    <h3>Estimated 2025 Federal Tax Summary</h3>
    <div class="row"><div>AGI</div><div><strong>${currency(r.agi)}</strong></div></div>
    <div class="row"><div>Deduction used</div><div>${currency(r.deduction)}</div></div>
    <div class="row"><div>Taxable ordinary</div><div>${currency(r.taxableOrdinary)}</div></div>
    <div class="row"><div>Regular tax</div><div>${currency(r.regularTax)}</div></div>
    <div class="row"><div>Self-employment tax</div><div>${currency(r.seTax)}</div></div>
    <div class="row"><div><strong>Total estimated tax</strong></div><div><strong>${currency(r.totalTax)}</strong></div></div>
  `;
  showStep(4); // keep bar near end
}

// init
document.addEventListener('DOMContentLoaded', () => {
  // hide all but step 1
  stepEls().forEach((el, i) => { if (i!==0) el.setAttribute('hidden',''); });
  syncItemizedVisibility();
  showStep(1);
});

