import { motion } from 'motion/react';
import { site } from '../lib/content';
import { pageMotion } from '../lib/motion';
import SocialLinks from '../components/SocialLinks';
import './About.css';

export default function About() {
  const paragraphs = site.aboutBody.split('\n').filter(Boolean);

  return (
    <motion.div {...pageMotion} className="about shell">
      <div className="about__grid">
        <div className="about__aside">
          <span className="about__index menacing" aria-hidden>03</span>
          <h1 className="about__title">
            About
            <br />
            Me
          </h1>

          {site.aboutImage && (
            <figure className="about__figure">
              <img src={site.aboutImage} alt={`${site.artistName} in the studio`} />
              <span className="about__figure-frame" aria-hidden />
            </figure>
          )}

          <SocialLinks variant="about" />
        </div>

        <div className="about__body">
          {paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? 'about__lead' : ''}>
              {p}
            </p>
          ))}
          <span className="menacing about__glyph" aria-hidden>ゴゴゴゴゴ</span>
        </div>
      </div>
    </motion.div>
  );
}
