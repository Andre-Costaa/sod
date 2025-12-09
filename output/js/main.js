/* Main JS for Scroll Animations & Interactions */

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initCounters();
    initSmoothNav();
});

function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(el => observer.observe(el));
}

function initCounters() {
    // Animate numbers when they scroll into view
    const stats = document.querySelectorAll('[data-count]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const countTo = parseFloat(target.getAttribute('data-count'));
                const isFloat = target.getAttribute('data-count').includes('.');
                const suffix = target.getAttribute('data-suffix') || '';

                let count = 0;
                const duration = 2000; // 2s
                const increment = countTo / (duration / 16); // 60fps

                const updateCount = () => {
                    count += increment;
                    if (count < countTo) {
                        target.innerText = (isFloat ? count.toFixed(1) : Math.floor(count)) + suffix;
                        requestAnimationFrame(updateCount);
                    } else {
                        target.innerText = (isFloat ? countTo : countTo) + suffix;
                    }
                };

                updateCount();
                observer.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

function initSmoothNav() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}
