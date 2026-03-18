/**
 * SSR / Pre-rendering for SEO bots.
 *
 * When a search-engine bot (Googlebot, Bingbot, etc.) requests a page,
 * these functions return a complete HTML page with:
 *   - Proper meta tags (title, description, og:*, twitter:*)
 *   - JSON-LD structured data
 *   - Article content in semantic HTML
 *   - A JS redirect to the SPA for real browsers
 *
 * This ensures crawlers see full content + meta tags while the SPA
 * still works normally for real users.
 */

const SITE_URL = process.env.SITE_URL || 'https://pulsenewstoday.com';

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsonLd(obj) {
  return JSON.stringify(obj).replace(/<\/script/gi, '<\\/script');
}

function buildHtmlShell({ title, description, canonicalUrl, ogType, ogImage, extraMeta, jsonLd, bodyContent }) {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml((description || '').slice(0, 160));
  const safeImage = escapeHtml(ogImage || `${SITE_URL}/favicon.svg`);
  const safeCanonical = escapeHtml(canonicalUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}">
  <link rel="canonical" href="${safeCanonical}">

  <!-- Open Graph -->
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:type" content="${ogType || 'website'}">
  <meta property="og:url" content="${safeCanonical}">
  <meta property="og:image" content="${safeImage}">
  <meta property="og:site_name" content="PulseNewsToday">
  ${extraMeta || ''}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeImage}">

  <!-- JSON-LD Structured Data -->
  ${(jsonLd || []).map((ld) => `<script type="application/ld+json">${escapeJsonLd(ld)}</script>`).join('\n  ')}

  <!-- Redirect non-bot browsers to SPA -->
  <script>
    (function() {
      var bots = /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|discordbot/i;
      if (!bots.test(navigator.userAgent)) {
        window.location.replace('${safeCanonical}');
      }
    })();
  </script>
  <noscript><meta http-equiv="refresh" content="0;url=${safeCanonical}"></noscript>
</head>
<body>
  ${bodyContent || ''}
  <footer style="margin-top:2em;padding:1em;color:#888;font-size:12px;text-align:center;">
    &copy; PulseNewsToday. Powered by 99+ news sources.
  </footer>
