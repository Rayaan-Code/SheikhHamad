import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Quote, Search, Hash } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface Benefit {
  id: string;
  text: string;
  author?: string;
  source?: string;
  tags?: string[];
  createdAt: any;
}

export default function Fawaaid() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'fawaaid'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBenefits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Benefit[]);
    });
    return unsubscribe;
  }, []);

  const filtered = benefits.filter(b => 
    b.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <h1 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple mb-4">Gems of Wisdom</h1>
          <h2 className="text-4xl md:text-5xl font-serif text-brown-dark italic">Al-Fawaaid</h2>
          <p className="mt-4 text-brown-dark/50 italic font-serif">Short beneficial points preserved from lessons and readings.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Search gems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/60 backdrop-blur-md border border-beige-dark rounded-full py-3 px-12 focus:ring-2 focus:ring-purple/20 outline-none text-sm transition-all shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple/30" size={18} />
        </div>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {filtered.length > 0 ? (
          filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="break-inside-avoid bg-white/40 hover:bg-white backdrop-blur-sm p-8 rounded-[2rem] border border-beige-dark hover:border-purple/20 transition-all shadow-sm hover:shadow-xl hover:shadow-purple/5 group"
            >
              <Quote size={24} className="text-purple/20 mb-6 group-hover:text-purple/40 transition-colors" />
              <p className="text-lg font-serif leading-relaxed text-brown-dark mb-6 whitespace-pre-wrap">
                {item.text}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {item.tags?.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-purple/40 bg-purple/5 px-2 py-1 rounded">
                    <Hash size={10} /> {tag}
                  </span>
                ))}
              </div>

              <div className="pt-6 border-t border-beige-dark/50 flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-brown-dark/30">
                  {item.source || 'Lesson Insight'}
                </span>
                <span className="text-[10px] font-medium text-purple/40 italic">
                  {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Recent'}
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-20">
            <Quote size={64} className="mb-4" />
            <p className="text-xl font-serif">The treasure chest is currently empty.</p>
          </div>
        )}
      </div>
    </div>
  );
}
