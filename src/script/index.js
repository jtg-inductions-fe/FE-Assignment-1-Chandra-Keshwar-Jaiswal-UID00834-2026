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

initSpecialDeals({ onDialogChange: updateBodyScroll });
initNavbar({ onStateChange: updateBodyScroll });
initFooter();
