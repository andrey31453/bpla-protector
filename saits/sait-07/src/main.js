import './style.css'

/* ---------- header ---------- */
const header = document.getElementById('site-header')
const navToggle = document.getElementById('nav-toggle')
const navMenu = document.getElementById('nav-menu')
const goTop = document.getElementById('go-top')

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open')
    navToggle.setAttribute('aria-expanded', String(open))
    document.body.classList.toggle('overflow-hidden', open)
  })
}

navMenu?.querySelectorAll('a').forEach((a) => {
  a.addEventListener('click', () => {
    navMenu.classList.remove('open')
    navToggle?.setAttribute('aria-expanded', 'false')
    document.body.classList.remove('overflow-hidden')
  })
})

window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 10)
  goTop?.classList.toggle('show', window.scrollY > 600)
})

goTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

/* ---------- reveal on scroll ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        revealObserver.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.12 }
)

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el))

/* ---------- FAQ accordion ---------- */
document.querySelectorAll('.faq-item').forEach((item) => {
  const head = item.querySelector('.faq-head')
  head?.addEventListener('click', () => {
    const isOpen = item.classList.contains('open')
    document.querySelectorAll('.faq-item.open').forEach((o) => o.classList.remove('open'))
    if (!isOpen) item.classList.add('open')
  })
})

/* ---------- lead form (demo) ---------- */
const form = document.getElementById('lead-form')
form?.addEventListener('submit', (e) => {
  e.preventDefault()
  const btn = form.querySelector('button[type="submit"]')
  const original = btn.innerHTML
  btn.disabled = true
  btn.textContent = 'Заявка принята'
  setTimeout(() => {
    form.reset()
    btn.disabled = false
    btn.innerHTML = original
  }, 1800)
})
