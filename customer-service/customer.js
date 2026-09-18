//  ══════════════════════════════════════
//    DAFAH BANK — CUSTOMER SERVICE JS
//    Author: DAFAH Bank Dev Team
// ══════════════════════════════════════

/* ══════════════════════════════════════
   USER DATA
   Replace with real user data from
   localStorage or Flask session later
══════════════════════════════════════ */
const currentUser =
    JSON.parse(localStorage.getItem('current_user'));

const DAFAH_USER = {
    name: currentUser
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : 'Customer',

    accountNumber: currentUser
        ? currentUser.accountNumber
        : '0000000000',

    balance: currentUser
        ? currentUser.balance
        : 0
};


/* ══════════════════════════════════════
   HELPER — FORMAT MONEY
══════════════════════════════════════ */
function formatMoney(amount) {
    return Number(amount).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/* ══════════════════════════════════════
   HELPER — GET GREETING
══════════════════════════════════════ */
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
}

/* ══════════════════════════════════════
   HELPER — GET CURRENT TIME
══════════════════════════════════════ */
function getCurrentTime() {
    return new Date().toLocaleTimeString('en-NG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

/* ══════════════════════════════════════
   AI RESPONSE MAP
   All responses stored here for easy
   Flask replacement later.
   
   To connect Flask:
   Replace each string/function with
   an API call to /chat endpoint.
══════════════════════════════════════ */
const DAFAH_RESPONSES = {

    /* ── GREETING ── */
    greeting: () => `
        ${getGreeting()}, ${DAFAH_USER.name}! 👋<br><br>
        Welcome to <strong>Dafah Bank 24/7 Customer Service</strong>.<br>
        I am Dafah AI banking assistant, your 24/7 virtual banking support agent.<br><br>
        How may I assist you today?
    `,

    /* ── NAME ── */
    name: () => `
        Your registered name is <strong>${DAFAH_USER.name}</strong>.<br><br>
        If you believe there is an error with your name, please visit your nearest Dafah Bank branch or contact our support team.
    `,

    /* ── WHO AM I ── */
    whoami: () => `
        You are <strong>${DAFAH_USER.name}</strong>, a valued Dafah Bank customer. 🌟<br><br>
        Your account is active and in good standing. We appreciate your trust in Dafah Bank!
    `,

    /* ── ACCOUNT NUMBER ── */
    accountNumber: () => `
        Your Dafah Bank account number is:<br><br>
        <strong style="font-size:18px; letter-spacing:2px;">${DAFAH_USER.accountNumber}</strong><br><br>
        Please keep your account number secure and do not share it with unauthorized individuals.
    `,

    /* ── BALANCE ── */
    balance: () => `
        Your current available balance is:<br><br>
        <strong style="font-size:20px; color:#16a34a;">₦${formatMoney(DAFAH_USER.balance)}</strong><br><br>
        This reflects your real-time account balance as of <strong>${getCurrentTime()}</strong> today.<br><br>
        <em style="font-size:12px; color:#6b7280;">Balance information is updated in real-time.</em>
    `,

    /* ── ABOUT DAFAH ── */
    aboutDafah: `
        <strong>About Dafah Bank 🏦</strong><br><br>
        Dafah Bank is a modern digital banking platform designed to provide secure, fast, and convenient financial services to customers.<br><br>
        <strong>Our services include:</strong><br>
        • Free Dafah-to-Dafah transfers<br>
        • Local bank transfers<br>
        • Global money transfers to supported countries<br>
        • Secure account management<br>
        • Real-time balance monitoring<br>
        • Transaction history tracking<br>
        • Account statement generation<br>
        • Loan services<br>
        • 24/7 AI Customer Support<br>
        • Fast and secure digital banking experience<br><br>
        Global transfers are available to supported countries and typically arrive within <strong>1–3 business days</strong> depending on the destination country and banking network.<br><br>
        Dafah Bank is committed to making banking <strong>simple, secure, accessible, and reliable</strong> for customers worldwide. 🌍
    `,

    /* ── DAFAH LOAN ── */
    dafahLoan: `
        <strong>Dafah Loan Services 💰</strong><br><br>
        Dafah Loan is designed to help eligible customers access financial support when needed.<br><br>
        <strong>Benefits include:</strong><br>
        • Fast and easy application process<br>
        • Flexible repayment options<br>
        • Competitive interest rates<br>
        • Secure and transparent loan management<br>
        • Quick approval for eligible customers<br><br>
        Customers can visit the <strong>Loan section</strong> of the Dafah Bank dashboard to learn more about available loan products and eligibility requirements.<br><br>
        <em style="font-size:12px; color:#6b7280;">Loan availability is subject to eligibility criteria and terms and conditions.</em>
    `,

    /* ── TRANSACTIONS (redirect) ── */
    transactions: 'REDIRECT_TRANSACTIONS',

    /* ── STATEMENT (redirect) ── */
    statement: 'REDIRECT_STATEMENT',

    /* ── FALLBACK ── */
    fallback: `
        I'm sorry, I didn't quite understand that. 🤔<br><br>
        I can help you with:<br>
        • <strong>Balance</strong> — Check your account balance<br>
        • <strong>Account Number</strong> — View your account number<br>
        • <strong>About Dafah</strong> — Learn about our services<br>
        • <strong>Dafah Loan</strong> — Loan information<br>
        • <strong>Transactions</strong> — View transaction history<br>
        • <strong>Statement</strong> — Generate account statement<br><br>
        Please try one of the <strong>Quick Action buttons</strong> below, or rephrase your question.
    `,
};


/* ══════════════════════════════════════
   INTENT DETECTOR
   Detects what the user is asking
   Replace this with Flask NLP later
══════════════════════════════════════ */
function detectIntent(message) {
    const msg = message.toLowerCase().trim();

    /* Greeting */
    if (
        ['hi', 'hello', 'hey', 'howdy', 'greetings'].includes(msg) ||
        msg.includes('good morning') ||
        msg.includes('good afternoon') ||
        msg.includes('good evening')
    ) return 'greeting';


    /* Name */
    if (
        msg.includes('my name') || msg.includes('what is my name') ||
        msg.includes("what's my name") || msg.includes('full name')
    ) return 'name';

    /* Who am I */
    if (
        msg.includes('who am i') || msg.includes('who are you') ||
        msg.includes('tell me about me') || msg.includes('my profile')
    ) return 'whoami';

    /* Account Number */
    if (
        msg.includes('account number') || msg.includes('acct number') ||
        msg.includes('my number') || msg.includes('account no') ||
        msg.includes('what is my account')
    ) return 'accountNumber';

    /* Balance */
    if (
        msg.includes('balance') || msg.includes('how much') ||
        msg.includes('my money') || msg.includes('available funds') ||
        msg.includes('check balance') || msg.includes('my balance')
    ) return 'balance';

    /* About Dafah */
    if (
        msg.includes('about dafah') || msg.includes('tell me about dafah') ||
        msg.includes('what is dafah') || msg.includes('dafah bank') ||
        msg.includes('about the bank') || msg.includes('your services') ||
        msg.includes('what do you offer') || msg.includes('dafah services')
    ) return 'aboutDafah';

    /* Dafah Loan */
    if (
        msg.includes('loan') || msg.includes('dafah loan') ||
        msg.includes('borrow') || msg.includes('credit') ||
        msg.includes('lending') || msg.includes('financial support')
    ) return 'dafahLoan';

    /* Transactions */
    if (
        msg.includes('transaction') || msg.includes('history') ||
        msg.includes('transfers') || msg.includes('show transaction') ||
        msg.includes('payment history') || msg.includes('my transactions')
    ) return 'transactions';

    /* Statement */
    if (
        msg.includes('statement') || msg.includes('generate statement') ||
        msg.includes('account statement') || msg.includes('export') ||
        msg.includes('download statement') || msg.includes('pdf')
    ) return 'statement';

    /* Fallback */
    return 'fallback';
}


/* ══════════════════════════════════════
   GET MOCK RESPONSE
   Central response handler.
   FLASK INTEGRATION POINT:
   Replace this function body with
   a fetch() API call to Flask /chat
══════════════════════════════════════ */
function getMockResponse(intent) {
    switch (intent) {
        case 'greeting': return DAFAH_RESPONSES.greeting();
        case 'name': return DAFAH_RESPONSES.name();
        case 'whoami': return DAFAH_RESPONSES.whoami();
        case 'accountNumber': return DAFAH_RESPONSES.accountNumber();
        case 'balance': return DAFAH_RESPONSES.balance();
        case 'aboutDafah': return DAFAH_RESPONSES.aboutDafah;
        case 'dafahLoan': return DAFAH_RESPONSES.dafahLoan;
        case 'transactions': return DAFAH_RESPONSES.transactions;
        case 'statement': return DAFAH_RESPONSES.statement;
        default: return DAFAH_RESPONSES.fallback;
    }
}


/* ══════════════════════════════════════
   RENDER WELCOME CARD
══════════════════════════════════════ */
function renderWelcomeCard() {
    const chatWindow = document.getElementById('chatWindow');

    const card = document.createElement('div');
    card.className = 'cs-welcome-card';
    card.innerHTML = `
        <p class="cs-welcome-greeting">${getGreeting()},</p>
        <p class="cs-welcome-name">${DAFAH_USER.name} 👋</p>
        <p class="cs-welcome-msg">
            Welcome to <strong>Dafah Bank 24/7 Customer Service</strong>.<br>
            I'm your AI banking assistant. How may I assist you today?
        </p>
        <div class="cs-welcome-divider"></div>
        <div class="cs-welcome-tips">
            <span class="cs-tip-chip">💰 Check Balance</span>
            <span class="cs-tip-chip">🔢 Account Number</span>
            <span class="cs-tip-chip">🏦 About Dafah</span>
            <span class="cs-tip-chip">💳 Loan Info</span>
        </div>
    `;

    chatWindow.appendChild(card);
    scrollToBottom();
}


/* ══════════════════════════════════════
   RENDER USER MESSAGE
══════════════════════════════════════ */
function renderUserMessage(text) {
    const chatWindow = document.getElementById('chatWindow');

    const row = document.createElement('div');
    row.className = 'cs-msg-row user';
    row.innerHTML = `
        <div class="cs-msg-avatar">
            <i class="fa-solid fa-user"></i>
        </div>
        <div class="cs-msg-content">
            <div class="cs-bubble">${escapeHTML(text)}</div>
            <p class="cs-msg-time">${getCurrentTime()}</p>
        </div>
    `;

    chatWindow.appendChild(row);
    scrollToBottom();
}


/* ══════════════════════════════════════
   RENDER AI MESSAGE
══════════════════════════════════════ */
function renderAIMessage(html) {
    const chatWindow = document.getElementById('chatWindow');

    const row = document.createElement('div');
    row.className = 'cs-msg-row ai';
    row.innerHTML = `
        <div class="cs-msg-avatar">
            <i class="fa-solid fa-robot"></i>
        </div>
        <div class="cs-msg-content">
            <div class="cs-bubble">${html}</div>
            <p class="cs-msg-time">${getCurrentTime()}</p>
        </div>
    `;

    chatWindow.appendChild(row);
    scrollToBottom();
}


/* ══════════════════════════════════════
   RENDER REDIRECT CARD
   For transactions and statement
══════════════════════════════════════ */
function renderRedirectCard(type) {
    const chatWindow = document.getElementById('chatWindow');

    let message, link, icon, btnText;

    if (type === 'REDIRECT_TRANSACTIONS') {
        message = `I'll take you to your <strong>Transaction History</strong> page where you can view all your past transactions, filter by date, and see full details.`;
        link = '/transaction-history-section/transaction.html';
        icon = 'fa-receipt';
        btnText = 'View Transaction History';
    } else {
        message = `I'll take you to the <strong>Statement Generator</strong> page where you can generate and download your account statement as PDF or CSV.`;
        link = '/statement-section/generate-statement.html';
        icon = 'fa-file-export';
        btnText = 'Generate Statement';
    }

    const row = document.createElement('div');
    row.className = 'cs-msg-row ai';
    row.innerHTML = `
        <div class="cs-msg-avatar">
            <i class="fa-solid fa-robot"></i>
        </div>
        <div class="cs-msg-content">
            <div class="cs-bubble">
                <div class="cs-redirect-card">
                    <p>${message}</p>
                    <a href="${link}" class="cs-redirect-btn">
                        <i class="fa-solid ${icon}"></i>
                        ${btnText}
                    </a>
                </div>
            </div>
            <p class="cs-msg-time">${getCurrentTime()}</p>
        </div>
    `;

    chatWindow.appendChild(row);
    scrollToBottom();
}


/* ══════════════════════════════════════
   SHOW TYPING INDICATOR
══════════════════════════════════════ */
function showTyping() {
    const chatWindow = document.getElementById('chatWindow');

    const typing = document.createElement('div');
    typing.className = 'cs-typing-row';
    typing.id = 'typingIndicator';
    typing.innerHTML = `
        <div class="cs-msg-avatar">
            <i class="fa-solid fa-robot"></i>
        </div>
        <div class="cs-typing-bubble">
            <div class="cs-dot"></div>
            <div class="cs-dot"></div>
            <div class="cs-dot"></div>
        </div>
    `;

    chatWindow.appendChild(typing);
    scrollToBottom();
}


/* ══════════════════════════════════════
   REMOVE TYPING INDICATOR
══════════════════════════════════════ */
function removeTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
}


/* ══════════════════════════════════════
   SCROLL TO BOTTOM
══════════════════════════════════════ */
function scrollToBottom() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.scrollTop = chatWindow.scrollHeight;
}


