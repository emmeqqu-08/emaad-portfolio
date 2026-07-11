import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Nav from './components/Nav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Works from './pages/Works';
import About from './pages/About';

export default function App() {
  const location = useLocation();

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
