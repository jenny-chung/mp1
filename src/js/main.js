import { init as initScroll } from './scroll.js';
import { init as initCarousel } from './carousel.js';
import { init as initLightbox } from './lightbox.js';

function boot() {
    initScroll(document);
    document.querySelectorAll('[data-carousel]').forEach(initCarousel);
    initLightbox(
        document.querySelector('[data-gallery]'),
        document.querySelector('[data-lightbox]')
    );
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
