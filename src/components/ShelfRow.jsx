import React from 'react';
import BookCard from './BookCard';

const MAX_BOOKS = 6;

/**
 * ShelfRow — renders a fixed horizontal shelf with exactly MAX_BOOKS books.
 * No progressive loading, no IntersectionObserver, no dynamic expansion.
 * Users navigate to the category page via "서가 더 보기" for more books.
 */
const ShelfRow = ({ books, categoryInfo }) => {
  const visibleBooks = books.slice(0, MAX_BOOKS);

  return (
    <div
      className="horizontal-scroll"
      style={{
        display: 'flex',
        gap: '2rem',
        overflowX: 'auto',
        padding: '1rem',
        scrollSnapType: 'x mandatory',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <style>{`.horizontal-scroll::-webkit-scrollbar { display: none; }`}</style>
      {visibleBooks.map((book, index) => {
        const bk =
          (book.isbn && String(book.isbn)) ||
          `${book.title}-${book.author}` ||
          book.id ||
          index;
        return (
          <div key={bk} style={{ scrollSnapAlign: 'start' }}>
            <BookCard key={bk} book={{ ...book, color: categoryInfo?.color }} />
          </div>
        );
      })}
    </div>
  );
};

export default ShelfRow;
