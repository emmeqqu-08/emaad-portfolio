/* Brand icons for social links, matched by platform name.
   All are simple monochrome SVGs (currentColor) so they inherit
   the link color. Unknown platforms fall back to a generic globe,
   so any platform the artist types still gets an icon. */

const paths = {
  instagram: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  linkedin: (
    <>
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <line x1="7" y1="10" x2="7" y2="17" />
      <line x1="7" y1="7" x2="7" y2="7" />
      <path d="M11 17v-4a2.2 2.2 0 0 1 4.4 0v4" />
      <line x1="11" y1="10" x2="11" y2="17" />
    </>
  ),
  deviantart: (
    <path d="M18 3v4l-3.2 6H18v5H9.5L7 21H6v-4l3.2-6H6V6h8.5L17 3z" />
  ),
  artstation: (
    <>
      <path d="M4 17.5 12 4l4.5 7.8" />
      <path d="M6 17.5h12" />
      <path d="M15 14l2 3.5" />
    </>
  ),
  behance: (
    <>
      <path d="M3 7h4.5a2.5 2.5 0 0 1 0 5H3zM3 12h5a2.5 2.5 0 0 1 0 5H3z" />
      <line x1="15" y1="7.5" x2="20" y2="7.5" />
      <path d="M14.5 13.5a3 3 0 1 0 5.6 1.5" />
      <path d="M14.5 13.5a3 3 0 0 1 6 0h-6" />
    </>
  ),
  twitter: (
    <path d="M4 4l6.5 8.5L4.5 20H7l4.7-5.6L15.5 20H20l-6.8-9L19.5 4H17l-4.3 5.2L9 4z" />
  ),
  x: (
    <path d="M4 4l6.5 8.5L4.5 20H7l4.7-5.6L15.5 20H20l-6.8-9L19.5 4H17l-4.3 5.2L9 4z" />
  ),
  facebook: (
    <path d="M14 8.5V7a1.5 1.5 0 0 1 1.5-1.5H17V2.5h-2.5A4 4 0 0 0 10.5 6.5v2H8V12h2.5v9.5H14V12h2.5L17 8.5z" />
  ),
  youtube: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="4" />
      <path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" />
    </>
  ),
  tiktok: (
    <path d="M14 3c.4 2.6 2 4.2 4.5 4.5v3c-1.7 0-3.2-.5-4.5-1.4V15a5.5 5.5 0 1 1-5.5-5.5c.3 0 .7 0 1 .1v3.1a2.5 2.5 0 1 0 1.5 2.3V3z" />
  ),
  pinterest: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9.5 20c-.3-1.3 0-3 .3-4.3l1-4.2a2.4 2.4 0 1 1 2.4 1c-.7 2.4-1.4 4.8 1 4.8 2.3 0 3.6-2.6 3.6-5 0-3-2.2-5-5.2-5A5.5 5.5 0 0 0 7 15" />
    </>
  ),
  dribbble: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M4 9c6 0 11 1 15 5" />
      <path d="M8 3.5C13 8 15 14 15.5 20.5" />
      <path d="M21 13c-6-1.5-11 0-14 4" />
    </>
  ),
};

/* Aliases so common name variants resolve. */
const aliases = {
  ig: 'instagram',
  insta: 'instagram',
  'x (twitter)': 'x',
  twitterx: 'x',
  yt: 'youtube',
  fb: 'facebook',
  da: 'deviantart',
};

const genericGlobe = (
  <>
    <circle cx="12" cy="12" r="9.5" />
    <line x1="2.5" y1="12" x2="21.5" y2="12" />
    <path d="M12 2.5a15 15 0 0 1 0 19 15 15 0 0 1 0-19z" />
  </>
);

/* Icon keys a user can choose in the dashboard mirror the keys in
   `paths` above, plus "website" (the generic globe). The dashboard's
   dropdown options live in public/admin/config.yml. */

export default function SocialIcon({ platform, icon, size = 18 }) {
  // An explicit icon choice (from the dashboard) wins; otherwise we
  // guess from the platform name.
  const source = (icon || platform || '').toLowerCase();
  const key = source.replace(/[^a-z()\s]/g, '').trim();
  const resolved = aliases[key] || key;
  const glyph = resolved === 'website' ? genericGlobe : paths[resolved] || genericGlobe;

  return (
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
      {glyph}
    </svg>
  );
}
