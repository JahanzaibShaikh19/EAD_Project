// frontend/src/components/shared/SearchInput.jsx
import { useRef } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Debounced search input with clear button
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  id = 'search-input',
}) {
  const inputRef = useRef(null);

  return (
    <div className={`relative ${className}`} style={{ minWidth: '220px' }}>
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--color-text-tertiary)' }}
      />
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm transition-all"
        style={{
          paddingLeft: '34px',
          paddingRight: value ? '34px' : '12px',
          paddingTop: '8px',
          paddingBottom: '8px',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          fontFamily: 'DM Sans, sans-serif',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-primary)';
          e.target.style.boxShadow = '0 0 0 3px rgba(26,107,90,0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--color-border)';
          e.target.style.boxShadow = 'none';
        }}
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100 transition-colors"
        >
          <X size={12} style={{ color: 'var(--color-text-tertiary)' }} />
        </button>
      )}
    </div>
  );
}
