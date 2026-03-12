import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.trimtime.customer',
  appName: 'TrimTime',
  webDir: '../../dist/apps/customer-mobile',
  server: {
    // Uncomment for live reload during development:
    // url: 'http://192.168.1.XXX:4300',
    // cleartext: true,
  },
  plugins: {
    // Push Notifications (Firebase)
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    // Local Notifications
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#4f46e5',
      sound: 'beep.wav',
    },
    // SplashScreen
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    // Status Bar
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
    },
  },
  ios: {
    contentInset: 'always',
    scheme: 'TrimTime',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
