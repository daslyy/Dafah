console.log("Transaction History Loaded");

// ── STATE ──
let txFilter = 'all';
let txSearch = '';
let txFromDate = '';
let txToDate = '';
let activeTxIndex = -1;

// ── FORMAT MONEY ──
function txFormatMoney(val) {
    return Number(val).toLocaleString('en-NG');
}

// ── FORMAT DATE FULL ──
function txFormatFull(isoString) {
    const d = new Date(isoString);
    const now = new Date();
    const yesterday = new Date(now - 86400000);
    const time = d.toLocaleTimeString('en-NG', {
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    if (d.toDateString() === now.toDateString()) return `Today, ${time}`;
    if (d.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
    return d.toLocaleDateString('en-NG', {
        day: 'numeric', month: 'short', year: 'numeric'
    }) + `, ${time}`;
}

// ── FORMAT DATE LABEL ──
function txDateLabel(isoString) {
    const d = new Date(isoString);
    const now = new Date();
    const yesterday = new Date(now - 86400000);
    if (d.toDateString() === now.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-NG', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
}

// ── GET ICON ──
function txGetIcon(category, type) {
const map = {
    transfer: 'fa-solid fa-arrow-right-arrow-left',
    deposit: 'fa-solid fa-building-columns',
    bill: 'fa-solid fa-file-invoice',
    airtime: 'fa-solid fa-mobile-screen',
    data: 'fa-solid fa-wifi',
};
    return map[category] || (type === 'credit' ? 'fa-solid fa-arrow-down' : 'fa-solid fa-arrow-up');
}

// ── GET ICON CLASS ──
function txGetIconClass(category, type) {
    if (category === 'bill') return 'txh-icon txh-icon-bill';
    if (category === 'airtime') return 'txh-icon txh-icon-airtime';
    if (type === 'credit') return 'txh-icon txh-icon-credit';
    if (category === 'data') return 'txh-icon txh-icon-airtime';
    return 'txh-icon txh-icon-debit';
}

// ── BUILD TITLE ──
function txBuildTitle(tx) {
    const device = window.innerWidth <= 768 ? 'Mobile' : 'Desktop';
    if (tx.category === 'transfer') {
        const prefix = tx.source === 'dafah' ? `${device} DAFAH TRF` : `${device} TRF`;
        return tx.description ? `${prefix} — ${tx.description}` : prefix;
    }
    return tx.title;
}
function txBuildSubtitle(tx) {

    // AIRTIME / DATA
    if (tx.category === 'airtime' || tx.category === 'data') {

        const phone = tx.name || '';

        const network = tx.network
            ? tx.network.toUpperCase()
            : '';

        if (phone && network) {
            return `${phone}<br>${network} NG`;
        }

        return phone || (network ? `${network} NG` : '');
    }

    // TRANSFER
    if (tx.category === 'transfer') {

        const name = tx.name
            ? tx.name.toUpperCase()
            : '';

        const bank = tx.bank
            ? ` • ${tx.bank}`
            : '';

        return name + bank;
    }

    // EVERYTHING ELSE
    return tx.name
        ? tx.name.toUpperCase()
        : '';
}
function getFiltered() {
    return [...transactions]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .filter(tx => {
            const matchFilter =
                txFilter === 'all' ? true :
                    txFilter === 'credit' ? tx.type === 'credit' :
                        txFilter === 'debit' ? tx.type === 'debit' :
                            tx.category === txFilter;

            const matchSearch = txSearch === '' ||
                txBuildTitle(tx).toLowerCase().includes(txSearch) ||
                (tx.name && tx.name.toLowerCase().includes(txSearch)) ||
                (tx.description && tx.description.toLowerCase().includes(txSearch));

            const txDate = new Date(tx.time);
            const matchFrom = txFromDate === '' || txDate >= new Date(txFromDate);
            const matchTo = txToDate === '' || txDate <= new Date(txToDate + 'T23:59:59');

            return matchFilter && matchSearch && matchFrom && matchTo;
        });
}

// ── UPDATE SUMMARY ──
function updateSummary(filtered) {
    let totalCredit = 0;
    let totalDebit = 0;
    filtered.forEach(tx => {
        if (tx.type === 'credit') totalCredit += tx.amount;
        if (tx.type === 'debit') totalDebit += tx.amount;
    });
    document.getElementById('txTotalCredit').textContent = `+₦${txFormatMoney(totalCredit)}`;
    document.getElementById('txTotalDebit').textContent = `-₦${txFormatMoney(totalDebit)}`;
    document.getElementById('txCount').textContent = filtered.length;
}

// ── MOBILE SHEET ──
function openMobileDetail() {
    document.getElementById('txMobileOverlay').classList.add('active');
    document.getElementById('txMobileSheet').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileDetail() {
    document.getElementById('txMobileOverlay').classList.remove('active');
    document.getElementById('txMobileSheet').classList.remove('active');
    document.body.style.overflow = '';
}

// Let mobile users dismiss the dialog with the keyboard as well.
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileDetail();
});

// ── UPDATE showDetail to also fill mobile sheet ──

// ── RENDER ──
function renderHistory() {
    const list = document.getElementById('txList');
    const empty = document.getElementById('txEmpty');
    const filtered = getFiltered();

    console.log("TRANSACTIONS:", transactions);
console.log("DATA TRANSACTIONS:", transactions.filter(tx => tx.category === 'data'));
    updateSummary(filtered);

    if (filtered.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'flex';
        return;
    }

    empty.style.display = 'none';

    // group by date
    const groups = {};
    filtered.forEach((tx, i) => {
        const label = txDateLabel(tx.time);
        if (!groups[label]) groups[label] = [];
        groups[label].push({ tx, originalIndex: transactions.indexOf(tx) });
    });

    list.innerHTML = Object.entries(groups).map(([label, items]) => `
        <p class="txh-date-label">${label}</p>
        ${items.map(({ tx, originalIndex }) => `
            <div class="txh-item ${activeTxIndex === originalIndex ? 'active' : ''}"
                 onclick="showDetail(${originalIndex})"
                 tabindex="0" role="button"
                 onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showDetail(${originalIndex}); }">
                <div class="txh-item-left">
                    <div class="${txGetIconClass(tx.category, tx.type)}">
                        <i class="${txGetIcon(tx.category, tx.type)}"></i>
                    </div>
                    <div>
                        <p class="txh-item-title">${txBuildTitle(tx)}</p>
                        <p class="txh-item-sub">${txBuildSubtitle(tx)}</p>
                        <p class="txh-item-time">${txFormatFull(tx.time)}</p>
                    </div>
                </div>
                <div class="txh-item-right">
                    <p class="txh-item-amount ${tx.type === 'credit' ? 'txh-amount-credit' : 'txh-amount-debit'}">
                        ${tx.type === 'credit' ? '+' : '-'}₦${txFormatMoney(tx.amount)}
                    </p>
                    <p class="txh-item-arrow">→ details</p>
                </div>
            </div>
        `).join('')}
    `).join('');
}

// ── SHOW DETAIL ──
function showDetail(index) {
    activeTxIndex = index;
    const tx = transactions[index];
    if (!tx) return;

    document.getElementById('txDetailDefault').style.display = 'none';
    document.getElementById('txDetailContent').style.display = 'block';

    const amountBox = document.getElementById('txDetailAmountBox');
    amountBox.className = `txh-detail-amount-box ${tx.type === 'credit' ? 'is-credit' : 'is-debit'}`;

    document.getElementById('txDetailAmountLabel').textContent =
        tx.type === 'credit' ? 'Amount Credited' : 'Amount Debited';
    document.getElementById('txDetailAmount').textContent =
        `${tx.type === 'credit' ? '+' : '-'}₦${txFormatMoney(tx.amount)}`;
    document.getElementById('txDetailTime').textContent = txFormatFull(tx.time);

    document.getElementById('txDetailType').textContent =
        tx.category.charAt(0).toUpperCase() + tx.category.slice(1);
    document.getElementById('txDetailDesc').textContent = txBuildTitle(tx);

    // narration
    const narrationRow = document.getElementById('txDetailNarrationRow');
    if (tx.description) {
        narrationRow.style.display = 'flex';
        document.getElementById('txDetailNarration').textContent = tx.description;
    } else {
        narrationRow.style.display = 'none';
    }

    // recipient
    const recipientRow = document.getElementById('txDetailRecipientRow');
    if (tx.name) {
        recipientRow.style.display = 'flex';
        document.getElementById('txDetailRecipient').textContent = tx.name;
    } else {
        recipientRow.style.display = 'none';
    }

    // bank
    // bank
    const bankRow =
        document.getElementById('txDetailBankRow');

    if (
        tx.category !== 'airtime' &&
        tx.bank
    ) {

        bankRow.style.display = 'flex';

        document.getElementById(
            'txDetailBank'
        ).textContent = tx.bank;

    } else {

        bankRow.style.display = 'none';

    }
    document.getElementById('txDetailDate').textContent = txFormatFull(tx.time);

    // fee
    const feeRow = document.getElementById('txDetailFeeRow');
    if (tx.category === 'transfer') {
        feeRow.style.display = 'flex';
        document.getElementById('txDetailFee').textContent =
            tx.source === 'dafah' ? 'FREE' : '₦10';
        document.getElementById('txDetailFee').style.color =
            tx.source === 'dafah' ? '#16a34a' : '#dc2626';
    } else {
        feeRow.style.display = 'none';
    }

    // repeat btn — only for transfers
    document.getElementById('txRepeatBtn').style.display =
        tx.category === 'transfer' ? 'flex' : 'none';

    renderHistory();

    // ── FILL MOBILE SHEET ──
    if (window.innerWidth <= 768) {
        const mobileAmountBox = document.getElementById('txMobileAmountBox');
        mobileAmountBox.className = `txh-detail-amount-box ${tx.type === 'credit' ? 'is-credit' : 'is-debit'}`;

        document.getElementById('txMobileAmountLabel').textContent =
            tx.type === 'credit' ? 'Amount Credited' : 'Amount Debited';
        document.getElementById('txMobileAmount').textContent =
            `${tx.type === 'credit' ? '+' : '-'}₦${txFormatMoney(tx.amount)}`;
        document.getElementById('txMobileTime').textContent = txFormatFull(tx.time);
        document.getElementById('txMobileType').textContent =
            tx.category.charAt(0).toUpperCase() + tx.category.slice(1);
        document.getElementById('txMobileDesc').textContent = txBuildTitle(tx);

        const mNarRow = document.getElementById('txMobileNarrationRow');
        if (tx.description) {
            mNarRow.style.display = 'flex';
            document.getElementById('txMobileNarration').textContent = tx.description;
        } else {
            mNarRow.style.display = 'none';
        }

        const mRecRow = document.getElementById('txMobileRecipientRow');
        if (tx.name) {
            mRecRow.style.display = 'flex';
            document.getElementById('txMobileRecipient').textContent = tx.name;
        } else {
            mRecRow.style.display = 'none';
        }

        const mBankRow =
            document.getElementById('txMobileBankRow');

        if (
            tx.category !== 'airtime' &&
            tx.bank
        ) {

            mBankRow.style.display = 'flex';

            document.getElementById(
                'txMobileBank'
            ).textContent = tx.bank;

        } else {

            mBankRow.style.display = 'none';

        }
        document.getElementById('txMobileDate').textContent = txFormatFull(tx.time);

        const mFeeRow = document.getElementById('txMobileFeeRow');
        if (tx.category === 'transfer') {
            mFeeRow.style.display = 'flex';
            document.getElementById('txMobileFee').textContent =
                tx.source === 'dafah' ? 'FREE' : '₦10';
            document.getElementById('txMobileFee').style.color =
                tx.source === 'dafah' ? '#16a34a' : '#dc2626';
        } else {
            mFeeRow.style.display = 'none';
        }

        document.getElementById('txMobileRepeatBtn').style.display =
            tx.category === 'transfer' ? 'flex' : 'none';

        openMobileDetail();
    }
}

// ── REPEAT TRANSFER ──
document.getElementById('txRepeatBtn').addEventListener('click', () => {
    const tx = transactions[activeTxIndex];
    if (!tx) return;
    if (tx.source === 'dafah') {
        window.location.href = '/dafah-transfer.html';
    } else {
        window.location.href = '/transfer.html';
    }
});

// ── SHARE RECEIPT ──
document.getElementById('txShareBtn').addEventListener('click', () => {
    const tx = transactions[activeTxIndex];
    if (!tx) return;

    const text = `DAFAH Bank Receipt\n` +
        `${tx.type === 'credit' ? 'Credit' : 'Debit'}: ₦${txFormatMoney(tx.amount)}\n` +
        `${txBuildTitle(tx)}\n` +
        `${tx.name ? 'To: ' + tx.name + '\n' : ''}` +
        `Date: ${txFormatFull(tx.time)}\n` +
        `DAFAH Bank — Nigerian Digital Bank`;

    if (navigator.share) {
        navigator.share({ title: 'DAFAH Receipt', text });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Receipt copied to clipboard!');
        });
    }
});

