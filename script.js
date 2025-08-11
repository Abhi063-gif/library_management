(function() {
    'use strict';
    
   
    
    const CONFIG = {
        breakpoints: {
            mobile: 480,
            tablet: 768,
            desktop: 1024
        },
        animation: {
            duration: 300,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        },
        debounce: {
            scroll: 16,
            resize: 250
        }
    };
    
    // Feature Detection
    const FEATURES = {
        isMobile: window.innerWidth < CONFIG.breakpoints.tablet,
        supportsTouch: 'ontouchstart' in window,
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
        supportsIntersectionObserver: 'IntersectionObserver' in window,
        supportsServiceWorker: 'serviceWorker' in navigator,
        supportsWebShare: 'share' in navigator,
        supportsVibration: 'vibrate' in navigator,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
    
   
    
    const Utils = {
        // Debounce function for performance
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        // Throttle function for scroll events
        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },
        
        // Query selector helper
        $(selector, context = document) {
            return context.querySelector(selector);
        },
        
        // Query selector all helper
        $$(selector, context = document) {
            return context.querySelectorAll(selector);
        },
        
        // Add class helper
        addClass(element, className) {
            if (element) element.classList.add(className);
        },
        
        // Remove class helper
        removeClass(element, className) {
            if (element) element.classList.remove(className);
        },
        
        // Toggle class helper
        toggleClass(element, className) {
            if (element) return element.classList.toggle(className);
        },
        
        // Check if element has class
        hasClass(element, className) {
            return element ? element.classList.contains(className) : false;
        },
        
        // Get viewport dimensions
        getViewport() {
            return {
                width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
                height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
            };
        },
        
        // Smooth scroll to element
        scrollTo(element, offset = 0) {
            if (!element) return;
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        },
        
        // Generate unique ID
        generateId() {
            return '_' + Math.random().toString(36).substr(2, 9);
        }
    };
    
   
    
    const ZoomPrevention = {
        init() {
            this.preventIOSZoom();
            this.setupFormInputs();
        },
        
        preventIOSZoom() {
            if (!FEATURES.isIOS || !FEATURES.isSafari) return;
            
            const viewport = Utils.$('meta[name="viewport"]');
            if (!viewport) return;
            
            // Temporarily disable zoom during input focus
            document.addEventListener('focusin', (e) => {
                if (this.isFormInput(e.target)) {
                    viewport.setAttribute('content', 
                        'width=device-width, initial-scale=1, maximum-scale=1'
                    );
                }
            });
            
            // Re-enable zoom after input blur
            document.addEventListener('focusout', () => {
                setTimeout(() => {
                    viewport.setAttribute('content', 
                        'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes'
                    );
                }, 100);
            });
        },
        
        setupFormInputs() {
            const inputs = Utils.$$('input, textarea, select');
            inputs.forEach(input => {
                // Ensure 16px font size to prevent zoom
                if (window.getComputedStyle(input).fontSize === '16px') return;
                input.style.fontSize = '16px';
                
                // Add focus handling
                input.addEventListener('focus', this.handleInputFocus);
                input.addEventListener('blur', this.handleInputBlur);
            });
        },
        
        isFormInput(element) {
            const inputTypes = ['input', 'textarea', 'select'];
            return inputTypes.includes(element.tagName.toLowerCase());
        },
        
        handleInputFocus(e) {
            e.target.style.fontSize = '16px';
        },
        
        handleInputBlur(e) {
            // Reset any zoom if occurred
            if (FEATURES.isIOS) {
                window.scrollTo(0, 0);
            }
        }
    };
    
   
    
    const Navigation = {
        init() {
            this.hamburger = Utils.$('#hamburger');
            this.navMenu = Utils.$('#nav-menu');
            this.header = Utils.$('.header');
            this.isOpen = false;
            
            if (!this.hamburger || !this.navMenu) return;
            
            this.setupEventListeners();
            this.setupScrollBehavior();
            this.setupKeyboardNavigation();
        },
        
        setupEventListeners() {
            // Hamburger click
            this.hamburger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggle();
            });
            
            // Nav link clicks
            this.navMenu.addEventListener('click', (e) => {
                if (Utils.hasClass(e.target, 'nav-link')) {
                    this.close();
                    this.handleNavLinkClick(e.target);
                }
            });
            
            // Click outside to close
            document.addEventListener('click', (e) => {
                if (this.isOpen && 
                    !this.hamburger.contains(e.target) && 
                    !this.navMenu.contains(e.target)) {
                    this.close();
                }
            });
            
            // Window resize
            window.addEventListener('resize', Utils.debounce(() => {
                if (Utils.getViewport().width >= CONFIG.breakpoints.tablet && this.isOpen) {
                    this.close();
                }
            }, CONFIG.debounce.resize));
            
            // Escape key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                    this.hamburger.focus();
                }
            });
        },
        
        setupScrollBehavior() {
            let lastScrollY = window.pageYOffset;
            
            const updateHeader = Utils.throttle(() => {
                const scrollY = window.pageYOffset;
                
                // Change header background on scroll
                if (scrollY > 100) {
                    this.header.style.background = 'rgba(255, 255, 255, 0.98)';
                    this.header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                } else {
                    this.header.style.background = 'rgba(255, 255, 255, 0.95)';
                    this.header.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                }
                
                // Hide/show header on scroll (mobile only)
                if (FEATURES.isMobile && Math.abs(scrollY - lastScrollY) > 10) {
                    if (scrollY > lastScrollY && scrollY > 100) {
                        // Scrolling down
                        this.header.style.transform = 'translateY(-100%)';
                    } else {
                        // Scrolling up
                        this.header.style.transform = 'translateY(0)';
                    }
                }
                
                lastScrollY = scrollY;
            }, CONFIG.debounce.scroll);
            
            window.addEventListener('scroll', updateHeader, { passive: true });
        },
        
        setupKeyboardNavigation() {
            const navLinks = Utils.$$('.nav-link');
            navLinks.forEach((link, index) => {
                link.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        const nextIndex = (index + 1) % navLinks.length;
                        navLinks[nextIndex].focus();
                    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                        e.preventDefault();
                        const prevIndex = (index - 1 + navLinks.length) % navLinks.length;
                        navLinks[prevIndex].focus();
                    }
                });
            });
        },
        
        toggle() {
            this.isOpen ? this.close() : this.open();
        },
        
        open() {
            this.isOpen = true;
            Utils.addClass(this.navMenu, 'open');
            Utils.addClass(this.hamburger, 'active');
            this.hamburger.setAttribute('aria-expanded', 'true');
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            
            // Focus first nav link
            const firstLink = Utils.$('.nav-link');
            if (firstLink) firstLink.focus();
            
            // Haptic feedback
            this.vibrate();
        },
        
        close() {
            this.isOpen = false;
            Utils.removeClass(this.navMenu, 'open');
            Utils.removeClass(this.hamburger, 'active');
            this.hamburger.setAttribute('aria-expanded', 'false');
            
            // Restore body scroll
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        },
        
        handleNavLinkClick(link) {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                const target = Utils.$(href);
                if (target) {
                    const headerHeight = this.header.offsetHeight;
                    Utils.scrollTo(target, headerHeight);
                }
            }
        },
        
        vibrate() {
            if (FEATURES.supportsVibration) {
                navigator.vibrate(50);
            }
        }
    };
    
 
    const TouchHandler = {
        init() {
            if (!FEATURES.supportsTouch) return;
            
            this.setupTouchFeedback();
            this.setupSwipeGestures();
            this.optimizeTouchTargets();
        },
        
        setupTouchFeedback() {
            const touchElements = Utils.$$('.btn, .dept-card, .book-card, .tab-label, .history-tab-label, .stat-item');
            
            touchElements.forEach(element => {
                let touchTimeout;
                
                element.addEventListener('touchstart', (e) => {
                    Utils.addClass(element, 'touch-active');
                    element.style.transform = 'scale(0.95)';
                    
                    // Clear any existing timeout
                    clearTimeout(touchTimeout);
                }, { passive: true });
                
                element.addEventListener('touchend', (e) => {
                    touchTimeout = setTimeout(() => {
                        Utils.removeClass(element, 'touch-active');
                        element.style.transform = '';
                    }, 150);
                }, { passive: true });
                
                element.addEventListener('touchcancel', (e) => {
                    Utils.removeClass(element, 'touch-active');
                    element.style.transform = '';
                    clearTimeout(touchTimeout);
                }, { passive: true });
            });
        },
        
        setupSwipeGestures() {
            const swipeContainer = Utils.$('.books-grid');
            if (!swipeContainer || Utils.getViewport().width >= CONFIG.breakpoints.tablet) return;
            
            let startX = 0;
            let startY = 0;
            let distX = 0;
            let distY = 0;
            
            swipeContainer.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
            }, { passive: true });
            
            swipeContainer.addEventListener('touchmove', (e) => {
                if (!startX || !startY) return;
                
                const touch = e.touches[0];
                distX = touch.clientX - startX;
                distY = touch.clientY - startY;
                
                // Prevent vertical scroll if horizontal swipe detected
                if (Math.abs(distX) > Math.abs(distY)) {
                    e.preventDefault();
                }
            });
            
            swipeContainer.addEventListener('touchend', (e) => {
                if (!startX || !startY) return;
                
                // Detect swipe direction
                if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > 50) {
                    if (distX > 0) {
                        this.handleSwipeRight();
                    } else {
                        this.handleSwipeLeft();
                    }
                }
                
                startX = 0;
                startY = 0;
                distX = 0;
                distY = 0;
            }, { passive: true });
        },
        
        optimizeTouchTargets() {
            const elements = Utils.$$('button, a, input, select, textarea');
            elements.forEach(element => {
                const rect = element.getBoundingClientRect();
                if (rect.height < 44) {
                    element.style.minHeight = '44px';
                }
                if (rect.width < 44 && element.tagName.toLowerCase() === 'button') {
                    element.style.minWidth = '44px';
                }
            });
        },
        
        handleSwipeLeft() {
            // Navigate to next tab or section
            this.navigateTab('next');
        },
        
        handleSwipeRight() {
            // Navigate to previous tab or section
            this.navigateTab('prev');
        },
        
        navigateTab(direction) {
            const currentTab = Utils.$('input[name="dept-tabs"]:checked');
            if (!currentTab) return;
            
            const allTabs = Utils.$$('input[name="dept-tabs"]');
            const currentIndex = Array.from(allTabs).indexOf(currentTab);
            let nextIndex;
            
            if (direction === 'next') {
                nextIndex = (currentIndex + 1) % allTabs.length;
            } else {
                nextIndex = (currentIndex - 1 + allTabs.length) % allTabs.length;
            }
            
            allTabs[nextIndex].checked = true;
        }
    };
    
   
    
    const Animations = {
        init() {
            if (FEATURES.prefersReducedMotion) return;
            
            this.setupScrollAnimations();
            this.setupHoverAnimations();
            this.setupLoadingAnimations();
        },
        
        setupScrollAnimations() {
            if (!FEATURES.supportsIntersectionObserver) return;
            
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        Utils.addClass(entry.target, 'animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            
            // Observe elements for animations
            const animatedElements = Utils.$$('.dept-card, .book-card, .stat-card, .status-card, .hero-content, .section-title');
            animatedElements.forEach((element, index) => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
                observer.observe(element);
            });
            
            // Add animate-in class styles
            const style = document.createElement('style');
            style.textContent = `
                .animate-in {
                    opacity: 1 !important;
                    transform: translateY(0) !important;
                }
            `;
            document.head.appendChild(style);
        },
        
        setupHoverAnimations() {
            if (FEATURES.isMobile) return; // Skip hover effects on mobile
            
            const hoverElements = Utils.$$('.dept-card, .book-card');
            hoverElements.forEach(element => {
                element.addEventListener('mouseenter', () => {
                    element.style.transform = 'translateY(-8px) scale(1.02)';
                    element.style.boxShadow = '0 20px 25px rgba(0, 0, 0, 0.15)';
                });
                
                element.addEventListener('mouseleave', () => {
                    element.style.transform = '';
                    element.style.boxShadow = '';
                });
            });
        },
        
        setupLoadingAnimations() {
            const loadingElements = Utils.$$('.btn');
            loadingElements.forEach(button => {
                const originalClickHandler = button.onclick;
                button.addEventListener('click', (e) => {
                    if (Utils.hasClass(button, 'loading')) return;
                    
                    this.showLoadingState(button);
                    
                    // Simulate loading
                    setTimeout(() => {
                        this.hideLoadingState(button);
                    }, 1000);
                });
            });
        },
        
        showLoadingState(element) {
            Utils.addClass(element, 'loading');
            const originalText = element.textContent;
            element.dataset.originalText = originalText;
            element.textContent = 'Loading...';
            element.disabled = true;
        },
        
        hideLoadingState(element) {
            Utils.removeClass(element, 'loading');
            element.textContent = element.dataset.originalText || element.textContent;
            element.disabled = false;
        }
    };
    
   
    const BookManager = {
        init() {
            this.setupIssueButtons();
            this.setupRenewButtons();
            this.setupTabSwitching();
            this.loadUserData();
        },
        
        setupIssueButtons() {
            const issueButtons = Utils.$$('.btn:not(.btn-disabled)');
            issueButtons.forEach(button => {
                if (button.textContent.includes('Issue Book')) {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.handleBookIssue(button);
                    });
                }
            });
        },
        
        setupRenewButtons() {
            const renewButtons = Utils.$$('.btn-warning');
            renewButtons.forEach(button => {
                if (button.textContent.includes('Renew')) {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.handleBookRenewal(button);
                    });
                }
            });
        },
        
        setupTabSwitching() {
            const departmentCards = Utils.$$('.dept-card');
            departmentCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    const department = card.getAttribute('href').substring(1);
                    this.switchToDepartment(department);
                });
            });
        },
        
        handleBookIssue(button) {
            const bookCard = button.closest('.book-card');
            const bookTitle = bookCard.querySelector('h4').textContent;
            
            if (this.showConfirmation(`Issue "${bookTitle}"?`)) {
                Animations.showLoadingState(button);
                
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-check"></i> Issued';
                    Utils.addClass(button, 'btn-disabled');
                    button.disabled = true;
                    
                    this.showToast('Book issued successfully!', 'success');
                    this.updateBookStatus(bookCard, 'issued');
                    Animations.hideLoadingState(button);
                }, 1500);
            }
        },
        
        handleBookRenewal(button) {
            const bookCard = button.closest('.current-book-card');
            const bookTitle = bookCard.querySelector('h4').textContent;
            
            if (this.showConfirmation(`Renew "${bookTitle}" for 2 more weeks?`)) {
                Animations.showLoadingState(button);
                
                setTimeout(() => {
                    this.showToast('Book renewed successfully!', 'success');
                    this.updateDaysLeft(bookCard, 14);
                    Animations.hideLoadingState(button);
                }, 1500);
            }
        },
        
        switchToDepartment(department) {
            const targetTab = Utils.$(`#tab-${department}`);
            if (targetTab) {
                targetTab.checked = true;
                
                // Scroll to catalog section
                const catalogSection = Utils.$('#catalog');
                if (catalogSection) {
                    Utils.scrollTo(catalogSection, 80);
                }
                
                this.showToast(`Switched to ${department} department`, 'info');
            }
        },
        
        updateBookStatus(bookCard, status) {
            const availability = bookCard.querySelector('.availability');
            if (availability) {
                availability.textContent = status === 'issued' ? 'Currently Issued' : 'Available';
                availability.className = `availability ${status}`;
            }
        },
        
        updateDaysLeft(bookCard, additionalDays) {
            const daysLeftElement = bookCard.querySelector('.days-left');
            if (daysLeftElement) {
                const currentText = daysLeftElement.textContent;
                const currentDays = parseInt(currentText) || 0;
                const newDays = currentDays + additionalDays;
                daysLeftElement.textContent = `${newDays} days left`;
                
                // Update color based on days left
                if (newDays > 7) {
                    daysLeftElement.style.color = 'var(--success-color)';
                } else if (newDays > 3) {
                    daysLeftElement.style.color = 'var(--warning-color)';
                } else {
                    daysLeftElement.style.color = 'var(--danger-color)';
                }
            }
        },
        
        showConfirmation(message) {
            return confirm(message);
        },
        
        loadUserData() {
            // Simulate loading user data
            const userData = this.getUserData();
            this.displayUserStats(userData);
        },
        
        getUserData() {
            // In a real app, this would fetch from an API
            return {
                booksIssued: 12,
                booksReturned: 8,
                currentlyIssued: 4,
                overdueDays: 0
            };
        },
        
        displayUserStats(data) {
            const statNumbers = Utils.$$('.stat-info .stat-number');
            if (statNumbers.length >= 3) {
                statNumbers[0].textContent = data.booksIssued;
                statNumbers[1].textContent = data.booksReturned;
                statNumbers[2].textContent = data.currentlyIssued;
            }
        }
    };
    
   
    
    const FormHandler = {
        init() {
            this.setupContactForm();
            this.setupFormValidation();
        },
        
        setupContactForm() {
            const contactForm = Utils.$('.contact-form');
            if (!contactForm) return;
            
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(contactForm);
            });
        },
        
        setupFormValidation() {
            const forms = Utils.$$('form');
            forms.forEach(form => {
                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                    input.addEventListener('blur', () => {
                        this.validateField(input);
                    });
                    
                    input.addEventListener('input', () => {
                        this.clearFieldError(input);
                    });
                });
            });
        },
        
        handleFormSubmission(form) {
            if (!this.validateForm(form)) return;
            
            const formData = new FormData(form);
            const submitButton = form.querySelector('button[type="submit"]');
            
            Animations.showLoadingState(submitButton);
            
            // Simulate form submission
            setTimeout(() => {
                this.showToast('Message sent successfully!', 'success');
                form.reset();
                Animations.hideLoadingState(submitButton);
            }, 2000);
        },
        
        validateForm(form) {
            const inputs = form.querySelectorAll('[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });
            
            return isValid;
        },
        
        validateField(field) {
            const value = field.value.trim();
            let isValid = true;
            let errorMessage = '';
            
            // Required field validation
            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = 'This field is required';
            }
            
            // Email validation
            if (field.type === 'email' && value && !this.isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            
            // Phone validation
            if (field.type === 'tel' && value && !this.isValidPhone(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
            
            this.showFieldError(field, errorMessage);
            return isValid;
        },
        
        showFieldError(field, message) {
            this.clearFieldError(field);
            
            if (!message) return;
            
            Utils.addClass(field, 'error');
            const errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.textContent = message;
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        },
        
        clearFieldError(field) {
            Utils.removeClass(field, 'error');
            const errorElement = field.parentNode.querySelector('.field-error');
            if (errorElement) {
                errorElement.remove();
            }
        },
        
        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        isValidPhone(phone) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
        }
    };
    
  
    
    const ToastManager = {
        init() {
            this.container = this.createContainer();
        },
        
        createContainer() {
            const container = document.createElement('div');
            container.className = 'toast-container';
            container.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
            return container;
        },
        
        show(message, type = 'info', duration = 3000) {
            const toast = this.createToast(message, type);
            this.container.appendChild(toast);
            
            // Trigger animation
            requestAnimationFrame(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateY(0)';
            });
            
            // Auto remove
            setTimeout(() => {
                this.remove(toast);
            }, duration);
            
            return toast;
        },
        
        createToast(message, type) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            
            const colors = {
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6'
            };
            
            toast.style.cssText = `
                background: ${colors[type] || colors.info};
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                opacity: 0;
                transform: translateY(100%);
                transition: all 0.3s ease;
                pointer-events: auto;
                max-width: 300px;
                text-align: center;
            `;
            
            toast.textContent = message;
            return toast;
        },
        
        remove(toast) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    };
    
   
    const Performance = {
        init() {
            this.setupLazyLoading();
            this.setupImageOptimization();
            this.setupCaching();
            this.monitorPerformance();
        },
        
        setupLazyLoading() {
            if (!FEATURES.supportsIntersectionObserver) return;
            
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        Utils.removeClass(img, 'lazy');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            const lazyImages = Utils.$$('img[loading="lazy"]');
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        },
        
        setupImageOptimization() {
            const images = Utils.$$('img');
            images.forEach(img => {
                img.addEventListener('load', () => {
                    Utils.addClass(img, 'loaded');
                });
                
                img.addEventListener('error', () => {
                    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                });
            });
        },
        
        setupCaching() {
            // Simple localStorage caching for user preferences
            const cache = {
                set(key, value, ttl = 86400000) { // 24 hours default
                    const item = {
                        value: value,
                        timestamp: Date.now(),
                        ttl: ttl
                    };
                    localStorage.setItem(key, JSON.stringify(item));
                },
                
                get(key) {
                    const item = localStorage.getItem(key);
                    if (!item) return null;
                    
                    try {
                        const parsed = JSON.parse(item);
                        if (Date.now() - parsed.timestamp > parsed.ttl) {
                            localStorage.removeItem(key);
                            return null;
                        }
                        return parsed.value;
                    } catch (e) {
                        localStorage.removeItem(key);
                        return null;
                    }
                }
            };
            
            window.LibraryCache = cache;
        },
        
        monitorPerformance() {
            // Monitor page load performance
            window.addEventListener('load', () => {
                if (window.performance) {
                    const perfData = window.performance.timing;
                    const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                    
                    if (loadTime > 3000) {
                        console.warn('Slow page load detected:', loadTime + 'ms');
                    }
                }
            });
            
            // Monitor memory usage (if available)
            if (window.performance && window.performance.memory) {
                setInterval(() => {
                    const memory = window.performance.memory;
                    if (memory.usedJSHeapSize > 50000000) { // 50MB
                        console.warn('High memory usage detected');
                    }
                }, 30000);
            }
        }
    };
    
   
    
    const Accessibility = {
        init() {
            this.setupKeyboardNavigation();
            this.setupScreenReaderSupport();
            this.setupFocusManagement();
            this.setupColorContrastDetection();
        },
        
        setupKeyboardNavigation() {
            // Global keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                // Alt + M: Toggle menu
                if (e.altKey && e.key === 'm') {
                    e.preventDefault();
                    Navigation.toggle();
                }
                
                // Alt + S: Focus search
                if (e.altKey && e.key === 's') {
                    e.preventDefault();
                    const searchInput = Utils.$('input[type="search"]');
                    if (searchInput) searchInput.focus();
                }
                
                // Escape: Close any open modals/menus
                if (e.key === 'Escape') {
                    Navigation.close();
                }
            });
            
            // Tab trapping in mobile menu
            const navMenu = Utils.$('.nav-menu');
            if (navMenu) {
                navMenu.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        const focusableElements = navMenu.querySelectorAll('a, button, input, select, textarea');
                        const firstElement = focusableElements[0];
                        const lastElement = focusableElements[focusableElements.length - 1];
                        
                        if (e.shiftKey && document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        } else if (!e.shiftKey && document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                });
            }
        },
        
        setupScreenReaderSupport() {
            // Add live regions for dynamic content updates
            const liveRegion = document.createElement('div');
            liveRegion.id = 'live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.cssText = `
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            `;
            document.body.appendChild(liveRegion);
            
            window.announceToScreenReader = (message) => {
                liveRegion.textContent = message;
                setTimeout(() => {
                    liveRegion.textContent = '';
                }, 1000);
            };
        },
        
        setupFocusManagement() {
            // Visible focus indicators
            const style = document.createElement('style');
            style.textContent = `
                .js-focus-visible :focus:not(.focus-visible) {
                    outline: none;
                }
                
                .js-focus-visible .focus-visible {
                    outline: 2px solid var(--primary-color);
                    outline-offset: 2px;
                }
            `;
            document.head.appendChild(style);
            
            // Focus visible polyfill
            let hadKeyboardEvent = true;
            const keyboardThrottledUpdateTabindex = Utils.throttle(() => {
                hadKeyboardEvent = true;
            }, 100);
            
            document.addEventListener('keydown', keyboardThrottledUpdateTabindex);
            document.addEventListener('pointerdown', () => {
                hadKeyboardEvent = false;
            });
            
            document.addEventListener('focus', (e) => {
                if (hadKeyboardEvent) {
                    Utils.addClass(e.target, 'focus-visible');
                }
            }, true);
            
            document.addEventListener('blur', (e) => {
                Utils.removeClass(e.target, 'focus-visible');
            }, true);
            
            Utils.addClass(document.body, 'js-focus-visible');
        },
        
        setupColorContrastDetection() {
            // Check if user prefers high contrast
            const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
            
            const updateContrast = (e) => {
                if (e.matches) {
                    Utils.addClass(document.body, 'high-contrast');
                } else {
                    Utils.removeClass(document.body, 'high-contrast');
                }
            };
            
            updateContrast(highContrastQuery);
            highContrastQuery.addEventListener('change', updateContrast);
        }
    };
    
   
    
    const ServiceWorkerManager = {
        init() {
            if (!FEATURES.supportsServiceWorker) return;
            
            window.addEventListener('load', () => {
                this.registerServiceWorker();
            });
        },
        
        async registerServiceWorker() {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully:', registration);
                
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        },
        
        showUpdateAvailable() {
            const toast = ToastManager.show(
                'New version available! Refresh to update.',
                'info',
                10000
            );
            
            toast.style.cursor = 'pointer';
            toast.addEventListener('click', () => {
                window.location.reload();
            });
        }
    };
    

    
    const LibraryApp = {
        init() {
            console.log('🚀 Mobile-first Library App initializing...');
            
            // Core functionality
            ZoomPrevention.init();
            Navigation.init();
            TouchHandler.init();
            
            // Enhanced features
            Animations.init();
            BookManager.init();
            FormHandler.init();
            ToastManager.init();
            
            // Performance & accessibility
            Performance.init();
            Accessibility.init();
            ServiceWorkerManager.init();
            
            // Global event listeners
            this.setupGlobalEventListeners();
            
            // Initialize viewport height variable
            this.updateViewportHeight();
            
            console.log('✅ Library App initialized successfully!');
            
            // Show welcome message
            setTimeout(() => {
                ToastManager.show('Welcome to College Library!', 'success');
            }, 1000);
        },
        
        setupGlobalEventListeners() {
            // Viewport height updates for mobile browsers
            window.addEventListener('resize', Utils.debounce(() => {
                this.updateViewportHeight();
            }, CONFIG.debounce.resize));
            
            // Orientation change handling
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.updateViewportHeight();
                    Navigation.close(); // Close menu on orientation change
                }, 500);
            });
            
            // Online/offline status
            window.addEventListener('online', () => {
                ToastManager.show('Connection restored!', 'success');
            });
            
            window.addEventListener('offline', () => {
                ToastManager.show('You are offline', 'warning');
            });
            
            // Page visibility changes
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    // Page is hidden
                    Navigation.close();
                } else {
                    // Page is visible
                    this.updateViewportHeight();
                }
            });
        },
        
        updateViewportHeight() {
            // Set CSS custom property for mobile viewport height
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        }
    };
    
    // Make toast function available globally
    window.showToast = (message, type, duration) => {
        ToastManager.show(message, type, duration);
    };
    
    // ===================================
    // INITIALIZE APPLICATION
    // ===================================
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            LibraryApp.init();
        });
    } else {
        LibraryApp.init();
    }
    
})();
