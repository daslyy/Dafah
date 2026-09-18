// ═════════════════════════════════════════════════════════════════════════
// DAFAH BANK - USER PROFILE SCRIPT
// ═════════════════════════════════════════════════════════════════════════

console.log("Profile & Settings Script Loaded");

// ── LOAD USER DATA AND SYNC BALANCE ──
let currentUser = null;

try {
    currentUser = JSON.parse(localStorage.getItem('current_user'));
} catch (error) {
    localStorage.removeItem('current_user');
}

// The profile and dashboard are authenticated views. Do not substitute a
// placeholder account when a session is missing or corrupted.
if (!currentUser || !currentUser.email) {
    window.location.replace('/sign-up/sign.html');
}

// `current_user` is the authoritative account for this session. The legacy
// `dafah_balance` key is shared storage and must not overwrite another
// customer's balance when they sign in on the same browser.

// ── DOM CONTENT LOADED INITIALIZATION ──
document.addEventListener('DOMContentLoaded', function () {
    // Initialize profile fields
    populateProfile();
    // Initialize tab listeners
    initTabListeners();
    // Initialize defaults for limits and card toggles
    initLimitsAndCards();
});

// ── POPULATE PROFILE INFORMATION ──
function populateProfile() {
    const initials = `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`.toUpperCase();
    
    // Gradient colors for avatar
    const colors = [
        { bg: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' }, // Blue
        { bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }, // Purple
        { bg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' }, // Pink
        { bg: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)' }, // Orange
        { bg: 'linear-gradient(135deg, #10b981 0%, #047857 100%)' }, // Green
        { bg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' }, // Cyan
    ];
    
    const colorIndex = currentUser.firstName.charCodeAt(0) % colors.length;
    const selectedColor = colors[colorIndex];
    
    // Set avatars and names
    const avatar = document.getElementById('profileAvatar');
    if (avatar) {
        avatar.textContent = initials;
        avatar.style.background = selectedColor.bg;
    }
    
    const topInitials = document.getElementById('topProfileInitials');
    if (topInitials) {
        topInitials.textContent = initials;
    }
    
    const profileNameEl = document.getElementById('profileName');
    if (profileNameEl) profileNameEl.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    
    const detailNameEl = document.getElementById('detailName');
    if (detailNameEl) detailNameEl.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    
    const cardHolderNameEl = document.getElementById('cardHolderName');
    if (cardHolderNameEl) cardHolderNameEl.textContent = `${currentUser.firstName} ${currentUser.lastName}`;

    // Populate contact fields
    const detailEmailEl = document.getElementById('detailEmail');
    if (detailEmailEl) detailEmailEl.textContent = currentUser.email;

    const detailAccountEl = document.getElementById('detailAccount');
    if (detailAccountEl) detailAccountEl.textContent = currentUser.accountNumber;

    const detailBalanceEl = document.getElementById('detailBalance');
    if (detailBalanceEl) {
        detailBalanceEl.textContent = `₦${formatMoney(currentUser.balance)}`;
    }

    const memberSinceEl = document.getElementById('memberSince');
    if (memberSinceEl) {
        const year = new Date().getFullYear() - 1; // Joined previous year
        memberSinceEl.textContent = year.toString();
    }

    // Populate Editable Form Inputs
    const editFirst = document.getElementById('editFirstName');
    const editLast = document.getElementById('editLastName');
    const editEmail = document.getElementById('editEmail');
    const editPhone = document.getElementById('editPhone');
    const editAddress = document.getElementById('editAddress');

    if (editFirst) editFirst.value = currentUser.firstName;
    if (editLast) editLast.value = currentUser.lastName;
    if (editEmail) editEmail.value = currentUser.email;
    if (editPhone) editPhone.value = currentUser.phone || "+234 80 1234 5678";
    if (editAddress) editAddress.value = currentUser.address || "12 Marina Road, Lagos Island, Lagos";
    
    // Generate dummy BVN if not exists
    if (!currentUser.bvn) {
        currentUser.bvn = "222" + Math.floor(10000000 + Math.random() * 90000000).toString();
        localStorage.setItem('current_user', JSON.stringify(currentUser));
    }
    const displayBVN = document.getElementById('displayBVN');
    if (displayBVN) {
        displayBVN.value = currentUser.bvn.substring(0, 3) + "******" + currentUser.bvn.substring(currentUser.bvn.length - 2);
    }
}

// ── TABS FUNCTIONALITY ──
function initTabListeners() {
    const tabButtons = document.querySelectorAll('.profile-tab-btn');
    const tabPanels = document.querySelectorAll('.profile-tab-panel');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.profileTab;
            
            // Remove active classes
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked tab and panel
            btn.classList.add('active');
            const panel = document.getElementById(targetTab);
            if (panel) panel.classList.add('active');
        });
    });
}

