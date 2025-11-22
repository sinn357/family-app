# Capacitor 모바일 앱 설정 가이드

이 문서는 Family App을 iOS/Android 네이티브 앱으로 빌드하는 방법을 설명합니다.

## 📱 개요

Capacitor는 웹 앱을 네이티브 모바일 앱으로 감싸는 프레임워크입니다. 현재 Next.js 프로젝트를 iOS와 Android 앱으로 빌드할 수 있습니다.

## ⚠️ 중요 사항

이 프로젝트는 **API 라우트**와 **Socket.IO**를 사용하므로, 다음과 같은 아키텍처를 사용해야 합니다:

- **프론트엔드**: 정적 export하여 모바일 앱에 포함
- **백엔드 API**: 별도 서버에서 호스팅 (Vercel, Railway, AWS 등)

### API 서버 호스팅 옵션

1. **Vercel** (추천): Next.js API 라우트를 그대로 배포
2. **Railway**: PostgreSQL + Next.js API 서버 호스팅
3. **AWS/GCP**: 프로덕션 환경용

## 🚀 빌드 단계

### 1. 플랫폼 추가

#### Android 추가
```bash
npm run cap:add:android
```

#### iOS 추가 (macOS 필요)
```bash
npm run cap:add:ios
```

### 2. 모바일용 빌드

```bash
npm run build:mobile
```

이 명령은 `BUILD_MODE=mobile` 환경 변수를 설정하여 정적 export를 활성화합니다.

### 3. Capacitor 동기화

빌드된 웹 파일을 네이티브 프로젝트에 복사합니다:

```bash
npm run cap:sync
```

### 4. 네이티브 IDE에서 열기

#### Android Studio에서 열기
```bash
npm run cap:open:android
```

#### Xcode에서 열기 (macOS 필요)
```bash
npm run cap:open:ios
```

## 🔧 환경 변수 설정

모바일 앱에서 API 서버에 연결하려면 환경 변수를 설정해야 합니다.

### `.env.local` 파일 생성

```env
# API 서버 URL (배포된 백엔드 주소)
NEXT_PUBLIC_API_URL=https://your-api-server.vercel.app

# Socket.IO 서버 URL
NEXT_PUBLIC_SOCKET_URL=https://your-api-server.vercel.app
```

## 📦 원스텝 빌드 명령

전체 빌드 과정을 한 번에 실행:

#### Android
```bash
npm run cap:build:android
```

이 명령은 다음을 실행합니다:
1. `npm run build:mobile` - 모바일용 정적 빌드
2. `npx cap sync android` - Android 프로젝트에 동기화
3. `npx cap open android` - Android Studio 열기

#### iOS
```bash
npm run cap:build:ios
```

## 🔄 개발 워크플로우

### 1. 로컬 개발 모드

개발 중에는 모바일 앱이 로컬 Next.js 서버에 연결하도록 설정할 수 있습니다:

```typescript
// capacitor.config.ts
server: {
  url: 'http://192.168.1.100:3003', // 실제 로컬 IP 주소로 변경
  cleartext: true
}
```

그런 다음:
1. `npm run dev` - Next.js 개발 서버 실행
2. `npm run cap:sync` - 설정 동기화
3. `npm run cap:open:android` 또는 `npm run cap:open:ios`

### 2. 프로덕션 빌드 모드

배포용 앱을 빌드할 때는 `capacitor.config.ts`에서 `server` 설정을 제거하고:

```bash
npm run cap:build:android
# 또는
npm run cap:build:ios
```

## 📝 필수 요구사항

### Android 개발

- **Android Studio** (최신 버전)
- **Java JDK 17** 이상
- **Android SDK**

### iOS 개발 (macOS 전용)

- **Xcode** (최신 버전)
- **CocoaPods** (`sudo gem install cocoapods`)
- **iOS 시뮬레이터** 또는 실제 iOS 기기

## 🎨 앱 아이콘 및 스플래시 스크린

### 아이콘 생성

1. `public/icon.png` (1024x1024) 생성
2. [Capacitor Asset Generator](https://github.com/ionic-team/capacitor-assets) 사용:

```bash
npm install -g @capacitor/assets
npx capacitor-assets generate
```

### 스플래시 스크린

`capacitor.config.ts`에서 설정:

```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: '#ffffff',
    showSpinner: false,
  },
}
```

## 🔌 유용한 Capacitor 플러그인

모바일 기능을 추가하려면 다음 플러그인을 설치할 수 있습니다:

```bash
# 카메라
npm install @capacitor/camera

# 푸시 알림
npm install @capacitor/push-notifications

# 로컬 알림
npm install @capacitor/local-notifications

# 파일 시스템
npm install @capacitor/filesystem

# 위치 정보
npm install @capacitor/geolocation
```

## 🐛 문제 해결

### "out 디렉토리를 찾을 수 없음"

먼저 모바일용 빌드를 실행하세요:
```bash
npm run build:mobile
```

### API 호출 실패

1. `.env.local`에서 `NEXT_PUBLIC_API_URL` 확인
2. API 서버가 실행 중인지 확인
3. CORS 설정 확인 (백엔드에서 모바일 앱 도메인 허용)

### iOS 빌드 오류

CocoaPods 의존성 설치:
```bash
cd ios/App
pod install
cd ../..
```

## 📚 추가 자료

- [Capacitor 공식 문서](https://capacitorjs.com/docs)
- [Next.js 정적 Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Capacitor 플러그인](https://capacitorjs.com/docs/plugins)

## 🤝 배포 체크리스트

- [ ] 백엔드 API를 프로덕션 서버에 배포
- [ ] `.env.local`에 프로덕션 API URL 설정
- [ ] `npm run build:mobile` 실행
- [ ] `npm run cap:sync` 실행
- [ ] Android Studio / Xcode에서 앱 서명 설정
- [ ] 앱 아이콘 및 스플래시 스크린 추가
- [ ] Google Play Store / App Store에 업로드

---

문제가 발생하면 [Capacitor 커뮤니티](https://ionic.io/community)에서 도움을 받을 수 있습니다.
