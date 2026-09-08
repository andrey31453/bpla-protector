import './style.css'

const NAV = [
  { href: 'index.html', label: 'Главная', id: 'index' },
  { href: 'ugrozy.html', label: 'Угрозы', id: 'ugrozy' },
  { href: 'konstrukcii.html', label: 'Конструкции', id: 'konstrukcii' },
  { href: 'princip.html', label: 'Принцип работы', id: 'princip' },
  { href: 'proektirovanie.html', label: 'Проектирование', id: 'proektirovanie' },
  { href: 'primenenie.html', label: 'Применение', id: 'primenenie' },
  { href: 'montazh.html', label: 'Монтаж', id: 'montazh' },
  { href: 'kompleksnaya.html', label: 'Комплексная защита', id: 'kompleksnaya' },
]

const LOGO_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M12 3l7 3v5.2c0 4.6-3 8.1-7 9.8-4-1.7-7-5.2-7-9.8V6l7-3z"/><path d="M8.6 12l2.4 2.4 4.4-4.8"/></svg>`

const BURGER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="h-5 w-5"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`

const CLOSE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" class="h-5 w-5"><path d="M6 6l12 12M18 6L6 18"/></svg>`

function currentId() {
  const path = location.pathname.replace(/\/+$/, '')
  const file = path.split('/').pop() || 'index.html'
  return (NAV.find((n) => n.href === file) || NAV[0]).id
}

function navLink(n, active) {
  const activeCls = n.id === active ? 'bg-white/5 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
  return `<a href="${n.href}" class="rounded-md px-2.5 py-1.5 text-[13px] font-medium transition ${activeCls}">${n.label}</a>`
}

function renderHeader() {
  const active = currentId()
  const links = NAV.map((n) => navLink(n, active)).join('')
  const mobileLinks = NAV.map(
    (n) =>
      `<a href="${n.href}" class="rounded-lg px-3 py-2.5 text-sm font-medium ${n.id === active ? 'bg-white/5 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}">${n.label}</a>`,
  ).join('')

  document.getElementById('site-header').innerHTML = `
  <header class="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur">
    <div class="wrap flex h-16 items-center justify-between gap-4">
      <a href="index.html" class="flex shrink-0 items-center gap-2.5">
        <span class="grid h-9 w-9 place-items-center rounded-lg bg-cyan-500 text-slate-950">${LOGO_SVG}</span>
        <span class="leading-tight">
          <span class="block text-[15px] font-bold tracking-tight text-white">ЗОК‑ИНЖИНИРИНГ</span>
          <span class="block text-[10px] uppercase tracking-[0.16em] text-slate-400">Защита от БПЛА</span>
        </span>
      </a>
      <nav class="hidden items-center gap-0.5 xl:flex">${links}</nav>
      <div class="flex items-center gap-2">
        <a href="index.html#cta" class="btn btn-primary hidden lg:inline-flex">Получить расчёт</a>
        <button id="menu-btn" type="button" aria-label="Открыть меню" aria-expanded="false" class="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-slate-200 transition hover:bg-white/5 xl:hidden">${BURGER}</button>
      </div>
    </div>
    <div id="mobile-menu" class="hidden border-t border-white/5 xl:hidden">
      <nav class="wrap flex flex-col gap-1 py-4">${mobileLinks}</nav>
    </div>
  </header>`
}
function renderFooter() {
  const col1 = NAV.slice(0, 4).map((n) => `<a href="${n.href}" class="hover:text-white">${n.label}</a>`).join('')
  const col2 = NAV.slice(4).map((n) => `<a href="${n.href}" class="hover:text-white">${n.label}</a>`).join('')

  document.getElementById('site-footer').innerHTML = `
  <footer class="border-t border-white/5 bg-slate-950">
    <div class="wrap grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
      <div class="lg:col-span-2">
        <a href="index.html" class="flex items-center gap-2.5">
          <span class="grid h-9 w-9 place-items-center rounded-lg bg-cyan-500 text-slate-950">${LOGO_SVG}</span>
          <span class="text-[15px] font-bold tracking-tight text-white">ЗОК‑ИНЖИНИРИНГ</span>
        </a>
        <p class="mt-4 max-w-md text-sm leading-relaxed text-slate-400">Проектируем, рассчитываем, изготавливаем и монтируем защитные ограждающие конструкции от БПЛА для промышленных и инфраструктурных объектов.</p>
      </div>
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Разделы</p>
        <nav class="mt-4 flex flex-col gap-2.5 text-sm text-slate-300">${col1}</nav>
      </div>
      <div>
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Ещё</p>
        <nav class="mt-4 flex flex-col gap-2.5 text-sm text-slate-300">${col2}<a href="index.html#cta" class="hover:text-white">Получить расчёт</a></nav>
      </div>
    </div>
    <div class="border-t border-white/5">
      <div class="wrap flex flex-col gap-3 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 ЗОК‑ИНЖИНИРИНГ. Демонстрационный лендинг.</p>
        <p>Материалы носят информационный характер и не являются рабочей документацией.</p>
      </div>
    </div>
  </footer>`
}

function setupMenu() {
  const btn = document.getElementById('menu-btn')
  const menu = document.getElementById('mobile-menu')
  if (!btn || !menu) return
  let open = false
  btn.addEventListener('click', () => {
    open = !open
    menu.classList.toggle('hidden', !open)
    btn.setAttribute('aria-expanded', String(open))
    btn.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню')
    btn.innerHTML = open ? CLOSE : BURGER
  })
}

function setupReveal() {
  const els = document.querySelectorAll('.reveal')
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'))
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible')
          io.unobserve(e.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  )
  els.forEach((el) => io.observe(el))
}

function setupForm() {
  const form = document.getElementById('lead-form')
  if (!form) return
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const status = document.getElementById('form-status')
    if (status) {
      status.textContent = 'Спасибо! Это демо-форма: данные не отправляются на сервер.'
      status.className = 'mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200'
    }
    form.reset()
  })
}

renderHeader()
renderFooter()
setupMenu()
setupReveal()
setupForm()
