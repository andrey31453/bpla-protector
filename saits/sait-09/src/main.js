import './style.css'

const BRAND = 'СТАЛЬРУБЕЖ'

const NAV = [
  { href: 'index.html', label: 'Главная', num: '01' },
  { href: 'ugrozy.html', label: 'Угрозы и сценарии', num: '02' },
  { href: 'konstrukcii.html', label: 'Конструкции', num: '03' },
  { href: 'princip.html', label: 'Принцип работы', num: '04' },
  { href: 'proektirovanie.html', label: 'Проектирование и расчёт', num: '05' },
  { href: 'primenenie.html', label: 'Преимущества и применение', num: '06' },
  { href: 'montazh.html', label: 'Монтаж и эксплуатация', num: '07' },
  { href: 'kompleksnaya.html', label: 'Комплексная защита', num: '08' },
]

const CONTACTS = {
  phone: '8 800 550-64-69',
  phoneHref: 'tel:88005506469',
  email: 'info@stalrubezh.ru',
  city: 'Набережные Челны',
}

const ICONS = {
  phone:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mail:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  pin:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  arrow:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  arrowUp:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>',
}

const brandMark =
  '<svg class="brand__mark" viewBox="0 0 44 44" aria-hidden="true"><path d="M22 2.5 38.5 9v12c0 9.3-6.5 16.6-16.5 20.5C12 37.6 5.5 30.3 5.5 21V9Z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M5.5 15.5h33" stroke="currentColor" stroke-width="1.3" opacity="0.42"/><circle cx="22" cy="24.5" r="3.2" fill="currentColor"/></svg>'

function currentPage() {
  const p = window.location.pathname.split('/').pop()
  return p === '' || p === '/' ? 'index.html' : p
}

function brandMarkup() {
  return `<a class="brand" href="index.html" aria-label="${BRAND} — на главную">${brandMark}<span class="brand__word">СТАЛЬ<span>РУБЕЖ</span></span></a>`
}

function renderHeader() {
  const el = document.getElementById('site-header')
  if (!el) return
  const ctaHref = currentPage() === 'index.html' ? '#contact' : 'index.html#contact'
  el.innerHTML = `
    <header class="site-header">
      <div class="container-x site-header__inner">
        ${brandMarkup()}
        <div class="site-header__right">
          <a class="site-header__phone" href="${CONTACTS.phoneHref}">${ICONS.phone}<span>${CONTACTS.phone}</span></a>
          <a class="btn btn--accent site-header__cta" href="${ctaHref}">Получить расчёт</a>
          <button class="burger" id="menu-toggle" aria-label="Открыть меню" aria-expanded="false" aria-controls="menu-overlay"><span></span><span></span><span></span></button>
        </div>
      </div>
    </header>`
}

function renderFooter() {
  const el = document.getElementById('site-footer')
  if (!el) return
  const navLinks = NAV.map((n) => `<a class="site-footer__link" href="${n.href}">${n.label}</a>`).join('')
  el.innerHTML = `
    <footer class="site-footer">
      <div class="container-x">
        <div class="site-footer__top">
          <div>
            ${brandMarkup()}
            <p class="site-footer__desc">Инженерное проектирование, расчёт и производство сплошных защитных барьеров от атак БПЛА для стратегических и промышленных объектов.</p>
          </div>
          <div>
            <div class="site-footer__col-title">Разделы</div>
            ${navLinks}
          </div>
          <div>
            <div class="site-footer__col-title">Контакты</div>
            <a class="site-footer__contact" href="${CONTACTS.phoneHref}">${ICONS.phone}${CONTACTS.phone}</a>
            <a class="site-footer__contact" href="mailto:${CONTACTS.email}">${ICONS.mail}${CONTACTS.email}</a>
            <div class="site-footer__contact">${ICONS.pin}${CONTACTS.city}, пр-т Вахитова, 36Г</div>
          </div>
        </div>
        <div class="site-footer__bottom">
          <span>© ${new Date().getFullYear()} «${BRAND}». Все права защищены.</span>
          <span>Защитные ограждающие конструкции по СП 542.1325800.2024</span>
        </div>
      </div>
    </footer>`
}

