import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchByCategory } from '../api/newsApi';
import { useBookmarks } from '../contexts/BookmarkContext';
import { estimateReadingTime } from '../utils/readingTime';
import ShareButtons from '../components/ShareButtons';
import ShareCardButton from '../components/ShareCardButton';
import RelatedArticles from '../components/RelatedArticles';
import StoryThread from '../components/StoryThread';
import AISummary from '../components/AISummary';
import TextToSpeech from '../components/TextToSpeech';
import Reactions from '../components/Reactions';
import useAudio from '../contexts/AudioContext';

const SITE_URL = 'https://pulsenewstoday.com';

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect width="800" height="400" fill="#f0ece7"/><text x="400" y="200" dominant-baseline="middle" text-anchor="middle" fill="#ccc5bc" font-family="sans-serif" font-size="16">No Image</text></svg>'
);

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

function handleImgError(e) {
  e.target.onerror = null;
  e.target.src = PLACEHOLDER;
}

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&ldquo;/g, '\u201C').replace(/&rdquo;/g, '\u201D')
    .replace(/&lsquo;/g, '\u2018').replace(/&rsquo;/g, '\u2019')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&mdash;/g, '\u2014').replace(/&ndash;/g, '\u2013')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, ' ');
}

function splitIntoParagraphs(text) {
  if (!text) return [];
  const decoded = decodeEntities(text);
  // First try splitting on existing newlines
  const byNewlines = decoded.split(/\n\n+/).map((p) => p.trim()).filter((p) => p.length > 20);
  if (byNewlines.length > 1) return byNewlines;
  // No newlines — split into ~3-sentence paragraphs
  const sentences = decoded.split(/(?<=[.!?])\s+(?=[A-Z\u0080-\uffff])/);
  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 3) {
    const chunk = sentences.slice(i, i + 3).join(' ').trim();
    if (chunk.length > 20) paragraphs.push(chunk);
  }
  return paragraphs.length > 0 ? paragraphs : [decoded];
}

