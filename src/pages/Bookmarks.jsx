import { Link } from 'react-router-dom';
import { useBookmarks } from '../contexts/BookmarkContext';
import NewsCard from '../components/NewsCard';

export default function Bookmarks() {
  const { bookmarks, clearAll } = useBookmarks();

  if (bookmarks.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-fade-in">
        <svg className="mx-auto w-16 h-16 text-[#e8e4df] dark:text-[#2e2e2e] mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
        </svg>
        <h1 className="text-2xl font-normal text-[#1a1a1a] dark:text-[#e8e4df] mb-2" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
          No saved articles yet
        </h1>
        <p className="text-[#9a9a9a] dark:text-[#6b6b6b] mb-6">Bookmark articles to read them later</p>
        <Link to="/" className="text-[#e05d44] dark:text-[#e87461] no-underline hover:underline">
          Browse headlines &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-normal text-[#1a1a1a] dark:text-[#e8e4df]">Bookmarks</h1>
          <p className="text-[#9a9a9a] dark:text-[#6b6b6b] mt-1 text-sm">{bookmarks.length} saved article{bookmarks.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={clearAll}
          className="text-xs text-[#9a9a9a] dark:text-[#6b6b6b] hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg border border-[#e8e4df] dark:border-[#2e2e2e] hover:border-red-300 dark:hover:border-red-500/30"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {bookmarks.map((article, i) => (
          <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${i * 60}ms` }}>
            <NewsCard article={article} />
          </div>
        ))}
      </div>
    </div>
  );
}
