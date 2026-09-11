// ===== Мобильное меню =====
const burger = document.getElementById('menu-toggle')
const mobileMenu = document.getElementById('mobile-menu')
const body = document.body

function closeMenu() {
  mobileMenu.classList.add('hidden')
  burger.setAttribute('aria-expanded', 'false')
}

burger.addEventListener('click', () => {
  const isOpen = !mobileMenu.classList.contains('hidden')
  if (isOpen) {
    closeMenu()
  } else {
    mobileMenu.classList.remove('hidden')
    burger.setAttribute('aria-expanded', 'true')
  }
})

mobileMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu))

// ===== Тень хедера при скролле =====
const header = document.getElementById('site-header')
function onScroll() {
  header.classList.toggle('is-scrolled', window.scrollY > 12)
}
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

// ===== Появление блоков при скролле =====
const revealEls = document.querySelectorAll('.reveal')
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  )
  revealEls.forEach((el) => io.observe(el))
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'))
}

// ===== Счётчики =====
function animateCounter(el) {
  const target = parseFloat(el.dataset.count)
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0
  const prefix = el.dataset.prefix || ''
  const suffix = el.dataset.suffix || ''
  const duration = 1400
  const start = performance.now()
  function frame(now) {
    const p = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    const val = target * eased
    const formatted = val.toFixed(decimals).replace('.', ',')
    el.textContent = prefix + formatted + suffix
    if (p < 1) requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)
}

const counters = document.querySelectorAll('[data-count]')
if ('IntersectionObserver' in window) {
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCounter(e.target)
          cio.unobserve(e.target)
        }
      })
    },
    { threshold: 0.4 }
  )
  counters.forEach((c) => cio.observe(c))
}

// ===== Лайтбокс галереи =====
const lightbox = document.getElementById('lightbox')
const lightboxImg = document.getElementById('lightbox-img')
const lightboxCaption = document.getElementById('lightbox-caption')
const items = Array.from(document.querySelectorAll('[data-lightbox]'))
const lbPrev = document.getElementById('lightbox-prev')
const lbNext = document.getElementById('lightbox-next')
const lbClose = document.getElementById('lightbox-close')
let currentIndex = 0

function showLightbox(i) {
  currentIndex = (i + items.length) % items.length
  const el = items[currentIndex]
  lightboxImg.src = el.dataset.lightbox
  lightboxImg.alt = el.dataset.caption || ''
  lightboxCaption.textContent = el.dataset.caption || ''
  lightbox.classList.add('open')
  body.style.overflow = 'hidden'
}
function hideLightbox() {
  lightbox.classList.remove('open')
  body.style.overflow = ''
}

items.forEach((el, i) => el.addEventListener('click', () => showLightbox(i)))
lbClose.addEventListener('click', hideLightbox)
lbPrev.addEventListener('click', (e) => { e.stopPropagation(); showLightbox(currentIndex - 1) })
lbNext.addEventListener('click', (e) => { e.stopPropagation(); showLightbox(currentIndex + 1) })
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) hideLightbox() })
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return
  if (e.key === 'Escape') hideLightbox()
  if (e.key === 'ArrowLeft') showLightbox(currentIndex - 1)
  if (e.key === 'ArrowRight') showLightbox(currentIndex + 1)
})

// ===== Аккордеон FAQ =====
const faqItems = document.querySelectorAll('.faq-item')
faqItems.forEach((item) => {
  const btn = item.querySelector('.faq-toggle')
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open')
    faqItems.forEach((i) => {
      i.classList.remove('open')
      i.querySelector('.faq-toggle').setAttribute('aria-expanded', 'false')
    })
    if (!isOpen) {
      item.classList.add('open')
      btn.setAttribute('aria-expanded', 'true')
    }
  })
})

// ===== Подсветка активного пункта меню =====
const sections = Array.from(document.querySelectorAll('main section[id]'))
const navLinks = Array.from(document.querySelectorAll('.nav-link'))
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((l) =>
            l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id)
          )
        }
      })
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  )
  sections.forEach((s) => spy.observe(s))
}

// ===== Форма =====
const form = document.getElementById('calc-form')
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }
    const name = (form.querySelector('#name')?.value || '').trim()
    alert(
      'Спасибо' + (name ? ', ' + name : '') +
      '!\nЗаявка принята. Инженер свяжется с вами для уточнения параметров объекта.\n\n(Демо-форма: данные никуда не отправляются.)'
    )
    form.reset()
  })
}

// ===== Текущий год =====
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = new Date().getFullYear()
