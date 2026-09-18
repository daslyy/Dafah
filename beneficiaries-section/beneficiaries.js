console.log("Beneficiaries JS Loaded");

// ── BANKS ──
const benBanks = [
    "Access Bank", "GTBank", "Opay", "PalmPay",
    "Kuda Microfinance Bank", "Moniepoint", "UBA",
    "First Bank", "Zenith Bank", "Fidelity Bank", "DAFAH"
];

// ── AVATAR COLORS ──
const avatarColors = ['av-green', 'av-pink', 'av-blue', 'av-orange', 'av-purple'];

// ── STATE ──
let beneficiaries = JSON.parse(localStorage.getItem('dafah_beneficiaries')) || [];
let selectedBenBank = '';
let selectedBenName = '';
let activeBenIndex = -1;

// ── SAVE ──
function saveBeneficiaries() {
    localStorage.setItem('dafah_beneficiaries', JSON.stringify(beneficiaries));
}

// ── GET INITIALS ──
function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ── GET AVATAR COLOR ──
function getAvatarColor(index) {
    return avatarColors[index % avatarColors.length];
}

// ── NUMBER TO WORDS ──
function benNumberToWords(num) {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
        'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
        'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty',
        'sixty', 'seventy', 'eighty', 'ninety'];
    if (num === 0) return '';
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' ' + benNumberToWords(num % 100) : '');
    if (num < 1000000) return benNumberToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 ? ' ' + benNumberToWords(num % 1000) : '');
    return benNumberToWords(Math.floor(num / 1000000)) + ' million' + (num % 1000000 ? ' ' + benNumberToWords(num % 1000000) : '');
}

// ── FORMAT MONEY ──
function benFormatMoney(val) {
    return Number(val).toLocaleString('en-NG');
}

// ── SHOW VIEW ──
function showView(view) {
    document.getElementById('viewAdd').style.display = view === 'add' ? 'block' : 'none';
    document.getElementById('viewSend').style.display = view === 'send' ? 'block' : 'none';
    document.getElementById('viewDefault').style.display = view === 'none' ? 'block' : 'none';

    if (view !== 'send') {
        resetSendForm();
    }
    if (view !== 'add') {
        resetAddForm();
    }
}

