import { site } from '../lib/content';
import SocialLinks from './SocialLinks';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="speedlines" />
      <div className="footer__inner shell">
        <div className="footer__brand">
          <span className="footer__name">{site.artistName}</span>
          <span className="footer__tag">{site.tagline}</span>
        </div>

        <SocialLinks variant="footer" />

        <p className="footer__meta">
          <span className="menacing" aria-hidden>ゴゴゴ</span>
          <span>&copy; {site.artistName}. All works property of the artist.</span>
        </p>
      </div>
    </footer>
  );
}
