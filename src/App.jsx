import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LibraryBig } from 'lucide-react';
import Home from './pages/Home';
import Category from './pages/Category';
import Shelf from './pages/Shelf';
import RandomBook from './pages/RandomBook';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <nav style={{ 
          padding: '1.5rem 5%', 
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(13, 17, 23, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{ width: '100%', maxWidth: '1200px', display: 'flex' }}>
            <Link to="/" className="hover-lift" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <LibraryBig size={28} color="var(--accent-color)" />
              <span style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.05em', fontFamily: 'var(--font-serif)' }}>
                우연한 도서관
              </span>
            </Link>
          </div>
        </nav>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:id" element={<Category />} />
            <Route path="/shelf/:id" element={<Shelf />} />
            <Route path="/random" element={<RandomBook />} />
          </Routes>
        </main>
        
        <footer style={{ padding: '2rem 5%', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', borderTop: '1px solid var(--border-color)', marginTop: 'auto' }}>
          <p style={{ marginBottom: '0.5rem' }}>© {new Date().getFullYear()} 우연한 도서관 프로젝트</p>
          <p>본 서비스는 국립중앙도서관(<a href="http://www.nl.go.kr" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>www.nl.go.kr</a>)에서 제공하는 사서추천도서 Open API를 활용하였습니다.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
