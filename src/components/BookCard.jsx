import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { getCachedCover, setCachedCover } from '../utils/coverCache';

const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = import.meta.env.VITE_NAVER_CLIENT_SECRET;

const fetchedTitles = new Set();

const BookCard = ({ book }) => {
  const [imgError, setImgError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  // 초기화 시점에 캐시 확인 — flicker 방지 (useEffect보다 먼저 실행)
  const [coverSrc, setCoverSrc] = useState(() => {
    return getCachedCover(book.title) || book.coverUrl || null;
  });
  const imgTimeoutRef = useRef(null);
  const coverImageLoadedRef = useRef(false);
  const fetchAttemptedRef = useRef(false);
  const latestRequestRef = useRef(0);

  useEffect(() => {
    setCoverSrc(getCachedCover(book.title) || book.coverUrl || null);
    setImgError(false);
    fetchAttemptedRef.current = false;
  }, [book.title]);

  // 네이버 책 API로 표지 fetch (book.title당 1회)
  useEffect(() => {
    if (fetchAttemptedRef.current) return;
    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET || !book.title) return;

    fetchAttemptedRef.current = true;
    const requestId = ++latestRequestRef.current;
    let cancelled = false;

    const fetchNaverCover = async () => {
      try {
        // 랜덤 지연 (0–2초) — API 요청 분산으로 429 방지
        const delay = Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
        if (cancelled) return;

        const query = encodeURIComponent(book.title);
        const res = await fetch(
          `/naver-api/v1/search/book.json?query=${query}&display=1`,
          {
            headers: {
              'X-Naver-Client-Id': NAVER_CLIENT_ID,
              'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
            },
          }
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const image = data.items?.[0]?.image;
        if (cancelled) return;
        if (requestId !== latestRequestRef.current) return;
        if (image) {
          setCoverSrc(image);
          setCachedCover(book.title, image);
        }
      } catch {
        // 네이버 실패 시 기존 URL 또는 플레이스홀더 유지
      }
    };

    fetchNaverCover();
    return () => { cancelled = true; };
  }, [book.title]);

  // 이미지 로드 5초 타임아웃: 느린 서버 무한 대기 방지 (로드 완료 후에는 절대 imgError 켜지 않음)
  useEffect(() => {
    clearTimeout(imgTimeoutRef.current);
    coverImageLoadedRef.current = false;

    if (!coverSrc) return;

    imgTimeoutRef.current = setTimeout(() => {
      if (coverImageLoadedRef.current) return;
      setImgError(true);
    }, 5000);

    return () => clearTimeout(imgTimeoutRef.current);
  }, [coverSrc]);

  const handleImgLoad = () => {
    clearTimeout(imgTimeoutRef.current);
    coverImageLoadedRef.current = true;
  };
  const handleImgError = () => { clearTimeout(imgTimeoutRef.current); setImgError(true); };

  return (
    <div 
      className="glass-panel hover-lift"
      style={{ 
        minWidth: 'min(320px, 85vw)', 
        maxWidth: 'min(320px, 85vw)', 
        height: isExpanded ? 'auto' : '420px',
        minHeight: '420px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        borderTop: `3px solid ${book.color || 'var(--accent-color)'}`,
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
      }}
    >
      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ 
          width: '80px', 
          height: '115px', 
          flexShrink: 0,
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {coverSrc ? (
            <img 
              src={coverSrc} 
              alt={`${book.title} 표지`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onLoad={handleImgLoad}
              onError={handleImgError}
            />
          ) : (
            <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={24} />
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ 
            fontSize: '1.15rem', 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            marginBottom: '0.5rem',
            fontFamily: 'var(--font-serif-kr)',
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: isExpanded ? 'unset' : 3,
            WebkitBoxOrient: 'vertical',
            overflow: isExpanded ? 'visible' : 'hidden'
          }}>
            {book.title}
          </h3>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.85rem',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {book.author}
          </p>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.8rem',
            marginTop: '0.25rem',
          }}>
            {book.publishYear ? `${book.publishYear}년` : ''} {book.publisher ? `· ${book.publisher}` : ''}
          </p>
        </div>
      </div>
      
      <div style={{ flex: 1 }}></div>

      <div style={{ 
        background: 'rgba(0,0,0,0.2)', 
        padding: '1.25rem', 
        borderRadius: '8px',
        borderLeft: `2px solid ${book.color || 'var(--accent-color)'}`,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <p style={{ 
          fontSize: '0.85rem', 
          lineHeight: 1.6, 
          color: '#d1d5db',
          display: isExpanded ? 'block' : '-webkit-box',
          WebkitLineClamp: isExpanded ? 'unset' : 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          "{book.recommendation}"
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: book.color || 'var(--accent-color)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            {isExpanded ? '접기' : '더 보기'}
          </button>
          <span style={{ 
            fontSize: '0.7rem', 
            color: 'var(--text-secondary)', 
            textAlign: 'right', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em' 
          }}>
            — 📚 사서의 한마디
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
