import { Search, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value === 'kittykitty') {
      setIsSearchOpen(false);
      setSearchValue('');
      navigate('/admin');
    }
  };

  return (
    <nav className="h-20 shrink-0 border-b border-beige-dark bg-beige/90 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center group gap-5">
          <img 
            src="/calligraphy.png" 
            alt="Shaykh Hamad bin Aasif Ash-Shafi'i al-Athari" 
            className="h-16 w-auto object-contain group-hover:opacity-80 transition-opacity" 
            referrerPolicy="no-referrer"
          />
          <div className="hidden md:flex flex-col border-l border-purple/10 pl-5">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] font-black text-purple group-hover:text-purple-light transition-colors">
              Shaykh Hamad bin Aasif
            </span>
            <span className="font-sans text-[8px] uppercase tracking-[0.1em] font-bold text-purple/40 mt-1">
              Ash-Shafi'i al-Athari
            </span>
          </div>
        </Link>
        
        <div className="hidden lg:flex space-x-8 text-[11px] uppercase tracking-[0.15em] font-bold text-brown-dark ml-8">
          <Link to="/library" className="hover:text-purple border-b border-transparent hover:border-purple pb-1 transition-all">Archives</Link>
          <Link to="/courses" className="hover:text-purple border-b border-transparent hover:border-purple pb-1 transition-all">Courses</Link>
          <Link to="/fawaaid" className="hover:text-purple border-b border-transparent hover:border-purple pb-1 transition-all">Al-Fawaaid</Link>
          <Link to="/about" className="hover:text-purple border-b border-transparent hover:border-purple pb-1 transition-all">Biography</Link>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center bg-white/50 backdrop-blur-sm px-5 py-2 rounded-full border border-beige-dark focus-within:border-purple/30 transition-all">
           <input 
             type="text" 
             placeholder="Search within archives..."
             value={searchValue}
             onChange={handleSearchChange}
             className="bg-transparent border-none outline-none text-[11px] font-medium placeholder:text-purple/30 w-40 focus:w-60 transition-all font-sans"
           />
           <Search size={14} className="text-purple/30" />
        </div>

        <button 
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="md:hidden p-2 text-brown-dark hover:text-gold"
        >
          <Search size={20} />
        </button>
        
        <button className="lg:hidden text-brown-dark">
          <Menu size={24} />
        </button>
      </div>
      
      {/* Mobile Search Overlay Placeholder */}
      {isSearchOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-0 w-full bg-white border-b border-beige-dark p-4 shadow-xl z-50"
        >
          <div className="max-w-3xl mx-auto relative">
            <input 
              type="text" 
              placeholder="Search by topic, speaker or keyword..."
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full bg-beige/50 border-none rounded-xl py-3 px-12 focus:ring-2 focus:ring-gold outline-none"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-dark/40" size={18} />
          </div>
        </motion.div>
      )}
    </nav>
  );
}
