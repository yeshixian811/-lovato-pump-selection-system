import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.luowato.pump',
  appName: '洛瓦托水泵选型',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    androidCleartext: true,
  },
  android: {
    buildOptions: {
      signingType: 'apksigner',
    },
  },
  ios: {
    scheme: 'luowato-pump',
  },
  plugins: {
    StatusBar: {
      style: 'dark',
    },
  },
};

export default config;
