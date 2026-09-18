console.log("Global Transfer Loaded");

// ── CURRENCIES ──
const currencies = [
    { flag: '🇺🇸', code: 'USD', name: 'US Dollar', country: 'United States', rate: 0.00073, fee: 2500, region: 'america' },
    { flag: '🇬🇧', code: 'GBP', name: 'British Pound', country: 'United Kingdom', rate: 0.00057, fee: 3000, region: 'europe' },
    { flag: '🇪🇺', code: 'EUR', name: 'Euro', country: 'Europe', rate: 0.00064, fee: 3000, region: 'europe' },
    { flag: '🇨🇦', code: 'CAD', name: 'Canadian Dollar', country: 'Canada', rate: 0.00100, fee: 2500, region: 'america' },
    { flag: '🇦🇺', code: 'AUD', name: 'Australian Dollar', country: 'Australia', rate: 0.00113, fee: 2500, region: 'america' },
    { flag: '🇮🇳', code: 'INR', name: 'Indian Rupee', country: 'India', rate: 0.062, fee: 2000, region: 'asia' },
    { flag: '🇨🇳', code: 'CNY', name: 'Chinese Yuan', country: 'China', rate: 0.0053, fee: 2000, region: 'asia' },
    { flag: '🇯🇵', code: 'JPY', name: 'Japanese Yen', country: 'Japan', rate: 0.107, fee: 2000, region: 'asia' },
    { flag: '🇰🇪', code: 'KES', name: 'Kenyan Shilling', country: 'Kenya', rate: 0.094, fee: 1500, region: 'africa' },
    { flag: '🇬🇭', code: 'GHS', name: 'Ghanaian Cedi', country: 'Ghana', rate: 0.011, fee: 1500, region: 'africa' },
    { flag: '🇿🇦', code: 'ZAR', name: 'South African Rand', country: 'South Africa', rate: 0.013, fee: 1500, region: 'africa' },
    { flag: '🇪🇬', code: 'EGP', name: 'Egyptian Pound', country: 'Egypt', rate: 0.036, fee: 1500, region: 'africa' },
    { flag: '🇵🇭', code: 'PHP', name: 'Philippine Peso', country: 'Philippines', rate: 0.041, fee: 2000, region: 'asia' },
    { flag: '🇲🇽', code: 'MXN', name: 'Mexican Peso', country: 'Mexico', rate: 0.014, fee: 2500, region: 'america' },
    { flag: '🇧🇷', code: 'BRL', name: 'Brazilian Real', country: 'Brazil', rate: 0.0040, fee: 2500, region: 'america' },
    { flag: '🇦🇪', code: 'AED', name: 'UAE Dirham', country: 'UAE', rate: 0.0027, fee: 2000, region: 'asia' },
    { flag: '🇸🇦', code: 'SAR', name: 'Saudi Riyal', country: 'Saudi Arabia', rate: 0.0027, fee: 2000, region: 'asia' },
    { flag: '🇨🇭', code: 'CHF', name: 'Swiss Franc', country: 'Switzerland', rate: 0.00067, fee: 3000, region: 'europe' },
    { flag: '🇸🇬', code: 'SGD', name: 'Singapore Dollar', country: 'Singapore', rate: 0.00097, fee: 2000, region: 'asia' },
    { flag: '🇺🇦', code: 'UAH', name: 'Ukrainian Hryvnia', country: 'Ukraine', rate: 0.030, fee: 2000, region: 'europe' },
];


let liveRates = {};
let ratesLoaded = false;

// ── LOAD LIVE EXCHANGE RATES ──
async function loadLiveRates() {
    try {
        const response = await fetch(
            'https://v6.exchangerate-api.com/v6/122ae6c011625455d3dfd6c3/latest/NGN');



        const data = await response.json();

        if (data.result !== 'success') {
            throw new Error('Exchange rate API failed');
        }

        liveRates = data.conversion_rates;
        ratesLoaded = true;

        console.log('LIVE NGN RATES:', liveRates);

        // Update currency rates with live API rates
        currencies.forEach(currency => {
            if (liveRates[currency.code]) {
                currency.rate = liveRates[currency.code];
            }
        });

        // Refresh the country list
        renderCountryList();

        // If a currency was already selected, refresh its display
        if (selectedCurrency) {
            selectCurrency(selectedCurrency.code);
        }

    } catch (error) {
        console.error('Failed to load exchange rates:', error);
    }
}


