console.log("DAFAH Dashboard Loaded");

// ── LIFESTYLE BOOKINGS ──
let lifestyleBookingType = 'flight';
let billPaymentType = 'utility';

function openBillPayment(type) {
    billPaymentType = type === 'sportybet' ? 'sportybet' : 'utility';
    const sporty = billPaymentType === 'sportybet';
    document.getElementById('billPaymentTitle').textContent = sporty ? 'Fund SportyBet wallet' : 'Pay utility bill';
    document.getElementById('billPaymentSubtitle').textContent = sporty ? 'Fund your wallet securely from your DAFAH balance.' : 'Make a secure utility payment from your DAFAH balance.';
    document.querySelector('#billPaymentModal .bill-payment-modal-icon').innerHTML = sporty ? '<i class="fa-solid fa-wallet"></i>' : '<i class="fa-solid fa-bolt"></i>';
    document.getElementById('billRecipientLabel').textContent = sporty ? 'Account name' : 'Provider';
    document.getElementById('billRecipient').placeholder = sporty ? 'e.g. SportyBet account' : 'e.g. IKEDC';
    document.getElementById('billReferenceLabel').textContent = sporty ? 'Customer ID' : 'Meter number';
    document.getElementById('billReference').placeholder = sporty ? 'Enter customer ID' : 'Enter meter number';
    document.getElementById('billPayButton').textContent = sporty ? 'Fund wallet' : 'Pay bill';
    document.getElementById('billAmount').value = '';
    document.getElementById('billRecipient').value = '';
    document.getElementById('billReference').value = '';
    document.getElementById('billFormError').textContent = '';
    document.getElementById('billAvailableBalance').textContent = `₦${formatMoney(balance)}`;
    document.getElementById('billPaymentForm').hidden = false;
    document.getElementById('billPaymentSuccess').hidden = true;
    document.getElementById('billPaymentModal').hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('billRecipient').focus();
}
function closeBillPayment() { document.getElementById('billPaymentModal').hidden = true; document.body.style.overflow = ''; }

const billPaymentForm = document.getElementById('billPaymentForm');
if (billPaymentForm) billPaymentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const recipient = document.getElementById('billRecipient').value.trim();
    const reference = document.getElementById('billReference').value.trim();
    const amount = Number(document.getElementById('billAmount').value);
    const error = document.getElementById('billFormError');
    if (!recipient || !reference || !amount || amount <= 0) { error.textContent = 'Complete all fields with valid values.'; return; }
    if (amount > balance) { error.textContent = 'This payment is more than your available balance.'; return; }
    balance -= amount;
    const title = billPaymentType === 'sportybet' ? 'SportyBet Wallet Funding' : 'Utility Bill Payment';
    transactions.push({ title, amount, name: recipient, description: `${reference} • ${new Date().toLocaleDateString('en-NG')}`, category: 'bill', source: billPaymentType, type: 'debit', time: new Date().toISOString() });
    saveData();
    document.getElementById('billPaymentForm').hidden = true;
    document.getElementById('billPaymentSuccess').hidden = false;
    document.getElementById('billSuccessMessage').textContent = `₦${formatMoney(amount)} was deducted successfully. Your new balance is ₦${formatMoney(balance)}.`;
    const mainBalanceEl = document.getElementById('mainBalance');
    const availableBalanceEl = document.getElementById('availableBalance');
    if (mainBalanceEl) mainBalanceEl.textContent = `₦${formatMoney(balance)}`;
    if (availableBalanceEl) availableBalanceEl.textContent = `₦${formatMoney(balance)}`;
    if (typeof renderTransactions === 'function') renderTransactions();
});

function ensureCardDetails() {
    if (!currentUser.cardNumber) currentUser.cardNumber = `5399${String(currentUser.accountNumber || '0000000000').replace(/\D/g, '').slice(-12).padStart(12, '0')}`;
    if (!currentUser.cardCvv) currentUser.cardCvv = String(Math.floor(100 + Math.random() * 900));
    if (currentUser.cardFrozen === undefined) currentUser.cardFrozen = false;
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    syncDashboardUserRecord();
}

