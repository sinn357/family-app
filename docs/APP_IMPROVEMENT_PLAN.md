# Family App - 전체 앱 개선 계획

> **목표**: 왓츠앱/카카오톡 수준의 통합 가족 앱 완성
> **작성일**: 2026-01-08

---

## 📋 개선 계획 개요

### 완료된 작업
1. ✅ **홈 = 채팅** (완료)
   - 날짜 구분선 추가
   - 답장/인용 기능
   - 메시지 상태 표시
2. ✅ **이미지/동영상 첨부 개선**
3. ✅ **할일 + 캘린더 결합**
4. ✅ **사진 + 파일 통합**
5. ✅ **Cloudinary 직접 업로드**
6. ✅ **설정 페이지 간소화**

### 진행 예정 작업
- 없음

---

## 2️⃣ 이미지/동영상 첨부 개선

### 현재 상태
- 이미지 1장만 첨부 가능
- Cloudinary 사용 중
- 5MB 제한 (Vercel 경유)

### 개선 목표
```
<Button> + </Button> 클릭 시:
┌─────────────────┐
│ 📷 사진 촬영     │
│ 🖼️ 사진 선택    │
│ 🎥 동영상 선택   │
└─────────────────┘
```

### 구현 사항

#### 1. 모바일 파일 선택
```tsx
// components/ui/media-upload.tsx
<input
  type="file"
  accept="image/*,video/*"
  capture="camera"  // 모바일에서 카메라 직접 실행
  multiple
/>
```

#### 2. 파일 타입별 처리
- 📷 **사진**: JPG, PNG, WEBP
- 🎥 **동영상**: MP4, MOV, AVI (최대 100MB)
- 📎 **파일**: PDF, DOC, XLS 등

#### 3. UI 개선
- 첨부 버튼 클릭 → 모달 또는 액션 시트
- 미리보기 썸네일 그리드
- 진행률 표시 (업로드 중)

### 예상 시간
**1.5시간**

---

## 3️⃣ 할일 + 캘린더 결합

### 현재 상태
- `Todo` 모델: 제목, 설명, 완료 여부, 담당자
- 마감일 없음

### 개선 목표

#### UI 레이아웃
```
┌─────────────────────┐
│ 할일  [📋 리스트▼] │ ← 토글: 리스트 ↔ 캘린더
├─────────────────────┤
│ [리스트 뷰]         │  또는  [캘린더 뷰]
│ ☐ 할일 1 (D-3)     │        [ 1  2  3 ]
│ ☑ 할일 2           │        [ 4 ●5  6 ]
│ ☐ 할일 3 (오늘)    │        [ 7  8  9 ]
└─────────────────────┘
```

### DB 스키마 수정

```prisma
model Todo {
  // 기존 필드들...
  dueDate   DateTime? // 마감일 추가
  priority  Priority  @default(MEDIUM) // 우선순위
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### 구현 사항

#### 1. 리스트 뷰 (기본)
- 할일 목록 (기존과 동일)
- 마감일 표시 (D-day 형식)
- 우선순위별 색상 구분

#### 2. 캘린더 뷰
**라이브러리**: `react-big-calendar` 또는 `@fullcalendar/react`

```tsx
// components/todos/calendar-view.tsx
import { Calendar } from 'react-big-calendar'

<Calendar
  events={todos.map(todo => ({
    title: todo.title,
    start: todo.dueDate,
    end: todo.dueDate,
    resource: todo,
  }))}
  onSelectSlot={(slot) => {
    // 날짜 클릭 → 그 날짜로 할일 추가
    setNewTodoDate(slot.start)
    openTodoModal()
  }}
/>
```

#### 3. 할일 추가
- **리스트 뷰**: "할일 + 마감일 (선택)"
- **캘린더 뷰**: 날짜 클릭 → 그 날 할일 자동 설정

#### 4. 추가 기능
- 오늘 할일 강조
- 지난 할일 회색 처리
- 반복 할일 (선택 사항)

### 예상 시간
**3시간**

### 필요한 패키지
```bash
npm install react-big-calendar
# 또는
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction
```

---

## 4️⃣ 사진 + 파일 결합

### 현재 상태
- `Photo` 모델: 앨범, 이미지 URL, 캡션
- `File` 모델: 파일명, URL, 타입, 크기
- 별도 페이지

### 개선 목표

#### UI 레이아웃
```
┌─────────────────────┐
│ [사진] [파일]       │ ← 탭 전환
├─────────────────────┤
│ 📷 📷 📷 📷         │ ← 사진 탭: 그리드 뷰
│ 📷 📷 📷 📷         │   (인스타그램 스타일)
│ 📷 📷 📷 📷         │
├─────────────────────┤
│ 📄 report.pdf       │ ← 파일 탭: 리스트 뷰
│ 📊 budget.xlsx      │   (파일명, 크기, 날짜)
│ 🎵 song.mp3         │
└─────────────────────┘
```

### DB 스키마 통합

#### Option 1: 기존 테이블 유지 (권장)
- `Photo` 테이블 유지
- `File` 테이블 유지
- UI만 탭으로 통합

#### Option 2: Media 테이블로 통합
```prisma
model Media {
  id          String      @id @default(cuid())
  type        MediaType   // IMAGE, VIDEO, DOCUMENT, AUDIO
  url         String      @db.VarChar(1000)
  thumbnailUrl String?    @db.VarChar(1000)
  fileName    String      @db.VarChar(500)
  fileSize    Int
  mimeType    String      @db.VarChar(100)
  uploaderId  String
  albumId     String?     // 사진인 경우만
  caption     String?     @db.Text
  createdAt   DateTime    @default(now())

  uploader FamilyMember @relation(...)
  album    Album?       @relation(...)

  @@map("media")
}

