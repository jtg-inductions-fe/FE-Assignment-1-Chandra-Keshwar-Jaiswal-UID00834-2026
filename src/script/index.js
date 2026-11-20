// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/a11y';

import initTestimonialsCarousel from './modules/testimonial-carousel';

initTestimonialsCarousel();

const navbar = document.querySelector('.navbar');
const menuButton = document.querySelector('.navbar__toggle');
const navigation = document.getElementById('primary-navigation');
const backdrop = document.querySelector('.navbar__backdrop');
const toggleIcon = menuButton.querySelector('img');
const navbarBrand = document.querySelector('.navbar__icon');
const navbarButtons = document.querySelector('.navbar__buttons');
const footerAccordions = document.querySelectorAll('.footer__accordian');
const footerTitles = document.querySelectorAll('.footer__title');
const tabletMediaQuery = window.matchMedia('(min-width: 431px)');

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
            ? '/assets/images/hamburger.svg'
            : '/assets/images/hamburger-close.svg';

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

/**
 * Handles clicks on footer accordion titles.
 *
 * On mobile layouts, toggles the clicked accordion and closes
 * all other accordions to maintain a single-open accordion behavior.
 *
 * Does nothing on tablet and larger layouts.
 *
 * @param {MouseEvent} event - The footer title click event.
 * @returns {void}
 */
function handleFooterClick(event) {
    if (tabletMediaQuery.matches) return;

    const currentAccordion = event.currentTarget.parentElement;

    footerAccordions.forEach((accordion) => {
        if (accordion !== currentAccordion) {
            accordion.classList.remove('footer__accordian--active');
            accordion
                .querySelector('.footer__title')
                ?.setAttribute('aria-expanded', 'false');
        }
    });

    const isExpanded = currentAccordion.classList.toggle(
        'footer__accordian--active',
    );
    event.currentTarget.setAttribute('aria-expanded', String(isExpanded));
}

/**
 * Updates footer accordion states according to the current viewport.
 *
 * On tablet and larger layouts, all accordion sections are expanded.
 * On mobile layouts, all accordion sections are collapsed initially.
 *
 * @returns {void}
 */
function updateFooterAccordions() {
    const isTablet = tabletMediaQuery.matches;

    footerAccordions.forEach((accordion) => {
        accordion.classList.toggle('footer__accordian--active', isTablet);
        accordion
            .querySelector('.footer__title')
            ?.setAttribute('aria-expanded', String(isTablet));
    });
}

footerTitles.forEach((title) => {
    title.addEventListener('click', handleFooterClick);
});

updateFooterAccordions();

tabletMediaQuery.addEventListener('change', updateFooterAccordions);
