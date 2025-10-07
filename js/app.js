// app.js – controls wizard flow and connects to tax logic

import { computeResults, currency } from './calc_tax.js';
import * as C from './constants.js';

// === Step control ===
let currentStep = 1;
const totalSteps = 3;

function showStep(step) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.querySelector(`.step[data-step="${step}"]`).classList.add('active');
  document.getElementById('bar').style.width = `${(step / totalSteps) * 100}%`;
}

// === Navigation buttons ===
document.addEventListener('click', e => {
  if (e.target.id.startsWith('next')) {
    currentStep = Math.min(totalSteps, currentStep + 1);
    showStep(currentStep);
  }
  if (e.target.id.startsWith('back')) {
    currentStep = Math.max(1, currentStep - 1);
    showStep(currentStep);
  }
  if (e.target.id === 'calcBtn') {
    handleCalculate();
  }
});

function handleCalculate() {
  const inputs = {
    filingStatus: document.getElementById('filingStatus').value,
    deductionType: document.getElementById('deductionType').value,
    wages: +document.getElementById('wages').value || 0,
    sched_c_profit: +document.getElementById('sched_c_profit').value || 0,
    other_income: +document.getElementById('other_income').value || 0,
    ltcg: +document.getElementById('ltcg').value || 0,
    itemized: +document.getElementById('itemized').value || 0,
    retirement_contrib: +document.getElementById('retirement_contrib').value || 0,
    hsa_contrib: +document.getElementById('hsa_contrib').value || 0,
  };

  const results = computeResults(inputs, C);
  displayResults(results);
}

function displayResults(results) {
  const box = document.getElementById('results');
  box.style.display = 'block';
  box.innerHTML = `
    <h3>Estimated 2025 Federal Tax Summary</h3>
    <div class="row"><strong>Total Income:</strong><span>${currency(results.totalIncome)}</span></div>
    <div class="row"><strong>Taxable Income:</strong><span>${currency(results.taxableIncome)}</span></div>
    <div class="row"><strong>Estimated Tax:</strong><span>${currency(results.totalTax)}</span></div>
    <div class="row"><strong>Effective Rate:</strong><span>${results.effectiveRate.toFixed(2)}%</span></div>
  `;
  currentStep = totalSteps;
  showStep(currentStep);
}

// === Init ===
document.addEventListener('DOMContentLoaded', () => showStep(1));
