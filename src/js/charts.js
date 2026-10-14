/**
 * LedgerVault — Minimalist Retina Canvas Charts
 * Clean, restrained, high-contrast professional palette.
 */

const MINIMAL_COLORS = {
  software: '#6366f1',      // modern indigo
  hardware: '#0ea5e9',      // ocean blue
  meals: '#f59e0b',         // warm amber
  office: '#10b981',        // clean emerald
  travel: '#8b5cf6',        // violet
  subcontractor: '#ec4899', // rose pink
  advertising: '#3b82f6',   // enterprise blue
  other: '#64748b'          // slate
};

/**
 * Render Minimalist Donut Chart
 */
export function renderCategoryDonut(canvas, receipts, legendContainer) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const width = canvas.clientWidth || 300;
  const height = canvas.clientHeight || 240;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  // Group by category
  const totals = {};
  let grandTotal = 0;

  for (const r of receipts) {
    const cat = r.category || 'other';
    const amt = parseFloat(r.total) || 0;
    totals[cat] = (totals[cat] || 0) + amt;
    grandTotal += amt;
  }

  const categories = Object.keys(totals);
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

  if (categories.length === 0 || grandTotal === 0) {
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 60, 0, Math.PI * 2);
    ctx.strokeStyle = isDark ? '#202634' : '#e2e8f0';
    ctx.lineWidth = 14;
    ctx.stroke();

    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.font = "12px 'Inter', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No data yet', width / 2, height / 2);

    if (legendContainer) legendContainer.innerHTML = '';
    return;
  }

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 24;
  const donutThickness = 16;

  let startAngle = -Math.PI / 2;
  const legendItems = [];

  for (const cat of categories) {
    const val = totals[cat];
    const sliceAngle = (val / grandTotal) * (Math.PI * 2);
    const endAngle = startAngle + sliceAngle;
    const color = MINIMAL_COLORS[cat] || MINIMAL_COLORS.other;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = donutThickness;
    ctx.stroke();

    startAngle = endAngle;

    const pct = Math.round((val / grandTotal) * 100);
    legendItems.push({
      category: cat,
      color: color,
      value: val,
      pct: pct
    });
  }

  // Draw Minimal Center Text
  ctx.fillStyle = isDark ? '#f8fafc' : '#0f172a';
  ctx.font = "bold 18px 'JetBrains Mono', monospace";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`$${grandTotal.toFixed(0)}`, centerX, centerY - 6);

  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.font = "10px 'Inter', sans-serif";
  ctx.fillText('Total Spend', centerX, centerY + 14);

  // Render HTML Legend
  if (legendContainer) {
    legendContainer.innerHTML = legendItems.map(item => `
      <div class="legend-item">
        <span class="legend-color" style="background-color: ${item.color};"></span>
        <span style="font-weight: 500; text-transform: capitalize; color: var(--text-primary);">${item.category}</span>
        <span style="font-family: var(--font-mono); color: var(--text-muted); margin-left: auto;">${item.pct}%</span>
      </div>
    `).join('');
  }
}

/**
 * Render Minimal Monthly Velocity Bar Chart
 */
export function renderMonthlyBarChart(canvas, receipts) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const width = canvas.clientWidth || 440;
  const height = canvas.clientHeight || 240;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const monthData = {
    'May': { total: 420, deductible: 380 },
    'Jun': { total: 780, deductible: 690 },
    'Jul': { total: 610, deductible: 540 },
    'Aug': { total: 950, deductible: 840 },
    'Sep': { total: 1120, deductible: 990 },
    'Oct': { total: 0, deductible: 0 }
  };

  for (const r of receipts) {
    const total = parseFloat(r.total) || 0;
    const deductible = total * (r.deductibleRate !== undefined ? r.deductibleRate : 1.0);
    monthData['Oct'].total += total;
    monthData['Oct'].deductible += deductible;
  }

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const paddingLeft = 46;
  const paddingRight = 16;
  const paddingTop = 22;
  const paddingBottom = 30;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const maxVal = Math.max(1600, ...Object.values(monthData).map(m => m.total)) * 1.15;

  // Grid lines
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.06)' : '#e2e8f0';
  ctx.lineWidth = 1;
  const gridSteps = 3;
  for (let i = 0; i <= gridSteps; i++) {
    const y = paddingTop + (chartH / gridSteps) * i;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(width - paddingRight, y);
    ctx.stroke();

    const val = Math.round(maxVal - (maxVal / gridSteps) * i);
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`$${val}`, paddingLeft - 8, y);
  }

  // Bars
  const barGroupWidth = chartW / months.length;
  const barWidth = 11;

  months.forEach((m, idx) => {
    const groupX = paddingLeft + (idx * barGroupWidth) + (barGroupWidth / 2);
    const data = monthData[m];

    // Bar 1: Gross Spend (Neutral slate)
    const bar1Height = (data.total / maxVal) * chartH;
    const bar1Y = paddingTop + chartH - bar1Height;

    ctx.fillStyle = isDark ? '#334155' : '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(groupX - barWidth - 1, bar1Y, barWidth, bar1Height, [3, 3, 0, 0]);
    ctx.fill();

    // Bar 2: Deductible (Precision Emerald)
    const bar2Height = (data.deductible / maxVal) * chartH;
    const bar2Y = paddingTop + chartH - bar2Height;

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.roundRect(groupX + 1, bar2Y, barWidth, bar2Height, [3, 3, 0, 0]);
    ctx.fill();

    // Month Label
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.font = "10px 'Inter', sans-serif";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(m, groupX, paddingTop + chartH + 8);
  });
}
