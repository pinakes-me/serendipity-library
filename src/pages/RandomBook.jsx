import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import BookCard from '../components/BookCard';
import { useLibraryBooks } from '../hooks/useLibraryBooks';
import { categories as kdcCategories } from '../data/mockData';

const RandomBook = () => {
  const { books, loading, error } = useLibraryBooks();
  const [book, setBook] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (books.length === 0) {
      setShowLoading(false);
      return;
    }
    const t = setTimeout(() => setShowLoading(false), 1200);
    return () => clearTimeout(t);
  }, [loading, books.length]);

  useEffect(() => {
    if (books.length > 0 && !book && !showLoading) {
      setBook(books[Math.floor(Math.random() * books.length)]);
    }
  }, [books, book, showLoading]);

  const handleShuffle = () => {
    if (isAnimating || books.length === 0) return;
    setIsAnimating(true);
    setTimeout(() => {
      setBook(books[Math.floor(Math.random() * books.length)]);
      setIsAnimating(false);
    }, 400); // Wait for fade out
  };

  if (loading || showLoading || (books.length > 0 && !book)) {
    return (
      <div className="fade-in" style={{ padding: '2rem 5%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <style>
          {`
            @keyframes diceRoll {
              0% { transform: rotate(0deg) translateY(0) scale(1); }
              25% { transform: rotate(90deg) translateY(-25px) scale(1.1); }
              50% { transform: rotate(180deg) translateY(0) scale(1); }
              75% { transform: rotate(270deg) translateY(-15px) scale(1.05); }
              100% { transform: rotate(360deg) translateY(0) scale(1); }
            }
          `}
        </style>
        <div style={{ fontSize: '3.5rem', animation: 'diceRoll 1.2s cubic-bezier(0.28, 0.84, 0.42, 1) infinite', marginBottom: '1.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>🎲</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', letterSpacing: '0.05em' }}>도서관에서 우연한 책을 고르는 중...</p>
      </div>
    );
  }

  const getCategoryColor = (categoryId) => {
    if (!categoryId) return null;
    const mainCode = categoryId.charAt(0) + '00';
    const cat = kdcCategories.find(c => c.code === mainCode);
    return cat ? cat.color : null;
  };

  const getCategoryLabel = (categoryId) => {
    if (!categoryId) return '';
    const mainCode = categoryId.charAt(0) + '00';
    const cat = kdcCategories.find(c => c.code === mainCode);
    return cat ? `${cat.code} ${cat.name}` : mainCode;
  };

  const randomCardKey = book
    ? (book.isbn && String(book.isbn)) || `${book.title}-${book.author}` || book.id
    : '';

  const categoryLabel = book ? getCategoryLabel(book.categoryId) : '';
  const categoryColor = book ? getCategoryColor(book.categoryId) : null;

  if (error || !book) {
    return (
      <div className="fade-in" style={{ padding: '2rem 5%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', color: 'var(--text-secondary)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>책을 가져오지 못했습니다</h3>
        <p style={{ fontSize: '1rem', marginBottom: '2rem' }}>{error || '불러올 수 있는 책이 없습니다.'}</p>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)', textDecoration: 'underline' }}>
          <ArrowLeft size={18} />
          <span>메인 서가로 돌아가기</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '2rem 5%', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh' }}>
      <div style={{ width: '100%', maxWidth: '800px', marginBottom: '3rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
          <ArrowLeft size={18} />
          <span>메인 서가로 돌아가기</span>
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(252, 224, 67, 0.1)', marginBottom: '1.5rem', boxShadow: '0 0 20px rgba(252, 224, 67, 0.2)' }}>
          <Sparkles size={32} color="#fce043" />
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }} className="text-gradient-gold">
          우연한 발견
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>방대한 서가에서 우연히 꺼내든 한 권의 책입니다.</p>
      </div>

      <div style={{ 
        transform: isAnimating ? 'scale(0.95)' : 'scale(1)', 
        opacity: isAnimating ? 0 : 1, 
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '320px' }}>
          {categoryLabel ? (
            <span style={{
              display: 'inline-block',
              padding: '0.35rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: '600',
              marginBottom: '0.75rem',
              background: categoryColor ? `${categoryColor}20` : 'rgba(255,255,255,0.06)',
              color: categoryColor || 'var(--text-secondary)',
              border: categoryColor ? `1px solid ${categoryColor}40` : '1px solid rgba(255,255,255,0.12)',
            }}>
              {categoryLabel}
            </span>
          ) : null}
          <BookCard key={randomCardKey} book={{ ...book, color: categoryColor }} />
        </div>
      </div>

      <button 
        onClick={handleShuffle}
        className="hover-lift"
        style={{
          marginTop: '3.5rem',
          background: 'transparent',
          color: 'var(--text-primary)',
          border: '1px solid rgba(255,255,255,0.2)',
          padding: '1rem 2rem',
          borderRadius: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '600',
          letterSpacing: '0.05em'
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        onMouseOut={e => e.currentTarget.style.background = 'transparent'}
      >
        <span style={{ transition: 'transform 0.4s', transform: isAnimating ? 'rotate(180deg)' : 'rotate(0)', display: 'inline-block', fontSize: '1.25rem' }}>🎲</span>
        다른 책 보기
      </button>
    </div>
  );
};

export default RandomBook;
