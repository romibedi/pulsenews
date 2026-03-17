import { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useLocalStorage('pulsenews-newsletter', null);
  const [frequency, setFrequency] = useState('daily');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed({ email: email.trim(), frequency, subscribedAt: new Date().toISOString() });
    setEmail('');
  };

  const unsubscribe = () => {
    setSubscribed(null);
  };

  if (subscribed) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-500/20">
        <div className="flex items-center gap-2 mb-3">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Subscribed!</span>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-1">
          {subscribed.frequency === 'daily' ? 'Daily' : 'Weekly'} digest will be sent to <strong className="text-[var(--text)]">{subscribed.email}</strong>
        </p>
        <button onClick={unsubscribe} className="text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors mt-2">
          Unsubscribe
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--surface)] rounded-2xl p-6 border border-[var(--border)] shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#e05d44] dark:text-[#e87461]" viewBox="0 0 24 24">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
        <h3 className="text-lg text-[var(--text)]" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
          Newsletter
        </h3>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-4">Get top stories delivered to your inbox.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#e05d44] dark:focus:border-[#e87461] transition-colors"
          required
        />
        <div className="flex gap-2">
          {['daily', 'weekly'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFrequency(f)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all capitalize ${
                frequency === f
                  ? 'bg-[#e05d44] dark:bg-[#e87461] text-white border-transparent'
                  : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          type="submit"
          className="w-full py-2.5 text-sm font-medium bg-[#e05d44] dark:bg-[#e87461] text-white rounded-lg hover:bg-[#c94e38] transition-colors"
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}
