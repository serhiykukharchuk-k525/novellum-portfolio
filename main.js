/* ── State ── */
const pages = ['home','cases','services','process','contact'];
const pageNames = { home:'Про мене', cases:'Кейси', services:'Послуги', process:'Процес', contact:'Контакт' };
let current = 'home';
let animating = false;

/* ── App open animation ── */
window.addEventListener('load', () => {
  const shell = document.getElementById('appShell');
  shell.style.transform = 'scale(0.4)';
  shell.style.opacity = '0';
  shell.style.transition = 'transform 0.55s cubic-bezier(0.34,1.4,0.64,1), opacity 0.35s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      shell.style.transform = 'scale(1)';
      shell.style.opacity = '1';
      setTimeout(() => {
        shell.style.transition = '';
        initBgCanvas();
        animateHomePage();
      }, 600);
    });
  });
});

/* ── Dot grid canvas ── */
function initBgCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.055)';
    const sp = 22;
    for (let x = sp; x < canvas.width; x += sp) {
      for (let y = sp; y < canvas.height; y += sp) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  resize();
  window.addEventListener('resize', resize);
}

/* ── Home page chart animations ── */
function animateHomePage() {
  // KPI counters
  document.querySelectorAll('.cnt').forEach((el, i) => {
    setTimeout(() => countUp(el, +el.dataset.n, 1200), i * 200 + 300);
  });

  // Line chart
  const line = document.querySelector('.lc-line');
  const fill = document.querySelector('.lc-fill');
  const dot  = document.querySelector('.lc-dot');
  if (line) {
    const len = line.getTotalLength ? line.getTotalLength() : 600;
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    line.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.2,1) 0.5s';
    requestAnimationFrame(() => { line.style.strokeDashoffset = '0'; });
  }
  if (fill) setTimeout(() => { fill.style.opacity = '1'; }, 1400);
  if (dot)  setTimeout(() => { dot.style.opacity = '1'; }, 2100);
}

/* ── Navigate to page ── */
function goTo(pageId) {
  if (pageId === current || animating || !pages.includes(pageId)) return;
  animating = true;

  const prev = document.getElementById('page-' + current);
  const next = document.getElementById('page-' + pageId);

  // Progress bar
  const bar  = document.getElementById('pageLoadBar');
  const fill = document.getElementById('plbFill');
  bar.style.display = 'block';
  fill.style.transition = 'none';
  fill.style.width = '0%';
  requestAnimationFrame(() => {
    fill.style.transition = 'width 0.4s ease-out';
    fill.style.width = '80%';
  });

  // Fade out current
  if (prev) {
    prev.style.opacity = '0';
    prev.style.transition = 'opacity 0.18s ease';
  }

  setTimeout(() => {
    if (prev) { prev.classList.remove('active'); prev.style.transition = ''; prev.style.opacity = ''; }
    next.classList.add('active');
    next.style.opacity = '0';
    next.style.transition = 'opacity 0.22s ease';
    requestAnimationFrame(() => { next.style.opacity = '1'; });
    setTimeout(() => { next.style.transition = ''; next.style.opacity = ''; animating = false; }, 250);

    // Complete progress bar
    fill.style.width = '100%';
    setTimeout(() => { bar.style.display = 'none'; fill.style.width = '0%'; }, 450);

    // Animate page content on enter
    if (pageId === 'home') animateHomePage();

    current = pageId;
    updateSidebar(pageId);
    updateStatusBar(pageId);
    updateMobileNav(pageId);

    // Scroll page to top
    const scroll = next.querySelector('.rpage-scroll');
    if (scroll) scroll.scrollTop = 0;

  }, 180);
}

/* ── Sidebar state ── */
function updateSidebar(pageId) {
  document.querySelectorAll('.pp-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pageId);
  });
}

/* ── Status bar ── */
function updateStatusBar(pageId) {
  const nameEl = document.getElementById('sbPageName');
  const numEl  = document.getElementById('sbPageNum');
  if (nameEl) nameEl.textContent = pageNames[pageId] || pageId;
  if (numEl)  numEl.textContent  = `Сторінка ${pages.indexOf(pageId)+1} з ${pages.length}`;
}

/* ── Mobile nav ── */
function updateMobileNav(pageId) {
  document.querySelectorAll('.mn-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pageId);
  });
}

/* ── Counter utility ── */
function countUp(el, target, duration) {
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
    el.textContent = v;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

/* ── Event listeners ── */
document.addEventListener('DOMContentLoaded', () => {

  // Sidebar page buttons
  document.querySelectorAll('.pp-item').forEach(el => {
    el.addEventListener('click', () => goTo(el.dataset.page));
  });

  // Mobile nav
  document.querySelectorAll('.mn-item').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); goTo(el.dataset.page); });
  });

  // In-page navigation buttons
  document.querySelectorAll('[data-goto]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); goTo(el.dataset.goto); });
  });

  // Fields panel toggle
  const fpToggle = document.getElementById('fpToggle');
  const fpPanel  = document.getElementById('fieldsPanel');
  if (fpToggle && fpPanel) {
    fpToggle.addEventListener('click', () => fpPanel.classList.toggle('collapsed'));
  }

  // Ribbon tab click (just visual)
  document.querySelectorAll('.ribbon-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.ribbon-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Window control buttons (cosmetic)
  document.querySelector('.tb-btn.min')?.addEventListener('click', () => {});
  document.querySelector('.tb-btn.max')?.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const idx = pages.indexOf(current);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (idx < pages.length - 1) goTo(pages[idx + 1]);
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (idx > 0) goTo(pages[idx - 1]);
    }
  });

  // Initial status bar
  updateStatusBar('home');
});
