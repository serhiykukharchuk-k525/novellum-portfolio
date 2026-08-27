document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // ── Loader ──
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loaderFill');

  gsap.to(fill, {
    width: '100%',
    duration: 2,
    ease: 'power2.inOut',
    onComplete: () => {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.5,
        delay: 0.15,
        onComplete: () => {
          loader.style.display = 'none';
          startHero();
        }
      });
    }
  });

  // ── Hero animations ──
  function startHero() {
    const tl = gsap.timeline();

    tl.from('.hero-badge', { opacity: 0, y: 16, duration: 0.5 })
      .from('.hero-title', { opacity: 0, y: 24, duration: 0.65 }, '-=0.2')
      .from('.hero-desc',  { opacity: 0, y: 16, duration: 0.5 }, '-=0.3')
      .from('.hero-cta',   { opacity: 0, y: 16, duration: 0.5 }, '-=0.3')
      .from('.hero-stats', { opacity: 0, y: 16, duration: 0.5 }, '-=0.3');

    gsap.from('.db-window', {
      opacity: 0, scale: 0.96, y: 20,
      duration: 0.9, delay: 0.5,
      ease: 'back.out(1.4)'
    });

    // KPI tiles appear with stagger
    gsap.from('.db-kpi', {
      opacity: 0, y: 10,
      duration: 0.4, stagger: 0.08,
      delay: 1.0
    });

    // KPI counters
    setTimeout(() => {
      document.querySelectorAll('.count').forEach(el => {
        countUp(el, +el.dataset.target, 2200, el.dataset.format);
      });
    }, 1300);

    // Hero stat numbers
    setTimeout(() => {
      document.querySelectorAll('.stat-num').forEach(el => {
        countUp(el, +el.dataset.target, 1600);
      });
    }, 700);

    // Line chart draw
    setTimeout(() => {
      const path = document.querySelector('.line-path');
      if (!path) return;
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out' });
      gsap.to('.line-fill', { opacity: 1, duration: 0.6, delay: 1.0 });
      gsap.to('.line-dot',  { opacity: 1, duration: 0.3, delay: 1.5 });
    }, 1400);

    // Bar fills
    setTimeout(() => {
      document.querySelectorAll('.bar-fill').forEach((bar, i) => {
        setTimeout(() => {
          bar.style.width = bar.dataset.w + '%';
        }, i * 120);
      });
    }, 1700);

    // Donut chart
    setTimeout(() => animateDonut(), 1800);
  }

  // ── Counter utility ──
  function countUp(el, target, duration, format = 'num') {
    const start = performance.now();
    const update = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);

      if (format === 'abbr') {
        if (val >= 1000000) el.textContent = (val / 1000000).toFixed(1) + 'M';
        else if (val >= 1000) el.textContent = Math.round(val / 1000) + 'K';
        else el.textContent = val;
      } else {
        el.textContent = val.toLocaleString('uk-UA');
      }

      if (p < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  // ── Donut chart ──
  function animateDonut() {
    const C = 175.9;
    const segs = [
      { sel: '.s1', pct: 0.45, offset: 0 },
      { sel: '.s2', pct: 0.35, offset: 0.45 },
      { sel: '.s3', pct: 0.20, offset: 0.80 },
    ];
    segs.forEach(s => {
      const el = document.querySelector(s.sel);
      if (!el) return;
      const len = s.pct * C;
      const gap = C - len;
      el.setAttribute('transform', `rotate(${-90 + s.offset * 360} 40 40)`);
      gsap.to(el, {
        attr: { 'stroke-dasharray': `${len} ${gap}` },
        duration: 1.2, ease: 'power2.out'
      });
    });
  }

  // ── Sticky nav ──
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Mobile menu ──
  const burger = document.getElementById('navBurger');
  const mobileNav = document.getElementById('navMobile');
  burger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
  });
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileNav.classList.remove('open'));
  });

  // ── Scroll animations ──
  const fadeUp = (sel, extra = {}) => {
    const els = document.querySelectorAll(sel);
    if (!els.length) return;
    gsap.from(sel, {
      scrollTrigger: { trigger: sel, start: 'top 82%' },
      opacity: 0, y: 36, duration: 0.7, stagger: 0.14,
      ease: 'power2.out', ...extra
    });
  };

  fadeUp('.pain-card');
  fadeUp('.case-card', { stagger: 0.18, y: 48 });
  fadeUp('.service-card');
  fadeUp('.step', { stagger: 0.15, x: 0, y: 32 });

  gsap.from('.solution-block', {
    scrollTrigger: { trigger: '.solution-block', start: 'top 82%' },
    opacity: 0, y: 24, scale: 0.97,
    duration: 0.7, ease: 'back.out(1.5)'
  });

  gsap.from('.about-card', {
    scrollTrigger: { trigger: '.about-card', start: 'top 82%' },
    opacity: 0, y: 32, duration: 0.8, ease: 'power2.out'
  });

  gsap.from('.cta-card', {
    scrollTrigger: { trigger: '.cta-card', start: 'top 82%' },
    opacity: 0, scale: 0.96, duration: 0.9,
    ease: 'back.out(1.4)'
  });

  // Animate section tags + titles on scroll
  document.querySelectorAll('.section-tag, .section-title').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%' },
      opacity: 0, y: 20, duration: 0.55, ease: 'power2.out'
    });
  });
});
