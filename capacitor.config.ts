import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.highestwash.merchants",
  appName: "Highest Wash",
  webDir: "dist/client",
  server: {
    androidScheme: "https",
  },
  android: {
    buildOptions: {
      keystorePath: "android/highestwash-merchant.p12",
      keystoreAlias: "highestwash-merchant",
      keystorePassword: process.env.HW_KEYSTORE_PASSWORD,
      keystoreAliasPassword: process.env.HW_KEY_PASSWORD,
    },
  },
};

export default config;