</body>
</html>`;
}

/**
 * Render a full HTML page for a single article (for bot crawlers).
 */
export function renderArticlePage(article) {
  const slug = article.slug || encodeURIComponent(article.id);
  const canonicalUrl = article.slug
    ? `${SITE_URL}/news/${article.slug}`
    : `${SITE_URL}/article/${encodeURIComponent(article.id)}`;
  const description = (article.description || article.title || '').slice(0, 160);

  const newsArticleLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": description,
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
  };
  if (article.image) {
    newsArticleLd.image = article.image;
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": article.section || "News", "item": `${SITE_URL}/category/${article.sectionId || 'world'}` },
      { "@type": "ListItem", "position": 3, "name": article.title }
    ]
  };

  const extraMeta = [
    `<meta property="article:published_time" content="${escapeHtml(article.date || '')}">`,
    article.author ? `<meta property="article:author" content="${escapeHtml(article.author)}">` : '',
    article.section ? `<meta property="article:section" content="${escapeHtml(article.section)}">` : '',
  ].filter(Boolean).join('\n  ');

  // Build semantic article body
  const bodyParagraphs = (article.body || article.description || '')
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const bodyContent = `
  <article itemscope itemtype="https://schema.org/NewsArticle" style="max-width:720px;margin:0 auto;padding:1em;font-family:system-ui,sans-serif;">
    <nav aria-label="Breadcrumb" style="font-size:14px;color:#888;margin-bottom:1em;">
      <a href="${SITE_URL}" style="color:#e05d44;">Home</a> /
      <a href="${SITE_URL}/category/${escapeHtml(article.sectionId || 'world')}" style="color:#e05d44;">${escapeHtml(article.section || 'News')}</a>
    </nav>
    ${article.section ? `<span style="display:inline-block;padding:4px 12px;background:#fef0ed;color:#e05d44;border-radius:999px;font-size:12px;font-weight:600;text-transform:capitalize;margin-bottom:8px;">${escapeHtml(article.section)}</span>` : ''}
    <h1 itemprop="headline" style="font-size:2em;line-height:1.2;margin:0.5em 0;">${escapeHtml(article.title)}</h1>
    <div style="color:#888;font-size:14px;margin-bottom:1em;">
      ${article.author ? `<span itemprop="author">${escapeHtml(article.author)}</span> &middot; ` : ''}
      <time itemprop="datePublished" datetime="${escapeHtml(article.date || '')}">${article.date ? new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</time>
    </div>
    ${article.image ? `<img itemprop="image" src="${escapeHtml(article.image)}" alt="${escapeHtml(article.title)}" style="width:100%;border-radius:8px;margin-bottom:1em;">` : ''}
    ${article.description ? `<p itemprop="description" style="font-size:1.1em;color:#555;border-left:3px solid #e05d44;padding-left:1em;margin-bottom:1em;">${escapeHtml(article.description)}</p>` : ''}
    <div itemprop="articleBody">
      ${bodyParagraphs.map((p) => `<p style="line-height:1.7;color:#333;margin-bottom:1em;">${escapeHtml(p)}</p>`).join('\n      ')}
    </div>
    ${article.source ? `<p style="margin-top:2em;font-size:14px;color:#888;">Source: ${escapeHtml(article.source)}</p>` : ''}
  </article>`;

  return buildHtmlShell({
    title: `${article.title} | PulseNewsToday`,
    description,
    canonicalUrl,
    ogType: 'article',
    ogImage: article.image,
    extraMeta,
    jsonLd: [newsArticleLd, breadcrumbLd],
    bodyContent,
  });
}

/**
 * Render the home page for bots.
 */
export function renderHomePage() {
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "PulseNewsToday",
    "url": SITE_URL,
    "description": "AI-powered news aggregator delivering stories from 99+ sources across 9 regions and 16 languages.",
    "publisher": {
      "@type": "Organization",
      "name": "PulseNewsToday",
      "url": SITE_URL
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL }
    ]
  };

  const bodyContent = `
  <main style="max-width:720px;margin:0 auto;padding:1em;font-family:system-ui,sans-serif;">
    <h1 style="font-size:2em;">PulseNewsToday - Breaking News, World News &amp; Current Affairs</h1>
    <p style="font-size:1.1em;color:#555;">
      Stay informed with PulseNewsToday. Breaking news, world news, and current affairs from 99+ trusted sources
      across 9 regions and 16 languages. AI-powered summaries and text-to-speech.
    </p>
    <nav>
      <h2>Categories</h2>
      <ul>
        <li><a href="${SITE_URL}/category/world">World News</a></li>
        <li><a href="${SITE_URL}/category/technology">Technology</a></li>
        <li><a href="${SITE_URL}/category/business">Business</a></li>
        <li><a href="${SITE_URL}/category/science">Science</a></li>
        <li><a href="${SITE_URL}/category/sport">Sports</a></li>
        <li><a href="${SITE_URL}/category/culture">Culture</a></li>
        <li><a href="${SITE_URL}/category/environment">Environment</a></li>
        <li><a href="${SITE_URL}/category/politics">Politics</a></li>
      </ul>
    </nav>
  </main>`;

  return buildHtmlShell({
    title: 'PulseNewsToday - Breaking News, World News & Current Affairs',
    description: 'Stay informed with PulseNewsToday. Breaking news, world news, and current affairs from 99+ trusted sources across 9 regions and 16 languages.',
    canonicalUrl: SITE_URL,
    ogType: 'website',
    ogImage: `${SITE_URL}/favicon.svg`,
    jsonLd: [websiteLd, breadcrumbLd],
    bodyContent,
  });
}

/**
 * Render a category page for bots.
 */
export function renderCategoryPage(category) {
  const CATEGORY_META = {
    world: { title: 'World News', description: 'Latest world news and international headlines from trusted global sources.' },
    technology: { title: 'Technology News', description: 'Breaking technology news, gadget reviews, and innovation stories.' },
    business: { title: 'Business News', description: 'Financial markets, economy, and business news from leading sources worldwide.' },
    science: { title: 'Science News', description: 'Scientific discoveries, research breakthroughs, and space exploration news.' },
    sport: { title: 'Sports News', description: 'Live sports scores, match results, and athletics coverage from around the world.' },
    sports: { title: 'Sports News', description: 'Live sports scores, match results, and athletics coverage from around the world.' },
    culture: { title: 'Culture & Entertainment', description: 'Arts, entertainment, movies, music, and cultural news.' },
    environment: { title: 'Environment News', description: 'Climate change, sustainability, wildlife, and environmental news.' },
    politics: { title: 'Politics News', description: 'Political news, elections, policy analysis, and government coverage.' },
  };

  const meta = CATEGORY_META[category] || {
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} News`,
    description: `Latest ${category} news and headlines from trusted sources worldwide.`
  };

  const canonicalUrl = `${SITE_URL}/category/${category}`;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": meta.title, "item": canonicalUrl }
    ]
  };

  const bodyContent = `
  <main style="max-width:720px;margin:0 auto;padding:1em;font-family:system-ui,sans-serif;">
    <nav aria-label="Breadcrumb" style="font-size:14px;color:#888;margin-bottom:1em;">
      <a href="${SITE_URL}" style="color:#e05d44;">Home</a> / ${escapeHtml(meta.title)}
    </nav>
    <h1 style="font-size:2em;">${escapeHtml(meta.title)} - PulseNewsToday</h1>
    <p style="font-size:1.1em;color:#555;">${escapeHtml(meta.description)}</p>
  </main>`;

  return buildHtmlShell({
    title: `${meta.title} - PulseNewsToday`,
    description: meta.description,
    canonicalUrl,
    ogType: 'website',
    ogImage: `${SITE_URL}/favicon.svg`,
    jsonLd: [breadcrumbLd],
    bodyContent,
  });
}

/**
 * Check if the request is from a known search engine bot.
 */
export function isBot(userAgent) {
  if (!userAgent) return false;
  const botPattern = /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|applebot|discordbot|embedly|showyoubot|outbrain|pinterestbot|slackbot|vkshare|w3c_validator|redditbot|rogerbot|screaming frog/i;
  return botPattern.test(userAgent);
}
