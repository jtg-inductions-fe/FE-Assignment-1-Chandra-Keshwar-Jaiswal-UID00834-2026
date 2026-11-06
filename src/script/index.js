// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/a11y';

// Your carousel initialization
import initTestimonialsCarousel from './modules/testimonial-carousel';

initTestimonialsCarousel();

const navbar = document.querySelector('.navbar');
const menuButton = document.querySelector('.navbar__toggle');
const navigation = document.getElementById('primary-navigation');
const backdrop = document.querySelector('.navbar__backdrop');

if (navbar && menuButton && navigation) {
    const desktopQuery = window.matchMedia('(min-width: 1025px)');

    function setMenuOpen(isOpen) {
        navbar.classList.toggle('is-open', isOpen);

        menuButton.setAttribute('aria-expanded', String(isOpen));
        menuButton.setAttribute(
            'aria-label',
            isOpen ? 'Close navigation menu' : 'Open navigation menu',
        );

        navigation.inert = !isOpen;
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function syncNavigation() {
        setMenuOpen(false);
        navigation.inert = !desktopQuery.matches;
    }

    menuButton.addEventListener('click', () => {
        if (desktopQuery.matches) return;

        setMenuOpen(!navbar.classList.contains('is-open'));
    });

    backdrop?.addEventListener('click', () => {
        setMenuOpen(false);
    });

    navigation.addEventListener('click', (event) => {
        const link = event.target.closest('.navbar__link');

        if (!link || !navigation.contains(link)) return;

        navigation
            .querySelector('.navbar__link--active')
            ?.classList.remove('navbar__link--active');

        link.classList.add('navbar__link--active');

        // Close drawer on mobile and tablet
        if (!desktopQuery.matches) {
            setMenuOpen(false);
        }
    });

    navigation.addEventListener('click', (event) => {
        const link = event.target.closest('.navbar__link');

        if (!link || desktopQuery.matches) return;

        setMenuOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navbar.classList.contains('is-open')) {
            setMenuOpen(false);
            menuButton.focus();
        }
    });

    desktopQuery.addEventListener('change', syncNavigation);

    syncNavigation();
}
