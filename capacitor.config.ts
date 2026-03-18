import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.veyrictech.pulsenewstoday',
  appName: 'PulseNewsToday',
  webDir: 'dist',

  // Remote URL mode — the native shell loads the live website.
  // This means you ship updates instantly without App Store review.
  // Comment out `server` to switch to local-bundle mode instead.
  server: {
    url: 'https://pulsenewstoday.com',
    cleartext: false, // HTTPS only
  },

  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff',
  },

  android: {
    backgroundColor: '#ffffff',
  },
};

export default config;
