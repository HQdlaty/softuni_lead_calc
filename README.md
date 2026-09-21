# softuni_lead_calc
SoftUni final project

# LeadPredictor

A lead-funnel calculator that estimates how many prospects and leads
you need to hit a revenue target, based on average order value and
response rates at each funnel stage.

## Formulas

**Customers**
Customers = Total Revenue / Avg. Order Value

**Leads**
Leads = Customers * 100 / Lead Response Rate

**Prospects**
Prospects = Leads * 100 / Prospect Response Rate

## Features

- Live-updating funnel calculations as you adjust inputs and sliders
- Monthly bar chart (Prospects / Leads / Customers), ramped linearly
  across the campaign duration
- Currency symbol switches with the Currency dropdown (USD/EUR/BGN)
- English / Bulgarian UI translation
- Responsive layout for narrow screens

## Running locally

Just open `index.html` in a browser — no build step required.

## Tech

- HTML / CSS / vanilla JavaScript
- [Chart.js](https://www.chartjs.org/) (via CDN) for the funnel chart