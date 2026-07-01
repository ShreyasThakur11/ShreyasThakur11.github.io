/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Scroll utilities including intersection observers for animations and scrollspy.
 */

import { $$, throttle } from './dom.js';

// Setup reveal animations on scroll
export const initScrollReveal = () => {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return;

  const revealElements = $$('.reveal');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Optional: unobserve after revealing once
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
};

// Scrollspy for navigation active state
export const initScrollSpy = (onSectionChange) => {
  const sections = $$('section[id]');
  
  const handleScroll = throttle(() => {
    const scrollPosition = window.scrollY + 100; // offset for sticky nav
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        onSectionChange(section.id);
      }
    });
  }, 100);

  window.addEventListener('scroll', handleScroll);
  // Initial call
  handleScroll();
};
