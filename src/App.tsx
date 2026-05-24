import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import AudioPlayer from './components/library/AudioPlayer';
import { AudioProvider, useAudio } from './lib/AudioContext';

const Home = lazy(() => import('./pages/Home'));
const Library = lazy(() => import('./pages/Library'));
const Courses = lazy(() => import('./pages/Courses'));
const Biography = lazy(() => import('./pages/Biography'));
const ContentDetail = lazy(() => import('./pages/ContentDetail'));
const Fawaaid = lazy(() => import('./pages/Fawaaid'));
const Admin = lazy(() => import('./pages/Admin'));

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

        <Suspense fallback={<div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-purple/30 border-t-purple rounded-full animate-spin" /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/about" element={<Biography />} />
            <Route path="/library/:slug" element={<ContentDetail />} />
            <Route path="/fawaaid" element={<Fawaaid />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
        
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
