/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Main site navigation component with a sticky, blurred header and responsive menu.
 */

import { createElement } from '../utils/dom.js';

export const renderNavigation = (): HTMLElement => {
  const header = createElement('header', { className: 'site-header' });
  const container = createElement('div', { className: 'container header-container' });

  // Logo / Name
  const logo = createElement('a', { 
    href: '#top', 
    className: 'site-logo',
    'aria-label': 'Shreyas Thakur - Home'
  }, 'Shreyas Thakur.');

  // Desktop Navigation
  const nav = createElement('nav', { className: 'desktop-nav' });
  const navList = createElement('ul', { className: 'nav-list' });

  const links = [
    { label: 'Experience', href: '#experience' },
    { label: 'Projects', href: '#projects' },
    { label: 'Education', href: '#education' }
  ];

  links.forEach(link => {
    const li = createElement('li');
    const a = createElement('a', { href: link.href, className: 'nav-link' }, link.label);
    li.appendChild(a);
    navList.appendChild(li);
  });

  nav.appendChild(navList);

  // Contact Action
  const actionsContainer = createElement('div', { className: 'nav-actions' });
  
  const resumeBtn = createElement('a', { 
    href: 'https://github.com/ShreyasThakur11/Resume/releases/latest/download/Shreyas_Thakur_Resume.pdf', 
    className: 'nav-link',
    target: '_blank',
    rel: 'noopener noreferrer'
  }, 'Resume');

  const contactBtn = createElement('a', { 
    href: '#contact', 
    className: 'btn btn-primary nav-contact-btn' 
  }, 'Reach Me');

  const themeToggle = createElement('button', { 
    id: 'theme-toggle', 
    className: 'nav-link', 
    style: 'background: transparent; border: none; cursor: pointer; padding: 0.5rem; display: flex; align-items: center;',
    'aria-label': 'Toggle Dark Mode'
  });

  actionsContainer.appendChild(themeToggle);
  actionsContainer.appendChild(resumeBtn);
  actionsContainer.appendChild(contactBtn);

  // Assemble Header
  container.appendChild(logo);
  container.appendChild(nav);
  container.appendChild(actionsContainer);
  header.appendChild(container);

  // Scroll effect for blur and border
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  });

  return header;
};
