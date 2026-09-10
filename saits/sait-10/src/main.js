import './style.css'
import './stars.css'

const NAV = [
  { href: '#contur', label: 'Защитный контур' },
  { href: '#primery', label: 'Примеры' },
  { href: '#cikl', label: 'Полный цикл' },
  { href: '#raschet', label: 'Расчёт' },
  { href: '#preimushchestva', label: 'Преимущества' },
  { href: '#uslugi', label: 'Услуги' },
  { href: '#faq', label: 'Вопросы' },
]

const CONTACTS = {
  brand: 'ЕВРОСТАЛЬ',
  sub: 'Защитные конструкции от БПЛА',
  phone: '8 800 550 64 69',
  phoneHref: 'tel:88005506469',
  email: 'zakaz@boxwel.ru',
  addr1: '423800, Россия, РТ, г. Набережные Челны, пр-т Вахитова, д. 36 Г',
  addr2: '423800, Россия, РТ, г. Набережные Челны, ул. Промышленная, д. 53',
}

function logoHTML() {
  return `
    <a href="#hero" class="flex items-center gap-3 group">
      <span class="relative grid h-10 w-10 place-items-center">
        <svg viewBox="0 0 24 24" class="h-10 w-10 text-gold drop-shadow-[0_0_10px_rgba(254,218,74,0.5)]" fill="none" stroke="currentColor" stroke-width="1.3">
          <path d="M12 2 3 7v5c0 5 3.8 8.6 9 10 5.2-1.4 9-5 9-10V7l-9-5z"/>
          <path d="M12 6v6m0 0-3-2m3 2 3-2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="leading-none">
        <span class="block font-display text-lg font-bold tracking-[0.18em] text-gold text-glow">${CONTACTS.brand}</span>
        <span class="mt-1 block text-[10px] uppercase tracking-[0.28em] text-ghost">${CONTACTS.sub}</span>
      </span>
    </a>`
}

function navLinksHTML(extraClass = '') {
  return NAV.map(
    (item) =>
      `<a href="${item.href}" class="nav-link ${extraClass} text-sm font-medium text-ghost hover:text-gold transition-colors">${item.label}</a>`
  ).join('')
}

function headerHTML() {
  return `
  <header class="site-header fixed inset-x-0 top-0 z-50 transition-colors duration-300">
    <div class="wrap flex h-[72px] items-center justify-between gap-4">
      ${logoHTML()}
      <nav class="hidden lg:flex items-center gap-7">${navLinksHTML()}</nav>
      <div class="flex items-center gap-3">
        <a href="${CONTACTS.phoneHref}" class="hidden md:flex items-center gap-2 text-sm font-semibold text-slate-100 hover:text-gold transition-colors">
          <svg viewBox="0 0 24 24" class="h-4 w-4 text-gold" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>
          ${CONTACTS.phone}
        </a>
        <a href="#kontakty" class="btn btn-gold hidden sm:inline-flex text-sm !py-2.5 !px-4">Получить расчёт</a>
        <button id="menu-btn" aria-label="Меню" class="lg:hidden grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-slate-100 hover:border-gold/50">
          <svg id="menu-icon-open" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          <svg id="menu-icon-close" viewBox="0 0 24 24" class="hidden h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </button>
      </div>
    </div>
    <div id="mobile-menu" class="hidden lg:hidden border-t border-white/10 bg-space-950/95 backdrop-blur">
      <nav class="wrap flex flex-col gap-1 py-4">
        ${navLinksHTML('block rounded-lg px-3 py-2.5')}
        <a href="#kontakty" class="btn btn-gold mt-2">Получить расчёт</a>
      </nav>
    </div>
  </header>`
}

