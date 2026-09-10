{
	let mlflm = document.getElementsByClassName(
		'menu__left__fixed__list-moving'
	)[0]
	if (mlflm) {
		//
		// кнопка меню
		//
		const btn = mlflm.getElementsByClassName('__btn')[0]

		// эвент на закрытие меню
		const menu_open_listener = () => {
			if (event.target.dataset.close) close_menu()
			else if (event.key == 'Escape') close_menu()
			else if (event.target.classList.contains('__btn-call-form')) close_menu()
		}

		// открытие и закрытие меню
		const open_menu = () => {
			disable_scroll()

			window.addEventListener('click', menu_open_listener)
			window.addEventListener('keydown', menu_open_listener)

			btn.removeEventListener('click', open_menu)
			btn.addEventListener('click', close_menu)
			mlflm.classList.add('__active')
		}
		const close_menu = () => {
			enable_scroll()

			window.removeEventListener('click', menu_open_listener)
			window.removeEventListener('keydown', menu_open_listener)

			btn.removeEventListener('click', close_menu)
			btn.addEventListener('click', open_menu)
			mlflm.classList.remove('__active')
		}

		// эвент на кнопку
		btn.addEventListener('click', open_menu)

		//
		// движение иконки меню
		//
		const move_speed = 0.1 // задержка смещения иконки
		let mouse_y_pos

		// корректировка позиции иконки
		const correct_pos = (pos) => {
			if (pos < 35) return `10px`
			if (pos > document.documentElement.clientHeight - 60)
				return `${document.documentElement.clientHeight - 60}px`

			return `${pos - 25}px`
		}

		// корректировка dataset.y_pos
		const correct_dataset_y_pos = () => {
			if (btn.dataset.y_pos == 'NaN') btn.dataset.y_pos = 0
		}

		// вычисление новой позиции иконки меню
		const get_new_icon_y_pos = () => {
			return (
				Math.round(btn.dataset.y_pos) +
				Math.round((mouse_y_pos - btn.dataset.y_pos) * move_speed)
			)
		}

		// запись в иконку части смены положения мыши
		const set_menu_pos = () => {
			correct_dataset_y_pos()
			const new_icon_y_pos = get_new_icon_y_pos()

			btn.dataset.y_pos = `${new_icon_y_pos}`
			btn.style.top = correct_pos(new_icon_y_pos)

			window.requestAnimationFrame(set_menu_pos)
		}

		window.requestAnimationFrame(set_menu_pos)

		// вычисление положения мыши
		const get_mouse_pos = () => {
			mouse_y_pos = event.clientY
		}
		window.addEventListener('mousemove', get_mouse_pos)

		//
		// open sub-menu
		//
		const target_for_inner_menu = mlflm.getElementsByClassName(
			'mlflm__target-for-inner-menu'
		)

		const change_sub_menu_status = (elem) => {
			elem.classList.toggle('--active')
		}

		;[...target_for_inner_menu].forEach((elem) =>
			elem.addEventListener('click', () => change_sub_menu_status(elem))
		)
	}
}
