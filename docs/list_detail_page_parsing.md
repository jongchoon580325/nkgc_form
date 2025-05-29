# 📄 게시판 제목 & 상세페이지 URL 정규식 명칭 (Next.js 참조용)

Next.js 프로젝트에서 HTML 기반 게시판 데이터(예: KBoard 등)를 파싱할 때 사용할 수 있는 정규식 명칭과 예시입니다.



A. List Page Parsing Step
---

## 1. 게시판_제목_추출

- **설명:** 게시판 리스트 HTML에서 각 게시글의 제목을 추출할 때 사용
- **정규표현식 (JavaScript compatible):**

  ```js
  /<div class="kboard-default-cut-strings">\s*(.*?)\s*</

  <div class="kboard-default-cut-strings">
    목사 장립(안수) 확인서
    <span class="kboard-comments-count"></span>
</div>


## 2. 게시판_상세페이지_URL
	•	설명: 게시판 제목 클릭 시 연결되는 상세페이지의 링크 URL 추출용
	•	정규표현식 (JavaScript compatible):

/href="\/\?pageid=\d+&page_id=\d+&mod=document&uid=\d+"/

<a href="/?pageid=1&#038;page_id=11070&#038;mod=document&#038;uid=617">

## 3. 결과 (HTML 디코딩 후):
href="/?pageid=1&page_id=11070&mod=document&uid=617"

📦 추천 라이브러리
	•	cheerio: jQuery 스타일 HTML 파싱
	•	html-entities: HTML 엔티티 디코딩
	•	axios: HTML 소스 가져오기


B. Detail Page Step

# 📄 첨부파일 정규식 명칭 (Next.js 참조용)

게시글 상세페이지에서 첨부파일 다운로드 링크 및 파일명을 추출할 수 있는 정규표현식 명칭과 예시입니다.

---

## 1. 첨부파일_다운로드_URL

- **설명:** 첨부파일 다운로드용 URL 경로를 추출할 때 사용
- **정규표현식 (JavaScript / Python compatible):**

  ```js
  /\/\?pageid=\d+&page_id=\d+&uid=\d+&action=kboard_file_download&kboard-file-download-nonce=\w+&file=\w+/

    •	예시 매칭 결과:
    onclick="window.location.href='/?pageid=1&page_id=11070&uid=617&action=kboard_file_download&kboard-file-download-nonce=cc0c76a6f1&file=file1'"
    
    ▶ 결과:
    /?pageid=1&page_id=11070&uid=617&action=kboard_file_download&   kboard-file-download-nonce=cc0c76a6f1&file=file1

2. 첨부파일_파일명_추출
	•	설명: 버튼 태그 안에서 실제 사용자에게 보이는 첨부파일 이름을 추출
	•	정규표현식:
        /title="다운로드 ([^"]+)"/

    •	예시 매칭 결과:
    <button title="다운로드 m-27.hwp">m-27.hwp</button>
    ▶ 결과:
    m-27.hwp

✅ 활용 팁 (Next.js 기준)
	•	정규식은 getStaticProps / getServerSideProps 또는 API 라우트에서 HTML 문자열 파싱에 사용
	•	String.match() 또는 RegExp.exec() 로 활용
	•	첨부파일 다운로드 URL과 사용자 노출용 파일명은 함께 매칭해서 관리 가능