// ── RENDER LIST ──
function renderBeneficiaries(filter = '') {
    const list = document.getElementById('benList');
    const empty = document.getElementById('benEmpty');
    const count = document.getElementById('benCount');

    const filtered = beneficiaries.filter(b =>
        b.name.toLowerCase().includes(filter.toLowerCase()) ||
        b.account.includes(filter) ||
        (b.nickname && b.nickname.toLowerCase().includes(filter.toLowerCase()))
    );

    count.textContent = `${beneficiaries.length} saved`;

    if (beneficiaries.length === 0) {
        list.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    list.style.display = 'flex';
    empty.style.display = 'none';

    if (filtered.length === 0) {
        list.innerHTML = `<p style="text-align:center; color:#9ca3af; padding:20px; font-size:13px;">No results found</p>`;
        return;
    }

    list.innerHTML = filtered.map((b, i) => `
        <div class="ben-item">
            <div class="ben-item-left">
                <div class="ben-avatar ${getAvatarColor(i)}">
                    ${getInitials(b.name)}
                </div>
                <div>
                    <p class="ben-item-name">${b.name}</p>
                    <p class="ben-item-info">${b.account} • ${b.bank}</p>
                    <p class="ben-item-nick">${b.nickname || '—'}</p>
                </div>
            </div>
            <div class="ben-item-actions">
                <button class="ben-send-sm" onclick="openSend(${beneficiaries.indexOf(b)})">Send</button>
                <button class="ben-delete-sm" onclick="deleteBen(${beneficiaries.indexOf(b)})">✕</button>
            </div>
        </div>
    `).join('');
}

// ── DELETE ──
function deleteBen(i) {
    if (confirm(`Remove ${beneficiaries[i].name} from beneficiaries?`)) {
        beneficiaries.splice(i, 1);
        saveBeneficiaries();
        renderBeneficiaries();
        showView('none');
    }
}

// ── OPEN SEND ──
function openSend(i) {
    activeBenIndex = i;
    const b = beneficiaries[i];

    document.getElementById('sendAvatar').textContent = getInitials(b.name);
    document.getElementById('sendAvatar').className = `ben-avatar ${getAvatarColor(i)}`;
    document.getElementById('sendName').textContent = b.name;
    document.getElementById('sendInfo').textContent = `${b.account} • ${b.bank}`;
    document.getElementById('sendNick').textContent = b.nickname || '';

    // show fee warning only for non-DAFAH
    document.getElementById('benFeeWarn').style.display =
        b.bank === 'DAFAH' ? 'none' : 'flex';

    showView('send');
}

// ── SEARCH ──
document.getElementById('benSearch').addEventListener('input', function () {
    renderBeneficiaries(this.value);
});

// ── ADD BTN ──
document.getElementById('benAddBtn').addEventListener('click', () => {
    showView('add');
});

// ── ACCOUNT LOOKUP ──
// ── ACCOUNT NAME AUTOMATICALLY ──

document.getElementById('benAccount').addEventListener('input', function () {
       
    const input = this;

    // Allow only numbers
    input.value = input.value.replace(/\D/g, '');


    const account = this.value.trim();
    const hint = document.getElementById('benAccountHint');
    const accountName = document.getElementById('benAccountName');

    // reset every time user types
    selectedBenName = "";
    accountName.value = "";

    if (account.length === 0) {
        hint.textContent = "";
        hint.className = "ben-account-hint";
    }

    else if (account.length < 10) {
        hint.textContent =
            `${10 - account.length} more digit${10 - account.length > 1 ? "s" : ""} needed`;
        hint.className = "ben-account-hint warn";
    }

    else if (account.length === 10 && /^\d+$/.test(account)) {

        hint.textContent = "Verifying account...";
        hint.className = "ben-account-hint warn";

        setTimeout(() => {

            selectedBenName = "Obioma Chioma";

            accountName.value = selectedBenName;

            hint.textContent = "✓ Account verified";
            hint.className = "ben-account-hint success";

            updatePreview();
            checkSaveBtn();

        }, 1000);

        return;
    }

    else {

        hint.textContent =
            `Too long — remove ${account.length - 10} digit${account.length - 10 > 1 ? "s" : ""}`;

        hint.className = "ben-account-hint error";
    }

    updatePreview();
    checkSaveBtn();

});

// ── BANK SEARCH ──
document.getElementById('benBankSearch').addEventListener('input', function () {
    const val = this.value.toLowerCase();
    const results = document.getElementById('benBankResults');
    results.innerHTML = '';
    selectedBenBank = '';
    checkSaveBtn();

    if (!val) return;

    benBanks
        .filter(b => b.toLowerCase().includes(val))
        .forEach(bank => {
            const div = document.createElement('div');
            div.className = 'ben-bank-item';
            div.textContent = bank;
            div.addEventListener('click', () => {
                document.getElementById('benBankSearch').value = bank;
                selectedBenBank = bank;
                results.innerHTML = '';
                updatePreview();
                checkSaveBtn();
            });
            results.appendChild(div);
        });
});

// ── NICKNAME INPUT ──
document.getElementById('benNickname').addEventListener('input', updatePreview);

// ── UPDATE PREVIEW ──
function updatePreview() {
    const card = document.getElementById('benPreviewCard');
    if (selectedBenName && selectedBenBank) {
        const account = document.getElementById('benAccount').value;
        const nickname = document.getElementById('benNickname').value;
        const initials = getInitials(selectedBenName);

        document.getElementById('benPreviewAvatar').textContent = initials;
        document.getElementById('benPreviewAvatar').className = 'ben-avatar av-green';
        document.getElementById('benPreviewName').textContent = selectedBenName;
        document.getElementById('benPreviewInfo').textContent = `${account} • ${selectedBenBank}`;
        document.getElementById('benPreviewNick').textContent = nickname || '';
        card.style.display = 'flex';
    } else {
        card.style.display = 'none';
    }
}

// ── CHECK SAVE BTN ──
function checkSaveBtn() {

    const btn = document.getElementById('benSaveBtn');
    const hint = document.getElementById('benSaveHint');
    const account = document.getElementById('benAccount').value;

    const ready =
        selectedBenName &&
        selectedBenBank &&
        account.length === 10;

    btn.disabled = !ready;
    hint.style.display = ready ? 'none' : 'block';
}

// ── SAVE BENEFICIARY ──
document.getElementById('benSaveBtn').addEventListener('click', () => {
    const account = document.getElementById('benAccount').value;
    const nickname = document.getElementById('benNickname').value;

    // check duplicate
    const exists = beneficiaries.find(b =>
        b.account === account && b.bank === selectedBenBank
    );
    if (exists) {
        alert(`${selectedBenName} (${selectedBenBank}) is already saved!`);
        return;
    }

    beneficiaries.push({
        name: selectedBenName,
        account: account,
        bank: selectedBenBank,
        nickname: nickname,
        addedAt: new Date().toISOString()
    });

    saveBeneficiaries();
    renderBeneficiaries();
    resetAddForm();
    showView('none');
});

// ── AMOUNT WORDS ──
document.getElementById('sendAmount').addEventListener('input', function () {
    const val = Number(this.value);
    const words = document.getElementById('sendAmountWords');
    words.textContent = val > 0 ? benNumberToWords(val) + ' naira' : '';

    // update send button
    const btn = document.getElementById('benSendBtn');
    btn.textContent = val > 0 ? `Send ₦${benFormatMoney(val)}` : 'Send Money';
});

// ── SEND MONEY ──
document.getElementById('benSendBtn').addEventListener('click', () => {
    const amount = Number(document.getElementById('sendAmount').value);
    const desc = document.getElementById('sendDescription').value || '';
    const b = beneficiaries[activeBenIndex];

    if (!amount || amount <= 0) {
        document.getElementById('sendAmount').style.borderColor = '#dc2626';
        setTimeout(() => document.getElementById('sendAmount').style.borderColor = '', 1000);
        return;
    }

    const fee = b.bank === 'DAFAH' ? 0 : 10;
    const total = amount + fee;

    if (total > balance) {
        alert('Insufficient balance!');
        return;
    }

    // hide form show loading
    document.getElementById('benSendBtn').style.display = 'none';
    document.getElementById('benFeeWarn').style.display = 'none';
    document.getElementById('benLoading').style.display = 'block';

    setTimeout(() => {
        // debit balance
        balance -= total;

        // add transaction
        const device = window.innerWidth <= 768 ? 'Mobile' : 'Desktop';
        const source = b.bank === 'DAFAH' ? 'dafah' : 'other';
        const prefix = source === 'dafah' ? `${device} DAFAH TRF` : `${device} TRF`;
        const title = desc ? `${prefix} — ${desc}` : prefix;

        transactions.push({
            title: title,
            amount: amount,
            name: b.name,
            bank: b.bank,
            description: desc,
            category: 'transfer',
            source: source,
            type: 'debit',
            time: new Date().toISOString()
        });

        saveData();

        // show success
        document.getElementById('benLoading').style.display = 'none';
        document.getElementById('benSuccess').style.display = 'block';
        document.getElementById('benSuccessSub').textContent =
            `₦${benFormatMoney(amount)} sent to ${b.name} successfully`;

    }, 2000);
});

// ── RESET FORMS ──
function resetAddForm() {
    document.getElementById('benAccount').value = '';
    document.getElementById('benAccountName').value = '';
    document.getElementById('benBankSearch').value = '';
    document.getElementById('benNickname').value = '';
    document.getElementById('benNameResult').textContent = '';
    document.getElementById('benBankResults').innerHTML = '';
    document.getElementById('benPreviewCard').style.display = 'none';
    selectedBenBank = '';
    selectedBenName = '';
    checkSaveBtn();
}


function resetSendForm() {
    document.getElementById('sendAmount').value = '';
    document.getElementById('sendDescription').value = '';
    document.getElementById('sendAmountWords').textContent = '';
    document.getElementById('benSendBtn').textContent = 'Send Money';
    document.getElementById('benSendBtn').style.display = 'block';
    document.getElementById('benLoading').style.display = 'none';
    document.getElementById('benSuccess').style.display = 'none';
    document.getElementById('benFeeWarn').style.display = 'flex';
    activeBenIndex = -1;
}

// ── INIT ──
renderBeneficiaries();
showView('none');