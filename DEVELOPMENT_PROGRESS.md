# Family App Development Progress

## 프로젝트 개요
Next.js 기반 가족 협업 웹 애플리케이션 MVP 개발

## 완료된 기능 (Completed Features)

### ✅ Phase 1.5 - 선택적 개선사항 (2025-11-18)

#### 1. 무한 스크롤 페이지네이션
- **커밋**: `12b5e7e - feat: Implement infinite scroll pagination for posts and todos`
- **구현 내용**:
  - Cursor-based pagination using `createdAt` timestamps
  - Posts: 10개씩 로드
  - Todos: 20개씩 로드
  - Intersection Observer API로 자동 로딩
  - `useInfiniteQuery` 활용
  - Optimistic updates 지원 (pages 구조)

#### 2. Cloudinary 이미지 업로드
- **커밋**: `792196b - feat: Add Cloudinary image upload for posts`
- **구현 내용**:
  - Cloudinary 통합 (무료 25GB)
  - 최대 5MB 이미지 업로드
  - 자동 최적화: 1200x1200 제한, WebP 변환
  - Posts와 Comments에 이미지 첨부 기능
  - `ImageUpload` 재사용 가능한 컴포넌트
  - Next.js Image 컴포넌트로 최적화된 표시

**환경 변수**:
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

#### 3. 검색 기능
- **커밋**: `3aeae9b - feat: Add search functionality for posts and todos`
- **구현 내용**:
  - Posts: 제목 + 내용 검색
  - Todos: 제목 + 설명 검색
  - 300ms 디바운싱
  - Case-insensitive 검색 (Prisma `mode: 'insensitive'`)
  - 필터와 검색 조합 가능
  - 동적 Empty State

---

### ✅ Phase 2 - 실시간 채팅 (2025-11-18)

**커밋**: `5f450ba - feat: Implement Phase 2 - Real-time chat with Socket.IO and enhancements`

#### 1. WebSocket 통합 (CHAT-001)
- Socket.IO 서버 설정 (`pages/api/socket.ts`)
- Room-based messaging (join/leave events)
- Global io instance for App Router access
- 실시간 메시지 브로드캐스팅

#### 2. 실시간 메시지 전달 (CHAT-002)
- 3초 폴링 제거 → 순수 WebSocket 이벤트 기반
- `useSocket` hook 생성
- React Query cache를 통한 optimistic updates
- 중복 메시지 방지

#### 3. 채팅 이미지 첨부 (CHAT-003)
- 채팅 메시지에 이미지 첨부 가능
- Cloudinary 인프라 재사용
- 반응형 이미지 표시

#### 4. 모바일 최적화 (CHAT-004)
- 반응형 패딩 (`p-3 md:p-4`)
- 메시지 버블: 모바일 85%, 데스크톱 70%
- 터치 친화적 UI

#### 5. 추가 개선사항
- Enter 키로 메시지 전송
- Shift+Enter로 줄바꿈
- 새 메시지 시 자동 스크롤
- 연결 상태 추적

---

### ✅ Phase 3 Part 1 - 실시간 기능 (2025-11-18)

**커밋**: `e09f917 - feat: Add typing indicators and online/offline status (Phase 3 Part 1)`

#### 1. 타이핑 인디케이터 (RT-001)
- **구현 위치**:
  - `components/chat/typing-indicator.tsx` (신규)
  - `components/chat/message-input.tsx` (수정)
  - `components/chat/message-list.tsx` (수정)
  - `pages/api/socket.ts` (수정)

- **기능**:
  - 타이핑 시작 시 `typing-start` 이벤트 emit
  - 3초 비활동 후 `typing-stop` 자동 emit
  - 메시지 전송 시 즉시 타이핑 중단
  - 여러 사용자 동시 타이핑 표시
  - 애니메이션 효과 (bounce dots)
  - 자신의 타이핑은 표시하지 않음

#### 2. 온라인/오프라인 상태 (RT-002)
- **구현 위치**:
  - `components/chat/online-users.tsx` (신규)
  - `lib/hooks/use-socket.ts` (수정)
  - `app/(protected)/chat/page.tsx` (수정)
  - `pages/api/socket.ts` (수정)

