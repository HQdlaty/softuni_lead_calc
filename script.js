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

// --- Monthly chart (linear ramp from month 1 to campaign totals) ---
const campaignStartInput = document.getElementById('campaignStart');
const campaignEndInput = document.getElementById('campaignEnd');

function getMonthCount() {
  const start = new Date(campaignStartInput.value);
  const end = new Date(campaignEndInput.value);
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(1, months);
}

let chartInstance = null;

function renderChart({ customers, leads, prospects }) {
  const monthCount = getMonthCount();
  const labels = Array.from({ length: monthCount }, (_, i) => `${i + 1}`);

  // Linear ramp: month i shows (i/monthCount) fraction of the final totals
  const prospectsData = labels.map((_, i) => Math.round((prospects * (i + 1)) / monthCount));
  const leadsData = labels.map((_, i) => Math.round((leads * (i + 1)) / monthCount));
  const customersData = labels.map((_, i) => Math.round((customers * (i + 1)) / monthCount));

  const ctx = document.getElementById('chart');

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Prospects', data: prospectsData, backgroundColor: '#64748b' },
        { label: 'Leads', data: leadsData, backgroundColor: '#94a3b8' },
        { label: 'Customers', data: customersData, backgroundColor: '#e2e8f0' }
      ]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: { title: { display: true, text: 'people' }, ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
        y: { title: { display: true, text: 'Months' }, ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
      },
      plugins: {
        legend: { labels: { color: '#e2e8f0' } }
      }
    }
  });
}

// hook chart rendering into the existing recalculate flow
const originalRecalculateAll = recalculateAll;
recalculateAll = function () {
  originalRecalculateAll();
  renderChart(calculate());
};

[campaignStartInput, campaignEndInput].forEach(input =>
  input.addEventListener('input', recalculateAll)
);

// re-render now that chart logic exists
recalculateAll();