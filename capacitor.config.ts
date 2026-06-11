import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.btb.app',
  appName: 'BtMM App',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
