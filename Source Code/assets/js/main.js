/**
 * Author: Amey Thakur
 * GitHub: https://github.com/amey-thakur
 * Date: 2026-07-01
 * License: MIT
 * Description: Main JavaScript file handling navigation and interactions.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Music Control
    const musicBtn = document.getElementById('music-btn');
    const bgMusic = document.getElementById('bg-music');
    
    if (musicBtn && bgMusic) {
        const musicIcon = musicBtn.querySelector('i');
        // Set initial volume
        bgMusic.volume = 0.4;

        musicBtn.addEventListener('click', () => {
            if (bgMusic.paused) {
                bgMusic.play().then(() => {
                    musicBtn.classList.add('playing');
                    musicIcon.classList.remove('fa-music');
                    musicIcon.classList.add('fa-pause');
                }).catch(error => {
                    console.log("Audio play failed:", error);
                });
            } else {
                bgMusic.pause();
                musicBtn.classList.remove('playing');
                musicIcon.classList.remove('fa-pause');
                musicIcon.classList.add('fa-music');
            }
        });
    }

    // --- Navigation & Mobile Menu ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li a');
    const navbar = document.querySelector('.navbar');

    // Toggle Mobile Menu
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
    });

    // Close mobile menu when a link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('toggle');
            }
        });
    });

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Active Link Highlighting
        let current = '';
        const sections = document.querySelectorAll('section, header');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(li => {
            li.classList.remove('active');
            if (li.getAttribute('href').includes(current)) {
                li.classList.add('active'); // Add CSS class for active state if needed
            }
        });
    });


    // --- Reveal on Scroll Animation ---
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Trigger when 15% of element is visible
        rootMargin: "0px"
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
        // Add base styles for reveal via JS to ensure they are hidden initially if JS loads
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.5, 0, 0, 1)';
    });

    // Add specific styles for left/right reveals
    document.querySelectorAll('.reveal-left').forEach(el => {
        el.style.transform = 'translateX(-50px)';
    });
    document.querySelectorAll('.reveal-right').forEach(el => {
        el.style.transform = 'translateX(50px)';
    });

    // Class to add when active
    const style = document.createElement('style');
    style.innerHTML = `
        .reveal-up.active, .reveal-left.active, .reveal-right.active {
            opacity: 1 !important;
            transform: translate(0, 0) !important;
        }
    `;
    document.head.appendChild(style);


    // --- Dynamic Year ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Authorship & Easter Eggs ---
    console.log(
        "%c Designed & Developed by Amey Thakur %c \nhttps://github.com/amey-thakur",
        "color: #0d9488; background: #ccfbf1; font-size: 16px; padding: 10px; border-radius: 5px; font-family: 'Inter', sans-serif; border: 2px solid #0d9488;",
        "color: #2c3e50; font-size: 12px;"
    );
    console.log("%c Psst! Click the 'dot' in the logo for a secret surprise. 🌙", 
"color: #3b82f6; font-style: italic;");

    // --- AJAX Form Submission ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData(contactForm);

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    showNotification("Message Sent Successfully! 📨", "success");
                    contactForm.reset();
                } else {
                    showNotification("Oops! Something went wrong.", "error");
                }
            }).catch(error => {
                showNotification("Error connecting to server.", "error");
            });
        });
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `form-notification ${type}`;
        notification.innerText = message;

        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove after 4.5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4500);
    }

    // --- Global Keystroke Easter Eggs ---
    let inputSequence = '';
    document.addEventListener('keydown', (e) => {
        inputSequence += e.key.toLowerCase();

        if (inputSequence.includes('amey')) {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            inputSequence = ''; // Reset
        }

        // Keep buffer small
        if (inputSequence.length > 20) {
            inputSequence = inputSequence.slice(-20);
        }
    });



    // Secret Theme Toggle (Clicking the ".")
    const logoDot = document.querySelector('.dot');
    if (logoDot) {
        logoDot.style.cursor = 'pointer';
        logoDot.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.body.classList.toggle('dark-theme');

            // Save preference
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');

            // Subtle dot pulse animation
            logoDot.style.transform = 'scale(1.8)';
            setTimeout(() => { logoDot.style.transform = 'scale(1)'; }, 300);
        });
    }

    // Restore saved theme preference on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }


    // --- PWA Handling ---
    let deferredPrompt;
    const pwaBtn = document.getElementById('pwa-install-btn');
    const pwaToast = document.getElementById('pwa-toast');

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent default browser prompt
        e.preventDefault();
        deferredPrompt = e;
        // Show our custom install button
        if (pwaBtn) pwaBtn.style.display = 'flex';
    });

    if (pwaBtn) {
        pwaBtn.addEventListener('click', (e) => {
            pwaBtn.style.display = 'none';
            // Trigger the actual prompt
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('Install accepted');
                        showPwaToast("Thank you for installing Shreyas's Portfolio! 🌟");
                    }
                    deferredPrompt = null;
                });
            }
        });
    }

    window.addEventListener('appinstalled', (evt) => {
        console.log('App installed');
        showPwaToast("App installed successfully! Welcome aboard. 🚀");
    });

    function showPwaToast(message) {
        if (!pwaToast) return;
        pwaToast.textContent = message;
        pwaToast.classList.add('show');
        setTimeout(() => {
            pwaToast.classList.remove('show');
        }, 3000);
    }

    // Unregister old Service Workers to fix caching issues and remove old Vite React app ghosts
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                registration.unregister();
                console.log('Old ServiceWorker unregistered to clear stale cache.');
            }
        });
        
        // Also clear old caches
        if (window.caches) {
            caches.keys().then(function(names) {
                for (let name of names) {
                    caches.delete(name);
                }
            });
        }
    }

});

// Global function to open document modal
window.openDocModal = function(docUrl, title) {
    const modal = document.getElementById('doc-modal');
    const iframe = document.getElementById('modal-iframe');
    const titleEl = document.getElementById('modal-title');
    const downloadBtn = document.getElementById('modal-download-btn');

    if (modal && iframe) {
        iframe.src = docUrl;
        titleEl.textContent = title;
        downloadBtn.href = docUrl;
        
        // Force the download attribute to use the actual filename
        const fileName = docUrl.split('/').pop();
        downloadBtn.setAttribute('download', fileName);
        
        // Override click to force download via blob for stubborn browsers
        downloadBtn.onclick = function(e) {
            e.preventDefault();
            
            // Show brief loading state
            const originalText = downloadBtn.innerHTML;
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
            
            fetch(docUrl)
                .then(response => response.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    downloadBtn.innerHTML = originalText;
                })
                .catch(() => {
                    // Fallback
                    const a = document.createElement('a');
                    a.href = docUrl;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    downloadBtn.innerHTML = originalText;
                });
        };
        
        // Show modal
        modal.style.display = 'flex';
        // Small delay to allow display:flex to apply before adding the opacity class for transition
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
};

// Setup modal close handlers once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('doc-modal');
    const closeBtn = document.querySelector('.close-modal');
    
    if (modal && closeBtn) {
        // Close on X button click
        closeBtn.addEventListener('click', () => {
            closeModal();
        });
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    function closeModal() {
        modal.classList.remove('show');
        // Wait for transition to finish before hiding completely
        setTimeout(() => {
            modal.style.display = 'none';
            document.getElementById('modal-iframe').src = ''; // Clear iframe to stop loading/audio if any
        }, 300);
    }

    // Back to top button logic
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Digital Business Card Modal ---
    const logoBtn = document.getElementById('logo-btn');
    const bizModal = document.getElementById('biz-card-modal');
    const closeBizCard = document.querySelector('.close-biz-card');

    if (logoBtn && bizModal) {
        // Open on logo click
        logoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            bizModal.style.display = 'flex';
            // Small delay for CSS transition to kick in
            setTimeout(() => {
                bizModal.classList.add('show');
            }, 10);
        });

        // Close on X button
        if (closeBizCard) {
            closeBizCard.addEventListener('click', () => {
                closeBizModal();
            });
        }

        // Close on backdrop click
        bizModal.addEventListener('click', (e) => {
            if (e.target === bizModal) {
                closeBizModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && bizModal.classList.contains('show')) {
                closeBizModal();
            }
        });

        function closeBizModal() {
            bizModal.classList.remove('show');
            setTimeout(() => {
                bizModal.style.display = 'none';
            }, 300);
        }
    }
});
