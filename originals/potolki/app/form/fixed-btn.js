{
	const fixed_btn = document.getElementsByClassName('__fixed-btn')[0]
	if (fixed_btn) {
		const track_scroll = () => {
			const scrolled = window.pageYOffset

			if (scrolled > 600) {
				fixed_btn.classList.add('__active')
			}
			if (scrolled < 600) {
				fixed_btn.classList.remove('__active')
			}
		}

		window.addEventListener('scroll', track_scroll)
	}
}
