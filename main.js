/* ════════════════════════════════════════════════
   DR. MOHAMED A. RADWAN — WEBSITE JS
════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 1. ANIMATED CIRCUIT CANVAS ── */
  function initCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, nodes = [], edges = [];

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      buildGraph();
    }

    function buildGraph() {
      nodes = []; edges = [];
      const cols = Math.floor(W / 85) + 1;
      const rows = Math.floor(H / 85) + 1;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (Math.random() > 0.52) {
            nodes.push({
              x: c * 85 + (Math.random() - .5) * 28,
              y: r * 85 + (Math.random() - .5) * 28,
              r: Math.random() * 1.8 + 0.8,
              ph: Math.random() * Math.PI * 2,
              spd: 0.012 + Math.random() * 0.016,
            });
          }
        }
      }
      // connect close pairs
      for (let i = 0; i < nodes.length; i++) {
        const near = [];
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const d = Math.hypot(nodes[j].x-nodes[i].x, nodes[j].y-nodes[i].y);
          if (d < 155) near.push({ j, d });
        }
        near.sort((a,b) => a.d-b.d).slice(0, 2).forEach(({ j }) => {
          const key = [i,j].sort().join('-');
          if (!edges.find(e => e.key===key)) edges.push({ key, a:i, b:j });
        });
      }
    }

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      t += 0.008;

      // Draw edges (orthogonal circuit-board routing)
      edges.forEach(({ a, b }) => {
        const na = nodes[a], nb = nodes[b];
        const d = Math.hypot(nb.x-na.x, nb.y-na.y);
        const alpha = Math.max(0, (155 - d) / 155) * 0.38;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(na.x, nb.y);  // right angle bend
        ctx.lineTo(nb.x, nb.y);
        ctx.strokeStyle = `rgba(77,156,248,${alpha})`;
        ctx.lineWidth = 0.55;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(n => {
        n.ph += n.spd;
        const pulse = 0.5 + 0.5 * Math.sin(n.ph);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(77,156,248,${0.25 + pulse * 0.55})`;
        ctx.fill();
        if (n.r > 1.8) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 2 + pulse * 2.5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(77,156,248,${pulse * 0.12})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      });

      // Travelling data pulses
      if (edges.length > 0) {
        const eIdx = Math.floor((t * 0.4) * 13) % edges.length;
        const { a, b } = edges[eIdx];
        if (nodes[a] && nodes[b]) {
          const prog = (t * 0.4 * 13) % 1;
          const na = nodes[a], nb = nodes[b];
          const px = na.x + (nb.x - na.x) * prog;
          const py = na.y + (nb.y - na.y) * prog;
          const g = ctx.createRadialGradient(px, py, 0, px, py, 9);
          g.addColorStop(0, 'rgba(53,212,240,0.85)');
          g.addColorStop(1, 'rgba(53,212,240,0)');
          ctx.beginPath();
          ctx.arc(px, py, 7, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }
      }

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
    draw();
  }

  /* ── 2. NAV SCROLL & ACTIVE ── */
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // Highlight active section
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-link[data-sec]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle('active', l.dataset.sec === e.target.id));
        }
      });
    }, { threshold: 0.3 });
    sections.forEach(s => io.observe(s));
  }

  /* ── 3. MOBILE NAV ── */
  function initMobileNav() {
    const btn = document.querySelector('.hamburger');
    const mob = document.querySelector('.mobile-nav');
    if (!btn || !mob) return;
    btn.addEventListener('click', () => {
      const open = btn.classList.toggle('open');
      mob.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      btn.classList.remove('open');
      mob.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }

  /* ── 4. SCROLL REVEAL ── */
  function initReveal() {
    const els = document.querySelectorAll('.r, .rl');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.07 });
    els.forEach(el => io.observe(el));
  }

  /* ── 5. COUNTER ANIMATION ── */
  function initCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        let v = 0, step = Math.max(1, Math.ceil(target / 45));
        const tick = setInterval(() => {
          v = Math.min(v + step, target);
          el.textContent = v + suffix;
          if (v >= target) clearInterval(tick);
        }, 28);
        io.disconnect();
      }, { threshold: 0.6 });
      io.observe(el);
    });
  }

  /* ── 6. PUB FILTER ── */
  function initFilter() {
    const btns = document.querySelectorAll('.pf');
    const cards = document.querySelectorAll('.pub-card');
    btns.forEach(btn => btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      const f = btn.dataset.f;
      cards.forEach(c => {
        const show = f === 'all' || (c.dataset.cat || '').includes(f);
        c.style.display = show ? '' : 'none';
      });
    }));
  }

  /* ── 7. GLITCH ON HERO NAME ── */
  function initGlitch() {
    const el = document.querySelector('.name-last');
    if (!el) return;
    const orig = el.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#!';
    let running = false;
    function glitch() {
      if (running) return; running = true;
      let n = 0;
      const iv = setInterval(() => {
        el.textContent = [...orig].map(c =>
          c === ' ' ? ' ' : (Math.random() > 0.55 ? chars[Math.floor(Math.random()*chars.length)] : c)
        ).join('');
        if (++n > 9) { clearInterval(iv); el.textContent = orig; running = false; }
      }, 50);
    }
    el.addEventListener('mouseenter', glitch);
    setTimeout(glitch, 2000);
    setInterval(glitch, 9000);
  }

  /* ── 8. SMOOTH SCROLL ── */
  function initScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const offset = (document.querySelector('.nav')?.offsetHeight || 65) + 8;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      });
    });
  }

  /* ── 9. CONTACT FORM ── */
  function initForm() {
    const form = document.querySelector('.c-form');
    if (!form) return;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.submit-btn');
      const original = btn.textContent;
      btn.textContent = 'Message Sent ✓';
      btn.style.background = '#2e9e6e';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 4500);
    });
  }

  /* ── INIT ── */
  document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initNav();
    initMobileNav();
    initReveal();
    initCounters();
    initFilter();
    initGlitch();
    initScroll();
    initForm();
  });
})();
