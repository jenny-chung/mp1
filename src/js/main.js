/**
 * Bootstrap. Each module exports an init() that takes its root element, so
 * nothing reaches into globals and nothing runs on import.
 */

import { init as initScroll } from './scroll.js';

function boot() {
    initScroll(document);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
