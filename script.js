// Mohamed Izad Portfolio — script.js
// Three.js sphere · custom cursor · scroll reveals · loading screen

// ── 1. Loading Screen ───────────────────────
const loadingScreen  = document.getElementById('loading-screen');
const loaderProgress = document.getElementById('loader-progress');
const loaderPercent  = document.getElementById('loader-percent');

let progress = 0;
const loadInterval = setInterval(() => {
  progress += Math.random() * 14 + 4;
  if (progress >= 100) {
    progress = 100;
    clearInterval(loadInterval);
  }
  loaderProgress.style.width = Math.min(progress, 100) + '%';
  loaderPercent.textContent  = Math.floor(Math.min(progress, 100)) + '%';

  if (progress >= 100) {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      triggerViewportReveals();
    }, 500);
  }
}, 80);

// ── 2. Three.js — Quality Core Sphere ───────
(function initThree() {
  if (typeof THREE === 'undefined') return;

  const canvas   = document.getElementById('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const keyLight = new THREE.PointLight(0xffffff, 3, 30);
  keyLight.position.set(4, 4, 4);
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(0x666666, 1.5, 30);
  fillLight.position.set(-4, -3, -4);
  scene.add(fillLight);

  // Main sphere
  const geo = new THREE.SphereGeometry(1.8, 64, 64);
  const mat = new THREE.MeshStandardMaterial({
    color:     0xffffff,
    metalness: 0.96,
    roughness: 0.04,
  });
  const sphere = new THREE.Mesh(geo, mat);
  scene.add(sphere);

  // Sparse wireframe overlay — "molecular" feel
  const wireGeo = new THREE.IcosahedronGeometry(2.0, 2);
  const wireMat = new THREE.MeshBasicMaterial({
    color:       0xffffff,
    wireframe:   true,
    transparent: true,
    opacity:     0.055,
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wire);

  // Store original positions for per-frame distortion
  const posAttr = geo.attributes.position;
  const orig    = Float32Array.from(posAttr.array);

  // Mouse tracking
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Vertex morph — creates breathing / crystal-growth effect
    for (let i = 0; i < posAttr.count; i++) {
      const ox = orig[i * 3];
      const oy = orig[i * 3 + 1];
      const oz = orig[i * 3 + 2];
      const n  = Math.sin(ox * 2.8 + t * 0.75) *
                 Math.sin(oy * 2.8 + t * 0.55) *
                 Math.cos(oz * 2.2 + t * 0.5) * 0.16;
      posAttr.setXYZ(i, ox * (1 + n), oy * (1 + n), oz * (1 + n));
    }
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();

    // Mouse parallax (lerped)
    sphere.rotation.y += (mx * 0.45 - sphere.rotation.y) * 0.045;
    sphere.rotation.x += (-my * 0.28 - sphere.rotation.x) * 0.045;

    // Wire rotates slightly independently
    wire.rotation.y = sphere.rotation.y + t * 0.08;
    wire.rotation.x = sphere.rotation.x - t * 0.04;

    // Slow auto-spin on z
    sphere.rotation.z += 0.0018;

    renderer.render(scene, camera);
  }
  animate();
})();

// ── 3. Custom Cursor ────────────────────────
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let tx = 0, ty = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });

  (function loop() {
    rx += (tx - rx) * 0.13;
    ry += (ty - ry) * 0.13;
    dot.style.left  = tx + 'px';
    dot.style.top   = ty + 'px';
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  document.querySelectorAll('a, button, .project-card, .skill-card, .award-card, .contact-item')
    .forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('expanded'));
      el.addEventListener('mouseleave', () => ring.classList.remove('expanded'));
    });
})();

// ── 4. Scroll Reveal ────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Trigger reveals already in viewport (called after loading screen hides)
function triggerViewportReveals() {
  document.querySelectorAll('.reveal:not(.in-view)').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) {
      el.classList.add('in-view');
    }
  });
}

// ── 5. Typing Effect ────────────────────────
(function initTyping() {
  const el = document.getElementById('typed-text');
  if (!el) return;
  const phrases = ['Quality Analyst', 'Researcher & Scientist', 'Molecular Biology Graduate'];
  let pi = 0, ci = 0, del = false;

  function tick() {
    const p = phrases[pi];
    el.textContent = del ? p.slice(0, ci--) : p.slice(0, ci++);
    if (!del && ci > p.length)   { del = true;  setTimeout(tick, 1600); return; }
    if (del  && ci < 0)          { del = false; pi = (pi + 1) % phrases.length; ci = 0; }
    setTimeout(tick, del ? 65 : 105);
  }
  tick();
})();

// ── 6. Tab Switching ────────────────────────
document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId  = btn.dataset.target;
    const container = btn.closest('.container');
    const btnGroup  = btn.parentElement;
    const tabsWrap  = container.querySelector('.tabs');

    btnGroup.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    tabsWrap.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    btn.classList.add('active');
    const target = tabsWrap.querySelector('#' + targetId);
    if (target) {
      target.classList.add('active');
      // Reveal cards inside the newly shown tab
      target.querySelectorAll('.award-card, .timeline-item').forEach(el => {
        el.style.opacity   = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        requestAnimationFrame(() => {
          el.style.opacity   = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    }
  });
});

// ── 7. Navigation — scroll + active + mobile ─
document.addEventListener('DOMContentLoaded', () => {
  const header   = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 50);
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 140) current = s.id;
    });
    navLinks.forEach(l =>
      l.classList.toggle('active', l.getAttribute('href') === '#' + current)
    );
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('.nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      menu.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
    });
    menu.addEventListener('click', e => {
      if (e.target.classList.contains('nav-link')) {
        toggle.classList.remove('open');
        menu.classList.remove('open');
        document.body.classList.remove('menu-open');
      }
    });
  }
});
