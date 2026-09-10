{
	const ml = document.getElementsByClassName('js__ml')[0]
	if (ml) {
		const open_btn = ml.getElementsByClassName('js__open-btn')[0]
		const close_btn = ml.getElementsByClassName('js__close-btn')[0]

		const check_click_pos = () => {
			if (event.target.dataset.close) close_modal()
		}

		const open_modal = () => {
			ml.classList.add('--active')
			disable_scroll()
			window.addEventListener('click', check_click_pos)
		}
		const close_modal = () => {
			ml.classList.remove('--active')
			enable_scroll()
			window.removeEventListener('click', check_click_pos)
		}

		open_btn.addEventListener('click', open_modal)
		close_btn.addEventListener('click', close_modal)
	}
}
