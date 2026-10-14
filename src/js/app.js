/**
 * LedgerVault — Minimalist Application Controller
 * Handles local OCR, Ollama bridge, theme toggle, split inspector, and ledger table.
 */

import { SAMPLE_RECEIPTS, generateReceiptSvgDataUrl } from './sampleReceipts.js';
import { recognizeReceipt } from './ocrEngine.js';
import { LocalLlmEngine, getCategoryDetails } from './localLlmEngine.js';
import {
  getReceipts,
  upsertReceipt,
  deleteReceipt,
  saveReceiptImage,
  getReceiptImage
} from './storage.js';
import { renderCategoryDonut, renderMonthlyBarChart } from './charts.js';
import { exportToCsv, exportToJson, printTaxPackage } from './export.js';
import confetti from 'canvas-confetti';

// State
let currentTab = 'scan';
let receipts = [];
let currentInspectingReceipt = null;
let inspectionQueue = [];
let queueIndex = 0;
let currentZoom = 1.0;
let showOcrBoxes = true;
let selectedReceiptIds = new Set();
let sortField = 'date';
let sortAsc = false;

// Local Engine
const localLlm = new LocalLlmEngine();

// DOM Elements
const brandLogo = document.getElementById('brandLogo');
const mainNavTabs = document.getElementById('mainNavTabs');
const viewPanels = {
  scan: document.getElementById('viewScan'),
  inspector: document.getElementById('viewInspector'),
  ledger: document.getElementById('viewLedger'),
  analytics: document.getElementById('viewAnalytics')
};

// Counters
const uninspectedCountEl = document.getElementById('uninspectedCount');
const totalLedgerCountEl = document.getElementById('totalLedgerCount');

// Theme Switcher
const btnThemeToggle = document.getElementById('btnThemeToggle');
const themeIconLight = document.querySelector('.theme-icon-light');
const themeIconDark = document.querySelector('.theme-icon-dark');

// Dropzone & Scanner
const dropzone = document.getElementById('receiptDropzone');
const fileInput = document.getElementById('fileInput');
const browseFilesBtn = document.getElementById('browseFilesBtn');
const cameraSnapBtn = document.getElementById('cameraSnapBtn');
const sampleReceiptsList = document.getElementById('sampleReceiptsList');
const processingStatusCard = document.getElementById('processingStatusCard');
const processingProgressBar = document.getElementById('processingProgressBar');
const processingProgressPct = document.getElementById('processingProgressPct');
const processingStatusTitle = document.getElementById('processingStatusTitle');
const processingStatusSub = document.getElementById('processingStatusSub');

// Inspector Elements
const inspectorFileName = document.getElementById('inspectorFileName');
const receiptImagePreview = document.getElementById('receiptImagePreview');
const canvasWrapper = document.getElementById('canvasWrapper');
const ocrBoundingLayer = document.getElementById('ocrBoundingLayer');
const btnZoomIn = document.getElementById('btnZoomIn');
const btnZoomOut = document.getElementById('btnZoomOut');
const btnZoomFit = document.getElementById('btnZoomFit');
const btnToggleOcrBoxes = document.getElementById('btnToggleOcrBoxes');
const rawOcrTextPre = document.getElementById('rawOcrTextPre');
const aiConfidenceText = document.getElementById('aiConfidenceText');

// Form inputs
const receiptEditForm = document.getElementById('receiptEditForm');
const fieldMerchant = document.getElementById('fieldMerchant');
const fieldDate = document.getElementById('fieldDate');
const fieldTotal = document.getElementById('fieldTotal');
const fieldTax = document.getElementById('fieldTax');
const fieldPayment = document.getElementById('fieldPayment');
const fieldCategory = document.getElementById('fieldCategory');
const deductibleRateText = document.getElementById('deductibleRateText');
const deductibleEstText = document.getElementById('deductibleEstText');
const fieldClientProject = document.getElementById('fieldClientProject');
const fieldBillable = document.getElementById('fieldBillable');
const fieldNotes = document.getElementById('fieldNotes');
const lineItemsBody = document.getElementById('lineItemsBody');
const btnAddLineItem = document.getElementById('btnAddLineItem');
const btnSaveToLedger = document.getElementById('btnSaveToLedger');
const btnDiscardReceipt = document.getElementById('btnDiscardReceipt');
const btnPrevReceipt = document.getElementById('btnPrevReceipt');
const btnNextReceipt = document.getElementById('btnNextReceipt');

