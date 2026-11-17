import Swiper from 'swiper';

import { Navigation, Pagination, A11y } from 'swiper/modules';

/**
 * Initializes the Swiper Carousel and slide with navigation, pagination and accessibility
 * @returns {void}
 */
const initTestimonialsCarousel = () => {
    const slider = document.querySelector('.testimonials__slider');

    if (!slider) return;

    new Swiper(slider, {
        modules: [Navigation, Pagination, A11y],

        // Default mobile configuration
        slidesPerView: 1,
        spaceBetween: 24,
        lazyPreloadPrevNext: 1,

        speed: 600,
        simulateTouch: true,
        grabCursor: true,
        allowTouchMove: true,
        loop: true,

        // Navigation
        navigation: {
            nextEl: '.testimonials__next',
            prevEl: '.testimonials__prev',
        },

        // Pagination
        pagination: {
            el: '.testimonials__pagination',
            clickable: true,
        },

        // Accessibility
        a11y: {
            prevSlideMessage: 'Previous testimonial',
            nextSlideMessage: 'Next testimonial',
        },
    });
};

export default initTestimonialsCarousel;
