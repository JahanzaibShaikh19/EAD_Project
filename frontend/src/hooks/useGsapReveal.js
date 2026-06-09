// frontend/src/hooks/useGsapReveal.js
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * Reusable GSAP entrance animation hook
 * @param {Object} options
 * @param {string} options.selector - CSS selector for elements to animate
 * @param {Object} options.from - GSAP from properties
 * @param {Object} options.options - GSAP timeline options
 */
export function useGsapReveal({ selector, from, deps = [] } = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (selector) {
        gsap.from(selector, {
          y: 20,
          opacity: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power2.out',
          ...from,
        });
      }
    }, containerRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerRef;
}

/**
 * Animate a counter from 0 to target value
 */
export function useGsapCounter(targetValue, options = {}) {
  const counterRef = useRef(null);

  useEffect(() => {
    if (!counterRef.current || targetValue === undefined || targetValue === null) return;

    const obj = { value: 0 };
    gsap.to(obj, {
      value: Number(targetValue),
      duration: options.duration || 1.4,
      ease: options.ease || 'power2.out',
      snap: { value: 1 },
      onUpdate() {
        if (counterRef.current) {
          const formatted = options.format
            ? options.format(Math.round(obj.value))
            : Math.round(obj.value).toLocaleString();
          counterRef.current.textContent = formatted;
        }
      },
    });

    return () => {
      gsap.killTweensOf(obj);
    };
  }, [targetValue]);

  return counterRef;
}

/**
 * Animate table rows sliding in
 */
export function useGsapTableReveal(deps = []) {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.table-row', {
        x: -16,
        opacity: 0,
        duration: 0.3,
        stagger: 0.04,
        ease: 'power2.out',
      });
    });
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default useGsapReveal;
