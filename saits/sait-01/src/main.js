// ============================================================================
// «Оживление» sait-01 — лёгкий прогрессив-слой поверх инлайн-скрипта.
// Работает как ES-модуль через Vite, без фреймворков.
// ============================================================================

(function () {
  const doc = document;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Полоса прогресса скролла */
  const progress = doc.createElement('div');
  progress.id = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  doc.body.appendChild(progress);

  /* 2. Шапка: состояние при скролле + прогресс */
  const header = doc.querySelector('.site-header');
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || doc.documentElement.scrollTop || 0;
      const max = doc.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? y / max : 0;
      progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
      if (header) header.classList.toggle('is-scrolled', y > 8);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* 3. Декоративный фон hero (точечная сетка + мягкие пятна) */
  if (!reduced) {
    const hero = doc.querySelector('.hero');
    if (hero) {
      const aura = doc.createElement('div');
      aura.className = 'hero-aura';
      aura.setAttribute('aria-hidden', 'true');
      hero.prepend(aura);
    }
  }

  /* 4. Появление блоков при скролле.
     Hero появляется CSS-анимацией (без JS), поэтому здесь его нет —
     иначе была бы двойная анимация. */
  const revealSel = [
    '.section-heading', '.section-intro',
    '.solution-card', '.application-row', '.consideration',
    '.preparation-list > li', '.plan-figure', '.faq-item',
    '.request-copy', '.brief-card'
  ].join(',');

  const targets = Array.from(doc.querySelectorAll(revealSel));

  // Без IntersectionObserver или при reduced motion — просто показываем всё.
  if (reduced || !('IntersectionObserver' in window)) return;

  // Лёгкая каскадная задержка в пределах одного родителя.
  const seen = new Map();
  targets.forEach((el) => {
    const parent = el.parentElement;
    const n = seen.get(parent) || 0;
    el.style.setProperty('--d', `${Math.min(n * 0.07, 0.45).toFixed(2)}s`);
    seen.set(parent, n + 1);
    el.classList.add('reveal');
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  // Уже попавшие во вьюпорт показываем сразу (в том же синхронном блоке),
  // чтобы не было мигания. Остальные раскроются при скролле.
  targets.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      el.classList.add('is-visible');
    } else {
      io.observe(el);
    }
  });
})();
