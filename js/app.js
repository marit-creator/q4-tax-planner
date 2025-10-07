import { computeResults, currency } from './calc_tax.js';
import * as C from './constants.js';

const totalSteps = 11; // visual only for now
let current = 1;

const bar = document.getElementById('bar');
const stepText = document.getElementById('stepText');

function showStep(n){
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.querySelector(`.step[data-step="${n}"]`)?.classList.add('active');
  current = n;
  bar.style.width = Math.round((current/totalSteps)*100)+'%';
  if (stepText) stepText.textContent = `Step ${current} of ${totalSteps}`;
}

// map radio “fs” to filingStatus
function getFilingStatus(){
  const checked = document.querySelector('input[name="fs"]:checked');
  return checked ? checked.value : 'single';
}

// Navigation wiring
document.getElementById('next1')?.addEventListener('click', () => showStep(2));
document.getElementById('back2')?.addEventListener('click', () => showStep(1));
document.getElementById('next2')?.addEventListener('click', () => showStep(3));
document.getElementById('back3')?.addEventListener('click', () => showStep(2));

document.getElementById('calcBtn')?.addEventListener('click', () => {
  const state = {
    filingStatus: getFilingStatus(),
    deductionType: document.getElementById('deductionType').value,
    wages: +document.getElementById('wages').value || 0,
    sched_c_profit: +document.getElementById('sched_c_profit').value || 0,
    other_income: +document.getElementById('other_income').value || 0,
    ltcg: +document.getElementById('ltcg').value || 0,
    itemized: +document.getElementById('itemized').value || 0,
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
  showStep(3); // keep bar near the end
});

// init
document.addEventListener('DOMContentLoaded', () => showStep(1));