function syncDashboardUserRecord() {
    const users = JSON.parse(localStorage.getItem('df_users') || '[]');
    const index = users.findIndex(user => user.email === currentUser.email);
    if (index !== -1) {
        users[index] = { ...users[index], ...currentUser };
        localStorage.setItem('df_users', JSON.stringify(users));
    }
}

function openCardManagement() {
    ensureCardDetails();
    const number = currentUser.cardNumber.replace(/(.{4})/g, '$1 ').trim();
    document.getElementById('managedCardNumber').textContent = currentUser.cardFrozen ? 'CARD FROZEN' : '•••• •••• •••• ••••';
    document.getElementById('managedCardNumberText').textContent = '•••• •••• •••• ••••';
    document.getElementById('managedCardCvv').textContent = '•••';
    document.getElementById('managedCardName').textContent = `${currentUser.firstName} ${currentUser.lastName}`.toUpperCase();
    document.getElementById('cardNumberToggle').dataset.value = number;
    document.getElementById('cardCvvToggle').dataset.value = currentUser.cardCvv;
    updateManagedCardState();
    document.getElementById('cardModal').hidden = false;
    document.body.style.overflow = 'hidden';
}

function closeCardManagement() { document.getElementById('cardModal').hidden = true; document.body.style.overflow = ''; }
function toggleManagedCardNumber() { const btn = document.getElementById('cardNumberToggle'); const visible = btn.textContent === 'Hide'; document.getElementById('managedCardNumberText').textContent = visible ? '•••• •••• •••• ••••' : btn.dataset.value; btn.textContent = visible ? 'Show' : 'Hide'; }
function toggleManagedCvv() { const btn = document.getElementById('cardCvvToggle'); const visible = btn.textContent === 'Hide'; document.getElementById('managedCardCvv').textContent = visible ? '•••' : btn.dataset.value; btn.textContent = visible ? 'Show' : 'Hide'; }
function updateManagedCardState() {
    const frozen = Boolean(currentUser.cardFrozen);
    const button = document.getElementById('cardFreezeBtn');
    button.innerHTML = frozen ? '<i class="fa-solid fa-unlock"></i> Unfreeze card' : '<i class="fa-solid fa-snowflake"></i> Freeze card';
    button.classList.toggle('is-frozen', frozen);
    document.getElementById('managedCardStatus').innerHTML = frozen ? '<i class="fa-solid fa-lock"></i> Card is frozen' : '<i class="fa-solid fa-circle-check"></i> Card is active';
}
function toggleManagedCardFreeze() {
    ensureCardDetails();

    if (currentUser.cardFrozen) {
        openCardPinModal();
        return;
    }

    currentUser.cardFrozen = !currentUser.cardFrozen;
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    syncDashboardUserRecord();
    updateManagedCardState();
}

function openCardPinModal() {
    document.getElementById('cardPinInput').value = '';
    document.getElementById('pinFormError').textContent = '';
    document.getElementById('cardPinInput').type = 'password';
    document.getElementById('cardPinModal').hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('cardPinInput').focus();
}

function closeCardPinModal() {
    document.getElementById('cardPinModal').hidden = true;
    document.body.style.overflow = '';
}

function togglePinVisibility() {
    const input = document.getElementById('cardPinInput');
    const button = document.getElementById('pinVisibilityBtn');
    const visible = input.type === 'text';
    input.type = visible ? 'password' : 'text';
    button.innerHTML = visible ? '<i class="fa-regular fa-eye"></i>' : '<i class="fa-regular fa-eye-slash"></i>';
}

const cardPinForm = document.getElementById('cardPinForm');
if (cardPinForm) {
    cardPinForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const pin = document.getElementById('cardPinInput').value.trim();
        if (!pin) {
            document.getElementById('pinFormError').textContent = 'Please enter your PIN to continue.';
            return;
        }
        currentUser.cardFrozen = false;
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        syncDashboardUserRecord();
        closeCardPinModal();
        updateManagedCardState();
    });
}

