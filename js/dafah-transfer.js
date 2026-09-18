function goBack() {

    window.location.href =
        "/dashboard.html";

}



/* ACCOUNT LOOKUP */
const dafahAccount = document.getElementById("dafahAccount");
const dafahReceiver = document.getElementById("dafahReceiver");
const dafahHint = document.getElementById("dafahAccountHint");

let dafahVerified = false;

dafahAccount.addEventListener("input", () => {

    // allow only numbers
    dafahAccount.value = dafahAccount.value.replace(/\D/g, "");

    const account = dafahAccount.value;

    dafahVerified = false;
    dafahReceiver.value = "";

    if (account.length === 0) {

        dafahHint.textContent = "";
        dafahHint.className = "transfer-account-hint";

        checkProceedButton();
        return;
    }

    if (account.length < 10) {

        dafahHint.textContent =
            `${10 - account.length} more digit${10 - account.length > 1 ? "s" : ""} needed`;

        dafahHint.className =
            "transfer-account-hint warn";

        checkProceedButton();
        return;
    }

    if (account.length > 10) {

        dafahHint.textContent =
            `Too long — remove ${account.length - 10} digit${account.length - 10 > 1 ? "s" : ""}`;

        dafahHint.className =
            "transfer-account-hint error";

        checkProceedButton();
        return;
    }

    // exactly 10 digits

    dafahHint.textContent = "Verifying account...";
    dafahHint.className = "transfer-account-hint warn";

    setTimeout(() => {

        dafahReceiver.value = "Babatunde Abolaji Adekunle";

        dafahHint.textContent = "✓ Account verified";

        dafahHint.className =
            "transfer-account-hint success";

        dafahVerified = true;

        checkProceedButton();

    }, 1200);

});


/* AMOUNT FORMAT */

const dafahAmount = document.getElementById("dafahAmount");

dafahAmount.addEventListener("input", () => {

    // keep only numbers
    let value = dafahAmount.value.replace(/\D/g, "");

    if (value === "") {
        dafahAmount.value = "";
        checkProceedButton();
        return;
    }

    // add commas
    dafahAmount.value = Number(value).toLocaleString("en-NG");

    checkProceedButton();
});


/* REVIEW */
const dafahProceed =
    document.getElementById('dafahProceed');

const dafahReview =
    document.getElementById('dafahReview');


function checkProceedButton() {

    const amount = Number(
        document
            .getElementById("dafahAmount")
            .value.replace(/,/g, "")
    );

    const ready = dafahVerified && amount > 0;

    dafahProceed.disabled = !ready;

    if (ready) {
        dafahProceed.textContent =
            `Continue ₦${amount.toLocaleString("en-NG")}`;
    } else {
        dafahProceed.textContent = "Continue";
    }

}







dafahProceed.addEventListener('click', () => {

    const amount = Number(
        document
            .getElementById("dafahAmount")
            .value.replace(/,/g, "")
    );


    document.getElementById(
        'dafahReviewName'
    ).innerText = dafahReceiver.value;



    document.getElementById(
        'dafahReviewAmount'
    ).innerText = `₦${amount}`;



    document.getElementById(
        'dafahTotal'
    ).innerText = `₦${amount}`;



    dafahReview.classList.add('active');

});




/* OPEN PIN */
const dafahContinue =
    document.getElementById('dafahContinue');

const dafahPinModal =
    document.getElementById('dafahPinModal');



dafahContinue.addEventListener('click', () => {

    dafahReview.classList.remove('active');

    dafahPinModal.classList.add('active');

});





/* PIN SYSTEM */
const dots =
    document.querySelectorAll('.dot');

const pinKeys =
    document.querySelectorAll('.pin-key');

const dafahLoading =
    document.getElementById('dafahLoading');

const dafahSuccess =
    document.getElementById('dafahSuccess');



let pin = '';



pinKeys.forEach(key => {

    key.addEventListener('click', () => {

        const value = key.innerText;



        if (key.classList.contains('delete')) {

            pin = pin.slice(0, -1);

        } else if (
            !key.classList.contains('empty')
        ) {

            if (pin.length < 4) {

                pin += value;

            }

        }



        updateDots();



        if (pin.length === 4) {

            processTransfer();

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


function processTransfer() {

    // Hide keypad
    document.querySelector('.pin-pad').style.display = 'none';

    // Show loading
    dafahLoading.style.display = 'block';


    setTimeout(() => {

        // Get amount and REMOVE commas first
        const amount = Number(
            document
                .getElementById('dafahAmount')
                .value
                .replace(/,/g, "")
        );


        // Safety check
        if (!Number.isFinite(amount) || amount <= 0) {

            console.error(
                "Invalid transfer amount:",
                document.getElementById('dafahAmount').value
            );

            dafahLoading.style.display = 'none';

            return;
        }


        // NO TRANSFER FEE
        balance -= amount;


        // Create transaction
        const transaction = {

            title: 'Internal Transfer',

            amount: amount,

            name: dafahReceiver.value,

            bank: 'DAFAH',

            description:
                document.getElementById('dafahNarration')
                    ? document.getElementById('dafahNarration').value
                    : '',

            category: 'transfer',

            source: 'dafah',

            time: new Date().toISOString(),

            type: 'debit'
        };


        // Add transaction
        transactions.push(transaction);


        // Save balance + transactions
        // saveData() also syncs current_user
        saveData();


        // Hide loading
        dafahLoading.style.display = 'none';


        // Show success
        dafahSuccess.style.display = 'block';


        // Go back to dashboard
        setTimeout(() => {

            window.location.href =
                "/dashboard.html";

        }, 2000);


    }, 3000);
}
