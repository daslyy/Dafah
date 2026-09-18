console.log("Mobile Top-up Loaded");


// =====================================================
// STATE
// =====================================================
let selectedDataNetwork = null;
let selectedNetwork = null;
let selectedAccount = "Premier Savings";
let selectedDataRecipient = null;
let dataPurchaseAmount = 0;

let pendingTransactionType = null;
let bundleRecipient = '';

const DAILY_LIMIT = 150000;


// =====================================================
// GET CURRENT BALANCE
// =====================================================
let selectedDataProduct = null;
function getCurrentBalance() {

    const savedUser =
        localStorage.getItem("current_user");

    if (!savedUser) {
        return 0;
    }

    try {

        const user = JSON.parse(savedUser);

        const userBalance = Number(user.balance);

        if (Number.isFinite(userBalance)) {
            return userBalance;
        }

    } catch (error) {

        console.error(
            "Could not read current_user:",
            error
        );

    }

    return 0;
}


// =====================================================
// SYNC MOBILE TOP-UP DATA
// =====================================================

function syncMobileTopupData(newBalance, transaction) {

    // -----------------------------------------
    // SAVE BALANCE
    // -----------------------------------------

    localStorage.setItem(
        "dafah_balance",
        JSON.stringify(newBalance)
    );


    // -----------------------------------------
    // SAVE TRANSACTION
    // -----------------------------------------

    let savedTransactions =
        JSON.parse(
            localStorage.getItem("dafah_transactions")
        ) || [];

    savedTransactions.push(transaction);

    localStorage.setItem(
        "dafah_transactions",
        JSON.stringify(savedTransactions)
    );


    // -----------------------------------------
    // UPDATE CURRENT USER
    // -----------------------------------------

    const savedUser =
        localStorage.getItem("current_user");

    if (savedUser) {

        try {

            const currentUser =
                JSON.parse(savedUser);


            currentUser.balance =
                newBalance;


            if (!Array.isArray(currentUser.transactions)) {
                currentUser.transactions = [];
            }


            currentUser.transactions.push(
                transaction
            );


            localStorage.setItem(
                "current_user",
                JSON.stringify(currentUser)
            );


        } catch (error) {

            console.error(
                "Could not sync current_user:",
                error
            );

        }

    }


    // -----------------------------------------
    // UPDATE DASHBOARD VARIABLES
    // -----------------------------------------

    if (typeof balance !== "undefined") {
        balance = newBalance;
    }

    if (typeof transactions !== "undefined") {
        transactions.push(transaction);
    }


    // -----------------------------------------
    // NOTIFY OTHER OPEN PAGES
    // -----------------------------------------

    window.dispatchEvent(
        new CustomEvent(
            "dafahBalanceUpdated",
            {
                detail: {
                    balance: newBalance,
                    transaction: transaction
                }
            }
        )
    );

}



// =====================================================
// FORMAT MONEY
// =====================================================