enum MediaType {
  IMAGE
  VIDEO
  DOCUMENT
  AUDIO
}
```

### 구현 사항

#### 1. 사진 탭 (그리드 뷰)
```tsx
// components/media/photo-grid.tsx
<div className="grid grid-cols-3 gap-1">
  {photos.map(photo => (
    <Image
      src={photo.url}
      alt={photo.caption}
      className="aspect-square object-cover"
      onClick={() => openLightbox(photo)}
    />
  ))}
</div>
```

#### 2. 파일 탭 (리스트 뷰)
```tsx
// components/media/file-list.tsx
<div className="divide-y">
  {files.map(file => (
    <div className="flex items-center gap-3 p-3">
      <FileIcon type={file.mimeType} />
      <div className="flex-1">
        <p className="font-medium">{file.fileName}</p>
        <p className="text-sm text-muted-foreground">
          {formatFileSize(file.fileSize)} · {formatDate(file.createdAt)}
        </p>
      </div>
      <DownloadButton url={file.url} />
    </div>
  ))}
</div>
```

#### 3. 라이트박스 (사진 확대)
```bash
npm install yet-another-react-lightbox
```

```tsx
import Lightbox from 'yet-another-react-lightbox'

<Lightbox
  open={open}
  close={() => setOpen(false)}
  slides={photos.map(p => ({ src: p.url }))}
/>
```

### 예상 시간
**2시간**

---

## 5️⃣ Cloudinary 직접 업로드 (Widget)

### 현재 문제
- Vercel 경유 → 5MB 제한
- 동영상 업로드 불가능

### 개선 방안

#### Cloudinary Upload Widget (클라이언트 직접 업로드)
```tsx
// components/ui/cloudinary-upload-widget.tsx
import { useEffect } from 'react'

export function CloudinaryUploadWidget({ onUpload }: Props) {
  useEffect(() => {
    const widget = (window as any).cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: 'family_unsigned', // Unsigned preset
        sources: ['local', 'camera'],
        multiple: true,
        maxFiles: 10,
        maxFileSize: 100000000, // 100MB
        resourceType: 'auto', // image, video, raw
        clientAllowedFormats: ['jpg', 'png', 'gif', 'mp4', 'mov', 'pdf', 'doc'],
      },
      (error: any, result: any) => {
        if (!error && result.event === 'success') {
          onUpload({
            url: result.info.secure_url,
            publicId: result.info.public_id,
            format: result.info.format,
            resourceType: result.info.resource_type,
            bytes: result.info.bytes,
          })
        }
      }
    )

    widget.open()
  }, [onUpload])

  return null
}
```

#### Cloudinary 설정

**1. Unsigned Upload Preset 생성**
- Cloudinary Dashboard → Settings → Upload
- Add upload preset
- Signing Mode: **Unsigned**
- Preset name: `family_unsigned`

**2. 환경변수**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=family_unsigned
```

**3. Script 추가**
```tsx
// app/layout.tsx
<Script
  src="https://upload-widget.cloudinary.com/global/all.js"
  strategy="lazyOnload"
/>
```

### 구현 사항

#### 1. 버튼 클릭 시 Widget 실행
```tsx
// components/chat/message-input.tsx
const handleUploadClick = () => {
  const widget = (window as any).cloudinary.createUploadWidget(config, callback)
  widget.open()
}

<Button onClick={handleUploadClick}>
  📎 파일 첨부
</Button>
```

#### 2. 업로드 결과 처리
```tsx
const handleUploadSuccess = (result: CloudinaryResult) => {
  const mediaUrl = result.url
  const mediaType = result.resourceType // 'image' | 'video' | 'raw'

  // DB에 저장
  if (mediaType === 'image' || mediaType === 'video') {
    // 채팅 메시지에 첨부
    form.setValue('imageUrl', mediaUrl)
  } else {
    // 파일로 저장
    saveFile({ url: mediaUrl, name: result.originalFilename })
  }
}
```

### 장점
- ✅ Vercel 우회 → 100MB 업로드 가능
- ✅ 동영상 지원
- ✅ 자동 최적화 (이미지 압축, 포맷 변환)
- ✅ 업로드 진행률 UI 제공
- ✅ 여러 파일 동시 업로드

