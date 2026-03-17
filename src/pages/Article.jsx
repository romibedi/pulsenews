import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchArticle } from '../api/newsApi';
import { useBookmarks } from '../contexts/BookmarkContext';
import { estimateReadingTime } from '../utils/readingTime';
import ShareButtons from '../components/ShareButtons';
import RelatedArticles from '../components/RelatedArticles';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Article() {
  const { '*': articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchArticle(articleId);
        setArticle(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
    window.scrollTo(0, 0);
  }, [articleId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-4">
          <div className="h-4 w-24 shimmer rounded" />
          <div className="h-10 w-full shimmer rounded" />
          <div className="h-10 w-3/4 shimmer rounded" />
          <div className="h-4 w-48 shimmer rounded" />
          <div className="aspect-[16/9] shimmer rounded-xl mt-6" />
          <div className="space-y-3 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 shimmer rounded" style={{ width: `${85 + Math.random() * 15}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-red-500 mb-4">{error || 'Article not found'}</p>
        <Link to="/" className="text-[#e05d44] dark:text-[#e87461] hover:text-[#c94e38] no-underline">
          &larr; Back to home
        </Link>
      </div>
    );
  }

  const paragraphs = article.body
    ? article.body.split(/\n+/).filter((p) => p.trim().length > 20)
    : [];

  const saved = isBookmarked(article.id);
  const readTime = estimateReadingTime(article.body || article.description);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6">
        <Link to="/" className="hover:text-[#e05d44] dark:hover:text-[#e87461] no-underline transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/category/${article.sectionId}`} className="hover:text-[#e05d44] dark:hover:text-[#e87461] no-underline transition-colors capitalize">
          {article.section}
        </Link>
      </div>

      {/* Tag + reading time */}
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] rounded-full capitalize">
          {article.section}
        </span>
        <span className="text-xs text-[var(--text-muted)]">{readTime} min read</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-normal text-[var(--text)] leading-tight mb-4">
        {article.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)] mb-4 pb-4 border-b border-[var(--border)]">
        <span className="text-[var(--text)] font-medium">{article.author}</span>
        <span>&middot;</span>
        <span>{formatDate(article.date)}</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => saved ? removeBookmark(article.id) : addBookmark(article)}
            className={`inline-flex items-center gap-1 text-xs border px-3 py-1 rounded-full transition-all no-underline ${
              saved
                ? 'border-[#e05d44]/30 dark:border-[#e87461]/30 text-[#e05d44] dark:text-[#e87461] bg-[#fef0ed] dark:bg-[#e87461]/10'
                : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] hover:border-[#e05d44]/30'
            }`}
          >
            <svg width="14" height="14" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
            {saved ? 'Saved' : 'Save'}
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e05d44] dark:text-[#e87461] hover:text-[#c94e38] no-underline text-xs border border-[#e05d44]/30 dark:border-[#e87461]/30 px-3 py-1 rounded-full hover:bg-[#fef0ed] dark:hover:bg-[#e87461]/10 transition-all"
          >
            Read on Guardian &nearr;
          </a>
        </div>
      </div>

      {/* Share */}
      <div className="mb-6">
        <ShareButtons url={article.url} title={article.title} />
      </div>

      {/* Image */}
      {article.image && (
        <div className="rounded-xl overflow-hidden mb-8">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-auto"
          />
        </div>
      )}

      {/* Description */}
      {article.description && (
        <div className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8 pl-4 border-l-2 border-[#e05d44] dark:border-[#e87461]" dangerouslySetInnerHTML={{ __html: article.description }} />
      )}

      {/* Body */}
      <div className="prose-custom space-y-5">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-[var(--text-secondary)] leading-relaxed text-[15px]">
            {p}
          </p>
        ))}
      </div>

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="mt-10 pt-6 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Related Topics</p>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs text-[var(--text-secondary)] bg-[var(--bg)] rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Share at bottom */}
      <div className="mt-10 pt-6 border-t border-[var(--border)]">
        <ShareButtons url={article.url} title={article.title} />
      </div>

      {/* Related articles */}
      {article.sectionId && <RelatedArticles article={article} />}

      {/* Back */}
      <div className="mt-10 pt-6 border-t border-[var(--border)]">
        <Link to="/" className="inline-flex items-center gap-2 text-[#e05d44] dark:text-[#e87461] hover:text-[#c94e38] no-underline transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Headlines
        </Link>
      </div>
    </article>
  );
}
