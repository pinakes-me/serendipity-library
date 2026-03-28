import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Compass, Star, ChevronRight, Hash } from 'lucide-react';
import ShelfRow from '../components/ShelfRow';
import { categories as kdcCategories } from '../data/mockData';
import { useLibraryBooks } from '../hooks/useLibraryBooks';

const Home = () => {
  const { books, loading, isFetchingMore, error } = useLibraryBooks();

  // Sort and group books by main category (000, 100, 200, etc.)
  const booksByCategory = {};
  if (!loading) {
    books.forEach(book => {
      const mainCategoryCode = book.categoryId.charAt(0) + '00';
      if (!booksByCategory[mainCategoryCode]) {
        booksByCategory[mainCategoryCode] = [];
      }
      booksByCategory[mainCategoryCode].push(book);
    });
  }

  // Dynamically compute active main categories based on the loaded books list
  const activeMainCategories = Object.keys(booksByCategory).sort();

  return (
    <div className="fade-in" style={{ padding: '2rem 5%', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem', marginTop: '2rem' }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          marginBottom: '1.25rem', 
          fontFamily: 'var(--font-serif-kr)', 
          color: '#fdfbf7',
          fontWeight: 400,
          letterSpacing: '0.05em',
          lineHeight: 1.3
        }}>
          우연한 도서관
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          서가를 거닐며 탐험해 보세요.<br />우연이 이끄는 곳에서, 뜻밖의 책을 발견하게 될 거예요.
        </p>
        
        <Link to="/random" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '1rem 2rem',
          borderRadius: '30px',
          marginTop: '2.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease'
        }} className="hover-lift">
          <span style={{ fontSize: '1.25rem' }}>🎲</span>
          <span style={{ fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>랜덤 탐색</span>
        </Link>
      </header>

      <div style={{ marginBottom: '4rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            도서관 서가를 둘러보는 중...
          </div>
        ) : activeMainCategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            추천 도서를 찾을 수 없습니다.
          </div>
        ) : (
          activeMainCategories.map(category => {
            const categoryInfo = kdcCategories.find(c => c.code === category);
            const categoryName = categoryInfo ? categoryInfo.name : `${category} 분류`;
            
            return (
              <div key={category} style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0 1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: categoryInfo?.color || 'var(--accent-color)', fontFamily: 'var(--font-serif-kr)', fontWeight: 700 }}>
                      {category}
                    </span>
                    {categoryName}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {booksByCategory[category].length >= 4 && (
                      <span style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        padding: '0.35rem 0.85rem', 
                        borderRadius: '20px', 
                        letterSpacing: '0.02em',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        좌우로 스크롤해 보세요!
                      </span>
                    )}
                    <Link to={`/category/${category}`} style={{
                      display: 'flex', alignItems: 'center', gap: '0.2rem',
                      color: categoryInfo?.color || 'var(--accent-color)',
                      marginLeft: '0.5rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'opacity 0.2s'
                    }} onMouseOver={e => e.currentTarget.style.opacity = '0.8'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>
                      더 보기 <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
                
                <ShelfRow books={booksByCategory[category]} categoryInfo={categoryInfo} />
              </div>
            );
          })
        )}
        
        {isFetchingMore && (
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--accent-color)',
            color: '#fff',
            padding: '0.75rem 1.75rem',
            borderRadius: '2rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            zIndex: 1000,
            animation: 'fadeInUp 0.3s ease-out'
          }}>
            <style>{`
              @keyframes fadeInUp {
                from { opacity: 0; transform: translate(-50%, 20px); }
                to { opacity: 1; transform: translate(-50%, 0); }
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <div style={{ 
              width: '16px', height: '16px', 
              border: '2px solid rgba(255,255,255,0.3)', 
              borderTopColor: '#fff', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }} />
            서고에서 더 많은 영감을 가져오는 중...
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
