import Swiper from 'swiper';

import { Navigation, Pagination, A11y } from 'swiper/modules';

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
