(function () {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
})();

// Give the mobile AI shortcut a subtle response while the user scrolls.
(function () {
    let scrollTimer;
    window.addEventListener('scroll', function () {
        document.body.classList.add('is-scrolling');
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function () {
            document.body.classList.remove('is-scrolling');
        }, 420);
    }, { passive: true });
})();
