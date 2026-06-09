// frontend/src/components/layout/PageWrapper.jsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * PageWrapper — wraps every page and runs GSAP entrance animation on mount
 * Animates: .page-header → .stat-card → .data-card in staggered sequence
 */
export default function PageWrapper({ children, className = '' }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Header animation
      tl.from('.page-header', {
        y: -20,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out',
      });

      // Stat cards staggered
      tl.from('.stat-card', {
        y: 24,
        opacity: 0,
        duration: 0.35,
        stagger: 0.08,
        ease: 'power2.out',
      }, '-=0.2');

      // Data cards staggered
      tl.from('.data-card', {
        y: 20,
        opacity: 0,
        duration: 0.3,
        stagger: 0.06,
        ease: 'power2.out',
      }, '-=0.15');
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapperRef} className={`page-content ${className}`}>
      {children}
    </div>
  );
}
