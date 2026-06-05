import { CapacitorConfig } from '@capacitor/cli';

/**
 * LFX 珠宝内容系统 - iOS 壳配置
 *
 * 模式：
 *   A) 本地包模式 (默认): 把 modified/ 打进 ipa, 离线可用
 *      —— webDir 指向 www/, 由 sync-web.js 同步
 *   B) 远程加载模式: 直接加载 https://yh.xiaofenhe.com/lfx-preview/入口页.html
 *      —— 取消 server.url 注释即可
 */
const config: CapacitorConfig = {
  appId: 'com.lfx.jewelry',
  appName: 'LFX 珠宝内容',
  webDir: 'www',
  bundledWebRuntime: false,

  // === 远程模式 (内测/演示推荐) ===
  // server: {
  //   url: 'https://yh.xiaofenhe.com/lfx-preview/入口页.html',
  //   cleartext: false,
  //   allowNavigation: ['yh.xiaofenhe.com', '*.xiaofenhe.com']
  // },

  ios: {
    contentInset: 'always',
    scrollEnabled: true,
    backgroundColor: '#1a1714',
    limitsNavigationsToAppBoundDomains: false,
    preferredContentMode: 'mobile'
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#1a1714',
      androidSplashResourceName: 'splash',
      iosSpinnerStyle: 'large',
      spinnerColor: '#d4b275',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1714',
      overlaysWebView: false
    }
  }
};

export default config;