function footerHTML() {
  return `
  <footer class="relative overflow-hidden border-t border-white/10 bg-space-950">
    <div class="wrap grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
      <div class="lg:col-span-2">
        ${logoHTML()}
        <p class="mt-5 max-w-md text-sm leading-relaxed text-ghost">
          Разработка, расчёт, производство и монтаж защитных ограждающих конструкций (ЗОК)
          от БПЛА для промышленных и инфраструктурных объектов. Решения проектируются под
          объект с учётом СП&nbsp;542.1325800.2024 и расчётных нагрузок.
        </p>
      </div>
      <div>
        <h4 class="font-heading text-sm font-bold uppercase tracking-[0.18em] text-gold">Навигация</h4>
        <nav class="mt-4 flex flex-col gap-2.5">
          ${NAV.map((n) => `<a href="${n.href}" class="text-sm text-ghost hover:text-gold transition-colors">${n.label}</a>`).join('')}
        </nav>
      </div>
      <div>
        <h4 class="font-heading text-sm font-bold uppercase tracking-[0.18em] text-gold">Контакты</h4>
        <ul class="mt-4 flex flex-col gap-3 text-sm text-ghost">
          <li><a href="${CONTACTS.phoneHref}" class="font-semibold text-slate-100 hover:text-gold transition-colors">${CONTACTS.phone}</a></li>
          <li><a href="mailto:${CONTACTS.email}" class="hover:text-gold transition-colors">${CONTACTS.email}</a></li>
          <li class="leading-relaxed">${CONTACTS.addr1}</li>
          <li class="leading-relaxed">${CONTACTS.addr2}</li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10">
      <div class="wrap flex flex-col gap-2 py-6 text-xs text-steel sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 ООО «ЗМК «ЕВРОСТАЛЬ». Все права защищены.</p>
        <p>Проектируем, рассчитываем и монтируем защитные конструкции от БПЛА.</p>
      </div>
    </div>
  </footer>`
}

document.getElementById('site-header').innerHTML = headerHTML()
document.getElementById('site-footer').innerHTML = footerHTML()

/* ---------- Шапка: фон при скролле + мобильное меню ---------- */
const header = document.querySelector('.site-header')
const menuBtn = document.getElementById('menu-btn')
const mobileMenu = document.getElementById('mobile-menu')
const iconOpen = document.getElementById('menu-icon-open')
const iconClose = document.getElementById('menu-icon-close')

function onScrollHeader() {
  if (window.scrollY > 24) {
    header.classList.add('bg-space-950/85', 'backdrop-blur', 'border-b', 'border-white/10')
  } else {
    header.classList.remove('bg-space-950/85', 'backdrop-blur', 'border-b', 'border-white/10')
  }
}
window.addEventListener('scroll', onScrollHeader, { passive: true })
onScrollHeader()

function toggleMenu(force) {
  const open = force !== undefined ? force : mobileMenu.classList.contains('hidden')
  mobileMenu.classList.toggle('hidden', !open)
  iconOpen.classList.toggle('hidden', open)
  iconClose.classList.toggle('hidden', !open)
}
menuBtn.addEventListener('click', () => toggleMenu())
mobileMenu.addEventListener('click', (e) => {
  if (e.target.closest('a')) toggleMenu(false)
})

/* ---------- Плавный скролл с учётом фиксированной шапки ---------- */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href')
    if (id.length < 2) return
    const target = document.querySelector(id)
    if (!target) return
    e.preventDefault()
    const y = target.getBoundingClientRect().top + window.scrollY - 80
    window.scrollTo({ top: y, behavior: 'smooth' })
  })
})

/* ---------- Reveal-анимации ---------- */
const revealObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        obs.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
)
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el))

/* ---------- FAQ аккордеон ---------- */
document.querySelectorAll('.faq-item').forEach((item) => {
  const btn = item.querySelector('.faq-question')
  const body = item.querySelector('.faq-answer')
  const icon = item.querySelector('.faq-icon')
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open')
    document.querySelectorAll('.faq-item').forEach((other) => {
      other.classList.remove('is-open')
      other.querySelector('.faq-answer').style.maxHeight = '0px'
      other.querySelector('.faq-icon').style.transform = 'rotate(0deg)'
    })
    if (!isOpen) {
      item.classList.add('is-open')
      body.style.maxHeight = body.scrollHeight + 'px'
      icon.style.transform = 'rotate(45deg)'
    }
  })
})

/* ---------- Демо-форма ---------- */
const form = document.getElementById('calc-form')
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(form).entries())
    console.log('Заявка:', data)
    alert(
      'Спасибо! Заявка сформирована (демо-режим).\nМы свяжемся с вами для уточнения параметров объекта.'
    )
    form.reset()
  })
}
