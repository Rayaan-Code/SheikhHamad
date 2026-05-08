import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Calendar, User, Tag, Share2, BookOpen, Play, Video } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import type { Content, Speaker, Category } from '../types';
import ReactMarkdown from 'react-markdown';
import { useAudio } from '../lib/AudioContext';

export default function ContentDetail() {
  const { slug } = useParams();
  const [content, setContent] = useState<Content | null>(null);
  const [speaker, setSpeaker] = useState<Speaker | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const { playTrack } = useAudio();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const q = query(collection(db, 'contents'), where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Content;
          setContent(data);

          // Fetch speaker
          if (data.speakerId) {
            const sDoc = await getDoc(doc(db, 'speakers', data.speakerId));
            if (sDoc.exists()) setSpeaker({ id: sDoc.id, ...sDoc.data() } as Speaker);
          }

          // Fetch category
          if (data.categoryId) {
            const cDoc = await getDoc(doc(db, 'categories', data.categoryId));
            if (cDoc.exists()) setCategory({ id: cDoc.id, ...cDoc.data() } as Category);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [slug]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!content) return <div className="h-screen flex items-center justify-center">Content not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link to="/library" className="inline-flex items-center gap-2 text-purple font-medium mb-12 hover:-translate-x-1 transition-transform">
        <ChevronLeft size={20} />
        <span>Back to Archives</span>
      </Link>

      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <header className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <span className="bg-purple text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest leading-none">
              {content.type}
            </span>
            <span className="text-brown-dark/30 text-xs px-2">/</span>
            <span className="text-purple/40 text-[10px] font-bold uppercase tracking-widest leading-none">
              {category?.name || 'General Archive'}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif text-purple leading-tight mb-8">
            {content.title}
          </h1>

          <div className="flex flex-wrap items-center gap-8 py-8 border-y border-beige-dark/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple/10 flex items-center justify-center text-purple">
                <User size={20} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-purple/30 tracking-wider">Source</div>
                <div className="text-sm font-medium italic font-serif">Personal Archive</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-beige-dark/50 flex items-center justify-center text-brown-dark/40">
                <Calendar size={20} />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-brown-dark/30 tracking-wider">Published</div>
                <div className="text-sm font-medium">Jan 24, 2024</div>
              </div>
            </div>

            <button className="ml-auto w-10 h-10 rounded-full border border-beige-dark flex items-center justify-center text-purple/40 hover:bg-purple hover:text-white hover:border-purple transition-all">
              <Share2 size={18} />
            </button>
          </div>
        </header>

        {/* Media Player Section */}
        {content.type === 'VIDEO' && (content.youtubeId || content.mediaUrl) && (
          <div className="mb-12 rounded-[2.5rem] overflow-hidden bg-black aspect-video shadow-2xl">
            {content.youtubeId ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${content.youtubeId}`}
                title={content.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <video 
                src={content.mediaUrl} 
                controls 
                className="w-full h-full"
              />
            )}
          </div>
        )}

        {content.type === 'AUDIO' && content.mediaUrl && (
          <div className="mb-12 bg-purple rounded-[2rem] p-8 flex items-center justify-between shadow-xl">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                  <Play size={28} fill="currentColor" />
                </div>
                <div>
                   <h3 className="text-white font-serif text-xl font-bold">Listen to Lesson</h3>
                   <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Direct stream from archive</p>
                </div>
             </div>
             <button 
               onClick={() => playTrack({ title: content?.title || '', speaker: speaker?.name || 'Contributor', url: content?.mediaUrl || '' })}
               className="bg-white text-purple px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
             >
               Launch Player
             </button>
          </div>
        )}

        <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-purple prose-p:text-brown-dark/80 prose-p:leading-relaxed prose-a:text-purple prose-strong:text-purple">
          <div className="markdown-body">
            <ReactMarkdown>
              {content.body || content.description || 'No content available.'}
            </ReactMarkdown>
          </div>
        </div>

        {content.type === 'PDF' && content.mediaUrl && (
          <div className="mt-16 bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-purple/10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 bg-purple/10 rounded-2xl flex items-center justify-center text-purple shrink-0">
              <BookOpen size={32} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-serif text-xl font-bold mb-1">Attached PDF Document</h3>
              <p className="text-sm text-brown-dark/50 mb-4 md:mb-0">This work has an associated PDF file for offline study.</p>
            </div>
            <a 
              href={content.mediaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-purple text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all"
            >
              Download PDF
            </a>
          </div>
        )}
      </motion.article>
    </div>
  );
}
