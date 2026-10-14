/**
 * LedgerVault AI — Local-First Storage System
 * Uses IndexedDB & LocalStorage for 100% private client-side data persistence.
 */

import { SAMPLE_RECEIPTS, generateReceiptSvgDataUrl } from './sampleReceipts.js';

const STORAGE_KEY = 'ledgervault_receipts_v1';
const DB_NAME = 'LedgerVaultDB';
const STORE_NAME = 'receipt_images';

let dbPromise = null;

function getDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

/**
 * Saves receipt image dataUrl or blob to IndexedDB
 */
export async function saveReceiptImage(id, dataUrl) {
  try {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ id, dataUrl });
    return new Promise((res, rej) => {
      tx.oncomplete = () => res(true);
      tx.onerror = () => rej(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB save image failed, using memory:', err);
    return false;
  }
}

/**
 * Retrieves receipt image from IndexedDB
 */
export async function getReceiptImage(id) {
  try {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    return new Promise((res) => {
      req.onsuccess = () => res(req.result ? req.result.dataUrl : null);
      req.onerror = () => res(null);
    });
  } catch (err) {
    return null;
  }
}

/**
 * Get all receipts metadata from LocalStorage
 */
export function getReceipts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // First run: seed with realistic sample receipts!
      const initial = initializeSampleData();
      saveReceipts(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read receipts:', err);
    return [];
  }
}

/**
 * Save all receipts metadata to LocalStorage
 */
export function saveReceipts(receipts) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  } catch (err) {
    console.error('Failed to save receipts:', err);
  }
}

/**
 * Add or update single receipt
 */
export function upsertReceipt(receipt) {
  const receipts = getReceipts();
  const index = receipts.findIndex(r => r.id === receipt.id);
  if (index >= 0) {
    receipts[index] = receipt;
  } else {
    receipts.unshift(receipt);
  }
  saveReceipts(receipts);
  return receipts;
}

/**
 * Delete receipt by ID
 */
export async function deleteReceipt(id) {
  let receipts = getReceipts();
  receipts = receipts.filter(r => r.id !== id);
  saveReceipts(receipts);

  // also remove from IndexedDB
  try {
    const db = await getDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
  } catch (e) {}

  return receipts;
}

/**
 * Seed initial sample receipts with vector SVG images stored in IndexedDB
 */
function initializeSampleData() {
  const seeded = SAMPLE_RECEIPTS.map((s, idx) => {
    const svgUrl = generateReceiptSvgDataUrl(s);
    saveReceiptImage(s.id, svgUrl);
    return {
      id: s.id,
      fileName: s.fileName,
      merchant: s.merchant,
      date: s.date,
      total: s.total,
      tax: s.tax,
      currency: s.currency,
      paymentMethod: s.paymentMethod,
      category: s.category,
      deductibleRate: s.deductibleRate,
      clientProject: s.clientProject,
      billable: s.billable,
      notes: s.notes,
      lineItems: s.lineItems,
      ocrRawText: s.ocrRawText,
      confidence: 96 - (idx * 2),
      status: 'verified',
      timestamp: Date.now() - (idx * 86400000 * 2)
    };
  });
  return seeded;
}
