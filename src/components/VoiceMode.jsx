import { useState, useRef, useCallback } from 'react';
import useAudio from '../contexts/AudioContext';
import useLanguage from '../hooks/useLanguage';

const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

const VOICE_CHIPS = {
  en: ['What happened in tech today?', 'Top world news', 'Latest in sports', 'Business headlines'],
  hi: ['आज टेक में क्या हुआ?', 'शीर्ष विश्व समाचार', 'खेल की ताज़ा ख़बरें', 'बिज़नेस हेडलाइंस'],
  ta: ['இன்று தொழில்நுட்பத்தில் என்ன நடந்தது?', 'உலக செய்திகள்', 'விளையாட்டு செய்திகள்', 'வணிக செய்திகள்'],
  te: ['ఈరోజు టెక్‌లో ఏం జరిగింది?', 'ప్రపంచ వార్తలు', 'క్రీడా వార్తలు', 'వ్యాపార వార్తలు'],
  bn: ['আজ প্রযুক্তিতে কী ঘটেছে?', 'শীর্ষ বিশ্ব সংবাদ', 'খেলার খবর', 'ব্যবসায়িক শিরোনাম'],
  mr: ['आज टेकमध्ये काय घडले?', 'जगातील बातम्या', 'क्रीडा बातम्या', 'व्यापार बातम्या'],
  ur: ['آج ٹیک میں کیا ہوا؟', 'اہم عالمی خبریں', 'کھیلوں کی خبریں', 'کاروباری سرخیاں'],
  ar: ['ماذا حدث في التقنية اليوم؟', 'أهم أخبار العالم', 'آخر أخبار الرياضة', 'عناوين الأعمال'],
  fr: ["Quoi de neuf en tech aujourd'hui ?", 'Actualités mondiales', 'Dernières nouvelles sportives', 'Actualités économiques'],
  de: ['Was gibt es Neues in der Technik?', 'Top-Weltnachrichten', 'Sport-Nachrichten', 'Wirtschafts-Schlagzeilen'],
  es: ['¿Qué pasó en tecnología hoy?', 'Noticias del mundo', 'Últimas noticias deportivas', 'Titulares de negocios'],
  pt: ['O que aconteceu em tecnologia hoje?', 'Notícias do mundo', 'Últimas notícias esportivas', 'Manchetes de negócios'],
  zh: ['今天科技有什么新闻？', '全球要闻', '体育最新消息', '商业头条'],
  ja: ['今日のテクニュースは？', '世界のトップニュース', 'スポーツ最新情報', 'ビジネスヘッドライン'],
  ko: ['오늘 기술 뉴스는?', '세계 주요 뉴스', '스포츠 최신 뉴스', '비즈니스 헤드라인'],
  sw: ['Nini kimetokea katika teknolojia leo?', 'Habari kuu za dunia', 'Habari za michezo', 'Vichwa vya biashara'],
};

