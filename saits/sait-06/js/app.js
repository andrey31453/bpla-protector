/* ============================================================
   Защитные конструкции от БПЛА — интерактив
   Слайдер, мобильное меню, модальное окно, кнопка «наверх»
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  initHeroSlider();
  initMobileMenu();
  initModal();
  initGoTop();
  initSmoothScroll();
  initYear();
});

/* ---------- Текущий год в футере ---------- */
function initYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Hero-слайдер ---------- */
function initHeroSlider() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const slides = hero.querySelectorAll('.hero__slide');
  const dotsWrap = hero.querySelector('.hero__dots');
  if (!slides.length) return;

  let current = 0;
  let timer = null;

  // Строим точки-переключатели
  slides.forEach(function (slide, i) {
    const dot = document.createElement('button');
    dot.className = 'hero__dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
    dot.addEventListener('click', function () {
      goTo(i);
      restart();
    });
    dotsWrap.appendChild(dot);
  });

  const dots = dotsWrap.querySelectorAll('.hero__dot');

  function goTo(index) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = index;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  function start() {
    timer = setInterval(next, 5500);
  }

  function stop() {
    if (timer) clearInterval(timer);
  }

  function restart() {
    stop();
    start();
  }

  start();

  // Пауза при наведении
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
}

/* ---------- Мобильное меню ---------- */
function initMobileMenu() {
  const toggle = document.querySelector('.navbar__toggle');
  const links = document.querySelector('.navbar__links');
  const overlay = document.querySelector('.overlay-nav');
  if (!toggle || !links) return;

  function close() {
    links.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  function open() {
    links.classList.add('is-open');
    if (overlay) overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  toggle.addEventListener('click', function () {
    if (links.classList.contains('is-open')) {
      close();
    } else {
      open();
    }
  });

  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', close);
  });

  if (overlay) {
    overlay.addEventListener('click', close);
  }

  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) close();
  });
}

/* ---------- Модальное окно обратного звонка ---------- */
function initModal() {
  const modal = document.querySelector('.modal');
  if (!modal) return;

  const openButtons = document.querySelectorAll('[data-modal-open]');
  const closeButton = modal.querySelector('.modal__close');
  const backdrop = modal.querySelector('.modal__backdrop');
  const form = modal.querySelector('form');

  function openModal() {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  openButtons.forEach(function (btn) {
    btn.addEventListener('click', openModal);
  });

  if (closeButton) closeButton.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const note = form.querySelector('.form-note');
      if (note) {
        note.style.display = 'block';
        form.reset();
        setTimeout(function () {
          note.style.display = 'none';
          closeModal();
        }, 2200);
      }
    });
  }
}

/* ---------- Кнопка «наверх» ---------- */
function initGoTop() {
  const btn = document.querySelector('.go-top');
  if (!btn) return;

  function toggleVisibility() {
    if (window.scrollY > 400) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Плавный скролл по якорям ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const id = link.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}
