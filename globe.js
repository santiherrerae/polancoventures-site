/* Polanco Ventures: "Our perspective" globe.
   A hand-built orthographic dot globe on canvas, no libraries. Land dots come from
   Natural Earth 110m land on a 12,000-point Fibonacci lattice, stored as bitmasks.
   Decorative only: the region cards carry the information and the canvas is aria-hidden.
   It turns between the two bases and the North American markets, highlights the matching
   card, follows hover or tap on a card, pauses off-screen and stays still for reduced motion. */
(() => {
  const host = document.querySelector('.globe');
  const canvas = host && host.querySelector('canvas');
  const ctx = canvas && canvas.getContext && canvas.getContext('2d');
  if (!ctx || !window.matchMedia) return;
  host.classList.add('is-live');

  const N = 12000, GA = Math.PI * (3 - Math.sqrt(5)), D = Math.PI / 180;
  const LAND = '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';
  const FOCUS = 'AAAAAAAQAAJAQAAAAAAhAAAAhIAAEAAAAAIAAAAAAQEBAAQAhICAEBBAAEJASAkIICEkJKSAAJAQEhJSQkBISAkBKSEkJKSEkJCQEhJSQkAISAkJISEkBISEkBCQEgJCQkoICAkhASAlBCSEhACQEgISQkIASAkBASElACSEgICQEAASQkJASAgoCSEhICSEhICQEAASQkJASAgICSEhICSEhICQEBASQkJASAgICSEhIASEhISQEBASAkJACAgICSEhIAQEhICQEBACQkJACAgIASEhIAQEhICQEBACQkJACAgIASEhIASEhIAQEBACQkBACAgIASEgIASEgIAQEBACQkBACAgBASEgIASEgIAQEAACQkBACAgBASEgAASEgIAQEAACQkBACAgBASEgAASEgIAQEAACQkAACAgBASEgAASEgAAQEAACQkAACAgAASAgAASEgAAQEAACQkAACAgAASAgAAQEgAAAEAACAEAACAgAAQAAAAQEAAAAAAACAAAAAAAAAQAAAAAAAAAAAAACAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  const bytes = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const land = bytes(LAND), focus = bytes(FOCUS);
  const bit = (u, i) => (u[i >> 3] >> (i & 7)) & 1;
  const P = [];
  for (let i = 0; i < N; i++) {
    if (!bit(land, i)) continue;
    const y = 1 - (i + 0.5) * 2 / N, r = Math.sqrt(1 - y * y), t = i * GA;
    P.push(Math.cos(t) * r, y, Math.sin(t) * r, bit(focus, i));
  }
  const vec = (la, lo) => [Math.cos(la * D) * Math.cos(lo * D), Math.sin(la * D), Math.cos(la * D) * Math.sin(lo * D)];
  const places = {
    dubai: { label: 'Dubai', at: vec(25.2048, 55.2708), view: [55.3, 18] },
    mexico: { label: 'Mexico City', at: vec(19.4326, -99.1332), view: [-99.1, 14] },
    na: { label: 'North America', at: vec(49, -100), view: [-97, 36] }
  };
  const order = ['dubai', 'mexico', 'na'];
  const STATIC_VIEW = [-22, 20];
  const HOLD = 3400, DUR = 1800;

  const cards = {};
  document.querySelectorAll('.region-grid [data-region]').forEach(el => { if (places[el.dataset.region]) cards[el.dataset.region] = el; });
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const BLUE = (getComputedStyle(document.documentElement).getPropertyValue('--blue') || '').trim() || '#bdd5e2';

  let size = 0, dpr = 1, lon = places.dubai.view[0], lat = places.dubai.view[1];
  let active = null, idx = 0, from = null, to = null, t0 = 0, holdUntil = 0, pausedUntil = 0;
  let visible = false, raf = 0, last = 0;

  function project(v, cl, sl, cp, sp) {
    const x1 = v[0] * cl + v[2] * sl, z1 = -v[0] * sl + v[2] * cl;
    return [x1 * cp + v[1] * sp, -x1 * sp + v[1] * cp, z1];
  }

  function label(text, x, y, alpha, W) {
    const px = 11 * dpr;
    ctx.font = '500 ' + px + 'px "DM Sans", Arial, sans-serif';
    if ('letterSpacing' in ctx) ctx.letterSpacing = (0.12 * px).toFixed(1) + 'px';
    const t = text.toUpperCase(), w = ctx.measureText(t).width, gap = 13 * dpr;
    const right = x + gap + w < W - 2 * dpr;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = right ? 'left' : 'right';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(13,32,42,0.95)'; ctx.shadowBlur = 7 * dpr;
    ctx.fillText(t, right ? x + gap : x - gap, y);
    ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  }

  function draw(now) {
    if (!size) return;
    const W = canvas.width, R = W * 0.44, cx = W / 2, cy = W / 2;
    const all = reduce.matches && !active;
    ctx.clearRect(0, 0, W, W);
    ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.05, cx, cy, R);
    g.addColorStop(0, 'rgba(189,213,226,0.11)');
    g.addColorStop(1, 'rgba(189,213,226,0.015)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.13)'; ctx.lineWidth = dpr; ctx.stroke();

    const cl = Math.cos(lon * D), sl = Math.sin(lon * D), cp = Math.cos(lat * D), sp = Math.sin(lat * D);
    const s = Math.max(1, 1.5 * dpr * Math.min(1.2, size / 300)), h = s / 2;
    const naOn = all || active === 'na';
    ctx.fillStyle = 'rgb(160,190,206)';
    for (let k = 0; k < P.length; k += 4) {
      const x1 = P[k] * cl + P[k + 2] * sl, d = x1 * cp + P[k + 1] * sp;
      if (d <= 0 || (naOn && P[k + 3])) continue;
      const z1 = -P[k] * sl + P[k + 2] * cl, y2 = -x1 * sp + P[k + 1] * cp;
      ctx.globalAlpha = 0.16 + 0.7 * d;
      ctx.fillRect(cx + R * z1 - h, cy - R * y2 - h, s, s);
    }
    if (naOn) {
      ctx.fillStyle = '#ffffff';
      for (let k = 0; k < P.length; k += 4) {
        if (!P[k + 3]) continue;
        const x1 = P[k] * cl + P[k + 2] * sl, d = x1 * cp + P[k + 1] * sp;
        if (d <= 0) continue;
        const z1 = -P[k] * sl + P[k + 2] * cl, y2 = -x1 * sp + P[k + 1] * cp;
        ctx.globalAlpha = 0.3 + 0.7 * d;
        ctx.fillRect(cx + R * z1 - h, cy - R * y2 - h, s, s);
      }
      const [d, y2, z1] = project(places.na.at, cl, sl, cp, sp);
      if (d > 0.35) label(places.na.label, cx + R * z1, cy - R * y2, Math.min(1, d + 0.1), W);
    }
    for (const key of ['dubai', 'mexico']) {
      const [d, y2, z1] = project(places[key].at, cl, sl, cp, sp);
      if (d <= 0.03) continue;
      const x = cx + R * z1, y = cy - R * y2, on = all || active === key;
      if (on && !reduce.matches) {
        const ph = ((now || 0) % 2400) / 2400;
        ctx.globalAlpha = (1 - ph) * 0.55 * d;
        ctx.strokeStyle = BLUE; ctx.lineWidth = 1.4 * dpr;
        ctx.beginPath(); ctx.arc(x, y, (6 + 15 * ph) * dpr, 0, 2 * Math.PI); ctx.stroke();
      }
      ctx.globalAlpha = Math.min(1, 0.35 + d);
      ctx.strokeStyle = on ? BLUE : 'rgba(189,213,226,0.55)'; ctx.lineWidth = 1.2 * dpr;
      ctx.beginPath(); ctx.arc(x, y, 6.5 * dpr, 0, 2 * Math.PI); ctx.stroke();
      ctx.fillStyle = on ? '#ffffff' : BLUE;
      ctx.beginPath(); ctx.arc(x, y, (on ? 3.2 : 2.4) * dpr, 0, 2 * Math.PI); ctx.fill();
      if (d > 0.14) label(places[key].label, x, y, on ? Math.min(1, d + 0.25) : 0.5 * d, W);
    }
    ctx.globalAlpha = 1;
  }

  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function setActive(key) {
    active = key;
    if (key) idx = order.indexOf(key);
    Object.keys(cards).forEach(k => cards[k].classList.toggle('is-active', k === key));
  }
  function goTo(key, animate) {
    setActive(key);
    const [tl, tp] = places[key].view;
    if (!animate) { lon = tl; lat = tp; from = null; draw(performance.now()); return; }
    const dl = ((tl - lon + 540) % 360) - 180;
    from = [lon, lat]; to = [lon + dl, tp]; t0 = performance.now();
    run();
  }
  function frame(now) {
    raf = 0;
    if (!visible || reduce.matches) return;
    if (from) {
      const t = Math.min(1, (now - t0) / DUR), e = ease(t);
      lon = from[0] + (to[0] - from[0]) * e; lat = from[1] + (to[1] - from[1]) * e;
      if (t === 1) { from = null; lon = ((lon + 540) % 360) - 180; holdUntil = now + HOLD; }
      draw(now); last = now;
    } else {
      if (now > holdUntil && now > pausedUntil) { goTo(order[(idx + 1) % order.length], true); return; }
      if (now - last > 32) { draw(now); last = now; }
    }
    raf = requestAnimationFrame(frame);
  }
  function run() { if (!raf && visible && !reduce.matches) raf = requestAnimationFrame(frame); }

  function resize() {
    const w = host.clientWidth;
    if (!w) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = w;
    canvas.width = canvas.height = Math.round(w * dpr);
    draw(performance.now());
  }
  function applyMotionPreference() {
    if (reduce.matches) { from = null; setActive(null); lon = STATIC_VIEW[0]; lat = STATIC_VIEW[1]; draw(0); }
    else { if (!active) setActive('dubai'); holdUntil = performance.now() + HOLD; run(); }
  }

  Object.keys(cards).forEach(key => {
    const el = cards[key];
    el.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { pausedUntil = Infinity; goTo(key, !reduce.matches); } });
    el.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') pausedUntil = performance.now() + 2500; });
    el.addEventListener('click', () => { pausedUntil = performance.now() + 8000; goTo(key, !reduce.matches); });
  });
  if (reduce.addEventListener) reduce.addEventListener('change', applyMotionPreference);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[entries.length - 1].isIntersecting;
      if (visible) { holdUntil = Math.max(holdUntil, performance.now() + 1200); run(); }
    }).observe(host);
  } else { visible = true; }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
  else window.addEventListener('resize', resize);
  resize();
  applyMotionPreference();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw(performance.now()));
})();
