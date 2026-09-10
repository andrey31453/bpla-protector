// team__card
const tc = () => {
	const tc = document.getElementsByClassName('team__card')

	const cardItem = tc[0].getElementsByClassName('tc__card-item')
	const cardContainer = tc[0].getElementsByClassName(
		'tc__card-container'
	)

	const indicatorList = tc[0].getElementsByClassName(
		'tc__card-indicator-list'
	)
	const button = tc[0].getElementsByClassName('tc__card-button')
	const buttonPrev = button[0]
	const buttonNext = button[1]

	// задание кол-ва элементов в ряду
	let activeNumber = 0
	let cardInRow = 1
	let marginBetweenCard = 0
	let widthCard = 100
	if (window.innerWidth > 600) {
		cardInRow = 2
		marginBetweenCard = 2
		widthCard = 49
	}

	// задание фото в виде бека
	const getFoto = () => {
		for (let i = 0; i < cardItem.length; i++) {
			const fotoName = cardItem[i].getAttribute('data-worker-name')
			cardItem[
				i
			].style.backgroundImage = `url('/design/template/blocks/team__card/images/worker/${fotoName}.jpg')`
		}
	}
	getFoto()

	// задание высоты
	const getHeight = () => {
		const cardItemHeight = (cardItem[0].clientWidth * 412) / 347
		for (let i = 0; i < cardItem.length; i++) {
			cardItem[i].style.height = `${cardItemHeight}px`
		}
		cardContainer[0].style.height = `calc(${cardItemHeight}px + 3rem)`
	}
	getHeight()
	window.addEventListener('scroll', getHeight)

	// создание card-indicator
	const creatCardIndicator = () => {
		for (let i = 0; i < cardItem.length + 1 - cardInRow; i++) {
			const indicatorElement = document.createElement('div')
			indicatorElement.classList.add('tc__card-indicator')
			indicatorList[0].appendChild(indicatorElement)
		}
	}
	creatCardIndicator()

	// подсветка активного card-indicator
	const cardIndicator = tc[0].getElementsByClassName(
		'tc__card-indicator'
	)
	const getActiveCardIndicator = (activeNumber) => {
		for (let i = 0; i < cardIndicator.length; i++) {
			if (i == activeNumber) {
				cardIndicator[i].classList.add('__active')
			} else {
				cardIndicator[i].classList.remove('__active')
			}
		}
	}
	getActiveCardIndicator(activeNumber)

	// задание отсупов слева
	const getLeft = (activeNumber) => {
		for (let i = 0; i < cardItem.length; i++) {
			const leftForCard =
				(i - activeNumber) * (widthCard + marginBetweenCard)
			cardItem[i].style.left = `calc(${leftForCard}% + 12px)`
		}
	}
	getLeft(activeNumber)

	// замедление смены кардов
	const slowLeftTransition = () => {
		for (let i = 0; i < cardItem.length; i++) {
			cardItem[i].classList.add('slowLeftTransition')
		}
		setTimeout(() => {
			for (let i = 0; i < cardItem.length; i++) {
				cardItem[i].classList.remove('slowLeftTransition')
			}
		}, 600)
	}

	// эвенты на баттоны
	buttonNext.addEventListener('click', () => {
		activeNumber++
		if (activeNumber > cardItem.length - cardInRow) {
			activeNumber = 0
			slowLeftTransition()
		}
		getLeft(activeNumber)
		getActiveCardIndicator(activeNumber)
	})
	buttonPrev.addEventListener('click', () => {
		activeNumber--
		if (activeNumber < 0) {
			activeNumber = cardItem.length - cardInRow
			slowLeftTransition()
		}
		getLeft(activeNumber)
		getActiveCardIndicator(activeNumber)
	})

	// эвенты на индикаторы
	for (let i = 0; i < cardIndicator.length; i++) {
		cardIndicator[i].addEventListener('click', () => {
			activeNumber = i
			getLeft(activeNumber)
			getActiveCardIndicator(activeNumber)
		})
	}
}
tc()
