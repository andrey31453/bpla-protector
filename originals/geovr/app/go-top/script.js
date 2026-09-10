{
	const goTopBtn = document.getElementsByClassName('go-top--quadr')[0]
	if (goTopBtn != undefined) {
		const track_scroll = () => {
			const scrolled = window.pageYOffset

			if (scrolled > 600) {
				goTopBtn.classList.add('--active')
			}
			if (scrolled < 600) {
				goTopBtn.classList.remove('--active')
			}
		}

		const back_to_top = () => {
			if (window.pageYOffset > 0) {
				window.scrollBy(0, -80)
				setTimeout(back_to_top, 10)
			}
		}

		window.addEventListener('scroll', track_scroll)
		goTopBtn.addEventListener('click', back_to_top)
	}
}
