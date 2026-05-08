import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Filter, BookOpen, Headphones, Video, FileText, Trash2, Settings, ShieldCheck, X, AlertCircle, Hash } from 'lucide-react';
import ContentCard from '../components/library/ContentCard';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { Content, ContentType, Speaker, Category } from '../types';

import { useAudio } from '../lib/AudioContext';

export default function Library() {
  const [contents, setContents] = useState<Content[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<ContentType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isManager, setIsManager] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { playTrack } = useAudio();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsManager(!!user);
    });

    const q = query(collection(db, 'contents'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Content[];
      setContents(data);
    });

    const qSpeakers = query(collection(db, 'speakers'));
    const unsubSpeakers = onSnapshot(qSpeakers, (snap) => {
      setSpeakers(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Speaker[]);
    });

    const qCats = query(collection(db, 'categories'));
    const unsubCats = onSnapshot(qCats, (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Category[]);
    });

    return () => {
      unsubscribeAuth();
      unsubscribe();
      unsubSpeakers();
      unsubCats();
    };
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setItemToDelete(id);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      if (!auth.currentUser) {
        throw new Error('You must be signed in with Google to delete items. Please visit the Admin page.');
      }
      await deleteDoc(doc(db, 'contents', itemToDelete));
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      setMessage(`Delete failed: ${err.message}`);
      setItemToDelete(null);
    }
  };

  const getSpeakerName = (id: string) => speakers.find(s => s.id === id)?.name || 'Contributor';
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'General';

  const filteredContents = contents
    .filter(item => filter === 'ALL' || item.type === filter)
    .filter(item => selectedCategory === 'ALL' || item.categoryId === selectedCategory)
    .filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const types: { label: string; value: ContentType | 'ALL'; icon: any }[] = [
    { label: 'All', value: 'ALL', icon: Filter },
    { label: 'Articles', value: 'ARTICLE', icon: FileText },
    { label: 'Audio', value: 'AUDIO', icon: Headphones },
    { label: 'Video', value: 'VIDEO', icon: Video },
    { label: 'PDFs', value: 'PDF', icon: BookOpen },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center justify-between"
        >
          <div className="flex items-center gap-4 text-rose-600">
            <AlertCircle size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-rose-400 hover:text-rose-600">
             <X size={18} />
          </button>
        </motion.div>
      )}
      {isManager && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3 text-emerald-700">
            <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Manager Mode Active</p>
              <p className="text-[9px] opacity-60">You can now delete entries directly from the archive grid.</p>
            </div>
          </div>
          <Link 
            to="/admin" 
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all"
          >
            <Settings size={14} />
            Dashboard
          </Link>
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-serif mb-2 text-purple">Archives</h1>
          <p className="text-brown-dark/50 italic font-serif">A curated collection of lessons, books, and articles.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input 
              type="text" 
              placeholder="Search archives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/60 backdrop-blur-md border border-beige-dark rounded-xl py-3 px-12 focus:ring-2 focus:ring-purple/20 outline-none text-sm transition-all shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple/30" size={18} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none">
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => setFilter(t.value)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              filter === t.value 
                ? 'bg-purple text-white shadow-lg shadow-purple/20' 
                : 'bg-white/60 text-purple/60 hover:bg-white border border-beige-dark/50'
            }`}
          >
            <t.icon size={16} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-12 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => {
            setSelectedCategory('ALL');
            setSearchParams({});
          }}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
            selectedCategory === 'ALL' 
              ? 'bg-gold text-white shadow-md shadow-gold/20' 
              : 'bg-white/40 text-brown-dark/40 hover:bg-white border border-beige-dark'
          }`}
        >
          <Filter size={14} />
          All Topics
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              setSearchParams({ category: cat.id });
            }}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              selectedCategory === cat.id 
                ? 'bg-gold text-white shadow-md shadow-gold/20' 
                : 'bg-white/40 text-brown-dark/40 hover:bg-white border border-beige-dark'
            }`}
          >
            <Hash size={14} />
            {cat.name}
          </button>
        ))}
      </div>

      {filteredContents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/library/${item.slug}`)}
              className="cursor-pointer"
            >
              <ContentCard 
                data={item} 
                speakerName={getSpeakerName(item.speakerId)}
                categoryName={getCategoryName(item.categoryId)}
                isManager={isManager}
                onDelete={handleDelete}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-beige-dark/50">
          <div className="w-16 h-16 bg-beige rounded-full flex items-center justify-center mx-auto mb-4 text-brown-dark/20">
            <Search size={32} />
          </div>
          <h3 className="text-lg font-serif mb-1">No resources found</h3>
          <p className="text-sm text-brown-dark/40">Try adjusting your filters or search keywords.</p>
        </div>
      )}
      
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-purple/10 backdrop-blur-sm">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="max-w-md w-full bg-white p-10 rounded-[3rem] border border-beige-dark shadow-2xl"
           >
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6 mx-auto">
                <Trash2 size={24} />
              </div>
              <h3 className="text-2xl font-serif text-brown-dark text-center mb-4">Confirm Deletion</h3>
              <p className="text-sm text-brown-dark/50 text-center leading-relaxed mb-8">
                Are you absolute certain you wish to remove this resource from the digital archive?
              </p>
              <div className="flex gap-4">
                 <button 
                   onClick={() => setItemToDelete(null)}
                   className="flex-1 py-4 px-6 border border-beige-dark rounded-2xl text-[10px] font-black uppercase tracking-widest text-brown-dark/30 hover:bg-beige-subtle transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                    onClick={confirmDelete}
                    className="flex-1 py-4 px-6 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all"
                 >
                   Delete Now
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}