function formatMoney(amount) {

    return Number(amount).toLocaleString(
        "en-NG",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


// =====================================================
// DISPLAY ACCOUNT BALANCE
// =====================================================

function updateAccountBalance() {

    const currentBalance = getCurrentBalance();

    // Mobile Top-up balance
    const accountBalance =
        document.getElementById("accountBalance");

    if (accountBalance) {
        accountBalance.textContent =
            `₦${formatMoney(currentBalance)}`;
    }


    // Mobile Top-up account dropdown balance
    const dropdownBalance =
        document.getElementById("dropdownBalance");

    if (dropdownBalance) {
        dropdownBalance.textContent =
            `₦${formatMoney(currentBalance)}`;
    }


    // Data Bundle balance
    const dataAccountBalance =
        document.getElementById("dataAccountBalance");

    if (dataAccountBalance) {
        dataAccountBalance.textContent =
            `₦${formatMoney(currentBalance)}`;
    }
}

// =====================================================
// UPDATE DAILY TRANSACTION LIMIT
// =====================================================


function updateDailyTransactionLimit() {

    const progress = document.getElementById("limitProgress");
    const usedAmountElement = document.getElementById("usedAmount");
    const dataProgress = document.getElementById("dataLimitProgress");
    const dataUsedAmountElement = document.getElementById("dataUsedAmount");

    const savedUser = localStorage.getItem("current_user");
    let userTransactions = [];

    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            if (Array.isArray(user.transactions)) {
                userTransactions = user.transactions;
            }
        } catch (error) {
            console.error("Could not read transactions:", error);
        }
    }

    const today = new Date().toDateString();

    let usedAmount = 0;

    userTransactions.forEach(tx => {

        if (
            (tx.category === "airtime" || tx.category === "data") &&
            tx.type === "debit" &&
            tx.time &&
            new Date(tx.time).toDateString() === today
        ) {
            usedAmount += Number(tx.amount) || 0;
        }

    });

    const percentage = Math.min((usedAmount / DAILY_LIMIT) * 100, 100);

    if (progress) progress.style.width = `${percentage}%`;
    if (usedAmountElement) usedAmountElement.textContent = `₦${formatMoney(usedAmount)} used`;

    if (dataProgress) dataProgress.style.width = `${percentage}%`;
    if (dataUsedAmountElement) dataUsedAmountElement.textContent = `₦${formatMoney(usedAmount)} used`;
}
function toggleAccountDropdown() {

    const dropdown =
        document.getElementById(
            "accountDropdown"
        );

    const arrow =
        document.getElementById(
            "accountArrow"
        );

    const isOpen =
        dropdown.style.display === "block";


    dropdown.style.display =
        isOpen ? "none" : "block";


    arrow.classList.toggle(
        "open",
        !isOpen
    );

}


// =====================================================
// SELECT ACCOUNT
// =====================================================

function selectAccount() {

    selectedAccount =
        "Premier Savings";

    document.getElementById(
        "accountName"
    ).textContent =
        selectedAccount;


    updateAccountBalance();


    document.getElementById(
        "accountDropdown"
    ).style.display = "none";


    document.getElementById(
        "accountArrow"
    ).classList.remove("open");

}


// =====================================================
// NETWORK SELECTION
// =====================================================

function selectNetwork(button) {

    document
        .querySelectorAll(".network-card")
        .forEach(card => {

            card.classList.remove(
                "selected"
            );

        });


    button.classList.add("selected");


    selectedNetwork =
        button.dataset.network;


    const message =
        document.getElementById(
            "networkMessage"
        );

    message.textContent =
        `${selectedNetwork} selected`;

    message.className =
        "field-message success";

}

// =====================================================
// DATA NETWORK SELECTION
// =====================================================

function selectDataNetwork(button) {

    // Remove selected state from DATA networks only
    document
        .querySelectorAll(".data-network-card")
        .forEach(card => {
            card.classList.remove("selected");
        });

    // Select clicked network
    button.classList.add("selected");

    // Save selected data network
    selectedDataNetwork =
        button.dataset.network;

    // Show message
    const message =
        document.getElementById("dataNetworkMessage");

    if (message) {

        message.textContent =
            `${selectedDataNetwork} selected`;

        message.className =
            "field-message success";
    }

    console.log(
        "Selected data network:",
        selectedDataNetwork
    );
}


// =====================================================
// DATA RECIPIENT
// =====================================================

function toggleDataRecipient() {

    const options =
        document.getElementById("dataRecipientOptions");

    const selector =
        document.getElementById("dataRecipientSelector");

    if (!options || !selector) return;

    options.classList.toggle("active");
    selector.classList.toggle("open");
}


// =====================================================
// SELECT DATA RECIPIENT
// =====================================================

