# 🤝 Codex Handoff - 이모지 리액션 완성

> **From**: Claude Sonnet 4.5
> **To**: Codex
> **Date**: 2026-01-08
> **Task Type**: 테스트 & 버그 수정 & 완성

---

## ✅ 설계 완료. Codex Task:

### 상태 업데이트
- 이 문서에 기재된 작업은 완료되었습니다.

### 📋 작업 목록

**우선순위 1 (필수)**: 이모지 리액션 기능 완성
1. **Socket.IO 서버 이벤트 핸들러 확인/추가** - 예상 15분
   - 파일 찾기: `server.ts` 또는 Socket.IO 설정 파일
   - `message-reaction` 이벤트 핸들러 있는지 확인
   - 없으면 추가 (아래 템플릿 참고)

2. **빌드 테스트 및 에러 수정** - 예상 20분
   - `npm run build` 실행
   - TypeScript 에러 수정
   - Import 문제 해결

3. **실제 기능 테스트** - 예상 20분
   - 로컬 서버 실행 (`npm run dev`)
   - 리액션 추가/삭제 테스트
   - 실시간 동기화 확인
   - Tooltip 표시 확인

4. **버그 수정** - 예상 10분
   - 발견된 버그 수정
   - 엣지 케이스 처리

---

## 📁 작업할 파일들

### 1. Socket.IO 서버 파일 (찾아서 수정)
**가능한 위치**:
- `server.ts`
- `server.js`
- `lib/socket.ts`
- `app/api/socket/route.ts`

**찾는 방법**:
```bash
# 방법 1: Socket.IO 관련 파일 검색
find /Users/woocheolshin/Documents/Vibecoding/projects/family-app -name "*.ts" -o -name "*.js" | xargs grep -l "socket.io"

# 방법 2: 이미 있는 이벤트 핸들러 찾기
grep -r "new-message\|typing-start\|message-read" --include="*.ts" --include="*.js"
```

**추가할 코드 템플릿**:
```typescript
// message-reaction 이벤트 핸들러
socket.on('message-reaction', (data: {
  messageId: string
  userId: string
  userName: string
  emoji: string
  action: 'added' | 'removed'
}) => {
  // 같은 방의 모든 사용자에게 브로드캐스트
  const roomId = data.roomId || socket.roomId // 현재 방 ID
  io.to(roomId).emit('message-reaction', data)
})
```

**참고**: API route에서 이미 emit 하고 있음 (`app/api/chat/messages/[messageId]/reactions/route.ts:83-91`)

---

### 2. 타입 에러 가능성 있는 파일

**`components/chat/message-item.tsx`**:
- `reactions` prop 타입 정의 확인
- Popover, Tooltip import 확인

**`components/chat/message-list.tsx`**:
- Socket.IO 이벤트 타입 확인

**수정 예시**:
```typescript
// 타입 에러 나면 이렇게 수정
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
```

---

## 🧪 테스트 체크리스트

### 기본 기능 테스트
- [ ] 메시지 hover → 이모지 버튼 표시
- [ ] 이모지 버튼 클릭 → Popover 열림
- [ ] 이모지 선택 → 메시지에 리액션 추가
- [ ] 같은 이모지 재클릭 → 리액션 삭제
- [ ] 여러 사람이 같은 이모지 → 숫자 증가 (예: 👍 3)
- [ ] 리액션 버튼 클릭 → 내 리액션 토글

### 실시간 동기화 테스트
- [ ] 브라우저 2개 탭 열기 (같은 채팅방)
- [ ] 탭 A에서 리액션 추가 → 탭 B에 즉시 표시
- [ ] 탭 B에서 리액션 삭제 → 탭 A에서 즉시 제거

### UI 테스트
- [ ] Tooltip hover → 리액션한 사람 이름 표시
- [ ] 내가 리액션한 이모지 강조 표시 (배경색)
- [ ] 모바일 반응형 확인

### 빌드 테스트
```bash
npm run build
# 에러 없이 성공해야 함
```

---

## ⚠️ 주의사항

### 1. Socket.IO 이벤트 핸들러
- API route에서 이미 `io.to(roomId).emit('message-reaction', ...)` 실행 중
- 서버 측 핸들러가 **반드시 필요한지** 확인
- 기존 `new-message`, `typing-start` 이벤트 핸들러 참고

### 2. 중복 리액션 방지
- DB에 `@@unique([messageId, userId, emoji])` 제약조건 있음
- API에서 이미 처리 중 (upsert 대신 findUnique → delete 또는 create)

### 3. 임시 메시지 처리
- 메시지 ID가 `temp-`로 시작하면 리액션 불가
- `message-item.tsx:91`에서 체크 필요

### 4. 타입 안정성
- `reactions` 필드가 optional (`?`)로 되어 있음
- `message.reactions?.length` 사용

---

## 📖 참고 파일

### 이미 완성된 기능 (참고용)
1. **읽음 표시**: `app/api/chat/messages/[messageId]/read/route.ts`
2. **메시지 전송**: `app/api/chat/rooms/[roomId]/messages/route.ts`
3. **Socket.IO 클라이언트**: `lib/hooks/use-socket.ts`

### 문서
- `docs/NEXT_SESSION_2026-01-08.md` - 상세 가이드
- `docs/CHAT_IMPROVEMENT_PLAN.md` - 채팅 개선 계획
- `CLAUDE.md` - 협업 프로토콜

---

## 📤 완료 보고 형식

작업 완료 시 아래 형식으로 보고해주세요:

```markdown
## ✅ 이모지 리액션 완성 완료

### 수정한 파일
1. `path/to/server.ts` - message-reaction 이벤트 핸들러 추가
2. `components/chat/message-item.tsx` - 타입 에러 수정
3. (기타...)

### 변경 내용
- Socket.IO 이벤트 핸들러 추가: `message-reaction`
- TypeScript 에러 수정: Popover import 경로
- (기타...)

### 테스트 결과
- ✅ 리액션 추가/삭제 정상 작동
- ✅ 실시간 동기화 확인 (2개 탭)
- ✅ Tooltip 표시 정상
- ✅ 빌드 성공 (`npm run build`)

### 발견된 이슈
- (없음)
또는
- ⚠️ 이슈 1: 설명...
  - 해결 방법: ...
```

---

## 🎯 목표

**이모지 리액션이 왓츠앱/메신저처럼 완벽하게 작동해야 합니다.**

- 클릭 한 번에 리액션 추가
- 재클릭으로 리액션 삭제
- 실시간 동기화 (0.1초 이내)
- 리액션한 사람 목록 Tooltip 표시

---

**Good Luck, Codex! 🚀**

**예상 총 작업 시간**: 1시간
**난이도**: 중간 (디버깅 & 테스트 위주)
