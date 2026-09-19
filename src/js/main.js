import { init as initScroll } from './scroll.js';
import { init as initCarousel } from './carousel.js';
import { init as initLightbox } from './lightbox.js';
import { init as initVideo } from './video.js';

function boot() {
    initScroll(document);
    document.querySelectorAll('[data-carousel]').forEach(initCarousel);
    initLightbox(
        document.querySelector('[data-gallery]'),
        document.querySelector('[data-lightbox]')
    );
    document.querySelectorAll('video[data-autoplay]').forEach(initVideo);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