// ── SWIFT LOOKUP ──
const swiftCodes = {
    'CHASUS33': 'Chase Bank — United States',
    'BARCGB22': 'Barclays Bank — United Kingdom',
    'DEUTDEDB': 'Deutsche Bank — Germany',
    'BNPAFRPP': 'BNP Paribas — France',
    'HSBCGB2L': 'HSBC Bank — United Kingdom',
    'CITIUS33': 'Citibank — United States',
    'BOFA US3N': 'Bank of America — United States',
    'WFBIUS6S': 'Wells Fargo — United States',
    'NWBKGB2L': 'NatWest — United Kingdom',
    'HDFCINBB': 'HDFC Bank — India',
    'ICICINBB': 'ICICI Bank — India',
    'SCBLMYKL': 'Standard Chartered — Malaysia',
    'ECOCGHAC': 'Ecobank — Ghana',
    'KCBLKENX': 'KCB Bank — Kenya',
};

// ── STATE ──
let selectedCurrency = null;
let selectedAcctType = 'swift';
let currentStep = 1;

// ── NUMBER TO WORDS ──
function gtWords(num) {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    if (num === 0) return '';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' ' + gtWords(num % 100) : '');
    if (num < 1000000) return gtWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 ? ' ' + gtWords(num % 1000) : '');
    return gtWords(Math.floor(num / 1000000)) + ' million' + (num % 1000000 ? ' ' + gtWords(num % 1000000) : '');
}

// ── FORMAT MONEY ──
function gtFormatMoney(val) {
    return Number(val).toLocaleString('en-NG');
}

// ── RENDER COUNTRY LIST ──
function renderCountryList(filter = '') {
    const list = document.getElementById('gtCountryList');
    const filtered = currencies.filter(c =>
        c.code.toLowerCase().includes(filter.toLowerCase()) ||
        c.name.toLowerCase().includes(filter.toLowerCase()) ||
        c.country.toLowerCase().includes(filter.toLowerCase())
    );

    list.innerHTML = filtered.map(c => `
        <div class="gt-country-item ${selectedCurrency && selectedCurrency.code === c.code ? 'selected' : ''}"
             onclick="selectCurrency('${c.code}')">
            <span class="gt-country-item-flag">${c.flag}</span>
            <div>
                <p class="gt-country-item-code">${c.code} — ${c.name}</p>
                <p class="gt-country-item-name">${c.country}</p>
            </div>
            ${selectedCurrency && selectedCurrency.code === c.code
            ? '<span class="gt-country-check">✓</span>'
            : ''}
        </div>
    `).join('');
}

// ── TOGGLE DROPDOWN ──
function toggleCountryDropdown() {
    const dropdown = document.getElementById('gtDropdown');
    const chevron = document.getElementById('gtChevron');
    const isOpen = dropdown.style.display !== 'none';
    dropdown.style.display = isOpen ? 'none' : 'block';
    chevron.classList.toggle('open', !isOpen);
    if (!isOpen) {
        document.getElementById('gtCountrySearch').focus();
        renderCountryList();
    }
}

// ── FILTER COUNTRIES ──
function filterCountries() {
    const val = document.getElementById('gtCountrySearch').value;
    renderCountryList(val);
}

// ── SELECT CURRENCY ──
function selectCurrency(code) {
    selectedCurrency = currencies.find(c => c.code === code);

    document.getElementById('gtSelectedFlag').textContent = selectedCurrency.flag;
    document.getElementById('gtSelectedCode').textContent = selectedCurrency.code;
    document.getElementById('gtSelectedCountry').textContent = selectedCurrency.country;
    document.getElementById('gtDropdown').style.display = 'none';
    document.getElementById('gtChevron').classList.remove('open');

    document.getElementById('gtRateDisplay').textContent =
        `₦1 = ${selectedCurrency.code} ${selectedCurrency.rate}`;
    document.getElementById('gtFeeDisplay').textContent =
        `₦${gtFormatMoney(selectedCurrency.fee)}`;

    calculateConversion();
}

