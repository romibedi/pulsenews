import { useState, useEffect } from 'react';
import NewsCard from './NewsCard';

export default function RelatedArticles({ article }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!article?.id) return;
    setLoading(true);

    const params = new URLSearchParams();
    if (article.title) params.set('title', article.title);
    if (article.description) params.set('description', (article.description || '').slice(0, 500));
    if (article.sectionId || article.category) params.set('category', article.sectionId || article.category);
    params.set('size', '4');

    fetch(`/api/related/${encodeURIComponent(article.id)}?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setRelated((data.articles || []).slice(0, 4));
      })
      .catch(() => setRelated([]))
      .finally(() => setLoading(false));
  }, [article?.id]);

  if (loading) {
    return (
      <div className="mt-10 pt-6 border-t border-[#e8e4df] dark:border-[#2e2e2e]">
        <h3 className="text-xl text-[#1a1a1a] dark:text-[#e8e4df] mb-5" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
          Related Stories
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-[#e8e4df] dark:border-[#2e2e2e] bg-white dark:bg-[#1e1e1e]">
              <div className="aspect-[3/2] shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-16 shimmer rounded" />
                <div className="h-4 w-full shimmer rounded" />
                <div className="h-4 w-3/4 shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (related.length === 0) return null;

  return (
    <div className="mt-10 pt-6 border-t border-[#e8e4df] dark:border-[#2e2e2e]">
      <h3 className="text-xl text-[#1a1a1a] dark:text-[#e8e4df] mb-5" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
        Related Stories
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {related.map((a, i) => (
          <div key={a.id} className="animate-fade-in h-full" style={{ animationDelay: `${i * 80}ms` }}>
            <NewsCard article={a} />
          </div>
        ))}
      </div>
    </div>
  );
}
