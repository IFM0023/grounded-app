import type { CapacitorConfig } from '@capacitor/cli';

/**
 * iOS loads the production web app from www.getgroundedapp.com (same origin as /api/*).
 * appId must match the Bundle Identifier in Xcode / App Store Connect exactly.
 */
const config: CapacitorConfig = {
  appId: 'com.lindsay.grounded',
  appName: 'Grounded',
  webDir: 'www',
  server: {
    url: 'https://www.getgroundedapp.com',
    cleartext: false,
  },
};

export default config;
