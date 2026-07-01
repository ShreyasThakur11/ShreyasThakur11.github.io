/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Accessibility utilities for focus trapping and keyboard navigation.
 */

export const trapFocus = (element) => {
  const focusableEls = element.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
  );
  
  if (focusableEls.length === 0) return null;
  
  const firstFocusableEl = focusableEls[0];  
  const lastFocusableEl = focusableEls[focusableEls.length - 1];

  const handleKeyDown = (e) => {
    const isTabPressed = e.key === 'Tab' || e.keyCode === 9;

    if (!isTabPressed) return;

    if (e.shiftKey) { 
      if (document.activeElement === firstFocusableEl) {
        lastFocusableEl.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusableEl) {
        firstFocusableEl.focus();
        e.preventDefault();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);
  firstFocusableEl.focus();
  
  return () => element.removeEventListener('keydown', handleKeyDown);
};

export const isReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
