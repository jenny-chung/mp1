/**
 * Scroll controller — requirements 2, 3 and 4.
 *
 * The compact-navbar resize and the position indicator both need the scroll
 * position, so they share one passive listener whose work is coalesced onto a
 * single animation frame. Section offsets are cached rather than measured
 * during scroll, and the DOM is only written when a value actually changes.
 *
 * Requirement 5 (smooth scrolling) is handled declaratively in _base.scss by
 * `scroll-behavior: smooth` and `scroll-padding-top`: a plain <a href="#menu">
 * already scrolls smoothly, clears the sticky header, and updates the URL hash
 * on its own. The one thing CSS cannot do is settle the navbar's height before
 * the browser aims that jump, which is what onNavClick below is for.
 */

const COMPACT_AT = 100;        // px of scroll before the navbar shrinks
const RESIZE_DEBOUNCE = 150;   // ms of quiet before re-measuring
const SETTLE = 250;            // ms — just past the navbar's 200ms transition
const NAV_IDLE = 150;          // ms without scroll events that ends a nav jump
const TOLERANCE = 2;           // px — absorbs sub-pixel rounding in the landing
const COMPACT_CLASS = 'site-header--compact';
const INSTANT_CLASS = 'site-header--instant';
const ACTIVE_CLASS = 'is-active';

export function init(root = document) {
    const header = root.querySelector('[data-nav]');
    const links = Array.from(root.querySelectorAll('[data-nav-link]'));
    const sections = Array.from(root.querySelectorAll('[data-section]'));

    if (!header || !links.length || !sections.length) return;

    // Sections drive the scroll maths; each one looks up its own nav link by
    // id. A section with no link in the navbar — the hero — simply highlights
    // nothing, rather than shifting every other section's highlight by one.
    const linkFor = sections.map(
        (section) => links.find((link) => link.hash === `#${section.id}`) || null
    );

    const state = { compact: false, activeLink: null };
    let offsets = [];
    let navH = 0;
    let ticking = false;
    let resizeTimer = 0;
    let settleTimer = 0;
    let navigating = false;
    let navTimer = 0;

    /**
     * Cache the scroll position at which each section's top reaches the line
     * just below the navbar. That line is `scroll-padding-top` — the same one
     * the browser uses when it lands on an anchor — so a nav link always
     * highlights the section it scrolls to instead of stopping short of it.
     *
     * Called on init, on load, after a resize settles, and once the navbar has
     * finished changing height — never during a scroll.
     */
    function measure() {
        navH = header.offsetHeight;

        const padding = parseFloat(
            getComputedStyle(document.documentElement).scrollPaddingTop
        );
        const anchorLine = (Number.isNaN(padding) ? navH : padding) + TOLERANCE;

        offsets = sections.map(
            (section) => section.getBoundingClientRect().top + window.scrollY - anchorLine
        );
        update();
    }

    function update() {
        ticking = false;

        const y = window.scrollY;

        // While a nav-link jump is travelling, the navbar stays compact even
        // through the first 100px, or it would re-expand under the jump.
        const compact = navigating || y > COMPACT_AT;
        if (compact !== state.compact) {
            header.classList.toggle(COMPACT_CLASS, compact);
            state.compact = compact;
            // The navbar is in normal flow, so changing its height moves every
            // section below it. Re-measure once the transition has settled.
            clearTimeout(settleTimer);
            settleTimer = setTimeout(measure, SETTLE);
        }

        // Which section lies directly below the navbar's bottom edge. Each
        // cached offset is the scroll position at which that section's top
        // reaches that edge, so the last one at or above `y` is the section
        // the reader is in.
        let i = 0;
        while (i < offsets.length && offsets[i] <= y) i++;

        // The last stripe is shorter than the viewport, so its top may never
        // reach the navbar before the page runs out of scroll. At the bottom
        // it takes the highlight outright, as the README requires.
        const atBottom =
            window.innerHeight + y >= document.documentElement.scrollHeight - 2;

        const activeLink = atBottom
            ? links[links.length - 1]
            : linkFor[Math.max(0, i - 1)];

        if (activeLink !== state.activeLink) {
            state.activeLink?.classList.remove(ACTIVE_CLASS);
            activeLink?.classList.add(ACTIVE_CLASS);
            state.activeLink = activeLink;
        }
    }

    /**
     * The navbar is in normal flow, so compacting it lifts every section by the
     * difference between its two heights — and the browser does not re-aim a
     * smooth scroll once it is running. Compacting it here, synchronously
     * before the link's default jump is computed, means the offsets the browser
     * reads are already the compact ones, so `scroll-padding-top` (the compact
     * height) lands every section flush under the bar from any starting
     * position. The default action is left alone; this only settles geometry.
     *
     * The resize is applied without its transition, because a 200ms animation
     * would still be moving the page while the jump is being aimed. Manual
     * scrolling keeps the animated resize.
     *
     * `navigating` holds the compact state until the jump comes to rest;
     * otherwise update() would see scrollY still under COMPACT_AT — right
     * here in measure(), or on the jump's first frames — and undo it.
     */
    function onNavClick(event) {
        const target = root.querySelector(event.currentTarget.hash);

        // The hero sits at the top of the document, where the navbar belongs at
        // its full height; leave it to the scroll handler.
        if (!target || target === sections[0] || state.compact) return;

        navigating = true;
        holdNavigation();
        header.classList.add(INSTANT_CLASS, COMPACT_CLASS);
        state.compact = true;
        measure();                       // reads layout, so the change is applied
        requestAnimationFrame(() => header.classList.remove(INSTANT_CLASS));
    }

    // Restarted by every scroll event during a jump, so it fires once the
    // page has been still for NAV_IDLE. Started on click as well, in case the
    // page is already where the link points and never scrolls at all.
    function holdNavigation() {
        clearTimeout(navTimer);
        navTimer = setTimeout(() => {
            navigating = false;
            update();
        }, NAV_IDLE);
    }

    function onScroll() {
        if (navigating) holdNavigation();
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    }

    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(measure, RESIZE_DEBOUNCE);
    }

    links.forEach((link) => link.addEventListener('click', onNavClick));
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    // Re-measure once everything has loaded, in case anything shifted.
    window.addEventListener('load', measure);

    measure();
}
