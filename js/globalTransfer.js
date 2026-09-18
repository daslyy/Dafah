/**
 * DAFAH Bank Limited - Money Transfer & Calculator Script
 * ---------------------------------------------------------------------------
 * This script powers the Wise-style international money transfer engine. It handles
 * dynamic flag rendering, custom dropdown searching, complex fee calculation algorithms,
 * reverse rate calculations, and URL parameter page state passing.
 * Every section is heavily commented for direct clarity and project defense.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================================================
    // DATABASE SECTION: 50 SUPPORTED TARGET COUNTRIES (Reshuffled)
    // =========================================================================
    // Purpose: Defines the available destination countries and conversion variables.
    // Structure:
    // - id: Unique ISO country code.
    // - name: Destination country name.
    // - currency: ISO currency code.
    // - symbol: Currency symbol.
    // - flag: FlagCDN code.
    // - baseRate: Exchange rate relative to USD (1 USD = baseRate in destination currency).
    const countriesData = [
        // --- African Countries ---
        { id: 'ke', name: 'Kenya', currency: 'KES', symbol: 'KSh', flag: 'ke', baseRate: 131.00 },
        { id: 'gh', name: 'Ghana', currency: 'GHS', symbol: 'GH₵', flag: 'gh', baseRate: 14.50 },
        { id: 'za', name: 'South Africa', currency: 'ZAR', symbol: 'R', flag: 'za', baseRate: 18.50 },
        { id: 'eg', name: 'Egypt', currency: 'EGP', symbol: 'E£', flag: 'eg', baseRate: 47.20 },
        { id: 'ma', name: 'Morocco', currency: 'MAD', symbol: 'DH', flag: 'ma', baseRate: 10.00 },
        { id: 'rw', name: 'Rwanda', currency: 'RWF', symbol: 'FRw', flag: 'rw', baseRate: 1300.00 },
        { id: 'bw', name: 'Botswana', currency: 'BWP', symbol: 'P', flag: 'bw', baseRate: 13.60 },
        { id: 'ug', name: 'Uganda', currency: 'UGX', symbol: 'USh', flag: 'ug', baseRate: 3780.00 },
        { id: 'tz', name: 'Tanzania', currency: 'TZS', symbol: 'TSh', flag: 'tz', baseRate: 2600.00 },
        { id: 'sn', name: 'Senegal', currency: 'XOF', symbol: 'CFA', flag: 'sn', baseRate: 605.00 },
        { id: 'cm', name: 'Cameroon', currency: 'XAF', symbol: 'FCFA', flag: 'cm', baseRate: 605.00 },
        { id: 'mu', name: 'Mauritius', currency: 'MUR', symbol: '₨', flag: 'mu', baseRate: 46.50 },

        // --- American Countries ---
        { id: 'us', name: 'United States', currency: 'USD', symbol: '$', flag: 'us', baseRate: 1.00 },
        { id: 'ca', name: 'Canada', currency: 'CAD', symbol: '$', flag: 'ca', baseRate: 1.36 },
        { id: 'br', name: 'Brazil', currency: 'BRL', symbol: 'R$', flag: 'br', baseRate: 5.20 },
        { id: 'mx', name: 'Mexico', currency: 'MXN', symbol: '$', flag: 'mx', baseRate: 17.50 },
        { id: 'ar', name: 'Argentina', currency: 'ARS', symbol: '$', flag: 'ar', baseRate: 890.00 },
        { id: 'co', name: 'Colombia', currency: 'COP', symbol: '$', flag: 'co', baseRate: 3850.00 },
        { id: 'cl', name: 'Chile', currency: 'CLP', symbol: '$', flag: 'cl', baseRate: 910.00 },
        { id: 'pe', name: 'Peru', currency: 'PEN', symbol: 'S/.', flag: 'pe', baseRate: 3.73 },
        { id: 'uy', name: 'Uruguay', currency: 'UYU', symbol: '$U', flag: 'uy', baseRate: 38.60 },
        { id: 'cr', name: 'Costa Rica', currency: 'CRC', symbol: '₡', flag: 'cr', baseRate: 512.00 },
        { id: 'jm', name: 'Jamaica', currency: 'JMD', symbol: 'J$', flag: 'jm', baseRate: 156.00 },
        { id: 'vg', name: 'British Virgin Islands', currency: 'USD', symbol: '$', flag: 'vg', baseRate: 1.00 },

        // --- Asian Countries ---
        { id: 'in', name: 'India', currency: 'INR', symbol: '₹', flag: 'in', baseRate: 83.20 },
        { id: 'jp', name: 'Japan', currency: 'JPY', symbol: '¥', flag: 'jp', baseRate: 156.00 },
        { id: 'cn', name: 'China', currency: 'CNY', symbol: '¥', flag: 'cn', baseRate: 7.24 },
        { id: 'sg', name: 'Singapore', currency: 'SGD', symbol: '$', flag: 'sg', baseRate: 1.35 },
        { id: 'kr', name: 'South Korea', currency: 'KRW', symbol: '₩', flag: 'kr', baseRate: 1370.00 },
        { id: 'hk', name: 'Hong Kong', currency: 'HKD', symbol: '$', flag: 'hk', baseRate: 7.80 },
        { id: 'ae', name: 'United Arab Emirates', currency: 'AED', symbol: 'د.إ', flag: 'ae', baseRate: 3.67 },
        { id: 'sa', name: 'Saudi Arabia', currency: 'SAR', symbol: 'ر.س', flag: 'sa', baseRate: 3.75 },
        { id: 'pk', name: 'Pakistan', currency: 'PKR', symbol: '₨', flag: 'pk', baseRate: 278.00 },
        { id: 'my', name: 'Malaysia', currency: 'MYR', symbol: 'RM', flag: 'my', baseRate: 4.70 },
        { id: 'th', name: 'Thailand', currency: 'THB', symbol: '฿', flag: 'th', baseRate: 36.60 },
        { id: 'id', name: 'Indonesia', currency: 'IDR', symbol: 'Rp', flag: 'id', baseRate: 16100.00 },
        { id: 'ph', name: 'Philippines', currency: 'PHP', symbol: '₱', flag: 'ph', baseRate: 58.50 },
        { id: 'vn', name: 'Vietnam', currency: 'VND', symbol: '₫', flag: 'vn', baseRate: 25400.00 },
        { id: 'tr', name: 'Turkey', currency: 'TRY', symbol: '₺', flag: 'tr', baseRate: 32.20 },
        { id: 'bd', name: 'Bangladesh', currency: 'BDT', symbol: '৳', flag: 'bd', baseRate: 117.00 },
        { id: 'lk', name: 'Sri Lanka', currency: 'LKR', symbol: '₨', flag: 'lk', baseRate: 300.00 },
        { id: 'np', name: 'Nepal', currency: 'NPR', symbol: '₨', flag: 'np', baseRate: 133.00 },

        // --- European & Oceanian Countries ---
        { id: 'gb', name: 'United Kingdom', currency: 'GBP', symbol: '£', flag: 'gb', baseRate: 0.79 },
        { id: 'au', name: 'Australia', currency: 'AUD', symbol: '$', flag: 'au', baseRate: 1.50 },
        { id: 'nz', name: 'New Zealand', currency: 'NZD', symbol: '$', flag: 'nz', baseRate: 1.63 },
        { id: 'ch', name: 'Switzerland', currency: 'CHF', symbol: 'CHF', flag: 'ch', baseRate: 0.90 },
        { id: 'ad', name: 'Andorra', currency: 'EUR', symbol: '€', flag: 'ad', baseRate: 0.92 },
        { id: 'at', name: 'Austria', currency: 'EUR', symbol: '€', flag: 'at', baseRate: 0.92 },
        { id: 'be', name: 'Belgium', currency: 'EUR', symbol: '€', flag: 'be', baseRate: 0.92 },
        { id: 'bg', name: 'Bulgaria', currency: 'BGN', symbol: 'lv', flag: 'bg', baseRate: 1.80 }
    ];

    // Source currencies definitions (currencies the user can send FROM)
    const popularSourceCurrencies = [
        { code: 'NGN', name: 'Nigerian Naira', flag: 'ng' },
        { code: 'USD', name: 'United States Dollar', flag: 'us' },
        { code: 'GBP', name: 'British pound', flag: 'gb' },
        { code: 'EUR', name: 'Euro', flag: 'eu' }
    ];

    // Source currencies rates relative to 1 USD base
    const sourceRates = {
        'NGN': 1480.00,
        'USD': 1.00,
        'GBP': 0.79,
        'EUR': 0.92
    };

    const currencySymbols = {
        'NGN': '₦',
        'USD': '$',
        'GBP': '£',
        'EUR': '€'
    };

    const sourceFlags = {
        'NGN': 'ng',
        'USD': 'us',
        'GBP': 'gb',
        'EUR': 'eu'
    };

    // Tracking active variables
    let selectedCountry = countriesData[0]; // Default: Kenya
    let sourceCurrency = 'NGN'; // Default sending currency

    // DOM Elements mapping
    const gridContainer = document.getElementById('countries-grid');
    const mainSectionHeading = document.getElementById('detail-country-heading');
    const mainSectionSubtext = document.getElementById('detail-country-subtext');
    const stepsSectionHeading = document.getElementById('steps-country-heading');
    const alternativeLink = document.getElementById('calc-alternative-link');
    
    const sendInput = document.getElementById('calc-send-amount');
    const receiveInput = document.getElementById('calc-receive-amount');
    
    const rateDisplay = document.getElementById('calc-exchange-rate');
    const headerRateDisplay = document.getElementById('calc-header-rate-text');
    const feeDisplay = document.getElementById('calc-total-fee');
    const feesDescDisplay = document.getElementById('calc-fees-description');
    
    const amountToConvertDisplay = document.getElementById('calc-convert-amount');
    const arrivesDisplay = document.getElementById('calc-arrives-time');
    const feeDiscountMsg = document.getElementById('calc-fee-discount-msg');

    // =========================================================================
    // SECTION 1: COUNTRY GRID RENDERING ENGINE (index.html)
    // =========================================================================
    // Purpose: Dynamically generate cards inside the homepage transfers container.
    // How it works:
    // 1. Checks if the `countries-grid` element exists on the active page.
    // 2. Iterates over the 50 supported countries.
    // 3. Applies a dynamically calculated staggered delay (`(index % 4) * 0.08` seconds)
    //    so the elements slide in horizontally row-by-row in a beautiful wave layout.
    // 4. Sets up a high-performance bi-directional IntersectionObserver to trigger and reset
    //    the entrance animation when elements scroll in/out of the viewport.
    if (gridContainer) {
        gridContainer.innerHTML = '';
        
        // Define bi-directional IntersectionObserver to watch individual country cards scroll reveals
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    entry.target.classList.remove('active');
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -40px 0px'
        });

        countriesData.forEach((country, index) => {
            const card = document.createElement('a');
            
            // Calculate a staggered delay based on its grid position modulo 4 for wave effect
            const staggerDelay = (index % 4) * 0.08;
            
            card.className = 'country-card reveal-right-to-left';
            card.style.transitionDelay = `${staggerDelay}s`;
            // Use an absolute app path so this script works from both the
            // homepage and the standalone global-transfer page.
            card.href = `/globalTransfer.html?country=${country.id}`;
            card.innerHTML = `
                <div class="country-flag-container">
                    <img src="https://flagcdn.com/w80/${country.flag}.png" alt="${country.name} Flag" class="country-flag-img">
                </div>
                <span class="country-send-link">Send money to ${country.name}</span>
            `;
            gridContainer.appendChild(card);
            
            // Observe the card immediately as it is generated in the DOM
            revealObserver.observe(card);
        });
    }

    // =========================================================================
    // SECTION 2: URL STATE PARSING & ROUTING BINDINGS (transfer.html)
    // =========================================================================
    // Purpose: Initialize specific calculators and panels based on query param navigation.
    // How it works:
    // 1. Verifies if the user is on the dedicated calculator details page.
    // 2. Uses URLSearchParams to extract the target country code.
    // 3. If found, matches with the database and loads the panel layout coordinates.
    const isTransferPage = !!document.getElementById('transfer-detail-wrapper');
    if (isTransferPage) {
        const urlParams = new URLSearchParams(window.location.search);
        const countryId = urlParams.get('country');
        
        let initialCountry = countriesData[0]; // Fallback defaults to Kenya
        if (countryId) {
            const found = countriesData.find(c => c.id === countryId);
            if (found) initialCountry = found;
        }

        initializeTransferPage(initialCountry);
    }

    function initializeTransferPage(country) {
        selectedCountry = country;

        // Set default send value of ₦100,000
        if (sendInput) {
            sendInput.value = '100000';
        }

        // Render searchable option panels
        renderSourceOptions('');
        renderTargetOptions('');

        // Setup dropdown events
        setupDropdownInteractiveEvents();

        // Update UI pill elements with active country flag images and currency acronyms
        updateFlagsAndPillCodes();

        // Dynamic texts replacements for the specific country
        updatePanelLabels(country);

        // Perform initial calculations
        calculateTransfer('send');
    }

    // Swaps headings, guide subtexts, and step labels to include the selected country
    function updatePanelLabels(country) {
        if (mainSectionHeading) {
            mainSectionHeading.innerHTML = `SEND MONEY<br>TO ${country.name.toUpperCase()}`;
        }
        if (mainSectionSubtext) {
            mainSectionSubtext.textContent = `Save on your online money transfer to ${country.name} from Nigeria. Transfer Nigerian Naira to ${country.name} currency quickly, safely and join over 14.8 million people using Dafah.`;
        }
        if (stepsSectionHeading) {
            stepsSectionHeading.textContent = `HOW TO SEND MONEY TO ${country.name.toUpperCase()} FROM NIGERIA`;
        }
        if (alternativeLink) {
            alternativeLink.textContent = `Send money from ${country.name} to Nigeria instead.`;
        }
    }

    // Re-renders the flag assets and ISO currency strings inside the calculator pill wrappers
    function updateFlagsAndPillCodes() {
        const sourceFlagEl = document.getElementById('calc-source-flag');
        const sourceCodeEl = document.getElementById('calc-source-code');
        if (sourceFlagEl) {
            const srcFlagCode = sourceFlags[sourceCurrency];
            sourceFlagEl.src = `https://flagcdn.com/w40/${srcFlagCode}.png`;
            sourceFlagEl.alt = `${sourceCurrency} Flag`;
        }
        if (sourceCodeEl) {
            sourceCodeEl.textContent = sourceCurrency;
        }

        const targetFlagEl = document.getElementById('calc-target-flag');
        const targetCodeEl = document.getElementById('calc-target-code');
        if (targetFlagEl) {
            targetFlagEl.src = `https://flagcdn.com/w40/${selectedCountry.flag}.png`;
            targetFlagEl.alt = `${selectedCountry.name} Flag`;
        }
        if (targetCodeEl) {
            targetCodeEl.textContent = selectedCountry.currency;
        }
    }

    // =========================================================================
    // SECTION 3: KEYBOARD-DRIVEN DYNAMIC DROPDOWN SEARCH FILTERS
    // =========================================================================
    // Purpose: Search and select currencies inside elegant custom overlay panels.
    // How it works:
    // 1. Monitors keystrokes inside the search fields.
    // 2. Maps input text against currency acronyms and country names.
    // 3. Re-draws matching options dynamically, highlighting the selected value.
    // 4. Attaches click selections that swap active currencies, dismiss popups, and calculate.
    function renderSourceOptions(filterText = '') {
        const listEl = document.getElementById('source-options-list');
        if (!listEl) return;

        const filtered = popularSourceCurrencies.filter(c => 
            c.code.toLowerCase().includes(filterText.toLowerCase()) || 
            c.name.toLowerCase().includes(filterText.toLowerCase())
        );

        listEl.innerHTML = filtered.map(c => `
            <div class="dropdown-option ${c.code === sourceCurrency ? 'active' : ''}" data-value="${c.code}">
                <img src="https://flagcdn.com/w40/${c.flag}.png" class="option-flag">
                <span class="option-code">${c.code}</span>
                <span class="option-name">${c.name}</span>
                ${c.code === sourceCurrency ? '<i class="fa-solid fa-check option-check"></i>' : ''}
            </div>
        `).join('');

        // Apply selections
        listEl.querySelectorAll('.dropdown-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                sourceCurrency = opt.getAttribute('data-value');
                
                updateFlagsAndPillCodes();
                calculateTransfer('send');
                renderSourceOptions('');

                document.getElementById('source-dropdown-panel').classList.remove('open');
            });
        });
    }

    function renderTargetOptions(filterText = '') {
        const listEl = document.getElementById('target-options-list');
        if (!listEl) return;

        const filtered = countriesData.filter(c => 
            c.currency.toLowerCase().includes(filterText.toLowerCase()) || 
            c.name.toLowerCase().includes(filterText.toLowerCase())
        );

        listEl.innerHTML = filtered.map(c => `
            <div class="dropdown-option ${c.id === selectedCountry.id ? 'active' : ''}" data-id="${c.id}">
                <img src="https://flagcdn.com/w40/${c.flag}.png" class="option-flag">
                <span class="option-code">${c.currency}</span>
                <span class="option-name">${c.name}</span>
                ${c.id === selectedCountry.id ? '<i class="fa-solid fa-check option-check"></i>' : ''}
            </div>
        `).join('');

        // Apply selections
        listEl.querySelectorAll('.dropdown-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const countryId = opt.getAttribute('data-id');
                const country = countriesData.find(c => c.id === countryId);
                if (country) {
                    selectedCountry = country;
                    
                    updateFlagsAndPillCodes();
                    updatePanelLabels(selectedCountry);
                    calculateTransfer('send');
                    renderTargetOptions('');
                }

                document.getElementById('target-dropdown-panel').classList.remove('open');
            });
        });
    }

    // Binds toggling popups, focusing fields, and clearing text on pill interactions
    function setupDropdownInteractiveEvents() {
        const sourcePill = document.getElementById('source-currency-pill');
        const targetPill = document.getElementById('target-currency-pill');

        const sourcePanel = document.getElementById('source-dropdown-panel');
        const targetPanel = document.getElementById('target-dropdown-panel');

        const sourceSearch = document.getElementById('source-search-input');
        const targetSearch = document.getElementById('target-search-input');

        if (sourcePill) {
            sourcePill.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = sourcePanel.classList.toggle('open');
                if (targetPanel) targetPanel.classList.remove('open');

                if (isOpen && sourceSearch) {
                    sourceSearch.value = '';
                    renderSourceOptions('');
                    sourceSearch.focus();
                }
            });
        }

        if (targetPill) {
            targetPill.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = targetPanel.classList.toggle('open');
                if (sourcePanel) sourcePanel.classList.remove('open');

                if (isOpen && targetSearch) {
                    targetSearch.value = '';
                    renderTargetOptions('');
                    targetSearch.focus();
                }
            });
        }

        document.querySelectorAll('.custom-dropdown-panel').forEach(panel => {
            panel.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });

        document.addEventListener('click', () => {
            if (sourcePanel) sourcePanel.classList.remove('open');
            if (targetPanel) targetPanel.classList.remove('open');
        });

        if (sourceSearch) {
            sourceSearch.addEventListener('input', (e) => {
                renderSourceOptions(e.target.value);
            });
        }

        if (targetSearch) {
            targetSearch.addEventListener('input', (e) => {
                renderTargetOptions(e.target.value);
            });
        }
    }

    // =========================================================================
    // SECTION 4: WISE-STYLE CALCULATOR MATH ENGINE
    // =========================================================================
    // Purpose: Power accurate money calculations, dynamic fees, and volume discounts.
    // Mathematical Formulas:
    // 1. Source to USD conversion: Send Amount / Source USD rate.
    // 2. Fee percentage: High-volume (> $25,000 USD) receives discount variable rate of 0.20%,
    //    otherwise standard rate is 0.35%.
    // 3. Dynamic Fee: Flat base fee ($1.97 USD equivalent) + (Send Amount in USD * variable rate).
    // 4. Net Conversion Payout: (Send Amount - Calculated Total Fee) * (Target Base Rate / Source Base Rate).
    // 5. Reverse Payout Math: Reverse calculation triggers when typing inside receive field.
    //    Formula: SendAmount = (ConvertAmount + (1.97 / Source rate)) / (1 - variable rate).
    function calculateTransfer(changedInput = 'send') {
        if (!sendInput || !receiveInput) return;

        const sendAmount = parseFloat(sendInput.value) || 0;
        
        // Retrieve exchange rates relative to USD base
        const srcRate = sourceRates[sourceCurrency];
        const tgtRate = selectedCountry.baseRate;
        
        // Conversion rate between the source and destination currencies
        const exchangeRate = tgtRate / srcRate;
        const sourceSymbol = currencySymbols[sourceCurrency];
        const targetSymbol = selectedCountry.symbol;

        // USD conversion to check for volume discounts
        const sendAmountInUSD = sendAmount / srcRate;
        const isLargeAmount = sendAmountInUSD >= 25000; 
        
        // Apply discounted variable percentage for high-volume transactions
        const variablePercentage = isLargeAmount ? 0.0020 : 0.0035; 
        
        // Compute fee in USD and convert back to source currency
        const baseFeeUSD = 1.97 + (sendAmountInUSD * variablePercentage);
        const totalFee = baseFeeUSD * srcRate;

        const rateString = `1 ${sourceCurrency} = ${exchangeRate.toFixed(6)} ${selectedCountry.currency}`;
        if (rateDisplay) {
            rateDisplay.textContent = rateString;
        }
        if (headerRateDisplay) {
            headerRateDisplay.textContent = rateString;
        }

        if (feeDisplay) {
            feeDisplay.innerHTML = `${sourceSymbol}${totalFee.toFixed(2)} <i class="fa-solid fa-chevron-right"></i>`;
        }
        if (feesDescDisplay) {
            feesDescDisplay.textContent = `Included in ${sourceCurrency} amount`;
        }

        // Toggle volume discount alert banner
        if (feeDiscountMsg) {
            if (isLargeAmount) {
                feeDiscountMsg.style.display = 'flex';
                feeDiscountMsg.innerHTML = `<i class="fa-solid fa-tag"></i> Sending over ${sourceSymbol}37,000,000 equivalent? <a href="#" class="discount-link">We'll discount our fee</a>`;
            } else {
                feeDiscountMsg.style.display = 'none';
            }
        }

        // --- Calculation Payout Flow ---
        if (changedInput === 'send') {
            // Forward Math
            const amountToConvert = Math.max(0, sendAmount - totalFee);
            const receiveAmount = amountToConvert * exchangeRate;
            
            if (amountToConvertDisplay) {
                amountToConvertDisplay.textContent = `${sourceSymbol}${amountToConvert.toFixed(2)}`;
            }
            receiveInput.value = receiveAmount.toFixed(2);
        } else {
            // Reverse Math (typing recipient amount calculates sending amount recursively)
            const receiveAmount = parseFloat(receiveInput.value) || 0;
            const amountToConvert = receiveAmount / exchangeRate;
            const sendAmountCalculated = (amountToConvert + (1.97 / srcRate)) / (1 - variablePercentage);
            
            sendInput.value = Math.max(0, sendAmountCalculated).toFixed(2);
            
            if (amountToConvertDisplay) {
                amountToConvertDisplay.textContent = `${sourceSymbol}${amountToConvert.toFixed(2)}`;
            }

            const finalFee = sendAmountCalculated - amountToConvert;
            if (feeDisplay) {
                feeDisplay.innerHTML = `${sourceSymbol}${finalFee.toFixed(2)} <i class="fa-solid fa-chevron-right"></i>`;
            }

            // Discount check in reverse
            const calcUSD = sendAmountCalculated / srcRate;
            if (feeDiscountMsg) {
                if (calcUSD >= 25000) {
                    feeDiscountMsg.style.display = 'flex';
                    feeDiscountMsg.innerHTML = `<i class="fa-solid fa-tag"></i> Sending over ${sourceSymbol}37,000,000 equivalent? <a href="#" class="discount-link">We'll discount our fee</a>`;
                } else {
                    feeDiscountMsg.style.display = 'none';
                }
            }
        }

        // Arrives speed estimates
        if (arrivesDisplay) {
            arrivesDisplay.textContent = selectedCountry.id === 'bd' || selectedCountry.id === 'bw' 
                ? 'Tomorrow - in 24 hours' 
                : 'Today - in seconds';
        }
    }

    // =========================================================================
    // SECTION 5: INPUT LISTENERS BINDINGS
    // =========================================================================
    if (sendInput) {
        sendInput.addEventListener('input', () => calculateTransfer('send'));
    }

    if (receiveInput) {
        receiveInput.addEventListener('input', () => calculateTransfer('receive'));
    }
});
