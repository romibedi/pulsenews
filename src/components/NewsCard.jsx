import { Link } from 'react-router-dom';
import { useBookmarks } from '../contexts/BookmarkContext';
import useAudio from '../contexts/AudioContext';
import useLanguage from '../hooks/useLanguage';
import { estimateReadingTime } from '../utils/readingTime';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="267" viewBox="0 0 400 267"><rect width="400" height="267" fill="#f0ece7"/><text x="200" y="134" dominant-baseline="middle" text-anchor="middle" fill="#ccc5bc" font-family="sans-serif" font-size="14">No Image</text></svg>'
);

function handleImgError(e) {
  e.target.onerror = null;
  e.target.src = PLACEHOLDER;
}

const SOURCE_COLORS = {
  'BBC': 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  'Al Jazeera': 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  'NPR': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'ABC News': 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  'Ars Technica': 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'Guardian': 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400',
};

function getSourceColor(source) {
  for (const [key, val] of Object.entries(SOURCE_COLORS)) {
    if (source?.includes(key)) return val;
  }
  return 'bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461]';
}

function BookmarkBtn({ article }) {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const saved = isBookmarked(article.id);

  const toggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    saved ? removeBookmark(article.id) : addBookmark(article);
  };

  return (
    <button
      onClick={toggle}
      className={`shrink-0 p-1 rounded-full transition-colors ${
        saved
          ? 'text-[#e05d44] dark:text-[#e87461]'
          : 'text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461]'
      }`}
      title={saved ? 'Remove bookmark' : 'Bookmark'}
    >
      <svg width="16" height="16" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
      </svg>
    </button>
  );
}

function PlayBtn({ article }) {
  const { playArticle, addToQueue, currentArticle, playing, loading } = useAudio();
  const { lang } = useLanguage();
  const isPlaying = (playing || loading) && currentArticle?.id === article.id;

  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    playArticle(article, lang);
  };

  const handleQueue = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToQueue(article);
  };

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={handlePlay}
        className={`p-1 rounded-full transition-colors ${
          isPlaying
            ? 'text-[#e05d44] dark:text-[#e87461] animate-pulse'
            : 'text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461]'
        }`}
        title={isPlaying ? 'Now playing' : 'Listen'}
      >
        {isPlaying ? (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>
      {!isPlaying && (
        <button
          onClick={handleQueue}
          className="p-1 rounded-full text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors opacity-0 group-hover:opacity-100"
          title="Add to queue"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      )}
    </div>
  );
}

function Wrapper({ article, children }) {
  return (
    <Link
      to={`/article/${encodeURIComponent(article.id)}`}
      state={article.isExternal ? { article } : undefined}
      className="block no-underline group h-full"
    >
      {children}
    </Link>
  );
}

export default function NewsCard({ article, featured = false }) {
  const sourceBadgeColor = article.source ? getSourceColor(article.source) : getSourceColor(article.author);
  const readTime = estimateReadingTime(article.body || article.description);

  if (featured) {
    return (
      <Wrapper article={article}>
        <div className="relative rounded-2xl overflow-hidden card-hover border border-[var(--border)] bg-[var(--surface)] shadow-md hover:shadow-xl">
          <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
            <img
              src={article.image || PLACEHOLDER}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={handleImgError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block px-3 py-1 text-xs font-semibold bg-[#e05d44] text-white rounded-full capitalize">
                {article.sectionId || article.section}
              </span>
              {article.source && (
                <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full ${sourceBadgeColor}`}>
                  {article.source}
                </span>
              )}
              <span className="text-white/60 text-[10px]">{readTime} min read</span>
              {article.isExternal && (
                <span className="text-white/60 text-[10px]">&#8599;</span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal text-white mb-2 leading-tight">
              {article.title}
            </h2>
            <p className="text-white/90 text-sm md:text-base line-clamp-2 mb-3 leading-relaxed">{article.description}</p>
            <div className="flex items-center gap-3 text-xs text-white/60">
              <span>{article.author}</span>
              <span>&middot;</span>
              <span>{timeAgo(article.date)}</span>
              <div className="ml-auto flex items-center gap-1">
                <PlayBtn article={article} />
                <BookmarkBtn article={article} />
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper article={article}>
      <div className="rounded-2xl overflow-hidden card-hover border border-[var(--border)] bg-[var(--surface)] h-full flex flex-col shadow-md hover:shadow-xl">
        <div className="aspect-[3/2] overflow-hidden">
          <img
            src={article.image || PLACEHOLDER}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={handleImgError}
          />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] rounded-full capitalize">
              {article.sectionId || article.section}
            </span>
            {article.source && (
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${sourceBadgeColor}`}>
                {article.source}
              </span>
            )}
            <span className="text-[10px] text-[var(--text-muted)]">{readTime} min read</span>
          </div>
          <h3 className="text-lg font-normal text-[var(--text)] mb-2 line-clamp-2 group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors leading-snug" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            {article.title}
          </h3>
          <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed flex-1">{article.description}</p>
          <div className="mt-auto pt-4 flex items-center justify-between text-xs text-[var(--text-secondary)] border-t border-[var(--border)]">
            <span className="truncate max-w-[50%]">{article.author}</span>
            <div className="flex items-center gap-1">
              <span className="text-[var(--text-muted)] shrink-0">{timeAgo(article.date)}</span>
              <PlayBtn article={article} />
              <BookmarkBtn article={article} />
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