// ── CALCULATE ──
function calculateConversion() {
    const amount = Number(document.getElementById('gtAmount').value);
    const words = document.getElementById('gtAmountWords');

    words.textContent = amount > 0 ? gtWords(amount) + ' naira' : '';

    if (!selectedCurrency || !amount) {
        document.getElementById('gtConvertedAmount').textContent = '0.00';
        return;
    }

    const converted = (amount * selectedCurrency.rate).toFixed(2);
    document.getElementById('gtConvertedAmount').textContent =
        `${selectedCurrency.code} ${Number(converted).toLocaleString()}`;
}

// ── SWIFT LOOKUP ──
function lookupSwift() {
    const code = document.getElementById('gtSwiftCode').value.toUpperCase().trim();
    const result = document.getElementById('gtSwiftResult');

    document.getElementById('gtSwiftCode').value = code;

    if (code.length >= 8) {
        const found = swiftCodes[code];
        result.textContent = found ? `✓ ${found}` : 'SWIFT code not found in our database — verify with your bank';
        result.style.color = found ? '#16a34a' : '#d97706';
    } else {
        result.textContent = '';
    }
}

// ── SELECT ACCOUNT TYPE ──
function selectAcctType(btn) {
    document.querySelectorAll('.gt-acct-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedAcctType = btn.dataset.type;

    document.getElementById('gtSwiftGroup').style.display = selectedAcctType === 'swift' ? 'flex' : 'none';
    document.getElementById('gtIbanGroup').style.display = selectedAcctType === 'iban' ? 'flex' : 'none';
    document.getElementById('gtRoutingGroup').style.display = selectedAcctType === 'routing' ? 'flex' : 'none';
}

// ── ACCOUNT NUMBER VALIDATION ──
const gtAcctNumber = document.getElementById('gtAcctNumber');
const gtAcctStatus = document.getElementById('gtAcctStatus');

let gtVerifyTimer;

if (gtAcctNumber) {

    gtAcctNumber.addEventListener('input', function () {

        clearTimeout(gtVerifyTimer);

        // Numbers only
        let value = this.value.replace(/\D/g, '');

        // Put cleaned value back
        this.value = value;

        const length = value.length;

        // ── EMPTY ──
        if (length === 0) {
            this.style.borderColor = '';
            gtAcctStatus.textContent = '';
            gtAcctStatus.style.color = '';
            return;
        }

        // ── LESS THAN 10 DIGITS ──
        if (length < 10) {

            const remaining = 10 - length;

            this.style.borderColor = '#f59e0b';

            gtAcctStatus.textContent =
                `${remaining} more digit${remaining === 1 ? '' : 's'} needed`;

            gtAcctStatus.style.color = '#f59e0b';

            return;
        }

        // ── MORE THAN 10 DIGITS ──
        if (length > 10) {

            this.style.borderColor = '#dc2626';

            gtAcctStatus.textContent =
                'Account number too long';

            gtAcctStatus.style.color = '#dc2626';

            return;
        }

        // ── EXACTLY 10 DIGITS ──

        // Show verifying state
        this.style.borderColor = '#f59e0b';

        gtAcctStatus.textContent = 'Verifying account...';
        gtAcctStatus.style.color = '#f59e0b';

        gtVerifyTimer = setTimeout(() => {

            // Make sure user hasn't changed the number
            if (gtAcctNumber.value.length !== 10) return;

            // Successful verification
            gtAcctNumber.style.borderColor = '#16a34a';

            gtAcctStatus.textContent = '✓ Account verified';
            gtAcctStatus.style.color = '#16a34a';

        }, 700);
    });
}


// ── GO TO STEP ──
function goToStep(step) {
    if (step === 2) {
        const amount = Number(document.getElementById('gtAmount').value);
        if (!selectedCurrency) { alert('Please select a destination currency'); return; }
        if (!amount || amount <= 0) { alert('Please enter an amount to send'); return; }
        if (amount < 5000) { alert('Minimum transfer amount is ₦5,000'); return; }

        const converted = (amount * selectedCurrency.rate).toFixed(2);
        document.getElementById('gtStep2Sub').textContent =
            `Sending ${selectedCurrency.code} ${Number(converted).toLocaleString()} to ${selectedCurrency.country}`;
        document.getElementById('gtStep2Flag').textContent = selectedCurrency.flag;
        document.getElementById('gtSummaryNaira').textContent =
            `₦${gtFormatMoney(amount)}`;
        document.getElementById('gtSummaryConverted').textContent =
            `${selectedCurrency.code} ${Number(converted).toLocaleString()}`;
    }

    if (step === 3) {
        const name = document.getElementById('gtRecipientName').value.trim();
        const bank = document.getElementById('gtBankName').value.trim();
        const acctNo = document.getElementById('gtAcctNumber').value.trim();


        if (!name) {
            alert('Please enter recipient full name');
            return;
        }

        if (!bank) {
            alert('Please enter bank name');
            return;
        }

        if (!acctNo) {
            alert('Please enter account number');
            return;
        }

        if (acctNo.length !== 10) {
            alert('Account number must be exactly 10 digits');
            document.getElementById('gtAcctNumber').style.borderColor = '#dc2626';
            return;
        }

        const amount = Number(document.getElementById('gtAmount').value);
        const converted = (amount * selectedCurrency.rate).toFixed(2);
        const total = amount + selectedCurrency.fee;

        let acctRef = '';
        if (selectedAcctType === 'swift') {
            acctRef = document.getElementById('gtSwiftCode').value || '—';
        } else if (selectedAcctType === 'iban') {
            acctRef = document.getElementById('gtIban').value || '—';
        } else {
            acctRef = document.getElementById('gtRouting').value || '—';
        }

        const purpose = document.getElementById('gtPurpose').value || '—';
        const masked = acctNo.length > 4
            ? '•••• ' + acctNo.slice(-4)
            : acctNo;

        document.getElementById('gtReviewTotal').textContent = `₦${gtFormatMoney(total)}`;
        document.getElementById('gtReviewSub').textContent =
            `₦${gtFormatMoney(amount)} + ₦${gtFormatMoney(selectedCurrency.fee)} fee`;
        document.getElementById('gtReviewDestFlag').textContent = selectedCurrency.flag;
        document.getElementById('gtReviewDestAmount').textContent =
            `${selectedCurrency.code} ${Number(converted).toLocaleString()}`;

        document.getElementById('reviewRecipient').textContent = name;
        document.getElementById('reviewBank').textContent = bank;
        document.getElementById('reviewAcctType').textContent =
            selectedAcctType === 'swift' ? 'SWIFT/BIC' :
                selectedAcctType === 'iban' ? 'IBAN' : 'Routing Number';
        document.getElementById('reviewAcctRef').textContent = acctRef;
        document.getElementById('reviewAcctNo').textContent = masked;
        document.getElementById('reviewRate').textContent =
            `₦1 = ${selectedCurrency.code} ${selectedCurrency.rate}`;
        document.getElementById('reviewFee').textContent =
            `₦${gtFormatMoney(selectedCurrency.fee)}`;
        document.getElementById('reviewPurpose').textContent = purpose;
    }

    currentStep = step;
    updateStepIndicators();
    showStep(step);
}

// ── SHOW STEP ──
function showStep(step) {
    [1, 2, 3, 4].forEach(s => {
        document.getElementById(`gtStep${s}`).style.display = s === step ? 'block' : 'none';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── UPDATE INDICATORS ──
function updateStepIndicators() {
    [1, 2, 3, 4].forEach(s => {
        const indicator = document.getElementById(`stepIndicator${s}`);
        indicator.classList.remove('active', 'done');
        if (s === currentStep) indicator.classList.add('active');
        if (s < currentStep) indicator.classList.add('done');
    });

    document.querySelectorAll('.gt-step-line').forEach((line, i) => {
        line.classList.toggle('done', i + 1 < currentStep);
    });
}

// ── CONFIRM TRANSFER ──
function confirmTransfer() {
    const amount = Number(document.getElementById('gtAmount').value);
    const total = amount + selectedCurrency.fee;
    const name = document.getElementById('gtRecipientName').value.trim();
    const converted = (amount * selectedCurrency.rate).toFixed(2);
    const purpose = document.getElementById('gtPurpose').value || '';

    if (total > balance) { alert('Insufficient balance!'); return; }

    balance -= total;

    transactions.push({
        title: `Global TRF — ${selectedCurrency.country}`,
        amount: amount,
        name: name,
        bank: document.getElementById('gtBankName').value,
        description: purpose,
        category: 'transfer',
        source: 'global',
        type: 'debit',
        time: new Date().toISOString()
    });

    saveData();

    const now = new Date();
    const time = now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true });
    const ref = 'DAFAH-GLB-' + Date.now().toString().slice(-6);

    document.getElementById('gtSubmitTime').textContent = `Today, ${time}`;
    document.getElementById('gtDeliveredTo').textContent = `Delivered to ${name}`;
    document.getElementById('receiptNaira').textContent = `₦${gtFormatMoney(amount)}`;
    document.getElementById('receiptConverted').textContent =
        `${selectedCurrency.code} ${Number(converted).toLocaleString()}`;
    document.getElementById('receiptRecipient').textContent = name;
    document.getElementById('receiptRef').textContent = ref;

    goToStep(4);
}

// ── SHARE RECEIPT ──
function shareReceipt() {
    const amount = Number(document.getElementById('gtAmount').value);
    const name = document.getElementById('gtRecipientName').value;
    const converted = (amount * selectedCurrency.rate).toFixed(2);
    const ref = document.getElementById('receiptRef').textContent;

    const text = `DAFAH Bank — Global Transfer Receipt\n` +
        `Amount Sent: ₦${gtFormatMoney(amount)}\n` +
        `Recipient Gets: ${selectedCurrency.code} ${converted}\n` +
        `Recipient: ${name}\n` +
        `Reference: ${ref}\n` +
        `DAFAH Bank — Nigerian Digital Bank`;

    if (navigator.share) {
        navigator.share({ title: 'DAFAH Global Transfer', text });
    } else {
        navigator.clipboard.writeText(text).then(() => {
            alert('Receipt copied to clipboard!');
        });
    }
}

// ── RESET ──
function resetTransfer() {
    selectedCurrency = null;
    selectedAcctType = 'swift';
    document.getElementById('gtAmount').value = '';
    document.getElementById('gtAmountWords').textContent = '';
    document.getElementById('gtRecipientName').value = '';
    document.getElementById('gtBankName').value = '';
    document.getElementById('gtSwiftCode').value = '';
    document.getElementById('gtSwiftResult').textContent = '';
    document.getElementById('gtIban').value = '';
    document.getElementById('gtRouting').value = '';
    document.getElementById('gtAcctNumber').value = '';
    document.getElementById('gtPurpose').value = '';
    document.getElementById('gtSelectedFlag').textContent = '🌍';
    document.getElementById('gtSelectedCode').textContent = 'Select';
    document.getElementById('gtSelectedCountry').textContent = 'Country';
    document.getElementById('gtConvertedAmount').textContent = '0.00';
    document.getElementById('gtRateDisplay').textContent = 'Select country';
    document.getElementById('gtFeeDisplay').textContent = '—';
    goToStep(1);
}

// ── CLOSE DROPDOWN ON OUTSIDE CLICK ──
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('gtDropdown');
    const selector = document.getElementById('gtCountrySelector');
    if (!dropdown.contains(e.target) && !selector.contains(e.target)) {
        dropdown.style.display = 'none';
        document.getElementById('gtChevron').classList.remove('open');
    }
});

// ── INIT ──
renderCountryList();
loadLiveRates();