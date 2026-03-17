import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-normal text-[var(--text)] mb-4">
          About <span className="gradient-text">PulseNews</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto">
          Your curated window into global current affairs, delivering stories that matter.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <div className="bg-[var(--surface)] rounded-2xl p-6 md:p-8 border border-[var(--border)] shadow-sm">
          <h2 className="text-xl font-normal text-[var(--text)] mb-3">Our Mission</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            PulseNews aggregates and presents international news in a clean, modern interface.
            We believe staying informed shouldn't require sifting through cluttered websites and
            intrusive ads. Our platform focuses on what matters most: the stories.
          </p>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl p-6 md:p-8 border border-[var(--border)] shadow-sm">
          <h2 className="text-xl font-normal text-[var(--text)] mb-3">News Sources</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
            We currently source our news from The Guardian's Open Platform — one of the world's
            most respected international news organizations. Their open API provides access to
            over 2 million pieces of content, spanning:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['World News', 'Technology', 'Business', 'Science', 'Sports', 'Culture', 'Environment', 'Politics'].map((topic) => (
              <div key={topic} className="text-center p-3 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                <span className="text-sm text-[var(--text)]">{topic}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl p-6 md:p-8 border border-[var(--border)] shadow-sm">
          <h2 className="text-xl font-normal text-[var(--text)] mb-3">Built With</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'React', desc: 'Modern component-based UI library' },
              { name: 'Vite', desc: 'Lightning-fast build tool' },
              { name: 'Tailwind CSS', desc: 'Utility-first CSS framework' },
              { name: 'React Router', desc: 'Client-side routing' },
              { name: 'Guardian API', desc: 'Open journalism platform' },
              { name: 'Vercel', desc: 'Edge deployment platform' },
            ].map((tech) => (
              <div key={tech.name} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg)]">
                <div className="w-2 h-2 rounded-full bg-[#e05d44] dark:bg-[#e87461] mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{tech.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{tech.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-2xl p-6 md:p-8 border border-[var(--border)] shadow-sm">
          <h2 className="text-xl font-normal text-[var(--text)] mb-3">Open Source</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            PulseNews is built as a demonstration of modern web development practices.
            The application features responsive design, skeleton loading states,
            smooth animations, and a warm editorial aesthetic with dark mode support.
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
