import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.byzid.apparels',
  appName: 'BYZID APPARELS',
  webDir: 'public',
  server: {
    url: 'https://bapldata.vercel.app',
    cleartext: true,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0B0F17'
  }
};

export default config;
