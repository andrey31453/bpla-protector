{
	//
	// модульные формы
	//

	const fmc = document.getElementsByClassName('js__fmc')[0]

	if (fmc != undefined) {
		const form = fmc.getElementsByClassName('js__fmc__form')[0]
		const btn_call_form = document.getElementsByClassName(
			'js__btn-call-form'
		)

		// event на открытие модульной формы
		const addTimeoutForListener = () => {
			for (let i = 0; i < btn_call_form.length; i++) {
				btn_call_form[i].addEventListener('click', () => {
					fmc.classList.add('--active')
					disable_scroll()
				})
			}
		}
		addTimeoutForListener()

		// event на закрытие модульной формы
		fmc.addEventListener('click', (event) => {
			if (event.target.getAttribute('data-close') == 'true') {
				fmc.classList.remove('--active')
				enable_scroll()
			}
		})
		window.addEventListener('keydown', (event) => {
			if (event.key == 'Escape') fmc.classList.remove('--active')
		})

		form.onsubmit = () => {
			let dostup
			const fbRequired = form.querySelectorAll(
				'[data-required="true"]'
			)

			for (let i = 0; i < fbRequired.length; i++) {
				if (fbRequired[i].value.length == 0) {
					fbRequired[i].classList.add('__error')
					fbRequired[i].setAttribute(
						'placeholder',
						'Впишите, пожалуйста, свой номер телефона'
					)
					dostup = 'off'
				}
			}

			if (dostup == 'off') {
				event.preventDefault()
			}
		}

		// антибот
		const antirobot = document.createElement('input')
		antirobot.type = 'hidden'
		antirobot.name = 'antirobotpro'
		antirobot.value = 'gdfg56FG423er'
		form.appendChild(antirobot)
	}
}
