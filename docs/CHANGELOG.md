# Family App Changelog

## 2025-11-18

### Added
- Cloudinary 환경변수 설정 (.env)
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
- Vercel 환경변수 설정 완료

### Fixed
- Prisma cursor 타입 에러 수정
  - `app/api/posts/route.ts`: cursor createdAt → id
  - `app/api/todos/route.ts`: cursor createdAt → id
- Vercel 빌드 성공 (TypeScript 컴파일 통과)

### Changed
- Cursor 필드를 unique field (id) 사용으로 변경

### Commits
- `43e51dc`: fix: use id instead of createdAt for Prisma cursor
- `1706f3e`: fix: use id cursor in todos API

---

## 2025-11-17

### Added
- 실시간 채팅 기능 완전 구현
- 타이핑 인디케이터
- 온라인/오프라인 상태 표시
- 이미지 업로드 (게시글, 댓글)

### Documentation
- `DEVELOPMENT_PROGRESS.md` 업데이트
- 전체 개발 진행 상황 문서화

### Commits
- `dc815ae`: docs: Add comprehensive development progress documentation

---

## Earlier (Pre-2025-11-17)

### Phase 2: 실시간 채팅
- Socket.IO 서버 구현
- 채팅방 기능
- 메시지 CRUD

### Phase 1: 기본 기능
- 사용자 인증 시스템
- 게시판 시스템
- Todo 관리
- 관리자 페이지

---

**Last Updated**: 2025-11-18
