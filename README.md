# 남경기노회 행정서류 보관함

남경기노회 행정서류 보관함은 교회 행정서류를 효율적으로 관리, 검색, 다운로드할 수 있는 웹 애플리케이션입니다.

## 주요 기능
- 남경기노회 행정서류 크롤링 및 자동 저장
- IndexedDB 기반 로컬 데이터 저장/관리
- 제목/카테고리 검색 및 필터링
- 페이지네이션(페이지당 개수 선택, 처음/마지막 이동)
- 첨부파일 다운로드
- 반응형 UI 및 접근성 고려

## 기술 스택
- **Next.js** 15
- **TypeScript**
- **React**
- **Tailwind CSS**
- **IndexedDB** (로컬 데이터 저장)

## 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 폴더 구조
```
├── src/
│   ├── app/
│   │   ├── page.tsx         # 메인 페이지(전체 UI/로직)
│   │   ├── indexeddb.ts     # IndexedDB 유틸리티
│   │   └── crawler.ts       # 크롤링 관련 코드
│   └── pages/api/crawl.ts   # 크롤링 API 라우트
├── public/
├── docs/                    # 문서 및 참고자료
├── .gitignore
├── README.md
└── package.json
```

## 기여 방법
1. 이슈 등록 및 브랜치 생성 후 PR 요청
2. 커밋 메시지: 한글, Conventional Commits 스타일 권장
3. 민감정보(.env 등) 커밋 금지

## 라이선스
MIT License

---

> 본 프로젝트는 대한예수교장로회 남경기노회 공식 행정서류 관리 시스템입니다.
