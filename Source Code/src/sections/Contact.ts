/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Reach me section with an integrated Formspree contact form.
 */

import { createElement, $ } from '../utils/dom.js';

export const renderContact = (): HTMLElement => {
  const section = createElement('section', { className: 'section bg-alt', id: 'contact' });
  const container = createElement('div', { className: 'container contact-container' });

  // Section Header
  const header = createElement('div', { className: 'section-header reveal' });
  header.innerHTML = `
    <h2 class="section-title">Reach Me</h2>
    <p class="section-desc">Open to discussing opportunities in strategy, analytics, and operations management. Whether you are a recruiter, a founder, or just want to connect, feel free to leave a message.</p>
  `;

  // Form Container
  const formWrapper = createElement('div', { className: 'form-wrapper reveal reveal-delay-1' });
  
  // Note: Replace the action URL with the actual Formspree endpoint when ready
  const form = createElement('form', { 
    className: 'contact-form',
    id: 'contact-form',
    action: 'https://formspree.io/f/mqazkweo', 
    method: 'POST'
  });

  form.innerHTML = `
    <div class="form-group">
      <label for="name" class="form-label">Name</label>
      <input type="text" id="name" name="name" class="form-control" required placeholder="Jane Doe" />
    </div>
    
    <div class="form-group">
      <label for="email" class="form-label">Email</label>
      <input type="email" id="email" name="email" class="form-control" required placeholder="jane@example.com" />
    </div>
    
    <div class="form-group">
      <label for="message" class="form-label">Message</label>
      <textarea id="message" name="message" class="form-control" rows="5" required placeholder="How can we collaborate?"></textarea>
    </div>
    
    <button type="submit" class="btn btn-primary form-submit-btn">
      Send Message
    </button>
    
    <div id="form-status" class="form-status"></div>
  `;

  // Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = $('#form-status', form);
    const btn = $('.form-submit-btn', form) as HTMLButtonElement;
    
    if (!status || !btn) return;
    
    btn.disabled = true;
    btn.textContent = 'Sending...';
    status.className = 'form-status';
    status.textContent = '';
    
    const data = new FormData(form as HTMLFormElement);
    
    try {
      const response = await fetch(form.getAttribute('action') || '', {
        method: form.getAttribute('method') || 'POST',
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        status.textContent = 'Message sent successfully. I will be in touch soon.';
        status.classList.add('success');
        (form as HTMLFormElement).reset();
      } else {
        const result = await response.json();
        if (Object.hasOwn(result, 'errors')) {
          status.textContent = result.errors.map((err: any) => err.message).join(', ');
        } else {
          status.textContent = 'Oops! There was a problem submitting your form.';
        }
        status.classList.add('error');
      }
    } catch (error) {
      status.textContent = 'Oops! There was a problem submitting your form.';
      status.classList.add('error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Message';
    }
  });

  formWrapper.appendChild(form);
  
  container.appendChild(header);
  container.appendChild(formWrapper);
  section.appendChild(container);

  return section;
};
