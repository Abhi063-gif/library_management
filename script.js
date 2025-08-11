// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('open');
        navMenu.classList.toggle('open');
        
        // Update ARIA attributes for accessibility
        const isOpen = navMenu.classList.contains('open');
        hamburger.setAttribute('aria-expanded', isOpen);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close menu when clicking on nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('open');
            navMenu.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
            hamburger.classList.remove('open');
            navMenu.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });

    // Smooth scrolling for anchor links
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

    // Contact form handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple form validation and submission
            const formData = new FormData(this);
            
            // Here you would typically send the data to your server
            alert('Thank you for your message! We\'ll get back to you soon.');
            this.reset();
        });
    }

    // Book reservation handling
    const reserveButtons = document.querySelectorAll('.btn-primary:not(.btn-disabled)');
    reserveButtons.forEach(button => {
        if (button.textContent.includes('Reserve Book')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const bookCard = this.closest('.book-card');
                const bookTitle = bookCard.querySelector('h4').textContent;
                
                if (confirm(`Would you like to reserve "${bookTitle}"?`)) {
                    alert(`"${bookTitle}" has been reserved for you!`);
                    this.textContent = 'Reserved';
                    this.classList.add('btn-disabled');
                    this.disabled = true;
                }
            });
        }
    });

    // Book renewal handling
    const renewButtons = document.querySelectorAll('.btn-warning');
    renewButtons.forEach(button => {
        if (button.textContent.includes('Renew Book')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const bookCard = this.closest('.current-book-card');
                const bookTitle = bookCard.querySelector('h4').textContent;
                
                if (confirm(`Would you like to renew "${bookTitle}"?`)) {
                    alert(`"${bookTitle}" has been renewed for 2 more weeks!`);
                    // Update the due date display
                    const daysLeftElement = bookCard.querySelector('.days-left');
                    if (daysLeftElement) {
                        daysLeftElement.textContent = '19 days left';
                    }
                }
            });
        }
    });

    // Add loading states for better UX
    function addLoadingState(button) {
        const originalText = button.textContent;
        button.textContent = 'Loading...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 1000);
    }

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    
    document.querySelectorAll('.book-card, .dept-card, .stat-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
