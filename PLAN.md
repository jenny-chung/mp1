# MP1 — Nīzu Cafe Website: Architecture & Plan

## Context

CS409 MP1 requires a single-page site satisfying 16 graded requirements using **only** HTML5,
SCSS, and vanilla JS (ES6). The repo (`/Users/jchung/cs409/mp1`) is the staff template with a
blank slate: `src/css/main.scss` and `src/js/main.js` are one-line stubs, `src/index.html` is a
"Hello World" placeholder, and `src/assets/` holds a single 563×565 `image.jpg`.

The page will be about a cafe called **Nīzu Cafe**, a Japanese-inspired matcha and coffee cafe.
Menu items include, for example, Matcha Reserve Latte, Ebi Katsu Sando, Vanilla Basque
Cheesecake, etc. Hours to use on `#visit`: weekdays 8am–5pm, weekends 10am–5pm. The website
should have a Japanese-minimalist look.

Hard constraints beyond the README: no jQuery/Bootstrap/React/Tailwind or any external JS/CSS
framework, no `style="..."` attributes, no inline `<script>` tags — all behavior in external JS
modules, all styling in SCSS partials.

Confirmed direction:
- **Photos:** I will provide the photos as local `.jpg` files in `src/assets/`.
- **Video:** remote public sample MP4 in an HTML5 `<video>` tag, with a local poster and fallback
  text, standing in for real footage (e.g. a matcha-prep clip) if you film your own later.
- **Aesthetic:** Japanese-minimalist, matching the cafe's real look (pale wood, soft light,
  matcha green) — `#f7f5ef` canvas, `#2b2620` ink, `#5c6f3f` matcha-green accent, thin sans
  display type, hairline rules, crisp ~200ms transitions.

This plan intentionally favors the simplest implementation that still hits every requirement and
every rubric line item — no extra machinery beyond what's graded, and no polish (dot pagination,
a hamburger menu, multiple animation instances, extra breakpoints, more photos than needed) added
just because it would look nicer. Anything beyond the literal requirement is left out for now and
can be layered on later once the base implementation is working and graded correctly.

---

## Verified build facts

| Fact | Implication |
|---|---|
| `sass` is 1.38.2 | `@use` / `@forward` module system available — use it, not legacy `@import`. |
| webpack `context` is `src/`, entry `./index.js` | All imports resolve relative to `src/`. |
| `html-loader` processes `<img src>` | A reference to a missing file fails the build — placeholder strategy needed in Phase 1. |
| `CopyPlugin` copies `./assets/` → `build/assets/` | Runtime string paths (set from JS) also work. |
| SCSS chain: `style-loader → css-loader → postcss-loader → sass-loader` | `url()` in SCSS resolves via css-loader (`../assets/...`). Autoprefixer runs automatically. |
| CI: `npm ci` → `npm run build` → uploads `build/` | No workflow edits needed. |
| `package.json`/`package-lock.json` are modified but in sync | Commit both together. |

---

## Requirement → section mapping

Six full-width stripes, plus header and footer. Every requirement is pinned to one place.

| # | Stripe (nav id) | Content | Requirements satisfied |
|---|---|---|---|
| — | `<header>` navbar | Wordmark "Nīzu" + 6 nav links (wraps/shrinks by CSS alone below ~880px, no JS) | 2 sticky, 3 indicator, 4 resizing, 5 smooth scroll |
| 1 | `#home` | Full-viewport hero, vertically centered tagline over a storefront/interior photo | 1 layout, 8 centering |
| 2 | `#menu` | Carousel — 3 signature items (matcha latte, katsu sando, cheesecake), side arrows, captions | 6 carousel, 15 icons (mask-image arrows) |
| 3 | `#gallery` | Multi-column photo grid (3 columns ≥1024px, 1 column below) of interior/drink shots, tiles open a modal | 7 multi-column, 11 modal, 14 hover transition |
| 4 | `#story` | Fixed-position background image (interior shot) with a centered pull-quote about the cafe's concept | 10 background image |
| 5 | `#craft` | HTML5 `<video>` — matcha-prep clip, poster, controls, fallback text | 12 video |
| 6 | `#visit` | Address, hours (weekdays 8am–5pm, weekends 10am–5pm), contact email, centered, hairline-ruled | 8 centering |
| — | `<footer>` | Colophon + social media icons (Instagram, Facebook, directions/map) | 1 footer, 16 social icons |

