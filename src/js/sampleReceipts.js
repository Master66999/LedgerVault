/**
 * LedgerVault AI — Sample Receipt Test Suite
 * Generates realistic high-resolution SVG receipt images and metadata for instant offline testing.
 */

export const SAMPLE_RECEIPTS = [
  {
    id: 'sample-vultr-01',
    fileName: 'vultr_cloud_invoice_oct2026.png',
    merchant: 'Vultr Cloud Infrastructure',
    date: '2026-10-02',
    total: 148.50,
    tax: 0.00,
    currency: '$',
    paymentMethod: 'Mastercard •••• 8821',
    category: 'software',
    deductibleRate: 1.0, // 100%
    clientProject: 'Internal R&D / Client API',
    billable: false,
    notes: 'High-frequency cloud compute cluster & NVMe storage for ML agent deployment',
    lineItems: [
      { desc: 'Bare Metal High-Frequency 4 vCPU 16GB', qty: 1, price: 96.00 },
      { desc: 'NVMe Block Storage (500GB)', qty: 1, price: 40.00 },
      { desc: 'Automated Snapshot Backups', qty: 1, price: 12.50 }
    ],
    ocrRawText: `VULTR HOLDINGS LLC
192 Lexington Ave, New York, NY
TAX INVOICE / RECEIPT
Invoice #: VLT-9827110-B
Date: 2026-10-02
Account: dev-relay-agent-prod

Description                           Qty     Amount
-------------------------------------------------------
Bare Metal High-Freq 4 vCPU 16GB       1      $96.00
NVMe Block Storage (500GB)             1      $40.00
Automated Snapshot Backups             1      $12.50
-------------------------------------------------------
Subtotal:                                    $148.50
Tax / VAT (0%):                                $0.00
TOTAL PAID:                                  $148.50
Payment: Mastercard ending in 8821 (Approved)
Thank you for choosing Vultr Cloud!`
  },
  {
    id: 'sample-bistro-02',
    fileName: 'roasted_bean_client_lunch.png',
    merchant: 'The Roasted Bean Bistro',
    date: '2026-10-08',
    total: 42.80,
    tax: 3.40,
    currency: '$',
    paymentMethod: 'Apple Pay (Visa 1042)',
    category: 'meals',
    deductibleRate: 0.5, // 50% IRS Schedule C Meal rule
    clientProject: 'Acme Corp Contract Review',
    billable: true,
    notes: 'Q4 project scoping lunch with client CTO (50% tax deductible)',
    lineItems: [
      { desc: 'Truffle Grilled Cheese & Bisque', qty: 2, price: 28.00 },
      { desc: 'Single Origin Cold Brew', qty: 2, price: 11.40 },
      { desc: 'City Dining Tax', qty: 1, price: 3.40 }
    ],
    ocrRawText: `THE ROASTED BEAN BISTRO & CAFE
442 Elmwood Ave, Suite 100
Order #88392 | Server: Claire
Date: 2026-10-08  12:45 PM

2x Truffle Grilled Cheese & Bisque            $28.00
2x Single Origin Cold Brew                   $11.40
----------------------------------------------------
Food Subtotal:                                $39.40
Tax (8.625%):                                  $3.40
TOTAL AMOUNT:                                 $42.80
Payment: Apple Pay (Visa •••• 1042)
Auth: 009218
* Business dining expense (50% IRS tax deduction)`
  },
  {
    id: 'sample-tech-03',
    fileName: 'bh_photo_electronics_oct2026.png',
    merchant: 'B&H Photo & Pro Electronics',
    date: '2026-10-05',
    total: 429.99,
    tax: 35.47,
    currency: '$',
    paymentMethod: 'Amex Business •••• 3004',
    category: 'hardware',
    deductibleRate: 1.0, // Section 179 Equipment write-off
    clientProject: 'Studio Gear / Production',
    billable: false,
    notes: '4K Client presentation monitor & dual ergonomic monitor arm',
    lineItems: [
      { desc: 'LG UltraFine 27" 4K IPS HDR Monitor', qty: 1, price: 349.99 },
      { desc: 'Heavy Duty Gas Spring Monitor Arm', qty: 1, price: 44.53 },
      { desc: 'State & Local Sales Tax', qty: 1, price: 35.47 }
    ],
    ocrRawText: `B&H PHOTO VIDEO PRO AUDIO
420 9th Ave, New York, NY 10001
RETAIL SALES RECEIPT #BH-7749102
Date: 2026-10-05 15:10

Item Description                              Amount
----------------------------------------------------
LG UltraFine 27" 4K IPS HDR Monitor          $349.99
Heavy Duty Gas Spring Monitor Arm             $44.53
----------------------------------------------------
Merchandise Total:                           $394.52
Sales Tax:                                    $35.47
FINAL TOTAL:                                 $429.99
Card: Amex Corp •••• 3004
Eligible for Section 179 First-Year Depreciation`
  },
  {
    id: 'sample-wework-04',
    fileName: 'wework_coworking_monthly_pass.png',
    merchant: 'WeWork Flexible Workspace',
    date: '2026-10-01',
    total: 125.00,
    tax: 0.00,
    currency: '$',
    paymentMethod: 'Visa •••• 7182',
    category: 'office',
    deductibleRate: 1.0,
    clientProject: 'Freelance Overhead',
    billable: false,
    notes: 'Monthly co-working day pass bundle for client meeting spaces',
    lineItems: [
      { desc: 'WeWork All-Access 5-Day Pass Pack', qty: 1, price: 125.00 }
    ],
    ocrRawText: `WEWORK MANAGEMENT LLC
Membership Receipt & Billing Summary
Invoice #: WW-2026-OCT-8119
Date: 2026-10-01

Member: Freelance Engineering Lead
Plan: WeWork All-Access Pass Pack (5 Visits)
Location: Global Roaming Access

Line Total:                                  $125.00
Tax:                                           $0.00
TOTAL BILLED:                                $125.00
Paid via Auto-charge: Visa •••• 7182`
  },
  {
    id: 'sample-contractor-05',
    fileName: 'apex_3d_contractor_invoice.png',
    merchant: 'Apex Creative Studio LLC',
    date: '2026-10-11',
    total: 850.00,
    tax: 0.00,
    currency: '$',
    paymentMethod: 'ACH Bank Transfer',
    category: 'subcontractor',
    deductibleRate: 1.0,
    clientProject: 'SaaS Launch Promo Video',
    billable: true,
    notes: 'Contract 3D motion graphics artist for SaaS promotional hero render',
    lineItems: [
      { desc: '3D Spline Scene Design & Modeling (10 hrs)', qty: 10, price: 55.00 },
      { desc: 'Render Compositing & Color Grading (6 hrs)', qty: 6, price: 50.00 }
    ],
    ocrRawText: `APEX CREATIVE STUDIO LLC
Independent Contractor Invoice #AC-2026-104
Date: 2026-10-11 | Due: Upon Receipt
EIN: XX-XXX4910 (W-9 on file)

Services Rendered:
- 3D Spline Scene Design (10 hrs @ $55/hr)    $550.00
- Render Compositing & Grading (6 hrs @ $50)  $300.00
----------------------------------------------------
TOTAL DUE:                                   $850.00
Status: PAID via ACH Transfer
Form 1099-NEC record tracking enabled`
  }
];

