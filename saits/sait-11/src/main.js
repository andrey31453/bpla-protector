// ============================================================
// sait-11 · main.js — прелоадер, reveal, меню, шапка, форма
// ============================================================

// Включаем reveal-анимации только при работающем JS.
// Без этого класса .reveal остаётся видимым (прогрессивное улучшение).
document.documentElement.classList.add('js-ready');

// ---------- Прелоадер (адаптация originals/preload-design-kor) ----------
;(() => {
  const preload = document.querySelector('.preload--v1')
  if (!preload) return

  const slides = Array.from(document.querySelectorAll('.pv1__slaid-text'))
  const speed = 700
  let i = 0

  const close = () => {
    preload.classList.add('--closed')
    preload.classList.remove('--active')
    window.removeEventListener('click', close)
    window.removeEventListener('keydown', close)
  }

  const removeActive = () => {
    if (slides[i]) slides[i].classList.remove('--active')
    i += 1
    if (i < slides.length) {
      addActive()
    } else {
      close()
    }
  }

  const addActive = () => {
    if (slides[i]) slides[i].classList.add('--active')
    window.setTimeout(removeActive, speed)
  }

  window.setTimeout(addActive, speed / 2)
  window.addEventListener('click', close)
  window.addEventListener('keydown', close)
})();

// ---------- Reveal-анимации ----------
;(() => {
  const els = document.querySelectorAll('.reveal')
  if (!els.length) return

  const show = (el) => el.classList.add('is-visible')

  if (!('IntersectionObserver' in window)) {
    els.forEach(show)
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target)
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.08 }
  )
  els.forEach((el) => io.observe(el))

  // Страховка: всё, что уже во вьюпорте после закрытия прелоадера,
  // показываем принудительно, даже если наблюдатель не успел.
  window.setTimeout(() => {
    els.forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight && r.bottom > 0) show(el)
    })
  }, 1400)
})();

// ---------- Мобильное меню ----------
;(() => {
  const burger = document.getElementById('burger')
  const menu = document.getElementById('mobile-menu')
  if (!burger || !menu) return

  const toggle = (open) => {
    menu.classList.toggle('hidden', !open)
    burger.setAttribute('aria-expanded', String(open))
  }

  burger.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden')
    toggle(!isOpen)
  })

  menu.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', () => toggle(false))
  })
})();

// ---------- Шапка при скролле ----------
;(() => {
  const header = document.getElementById('site-header')
  if (!header) return
  const onScroll = () => {
    if (window.scrollY > 24) {
      header.classList.add('bg-ink/85', 'backdrop-blur-md', 'border-b', 'border-white/10')
    } else {
      header.classList.remove('bg-ink/85', 'backdrop-blur-md', 'border-b', 'border-white/10')
    }
  }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})();

// ---------- Форма (демо) ----------
;(() => {
  const form = document.getElementById('lead-form')
  if (!form) return

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(form).entries())
    window.alert(
      'Спасибо! Заявка принята (демо-режим, данные никуда не отправляются).\n\n' +
        'Имя: ' + (data.name || '—') + '\n' +
        'Телефон: ' + (data.phone || '—') + '\n' +
        'Направление: ' + (data.direction || '—')
    )
    form.reset()
  })
})();
