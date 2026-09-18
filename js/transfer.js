const banks = [
    "Access Bank",
    "GTBank",
    "Opay",
    "PalmPay",
    "Kuda Microfinance Bank",
    "Moniepoint",
    "UBA",
    "First Bank",
    "Zenith Bank",
    "Fidelity Bank"
];

const bankSearch = document.getElementById('bankSearch');
const bankResults = document.getElementById('bankResults');
const proceedBtn = document.getElementById('proceedBtn');


bankSearch.addEventListener('input', () => {

    const value = bankSearch.value.toLowerCase();

    bankResults.innerHTML = '';

    if (value === '') return;

    const filteredBanks = banks.filter(bank =>
        bank.toLowerCase().includes(value)
    );

    filteredBanks.forEach(bank => {

        const div = document.createElement('div');

        div.classList.add('bank-item');

        div.innerText = bank;

        div.addEventListener('click', () => {

            bankSearch.value = bank;

            bankResults.innerHTML = '';

        });

        bankResults.appendChild(div);

    });

});


const sourceAccountOption =
    document.getElementById("sourceAccountOption");

function updateSourceAccount() {
 console.log("Current balance:", balance);
    sourceAccountOption.textContent =
    `Premier Savings • ₦${Number(balance).toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
   

}

updateSourceAccount();



const accountNumber = document.getElementById('accountNumber');
const receiverName = document.getElementById('receiverName');
const accountHint = document.getElementById('accountNumberHint');

let accountVerified = false;

accountNumber.addEventListener('input', () => {

    // Allow numbers only
    accountNumber.value = accountNumber.value.replace(/\D/g, '');

    const account = accountNumber.value;



    // Reset verification
    accountVerified = false;
    receiverName.value = '';

    checkProceedButton();

    // Nothing entered
    if (account.length === 0) {

        accountHint.textContent = '';
        accountHint.className = 'transfer-account-hint';

        return;
    }

    // Less than 10 digits
    if (account.length < 10) {

        accountHint.textContent =
            `${10 - account.length} more digit${10 - account.length > 1 ? 's' : ''} needed`;

        accountHint.className =
            'transfer-account-hint warn';

        return;
    }

    // More than 10 digits
    if (account.length > 10) {

        accountHint.textContent =
            `Too long — remove ${account.length - 10} digit${account.length - 10 > 1 ? 's' : ''}`;

        accountHint.className =
            'transfer-account-hint error';

        return;
    }

    // Exactly 10 digits
    accountHint.textContent = 'Verifying account...';
    accountHint.className =
        'transfer-account-hint warn';

    setTimeout(() => {

        receiverName.value = 'Fatimot Hussain';

        accountHint.textContent =
            '✓ Account verified';

        accountHint.className =
            'transfer-account-hint success';

        accountVerified = true;
        checkProceedButton();

    }, 1200);

});


function checkProceedButton() {

    const amount = Number(
        document
            .getElementById("amount")
            .value
            .replace(/,/g, "")
    );

    proceedBtn.disabled =
        !(accountVerified && amount > 0);

}



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

    if (num === 0) return "";

    if (num < 20) {
        return ones[num];
    }

    if (num < 100) {
        return tens[Math.floor(num / 10)] +
            (num % 10 ? " " + ones[num % 10] : "");
    }

    if (num < 1000) {
        return ones[Math.floor(num / 100)] +
            " hundred" +
            (num % 100 ? " " + numberToWords(num % 100) : "");
    }

    if (num < 1000000) {
        return numberToWords(Math.floor(num / 1000)) +
            " thousand" +
            (num % 1000 ? " " + numberToWords(num % 1000) : "");
    }

    return numberToWords(Math.floor(num / 1000000)) +
        " million" +
        (num % 1000000 ? " " + numberToWords(num % 1000000) : "");
}




const amountInput = document.getElementById("amount");

amountInput.addEventListener("input", () => {

    // Keep numbers only
    let value = amountInput.value.replace(/\D/g, "");

    // Remove leading zeros
    value = value.replace(/^0+(?=\d)/, "");

    // Add commas
    if (value) {
        amountInput.value = Number(value).toLocaleString("en-NG");
    } else {
        amountInput.value = "";
    }

    // Convert to number
    const amount = Number(value);

   
    // Update Continue button
    if (amount > 0) {

        proceedBtn.textContent =
            `Continue ₦${amount.toLocaleString("en-NG")}`;

    } else {

        proceedBtn.textContent = "Continue";

    }

    // Check account + amount
    checkProceedButton();

});


// MODAL JS


const reviewModal = document.getElementById('reviewModal');
const pinModal = document.getElementById('pinModal');

const closeReview = document.getElementById('closeReview');
const closePin = document.getElementById('closePin');

const continueBtn = document.getElementById('continueBtn');



const reviewAmount = document.getElementById('reviewAmount');
const reviewAccount = document.getElementById('reviewAccount');
const reviewName = document.getElementById('reviewName');
const reviewBank = document.getElementById('reviewBank');
const reviewNarration = document.getElementById('reviewNarration');
const reviewDebit = document.getElementById('reviewDebit');



proceedBtn.addEventListener('click', () => {

    const amount = Number(
        document
            .getElementById('amount')
            .value
            .replace(/,/g, "")
    );

    const narration =
        document.getElementById('narration').value;

    reviewAmount.innerText =
        `₦${amount.toLocaleString("en-NG")}`;

    reviewAccount.innerText =
        accountNumber.value;

    reviewName.innerText =
        receiverName.value;

    reviewBank.innerText =
        bankSearch.value;

    reviewNarration.innerText =
        narration;

    const total =
        amount + 10;

    reviewDebit.innerText =
        `₦${total.toLocaleString("en-NG")}`;

    reviewModal.classList.add('active');

});


closeReview.addEventListener('click', () => {
    reviewModal.classList.remove('active');
});



continueBtn.addEventListener('click', () => {

    reviewModal.classList.remove('active');

    pinModal.classList.add('active');

});



closePin.addEventListener('click', () => {
    pinModal.classList.remove('active');
});



const dots = document.querySelectorAll('.dot');
const pinKeys = document.querySelectorAll('.pin-key');

const loadingBox = document.getElementById('loadingBox');
const successBox = document.getElementById('successBox');

let pin = '';



pinKeys.forEach(key => {

    key.addEventListener('click', () => {

        const value = key.innerText;

        if (key.classList.contains('delete')) {

            pin = pin.slice(0, -1);

        } else if (!key.classList.contains('empty')) {

            if (pin.length < 4) {

                pin += value;

            }

        }

        updateDots();

        if (pin.length === 4) {

            startTransfer();

        }

    });

});



function updateDots() {

    dots.forEach((dot, index) => {

        if (index < pin.length) {

            dot.classList.add('filled');

        } else {

            dot.classList.remove('filled');

        }

    });

}

function startTransfer() {

    document.querySelector('.pin-pad').style.display = 'none';

    loadingBox.style.display = 'block';

    setTimeout(() => {

        loadingBox.style.display = 'none';

        successBox.style.display = 'block';


        // Get the amount and remove commas
        const amount = Number(
            document
                .getElementById('amount')
                .value
                .replace(/,/g, "")
        );


        // Other-bank transfer fee
        const transferFee = 10;


        // Amount that will actually leave the account
        const totalDebit = amount + transferFee;


        // Deduct amount + ₦10 fee
        balance -= totalDebit;


        // Create transaction
        const transaction = {

            title: 'Transfer',

            amount: amount,

            name: receiverName.value,

            bank: bankSearch.value,

            description:
                document.getElementById('narration').value || '',

            category: 'transfer',

            time: new Date().toISOString(),

            type: 'debit'
        };


        // Save transaction
        transactions.push(transaction);

        saveData();


        // Return to dashboard
        setTimeout(() => {

            window.location.href =
                '/dashboard.html';

        }, 2000);


    }, 3000);
}





function goBack() {
    window.location.href = "/dashboard.html";
}