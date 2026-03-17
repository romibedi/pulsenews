import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { extract } from '@extractus/article-extractor'
import dns from 'node:dns'

dns.setDefaultResultOrder('verbatim')

// Load all env variables (including non-VITE_ prefixed) into process.env
const env = loadEnv('development', process.cwd(), '')
Object.assign(process.env, env)

// In-memory cache for dev server — avoids hitting Guardian API on every request
const cache = new Map()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

// --- RSS feed config (mirrors api/feeds.js) ---
const FEEDS = {
  world: [
    { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC News' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    { url: 'https://feeds.npr.org/1004/rss.xml', source: 'NPR' },
    { url: 'https://abcnews.go.com/abcnews/internationalheadlines', source: 'ABC News' },
  ],
  technology: [
    { url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', source: 'BBC Tech' },
    { url: 'https://feeds.npr.org/1019/rss.xml', source: 'NPR Tech' },
    { url: 'https://feeds.arstechnica.com/arstechnica/index', source: 'Ars Technica' },
  ],
  business: [
    { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business' },
    { url: 'https://feeds.npr.org/1006/rss.xml', source: 'NPR Business' },
  ],
  science: [
    { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Science' },
    { url: 'https://feeds.npr.org/1007/rss.xml', source: 'NPR Science' },
  ],
  sport: [
    { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport' },
  ],
  culture: [
    { url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', source: 'BBC Arts' },
    { url: 'https://feeds.npr.org/1008/rss.xml', source: 'NPR Arts' },
  ],
  environment: [
    { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Environment' },
  ],
  politics: [
    { url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', source: 'BBC Politics' },
    { url: 'https://feeds.npr.org/1014/rss.xml', source: 'NPR Politics' },
  ],
}

// Regional feeds for geo-localized news
const REGIONAL_FEEDS = {
  india: [
    { url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', source: 'Times of India' },
    { url: 'https://www.thehindu.com/news/national/feeder/default.rss', source: 'The Hindu' },
    { url: 'https://indianexpress.com/feed/', source: 'Indian Express' },
    { url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml', source: 'BBC India' },
  ],
  uk: [
    { url: 'https://feeds.bbci.co.uk/news/uk/rss.xml', source: 'BBC UK' },
    { url: 'https://feeds.bbci.co.uk/news/england/rss.xml', source: 'BBC England' },
    { url: 'https://feeds.skynews.com/feeds/rss/uk.xml', source: 'Sky News UK' },
  ],
  us: [
    { url: 'https://feeds.npr.org/1003/rss.xml', source: 'NPR US' },
    { url: 'https://abcnews.go.com/abcnews/usheadlines', source: 'ABC US' },
    { url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', source: 'BBC US' },
  ],
  australia: [
    { url: 'https://www.abc.net.au/news/feed/2942460/rss.xml', source: 'ABC Australia' },
    { url: 'https://feeds.bbci.co.uk/news/world/australia/rss.xml', source: 'BBC Australia' },
  ],
  'middle-east': [
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
    { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', source: 'BBC Middle East' },
  ],
  europe: [
    { url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml', source: 'BBC Europe' },
    { url: 'https://www.rfi.fr/en/rss', source: 'RFI' },
  ],
  africa: [
    { url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', source: 'BBC Africa' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
  ],
  asia: [
    { url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', source: 'BBC Asia' },
    { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera' },
  ],
  latam: [
    { url: 'https://feeds.bbci.co.uk/news/world/latin_america/rss.xml', source: 'BBC Latin America' },
  ],
}

// Language-specific feeds (Indian languages)
const LANG_FEEDS = {
  hi: [
    { url: 'https://feeds.bbci.co.uk/hindi/rss.xml', source: 'BBC Hindi' },
    { url: 'https://rss.jagran.com/rss/news/national.xml', source: 'Dainik Jagran' },
    { url: 'https://www.amarujala.com/rss/breaking-news.xml', source: 'Amar Ujala' },
    { url: 'https://www.bhaskar.com/rss-feed/1061/', source: 'Dainik Bhaskar' },
  ],
  ta: [
    { url: 'https://feeds.bbci.co.uk/tamil/rss.xml', source: 'BBC Tamil' },
    { url: 'https://www.hindutamil.in/stories.rss', source: 'The Hindu Tamil' },
  ],
  te: [
    { url: 'https://feeds.bbci.co.uk/telugu/rss.xml', source: 'BBC Telugu' },
    { url: 'https://www.sakshi.com/rss.xml', source: 'Sakshi' },
  ],
  bn: [
    { url: 'https://feeds.bbci.co.uk/bengali/rss.xml', source: 'BBC Bangla' },
    { url: 'https://eisamay.com/stories.rss', source: 'Ei Samay' },
    { url: 'https://zeenews.india.com/bengali/rssfeed/nation.xml', source: 'Zee News Bengali' },
  ],
  mr: [
    { url: 'https://zeenews.india.com/marathi/rss/india-news.xml', source: 'Zee News Marathi' },
    { url: 'https://zeenews.india.com/marathi/rss/maharashtra-news.xml', source: 'Zee News Maharashtra' },
  ],
}

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`)
  const m = xml.match(re)
  return m ? (m[1] || m[2] || '').trim() : ''
}

function extractImageUrl(itemXml) {
  let m = itemXml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/)
  if (m) return m[1]
  m = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/)
  if (m) return m[1]
  m = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["']/)
  if (m) return m[1]
  m = itemXml.match(/<img[^>]+src=["']([^"']+)["']/)
  if (m) return m[1]
  return null
}

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'").replace(/&rsquo;/g, '\u2019').replace(/&lsquo;/g, '\u2018').replace(/&mdash;/g, '\u2014').replace(/&ndash;/g, '\u2013').replace(/&hellip;/g, '\u2026').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, (m) => String.fromCharCode(parseInt(m.slice(2, -1)))).trim()
}

function parseRssFeed(xml, source) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]
    const title = stripHtml(extractTag(itemXml, 'title'))
    const link = extractTag(itemXml, 'link')
    const description = stripHtml(extractTag(itemXml, 'description'))
    const pubDate = extractTag(itemXml, 'pubDate')
    const image = extractImageUrl(itemXml)
    if (title && link) {
      items.push({
        id: `rss-${Buffer.from(link).toString('base64url')}`,
        title, description, body: '', image,
        author: source,
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        section: source, sectionId: source.toLowerCase().replace(/\s+/g, '-'),
        url: link, tags: [], source, isExternal: true,
      })
    }
  }
  return items
}

async function fetchOgImage(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PulseNews/1.0)' }, redirect: 'follow' })
    if (!r.ok) return null
    const html = await r.text()
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    return m ? m[1] : null
  } catch { return null }
}

async function fetchFeed(feedUrl, source) {
  const cached = cache.get(feedUrl)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data
  try {
    const res = await fetch(feedUrl, { headers: { 'User-Agent': 'StreamNews/1.0' } })
    if (!res.ok) return []
    const xml = await res.text()
    const articles = parseRssFeed(xml, source)
    cache.set(feedUrl, { data: articles, ts: Date.now() })
    // Fetch OG images in background for articles missing images (non-blocking)
    const needImage = articles.filter((a) => !a.image).slice(0, 5)
    if (needImage.length > 0) {
      Promise.all(needImage.map((a) => fetchOgImage(a.url))).then((ogResults) => {
        let updated = false
        needImage.forEach((a, i) => { if (ogResults[i]) { a.image = ogResults[i]; updated = true } })
        if (updated) cache.set(feedUrl, { data: articles, ts: Date.now() })
      }).catch(() => {})
    }
    return articles
  } catch { return [] }
}

export default defineConfig({
  server: {
    host: '127.0.0.1',
    hmr: {
      host: '127.0.0.1',
      port: 5174,
    },
  },
  plugins: [
    react(),
    {
      name: 'api-proxy',
      configureServer(server) {
        // Regional local news
        server.middlewares.use('/api/local', async (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const region = url.searchParams.get('region') || 'world'
          const feeds = REGIONAL_FEEDS[region] || REGIONAL_FEEDS['us'] || []
          if (feeds.length === 0) { res.setHeader('Content-Type', 'application/json'); res.statusCode = 200; res.end(JSON.stringify({ articles: [] })); return }
          const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)))
          const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15)
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({ articles, region }))
        })

        // Language-specific feeds
        server.middlewares.use('/api/lang-feeds', async (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const lang = url.searchParams.get('lang') || 'hi'
          const feeds = LANG_FEEDS[lang]
          if (!feeds || feeds.length === 0) { res.setHeader('Content-Type', 'application/json'); res.statusCode = 200; res.end(JSON.stringify({ articles: [], lang })); return }
          const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)))
          const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20)
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({ articles, lang }))
        })

        // RSS feeds proxy
        server.middlewares.use('/api/feeds', async (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const category = url.searchParams.get('category') || 'world'
          const feeds = FEEDS[category] || FEEDS.world
          const results = await Promise.all(feeds.map((f) => fetchFeed(f.url, f.source)))
          const articles = results.flat().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20)
          res.setHeader('Content-Type', 'application/json')
          res.statusCode = 200
          res.end(JSON.stringify({ articles }))
        })

        // Custom RSS feed proxy (avoids CORS)
        server.middlewares.use('/api/proxy-feed', async (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const feedUrl = url.searchParams.get('url')
          if (!feedUrl) { res.statusCode = 400; res.end(JSON.stringify({ error: 'url required' })); return }
          const cacheKey = `proxy:${feedUrl}`
          const cached = cache.get(cacheKey)
          if (cached && Date.now() - cached.ts < CACHE_TTL) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(cached.data)
            return
          }
          try {
            const feedRes = await fetch(feedUrl, { headers: { 'User-Agent': 'PulseNews/1.0' } })
            if (!feedRes.ok) { res.statusCode = 200; res.end(JSON.stringify({ articles: [] })); return }
            const xml = await feedRes.text()
            const source = url.searchParams.get('name') || 'Custom'
            const articles = parseRssFeed(xml, source)
            // Fetch OG images for articles missing images (up to 10 in parallel)
            const needImage = articles.filter((a) => !a.image).slice(0, 10)
            if (needImage.length > 0) {
              const ogResults = await Promise.all(needImage.map((a) => fetchOgImage(a.url)))
              needImage.forEach((a, i) => { if (ogResults[i]) a.image = ogResults[i] })
            }
            const data = JSON.stringify({ articles })
            cache.set(cacheKey, { data, ts: Date.now() })
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(data)
          } catch {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify({ articles: [] }))
          }
        })

        // Article content extraction
        server.middlewares.use('/api/extract', async (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const articleUrl = url.searchParams.get('url')
          if (!articleUrl) { res.statusCode = 400; res.end(JSON.stringify({ error: 'url param required' })); return }
          const cacheKey = `extract:${articleUrl}`
          const cached = cache.get(cacheKey)
          if (cached && Date.now() - cached.ts < CACHE_TTL) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(cached.data)
            return
          }
          try {
            const article = await extract(articleUrl, {}, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PulseNews/1.0)' } })
            const result = JSON.stringify({
              title: article?.title || '',
              content: article?.content || '',
              text: (article?.content || '').replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, ' ').trim(),
              image: article?.image || '',
              author: article?.author || '',
              published: article?.published || '',
              source: article?.source || '',
            })
            cache.set(cacheKey, { data: result, ts: Date.now() })
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(result)
          } catch (err) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify({ title: '', content: '', text: '', error: err.message }))
          }
        })

        // Claude API proxy (summarize)
        server.middlewares.use('/api/summarize', async (req, res) => {
          if (req.method === 'OPTIONS') { res.statusCode = 200; res.end(); return }
          if (req.method !== 'POST') { res.statusCode = 405; res.end('Method not allowed'); return }
          const apiKey = process.env.ANTHROPIC_API_KEY
          if (!apiKey) { res.setHeader('Content-Type', 'application/json'); res.statusCode = 500; res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' })); return }
          let body = ''
          req.on('data', (c) => { body += c })
          req.on('end', async () => {
            try {
              const { title, body: articleBody } = JSON.parse(body)
              const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 200, messages: [{ role: 'user', content: `Summarize this news article in 2-3 concise sentences. Focus on the key facts.\n\nTitle: ${title}\n\n${(articleBody || '').slice(0, 3000)}` }] }),
              })
              const data = await response.json()
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = response.ok ? 200 : response.status
              res.end(JSON.stringify(response.ok ? { summary: data.content?.[0]?.text } : { error: JSON.stringify(data) }))
            } catch (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })) }
          })
        })

        // TTS via Edge TTS
        const TTS_VOICES = {
          en: 'en-IN-NeerjaNeural',
          hi: 'hi-IN-SwaraNeural',
          ta: 'ta-IN-PallaviNeural',
          te: 'te-IN-ShrutiNeural',
          bn: 'bn-IN-TanishaaNeural',
          mr: 'mr-IN-AarohiNeural',
        }
        server.middlewares.use('/api/tts', async (req, res) => {
          const url = new URL(req.url, 'http://localhost')
          const text = url.searchParams.get('text')
          const lang = url.searchParams.get('lang') || 'en'
          if (!text) { res.statusCode = 400; res.end(JSON.stringify({ error: 'text param required' })); return }
          const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 5000)
          const voice = TTS_VOICES[lang] || TTS_VOICES.en
          try {
            const { EdgeTTS } = await import('edge-tts-universal')
            const tts = new EdgeTTS(cleanText, voice, { rate: '+5%' })
            const result = await tts.synthesize()
            const audioBuffer = Buffer.from(await result.audio.arrayBuffer())
            res.setHeader('Content-Type', 'audio/mpeg')
            res.setHeader('Content-Length', audioBuffer.length)
            res.setHeader('Cache-Control', 's-maxage=86400')
            res.statusCode = 200
            res.end(audioBuffer)
          } catch (err) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
        })

        // CoinGecko proxy
        server.middlewares.use('/api/stocks', async (req, res) => {
          const cacheKey = 'stocks'
          const cached = cache.get(cacheKey)
          if (cached && Date.now() - cached.ts < 5 * 60 * 1000) {
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(cached.data)
            return
          }
          try {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h')
            const coins = await response.json()
            const data = JSON.stringify(coins.map((c) => ({ id: c.id, symbol: c.symbol.toUpperCase(), name: c.name, price: c.current_price, change24h: c.price_change_percentage_24h, image: c.image, marketCap: c.market_cap })))
            cache.set(cacheKey, { data, ts: Date.now() })
            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(data)
          } catch (err) { res.statusCode = 500; res.end(JSON.stringify({ error: err.message })) }
        })

      },
    },
  ],
})
