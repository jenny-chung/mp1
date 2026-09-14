/**
 * Lightbox content for the gallery, keyed by each tile's data-photo.
 *
 * The tiles in index.html carry the photo and a short caption; the lightbox
 * shows that same photo larger along with the longer note below, which is the
 * "additional content" requirement 11 asks the modal to show. The image and
 * its alt text are read from the tile itself, so a photo is swapped in one
 * place — index.html — and never here.
 */

export const photos = {
    g01: {
        title: 'Matcha Latte',
        meta: 'Whisked to order, latte art',
        description:
            'Matcha whisked fresh for each cup and topped with steamed milk, then ' +
            'finished at the bar with a little latte art on the green foam.',
    },
    g02: {
        title: 'Matcha Roll Cake',
        meta: 'Matcha sponge, red bean, chantilly',
        description:
            'A soft matcha sponge rolled around matcha cream and set in a clear collar, ' +
            'topped with a ball of red bean, a dollop of chantilly and a swirl of matcha cream.',
    },
    g03: {
        title: 'Miso Caramel Latte',
        meta: 'Aka miso caramel, espresso, kuromitsu drizzle',
        description:
            'Espresso and steamed milk sweetened with a caramel made from aka miso, then ' +
            'finished with a kuromitsu drizzle feathered into a flower across the foam.',
    },
    g04: {
        title: 'Tonkatsu Sando',
        meta: 'Pork loin, 72hr cured, fresh panko, yuzu slaw, shokupan',
        description:
            'Pork loin cured for 72 hours, fried in fresh panko and layered with yuzu ' +
            'slaw on soft shokupan. Add Poteto for a side of nori fries with curry ' +
            'Kewpie.',
    },
    g05: {
        title: 'Hojicha Latte',
        meta: 'Shizuoka, first harvest, medium roast',
        description:
            'First-harvest Yabukita, a single cultivar from Shizuoka, roasted to a medium ' +
            'hojicha and poured with steamed milk, finished with creative latte art.',
    },
    g06: {
        title: 'Basque Cheesecake',
        meta: 'Burnt top, vanilla cream, caramel',
        description:
            'Baked hot so the top caramelises dark while the centre stays creamy, then ' +
            'served with a quenelle of vanilla bean cream and a drizzle of caramel.',
    },
};