/* ══════════════════════════════════════
   ESCAPE HTML — SECURITY
   Prevents XSS from user input
══════════════════════════════════════ */
function escapeHTML(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}


/* ══════════════════════════════════════
   SEND MESSAGE — MAIN FUNCTION
   
   FLASK INTEGRATION POINT:
   Replace getMockResponse() with:
   
   const res = await fetch("http://127.0.0.1:5000/chat", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ message: userMessage, user: DAFAH_USER })
   });
   const data = await res.json();
   const reply = data.reply;
══════════════════════════════════════ */

async function getFlaskResponse(message) {
    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, user: DAFAH_USER })
        });

        if (!res.ok) throw new Error(`Chat server returned ${res.status}`);
        const data = await res.json();
        if (!data || typeof data.reply !== 'string') throw new Error('Invalid chat response');
        return data.reply;
    } catch (error) {
        // The Flask service is optional during local/static frontend use.
        console.warn('Flask chat unavailable; using local assistant:', error.message);
        return getMockResponse(detectIntent(message));
    }
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const message = input.value.trim();

    /* Ignore empty messages */
    if (!message) return;

    /* Clear input and disable button */
    input.value = '';
    sendBtn.disabled = true;
    input.disabled = true;

    /* Render user message */
    renderUserMessage(message);

    /* Show typing indicator */
    showTyping();

    /* Simulate AI thinking delay (300ms - 1200ms) */
    const delay = Math.floor(Math.random() * 900) + 300;

    await new Promise(resolve => setTimeout(resolve, delay));

    /* Remove typing indicator */
    removeTyping();

    /* Get response */
    try {
        const response = await getFlaskResponse(message);

        if (response === 'REDIRECT_TRANSACTIONS' || response === 'REDIRECT_STATEMENT') {
            renderRedirectCard(response);
        } else {
            renderAIMessage(response);
        }
    } catch (error) {
        console.error('Unable to generate assistant response:', error);
        renderAIMessage('I’m temporarily unable to respond. Please try again.');
    } finally {
        removeTyping();
        sendBtn.disabled = false;
        input.disabled = false;
        input.focus();
    }
}


