import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/a11y';

import initTestimonialsCarousel from './modules/testimonial-carousel.js';
import { initSpecialDeals } from './modules/special-deals.js';
import { initNavbar } from './modules/navbar.js';
import { initFooter } from './modules/footer.js';

initTestimonialsCarousel();

const dialog = document.getElementById('special-deals-dialog');
const navigation = document.getElementById('primary-navigation');

/**
 * Locks vertical scroll while the navbar drawer or dialog is open.
 * @returns {void}
 */
function updateBodyScroll() {
    const isNavbarOpen = Boolean(document.querySelector('.navbar--open'));
    const isDialogOpen = Boolean(dialog?.open);

    document.body.style.overflowY =
        isNavbarOpen || isDialogOpen ? 'hidden' : '';
    document.documentElement.style.overflowY =
        isNavbarOpen || isDialogOpen ? 'hidden' : '';
}

/**
 * Highlights nav links matching the current URL hash.
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

initSpecialDeals({
    onDialogChange: updateBodyScroll,
    syncLink: syncActiveLink,
});
initNavbar({ onStateChange: updateBodyScroll, syncLink: syncActiveLink });
initFooter();
