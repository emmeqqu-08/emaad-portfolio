import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { site, featuredWorks } from '../lib/content';
import { pageMotion } from '../lib/motion';
import './Home.css';

export default function Home() {
  const featured = featuredWorks;
  const hasPortrait = Boolean(site.heroPortrait);

  return (
    <motion.div {...pageMotion} className="home">
      {/* ---------- HERO ---------- */}
      <section className={'hero' + (hasPortrait ? ' hero--portrait' : '')}>
        <div className="hero__bg" aria-hidden>
          <span className="hero__ghost">{site.artistName}</span>
        </div>

        <div className="hero__inner shell">
          <div className="hero__text">
            <p className="hero__eyebrow">
              <span className="hero__dot" /> Portfolio · Archive
            </p>

            <h1 className="hero__title">
              {site.artistName.split('').map((ch, i) => (
                <span
                  key={i}
                  className="hero__char"
                  style={{ animationDelay: `${0.15 + i * 0.06}s` }}
                >
                  {ch}
                </span>
              ))}
            </h1>

            <p className="hero__statement">{site.heroStatement}</p>

            <div className="hero__actions">
              <Link to="/works" className="btn btn--gold">
                View the Works
                <span className="btn__arrow" aria-hidden>→</span>
              </Link>
              <Link to="/about" className="btn btn--ghost">
                About the Artist
              </Link>
            </div>
          </div>

          {hasPortrait && (
            <div className="hero__portrait">
              <img src={site.heroPortrait} alt={`${site.artistName}, artist`} />
              <span className="hero__portrait-frame" aria-hidden />
            </div>
          )}
        </div>

        <span className="hero__menacing menacing" aria-hidden>
          ゴゴゴゴ
        </span>
      </section>

      {/* ---------- SELECTED WORKS TEASER ---------- */}
      <section className="teaser shell">
        <div className="teaser__head">
          <h2 className="teaser__title">
            <span className="teaser__index">01</span> Selected
          </h2>
          <Link to="/works" className="teaser__all">
            All works <span aria-hidden>↗</span>
          </Link>
        </div>

        <div className="teaser__track">
          {featured.map((w, i) => (
            <Link
              key={w.slug}
              to={`/works?open=${encodeURIComponent(w.slug)}`}
              className={`teaser__card teaser__card--${i % 2}`}
            >
              <div className="teaser__frame">
                <img src={w.image} alt={w.title} loading="lazy" />
                <div className="teaser__overlay">
                  <span className="teaser__cat">
                    {w.categories[0] ?? 'Work'}
                  </span>
                  <span className="teaser__view">View ↗</span>
                </div>
              </div>
              <div className="teaser__caption">
                <span className="teaser__name">{w.title}</span>
                <span className="teaser__year">{w.year}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
