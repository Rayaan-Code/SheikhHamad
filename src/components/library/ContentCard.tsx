import { FileText, Headphones, Video, Book as BookIcon, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Content, ContentType } from '../../types';

const typeIcons: Record<ContentType, any> = {
  ARTICLE: FileText,
  AUDIO: Headphones,
  VIDEO: Video,
  PDF: BookIcon,
};

const typeColors: Record<ContentType, string> = {
  ARTICLE: 'bg-blue-50 text-blue-600',
  AUDIO: 'bg-emerald-50 text-emerald-600',
  VIDEO: 'bg-rose-50 text-rose-600',
  PDF: 'bg-gold/10 text-gold',
};

interface ContentCardProps {
  data: Content;
  speakerName?: string;
  categoryName?: string;
  isManager?: boolean;
  onDelete?: (id: string, e: React.MouseEvent) => void;
}

export default function ContentCard({ data, speakerName, categoryName, isManager, onDelete }: ContentCardProps) {
  const Icon = typeIcons[data.type];

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="group bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-gold cursor-pointer transition-all w-full relative"
    >
      {isManager && onDelete && (
        <button
          onClick={(e) => onDelete(data.id, e)}
          className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 z-30 shadow-lg"
          title="Delete this entry"
        >
          <Trash2 size={14} />
        </button>
      )}

      <div className="flex justify-between items-start mb-3">
        <span className="bg-beige text-gold text-[10px] font-bold px-2 py-1 rounded tracking-wider uppercase">
          {categoryName || 'General'}
        </span>
        <span className="text-[10px] opacity-40 font-medium">
          {data.createdAt instanceof Date ? data.createdAt.toLocaleDateString('en-GB') : 'RECENT'}
        </span>
      </div>

      <h3 className="text-lg font-serif font-bold text-brown-dark group-hover:text-gold transition-colors line-clamp-1">
        {data.title}
      </h3>
      
      <p className="text-[11px] text-brown-dark/60 mt-2 line-clamp-2 leading-relaxed">
        {data.description || 'Access beneficial lessons and archived works through this authentic resource.'}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
          <span className="text-[11px] font-bold text-brown-dark/80 tracking-wide">{speakerName || 'Contributor'}</span>
        </div>
        
        <div className="flex items-center gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
          <Icon size={12} className="text-brown-dark" />
          <span className="text-[9px] font-bold uppercase tracking-tighter">{data.type}</span>
        </div>
      </div>
    </motion.div>
  );
}
