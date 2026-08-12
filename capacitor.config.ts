import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.byzid.apparels',
  appName: 'BYZID APPARELS',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0B0F17'
  }
};

export default config;
