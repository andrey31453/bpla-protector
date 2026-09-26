// tabs — переключатель панелей в блоке «Стоимость по направлениям»
// (страница «Стоимость» и одноимённый блок главной).
// Разметку и контент целиком делает сборка: все панели лежат в HTML, поэтому
// таблицы и ссылки индексируются без исполнения JS. Модуль ничего не рендерит —
// только переключает классы и ARIA-атрибуты. Без него класс is-tabs-ready не
// появляется, и CSS показывает первую панель (а без JS — все панели списком).
export function initTabs() {
  const blocks = Array.from(document.querySelectorAll('[data-tabs]'))
  if (!blocks.length) return

  for (const block of blocks) {
    const tabs = Array.from(block.querySelectorAll('[role="tab"]'))
    const panels = Array.from(block.querySelectorAll('[role="tabpanel"]'))
    if (!tabs.length || tabs.length !== panels.length) continue

    // Сопоставляем кнопку и панель по aria-controls, а не по порядку в DOM:
    // тогда перестановка направлений в данных не ломает переключатель.
    const pairs = []
    let broken = false
    for (const tab of tabs) {
      const panel = document.getElementById(tab.getAttribute('aria-controls') || '')
      if (!panel || !block.contains(panel)) {
        broken = true
        break
      }
      pairs.push({ tab, panel })
    }
    if (broken) continue

    const activate = (index, focus) => {
      pairs.forEach(({ tab, panel }, i) => {
        const on = i === index
        tab.setAttribute('aria-selected', on ? 'true' : 'false')
        tab.tabIndex = on ? 0 : -1
        panel.classList.toggle('is-active', on)
      })
      if (focus) pairs[index].tab.focus()
    }

    block.addEventListener('click', (event) => {
      const tab = event.target.closest('[role="tab"]')
      if (!tab || !block.contains(tab)) return
      const index = pairs.findIndex((pair) => pair.tab === tab)
      if (index >= 0) activate(index, false)
    })

    // Клавиатура как в шаблоне ARIA: стрелки по кругу, Home/End — крайние
    block.addEventListener('keydown', (event) => {
      const index = pairs.findIndex((pair) => pair.tab === event.target)
      if (index < 0) return

      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
      let next = null
      if (step) next = (index + step + pairs.length) % pairs.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = pairs.length - 1
      if (next === null) return

      event.preventDefault()
      activate(next, true)
    })

    // Ссылка вида ceny.html#ceny-panel-npz открывает нужное направление
    const fromHash = pairs.findIndex(({ panel }) => '#' + panel.id === window.location.hash)
    activate(fromHash >= 0 ? fromHash : 0, false)
    block.classList.add('is-tabs-ready')
  }
}
