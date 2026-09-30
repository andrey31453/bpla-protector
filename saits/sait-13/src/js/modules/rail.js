// rail — шкала разделов главной страницы («счётчик блоков» у левого края).
// Разметку, подписи и ссылки делает сборка (partials/rail.njk), поэтому модуль
// ничего не создаёт и не подменяет: он только отмечает активную секцию —
// класс is-active и aria-current. Без JS шкала остаётся обычной навигацией
// по якорям, просто без подсветки.

// Задержка троттлинга обновления: около пяти кадров — подсветка не отстаёт
// заметно, но слушатель скролла не считает позиции на каждое событие.
const RAIL_STEP = 80

export function initRail() {
	const rail = document.querySelector('[data-rail]')
	if (!rail) return

	const links = Array.from(rail.querySelectorAll('[data-rail-target]'))
	if (links.length < 2) return

	// Секции берём по id из данных. Если хотя бы одной нет в разметке —
	// модуль молчит целиком: подсветка «съехавших» точек хуже, чем её отсутствие.
	const targets = links.map((link) =>
		document.getElementById(link.dataset.railTarget || '')
	)
	if (targets.some((el) => !el)) return

	let tops = []
	let active = -1

	// Шапка липкая, её высота разная на разных ширинах (замер: 102px при 1440,
	// 70px при 768). Шкала прижата к левой кромке окна, а её полоса начинается
	// под шапкой (CSS: padding-top: var(--rail-top)), поэтому высоту передаём из
	// замера — тогда при коротком окне верхние точки не уезжают под шапку.
	// Без JS остаётся значение по умолчанию из style.css.
	const header = document.querySelector('.site-header')
	const setTop = () => {
		if (!header) return
		const height = Math.round(header.getBoundingClientRect().height)
		if (height > 0) rail.style.setProperty('--rail-top', `${height}px`)
	}

	const measure = () => {
		setTop()
		tops = targets.map((el) => el.getBoundingClientRect().top + window.scrollY)
	}

	const mark = (index) => {
		if (index === active) return
		active = index
		links.forEach((link, i) => {
			const on = i === index
			link.classList.toggle('is-active', on)
			if (on) link.setAttribute('aria-current', 'true')
			else link.removeAttribute('aria-current')
		})
	}

	const update = () => {
		const y = window.scrollY
		const vh = window.innerHeight || 1
		const height = Math.max(document.documentElement.scrollHeight, y + vh)

		// Начало и низ страницы — крайние точки шкалы: при скролле 0 активна
		// первая секция, у нижней кромки — последняя. Иначе до последней
		// секции подсветку было бы нечем докрутить: она может быть короче экрана.
		if (y <= 1) {
			mark(0)
			return
		}
		if (y + vh >= height - 1) {
			mark(links.length - 1)
			return
		}

		// Дальше активна секция, которая проходит линию обзора на трети экрана:
		// читатель смотрит на неё, тогда как граница на верхней кромке уже
		// сменилась (плюс якорные переходы досчитывают scroll-margin-top).
		const line = y + vh * 0.34
		let index = 0
		for (let i = 0; i < tops.length; i += 1) {
			if (tops[i] <= line) index = i
		}
		mark(index)
	}

	// Троттлинг таймером, а не requestAnimationFrame: rAF в фоновой вкладке
	// останавливается, и после возврата к странице подсветка показывала бы
	// прошлое место. События скролла приходят раз в кадр, поэтому задержка RAIL_STEP
	// незаметна, зато подсветка всегда описывает текущее положение.
	let timer = 0
	const schedule = () => {
		if (timer) return
		timer = window.setTimeout(() => {
			timer = 0
			update()
		}, RAIL_STEP)
	}

	const remeasure = () => {
		measure()
		update()
	}

	measure()
	update()
	window.addEventListener('scroll', schedule, { passive: true })
	// Пересчёт при смене ширины и после загрузки картинок: секции меняют высоту,
	// а вместе с ними съезжают позиции остальных.
	window.addEventListener('resize', remeasure)
	window.addEventListener('load', remeasure)
}
