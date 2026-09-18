/**
 * DAFAH Bank Limited - Core Application Script
 * ---------------------------------------------------------------------------
 * This script handles all global user interface logic, high-fidelity carousels,
 * interactive reviews, scroll triggers, counts, theme controls, and visual effects.
 * Every section is heavily commented for direct clarity and project defense.
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // SECTION 1: DYNAMIC USER SESSION MANAGER (Authentication Mockup)
    // =========================================================================
    // Purpose: Check if a user session is saved in local storage.
    // How it works:
    // 1. Attempts to read the 'current_user' item from browser localStorage.
    // 2. If it exists, parses the JSON string into an object.
    // 3. Dynamically overrides the sign-up CTA button in the header with a personalized greeting
    //    and a functional red Sign-out button.
    // 4. Attaches a click event listener to the Sign-out button that clears the session and reloads.
    const userSession = localStorage.getItem('current_user');
    if (userSession) {
        try {
            const user = JSON.parse(userSession);
            const headerCta = document.querySelector('.header-cta');
            if (headerCta) {
                // Inject personalized greeting link to dashboard and premium sign-out button
                headerCta.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <a href="dashboard.html" class="user-greeting-link" style="text-decoration: none; font-weight: 500; font-size: 1.1rem; color: #163300; font-family: 'Outfit', sans-serif; transition: opacity 0.2s;">
                            Hello, <strong style="color: #0056ff; border-bottom: 2px dashed rgba(0, 86, 255, 0.4);">${user.firstName}</strong> 💳
                        </a>
                        <a href="#" class="btn-signup btn-signout" id="sign-out-btn" style="background-color: #fee2e2 !important; color: #ef4444 !important; border: 1px solid rgba(239, 68, 68, 0.1); border-radius: 30px; padding: 12px 20px; font-size: 1.05rem; font-weight: 600; text-decoration: none; transition: all 0.2s;">Sign out</a>
                    </div>
                `;

                // Add Sign Out Event Listener to clear session storage and refresh
                document.getElementById('sign-out-btn').addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('current_user');
                    window.location.reload();
                });
            }
        } catch (e) {
            console.error('Failed to parse user session', e);
        }
    }

    // =========================================================================
    // SECTION 2: STICKY BLURRED SITE HEADER
    // =========================================================================
    // Purpose: Enhance readability of the header when the user scrolls down.
    // How it works:
    // 1. Listens to window scroll events.
    // 2. If the vertical offset (window.scrollY) exceeds 10 pixels, appends the '.scrolled'
    //    CSS class which triggers CSS backdrop-filter blur and subtle bottom borders.
    // 3. Removes it when the user returns to the top of the page.
    const header = document.querySelector('.site-header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // =========================================================================
    // SECTION 3: RESPONSIVE MOBILE HAMBURGER MENU DRAWER
    // =========================================================================
    // Purpose: Enable mobile users to toggle navigation items.
    // How it works:
    // 1. Listens to clicks on the mobile menu button (bars icon).
    // 2. Toggles the class '.mobile-active' on the navigation container drawer.
    // 3. Smoothly swaps the FontAwesome icons between fa-bars (hamburger) and fa-xmark (close).
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navCta = document.querySelector('.navCta');

    if (mobileMenuBtn && navCta) {
        mobileMenuBtn.addEventListener('click', () => {
            navCta.classList.toggle('mobile-active');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                if (navCta.classList.contains('mobile-active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    // =========================================================================
    // SECTION 4: LUXURY DROPDOWN MEGA MENU TABS
    // =========================================================================
    // Purpose: Power the dual-column tabbed menu inside the header dropdown.
    // How it works:
    // 1. Monitors mouseenter events on left-hand category tabs (e.g., Savings, Loans).
    // 2. Selects the associated target panel using its custom 'data-target' attribute.
    // 3. Resets active flags across all menu lists and activates the hovered tab
    //    and its detailed card-grid panel smoothly.
    const leftItems = document.querySelectorAll('.left-menu p');
    const contents = document.querySelectorAll('.content');

    leftItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const target = item.getAttribute('data-target');

            // Remove active indicator classes from all options and panels
            leftItems.forEach(i => i.classList.remove('active'));
            contents.forEach(content => content.classList.remove('active'));

            // Activate the hovered navigation target category and panel
            item.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // =========================================================================
    // SECTION 5: MEGA MENU BUTTON DROPDOWN TOGGLER
    // =========================================================================
    // Purpose: Toggle mega menu visibility when clicking the "Personal" button.
    // How it works:
    // 1. Toggles `.open` class on clicking the navigation dropdown link.
    // 2. Dismisses the dropdown safely if the user clicks anywhere outside of the header.
    const megaMenuBtn = document.querySelector('.dropdown');
    const megaMenu = document.querySelector('.mega-menu');

    if (megaMenuBtn && megaMenu) {
        megaMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            megaMenu.classList.toggle('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!megaMenuBtn.contains(e.target) && !megaMenu.contains(e.target)) {
                megaMenu.classList.remove('open');
            }
        });
    }

    // =========================================================================
    // SECTION 6: AUTOMATED HERO IMAGE ROTATION
    // =========================================================================
    // Purpose: Rotate hero images with a soft crossfade and scale easing effect.
    const slides = document.querySelectorAll('.slide');
    let current = 0;

    function showNextSlide() {
        const next = (current + 1) % slides.length;

        slides[current].classList.remove('active');
        slides[next].classList.add('active');
        current = next;
    }
    if (slides.length > 1) setInterval(showNextSlide, 6000);

    // =========================================================================
    // SECTION 7: WISE-STYLE REVIEWS PROGRESS CAROUSEL & VIDEO LOGIC
    // =========================================================================
    // Purpose: Power a high-fidelity testimonial slider complete with dynamic quote swaps,
    //          associated video player elements, and SVG countdown loading rings.
    // How it works:
    // 1. Holds a database array (`reviewsData`) of user testimonials, bios, and video paths.
    // 2. Initializes an animation timer utilizing requestAnimationFrame to run a sub-millisecond
    //    count tracker up to 30 seconds (`REVIEW_DURATION_MS`).
    // 3. Mathematically computes the progress percentage (`elapsed / duration`) and updates
    //    the SVG progress ring circle's stroke-dashoffset (`circumference - (circumference * progress)`)
    //    for a satisfying clock loading visual.
    // 4. Switches the text quote, user name, role, and resets HTML5 video states on completion.
    const reviewsData = [
        {
            quote: "DAFAH has completely changed how I handle my business finances. Payments are faster, everything is easy to track, and I no longer worry about delays or failed transactions. It’s not just about convenience, it’s about having a system I can rely on every single day. My customers are happier, and my business runs smoother because of it.",
            name: "Funke Davids",
            role: "Founder, Funks Mart",
            videoSrc: "../img/review1.mp4"
        },
        {
            quote: "DAFAH made it possible for me to access a loan when I needed it most. The process was simple, transparent, and surprisingly fast. What stood out for me was how stress-free everything felt. I got the support I needed without complications, and that made a huge difference.",
            name: "Chinedu Okafor",
            role: "CEO, The House",
            videoSrc: "../img/review2.mp4"
        },
        {
            quote: "Saving money used to feel difficult and inconsistent, but DAFAH helped me stay disciplined. I can now track my progress, set goals, and actually achieve them. It’s simple, clear, and it keeps me in control of my finances.",
            name: "Aisha Bello",
            role: "Creative Director",
            videoSrc: "../img/review1.mp4"
        },
        {
            quote: "Don’t just take our word for it. With DAFAH, everything just works. Transfers are smooth, the app is easy to use, and I feel confident managing my money. It’s reliable, secure, and built for everyday use — exactly what I was looking for.",
            name: "Emeka Nwosu",
            role: "Consultant",
            videoSrc: "../img/review1.mp4"
        }
    ];

    let currentReviewIndex = 0;
    let reviewTimer = null;
    const REVIEW_DURATION_MS = 30000; // 30 seconds per slide
    let startTime = 0;

    const quoteEl = document.getElementById('review-quote');
    const nameEl = document.getElementById('reviewer-name');
    const roleEl = document.getElementById('reviewer-role');
    const videoEl = document.getElementById('review-video');
    const avatarBtns = document.querySelectorAll('.avatar-btn');
    const playBtn = document.getElementById('play-btn');

    // Swap quote contents, bios, reset video loaders, and highlight selected buttons
    function updateReview(index) {
        if (!reviewsData[index] || !quoteEl) return;

        // Reset progress offsets of inactive circular loading rings
        avatarBtns.forEach(btn => {
            btn.classList.remove('active');
            const progressEl = btn.querySelector('.progress-ring__progress');
            if (progressEl) progressEl.style.strokeDashoffset = '188.495';
        });

        if (avatarBtns[index]) {
            avatarBtns[index].classList.add('active');
        }

        const data = reviewsData[index];
        quoteEl.textContent = data.quote;
        nameEl.textContent = data.name;
        roleEl.textContent = data.role;

        if (videoEl) {
            const videoFilename = data.videoSrc.split('/').pop();
            // Prevent reloading/flashing of videos if the source path is identical
            if (!videoEl.src.includes(videoFilename)) {
                videoEl.src = data.videoSrc;
            }
            videoEl.currentTime = 0;
            videoEl.pause();
        }

        if (playBtn) {
            playBtn.classList.remove('hidden');
        }

        resetTimer();
    }

    // Dynamic Step frame tracker for the SVG loading rings
    function doTimerStep() {
        if (!avatarBtns.length) return;
        const elapsed = Date.now() - startTime;
        let progress = elapsed / REVIEW_DURATION_MS;

        // Reset and jump to next testimonial card if timer completes
        if (progress >= 1) {
            progress = 1;
            currentReviewIndex = (currentReviewIndex + 1) % reviewsData.length;
            updateReview(currentReviewIndex);
            return;
        }

        // Apply countdown stroke-dashoffset transition to the active circular button ring
        const activeBtn = avatarBtns[currentReviewIndex];
        if (activeBtn) {
            const progressEl = activeBtn.querySelector('.progress-ring__progress');
            if (progressEl) {
                const circumference = 188.495; // Calculated as: 2 * pi * r (radius = 30)
                const offset = circumference - (circumference * progress);
                progressEl.style.strokeDashoffset = offset;
            }
        }

        reviewTimer = requestAnimationFrame(doTimerStep);
    }

    function startTimer() {
        startTime = Date.now();
        cancelAnimationFrame(reviewTimer);
        reviewTimer = requestAnimationFrame(doTimerStep);
    }

    function resetTimer() {
        startTimer();
    }

    // Attach click triggers to avatar button list
    avatarBtns.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
            currentReviewIndex = idx;
            updateReview(currentReviewIndex);
        });
    });

    const prevBtn = document.getElementById('review-prev');
    const nextBtn = document.getElementById('review-next');
    const videoNextBtn = document.getElementById('video-next-btn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentReviewIndex = (currentReviewIndex - 1 + reviewsData.length) % reviewsData.length;
            updateReview(currentReviewIndex);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentReviewIndex = (currentReviewIndex + 1) % reviewsData.length;
            updateReview(currentReviewIndex);
        });
    }
    if (videoNextBtn) {
        videoNextBtn.addEventListener('click', () => {
            currentReviewIndex = (currentReviewIndex + 1) % reviewsData.length;
            updateReview(currentReviewIndex);
        });
    }

    // Support Play/Pause and visual button triggers for user videos
    if (videoEl && playBtn) {
        playBtn.addEventListener('click', () => {
            if (videoEl.paused) {
                videoEl.play();
                playBtn.classList.add('hidden');
            } else {
                videoEl.pause();
                playBtn.classList.remove('hidden');
            }
        });

        videoEl.addEventListener('click', () => {
            if (!videoEl.paused) {
                videoEl.pause();
                playBtn.classList.remove('hidden');
            }
        });

        videoEl.addEventListener('ended', () => {
            playBtn.classList.remove('hidden');
        });
    }

    // Initialize Review Progress rings
    if (avatarBtns.length > 0 && quoteEl) {
        avatarBtns.forEach(btn => {
            const progressEl = btn.querySelector('.progress-ring__progress');
            if (progressEl) progressEl.style.strokeDashoffset = '188.495';
        });
        startTimer();
    }

    // =========================================================================
    // SECTION 8: DYNAMIC SYSTEM LIGHT/DARK THEME CONTROLLERS
    // =========================================================================
    // Purpose: Seamless theme toggler with localStorage state memory.
    // How it works:
    // 1. Reads 'theme' item from local storage on page loads to preserve user preference.
    // 2. If 'dark', triggers the class `.dark-theme` on document.body and sets the icon to Sun.
    // 3. Listens to clicks on the switcher button to toggle `.dark-theme`, save status,
    //    and animate the icon transition smoothly using coordinate rotations.
    const themeBtn = document.getElementById('theme-toggle-btn');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeBtn) {
            themeBtn.innerHTML = '<i class="fa-solid fa-sun" style="color: #ffd700;"></i>';
        }
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');

            if (isDark) {
                themeBtn.innerHTML = '<i class="fa-solid fa-sun" style="color: #ffd700;"></i>';
                // Premium elastic rotation animations
                themeBtn.style.transform = 'rotate(180deg)';
                setTimeout(() => themeBtn.style.transform = '', 300);
            } else {
                themeBtn.innerHTML = '<i class="fa-regular fa-moon"></i>';
                themeBtn.style.transform = 'rotate(-180deg)';
                setTimeout(() => themeBtn.style.transform = '', 300);
            }
        });
    }

    // =========================================================================
    // SECTION 9: MOUSE-TRACKING AMBIENT GLOW ORB (Luxury Desktop Sheen)
    // =========================================================================
    // Purpose: Display a luxury glow orb behind elements that moves smoothly with the cursor.
    // How it works:
    // 1. Appends a dynamic radial-gradient division element (`.interactive-glow-orb`) to the body.
    // 2. Captures page coordinates (pageX/pageY) within a mousemove event listener.
    // 3. Translates the orb's style coordinates seamlessly to float beneath the cursor.
    const orb = document.createElement('div');
    orb.className = 'interactive-glow-orb';
    document.body.appendChild(orb);

    document.addEventListener('mousemove', (e) => {
        orb.style.left = `${e.pageX}px`;
        orb.style.top = `${e.pageY}px`;
    });

    // =========================================================================
    // SECTION 10: BI-DIRECTIONAL SCROLL REVEALS (Intersection Observer)
    // =========================================================================
    // Purpose: Trigger elegant entrance/exit fade reveals when scrolling down OR up.
    // How it works:
    // 1. Gathers all main layout sections (About blocks, stats lists, awards, etc.).
    // 2. Classifies them into observer scopes by applying '.reveal-on-scroll'.
    // 3. Programs an Intersection Observer to watch elements entering/exiting view.
    // 4. Adds `.active` (fading/scaling in) when intersecting, and strips it when exiting view,
    //    ensuring fluid animations in both scroll directions.
    const elementsToReveal = [
        ...document.querySelectorAll('.award'),
        ...document.querySelectorAll('.reviews-header'),
        ...document.querySelectorAll('.reviews-content'),
        ...document.querySelectorAll('.hero .contents'),
        ...document.querySelectorAll('.awards .container h2'),
        ...document.querySelectorAll('.awards .container .subtitle'),
        ...document.querySelectorAll('.about-left'),
        ...document.querySelectorAll('.about-right p'),
        ...document.querySelectorAll('.about-feature-box'),
        ...document.querySelectorAll('.about-stats')
    ];

    elementsToReveal.forEach(el => {
        el.classList.add('reveal-on-scroll');
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
    });

    elementsToReveal.forEach(el => {
        revealObserver.observe(el);
    });

    // =========================================================================
    // SECTION 11: DYNAMIC STATS DECELERATING COUNT-UPS (Intersection Trigger)
    // =========================================================================
    // Purpose: Roll up statistics (e.g. 8M+, 50+) from 0 when scrolled into view.
    // How it works:
    // 1. Monitors the `.about-stats` stats block with an Intersection Observer.
    // 2. On viewport intersection, triggers a custom count-up loop using requestAnimationFrame.
    // 3. Computes progress over a 2-second timing window and uses an **ease-out quad**
    //    deceleration formula (`progress * (2 - progress)`) to create a smooth, organic finish.
    // 4. Automatically resets numbers back to 0 when scrolling off-screen so the visual
    //    can trigger beautifully next time.
    const statsSection = document.querySelector('.about-stats');
    const statNums = document.querySelectorAll('.stat-num[data-target]');

    if (statsSection && statNums.length > 0) {
        let animated = false;

        const countUp = (el) => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            const suffix = el.getAttribute('data-suffix') || '';
            const duration = 2000; // 2 seconds counting animation
            const start = 0;
            const startTime = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out quad formula for dynamic elastic deceleration: progress * (2 - progress)
                const easeProgress = progress * (2 - progress);

                const currentValue = Math.floor(start + easeProgress * (target - start));
                el.textContent = currentValue + suffix;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    el.textContent = target + suffix;
                }
            };

            requestAnimationFrame(animate);
        };

        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animated) {
                        statNums.forEach(num => countUp(num));
                        animated = true;
                    }
                } else {
                    // Reset to 0 when scrolled out of view to allow dynamic re-triggering
                    animated = false;
                    statNums.forEach(num => {
                        const suffix = num.getAttribute('data-suffix') || '';
                        num.textContent = "0" + suffix;
                    });
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        statsObserver.observe(statsSection);
    }

    // =========================================================================
    // SECTION 12: COLLAPSIBLE ABOUT SECTION TOGGLE
    // =========================================================================
    // Purpose: Toggle visibility of the extra paragraphs in the About section.
    // How it works:
    // 1. Attaches event listener to the toggle-button element.
    // 2. Toggles '.expanded' class on the collapsible moreContent wrapper.
    // 3. Rotates the chevron arrow icon and swaps the button text from "Read More" to "Read Less".
    const toggleBtn = document.getElementById('toggle-button');
    const moreContent = document.getElementById('moreContent');
    if (toggleBtn && moreContent) {
        const arrow = toggleBtn.querySelector('.arrow-icon');
        const btnText = toggleBtn.querySelector('.button-text');

        toggleBtn.addEventListener('click', () => {
            const isExpanded = moreContent.classList.toggle('expanded');
            const extraFeatures = document.getElementById('extraFeaturesWrapper');
            if (extraFeatures) {
                extraFeatures.classList.toggle('expanded', isExpanded);
            }
            if (arrow) {
                arrow.classList.toggle('open', isExpanded);
            }
            if (btnText) {
                btnText.textContent = isExpanded ? 'Read Less' : 'Read More';
            }
            toggleBtn.setAttribute('aria-expanded', isExpanded);
        });
    }

});