- **기능**:
  - Socket 연결 시 `user-online` 이벤트 emit
  - 연결 해제/언마운트 시 `user-offline` emit
  - 전역 온라인 사용자 추적
  - 채팅 상단에 온라인 가족 구성원 표시
  - 녹색 점 인디케이터
  - 실시간 상태 변경 브로드캐스트

---

### ✅ Phase 4 - 알림 시스템 (2025-11-21)

**커밋**: `3386d65 - feat: Implement Phase 4 - Notification system with real-time alerts`

#### 1. 알림 데이터 모델
- **Notification 모델**: type, title, content, recipientId, senderId, relatedType, relatedId, isRead, readAt
- **NotificationSetting 모델**: 사용자별 알림 설정 (댓글, 멘션, 시스템, Todo)
- Socket.IO 통합으로 실시간 알림 전달

#### 2. 알림 API
- `/api/notifications` - GET (목록), POST (생성)
- `/api/notifications/unread-count` - 읽지 않은 알림 개수
- `/api/notifications/[id]/read` - 알림 읽음 처리
- `/api/notifications/settings` - 알림 설정 관리

#### 3. 자동 알림 트리거
- `lib/notification-utils.ts`: 알림 생성 헬퍼 함수
- 댓글 작성 시 자동 알림 (게시글 작성자에게)
- 알림 설정 확인 후 전송

#### 4. UI 컴포넌트
- `NotificationBell`: 헤더 알림 아이콘 (읽지 않은 개수 배지)
- `NotificationDropdown`: 알림 목록 드롭다운
- `NotificationItem`: 개별 알림 아이템
- `NotificationSettings`: 알림 설정 페이지
- `/settings` 페이지 추가

---

### ✅ Phase 5 - 모바일 최적화 & PWA (2025-11-21)

**커밋**: `f55efb2 - feat: Implement Phase 5 - Mobile optimization and PWA`

#### 1. PWA 구현
- `@ducanh2912/next-pwa` 설치 (Next.js 16 호환)
- `manifest.json` 생성
- 오프라인 캐싱, 설치 가능한 앱

#### 2. 반응형 최적화
- 모든 페이지 반응형 패딩 (`py-4 md:py-8`, `px-3 md:px-4`)
- 반응형 폰트 크기 (`text-2xl md:text-3xl`)
- 모바일: 버튼 라벨 축약 (예: "새 게시글" → "New")

#### 3. 모바일 전용 UI
- NotificationDropdown: 데스크톱 드롭다운 / 모바일 전체화면 모달
- 터치 친화적 버튼 크기

#### 4. Vercel 배포 이슈 해결
- Turbopack/webpack 충돌 해결
- `turbopack: {}` 설정 추가

---

### ✅ Phase 6 - 고급 기능 (2025-11-21)

#### Part 1: 통합 검색 시스템
**커밋**: `ac15d0b - feat: Implement Phase 6 - Advanced search functionality`

- **통합 검색 API**: `/api/search` (Posts, Comments, Todos 검색)
- **SearchDialog**: ⌘K/Ctrl+K 키보드 단축키 모달
- **디바운싱**: 500ms 디바운스로 API 호출 최적화
- **타입별 필터링**: 전체/게시글/댓글/할일 필터
- **검색 결과 그룹화**: 타입별로 결과 분리 표시

#### Part 2: 파일 공유 시스템
**커밋**: `e1dd3b3 - feat: Implement Phase 6 - File sharing system`

- **File 모델**: name, originalName, url, fileType, fileSize, description, uploaderId
- **파일 업로드 API**: `/api/files` POST (Cloudinary raw resource type)
- **파일 타입 검증**: PDF, DOC, DOCX, XLS, XLSX, TXT만 허용
- **파일 목록/삭제 API**: GET, DELETE `/api/files/[id]`
- **UI 컴포넌트**:
  - `FileUploadForm`: 파일 선택, 설명 입력, 업로드
  - `FileList`: 파일 목록, 다운로드, 삭제 버튼
  - `FilesContainer`: 업로드 폼 + 목록 통합
- **Files 페이지**: `/files` (네비게이션 추가)
- **권한 관리**: 본인 또는 관리자만 삭제 가능