/**
 * Creates a visually appealing rendered SVG data URL for a receipt
 */
export function generateReceiptSvgDataUrl(sample) {
  const width = 420;
  const height = 540;

  const linesSvg = sample.lineItems.map((item, idx) => {
    const y = 230 + (idx * 28);
    const itemTotal = (item.qty * item.price).toFixed(2);
    return `
      <text x="32" y="${y}" font-family="Courier, monospace" font-size="12" fill="#2d3748">${escapeXml(item.desc.substring(0, 26))}</text>
      <text x="310" y="${y}" font-family="Courier, monospace" font-size="12" fill="#4a5568" text-anchor="end">${item.qty}x</text>
      <text x="388" y="${y}" font-family="Courier, monospace" font-size="12" font-weight="bold" fill="#1a202c" text-anchor="end">$${itemTotal}</text>
    `;
  }).join('');

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <filter id="paper-shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.15" />
      </filter>
      <pattern id="sawtooth" width="20" height="10" patternUnits="userSpaceOnUse">
        <path d="M 0 0 L 10 10 L 20 0 Z" fill="#f8fafc" />
      </pattern>
    </defs>

    <!-- Receipt paper background -->
    <rect x="15" y="15" width="390" height="510" rx="4" fill="#fafafa" filter="url(#paper-shadow)" stroke="#e2e8f0" stroke-width="1"/>
    
    <!-- Header store brand -->
    <rect x="15" y="15" width="390" height="75" rx="4" fill="#f1f5f9"/>
    <text x="210" y="48" font-family="'Courier New', Courier, monospace" font-size="16" font-weight="bold" fill="#0f172a" text-anchor="middle" letter-spacing="1">
      ${escapeXml(sample.merchant.toUpperCase())}
    </text>
    <text x="210" y="68" font-family="'Courier New', Courier, monospace" font-size="10" fill="#64748b" text-anchor="middle">
      OFFICIAL BUSINESS RECEIPT • 100% AUDIT READY
    </text>

    <!-- Receipt Meta Details -->
    <line x1="30" y1="100" x2="390" y2="100" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4,4"/>
    <text x="32" y="125" font-family="Courier, monospace" font-size="11" fill="#475569">DATE: ${sample.date}</text>
    <text x="388" y="125" font-family="Courier, monospace" font-size="11" fill="#475569" text-anchor="end">ID: ${sample.id.toUpperCase()}</text>
    <text x="32" y="145" font-family="Courier, monospace" font-size="11" fill="#475569">PAYMENT: ${escapeXml(sample.paymentMethod)}</text>
    <text x="388" y="145" font-family="Courier, monospace" font-size="11" fill="#059669" text-anchor="end" font-weight="bold">AUTH APPROVED</text>
    <line x1="30" y1="165" x2="390" y2="165" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4,4"/>

    <!-- Line items headers -->
    <text x="32" y="195" font-family="Courier, monospace" font-size="11" font-weight="bold" fill="#64748b">DESCRIPTION</text>
    <text x="310" y="195" font-family="Courier, monospace" font-size="11" font-weight="bold" fill="#64748b" text-anchor="end">QTY</text>
    <text x="388" y="195" font-family="Courier, monospace" font-size="11" font-weight="bold" fill="#64748b" text-anchor="end">TOTAL</text>
    <line x1="30" y1="205" x2="390" y2="205" stroke="#94a3b8" stroke-width="1"/>

    <!-- Rendered Line Items -->
    ${linesSvg}

    <!-- Financial Totals Section -->
    <line x1="30" y1="360" x2="390" y2="360" stroke="#94a3b8" stroke-width="1"/>
    
    <text x="32" y="385" font-family="Courier, monospace" font-size="12" fill="#64748b">Subtotal:</text>
    <text x="388" y="385" font-family="Courier, monospace" font-size="12" fill="#1e293b" text-anchor="end">$${(sample.total - sample.tax).toFixed(2)}</text>

    <text x="32" y="405" font-family="Courier, monospace" font-size="12" fill="#64748b">Tax / VAT:</text>
    <text x="388" y="405" font-family="Courier, monospace" font-size="12" fill="#1e293b" text-anchor="end">$${sample.tax.toFixed(2)}</text>

    <!-- Big Total Box -->
    <rect x="28" y="420" width="364" height="40" fill="#0f172a" rx="4"/>
    <text x="42" y="446" font-family="'Courier New', Courier, monospace" font-size="15" font-weight="bold" fill="#ffffff">TOTAL PAID</text>
    <text x="378" y="446" font-family="'Courier New', Courier, monospace" font-size="18" font-weight="bold" fill="#10b981" text-anchor="end">$${sample.total.toFixed(2)}</text>

    <!-- Footer Security & Privacy seal -->
    <text x="210" y="485" font-family="Courier, monospace" font-size="9" fill="#94a3b8" text-anchor="middle">
      PROCESSED ON-DEVICE • OPEN-SOURCE AI PRIVACY
    </text>
    <text x="210" y="500" font-family="Courier, monospace" font-size="8" fill="#cbd5e1" text-anchor="middle">
      SCHEDULE C CATEGORY: ${sample.category.toUpperCase()} (${(sample.deductibleRate * 100)}% DEDUCTIBLE)
    </text>
  </svg>
  `;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.trim());
}

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}
