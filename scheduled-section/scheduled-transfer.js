console.log("Scheduled Transfer Loaded");

// ── BANKS ──
const schBanks = [
    "Access Bank", "GTBank", "Opay", "PalmPay",
    "Kuda Microfinance Bank", "Moniepoint", "UBA",
    "First Bank", "Zenith Bank", "Fidelity Bank", "DAFAH"
];

// ── STATE ──
let schedules = JSON.parse(localStorage.getItem('dafah_schedules')) || [];
let selectedFreq = "Daily";
let selectedBank = "";

// ── SAVE SCHEDULES ──
function saveSchedules() {
    localStorage.setItem('dafah_schedules', JSON.stringify(schedules));
}

// ── NUMBER TO WORDS ──
function schNumberToWords(num) {
    const ones = ['','one','two','three','four','five','six','seven',
        'eight','nine','ten','eleven','twelve','thirteen','fourteen',
        'fifteen','sixteen','seventeen','eighteen','nineteen'];
    const tens = ['','','twenty','thirty','forty','fifty',
        'sixty','seventy','eighty','ninety'];
    if (num === 0) return '';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? ' '+ones[num%10] : '');
    if (num < 1000) return ones[Math.floor(num/100)] + ' hundred' + (num%100 ? ' '+schNumberToWords(num%100) : '');
    if (num < 1000000) return schNumberToWords(Math.floor(num/1000)) + ' thousand' + (num%1000 ? ' '+schNumberToWords(num%1000) : '');
    return schNumberToWords(Math.floor(num/1000000)) + ' million' + (num%1000000 ? ' '+schNumberToWords(num%1000000) : '');
}

// ── FORMAT MONEY ──
function schFormatMoney(val) {
    return Number(val).toLocaleString('en-NG');
}

// ── FORMAT DATE ──
function schFormatDate(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-NG', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

// ── SHOW VIEW ──
function showView(view) {
    ['Form','Confirm','Success'].forEach(v => {
        document.getElementById('view'+v).style.display =
            v.toLowerCase() === view ? 'block' : 'none';
    });
}

// ── RENDER LIST ──
function renderSchedules() {
    const list = document.getElementById('scheduleList');
    const empty = document.getElementById('scheduleEmpty');
    const count = document.getElementById('scheduleCount');

    if (schedules.length === 0) {
        list.style.display = 'none';
        empty.style.display = 'block';
        count.textContent = '0 active';
        return;
    }

    list.style.display = 'block';
    empty.style.display = 'none';

    const active = schedules.filter(s => s.status === 'active').length;
    count.textContent = `${active} active`;

    list.innerHTML = schedules.map((s, i) => `
        <div class="schedule-item">
            <div class="schedule-item-top">
                <div class="schedule-item-left">
                    <div class="schedule-icon">🔄</div>
                    <div>
                        <p class="schedule-title">${s.description || s.freq + ' Transfer'}</p>
                        <p class="schedule-subtitle">To: ${s.name.toUpperCase()}</p>
                    </div>
                </div>
                <span class="schedule-amount">-₦${schFormatMoney(s.amount)}</span>
            </div>

            <div class="schedule-tags">
                <span class="tag tag-freq">${s.freq}</span>
                    <span class="tag tag-date">⏰ ${s.time || '08:00'}</span>
                <span class="tag tag-date">Next: ${schFormatDate(s.nextDate)}</span>
                <span class="tag ${s.status === 'active' ? 'tag-active' : 'tag-paused'}">
                    ${s.status === 'active' ? '● Active' : '⏸ Paused'}
                </span>
            </div>

            <div class="schedule-actions">
                ${s.status === 'active'
                    ? `<button class="sch-pause-btn" onclick="toggleSchedule(${i})">Pause</button>`
                    : `<button class="sch-resume-btn" onclick="toggleSchedule(${i})">Resume</button>`
                }
                <button class="sch-delete-btn" onclick="deleteSchedule(${i})">Delete</button>
            </div>
        </div>
    `).join('');
}

// ── TOGGLE PAUSE/RESUME ──
function toggleSchedule(i) {
    schedules[i].status = schedules[i].status === 'active' ? 'paused' : 'active';
    saveSchedules();
    renderSchedules();
}

// ── DELETE ──
function deleteSchedule(i) {
    if (confirm('Delete this scheduled transfer?')) {
        schedules.splice(i, 1);
        saveSchedules();
        renderSchedules();
    }
}

// ── RESET FORM ──
function resetForm() {
    document.getElementById('schAccount').value = '';
    document.getElementById('schReceiverName').textContent = '';
    document.getElementById('schBankSearch').value = '';
    document.getElementById('schAmount').value = '';
    document.getElementById('schAmountWords').textContent = '';
    document.getElementById('schDescription').value = '';
    document.getElementById('schStartDate').value = '';
    selectedBank = '';
    selectedFreq = 'Daily';
    document.querySelectorAll('.freq-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.freq === 'Daily');
    });
}

