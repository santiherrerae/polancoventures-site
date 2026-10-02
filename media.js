/* Polanco Ventures: company footage loops.
   Muted, looping clips that play only while on screen. They never load or play for
   visitors who prefer reduced motion or have Save-Data on; those visitors see the poster
   image. The button lets anyone pause or resume. The <img> under each clip carries the
   description for screen readers; the video itself is aria-hidden. */
(() => {
  const reduce = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const saveData = !!(navigator.connection && navigator.connection.saveData);
  document.querySelectorAll('video[data-loop]').forEach(video => {
    const toggle = video.parentElement.querySelector('.video-toggle');
    let userPaused = false, inView = false;
    video.muted = true;
    const allowed = () => !reduce.matches && !saveData && !userPaused;
    const setButton = paused => {
      if (!toggle) return;
      toggle.classList.toggle('is-paused', paused);
      const es = document.documentElement.lang === 'es';
      toggle.setAttribute('aria-label', paused ? (es ? 'Reproducir video' : 'Play video') : (es ? 'Pausar video' : 'Pause video'));
    };
    const sync = () => {
      if (inView && allowed()) {
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      } else if (!video.paused) {
        video.pause();
      }
    };
    video.addEventListener('playing', () => { if (toggle) toggle.hidden = false; setButton(false); });
    if (toggle) toggle.addEventListener('click', () => { userPaused = !userPaused; setButton(userPaused); sync(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => { inView = entries[entries.length - 1].isIntersecting; sync(); }, { threshold: 0.2 }).observe(video);
    }
    if (reduce.addEventListener) reduce.addEventListener('change', sync);
  });
})();
