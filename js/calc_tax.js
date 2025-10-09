// js/calc_tax.js — temporary working stub so app.js can load correctly

// Format numbers as US currency
export function currency(n) {
  return (n || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  });
}

// Basic placeholder tax calculation logic
export function computeResults(s, C) {
  const totalIncome =
    (Number(s.wages) || 0) +
    (Number(s.sched_c_profit) || 0) +
    (Number(s.other_income) || 0) +
    (Number(s.ltcg) || 0);

  const std = (C.standardDeductions2025?.[s.filingStatus] ?? 0);
  const deduction =
    s.deductionType === 'itemized'
      ? Number(s.itemized) || 0
      : std;

  const taxableOrdinary = Math.max(0, totalIncome - deduction);
  const regularTax = Math.round(taxableOrdinary * 0.12); // Placeholder 12%
  const seTax = Math.round((Number(s.sched_c_profit) || 0) * 0.153 * 0.9235); // Approx. SE tax
  const totalTax = regularTax + seTax;
  const agi = totalIncome;

  return {
    agi,
    totalIncome,
    deduction,
    taxableOrdinary,
    regularTax,
    seTax,
    totalTax,
    effectiveRate: totalIncome
      ? (totalTax / totalIncome) * 100
      : 0,
  };
}
