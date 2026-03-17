import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dns from 'node:dns'

dns.setDefaultResultOrder('ipv6first')

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
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim()
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
        id: `rss-${Buffer.from(link).toString('base64url').slice(0, 40)}`,
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

async function fetchFeed(feedUrl, source) {
  const cached = cache.get(feedUrl)
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data
  try {
    const res = await fetch(feedUrl, { headers: { 'User-Agent': 'StreamNews/1.0' } })
    if (!res.ok) return []
    const xml = await res.text()
    const articles = parseRssFeed(xml, source)
    cache.set(feedUrl, { data: articles, ts: Date.now() })
    return articles
  } catch { return [] }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-proxy',
      configureServer(server) {
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

        // Guardian API proxy
        server.middlewares.use('/api/guardian', async (req, res) => {
          const cacheKey = req.url
          const cached = cache.get(cacheKey)
          if (cached && Date.now() - cached.ts < CACHE_TTL) {
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('X-Cache', 'HIT')
            res.statusCode = cached.status
            res.end(cached.data)
            return
          }

          const guardianUrl = `https://content.guardianapis.com${req.url}`
          try {
            const response = await fetch(guardianUrl)
            const data = await response.text()
            if (response.ok) {
              cache.set(cacheKey, { data, status: response.status, ts: Date.now() })
            }
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('X-Cache', 'MISS')
            res.statusCode = response.status
            res.end(data)
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      },
    },
  ],
})
