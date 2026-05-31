import { Routes, Route } from 'react-router-dom';

import './App.css';

import WebsiteHeader from './components/WebsiteHeader.js';
import Homepage from './pages/HomePage.js';
import AboutUs from './pages/AboutUs';
import Programs from './pages/Programs';
import Resources from './pages/Resources';
import Blog from './pages/Blog';
import Footer from './components/Footer'
import PrivacyPolicy from './pages/PrivacyPolicy'
import ScrollToTop from './components/ScrollToTop'

export default function App() {

  return (
    <>
      <div>
        <WebsiteHeader />
        <ScrollToTop /> 
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/blogs" element={<Blog />} />
          <Route path="/blogs/:topicSlug" element={<Blog />} />
          <Route path="/blogs/:topicSlug/:postSlug" element={<Blog />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
        <Footer />
      </div>
    </>
  );
}
