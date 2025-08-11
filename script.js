// Mobile-First JavaScript with Dynamic Effects and Zoom Prevention
(function() {
    'use strict';
    
    // Mobile-first feature detection
    const isMobile = window.innerWidth < 768;
    const supportsTouch = 'ontouchstart' in window;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    // Zoom Prevention for iOS
    function preventZoom() {
        if (isIOS && isSafari) {
            // iOS-specific viewport to prevent auto-zoom but allow manual zoom
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                viewport.setAttribute('content', 
                    'width=device-width, initial-scale=1, maximum-scale=1'
                );
            }
            
            // Reset zoom after input blur to allow manual zoom again
            document.addEventListener('focusout', function() {
                setTimeout(() => {
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.setAttribute('content', 
                            'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes'
                        );
                    }
                }, 100);
            });
        }
    }
    
    // Mobile Navigation Toggle
    function initMobileNav() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');

        if (!hamburger || !navMenu) return;

        // Touch-optimized toggle
        hamburger.addEventListener('click', function() {
            const isOpen = navMenu.classList.toggle('open');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpen);
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close menu when clicking nav links
        navMenu.addEventListener('click', function(e) {
            if (e.target.classList.contains('nav-link')) {
                navMenu.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    }

    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Touch-optimized interactions
    function initTouchOptimizations() {
        if (!supportsTouch) return;
        
        // Add touch feedback to interactive elements
        const touchElements = document.querySelectorAll('.btn, .dept-card, .book-card, .tab-label, .history-tab-label');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            }, { passive: true });
            
            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }, { passive: true });
        });

        // Prevent default touch behavior on certain elements
        const preventElements = document.querySelectorAll('.nav-menu, .tab-labels, .departments-grid');
        preventElements.forEach(element => {
            element.style.touchAction = 'manipulation';
        });
    }

    // Book interactions
    function initBookInteractions() {
        // Issue book buttons
        const issueButtons = document.querySelectorAll('.btn:not(.btn-disabled)');
        
        issueButtons.forEach(button => {
            if (button.textContent.includes('Issue Book')) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const bookCard = this.closest('.book-card');
                    const bookTitle = bookCard.querySelector('h4').textContent;
                    
                    if (confirm(`Would you like to issue "${bookTitle}"?`)) {
                        this.textContent = '✅ Issued';
                        this.disabled = true;
                        this.classList.add('btn-disabled');
                        showMobileToast('Book issued successfully!');
                    }
                });
            }
        });

        // Renew book buttons
        const renewButtons = document.querySelectorAll('.btn-warning');
        renewButtons.forEach(button => {
            if (button.textContent.includes('Renew')) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const bookCard = this.closest('.current-book-card');
                    const bookTitle = bookCard.querySelector('h4').textContent;
                    
                    if (confirm(`Would you like to renew "${bookTitle}"?`)) {
                        showMobileToast('Book renewed for 2 more weeks!');
                        
                        // Update days left display
                        const daysLeftElement = bookCard.querySelector('.days-left');
                        if (daysLeftElement) {
                            const currentDays = parseInt(daysLeftElement.textContent);
                            daysLeftElement.textContent = `${currentDays + 14} days left`;
                        }
                    }
                });
            }
        });
    }

    // Contact form handling
    function initContactForm() {
        const contactForm = document.querySelector('.contact-form');
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const department = formData.get('department');
            const message = formData.get('message');
            
            // Basic validation
            if (!name || !email || !department || !message) {
                showMobileToast('Please fill in all fields', 'error');
                return;
            }
            
            // Simulate form submission
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            setTimeout(() => {
                showMobileToast('Message sent successfully!');
                this.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 2000);
        });
    }

    // Mobile toast notifications
    function showMobileToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.mobile-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = 'mobile-toast';
        toast.textContent = message;
        
        const backgroundColor = type === 'error' ? '#ef4444' : '#10b981';
        
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${backgroundColor};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInUp 0.3s ease-out;
        `;
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideInUp 0.3s ease-out reverse';
            setTimeout(() => {
                toast.remove();
                style.remove();
            }, 300);
        }, 3000);
    }

    // Performance optimizations
    function initPerformanceOptimizations() {
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            document.querySelectorAll('img[loading="lazy"]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Optimize scroll performance
        let ticking = false;
        function updateScrollEffects() {
            const scrollY = window.pageYOffset;
            const header = document.querySelector('.header');
            
            if (header) {
                if (scrollY > 100) {
                    header.style.background = 'rgba(255, 255, 255, 0.98)';
                    header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                } else {
                    header.style.background = 'rgba(255, 255, 255, 0.95)';
                    header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }
            }
            
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestTick, { passive: true });
    }

    // Initialize scroll animations
    function initScrollAnimations() {
        if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // Observe elements for scroll animations
            const animatedElements = document.querySelectorAll(
                '.dept-card, .book-card, .stat-card, .status-card'
            );
            
            animatedElements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
                observer.observe(el);
            });
        }
    }

    // Handle orientation changes
    function handleOrientationChange() {
        window.addEventListener('orientationchange', function() {
            // Reset any fixed heights
            document.documentElement.style.height = 'initial';
            
            setTimeout(() => {
                // Recalculate viewport
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
                
                // Close mobile menu if open
                const navMenu = document.getElementById('nav-menu');
                const hamburger = document.getElementById('hamburger');
                
                if (navMenu && navMenu.classList.contains('open')) {
                    navMenu.classList.remove('open');
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            }, 500);
        });
    }

    // Initialize everything when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        // Core functionality
        preventZoom();
        initMobileNav();
        initSmoothScrolling();
        initTouchOptimizations();
        initBookInteractions();
        initContactForm();
        
        // Performance and visual enhancements
        initPerformanceOptimizations();
        initScrollAnimations();
        handleOrientationChange();
        
        // Set initial viewport height
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        console.log('Mobile-first library website initialized successfully!');
    });

    // Handle resize events
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }, 250);
    }, { passive: true });

})();