One multi-column section (`#gallery`) covers requirement 7 — no separate services/cards section is
needed just to repeat it. Icons (15) are covered by the carousel arrows and reused for the footer
social set (16), so there's one icon mechanism, not two.

Requirement 9 (responsiveness at the five listed resolutions) and 13 (SCSS features) are
cross-cutting, handled in Phase 2 and checked at the end of every phase. Requirement 8 has two
parts, both cross-cutting rather than tied to one row of the table: horizontal centering applies
to every stripe (header, all six sections, footer — see the shared `.stripe` pattern below), and
the one required vertical centering lives in `#home` using `display: grid; place-items: center`,
so the child stays centered regardless of the outer element's size.

---

## Architecture

### SCSS structure (`src/css/`)

Flat and small on purpose — enough to show real SCSS usage (variables, a `$breakpoints` map with
`@each`, mixins, nesting) without extra folders to maintain.

```
main.scss          // @use manifest, in cascade order — no declarations of its own
_variables.scss     // colors, type scale, spacing scale, $breakpoints map
_mixins.scss        // respond-to($bp), flex-center(), transition-fast(), icon($svg)
_base.scss          // reset, box-sizing, scroll-behavior, base typography, @keyframes, .stripe pattern
_navbar.scss        // sticky navbar, compact modifier, active-link indicator
_sections.scss      // hero, carousel, gallery grid, background stripe, video, visit, footer
_modal.scss         // <dialog> + ::backdrop styling
```

Three SCSS features are the visible, deliberate ones for requirement 13: a `$breakpoints` map
consumed by an `@each`-driven `respond-to()` mixin, BEM-style nesting (`&--compact`, `&__item`)
throughout `_navbar.scss` and `_sections.scss`, and the parameterized `icon($svg, $size)` mixin
used for every icon on the page. No CSS custom properties are needed — everything JS needs (scroll
thresholds) is a plain constant in JS, so there's one source of truth per value instead of two
systems to keep in sync.

### One shared container pattern for horizontal centering (requirement 8)

Requirement 8's horizontal-centering half applies to *every* stripe — header, all six sections, and
footer — not just the two that also happen to need special treatment for other requirements. Rather
than centering each section's content by hand and risking one getting missed, every stripe uses the
same two-class pattern, defined once in `_base.scss`:

```scss
.stripe {
  width: 100%;               // full-width outer — satisfies requirement 1
}

.stripe__inner {
  max-width: 72rem;
  margin-inline: auto;       // horizontal centering, requirement 8
  padding-inline: clamp(1rem, 4vw, 3rem);
}
```

Every `<section>`, the `<header>`'s nav content, and the `<footer>`'s content wrap their content in
`.stripe > .stripe__inner` in the HTML — the same two classes everywhere, so centering isn't a
per-section decision. `#home` additionally gets a `stripe--center` modifier for
`place-items: center` (its vertical centering), and `#story`/`#gallery` add their own
modifiers on top of `.stripe`, but the base centering behavior is inherited from the one shared
class, not redeclared.

### Vanilla JS structure (`src/js/`)

```
main.js        // DOMContentLoaded bootstrap; calls each module's init()
scroll.js      // navbar resize + position indicator + smooth scroll (one scroll listener)
carousel.js    // menu-highlights slider
lightbox.js    // modal photo viewer
data.js        // photo manifest: filename, alt, caption
```

No `nav.js` — mobile nav is CSS-only (see Component logic), so there's no fifth JS module just to
toggle a hamburger panel.

Every module exports an `init()` and takes its root element as an argument — nothing reaches into
globals.

### The scroll controller — kept deliberately simple

Navbar resizing and the position indicator both need scroll position, so they share one listener,
coalesced onto one animation frame:

```js
// scroll.js — shape, not final code
const COMPACT_AT = 100;               // plain JS constant — no CSS var needed
let ticking = false;
let offsets = [];                     // section tops, cached — not read during scroll
let state = { compact: false, activeIndex: -1 };

function measure() {                  // called on load and on resize (debounced)
  const navH = nav.offsetHeight;
  offsets = sections.map(s => s.getBoundingClientRect().top + window.scrollY - navH);
}

function onScroll() {                 // registered { passive: true }
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(update);
}

function update() {
  ticking = false;
  const y = window.scrollY;
  const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 2;

  const compact = y > COMPACT_AT;
  if (compact !== state.compact) {
    nav.classList.toggle('site-nav--compact', compact);
    state.compact = compact;
  }

  let i = 0;
  while (i < offsets.length && offsets[i] <= y) i++;
  const activeIndex = atBottom ? links.length - 1 : Math.max(0, i - 1);
  if (activeIndex !== state.activeIndex) {
    links[state.activeIndex]?.classList.remove('is-active');
    links[activeIndex]?.classList.add('is-active');
    state.activeIndex = activeIndex;
  }
}
```

What this keeps from the fuller version, and why: offsets are cached rather than measured during
scroll (the usual cause of jank), the `ticking` flag coalesces rapid scroll events into one update
per frame, and writes only happen when a value actually changes. What it drops: hysteresis on the
compact threshold and a `ResizeObserver` on every section — neither is graded, a single threshold
is enough to satisfy "resizes on scroll," and it's much easier to read and debug.

The bottom-of-page override (`atBottom`) is still here because the README explicitly calls it out:
the last stripe may never cross the probe line on its own.

**Smooth scrolling:** `scroll-behavior: smooth` plus `scroll-padding-top` in `_base.scss` handles
both link clicks and the sticky-navbar offset declaratively — no extra JS needed beyond updating
the URL hash on click.

### Component logic

- **Carousel** — `translate3d(-N * 100%, 0, 0)` on a flex track. Prev/next arrows only —
  requirement 6 asks for "navigation arrows on the side," not dot pagination, so there's no second
  indicator UI to build or keep in sync. Wrap-around (`index = (index + 1) % slides.length`) is
  used because it's less code than clamping and disabling buttons at the ends, not because it's a
  desired extra.
- **Modal (lightbox)** — native HTML5 `<dialog>` + `showModal()`. This is the simplest option, not
  just a compliant one: the browser gives `Escape`-to-close and a backdrop for free, so there's no
  hand-rolled overlay logic to write and no custom open/close animation to author. One dialog
  instance, populated via event delegation on the grid (`[data-photo]` → look up `data.js`), so six
  tiles need one listener.
- **Video** — `<video controls preload="metadata" poster="assets/video/poster.jpg">` with a
  `<source type="video/mp4">` pointing at a public sample MP4, plus fallback text. Wrapped with
  `aspect-ratio: 16 / 9` so it holds its shape at every width.
- **Gallery hover** — a single `transform: scale(1.03)` plus `transition` on `.gallery__tile:hover`
  is the one CSS3 animation instance requirement 14 asks for. Nothing else on the page gets a
  dedicated entrance/fade animation — one clean instance is enough to satisfy the requirement, and
  adding more wouldn't earn additional credit.
- **Nav responsiveness** (≤~880px) — no JS, no hamburger: `_navbar.scss` switches the link list to
  `flex-wrap: wrap` and reduces `font-size` in the same media query already used for the compact
  scroll state, so the navbar stays usable at every required resolution without a second, separate
  mobile-nav component to build and test.

### Icons — CSS mask-image, applied through a single mixin (requirement 15 + 16)

Icons are delivered *through CSS*, not as markup: one `icon($svg)` mixin in `_mixins.scss` takes an
inline SVG string, base64/URL-encodes it, and sets it as a `mask-image` (with a `-webkit-mask-image`
fallback) on an empty element, with `background-color: currentColor` so the icon is a solid,
recolorable vector shape:

```scss
@mixin icon($svg, $size: 1em) {
  display: inline-block;
  width: $size;
  height: $size;
  background-color: currentColor;
  mask-image: url("data:image/svg+xml,#{$svg}");
  -webkit-mask-image: url("data:image/svg+xml,#{$svg}");
  mask-size: contain;
  mask-repeat: no-repeat;
}

.icon-arrow-left  { @include icon($svg-arrow-left); }
.icon-arrow-right { @include icon($svg-arrow-right); }
.icon-instagram   { @include icon($svg-instagram); }
```

The HTML side stays a plain empty element (`<span class="icon-arrow-left" aria-hidden="true"></span>`)
— no `<svg>` markup in the page, so the icon is unambiguously "applied through CSS" the way
requirement 15's own FontAwesome example works (a CSS-driven glyph, not inline vector markup). The
SVG source strings themselves live as SCSS variables in `_variables.scss` (`$svg-arrow-left`, etc.),
one string per icon, reused for both the carousel arrows and the footer's social icons — one
mechanism, not two.

---

## Phased roadmap

Each phase ends with a local commit using the message below, made only after that phase's
Verify step passes — commits should stay small and phase-scoped rather than batched at the end.
**Commit locally only; do not `git push`** — pushing is done by hand once each phase is reviewed.

### Phase 0 — Persist the plan
- Write this document to `PLAN.md` at the repo root.
- Commit: `Add project plan`

### Phase 1 — Semantic HTML skeleton + stripe layout
- Rewrite `src/index.html`: `<header>` navbar, six `<section>` stripes with `id`s matching nav
  hrefs, `<footer>`. Semantic HTML5 throughout (`<nav>`, `<main>`, `<section>`, `<figure>`/
  `<figcaption>`, `<dialog>`), no tables, no inline styles or scripts.
- Every stripe — header, all six sections, footer — gets the same `.stripe > .stripe__inner`
  wrapper markup from the start, even before Phase 2 styles it, so centering is never something to
  remember to add per-section later.
- Real, original copy about Nīzu Cafe — written in your own words from the real facts above, no
  lorem ipsum and nothing copied from the cafe's Instagram or reviews.
- **Placeholder strategy:** every `<img>` initially points at the existing `src/assets/image.jpg`
  (since `html-loader` resolves `<img src>` at build time and a missing file breaks the build).
  Phase 4 swaps in real filenames in one pass.
- Verify: `npm start` serves an unstyled but complete, correctly ordered document.
- Commit: `Add HTML structure for all sections`

### Phase 2 — SCSS
- Build `_variables.scss`, `_mixins.scss`, `_base.scss`.
- Define the palette, type scale, spacing scale, and the `$breakpoints` map keyed to the five
  required resolutions.
- Define `.stripe` / `.stripe__inner` once in `_base.scss` (see above) and confirm every stripe
  from Phase 1 picks it up unchanged — no section should need its own centering rule, only its own
  content styling. `#home` layers on a `stripe--center` modifier for vertical centering.
- Verify: consistent rhythm and centering at all five target resolutions; nothing overflows
  horizontally at 768px; open DevTools and confirm `.stripe__inner` (not a one-off rule) is what's
  centering content in *each* of the eight stripes, not just `#home` and `#visit`.
- Commit: `Add colors, fonts, and page layout styles`

### Phase 3 — Scroll mechanics + navbar
- `scroll.js` per the controller above: sticky navbar, compact-on-scroll resize, position
  indicator with the bottom-of-page override, smooth scrolling.
- `_navbar.scss` transitions for the compact state (height, padding, font-size) and the
  active-link indicator.
- Verify: scroll top to bottom watching the indicator track each stripe; confirm the last item
  highlights at the very bottom; confirm the navbar doesn't jump or double-fire near the threshold.
- Commit: `Make navbar sticky, resize on scroll, and highlight the current section`

### Phase 4 — Components + real photos
- `carousel.js` + carousel styles; `lightbox.js` + `_modal.scss`; `data.js` photo manifest.
- `#craft` video wiring; `#story` fixed background stripe.
- Swap placeholder `image.jpg` references for real filenames (see manifest below) with real `alt`
  text.
