// IndexedDB 유틸리티 (idb 기반)
// 게시글 데이터: { id, number, title, filename, downloadUrl }

import { openDB, DBSchema } from 'idb';

// 게시글 데이터 타입 정의
export interface BoardItem {
  id: string; // uid 등 고유값
  number: number;
  title: string;
  category: string; // 카테고리(구분) 필드 추가
  filename: string;
  downloadUrl: string;
}

// IndexedDB 스키마 정의
interface BoardDB extends DBSchema {
  items: {
    key: string;
    value: BoardItem;
  };
}

// DB 인스턴스 반환
async function getDB() {
  return openDB<BoardDB>('kboard-crawler', 1, {
    upgrade(db) {
      db.createObjectStore('items', { keyPath: 'id' });
    },
  });
}

// 게시글 저장
export async function saveItem(item: BoardItem) {
  const db = await getDB();
  await db.put('items', item);
}

// 전체 게시글 조회
export async function getAllItems(): Promise<BoardItem[]> {
  const db = await getDB();
  return db.getAll('items');
}

// 게시글 삭제
export async function deleteItem(id: string) {
  const db = await getDB();
  await db.delete('items', id);
}

// 전체 삭제
export async function clearAll() {
  const db = await getDB();
  await db.clear('items');
} 