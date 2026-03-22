import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchByCity, fetchCities } from '../api/newsApi';
import useCity from '../hooks/useCity';
import useIsMobile from '../hooks/useIsMobile';
import useAudio from '../contexts/AudioContext';
import { LANGUAGES } from '../hooks/useLanguage';
import NewsCard from '../components/NewsCard';
import Loader, { HeroLoader } from '../components/Loader';
import QuickPoll from '../components/QuickPoll';
import { clusterArticles, extractSmartPullquote, pickTopStory, pickPhotoOfDay, extractStatistic, getDailyPoll, dailyShuffle, getTimeDivider, timeAgo, getArticleImage, getCitiesForRegion } from '../utils/articleHelpers';

const SITE_URL = 'https://pulsenewstoday.com';

export default function City() {
  const { city: cityKey } = useParams();
  const { city: currentCity, setCity } = useCity();
  const { playArticle, addToQueue } = useAudio();
  const isMobile = useIsMobile();
  const [articles, setArticles] = useState([]);
  const [cityLang, setCityLang] = useState(null);
  const [cityLangLabel, setCityLangLabel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cityMeta, setCityMeta] = useState(null);
  const [allCities, setAllCities] = useState([]);

  useEffect(() => {
    fetchCities().then((data) => {
      const cities = data.cities || [];
      setAllCities(cities);
      setCityMeta(cities.find((c) => c.key === cityKey) || null);
    });
  }, [cityKey]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setArticles([]);

    fetchByCity(cityKey)
      .then((data) => {
        if (!ignore) {
          setArticles(data.articles || []);
          setCityLang(data.cityLang || null);
          setCityLangLabel(data.cityLangLabel || null);
        }
      })
      .catch(() => {
        if (!ignore) setArticles([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, [cityKey]);

  const isCurrentCity = cityKey === currentCity;
  const label = cityMeta?.label || cityKey;
  const regionCities = allCities.filter((c) => c.region === cityMeta?.region);

  // Split articles by language
  const localLangArticles = cityLang ? articles.filter((a) => a.lang === cityLang) : [];
  const englishArticles = articles.filter((a) => !a.lang || a.lang === 'en');
  const hasLocalLang = cityLang && cityLang !== 'en' && localLangArticles.length > 0;
  const nativeLangLabel = LANGUAGES[cityLang]?.nativeLabel || cityLangLabel;

  // Use English articles for interleaving (they're the primary feed)
  const displayArticles = hasLocalLang ? englishArticles : articles;

  // Interleaving helpers
  const clusters = useMemo(() => clusterArticles(displayArticles), [displayArticles]);
  const clusteredIds = useMemo(() => new Set(clusters.flatMap((c) => c.articles.map((a) => a.id))), [clusters]);
  const smartPullquote = extractSmartPullquote(displayArticles);
  const topStory = pickTopStory(displayArticles);
  let photoOfDay = pickPhotoOfDay(displayArticles);
  if (photoOfDay && topStory && photoOfDay.id === topStory.id) photoOfDay = null;
  const stat = extractStatistic(displayArticles);
  const poll = getDailyPoll(cityKey);

  const excludeIds = new Set([
    ...(topStory ? [topStory.id] : []),
    ...(photoOfDay ? [photoOfDay.id] : []),
  ]);

  const sources = useMemo(() => {
    const seen = new Set();
    return displayArticles.filter((a) => {
      if (!a.source || seen.has(a.source)) return false;
      seen.add(a.source);
      return true;
    }).slice(0, 10).map((a) => a.source);
  }, [displayArticles]);

  const hero = displayArticles[0];
  const gridArticles = displayArticles.slice(1).filter((a) => !clusteredIds.has(a.id) && !excludeIds.has(a.id));

  // Nearby cities (same region, excluding current)
  const nearbyCities = regionCities.filter((c) => c.key !== cityKey).slice(0, 12);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <Helmet>
        <title>{label} News - PulseNewsToday</title>
        <meta name="description" content={`Latest local news from ${label} in ${cityLangLabel || 'English'} and English. Breaking stories, updates, and headlines.`} />
        <link rel="canonical" href={`${SITE_URL}/city/${cityKey}`} />
        <meta property="og:title" content={`${label} News - PulseNewsToday`} />
        <meta property="og:url" content={`${SITE_URL}/city/${cityKey}`} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
          Local News
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-normal text-[var(--text)]">
            {label}
          </h1>
          {isCurrentCity ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 rounded-full">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Your city
            </span>
          ) : (
            <button
              onClick={() => setCity(cityKey)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#e05d44] dark:bg-[#e87461] rounded-full hover:bg-[#c94e38] dark:hover:bg-[#d4634f] transition-colors"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              Set as my city
            </button>
          )}
        </div>
        <p className="text-[var(--text-muted)] mt-1 text-sm">
          Latest news from {label}
          {hasLocalLang && <> in {nativeLangLabel} &amp; English</>}
        </p>

        {/* City switcher — same region */}
        {regionCities.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {regionCities.map((c) => (
              <Link
                key={c.key}
                to={`/city/${c.key}`}
                className={`px-3 py-1.5 text-xs font-medium rounded-full no-underline transition-all ${
                  c.key === cityKey
                    ? 'bg-[#e05d44] dark:bg-[#e87461] text-white'
                    : 'bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] border border-[var(--border)] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30'
                }`}
              >
                {c.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {loading && articles.length === 0 && (
        <>
          <HeroLoader />
          <Loader count={8} />
        </>
      )}

      {!loading && articles.length === 0 && (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <p className="text-sm">No local news available yet. Articles will appear after the next ingestion run.</p>
        </div>
      )}

      {/* Local language section — shown first when available */}
      {hasLocalLang && (
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-2xl font-normal text-[var(--text)]">{nativeLangLabel}</h2>
            <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#e05d44] dark:text-[#e87461] bg-[#fef0ed] dark:bg-[#e87461]/10 rounded-full">
              {cityLangLabel}
            </span>
          </div>
          <div className={isMobile ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'}>
            {localLangArticles.slice(0, 9).map((article, i) => (
              <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${i * 60}ms` }}>
                <NewsCard article={article} compact={isMobile && i > 0} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Interleaved English / main section ──────────────────── */}
      {displayArticles.length > 0 && (
        <div className="space-y-10">

          {hasLocalLang && (
            <h2 className="text-2xl font-normal text-[var(--text)]">English</h2>
          )}

          {/* Hero */}
          {hero && (
            <div className="animate-fade-in">
              <NewsCard article={hero} featured />
            </div>
          )}

          {/* Audio briefing */}
          {displayArticles.length >= 3 && (
            <div className="bg-gradient-to-r from-[#fef0ed] to-[#fef8f6] dark:from-[#e87461]/10 dark:to-[#e87461]/5 rounded-2xl p-3 sm:p-5 flex items-center gap-3 sm:gap-4 border border-[#e05d44]/10 dark:border-[#e87461]/20">
              <button
                onClick={() => {
                  playArticle({
                    id: `briefing-${cityKey}-${Date.now()}`,
                    title: `${label} News Briefing`,
                    body: displayArticles.slice(0, 5).map((a) => a.title).join('. '),
                    source: 'PulseNewsToday',
                    date: new Date().toISOString(),
                  });
                }}
                className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#e05d44] dark:bg-[#e87461] text-white rounded-full flex items-center justify-center hover:bg-[#c94e38] transition-colors shadow-md"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#e05d44] dark:text-[#e87461]">{label} News Briefing</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 hidden sm:block">Listen to a 60-second audio summary of top stories</p>
              </div>
              <button
                onClick={() => {
                  playArticle({
                    id: `briefing-${cityKey}-${Date.now()}`,
                    title: `${label} News Briefing`,
                    body: displayArticles.slice(0, 3).map((a) => a.title).join('. '),
                    source: 'PulseNewsToday',
                    date: new Date().toISOString(),
                  });
                  displayArticles.slice(0, 5).forEach((a) => addToQueue(a));
                }}
                className="shrink-0 text-xs text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors whitespace-nowrap hidden sm:block"
              >
                + Queue all
              </button>
            </div>
          )}

          {/* ── Interleaved article grids + break sections ─────── */}
          {(() => {
            const contentBreaks = [];
            clusters.forEach((cluster) => {
              contentBreaks.push({ type: 'cluster', key: `cluster-${cluster.topic}`, cluster });
            });
            if (topStory) contentBreaks.push({ type: 'top-story', key: 'top-story' });
            if (smartPullquote) contentBreaks.push({ type: 'pullquote', key: 'pullquote' });
            if (stat) contentBreaks.push({ type: 'stat', key: 'stat' });
            if (photoOfDay) contentBreaks.push({ type: 'photo', key: 'photo' });
            contentBreaks.push({ type: 'poll', key: 'poll' });
            if (sources.length > 0) contentBreaks.push({ type: 'sources', key: 'sources' });

            const navBreaks = [
              ...(nearbyCities.length > 0 ? [{ type: 'nearby', key: 'nearby' }] : []),
              { type: 'explore', key: 'explore' },
            ];

            const shuffledContent = dailyShuffle(contentBreaks);
            const breaks = [];
            let navIdx = 0;
            shuffledContent.forEach((br, i) => {
              breaks.push(br);
              if ((i + 1) % 3 === 0 && navIdx < navBreaks.length) {
                breaks.push(navBreaks[navIdx++]);
              }
            });
            while (navIdx < navBreaks.length) breaks.push(navBreaks[navIdx++]);

            const CHUNK_SIZE = 3;
            const BREAK_INTERVAL = isMobile ? 1 : 2;
            const MID_FEATURE_INTERVAL = isMobile ? 3 : 4;
            const chunks = [];
            for (let i = 0; i < gridArticles.length; i += CHUNK_SIZE) {
              chunks.push(gridArticles.slice(i, i + CHUNK_SIZE));
            }

            const elements = [];
            let breakIdx = 0;

            chunks.forEach((chunk, ci) => {
              // Time divider
              if (ci > 0) {
                const prevChunk = chunks[ci - 1];
                const dividerLabel = getTimeDivider(prevChunk[prevChunk.length - 1]?.date, chunk[0]?.date);
                if (dividerLabel) {
                  elements.push(
                    <div key={`divider-${ci}`} className="flex items-center gap-3 -my-2">
                      <div className="flex-1 border-t border-[var(--border)]" />
                      <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">{dividerLabel}</span>
                      <div className="flex-1 border-t border-[var(--border)]" />
                    </div>
                  );
                }
              }

              // Mid-story wide feature
              if (ci > 0 && ci % MID_FEATURE_INTERVAL === 0 && chunk[0]) {
                const a = chunk[0];
                const rest = chunk.slice(1);
                elements.push(
                  <div key={`mid-${a.id}`} className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                      {a.image && <img src={a.image} alt="" className="w-full h-40 sm:h-56 md:h-full object-cover" loading="lazy" />}
                      <div className="p-4 sm:p-6 flex flex-col justify-center">
                        <span className="text-[10px] font-semibold text-[#e05d44] dark:text-[#e87461] uppercase tracking-wider mb-2">Featured</span>
                        <Link
                          to={a.slug ? `/news/${a.slug}` : `/article/${encodeURIComponent(a.id)}`}
                          className="text-lg sm:text-xl font-medium text-[var(--text)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline leading-snug"
                          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                        >{a.title}</Link>
                        <p className="text-sm text-[var(--text-muted)] mt-2 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                          {(a.description || '').replace(/<[^>]*>/g, '').slice(0, 250)}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-3">{a.source}{a.date ? ` · ${timeAgo(a.date)}` : ''}</p>
                      </div>
                    </div>
                  </div>
                );
                if (rest.length > 0) {
                  elements.push(
                    <div key={`chunk-rest-${ci}`} className={isMobile ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-5'}>
                      {rest.map((article) => (
                        <div key={article.id} className="animate-fade-in h-full">
                          <NewsCard article={article} compact={isMobile} />
                        </div>
                      ))}
                    </div>
                  );
                }
              } else if (isMobile) {
                elements.push(
                  <div key={`chunk-${ci}`} className="space-y-3">
                    {chunk.map((article, i) => (
                      <div key={article.id} className="animate-fade-in" style={ci === 0 ? { animationDelay: `${Math.min(i, 3) * 60}ms` } : undefined}>
                        <NewsCard article={article} compact={i > 0} />
                      </div>
                    ))}
                  </div>
                );
              } else {
                elements.push(
                  <div key={`chunk-${ci}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {chunk.map((article, i) => (
                      <div key={article.id} className="animate-fade-in h-full" style={ci === 0 ? { animationDelay: `${Math.min(i, 5) * 60}ms` } : undefined}>
                        <NewsCard article={article} />
                      </div>
                    ))}
                  </div>
                );
              }

              // Insert break
              if ((ci + 1) % BREAK_INTERVAL === 0 && breakIdx < breaks.length) {
                elements.push(renderBreak(breaks[breakIdx++]));
              }
            });

            while (breakIdx < breaks.length) {
              elements.push(renderBreak(breaks[breakIdx++]));
            }

            function renderBreak(br) {
              switch (br.type) {
                case 'cluster':
                  return (
                    <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e05d44] dark:bg-[#e87461]" />
                        <h3 className="text-xs sm:text-sm font-semibold text-[var(--text)] uppercase tracking-wider">Trending: {br.cluster.topic}</h3>
                        <span className="text-[10px] sm:text-xs text-[var(--text-muted)]">{br.cluster.articles.length} stories</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        {br.cluster.articles.map((article) => (
                          <Link key={article.id} to={article.slug ? `/news/${article.slug}` : `/article/${encodeURIComponent(article.id)}`} className="flex gap-3 p-2 rounded-lg hover:bg-[var(--bg)] transition-colors no-underline group">
                            {getArticleImage(article) && <img src={getArticleImage(article)} alt="" className="w-16 h-16 sm:w-14 sm:h-14 rounded-lg object-cover shrink-0" loading="lazy" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[var(--text)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors line-clamp-2 leading-snug font-medium">{article.title}</p>
                              <p className="text-[10px] text-[var(--text-muted)] mt-1">{article.source}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );

                case 'pullquote':
                  return smartPullquote ? (
                    <div key={br.key} className="relative py-3 sm:py-4">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div>
                      <div className="relative bg-[var(--bg)] mx-auto max-w-2xl px-4 sm:px-6 py-4 sm:py-5 rounded-xl border border-[var(--border)]">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-[#e05d44]/20 dark:text-[#e87461]/20 mb-2">
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                        </svg>
                        <p className="text-sm sm:text-base text-[var(--text)] leading-relaxed italic" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{smartPullquote.quote}</p>
                        <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-2">
                          — {smartPullquote.article.source || 'Source'}{smartPullquote.article.title ? `, "${smartPullquote.article.title.slice(0, 50)}${smartPullquote.article.title.length > 50 ? '...' : ''}"` : ''}
                        </p>
                      </div>
                    </div>
                  ) : null;

                case 'top-story':
                  return topStory ? (
                    <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
                        {topStory.image && <div className="md:col-span-2"><img src={topStory.image} alt="" className="w-full h-48 md:h-full object-cover" loading="lazy" /></div>}
                        <div className={`p-5 sm:p-6 flex flex-col justify-center ${topStory.image ? 'md:col-span-3' : 'md:col-span-5'}`}>
                          <span className="text-[10px] font-bold text-[#e05d44] dark:text-[#e87461] uppercase tracking-widest mb-2">Top Story</span>
                          <Link
                            to={topStory.slug ? `/news/${topStory.slug}` : `/article/${encodeURIComponent(topStory.id)}`}
                            className="text-xl sm:text-2xl font-medium text-[var(--text)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline leading-snug"
                            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                          >{topStory.title}</Link>
                          <p className="text-sm text-[var(--text-muted)] mt-3 line-clamp-3 leading-relaxed">
                            {(topStory.description || '').replace(/<[^>]*>/g, '').slice(0, 300)}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] mt-3">{topStory.source}{topStory.date ? ` \u00b7 ${timeAgo(topStory.date)}` : ''}</p>
                        </div>
                      </div>
                    </div>
                  ) : null;

                case 'stat':
                  return stat ? (
                    <Link key={br.key} to={stat.article.slug ? `/news/${stat.article.slug}` : `/article/${encodeURIComponent(stat.article.id)}`} className="block bg-gradient-to-br from-[var(--surface)] to-[var(--bg)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 no-underline group hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30 transition-colors">
                      <span className="text-[10px] font-semibold text-[#e05d44] dark:text-[#e87461] uppercase tracking-widest">By the Numbers</span>
                      <p className="text-2xl sm:text-3xl font-bold text-[var(--text)] mt-2 group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{stat.stat}</p>
                      <p className="text-sm text-[var(--text-muted)] mt-2 line-clamp-2 leading-relaxed">{stat.context}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-2">{stat.article.source}</p>
                    </Link>
                  ) : null;

                case 'photo':
                  return photoOfDay ? (
                    <Link key={br.key} to={photoOfDay.slug ? `/news/${photoOfDay.slug}` : `/article/${encodeURIComponent(photoOfDay.id)}`} className="block rounded-2xl overflow-hidden relative group no-underline">
                      <img src={photoOfDay.image} alt="" className="w-full h-56 sm:h-72 object-cover group-hover:scale-[1.02] transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                        <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Photo of the Day</span>
                        <p className="text-white text-base sm:text-lg font-medium mt-1 line-clamp-2 leading-snug" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>{photoOfDay.title}</p>
                        <p className="text-white/60 text-[10px] mt-1">{photoOfDay.source}{photoOfDay.date ? ` \u00b7 ${timeAgo(photoOfDay.date)}` : ''}</p>
                      </div>
                    </Link>
                  ) : null;

                case 'poll':
                  return <QuickPoll key={br.key} poll={poll} />;

                case 'sources':
                  return (
                    <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5">
                      <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-3">Sources</h4>
                      <div className="flex gap-1.5 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-1 sm:pb-0 -mx-1 px-1 scrollbar-hide">
                        {sources.map((s) => (
                          <span key={s} className="px-3 py-1.5 text-xs bg-[var(--bg)] rounded-full text-[var(--text-muted)] border border-[var(--border)] shrink-0 whitespace-nowrap">{s}</span>
                        ))}
                      </div>
                    </div>
                  );

                case 'nearby':
                  return (
                    <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Nearby Cities</h4>
                        <Link to="/cities" className="text-[10px] sm:text-xs text-[#e05d44] dark:text-[#e87461] no-underline hover:underline">All cities</Link>
                      </div>
                      <div className="flex gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-1 sm:pb-0 -mx-1 px-1 scrollbar-hide">
                        {nearbyCities.map((c) => (
                          <Link key={c.key} to={`/city/${c.key}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs no-underline transition-colors shrink-0 whitespace-nowrap text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)]">
                            <span>{c.flag || '📍'}</span><span>{c.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );

                case 'explore':
                  return (
                    <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5">
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                        {[
                          { to: '/cities', label: 'All Cities', desc: 'Browse all cities', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
                          { to: '/explore', label: 'Explore', desc: 'Discover more', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                          { to: '/bookmarks', label: 'Bookmarks', desc: 'Saved articles', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
                          { to: '/archive', label: 'Archive', desc: 'Browse by date', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                        ].map((link) => (
                          <Link key={link.to} to={link.to} className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--bg)] hover:border-[#e05d44]/20 dark:hover:border-[#e87461]/20 transition-colors no-underline group">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-[var(--text-muted)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d={link.icon} /></svg>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm text-[var(--text)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] transition-colors leading-tight truncate">{link.label}</p>
                              <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] leading-tight truncate">{link.desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );

                default:
                  return null;
              }
            }

            return elements;
          })()}
        </div>
      )}
    </div>
  );
}
