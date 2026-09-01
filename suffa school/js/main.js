/**
 * SUFFIA EDUCATION SCHOOL — MAIN JAVASCRIPT
 * Handles: mobile menu, scroll effects, animations, counters, accordion, lightbox, gallery filter
 */

(function() {
  'use strict';

  // =========================================================================
  // UTILITIES
  // =========================================================================
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const throttle = (fn, limit = 100) => {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  const debounce = (fn, delay = 150) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };

  // =========================================================================
  // MOBILE MENU
  // =========================================================================
  function initMobileMenu() {
    const btn = $('.mobile-menu-btn');
    const menu = $('.mobile-menu');
    const overlay = $('.mobile-menu-overlay');
    const links = $$('.mobile-menu__link');
    const body = document.body;

    if (!btn || !menu) return;

    const openMenu = () => {
      btn.setAttribute('aria-expanded', 'true');
      menu.classList.add('is-open');
      overlay.classList.add('is-visible');
      body.style.overflow = 'hidden';
      // Stagger animation for links
      links.forEach((link, i) => {
        link.style.transitionDelay = `${100 + i * 50}ms`;
        link.classList.add('animate');
      });
    };

    const closeMenu = () => {
      btn.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
      overlay.classList.remove('is-visible');
      body.style.overflow = '';
      links.forEach(link => {
        link.style.transitionDelay = '0ms';
        link.classList.remove('animate');
      });
    };

    btn.addEventListener('click', () => {
      if (menu.classList.contains('is-open')) closeMenu();
      else openMenu();
    });

    overlay.addEventListener('click', closeMenu);
    links.forEach(link => link.addEventListener('click', closeMenu));

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
    });
  }

  // =========================================================================
  // HEADER SCROLL EFFECT
  // =========================================================================
  function initHeaderScroll() {
    const header = $('.header');
    if (!header) return;

    const handleScroll = throttle(() => {
      if (window.scrollY > 20) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    }, 50);

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // =========================================================================
  // SCROLL REVEAL (IntersectionObserver)
  // =========================================================================
  function initScrollReveal() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      $$('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    $$('.reveal').forEach(el => observer.observe(el));
  }

  // =========================================================================
  // STAT COUNTERS
  // =========================================================================
  function initStatCounters() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const counters = $$('.stat__number[data-count]');

    if (counters.length === 0) return;

    const animateCounter = (counter) => {
      const target = parseInt(counter.dataset.count, 10);
      const duration = 2000;
      const startTime = performance.now();

      const update = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = Math.floor(target * eased);
        counter.textContent = current.toLocaleString() + (counter.dataset.suffix || '');
        if (progress < 1) requestAnimationFrame(update);
        else counter.textContent = target.toLocaleString() + (counter.dataset.suffix || '');
      };

      requestAnimationFrame(update);
    };

    if (prefersReducedMotion) {
      counters.forEach(c => c.textContent = parseInt(c.dataset.count, 10).toLocaleString() + (c.dataset.suffix || ''));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  // =========================================================================
  // ACCORDION (FAQ)
  // =========================================================================
  function initAccordions() {
    $$('.accordion').forEach(accordion => {
      const trigger = accordion.querySelector('.accordion__trigger');
      const panel = accordion.querySelector('.accordion__panel');
      const icon = accordion.querySelector('.accordion__icon');

      if (!trigger || !panel) return;

      trigger.addEventListener('click', () => {
        const isOpen = accordion.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', isOpen);
        panel.style.maxHeight = isOpen ? panel.scrollHeight + 'px' : '0';
        if (icon) icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0)';
      });

      // Keyboard support
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }
      });
    });
  }

  // =========================================================================
  // GALLERY FILTER
  // =========================================================================
  function initGalleryFilter() {
    const filterBtns = $$('.gallery-filter__btn');
    const items = $$('.gallery-item');

    if (filterBtns.length === 0) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        // Update active button
        filterBtns.forEach(b => {
          b.classList.toggle('is-active', b === btn);
          b.setAttribute('aria-pressed', b === btn);
        });

        // Filter items with animation
        items.forEach((item, i) => {
          const matches = filter === 'all' || item.dataset.category === filter;
          item.style.transitionDelay = `${i * 30}ms`;
          item.classList.toggle('is-hidden', !matches);
        });
      });
    });
  }

  // =========================================================================
  // LIGHTBOX (Gallery)
  // =========================================================================
  function initLightbox() {
    const triggers = $$('[data-lightbox]');
    if (triggers.length === 0) return;

    // Create lightbox DOM
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox__overlay" aria-hidden="true"></div>
      <button class="lightbox__close" aria-label="Close lightbox">
        <svg class="icon" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <button class="lightbox__nav lightbox__nav--prev" aria-label="Previous image">
        <svg class="icon" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <button class="lightbox__nav lightbox__nav--next" aria-label="Next image">
        <svg class="icon" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
      <div class="lightbox__content" role="dialog" aria-modal="true" aria-label="Image gallery">
        <figure class="lightbox__figure">
          <img class="lightbox__image" alt="">
          <figcaption class="lightbox__caption"></figcaption>
        </figure>
      </div>
    `;
    document.body.appendChild(lightbox);

    const overlay = $('.lightbox__overlay', lightbox);
    const closeBtn = $('.lightbox__close', lightbox);
    const prevBtn = $('.lightbox__nav--prev', lightbox);
    const nextBtn = $('.lightbox__nav--next', lightbox);
    const image = $('.lightbox__image', lightbox);
    const caption = $('.lightbox__caption', lightbox);

    let currentIndex = 0;
    let currentGroup = [];

    const openLightbox = (index, group) => {
      currentIndex = index;
      currentGroup = group;
      updateLightbox();
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    const updateLightbox = () => {
      const item = currentGroup[currentIndex];
      if (!item) return;
      image.src = item.href;
      image.alt = item.dataset.alt || '';
      caption.textContent = item.dataset.caption || '';
    };

    const navigate = (dir) => {
      currentIndex = (currentIndex + dir + currentGroup.length) % currentGroup.length;
      updateLightbox();
    };

    // Group triggers by data-lightbox attribute
    const groups = {};
    triggers.forEach((trigger, i) => {
      const group = trigger.dataset.lightbox || 'default';
      if (!groups[group]) groups[group] = [];
      groups[group].push({ ...trigger, index: i });
    });

    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const group = trigger.dataset.lightbox || 'default';
        const groupItems = triggers.filter(t => t.dataset.lightbox === group);
        const index = groupItems.indexOf(trigger);
        openLightbox(index, groupItems);
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', () => navigate(-1));
    nextBtn.addEventListener('click', () => navigate(1));

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  }

  // =========================================================================
  // PARALLAX HERO
  // =========================================================================
  function initParallaxHero() {
    const hero = $('.hero');
    const heroImage = $('.hero__image');
    if (!hero || !heroImage) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleScroll = throttle(() => {
      const rect = hero.getBoundingClientRect();
      const scrolled = -rect.top;
      if (scrolled > 0 && scrolled < rect.height) {
        heroImage.style.transform = `translateY(${scrolled * 0.15}px)`;
      }
    }, 16);

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // =========================================================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // =========================================================================
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const header = $('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
        target.focus({ preventScroll: true });
      }
    });
  }

  // =========================================================================
  // ACTIVE NAV LINK
  // =========================================================================
  function initActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    $$('.nav__link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('nav__link--active');
      }
    });
  }

  // =========================================================================
  // FORM HANDLING (Basic validation)
  // =========================================================================
  function initForms() {
    $$('form[data-validate]').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        $$('.form-input, .form-textarea, .form-select', form).forEach(input => {
          if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
          } else {
            input.classList.remove('is-invalid');
          }
        });

        if (isValid) {
          // Show success state
          const submitBtn = form.querySelector('button[type="submit"]');
          const originalText = submitBtn.textContent;
          submitBtn.textContent = 'Sent Successfully';
          submitBtn.disabled = true;
          submitBtn.style.background = 'var(--color-accent)';
          submitBtn.style.borderColor = 'var(--color-accent)';
          submitBtn.style.color = 'var(--color-navy-deep)';

          setTimeout(() => {
            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
            submitBtn.style.borderColor = '';
            submitBtn.style.color = '';
          }, 3000);
        }
      });

      // Clear invalid on input
      $$('.form-input, .form-textarea, .form-select', form).forEach(input => {
        input.addEventListener('input', () => input.classList.remove('is-invalid'));
      });
    });
  }

  // =========================================================================
  // INIT ALL
  // =========================================================================
  function init() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    initMobileMenu();
    initHeaderScroll();
    initScrollReveal();
    initStatCounters();
    initAccordions();
    initGalleryFilter();
    initLightbox();
    initParallaxHero();
    initSmoothScroll();
    initActiveNav();
    initForms();

    // Add loaded class for CSS transitions
    document.body.classList.add('js-loaded');
  }

  init();

})();