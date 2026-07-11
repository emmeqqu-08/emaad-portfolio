import { useEffect, useCallback } from 'react';
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
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    if (!work) return;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [work, handleKey]);

  return (
    <AnimatePresence>
      {work && (
        <motion.div
          className="lb"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <button className="lb__close" onClick={onClose} aria-label="Close">
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
              <img src={work.image} alt={work.title} />
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
    </AnimatePresence>
  );
}
