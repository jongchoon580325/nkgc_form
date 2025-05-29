"use client";
import React, { useState, useEffect } from "react";
import { saveItem, getAllItems, deleteItem, BoardItem } from "./indexeddb";

const PAGE_SIZE_OPTIONS = [10, 20, 30];

// 귀여운 모달 컴포넌트
function CuteModal({ open, message, onConfirm, onCancel, hideButtons }: { open: boolean; message: string; onConfirm: () => void; onCancel: () => void; hideButtons?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white text-black rounded-xl shadow-lg p-6 flex flex-col items-center min-w-[220px] w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-2">
        <span className="text-lg mb-4 whitespace-pre-line text-center">🐰 {message}</span>
        {!hideButtons && (
          <div className="flex gap-4 mt-2">
            <button className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-1 rounded" onClick={onConfirm}>확인</button>
            <button className="bg-zinc-300 hover:bg-zinc-200 text-black px-4 py-1 rounded" onClick={onCancel}>취소</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  // 상태 관리
  const [url, setUrl] = useState("http://xn--289an1ae8c3xa996k.kr/?page_id=11070&mod=list&pageid=1");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<BoardItem[]>([]);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [showScrollTop, setShowScrollTop] = useState(false); // 위로가기 버튼 표시 여부
  const [searchTitle, setSearchTitle] = useState("");
  const [filterCategory, setFilterCategory] = useState("전체");
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);

  // 모달 상태
  const [modal, setModal] = useState<{ open: boolean; message: string; onConfirm: () => void }>({ open: false, message: "", onConfirm: () => {} });
  // 로딩 안내 모달 상태
  const [loadingModal, setLoadingModal] = useState(false);

  // IndexedDB 데이터 불러오기
  const loadItems = async () => {
    const data = await getAllItems();
    setItems(data);
  };
  useEffect(() => {
    loadItems();
  }, []);

  // 스크롤 이벤트로 위로가기 버튼 표시 제어
  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 페이지당 표시 개수 변경 시 1페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, searchTitle, filterCategory]);

  // 크롤링 실행 (API Route 프록시 사용)
  const handleCrawl = async () => {
    if (!url) return;
    setLoading(true);
    setLoadingModal(true);
    try {
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      console.log("크롤링 결과:", data.items);
      if (!res.ok) throw new Error(data.error || "크롤링 실패");
      for (const item of data.items) {
        if (!item.id) {
          console.error("저장 불가: id 없음", item);
          continue;
        }
        await saveItem({
          id: String(item.id),
          number: Number(item.number),
          title: String(item.title),
          category: String(item.category),
          filename: String(item.filename),
          downloadUrl: String(item.downloadUrl),
        });
      }
      await loadItems();
      setUrl(""); // 1. 크롤링 후 입력필드 초기화
    } catch (e) {
      alert("크롤링 실패: " + (e as Error).message);
    }
    setLoading(false);
    setLoadingModal(false);
  };

  // 개별 삭제 (모달)
  const handleDelete = (id: string) => {
    setModal({
      open: true,
      message: "정말 삭제하시겠습니까?",
      onConfirm: async () => {
        setModal({ ...modal, open: false });
        await deleteItem(id);
        await loadItems();
      },
    });
  };

  // 다운로드 (모달)
  const handleDownload = (url: string) => {
    setModal({
      open: true,
      message: "선택하신 파일을 다운로드 하시겠습니까?",
      onConfirm: () => {
        setModal({ ...modal, open: false });
        window.open(url, "_blank");
      },
    });
  };

  // 카테고리 목록 추출
  const categoryList = [
    "전체",
    ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))
  ];

  // 필터링된 데이터 (제목 가나다순 정렬)
  const filteredItems = items
    .filter(item => {
      const matchTitle = item.title.toLowerCase().includes(searchTitle.toLowerCase());
      const matchCategory = filterCategory === "전체" || item.category === filterCategory;
      return matchTitle && matchCategory;
    })
    .sort((a, b) => a.title.localeCompare(b.title, 'ko'));

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // 위로가기 기능
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center py-12 px-2 relative">
      {/* 귀여운 모달 */}
      <CuteModal
        open={modal.open}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={() => setModal({ ...modal, open: false })}
      />
      {/* 크롤링 안내 모달 */}
      <CuteModal
        open={loadingModal}
        message={"남경기노회 행정서류 데이터를 가져오고 있는 중..\n데이터를 모두 가져오면 저는 쁑~~ 사라질 겁니다."}
        onConfirm={() => {}}
        onCancel={() => {}}
        hideButtons={true}
      />

      {/* 타이틀 */}
      <h1 className="text-3xl font-bold mb-8 text-center">남경기노회 행정서류 보관함</h1>

      {/* 상단 균형 배치 영역 */}
      <div className="flex flex-row items-center w-full max-w-4xl mb-6">
        {/* 왼쪽: 검색 인풋 */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="제목 검색..."
            value={searchTitle}
            onChange={e => { setSearchTitle(e.target.value); }}
            className="w-full max-w-xs rounded px-3 py-2 bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
          />
        </div>
        {/* 중앙: 카테고리 드롭다운 + 현재 데이터 개수 */}
        <div className="flex flex-row items-center justify-center gap-6 flex-1">
          <select
            className="w-32 rounded px-3 py-2 bg-zinc-900 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterCategory}
            onChange={e => { setFilterCategory(e.target.value); }}
          >
            {categoryList.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <span className="text-base text-zinc-400">현재 데이터: <b>{items.length}</b>개</span>
        </div>
        {/* 오른쪽: 행정서류 데이터 가져오기 버튼 */}
        <div className="flex-1 flex justify-end min-w-0">
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded transition disabled:opacity-60 min-w-[80px] whitespace-nowrap"
            onClick={handleCrawl}
            disabled={loading}
          >
            {loading ? "크롤링 중..." : "행정서류 데이터 가져오기"}
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="w-full max-w-4xl overflow-x-auto">
        <table className="w-full border-collapse rounded-lg overflow-hidden bg-zinc-900">
          <thead>
            <tr className="bg-zinc-800 text-zinc-200">
              <th className="py-3 px-2 font-semibold">번호</th>
              <th className="py-3 px-2 font-semibold">제목</th>
              <th className="py-3 px-2 font-semibold">구분</th>
              <th className="py-3 px-2 font-semibold">첨부파일명</th>
              <th className="py-3 px-2 font-semibold">다운로드</th>
              <th className="py-3 px-2 font-semibold">삭제</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-zinc-400">데이터가 없습니다.</td></tr>
            ) : (
              paginatedItems.map((item, idx) => (
                <tr
                  key={item.id}
                  className="border-b border-zinc-800 transition-colors hover:bg-[#f3f4f6] dark:hover:bg-zinc-700 group"
                >
                  <td className="py-2 px-2 text-center transition-colors group-hover:text-black dark:group-hover:text-white">{(currentPage - 1) * pageSize + idx + 1}</td>
                  <td className="py-2 px-2 transition-colors group-hover:text-black dark:group-hover:text-white">{item.title}</td>
                  <td className="py-2 px-2 text-center text-zinc-400 transition-colors group-hover:text-black dark:group-hover:text-white">{item.category || "-"}</td>
                  <td className="py-2 px-2 text-center text-zinc-400 transition-colors group-hover:text-black dark:group-hover:text-white">{item.filename || "파일첨부없음"}</td>
                  <td className="py-2 px-2 text-center">
                    {item.downloadUrl ? (
                      <button
                        className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded min-w-[80px] whitespace-nowrap"
                        onClick={() => handleDownload(item.downloadUrl)}
                      >다운로드</button>
                    ) : (
                      <button className="bg-zinc-700 text-zinc-400 px-3 py-1 rounded cursor-not-allowed" disabled>다운로드</button>
                    )}
                  </td>
                  <td className="py-2 px-2 text-center">
                    <button className="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded min-w-[80px] whitespace-nowrap" onClick={() => handleDelete(item.id)} disabled={loading}>삭제</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* 테이블 하단: 페이지네이션(좌), 페이지당 개수(우) */}
        {filteredItems.length > 0 && (
          <div className="flex flex-row justify-between items-center mt-6 select-none">
            {/* 페이지네이션: 좌측 */}
            <div className="flex justify-start items-center gap-2">
              <button
                className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                aria-label="처음 페이지"
              >처음</button>
              <button
                className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="이전 페이지"
              >이전</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`px-3 py-1 rounded ${currentPage === page ? 'bg-blue-600 text-white font-bold' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
                  onClick={() => setCurrentPage(page)}
                  aria-current={currentPage === page ? 'page' : undefined}
                >{page}</button>
              ))}
              <button
                className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="다음 페이지"
              >다음</button>
              <button
                className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-40"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                aria-label="마지막 페이지"
              >마지막</button>
            </div>
            {/* 페이지당 개수: 우측 */}
            <div className="flex items-center gap-2">
              <select
                className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-white"
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); }}
              >
                {PAGE_SIZE_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}개</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 위로가기 버튼 (플로팅, 스크롤 시에만 표시) */}
      {showScrollTop && (
        <button
          onClick={handleScrollTop}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg transition"
          aria-label="위로가기"
        >↑ 위로</button>
      )}

      {/* 푸터 */}
      <footer className="w-full mt-12 py-6 text-center text-base text-zinc-400 border-t border-zinc-800">
        {`Copyright ⓒ 2001-${new Date().getFullYear()} 대한예수교장로회 남경기노회 All Right Reserved.`}
      </footer>
    </div>
  );
}
