import { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import NewsCard from '../components/NewsCard';
import Loader from '../components/Loader';

const SUGGESTED_FEEDS = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { name: 'Reuters', url: 'https://feeds.reuters.com/reuters/topNews' },
];

async function fetchFeed(feedUrl) {
  // Use a CORS proxy (allorigins) for client-side RSS fetching
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error('Failed to fetch feed');
  const text = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');

  const items = [];
  // RSS 2.0
  doc.querySelectorAll('item').forEach((item) => {
    items.push({
      id: item.querySelector('link')?.textContent || Math.random().toString(),
      title: item.querySelector('title')?.textContent || '',
      description: item.querySelector('description')?.textContent || '',
      url: item.querySelector('link')?.textContent || '',
      date: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
      image: item.querySelector('enclosure')?.getAttribute('url') ||
             item.querySelector('media\\:content, content')?.getAttribute('url') || '',
      author: item.querySelector('dc\\:creator, creator, author')?.textContent || '',
      section: 'custom',
      sectionId: 'custom',
      isExternal: true,
    });
  });
  // Atom
  if (items.length === 0) {
    doc.querySelectorAll('entry').forEach((entry) => {
      items.push({
        id: entry.querySelector('id')?.textContent || Math.random().toString(),
        title: entry.querySelector('title')?.textContent || '',
        description: entry.querySelector('summary, content')?.textContent || '',
        url: entry.querySelector('link')?.getAttribute('href') || '',
        date: entry.querySelector('published, updated')?.textContent || new Date().toISOString(),
        image: '',
        author: entry.querySelector('author name')?.textContent || '',
        section: 'custom',
        sectionId: 'custom',
        isExternal: true,
      });
    });
  }
  return items;
}

export default function CustomFeeds() {
  const [feeds, setFeeds] = useLocalStorage('pulsenews-custom-feeds', []);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addFeed = (name, url) => {
    if (!url.trim()) return;
    if (feeds.some((f) => f.url === url)) return;
    setFeeds((prev) => [...prev, { name: name || url, url }]);
    setNewUrl('');
    setNewName('');
  };

  const removeFeed = (url) => {
    setFeeds((prev) => prev.filter((f) => f.url !== url));
  };

  useEffect(() => {
    if (feeds.length === 0) {
      setArticles([]);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all(feeds.map((f) => fetchFeed(f.url).then((items) => items.map((i) => ({ ...i, source: f.name }))).catch(() => [])))
      .then((results) => {
        const all = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date));
        setArticles(all);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [feeds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-normal text-[var(--text)]">Custom Feeds</h1>
        <p className="text-[var(--text-muted)] mt-1 text-sm">Add your own RSS sources</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Add feed form */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Add RSS Feed</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Feed name (optional)"
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#e05d44] dark:focus:border-[#e87461]"
              />
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/feed.xml"
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#e05d44] dark:focus:border-[#e87461]"
              />
              <button
                onClick={() => addFeed(newName, newUrl)}
                disabled={!newUrl.trim()}
                className="w-full py-2 text-sm font-medium bg-[#e05d44] dark:bg-[#e87461] text-white rounded-lg hover:bg-[#c94e38] transition-colors disabled:opacity-40"
              >
                Add Feed
              </button>
            </div>
          </div>

          {/* Suggested feeds */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Suggested</h3>
            <div className="space-y-2">
              {SUGGESTED_FEEDS.filter((s) => !feeds.some((f) => f.url === s.url)).map((s) => (
                <button
                  key={s.url}
                  onClick={() => addFeed(s.name, s.url)}
                  className="w-full text-left p-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text)] transition-colors"
                >
                  + {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active feeds */}
          {feeds.length > 0 && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Active Feeds ({feeds.length})</h3>
              <div className="space-y-2">
                {feeds.map((f) => (
                  <div key={f.url} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg)]">
                    <span className="text-sm text-[var(--text)] truncate flex-1">{f.name}</span>
                    <button onClick={() => removeFeed(f.url)} className="text-[var(--text-muted)] hover:text-red-500 ml-2 shrink-0">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Feed articles */}
        <div className="lg:col-span-2">
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {feeds.length === 0 ? (
            <div className="text-center py-20">
              <svg className="mx-auto w-16 h-16 text-[var(--border)] mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 19.5v-.75a7.5 7.5 0 00-7.5-7.5H4.5m0-6.75h.75c7.87 0 14.25 6.38 14.25 14.25v.75M6 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <p className="text-[var(--text-secondary)]">Add RSS feeds to see articles here</p>
            </div>
          ) : loading ? (
            <Loader count={6} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {articles.slice(0, 20).map((article, i) => (
                <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                  <NewsCard article={article} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
