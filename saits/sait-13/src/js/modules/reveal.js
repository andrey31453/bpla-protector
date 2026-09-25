// reveal — плавное появление секций. Без JS класс .reveal остаётся
// видимым (opacity скрывается только при html.js), поэтому контент
// не пропадает. Никаких текстов и ссылок модуль не создаёт.
export function initReveal() {
  const items = Array.from(document.querySelectorAll('.reveal'))
  if (!items.length) return

  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'))
    return
  }

  const observer = new IntersectionObserver(
    (entries, self) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-in')
        self.unobserve(entry.target)
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
  )

  items.forEach((el, index) => {
    el.style.setProperty('--d', `${(index % 6) * 0.05}s`)
    observer.observe(el)
  })
}