function selectDataRecipient(type) {

    const selected =
        document.getElementById("selectedDataRecipient");

    const options =
        document.getElementById("dataRecipientOptions");

    const selector =
        document.getElementById("dataRecipientSelector");

    const phoneWrapper =
        document.getElementById("dataPhoneWrapper");

    if (!selected || !options || !selector || !phoneWrapper) {
        return;
    }


    // Save selection
    selectedDataRecipient = type;


    // Remove selected state
    document
        .querySelectorAll(".recipient-option")
        .forEach(option => {

            option.classList.remove("selected");

        });


    // Select clicked option
    const activeOption =
        document.querySelector(
            `.recipient-option[data-recipient="${type}"]`
        );

    if (activeOption) {
        activeOption.classList.add("selected");
    }


    // =========================================
    // MYSELF
    // =========================================

    if (type === "self") {

        selected.textContent =
            "Myself";

        selected.classList.remove(
            "dropdown-placeholder"
        );


        phoneWrapper.classList.add("show");


        console.log(
            "Data recipient: Myself"
        );

    }


    // =========================================
    // SOMEONE ELSE
    // =========================================

    if (type === "other") {

        selected.textContent =
            "Someone else";

        selected.classList.remove(
            "dropdown-placeholder"
        );


        phoneWrapper.classList.add("show");


        console.log(
            "Data recipient: Someone else"
        );

    }


    // Close dropdown
    options.classList.remove("active");
    selector.classList.remove("open");

}

// ========================================
// DATA BUNDLE RECIPIENT
// ========================================




// ── TOGGLE RECIPIENT DROPDOWN ──

function toggleBundleRecipient() {

    const options = document.getElementById('bundleRecipientOptions');

    if (!options) return;

    options.classList.toggle('active');
}


// ── SELECT RECIPIENT ──

function selectBundleRecipient(type) {

    const selector = document.getElementById('selectedBundleRecipient');
    const options = document.getElementById('bundleRecipientOptions');
    const phoneWrapper = document.getElementById('bundlePhoneWrapper');
    const phoneInput = document.getElementById('bundlePhoneNumber');

    if (!selector || !options || !phoneWrapper) return;

    bundleRecipient = type;

    // Close dropdown
    options.classList.remove('active');


    // ========================================
    // MYSELF
    // ========================================

    if (type === 'self') {

        selector.textContent = 'Myself';

        selector.classList.remove('dropdown-placeholder');

        // Show phone input
        phoneWrapper.classList.add('active');

        /*
         * For now we leave the phone number empty.
         * Later we will automatically get the user's
         * registered phone number from current_user.
         */

        phoneInput.value = '';

        return;
    }


    // ========================================
    // SOMEONE ELSE
    // ========================================

    if (type === 'other') {

        selector.textContent = 'Someone else';

        selector.classList.remove('dropdown-placeholder');

        // Show phone input
        phoneWrapper.classList.add('active');

        phoneInput.value = '';

        // Focus the phone input
        setTimeout(() => {
            phoneInput.focus();
        }, 200);
    }
}


// =====================================================
// PHONE VALIDATION
// =====================================================

function validatePhone() {

    const input = document.getElementById("phoneNumber");
    const message = document.getElementById("phoneMessage");

    if (!input || !message) return;

    // Keep numbers only
    let value = input.value.replace(/\D/g, "");

    // Maximum 11 digits
    if (value.length > 11) {
        value = value.slice(0, 11);
    }

    input.value = value;

    // Empty
    if (!value) {
        message.textContent = "";
        message.className = "field-message";
        return;
    }

    // Must be exactly 11 digits
    if (value.length !== 11) {

        message.textContent =
            `${11 - value.length} more digit${11 - value.length > 1 ? "s" : ""} needed`;

        message.className = "field-message error";
        return;
    }

    // Must start with 070, 071, 080, 081, 090, 091
    const validPrefix =
        /^(070|071|080|081|090|091)/;

    if (!validPrefix.test(value)) {

        message.textContent =
            "Enter a valid Nigerian mobile number";

        message.className =
            "field-message error";

        return;
    }

    // Valid
    message.textContent =
        "✓ Mobile number looks valid";

    message.className =
        "field-message success";
}

// =====================================================
// FIND BENEFICIARY
// =====================================================

