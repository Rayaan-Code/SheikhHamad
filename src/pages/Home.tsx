import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Headphones, FileText, ChevronRight, Filter, GraduationCap, Shield, Scale, Quote, Heart, Book } from 'lucide-react';
import ContentCard from '../components/library/ContentCard';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import type { Content, Speaker, Category, Course } from '../types';
import { Link } from 'react-router-dom';

import { useAudio } from '../lib/AudioContext';

export default function Home() {
  const [contents, setContents] = useState<Content[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const { playTrack } = useAudio();

  useEffect(() => {
    const q = query(collection(db, 'contents'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setContents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Content[]);
    });

    const qSpeakers = query(collection(db, 'speakers'));
    const unsubSpeakers = onSnapshot(qSpeakers, (snap) => {
      setSpeakers(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Speaker[]);
    });

    const qCats = query(collection(db, 'categories'));
    const unsubCats = onSnapshot(qCats, (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Category[]);
    });

    const qCr = query(collection(db, 'courses'), orderBy('createdAt', 'desc'), limit(5));
    const unsubCr = onSnapshot(qCr, (snap) => {
      setFeaturedCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Course[]);
    });

    return () => {
      unsubscribe();
      unsubSpeakers();
      unsubCats();
      unsubCr();
    };
  }, []);

  const getSpeakerName = (id: string) => speakers.find(s => s.id === id)?.name || 'Contributor';
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || 'General';

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col">
      <main className="flex-grow flex flex-col lg:flex-row relative z-10 overflow-hidden">
        {/* Left Side: Hero */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-12 flex items-center gap-4">
              <span className="h-px w-10 bg-purple"></span>
              <span className="text-[11px] uppercase tracking-[0.3em] font-extrabold text-purple italic">Recent Publications</span>
            </div>
            
            <h1 className="text-[50px] md:text-[70px] font-serif leading-[0.95] text-purple italic mb-16">
              Latest<br/>
              <span className="text-purple-light not-italic font-sans font-black tracking-tighter uppercase">Articles</span>
            </h1>
            
            <div className="space-y-8 max-w-xl">
              {contents.filter(c => c.type === 'ARTICLE').slice(0, 3).map((article, idx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                >
                  <Link to={`/library/${article.slug}`} className="group block">
                    <div className="flex items-center gap-6 p-4 -ml-4 rounded-3xl hover:bg-purple/5 transition-all">
                      <div className="w-16 h-16 bg-white border border-beige-dark rounded-2xl flex items-center justify-center text-purple shadow-sm group-hover:bg-purple group-hover:text-white transition-all shrink-0">
                        <FileText size={28} />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-purple/40 mb-1">Article Entry</div>
                        <h4 className="text-2xl font-serif font-bold text-brown-dark group-hover:text-purple transition-colors">{article.title}</h4>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              
              {contents.filter(c => c.type === 'ARTICLE').length === 0 && (
                <p className="text-lg italic text-purple/30 font-serif">Articles arriving soon in shaa Allah...</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-10 mt-16">
              <Link to="/library" className="bg-purple text-white px-10 py-5 rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-2xl hover:shadow-purple/30 transition-all active:scale-95">
                Access Library
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Sidebar with scrolling Recent Uploads */}
        <div className="w-full lg:w-5/12 bg-purple/5 backdrop-blur-md border-l border-beige-dark p-8 md:p-12 lg:p-16 flex flex-col">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-xs font-black uppercase tracking-[0.25em] text-purple/40">Recent lessons</h2>
            <div className="flex gap-2 mb-1">
              <div className="w-10 h-px bg-purple-light"></div>
              <div className="w-3 h-px bg-purple/20"></div>
            </div>
          </div>

          <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
            {contents.length > 0 ? (
              contents.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                >
                  <Link to={`/library/${item.slug}`}>
                    <div className="group bg-white/60 hover:bg-white p-5 rounded-3xl border border-beige-dark hover:border-purple/20 transition-all shadow-sm hover:shadow-xl hover:shadow-purple/5">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-purple/40">
                          {getCategoryName(item.categoryId)}
                        </span>
                        <div className="p-1 px-2 bg-purple/10 rounded text-[9px] font-bold text-purple/60">
                          {item.type}
                        </div>
                      </div>
                      <h4 className="text-lg font-serif font-bold text-brown-dark group-hover:text-purple transition-colors line-clamp-1">{item.title}</h4>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-10">
                <BookOpen size={48} className="mb-4" />
                <p className="italic font-serif">The archives are awaiting their first contribution.</p>
              </div>
            )}
          </div>

          <div className="mt-auto pt-12">
             <Link to="/library" className="block group">
               <div className="bg-white/40 p-6 rounded-3xl border border-beige-dark flex items-center justify-between group-hover:border-purple group-hover:bg-white transition-all">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold opacity-30 tracking-widest group-hover:text-purple group-hover:opacity-100 transition-all">Archived Works</span>
                    <span className="text-xl font-serif font-bold text-brown-dark">{contents.length} Entries</span>
                  </div>
                  <div className="w-12 h-12 bg-purple rounded-full flex items-center justify-center text-white shadow-xl shadow-purple/20 group-hover:scale-110 transition-transform">
                    <BookOpen size={20} />
                  </div>
               </div>
             </Link>
          </div>
        </div>
      </main>

      {/* Courses Section: Horizontal Carousel */}
      <section className="bg-beige py-32 border-t border-beige-dark overflow-hidden relative z-10">
        <div className="max-w-7xl mx-auto px-6 mb-16 flex justify-between items-end">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-purple mb-4">Educational Programs</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-brown-dark italic">Featured Courses</h3>
          </div>
          <Link to="/courses" className="text-[11px] font-bold uppercase tracking-widest text-purple/60 hover:text-purple transition-colors flex items-center gap-2">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="relative group">
          <motion.div 
            className="flex gap-8 px-6 cursor-grab active:cursor-grabbing overflow-x-auto pb-12 custom-scrollbar snap-x no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {featuredCourses.length > 0 ? (
              featuredCourses.map((course) => (
                <Link key={course.id} to={`/courses?course=${course.id}`} className="block snap-center">
                  <motion.div
                    className="min-w-[300px] md:min-w-[400px] h-[400px] md:h-[500px] bg-purple/5 border border-beige-dark rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden group/card"
                    whileHover={{ y: -10 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-purple/80 via-transparent to-transparent z-10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-purple/10 flex items-center justify-center">
                       {course.thumbnailUrl ? (
                         <img src={course.thumbnailUrl} alt={course.title} className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" />
                       ) : (
                         <GraduationCap size={60} className="text-purple/20 group-hover/card:scale-125 transition-transform duration-700" />
                       )}
                    </div>
                    
                    <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 z-20">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="w-8 h-px bg-white/50"></span>
                        <span className="text-[10px] uppercase font-bold text-white/70 tracking-widest">Featured Course</span>
                      </div>
                      <h4 className="text-2xl md:text-3xl font-serif font-bold text-purple mb-2 group-hover/card:text-white transition-colors">{course.title}</h4>
                      <p className="text-sm text-purple/60 group-hover/card:text-white/70 transition-colors line-clamp-2 mb-6">
                        {course.description || 'A comprehensive study into the traditional texts with thematic clarity.'}
                      </p>
                      <div className="inline-block bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover/card:opacity-100 transition-all duration-300 transform translate-y-4 group-hover/card:translate-y-0">
                        Explore Modules
                      </div>
                    </div>
    
                    <div className="absolute top-10 right-10 w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-purple border border-white/20 group-hover/card:bg-white group-hover/card:text-purple transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </motion.div>
                </Link>
              ))
            ) : (
                [1, 2, 3].map((i) => (
                  <div key={i} className="min-w-[300px] md:min-w-[400px] h-[400px] md:h-[500px] bg-purple/5 border border-beige-dark border-dashed rounded-[3rem] flex items-center justify-center">
                    <span className="text-[10px] uppercase font-bold text-purple/30 tracking-widest italic">New courses arriving soon...</span>
                  </div>
                ))
            )}
          </motion.div>
        </div>
      </section>

      <section id="topics" className="bg-white py-32 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gold mb-4">Classifications</h2>
            <h3 className="text-4xl md:text-5xl font-serif text-brown-dark italic">Thematic Navigation</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.length > 0 ? (
              categories.map((cat) => {
                const Icon = cat.name.toLowerCase().includes('aqeedah') ? Shield :
                             cat.name.toLowerCase().includes('fiqh') ? Scale :
                             cat.name.toLowerCase().includes('hadith') ? Quote :
                             cat.name.toLowerCase().includes('adab') ? Heart :
                             cat.name.toLowerCase().includes('qur') ? Book : BookOpen;
                return (
                  <Link key={cat.id} to={`/library?category=${cat.id}`}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-beige-subtle p-10 h-full rounded-[2.5rem] border border-transparent hover:border-gold/20 hover:bg-white transition-all group cursor-pointer text-center"
                    >
                      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-brown-dark group-hover:bg-gold group-hover:text-white shadow-sm transition-all mb-8 mx-auto">
                        <Icon size={28} />
                      </div>
                      <h4 className="text-2xl font-serif font-bold mb-3">{cat.name}</h4>
                      <div className="h-px w-6 bg-gold/30 mx-auto mb-4"></div>
                      <p className="text-[10px] uppercase font-black tracking-widest text-brown-dark/30">Archives</p>
                    </motion.div>
                  </Link>
                );
              })
            ) : (
              [
                { name: 'Aqeedah', icon: Shield }, 
                { name: 'Fiqh', icon: Scale }, 
                { name: 'Hadith', icon: Quote }, 
                { name: 'Adab', icon: Heart }, 
                { name: 'Qur\'aan', icon: Book }
              ].map((item) => (
                <div key={item.name} className="bg-beige-subtle p-10 rounded-[2.5rem] opacity-30 text-center border border-dashed border-beige-dark">
                  <item.icon size={28} className="mx-auto mb-8" />
                  <h4 className="text-2xl font-serif font-bold mb-3">{item.name}</h4>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
