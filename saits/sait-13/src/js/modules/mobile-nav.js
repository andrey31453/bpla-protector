// mobile-nav — мобильное меню собрано как <details> (работает без JS).
// Модуль только закрывает его: по клику вне панели, по Escape, по
// переходу по ссылке и при возврате к десктопной ширине. Дополнительно
// сообщает CSS, где заканчивается шапка (--mnav-top): по этому значению
// панель растягивается ровно до низа окна, чтобы под ней не выглядывал
// «хвост» страницы. Без JS остаётся запасной вариант из CSS.
export function initMobileNav() {
  const nav = document.querySelector('details.mnav')
  if (!nav) return

  const header = nav.closest('.site-header')

  // Высоту шапки отдаём в CSS-переменную: разметку и контент модуль не
  // трогает. Мерим на старте, после загрузки шрифтов и при смене размера —
  // верхняя строка контактов на узких экранах переносится и шапка растёт.
  const measure = () => {
    if (!header) return
    header.style.setProperty('--mnav-top', Math.round(header.getBoundingClientRect().bottom) + 'px')
    header.classList.add('is-mnav-measured')
  }
  measure()
  window.addEventListener('load', measure)
  window.addEventListener('resize', measure)
  window.addEventListener('orientationchange', measure)

  document.addEventListener('click', (event) => {
    if (nav.open && !nav.contains(event.target)) nav.open = false
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.open) nav.open = false
  })

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) nav.open = false
  })

  window.addEventListener('resize', () => {
    if (nav.open && window.innerWidth >= 1024) nav.open = false
  })
}