function findBeneficiary() {

    const phone =
        document.getElementById(
            "phoneNumber"
        ).value.trim();


    if (!phone) {

        alert(
            "Please enter a mobile number first."
        );

        return;

    }


    alert(
        "Beneficiary lookup will be available here."
    );

}


// =====================================================
// AMOUNT
// =====================================================

function updateAmount() {

    const input =
        document.getElementById(
            "topupAmount"
        );

    let amount =
        Number(input.value);


    if (amount > DAILY_LIMIT) {

        input.value =
            DAILY_LIMIT;

        amount =
            DAILY_LIMIT;

    }


    updateAmountWords(amount);

}


// =====================================================
// AMOUNT TO WORDS
// =====================================================

function numberToWords(num) {

    const ones = [
        "",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
        "ten",
        "eleven",
        "twelve",
        "thirteen",
        "fourteen",
        "fifteen",
        "sixteen",
        "seventeen",
        "eighteen",
        "nineteen"
    ];


    const tens = [
        "",
        "",
        "twenty",
        "thirty",
        "forty",
        "fifty",
        "sixty",
        "seventy",
        "eighty",
        "ninety"
    ];


    if (num === 0) {

        return "";

    }


    if (num < 20) {

        return ones[num];

    }


    if (num < 100) {

        return tens[
            Math.floor(num / 10)
        ] +
            (
                num % 10
                    ? " " + ones[num % 10]
                    : ""
            );

    }


    if (num < 1000) {

        return ones[
            Math.floor(num / 100)
        ] +
            " hundred" +
            (
                num % 100
                    ? " " +
                    numberToWords(num % 100)
                    : ""
            );

    }


    if (num < 1000000) {

        return numberToWords(
            Math.floor(num / 1000)
        ) +
            " thousand" +
            (
                num % 1000
                    ? " " +
                    numberToWords(num % 1000)
                    : ""
            );

    }


    return "";

}


// =====================================================
// DISPLAY AMOUNT WORDS
// =====================================================

function updateAmountWords(amount) {

    const words =
        document.getElementById(
            "amountWords"
        );


    if (!amount || amount <= 0) {

        words.textContent = "";

        return;

    }


    words.textContent =
        numberToWords(amount) +
        " naira";

}


// =====================================================
// QUICK AMOUNTS
// =====================================================

function setAmount(amount) {

    document.getElementById(
        "topupAmount"
    ).value = amount;


    updateAmount();

}


// =====================================================
// PROCEED
// =====================================================

function proceedTopup() {

    const phone =
        document.getElementById(
            "dataPhoneNumber"
        ).value.trim();


    const amount =
        Number(
            document.getElementById(
                "topupAmount"
            ).value
        );


    const currentBalance =
        getCurrentBalance();


    // NETWORK

    if (!selectedNetwork) {

        alert(
            "Please select a network provider."
        );

        return;

    }


    // PHONE
    if (
        phone.length !== 11 ||
        !/^(070|071|080|081|090|091)/.test(phone)
    ) {
        alert(
            "Please enter a valid Nigerian mobile number."
        );

        return;
    }



    // AMOUNT

    if (!amount || amount < 100) {

        alert(
            "Minimum top-up amount is ₦100."
        );

        return;

    }


    // LIMIT

    if (amount > DAILY_LIMIT) {

        alert(
            "Amount exceeds your daily transaction limit."
        );

        return;

    }


    // BALANCE

    if (amount > currentBalance) {

        alert(
            "Insufficient balance."
        );

        return;

    }


    pendingTransactionType = "airtime";

    const modalTitle = document.querySelector("#confirmationModal h2");
    if (modalTitle) modalTitle.textContent = "Confirm Mobile Top-up";

    const confirmButton = document.querySelector("#confirmationModal .confirm-btn");
    if (confirmButton) confirmButton.textContent = "Confirm Top-up";


    // FILL MODAL

    document.getElementById(
        "confirmNetwork"
    ).textContent =
        selectedNetwork;


    document.getElementById(
        "confirmPhone"
    ).textContent =
        phone;


    document.getElementById(
        "confirmAmount"
    ).textContent =
        `₦${formatMoney(amount)}`;


    document.getElementById(
        "confirmationModal"
    ).classList.add("show");

}


