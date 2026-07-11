import { site, socials } from '../lib/content';
import SocialIcon from './SocialIcon';
import './SocialLinks.css';

/* Renders the artist's contact + social links.
   The list is fully data-driven from site.json (socials[]), so
   adding LinkedIn, DeviantArt, ArtStation, etc. is just another
   entry in the dashboard — no code changes needed. Each link gets
   a brand icon (see SocialIcon), with a generic fallback.

   `variant` tweaks styling: "footer" (default) or "about". */

const EmailIcon = ({ size = 18 }) => (
  <svg
    className="social-icon"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
    <path d="M3 6l9 6.5L21 6" />
  </svg>
);

export default function SocialLinks({ variant = 'footer' }) {
  return (
    <div className={`socials socials--${variant}`}>
      {site.email && (
        <a href={`mailto:${site.email}`} className="socials__link">
          <EmailIcon />
          <span>Email</span>
        </a>
      )}
      {socials.map((s) => (
        <a
          key={s.platform + s.url}
          href={s.url}
          target="_blank"
          rel="noreferrer"
          className="socials__link"
        >
          <SocialIcon platform={s.platform} icon={s.icon} />
          <span>{s.platform}</span>
        </a>
      ))}
    </div>
  );
}
