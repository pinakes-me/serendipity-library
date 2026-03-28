import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Library } from 'lucide-react';
import BookCard from '../components/BookCard';
import { subCategories } from '../data/mockData';
import { useLibraryBooks } from '../hooks/useLibraryBooks';

const Shelf = () => {
  const { id } = useParams();
  const { books, loading, error } = useLibraryBooks();
  const getPrefix = (code) => {
    if (code === '000') return '0';                // 00X 총류
    if (code.endsWith('00')) return code.charAt(0); // e.g. 800 -> 8
    if (code.endsWith('0')) return code.substring(0, 2); // e.g. 810 -> 81
    return code;                                   // e.g. 004 -> 004
  };

  let shelfBooks = books.filter(b => b.categoryId.startsWith(getPrefix(id)));
  
  let isFallback = false;
  if (!loading && shelfBooks.length === 0) {
    const parentCode = id.charAt(0) + '00';
    shelfBooks = books.filter(b => b.categoryId.startsWith(getPrefix(parentCode)));
    isFallback = true;
  }
  
  // Find the parent to allow navigating back
  let parentId = '/';
  let subName = `Shelf ${id}`;
  let accent = 'var(--accent-color)';
  
  Object.keys(subCategories).forEach(key => {
    const sub = subCategories[key].find(s => s.code === id);
    if (sub) {
      parentId = `/category/${sub.parent}`;
      subName = sub.name;
    }
  });

  if (loading) {
    return (
      <div className="fade-in" style={{ padding: '10rem 5%', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>도서관 서가를 둘러보는 중...</p>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in" style={{ padding: '8rem 5%', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>서가를 불러오지 못했습니다</h3>
        <p style={{ fontSize: '1rem', marginBottom: '2rem' }}>{error}</p>
        <Link to="/" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}>메인 서가로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '2rem 0', width: '100%' }}>
      <div style={{ padding: '0 5%', marginBottom: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <Link to={parentId} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          <ArrowLeft size={18} />
          <span>이전 분류로 돌아가기</span>
        </Link>
        <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: accent, fontFamily: 'var(--font-sans)', fontWeight: 500 }}>{id}</span>
          {subName}
        </h1>
        {isFallback ? (
          <p style={{ color: '#ec6547', marginTop: '0.5rem', fontWeight: 500 }}>
            현재 세부 분류에 해당하는 도서가 없어 넓은 분류({id.charAt(0)}00)의 서가를 보여드립니다.
          </p>
        ) : (
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            가로로 스크롤하여 서가를 둘러보세요.
          </p>
        )}
      </div>

      {shelfBooks.length > 0 ? (
        <div className="horizontal-scroll" style={{ width: '100%' }}>
          {shelfBooks.map((book, index) => {
            const bk =
              (book.isbn && String(book.isbn)) ||
              `${book.title}-${book.author}` ||
              book.id ||
              index;
            return (
              <div key={bk} className={`fade-in stagger-${(index % 4) + 1}`} style={{ flexShrink: 0 }}>
                <BookCard key={bk} book={book} />
              </div>
            );
          })}
          <div style={{ minWidth: '50px' }} /> {/* Right padding element */}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 5%', maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border-color)', marginTop: '2rem' }}>
          <Library size={48} color="var(--border-color)" style={{ margin: '0 auto 1.5rem auto' }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>서가가 비어있습니다</h3>
          <p style={{ color: 'var(--text-secondary)' }}>아직 사서가 이 서가에 책을 채워두지 않았습니다.</p>
        </div>
      )}
    </div>
  );
};

export default Shelf;