// =====================================================
// CLOSE MODAL
// =====================================================

function closeModal() {

    document.getElementById(
        "confirmationModal"
    ).classList.remove("show");

}


// =====================================================
// MOBILE TOP-UP PIN SHEET
// =====================================================

const pinSheet =
    document.getElementById("mobileTopupPinSheet");
function confirmTopup() {

    let amount;
    let phone;

    // =========================================
    // GET TRANSACTION DETAILS
    // =========================================

    if (pendingTransactionType === "data") {

        amount = window.pendingDataPurchase.amount;
        phone = window.pendingDataPurchase.phone;

    } else {

        amount =
            Number(
                document.getElementById(
                    "topupAmount"
                ).value
            );

        phone =
            document.getElementById(
                "dataPhoneNumber"
            ).value.trim();

    }

    // =========================================
    // FINAL BALANCE CHECK
    // =========================================

    const currentBalance =
        getCurrentBalance();

    if (amount > currentBalance) {

        alert("Insufficient balance.");

        closeModal();

        return;
    }

    // =========================================
    // CLOSE CONFIRMATION MODAL
    // =========================================

    closeModal();

    // =========================================
    // OPEN PIN SHEET
    // =========================================

    if (pinSheet) {

        // Reset processing state
        pinSheet.classList.remove("processing");

        // Show keypad
        const pinPad =
            pinSheet.querySelector(".pin-pad");

        if (pinPad) {
            pinPad.style.display = "grid";
        }

        // Show PIN dots
        const pinDots =
            pinSheet.querySelector(".pin-dots");

        if (pinDots) {
            pinDots.style.display = "flex";
        }

        // Hide loading
        if (mobileTopupLoading) {
            mobileTopupLoading.style.display = "none";
        }

        // Clear previous PIN
        mobileTopupPin = "";

        updateMobileTopupPinDots();

        // Open PIN sheet
        pinSheet.classList.add("active");
    }
}

// =====================================================
// MOBILE TOP-UP PIN SYSTEM
// =====================================================


const mobileTopupPinSheet =
    document.getElementById("mobileTopupPinSheet");


const mobileTopupLoading =
    document.getElementById("mobileTopupPinLoading");

const mobileTopupPinDots =
    mobileTopupPinSheet
        ? mobileTopupPinSheet.querySelectorAll(".dot")
        : [];

const mobileTopupPinKeys =
    mobileTopupPinSheet
        ? mobileTopupPinSheet.querySelectorAll(".pin-key")
        : [];

let mobileTopupPin = "";


// =====================================================
// PIN KEYS
// =====================================================

mobileTopupPinKeys.forEach(key => {

    key.addEventListener("click", () => {

        // DELETE
        if (key.classList.contains("delete")) {

            mobileTopupPin =
                mobileTopupPin.slice(0, -1);

            updateMobileTopupPinDots();

            return;
        }


        // EMPTY BUTTON
        if (key.classList.contains("empty")) {
            return;
        }


        // ONLY ALLOW 4 DIGITS
        if (mobileTopupPin.length >= 4) {
            return;
        }


        // ADD DIGIT
        mobileTopupPin += key.textContent.trim();


        updateMobileTopupPinDots();


        // 4 DIGITS ENTERED
        if (mobileTopupPin.length === 4) {

            processMobileTopup();

        }

    });

});


// =====================================================
// UPDATE PIN DOTS
// =====================================================

