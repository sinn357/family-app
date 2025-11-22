# Capacitor 모바일 앱 작업 진행 상황

> 작업 날짜: 2025-11-23
> 작업자: Claude Code

---

## 📋 작업 요약

Family App을 iOS/Android 네이티브 앱으로 빌드하기 위한 Capacitor 설정 작업을 진행했습니다.

---

## ✅ 완료된 작업

### 1. Capacitor 설정 병합
- `claude/capacitor-mobile-wrapper-019GxH7eQ3MLGg7sPa8tmVwE` 브랜치를 `master`에 병합
- GitHub 푸시 완료

**추가된 파일:**
- `CAPACITOR_SETUP.md` - 229줄 분량의 한국어 설정 가이드
- `capacitor.config.ts` - Capacitor 설정 파일
- `.gitignore` - Android/iOS 네이티브 프로젝트 제외

**추가된 의존성:**
```json
"@capacitor/core": "^7.4.4",
"@capacitor/cli": "^7.4.4",
"@capacitor/android": "^7.4.4",
"@capacitor/ios": "^7.4.4"
```

**추가된 빌드 스크립트:**
```json
"build:mobile": "BUILD_MODE=mobile prisma generate && next build",
"cap:add:android": "npx cap add android",
"cap:add:ios": "npx cap add ios",
"cap:build:android": "npm run build:mobile && npx cap sync android && npx cap open android",
"cap:build:ios": "npm run build:mobile && npx cap sync ios && npx cap open ios"
```

### 2. Android 프로젝트 생성
```bash
npm run cap:add:android
```
- ✅ `android/` 폴더 생성 완료
- Android Studio에서 열 수 있는 네이티브 프로젝트 준비 완료

### 3. iOS 프로젝트 생성
```bash
npm run cap:add:ios
```
- ✅ `ios/` 폴더 생성 완료
- Xcode에서 열 수 있는 네이티브 프로젝트 준비 완료

### 4. Node.js 업그레이드
- **이전 버전:** v20.6.1
- **현재 버전:** v25.2.1
- Next.js 16.0.3 요구사항 충족

### 5. Capacitor 설정 수정
- `capacitor.config.ts`에서 deprecated `bundledWebRuntime` 옵션 제거
- TypeScript 컴파일 에러 수정

### 6. 모바일 빌드 테스트
```bash
npm run build:mobile
```
- ✅ Next.js 빌드 자체는 성공
- ⚠️ Static Export 단계에서 에러 발생 (아래 참고)

---

## ❌ 발견된 문제

### Static Export 불가능

**에러 메시지:**
```
Error: export const dynamic = "force-static"/export const revalidate not configured
on route "/api/calendar/[id]" with "output: export"
```

**원인:**
- Next.js static export는 **API Routes를 지원하지 않음**
- Family App은 다음 기능들을 사용 중:
  - API Routes (`/api/*`)
  - Socket.IO (실시간 채팅)
  - 동적 데이터 처리

**영향을 받는 API Routes:**
```
/api/admin/members
/api/admin/members/[memberId]
/api/auth/login
/api/auth/logout
/api/auth/session
/api/auth/signup
/api/calendar
/api/calendar/[id]
/api/chat/rooms
/api/chat/rooms/[roomId]/messages
/api/comments/[commentId]
/api/files
/api/files/[id]
/api/notifications
/api/notifications/[id]/read
/api/notifications/settings
/api/notifications/unread-count
/api/posts
/api/posts/[postId]
/api/posts/[postId]/comments
/api/search
/api/todos
/api/todos/[todoId]
/api/upload
/api/socket
```

---

## 🎯 해결 방안 (3가지 옵션)

### 옵션 1: 하이브리드 아키텍처 (권장) ⭐

**개념:**
- **백엔드:** API 서버를 별도로 배포 (Vercel, Railway, AWS 등)
- **프론트엔드:** 정적 페이지만 모바일 앱에 포함

**장점:**
- 네이티브 앱 경험 제공
- App Store / Google Play 배포 가능
- 오프라인 캐싱 가능

**필요한 작업:**

1. **백엔드 API 배포**
   ```bash
   # Vercel에 현재 Next.js 앱 배포 (API Routes 포함)
   vercel deploy
   ```

2. **프론트엔드 코드 수정**
   - API 호출을 외부 서버로 변경
   - 환경 변수 설정

   `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-server.vercel.app
   NEXT_PUBLIC_SOCKET_URL=https://your-api-server.vercel.app
   ```

