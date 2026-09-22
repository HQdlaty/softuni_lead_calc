// --- DOM references ---
const totalRevenueInput = document.getElementById('totalRevenue');
const avgOrderValueInput = document.getElementById('avgOrderValue');
const leadResponseRateInput = document.getElementById('leadResponseRate');
const prospectResponseRateInput = document.getElementById('prospectResponseRate');
const leadResponseRateValue = document.getElementById('leadResponseRateValue');
const prospectResponseRateValue = document.getElementById('prospectResponseRateValue');
const campaignStartInput = document.getElementById('campaignStart');
const campaignEndInput = document.getElementById('campaignEnd');
const currencySelect = document.getElementById('currency');
const languageSelect = document.getElementById('language');

const prospectsValueEl = document.getElementById('prospectsValue');
const leadsValueEl = document.getElementById('leadsValue');
const customersValueEl = document.getElementById('customersValue');

const prospectsPercentEl = document.getElementById('prospectsPercent');
const leadsPercentEl = document.getElementById('leadsPercent');
const customersPercentEl = document.getElementById('customersPercent');

const prospectsFillEl = document.getElementById('prospectsFill');
const leadsFillEl = document.getElementById('leadsFill');
const customersFillEl = document.getElementById('customersFill');

// --- Translations (must be defined before anything that uses them) ---
const TRANSLATIONS = {
  en: {
    language: 'Language',
    currency: 'Currency',
    campaignStart: 'Campaign Start',
    campaignEnd: 'Campaign End',
    totalRevenue: 'Total Revenue',
    avgOrderValue: 'Avg. Order Value',
    prospects: 'Prospects',
    leads: 'Leads',
    customers: 'Customers',
    leadResponseRate: 'Lead Response Rate',
    prospectResponseRate: 'Prospect Response Rate',
    months: 'Months',
    people: 'people'
  },
  bg: {
    language: 'Език',
    currency: 'Валута',
    campaignStart: 'Начало на кампанията',
    campaignEnd: 'Край на кампанията',
    totalRevenue: 'Общ оборот',
    avgOrderValue: 'Средна стойност на поръчката',
    prospects: 'Контакти',
    leads: 'Потенциални клиенти',
    customers: 'Клиенти',
    leadResponseRate: 'Процент отговори от потенциални клиенти',
    prospectResponseRate: 'Процент отговори от контакти',
    months: 'Месеци',
    people: 'хора'
  }
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  BGN: 'лв'
};

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

// --- Monthly chart (linear ramp from month 1 to campaign totals) ---
function getMonthCount() {
  const start = new Date(campaignStartInput.value);
  const end = new Date(campaignEndInput.value);
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(1, months);
}

let chartInstance = null;

function renderChart({ customers, leads, prospects }) {
  const lang = TRANSLATIONS[languageSelect.value] ? languageSelect.value : 'en';
  const t = TRANSLATIONS[lang];
  const monthCount = getMonthCount();
  const labels = Array.from({ length: monthCount }, (_, i) => `${i + 1}`);

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
        { label: t.prospects, data: prospectsData, backgroundColor: '#64748b' },
        { label: t.leads, data: leadsData, backgroundColor: '#94a3b8' },
        { label: t.customers, data: customersData, backgroundColor: '#e2e8f0' }
      ]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: { title: { display: true, text: t.people }, ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
        y: { title: { display: true, text: t.months }, ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
      },
      plugins: {
        legend: { labels: { color: '#e2e8f0' } }
      }
    }
  });
}

// --- Currency symbol switching ---
function updateCurrencyLabels() {
  const symbol = CURRENCY_SYMBOLS[currencySelect.value] || '$';
  document.querySelectorAll('.currency-symbol').forEach(el => {
    el.textContent = symbol;
  });
}

// --- Language switching ---
function applyLanguage() {
  const lang = TRANSLATIONS[languageSelect.value] ? languageSelect.value : 'en';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (TRANSLATIONS[lang][key]) {
      el.textContent = TRANSLATIONS[lang][key];
    }
  });
}

// --- Master refresh: recalculates numbers, chart, labels ---
function recalculateAll() {
  updateSliderLabels();
  const results = calculate();
  updateStatsUI(results);
  renderChart(results);
}

// --- Wire up events ---
[
  totalRevenueInput,
  avgOrderValueInput,
  leadResponseRateInput,
  prospectResponseRateInput,
  campaignStartInput,
  campaignEndInput
].forEach(input => input.addEventListener('input', recalculateAll));

currencySelect.addEventListener('input', updateCurrencyLabels);

languageSelect.addEventListener('input', () => {
  applyLanguage();
  recalculateAll();
});

// --- Initial render ---
updateCurrencyLabels();
applyLanguage();
recalculateAll();