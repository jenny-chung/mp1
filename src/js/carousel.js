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
