# Family App - 다음 세션 가이드

> **작성일**: 2026-01-08
> **세션 종료 시점**: 이모지 리액션 구현 거의 완료, 테스트 필요

---

## ✅ 이번 세션 완료 작업

### 1. 채팅방 핵심 기능 완성
- ✅ 날짜 구분선 ("오늘", "어제", "1월 8일")
- ✅ 답장/인용 기능 (replyToId DB + UI)
- ✅ 메시지 상태 표시 (⏱️ 전송중 / ✓ 완료 / ⚠️ 실패 + 재전송)
- ✅ 읽음 표시 ("1", "2" + ✓✓ 아이콘)
- ✅ 이모지 리액션 (DB + API + UI 구현 완료, **테스트 필요**)

### 2. 문서화 완료
- ✅ `docs/CHAT_IMPROVEMENT_PLAN.md` - 채팅 개선 계획
- ✅ `docs/APP_IMPROVEMENT_PLAN.md` - 전체 앱 개선 계획

---

## 🔄 이모지 리액션 현재 상태

### ✅ 완료된 작업

#### 1. DB 스키마 (완료)
```prisma
model MessageReaction {
  id        String   @id @default(cuid())
  messageId String
  userId    String
  emoji     String   @db.VarChar(10)
  createdAt DateTime @default(now())

  @@unique([messageId, userId, emoji])
}
```
- Prisma migration 완료
- ChatMessage에 reactions relation 추가

#### 2. API 엔드포인트 (완료)
**파일**: `app/api/chat/messages/[messageId]/reactions/route.ts`

**기능**:
- POST 요청으로 리액션 추가/제거 (토글)
- 같은 이모지 재클릭 시 삭제
- Socket.IO `message-reaction` 이벤트 전송

**작동 방식**:
```typescript
// 리액션 추가
POST /api/chat/messages/{messageId}/reactions
Body: { emoji: "👍" }

// 같은 리액션 재클릭 → 삭제
```

#### 3. UI 컴포넌트 (완료)

**`components/chat/emoji-picker.tsx`**:
- Popover로 이모지 선택 UI
- 12개 자주 쓰는 이모지 (👍 ❤️ 😂 😮 😢 🙏 등)
- 그리드 레이아웃 (6x2)

**`components/chat/message-reactions.tsx`**:
- 이모지별 그룹핑 + 개수 표시
- 내가 리액션한 이모지 강조 표시
- Tooltip으로 리액션한 사람 목록
- 클릭 시 리액션 토글

**`components/chat/message-item.tsx` 수정**:
- 메시지 hover 시 이모지 버튼 표시
- 메시지 하단에 리액션 목록 표시
- `handleReaction()` 핸들러 구현

#### 4. 실시간 동기화 (완료)

**`components/chat/message-list.tsx`**:
- Socket.IO `message-reaction` 이벤트 리스너 추가
- 리액션 추가/제거 시 실시간 UI 업데이트
- TanStack Query 캐시 업데이트

**Socket.IO 이벤트**:
```typescript
socket.on('message-reaction', (data) => {
  // messageId, userId, emoji, action ('added' | 'removed')
})
```

#### 5. UI 라이브러리 (완료)
- `@radix-ui/react-popover` 설치
- `@radix-ui/react-tooltip` 설치
- `components/ui/popover.tsx` 생성
- `components/ui/tooltip.tsx` 생성

---

## ⚠️ 다음 세션에서 해야 할 작업

### 🔴 우선순위 1: 이모지 리액션 완성 (Codex 위임)

#### 1. Socket.IO 서버 이벤트 핸들러 확인/추가
**파일**: 찾아야 함 (`server.ts` 또는 Socket.IO 설정 파일)

**필요한 작업**:
- `message-reaction` 이벤트 핸들러가 있는지 확인
- 없다면 추가:
```typescript
socket.on('message-reaction', (data) => {
  io.to(roomId).emit('message-reaction', data)
})
```

**참고**:
- API route에서 이미 emit 하고 있음: `app/api/chat/messages/[messageId]/reactions/route.ts:83-91`
- 하지만 서버 측 핸들러도 필요할 수 있음

#### 2. 빌드 테스트 및 타입 에러 수정
```bash
npm run build
```

**예상 이슈**:
- Popover, Tooltip 컴포넌트 import 문제
- 타입 에러 (reactions 타입 정의)

#### 3. 실제 기능 테스트
- [ ] 메시지에 이모지 리액션 추가
- [ ] 같은 이모지 재클릭 → 삭제 확인
- [ ] 여러 사람이 같은 이모지 → 숫자 증가 확인
- [ ] 다른 브라우저/탭에서 실시간 동기화 확인
- [ ] Tooltip 표시 (리액션한 사람 이름)

