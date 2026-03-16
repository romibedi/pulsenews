import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dns from 'node:dns'

// Force IPv6 first — the shared Guardian "test" API key has separate
// per-IP rate limits and IPv4 is often exhausted by other users.
dns.setDefaultResultOrder('ipv6first')

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'guardian-api-proxy',
      configureServer(server) {
        server.middlewares.use('/api/guardian', async (req, res) => {
          const url = `https://content.guardianapis.com${req.url}`;
          try {
            const response = await fetch(url);
            const data = await response.text();
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = response.status;
            res.end(data);
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      },
    },
  ],
})
