import { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Bold, Italic, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Link, Code, Minus,
  Eye, Pencil, Image
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function MarkdownEditor({ value, onChange, placeholder = 'Write your content...', label = 'Content Body' }: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const content = selected || placeholder;

    const newText = value.substring(0, start) + before + content + after + value.substring(end);
    onChange(newText);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = selected ? start + before.length + content.length + after.length : start + before.length + placeholder.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  }, [value, onChange]);

  const toggleInline = useCallback((marker: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);

    const hasMarker = selected.startsWith(marker) && selected.endsWith(marker);
    if (hasMarker) {
      const unwrapped = selected.slice(marker.length, -marker.length);
      const newText = value.substring(0, start) + unwrapped + value.substring(end);
      onChange(newText);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + unwrapped.length);
      });
    } else {
      const newText = value.substring(0, start) + marker + selected + marker + value.substring(end);
      onChange(newText);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start, end + marker.length * 2);
      });
    }
  }, [value, onChange]);

  const handleLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);

    if (selected) {
      setLinkText(selected);
    }
    setLinkUrl('');
    setShowLinkInput(true);
  };

  const insertLink = () => {
    const textarea = textareaRef.current;
    if (!textarea || !linkUrl.trim()) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);

    const displayText = linkText || selected || linkUrl;
    const linkMarkdown = `[${displayText}](${linkUrl})`;

    const newText = value.substring(0, start) + linkMarkdown + value.substring(end);
    onChange(newText);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + linkMarkdown.length, start + linkMarkdown.length);
    });

    setShowLinkInput(false);
    setLinkUrl('');
    setLinkText('');
  };

  const insertImage = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const url = window.prompt('Enter image URL:');
    if (!url) return;

    const alt = window.prompt('Enter alt text (optional):') || 'image';
    insertMarkdown(`![${alt}](`, `${url})`);
  };

  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = value ? value.length : 0;

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', action: () => toggleInline('**'), isActive: false },
    { icon: Italic, label: 'Italic', action: () => toggleInline('*'), isActive: false },
    { type: 'divider' as const },
    { icon: Heading1, label: 'Heading 1', action: () => insertMarkdown('# ', '', 'Heading 1') },
    { icon: Heading2, label: 'Heading 2', action: () => insertMarkdown('## ', '', 'Heading 2') },
    { icon: Heading3, label: 'Heading 3', action: () => insertMarkdown('### ', '', 'Heading 3') },
    { type: 'divider' as const },
    { icon: Quote, label: 'Blockquote', action: () => insertMarkdown('> ', '', 'Blockquote') },
    { icon: List, label: 'Bullet List', action: () => insertMarkdown('- ', '', 'List item') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertMarkdown('1. ', '', 'List item') },
    { type: 'divider' as const },
    { icon: Code, label: 'Code', action: () => toggleInline('`') },
    { icon: Link, label: 'Link', action: handleLink },
    { icon: Image, label: 'Image', action: insertImage },
    { icon: Minus, label: 'Horizontal Rule', action: () => insertMarkdown('\n\n---\n\n') },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brown-dark/60">
          {label} <span className="text-brown-dark/30">(Markdown)</span>
        </label>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-beige-subtle rounded-xl p-0.5 border border-beige-dark shadow-inner">
            <button
              type="button"
              onClick={() => setPreview(false)}
              className={`px-3 py-1.5 rounded-[10px] text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                !preview
                  ? 'bg-white text-brown-dark shadow-sm ring-1 ring-beige-dark/30'
                  : 'text-brown-dark/30 hover:text-brown-dark/60'
              }`}
            >
              <Pencil size={12} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setPreview(true)}
              className={`px-3 py-1.5 rounded-[10px] text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                preview
                  ? 'bg-white text-brown-dark shadow-sm ring-1 ring-beige-dark/30'
                  : 'text-brown-dark/30 hover:text-brown-dark/60'
              }`}
            >
              <Eye size={12} />
              Preview
            </button>
          </div>
        </div>
      </div>

      <div className={`bg-white border border-beige-dark rounded-[2rem] overflow-hidden transition-all focus-within:ring-2 focus-within:ring-gold`}>
        {!preview && (
          <div className="px-2 py-2 border-b border-beige-dark bg-beige-subtle overflow-x-auto custom-scrollbar">
            <div className="flex items-center gap-0.5 min-w-max">
              {toolbarButtons.map((btn, i) => (
                btn.type === 'divider' ? (
                  <div key={i} className="w-px h-6 bg-beige-dark/60 mx-1 flex-shrink-0" />
                ) : 'icon' in btn ? (
                  <button
                    key={i}
                    type="button"
                    onClick={btn.action}
                    title={btn.label}
                    className={`p-2 rounded-lg transition-all flex-shrink-0 flex flex-col items-center min-w-[36px] ${
                      btn.isActive
                        ? 'bg-gold/15 text-gold'
                        : 'text-brown-dark/60 hover:text-brown-dark hover:bg-white/60'
                    }`}
                  >
                    <btn.icon size={16} strokeWidth={1.8} />
                  </button>
                ) : null
              ))}
            </div>
          </div>
        )}

        {showLinkInput && !preview && (
          <div className="flex items-center gap-2 px-4 py-3 bg-gold/5 border-b border-beige-dark/50">
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Link text"
              className="flex-1 bg-white border border-beige-dark rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-gold"
            />
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 bg-white border border-beige-dark rounded-xl py-2 px-4 text-sm outline-none focus:ring-1 focus:ring-gold"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), insertLink())}
            />
            <button
              type="button"
              onClick={insertLink}
              className="px-4 py-2 bg-gold text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gold/90 transition-all flex-shrink-0"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowLinkInput(false)}
              className="px-3 py-2 text-brown-dark/30 hover:text-brown-dark text-xs font-bold uppercase transition-all flex-shrink-0"
            >
              Cancel
            </button>
          </div>
        )}

        {preview ? (
          <div className="p-6 min-h-[260px] max-h-[600px] overflow-y-auto custom-scrollbar">
            {value.trim() ? (
              <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-purple prose-p:text-brown-dark/80 prose-p:leading-relaxed prose-a:text-purple prose-strong:text-purple prose-blockquote:border-l-gold prose-blockquote:text-brown-dark/70 prose-code:bg-beige-subtle prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-li:text-brown-dark/80">
                <ReactMarkdown>{value}</ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[200px] text-brown-dark/20 italic text-sm">
                Nothing to preview yet. Start writing in the editor.
              </div>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={16}
            spellCheck
            className="w-full bg-transparent py-5 px-6 outline-none font-mono text-sm leading-relaxed text-brown-dark placeholder:text-brown-dark/25 resize-y min-h-[260px]"
          />
        )}

        <div className="flex items-center justify-between px-5 py-2.5 border-t border-beige-dark/50 bg-beige-subtle">
          <span className="text-[10px] font-medium text-brown-dark/40 uppercase tracking-wider">
            {charCount} characters &middot; {wordCount} words
          </span>
          <span className="text-[10px] font-medium text-brown-dark/30 uppercase tracking-wider">
            Markdown supported
          </span>
        </div>
      </div>
    </div>
  );
}
