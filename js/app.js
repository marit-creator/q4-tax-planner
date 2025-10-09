// js/app.js — matches your current 4-step HTML

import { computeResults, currency } from './calc_tax.js';
import * as C from './constants.js';

const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

let current = 1;
const totalVisualSteps = 11; // just for the progress label

function showStep(n){
  const steps = $$('.step');
  current = Math.max(1, Math.min(n, steps.length));
  steps.forEach(el => { el.classList.remove('active'); el.setAttribute('hidden',''); });
  const active = document.querySelector(`.step[data-step="${current}"]`);
  if (active){ active.classList.add('active'); active.removeAttribute('hidden'); }
  const bar = $('#bar'), stepText = $('#stepText');
  if (bar) bar.style.width = Math.round((current/totalVisualSteps)*100) + '%';
  if (stepText) stepText.textContent = `Step ${current} of ${totalVisualSteps}`;
}

function getFilingStatus(){
  const r = document.querySelector('input[name="fs"]:checked');
  return r ? r.value : 'single';
}

function syncItemizedVisibility(){
  const sel = $('#deductionType');
  const box = $('#itemizedBox');
  if (!sel || !box) return;
  if (sel.value === 'itemized') box.classList.remove('hide'); else box.classList.add('hide');
}

function handleCalculate(){
  const state = {
    filingStatus: getFilingStatus(),
    deductionType: $('#deductionType')?.value || 'standard',
    itemized: +$('#itemized')?.value || 0,
    wages: +$('#wages')?.value || 0,
    sched_c_profit: +$('#sched_c_profit')?.value || 0,
    other_income: +$('#other_income')?.value || 0,
    ltcg: +$('#ltcg')?.value || 0,
    retirement_contrib: +$('#retirement_contrib')?.value || 0,
    hsa_contrib: +$('#hsa_contrib')?.value || 0
  };

  const r = computeResults(state, C);
  const box = $('#results');
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
  showStep(4);
}

document.addEventListener('DOMContentLoaded', () => {
  // Wire buttons (IDs must match your HTML)
  $('#next1')?.addEventListener('click', () => showStep(2));
  $('#back2')?.addEventListener('click', () => showStep(1));
  $('#next2')?.addEventListener('click', () => showStep(3));
  $('#back3')?.addEventListener('click', () => showStep(2));
  $('#next3')?.addEventListener('click', () => showStep(4));
  $('#back4')?.addEventListener('click', () => showStep(3));
  $('#calcBtn')?.addEventListener('click', (e) => { e.preventDefault(); handleCalculate(); });

  // Deduction dropdown behavior
  $('#deductionType')?.addEventListener('change', syncItemizedVisibility);
  syncItemizedVisibility();

  // Hide all but step 1 and initialize progress
  $$('.step').forEach((el,i)=>{ if(i!==0) el.setAttribute('hidden',''); });
  showStep(1);
});