// Ledger Table & Filters
const ledgerTableBody = document.getElementById('ledgerTableBody');
const ledgerEmptyState = document.getElementById('ledgerEmptyState');
const ledgerSearchInput = document.getElementById('ledgerSearchInput');
const filterCategory = document.getElementById('filterCategory');
const filterBillable = document.getElementById('filterBillable');
const btnClearFilters = document.getElementById('btnClearFilters');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const bulkActionsBar = document.getElementById('bulkActionsBar');
const bulkSelectedText = document.getElementById('bulkSelectedText');
const btnBulkBillable = document.getElementById('btnBulkBillable');
const btnBulkCategory = document.getElementById('btnBulkCategory');
const btnBulkDelete = document.getElementById('btnBulkDelete');

// Exports
const btnExportCsv = document.getElementById('btnExportCsv');
const btnExportJson = document.getElementById('btnExportJson');
const btnPrintReport = document.getElementById('btnPrintReport');

// Analytics KPI Elements
const kpiTotalExpense = document.getElementById('kpiTotalExpense');
const kpiReceiptsCount = document.getElementById('kpiReceiptsCount');
const kpiTaxDeduction = document.getElementById('kpiTaxDeduction');
const kpiTaxSavingsEst = document.getElementById('kpiTaxSavingsEst');
const kpiBillableTotal = document.getElementById('kpiBillableTotal');
const kpiBillablePct = document.getElementById('kpiBillablePct');
const kpiAvgExpense = document.getElementById('kpiAvgExpense');
const categoryDonutChart = document.getElementById('categoryDonutChart');
const donutLegend = document.getElementById('donutLegend');
const monthlyBarChart = document.getElementById('monthlyBarChart');

// Modals
const modalWhyOpen = document.getElementById('modalWhyOpen');
const btnWhyOpen = document.getElementById('btnWhyOpen');
const btnCloseWhyOpen = document.getElementById('btnCloseWhyOpen');
const btnGotItWhyOpen = document.getElementById('btnGotItWhyOpen');

const modalPricing = document.getElementById('modalPricing');
const btnPricing = document.getElementById('btnPricing');
const btnClosePricing = document.getElementById('btnClosePricing');
const btnClosePricingBtn = document.getElementById('btnClosePricingBtn');
const btnSimulatePurchase = document.getElementById('btnSimulatePurchase');

const modalCamera = document.getElementById('modalCamera');
const btnCloseCamera = document.getElementById('btnCloseCamera');
const btnCancelCamera = document.getElementById('btnCancelCamera');
const btnCapturePhoto = document.getElementById('btnCapturePhoto');
const cameraVideo = document.getElementById('cameraVideo');
const cameraCanvas = document.getElementById('cameraCanvas');
let cameraStream = null;

const modalOllamaSettings = document.getElementById('modalOllamaSettings');
const btnCloseOllamaSettings = document.getElementById('btnCloseOllamaSettings');
const ollamaEndpointInput = document.getElementById('ollamaEndpoint');
const ollamaModelInput = document.getElementById('ollamaModel');
const ollamaPingResult = document.getElementById('ollamaPingResult');
const btnTestOllamaPing = document.getElementById('btnTestOllamaPing');
const btnSaveOllamaSettings = document.getElementById('btnSaveOllamaSettings');
const engineSelector = document.getElementById('engineSelector');

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initApp();
});

function initTheme() {
  const savedTheme = localStorage.getItem('ledgervault_theme') || 'dark';
  applyTheme(savedTheme);

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      updateAnalytics();
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ledgervault_theme', theme);
  if (themeIconLight && themeIconDark) {
    if (theme === 'light') {
      themeIconLight.classList.remove('hidden');
      themeIconDark.classList.add('hidden');
    } else {
      themeIconLight.classList.add('hidden');
      themeIconDark.classList.remove('hidden');
    }
  }
}

function initApp() {
  receipts = getReceipts();
  updateBadgeCounts();
  renderSampleCards();
  renderLedgerTable();
  updateAnalytics();

  setupEventListeners();
  setupDeductibleRecalculator();

  if (receipts.length > 0) {
    inspectionQueue = [...receipts];
    queueIndex = 0;
    loadReceiptIntoInspector(inspectionQueue[0]);
  }
}

