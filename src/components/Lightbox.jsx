import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import './Lightbox.css';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function Lightbox({ work, onClose, onPrev, onNext }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const isOpen = Boolean(work);

  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
      // Keep keyboard focus inside the dialog while it is open.
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const inside = dialogRef.current.contains(document.activeElement);
        if (e.shiftKey && (document.activeElement === first || !inside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose, onPrev, onNext]
  );

  // On open, move focus into the dialog; on close, return it to whatever
  // opened it (usually the artwork tile), so keyboard users don't lose
  // their place.
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement;
    closeRef.current?.focus();
    return () => {
      if (opener instanceof HTMLElement && opener !== document.body && document.contains(opener)) {
        opener.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!work) return;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [work, handleKey]);

  // Rendered through a portal to document.body so it is never nested
  // inside a page-transition container. A CSS transform on an ancestor
  // turns position:fixed into position:absolute, which was causing the
  // lightbox to anchor to the (animating, off-screen) page instead of
  // the viewport — the "loads off screen then centers" jank.
  return createPortal(
    <AnimatePresence>
      {work && (
        <motion.div
          ref={dialogRef}
          className="lb"
          role="dialog"
          aria-modal="true"
          aria-label={work.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <button ref={closeRef} className="lb__close" onClick={onClose} aria-label="Close">
            ✕
          </button>

          <button
            className="lb__nav lb__nav--prev"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous work"
          >
            ←
          </button>
          <button
            className="lb__nav lb__nav--next"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next work"
          >
            →
          </button>

          <motion.div
            className="lb__panel"
            initial={{ scale: 0.94, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            key={work.slug}
          >
            <div className="lb__figure">
              <img
                src={work.img.src}
                srcSet={work.img.srcSet}
                sizes="(max-width: 900px) 100vw, 60vw"
                alt={work.title}
              />
            </div>

            <aside className="lb__meta">
              <div className="lb__meta-top">
                {work.available && (
                  <span className="lb__badge">● Available</span>
                )}
                <h2 className="lb__title">{work.title}</h2>
                {work.year && <span className="lb__year">{work.year}</span>}
              </div>

              <p className="lb__desc">{work.description}</p>

              <dl className="lb__facts">
                {work.medium && (
                  <div className="lb__fact">
                    <dt>Medium</dt>
                    <dd>{work.medium}</dd>
                  </div>
                )}
                {work.dimensions && (
                  <div className="lb__fact">
                    <dt>Dimensions</dt>
                    <dd>{work.dimensions}</dd>
                  </div>
                )}
                {work.uploadDate && (
                  <div className="lb__fact">
                    <dt>Added</dt>
                    <dd>{formatDate(work.uploadDate)}</dd>
                  </div>
                )}
              </dl>

              {work.categories.length > 0 && (
                <div className="lb__tags">
                  {work.categories.map((c) => (
                    <span key={c} className="lb__tag">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </aside>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
