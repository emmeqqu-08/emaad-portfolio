import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { works as allWorks, allCategories } from '../lib/content';
import { pageMotion } from '../lib/motion';
import Lightbox from '../components/Lightbox';
import './Works.css';

const SORTS = [
  { id: 'newest', label: 'Newest added' },
  { id: 'oldest', label: 'Oldest added' },
  { id: 'year-desc', label: 'Year ↓' },
  { id: 'year-asc', label: 'Year ↑' },
  { id: 'title', label: 'Title A–Z' },
];

export default function Works() {
  const [activeCat, setActiveCat] = useState('All');
  const [sort, setSort] = useState('newest');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const filtered = useMemo(() => {
    let list = allWorks.filter(
      (w) => activeCat === 'All' || w.categories.includes(activeCat)
    );

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return new Date(a.uploadDate) - new Date(b.uploadDate);
        case 'year-desc':
          return (Number(b.year) || 0) - (Number(a.year) || 0);
        case 'year-asc':
          return (Number(a.year) || 0) - (Number(b.year) || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.uploadDate) - new Date(a.uploadDate);
      }
    });
    return list;
  }, [activeCat, sort]);

  /* Deep link: /works?open=<slug> opens that piece in the lightbox.
     Runs when arriving from the home "Selected" strip. We reset the
     category to All so the target is guaranteed to be in the list. */
  useEffect(() => {
    const slug = searchParams.get('open');
    if (!slug) return;
    const exists = allWorks.some((w) => w.slug === slug);
    if (!exists) return;
    if (activeCat !== 'All') setActiveCat('All');
    const idx = filtered.findIndex((w) => w.slug === slug);
    if (idx !== -1) {
      setLightboxIndex(idx);
      // Position the grid behind the lightbox so the opened piece is in
      // view when the lightbox is closed. Done without smooth-scroll so
      // there's no visible movement under the overlay.
      requestAnimationFrame(() => {
        const tile = document.querySelector(`.tile[data-slug="${slug}"]`);
        if (tile) tile.scrollIntoView({ block: 'center', behavior: 'auto' });
      });
      // clear the param so refresh/back doesn't force-reopen
      searchParams.delete('open');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, filtered]);

  const current = lightboxIndex != null ? filtered[lightboxIndex] : null;

  const step = (dir) =>
    setLightboxIndex((i) => {
      if (i == null) return i;
      const n = filtered.length;
      return (i + dir + n) % n;
    });

  const cats = ['All', ...allCategories];

  return (
    <motion.div {...pageMotion} className="works">
      <header className="works__head shell">
        <div className="works__titleblock">
          <span className="works__index menacing" aria-hidden>02</span>
          <h1 className="works__title">Works</h1>
          <p className="works__count">
            {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
          </p>
        </div>

        <div className="works__controls">
          {/* Filter chips */}
          <div className="works__filters" role="tablist" aria-label="Filter by category">
            {cats.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={activeCat === c}
                className={
                  'chip' + (activeCat === c ? ' chip--active' : '')
                }
                onClick={() => setActiveCat(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Sort */}
          <label className="works__sort">
            <span className="works__sort-label">Sort</span>
            <span className="works__select">
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <svg
                className="works__select-chevron"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2.5 4.5 6 8l3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </label>
        </div>
      </header>

      <div className="speedlines works__rule shell" />

      {/* Masonry grid */}
      <section className="shell">
        {filtered.length === 0 ? (
          <p className="works__empty">No works in this category yet.</p>
        ) : (
          <div className="masonry">
            {filtered.map((w, i) => (
              <button
                key={w.slug}
                data-slug={w.slug}
                className="tile"
                style={{ '--d': `${(i % 8) * 0.05}s` }}
                onClick={() => setLightboxIndex(i)}
              >
                <div className="tile__img">
                  <img src={w.image} alt={w.title} loading="lazy" />
                </div>
                <div className="tile__info">
                  <span className="tile__name">{w.title}</span>
                  <span className="tile__cats">
                    {w.categories.slice(0, 2).join(' · ')}
                  </span>
                </div>
                <span className="tile__view" aria-hidden>View ↗</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <Lightbox
        work={current}
        onClose={() => setLightboxIndex(null)}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
      />
    </motion.div>
  );
}