function openChequeServices() {
    const request = JSON.parse(localStorage.getItem('dafah_cheque_request') || 'null');
    document.getElementById('chequeStatusText').textContent = request ? `${request.status} • requested ${request.date}` : 'No active request';
    document.getElementById('chequeFeedback').textContent = '';
    document.getElementById('chequeModal').hidden = false;
    document.body.style.overflow = 'hidden';
}
function closeChequeServices() { document.getElementById('chequeModal').hidden = true; document.body.style.overflow = ''; }
function requestChequeBook() { const request = { status: 'Processing', date: new Date().toLocaleDateString('en-NG'), reference: `CHQ${Date.now().toString().slice(-8)}` }; localStorage.setItem('dafah_cheque_request', JSON.stringify(request)); document.getElementById('chequeStatusText').textContent = `${request.status} • requested ${request.date}`; document.getElementById('chequeFeedback').textContent = `Request submitted successfully. Reference: ${request.reference}`; }
function showChequeStatus() { const request = JSON.parse(localStorage.getItem('dafah_cheque_request') || 'null'); document.getElementById('chequeFeedback').textContent = request ? `Your cheque book request is ${request.status.toLowerCase()}. Reference: ${request.reference}.` : 'You have no active cheque book request.'; }
function showChequeHistory() { document.getElementById('chequeFeedback').textContent = 'No cheque transactions have been recorded yet.'; }

function openLifestyleBooking(type) {
    lifestyleBookingType = type === 'event' ? 'event' : 'flight';
    const modal = document.getElementById('lifestyleModal');
    const form = document.getElementById('lifestyleBookingForm');
    const success = document.getElementById('lifestyleSuccess');
    const title = document.getElementById('lifestyleModalTitle');
    const subtitle = document.getElementById('lifestyleModalSubtitle');
    const icon = document.getElementById('lifestyleModalIcon');
    const destinationLabel = document.getElementById('lifestyleDestinationLabel');
    const destination = document.getElementById('lifestyleDestination');
    const quantityLabel = document.getElementById('lifestyleQuantityLabel');
    const quantity = document.getElementById('lifestyleQuantity');
    const amount = document.getElementById('lifestyleAmount');
    const available = document.getElementById('lifestyleAvailableBalance');
    const error = document.getElementById('lifestyleFormError');

    title.textContent = lifestyleBookingType === 'flight' ? 'Book a flight' : 'Book an event ticket';
    subtitle.textContent = lifestyleBookingType === 'flight'
        ? 'Secure your journey with a quick DAFAH payment.'
        : 'Reserve your seat and pay securely from your DAFAH balance.';
    icon.innerHTML = lifestyleBookingType === 'flight'
        ? '<i class="fa-solid fa-plane"></i>'
        : '<i class="fa-solid fa-ticket"></i>';
    destinationLabel.textContent = lifestyleBookingType === 'flight' ? 'Destination' : 'Event name';
    destination.placeholder = lifestyleBookingType === 'flight' ? 'e.g. London' : 'e.g. Music festival';
    quantityLabel.textContent = lifestyleBookingType === 'flight' ? 'Passengers' : 'Tickets';
    amount.value = '';
    quantity.value = '1';
    error.textContent = '';
    available.textContent = `₦${formatMoney(balance)}`;
    form.hidden = false;
    success.hidden = true;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    destination.focus();
}

function closeLifestyleBooking() {
    const modal = document.getElementById('lifestyleModal');
    if (modal) modal.hidden = true;
    document.body.style.overflow = '';
}