- Verify: each component works by hand — carousel prev/next arrows, modal open/close, video plays.
- Commit: `Add carousel, photo modal, video section, and real photos`

### Phase 5 — Animation, icons, responsive pass
- CSS3 animation: the gallery-tile hover transition — the plan's one deliberate instance of
  requirement 14, not a first pass to be added to later.
- `icon()` mixin plus SVG source variables for carousel arrows and footer social links.
- Test all five required resolutions plus the nav's own wrap breakpoint (~880px); confirm no
  horizontal body scroll and that the gallery grid reflows 3→1 with nothing in between.
- Verify: `npm run build` succeeds; `package.json` + `package-lock.json` go into this commit
  together if either changed.
- Commit: `Add hover animation, icons, and mobile-friendly layout`

A final commit after the requirement and constraint audits below is expected if either turns up
anything to fix:
- Commit: `Fix issues found in final review` — only if the audits require changes.

---

## Photos to supply (`src/assets/`)

```
src/assets/menu/01.jpg   # matcha reserve latte — the carousel's 3, the minimum requirement 6 asks for
src/assets/menu/02.jpg   # ebi katsu sando
src/assets/menu/03.jpg   # vanilla basque cheesecake (or another pastry)
src/assets/gallery/01.jpg … 06.jpg   # interior + drink shots — 6 fills two full rows of 3
src/assets/hero.jpg                  # storefront or interior wide shot — landscape, ~2400px wide
src/assets/story.jpg                 # interior detail, natural light through the windows — ~2400px wide
src/assets/video/poster.jpg          # still frame from the matcha-prep clip — 16:9
```

The counts above are deliberately the minimum that satisfies each requirement cleanly (3 slides,
one full 3-column grid), not a target to fill out further. Fewer still works if that's all that's
available — the grid scales to what exists.

You'll supply these yourself once you have them — nothing here is blocking. Until then, every
`<img>` stays pointed at the existing `src/assets/image.jpg` per the Phase 1 placeholder strategy,
so the build stays green throughout Phases 1–3. Phase 4 is where the real filenames above get
swapped in, one pass, once the photos exist. A one-line caption per photo (drink name, or what it
is) makes the modal meaningfully richer.

---

## Files created / modified

**Modified:** `src/index.html` (full rewrite), `src/index.js` (add module imports),
`src/css/main.scss` (becomes an `@use` manifest), `src/js/main.js` (becomes the bootstrap).

**Created:** `PLAN.md`; 5 JS modules under `src/js/`; 7 SCSS partials under `src/css/`.

**Untouched:** `webpack.config.js`, `.babelrc`, `postcss.config.js`,
`.github/workflows/static.yml` — all verified adequate as-is.

---

## Verification

**Per phase:** `npm start` → `http://localhost:8080/` after each phase; the phase gates above.

**Requirement audit (final):** walk all 16 README requirements against the mapping table and
confirm each is demonstrable in a browser — this also scripts the demo video. For requirement 8
specifically, check all eight stripes (header, six sections, footer), not just `#home` and
`#visit` — confirm each one's content sits inside `.stripe__inner` rather than a section-specific
centering rule.

**Constraint audit (final):**
```bash
grep -n 'style="' src/index.html          # must be empty (no inline styles)
grep -n '<script' src/index.html          # must be empty (webpack injects the bundle)
grep -rn '<table' src/index.html          # must be empty (no tables for layout)
```
Plus a check that `package.json`'s `dependencies` block stays absent — everything should remain a
`devDependency` of the build.

**Responsiveness:** DevTools device toolbar at 1920×1080, 1366×768, 1280×720, 1024×768, 768×1024;
confirm no horizontal overflow on `body`, that the gallery grid is 3 columns at 1024px and wider and
1 column at 768px, and that the nav wraps cleanly rather than overlapping at the narrowest width.

**Deploy:** `npm run build` locally, then push `main` and confirm the Actions run goes green and
the site serves at `https://<username>.github.io/mp1`.