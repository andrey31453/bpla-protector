// catalog__vertikal-carousel
{
	const cvc = document.getElementsByClassName(
		'catalog__vertikal-carousel'
	)[0]
	const link = cvc.getElementsByClassName('cvc__link')
	const left = cvc.getElementsByClassName('cvc__left')[0]

	// вертикальная карусель для десктопов
	const desktopVersion = () => {
		const right = cvc.getElementsByClassName('cvc__right')[0]
		const item = cvc.getElementsByClassName('cvc__item')

		const marginBetweenItem = 75 // расстояние между блоками px
		const activeItemTopMargin = 10 // отступ активного элемента (в процентах)
		const notActiveItemOpacity = 0.2 // прозрачность не активных элементов

		// смена __active в галлерее
		let iActive = 0
		if (location.href.includes('#kompaniya')) iActive = 1
		if (location.href.includes('#ugrozy')) iActive = 2
		if (location.href.includes('#podlet')) iActive = 3
		if (location.href.includes('#ivp')) iActive = 4
		if (location.href.includes('#raschet')) iActive = 5
		if (location.href.includes('#dannye')) iActive = 6
		if (location.href.includes('#raboty')) iActive = 7
		if (location.href.includes('#nadezhnost')) iActive = 8
		if (location.href.includes('#kontakty')) iActive = 9

		// измерение высоты блоков итем
		let itemHeight = []
		const getItemHeight = () => {
			for (let i = 0; i < item.length; i++) {
				itemHeight[i] = item[i].clientHeight
			}
			setTopAttribute(iActive)
		}
		// эвент на изменение размера блоков
		window.addEventListener('resize', getItemHeight)

		// прописывание активного итема (__active)
		const setActiveAttribute = (iActive) => {
			for (let i = 0; i < item.length; i++) {
				if (i == iActive) {
					item[i].classList.add('__active')
					item[i].style.opacity = '1'
					link[i].classList.add('__active')
				} else {
					item[i].classList.remove('__active')
					item[i].style.opacity = notActiveItemOpacity
					link[i].classList.remove('__active')
				}
			}
		}

		// задание топ отступов
		const setTopAttribute = (iActive) => {
			let heightCounter = 0
			for (let i = iActive - 1; i > -1; i--) {
				heightCounter += itemHeight[i]
				item[i].style.top = `calc(${activeItemTopMargin}% - ${
					marginBetweenItem * (iActive - i) + heightCounter
				}px)`
			}

			if (iActive == 0) item[iActive].style.top = 0
			else item[iActive].style.top = `${activeItemTopMargin}%`

			heightCounter = 0
			for (let i = iActive + 1; i < item.length; i++) {
				heightCounter += itemHeight[i - 1]
				item[i].style.top = `calc(${activeItemTopMargin}% + ${
					marginBetweenItem * (i - iActive) + heightCounter
				}px)`
			}
		}

		// эвенты на смену активов в галлерее
		const modalForm = document.getElementsByClassName('frm__modal')[0]
		window.addEventListener('wheel', () => {
			//проверка на то что запущена модальная форма
			if (modalForm.className.includes('__active')) return
			// проверка на то что мы находимся на яндекс.карте
			if (event.target.closest('ymaps')) return

			if (event.wheelDelta > 0 && iActive > 0) iActive--
			else if (event.wheelDelta < 0 && iActive < item.length - 1)
				iActive++
			else return

			setActiveAttribute(iActive)
			setTopAttribute(iActive)
		})
		window.addEventListener('keydown', () => {
			//проверка на то что запущена модальная форма
			if (modalForm.className.includes('__active')) return

			if (event.key == 'ArrowUp' && iActive > 0) iActive--
			else if (event.key == 'ArrowDown' && iActive < item.length - 1)
				iActive++
			else return

			setActiveAttribute(iActive)
			setTopAttribute(iActive)
		})

		// эвенты на кнопки левого псевдо-меню
		for (let i = 0; i < link.length; i++) {
			link[i].addEventListener('click', () => {
				event.preventDefault()
				iActive = i
				setActiveAttribute(iActive)
				setTopAttribute(iActive)
			})
		}

		// создание искусственного container
		const containerImitation = () => {
			if (document.body.offsetWidth > 1140) {
				const leftBodyMargin = (document.body.offsetWidth - 1140) / 2
				cvc.style.marginLeft = `${leftBodyMargin}px`
				cvc.dataset.cont = true
			}
		}
		containerImitation()
		window.addEventListener('resize', containerImitation)

		// эвент на прогрузку окна
		window.addEventListener('load', () => {
			getItemHeight()
			setActiveAttribute(iActive)
			right.classList.remove('__preload')
		})
	}

	// мобильное меню
	const mobileVersion = () => {
		const mobileBtn = cvc.getElementsByClassName(
			'cvc__left__mobile-menu-btn'
		)[0]

		//
		const mMenuListener = () => {
			if (
				(event.target.closest('.cvc__link-container') == null &&
					event.target != mobileBtn) ||
				event.target.className.includes('cvc__link')
			)
				closeMobileMenu()
		}

		// открытие меню
		const openMobileMenu = () => {
			left.classList.add('__active')
			window.addEventListener('click', mMenuListener)
			disableScroll()
		}

		// закрытие меню
		const closeMobileMenu = () => {
			left.classList.remove('__active')
			window.removeEventListener('click', mMenuListener)
			enableScroll()
		}

		// определение открыто ли м-меню
		const getMobileMenuStatus = () => {
			if (left.className.includes('__active')) {
				closeMobileMenu()
			} else {
				openMobileMenu()
			}
		}

		// эвент на кнопку мобильного меню
		mobileBtn.addEventListener('click', getMobileMenuStatus)
	}

	// опознование мобильной и десктопных версий
	if (document.body.offsetWidth > 800) desktopVersion()
	else mobileVersion()
}
