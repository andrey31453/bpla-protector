const rc = () => {
	// reviews--carousel--black
	const rc = document.getElementsByClassName('reviews__carousel')
	const item = rc[0].getElementsByClassName('rc__item')
	const itemContainer = rc[0].getElementsByClassName(
		'rc__item-container'
	)
	const indicator = rc[0].getElementsByClassName('rc__indicator')
	const prev = rc[0].getElementsByClassName('__prev')
	const next = rc[0].getElementsByClassName('__next')
	let xActive
	let xRight
	let xLeft

	// задание высоты контент иннера
	const itemContainerHeightChange = () => {
		let maxHeight = 0
		for (let i = 0; i < item.length; i++) {
			if (item[i].clientHeight > maxHeight)
				maxHeight = item[i].clientHeight
		}
		itemContainer[0].style.height = `calc(${maxHeight}px - 1rem)`
	}
	window.addEventListener(`load`, itemContainerHeightChange)

	// евент на изменение масштаба
	window.addEventListener(`resize`, itemContainerHeightChange)

	// функции удаления и добавления классов
	const removeAll = () => {
		item[xActive].classList.remove('__active')
		indicator[xActive].classList.remove('__active')
		item[xLeft].classList.remove('__left-item')
		indicator[xLeft].setAttribute('data-left-indicator', false)
		indicator[xRight].setAttribute('data-right-indicator', false)
	}
	const addActive = (i) => {
		item[i].classList.add('__active')
		indicator[i].classList.add('__active')
		xActive = i
		searchXLeft(xActive)
		searchXRight(xActive)
	}
	const adLeft = (i) => {
		item[i].classList.add('__left-item')
		indicator[i].setAttribute('data-left-indicator', true)
	}
	const removeLeft = (i) => {
		item[i].classList.remove('__left-item')
		indicator[i].setAttribute('data-left-indicator', false)
	}
	const adRight = (i) => {
		indicator[i].setAttribute('data-right-indicator', true)
	}
	const removeRight = (i) => {
		indicator[i].setAttribute('data-right-indicator', false)
	}

	// функции задания x-left
	const searchXLeft = (i) => {
		if (i == 0) {
			xLeft = item.length - 1
		} else {
			xLeft = i - 1
		}
		adLeft(xLeft)
	}
	const searchXRight = (i) => {
		if (i == item.length - 1) {
			xRight = 0
		} else {
			xRight = i + 1
		}
		adRight(xRight)
	}

	// поиск начальных __active x-left
	for (let i = 0; i < item.length; i++) {
		if (item[i].classList.contains('__active')) {
			xActive = i
		}
	}
	searchXLeft(xActive)
	searchXRight(xActive)

	// любой слайд
	const changeSlaid = () => {
		if (!event.target.classList.contains('__active')) {
			if (
				event.target.getAttribute('data-left-indicator') == 'true'
			) {
				prevSlaid()
			} else if (
				event.target.getAttribute('data-right-indicator') == 'true'
			) {
				nextSlaid()
			} else {
				removeAll()
				adLeft(xActive)
				let n = xActive
				setTimeout(() => {
					removeLeft(n)
				}, 300)
				for (let i = 0; i < indicator.length; i++) {
					if (indicator[i] == event.target) addActive(i)
				}
			}
		}
	}

	// предыдущии слайд
	const prevSlaid = () => {
		removeAll()
		addActive(xLeft)
	}

	// следующии слайд
	const nextSlaid = () => {
		removeAll()
		addActive(xRight)
	}

	// events
	for (let i = 0; i < indicator.length; i++) {
		indicator[i].addEventListener('click', changeSlaid)
	}
	prev[0].addEventListener('click', prevSlaid)
	next[0].addEventListener('click', nextSlaid)
}
rc()
