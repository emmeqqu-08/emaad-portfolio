import { NavLink } from 'react-router-dom';
import { site } from '../lib/content';
import './Nav.css';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/works', label: 'Works' },
  { to: '/about', label: 'About' },
];

export default function Nav() {
  return (
    <header className="nav">
      <div className="nav__inner shell">
        <NavLink to="/" className="nav__brand" end>
          <span className="nav__mark">{site.artistName}</span>
          <span className="nav__glyph menacing" aria-hidden>ゴ</span>
        </NavLink>

        <nav className="nav__links" aria-label="Primary">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                'nav__link' + (isActive ? ' is-active' : '')
              }
            >
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="speedlines nav__rule" />
    </header>
  );
}
