require('dotenv').config();

module.exports = {
  expo: {
    name: 'FarmNewGen',
    slug: 'FarmNewGen',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'farmnewgen',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'แอปนี้ต้องการเข้าถึงตำแหน่งของคุณเพื่อแสดงข้อมูลสภาพอากาศในพื้นที่ของคุณ',
        },
      ],
      [
        "expo-router"
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY,
      GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
      GEOAPIFY_API_KEY: process.env.GEOAPIFY_API_KEY,
    },
  },
};


