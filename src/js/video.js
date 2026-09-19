// Plays only while on screen, so the clip isn't downloaded until it's needed.
export function init(video) {
    if (!('IntersectionObserver' in window)) {
        video.play().catch(() => {});
        return;
    }

    new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
    }).observe(video);
}
