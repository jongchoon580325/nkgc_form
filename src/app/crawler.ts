// KBoard 게시판 크롤링/파싱 유틸리티
// - 리스트 페이지에서 게시글 제목/상세URL 추출
// - 상세페이지에서 첨부파일명/다운로드URL 추출
// - cheerio, axios, html-entities, 정규식 활용

import axios from 'axios';
import * as cheerio from 'cheerio';
import { decode } from 'html-entities';

// 리스트 페이지에서 게시글 정보 추출
export async function fetchListPage(listUrl: string): Promise<{
  id: string;
  number: number;
  title: string;
  detailUrl: string;
}[]> {
  const res = await axios.get(listUrl);
  const $ = cheerio.load(res.data);
  const rows: { id: string; number: number; title: string; detailUrl: string }[] = [];

  // 각 게시글 행 파싱
  $('.kboard-list tbody tr').each((_, el) => {
    // 번호
    const number = $(el).find('.kboard-list-uid').text().trim();
    // 제목
    const titleRaw = $(el).find('.kboard-default-cut-strings').text().trim();
    const title = decode(titleRaw);
    // 상세페이지 URL
    const href = $(el).find('.kboard-list-title a').attr('href');
    if (!href) return;
    // uid 추출 (정규식)
    const uidMatch = href.match(/uid=(\d+)/);
    const id = uidMatch ? uidMatch[1] : '';
    // HTML 엔티티 디코딩 및 URL 정제
    const detailUrl = decode(href).replace(/&amp;/g, '&');
    rows.push({
      id,
      number: isNaN(Number(number)) ? 0 : Number(number),
      title,
      detailUrl,
    });
  });
  return rows;
}

// 상세페이지에서 첨부파일명/다운로드URL/카테고리(구분) 추출
export async function fetchDetailPage(detailUrl: string): Promise<{
  category: string;
  filename: string;
  downloadUrl: string;
}> {
  const res = await axios.get(detailUrl);
  const $ = cheerio.load(res.data);
  // 카테고리(구분)
  const category = $('.detail-category1 .detail-name').first().text().trim();
  // 첨부파일명
  const fileBtn = $('.kboard-attach button[title^="다운로드 "]');
  const filename = fileBtn.length ? fileBtn.attr('title')?.replace('다운로드 ', '') || '' : '파일첨부없음';
  // 다운로드 URL
  let downloadUrl = '';
  if (fileBtn.length) {
    const onclick = fileBtn.attr('onclick') || '';
    const match = onclick.match(/window.location.href='([^']+)'/);
    if (match) downloadUrl = decode(match[1]);
    // 다운로드 링크가 http로 시작하지 않으면 실제 도메인으로 고정
    if (!downloadUrl.startsWith('http')) {
      downloadUrl = 'http://xn--289an1ae8c3xa996k.kr' + downloadUrl;
    }
  }
  return { category, filename, downloadUrl };
}

// 전체 리스트 페이지의 게시글 정보 추출 (페이지네이션 자동 순회)
export async function fetchAllListPages(listUrl: string): Promise<{
  id: string;
  number: number;
  title: string;
  detailUrl: string;
}[]> {
  let page = 1;
  let allRows: { id: string; number: number; title: string; detailUrl: string }[] = [];
  let hasNext = true;
  const baseUrl = listUrl.split('?')[0];
  const query = listUrl.split('?')[1] || '';
  // page 파라미터 우선, 없으면 pageid 사용
  const pageParamMatch = query.match(/([?&])(page|pageid)=(\d+)/);
  const pageParamName = pageParamMatch ? pageParamMatch[2] : 'page';
  const pageIdMatch = query.match(/page_id=(\d+)/);
  const pageId = pageIdMatch ? pageIdMatch[1] : '';
  let lastPage = null;
  while (hasNext) {
    const url = `${baseUrl}?${pageParamName}=${page}&page_id=${pageId}&mod=list`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    });
    console.log('fetchAllListPages fetch status:', res.status, url);
    console.log('fetchAllListPages fetch body:', String(res.data).slice(0, 500));
    const $ = cheerio.load(res.data);
    const rows: { id: string; number: number; title: string; detailUrl: string }[] = [];
    $('.kboard-list tbody tr').each((_, el) => {
      const number = $(el).find('.kboard-list-uid').text().trim();
      const titleRaw = $(el).find('.kboard-default-cut-strings').text().trim();
      const title = decode(titleRaw);
      const href = $(el).find('.kboard-list-title a').attr('href');
      if (!href) return;
      const uidMatch = href.match(/uid=(\d+)/);
      const id = uidMatch ? uidMatch[1] : '';
      const detailUrl = decode(href).replace(/&amp;/g, '&');
      rows.push({
        id,
        number: isNaN(Number(number)) ? 0 : Number(number),
        title,
        detailUrl,
      });
    });
    if (rows.length === 0) break;
    allRows = allRows.concat(rows);
    // 마지막 페이지 번호 추출 (한 번만)
    if (lastPage === null) {
      const lastBtn = $('.kboard-pagination .last-page a');
      if (lastBtn.length > 0) {
        const href = lastBtn.attr('href') || '';
        // page 또는 pageid 모두 인식
        const match = href.match(/(?:[?&](?:page|pageid)=(\d+))/);
        if (match) lastPage = Number(match[1]);
      }
    }
    // 다음 페이지 진행 조건
    if (lastPage !== null) {
      if (page < lastPage) {
        page++;
      } else {
        hasNext = false;
      }
    } else {
      // fallback: next-page 버튼
      const nextBtn = $('.kboard-pagination .next-page a');
      if (nextBtn.length > 0 && !nextBtn.parent().hasClass('disabled')) {
        page++;
      } else {
        hasNext = false;
      }
    }
  }
  return allRows;
} 