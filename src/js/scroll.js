const COMPACT_AT = 100;
const RESIZE_DEBOUNCE = 150;
const TOLERANCE = 2;
const SCROLL_SETTLE = 2000;

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
    let lockedLink = null;
    let lockTimer = 0;

    function measure() {
        const activationLine =
            parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + TOLERANCE;
        offsets = sections.map(
            (section) => section.getBoundingClientRect().top + window.scrollY - activationLine
        );
        update();
    }

    function setActive(next) {
        if (next === activeLink) return;
        activeLink?.classList.remove('is-active');
        next?.classList.add('is-active');
        activeLink = next;
    }

    function lockTo(link) {
        lockedLink = link;
        setActive(link);
        clearTimeout(lockTimer);
        lockTimer = setTimeout(unlock, SCROLL_SETTLE);
    }

    function unlock() {
        if (!lockedLink) return;
        lockedLink = null;
        clearTimeout(lockTimer);
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

        const next = atBottom ? links[links.length - 1] : linkFor[Math.max(0, i - 1)];

        if (lockedLink) {
            if (next === lockedLink) unlock();
            return;
        }

        setActive(next);
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
    links.forEach((link) => link.addEventListener('click', () => lockTo(link)));

    ['wheel', 'touchstart', 'keydown'].forEach((type) =>
        window.addEventListener(type, unlock, { passive: true })
    );

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(measure, RESIZE_DEBOUNCE);
    });
    window.addEventListener('load', measure);

    measure();
}