const lifestyleBookingForm = document.getElementById('lifestyleBookingForm');
if (lifestyleBookingForm) {
    lifestyleBookingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const destination = document.getElementById('lifestyleDestination').value.trim();
        const date = document.getElementById('lifestyleDate').value;
        const quantity = Number(document.getElementById('lifestyleQuantity').value);
        const amount = Number(document.getElementById('lifestyleAmount').value);
        const error = document.getElementById('lifestyleFormError');

        if (!destination || !date || quantity < 1 || !Number.isFinite(amount) || amount <= 0) {
            error.textContent = 'Please complete all fields with valid values.';
            return;
        }
        if (amount > balance) {
            error.textContent = 'This booking is more than your available balance.';
            return;
        }

        balance -= amount;
        const typeLabel = lifestyleBookingType === 'flight' ? 'Flight Booking' : 'Event Ticket';
        transactions.push({
            title: typeLabel,
            amount,
            name: destination,
            description: `${quantity} ${lifestyleBookingType === 'flight' ? 'passenger(s)' : 'ticket(s)'} • ${date}`,
            category: 'lifestyle',
            source: lifestyleBookingType,
            type: 'debit',
            time: new Date().toISOString()
        });
        saveData();

        document.getElementById('lifestyleBookingForm').hidden = true;
        document.getElementById('lifestyleSuccess').hidden = false;
        document.getElementById('lifestyleSuccessTitle').textContent = `${typeLabel} confirmed`;
        document.getElementById('lifestyleSuccessMessage').textContent =
            `₦${formatMoney(amount)} was deducted for ${destination}. Your new balance is ₦${formatMoney(balance)}.`;
        if (typeof renderTransactions === 'function') renderTransactions();
        const mainBalanceEl = document.getElementById('mainBalance');
        const availableBalanceEl = document.getElementById('availableBalance');
        if (mainBalanceEl) mainBalanceEl.textContent = `₦${formatMoney(balance)}`;
        if (availableBalanceEl) availableBalanceEl.textContent = `₦${formatMoney(balance)}`;
    });
}

// ── TABS ──
const tabBtns = document.querySelectorAll('.tab-btn');
const serviceContents = document.querySelectorAll('.service-content');

tabBtns.forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.dataset.tab;
        if (!tab) return;
        tabBtns.forEach(btn => btn.classList.remove('active'));
        serviceContents.forEach(content => content.classList.remove('active'));
        button.classList.add('active');
        const target = document.getElementById(tab);
        if (target) target.classList.add('active');

        // Keep the selected service shareable and restorable on refresh.
        if (history.replaceState) {
            history.replaceState(null, '', `#${tab}`);
        }
    });
});

// ── OPEN TAB FROM URL HASH ──
if (window.location.hash) {
    const targetTab = window.location.hash.replace('#', '');
    const matchingBtn = document.querySelector(`.tab-btn[data-tab="${targetTab}"]`);
    if (matchingBtn) {
        matchingBtn.click();
    }
}


// ── GREETING ──
const greetingText = document.getElementById("greetingText");
if (greetingText) {
    const hour = new Date().getHours();
    if (hour < 12) greetingText.textContent = "Good Morning,";
    else if (hour < 18) greetingText.textContent = "Good Afternoon,";
    else greetingText.textContent = "Good Evening,";
}

let currentUser = null;
try {
    currentUser = JSON.parse(localStorage.getItem('current_user'));
} catch (error) {
    localStorage.removeItem('current_user');
}

if (!currentUser || !currentUser.email) {
    window.location.replace('/sign-up/sign.html');
}

const notificationButton = document.getElementById('notification-btn');
const notificationPanel = document.getElementById('notification-panel');
const notificationBadge = document.querySelector('.notify-dot');
const markNotificationsRead = document.getElementById('mark-notifications-read');

function setNotificationsOpen(isOpen) {
    notificationPanel.hidden = !isOpen;
    notificationButton.setAttribute('aria-expanded', String(isOpen));
}

if (notificationButton && notificationPanel) {
    notificationButton.addEventListener('click', () => {
        setNotificationsOpen(notificationPanel.hidden);
    });

    markNotificationsRead.addEventListener('click', () => {
        notificationBadge.hidden = true;
        setNotificationsOpen(false);
    });
}

