import { useEffect, useRef, useState } from 'react';

/* Continuous auto-scrolling carousel behavior for a horizontal track.

   - Only activates when the content actually overflows its container.
   - Pauses on mouse hover, keyboard focus, and whenever the user scrolls
     the track themselves (touch swipe, trackpad, scrollbar). It resumes
     only once that scrolling has fully stopped, including the momentum
     glide after a swipe. Resuming earlier made the loop and the browser's
     own scrolling fight over the position every frame, which showed up
     as heavy jitter on phones.
   - Respects prefers-reduced-motion (stays static, user can still scroll).
   - Stops running while the track is off screen.
   - Expects the track to render its items twice (duplicated) so the
     scroll can loop seamlessly; it resets to the start once it passes
     the halfway point.

   Returns { ref, canScroll } — attach ref to the scroll container,
   and use canScroll to decide whether to duplicate the items. */

// How long the track must be left alone before auto-scroll resumes.
const RESUME_DELAY = 1500;

export function useAutoScroll(speed = 0.4) {
  const ref = useRef(null);
  const [canScroll, setCanScroll] = useState(false);

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

    // Track the position in a float we own. Reading el.scrollLeft back
    // each frame can round to an integer, so a sub-pixel `speed` (e.g.
    // 0.4) would never accumulate — we'd be stuck at 0. Instead we keep
    // our own accumulator and only write to the DOM.
    let pos = el.scrollLeft;
    let raf;
    let visible = true;
    let hovered = false;
    let focused = false;
    let touching = false;
    let resumeAt = 0;

    const holdOff = () => {
      resumeAt = performance.now() + RESUME_DELAY;
    };

    // Hover only counts for a real mouse. Touch screens fire emulated
    // mouse events on tap and never send the matching "leave", which
    // would leave the carousel paused until the next tap elsewhere.
    const onEnter = (e) => {
      if (e.pointerType === 'mouse') hovered = true;
    };
    const onLeave = (e) => {
      if (e.pointerType === 'mouse') hovered = false;
    };
    const onFocusIn = () => (focused = true);
    const onFocusOut = () => (focused = false);
    const onTouchStart = () => {
      touching = true;
      holdOff();
    };
    const onTouchEnd = () => {
      touching = false;
      holdOff();
    };
    // Any scroll we didn't cause ourselves (a swipe, its momentum, a
    // trackpad, the scrollbar) pushes the resume time back. Our own
    // writes land within a pixel or two of `pos`, so they're ignored.
    const onScroll = () => {
      if (Math.abs(el.scrollLeft - pos) > 2) holdOff();
    };

    const tick = (now) => {
      const idle = !hovered && !focused && !touching && now >= resumeAt;
      if (idle) {
        // The items are duplicated, so half the scrollWidth is one full set.
        const half = el.scrollWidth / 2;
        pos += speed;
        if (pos >= half) pos -= half;
        el.scrollLeft = pos;
      } else {
        // Follow the user's position so we resume from where they left it.
        pos = el.scrollLeft;
      }
      if (visible) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was) {
        pos = el.scrollLeft;
        raf = requestAnimationFrame(tick);
      }
    });

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('focusin', onFocusIn);
    el.addEventListener('focusout', onFocusOut);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });
    el.addEventListener('scroll', onScroll, { passive: true });
    io.observe(el);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('focusin', onFocusIn);
      el.removeEventListener('focusout', onFocusOut);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      el.removeEventListener('scroll', onScroll);
    };
  }, [speed]);

  return { ref, canScroll };
}
