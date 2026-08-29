/* ── State ── */
const pages = ['pain','solution','cases','process','contact'];
const pageNames = { pain:'Зараз', solution:'Результат', cases:'Кейси', process:'Процес', contact:'Контакт' };
let current = 'pain';
let animating = false;

/* ── Responsive scale: letterbox desktop shell on narrow screens ── */
function applyShellScale() {
  const viewport = document.getElementById('shellViewport');
  const shell    = document.getElementById('appShell');
  if (!shell) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Viewport always fills the visible window
  if (viewport) {
    viewport.style.width  = vw + 'px';
    viewport.style.height = vh + 'px';
  }

  if (vw < 1280) {
    const z = vw / 1280;
    shell.style.width      = '1280px';
    shell.style.height     = '820px';
    shell.style.zoom       = z;
    shell.style.flexShrink = '0';
  } else {
    // Desktop: shell fills viewport naturally via CSS (100vw × 100vh)
    shell.style.width      = vw + 'px';
    shell.style.height     = vh + 'px';
    shell.style.zoom       = '';
    shell.style.flexShrink = '';
  }
}

applyShellScale();
window.addEventListener('resize', applyShellScale);
window.addEventListener('orientationchange', () => setTimeout(applyShellScale, 120));

/* ── App open animation ── */
window.addEventListener('load', () => {
  applyShellScale();
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
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
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

/* ── Navigate to page ── */
function goTo(pageId) {
  if (pageId === current || animating || !pages.includes(pageId)) return;
  animating = true;

  const prev = document.getElementById('page-' + current);
  const next = document.getElementById('page-' + pageId);

  const bar  = document.getElementById('pageLoadBar');
  const fill = document.getElementById('plbFill');
  bar.style.display = 'block';
  fill.style.transition = 'none';
  fill.style.width = '0%';
  requestAnimationFrame(() => {
    fill.style.transition = 'width 0.4s ease-out';
    fill.style.width = '80%';
  });

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

    fill.style.width = '100%';
    setTimeout(() => { bar.style.display = 'none'; fill.style.width = '0%'; }, 450);

    if (pageId === 'solution') animateSolutionPage();

    current = pageId;
    updateSidebar(pageId);
    updateStatusBar(pageId);
    updateMobileNav(pageId);

    const scroll = next.querySelector('.rpage-scroll');
    if (scroll) scroll.scrollTop = 0;

  }, 180);
}

/* ── Solution page chart animations ── */
function animateSolutionPage() {
  // KPI counters
  document.querySelectorAll('#page-solution .cnt').forEach((el, i) => {
    const n = +el.dataset.n;
    const fmt = el.dataset.fmt;
    setTimeout(() => countUp(el, n, 1200, fmt), i * 150 + 200);
  });

  // Line chart
  const line = document.querySelector('#page-solution .lc-line');
  const lfill = document.querySelector('#page-solution .lc-fill');
  const dot  = document.querySelector('#page-solution .lc-dot');
  if (line) {
    const len = line.getTotalLength ? line.getTotalLength() : 600;
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
    line.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(0.4,0,0.2,1) 0.3s';
    requestAnimationFrame(() => { line.style.strokeDashoffset = '0'; });
  }
  if (lfill) setTimeout(() => { lfill.style.opacity = '1'; }, 1200);
  if (dot)   setTimeout(() => { dot.style.opacity = '1'; }, 1900);

  // Donut chart
  const circ = 2 * Math.PI * 26; // ~163.4
  const segs = [
    { el: document.querySelector('.dseg.s1'), pct: 0.45, offset: 0 },
    { el: document.querySelector('.dseg.s2'), pct: 0.35, offset: 0.45 },
    { el: document.querySelector('.dseg.s3'), pct: 0.20, offset: 0.80 },
  ];
  segs.forEach((s, i) => {
    if (!s.el) return;
    const dash = s.pct * circ;
    const gap  = circ - dash;
    const rot  = -90 + s.offset * 360;
    s.el.setAttribute('transform', `rotate(${rot} 40 40)`);
    setTimeout(() => {
      s.el.style.strokeDasharray = `${dash} ${gap}`;
    }, 400 + i * 200);
  });

  // Bar chart fill
  setTimeout(() => {
    document.querySelectorAll('.ldb-f').forEach(bar => {
      bar.style.width = bar.dataset.w + '%';
    });
  }, 500);
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
function countUp(el, target, duration, fmt) {
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
    el.textContent = fmt === 'abbr' ? formatAbbr(v) : v.toLocaleString('uk-UA');
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = fmt === 'abbr' ? formatAbbr(target) : target.toLocaleString('uk-UA');
  };
  requestAnimationFrame(tick);
}

function formatAbbr(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0','') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n.toString();
}

