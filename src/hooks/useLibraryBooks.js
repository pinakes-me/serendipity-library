import { useState, useEffect } from 'react';

// 글로벌 HTML 파싱 헬퍼 (모든 텍스트 필드 인코딩 깨짐 방지)
const decodeHTML = (htmlStr) => {
  if (!htmlStr) return '';
  const strWithBrackets = htmlStr.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const doc = new DOMParser().parseFromString(strWithBrackets, 'text/html');
  return (doc.body.textContent || '').replace(/[\uFFFD\u200B\u00A0]/g, ' ').trim();
};

// Module-level singleton cache — survives React remounts and route changes
let globalBooksCache = null;

export const useLibraryBooks = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    // 도서 파싱 로직 공통 함수
    const parseAPIResponse = (xmlText) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      const errorNode = xmlDoc.querySelector('error');
      if (errorNode) {
        const msg = errorNode.querySelector('msg')?.textContent;
        console.warn(`일부 API 페이징 파싱 오류 (무시됨): ${msg}`);
        return [];
      }

      const items = xmlDoc.querySelectorAll('item');
      return Array.from(items).map((item, index) => {
        const titleStr = item.querySelector('recomtitle')?.textContent || '';
        const authorStr = item.querySelector('recomauthor')?.textContent || '';
        const publisherStr = item.querySelector('recompublisher')?.textContent || '';
        const contentsStr = item.querySelector('recomcontens')?.textContent || '추천사가 없습니다.';
        const publishYear = item.querySelector('publishYear')?.textContent || '';
        const recomYear = parseInt(item.querySelector('recomYear')?.textContent || '0', 10);
        
        let categoryId = item.querySelector('recomcallno')?.textContent || '';
        
        const match = categoryId.match(/^(\d{3})/);
        if (match) {
          categoryId = match[1];
        }

        const cleanRecommendation = decodeHTML(contentsStr);
        // 제목 정제: ':' 이후의 부제 제거
        const cleanTitleFull = decodeHTML(titleStr);
        const cleanTitle = cleanTitleFull.split(':')[0].trim();
        const cleanAuthor = decodeHTML(authorStr);
        // 출판사 중복 제거: API 응답에서 동일 출판사가 반복되거나 붙어있는 경우 정리
        const rawPublisher = decodeHTML(publisherStr);
        const cleanPublisher = (() => {
          const parts = [...new Set(rawPublisher.split(/\s+/).filter(Boolean))];
          // 다른 토큰을 포함하는 긴 토큰 제거 (예: "21세기북스북이십일21세기북스" → 제거, "21세기북스" → 유지)
          const filtered = parts.filter(token =>
            !parts.some(other => other !== token && token.includes(other))
          );
          return (filtered.length > 0 ? filtered : parts).join(' ');
        })();

        let coverUrl = item.querySelector('mokchFilePath')?.textContent || item.querySelector('recomfilepath')?.textContent || '';
        if (coverUrl.includes('mokcha.nl.go.kr')) coverUrl = '';

        return {
          id: item.querySelector('controlNo')?.textContent || `${index}-${Math.random()}`,
          title: cleanTitle,
          author: cleanAuthor,
          publisher: cleanPublisher,
          publishYear,
          recomYear,
          categoryId,
          recommendation: cleanRecommendation,
          coverUrl
        };
      }).filter(book => book !== null);
    };

    const processAndShuffle = (booksList) => {
      const currentYear = new Date().getFullYear();
      const recentBooks = booksList.filter(b => b.recomYear >= currentYear - 5);
      
      const shuffled = [...recentBooks];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // Remove deep duplicates by ControlNo (id)
      const uniqueBooks = [];
      const seen = new Set();
      for (const book of shuffled) {
        if (!seen.has(book.id)) {
          seen.add(book.id);
          uniqueBooks.push(book);
        }
      }
      return uniqueBooks;
    };

    const fetchBooks = async () => {
      try {
        setLoading(true);
        
        if (globalBooksCache) {
          if (isMounted) {
            setData(globalBooksCache);
            setIsFetchingMore(false);
            setError(null);
            setLoading(false);
          }
          return;
        }

        const API_KEY = import.meta.env.VITE_NLK_API_KEY;
        
        if (!API_KEY) {
          throw new Error('API 키가 설정되지 않았습니다. .env 파일에 VITE_NLK_API_KEY를 입력해주세요.');
        }

        // 국립중앙도서관 추천 API는 과거순(오름차순)으로 반환하므로 최근 5년 치는 1100~1500번에 모여있습니다.
        // 불필요하게 1,500개를 모두 파싱할 필요 없이 최신 데이터 400개만 가져오면 초스피드 로딩이 가능합니다.
        const url = `/api/nlk/NL/search/openApi/saseoApi.do?key=${API_KEY}&startRowNumApi=1100&endRowNumApi=1500`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`서버 통신 오류: ${response.status}`);
        
        const xmlText = await response.text();
        const parsedBooks = parseAPIResponse(xmlText);
        
        const finalProcessedBooks = processAndShuffle(parsedBooks);
        globalBooksCache = finalProcessedBooks;

        if (isMounted) {
          setData(finalProcessedBooks);
          setIsFetchingMore(false);
          setError(null);
        }

      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError(err.message || '데이터를 불러오는 중 문제가 발생했습니다.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsFetchingMore(false);
        }
      }
    };

    fetchBooks();

    return () => {
      isMounted = false;
    };
  }, []);

  return { books: data, loading, isFetchingMore, error };
};

