// js/app.js — minimal wizard controller + results rendering

import { computeResults, currency } from './calc_tax.js';
import * as C from './constants.js';

// --- Wizard paging ---
const totalSteps = 11;       // visual only (we'll add more steps later)
let current = 1;

function showStep(n) {
  current = n;
  // hide all steps, show only the requested one
  document.querySelectorAll('.step').forEach((el) => {
    el.classList.remove('active');
    el.toggleAttribute('hidden', true);
  });
  const active = document.querySelector(`.step[data-step="${current}"]`);
  if (active) {
    active.classList.add('active');
    active.removeAttribute('hidden');
  }
  // progress + "Step X of 11"
  const bar = document.getElementById('bar');
  const stepText = document.getElementById('stepText');
  if (bar) bar.style.width = Math.round((current / totalSteps) * 100) + '%';
  if (stepText) stepText.textContent = `Step ${current} of ${totalSteps}`;
}

// --- Wire the buttons ---
// These IDs must exist in index.html
document.addEventListener('click', (e) => {
  const id = e.target.id;
  if (!id) return;

  if (id === 'next1') { e.preventDefault(); showStep(2); }
  if (id === 'back2') { e.preventDefault(); showStep(1); }
  if (id === 'next2') { e.preventDefault(); showStep(3); }
  if (id === 'back3') { e.preventDefault(); showStep(2); }
  if (id === 'calcBtn') { e.preventDefault(); handleCalculate(); }
});

// --- Gather inputs and compute ---
function getFilingStatus() {
  const r = document.querySelector('input[name="fs"]:checked');
  return r ? r.value : 'single';
}

function handleCalculate() {
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

  // keep the bar near the end
  showStep(3);
}

// --- Start on step 1 ---
document.addEventListener('DOMContentLoaded', () => {
  // ensure all non-active steps hidden on first load
  document.querySelectorAll('.step').forEach((el) => {
    if (!el.classList.contains('active')) el.setAttribute('hidden', '');
  });
  showStep(1);
});
