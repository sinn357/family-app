import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.family.app',
  appName: 'Family App',
  webDir: 'out',
  bundledWebRuntime: false,
  server: {
    // 개발 모드에서 로컬 서버 사용 (옵션)
    // url: 'http://192.168.x.x:3003',
    // cleartext: true
  },
  plugins: {
    // Capacitor 플러그인 설정
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
  },
};

export default config;
