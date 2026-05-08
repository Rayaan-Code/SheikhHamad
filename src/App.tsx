import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import AudioPlayer from './components/library/AudioPlayer';
import Home from './pages/Home';
import Library from './pages/Library';
import Courses from './pages/Courses';
import Biography from './pages/Biography';
import ContentDetail from './pages/ContentDetail';
import Fawaaid from './pages/Fawaaid';
import Admin from './pages/Admin';
import { AudioProvider, useAudio } from './lib/AudioContext';

function AppContent() {
  const { activeTrack, closePlayer } = useAudio();

  return (
    <div className="min-h-screen selection:bg-purple/30">
      <Navbar />
      
      <main className="relative">
        {/* Decorative Watermark */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center -z-10 opacity-[0.04]">
          <img 
            src="/calligraphy.png" 
            className="w-[60vw] max-w-3xl rotate-[-12deg] select-none" 
            alt="Decorative" 
            referrerPolicy="no-referrer"
          />
        </div>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/about" element={<Biography />} />
          <Route path="/library/:slug" element={<ContentDetail />} />
          <Route path="/fawaaid" element={<Fawaaid />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        
        <AudioPlayer 
          currentTrack={activeTrack || undefined} 
          onClose={closePlayer} 
        />
        
        <footer className="relative py-24 border-t border-beige-dark/30 text-center bg-beige z-10">
          <div className="flex justify-center mb-10 opacity-60 px-6">
            <img src="/calligraphy1123.png" className="h-16 md:h-32 w-auto object-contain" alt="Logo" referrerPolicy="no-referrer" />
          </div>
          <p className="text-[6px] text-purple/40 tracking-[0.3em] uppercase font-bold">
            &copy; 2024 &bull; Shaykh Hamad bin Aasif Ash-Shafi'i al-Athari
          </p>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AudioProvider>
        <AppContent />
      </AudioProvider>
    </Router>
  );
}
