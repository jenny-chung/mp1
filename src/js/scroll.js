const COMPACT_AT = 100;
const RESIZE_DEBOUNCE = 150;
const TOLERANCE = 2;

export function init(root = document) {
    const header = root.querySelector('[data-nav]');
    const links = Array.from(root.querySelectorAll('[data-nav-link]'));
    const sections = Array.from(root.querySelectorAll('[data-section]'));

    if (!header || !links.length || !sections.length) return;

    const linkFor = sections.map(
        (section) => links.find((link) => link.hash === `#${section.id}`) || null
    );

    let offsets = [];
    let compact = false;
    let activeLink = null;
    let ticking = false;
    let resizeTimer = 0;

    // Scroll position where each section's top reaches the navbar, so a section is highlighted
    // only once it is the one being read rather than while it is still below the fold.
    function measure() {
        const activationLine =
            parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + TOLERANCE;
        offsets = sections.map(
            (section) => section.getBoundingClientRect().top + window.scrollY - activationLine
        );
        update();
    }

    function update() {
        ticking = false;

        const y = window.scrollY;
        const atBottom =
            window.innerHeight + y >= document.documentElement.scrollHeight - TOLERANCE;

        if (y > COMPACT_AT !== compact) {
            compact = !compact;
            header.classList.toggle('site-header--compact', compact);
        }

        let i = 0;
        while (i < offsets.length && offsets[i] <= y) i++;

        // The last section may never reach the activation line, so it wins at the bottom.
        const next = atBottom ? links[links.length - 1] : linkFor[Math.max(0, i - 1)];
        if (next !== activeLink) {
            activeLink?.classList.remove('is-active');
            next?.classList.add('is-active');
            activeLink = next;
        }
    }

    window.addEventListener(
        'scroll',
        () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(update);
        },
        { passive: true }
    );
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(measure, RESIZE_DEBOUNCE);
    });
    window.addEventListener('load', measure);

    measure();
}
