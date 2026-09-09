{
	const menu = document.getElementsByClassName('js__menu')[0]
	if (menu != undefined) {
		// scrolled treatment
		const window_scrolled = () => {
			if (window.pageYOffset > 10) {
				menu.classList.add('--scrolled')
			} else {
				menu.classList.remove('--scrolled')
			}
		}
		window_scrolled()

		if (location.pathname == '/')
			window.addEventListener('scroll', window_scrolled)
		else menu.classList.add('--scrolled')

		// m-menu treatment
		const btn = document.getElementsByClassName('js__m-btn')[0]
		const links = document.getElementsByClassName('js__m-link')
		let menu_status = false

		const m_menu_status_change = () => {
			menu.classList.toggle('--active')
			menu.classList.toggle('--scrolled-temporary')
			!menu_status ? disable_scroll() : enable_scroll()
			menu_status = !menu_status
		}

		;[...links].forEach((link) =>
			link.addEventListener('click', m_menu_status_change)
		)
		btn.addEventListener('click', m_menu_status_change)
	}
}
