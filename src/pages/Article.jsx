import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchArticle } from '../api/newsApi';

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
        <p className="text-red-400 mb-4">{error || 'Article not found'}</p>
        <Link to="/" className="text-indigo-400 hover:text-indigo-300 no-underline">
          &larr; Back to home
        </Link>
      </div>
    );
  }

  // Split body into paragraphs
  const paragraphs = article.body
    ? article.body.split(/\n+/).filter((p) => p.trim().length > 20)
    : [];

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
        <Link to="/" className="hover:text-indigo-400 no-underline transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/category/${article.sectionId}`} className="hover:text-indigo-400 no-underline transition-colors capitalize">
          {article.section}
        </Link>
      </div>

      {/* Tag */}
      <span className="inline-block px-3 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-400 rounded-full capitalize mb-4">
        {article.section}
      </span>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
        {article.title}
      </h1>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 mb-8 pb-6 border-b border-zinc-800">
        <span className="text-zinc-300 font-medium">{article.author}</span>
        <span>&middot;</span>
        <span>{formatDate(article.date)}</span>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-indigo-400 hover:text-indigo-300 no-underline text-xs border border-indigo-500/30 px-3 py-1 rounded-full hover:bg-indigo-500/10 transition-all"
        >
          Read on Guardian &nearr;
        </a>
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
        <div className="text-lg text-zinc-300 leading-relaxed mb-8 pl-4 border-l-2 border-indigo-500" dangerouslySetInnerHTML={{ __html: article.description }} />
      )}

      {/* Body */}
      <div className="prose-custom space-y-5">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-zinc-400 leading-relaxed text-[15px]">
            {p}
          </p>
        ))}
      </div>

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="mt-10 pt-6 border-t border-zinc-800">
          <p className="text-xs text-zinc-600 uppercase tracking-wider mb-3">Related Topics</p>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs text-zinc-400 bg-zinc-800 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Back */}
      <div className="mt-10 pt-6 border-t border-zinc-800">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 no-underline transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Headlines
        </Link>
      </div>
    </article>
  );
}
