/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Application entry point and orchestrator.
 */

import { createElement, $ } from './utils/dom.js';
import { useScrollReveal } from './hooks/useScrollReveal.js';

import { renderNavigation } from './layouts/Navigation.js';
import { renderFooter } from './layouts/Footer.js';

import { renderHero } from './sections/Hero.js';
import { renderAbout } from './sections/About.js';
import { renderProjects } from './sections/Projects.js';
import { renderExperience } from './sections/Experience.js';
import { renderEducation } from './sections/Education.js';
import { renderCertifications } from './sections/Certifications.js';
import { renderContact } from './sections/Contact.js';

import { renderModal } from './components/Modal.js';

// Styles
import './styles/global.css';
import './styles/layouts.css';
import './styles/sections.css';
import './styles/about.css';
import './styles/components.css';
import './styles/modal.css';

const initApp = (): void => {
  const root = $('#root');
  if (!root) return;

  // Assembly
  root.appendChild(renderNavigation());
  
  const main = createElement('main', { id: 'main-content' });
  
  main.appendChild(renderHero());
  main.appendChild(renderAbout());
  main.appendChild(renderExperience());
  main.appendChild(renderProjects());
  main.appendChild(renderEducation());
  main.appendChild(renderCertifications());
  main.appendChild(renderContact());
  
  root.appendChild(main);
  root.appendChild(renderFooter());
  root.appendChild(renderModal());

  // Initialization of client-side logic
  setTimeout(() => {
    useScrollReveal();
  }, 0);

  // Keyboard Shortcuts (Easter Egg)
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const contact = $('#contact');
      if (contact) {
        contact.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const nameInput = $('#name');
          if (nameInput) nameInput.focus();
        }, 800);
      }
    }
  });

  // Console Easter Egg
  console.info(`
%cShreyas Thakur%c
Executive Portfolio
------------------------------------------------
Built with precision. 
Contact: thakursm11@gmail.com
  `, 'font-size: 20px; font-weight: bold; color: #111827;', 'font-size: 14px; color: #4b5563;');
};

document.addEventListener('DOMContentLoaded', initApp);
