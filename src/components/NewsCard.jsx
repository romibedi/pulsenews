import { Link } from 'react-router-dom';

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
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" fill="%231e1e24"><rect width="400" height="240"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%233f3f46" font-family="sans-serif" font-size="14">No Image</text></svg>'
);

export default function NewsCard({ article, featured = false }) {
  const articlePath = `/article/${encodeURIComponent(article.id)}`;

  if (featured) {
    return (
      <Link to={articlePath} className="block no-underline group">
        <div className="relative rounded-2xl overflow-hidden card-hover border border-zinc-800 bg-zinc-900/50">
          <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
            <img
              src={article.image || PLACEHOLDER}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-indigo-500/90 text-white rounded-full mb-3 capitalize">
              {article.section}
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">
              {article.title}
            </h2>
            <p className="text-zinc-300 text-sm md:text-base line-clamp-2 mb-3" dangerouslySetInnerHTML={{ __html: article.description }} />
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span>{article.author}</span>
              <span>&middot;</span>
              <span>{timeAgo(article.date)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={articlePath} className="block no-underline group">
      <div className="rounded-xl overflow-hidden card-hover border border-zinc-800 bg-zinc-900/50 h-full flex flex-col">
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={article.image || PLACEHOLDER}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 rounded-full capitalize">
              {article.section}
            </span>
            <span className="text-[11px] text-zinc-500">{timeAgo(article.date)}</span>
          </div>
          <h3 className="text-base font-semibold text-zinc-100 mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
            {article.title}
          </h3>
          <p className="text-sm text-zinc-500 line-clamp-2 flex-1" dangerouslySetInnerHTML={{ __html: article.description }} />
          <div className="mt-3 text-xs text-zinc-600">
            {article.author}
          </div>
        </div>
      </div>
    </Link>
  );
}
