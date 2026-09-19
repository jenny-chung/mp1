import { descriptions } from './data.js';

export function init(gallery, dialog) {
    if (!gallery || !dialog || typeof dialog.showModal !== 'function') return;

    const image = dialog.querySelector('[data-lightbox-image]');
    const title = dialog.querySelector('[data-lightbox-title]');
    const meta = dialog.querySelector('[data-lightbox-meta]');
    const description = dialog.querySelector('[data-lightbox-description]');

    gallery.addEventListener('click', (event) => {
        const tile = event.target.closest('[data-photo]');
        if (!tile) return;

        const tileImage = tile.querySelector('img');
        const caption = tile.closest('figure').querySelector('figcaption');

        image.src = tileImage.currentSrc || tileImage.src;
        image.alt = tileImage.alt;
        title.textContent = caption.firstChild.textContent.trim();
        meta.textContent = caption.querySelector('.gallery__meta').textContent;
        description.textContent = descriptions[tile.dataset.photo] || '';
        dialog.showModal();
    });

    function closeViewer() {
        if (dialog.open) dialog.classList.add('is-closing');
    }

    dialog.addEventListener('animationend', (event) => {
        if (event.animationName !== 'lightbox-fade-out' || event.pseudoElement) return;
        dialog.close();
    });

    dialog.addEventListener('close', () => dialog.classList.remove('is-closing'));

    // Esc fires cancel; hold the dialog open so it can fade out.
    dialog.addEventListener('cancel', (event) => {
        if (!event.cancelable) return;
        event.preventDefault();
        closeViewer();
    });

    dialog.querySelector('[data-lightbox-close]').addEventListener('click', closeViewer);

    // The dialog has no padding, so a click on the dialog itself is on the backdrop.
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) closeViewer();
    });
}
