import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Works from './pages/Works';
import About from './pages/About';
import { site } from './lib/content';

export default function App() {
  const location = useLocation();

  // Reset scroll to the top on every navigation. Without this the
  // scroll offset from the previous page carries over. We skip the
  // Works deep-link case (?open=…), where Works positions the scroll
  // itself so the opened piece sits behind the lightbox.
  useEffect(() => {
    const isDeepLink =
      location.pathname === '/works' && location.search.includes('open=');
    if (!isDeepLink) window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  // Keep the browser-tab title and meta description in sync with the
  // values the artist sets in the dashboard. (For social-embed previews,
  // these are also baked into the static HTML at build time — see
  // scripts/inject-meta.js — since link crawlers don't run JS.)
  useEffect(() => {
    if (site.siteTitle) document.title = site.siteTitle;
    if (site.metaDescription) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', site.metaDescription);
    }
  }, []);

  return (
    <>
      <Nav />
      <main>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/works" element={<Works />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
