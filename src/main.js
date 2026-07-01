/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Main application entry point. Initializes components and utilities.
 */

import { $, createElement } from './utils/dom.js';
import { initScrollReveal, initScrollSpy } from './utils/scroll.js';

// Import Components
import { renderNavigation, updateNavigationActiveState } from './components/navigation.js';
import { renderFooter } from './components/footer.js';

// Import Sections
import { renderHero } from './sections/hero.js';
import { renderAbout } from './sections/about.js';
import { renderJourney } from './sections/journey.js';
import { renderExperience } from './sections/experience.js';
import { renderProjects } from './sections/projects.js';
import { renderSkills } from './sections/skills.js';
import { renderLeadership } from './sections/leadership.js';
import { renderEducation } from './sections/education.js';
import { renderCertifications } from './sections/certifications.js';
import { renderContact } from './sections/contact.js';

// Import Styles for Sections (to be handled by Vite in dev/build)
import './styles/navigation.css';
import './styles/footer.css';
import './styles/hero.css';
import './styles/about.css';
import './styles/journey.css';
import './styles/experience.css';
import './styles/projects.css';
import './styles/skills.css';
import './styles/leadership.css';
import './styles/education.css';
import './styles/certifications.css';
import './styles/contact.css';

const initApp = () => {
  const app = $('#app');
  if (!app) return;

  // Easter Egg: Console Message
  console.info(`
 ____  _                      
/ ___|| |_ __ _  _ __ ___  _   _  __ _ ___ 
\\___ \\| __|  _\` || '__/ _ \\| | | |/ _\` / __|
 ___) | |_| | | || | |  __/| |_| | (_| \\__ \\
|____/ \\__|_| |_||_|  \\___| \\__, |\\__,_|___/
                            |___/           
Hey there, curious engineer! 👋
Built with care. Want to collaborate? → thakursm11@gmail.com
  `);

  // Assemble the application
  app.appendChild(renderNavigation());
  
  const main = createElement('main', { id: 'main-content' });
  
  main.appendChild(renderHero());
  main.appendChild(renderAbout());
  main.appendChild(renderJourney());
  main.appendChild(renderExperience());
  main.appendChild(renderProjects());
  main.appendChild(renderSkills());
  main.appendChild(renderLeadership());
  main.appendChild(renderEducation());
  main.appendChild(renderCertifications());
  main.appendChild(renderContact());
  
  app.appendChild(main);
  
  app.appendChild(renderFooter());

  // Easter Egg: Keyboard Shortcut Cmd+K / Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const contactSection = $('#contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        const nameInput = $('#name');
        if (nameInput) setTimeout(() => nameInput.focus(), 800);
      }
    }
  });

  // Initialize utilities after DOM is ready
  setTimeout(() => {
    initScrollReveal();
    initScrollSpy(updateNavigationActiveState);
  }, 0);
};

document.addEventListener('DOMContentLoaded', initApp);