### 무료 플랜 제한
- 25 크레딧/월
- 약 25GB 저장소
- 약 25GB 대역폭

### 예상 시간
**1시간**

---

## 6️⃣ 설정 페이지 간소화

### 현재 상태
- 복잡한 설정 메뉴
- 사용하지 않는 옵션들

### 개선 목표

#### UI 레이아웃
```
⚙️ 설정
├─ 🔔 알림 설정
├─ 👤 내 정보 수정
├─ 🔒 비밀번호 변경
└─ 🚪 로그아웃
```

### 구현 사항

#### 1. 간소화된 설정 페이지
```tsx
// app/(protected)/settings/page.tsx
export default function SettingsPage() {
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">설정</h1>

      <div className="space-y-2">
        {/* 알림 설정 */}
        <Link href="/settings/notifications">
          <Card className="p-4 hover:bg-accent cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <div className="flex-1">
                <h3 className="font-medium">알림 설정</h3>
                <p className="text-sm text-muted-foreground">
                  알림 유형별 수신 설정
                </p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </Card>
        </Link>

        {/* 내 정보 수정 */}
        <Link href="/settings/profile">
          <Card className="p-4 hover:bg-accent cursor-pointer">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5" />
              <div className="flex-1">
                <h3 className="font-medium">내 정보 수정</h3>
                <p className="text-sm text-muted-foreground">
                  이름, 프로필 사진 변경
                </p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </Card>
        </Link>

        {/* 비밀번호 변경 */}
        <Link href="/settings/password">
          <Card className="p-4 hover:bg-accent cursor-pointer">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5" />
              <div className="flex-1">
                <h3 className="font-medium">비밀번호 변경</h3>
                <p className="text-sm text-muted-foreground">
                  보안을 위해 주기적으로 변경하세요
                </p>
              </div>
              <ChevronRight className="w-5 h-5" />
            </div>
          </Card>
        </Link>

        {/* 로그아웃 */}
        <Card
          className="p-4 hover:bg-accent cursor-pointer"
          onClick={handleLogout}
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-destructive" />
            <div className="flex-1">
              <h3 className="font-medium text-destructive">로그아웃</h3>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
```

#### 2. 관리자 전용 메뉴
```tsx
// 관리자인 경우에만 표시
{session.member.role === 'ADMIN' && (
  <Link href="/admin">
    <Card className="p-4 hover:bg-accent cursor-pointer">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5" />
        <div className="flex-1">
          <h3 className="font-medium">관리자 설정</h3>
          <p className="text-sm text-muted-foreground">
            가족 구성원 관리
          </p>
        </div>
        <ChevronRight className="w-5 h-5" />
      </div>
    </Card>
  </Link>
)}
```

### 예상 시간
**30분**

---

## 📊 전체 구현 순서 (권장)

### Week 1: 채팅 완성
1. ✅ 날짜 구분선 (완료)
2. ✅ 답장 기능 (완료)
3. ✅ 메시지 상태 (완료)
4. 🔄 읽음 표시 (진행 예정)
5. 🔄 이모지 리액션 (진행 예정)

### Week 2: 미디어 강화
6. ✅ Cloudinary Widget (완료)
7. ✅ 이미지/동영상 첨부 개선 (완료)
8. ✅ 사진 + 파일 통합 (완료)

### Week 3: 생산성 기능
9. ✅ 할일 + 캘린더 결합 (완료)
10. ✅ 설정 페이지 간소화 (완료)

**총 예상 시간**: 약 8시간

---

## 🎯 완료 기준

### 이미지/동영상 첨부
- [x] 사진/동영상 선택 UI
- [x] 모바일 카메라 직접 실행
- [x] 여러 파일 동시 선택 (최대 10개)
- [x] 미리보기 그리드
- [x] 동영상 재생 가능

### 할일 + 캘린더
- [x] Todo 모델에 `dueDate` 추가
- [x] 리스트 뷰 ↔ 캘린더 뷰 토글
- [x] 캘린더에서 날짜 클릭 → 할일 추가
- [x] D-day 표시
- [x] 우선순위별 색상

### 사진 + 파일
- [x] 사진 탭 (그리드 뷰)
- [x] 파일 탭 (리스트 뷰)
- [x] 라이트박스 (사진 확대)
- [x] 파일 다운로드
- [x] 파일 크기 표시

### Cloudinary Widget
- [x] Unsigned Upload Preset 설정
- [x] Widget 통합
- [x] 100MB 파일 업로드 성공
- [x] 동영상 업로드 성공
- [x] 진행률 표시

### 설정 페이지
- [x] 간소화된 메뉴 (4개 항목)
- [x] 아이콘 + 설명 UI
- [x] 관리자 메뉴 분리
- [x] 모바일 최적화

---

**Last Updated**: 2026-01-08
**담당**: Claude + User