function updateMobileTopupPinDots() {

    mobileTopupPinDots.forEach((dot, index) => {

        if (index < mobileTopupPin.length) {

            dot.classList.add("filled");

        } else {

            dot.classList.remove("filled");

        }

    });

}
function processMobileTopup() {

    console.log("Processing PIN entered.");

    if (mobileTopupPinSheet) {
        mobileTopupPinSheet.classList.add("processing");

        // =========================================
        // PROCESSING MESSAGE
        // =========================================

        const loadingText =
            document.getElementById(
                "mobileTopupPinLoadingText"
            );

        if (loadingText) {


            
            loadingText.textContent =
                pendingTransactionType === "data"
                    ? "Processing Data Bundle..."
                    : "Processing Mobile Top-up...";
        }

        let amount, phone, network, title, description, category;

        if (pendingTransactionType === "data") {
            amount = window.pendingDataPurchase.amount;
            phone = window.pendingDataPurchase.phone;
            network = window.pendingDataPurchase.network;
            title = "Data Bundle Purchase";
            description = `${window.pendingDataPurchase.product.plan} for ${phone}`;
            category = "data";
        } else {
            amount = Number(document.getElementById("topupAmount").value);
            phone = document.getElementById("dataPhoneNumber").value.trim();
            network = selectedNetwork;
            title = "Mobile Top Up";
            description = `Airtime top-up to ${phone}`;
            category = "airtime";
        }

        const currentBalance = getCurrentBalance();

        if (!amount || amount <= 0 || amount > currentBalance) {

            alert("Insufficient balance.");

            if (mobileTopupPinSheet) {
                mobileTopupPinSheet.classList.remove("processing");
            }

            mobileTopupPin = "";
            updateMobileTopupPinDots();

            return;
        }

        setTimeout(() => {

            const newBalance = currentBalance - amount;

            const transaction = {
                title: title,
                amount: amount,
                name: phone,
                network: network,
                description: description,
                category: category,
                source: "mobile_topup",
                type: "debit",
                time: new Date().toISOString()
            };

            syncMobileTopupData(newBalance, transaction);

            console.log("Transaction completed:", transaction);
            console.log("New balance:", newBalance);

            if (mobileTopupPinSheet) {
                mobileTopupPinSheet.classList.remove("processing");
                mobileTopupPinSheet.classList.remove("active");
            }

            mobileTopupPin = "";
            updateMobileTopupPinDots();

            updateAccountBalance();
            updateDailyTransactionLimit();

            showTopupSuccess(network, phone, amount, pendingTransactionType);

            pendingTransactionType = null;

        }, 2000);
    }
}



    // =====================================================
    // BACK
    // =====================================================

    function goBack() {

        /*
         * Change this later if your dashboard has
         * a specific URL/navigation function.
         */

        window.history.back();

    }


    // =====================================================
    // INITIALIZE
    // =====================================================


    document.addEventListener(
        "DOMContentLoaded",
        () => {

            updateAccountBalance();

            updateDailyTransactionLimit();

        }
    );


    // ========================================
    // NETWORK SELECTION
    // ========================================






    // =====================================================
    // DATA BUNDLE PRODUCT DROPDOWN
    // =====================================================

    function toggleDataProducts() {

        const dropdown = document.getElementById('dataProductList');
        const selector = document.getElementById('dataProductDropdown');

        if (!dropdown || !selector) return;

        dropdown.classList.toggle('show');
        selector.classList.toggle('open');
    }


    // =====================================================
    // SELECT DATA PRODUCT
    // =====================================================
    function selectDataProduct(product) {

        const selectedProduct = document.getElementById('selectedDataProduct');
        const dropdown = document.getElementById('dataProductList');
        const selector = document.getElementById('dataProductDropdown');

        if (!selectedProduct || !dropdown || !selector) return;

        const plan = product.dataset.plan;
        const price = Number(product.dataset.price);

        // ========================================
        // SAVE SELECTED DATA BUNDLE
        // ========================================

        selectedDataProduct = {
            plan: plan,
            price: price
        };

        dataPurchaseAmount = price;

        // ========================================
        // UPDATE DROPDOWN DISPLAY
        // ========================================

        selectedProduct.textContent = plan;

        selectedProduct.classList.remove('dropdown-placeholder');

        // Remove previous selection
        document.querySelectorAll('.data-product').forEach(item => {
            item.classList.remove('selected');
        });

        // Mark current product
        product.classList.add('selected');

        // Close dropdown
        dropdown.classList.remove('show');
        selector.classList.remove('open');

        // Clear message
        const message = document.getElementById('dataProductMessage');

        if (message) {
            message.textContent = '';
        }

        // Test
        console.log('Selected data product:', selectedDataProduct);
    }


    // =====================================================
    // VALIDATE DATA BUNDLE PHONE
    // =====================================================

    function validateBundlePhone() {

        const input = document.getElementById('bundlePhoneNumber');
        const message = document.getElementById('bundlePhoneMessage');

        if (!input) return;

        const phone = input.value.trim();

        if (phone === '') {
            if (message) message.textContent = '';
            return;
        }

        if (!/^0\d{10}$/.test(phone)) {

            if (message) {
                message.textContent = 'Enter a valid 11-digit Nigerian mobile number.';
                message.className = 'field-message error';
            }

            return;
        }

        if (message) {
            message.textContent = 'Valid mobile number';
            message.className = 'field-message success';
        }
    }
    


    // =====================================================
    // PROCEED DATA PURCHASE
    // =====================================================

    function proceedDataPurchase() {


        const phoneInput = document.getElementById('bundlePhoneNumber');
        const phoneMessage = document.getElementById('dataPhoneMessage');
        const networkMessage = document.getElementById('dataNetworkMessage');
        const productMessage = document.getElementById('dataProductMessage');

        if (!phoneInput) return;

        const phone = phoneInput.value.trim();

        // Clear old messages
        if (phoneMessage) phoneMessage.textContent = '';
        if (networkMessage) networkMessage.textContent = '';
        if (productMessage) productMessage.textContent = '';

        // ========================================
        // CHECK NETWORK
        // ========================================

        if (!selectedDataNetwork) {

            if (networkMessage) {
                networkMessage.textContent = 'Please select a network provider.';
            }

            return;
        }

        // ========================================
        // CHECK DATA BUNDLE
        // ========================================

        if (!selectedDataProduct) {

            if (productMessage) {
                productMessage.textContent = 'Please select a data bundle.';
            }

            return;
        }

        // ========================================
        // CHECK PHONE
        // ========================================

        if (!/^0\d{10}$/.test(phone)) {

            if (phoneMessage) {
                phoneMessage.textContent =
                    'Enter a valid 11-digit Nigerian mobile number.';
            }

            return;
        }

        // ========================================
        // CHECK RECIPIENT
        // ========================================

        if (!bundleRecipient) {

            alert('Please select who you are sending the data to.');

            return;
        }

        // ========================================
        // EVERYTHING IS VALID
        // ========================================

        console.log('Data purchase ready:', {
            network: selectedDataNetwork,
            recipient: bundleRecipient,
            phone: phone,
            product: selectedDataProduct,
            amount: dataPurchaseAmount
        });


        // ========================================
        // SAVE DATA PURCHASE
        // ========================================
        pendingTransactionType = "data";
        window.pendingDataPurchase = {
            network: selectedDataNetwork,
            recipient: bundleRecipient,
            phone: phone,
            product: selectedDataProduct,
            amount: dataPurchaseAmount
        };


        // ========================================
        // FILL CONFIRMATION MODAL
        // ========================================

        document.getElementById(
            "confirmNetwork"
        ).textContent =
            selectedDataNetwork;


        document.getElementById(
            "confirmPhone"
        ).textContent =
            phone;


        document.getElementById(
            "confirmAmount"
        ).textContent =
            `₦${formatMoney(dataPurchaseAmount)}`;


        // ========================================
        // CHANGE MODAL TITLE
        // ========================================

        const modalTitle =
            document.querySelector(
                "#confirmationModal h2"
            );

        if (modalTitle) {

            modalTitle.textContent =
                "Confirm Data Bundle";

        }


        // ========================================
        // CHANGE CONFIRM BUTTON
        // ========================================

        const confirmButton =
            document.querySelector(
                "#confirmationModal .confirm-btn"
            );

        if (confirmButton) {

            confirmButton.textContent =
                "Confirm Data Purchase";

        }


        // ========================================
        // SHOW CONFIRMATION MODAL
        // ========================================

        document.getElementById(
            "confirmationModal"
        ).classList.add("show");
    }



    // =====================================================
    // TOP-UP TAB SWITCHING
    // =====================================================

    function switchTab(tabName) {

        // All tab buttons
        const tabs = document.querySelectorAll('.topup-tab');

        // All tab content sections
        const contents = document.querySelectorAll('.tab-content');


        // Remove active from all buttons
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });


        // Hide all sections
        contents.forEach(content => {
            content.classList.remove('active');
        });


        // Activate the clicked button
        const activeButton = document.querySelector(
            `.topup-tab[data-tab="${tabName}"]`
        );

        if (activeButton) {
            activeButton.classList.add('active');
        }


        // Show the correct section
        if (tabName === 'topup') {

            document.getElementById('topupTab')?.classList.add('active');

        }

        else if (tabName === 'data') {

            document.getElementById('dataTab')?.classList.add('active');

        }

        else if (tabName === 'history') {

            document.getElementById('historyTab')?.classList.add('active');

        }
    }

    // Dashboard Data Bundles card opens this page with #data.
    if (window.location.hash === '#data') {
        switchTab('data');
    }
