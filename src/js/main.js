/**
 * Bootstrap. Each module exports an init() that takes its root element, so
 * nothing reaches into globals and nothing runs on import.
 */

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
