import React, { useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BookCard from '../components/BookCard';
import { categories, subCategories } from '../data/mockData';
import { useLibraryBooks } from '../hooks/useLibraryBooks';

// KDC 기본 상위 레이블 매핑 — "기타 분류" 방지
const KDC_MAIN_LABELS = {
  '000': '총류', '100': '철학', '200': '종교',
  '300': '사회과학', '400': '자연과학', '500': '기술과학',
  '600': '예술', '700': '언어', '800': '문학', '900': '역사'
};

// 공유 가로 스크롤 서가 컴포넌트
const HorizontalShelf = ({ title, books, color }) => {
  if (!books || books.length === 0) return null;

  const booksToShow = books.slice(0, 10);
  const showScrollHint = booksToShow.length >= 4;

  return (
    <div style={{ marginBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: color || 'var(--accent-color)', fontFamily: 'var(--font-serif-kr)', fontWeight: 700 }}>
            {title}
          </span>
        </h2>
        {showScrollHint && (
          <span style={{
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            background: 'rgba(255,255,255,0.05)',
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.05)',
            letterSpacing: '0.02em'
          }}>
            스크롤을 좌우로 움직여 보세요!
          </span>
        )}
      </div>

      <div style={{
        display: 'flex', gap: '2rem', overflowX: 'auto', padding: '1rem',
        scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none', msOverflowStyle: 'none'
      }}>
        <style>{`.cat-shelf::-webkit-scrollbar { display: none; }`}</style>
        {booksToShow.map((book, index) => {
          const bk =
            (book.isbn && String(book.isbn)) ||
            `${book.title}-${book.author}` ||
            book.id ||
            index;
          return (
            <div key={bk} style={{ scrollSnapAlign: 'start' }}>
              <BookCard key={bk} book={{ ...book, color }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Category = () => {
  const { id } = useParams();
  const { books, loading } = useLibraryBooks();

  // 카테고리 이동 시 항상 최상단으로 스크롤
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const categoryInfo = categories.find(c => c.code === id);
  const color = categoryInfo?.color || 'var(--accent-color)';
  const categoryName = categoryInfo?.name || KDC_MAIN_LABELS[id] || `${id} 분류`;
  const mainDigit = id?.charAt(0);

  const subShelves = useMemo(() => {
    if (!books.length || !mainDigit) return [];

    const catBooks = books.filter(b => b.categoryId?.charAt(0) === mainDigit);

    // 3자리 서브카테고리 코드(10 단위) 기준 그룹핑
    const subMap = {};
    catBooks.forEach(book => {
      const raw = book.categoryId;
      if (!raw) return;
      let subCode = raw.length >= 3 ? raw.substring(0, 3) : raw.padEnd(3, '0');
      subCode = (Math.floor(parseInt(subCode) / 10) * 10).toString().padStart(3, '0');
      if (!subMap[subCode]) subMap[subCode] = [];
      subMap[subCode].push(book);
    });

    const allSubs = subCategories[id] || [];

    return Object.entries(subMap)
      .map(([code, booksInSub]) => {
        const meta = allSubs.find(s => s.code === code);
        // "기타 분류" 대신 KDC 매핑 혹은 상위 레이블 사용
        const fallbackName = KDC_MAIN_LABELS[code] || `${code}`;
        return {
          code,
          name: meta ? meta.name : fallbackName,
          books: booksInSub.sort(() => Math.random() - 0.5)
        };
      })
      .filter(s => s.books.length > 0)
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [books, mainDigit, id]);

  if (loading) {
    return (
      <div style={{ padding: '2rem 5%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', color: 'var(--text-secondary)' }}>
        <p>서가를 정리하는 중...</p>
      </div>
    );
  }

  if (!categoryInfo) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>존재하지 않는 카테고리입니다.</p>
        <Link to="/" style={{ color: 'var(--accent-color)' }}>메인 서가로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '2rem 5%', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* 뒤로 가기 */}
      <div style={{ marginBottom: '3rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', transition: 'color 0.2s', textDecoration: 'none' }}
          onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <ArrowLeft size={18} />
          <span>메인 서가로 돌아가기</span>
        </Link>
      </div>

      {/* 카테고리 헤더 */}
      <header style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'inline-block', padding: '0.4rem 1rem', borderRadius: '20px', background: `${color}20`, border: `1px solid ${color}50`, marginBottom: '1rem' }}>
          <span style={{ color, fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.08em' }}>{id}</span>
        </div>
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-serif-kr)', color: color, fontWeight: 700, marginBottom: '0.5rem' }}>
          {categoryName} 서가
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {subShelves.length}개의 세부 서가에서 책을 탐색해 보세요.
        </p>
      </header>

      {/* 세부 서가 */}
      {subShelves.length > 0 ? (
        <div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
            세부 서가
          </h2>
          {subShelves.map(sub => (
            <HorizontalShelf
              key={sub.code}
              title={`${sub.code} ${sub.name}`}
              books={sub.books}
              color={color}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>이 서가에는 현재 책이 없습니다.</p>
          <Link to="/" style={{ color, textDecoration: 'underline', marginTop: '1rem', display: 'inline-block' }}>메인 서가로 돌아가기</Link>
        </div>
      )}
    </div>
  );
};

export default Category;
