const navbar = document.querySelector('.navbar');
const menuButton = document.querySelector('.navbar__toggle');
const navigation = document.getElementById('primary-navigation');
const backdrop = document.querySelector('.navbar__backdrop');

if (navbar && menuButton && navigation) {
    const desktopQuery = window.matchMedia('(min-width: 1200px)');

    function setMenuOpen(isOpen) {
        navbar.classList.toggle('is-menu-open', isOpen);

        menuButton.setAttribute('aria-expanded', String(isOpen));
        menuButton.setAttribute(
            'aria-label',
            isOpen ? 'Close navigation menu' : 'Open navigation menu',
        );

        navigation.inert = !isOpen;

        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    function syncNavigation() {
        if (desktopQuery.matches) {
            navbar.classList.remove('is-menu-open');
            navigation.inert = false;

            menuButton.setAttribute('aria-expanded', 'false');
            menuButton.setAttribute('aria-label', 'Open navigation menu');

            document.body.style.overflow = '';
        } else {
            setMenuOpen(false);
        }
    }

    menuButton.addEventListener('click', () => {
        if (desktopQuery.matches) return;

        const isOpen = navbar.classList.contains('is-menu-open');
        setMenuOpen(!isOpen);
    });

    backdrop?.addEventListener('click', () => {
        setMenuOpen(false);
    });

    navigation.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            if (!desktopQuery.matches) {
                setMenuOpen(false);
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (
            event.key === 'Escape' &&
            navbar.classList.contains('is-menu-open')
        ) {
            setMenuOpen(false);
            menuButton.focus();
        }
    });

    desktopQuery.addEventListener('change', syncNavigation);

    syncNavigation();
}
