# 북마크 앱

심플하고 강력한 북마크 관리 앱입니다.

## 기술 스택

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Supabase (Auth + Database)
- **UI**: Shadcn UI + Tailwind CSS
- **인증**: Google OAuth via Supabase Auth

## 기능

- ✅ Google 로그인/로그아웃
- ✅ 심플한 원페이지 UI
- 🚧 북마크 추가/편집/삭제
- 🚧 폴더별 북마크 정리
- 🚧 태그 시스템
- 🚧 메모 기능
- 🚧 실시간 검색
- 🚧 최근 클릭 순 정렬
- 🚧 메타이미지 자동 추출

## 설정 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 API 키 확인

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. 데이터베이스 스키마 생성

Supabase SQL 에디터에서 다음 쿼리 실행:

```sql
-- 폴더 테이블
CREATE TABLE folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 북마크 테이블
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  memo TEXT,
  meta_image TEXT,
  last_clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 태그 테이블
CREATE TABLE tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- 북마크-태그 관계 테이블
CREATE TABLE bookmark_tags (
  bookmark_id UUID REFERENCES bookmarks(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (bookmark_id, tag_id)
);

-- RLS (Row Level Security) 정책 활성화
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_tags ENABLE ROW LEVEL SECURITY;

-- 폴더 정책
CREATE POLICY "Users can view own folders" ON folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own folders" ON folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own folders" ON folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own folders" ON folders FOR DELETE USING (auth.uid() = user_id);

-- 북마크 정책
CREATE POLICY "Users can view own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookmarks" ON bookmarks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- 태그 정책
CREATE POLICY "Users can view own tags" ON tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tags" ON tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tags" ON tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tags" ON tags FOR DELETE USING (auth.uid() = user_id);

-- 북마크-태그 정책
CREATE POLICY "Users can view own bookmark_tags" ON bookmark_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM bookmarks WHERE bookmarks.id = bookmark_tags.bookmark_id AND bookmarks.user_id = auth.uid())
);
CREATE POLICY "Users can insert own bookmark_tags" ON bookmark_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM bookmarks WHERE bookmarks.id = bookmark_tags.bookmark_id AND bookmarks.user_id = auth.uid())
);
CREATE POLICY "Users can delete own bookmark_tags" ON bookmark_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM bookmarks WHERE bookmarks.id = bookmark_tags.bookmark_id AND bookmarks.user_id = auth.uid())
);
```

### 5. Google OAuth 설정

1. Supabase 대시보드 → Authentication → Providers
2. Google 활성화
3. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
4. 승인된 리디렉션 URI에 `https://your-project-ref.supabase.co/auth/v1/callback` 추가
5. 클라이언트 ID와 시크릿을 Supabase에 입력

### 6. 개발 서버 실행

```bash
npm run dev
```

## 개발 계획

### Iteration 1: 기본 인프라 & 인증 ✅
- Next.js 프로젝트 초기화
- Supabase 연동
- Google OAuth 설정
- 기본 레이아웃 및 로그인/로그아웃

### Iteration 2: 데이터베이스 스키마 & 기본 CRUD 🚧
- 데이터베이스 테이블 생성
- 북마크 추가/삭제 기능
- 폴더 생성 및 관리
- 메타이미지 자동 추출

### Iteration 3: 검색 & 필터링 🚧
- 실시간 검색 기능
- 폴더별 필터링
- 태그별 필터링

### Iteration 4: 태그 시스템 & 메모 기능 🚧
- 태그 관리
- 메모 기능
- 태그 자동완성

### Iteration 5: 최근 클릭 정렬 & UI 개선 🚧
- 클릭 추적
- 정렬 기능
- UI/UX 개선

### Iteration 6: 성능 최적화 & 추가 기능 🚧
- 무한 스크롤
- 이미지 최적화
- 가져오기/내보내기

## 라이선스

MIT