export default function VoiceMode() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState(null);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const { playArticle } = useAudio();
  const { lang: currentLang } = useLanguage();

  const getLang = () => currentLang || 'en';
  const getRegion = () => {
    try { return JSON.parse(localStorage.getItem('pulsenews-region')) || ''; } catch { return ''; }
  };
  const chips = VOICE_CHIPS[currentLang] || VOICE_CHIPS.en;

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    setError(null);
    setBriefing(null);
    setArticles([]);
    setTranscript('');

    const recognition = new SpeechRecognition();
    recognition.lang = getLang() === 'en' ? 'en-US' : getLang();
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const result = e.results[e.results.length - 1];
      setTranscript(result[0].transcript);
    };
    recognition.onend = () => {
      setListening(false);
      // Auto-submit on speech end
      const finalTranscript = recognitionRef.current?._lastTranscript;
      if (finalTranscript) submitQuery(finalTranscript);
    };
    recognition.onerror = (e) => {
      setListening(false);
      if (e.error !== 'aborted' && e.error !== 'no-speech') {
        setError(`Mic error: ${e.error}`);
      }
    };

    // Track final transcript
    recognition.onresult = (e) => {
      const result = e.results[e.results.length - 1];
      const text = result[0].transcript;
      setTranscript(text);
      if (result.isFinal) {
        recognitionRef.current._lastTranscript = text;
      }
    };

    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const submitQuery = useCallback(async (query) => {
    if (!query?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/voice-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), lang: getLang(), region: getRegion() }),
      });
      if (!res.ok) throw new Error('Failed to get briefing');
      const data = await res.json();
      setBriefing(data.briefing);
      setArticles(data.articles || []);
      // Auto-play the briefing as TTS
      if (data.briefing) {
        playArticle({
          id: `voice-briefing-${Date.now()}`,
          title: `News briefing: ${query}`,
          body: data.briefing,
          source: 'PulseNewsToday',
          date: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [playArticle]);

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (transcript.trim()) submitQuery(transcript);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(120px+env(safe-area-inset-bottom,0px))] md:bottom-20 right-4 z-40 w-14 h-14 bg-[#e05d44] dark:bg-[#e87461] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        title="Ask for news"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center" onClick={() => setOpen(false)}>
      <div
        className="bg-[var(--surface)] w-full md:w-[480px] md:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--text)]">Ask for News</h3>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Mic button */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={listening ? stopListening : startListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                listening
                  ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/30'
                  : 'bg-[#e05d44] dark:bg-[#e87461] hover:bg-[#c94e38] shadow-md'
              } text-white`}
            >
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </button>
            <p className="text-sm text-[var(--text-muted)]">
              {listening ? 'Listening... tap to stop' : 'Tap to speak'}
            </p>
          </div>

          {/* Text input fallback */}
          <form onSubmit={handleTextSubmit} className="flex gap-2">
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder='Try "What happened in tech today?"'
              className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-full px-4 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[#e05d44] dark:focus:border-[#e87461]"
            />
            <button
              type="submit"
              disabled={!transcript.trim() || loading}
              className="px-4 py-2.5 bg-[#e05d44] dark:bg-[#e87461] text-white rounded-full text-sm font-medium hover:bg-[#c94e38] transition-colors disabled:opacity-50"
            >
              {loading ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                  <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
                </svg>
              ) : 'Ask'}
            </button>
          </form>

          {/* Suggestion chips */}
          {!briefing && !loading && (
            <div className="flex flex-wrap gap-2">
              {chips.map((q) => (
                <button
                  key={q}
                  onClick={() => { setTranscript(q); submitQuery(q); }}
                  className="px-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--border)] text-[var(--text-secondary)] rounded-full hover:border-[#e05d44]/30 dark:hover:border-[#e87461]/30 hover:text-[#e05d44] dark:hover:text-[#e87461] transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex items-center gap-3 p-4 bg-[var(--bg)] rounded-xl">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin text-[#e05d44] dark:text-[#e87461]">
                <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
              </svg>
              <span className="text-sm text-[var(--text-muted)]">Preparing your briefing...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Briefing result */}
          {briefing && (
            <div className="space-y-4">
              <div className="p-4 bg-[var(--bg)] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-[#e05d44] dark:text-[#e87461]">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </svg>
                  <span className="text-xs font-semibold text-[#e05d44] dark:text-[#e87461] uppercase tracking-wider">Now Playing</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{briefing}</p>
              </div>

              {/* Related articles */}
              {articles.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Sources</p>
                  <div className="space-y-2">
                    {articles.map((a) => (
                      <a
                        key={a.id}
                        href={a.slug ? `/news/${a.slug}` : `/article/${encodeURIComponent(a.id)}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg)] transition-colors no-underline group"
                        onClick={() => setOpen(false)}
                      >
                        {a.image && (
                          <img src={a.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--text)] group-hover:text-[#e05d44] dark:group-hover:text-[#e87461] truncate transition-colors">{a.title}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">{a.source}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
