const tabletMediaQuery = window.matchMedia('(min-width: 431px)');

/**
 * Initializes responsive footer accordion behavior.
 * @returns {void}
 */
export function initFooter() {
    const footerAccordions = document.querySelectorAll('.footer__accordian');
    const footerTitles = document.querySelectorAll('.footer__title');

    if (!footerAccordions.length || !footerTitles.length) return;

    /**
     * Toggles a single accordion section on mobile viewports.
     * @param {MouseEvent} event
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
     * Expands all accordions on tablet/desktop or collapses them on mobile.
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
}