// ── LIMITS AND CARD CONTROLS INITIALIZATION ──
function initLimitsAndCards() {
    // 1. Transaction Limits Sliders
    const localLimit = currentUser.localTransferLimit || 1000000;
    const globalLimit = currentUser.globalTransferLimit || 500000;
    
    const localSlider = document.getElementById('localLimitRange');
    const localVal = document.getElementById('localLimitVal');
    if (localSlider && localVal) {
        localSlider.value = localLimit;
        localVal.textContent = `₦${Number(localLimit).toLocaleString('en-NG')}`;
    }

    const globalSlider = document.getElementById('globalLimitRange');
    const globalVal = document.getElementById('globalLimitVal');
    if (globalSlider && globalVal) {
        globalSlider.value = globalLimit;
        globalVal.textContent = `₦${Number(globalLimit).toLocaleString('en-NG')}`;
    }

    // 2. Card Frozen State Toggles
    const isFrozen = currentUser.cardFrozen || false;
    const cardFreezeToggle = document.getElementById('toggleCardFreeze');
    const cardMock = document.getElementById('bankCardMock');
    const frozenOverlay = document.getElementById('cardFrozenOverlay');
    const webToggle = document.getElementById('toggleWebPayments');

    if (cardFreezeToggle) cardFreezeToggle.checked = isFrozen;
    
    if (isFrozen) {
        if (cardMock) cardMock.classList.add('card-frozen');
        if (frozenOverlay) frozenOverlay.classList.add('active');
        if (webToggle) webToggle.disabled = true;
    }

    // 3. Card Web Payments Toggles
    const isWebEnabled = currentUser.webPayments !== undefined ? currentUser.webPayments : true;
    const webPaymentsToggle = document.getElementById('toggleWebPayments');
    if (webPaymentsToggle) webPaymentsToggle.checked = isWebEnabled;

    // 4. Security Settings checkboxes
    const toggle2FA = document.getElementById('toggle2FA');
    const toggleBiometrics = document.getElementById('toggleBiometrics');
    if (toggle2FA) toggle2FA.checked = currentUser.enable2FA || false;
    if (toggleBiometrics) toggleBiometrics.checked = currentUser.enableBiometrics || false;
}

// ── INTERACTIVE LIMITS CONTROL ──
function updateLimitDisplay(type) {
    if (type === 'local') {
        const slider = document.getElementById('localLimitRange');
        const valText = document.getElementById('localLimitVal');
        if (slider && valText) {
            valText.textContent = `₦${Number(slider.value).toLocaleString('en-NG')}`;
            currentUser.localTransferLimit = Number(slider.value);
        }
    } else {
        const slider = document.getElementById('globalLimitRange');
        const valText = document.getElementById('globalLimitVal');
        if (slider && valText) {
            valText.textContent = `₦${Number(slider.value).toLocaleString('en-NG')}`;
            currentUser.globalTransferLimit = Number(slider.value);
        }
    }
    
    // Save details to localStorage
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    syncWithUsersArray();
}

// ── CARD FREEZE TOGGLE ──
function toggleCardFreezeState() {
    const isChecked = document.getElementById('toggleCardFreeze').checked;
    const cardMock = document.getElementById('bankCardMock');
    const frozenOverlay = document.getElementById('cardFrozenOverlay');
    const webToggle = document.getElementById('toggleWebPayments');

    currentUser.cardFrozen = isChecked;
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    syncWithUsersArray();

    if (isChecked) {
        if (cardMock) cardMock.classList.add('card-frozen');
        if (frozenOverlay) frozenOverlay.classList.add('active');
        if (webToggle) {
            webToggle.checked = false;
            webToggle.disabled = true;
        }
        showFeedbackToast('❄ Visual Card Frozen. Payments suspended.', 'info');
    } else {
        if (cardMock) cardMock.classList.remove('card-frozen');
        if (frozenOverlay) frozenOverlay.classList.remove('active');
        if (webToggle) {
            webToggle.checked = currentUser.webPayments !== undefined ? currentUser.webPayments : true;
            webToggle.disabled = false;
        }
        showFeedbackToast('✓ Visual Card Unfrozen successfully.', 'success');
    }
}