3. **API 클라이언트 수정**
   - 모든 `fetch('/api/...')` 호출을 `fetch(process.env.NEXT_PUBLIC_API_URL + '/api/...')` 로 변경
   - Socket.IO 연결 URL 업데이트

4. **정적 빌드 및 동기화**
   ```bash
   npm run build:mobile
   npm run cap:sync
   npm run cap:open:android  # 또는 ios
   ```

**예상 작업 시간:** 2-4시간

---

### 옵션 2: PWA로 사용 (추가 작업 없음) 🚀

**개념:**
- 이미 PWA 설정이 완료되어 있음 (`@ducanh2912/next-pwa`)
- 모바일 브라우저에서 "홈 화면에 추가"로 사용
- 네이티브 앱처럼 동작

**장점:**
- ✅ 추가 개발 불필요
- ✅ 즉시 사용 가능
- ✅ 자동 업데이트
- ✅ 오프라인 지원 (Service Worker)
- ✅ 푸시 알림 가능 (Web Push API)

**단점:**
- App Store / Google Play에 배포 불가
- 일부 네이티브 API 제한 (카메라, 파일 시스템 등)

**사용 방법:**
1. Vercel에 배포
2. 모바일 브라우저에서 접속
3. "홈 화면에 추가" 선택
4. 앱처럼 사용

**예상 작업 시간:** 0시간 (이미 완료)

---

### 옵션 3: API Routes를 Client Components로 변환

**개념:**
- 서버리스 함수 대신 클라이언트에서 직접 데이터베이스 연결
- 백엔드 로직을 프론트엔드로 이동

**장점:**
- 단일 코드베이스 유지
- 완전한 정적 export 가능

**단점:**
- ❌ 보안 취약 (데이터베이스 자격증명 노출)
- ❌ Socket.IO 실시간 채팅 불가능
- ❌ 대규모 리팩토링 필요

**권장하지 않음** ⛔

---

## 💡 최종 권장 사항

### 단기 (즉시 사용)
**→ 옵션 2: PWA로 사용**
- 현재 상태 그대로 Vercel에 배포
- 모바일 브라우저에서 "홈 화면에 추가"
- 추가 개발 없이 즉시 사용 가능

### 중장기 (네이티브 앱 필요 시)
**→ 옵션 1: 하이브리드 아키텍처**
- 백엔드 API 서버 배포
- 프론트엔드 코드 수정 (API URL 분리)
- Capacitor로 네이티브 앱 빌드
- App Store / Google Play 배포

---

## 📂 생성된 파일 구조

```
family-app/
├── android/                    # Android 네이티브 프로젝트
│   ├── app/
│   ├── build.gradle
│   └── ...
├── ios/                        # iOS 네이티브 프로젝트
│   ├── App/
│   ├── App.xcodeproj
│   └── ...
├── capacitor.config.ts         # Capacitor 설정
├── CAPACITOR_SETUP.md          # 설정 가이드 (229줄)
├── CAPACITOR_PROGRESS.md       # 이 파일
├── next.config.ts              # Next.js 설정 (모바일 빌드 지원)
└── package.json                # Capacitor 스크립트 추가
```

---

## 🔧 추가 참고 사항

### Capacitor 유용한 플러그인 (필요 시 설치)

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

### Android Studio / Xcode 요구사항

**Android:**
- Android Studio (최신 버전)
- Java JDK 17 이상
- Android SDK

**iOS (macOS 전용):**
- Xcode (최신 버전)
- CocoaPods (`sudo gem install cocoapods`)
- iOS 시뮬레이터 또는 실제 기기

---

## 📝 변경 이력

| 날짜 | 커밋 | 설명 |
|------|------|------|
| 2025-11-23 | `82c9008` | Merge capacitor-mobile-wrapper 브랜치 |
| 2025-11-23 | `62a1d00` | Remove deprecated bundledWebRuntime from Capacitor config |

---

## 🤔 다음 단계

현재 상황을 고려하여 다음 중 선택:

1. **PWA로 사용** - 추가 작업 없이 즉시 배포
2. **하이브리드 아키텍처 준비** - API 서버 분리 작업 시작
3. **보류** - 추후 결정

---

**문의사항이 있으면 `CAPACITOR_SETUP.md` 파일을 참고하세요.**