// ── SEARCH ──
document.getElementById('txSearch').addEventListener('input', function () {
    txSearch = this.value.toLowerCase();
    activeTxIndex = -1;
    document.getElementById('txDetailDefault').style.display = 'block';
    document.getElementById('txDetailContent').style.display = 'none';
    renderHistory();
});

// ── PILLS ──
document.querySelectorAll('.txh-pill').forEach(pill => {
    pill.addEventListener('click', () => {
        document.querySelectorAll('.txh-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        txFilter = pill.dataset.filter;
        activeTxIndex = -1;
        document.getElementById('txDetailDefault').style.display = 'block';
        document.getElementById('txDetailContent').style.display = 'none';
        renderHistory();
    });
});

// ── DATE FILTERS ──
document.getElementById('txFromDate').addEventListener('change', function () {
    txFromDate = this.value;
    renderHistory();
});

document.getElementById('txToDate').addEventListener('change', function () {
    txToDate = this.value;
    renderHistory();
});

// ── CLEAR ──
document.getElementById('txClearBtn').addEventListener('click', () => {
    txFromDate = '';
    txToDate = '';
    txSearch = '';
    txFilter = 'all';
    document.getElementById('txFromDate').value = '';
    document.getElementById('txToDate').value = '';
    document.getElementById('txSearch').value = '';
    document.querySelectorAll('.txh-pill').forEach(p => p.classList.remove('active'));
    document.querySelector('.txh-pill[data-filter="all"]').classList.add('active');
    activeTxIndex = -1;
    document.getElementById('txDetailDefault').style.display = 'block';
    document.getElementById('txDetailContent').style.display = 'none';
    renderHistory();
});

// ── INIT ──
renderHistory();