export default function Article() {
  const { '*': articleId, slug } = useParams();
  const location = useLocation();
  const rssArticle = location.state?.article || null;

  const [article, setArticle] = useState(rssArticle);
  const [loading, setLoading] = useState(!rssArticle);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState(null);
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const { playArticle, prefetchArticle, playing, paused, currentArticle, pause, resume, autoplay } = useAudio();
  const isListening = (playing || paused) && currentArticle?.id === article?.id;

  const lookupKey = slug || articleId;

  // Auto-start TTS when article loads (if autoplay is enabled)
  const autoPlayedRef = useRef(false);
  useEffect(() => {
    if (article && !autoPlayedRef.current && !playing && autoplay) {
      autoPlayedRef.current = true;
      const timer = setTimeout(() => prefetchArticle(article), 300);
      const playTimer = setTimeout(() => playArticle(article), 800);
      return () => { clearTimeout(timer); clearTimeout(playTimer); };
    }
  }, [article?.id, autoplay]);

  useEffect(() => {
    let ignore = false;

    if (rssArticle) {
      setArticle(rssArticle);
      setLoading(false);
      window.scrollTo(0, 0);

      // Extract full content in background
      if (rssArticle.url) {
        setExtracting(true);
        fetch(`/api/extract?url=${encodeURIComponent(rssArticle.url)}`)
          .then((r) => r.json())
          .then((data) => {
            if (!ignore && data.text) {
              setArticle((prev) => ({
                ...prev,
                body: data.text,
                image: prev.image || data.image || null,
              }));
            }
          })
          .catch(() => {})
          .finally(() => { if (!ignore) setExtracting(false); });
      }
      return () => { ignore = true; };
    }

    async function load() {
      setLoading(true);
      try {
        let found = null;

        // Try DynamoDB first (fast — by slug or ID)
        if (slug) {
          const res = await fetch(`/api/article/slug/${encodeURIComponent(slug)}`);
          if (res.ok) found = await res.json();
        } else if (articleId) {
          const res = await fetch(`/api/article/${encodeURIComponent(articleId)}`);
          if (res.ok) found = await res.json();
        }

        // Fall back to searching RSS feeds
        if (!found && articleId) {
          const categories = ['world', 'technology', 'business', 'sport', 'science', 'culture', 'environment', 'politics'];
          for (const cat of categories) {
            const result = await fetchByCategory(cat);
            found = (result.articles || []).find((a) => a.id === articleId);
            if (found) break;
          }
        }

        if (!ignore) {
          if (found) setArticle(found);
          else setError('Article not found');
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    window.scrollTo(0, 0);
    return () => { ignore = true; };
  }, [lookupKey]);

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

  const isExternal = article.isExternal;
  const bodyText = article.body || '';
  const allParagraphs = splitIntoParagraphs(bodyText);
  const MAX_PREVIEW = isExternal ? 8 : allParagraphs.length;
  const paragraphs = allParagraphs.slice(0, MAX_PREVIEW);
  const hasMoreContent = isExternal && allParagraphs.length > MAX_PREVIEW;
  const saved = isBookmarked(article.id);
  const readTime = estimateReadingTime(bodyText || article.description);
  const shareUrl = isExternal ? article.url : `${window.location.origin}/article/${encodeURIComponent(article.id)}`;

  const canonicalUrl = article.slug
    ? `${SITE_URL}/news/${article.slug}`
    : `${SITE_URL}/article/${encodeURIComponent(article.id)}`;
  const metaDescription = (article.description || article.title || '').slice(0, 160);
  const metaImage = article.image || `${SITE_URL}/favicon.svg`;

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <Helmet>
        <title>{`${article.title} | PulseNewsToday`}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={metaImage} />
        <meta property="og:site_name" content="PulseNewsToday" />
        <meta property="article:published_time" content={article.date} />
        {article.author && <meta property="article:author" content={article.author} />}
        {article.section && <meta property="article:section" content={article.section} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={metaImage} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": article.title,
          "description": metaDescription,
          "image": article.image || undefined,
          "datePublished": article.date,
          "dateModified": article.date,
          "author": {
            "@type": "Person",
            "name": article.author || "PulseNewsToday"
          },
          "publisher": {
            "@type": "Organization",
            "name": "PulseNewsToday",
            "url": SITE_URL,
            "logo": {
              "@type": "ImageObject",
              "url": `${SITE_URL}/favicon.svg`
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          }
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": SITE_URL
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": article.section || "News",
              "item": `${SITE_URL}/category/${article.sectionId || 'world'}`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": article.title
            }
          ]
        })}</script>
      </Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6">
        <Link to="/" className="hover:text-[#e05d44] dark:hover:text-[#e87461] no-underline transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/category/${article.sectionId}`} className="hover:text-[#e05d44] dark:hover:text-[#e87461] no-underline transition-colors capitalize">
          {article.section}
        </Link>
      </div>

      {/* Source badge + tag + reading time */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="inline-block px-3 py-1 text-xs font-semibold bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] rounded-full capitalize">
          {article.section}
        </span>
        {isExternal && article.source && (
          <span className="inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full">
            via {article.source}
          </span>
        )}
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
          {isExternal && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs border border-[#e05d44]/30 dark:border-[#e87461]/30 text-[#e05d44] dark:text-[#e87461] px-3 py-1 rounded-full hover:bg-[#fef0ed] dark:hover:bg-[#e87461]/10 transition-all no-underline"
            >
              Read full article &#x2197;
            </a>
          )}
          {!isExternal && (
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#e05d44] dark:text-[#e87461] hover:text-[#c94e38] no-underline text-xs border border-[#e05d44]/30 dark:border-[#e87461]/30 px-3 py-1 rounded-full hover:bg-[#fef0ed] dark:hover:bg-[#e87461]/10 transition-all"
            >
              Read on Guardian &#x2197;
            </a>
          )}
        </div>
      </div>

      {/* Share + Listen */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <ShareButtons url={shareUrl} title={article.title} />
        <ShareCardButton article={article} />
        <div className="border-l border-[var(--border)] pl-4 flex items-center gap-2">
          <button
            onMouseEnter={() => !isListening && article && prefetchArticle(article)}
            onTouchStart={() => !isListening && article && prefetchArticle(article)}
            onClick={() => {
              if (playing && isListening) pause();
              else if (paused && isListening) resume();
              else playArticle(article);
            }}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all ${
              isListening
                ? 'bg-[#e05d44] dark:bg-[#e87461] text-white border-transparent'
                : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30'
            }`}
          >
            {playing && isListening ? (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
            {playing && isListening ? 'Listening...' : paused && isListening ? 'Paused' : 'Listen'}
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="rounded-xl overflow-hidden mb-8">
        <img
          src={article.image || PLACEHOLDER}
          alt={article.title}
          className="w-full h-auto"
          onError={handleImgError}
        />
      </div>

      {/* AI Summary */}
      <div className="mb-6">
        <AISummary title={article.title} body={bodyText || article.description || ''} />
      </div>

      {/* Description / lead */}
      {article.description && (
        <div className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8 pl-4 border-l-2 border-[#e05d44] dark:border-[#e87461]">
          {decodeEntities(article.description)}
        </div>
      )}

      {/* Body */}
      {extracting && paragraphs.length === 0 && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
              <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
            Loading full article...
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 shimmer rounded" style={{ width: `${80 + Math.random() * 20}%` }} />
          ))}
        </div>
      )}
      {paragraphs.length > 0 && (
        <div className="relative">
          <div className="prose-custom space-y-5">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-[var(--text-secondary)] leading-relaxed text-[15px]">
                {p}
              </p>
            ))}
          </div>
          {hasMoreContent && (
            <div className="relative -mt-20 pt-24 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/90 to-transparent" />
          )}
        </div>
      )}

      {/* CTA for external articles */}
      {isExternal && (
        <div className={`${hasMoreContent ? '' : 'mt-8'} p-6 bg-gradient-to-r from-[#fef0ed] to-[#fff8f6] dark:from-[#e87461]/10 dark:to-[#e87461]/5 rounded-xl border border-[#e05d44]/10 dark:border-[#e87461]/20 text-center`}>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            {hasMoreContent
              ? <>Continue reading this article on <strong>{article.source}</strong></>
              : <>This article is provided by <strong>{article.source}</strong>. Read the full story on their site.</>
            }
          </p>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#e05d44] dark:bg-[#e87461] text-white rounded-full text-sm font-medium hover:bg-[#c94e38] transition-colors no-underline"
          >
            {hasMoreContent ? 'Continue reading' : 'Read full article'} on {article.source}
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        </div>
      )}

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

      {/* Reactions */}
      <div className="mt-10 pt-6 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">What do you think?</p>
        <Reactions articleId={article.id} />
      </div>

      {/* Share at bottom */}
      <div className="mt-6 pt-6 border-t border-[var(--border)]">
        <ShareButtons url={shareUrl} title={article.title} />
      </div>

      {/* Story thread — follow the ongoing story */}
      <StoryThread articleId={article.articleId || article.id} title={article.title} category={article.sectionId || article.category} />

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
