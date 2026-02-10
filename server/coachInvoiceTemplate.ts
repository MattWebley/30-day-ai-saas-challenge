interface InvoiceSession {
  clientName: string;
  completedAt: Date | null;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  coachName: string;
  coachEmail: string;
  date: Date;
  sessions: InvoiceSession[];
  total: number;
  currency: string;
  status: string;
  paidAt: Date | null;
}

function formatMoney(cents: number, currency: string): string {
  const symbol = currency.toLowerCase() === 'gbp' ? '£' : '$';
  return `${symbol}${(cents / 100).toFixed(2)}`;
}

function formatDate(date: Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const sessionRows = data.sessions.map(s => `
    <tr>
      <td style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0;">${s.clientName}</td>
      <td style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0;">${formatDate(s.completedAt)}</td>
      <td style="padding: 10px 16px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatMoney(s.amount, data.currency)}</td>
    </tr>
  `).join('');

  const statusBadge = data.status === 'paid'
    ? '<span style="background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">PAID</span>'
    : '<span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;">REQUESTED</span>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; }
      .no-print { display: none !important; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #1e293b;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 24px;
      line-height: 1.5;
    }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 10px 16px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 2px solid #e2e8f0; }
    th:last-child { text-align: right; }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 30px; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
    <button onclick="window.print()" style="background: #0f172a; color: white; border: none; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer;">
      Print / Save as PDF
    </button>
  </div>

  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
    <div>
      <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 4px 0;">INVOICE</h1>
      <p style="color: #64748b; margin: 0; font-size: 14px;">${data.invoiceNumber}</p>
    </div>
    <div style="text-align: right;">
      ${statusBadge}
    </div>
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 32px; gap: 40px;">
    <div>
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 6px 0;">From</p>
      <p style="font-weight: 600; margin: 0;">${data.coachName}</p>
      <p style="color: #64748b; margin: 2px 0; font-size: 14px;">${data.coachEmail}</p>
    </div>
    <div>
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 6px 0;">To</p>
      <p style="font-weight: 600; margin: 0;">21-Day AI SaaS Challenge</p>
      <p style="color: #64748b; margin: 2px 0; font-size: 14px;">Webley Global - FZCO</p>
      <p style="color: #64748b; margin: 2px 0; font-size: 14px;">Dubai Silicon Oasis, Dubai, UAE</p>
    </div>
    <div style="text-align: right;">
      <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 6px 0;">Date</p>
      <p style="font-weight: 600; margin: 0;">${formatDate(data.date)}</p>
      ${data.paidAt ? `<p style="color: #16a34a; margin: 4px 0; font-size: 13px;">Paid: ${formatDate(data.paidAt)}</p>` : ''}
    </div>
  </div>

  <table style="margin-bottom: 24px;">
    <thead>
      <tr>
        <th>Client</th>
        <th>Session Date</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${sessionRows}
    </tbody>
  </table>

  <div style="text-align: right; padding: 16px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
    <span style="color: #64748b; font-size: 14px;">Total:</span>
    <span style="font-size: 24px; font-weight: 800; margin-left: 12px;">${formatMoney(data.total, data.currency)}</span>
  </div>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 13px;">
    <p>Coaching services provided for the 21-Day AI SaaS Challenge.</p>
  </div>
</body>
</html>`;
}
