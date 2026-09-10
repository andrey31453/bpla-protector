import './style.css'

// --- Mobile menu ---
const menuBtn = document.getElementById('menu-btn')
const mobileMenu = document.getElementById('mobile-menu')
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('hidden')
    menuBtn.setAttribute('aria-expanded', String(!open))
  })
  mobileMenu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      mobileMenu.classList.add('hidden')
      menuBtn.setAttribute('aria-expanded', 'false')
    })
  })
}

// --- Sticky nav shadow ---
const header = document.getElementById('site-header')
if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10)
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}

// --- Reveal animations ---
const revealEls = document.querySelectorAll('.reveal')
if ('IntersectionObserver' in window && revealEls.length) {
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

// --- FAQ accordion ---
document.querySelectorAll('.acc-item').forEach((item) => {
  const head = item.querySelector('.acc-head')
  const body = item.querySelector('.acc-body')
  if (!head || !body) return
  head.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open')
    document.querySelectorAll('.acc-item.is-open').forEach((open) => {
      open.classList.remove('is-open')
      open.querySelector('.acc-body').style.maxHeight = null
    })
    if (!isOpen) {
      item.classList.add('is-open')
      body.style.maxHeight = body.scrollHeight + 'px'
    }
  })
})

// --- Go-top ---
const goTop = document.getElementById('go-top')
if (goTop) {
  window.addEventListener('scroll', () => {
    goTop.classList.toggle('is-visible', window.scrollY > 600)
  }, { passive: true })
  goTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
}

// --- Nav active link on scroll ---
const sections = document.querySelectorAll('section[id]')
const navLinks = document.querySelectorAll('.nav-link[href^="#"]')
if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((l) =>
            l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id)
          )
        }
      })
    },
    { rootMargin: '-45% 0px -50% 0px' }
  )
  sections.forEach((s) => spy.observe(s))
}

// --- Form (demo) ---
const form = document.getElementById('calc-form')
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    alert('Спасибо! Заявка получена. Инженер свяжется с вами для уточнения параметров объекта.')
    form.reset()
  })
}

// --- Footer year ---
const year = document.getElementById('year')
if (year) year.textContent = new Date().getFullYear()
