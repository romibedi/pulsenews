import app from './app.js';

const PORT = process.env.PORT || 8080;

// Ingestion is handled by a separate Lambda triggered by EventBridge (hourly).
// No cron inside the container — keeps App Runner scaling clean.

app.listen(PORT, () => {
  console.log(`[server] PulseNewsToday running on port ${PORT}`);
});