// ── ACCOUNT LOOKUP ──
document.getElementById('schAccount').addEventListener('input', function() {
    const nameEl = document.getElementById('schReceiverName');
    if (this.value.length >= 10) {
        nameEl.textContent = '✓ Daniel Adekunle';
    } else {
        nameEl.textContent = '';
    }
});

// ── BANK SEARCH ──
const schBankSearch = document.getElementById('schBankSearch');
const schBankResults = document.getElementById('schBankResults');

schBankSearch.addEventListener('input', () => {
    const val = schBankSearch.value.toLowerCase();
    schBankResults.innerHTML = '';
    if (!val) return;

    schBanks
        .filter(b => b.toLowerCase().includes(val))
        .forEach(bank => {
            const div = document.createElement('div');
            div.className = 'sch-bank-item';
            div.textContent = bank;
            div.addEventListener('click', () => {
                schBankSearch.value = bank;
                selectedBank = bank;
                schBankResults.innerHTML = '';
            });
            schBankResults.appendChild(div);
        });
});

// ── AMOUNT WORDS ──
document.getElementById('schAmount').addEventListener('input', function() {
    const val = Number(this.value);
    const words = document.getElementById('schAmountWords');
    words.textContent = val > 0 ? schNumberToWords(val) + ' naira' : '';
});

// ── FREQUENCY BUTTONS ──
document.querySelectorAll('.freq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.freq-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFreq = btn.dataset.freq;
    });
});

// ── PROCEED TO CONFIRM ──
document.getElementById('schProceedBtn').addEventListener('click', () => {
    const account = document.getElementById('schAccount').value;
    const amount  = document.getElementById('schAmount').value;
    const date    = document.getElementById('schStartDate').value;
    const name    = document.getElementById('schReceiverName').textContent.replace('✓ ', '');

    if (!account || account.length < 10) {
        alert('Please enter a valid account number'); return;
    }
    if (!selectedBank) {
        alert('Please select a bank'); return;
    }
    if (!amount || Number(amount) <= 0) {
        alert('Please enter a valid amount'); return;
    }
    if (!date) {
        alert('Please select a start date'); return;
    }

    const desc = document.getElementById('schDescription').value || '—';

    document.getElementById('confirmAmount').textContent = `₦${schFormatMoney(amount)}`;
    document.getElementById('confirmSub').textContent =
        `Every ${selectedFreq.toLowerCase()} • Starting ${schFormatDate(date)}`;
    document.getElementById('confirmName').textContent = name.toUpperCase();
    document.getElementById('confirmBank').textContent = selectedBank;
    document.getElementById('confirmFreq').textContent = selectedFreq;
    document.getElementById('confirmDate').textContent = schFormatDate(date);
    document.getElementById('confirmDesc').textContent = desc;
    document.getElementById('confirmWarning').textContent =
        `₦${schFormatMoney(amount)} will be automatically debited from your account ${selectedFreq.toLowerCase()}. Ensure you have sufficient balance.`;

    showView('confirm');
});

// ── CONFIRM SCHEDULE ──
document.getElementById('schConfirmBtn').addEventListener('click', () => {
    const amount = Number(document.getElementById('schAmount').value);
    const date   = document.getElementById('schStartDate').value;
    const name   = document.getElementById('schReceiverName').textContent.replace('✓ ','');
    const desc   = document.getElementById('schDescription').value || '';


      const time = document.getElementById('schTime').value;
    if (!time) {
        alert('Please select a transfer time');
        return;
    }

    const newSchedule = {
        name: name,
        bank: selectedBank,
        amount: amount,
        freq: selectedFreq,
        startDate: date,
        nextDate: date,
        time: document.getElementById('schTime').value || '08:00',
        description: desc,
        status: 'active',
        createdAt: new Date().toISOString()
    };

    schedules.push(newSchedule);
    saveSchedules();
    renderSchedules();

    // success screen
    document.getElementById('successSub').textContent =
        `₦${schFormatMoney(amount)} to ${name.toUpperCase()} will run ${selectedFreq.toLowerCase()} starting ${schFormatDate(date)}`;
    document.getElementById('successNextDate').textContent = schFormatDate(date);
    document.getElementById('successAmount').textContent = `-₦${schFormatMoney(amount)}`;

    showView('success');
    resetForm();
});

// ── NEW SCHEDULE BTN ──
document.getElementById('newScheduleBtn').addEventListener('click', () => {
    showView('form');
});

// ── INIT ──
renderSchedules();