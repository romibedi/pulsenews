import app from './app.js';
import cron from 'node-cron';

const PORT = process.env.PORT || 8080;

// --- Ingestion cron: every 15 minutes ---
cron.schedule('*/15 * * * *', async () => {
  console.log('[cron] Starting RSS ingestion...');
  try {
    const { handler } = await import('./ingest/handler.js');
    const result = await handler({});
    console.log('[cron] Ingestion complete:', JSON.stringify(result).slice(0, 200));
  } catch (err) {
    console.error('[cron] Ingestion error:', err.message);
  }
});

// Run ingestion once at startup (after 10s delay to let server warm up)
setTimeout(async () => {
  console.log('[startup] Running initial ingestion...');
  try {
    const { handler } = await import('./ingest/handler.js');
    await handler({});
    console.log('[startup] Initial ingestion complete');
  } catch (err) {
    console.error('[startup] Initial ingestion error:', err.message);
  }
}, 10_000);

app.listen(PORT, () => {
  console.log(`[server] PulseNewsToday running on port ${PORT}`);
});
