import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/a11y';

import { initSpecialDeals } from './modules/special-deals.js';
import initTestimonialsCarousel from './modules/testimonial-carousel.js';

initTestimonialsCarousel();

const dialog = document.getElementById('special-deals-dialog');
const navbar = document.querySelector('.navbar');
const menuButton = document.querySelector('.navbar__toggle');
const navigation = document.getElementById('primary-navigation');
const backdrop = document.querySelector('.navbar__backdrop');
const toggleIcon = menuButton?.querySelector('img');
const navbarBrand = document.querySelector('.navbar__icon');
const navbarButtons = document.querySelector('.navbar__buttons');
const footerAccordions = document.querySelectorAll('.footer__accordian');
const footerTitles = document.querySelectorAll('.footer__title');
const tabletMediaQuery = window.matchMedia('(min-width: 431px)');

/**
 * Updates the document body's vertical scrolling behavior based on
 * whether the navbar drawer or Special Deals dialog is open.
 *
 * Prevents background scrolling whenever either overlay is active.
 *
 * @returns {void}
 */
function updateBodyScroll() {
    const isNavbarOpen = navbar?.classList.contains('navbar--open');
    const isDialogOpen = dialog?.open;

    document.body.style.overflowY =
        isNavbarOpen || isDialogOpen ? 'hidden' : '';
}

initSpecialDeals({ onDialogChange: updateBodyScroll });

if (navbar && menuButton && navigation) {
    const desktopQuery = window.matchMedia('(min-width: 1025px)');

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
        if (navbarBrand) navbarBrand.inert = isOpen;
        if (navbarButtons) navbarButtons.inert = isOpen;

        updateBodyScroll();
    }

    function syncActiveLink() {
        const currentHash = window.location.hash;

        navigation.querySelectorAll('.navbar__link').forEach((link) => {
            link.classList.toggle(
                'navbar__link--active',
                link.getAttribute('href') === currentHash,
            );
        });
    }

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

    navigation.addEventListener('click', handleNavigationClick);

    document.addEventListener('keydown', (event) => {
        if (
            event.key === 'Escape' &&
            navbar.classList.contains('navbar--open')
        ) {
            setMenuOpen(false);
            menuButton.focus();
        }
    });

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
