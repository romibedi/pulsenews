import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://pulsenewstoday.com';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <Helmet>
        <title>About PulseNewsToday - AI-Powered News Aggregator</title>
        <meta name="description" content="Learn about PulseNewsToday, an AI-powered news aggregator delivering stories from 99+ sources across 9 regions and 16 languages with AI summaries and text-to-speech." />
        <link rel="canonical" href={`${SITE_URL}/about`} />
        <meta property="og:title" content="About PulseNewsToday" />
        <meta property="og:description" content="Learn about PulseNewsToday, an AI-powered news aggregator delivering stories from 99+ sources across 9 regions and 16 languages." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/about`} />
        <meta property="og:image" content={`${SITE_URL}/favicon.svg`} />
        <meta property="og:site_name" content="PulseNewsToday" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About PulseNewsToday" />
        <meta name="twitter:description" content="Learn about PulseNewsToday, an AI-powered news aggregator delivering stories from 99+ sources across 9 regions and 16 languages." />
        <meta name="twitter:image" content={`${SITE_URL}/favicon.svg`} />
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
              "name": "About",
              "item": `${SITE_URL}/about`
            }
          ]
        })}</script>
      </Helmet>

      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-normal text-[var(--text)] mb-4">
          About <span className="gradient-text">PulseNewsToday</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
          An AI-powered news aggregator delivering stories from 99+ sources across 9 regions and 16 languages.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <div className="bg-[var(--surface)] rounded-2xl p-6 md:p-8 border border-[var(--border)] shadow-sm">
          <h2 className="text-xl font-normal text-[var(--text)] mb-3">Our Mission</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            PulseNewsToday aggregates global news from over 99 RSS sources into a clean, modern interface.
            We believe staying informed shouldn't require sifting through cluttered websites and
            intrusive ads. Our platform focuses on what matters most: the stories — enhanced with
            AI summaries, text-to-speech, and multilingual support so everyone can access
            the news that matters to them.
          </p>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl p-6 md:p-8 border border-[var(--border)] shadow-sm">
          <h2 className="text-xl font-normal text-[var(--text)] mb-3">Coverage</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
            We aggregate news from trusted sources worldwide — BBC, Al Jazeera, NPR, Reuters, Times of India,
            and many more — spanning 8 categories:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {['World News', 'Technology', 'Business', 'Science', 'Sports', 'Culture', 'Environment', 'Politics'].map((topic) => (
              <div key={topic} className="text-center p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                <span className="text-sm text-[var(--text)]">{topic}</span>
              </div>
            ))}
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
            Localized for 9 regions:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { flag: '🇺🇸', name: 'US' },
              { flag: '🇬🇧', name: 'UK' },
              { flag: '🇮🇳', name: 'India' },
              { flag: '🇨🇦', name: 'Canada' },
              { flag: '🇦🇺', name: 'Australia' },
              { flag: '🇩🇪', name: 'Germany' },
              { flag: '🇫🇷', name: 'France' },
              { flag: '🇯🇵', name: 'Japan' },
              { flag: '🇧🇷', name: 'Brazil' },
            ].map((r) => (
              <span key={r.name} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg)] rounded-full border border-[var(--border)] text-sm text-[var(--text)]">
                <span>{r.flag}</span> {r.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl p-6 md:p-8 border border-[var(--border)] shadow-sm">
          <h2 className="text-xl font-normal text-[var(--text)] mb-3">Languages</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
            PulseNewsToday supports 16 languages with native-language RSS sources and a full UI translation layer.
            Text-to-speech works across all supported languages.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              'English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Urdu', 'Arabic',
              'French', 'German', 'Spanish', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Swahili',
            ].map((lang) => (
              <span key={lang} className="px-3 py-1.5 bg-[var(--bg)] rounded-full border border-[var(--border)] text-sm text-[var(--text)]">
                {lang}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl p-6 md:p-8 border border-[var(--border)] shadow-sm">
          <h2 className="text-xl font-normal text-[var(--text)] mb-3">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '✦', title: 'AI Summaries', desc: 'Claude-powered 2-3 sentence summaries on every article' },
              { icon: '🔊', title: 'Text-to-Speech', desc: 'Listen to articles aloud in all 16 supported languages' },
              { icon: '🔖', title: 'Bookmarks', desc: 'Save articles to read later, accessible offline' },
              { icon: '🌙', title: 'Dark Mode', desc: 'Full dark theme with automatic system preference detection' },
              { icon: '🔍', title: 'Full-Text Search', desc: 'Multilingual search powered by OpenSearch' },
              { icon: '🔗', title: 'SEO-Friendly URLs', desc: 'Clean, shareable slugs for every article' },
              { icon: '📰', title: 'Custom Feeds', desc: 'Add and manage your own RSS sources' },
              { icon: '📊', title: 'Market Ticker', desc: 'Live crypto and stock data on the home page' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3 p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                <span className="text-lg mt-0.5 flex-shrink-0">{f.icon}</span>
                <div>
                  <span className="text-sm font-medium text-[var(--text)]">{f.title}</span>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl p-6 md:p-8 border border-[var(--border)] shadow-sm">
          <h2 className="text-xl font-normal text-[var(--text)] mb-3">How It Works</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
            PulseNewsToday runs on a fully serverless architecture on AWS. Articles are automatically
            ingested every 15 minutes from 99+ RSS feeds, stored in DynamoDB with a 90-day retention window,
            and served through a global CDN for fast load times anywhere in the world.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'React + Vite', desc: 'Frontend' },
              { label: 'AWS Lambda', desc: 'API & Ingestion' },
              { label: 'DynamoDB', desc: 'Storage' },
              { label: 'CloudFront', desc: 'CDN' },
              { label: 'OpenSearch', desc: 'Search' },
              { label: 'EventBridge', desc: 'Scheduling' },
            ].map((t) => (
              <div key={t.label} className="text-center p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                <span className="text-sm font-medium text-[var(--text)] block">{t.label}</span>
                <span className="text-xs text-[var(--text-muted)]">{t.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl p-6 md:p-8 border border-[var(--border)] shadow-sm">
          <h2 className="text-xl font-normal text-[var(--text)] mb-3">Built by VeyricTech</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
            PulseNewsToday is built and maintained by VeyricTech. We build AI-powered products
            that make information more accessible and useful.
          </p>
          <p className="text-sm text-[var(--text-muted)]">
            Questions or feedback?{' '}
            <a href="mailto:info@veyrictech.com" className="text-[#e05d44] dark:text-[#e87461] hover:underline no-underline">
              info@veyrictech.com
            </a>
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#e05d44] dark:bg-[#e87461] text-white rounded-full font-medium hover:bg-[#c94e38] transition-colors no-underline"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Explore Headlines
        </Link>
      </div>
    </div>
  );
}
