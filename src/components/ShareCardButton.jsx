import { useState } from 'react';

export default function ShareCardButton({ article }) {
  const [generating, setGenerating] = useState(false);
  const [showFormats, setShowFormats] = useState(false);

  const articleId = article.articleId || article.id;

  const shareCard = async (format = 'story') => {
    setGenerating(true);
    setShowFormats(false);
    try {
      const cardUrl = `/api/card/${encodeURIComponent(articleId)}?format=${format}`;
      const res = await fetch(cardUrl);
      if (!res.ok) throw new Error('Card generation failed');
      const blob = await res.blob();

      // Try native share (mobile + Capacitor)
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `pulsenews-${format}.png`, { type: 'image/png' });
        const shareData = {
          title: article.title,
          text: article.description || article.title,
          files: [file],
        };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }

      // Fallback: download the image
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pulsenews-${format}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share card error:', err);
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowFormats(!showFormats)}
        disabled={generating}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[var(--border)] text-[var(--text-secondary)] rounded-full hover:text-[#e05d44] dark:hover:text-[#e87461] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30 transition-all disabled:opacity-50"
        title="Share as image card"
      >
        {generating ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
            <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
          </svg>
        ) : (
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="m9 15 3-3 3 3" />
            <path d="M12 12v6" />
            <path d="M3 9h18" />
          </svg>
        )}
        Share Card
      </button>

      {/* Format picker dropdown */}
      {showFormats && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowFormats(false)} />
          <div className="absolute left-0 top-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg z-20 min-w-[180px] p-1.5 animate-fade-in">
            {[
              { format: 'story', label: 'Story (9:16)', desc: 'Instagram, WhatsApp' },
              { format: 'square', label: 'Square (1:1)', desc: 'Instagram post' },
              { format: 'wide', label: 'Wide (1.9:1)', desc: 'Twitter, LinkedIn' },
            ].map(({ format, label, desc }) => (
              <button
                key={format}
                onClick={() => shareCard(format)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[var(--bg)] transition-colors"
              >
                <p className="text-sm font-medium text-[var(--text)]">{label}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{desc}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