#### Part 3: 캘린더 통합
**커밋**: `f6bc9e9 - feat: Implement Phase 6 Part 3 - Calendar integration`

- **CalendarEvent 모델**: title, description, startAt, endAt, location, color, isAllDay
- **캘린더 이벤트 API**: CRUD 엔드포인트 (`/api/calendar`)
- **월간 캘린더 뷰**: date-fns 활용, 그리드 형식
- **이벤트 관리**:
  - EventForm: 일정 생성/수정 폼 (날짜/시간, 장소, 색상)
  - EventDetailModal: 상세보기, 수정, 삭제
  - CalendarContainer: 모달 상태 관리
- **기능**:
  - 하루 종일 이벤트 / 시간 지정 이벤트
  - 색상 코딩으로 시각적 구분
  - 권한 관리 (생성자 또는 관리자만 수정/삭제)
  - 월 단위 네비게이션 (이전/다음/오늘)
- **Calendar 페이지**: `/calendar` (네비게이션 추가)

---

## 진행 중인 작업 (In Progress)

현재 모든 주요 기능이 완료되었습니다! 🎉

### 향후 개선 사항 (선택사항)
- [ ] 캘린더 일정 알림 자동화
- [ ] 주간 뷰 추가
- [ ] 일정 반복 설정 (매일/매주/매월)
- [ ] 일정 공유 및 초대
- [ ] iCalendar 포맷 내보내기

---

## 기술 스택 (Tech Stack)

### 프론트엔드
- **Framework**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **상태관리**: TanStack Query (React Query)
- **폼 관리**: React Hook Form + Zod
- **실시간**: Socket.IO Client

### 백엔드
- **Framework**: Next.js API Routes
- **데이터베이스**: PostgreSQL
- **ORM**: Prisma
- **인증**: JWT (Cookie-based)
- **실시간**: Socket.IO Server

### 서비스
- **이미지 저장**: Cloudinary (25GB 무료)
- **배포**: Vercel (예정)

---

## 주요 패턴 및 최적화

### 1. 무한 스크롤 패턴
```typescript
// Cursor-based pagination
const posts = await prisma.post.findMany({
  take: limit + 1,
  ...(cursor && {
    cursor: { createdAt: new Date(cursor) },
    skip: 1,
  }),
})
let nextCursor = posts.length > limit ? posts.pop()!.createdAt.toISOString() : undefined
```

### 2. Optimistic Updates (Pages 구조)
```typescript
queryClient.setQueriesData<any>({ queryKey: ['todos'] }, (old: any) => {
  if (!old?.pages) return old
  return {
    ...old,
    pages: old.pages.map((page: any) => ({
      ...page,
      todos: page.todos.map((todo: any) =>
        todo.id === todoId ? { ...todo, isDone } : todo
      ),
    })),
  }
})
```

### 3. Debounced Search
```typescript
const [search, setSearch] = useState('')
const [debouncedSearch, setDebouncedSearch] = useState('')

useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(search), 300)
  return () => clearTimeout(timer)
}, [search])
```

### 4. Socket.IO Room-based Messaging
```typescript
// Join room
socket.emit('join-room', roomId)

// Listen for messages
socket.on('new-message', handleNewMessage)

// Broadcast to room
io.to(roomId).emit('new-message', message)
```

### 5. Typing Indicator with Auto-stop
```typescript
// Start typing
if (!isTyping) {
  setIsTyping(true)
  socket.emit('typing-start', { roomId, userId, userName })
}

// Auto-stop after 3 seconds
typingTimeoutRef.current = setTimeout(() => {
  setIsTyping(false)
  socket.emit('typing-stop', { roomId, userId })
}, 3000)
```

---

## 데이터베이스 스키마 변경 이력

### Phase 1.5 - 이미지 업로드
```prisma
model Post {
  // ... 기존 필드
  imageUrl  String?  @db.VarChar(500)  // 추가됨
}

model Comment {
  // ... 기존 필드
  imageUrl  String?  @db.VarChar(500)  // 추가됨
}
```

### ChatMessage (기존)
```prisma
model ChatMessage {
  id        String   @id @default(cuid())
  roomId    String
  senderId  String
  content   String   @db.Text
  imageUrl  String?  @db.VarChar(500)  // Phase 2에서 추가됨
  createdAt DateTime @default(now())

  room   ChatRoom     @relation(...)
  sender FamilyMember @relation(...)
}
```

