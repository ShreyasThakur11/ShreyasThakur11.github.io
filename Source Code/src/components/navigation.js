/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Navigation component with responsive menu and scroll spy.
 */

import { createElement, $ } from '../utils/dom.js';

export const renderNavigation = () => {
  const nav = createElement('nav', { className: 'nav-main', id: 'site-nav' });
  
  const container = createElement('div', { className: 'container nav-container' });
  
  // Logo
  const logo = createElement('a', { 
    href: '#top', 
    className: 'nav-logo',
    'aria-label': 'Shreyas Thakur - Home'
  });
  
  // Simple clean SVG logo or text
  logo.innerHTML = `<span class="logo-text">Shreyas Thakur</span>`;
  
  // Desktop Menu
  const menu = createElement('ul', { className: 'nav-menu' });
  
  const links = [
    { label: 'About', href: '#about' },
    { label: 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
    { label: 'Contact', href: '#contact' },
  ];
  
  links.forEach(link => {
    const li = createElement('li', { className: 'nav-item' });
    const a = createElement('a', { 
      href: link.href, 
      className: 'nav-link',
    }, link.label);
    
    li.appendChild(a);
    menu.appendChild(li);
  });
  
  // Mobile Toggle Button
  const toggleBtn = createElement('button', { 
    className: 'nav-toggle', 
    'aria-label': 'Toggle menu',
    'aria-expanded': 'false'
  });
  
  toggleBtn.innerHTML = `
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
  `;
  
  // Assemble
  container.appendChild(logo);
  container.appendChild(menu);
  container.appendChild(toggleBtn);
  nav.appendChild(container);
  
  // Mobile Menu Logic
  let isMenuOpen = false;
  
  const toggleMenu = () => {
    isMenuOpen = !isMenuOpen;
    toggleBtn.setAttribute('aria-expanded', String(isMenuOpen));
    nav.classList.toggle('is-open', isMenuOpen);
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
  };
  
  toggleBtn.addEventListener('click', toggleMenu);
  
  // Close menu when clicking a link
  const navLinks = menu.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (isMenuOpen) toggleMenu();
    });
  });
  
  // Add blur/shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  });

  return nav;
};

// Global scroll spy updater
export const updateNavigationActiveState = (activeId) => {
  const nav = $('#site-nav');
  if (!nav) return;
  
  const links = nav.querySelectorAll('.nav-link');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === `#${activeId}`) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
};
