import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import FourBlocks from '../components/FourBlocks.jsx';
import HowAIWorks from '../components/HowAIWorks.jsx';
import Credits from '../components/Credits.jsx';
import BooksGrid from '../components/BooksGrid.jsx';
import Testimonials from '../components/Testimonials.jsx';
import FAQ from '../components/FAQ.jsx';
import Footer from '../components/Footer.jsx';
import WhatsAppFab from '../components/WhatsAppFab.jsx';
import { useReveal } from '../lib/useReveal.js';

export default function Landing() {
  useReveal();
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FourBlocks />
        <HowAIWorks />
        <Credits />
        <BooksGrid />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