function validateDataPhone() {

    const phoneInput =
        document.getElementById("dataPhoneNumber");

    const phoneMessage =
        document.getElementById("dataPhoneMessage");

    if (!phoneInput || !phoneMessage) {
        return;
    }

    const phone =
        phoneInput.value.trim();

    if (phone === "") {

        phoneMessage.textContent = "";
        phoneMessage.className = "field-message";

        return;
    }

    if (!/^\d+$/.test(phone)) {

        phoneMessage.textContent =
            "Mobile number must contain numbers only";

        phoneMessage.className =
            "field-message error";

        return;
    }

    if (!phone.startsWith("0")) {

        phoneMessage.textContent =
            "Mobile number must start with 0";

        phoneMessage.className =
            "field-message error";

        return;
    }

    if (phone.length !== 11) {

        phoneMessage.textContent =
            "Mobile number must be 11 digits";

        phoneMessage.className =
            "field-message error";

        return;
    }

    const validPrefix =
        /^(070|071|080|081|090|091)/;

    if (!validPrefix.test(phone)) {

        phoneMessage.textContent =
            "Enter a valid Nigerian mobile number";

        phoneMessage.className =
            "field-message error";

        return;
    }

    phoneMessage.textContent =
        "✓ Mobile number looks valid";

    phoneMessage.className =
        "field-message success";
}
    function showTopupSuccess(network, phone, amount, type) {

        const overlay = document.getElementById("topupSuccessSheet");
        const successNetwork = document.getElementById("successNetwork");
        const successPhone = document.getElementById("successPhone");
        const successAmount = document.querySelector(".topup-success-amount");
        const successAccount = document.getElementById("successAccount");
        const heading = document.querySelector(".topup-success-sheet h2");
        const message = document.querySelector(".topup-success-message");

        if (type === "data") {
            if (heading) heading.textContent = "Data Purchase Successful";
            if (message) message.textContent = "Your data bundle purchase has been completed successfully.";
        } else {
            if (heading) heading.textContent = "Top-up Successful";
            if (message) message.textContent = "Your mobile top-up has been completed successfully.";
        }

        if (successNetwork) successNetwork.textContent = network;
        if (successPhone) successPhone.textContent = phone;
        if (successAmount) successAmount.textContent = `₦${formatMoney(amount)}`;
        if (successAccount) successAccount.textContent = selectedAccount;

        if (overlay) overlay.classList.add("show");

        document.body.style.overflow = "hidden";
    }

    // =====================================================
    // CLOSE TOP-UP SUCCESS SHEET
    // =====================================================

    function closeTopupSuccess() {

        const overlay =
            document.getElementById("topupSuccessSheet");

        if (overlay) {
            overlay.classList.remove("show");
        }

        document.body.style.overflow = "";
    }

