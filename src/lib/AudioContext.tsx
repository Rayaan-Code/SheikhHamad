import React, { createContext, useContext, useState } from 'react';

interface AudioTrack {
  title: string;
  speaker: string;
  url: string;
}

interface AudioContextType {
  activeTrack: AudioTrack | null;
  playTrack: (track: AudioTrack) => void;
  closePlayer: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [activeTrack, setActiveTrack] = useState<AudioTrack | null>(null);

  const playTrack = (track: AudioTrack) => setActiveTrack(track);
  const closePlayer = () => setActiveTrack(null);

  return (
    <AudioContext.Provider value={{ activeTrack, playTrack, closePlayer }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
