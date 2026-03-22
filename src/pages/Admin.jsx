import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || '';

function StatCard({ title, value, subtitle, color = 'blue' }) {
  const colors = {
    blue: 'border-blue-500 bg-blue-500/10',
    green: 'border-green-500 bg-green-500/10',
    purple: 'border-purple-500 bg-purple-500/10',
    orange: 'border-orange-500 bg-orange-500/10',
    red: 'border-red-500 bg-red-500/10',
    cyan: 'border-cyan-500 bg-cyan-500/10',
  };
  return (
    <div className={`border-l-4 ${colors[color] || colors.blue} rounded-lg p-4`}>
      <div className="text-sm font-medium text-[var(--text-muted)]">{title}</div>
      <div className="text-2xl font-bold mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      {subtitle && <div className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</div>}
    </div>
  );
}

function DataTable({ title, data, columns, sortKey = 'count' }) {
  const sorted = [...Object.entries(data)]
    .map(([key, val]) => ({ key, ...(typeof val === 'object' ? val : { count: val }) }))
    .sort((a, b) => (b[sortKey] || b.total || 0) - (a[sortKey] || a.total || 0));

  return (
    <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] font-semibold">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--text-muted)] border-b border-[var(--border)]">
              {columns.map(col => (
                <th key={col.key} className="px-4 py-2 font-medium">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(row => (
              <tr key={row.key} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)]">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-2">
                    {col.render ? col.render(row) : (typeof row[col.key] === 'number' ? row[col.key].toLocaleString() : row[col.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProgressBar({ value, max, color = '#3b82f6' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-mono w-10 text-right">{pct}%</span>
    </div>
  );
}

export default function Admin() {
  const [password, setPassword] = useState(() => sessionStorage.getItem('admin_password') || '');
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginInput, setLoginInput] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/admin/stats`, {
        headers: { 'x-admin-password': password },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [password]);

  const login = async () => {
    try {
      const res = await fetch(`${API}/api/admin/verify`, {
        headers: { 'x-admin-password': loginInput },
      });
      if (res.ok) {
        setPassword(loginInput);
        sessionStorage.setItem('admin_password', loginInput);
        setAuthed(true);
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (password) {
      fetch(`${API}/api/admin/verify`, {
        headers: { 'x-admin-password': password },
      }).then(res => {
        if (res.ok) {
          setAuthed(true);
        } else {
          sessionStorage.removeItem('admin_password');
          setPassword('');
        }
      });
    }
  }, [password]);

  useEffect(() => {
    if (authed) fetchStats();
  }, [authed, fetchStats]);

  if (!authed) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] p-6">
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={loginInput}
            onChange={e => setLoginInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && login()}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] mb-4"
            placeholder="Enter admin password"
            autoFocus
          />
          <button
            onClick={login}
            className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Sign In
          </button>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">PulseNews Admin Dashboard</h1>
          {stats && (
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Last updated: {new Date(stats.timestamp).toLocaleString()} ({stats.elapsed})
            </p>
          )}
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh Stats'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400">{error}</div>
      )}

      {loading && !stats && (
        <div className="text-center py-20 text-[var(--text-muted)]">
          Loading stats... This may take 30-60 seconds for the first load.
        </div>
      )}

      {stats && (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard title="Total Articles" value={stats.totals.sitemapArticles} color="blue" />
            <StatCard title="Categories" value={stats.totals.categories} subtitle="Global feed items" color="green" />
            <StatCard title="Regions" value={stats.totals.regions} subtitle="Regional feed items" color="purple" />
            <StatCard title="Languages" value={stats.totals.languages} subtitle="Non-English items" color="orange" />
            <StatCard title="Cities" value={stats.totals.cities} subtitle="City feed items" color="cyan" />
            <StatCard title="TTS Audio" value={stats.tts.total} subtitle="Audio files in S3" color="green" />
          </div>

          {/* LLM Analysis Coverage */}
          <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] p-6">
            <h2 className="font-semibold mb-4">LLM Analysis Coverage <span className="text-sm font-normal text-[var(--text-muted)]">(sample of {stats.llmAnalysis.sampleSize.toLocaleString()} articles)</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.llmAnalysis.fields).map(([field, data]) => (
                <div key={field}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{field}</span>
                    <span className="text-[var(--text-muted)]">{data.count.toLocaleString()} ({data.percentage}%)</span>
                  </div>
                  <ProgressBar
                    value={data.count}
                    max={stats.llmAnalysis.sampleSize}
                    color={data.percentage > 80 ? '#22c55e' : data.percentage > 50 ? '#f59e0b' : '#ef4444'}
                  />
                </div>
              ))}
            </div>
            {stats.llmAnalysis.logoImages > 0 && (
              <p className="text-sm text-orange-400 mt-4">
                {stats.llmAnalysis.logoImages} articles still have logo/placeholder images ({Math.round((stats.llmAnalysis.logoImages / stats.llmAnalysis.sampleSize) * 100)}%)
              </p>
            )}
          </div>

          {/* Categories */}
          <DataTable
            title="Articles by Category"
            data={stats.categories}
            columns={[
              { key: 'key', label: 'Category', render: row => <span className="font-medium capitalize">{row.key}</span> },
              { key: 'count', label: 'Articles' },
            ]}
          />

          {/* Regions */}
          <DataTable
            title="Articles by Region"
            data={stats.regions}
            sortKey="total"
            columns={[
              { key: 'key', label: 'Region', render: row => <span className="font-medium capitalize">{row.key.replace('-', ' ')}</span> },
              { key: 'total', label: 'Total', render: row => (row.total || 0).toLocaleString() },
              ...['world', 'technology', 'business', 'sport', 'science', 'culture', 'politics'].map(cat => ({
                key: cat,
                label: cat.charAt(0).toUpperCase() + cat.slice(1),
                render: row => (row.byCategory?.[cat] || 0).toLocaleString(),
              })),
            ]}
          />

          {/* Languages */}
          <DataTable
            title="Articles by Language"
            data={stats.languages}
            columns={[
              { key: 'key', label: 'Language', render: row => <span className="font-medium uppercase">{row.key}</span> },
              { key: 'count', label: 'Articles' },
              { key: 'tts', label: 'TTS Audio', render: row => (stats.tts.byLanguage[row.key] || 0).toLocaleString() },
              { key: 'ttsCoverage', label: 'TTS Coverage', render: row => {
                const tts = stats.tts.byLanguage[row.key] || 0;
                const articles = row.count || 0;
                const pct = articles > 0 ? Math.round((tts / articles) * 100) : 0;
                return <ProgressBar value={tts} max={articles} color={pct > 80 ? '#22c55e' : pct > 50 ? '#f59e0b' : '#ef4444'} />;
              }},
            ]}
          />

          {/* TTS by Language (including English) */}
          <DataTable
            title="TTS Audio by Language"
            data={stats.tts.byLanguage}
            columns={[
              { key: 'key', label: 'Language', render: row => <span className="font-medium uppercase">{row.key}</span> },
              { key: 'count', label: 'Audio Files' },
            ]}
          />

          {/* Cities */}
          <DataTable
            title="Articles by City"
            data={stats.cities}
            columns={[
              { key: 'key', label: 'City', render: row => <span className="font-medium capitalize">{row.key.replace(/-/g, ' ')}</span> },
              { key: 'count', label: 'Articles' },
            ]}
          />
        </div>
      )}
    </div>
  );
}