---

## 성능 최적화

### 완료된 최적화
1. **이미지 최적화**:
   - Cloudinary 자동 WebP 변환
   - 1200x1200 크기 제한
   - Next.js Image 컴포넌트 사용

2. **무한 스크롤**:
   - 필요한 데이터만 로드 (10-20개씩)
   - Cursor-based pagination (offset 대비 효율적)
   - Intersection Observer (스크롤 이벤트 대비 성능 우수)

3. **실시간 통신**:
   - 폴링 제거 → WebSocket으로 전환
   - Room-based messaging으로 불필요한 이벤트 제거
   - Optimistic updates로 UX 개선

4. **컴포넌트 최적화**:
   - `React.memo` 사용 (CommentItem 등)
   - `useMemo`, `useCallback` 활용
   - 적절한 key 사용

---

## 다음 단계 (Next Steps)

### Phase 3 Part 2 - 읽음 표시 & 알림
1. **읽음 표시 구현**
   - [ ] DB 스키마 수정 (readBy 필드 추가)
   - [ ] 읽음 상태 추적 로직
   - [ ] UI 표시 (체크 마크 등)

2. **알림 시스템**
   - [ ] 알림 데이터 모델 설계
   - [ ] 새 메시지/댓글/포스트 알림
   - [ ] 알림 목록 UI
   - [ ] 읽음 처리

### Phase 4 - 테스트 & 배포 (제안)
1. **테스트**
   - [ ] E2E 테스트 (Playwright)
   - [ ] Unit 테스트 (주요 hooks)
   - [ ] API 테스트

2. **배포 준비**
   - [ ] 환경 변수 검증
   - [ ] DB 마이그레이션 스크립트
   - [ ] Vercel 배포 설정
   - [ ] 프로덕션 최적화

### Phase 5 - 추가 개선 (선택사항)
1. **UX 개선**
   - [ ] 다크모드
   - [ ] 파일 드래그 앤 드롭
   - [ ] 이미지 미리보기 모달
   - [ ] 오프라인 지원

2. **보안 강화**
   - [ ] Rate limiting
   - [ ] CSRF 보호 강화
   - [ ] XSS 방지

3. **모니터링**
   - [ ] 에러 모니터링 (Sentry)
   - [ ] 성능 모니터링
   - [ ] 로깅 시스템

---

## 커밋 히스토리

| 커밋 | 날짜 | 설명 |
|------|------|------|
| `e09f917` | 2025-11-18 | Phase 3 Part 1: 타이핑 인디케이터 & 온라인/오프라인 상태 |
| `5f450ba` | 2025-11-18 | Phase 2: 실시간 채팅 with Socket.IO |
| `3aeae9b` | 2025-11-18 | Phase 1.5: 검색 기능 |
| `b0c8771` | 2025-11-18 | Phase 1.5: 댓글 이미지 업로드 |
| `792196b` | 2025-11-18 | Phase 1.5: 포스트 이미지 업로드 (Cloudinary) |
| `12b5e7e` | 2025-11-18 | Phase 1.5: 무한 스크롤 페이지네이션 |
| `af40001` | 이전 | 종합 문서화 |
| `91960c1` | 이전 | 성능 최적화 (PERF-001) |
| `03cc455` | 이전 | 에러 핸들링 시스템 (ERROR-001) |

---

## 알려진 이슈 및 제한사항

### 현재 제한사항
1. **읽음 표시**: 아직 구현되지 않음
2. **알림 시스템**: 아직 구현되지 않음
3. **오프라인 지원**: WebSocket 연결 끊김 시 재연결 로직만 존재
4. **파일 업로드**: 이미지만 지원 (문서 등 미지원)

### 개선 예정
1. Socket.IO 연결 복원력 강화
2. 에러 바운더리 추가
3. 로딩 상태 개선
4. 접근성 (a11y) 개선

---

## 문서 업데이트
- **최초 작성**: 2025-11-18
- **최종 수정**: 2025-11-18
- **작성자**: Claude (AI Assistant)
