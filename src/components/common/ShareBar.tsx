import { useState } from 'react';
import { Link, Check, Share2 } from 'lucide-react';

interface ShareBarProps {
  title: string;
}

const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const TelegramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-11.944 0zM12 0a12 12 0 0112 12 12 12 0 01-12 12A12 12 0 010 12 12 12 0 0112 0zm-5.86 11.85c2.03-.884 4.064-1.768 6.097-2.652.47-.196.993-.313 1.523-.265.637.058.918.45 1.047.77.097.24.185.488.263.74.432 1.408.863 2.817 1.295 4.225.11.37.218.742.327 1.112.087.297.21.38.41.33.3-.072.598-.16.893-.26.37-.125.743-.24 1.112-.373.188-.067.374-.136.56-.207.082-.03.164-.058.245-.085.083-.03.161-.057.236-.08.03-.01.057-.018.082-.024.018-.003.033-.006.046-.007a.06.06 0 01.012 0 .55.55 0 00.02-.009.515.515 0 00.015-.01l.002.002c-.037.018-.07.04-.1.065-.22.183-.443.36-.668.536-.35.275-.703.547-1.055.82-2.107 1.63-4.213 3.26-6.32 4.89-.55.425-1.1.85-1.648 1.275-.17.134-.342.266-.52.396-.1.074-.202.144-.31.21-.03.015-.06.03-.093.04-.07.02-.137.015-.19.003-.04-.01-.08-.022-.118-.04-.03-.013-.057-.03-.08-.05-.02-.016-.038-.035-.05-.057a.109.109 0 01-.01-.03.108.108 0 010-.05c.003-.015.008-.028.015-.04a.12.12 0 01.018-.03l.002-.004c.048-.04.097-.08.147-.118a3.234 3.234 0 01.097-.08c.69-.528 1.38-1.06 2.068-1.595.6-.468 1.203-.935 1.803-1.405.04-.03.08-.06.12-.09a.2.2 0 00.03-.03.211.211 0 00.007-.013l.002-.003-.008.002a.373.373 0 00-.023.01l-.046.025c-.165.094-.332.182-.5.268-.843.42-1.686.84-2.528 1.26a10.68 10.68 0 01-.72.33c-.1.04-.198.08-.293.115-.06.022-.12.04-.18.06-.05.016-.098.028-.15.035-.04.005-.084.005-.13 0a.305.305 0 01-.13-.04.221.221 0 01-.1-.11.246.246 0 01-.02-.15c.01-.06.03-.12.05-.18.04-.1.09-.2.14-.3a8.46 8.46 0 01.28-.65c.727-1.68 1.453-3.36 2.18-5.04.373-.86.747-1.72 1.12-2.58.19-.44.38-.88.572-1.32.07-.17.143-.338.22-.502a.15.15 0 01.01-.02c.02-.035.04-.06.06-.08h.02z" />
  </svg>
);

function getShareUrl(platform: string, title: string, url: string): string {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);
  switch (platform) {
    case 'whatsapp':
      return `https://wa.me/?text=${encodedTitle}%20-%20${encodedUrl}`;
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
    case 'x':
      return `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    default:
      return '';
  }
}

export default function ShareBar({ title }: ShareBarProps) {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled, do nothing
      }
    } else {
      handleCopy();
    }
  };

  const shareLabel = copied ? 'Copied!' : 'Share';

  return (
    <div className="flex flex-wrap items-center gap-3 py-6">
      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-purple/40 mr-2">
        {shareLabel}
      </span>

      <a
        href={getShareUrl('whatsapp', title, url)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all"
        title="Share on WhatsApp"
      >
        <WhatsAppIcon size={16} />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      <a
        href={getShareUrl('telegram', title, url)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2.5 bg-[#0088cc]/10 hover:bg-[#0088cc] text-[#0088cc] hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all"
        title="Share on Telegram"
      >
        <TelegramIcon size={16} />
        <span className="hidden sm:inline">Telegram</span>
      </a>

      <a
        href={getShareUrl('x', title, url)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2.5 bg-black/10 hover:bg-black text-black/60 hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all"
        title="Share on X"
      >
        <XIcon size={16} />
        <span className="hidden sm:inline">X</span>
      </a>

      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2.5 bg-purple/10 hover:bg-purple text-purple hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all"
        title="Copy link"
      >
        {copied ? <Check size={16} /> : <Link size={16} />}
        <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
      </button>

      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          onClick={handleNativeShare}
          className="flex items-center gap-2 px-4 py-2.5 bg-beige-dark/50 hover:bg-brown-dark text-brown-dark/60 hover:text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all sm:hidden"
          title="Share"
        >
          <Share2 size={16} />
        </button>
      )}
    </div>
  );
}