/* ── Pain slicer ── */
function initSlicers() {
  const items = document.querySelectorAll('.slicer-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const pain = item.dataset.pain;
      // Update slicer UI
      items.forEach(i => {
        i.classList.remove('active');
        i.querySelector('.si-check').textContent = '';
      });
      item.classList.add('active');
      item.querySelector('.si-check').textContent = '✓';
      // Show the right pain visual
      document.querySelectorAll('.pain-visual').forEach(v => v.classList.remove('active'));
      const target = document.getElementById('pain-' + pain);
      if (target) target.classList.add('active');
    });
  });
}

/* ── Cost calculator ── */
function initCalculator() {
  const hoursSlider = document.getElementById('hoursSlider');
  const rateSlider  = document.getElementById('rateSlider');
  if (!hoursSlider || !rateSlider) return;

  function update() {
    const h = +hoursSlider.value;
    const r = +rateSlider.value;
    document.getElementById('hoursVal').textContent = h + ' год';
    document.getElementById('rateVal').textContent  = '₴' + r.toLocaleString('uk-UA');
    const yearCost  = h * 12 * r;
    const yearHours = h * 12;
    const cost3y    = yearCost * 3;
    document.getElementById('calcYearCost').textContent  = '₴' + yearCost.toLocaleString('uk-UA');
    document.getElementById('calcYearHours').textContent = yearHours + ' год на ручну звітність';
    document.getElementById('calc3YearCost').textContent = '₴' + cost3y.toLocaleString('uk-UA');
  }

  hoursSlider.addEventListener('input', update);
  rateSlider.addEventListener('input', update);
  update();
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
  const fpToggle = document.getElementById('cwToggle');
  const fpPanel  = document.getElementById('contactWidget');
  if (fpToggle && fpPanel) {
    fpToggle.addEventListener('click', () => fpPanel.classList.toggle('collapsed'));
  }

  // Dashboard filter tabs — switch KPI + bar chart data per period
  const dashData = [
    { // Поточний місяць
      kpis: [
        { v: '₴2.4M',  d: '↑ 23.4% vs попер. міс.', pos: true },
        { v: '1 847',  d: '↑ 8.1% vs попер. міс.',  pos: true },
        { v: '₴1 299', d: '↑ 14.2% vs попер. міс.', pos: true },
        { v: '38%',    d: '↓ 1.2% vs попер. міс.',  pos: false },
      ],
      bars: [
        { w: 85, v: '₴842K' }, { w: 65, v: '₴631K' }, { w: 52, v: '₴504K' },
        { w: 38, v: '₴369K' }, { w: 28, v: '₴271K' },
      ],
    },
    { // Квартал
      kpis: [
        { v: '₴6.9M',  d: '↑ 18.7% vs попер. кварт.', pos: true },
        { v: '5 214',  d: '↑ 11.3% vs попер. кварт.', pos: true },
        { v: '₴1 324', d: '↑ 9.8% vs попер. кварт.',  pos: true },
        { v: '39.4%',  d: '↑ 0.6% vs попер. кварт.',  pos: true },
      ],
      bars: [
        { w: 88, v: '₴2.4M' }, { w: 72, v: '₴1.9M' }, { w: 61, v: '₴1.6M' },
        { w: 44, v: '₴1.1M' }, { w: 33, v: '₴870K' },
      ],
    },
    { // Рік
      kpis: [
        { v: '₴26.1M', d: '↑ 34.2% vs мин. рік', pos: true },
        { v: '19 480', d: '↑ 27.5% vs мин. рік', pos: true },
        { v: '₴1 340', d: '↑ 5.1% vs мин. рік',  pos: true },
        { v: '37.8%',  d: '↓ 0.4% vs мин. рік',  pos: false },
      ],
      bars: [
        { w: 90, v: '₴9.2M' }, { w: 75, v: '₴7.6M' }, { w: 58, v: '₴5.9M' },
        { w: 41, v: '₴4.2M' }, { w: 30, v: '₴3.1M' },
      ],
    },
  ];
  document.querySelectorAll('.ldt-filter').forEach((tab, idx) => {
    tab.addEventListener('click', () => {
      const group = tab.closest('.ld-toolbar');
      group.querySelectorAll('.ldt-filter').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const { kpis, bars } = dashData[idx];
      kpis.forEach((row, i) => {
        const vEl = document.getElementById('kv' + i);
        const dEl = document.getElementById('kd' + i);
        if (vEl) { vEl.style.opacity = '0'; setTimeout(() => { vEl.textContent = row.v; vEl.style.opacity = '1'; }, 150); }
        if (dEl) setTimeout(() => { dEl.textContent = row.d; dEl.className = 'ldk-d ' + (row.pos ? 'green' : 'red'); }, 150);
      });
      bars.forEach((row, i) => {
        const fEl = document.getElementById('bf' + i);
        const vEl = document.getElementById('bv' + i);
        if (fEl) setTimeout(() => { fEl.style.width = row.w + '%'; }, 200);
        if (vEl) setTimeout(() => { vEl.textContent = row.v; }, 200);
      });
    });
  });

  // Window control buttons
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

  initSlicers();
  initCalculator();
  updateStatusBar('pain');
});
