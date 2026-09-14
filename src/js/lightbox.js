/**
 * Gallery lightbox — requirement 11.
 *
 * One native <dialog> serves every tile. A single delegated listener on the
 * gallery takes the clicked tile's own photo, looks up its longer note in the
 * manifest by data-photo, fills the dialog, and opens it with showModal(). The browser supplies the
 * backdrop, Escape-to-close, focus trapping, and returning focus to the tile.
 */

import { photos } from './data.js';

export function init(gallery, dialog) {
    if (!gallery || !dialog || typeof dialog.showModal !== 'function') return;

    const image = dialog.querySelector('[data-lightbox-image]');
    const title = dialog.querySelector('[data-lightbox-caption]');
    const meta = dialog.querySelector('[data-lightbox-meta]');
    const description = dialog.querySelector('[data-lightbox-description]');
    const close = dialog.querySelector('[data-lightbox-close]');

    function open(tileImage, photo) {
        // currentSrc is the URL webpack actually emitted for the tile's photo.
        image.src = tileImage.currentSrc || tileImage.src;
        image.alt = tileImage.alt;
        title.textContent = photo.title;
        meta.textContent = photo.meta;
        description.textContent = photo.description;
        dialog.showModal();
    }

    gallery.addEventListener('click', (event) => {
        const tile = event.target.closest('[data-photo]');
        const photo = tile && photos[tile.dataset.photo];
        const tileImage = tile && tile.querySelector('img');
        if (photo && tileImage) open(tileImage, photo);
    });

    close.addEventListener('click', () => dialog.close());

    // Clicks on the ::backdrop are reported on the <dialog> itself, as are
    // clicks on its own padding, so tell them apart by position.
    dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const box = dialog.getBoundingClientRect();
        const inside =
            event.clientX >= box.left && event.clientX <= box.right &&
            event.clientY >= box.top && event.clientY <= box.bottom;
        if (!inside) dialog.close();
    });
}
