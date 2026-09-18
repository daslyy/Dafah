console.log("Statement JS Loaded");

// ── STATE ──
let selectedQuick = "this-month";
let selectedType = "all";
let selectedFormat = "pdf";
let filteredTxns = [];

// ── FORMAT MONEY ──
function stFormatMoney(val) {
    return Number(val).toLocaleString('en-NG');
}

// ── FORMAT DATE ──
function stFormatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

function stFormatDateLabel(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-NG', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

// ── SHOW VIEW ──
function showView(view) {
    document.getElementById('viewFilter').style.display = view === 'filter' ? 'block' : 'none';
    document.getElementById('viewPreview').style.display = view === 'preview' ? 'block' : 'none';
}

// ── SET DATE RANGES ──
function setDateRange(quick) {
    const now = new Date();
    const from = document.getElementById('stFromDate');
    const to = document.getElementById('stToDate');

    let fromDate = new Date();
    let toDate = new Date();

    if (quick === 'this-month') {
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (quick === 'last-month') {
        fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        toDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (quick === '3-months') {
        fromDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        toDate = new Date();
    }

    if (quick !== 'custom') {
        from.value = fromDate.toISOString().split('T')[0];
        to.value = toDate.toISOString().split('T')[0];
    }
}

// ── QUICK SELECT ──
document.querySelectorAll('.st-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.st-quick-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedQuick = btn.dataset.quick;
        setDateRange(selectedQuick);
    });
});

// ── TYPE BUTTONS ──
document.querySelectorAll('.st-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.st-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedType = btn.dataset.type;
    });
});

// ── FORMAT BUTTONS ──
document.querySelectorAll('.st-format-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.st-format-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFormat = btn.dataset.format;
    });
});

// ── BUILD TITLE ──
function stBuildTitle(tx) {
    const device = window.innerWidth <= 768 ? 'Mobile' : 'Desktop';
    if (tx.category === 'transfer') {
        const prefix = tx.source === 'dafah' ? `${device} DAFAH TRF` : `${device} TRF`;
        return tx.description ? `${prefix} — ${tx.description}` : prefix;
    }
    return tx.title;
}

