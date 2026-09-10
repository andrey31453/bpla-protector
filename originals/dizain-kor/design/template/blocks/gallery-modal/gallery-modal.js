// gallery-modal
{
	const imgList = document.getElementsByClassName('__gm-img')
	const modal = document.getElementsByClassName('gallery-modal')[0]
	const imgModal = modal.getElementsByClassName('gm__img')[0]
	const prev = modal.getElementsByClassName('__prev')[0]
	const next = modal.getElementsByClassName('__next')[0]
	const name = modal.getElementsByClassName('gm__info-name')[0]
	const counter = modal.getElementsByClassName('gm__info-counter')[0]

	let iActive

	// анимация смены слайда
	const slaidChangeAnimation = (tag) => {
		tag.classList.add('__slaid-change')
		setTimeout(() => {
			tag.classList.remove('__slaid-change')
		}, 450)
	}

	// предыдущий слайд
	const prevSlaid = () => {
		if (iActive > 0) iActive--
		else iActive = imgList.length - 1
		slaidChangeAnimation(prev)
		openSlaid(iActive)
	}
	// следующий слайд
	const nextSlaid = () => {
		if (iActive < imgList.length - 1) iActive++
		else iActive = 0
		slaidChangeAnimation(next)
		openSlaid(iActive)
	}
	// открытие i слайда
	const openSlaid = (i) => {
		imgModal.setAttribute(
			'src',
			`${imgList[i].getAttribute('data-full-src')}`
		)
		name.innerHTML = imgList[i].dataset.name
		counter.innerHTML = `${i + 1}&nbsp;/&nbsp;${imgList.length}`
	}
	// закрытие слайда
	const closeSlaid = () => {
		setTimeout(() => {
			imgModal.setAttribute(
				'src',
				`/design/template/blocks/gallery-modal/images/null.png`
			)
			name.innerHTML = ``
			counter.innerHTML = ``
		}, 300)
	}

	// подключение и отключение слушателей
	const addListeners = () => {
		window.addEventListener('click', modalClickListener)
		window.addEventListener('keydown', modalKeydownListener)
	}
	const removeListeners = () => {
		window.removeEventListener('click', modalClickListener)
		window.removeEventListener('keydown', modalKeydownListener)
	}

	// слушатели на время работы слайдера
	const modalClickListener = () => {
		if (event.target.classList.contains('__prev')) prevSlaid()
		else if (event.target.classList.contains('__next')) nextSlaid()
		else if (event.target.classList.contains('__close'))
			closeModalSlaider()
		else if (event.target.dataset.closest) closeModalSlaider()
	}
	const modalKeydownListener = () => {
		if (event.key === 'ArrowLeft') prevSlaid()
		else if (event.key === 'ArrowRight') nextSlaid()
		else if (event.key === 'Escape') closeModalSlaider()
	}

	// открытие и закрытие слайдера
	const openModalSlaider = (i) => {
		iActive = i
		modal.classList.add('__active')
		openSlaid(i)
		disableScroll()
		addListeners()
	}
	const closeModalSlaider = (i) => {
		modal.classList.remove('__active')
		closeSlaid()
		enableScroll()
		removeListeners()
	}

	// эвент на открытие
	for (let i = 0; i < imgList.length; i++) {
		imgList[i].addEventListener('click', () => {
			openModalSlaider(i)
		})
	}
}