/* ══════════════════════════════════════
   SEND QUICK ACTION MESSAGE
══════════════════════════════════════ */
function sendQuick(message) {
    const input = document.getElementById('messageInput');
    input.value = message;
    sendMessage();
}


/* ══════════════════════════════════════
   HANDLE ENTER KEY
══════════════════════════════════════ */
function handleEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}


/* ══════════════════════════════════════
   SYNC USER DATA FROM LOCALSTORAGE
   Reads real balance and user data
   from the dashboard's data.js
══════════════════════════════════════ */
function syncUserData() {
    try {
        /* Read balance from localStorage if available */
        const savedBalance = localStorage.getItem('dafah_balance');
        if (savedBalance) {
            DAFAH_USER.balance = JSON.parse(savedBalance);
        }

        /* Read transactions if needed */
        const savedTransactions = localStorage.getItem('dafah_transactions');
        if (savedTransactions) {
            /* Available for future use */
        }
    } catch (e) {
        console.warn('Could not sync user data from localStorage:', e);
    }
}


/* ══════════════════════════════════════
   INIT — ON PAGE LOAD
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

    /* Sync user data from localStorage */
    syncUserData();

    /* Render welcome card */
    renderWelcomeCard();

    /* Focus input */
    const input = document.getElementById('messageInput');
    if (input) input.focus();

});
