
let balance = 12450000;
let transactions = [
    {
        title: "Salary Payment",
        amount: 850000,
        name: "Employer Ltd",
        category: "deposit",
        type: "credit",
        time: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
    },
    {
        title: "Transfer to David",
        amount: 150000,
        name: "David Juwon",
        bank: "GTBank",
        description: "for rent",
        category: "transfer",
        source: "other",
        type: "debit",
        time: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString()
    },
    {
        title: "Netflix Subscription",
        amount: 18000,
        name: "Netflix",
        category: "bill",
        type: "debit",
        time: new Date(Date.now() - 86400000).toISOString()
    },
    {
        title: "Airtime Top Up",
        amount: 1000,
        name: "MTN",
        category: "airtime",
        type: "debit",
        time: new Date(Date.now() - 86400000 - 1000 * 60 * 30).toISOString()
    },
    {
        title: "Deposit from Sarah",
        amount: 250000,
        name: "Sarah Ade",
        category: "deposit",
        type: "credit",
        time: new Date(Date.now() - 86400000 * 5).toISOString()
    },
     {
        title: "Office Supplies",
        amount: 35000,
        name: "Shoprite",
        category: "bill",
        type: "debit",
        time: new Date(Date.now() - 86400000 * 5).toISOString()  // 5 days ago
    },
    {
        title: "Freelance Payment",
        amount: 500000,
        name: "Tech Client",
        category: "deposit",
        type: "credit",
        time: new Date(Date.now() - 86400000 * 6).toISOString()  // 6 days ago
    }
];


function saveData() {
    localStorage.setItem('dafah_balance', JSON.stringify(balance));
    localStorage.setItem('dafah_transactions', JSON.stringify(transactions));


       const currentUser = JSON.parse(localStorage.getItem('current_user'));

    if (currentUser) {
        currentUser.balance = balance;
        currentUser.transactions = transactions;

        localStorage.setItem(
            'current_user',
            JSON.stringify(currentUser)
        );

        // Keep the registered account in sync as well.  Without this, signing
        // out and back in restores the old balance and transaction history.
        const users = JSON.parse(localStorage.getItem('df_users')) || [];
        const userIndex = users.findIndex(user => user.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...currentUser };
            localStorage.setItem('df_users', JSON.stringify(users));
        }
    }
}

function toLocalDateStr(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}


// SCHEDULED TRANSFER DEBIT 
function processScheduledTransfers() {
    const schedules = JSON.parse(localStorage.getItem('dafah_schedules')) || [];
    const now       = new Date();
    const todayStr  = toLocalDateStr(now);
    let updated     = false;

    schedules.forEach(s => {
        if (s.status !== 'active') return;
        if (s.lastRan === todayStr) return;

        const [ny, nm, nd] = s.nextDate.split('-').map(Number);
        const nextDate = new Date(ny, nm - 1, nd);
        nextDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (nextDate <= today) {

            // ✅ check if scheduled time has passed
            const scheduledTime = s.time || '08:00';
            const [schHour, schMin] = scheduledTime.split(':').map(Number);
            const scheduledMoment = new Date();
            scheduledMoment.setHours(schHour, schMin, 0, 0);

            if (now < scheduledMoment) return; // not time yet

            balance -= s.amount;

            transactions.push({
                title:       s.description || 'Scheduled Transfer',
                amount:      s.amount,
                name:        s.name,
                bank:        s.bank,
                description: s.description || '',
                category:    'transfer',
                source:      'scheduled',
                type:        'debit',
                time:        new Date().toISOString()
            });
             
            const [py, pm, pd] = s.nextDate.split('-').map(Number);
            const next = new Date(py, pm - 1, pd);
            if (s.freq === 'Daily')   next.setDate(next.getDate() + 1);
            if (s.freq === 'Weekly')  next.setDate(next.getDate() + 7);
            if (s.freq === 'Monthly') next.setMonth(next.getMonth() + 1);
            s.nextDate = toLocalDateStr(next);
            s.lastRan  = todayStr;
           
            updated    = true;
        }
    });

    if (updated) {
        localStorage.setItem('dafah_schedules', JSON.stringify(schedules));
        saveData();
    }
}

function loadData() {

    const currentUser =
        JSON.parse(localStorage.getItem('current_user'));

    const savedBalance =
        localStorage.getItem('dafah_balance');

    const savedTransactions =
        localStorage.getItem('dafah_transactions');


    // =====================================================
    // LOAD BALANCE
    // =====================================================

    if (
        currentUser &&
        typeof currentUser.balance === 'number' &&
        Number.isFinite(currentUser.balance)
    ) {

        balance = currentUser.balance;

    } else if (savedBalance) {

        const parsedBalance = JSON.parse(savedBalance);

        if (
            typeof parsedBalance === 'number' &&
            Number.isFinite(parsedBalance)
        ) {
            balance = parsedBalance;
        }
    }


    // =====================================================
    // LOAD TRANSACTIONS
    // =====================================================

    if (
        currentUser &&
        Array.isArray(currentUser.transactions)
    ) {

        transactions = currentUser.transactions;

    } else if (savedTransactions) {

        const parsedTransactions =
            JSON.parse(savedTransactions);

        if (Array.isArray(parsedTransactions)) {
            transactions = parsedTransactions;
        }
    }


    // =====================================================
    // SYNC TO CURRENT USER
    // =====================================================

    if (currentUser) {

        currentUser.balance = balance;
        currentUser.transactions = transactions;

        localStorage.setItem(
            'current_user',
            JSON.stringify(currentUser)
        );

        const users = JSON.parse(localStorage.getItem('df_users')) || [];
        const userIndex = users.findIndex(user => user.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...currentUser };
            localStorage.setItem('df_users', JSON.stringify(users));
        }
    }


    // =====================================================
    // SAVE MAIN DATA
    // =====================================================

    localStorage.setItem(
        'dafah_balance',
        JSON.stringify(balance)
    );

    localStorage.setItem(
        'dafah_transactions',
        JSON.stringify(transactions)
    );


    // =====================================================
    // SCHEDULED TRANSFERS
    // =====================================================

    processScheduledTransfers();
}


loadData();
