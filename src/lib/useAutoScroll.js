import { useEffect, useRef, useState } from 'react';

/* Continuous auto-scrolling carousel behavior for a horizontal track.

   - Only activates when the content actually overflows its container.
   - Pauses on hover, focus-within, and while the user is touching/
     dragging, then resumes.
   - Respects prefers-reduced-motion (stays static, user can still scroll).
   - Expects the track to render its items twice (duplicated) so the
     scroll can loop seamlessly; it resets to the start once it passes
     the halfway point.

   Returns { ref, canScroll } — attach ref to the scroll container,
   and use canScroll to decide whether to duplicate the items. */
export function useAutoScroll(speed = 0.4) {
  const ref = useRef(null);
  const [canScroll, setCanScroll] = useState(false);
  const paused = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Overflow check (accounts for the duplicated content: half is enough).
    const overflowing = el.scrollWidth > el.clientWidth + 8;
    setCanScroll(overflowing);
    if (reduce || !overflowing) return;

    const pause = () => (paused.current = true);
    const resume = () => (paused.current = false);

    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('focusin', pause);
    el.addEventListener('focusout', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resume, { passive: true });

    // Track the position in a float we own. Reading el.scrollLeft back
    // each frame can round to an integer, so a sub-pixel `speed` (e.g.
    // 0.4) would never accumulate — we'd be stuck at 0. Instead we keep
    // our own accumulator and only write to the DOM.
    let pos = el.scrollLeft;
    let raf;
    const tick = () => {
      if (!paused.current) {
        // The items are duplicated, so half the scrollWidth is one full set.
        const half = el.scrollWidth / 2;
        pos += speed;
        if (pos >= half) pos -= half;
        el.scrollLeft = pos;
      } else {
        // Stay in sync if the user scrolled manually while paused.
        pos = el.scrollLeft;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('focusin', pause);
      el.removeEventListener('focusout', resume);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', resume);
    };
  }, [speed]);

  return { ref, canScroll };
}
