// frontend/src/components/shared/Avatar.jsx
import { getInitials } from '../../utils/helpers';

/**
 * Employee Avatar — shows photo or initials fallback
 * @param {string} [photoUrl] - URL to employee photo
 * @param {string} [firstName]
 * @param {string} [lastName]
 * @param {string} [name] - full name (alternative to first/last)
 * @param {number} [size] - pixel size (default 36)
 * @param {string} [className]
 */
export default function Avatar({ photoUrl, firstName, lastName, name, size = 36, className = '' }) {
  const initials = name
    ? (name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase())
    : getInitials(firstName, lastName);

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    flexShrink: 0,
    fontSize: `${Math.round(size * 0.35)}px`,
  };

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={initials}
        className={`object-cover ${className}`}
        style={style}
        onError={(e) => {
          // Fallback if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling?.style.removeProperty('display');
        }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center font-semibold text-white flex-shrink-0 ${className}`}
      style={{ ...style, background: 'var(--color-primary)' }}
    >
      {initials}
    </div>
  );
}
