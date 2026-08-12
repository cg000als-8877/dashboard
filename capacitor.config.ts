import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.byzid.apparels',
  appName: 'BYZID APPARELS',
  webDir: 'public',
  server: {
    url: 'http://localhost:3000',
    cleartext: true,
    androidScheme: 'http'
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0B0F17'
  }
};

export default config;
