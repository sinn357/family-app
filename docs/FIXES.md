# Family App - Error Fixes

## 2025-11-18

### Prisma Cursor Type Error (TypeScript)

**Error Message**:
```
Type error: Argument of type '{ cursor: { createdAt: Date } }'
is not assignable to parameter type 'TodoWhereUniqueInput'
Property 'id' is missing
```

**Affected Files**:
- `app/api/posts/route.ts:34`
- `app/api/todos/route.ts:42`

**Root Cause**:
- Prisma cursor는 unique field만 사용 가능
- `createdAt`는 unique가 아님
- `id`는 unique field (기본키)

**Solution**:
```typescript
// Before (❌)
cursor: {
  createdAt: new Date(cursor),
}

// After (✅)
cursor: {
  id: cursor,
}
```

**Commits**:
- `43e51dc`: fix: use id instead of createdAt for Prisma cursor
- `1706f3e`: fix: use id cursor in todos API

**Pattern Added**: ERROR_PATTERNS.md 업데이트 예정

---

### Vercel Build Failure (Environment Variables)

**Error**: Vercel 배포 시 빌드 실패

**Root Cause**:
- Vercel 환경변수 미설정

**Solution**:
1. Vercel Dashboard → Settings → Environment Variables
2. 로컬 `.env` 파일의 모든 변수 추가
3. Production, Preview, Development 모두 체크
4. Redeploy

**Result**: 빌드 성공

---

**Last Updated**: 2025-11-18