// ── THEME ──
// Uses the same LocalStorage preference as the public home page.
const themeBtn = document.getElementById('theme-toggle-btn');

function setDashboardTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-theme', isDark);

    if (themeBtn) {
        themeBtn.setAttribute('aria-pressed', String(isDark));
        themeBtn.setAttribute('aria-label', isDark ? 'Enable light mode' : 'Enable dark mode');
        themeBtn.innerHTML = isDark
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-regular fa-moon"></i>';
    }
}

setDashboardTheme(localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const nextTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
        localStorage.setItem('theme', nextTheme);
        setDashboardTheme(nextTheme);
    });
}

console.log("CURRENT USER:", currentUser);

if (currentUser) {

    const userName = document.getElementById('userName');

    if (userName) {
        userName.textContent =
            `${currentUser.firstName} 👋`;
    }

    const topProfileInitials = document.getElementById('topProfileInitials');
    if (topProfileInitials) {
        const firstInitial = (currentUser.firstName || '').trim().charAt(0);
        const lastInitial = (currentUser.lastName || '').trim().charAt(0);
        topProfileInitials.textContent = `${firstInitial}${lastInitial}`.toUpperCase() || 'U';
        topProfileInitials.setAttribute(
            'aria-label',
            `Open profile for ${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
        );
    }

    // Deposit dropdown
    const depositName =
        document.getElementById('depositAccountName');

    const depositNumber =
        document.getElementById('depositAccountNumber');

    const depositAvatar =
        document.getElementById('depositAvatar');

    if (depositName) {
        depositName.textContent =
            `${currentUser.firstName} ${currentUser.lastName}`;
    }

    if (depositNumber) {
        depositNumber.textContent =
            `${currentUser.accountNumber} • DAFAH Bank`;
    }

    if (depositAvatar) {
        depositAvatar.textContent =
            `${currentUser.firstName[0]}${currentUser.lastName[0]}`;
    }

    // Card
    const cardHolderName =
        document.getElementById('cardHolderName');

    const cardNumber =
        document.getElementById('cardNumber');

    if (cardHolderName) {
        cardHolderName.textContent =
            `${currentUser.firstName} ${currentUser.lastName}`;
    }

    if (cardNumber) {
        cardNumber.textContent =
            currentUser.accountNumber;
    }
}
const mainBalance = document.getElementById('mainBalance');
const availableBalance = document.getElementById('availableBalance');
if (currentUser) {

    if (mainBalance) {
        mainBalance.textContent =
            `₦${formatMoney(currentUser.balance)}`;
    }

    if (availableBalance) {
        availableBalance.textContent =
            `₦${formatMoney(currentUser.balance)}`;
    }
}
function formatMoney(value) {
    return Number(value).toLocaleString('en-NG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}


// ── FORMAT DATE ──
function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const yesterday = new Date(now - 86400000);
    const time = date.toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    if (date.toDateString() === now.toDateString()) return `Today, ${time}`;
    if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
    return date.toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}


// ── ICON PER CATEGORY ──
function getIcon(category, type) {
    const map = {
        transfer: "fa-solid fa-arrow-right-arrow-left",
        deposit: "fa-solid fa-building-columns",
        bill: "fa-brands fa-netflix",
        airtime: "fa-solid fa-mobile-screen",
        data: "fa-solid fa-wifi",
    };
    return map[category] || (type === "credit"
        ? "fa-solid fa-arrow-down"
        : "fa-solid fa-arrow-up");
}

function getIconClass(category, type) {
    if (category === "bill") return "icon-bill";
    if (category === "airtime") return "icon-airtime";
    if (category === "data") return "icon-airtime";
    if (type === "credit") return "icon-credit";
    return "icon-debit";
}
function buildWeeklyChart() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const deposits = [0, 0, 0, 0, 0, 0, 0];
    const withdraws = [0, 0, 0, 0, 0, 0, 0];

    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    transactions.forEach(tx => {
        const txDate = new Date(tx.time);
        const diff = Math.floor((txDate - monday) / 86400000);
        if (diff >= 0 && diff < 7) {
            if (tx.type === "credit") deposits[diff] += tx.amount;
            if (tx.type === "debit") withdraws[diff] += tx.amount;
        }
    });

    const ctx = document.getElementById("weeklyChart");
    if (!ctx) return;

    window.buildWeeklyChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: days,
            datasets: [
                {
                    label: "Deposit",
                    data: deposits,
                    borderColor: "#16a34a",
                    backgroundColor: "rgba(22,163,74,0.08)",
                    borderWidth: 3,
                    pointBackgroundColor: "#16a34a",
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: "Withdraw",
                    data: withdraws,
                    borderColor: "#0f172a",
                    backgroundColor: "rgba(15,23,42,0.04)",
                    borderWidth: 3,
                    pointBackgroundColor: "#0f172a",
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#fff",
                    titleColor: "#111",
                    bodyColor: "#555",
                    borderColor: "#e5e7eb",
                    borderWidth: 1,
                    padding: 14,
                    callbacks: {
                        label: ctx =>
                            ` ${ctx.dataset.label}: ₦${ctx.raw.toLocaleString()}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: "#f3f4f6" },
                    ticks: {
                        color: "#9ca3af",
                        callback: val =>
                            val >= 1000000 ? val / 1000000 + "M" :
                                val >= 1000 ? val / 1000 + "K" : val
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: "#9ca3af", font: { weight: "600" } }
                }
            }
        }
    });
}