function wrapPage() {
  const page = document.createElement('div')
  page.className = 'page'
  const header = document.getElementById('site-header')
  const main = document.querySelector('main')
  const footer = document.getElementById('site-footer')
  if (header) page.appendChild(header)
  if (main) page.appendChild(main)
  if (footer) page.appendChild(footer)
  document.body.prepend(page)
}

function renderMenu() {
  const overlay = document.createElement('div')
  overlay.className = 'menu-overlay'
  overlay.id = 'menu-overlay'
  overlay.setAttribute('aria-hidden', 'true')
  const links = NAV.map((n, i) => {
    const current = currentPage() === n.href ? ' is-current' : ''
    return `<a class="menu-link${current}" href="${n.href}" style="--d:${(0.05 + i * 0.045).toFixed(3)}s"><span>${n.label}</span><span class="menu-link__i">${n.num}</span></a>`
  }).join('')
  overlay.innerHTML = `
    <div class="menu-backdrop" data-menu-close></div>
    <div class="menu-panel">
      <div class="menu-panel__head">
        <span class="menu-panel__label">Навигация</span>
        <button class="burger is-active" data-menu-close aria-label="Закрыть меню"><span></span><span></span><span></span></button>
      </div>
      <nav class="menu-nav">${links}</nav>
      <div class="menu-panel__foot">
        <a class="menu-contact" href="${CONTACTS.phoneHref}">${ICONS.phone}${CONTACTS.phone}</a>
        <a class="menu-contact" href="mailto:${CONTACTS.email}">${ICONS.mail}${CONTACTS.email}</a>
      </div>
    </div>`
  document.body.appendChild(overlay)
  return overlay
}

function initMenu() {
  const overlay = renderMenu()
  const toggle = document.getElementById('menu-toggle')

  const open = () => {
    overlay.classList.add('is-open')
    overlay.setAttribute('aria-hidden', 'false')
    toggle.classList.add('is-active')
    toggle.setAttribute('aria-expanded', 'true')
    document.body.classList.add('no-scroll')
    document.body.classList.add('menu-open')
  }
  const close = () => {
    overlay.classList.remove('is-open')
    overlay.setAttribute('aria-hidden', 'true')
    toggle.classList.remove('is-active')
    toggle.setAttribute('aria-expanded', 'false')
    document.body.classList.remove('no-scroll')
    document.body.classList.remove('menu-open')
  }

  toggle.addEventListener('click', () => {
    if (overlay.classList.contains('is-open')) close()
    else open()
  })
  overlay.querySelectorAll('[data-menu-close]').forEach((el) => el.addEventListener('click', close))
  overlay.querySelectorAll('.menu-link').forEach((a) => a.addEventListener('click', close))
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close()
  })
}

function initReveal() {
  const els = document.querySelectorAll('.reveal')
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          io.unobserve(e.target)
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  )
  els.forEach((el) => io.observe(el))
}

function initForm() {
  const form = document.getElementById('contact-form')
  if (!form) return
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    alert('Спасибо! Заявка получена. Специалист «' + BRAND + '» свяжется с вами для уточнения параметров объекта.')
    form.reset()
  })
}

function initGoTop() {
  const btn = document.createElement('button')
  btn.className = 'go-top'
  btn.setAttribute('aria-label', 'Наверх')
  btn.innerHTML = ICONS.arrowUp
  document.body.appendChild(btn)
  const track = () => {
    if (window.scrollY > 600) btn.classList.add('is-visible')
    else btn.classList.remove('is-visible')
  }
  window.addEventListener('scroll', track, { passive: true })
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
  track()
}

renderHeader()
renderFooter()
wrapPage()
initMenu()
initReveal()
initForm()
initGoTop()