// ── CARD WEB PAYMENTS FEATURE TOGGLE ──
function toggleCardFeature(feature) {
    if (feature === 'Web') {
        const isChecked = document.getElementById('toggleWebPayments').checked;
        currentUser.webPayments = isChecked;
        localStorage.setItem('current_user', JSON.stringify(currentUser));
        syncWithUsersArray();
        
        if (isChecked) {
            showFeedbackToast('✓ Web payments enabled on card.', 'success');
        } else {
            showFeedbackToast('❄ Web payments disabled on card.', 'info');
        }
    }
}

// ── SHOW CARD Monospace Details ──
function toggleShowCardDetails() {
    const isChecked = document.getElementById('toggleShowDetails').checked;
    const mockCardNo = document.getElementById('mockCardNumber');
    const cvvText = document.getElementById('cardCvv');
    
    if (isChecked) {
        mockCardNo.textContent = "4532 9812 4028 4587";
        cvvText.textContent = "289";
        showFeedbackToast('🛡 Security details visible.', 'info');
    } else {
        mockCardNo.textContent = "•••• •••• •••• 4587";
        cvvText.textContent = "***";
    }
}

// ── BVN SHOW & HIDE TOGGLE ──
function toggleBVN() {
    const bvnInput = document.getElementById('displayBVN');
    const eyeIcon = document.getElementById('bvnEyeIcon');
    const realBVN = currentUser.bvn || "22213456789";
    
    if (bvnInput.value.includes('*')) {
        bvnInput.value = realBVN;
        eyeIcon.className = "fa-solid fa-eye-slash";
    } else {
        bvnInput.value = realBVN.substring(0, 3) + "******" + realBVN.substring(realBVN.length - 2);
        eyeIcon.className = "fa-solid fa-eye";
    }
}

// ── SECURITY TOGGLE PREFERENCES ──
function toggleSecuritySetting(setting) {
    if (setting === '2FA') {
        const isChecked = document.getElementById('toggle2FA').checked;
        currentUser.enable2FA = isChecked;
        showFeedbackToast(isChecked ? '🛡 2-Factor authentication active.' : '⚠️ 2-Factor authentication disabled.', isChecked ? 'success' : 'info');
    } else if (setting === 'Biometrics') {
        const isChecked = document.getElementById('toggleBiometrics').checked;
        currentUser.enableBiometrics = isChecked;
        showFeedbackToast(isChecked ? '✓ Biometric login enabled.' : '✓ Biometric login disabled.', 'success');
    }
    
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    syncWithUsersArray();
}

