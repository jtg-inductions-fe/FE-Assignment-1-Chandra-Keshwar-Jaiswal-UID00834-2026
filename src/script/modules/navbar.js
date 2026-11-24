const desktopQuery = window.matchMedia('(min-width: 1025px)');

/**
 * Initializes navbar drawer, responsive state, and link/dismissal listeners.
 * @param {{onStateChange: () => void}}
 * @param {{syncLink: () => void}}
 * @returns {void}
 */
export function initNavbar({ onStateChange, syncLink }) {
    const navbar = document.querySelector('.navbar');
    const menuButton = document.querySelector('.navbar__toggle');
    const navigation = document.getElementById('primary-navigation');
    const backdrop = document.querySelector('.navbar__backdrop');
    const toggleIcon = menuButton?.querySelector('img');
    const navbarBrand = document.querySelector('.navbar__icon');
    const navbarButtons = document.querySelector('.navbar__buttons');

    if (!navbar || !menuButton || !navigation) return;

    /**
     * Toggles drawer open state and syncs ARIA, inert, and icon attributes.
     * @param {boolean} isOpen
     * @returns {void}
     */
    function setMenuOpen(isOpen) {
        navbar.classList.toggle('navbar--open', isOpen);

        menuButton.setAttribute('aria-expanded', String(isOpen));
        menuButton.setAttribute(
            'aria-label',
            isOpen ? 'Close navigation menu' : 'Open navigation menu',
        );
        if (toggleIcon) {
            toggleIcon.src = !isOpen
                ? '/assets/images/hamburger.svg'
                : '/assets/images/hamburger-close.svg';
        }

        navigation.inert = !isOpen;
        if (navbarBrand) navbarBrand.inert = isOpen;
        if (navbarButtons) navbarButtons.inert = isOpen;

        onStateChange();
    }

    /**
     * Closes the drawer and syncs `inert` state on viewport changes.
     * @returns {void}
     */
    function syncNavigation() {
        setMenuOpen(false);
        navigation.inert = !desktopQuery.matches;
    }

    /**
     * Closes the drawer on mobile link clicks and restores focus when needed.
     * @param {MouseEvent} event
     * @returns {void}
     */
    function handleNavigationClick(event) {
        const link = event.target.closest(
            '.navbar__link, .navbar__drawer-buttons a',
        );

        if (!link || !navigation.contains(link)) return;

        if (!desktopQuery.matches) {
            setMenuOpen(false);
            if (link.id !== 'special-deals') {
                menuButton.focus();
            }
        }
    }

    menuButton.addEventListener('click', () => {
        if (desktopQuery.matches) return;
        setMenuOpen(!navbar.classList.contains('navbar--open'));
    });

    backdrop?.addEventListener('click', () => {
        setMenuOpen(false);
    });

    navigation.addEventListener('click', handleNavigationClick);

    document.addEventListener('keydown', (event) => {
        if (
            desktopQuery.matches ||
            !navbar.classList.contains('navbar--open')
        ) {
            return;
        }

        if (event.key === 'Escape') {
            setMenuOpen(false);
            menuButton.focus();
            return;
        }

        if (event.key === 'Tab') {
            const focusable = [
                menuButton,
                ...navigation.querySelectorAll(
                    'a[href], button:not([disabled])',
                ),
            ];
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    syncLink();
    window.addEventListener('hashchange', syncLink);
    desktopQuery.addEventListener('change', syncNavigation);
    syncNavigation();
}
