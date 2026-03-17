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
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" fill="%23f0ece7"><rect width="400" height="240"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ccc5bc" font-family="sans-serif" font-size="14">No Image</text></svg>'
);

const SOURCE_COLORS = {
  'BBC': 'bg-red-50 text-red-600',
  'Al Jazeera': 'bg-amber-50 text-amber-700',
  'NPR': 'bg-blue-50 text-blue-600',
  'ABC News': 'bg-yellow-50 text-yellow-700',
  'Ars Technica': 'bg-orange-50 text-orange-600',
  'Guardian': 'bg-sky-50 text-sky-600',
};

function getSourceColor(source) {
  for (const [key, val] of Object.entries(SOURCE_COLORS)) {
    if (source?.includes(key)) return val;
  }
  return 'bg-[#fef0ed] text-[#e05d44]';
}

function Wrapper({ article, children }) {
  if (article.isExternal) {
    return (
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="block no-underline group">
        {children}
      </a>
    );
  }
  return (
    <Link to={`/article/${encodeURIComponent(article.id)}`} className="block no-underline group">
      {children}
    </Link>
  );
}

export default function NewsCard({ article, featured = false }) {
  const sourceBadgeColor = article.source ? getSourceColor(article.source) : getSourceColor(article.author);

  if (featured) {
    return (
      <Wrapper article={article}>
        <div className="relative rounded-2xl overflow-hidden card-hover border border-[#e8e4df] bg-white shadow-sm">
          <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
            <img
              src={article.image || PLACEHOLDER}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
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
              {article.isExternal && (
                <span className="text-white/60 text-[10px]">&#8599;</span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal text-white mb-2 leading-tight">
              {article.title}
            </h2>
            <p className="text-white/90 text-sm md:text-base line-clamp-2 mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: article.description }} />
            <div className="flex items-center gap-3 text-xs text-white/60">
              <span>{article.author}</span>
              <span>&middot;</span>
              <span>{timeAgo(article.date)}</span>
            </div>
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper article={article}>
      <div className="rounded-2xl overflow-hidden card-hover border border-[#e8e4df] bg-white h-full flex flex-col shadow-md hover:shadow-xl">
        <div className="aspect-[3/2] overflow-hidden">
          <img
            src={article.image || PLACEHOLDER}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-[#fef0ed] text-[#e05d44] rounded-full capitalize">
              {article.sectionId || article.section}
            </span>
            {article.source && (
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${sourceBadgeColor}`}>
                {article.source}{article.isExternal ? ' ↗' : ''}
              </span>
            )}
          </div>
          <h3 className="text-lg font-normal text-[#1a1a1a] mb-2 line-clamp-2 group-hover:text-[#e05d44] transition-colors leading-snug" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            {article.title}
          </h3>
          <p className="text-[13px] text-[#4a4a4a] line-clamp-2 leading-relaxed flex-1" dangerouslySetInnerHTML={{ __html: article.description }} />
          <div className="mt-auto pt-4 flex items-center justify-between text-xs text-[#6b6b6b] border-t border-[#f0ece7]">
            <span className="truncate max-w-[60%]">{article.author}</span>
            <span className="text-[#9a9a9a] shrink-0">{timeAgo(article.date)}</span>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