function setupEventListeners() {
  if (brandLogo) {
    brandLogo.addEventListener('click', () => switchTab('scan'));
  }

  const btnMobileMenuToggle = document.getElementById('btnMobileMenuToggle');
  const appSidebar = document.getElementById('appSidebar');
  if (btnMobileMenuToggle && appSidebar) {
    btnMobileMenuToggle.addEventListener('click', () => {
      appSidebar.classList.toggle('mobile-open');
    });
  }

  mainNavTabs.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.seg-btn');
    if (tabBtn) {
      switchTab(tabBtn.dataset.tab);
    }
  });

  // Dropzone drag/drop
  ['dragenter', 'dragover'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-active');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-active');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFilesSelected(files);
    }
  });

  browseFilesBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });

  dropzone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleFilesSelected(fileInput.files);
    }
  });

  // Camera
  cameraSnapBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openCameraModal();
  });
  btnCloseCamera.addEventListener('click', closeCameraModal);
  btnCancelCamera.addEventListener('click', closeCameraModal);
  btnCapturePhoto.addEventListener('click', captureCameraPhoto);

  // Engine selector
  engineSelector.addEventListener('change', (e) => {
    const val = e.target.value;
    localLlm.setEngine(val);
    if (val === 'ollama-local') {
      openOllamaModal();
    }
  });

  // Modals
  btnWhyOpen.addEventListener('click', () => modalWhyOpen.classList.remove('hidden'));
  btnCloseWhyOpen.addEventListener('click', () => modalWhyOpen.classList.add('hidden'));
  btnGotItWhyOpen.addEventListener('click', () => modalWhyOpen.classList.add('hidden'));

  btnPricing.addEventListener('click', () => modalPricing.classList.remove('hidden'));
  btnClosePricing.addEventListener('click', () => modalPricing.classList.add('hidden'));
  btnClosePricingBtn.addEventListener('click', () => modalPricing.classList.add('hidden'));
  btnSimulatePurchase.addEventListener('click', () => {
    triggerConfetti();
    alert('Simulated First Customer Sale: $29.00 received! $0 server cost.');
  });

  // Ollama
  btnCloseOllamaSettings.addEventListener('click', () => modalOllamaSettings.classList.add('hidden'));
  btnTestOllamaPing.addEventListener('click', testOllamaConnection);
  btnSaveOllamaSettings.addEventListener('click', saveOllamaConfig);

  // Inspector Zoom
  btnZoomIn.addEventListener('click', () => setZoom(currentZoom + 0.2));
  btnZoomOut.addEventListener('click', () => setZoom(Math.max(0.4, currentZoom - 0.2)));
  btnZoomFit.addEventListener('click', () => setZoom(1.0));
  btnToggleOcrBoxes.addEventListener('click', toggleOcrBoxes);

  // Line items
  btnAddLineItem.addEventListener('click', () => addLineItemRow('', 1, 0.00));
  lineItemsBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('line-item-del-btn')) {
      const row = e.target.closest('tr');
      if (row) row.remove();
    }
  });

  // Inspector actions
  btnSaveToLedger.addEventListener('click', saveInspectorReceipt);
  btnDiscardReceipt.addEventListener('click', discardInspectorReceipt);
  btnPrevReceipt.addEventListener('click', () => navigateInspector(-1));
  btnNextReceipt.addEventListener('click', () => navigateInspector(1));

  // Ledger Search & Filters
  ledgerSearchInput.addEventListener('input', renderLedgerTable);
  filterCategory.addEventListener('change', renderLedgerTable);
  filterBillable.addEventListener('change', renderLedgerTable);
  btnClearFilters.addEventListener('click', () => {
    ledgerSearchInput.value = '';
    filterCategory.value = 'all';
    filterBillable.value = 'all';
    renderLedgerTable();
  });

  // Sorting
  document.querySelectorAll('.minimal-table th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.sort;
      if (sortField === field) {
        sortAsc = !sortAsc;
      } else {
        sortField = field;
        sortAsc = true;
      }
      renderLedgerTable();
    });
  });

  // Checkbox selection & bulk
  selectAllCheckbox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    selectedReceiptIds.clear();
    if (isChecked) {
      receipts.forEach(r => selectedReceiptIds.add(r.id));
    }
    renderLedgerTable();
  });

  btnBulkDelete.addEventListener('click', handleBulkDelete);
  btnBulkBillable.addEventListener('click', handleBulkBillable);
  btnBulkCategory.addEventListener('click', handleBulkCategory);

  // Export
  btnExportCsv.addEventListener('click', () => exportToCsv(receipts));
  btnExportJson.addEventListener('click', () => exportToJson(receipts));
  btnPrintReport.addEventListener('click', () => printTaxPackage());

  const btnGoToScanEmpty = document.getElementById('btnGoToScanEmpty');
  if (btnGoToScanEmpty) {
    btnGoToScanEmpty.addEventListener('click', () => switchTab('scan'));
  }
}