// =====================================================
// LIVE DATA SYNC
// =====================================================

window.addEventListener("storage", function (event) {

    // Only react to current_user changes
    if (event.key !== "current_user") {
        return;
    }

    const updatedUser =
        JSON.parse(event.newValue);

    if (!updatedUser) {
        return;
    }


    // -----------------------------------------
    // UPDATE DASHBOARD DATA
    // -----------------------------------------

    if (
        typeof updatedUser.balance === "number"
    ) {
        balance = updatedUser.balance;
    }


    if (
        Array.isArray(updatedUser.transactions)
    ) {
        transactions =
            updatedUser.transactions;
    }


    // -----------------------------------------
    // UPDATE BALANCE ON SCREEN
    // -----------------------------------------

    const mainBalance =
        document.getElementById("mainBalance");

    const availableBalance =
        document.getElementById("availableBalance");


    if (mainBalance) {

        mainBalance.textContent =
            `₦${formatMoney(balance)}`;

    }


    if (availableBalance) {

        availableBalance.textContent =
            `₦${formatMoney(balance)}`;

    }


    // -----------------------------------------
    // UPDATE TRANSACTION HISTORY
    // -----------------------------------------

    renderTransactions();


    // -----------------------------------------
    // UPDATE WEEKLY CHART
    // -----------------------------------------

    if (
        window.buildWeeklyChartInstance
    ) {

        window.buildWeeklyChartInstance.destroy();

    }

    buildWeeklyChart();

});


// ── SPARKLINE ──
const canvas = document.getElementById('sparkline');
if (canvas) {
    const ctx = canvas.getContext('2d');
    const pts = [42, 39, 44, 40, 38, 43, 46, 42, 50, 47, 53, 49, 56, 52, 58, 55, 62, 59, 65, 63, 70, 67, 74, 71, 78, 75, 82, 79, 86, 84, 90, 88, 94, 91, 97, 95, 100];
    const grad = ctx.createLinearGradient(0, 0, 0, 50);
    grad.addColorStop(0, 'rgba(255,255,255,0.28)');
    grad.addColorStop(0.6, 'rgba(255,255,255,0.08)');
    grad.addColorStop(1, 'rgba(255,255,255,0.0)');

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: pts.map((_, i) => i),
            datasets: [{
                data: pts,
                borderColor: 'rgba(255,255,255,0.92)',
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.42,
                fill: true,
                backgroundColor: grad
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 1200, easing: 'easeInOutQuart' },
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: {
                x: { display: false },
                y: { display: false, min: 28, max: 112 }
            }
        }
    });
}


