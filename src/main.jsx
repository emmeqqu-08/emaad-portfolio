import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// Fonts are self-hosted (bundled from @fontsource) instead of loaded from
// Google Fonts, so visitors' browsers never contact a third party.
// All three are licensed under the SIL Open Font License.
import '@fontsource/anton/400.css';
import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/fraunces/opsz-italic.css';
import '@fontsource/zen-kaku-gothic-new/400.css';
import '@fontsource/zen-kaku-gothic-new/500.css';
import '@fontsource/zen-kaku-gothic-new/700.css';
import './index.css';
import App from './App.jsx';

// BASE_URL is "/" in dev and "/emaad-portfolio/" in the Pages build.
// React Router wants the basename without a trailing slash.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

// /works and /about are also built as real folders (works/index.html) so
// they load with a 200 status. GitHub Pages then adds a trailing slash
// ("/works/"); drop it so the app's routes and links see "/works".
{
  const { pathname, search, hash } = window.location;
  if (pathname.length > basename.length + 1 && pathname.endsWith('/')) {
    window.history.replaceState(null, '', pathname.replace(/\/+$/, '') + search + hash);
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