#### 4. 버그 수정 (발견 시)
- 리액션 중복 추가 방지
- Socket.IO 이벤트 누락 처리
- UI 깨짐 현상

---

## 🟡 우선순위 2: 남은 채팅 기능

### 동영상 + 다중 파일 첨부
**참고**: `docs/APP_IMPROVEMENT_PLAN.md` 섹션 2

**작업 내용**:
1. Cloudinary Widget 통합 (클라이언트 직접 업로드)
2. DB 스키마 수정 (`imageUrl` → `mediaUrls[]`)
3. 여러 파일 선택 UI
4. 동영상 재생 UI

**예상 시간**: 2시간

---

## 🟢 우선순위 3: 설정 페이지 간소화
**참고**: `docs/APP_IMPROVEMENT_PLAN.md` 섹션 6

**작업 내용**:
1. 간소화된 설정 메뉴 (4개 항목)
2. 아이콘 + 설명 UI
3. 관리자 메뉴 분리

**예상 시간**: 30분

---

## 📝 Codex를 위한 체크리스트

### 시작 전 확인
- [ ] `README.md` 읽기
- [ ] `CLAUDE.md` 읽기 (협업 프로토콜)
- [ ] `CODEX.md` 읽기 (Codex 작업 가이드)
- [ ] 이 문서 (`NEXT_SESSION_2026-01-08.md`) 정독

### 이모지 리액션 완성 작업
- [ ] Socket.IO 서버 파일 찾기
- [ ] `message-reaction` 이벤트 핸들러 추가/확인
- [ ] `npm run build` 실행 → 에러 수정
- [ ] 로컬 서버 실행 (`npm run dev`)
- [ ] 기능 테스트 (위 3번 체크리스트)
- [ ] 버그 발견 시 수정
- [ ] 모든 테스트 통과 시 완료 보고

### 완료 보고 형식
```markdown
✅ 이모지 리액션 완료

**수정한 파일**:
- server.ts (또는 Socket.IO 파일)
- (기타 수정 파일)

**수정 내용**:
- message-reaction 이벤트 핸들러 추가
- 타입 에러 수정: ...

**테스트 결과**:
- ✅ 리액션 추가/삭제 정상 작동
- ✅ 실시간 동기화 확인
- ✅ Tooltip 표시 정상
- ✅ 빌드 성공

**발견된 이슈**:
- (없음 또는 이슈 설명)
```

---

## 🗂️ 주요 파일 위치

### 이모지 리액션 관련
```
app/api/chat/messages/[messageId]/reactions/route.ts  # API
components/chat/emoji-picker.tsx                       # 이모지 선택 UI
components/chat/message-reactions.tsx                  # 리액션 표시
components/chat/message-item.tsx                       # 메시지 (수정됨)
components/chat/message-list.tsx                       # Socket.IO 이벤트
components/ui/popover.tsx                              # Popover 컴포넌트
components/ui/tooltip.tsx                              # Tooltip 컴포넌트
prisma/schema.prisma                                   # DB 스키마
```

### 채팅 관련
```
app/api/chat/rooms/[roomId]/messages/route.ts         # 메시지 API
app/api/chat/messages/[messageId]/read/route.ts       # 읽음 처리
lib/hooks/use-chat.ts                                  # TanStack Query
```

### 문서
```
docs/CHAT_IMPROVEMENT_PLAN.md      # 채팅 개선 계획
docs/APP_IMPROVEMENT_PLAN.md       # 전체 앱 개선 계획
docs/NEXT_SESSION_2026-01-08.md    # 이 문서
```

---

## 🔍 디버깅 팁

### Socket.IO 이벤트 확인
```typescript
// 브라우저 콘솔에서
socket.on('message-reaction', (data) => {
  console.log('Reaction event:', data)
})
```

### React Query 캐시 확인
```typescript
// 브라우저 콘솔에서
queryClient.getQueryData(['chat', roomId, 'messages'])
```

### DB 확인
```bash
npx prisma studio
# MessageReaction 테이블 확인
```

---

## 🎯 최종 목표

### 채팅 기능 완성 기준
- ✅ 날짜 구분선
- ✅ 답장/인용
- ✅ 메시지 상태 표시
- ✅ 읽음 표시
- 🔄 이모지 리액션 (테스트 필요)
- 🔜 동영상 + 다중 파일
- 🔜 설정 페이지 간소화

### 완료 시
→ **왓츠앱/카카오톡 수준의 가족 채팅 완성** 🎉

---

**Last Updated**: 2026-01-08 (세션 종료)
**Next Session**: 이모지 리액션 테스트 & 완성부터 시작
**Assigned To**: Codex (우선) → Claude (검토)
