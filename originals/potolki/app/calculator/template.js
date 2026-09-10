{
	const calculator = document.getElementsByClassName('__calculator')[0]

	if (calculator) {
		//
		// обработка кликов по форме
		//
		const type = calculator.getElementsByClassName('__type')
		const type_manuf = calculator.getElementsByClassName('__type__manuf')
		const type_faktura = calculator.getElementsByClassName('__type__faktura')

		const change_calc_type = (item) => {
			calculator.classList.remove('__pvh-status')
			calculator.classList.remove('__tkan-status')
			calculator.classList.add(`${item.dataset.calcType}`)
			// console.log('item.dataset.calcType: ', item)
		}

		const change_active = (items) => {
			;[...items].forEach((elem) => {
				if (elem == event.target) {
					elem.classList.add('__active')
					elem.closest('.с__user-data__param').classList.add('__active')
				} else {
					elem.classList.remove('__active')
					elem.closest('.с__user-data__param').classList.remove('__active')
				}
			})
		}

		;[...type].forEach((item) =>
			item.addEventListener('click', () => {
				change_active(type)
				change_calc_type(item)
			})
		)
		;[...type_manuf].forEach((item) =>
			item.addEventListener('click', () => change_active(type_manuf))
		)
		;[...type_faktura].forEach((item) =>
			item.addEventListener('click', () => change_active(type_faktura))
		)

		//
		// обрабокта отправки формы
		//
		const form_internal =
			calculator.getElementsByClassName('__form__internal')[0]
		if (form_internal) {
			// проверка на обязательные поля
			form_internal.addEventListener('submit', () => {
				let dostup
				const required = form_internal.querySelectorAll(
					'[data-required="true"]'
				)

				for (let i = 0; i < required.length; i++) {
					if (required[i].value.length == 0) {
						required[i].classList.add('__error')
						required[i].setAttribute(
							'placeholder',
							'Впишите, пожалуйста, свой номер телефона'
						)
						dostup = 'off'
					}
				}

				if (dostup == 'off') {
					event.preventDefault()
				}
			})

			// антибот
			const antirobot_internal = document.createElement('input')
			antirobot_internal.type = 'hidden'
			antirobot_internal.name = 'antirobotpro'
			antirobot_internal.value = 'gdfg56FG423er'
			form_internal.appendChild(antirobot_internal)
		}
	}
}
