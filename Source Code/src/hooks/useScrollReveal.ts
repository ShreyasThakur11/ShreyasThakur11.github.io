/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Intersection Observer hook to reveal elements smoothly on scroll.
 */

import { $$ } from '../utils/dom.js';

/**
 * Initializes the scroll reveal observer for elements with the .reveal class.
 */
export const useScrollReveal = (): void => {
  const observerOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1, // Trigger when 10% of element is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Stop observing once revealed for a calm, one-time animation
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const revealElements = $$('.reveal');
  revealElements.forEach(el => observer.observe(el));
};
