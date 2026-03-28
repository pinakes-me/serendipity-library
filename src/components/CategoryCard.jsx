import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const CategoryCard = ({ category, to }) => {
  return (
    <Link to={to} className="hover-lift" style={{ display: 'block', textDecoration: 'none' }}>
      <div 
        className="glass-panel"
        style={{
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderLeft: `4px solid ${category.accent || 'var(--accent-color)'}`,
          marginBottom: '1rem'
        }}
      >
        <div>
          <span style={{ 
            fontSize: '0.85rem', 
            fontWeight: '600', 
            color: category.accent || 'var(--accent-color)',
            letterSpacing: '0.05em'
          }}>
            {category.code}
          </span>
          <h3 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>
            {category.name}
          </h3>
        </div>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '50%', 
          background: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ChevronRight size={20} color="var(--text-primary)" />
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
