/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Contact & Reach Me section with Formspree integration.
 */

import { createElement } from '../utils/dom.js';

export const renderContact = () => {
  const section = createElement('section', { id: 'contact', className: 'section bg-alt' });
  const container = createElement('div', { className: 'container' });
  
  const subtitle = createElement('span', { className: 'section-subtitle reveal' }, '09. What\'s Next?');
  const title = createElement('h2', { className: 'reveal reveal-delay-1' }, 'Get In Touch');
  
  const grid = createElement('div', { className: 'contact-grid' });
  
  // Left: Copy
  const copyCol = createElement('div', { className: 'contact-copy reveal reveal-delay-2' });
  copyCol.innerHTML = `
    <p class="text-lg mb-6">Currently pursuing my MBA and open to networking, collaborating on projects, or discussing new opportunities at the intersection of operations and strategy.</p>
    <p class="text-muted mb-8">My inbox is always open. Whether you have a question or just want to say hi, I'll try my best to get back to you!</p>
    
    <div class="contact-methods">
      <a href="mailto:thakursm11@gmail.com" class="contact-method-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
        thakursm11@gmail.com
      </a>
      <a href="https://linkedin.com/in/shreyasthakur11" target="_blank" rel="noopener noreferrer" class="contact-method-link">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
          <rect x="2" y="9" width="4" height="12"></rect>
          <circle cx="4" cy="4" r="2"></circle>
        </svg>
        linkedin.com/in/shreyasthakur11
      </a>
    </div>
  `;
  
  // Right: Formspree Form
  const formCol = createElement('div', { className: 'contact-form-wrapper card reveal reveal-delay-3' });
  
  const form = createElement('form', {
    className: 'contact-form',
    action: 'https://formspree.io/f/YOUR_FORM_ID', // Replaced by user later
    method: 'POST'
  });
  
  form.innerHTML = `
    <div class="form-group">
      <label for="name" class="form-label">Name</label>
      <input type="text" id="name" name="name" class="form-control" placeholder="Jane Doe" required />
    </div>
    
    <div class="form-group">
      <label for="email" class="form-label">Email</label>
      <input type="email" id="email" name="_replyto" class="form-control" placeholder="jane@example.com" required />
    </div>
    
    <div class="form-group">
      <label for="subject" class="form-label">Subject</label>
      <input type="text" id="subject" name="subject" class="form-control" placeholder="Hello!" required />
    </div>
    
    <div class="form-group">
      <label for="message" class="form-label">Message</label>
      <textarea id="message" name="message" class="form-control" rows="5" placeholder="Your message here..." required></textarea>
    </div>
    
    <!-- Anti-spam honeypot -->
    <input type="text" name="_gotcha" style="display:none" />
    
    <!-- Config -->
    <input type="hidden" name="_subject" value="New submission from Portfolio!" />
    
    <button type="submit" class="btn btn-primary w-full mt-4">
      Send Message
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </button>
  `;
  
  // Basic Form Interaction (Optional visual feedback)
  form.addEventListener('submit', (e) => {
    // We let Formspree handle the actual submission and redirect,
    // but we could add loading states here if we used AJAX.
    const btn = form.querySelector('button[type="submit"]');
    btn.innerHTML = 'Sending...';
    btn.style.opacity = '0.7';
  });
  
  formCol.appendChild(form);
  
  grid.appendChild(copyCol);
  grid.appendChild(formCol);
  
  container.appendChild(subtitle);
  container.appendChild(title);
  container.appendChild(grid);
  section.appendChild(container);
  
  return section;
};
