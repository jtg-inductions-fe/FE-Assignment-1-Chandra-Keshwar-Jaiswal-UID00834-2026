const navbar = document.querySelector('.navbar');
const menuButton = document.querySelector('.navbar__toggle');
const navigation = document.getElementById('primary-navigation');
const backdrop = document.querySelector('.navbar__backdrop');
const toggleIcon = menuButton.querySelector('img');
const navbarBrand = document.querySelector('.navbar__icon');
const navbarButtons = document.querySelector('.navbar__buttons');

if (navbar && menuButton && navigation) {
    const desktopQuery = window.matchMedia('(min-width: 1025px)');

    /**
     * Opens or closes the navigation drawer and updates its accessibility states.
     * @param {boolean} isOpen - Whether the navigation drawer should be open.
     * @returns {void}
     */
    function setMenuOpen(isOpen) {
        navbar.classList.toggle('navbar--open', isOpen);

        menuButton.setAttribute('aria-expanded', String(isOpen));
        menuButton.setAttribute(
            'aria-label',
            isOpen ? 'Close navigation menu' : 'Open navigation menu',
        );
        toggleIcon.src = !isOpen
            ? './public/assets/images/hamburger.svg'
            : './public/assets/images/hamburger-close.svg';

        navigation.inert = !isOpen;
        navbarBrand.inert = isOpen;
        navbarButtons.inert = isOpen;

        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    /**
     * Updates the active navigation link based on the current URL fragment.
     * @returns {void}
     */
    function syncActiveLink() {
        const currentHash = window.location.hash;

        navigation.querySelectorAll('.navbar__link').forEach((link) => {
            link.classList.toggle(
                'navbar__link--active',
                link.getAttribute('href') === currentHash,
            );
        });
    }

    /**
     * Resets the navigation drawer and synchronizes its inert state with the viewport.
     * @returns {void}
     */
    function syncNavigation() {
        setMenuOpen(false);
        navigation.inert = !desktopQuery.matches;
    }

    menuButton.addEventListener('click', () => {
        if (desktopQuery.matches) return;

        setMenuOpen(!navbar.classList.contains('navbar--open'));
    });

    backdrop?.addEventListener('click', () => {
        setMenuOpen(false);
    });

    /**
     * Handles navigation link clicks and closes the drawer on mobile and tablet.
     * @param {MouseEvent} event - The navigation click event.
     * @returns {void}
     */
    function handleNavigationClick(event) {
        const link = event.target.closest(
            '.navbar__link, .navbar__drawer-buttons a',
        );

        if (!link || !navigation.contains(link)) return;

        if (!desktopQuery.matches) {
            setMenuOpen(false);
            menuButton.focus();
        }
    }

    navigation.addEventListener('click', handleNavigationClick);

    /**
     * Closes the navigation drawer and restores focus when Escape is pressed.
     * @param {KeyboardEvent} event - The keyboard event.
     * @returns {void}
     */
    function handleEscapeKey(event) {
        if (event.key === 'Escape' && navbar.classList.contains('is-open')) {
            setMenuOpen(false);
            menuButton.focus();
        }
    }

    document.addEventListener('keydown', handleEscapeKey);

    // Update active link on initial load and browser navigation
    syncActiveLink();
    window.addEventListener('hashchange', syncActiveLink);

    desktopQuery.addEventListener('change', syncNavigation);

    syncNavigation();
}
