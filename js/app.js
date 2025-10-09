// js/app.js — 12-step wizard with Prior-Year Depreciation step

import * as C from './constants.js';
import { computeResults as CT_computeResults, currency as CT_currency } from './calc_tax.js';

const $  = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const money = (n) => (n||0).toLocaleString(undefined,{style:'currency',currency:'USD'});

const taxData = {
  filingStatus: 'single',
  businessType: 'none',
  businessIncome: 0,
  businessExpenses: 0,
  k1Income: 0,
  // NEW:
  priorDepreciation: 0,

  assets: [],
  hasRentals: false,
  numRentals: 0,
  stcg: 0,
  ltcg: 0,
  deductionType: 'standard',
  itemized: 0,
  children: 0,
  estimated: 0,
  wages: 0,
  withheld: 0
};

let current = 1;
const totalSteps = 12;

function showStep(n){
  const steps = $$('.step');
  current = Math.max(1, Math.min(n, steps.length));
  steps.forEach(el => { el.classList.remove('active'); el.setAttribute('hidden',''); });
  const active = document.querySelector(`.step[data-step="${current}"]`);
  if (active) { active.classList.add('active'); active.removeAttribute('hidden'); }
  const bar = $('#bar'), stepText = $('#stepText');
  if (bar) bar.style.width = Math.round((current/totalSteps)*100) + '%';
  if (stepText) stepText.textContent = `Step ${current} of ${totalSteps}`;
}

function nextStep(){
  // Branching same as before, but step numbers shifted
  if (current === 2 && taxData.businessType === 'none') return showStep(6); // skip 3-5
  if (current === 7 && !taxData.hasRentals) return showStep(9); // skip 8
  return showStep(current + 1);
}
function prevStep(){
  if (current === 6 && taxData.businessType === 'none') return showStep(2);
  if (current === 9 && !taxData.hasRentals) return showStep(7);
  return showStep(current - 1);
}

