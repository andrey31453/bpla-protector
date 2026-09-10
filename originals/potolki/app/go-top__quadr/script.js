{
	const trackScroll = () => {
		const scrolled = window.pageYOffset

		if (scrolled > 600) {
			goTopBtn.classList.add('__active')
		}
		if (scrolled < 600) {
			goTopBtn.classList.remove('__active')
		}
	}

	const backToTop = () => {
		if (window.pageYOffset > 0) {
			window.scrollBy(0, -80)
			setTimeout(backToTop, 12)
		}
	}

	const goTopBtn = document.getElementsByClassName('go-top__quadr')[0]

	window.addEventListener('scroll', trackScroll)
	goTopBtn.addEventListener('click', backToTop)
}
