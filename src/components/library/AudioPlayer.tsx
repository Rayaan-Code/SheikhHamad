import { Play, Pause, SkipBack, SkipForward, Volume2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface AudioPlayerProps {
  currentTrack?: {
    title: string;
    speaker: string;
    url: string;
  };
  onClose?: () => void;
}

export default function AudioPlayer({ currentTrack, onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  if (!currentTrack) return null;

  const togglePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    setPlaybackRate(rates[(currentIndex + 1) % rates.length]);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-[60]"
      >
        <div className="h-24 w-full bg-brown-dark text-beige px-6 md:px-12 flex items-center justify-between border-t border-gold/20 shadow-2xl">
          <div className="flex items-center gap-6 overflow-hidden max-w-sm md:max-w-md">
             <button 
               onClick={() => setIsPlaying(!isPlaying)}
               className="w-12 h-12 shrink-0 bg-gold rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all text-white"
             >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} className="ml-1" fill="currentColor" />}
             </button>
             <div className="min-w-0">
                <div className="text-[10px] uppercase font-black tracking-[0.2em] opacity-50 mb-0.5">Now Playing</div>
                <div className="text-sm font-serif font-bold truncate text-white">{currentTrack.title}</div>
             </div>
          </div>
          
          <div className="hidden md:flex items-center gap-12">
             <div className="flex flex-col items-end">
                <div className="flex gap-4 items-center text-white">
                   <span className="text-[10px] font-mono opacity-40">12:44 / 58:20</span>
                   <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-1/4 h-full bg-gold" />
                   </div>
                </div>
             </div>
             
             <div className="flex items-center gap-4 border-l border-white/10 pl-12 h-10">
                <button 
                  onClick={togglePlaybackRate}
                  className="text-[10px] font-black uppercase tracking-tighter opacity-60 hover:opacity-100 hover:text-gold transition-all text-white"
                >
                  Speed: {playbackRate}x
                </button>
                <div 
                  onClick={onClose}
                  className="w-8 h-8 rounded-full border border-gold/40 flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-all cursor-pointer"
                >
                  <X size={14} />
                </div>
             </div>
          </div>

          <button 
            onClick={onClose}
            className="md:hidden p-2 text-white/40"
          >
            <X size={20} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