// ── SAVE PERSONAL INFORMATION FORM ──
function saveProfileEdits(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName = document.getElementById('editLastName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const address = document.getElementById('editAddress').value.trim();
    
    if (!firstName || !lastName || !phone || !address) {
        showFeedbackToast('❌ Please fill in all required fields', 'error');
        return;
    }
    
    // Update local variables
    currentUser.firstName = firstName;
    currentUser.lastName = lastName;
    currentUser.phone = phone;
    currentUser.address = address;
    
    // Save current session
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    syncWithUsersArray();
    
    // Reload display labels
    populateProfile();
    
    showFeedbackToast('✓ Personal profile saved successfully!', 'success');
}

// ── UTILITY: SYNCHRONIZE CURRENT USER TO MEMBERS LIST ──
function syncWithUsersArray() {
    const users = JSON.parse(localStorage.getItem('df_users')) || [];
    const index = users.findIndex(u => u.email === currentUser.email);
    if (index !== -1) {
        // Sync all settings keys
        users[index].firstName = currentUser.firstName;
        users[index].lastName = currentUser.lastName;
        users[index].phone = currentUser.phone;
        users[index].address = currentUser.address;
        users[index].bvn = currentUser.bvn;
        users[index].cardFrozen = currentUser.cardFrozen;
        users[index].webPayments = currentUser.webPayments;
        users[index].localTransferLimit = currentUser.localTransferLimit;
        users[index].globalTransferLimit = currentUser.globalTransferLimit;
        users[index].enable2FA = currentUser.enable2FA;
        users[index].enableBiometrics = currentUser.enableBiometrics;
        
        localStorage.setItem('df_users', JSON.stringify(users));
    }
}

// ── UTILITY: FORMAT MONEY (CURRENCY) ──
function formatMoney(value) {
    return Number(value).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ── COPY TO CLIPBOARD ──
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const text = element.textContent;

    navigator.clipboard.writeText(text).then(() => {
        showFeedbackToast('✓ Copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback method
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showFeedbackToast('✓ Copied to clipboard!', 'success');
    });
}

// ── TOAST NOTIFICATION UTILITY ──
function showFeedbackToast(message, type = 'success') {
    const existing = document.getElementById('profileToast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.id = 'profileToast';
    
    let gradient = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'; // success
    if (type === 'error') gradient = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    if (type === 'info') gradient = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    
    toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: ${gradient};
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        font-size: 14px;
        font-weight: 600;
        z-index: 9999;
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 50);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ── ACTION HANDLERS WITH CONFIRMATIONS ──

function handleChangePassword() {
    showModal(
        'Change Account Password',
        'Are you sure you want to update your security password? This will trigger password reset instructions.',
        function () {
            showFeedbackToast('✓ Password reset instruction email has been sent.', 'success');
        },
        'Proceed'
    );
}

function handleChangePIN() {
    showModal(
        'Change Transaction PIN',
        'To change your 4-digit transaction PIN, we will send an authorization OTP code to your phone. Continue?',
        function () {
            showFeedbackToast('✓ Authorization code has been text-messaged.', 'success');
        },
        'Send Code'
    );
}

function handleContactSupport() {
    showModal(
        'Start Live Chat Support',
        'This will redirect you to live messenger to connect with a virtual banking support assistant. Continue?',
        function () {
            showFeedbackToast('✓ Loading Support Agent chat panel...', 'info');
        },
        'Connect'
    );
}

function handleLogout() {
    showModal(
        'Confirm Sign Out',
        `Are you sure you want to sign out from your DAFAH Bank account? This will clear active cookies and sessions.`,
        function () {
            // Clear current session
            localStorage.removeItem('current_user');
            localStorage.removeItem('current_session');

            showFeedbackToast('✓ Session terminated. Redirecting...', 'info');

            // Redirect back to sign.html
            setTimeout(() => {
                window.location.href = '/sign-up/sign.html';
            }, 1200);
        },
        'Sign Out'
    );
}

function signOutToHome() {
    localStorage.removeItem('current_user');
    localStorage.removeItem('current_session');
    window.location.href = '/home-page/index.html';
}

// ── MODAL CONSTRUCTORS ──
function showModal(title, message, onConfirm, confirmText = 'Confirm') {
    const modal = document.getElementById('confirmModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const confirmBtn = document.getElementById('confirmBtn');

    if (!modal || !modalTitle || !modalMessage || !confirmBtn) return;

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    confirmBtn.textContent = confirmText;

    // Clone node to clear old event listeners safely
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', function () {
        onConfirm();
        closeConfirmModal();
    });

    modal.style.display = 'flex';
}

function closeConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (modal) modal.style.display = 'none';
}

// ── MOBILE BOTTOM SHEETS CONTROLS ──
function openMobileTransferSheet() {
    const sheet = document.getElementById('transferSheet');
    const overlay = document.getElementById('transferOverlay');
    if (sheet) sheet.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileTransferSheet() {
    const sheet = document.getElementById('transferSheet');
    const overlay = document.getElementById('transferOverlay');
    if (sheet) sheet.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function openMobileMoreSheet() {
    const sheet = document.getElementById('moreSheet');
    const overlay = document.getElementById('moreOverlay');
    if (sheet) sheet.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMoreSheet() {
    const sheet = document.getElementById('moreSheet');
    const overlay = document.getElementById('moreOverlay');
    if (sheet) sheet.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
}
