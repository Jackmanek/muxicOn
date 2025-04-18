import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.miempresa.muxicon',
  appName: 'muxicon',
  webDir: 'www',
  server: {
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;