// ── PREVIEW ──
document.getElementById('stPreviewBtn').addEventListener('click', () => {
    const fromVal = document.getElementById('stFromDate').value;
    const toVal = document.getElementById('stToDate').value;

    if (!fromVal || !toVal) {
        alert('Please select a date range'); return;
    }

    const fromDate = new Date(fromVal);
    const toDate = new Date(toVal);
    toDate.setHours(23, 59, 59, 999);

    if (fromDate > toDate) {
        alert('From date cannot be after To date'); return;
    }

    // filter transactions
    filteredTxns = transactions.filter(tx => {
        const txDate = new Date(tx.time);
        const inRange = txDate >= fromDate && txDate <= toDate;
        if (selectedType === 'all') return inRange;
        if (selectedType === 'credit') return inRange && tx.type === 'credit';
        if (selectedType === 'debit') return inRange && tx.type === 'debit';
        return inRange;
    }).sort((a, b) => new Date(b.time) - new Date(a.time));

    // calculate totals
    let totalCredit = 0;
    let totalDebit = 0;

    filteredTxns.forEach(tx => {
        if (tx.type === 'credit') totalCredit += tx.amount;
        if (tx.type === 'debit') totalDebit += tx.amount;
    });

    // update summary
    document.getElementById('previewTotalCredit').textContent = `+₦${stFormatMoney(totalCredit)}`;
    document.getElementById('previewTotalDebit').textContent = `-₦${stFormatMoney(totalDebit)}`;
    document.getElementById('previewCount').textContent = filteredTxns.length;
    document.getElementById('previewClosingBalance').textContent = `₦${stFormatMoney(balance)}`;
    document.getElementById('previewPeriodLabel').textContent =
        `${stFormatDateLabel(fromVal)} — ${stFormatDateLabel(toVal)} • ${selectedType === 'all' ? 'All transactions' : selectedType === 'credit' ? 'Credits only' : 'Debits only'}`;

    // build table
    const tbody = document.getElementById('previewTableBody');

    if (filteredTxns.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:30px; color:#9ca3af;">
                    No transactions found for this period
                </td>
            </tr>`;
    } else {
        tbody.innerHTML = filteredTxns.map(tx => `
            <tr>
                <td class="st-td-gray">${stFormatDate(tx.time)}</td>
                <td>${stBuildTitle(tx)}</td>
                <td class="st-td-gray">${tx.description || '—'}</td>
                <td>
                    <span style="
                        padding:3px 10px;
                        border-radius:20px;
                        font-size:11px;
                        font-weight:600;
                        background:${tx.type === 'credit' ? '#dcfce7' : '#fee2e2'};
                        color:${tx.type === 'credit' ? '#16a34a' : '#dc2626'};
                    ">
                        ${tx.type === 'credit' ? 'Credit' : 'Debit'}
                    </span>
                </td>
                <td class="${tx.type === 'debit' ? 'st-td-debit' : 'st-td-gray'}">
                    ${tx.type === 'debit' ? `₦${stFormatMoney(tx.amount)}` : '—'}
                </td>
                <td class="${tx.type === 'credit' ? 'st-td-credit' : 'st-td-gray'}">
                    ${tx.type === 'credit' ? `₦${stFormatMoney(tx.amount)}` : '—'}
                </td>
            </tr>
        `).join('') + `
            <tr class="st-total-row">
                <td colspan="3" style="font-weight:700;">TOTAL</td>
                <td></td>
                <td class="st-td-debit">₦${stFormatMoney(totalDebit)}</td>
                <td class="st-td-credit">₦${stFormatMoney(totalCredit)}</td>
            </tr>
        `;
    }

    showView('preview');
});

// ── DOWNLOAD ──
document.getElementById('stDownloadBtn').addEventListener('click', () => {
    const activeFormat = document.querySelector('.st-format-btn.active');
    const format = activeFormat ? activeFormat.dataset.format : 'pdf';

    if (format === 'csv') {
        downloadCSV();
    } else {
        downloadPDF();
    }
});
// ── DOWNLOAD CSV ──
function downloadCSV() {
    const fromVal = document.getElementById('stFromDate').value;
    const toVal = document.getElementById('stToDate').value;

    let csv = `DAFAH Bank — Account Statement\n`;
    csv += `Account Name:,Emmanuel Daniel,,,Period:,${stFormatDateLabel(fromVal)} to ${stFormatDateLabel(toVal)}\n`;
    csv += `Account Number:,0123456789,,,Generated:,${stFormatDateLabel(new Date().toISOString())}\n\n`;
    csv += `Date,Description,Narration,Type,Debit (₦),Credit (₦)\n`;

    let totalCredit = 0;
    let totalDebit = 0;

    filteredTxns.forEach(tx => {
        const date = stFormatDate(tx.time);
        const description = stBuildTitle(tx);
        const narration = tx.description || '—';
        const type = tx.type === 'credit' ? 'Credit' : 'Debit';
        const debit = tx.type === 'debit' ? tx.amount : '—';
        const credit = tx.type === 'credit' ? tx.amount : '—';

        if (tx.type === 'credit') totalCredit += tx.amount;
        if (tx.type === 'debit') totalDebit += tx.amount;

        csv += `${date},"${description}","${narration}",${type},${debit},${credit}\n`;
    });

    csv += `\nTOTAL,,,, ${totalDebit},${totalCredit}"\n`;
    csv += `Closing Balance:,"₦${stFormatMoney(balance)}"\n`;
    // csv += `Closing Balance:,₦${stFormatMoney(balance)}\n`;

    // download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DAFAH_Statement_${fromVal}_to_${toVal}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// ── DOWNLOAD PDF ──
function downloadPDF() {
    const fromVal = document.getElementById('stFromDate').value;
    const toVal = document.getElementById('stToDate').value;

    let totalCredit = 0;
    let totalDebit = 0;
    filteredTxns.forEach(tx => {
        if (tx.type === 'credit') totalCredit += tx.amount;
        if (tx.type === 'debit') totalDebit += tx.amount;
    });

    const rows = filteredTxns.map((tx, i) => `
        <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'};">
            <td>${stFormatDate(tx.time)}</td>
            <td>${stBuildTitle(tx)}</td>
            <td>${tx.description || '—'}</td>
            <td style="color:${tx.type === 'credit' ? '#16a34a' : '#dc2626'}; font-weight:600;">
                ${tx.type === 'credit' ? 'Credit' : 'Debit'}
            </td>
            <td style="text-align:right; color:#dc2626; font-weight:${tx.type === 'debit' ? '700' : '400'};">
                ${tx.type === 'debit' ? `₦${stFormatMoney(tx.amount)}` : '—'}
            </td>
            <td style="text-align:right; color:#16a34a; font-weight:${tx.type === 'credit' ? '700' : '400'};">
                ${tx.type === 'credit' ? `₦${stFormatMoney(tx.amount)}` : '—'}
            </td>
        </tr>
    `).join('');

    const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>DAFAH Statement</title>
            <style>
                * { margin:0; padding:0; box-sizing:border-box; }
                body { font-family:Arial,sans-serif; padding:40px; color:#111; }
                .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:20px; border-bottom:3px solid #16a34a; margin-bottom:24px; }
                .logo { display:flex; align-items:center; gap:12px; }
                .logo-icon { width:44px; height:44px; background:#16a34a; border-radius:12px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:22px; font-weight:700; }
                .logo-text h2 { font-size:18px; color:#111; }
                .logo-text p { font-size:11px; color:#6b7280; }
                .header-right { text-align:right; font-size:12px; color:#6b7280; line-height:1.8; }
                .header-right strong { color:#111; }
                h1 { font-size:22px; margin-top:8px; color:#111; }
                .account-info { display:grid; grid-template-columns:1fr 1fr; gap:10px; background:#f5f7fa; border-radius:10px; padding:16px; margin-bottom:20px; font-size:12px; }
                .account-info div p:first-child { color:#6b7280; margin-bottom:3px; }
                .account-info div p:last-child { font-weight:700; color:#111; }
                .summary { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:20px; }
                .sum-box { border-radius:10px; padding:14px; text-align:center; }
                .sum-box p:first-child { font-size:10px; font-weight:700; text-transform:uppercase; margin-bottom:6px; }
                .sum-box p:last-child { font-size:15px; font-weight:700; }
                .credit-sum { background:#f0fdf4; } .credit-sum p { color:#16a34a; }
                .debit-sum { background:#fee2e2; } .debit-sum p { color:#dc2626; }
                .neutral-sum { background:#f5f7fa; } .neutral-sum p:first-child { color:#6b7280; } .neutral-sum p:last-child { color:#111; }
                table { width:100%; border-collapse:collapse; font-size:11px; margin-bottom:20px; }
                th { background:#16a34a; color:#fff; padding:10px 12px; text-align:left; }
                td { padding:10px 12px; border-bottom:1px solid #e5e7eb; }
                .total-row td { font-weight:700; background:#f0fdf4; border-top:2px solid #16a34a; }
                .closing { display:flex; justify-content:space-between; background:#f0fdf4; border-radius:10px; padding:14px 18px; margin-bottom:20px; }
                .closing p:first-child { font-size:13px; font-weight:600; color:#16a34a; }
                .closing p:last-child { font-size:18px; font-weight:700; color:#111; }
                .footer { text-align:center; font-size:10px; color:#9ca3af; margin-top:30px; padding-top:16px; border-top:1px solid #e5e7eb; }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <div class="logo">
                        <div class="logo-icon">D</div>
                        <div class="logo-text">
                            <h2>DAFAH Bank</h2>
                            <p>Nigerian Digital Bank</p>
                        </div>
                    </div>
                    <h1>Account Statement</h1>
                </div>
                <div class="header-right">
                    <p>Generated: <strong>${stFormatDateLabel(new Date().toISOString())}</strong></p>
                    <p>Period: <strong>${stFormatDateLabel(fromVal)} — ${stFormatDateLabel(toVal)}</strong></p>
                </div>
            </div>

            <div class="account-info">
                <div><p>Account Name</p><p>Emmanuel Daniel</p></div>
                <div><p>Account Number</p><p>0123456789</p></div>
                <div><p>Bank</p><p>DAFAH Bank</p></div>
                <div><p>Currency</p><p>Nigerian Naira (NGN)</p></div>
            </div>

            <div class="summary">
                <div class="sum-box credit-sum">
                    <p>Total Credit</p>
                    <p>+₦${stFormatMoney(totalCredit)}</p>
                </div>
                <div class="sum-box debit-sum">
                    <p>Total Debit</p>
                    <p>-₦${stFormatMoney(totalDebit)}</p>
                </div>
                <div class="sum-box neutral-sum">
                    <p>Transactions</p>
                    <p>${filteredTxns.length}</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Narration</th>
                        <th>Type</th>
                        <th style="text-align:right;">Debit (₦)</th>
                        <th style="text-align:right;">Credit (₦)</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr class="total-row">
                        <td colspan="3">TOTAL</td>
                        <td></td>
                        <td style="text-align:right; color:#dc2626;">₦${stFormatMoney(totalDebit)}</td>
                        <td style="text-align:right; color:#16a34a;">₦${stFormatMoney(totalCredit)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="closing">
                <p>Closing Balance</p>
                <p>₦${stFormatMoney(balance)}</p>
            </div>

            <div class="footer">
                <p>This statement was generated by DAFAH Bank digital banking system.</p>
                <p>For support contact: support@dafahbank.com</p>
            </div>
        </body>
        </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(pdfContent);
    win.document.close();
    win.print();
}

// ── INIT — set default dates ──
setDateRange('this-month');


console.log(document.getElementById('previewTableBody'));
console.log(document.getElementById('viewPreview'));