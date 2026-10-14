/**
 * LedgerVault AI — Export & Audit Package Generator
 * Generates CSV, JSON, and printable tax packages for accountants & IRS Schedule C filing.
 */

import { getCategoryDetails } from './localLlmEngine.js';

/**
 * Export verified receipts to standard Accountant CSV
 */
export function exportToCsv(receipts) {
  if (!receipts || receipts.length === 0) {
    alert('No receipts in ledger to export.');
    return;
  }

  const headers = [
    'Date',
    'Merchant',
    'Category',
    'IRS Schedule C Line',
    'Amount',
    'Tax',
    'Deductible Rate',
    'Deductible Amount',
    'Payment Method',
    'Client / Project',
    'Billable',
    'Notes'
  ];

  const rows = receipts.map(r => {
    const total = parseFloat(r.total) || 0;
    const tax = parseFloat(r.tax) || 0;
    const rate = r.deductibleRate !== undefined ? r.deductibleRate : 1.0;
    const deductibleAmt = (total * rate).toFixed(2);
    const catDetails = getCategoryDetails(r.category);

    return [
      escapeCsv(r.date || ''),
      escapeCsv(r.merchant || ''),
      escapeCsv(catDetails.label),
      escapeCsv(catDetails.scheduleC),
      total.toFixed(2),
      tax.toFixed(2),
      `${Math.round(rate * 100)}%`,
      deductibleAmt,
      escapeCsv(r.paymentMethod || ''),
      escapeCsv(r.clientProject || 'General'),
      r.billable ? 'YES' : 'NO',
      escapeCsv(r.notes || '')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  downloadBlob(csvContent, 'ledgervault_freelance_tax_expenses.csv', 'text/csv;charset=utf-8;');
}

/**
 * Export full database to JSON
 */
export function exportToJson(receipts) {
  if (!receipts || receipts.length === 0) {
    alert('No receipts in ledger to export.');
    return;
  }
  const jsonContent = JSON.stringify(receipts, null, 2);
  downloadBlob(jsonContent, 'ledgervault_expenses_export.json', 'application/json');
}

/**
 * Trigger clean print window for Schedule C Tax Summary
 */
export function printTaxPackage() {
  window.print();
}

function escapeCsv(str) {
  const s = String(str);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
