/**
 * Menu carousel — requirement 6.
 *
 * The slides sit side by side in a flex track; showing slide N is a single
 * translate3d(-N * 100%) on that track, animated by CSS. Prev/next arrows
 * wrap around at either end, which is less code than clamping and disabling
 * them. Slides that are off screen are made inert, so keyboard focus and
 * screen readers only ever reach the one that is visible.
 */

export function init(root) {
    const track = root.querySelector('[data-carousel-track]');
    const slides = Array.from(root.querySelectorAll('[data-carousel-slide]'));
    const prev = root.querySelector('[data-carousel-prev]');
    const next = root.querySelector('[data-carousel-next]');

    if (!track || !slides.length || !prev || !next) return;

    let index = 0;

    function show(i) {
        index = (i + slides.length) % slides.length;
        track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
        slides.forEach((slide, n) => {
            slide.inert = n !== index;
        });
    }

    prev.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));

    show(0);
}