function switchTab(tabKey) {
  currentTab = tabKey;
  document.querySelectorAll('.seg-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabKey);
  });

  Object.keys(viewPanels).forEach(key => {
    viewPanels[key].classList.toggle('active', key === tabKey);
  });

  const breadcrumbEl = document.getElementById('activeViewBreadcrumb');
  if (breadcrumbEl) {
    const titles = {
      scan: 'Intake & Local OCR',
      inspector: 'Document Inspector',
      ledger: 'Expense Ledger',
      analytics: 'Tax & Analytics'
    };
    breadcrumbEl.textContent = titles[tabKey] || tabKey;
  }

  const sidebar = document.getElementById('appSidebar');
  if (sidebar && sidebar.classList.contains('mobile-open')) {
    sidebar.classList.remove('mobile-open');
  }

  if (tabKey === 'analytics') {
    updateAnalytics();
  } else if (tabKey === 'ledger') {
    renderLedgerTable();
  }
}

function updateBadgeCounts() {
  totalLedgerCountEl.textContent = receipts.length;
  uninspectedCountEl.textContent = inspectionQueue.length;
}

function renderSampleCards() {
  sampleReceiptsList.innerHTML = SAMPLE_RECEIPTS.map(s => `
    <div class="sample-chip" data-sample-id="${s.id}">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; background: var(--accent-primary-subtle); color: var(--accent-primary); font-size: 0.72rem; font-weight: 700; flex-shrink: 0;">
          ${escapeHtml(s.merchant.substring(0, 2).toUpperCase())}
        </span>
        <div>
          <div class="chip-vendor">${escapeHtml(s.merchant)}</div>
          <div style="font-size: 0.69rem; color: var(--text-muted); text-transform: capitalize;">${s.category} • ${(s.deductibleRate * 100)}% ded.</div>
        </div>
      </div>
      <span class="chip-total">$${s.total.toFixed(2)}</span>
    </div>
  `).join('');

  sampleReceiptsList.querySelectorAll('.sample-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const sampleId = chip.dataset.sampleId;
      const sample = SAMPLE_RECEIPTS.find(s => s.id === sampleId);
      if (sample) processSampleReceipt(sample);
    });
  });
}

async function processSampleReceipt(sample) {
  showProcessingProgress(true, 'Running On-Device OCR...', 'Local inference in progress');
  const svgDataUrl = generateReceiptSvgDataUrl(sample);

  const ocrResult = await recognizeReceipt(svgDataUrl, (p) => {
    updateProgressBar(p.progress, p.message);
  });

  updateProgressBar(90, 'Applying Local Tax Rules...');
  const parsed = await localLlm.parseReceiptText(sample.ocrRawText || ocrResult.text, sample);

  updateProgressBar(100, 'Done');
  await new Promise(r => setTimeout(r, 150));
  showProcessingProgress(false);

  const receiptObj = {
    id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    fileName: sample.fileName,
    merchant: parsed.merchant,
    date: parsed.date,
    total: parsed.total,
    tax: parsed.tax,
    currency: parsed.currency,
    paymentMethod: parsed.paymentMethod,
    category: parsed.category,
    deductibleRate: parsed.deductibleRate,
    clientProject: sample.clientProject,
    billable: sample.billable,
    notes: sample.notes,
    lineItems: parsed.lineItems,
    ocrRawText: sample.ocrRawText || ocrResult.text,
    ocrWords: ocrResult.words,
    confidence: parsed.confidence,
    status: 'unverified',
    timestamp: Date.now()
  };

  await saveReceiptImage(receiptObj.id, svgDataUrl);
  receipts.unshift(receiptObj);
  upsertReceipt(receiptObj);

  inspectionQueue.unshift(receiptObj);
  queueIndex = 0;
  loadReceiptIntoInspector(receiptObj, svgDataUrl);

  updateBadgeCounts();
  switchTab('inspector');
}