// ── INIT ──
renderTransactions();
buildWeeklyChart();



// ── DEVICE DETECTOR ──
function getDevice() {
    return window.innerWidth <= 768 ? 'Mobile' : 'Desktop';
}

// ── BUILD TITLE ──
function buildTitle(tx) {
    const device = getDevice();

    if (tx.category === "transfer") {
        const prefix = tx.source === "dafah"
            ? `${device} DAFAH TRF`
            : `${device} TRF`;
        const desc = tx.description
            ? ` — ${tx.description}`
            : "";
        return prefix + desc;
    }

    return tx.title;
}

// ── BUILD SUBTITLE ──
function buildSubtitle(tx) {

    // ========================================
    // AIRTIME / MOBILE TOP UP / DATA
    // ========================================

    if (
        tx.category === "airtime" ||
        tx.category === "data"
    ) {

        const phone = tx.name
            ? tx.name
            : "";

        const network =
            tx.network ||
            tx.bank ||
            "";

        const formattedNetwork = network
            ? `${network.toUpperCase()} NG`
            : "";

        return `
            <span class="tx-phone">${phone}</span>
            <span class="tx-network">${formattedNetwork}</span>
        `;
    }


    // ========================================
    // TRANSFER
    // ========================================

    if (tx.category === "transfer") {

        const name = tx.name
            ? tx.name.toUpperCase()
            : "";

        const bank = tx.bank
            ? ` • ${tx.bank}`
            : "";

        return name + bank;
    }


    // ========================================
    // OTHER TRANSACTIONS
    // ========================================

    return tx.name
        ? tx.name.toUpperCase()
        : "";
}
function renderTransactions() {
    const list = document.getElementById('transactionsList');
    if (!list) return;

    const recent = [...transactions].reverse().slice(0, 6);

    list.innerHTML = recent.map(tx => `
        <div class="transaction-item">
            <div class="transaction-left">
                <div class="transaction-icon ${getIconClass(tx.category, tx.type)}">
                    <i class="${getIcon(tx.category, tx.type)}"></i>
                </div>
                <div class="transaction-info">
                    <h3>${buildTitle(tx)}</h3>
                   <div class="tx-subtitle">
    ${buildSubtitle(tx)}
</div>

<p class="tx-time">
    ${formatDate(tx.time)}
</p>
                </div>
            </div>
            <div class="transaction-amount ${tx.type === 'credit' ? 'amount-credit' : 'amount-debit'}">
                ${tx.type === 'credit' ? '+' : '-'}₦${formatMoney(tx.amount)}
            </div>
        </div>
    `).join('');
}



// ── NUMBER TO WORDS ──
function numberToWords(num) {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
        'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
        'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    if (num === 0) return '';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    return numberToWords(Math.floor(num / 1000000)) + ' million' + (num % 1000000 ? ' ' + numberToWords(num % 1000000) : '');
}

// ── ADD MONEY DROPDOWN ──
const addMoneyBtn = document.getElementById('addMoneyBtn');
const addMoneyDropdown = document.getElementById('addMoneyDropdown');
const depositCloseBtn = document.getElementById('depositCloseBtn');
const depositConfirmBtn = document.getElementById('depositConfirmBtn');
const depositDoneBtn = document.getElementById('depositDoneBtn');
const depositAmountInput = document.getElementById('depositAmount');
const depositAmountWords = document.getElementById('depositAmountWords');

// open/close
if (addMoneyBtn) {
    addMoneyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addMoneyDropdown.classList.toggle('active');
    });
}

if (depositCloseBtn) {
    depositCloseBtn.addEventListener('click', () => {
        addMoneyDropdown.classList.remove('active');
        resetDepositForm();
    });
}

// close when clicking outside
document.addEventListener('click', (e) => {
    if (addMoneyDropdown && !addMoneyDropdown.contains(e.target)) {
        addMoneyDropdown.classList.remove('active');
    }
});

