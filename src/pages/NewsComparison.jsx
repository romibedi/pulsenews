import { useState, useEffect } from 'react';
import { fetchByCategory } from '../api/newsApi';
import { fetchRssCategory } from '../api/rssApi';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Simple similarity check between two titles
function similarity(a, b) {
  const wordsA = new Set(a.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter((w) => w.length > 3));
  const wordsB = new Set(b.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter((w) => w.length > 3));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let overlap = 0;
  for (const w of wordsA) if (wordsB.has(w)) overlap++;
  return overlap / Math.min(wordsA.size, wordsB.size);
}

function findStoryGroups(articles) {
  const groups = [];
  const used = new Set();

  for (let i = 0; i < articles.length; i++) {
    if (used.has(i)) continue;
    const group = [articles[i]];
    used.add(i);

    for (let j = i + 1; j < articles.length; j++) {
      if (used.has(j)) continue;
      if (similarity(articles[i].title, articles[j].title) > 0.35) {
        group.push(articles[j]);
        used.add(j);
      }
    }

    if (group.length > 1) {
      // Only keep groups with multiple sources
      const sources = new Set(group.map((a) => a.source || 'The Guardian'));
      if (sources.size > 1) groups.push(group);
    }
  }

  return groups.sort((a, b) => b.length - a.length);
}

const SOURCE_COLORS = {
  'The Guardian': 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-500/20',
  'BBC': 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20',
  'Al Jazeera': 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  'NPR': 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  'ABC News': 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20',
  'Ars Technica': 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
};

function getColor(source) {
  for (const [key, val] of Object.entries(SOURCE_COLORS)) {
    if (source?.includes(key)) return val;
  }
  return 'bg-[var(--bg)] text-[var(--text-secondary)] border-[var(--border)]';
}

export default function NewsComparison() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const categories = ['world', 'technology', 'business'];
        const allArticles = [];

        for (const cat of categories) {
          const [guardian, rss] = await Promise.all([
            fetchByCategory(cat, 1),
            fetchRssCategory(cat),
          ]);
          const gArticles = guardian.articles.map((a) => ({ ...a, source: a.source || 'The Guardian' }));
          allArticles.push(...gArticles, ...rss);
        }

        const found = findStoryGroups(allArticles);
        setGroups(found);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-normal text-[var(--text)]">News Comparison</h1>
        <p className="text-[var(--text-muted)] mt-1 text-sm">See how different sources cover the same story</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 shimmer rounded-2xl" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[var(--text-secondary)] text-lg mb-2">No overlapping stories found right now</p>
          <p className="text-[var(--text-muted)] text-sm">Check back later — stories often get picked up by multiple sources within hours.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group, gi) => (
            <div key={gi} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm animate-fade-in" style={{ animationDelay: `${gi * 100}ms` }}>
              {/* Story header */}
              <div className="p-5 border-b border-[var(--border)]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    {group.length} sources
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] rounded-full capitalize">
                    {group[0].sectionId || group[0].section || 'news'}
                  </span>
                </div>
                <h2 className="text-xl font-normal text-[var(--text)]" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                  {group[0].title}
                </h2>
              </div>

              {/* Source cards */}
              <div className="divide-y divide-[var(--border)]">
                {group.map((article) => {
                  const color = getColor(article.source);
                  return (
                    <a
                      key={article.id}
                      href={article.isExternal ? article.url : `/article/${encodeURIComponent(article.id)}`}
                      target={article.isExternal ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 p-4 hover:bg-[var(--bg)] transition-colors no-underline group"
                    >
                      {article.image && (
                        <img src={article.image} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${color}`}>
                            {article.source || 'The Guardian'}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">{timeAgo(article.date)}</span>
                        </div>
                        <p className="text-sm text-[var(--text)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors line-clamp-2">
                          {article.title}
                        </p>
                        {article.description && (
                          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1" dangerouslySetInnerHTML={{ __html: article.description }} />
                        )}
                      </div>
                      <svg className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
