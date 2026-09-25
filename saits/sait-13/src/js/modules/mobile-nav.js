// mobile-nav — мобильное меню собрано как <details> (работает без JS).
// Модуль только закрывает его: по клику вне панели, по Escape, по
// переходу по ссылке и при возврате к десктопной ширине.
export function initMobileNav() {
  const nav = document.querySelector('details.mnav')
  if (!nav) return

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
