import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useRegion, { REGIONS } from '../hooks/useRegion';
import useLanguage from '../hooks/useLanguage';
import useIsMobile from '../hooks/useIsMobile';
import useAudio from '../contexts/AudioContext';
import NewsCard from '../components/NewsCard';
import Loader, { HeroLoader } from '../components/Loader';
import StockTicker from '../components/StockTicker';
import QuickPoll from '../components/QuickPoll';
import { clusterArticles, extractSmartPullquote, pickTopStory, pickPhotoOfDay, extractStatistic, getDailyPoll, dailyShuffle, getTimeDivider, timeAgo, getArticleImage, getCitiesForRegion } from '../utils/articleHelpers';

const SITE_URL = 'https://pulsenewstoday.com';

const CATEGORIES = [
  { key: 'world', tKey: 'catTopStories' },
  { key: 'technology', tKey: 'catTechnology' },
  { key: 'business', tKey: 'catBusiness' },
  { key: 'sport', tKey: 'catSport' },
  { key: 'science', tKey: 'catScience' },
  { key: 'culture', tKey: 'catCulture' },
  { key: 'politics', tKey: 'catPolitics' },
];

export default function Region() {
  const { region } = useParams();
  const { region: currentRegion, setRegion } = useRegion();
  const { lang, t, tCat } = useLanguage();
  const { playArticle, addToQueue } = useAudio();
  const isMobile = useIsMobile();
  const isCurrentRegion = region === currentRegion;
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);

  const info = REGIONS[region] || { label: region, flag: '🌐' };

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setSections({});

    const langParam = lang && lang !== 'en' ? `&lang=${encodeURIComponent(lang)}` : '';

    Promise.all(
      CATEGORIES.map((cat) =>
        fetch(`/api/regional-feeds?region=${encodeURIComponent(region)}&category=${encodeURIComponent(cat.key)}${langParam}`)
          .then((r) => r.json())
          .then((data) => {
            if (!ignore) {
              setSections((prev) => ({ ...prev, [cat.key]: data.articles || [] }));
            }
          })
          .catch(() => {
            if (!ignore) setSections((prev) => ({ ...prev, [cat.key]: [] }));
          })
      )
    ).finally(() => {
      if (!ignore) setLoading(false);
    });

    return () => { ignore = true; };
  }, [region, lang]);

  // Combine all articles for interleaving helpers
  const allArticles = useMemo(() => {
    const combined = [];
    CATEGORIES.forEach((cat) => {
      (sections[cat.key] || []).forEach((a) => {
        if (!combined.some((e) => e.id === a.id)) combined.push(a);
      });
    });
    return combined;
  }, [sections]);

  const topArticles = sections.world || [];
  const hero = topArticles[0];
  const latest = topArticles.slice(1, 7);

  // Interleaving helpers from all articles
  const clusters = useMemo(() => clusterArticles(allArticles), [allArticles]);
  const smartPullquote = extractSmartPullquote(allArticles);
  const topStory = pickTopStory(allArticles.slice(7)); // skip hero/latest
  let photoOfDay = pickPhotoOfDay(allArticles);
  if (photoOfDay && topStory && photoOfDay.id === topStory.id) photoOfDay = null;
  if (photoOfDay && hero && photoOfDay.id === hero.id) photoOfDay = null;
  const stat = extractStatistic(allArticles);
  const poll = getDailyPoll(region);

  const sources = useMemo(() => {
    const seen = new Set();
    return allArticles.filter((a) => {
      if (!a.source || seen.has(a.source)) return false;
      seen.add(a.source);
      return true;
    }).slice(0, 12).map((a) => a.source);
  }, [allArticles]);

  const showMarket = ['us', 'europe', 'asia', 'india', 'australia'].includes(region);
  const cities = getCitiesForRegion(region);
  const canonicalUrl = `${SITE_URL}/region/${region}`;

  // Build category sections that have articles (skip 'world' as it's used for hero/latest)
  const categorySections = CATEGORIES.slice(1).filter((cat) => {
    const arts = sections[cat.key];
    return arts && arts.length > 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <Helmet>
        <title>{info.label} News - PulseNewsToday</title>
        <meta name="description" content={`Latest news from ${info.label}. Breaking stories, analysis, and headlines across all categories.`} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${info.label} News - PulseNewsToday`} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-block px-3 py-1 bg-[#fef0ed] dark:bg-[#e87461]/10 text-[#e05d44] dark:text-[#e87461] text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
          {t('region')}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-normal text-[var(--text)]">
            {info.flag} {info.label}
          </h1>
          {isCurrentRegion ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10 rounded-full">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {t('yourRegion')}
            </span>
          ) : (
            <button
              onClick={() => setRegion(region)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#e05d44] dark:bg-[#e87461] rounded-full hover:bg-[#c94e38] dark:hover:bg-[#d4634f] transition-colors"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
              {t('setAsRegion')}
            </button>
          )}
        </div>
        <p className="text-[var(--text-muted)] mt-1 text-sm">{t('latestFrom')} {info.label}</p>

        {/* Region switcher */}
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(REGIONS).map(([key, r]) => (
            <Link
              key={key}
              to={`/region/${key}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-full no-underline transition-all ${
                key === region
                  ? 'bg-[#e05d44] dark:bg-[#e87461] text-white'
                  : 'bg-[var(--bg)] text-[var(--text-secondary)] hover:text-[#e05d44] dark:hover:text-[#e87461] border border-[var(--border)] hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30'
              }`}
            >
              {r.flag} {r.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-10">

        {/* Hero */}
        <section>
          {loading && !hero ? (
            <HeroLoader />
          ) : hero ? (
            <div className="animate-fade-in">
              <NewsCard article={hero} featured />
            </div>
          ) : null}
        </section>

        {/* Audio briefing */}
        {allArticles.length >= 3 && (
          <div className="bg-gradient-to-r from-[#fef0ed] to-[#fef8f6] dark:from-[#e87461]/10 dark:to-[#e87461]/5 rounded-2xl p-3 sm:p-5 flex items-center gap-3 sm:gap-4 border border-[#e05d44]/10 dark:border-[#e87461]/20">
            <button
              onClick={() => {
                playArticle({
                  id: `briefing-${region}-${Date.now()}`,
                  title: `${info.label} News Briefing`,
                  body: allArticles.slice(0, 5).map((a) => a.title).join('. '),
                  source: 'PulseNewsToday',
                  date: new Date().toISOString(),
                });
              }}
              className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#e05d44] dark:bg-[#e87461] text-white rounded-full flex items-center justify-center hover:bg-[#c94e38] transition-colors shadow-md"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#e05d44] dark:text-[#e87461]">{info.label} News Briefing</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 hidden sm:block">Listen to a 60-second audio summary of the top stories</p>
            </div>
            <button
              onClick={() => {
                playArticle({
                  id: `briefing-${region}-${Date.now()}`,
                  title: `${info.label} News Briefing`,
                  body: allArticles.slice(0, 3).map((a) => a.title).join('. '),
                  source: 'PulseNewsToday',
                  date: new Date().toISOString(),
                });
                allArticles.slice(0, 5).forEach((a) => addToQueue(a));
              }}
              className="shrink-0 text-xs text-[var(--text-muted)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors whitespace-nowrap hidden sm:block"
            >
              + Queue all
            </button>
          </div>
        )}

        {/* Latest from top stories */}
        {latest.length > 0 && (
          <section>
            <h2 className="text-2xl font-normal text-[var(--text)] mb-5">{t('latestFromShort')} {info.label}</h2>
            <div className={isMobile ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'}>
              {latest.map((article, i) => (
                <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${i * 80}ms` }}>
                  <NewsCard article={article} compact={isMobile && i > 0} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Interleaved category sections + breaks ─────── */}
        {(() => {
          // Build content breaks
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
          if (showMarket) contentBreaks.push({ type: 'market', key: 'market' });
          if (cities.length > 0) contentBreaks.push({ type: 'cities', key: 'cities' });

          const shuffledBreaks = dailyShuffle(contentBreaks);

          const elements = [];
          let breakIdx = 0;

          categorySections.forEach((cat, ci) => {
            const catArticles = sections[cat.key];
            if (!catArticles || catArticles.length === 0) return;

            // Category section
            elements.push(
              <section key={cat.key}>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-2xl font-normal text-[var(--text)]">{t(cat.tKey)}</h2>
                  <Link to={`/category/${cat.key}`} className="text-xs text-[#e05d44] dark:text-[#e87461] no-underline hover:underline">
                    View all →
                  </Link>
                </div>

                {/* First article as a wide feature on even sections */}
                {ci % 2 === 0 && catArticles.length > 2 ? (
                  <div className="space-y-5">
                    {/* Wide feature */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
                      {catArticles[0].image && (
                        <img src={catArticles[0].image} alt="" className="w-full h-40 sm:h-56 md:h-full object-cover" loading="lazy" />
                      )}
                      <div className="p-4 sm:p-6 flex flex-col justify-center">
                        <span className="text-[10px] font-semibold text-[#e05d44] dark:text-[#e87461] uppercase tracking-wider mb-2">{t(cat.tKey)}</span>
                        <Link
                          to={catArticles[0].slug ? `/news/${catArticles[0].slug}` : `/article/${encodeURIComponent(catArticles[0].id)}`}
                          className="text-lg sm:text-xl font-medium text-[var(--text)] hover:text-[#e05d44] dark:hover:text-[#e87461] transition-colors no-underline leading-snug"
                          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                        >{catArticles[0].title}</Link>
                        <p className="text-sm text-[var(--text-muted)] mt-2 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                          {(catArticles[0].description || '').replace(/<[^>]*>/g, '').slice(0, 250)}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-3">{catArticles[0].source}{catArticles[0].date ? ` · ${timeAgo(catArticles[0].date)}` : ''}</p>
                      </div>
                    </div>
                    {/* Rest as grid */}
                    <div className={isMobile ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'}>
                      {catArticles.slice(1, isMobile ? 4 : 4).map((article, i) => (
                        <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${i * 80}ms` }}>
                          <NewsCard article={article} compact={isMobile} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Standard grid */
                  <div className={isMobile ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'}>
                    {catArticles.slice(0, 4).map((article, i) => (
                      <div key={article.id} className="animate-fade-in h-full" style={{ animationDelay: `${i * 80}ms` }}>
                        <NewsCard article={article} compact={isMobile && i > 0} />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );

            // Insert a break after every category section
            if (breakIdx < shuffledBreaks.length) {
              elements.push(renderBreak(shuffledBreaks[breakIdx++]));
            }
          });

          // Append remaining breaks
          while (breakIdx < shuffledBreaks.length) {
            elements.push(renderBreak(shuffledBreaks[breakIdx++]));
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
                    <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider mb-3">Sources in {info.label}</h4>
                    <div className="flex gap-1.5 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-1 sm:pb-0 -mx-1 px-1 scrollbar-hide">
                      {sources.map((s) => (
                        <span key={s} className="px-3 py-1.5 text-xs bg-[var(--bg)] rounded-full text-[var(--text-muted)] border border-[var(--border)] shrink-0 whitespace-nowrap">{s}</span>
                      ))}
                    </div>
                  </div>
                );

              case 'market':
                return <div key={br.key}><StockTicker /></div>;

              case 'cities':
                return (
                  <div key={br.key} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Cities in {info.label}</h4>
                      <Link to="/cities" className="text-[10px] sm:text-xs text-[#e05d44] dark:text-[#e87461] no-underline hover:underline">All cities</Link>
                    </div>
                    <div className="flex gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap pb-1 sm:pb-0 -mx-1 px-1 scrollbar-hide">
                      {cities.map((c) => (
                        <Link key={c.key} to={`/city/${c.key}`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs no-underline transition-colors shrink-0 whitespace-nowrap text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] border border-transparent hover:border-[var(--border)]">
                          <span>{c.flag}</span><span>{c.label}</span>
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

        {loading && Object.keys(sections).length === 0 && (
          <Loader count={12} />
        )}
      </div>
    </div>
  );
}