function syncBusinessFields(){
  const type = taxData.businessType;
  $('#schedcBox')?.classList.toggle('hide', !(type==='scheduleC'||type==='both'));
  $('#k1Box')?.classList.toggle('hide', !(type==='k1'||type==='both'));
}
function syncDeductionBox(){
  const isItem = taxData.deductionType === 'itemized';
  $('#itemizedBox')?.classList.toggle('hide', !isItem);
}
function renderAssets(){
  const wrap = $('#assetsList');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (!taxData.assets.length){
    wrap.innerHTML = '<div class="muted">No assets added yet — add your new 2025 purchases to estimate depreciation.</div>';
    return;
  }
  taxData.assets.forEach((a,i)=>{
    const row = document.createElement('div');
    row.className = 'asset-row';
    row.innerHTML = `
      <div>
        <div class="bold">${a.name}</div>
        <div class="muted">${money(a.cost)} • ${a.category} • ${a.businessUse}% use ${a.bonusDepreciation ? '• Bonus' : ''}</div>
      </div>
      <button class="btn danger" data-remove="${i}" type="button">Remove</button>
    `;
    wrap.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // nav wiring (IDs follow new steps)
  $('#next1')?.addEventListener('click', nextStep);
  $('#back2')?.addEventListener('click', prevStep);
  $('#next2')?.addEventListener('click', nextStep);
  $('#back3')?.addEventListener('click', prevStep);
  $('#next3')?.addEventListener('click', nextStep);

  // NEW step 4
  $('#back4')?.addEventListener('click', prevStep);
  $('#next4')?.addEventListener('click', nextStep);

  // assets (now step 5)
  $('#back5')?.addEventListener('click', prevStep);
  $('#next5')?.addEventListener('click', nextStep);

  // wages (step 6)
  $('#back6')?.addEventListener('click', prevStep);
  $('#next6')?.addEventListener('click', nextStep);

  // rentals yes/no (step 7)
  $('#back7')?.addEventListener('click', prevStep);
  $('#next7')?.addEventListener('click', nextStep);

  // rental details (step 8)
  $('#back8')?.addEventListener('click', prevStep);
  $('#next8')?.addEventListener('click', nextStep);

  // capital gains (step 9)
  $('#back9')?.addEventListener('click', prevStep);
  $('#next9')?.addEventListener('click', nextStep);

  // deductions (step 10)
  $('#back10')?.addEventListener('click', prevStep);
  $('#next10')?.addEventListener('click', nextStep);

  // credits/payments (step 11)
  $('#back11')?.addEventListener('click', prevStep);

  // restart
  $('#restart')?.addEventListener('click', () => { showStep(1); window.scrollTo(0,0); });

  // inputs
  $$('input[name="filingStatus"]').forEach(r => r.addEventListener('change', e => taxData.filingStatus = e.target.value));
  $$('input[name="businessType"]').forEach(r => r.addEventListener('change', e => { taxData.businessType = e.target.value; syncBusinessFields(); }));
  $('#businessIncome')?.addEventListener('input', e => taxData.businessIncome = +e.target.value || 0);
  $('#businessExpenses')?.addEventListener('input', e => taxData.businessExpenses = +e.target.value || 0);
  $('#k1Income')?.addEventListener('input', e => taxData.k1Income = +e.target.value || 0);

  // NEW: prior-year depreciation
  $('#priorDep')?.addEventListener('input', e => taxData.priorDepreciation = +e.target.value || 0);

  // assets
  $('#addAsset')?.addEventListener('click', () => {
    const name = $('#asset_name')?.value?.trim();
    const cost = +$('#asset_cost')?.value || 0;
    const category = $('#asset_cat')?.value || '5-year';
    const businessUse = +$('#asset_use')?.value || 0;
    const bonusDepreciation = !!$('#asset_bonus')?.checked;
    if (!name || cost <= 0) return;
    taxData.assets.push({ name, cost, category, businessUse, bonusDepreciation });
    renderAssets();
    $('#asset_name').value=''; $('#asset_cost').value='0'; $('#asset_cat').value='5-year'; $('#asset_use').value='100'; $('#asset_bonus').checked=false;
  });
  $('#assetsList')?.addEventListener('click', (e) => {
    const idx = e.target?.dataset?.remove;
    if (idx!=null){ taxData.assets.splice(+idx,1); renderAssets(); }
  });

  $('#wages')?.addEventListener('input', e => taxData.wages = +e.target.value || 0);
  $('#withheld')?.addEventListener('input', e => taxData.withheld = +e.target.value || 0);

  $$('input[name="hasRentals"]').forEach(r => r.addEventListener('change', e => taxData.hasRentals = (e.target.value === 'true')));
  $('#numRentals')?.addEventListener('input', e => taxData.numRentals = +e.target.value || 0);

  $('#stcg')?.addEventListener('input', e => taxData.stcg = +e.target.value || 0);
  $('#ltcg')?.addEventListener('input', e => taxData.ltcg = +e.target.value || 0);

  $$('input[name="deductionType"]').forEach(r => r.addEventListener('change', e => { taxData.deductionType = e.target.value; syncDeductionBox(); }));
  $('#itemized')?.addEventListener('input', e => taxData.itemized = +e.target.value || 0);

  $('#children')?.addEventListener('input', e => taxData.children = +e.target.value || 0);
  $('#estimated')?.addEventListener('input', e => taxData.estimated = +e.target.value || 0);

  // calculate
  $('#calcBtn')?.addEventListener('click', () => {
    renderResults();
    showStep(12);
    window.scrollTo(0,0);
  });

  // init
  syncBusinessFields();
  syncDeductionBox();
  renderAssets();
  $$('.step').forEach((el,i)=>{ if(i!==0) el.setAttribute('hidden',''); });
  showStep(1);
});

// ---- results (uses your calc_tax.js if available) ----
function safeComputeResults(state){
  try {
    if (typeof CT_computeResults === 'function' && typeof CT_currency === 'function'){
      return { result: CT_computeResults(toLegacyInputs(state), C), fmt: CT_currency };
    }
  } catch(_) {}
  // fallback
  const scProfit = Math.max(0,(state.businessIncome||0)-(state.businessExpenses||0) - (state.priorDepreciation||0));
  const totalIncome = (state.wages||0) + scProfit + (state.k1Income||0) + (state.stcg||0) + (state.ltcg||0);
  const std = (C.standardDeductions2025?.[toLegacyFS(state.filingStatus)] ?? 0);
  const deduction = state.deductionType==='itemized' ? (state.itemized||0) : std;
  const taxableOrdinary = Math.max(0, totalIncome - deduction);
  const regularTax = Math.round(taxableOrdinary * 0.12);
  const seTax = Math.round(Math.max(0, scProfit) * 0.153 * 0.9235);
  const totalTax = regularTax + seTax;
  const agi = totalIncome;
  const currency = (n)=> (n||0).toLocaleString(undefined,{style:'currency',currency:'USD'});
  return { result:{agi, deduction, taxableOrdinary, regularTax, seTax, totalTax, effectiveRate: agi? (totalTax/agi*100):0}, fmt: currency };
}

function toLegacyFS(fs){
  if (fs==='marriedJoint') return 'mfj';
  if (fs==='marriedSeparate') return 'mfs';
  if (fs==='headOfHousehold') return 'hoh';
  return 'single';
}
function toLegacyInputs(s){
  // pass priorDepreciation into sched_c_profit via reduction
  const schedCProfit = Math.max(0,(s.businessIncome||0)-(s.businessExpenses||0)-(s.priorDepreciation||0));
  return {
    filingStatus: toLegacyFS(s.filingStatus),
    deductionType: s.deductionType,
    itemized: s.itemized,
    wages: s.wages,
    sched_c_profit: schedCProfit,
    other_income: (s.k1Income||0) + (s.stcg||0),
    ltcg: s.ltcg,
    retirement_contrib: 0,
    hsa_contrib: 0
  };
}

function renderResults(){
  const { result: r, fmt } = safeComputeResults(taxData);
  const box = $('#results');
  box.innerHTML = `
    <div class="grid">
      <div><div class="muted">Adjusted Gross Income</div><div class="big">${fmt(r.agi)}</div></div>
      <div><div class="muted">Taxable Ordinary</div><div class="big">${fmt(r.taxableOrdinary||0)}</div></div>
      <div><div class="muted">Regular Tax</div><div class="big">${fmt(r.regularTax||0)}</div></div>
      <div><div class="muted">Self-employment Tax</div><div class="big">${fmt(r.seTax||0)}</div></div>
      <div><div class="muted">Total Estimated Tax</div><div class="big">${fmt(r.totalTax||0)}</div></div>
      <div><div class="muted">Effective Rate</div><div class="big">${(r.effectiveRate||0).toFixed(2)}%</div></div>
    </div>
    <div class="muted" style="margin-top:8px">* Planning estimate only — not individualized tax advice.</div>
  `;
}
