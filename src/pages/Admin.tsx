import { useState, useEffect } from 'react';
import { db, storage, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, onSnapshot, deleteDoc, limit, doc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import type { Speaker, Category, Content, Course } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Database, AlertCircle, Upload, CheckCircle2, Lock, LogIn, ChevronLeft, UserPlus, FolderPlus, Trash2, GraduationCap } from 'lucide-react';
import MarkdownEditor from '../components/MarkdownEditor';

export default function Admin() {
  // Content Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState<'ARTICLE' | 'AUDIO' | 'VIDEO' | 'PDF'>('ARTICLE');
  const [body, setBody] = useState('');
  const [speakerId, setSpeakerId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mediaUrl, setMediaUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  
  // Auth & Lists state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [fawaaidList, setFawaaidList] = useState<any[]>([]);
  
  // New Entity States
  const [newSpeakerName, setNewSpeakerName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'SPEAKERS' | 'CATEGORIES' | 'COURSES' | 'FAWAAID'>('CONTENT');
  const [purgeCode, setPurgeCode] = useState('');

  // Confirmation States
  const [confirmDelete, setConfirmDelete] = useState<{ coll: string, id: string } | null>(null);
  const [confirmPurge, setConfirmPurge] = useState(false);

  // Fawaaid State
  const [fawaaidText, setFawaaidText] = useState('');
  const [fawaaidSource, setFawaaidSource] = useState('');
  const [fawaaidTags, setFawaaidTags] = useState('');

  const handleAddFawaaid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fawaaidText.trim()) return;
    try {
      setLoading(true);
      await addDoc(collection(db, 'fawaaid'), {
        text: fawaaidText.trim(),
        source: fawaaidSource.trim(),
        tags: fawaaidTags.split(',').map(tag => tag.trim()).filter(t => t),
        createdAt: serverTimestamp()
      });
      setFawaaidText('');
      setFawaaidSource('');
      setFawaaidTags('');
      setMessage('Benefit added successfully.');
    } catch (err: any) {
      setMessage(`Error adding benefit: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      const qS = query(collection(db, 'speakers'), orderBy('name', 'asc'));
      const unsubS = onSnapshot(qS, (snap) => {
        setSpeakers(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Speaker[]);
      });

      const qC = query(collection(db, 'categories'), orderBy('name', 'asc'));
      const unsubC = onSnapshot(qC, (snap) => {
        setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Category[]);
      });

      const qCr = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
      const unsubCr = onSnapshot(qCr, (snap) => {
        setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Course[]);
      });

      const qCn = query(collection(db, 'contents'), orderBy('createdAt', 'desc'), limit(50));
      const unsubCn = onSnapshot(qCn, (snap) => {
        setContents(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Content[]);
      });

      const qF = query(collection(db, 'fawaaid'), orderBy('createdAt', 'desc'));
      const unsubF = onSnapshot(qF, (snap) => {
        setFawaaidList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      return () => { unsubS(); unsubC(); unsubCr(); unsubCn(); unsubF(); };
    }
  }, [isAuthorized]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'kittykitty') {
      try {
        setLoading(true);
        setMessage('Redirecting to Google Sign-in...');
        
        const provider = new GoogleAuthProvider();
        // provider.setCustomParameters({ prompt: 'select_account' });
        await signInWithPopup(auth, provider);
        setIsAuthorized(true);
        setMessage('');
      } catch (err: any) {
        console.error('Auth error:', err);
        if (err.code === 'auth/popup-blocked') {
          setMessage('Pop-up was blocked. Please enable pop-ups for this site or open the app in a new tab.');
        } else {
          setMessage(`Authentication error: ${err.message}. Ensure "Google" provider is enabled in Firebase Console.`);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setMessage('Unrecognized credentials.');
    }
  };

  const testConnection = async () => {
    setMessage('Testing connection...');
    try {
      const q = query(collection(db, 'speakers'), limit(1));
      await getDocs(q);
      setMessage('Firestore Connection: OK');
    } catch (err: any) {
      setMessage(`Firestore Error: ${err.message}. Ensure security rules are deployed and Firestore is initialized.`);
    }
  };

  const deleteItem = async (coll: string, id: string) => {
    console.log(`Deleting ${id} from ${coll}...`);
    try {
      setLoading(true);
      if (!auth.currentUser) {
        throw new Error('You must be signed in with Google to delete items.');
      }
      await deleteDoc(doc(db, coll, id));
      setMessage('Item deleted successfully.');
      setConfirmDelete(null);
    } catch (err: any) {
      console.error(`Delete failed:`, err);
      setMessage(`Delete failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const purgeArchives = async () => {
    const normalizedInput = purgeCode.trim().toLowerCase();
    const targetCode = 'sheikhy bakey';
    
    if (normalizedInput !== targetCode) {
      setMessage(`Invalid verification code. Please type "${targetCode}" correctly.`);
      return;
    }
    
    console.log('Starting full archive purge...');
    setLoading(true);
    setMessage('Purging archives...');
    try {
      if (!auth.currentUser) {
        throw new Error('You must be signed in with Google to purge the archive.');
      }

      const collections = ['contents', 'speakers', 'categories', 'fawaaid', 'courses'];
      const totalDeleted: string[] = [];

      for (const collName of collections) {
        const snap = await getDocs(collection(db, collName));
        if (!snap.empty) {
          // Process in chunks of 500 for Firestore batch limits
          const chunks = [];
          for (let i = 0; i < snap.docs.length; i += 500) {
            chunks.push(snap.docs.slice(i, i + 500));
          }

          for (const chunk of chunks) {
            const batch = writeBatch(db);
            chunk.forEach(d => batch.delete(d.ref));
            await batch.commit();
          }
          
          totalDeleted.push(`${snap.size} ${collName}`);
          console.log(`Purged ${snap.size} items from ${collName}`);
        }
      }
      
      setMessage(`Archive successfully cleared. Deleted: ${totalDeleted.join(', ') || '0 items'}`);
      setPurgeCode('');
      setConfirmPurge(false);
      // Force reload UI data
      setContents([]);
      setSpeakers([]);
      setCategories([]);
      setCourses([]);
      setFawaaidList([]);
    } catch (err: any) {
      console.error('Purge error:', err);
      setMessage(`Purge failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpeaker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpeakerName.trim()) return;
    try {
      setLoading(true);
      await addDoc(collection(db, 'speakers'), {
        name: newSpeakerName.trim()
      });
      setNewSpeakerName('');
      setMessage('Speaker added successfully.');
    } catch (err: any) {
      setMessage(`Error adding speaker: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      setLoading(true);
      await addDoc(collection(db, 'categories'), {
        name: newCategoryName.trim()
      });
      setNewCategoryName('');
      setMessage('Category added successfully.');
    } catch (err: any) {
      setMessage(`Error adding category: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedCategories = async () => {
    const defaults = ['Aqeedah', 'Fiqh', 'Hadith', 'Adab', 'Qur\'aan'];
    setLoading(true);
    setMessage('Seeding standard categories...');
    try {
      if (!auth.currentUser) throw new Error('Not signed in');
      
      let count = 0;
      for (const name of defaults) {
        // Check if exists
        const exists = categories.some(cat => cat.name.toLowerCase() === name.toLowerCase());
        if (!exists) {
          await addDoc(collection(db, 'categories'), { name });
          count++;
        }
      }
      setMessage(`Successfully added ${count} standard categories.`);
    } catch (err: any) {
      setMessage(`Error seeding: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;
    try {
      setLoading(true);
      await addDoc(collection(db, 'courses'), {
        title: newCourseTitle.trim(),
        description: newCourseDesc.trim(),
        isFeatured: false,
        createdAt: serverTimestamp()
      });
      setNewCourseTitle('');
      setNewCourseDesc('');
      setMessage('Course added successfully.');
    } catch (err: any) {
      setMessage(`Error adding course: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Basic size check before upload starts
      if (selectedFile.size > 100 * 1024 * 1024) {
        setMessage('Error: File exceeds 100MB limit.');
        return;
      }
      setFile(selectedFile);
      setYoutubeUrl(''); // Clear youtube if file selected
      setMessage('');
    }
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `content/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      // Start progress monitoring
      setUploadProgress(0);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload task error:', error);
          reject(new Error(`Upload failed: ${error.message}`));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (err: any) {
            reject(new Error(`Download URL error: ${err.message}`));
          }
        }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!speakerId || !categoryId) {
      setMessage('Please select a speaker and category.');
      return;
    }

    setLoading(true);
    setMessage('');
    setUploadProgress(0);
    
    try {
      if (!isAuthorized || !auth.currentUser) {
        throw new Error('Session expired or unauthorized. Please re-enter passphrase.');
      }
      
      let finalMediaUrl = mediaUrl;
      let finalYoutubeId = '';
      let finalHeroImageUrl = heroImageUrl;

      if (type === 'VIDEO' && youtubeUrl) {
        const id = getYoutubeId(youtubeUrl);
        if (!id) throw new Error('Invalid YouTube URL. Please provide a direct link.');
        finalYoutubeId = id;
      } else if (file) {
        setMessage(`Connecting to storage for ${type.toLowerCase()} upload...`);
        try {
          finalMediaUrl = await uploadFile(file);
        } catch (uploadErr: any) {
          throw new Error(`File upload failed: ${uploadErr.message}. Ensure Storage bucket is configured.`);
        }
      }

      if (heroImageFile) {
        setMessage('Uploading hero image...');
        try {
          const storageRef = ref(storage, `hero-images/${Date.now()}_${heroImageFile.name}`);
          const uploadTask = uploadBytesResumable(storageRef, heroImageFile);
          await new Promise<void>((resolve, reject) => {
            uploadTask.on('state_changed', null, (error) => reject(error), () => resolve());
          });
          finalHeroImageUrl = await getDownloadURL(uploadTask.snapshot.ref);
        } catch (uploadErr: any) {
          throw new Error(`Hero image upload failed: ${uploadErr.message}`);
        }
      }
      
      setMessage('Recording archive metadata...');
      await addDoc(collection(db, 'contents'), {
        title,
        slug,
        type,
        body,
        mediaUrl: finalMediaUrl,
        youtubeId: finalYoutubeId,
        heroImageUrl: finalHeroImageUrl || null,
        speakerId,
        categoryId,
        courseId: courseId || null,
        createdAt: serverTimestamp(),
        isFeatured: false
      });
      
      setMessage('Successfully added to the archives!');
      setTitle('');
      setSlug('');
      setBody('');
      setFile(null);
      setHeroImageFile(null);
      setHeroImageUrl('');
      setUploadProgress(0);
      setMediaUrl('');
      setYoutubeUrl('');
    } catch (err: any) {
      console.error('Submit error:', err);
      setMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="h-screen flex flex-col bg-beige-subtle">
        <div className="p-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brown-dark/30 hover:text-gold transition-colors"
          >
            <ChevronLeft size={14} />
            Back to Archive
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-gold/5 text-center border border-beige-dark"
          >
            <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center text-gold mx-auto mb-8">
              <Lock size={32} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-brown-dark mb-4 italic">Manager Portal</h1>
            <p className="text-sm text-brown-dark/50 leading-relaxed mb-10">Access restricted to authorized personnel. Provide the passphrase to continue.</p>
            
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Passphrase"
                className="w-full bg-beige/30 border border-beige-dark rounded-2xl py-4 px-6 text-center outline-none focus:ring-2 focus:ring-gold font-sans"
                autoFocus
              />
              <button 
                type="submit"
                className="w-full bg-brown-dark text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-gold transition-all shadow-xl shadow-brown-dark/10 flex items-center justify-center gap-3"
              >
                <LogIn size={16} />
                Open Archives
              </button>
              {message && <p className="text-[10px] uppercase font-bold text-rose-500 mt-4 tracking-widest">{message}</p>}
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2 text-brown-dark">Manager Portal</h1>
          <div className="flex items-center gap-3">
            <p className="text-brown-dark/50 text-sm">Authorized Session</p>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-brown-dark/30 tracking-widest">{currentUser?.uid.slice(0, 8)}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {!currentUser && (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl">
               <AlertCircle size={14} className="text-rose-500" />
               <span className="text-[9px] font-black uppercase tracking-widest text-rose-500">Google Auth Missing</span>
            </div>
          )}
          <button 
            onClick={testConnection}
            className="text-[10px] font-black uppercase tracking-widest text-brown-dark/30 hover:text-gold transition-colors"
          >
            Debug Connection
          </button>
          <button 
            onClick={() => setIsAuthorized(false)}
            className="text-[10px] font-black uppercase tracking-widest text-brown-dark/30 hover:text-rose-500 transition-colors"
          >
            Lock Session
          </button>
          <button 
            onClick={() => navigate('/library')}
            className="w-12 h-12 bg-white border border-beige-dark rounded-2xl flex items-center justify-center text-brown-dark/30 hover:text-gold hover:border-gold transition-all"
            title="Return to Library"
          >
            <ChevronLeft size={24} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-12 overflow-x-auto pb-2">
        <button 
          onClick={() => setActiveTab('CONTENT')}
          className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'CONTENT' ? 'bg-gold text-white shadow-xl shadow-gold/20' : 'bg-beige text-brown-dark/40 hover:bg-beige-dark'}`}
        >
          Add Content
        </button>
        <button 
          onClick={() => setActiveTab('SPEAKERS')}
          className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'SPEAKERS' ? 'bg-gold text-white shadow-xl shadow-gold/20' : 'bg-beige text-brown-dark/40 hover:bg-beige-dark'}`}
        >
          Manage Speakers
        </button>
        <button 
          onClick={() => setActiveTab('CATEGORIES')}
          className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'CATEGORIES' ? 'bg-gold text-white shadow-xl shadow-gold/20' : 'bg-beige text-brown-dark/40 hover:bg-beige-dark'}`}
        >
          Manage Categories
        </button>
        <button 
          onClick={() => setActiveTab('COURSES')}
          className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'COURSES' ? 'bg-gold text-white shadow-xl shadow-gold/20' : 'bg-beige text-brown-dark/40 hover:bg-beige-dark'}`}
        >
          Manage Courses
        </button>
        <button 
          onClick={() => setActiveTab('FAWAAID')}
          className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === 'FAWAAID' ? 'bg-gold text-white shadow-xl shadow-gold/20' : 'bg-beige text-brown-dark/40 hover:bg-beige-dark'}`}
        >
          Manage Fawaaid
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {activeTab === 'CONTENT' && (
            <div className="space-y-12">
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-beige-dark space-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brown-dark/40 mb-3">Resource Title</label>
                    <input 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-white border border-beige-dark rounded-2xl py-4 px-6 focus:ring-2 focus:ring-gold outline-none transition-all"
                      placeholder="e.g. The Pillars of Islam"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brown-dark/40 mb-3">Slug</label>
                      <input 
                        value={slug} 
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full bg-white border border-beige-dark rounded-2xl py-4 px-6 focus:ring-2 focus:ring-gold outline-none transition-all"
                        placeholder="pillars-of-islam"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brown-dark/40 mb-3">Type</label>
                      <div className="relative">
                        <select 
                          value={type} 
                          onChange={(e) => setType(e.target.value as any)}
                          className="w-full bg-white border border-beige-dark rounded-2xl py-4 px-6 focus:ring-2 focus:ring-gold outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="ARTICLE">Article</option>
                          <option value="AUDIO">Audio (MP3)</option>
                          <option value="VIDEO">Video (MP4)</option>
                          <option value="PDF">PDF Document</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                          <ChevronLeft className="-rotate-90" size={14} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {type === 'VIDEO' && (
                    <div className="p-8 bg-rose-50/50 rounded-[2rem] border border-rose-100 mb-6">
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-rose-900/40 mb-3">YouTube URL (Recommended)</label>
                      <input 
                        value={youtubeUrl} 
                        onChange={(e) => {
                          setYoutubeUrl(e.target.value);
                          if (e.target.value) setFile(null);
                        }}
                        className="w-full bg-white border border-rose-100 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-rose-500 outline-none transition-all placeholder:text-rose-900/20"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      <p className="text-[9px] text-rose-900/30 mt-3 italic">Bypass storage limits by using YouTube embeds.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brown-dark/40 mb-3">Speaker</label>
                      <div className="relative">
                        <select 
                          value={speakerId} 
                          onChange={(e) => setSpeakerId(e.target.value)}
                          className="w-full bg-white border border-beige-dark rounded-2xl py-4 px-6 focus:ring-2 focus:ring-gold outline-none transition-all appearance-none cursor-pointer"
                          required
                        >
                          <option value="">Select Speaker...</option>
                          {speakers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                          <ChevronLeft className="-rotate-90" size={14} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brown-dark/40 mb-3">Category</label>
                      <div className="relative">
                        <select 
                          value={categoryId} 
                          onChange={(e) => setCategoryId(e.target.value)}
                          className="w-full bg-white border border-beige-dark rounded-2xl py-4 px-6 focus:ring-2 focus:ring-gold outline-none transition-all appearance-none cursor-pointer"
                          required
                        >
                          <option value="">Select Category...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                          <ChevronLeft className="-rotate-90" size={14} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brown-dark/40 mb-3">Course Link (Optional)</label>
                     <div className="relative">
                        <select 
                          value={courseId} 
                          onChange={(e) => setCourseId(e.target.value)}
                          className="w-full bg-white border border-beige-dark rounded-2xl py-4 px-6 focus:ring-2 focus:ring-gold outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="">None (Standalone Lesson)</option>
                          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                          <ChevronLeft className="-rotate-90" size={14} />
                        </div>
                      </div>
                      <p className="text-[9px] text-brown-dark/30 mt-2 italic">Assign this lesson to a structured course series.</p>
                  </div>

                  {(type !== 'ARTICLE' && (type !== 'VIDEO' || !youtubeUrl)) && (
                    <div className="p-8 bg-beige-subtle rounded-[2rem] border-2 border-dashed border-beige-dark">
                      <label className="block text-center cursor-pointer">
                        <div className="flex flex-col items-center">
                          {file ? (
                            <div className="flex items-center gap-3 text-gold">
                              <CheckCircle2 size={32} />
                              <span className="text-sm font-bold truncate max-w-[200px]">{file.name}</span>
                            </div>
                          ) : (
                            <>
                              <Upload size={32} className="text-brown-dark/20 mb-3" />
                              <span className="text-xs font-bold uppercase tracking-widest text-brown-dark/40">Select {type} File</span>
                              <span className="text-[10px] text-brown-dark/30 mt-1">MP3, MP4 or PDF up to 100MB</span>
                            </>
                          )}
                        </div>
                        <input type="file" className="hidden" onChange={handleFileChange} accept={
                          type === 'AUDIO' ? '.mp3,audio/*' : 
                          type === 'VIDEO' ? '.mp4,video/*' : 
                          type === 'PDF' ? '.pdf' : '*'
                        } />
                      </label>
                      
                      {loading && uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-6">
                          <div className="w-full h-1 bg-beige-dark rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gold" 
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <div className="text-[10px] text-center mt-2 font-bold text-gold uppercase tracking-tighter">Uploading to Cloud: {Math.round(uploadProgress)}%</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-8 bg-beige-subtle rounded-[2rem] border-2 border-dashed border-beige-dark">
                    <label className="block text-center cursor-pointer">
                      <div className="flex flex-col items-center">
                        {heroImageFile ? (
                          <div className="flex items-center gap-3 text-gold">
                            <CheckCircle2 size={32} />
                            <span className="text-sm font-bold truncate max-w-[200px]">{heroImageFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <Upload size={32} className="text-brown-dark/20 mb-3" />
                            <span className="text-xs font-bold uppercase tracking-widest text-brown-dark/40">Hero Image (Social Preview)</span>
                            <span className="text-[10px] text-brown-dark/30 mt-1">Optimal size: 1200 x 630 pixels (JPG/PNG/WebP)</span>
                            <span className="text-[9px] text-brown-dark/20 mt-0.5">Shown when sharing link on social media and messaging apps</span>
                          </>
                        )}
                      </div>
                      <input type="file" className="hidden" onChange={(e) => {
                        if (e.target.files && e.target.files[0]) setHeroImageFile(e.target.files[0]);
                      }} accept=".jpg,.jpeg,.png,.webp" />
                    </label>
                  </div>

                  <MarkdownEditor
                    value={body}
                    onChange={setBody}
                    placeholder="Detailed description or article text..."
                    label="Content Body"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 ${
                    loading ? 'bg-gold/50 cursor-not-allowed shadow-none' : 'bg-gold text-white hover:bg-gold/90 shadow-2xl shadow-gold/20 active:scale-[0.98]'
                  }`}
                >
                  {loading ? 'Processing...' : <><Plus size={16} /> Publish Archive</>}
                </button>
              </form>

              <div className="bg-white rounded-[2.5rem] overflow-hidden border border-beige-dark">
                <table className="w-full text-left">
                  <thead className="bg-beige/30">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brown-dark/40">Recent Archives</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brown-dark/40 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige-dark">
                    {contents.map(item => (
                      <tr key={item.id}>
                        <td className="px-8 py-4">
                          <div className="font-serif font-bold text-brown-dark">{item.title}</div>
                          <div className="text-[9px] uppercase font-bold text-brown-dark/30 tracking-widest mt-1">{item.type} &bull; {item.slug}</div>
                        </td>
                        <td className="px-8 py-4 text-right flex items-center justify-end gap-4">
                           <button 
                             onClick={() => setConfirmDelete({ coll: 'contents', id: item.id })}
                             className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                           >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {contents.length === 0 && (
                       <tr><td colSpan={2} className="px-8 py-8 text-center italic text-brown-dark/30">No items available.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'SPEAKERS' && (
            <div className="space-y-12">
              <form onSubmit={handleAddSpeaker} className="bg-white p-8 rounded-[2.5rem] border border-beige-dark">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brown-dark/40 mb-3">Full Name</label>
                <div className="flex gap-4">
                  <input 
                    value={newSpeakerName}
                    onChange={(e) => setNewSpeakerName(e.target.value)}
                    className="flex-1 bg-beige/20 border border-beige-dark rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-gold"
                    placeholder="Name"
                  />
                  <button 
                    type="submit"
                    className="bg-gold text-white px-8 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-gold/90 transition-all flex items-center gap-2"
                  >
                    <UserPlus size={14} /> Add
                  </button>
                </div>
              </form>
              
              <div className="bg-white rounded-[2.5rem] overflow-hidden border border-beige-dark">
                <table className="w-full text-left">
                  <thead className="bg-beige/30">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brown-dark/40">Name</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brown-dark/40 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige-dark">
                    {speakers.map(s => (
                      <tr key={s.id}>
                        <td className="px-8 py-4 font-serif text-brown-dark">{s.name}</td>
                        <td className="px-8 py-4 text-right flex items-center justify-end gap-4">
                          <span className="text-[10px] font-black text-brown-dark/20 uppercase tracking-widest">ID: {s.id.slice(0, 4)}</span>
                          <button 
                            onClick={() => setConfirmDelete({ coll: 'speakers', id: s.id })}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {speakers.length === 0 && (
                      <tr><td colSpan={2} className="px-8 py-12 text-center text-brown-dark/30 italic">No speakers found. Add your first one above.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'CATEGORIES' && (
            <div className="space-y-12">
              <div className="bg-white p-8 rounded-[2.5rem] border border-beige-dark space-y-6">
                <form onSubmit={handleAddCategory}>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brown-dark/40 mb-3">Category Title</label>
                  <div className="flex gap-4">
                    <input 
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1 bg-beige/20 border border-beige-dark rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-gold"
                      placeholder="e.g. Aqeedah"
                    />
                    <button 
                      type="submit"
                      disabled={loading}
                      className="bg-gold text-white px-8 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-gold/90 transition-all flex items-center gap-2"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </form>

                <div className="pt-6 border-t border-beige-dark flex items-center justify-between">
                   <div className="text-[10px] text-brown-dark/40 font-bold uppercase tracking-widest">Quick Setup</div>
                   <button 
                     onClick={handleSeedCategories}
                     disabled={loading}
                     className="text-[10px] font-black uppercase tracking-widest text-gold hover:text-brown-dark transition-colors flex items-center gap-2"
                   >
                     Seed Standard Categories (5)
                   </button>
                </div>
              </div>
              
              <div className="bg-white rounded-[2.5rem] overflow-hidden border border-beige-dark">
                <table className="w-full text-left">
                  <thead className="bg-beige/30">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brown-dark/40">Title</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brown-dark/40 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige-dark">
                    {categories.map(c => (
                      <tr key={c.id}>
                        <td className="px-8 py-4 font-serif text-brown-dark">{c.name}</td>
                        <td className="px-8 py-4 text-right flex items-center justify-end gap-4">
                          <span className="text-[10px] font-black text-brown-dark/20 uppercase tracking-widest">ID: {c.id.slice(0, 4)}</span>
                          <button 
                            onClick={() => setConfirmDelete({ coll: 'categories', id: c.id })}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr><td colSpan={2} className="px-8 py-12 text-center text-brown-dark/30 italic">No categories found. Add your first one above.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'FAWAAID' && (
            <div className="space-y-12">
              <form onSubmit={handleAddFawaaid} className="bg-white p-8 rounded-[2.5rem] border border-beige-dark space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brown-dark/40 mb-3">Benefit Text</label>
                  <textarea 
                    value={fawaaidText}
                    onChange={(e) => setFawaaidText(e.target.value)}
                    rows={4}
                    className="w-full bg-beige/20 border border-beige-dark rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-gold"
                    placeholder="Enter the beneficial point..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brown-dark/40 mb-3">Source (Optional)</label>
                    <input 
                      value={fawaaidSource}
                      onChange={(e) => setFawaaidSource(e.target.value)}
                      className="w-full bg-beige/20 border border-beige-dark rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-gold"
                      placeholder="e.g. Sharh Thalaathat al-Usool"
                    />
                  </div>
                   <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brown-dark/40 mb-3">Tags (comma separated)</label>
                    <input 
                      value={fawaaidTags}
                      onChange={(e) => setFawaaidTags(e.target.value)}
                      className="w-full bg-beige/20 border border-beige-dark rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-gold"
                      placeholder="Aqeedah, Ikhlas, Sunnah"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold text-white py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-gold/90 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Add Gem of Wisdom
                </button>
              </form>

              <div className="bg-white rounded-[2.5rem] p-8 border border-beige-dark overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="border-b border-beige-dark">
                      <tr>
                        <th className="pb-4 text-[10px] uppercase tracking-widest font-black text-brown-dark/30">Content</th>
                        <th className="pb-4 text-right text-[10px] uppercase tracking-widest font-black text-brown-dark/30">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-beige-dark">
                      {fawaaidList.map(item => (
                        <tr key={item.id}>
                          <td className="py-4 text-xs font-serif text-brown-dark leading-relaxed pr-8">
                            {item.text.slice(0, 100)}...
                          </td>
                          <td className="py-4 text-right">
                             <button 
                               onClick={() => setConfirmDelete({ coll: 'fawaaid', id: item.id })}
                               className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                             >
                                <Trash2 size={14} />
                             </button>
                          </td>
                        </tr>
                      ))}
                      {fawaaidList.length === 0 && (
                        <tr><td colSpan={2} className="py-8 text-center text-brown-dark/30 italic">No benefits listed yet.</td></tr>
                      )}
                    </tbody>
                 </table>
              </div>
            </div>
          )}

          {activeTab === 'COURSES' && (
             <div className="space-y-12">
              <form onSubmit={handleAddCourse} className="bg-white p-8 rounded-[2.5rem] border border-beige-dark space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brown-dark/40 mb-3">Course Title</label>
                  <input 
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    className="w-full bg-beige/20 border border-beige-dark rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-gold"
                    placeholder="e.g. Explanation of Kitaab at-Tawheed"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brown-dark/40 mb-3">Short Description</label>
                  <textarea 
                    value={newCourseDesc}
                    onChange={(e) => setNewCourseDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-beige/20 border border-beige-dark rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-gold font-sans text-sm"
                    placeholder="Briefly describe the course goals..."
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold text-white py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-gold/90 transition-all flex items-center justify-center gap-2"
                >
                  <GraduationCap size={16} /> Create Course
                </button>
              </form>

              <div className="bg-white rounded-[2.5rem] overflow-hidden border border-beige-dark">
                <table className="w-full text-left">
                  <thead className="bg-beige/30">
                    <tr>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brown-dark/40">Course Title</th>
                      <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-brown-dark/40 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-beige-dark">
                    {courses.map(c => (
                      <tr key={c.id}>
                        <td className="px-8 py-4 font-serif text-brown-dark">
                          <div className="font-bold">{c.title}</div>
                          <div className="text-[10px] text-brown-dark/40 mt-0.5">{c.description?.slice(0, 50)}...</div>
                        </td>
                        <td className="px-8 py-4 text-right flex items-center justify-end gap-4">
                          <span className="text-[10px] font-black text-brown-dark/20 uppercase tracking-widest">ID: {c.id.slice(0, 4)}</span>
                          <button 
                            onClick={() => setConfirmDelete({ coll: 'courses', id: c.id })}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {courses.length === 0 && (
                      <tr><td colSpan={2} className="px-8 py-12 text-center text-brown-dark/30 italic">No courses found. Add your first one above.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {message && (
            <div className={`p-6 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 border ${
              (message.toLowerCase().includes('error') || message.toLowerCase().includes('failed') || message.toLowerCase().includes('invalid')) 
                ? 'bg-rose-50 text-rose-600 border-rose-100' 
                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
              <AlertCircle size={20} className="shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">{message}</span>
            </div>
          )}

          <div className="bg-rose-50 rounded-[2.5rem] p-8 border border-rose-101">
            <h3 className="font-serif text-xl font-bold mb-4 text-rose-900 italic">Danger Zone</h3>
            <p className="text-xs text-rose-600/60 leading-relaxed mb-6">Clear all archived data to reset the library. This action is permanent.</p>
            
            <div className="mb-6">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-rose-900/40 mb-2">Verification Code</label>
              <input 
                type="text"
                value={purgeCode}
                onChange={(e) => setPurgeCode(e.target.value)}
                placeholder="Type code to purge..."
                className="w-full bg-white/50 border border-rose-200 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
            </div>

            <button 
              onClick={() => setConfirmPurge(true)}
              disabled={loading || !purgeCode}
              className={`w-full py-4 border rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                loading || !purgeCode 
                  ? 'bg-rose-100 border-rose-200 text-rose-300 cursor-not-allowed' 
                  : 'bg-white border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600'
              }`}
            >
              <Trash2 size={16} />
              Purge Database
            </button>
          </div>
          
          <button 
            onClick={() => navigate('/library')}
            className="w-full py-5 px-6 border border-beige-dark rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-brown-dark/40 hover:bg-white hover:text-gold hover:border-gold transition-all text-center"
          >
            Preview Archive
          </button>
        </div>
      </div>

      {/* Confirmation Modals */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-brown-dark/20 backdrop-blur-sm">
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
                Are you absolute certain you wish to remove this record? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                 <button 
                   onClick={() => setConfirmDelete(null)}
                   className="flex-1 py-4 px-6 border border-beige-dark rounded-2xl text-[10px] font-black uppercase tracking-widest text-brown-dark/30 hover:bg-beige-subtle transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                    onClick={() => deleteItem(confirmDelete.coll, confirmDelete.id)}
                    className="flex-1 py-4 px-6 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all"
                 >
                   Delete Now
                 </button>
              </div>
           </motion.div>
        </div>
      )}

      {confirmPurge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-rose-900/10 backdrop-blur-md">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="max-w-md w-full bg-white p-12 rounded-[3.5rem] border-4 border-rose-100 shadow-2xl shadow-rose-900/10"
           >
              <div className="w-20 h-20 bg-rose-600 rounded-[2rem] flex items-center justify-center text-white mb-8 mx-auto shadow-xl shadow-rose-600/20">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-3xl font-serif text-brown-dark text-center mb-4 italic">Critical Action</h3>
              <p className="text-xs text-rose-600 font-bold text-center uppercase tracking-widest mb-6">Database Annihilation Request</p>
              <p className="text-sm text-brown-dark/50 text-center leading-relaxed mb-10">
                You are about to permanently erase the entire digital archive. All content, speakers, categories, and courses will be lost forever.
              </p>
              <div className="flex flex-col gap-3">
                 <button 
                    onClick={purgeArchives}
                    className="w-full py-5 bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/10"
                 >
                   Execute Purge
                 </button>
                 <button 
                   onClick={() => setConfirmPurge(false)}
                   className="w-full py-5 border border-beige-dark rounded-2xl text-[10px] font-black uppercase tracking-widest text-brown-dark/30 hover:bg-beige-subtle transition-all"
                 >
                   Abort Request
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}
