// --- DOM references ---
const totalRevenueInput = document.getElementById('totalRevenue');
const avgOrderValueInput = document.getElementById('avgOrderValue');
const leadResponseRateInput = document.getElementById('leadResponseRate');
const prospectResponseRateInput = document.getElementById('prospectResponseRate');
const leadResponseRateValue = document.getElementById('leadResponseRateValue');
const prospectResponseRateValue = document.getElementById('prospectResponseRateValue');

const prospectsValueEl = document.getElementById('prospectsValue');
const leadsValueEl = document.getElementById('leadsValue');
const customersValueEl = document.getElementById('customersValue');

const prospectsPercentEl = document.getElementById('prospectsPercent');
const leadsPercentEl = document.getElementById('leadsPercent');
const customersPercentEl = document.getElementById('customersPercent');

const prospectsFillEl = document.getElementById('prospectsFill');
const leadsFillEl = document.getElementById('leadsFill');
const customersFillEl = document.getElementById('customersFill');

// --- Core formulas (per task hints) ---
// Customers = Revenue / Avg Order Value
// Leads = Customers * 100 / Lead Response Rate
// Prospects = Leads * 100 / Prospect Response Rate
function calculate() {
  const revenue = parseFloat(totalRevenueInput.value) || 0;
  const avgOrderValue = parseFloat(avgOrderValueInput.value) || 1; // avoid /0
  const leadRate = parseFloat(leadResponseRateInput.value) || 1;
  const prospectRate = parseFloat(prospectResponseRateInput.value) || 1;

  const customers = revenue / avgOrderValue;
  const leads = (customers * 100) / leadRate;
  const prospects = (leads * 100) / prospectRate;

  return { customers, leads, prospects };
}

function updateStatsUI({ customers, leads, prospects }) {
  prospectsValueEl.textContent = Math.round(prospects);
  leadsValueEl.textContent = Math.round(leads);
  customersValueEl.textContent = Math.round(customers);

  // Prospects is always the top of the funnel = 100%
  const leadsPercent = prospects > 0 ? (leads / prospects) * 100 : 0;
  const customersPercent = prospects > 0 ? (customers / prospects) * 100 : 0;

  prospectsPercentEl.textContent = '100%';
  leadsPercentEl.textContent = leadsPercent.toFixed(0) + '%';
  customersPercentEl.textContent = customersPercent.toFixed(0) + '%';

  prospectsFillEl.style.width = '100%';
  leadsFillEl.style.width = leadsPercent + '%';
  customersFillEl.style.width = customersPercent + '%';
}

function updateSliderLabels() {
  leadResponseRateValue.textContent = parseFloat(leadResponseRateInput.value).toFixed(2) + '%';
  prospectResponseRateValue.textContent = parseFloat(prospectResponseRateInput.value).toFixed(2) + '%';
}

function recalculateAll() {
  updateSliderLabels();
  const results = calculate();
  updateStatsUI(results);
}

// --- Wire up events ---
[
  totalRevenueInput,
  avgOrderValueInput,
  leadResponseRateInput,
  prospectResponseRateInput
].forEach(input => input.addEventListener('input', recalculateAll));

// initial render
recalculateAll();