async function handleFilesSelected(fileList) {
  const files = Array.from(fileList);
  if (files.length === 0) return;

  showProcessingProgress(true, 'Extracting uploaded files...', 'Starting local worker');

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const dataUrl = await readFileAsDataUrl(file);

    updateProgressBar(20, `OCR on ${file.name}...`);
    const ocrResult = await recognizeReceipt(dataUrl, (p) => {
      updateProgressBar(Math.min(85, p.progress), p.message);
    });

    updateProgressBar(90, 'Extracting fields locally...');
    const parsed = await localLlm.parseReceiptText(ocrResult.text);

    const receiptObj = {
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      fileName: file.name,
      merchant: parsed.merchant,
      date: parsed.date,
      total: parsed.total,
      tax: parsed.tax,
      currency: parsed.currency,
      paymentMethod: parsed.paymentMethod,
      category: parsed.category,
      deductibleRate: parsed.deductibleRate,
      clientProject: '',
      billable: false,
      notes: 'Scanned locally',
      lineItems: parsed.lineItems,
      ocrRawText: ocrResult.text,
      ocrWords: ocrResult.words,
      confidence: parsed.confidence,
      status: 'unverified',
      timestamp: Date.now()
    };

    await saveReceiptImage(receiptObj.id, dataUrl);
    receipts.unshift(receiptObj);
    upsertReceipt(receiptObj);

    inspectionQueue.unshift(receiptObj);
  }

  showProcessingProgress(false);
  updateBadgeCounts();

  if (inspectionQueue.length > 0) {
    queueIndex = 0;
    const firstImg = await getReceiptImage(inspectionQueue[0].id);
    loadReceiptIntoInspector(inspectionQueue[0], firstImg);
    switchTab('inspector');
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function showProcessingProgress(show, title = '', sub = '') {
  processingStatusCard.classList.toggle('hidden', !show);
  if (title) processingStatusTitle.textContent = title;
  if (sub) processingStatusSub.textContent = sub;
  if (show) {
    processingProgressBar.style.width = '0%';
    processingProgressPct.textContent = '0%';
  }
}

function updateProgressBar(pct, sub = '') {
  processingProgressBar.style.width = `${pct}%`;
  processingProgressPct.textContent = `${pct}%`;
  if (sub) processingStatusSub.textContent = sub;
}

async function loadReceiptIntoInspector(receipt, imageDataUrl = null) {
  currentInspectingReceipt = receipt;
  inspectorFileName.textContent = receipt.fileName || 'receipt.png';

  if (!imageDataUrl) {
    imageDataUrl = await getReceiptImage(receipt.id);
  }
  if (!imageDataUrl) {
    const sample = SAMPLE_RECEIPTS.find(s => s.id === receipt.id || s.fileName === receipt.fileName);
    if (sample) {
      imageDataUrl = generateReceiptSvgDataUrl(sample);
      saveReceiptImage(receipt.id, imageDataUrl);
    }
  }

  receiptImagePreview.src = imageDataUrl || '';
  resetZoom();

  fieldMerchant.value = receipt.merchant || '';
  fieldDate.value = receipt.date || '';
  fieldTotal.value = receipt.total !== undefined ? receipt.total : '';
  fieldTax.value = receipt.tax !== undefined ? receipt.tax : '0.00';
  fieldPayment.value = receipt.paymentMethod || '';
  fieldCategory.value = receipt.category || 'software';
  fieldClientProject.value = receipt.clientProject || '';
  fieldBillable.checked = !!receipt.billable;
  fieldNotes.value = receipt.notes || '';

  const conf = receipt.confidence || 95;
  aiConfidenceText.textContent = `${conf}% Confidence`;

  rawOcrTextPre.textContent = receipt.ocrRawText || '// No text stream';
  renderOcrBoxes(receipt.ocrWords || []);
  recalculateDeductibleBox();
  renderLineItems(receipt.lineItems || []);
}

function renderOcrBoxes(words) {
  ocrBoundingLayer.innerHTML = '';
  if (!words || words.length === 0 || !showOcrBoxes) return;

  const naturalW = receiptImagePreview.naturalWidth || 420;
  const naturalH = receiptImagePreview.naturalHeight || 540;

  words.slice(0, 30).forEach(w => {
    const box = document.createElement('div');
    box.className = 'ocr-box';
    const leftPct = (w.x0 / naturalW) * 100;
    const topPct = (w.y0 / naturalH) * 100;
    const widthPct = ((w.x1 - w.x0) / naturalW) * 100;
    const heightPct = ((w.y1 - w.y0) / naturalH) * 100;

    box.style.left = `${leftPct}%`;
    box.style.top = `${topPct}%`;
    box.style.width = `${Math.max(widthPct, 2)}%`;
    box.style.height = `${Math.max(heightPct, 2)}%`;
    ocrBoundingLayer.appendChild(box);
  });
}

function toggleOcrBoxes() {
  showOcrBoxes = !showOcrBoxes;
  ocrBoundingLayer.style.display = showOcrBoxes ? 'block' : 'none';
  btnToggleOcrBoxes.style.borderColor = showOcrBoxes ? 'var(--text-primary)' : 'var(--border-subtle)';
}

function setZoom(scale) {
  currentZoom = scale;
  canvasWrapper.style.transform = `scale(${currentZoom})`;
}

function resetZoom() {
  currentZoom = 1.0;
  canvasWrapper.style.transform = 'scale(1)';
}

function renderLineItems(items) {
  lineItemsBody.innerHTML = '';
  if (!items || items.length === 0) {
    addLineItemRow('General Expense', 1, fieldTotal.value || 0.00);
    return;
  }
  items.forEach(item => {
    addLineItemRow(item.desc, item.qty, item.price);
  });
}

function addLineItemRow(desc = '', qty = 1, price = 0.00) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="line-item-desc" value="${escapeHtml(desc)}" placeholder="Item"></td>
    <td><input type="number" class="line-item-qty num-font" value="${qty}" min="1"></td>
    <td><input type="number" step="0.01" class="line-item-price num-font" value="${parseFloat(price).toFixed(2)}"></td>
    <td><button type="button" class="line-item-del-btn" title="Remove">&times;</button></td>
  `;
  lineItemsBody.appendChild(tr);
}

function getLineItemsFromTable() {
  const items = [];
  lineItemsBody.querySelectorAll('tr').forEach(tr => {
    const desc = tr.querySelector('.line-item-desc').value.trim();
    const qty = parseInt(tr.querySelector('.line-item-qty').value) || 1;
    const price = parseFloat(tr.querySelector('.line-item-price').value) || 0.00;
    if (desc) items.push({ desc, qty, price });
  });
  return items;
}

function setupDeductibleRecalculator() {
  fieldCategory.addEventListener('change', recalculateDeductibleBox);
  fieldTotal.addEventListener('input', recalculateDeductibleBox);
}

function recalculateDeductibleBox() {
  const cat = fieldCategory.value;
  const details = getCategoryDetails(cat);
  const total = parseFloat(fieldTotal.value) || 0;

  const ratePct = Math.round(details.deductibleRate * 100);
  deductibleRateText.textContent = `${ratePct}%`;

  const savings = (total * details.deductibleRate * 0.30).toFixed(2);
  deductibleEstText.textContent = `Saves ~$${savings}`;
}

function saveInspectorReceipt() {
  if (!currentInspectingReceipt) return;

  const total = parseFloat(fieldTotal.value) || 0;
  const tax = parseFloat(fieldTax.value) || 0;
  const cat = fieldCategory.value;
  const catDetails = getCategoryDetails(cat);

  const updated = {
    ...currentInspectingReceipt,
    merchant: fieldMerchant.value.trim() || 'Untitled Merchant',
    date: fieldDate.value,
    total: total,
    tax: tax,
    category: cat,
    deductibleRate: catDetails.deductibleRate,
    paymentMethod: fieldPayment.value.trim(),
    clientProject: fieldClientProject.value.trim(),
    billable: fieldBillable.checked,
    notes: fieldNotes.value.trim(),
    lineItems: getLineItemsFromTable(),
    status: 'verified'
  };

  upsertReceipt(updated);
  receipts = getReceipts();

  triggerConfetti();

  inspectionQueue = inspectionQueue.filter(r => r.id !== updated.id);
  updateBadgeCounts();

  if (inspectionQueue.length > 0) {
    queueIndex = Math.min(queueIndex, inspectionQueue.length - 1);
    loadReceiptIntoInspector(inspectionQueue[queueIndex]);
  } else {
    switchTab('ledger');
  }
}

function discardInspectorReceipt() {
  if (!currentInspectingReceipt) return;
  deleteReceipt(currentInspectingReceipt.id);
  receipts = getReceipts();
  inspectionQueue = inspectionQueue.filter(r => r.id !== currentInspectingReceipt.id);
  updateBadgeCounts();

  if (inspectionQueue.length > 0) {
    queueIndex = Math.min(queueIndex, inspectionQueue.length - 1);
    loadReceiptIntoInspector(inspectionQueue[queueIndex]);
  } else {
    switchTab('scan');
  }
}

function navigateInspector(delta) {
  if (inspectionQueue.length <= 1) return;
  queueIndex = (queueIndex + delta + inspectionQueue.length) % inspectionQueue.length;
  loadReceiptIntoInspector(inspectionQueue[queueIndex]);
}

function renderLedgerTable() {
  const query = ledgerSearchInput.value.toLowerCase().trim();
  const catFilter = filterCategory.value;
  const billFilter = filterBillable.value;

  let filtered = receipts.filter(r => {
    if (query) {
      const match = (
        (r.merchant && r.merchant.toLowerCase().includes(query)) ||
        (r.notes && r.notes.toLowerCase().includes(query)) ||
        (r.clientProject && r.clientProject.toLowerCase().includes(query)) ||
        (r.category && r.category.toLowerCase().includes(query))
      );
      if (!match) return false;
    }
    if (catFilter !== 'all' && r.category !== catFilter) return false;
    if (billFilter === 'billable' && !r.billable) return false;
    if (billFilter === 'non-billable' && r.billable) return false;
    return true;
  });

  filtered.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortField === 'total') {
      valA = parseFloat(valA) || 0;
      valB = parseFloat(valB) || 0;
    } else {
      valA = String(valA || '').toLowerCase();
      valB = String(valB || '').toLowerCase();
    }
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  if (filtered.length === 0) {
    ledgerTableBody.innerHTML = '';
    ledgerEmptyState.classList.remove('hidden');
    bulkActionsBar.classList.add('hidden');
    return;
  }

  ledgerEmptyState.classList.add('hidden');

  ledgerTableBody.innerHTML = filtered.map(r => {
    const isSelected = selectedReceiptIds.has(r.id);
    const catDetails = getCategoryDetails(r.category);
    const total = parseFloat(r.total) || 0;
    const deductibleAmt = (total * (r.deductibleRate || 1.0)).toFixed(2);

    return `
      <tr>
        <td class="text-center">
          <input type="checkbox" class="row-checkbox" data-id="${r.id}" ${isSelected ? 'checked' : ''}>
        </td>
        <td class="num-font" style="color: var(--text-muted); font-size: 0.78rem;">${escapeHtml(r.date || '—')}</td>
        <td>
          <div style="font-weight: 500;">${escapeHtml(r.merchant || 'Unknown')}</div>
          ${r.notes ? `<div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(r.notes.substring(0, 30))}</div>` : ''}
        </td>
        <td>
          <span class="table-tag">${catDetails.label}</span>
        </td>
        <td>
          <span style="font-size: 0.75rem; color: var(--text-secondary);">${escapeHtml(r.clientProject || 'Overhead')}</span>
        </td>
        <td class="text-right num-font" style="font-weight: 500;">
          $${total.toFixed(2)}
        </td>
        <td class="text-right num-font text-highlight">
          $${deductibleAmt}
        </td>
        <td class="text-center">
          <span class="table-tag" style="${r.billable ? 'color: var(--accent-emerald);' : ''}">
            ${r.billable ? 'Billable' : 'Overhead'}
          </span>
        </td>
        <td class="text-center">
          <button class="table-btn btn-row-edit" data-id="${r.id}">Edit</button>
          <button class="table-btn btn-row-del" data-id="${r.id}">×</button>
        </td>
      </tr>
    `;
  }).join('');

  ledgerTableBody.querySelectorAll('.row-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      if (e.target.checked) selectedReceiptIds.add(id);
      else selectedReceiptIds.delete(id);
      updateBulkActionBar();
    });
  });

  ledgerTableBody.querySelectorAll('.btn-row-edit').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.id;
      const found = receipts.find(r => r.id === id);
      if (found) {
        inspectionQueue = [found];
        queueIndex = 0;
        loadReceiptIntoInspector(found);
        switchTab('inspector');
      }
    });
  });

  ledgerTableBody.querySelectorAll('.btn-row-del').forEach(b => {
    b.addEventListener('click', async () => {
      const id = b.dataset.id;
      if (confirm('Delete this receipt?')) {
        await deleteReceipt(id);
        receipts = getReceipts();
        renderLedgerTable();
        updateAnalytics();
        updateBadgeCounts();
      }
    });
  });

  updateBulkActionBar();
}

function updateBulkActionBar() {
  const count = selectedReceiptIds.size;
  if (count > 0) {
    bulkActionsBar.classList.remove('hidden');
    bulkSelectedText.textContent = `${count} selected`;
  } else {
    bulkActionsBar.classList.add('hidden');
  }
}

async function handleBulkDelete() {
  if (confirm(`Delete ${selectedReceiptIds.size} receipts?`)) {
    for (const id of selectedReceiptIds) {
      await deleteReceipt(id);
    }
    selectedReceiptIds.clear();
    receipts = getReceipts();
    renderLedgerTable();
    updateAnalytics();
    updateBadgeCounts();
  }
}

function handleBulkBillable() {
  receipts = receipts.map(r => {
    if (selectedReceiptIds.has(r.id)) {
      r.billable = !r.billable;
      upsertReceipt(r);
    }
    return r;
  });
  selectedReceiptIds.clear();
  renderLedgerTable();
  updateAnalytics();
}

function handleBulkCategory() {
  const newCat = prompt('New category (software, hardware, meals, office, travel, subcontractor, advertising):');
  if (newCat) {
    receipts = receipts.map(r => {
      if (selectedReceiptIds.has(r.id)) {
        r.category = newCat.toLowerCase().trim();
        r.deductibleRate = getCategoryDetails(r.category).deductibleRate;
        upsertReceipt(r);
      }
      return r;
    });
    selectedReceiptIds.clear();
    renderLedgerTable();
    updateAnalytics();
  }
}

function updateAnalytics() {
  let totalSpend = 0;
  let totalDeductible = 0;
  let totalBillable = 0;

  for (const r of receipts) {
    const amt = parseFloat(r.total) || 0;
    const rate = r.deductibleRate !== undefined ? r.deductibleRate : 1.0;
    totalSpend += amt;
    totalDeductible += (amt * rate);
    if (r.billable) totalBillable += amt;
  }

  const avgExpense = receipts.length > 0 ? (totalSpend / receipts.length) : 0;
  const billablePct = totalSpend > 0 ? Math.round((totalBillable / totalSpend) * 100) : 0;
  const estimatedTaxSavings = (totalDeductible * 0.30).toFixed(0);

  kpiTotalExpense.textContent = `$${totalSpend.toFixed(2)}`;
  kpiReceiptsCount.textContent = `${receipts.length} verified`;

  kpiTaxDeduction.textContent = `$${totalDeductible.toFixed(2)}`;
  kpiTaxSavingsEst.textContent = `Saves ~$${estimatedTaxSavings}`;

  kpiBillableTotal.textContent = `$${totalBillable.toFixed(2)}`;
  kpiBillablePct.textContent = `${billablePct}% of spend`;

  kpiAvgExpense.textContent = `$${avgExpense.toFixed(2)}`;

  renderCategoryDonut(categoryDonutChart, receipts, donutLegend);
  renderMonthlyBarChart(monthlyBarChart, receipts);
}

// Camera
async function openCameraModal() {
  modalCamera.classList.remove('hidden');
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    cameraVideo.srcObject = cameraStream;
  } catch (err) {
    alert('Camera error: ' + err.message);
    closeCameraModal();
  }
}

function closeCameraModal() {
  modalCamera.classList.add('hidden');
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
}

function captureCameraPhoto() {
  if (!cameraVideo.videoWidth) return;
  cameraCanvas.width = cameraVideo.videoWidth;
  cameraCanvas.height = cameraVideo.videoHeight;
  const ctx = cameraCanvas.getContext('2d');
  ctx.drawImage(cameraVideo, 0, 0);

  const dataUrl = cameraCanvas.toDataURL('image/jpeg', 0.9);
  closeCameraModal();
  runDirectScanOnDataUrl(dataUrl, 'camera_' + Date.now() + '.jpg');
}

async function runDirectScanOnDataUrl(dataUrl, fileName) {
  showProcessingProgress(true, 'Scanning camera capture...', 'Running OCR');
  const ocrResult = await recognizeReceipt(dataUrl, (p) => {
    updateProgressBar(p.progress, p.message);
  });

  const parsed = await localLlm.parseReceiptText(ocrResult.text);

  const receiptObj = {
    id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    fileName: fileName,
    merchant: parsed.merchant,
    date: parsed.date,
    total: parsed.total,
    tax: parsed.tax,
    currency: parsed.currency,
    paymentMethod: parsed.paymentMethod,
    category: parsed.category,
    deductibleRate: parsed.deductibleRate,
    clientProject: '',
    billable: false,
    notes: 'Camera capture',
    lineItems: parsed.lineItems,
    ocrRawText: ocrResult.text,
    ocrWords: ocrResult.words,
    confidence: parsed.confidence,
    status: 'unverified',
    timestamp: Date.now()
  };

  await saveReceiptImage(receiptObj.id, dataUrl);
  receipts.unshift(receiptObj);
  upsertReceipt(receiptObj);

  inspectionQueue.unshift(receiptObj);
  queueIndex = 0;
  loadReceiptIntoInspector(receiptObj, dataUrl);

  showProcessingProgress(false);
  updateBadgeCounts();
  switchTab('inspector');
}

// Ollama Config
function openOllamaModal() {
  ollamaEndpointInput.value = localLlm.ollamaEndpoint;
  ollamaModelInput.value = localLlm.ollamaModel;
  modalOllamaSettings.classList.remove('hidden');
}

async function testOllamaConnection() {
  ollamaPingResult.textContent = 'Pinging ' + ollamaEndpointInput.value + '...';
  localLlm.setOllamaConfig(ollamaEndpointInput.value, ollamaModelInput.value);
  const res = await localLlm.pingOllama();
  if (res.success) {
    ollamaPingResult.textContent = `Connected! Models: ${res.models.join(', ') || 'None'}`;
    ollamaPingResult.style.color = 'var(--accent-emerald)';
  } else {
    ollamaPingResult.textContent = `Failed: ${res.error}`;
    ollamaPingResult.style.color = 'var(--accent-rose)';
  }
}

function saveOllamaConfig() {
  localLlm.setOllamaConfig(ollamaEndpointInput.value, ollamaModelInput.value);
  modalOllamaSettings.classList.add('hidden');
}

function triggerConfetti() {
  try {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#a1a1aa', '#10b981', '#f4f4f5']
    });
  } catch (e) {}
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