// amount words
if (depositAmountInput) {
    depositAmountInput.addEventListener('input', () => {
        const val = Number(depositAmountInput.value);
        if (val > 0) {
            depositAmountWords.textContent = numberToWords(val) + ' naira';
        } else {
            depositAmountWords.textContent = '';
        }
    });
}

// show step
function showDepositStep(n) {
    [1, 2, 3].forEach(i => {
        document.getElementById('depositStep' + i).style.display = i === n ? 'block' : 'none';
    });
}

// reset
function resetDepositForm() {
    depositAmountInput.value = '';
    document.getElementById('depositDescription').value = '';
    depositAmountWords.textContent = '';
    showDepositStep(1);
}

// confirm deposit
if (depositConfirmBtn) {
    depositConfirmBtn.addEventListener('click', () => {
        const amount = Number(depositAmountInput.value);
        const description = document.getElementById('depositDescription').value || '';

        if (!amount || amount <= 0) {
            depositAmountInput.style.borderColor = '#dc2626';
            setTimeout(() => depositAmountInput.style.borderColor = '', 1000);
            return;
        }

        // show loading
        showDepositStep(2);
        document.getElementById('depositLoadingText').textContent =
            `Adding ₦${formatMoney(amount)} to your account`;

        setTimeout(() => {

            // update balance
            balance += amount;
            saveData();

            // add transaction
            const transaction = {
                title: 'Add Money',
                amount: amount,
                name: 'Self Deposit',
                bank: 'DAFAH',
                description: description,
                category: 'deposit',
                source: 'self',
                type: 'credit',
                time: new Date().toISOString()
            };
            transactions.push(transaction);
            saveData();

            // update balance on screen
            const mainBalance = document.getElementById('mainBalance');
            const availableBalance = document.getElementById('availableBalance');
            if (mainBalance) mainBalance.textContent = `₦${formatMoney(balance)}`;
            if (availableBalance) availableBalance.textContent = `₦${formatMoney(balance)}`;

            // refresh transactions and chart
            renderTransactions();
            if (window.buildWeeklyChartInstance) {
                window.buildWeeklyChartInstance.destroy();
            }
            buildWeeklyChart();

            // fill receipt
            const time = new Date().toLocaleTimeString('en-NG', {
                hour: '2-digit', minute: '2-digit', hour12: true
            });
            document.getElementById('receiptAmount').textContent = `+₦${formatMoney(amount)}`;
            document.getElementById('receiptDescription').textContent = description || '—';
            document.getElementById('receiptAccount').textContent =
                currentUser?.accountNumber || 'N/A';
            // document.getElementById('receiptAccount').textContent = '0123456789';
            document.getElementById('receiptTime').textContent = `Today, ${time}`;
            document.getElementById('receiptNewBalance').textContent = `₦${formatMoney(balance)}`;

            // show success
            showDepositStep(3);

        }, 2000);
    });
}

// done button
if (depositDoneBtn) {
    depositDoneBtn.addEventListener('click', () => {
        addMoneyDropdown.classList.remove('active');
        resetDepositForm();
    });
}


// ── MOBILE TRANSFER SHEET ──
function openTransferSheet() {
    document.getElementById('transferSheet').classList.add('active');
    document.getElementById('transferOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeTransferSheet() {
    document.getElementById('transferSheet').classList.remove('active');
    document.getElementById('transferOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// also open sheet when Transfer button on balance card is clicked on mobile
const darkBtn = document.querySelector('.dark-btn');
if (darkBtn && window.innerWidth <= 768) {
    darkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openTransferSheet();
    });
}

// ── MORE SHEET ──
function openMoreSheet() {
    document.getElementById('moreSheet').classList.add('active');
    document.getElementById('moreOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMoreSheet() {
    document.getElementById('moreSheet').classList.remove('active');
    document.getElementById('moreOverlay').classList.remove('active');
    document.body.style.overflow = '';
}



