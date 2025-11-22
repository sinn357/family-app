import type { NextConfig } from "next";
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // Capacitor 모바일 앱 빌드를 위한 정적 export 설정
  output: process.env.BUILD_MODE === 'mobile' ? 'export' : undefined,

  turbopack: {},
  images: {
    // 정적 export 시 이미지 최적화 비활성화
    unoptimized: process.env.BUILD_MODE === 'mobile' ? true : false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  // Capacitor 앱에서 trailing slash 처리
  trailingSlash: true,
};

export default withPWA(nextConfig);
