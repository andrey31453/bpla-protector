{
	//
	// модульные формы
	//

	const fmc = document.getElementsByClassName('js__fmc')[0]

	if (fmc) {
		const form = fmc.getElementsByClassName('js__fmc__form')[0]
		const cfb = document.getElementsByClassName('js__cfb')[0]

		const btn_call_form = document.getElementsByClassName('js__btn-call-form')
		const type_btn = fmc.getElementsByClassName('js__type-btn')
		const type_error = document.getElementsByClassName('js__type-error')[0]
		let dostup_type = false

		// event на открытие модульной формы
		const addTimeoutForListener = () => {
			for (let i = 0; i < btn_call_form.length; i++) {
				btn_call_form[i].addEventListener('click', () => {
					fmc.classList.add('--active')
					disable_scroll()
					cfb.style = 'display: none'
				})
			}
		}
		addTimeoutForListener()

		// event на закрытие модульной формы
		fmc.addEventListener('click', (event) => {
			if (event.target.getAttribute('data-close') == 'true') {
				fmc.classList.remove('--active')
				enable_scroll()
				cfb.style = ''
			}
		})
		window.addEventListener('keydown', (event) => {
			if (event.key == 'Escape') fmc.classList.remove('--active')
		})

		form.onsubmit = () => {
			if (!dostup_type) {
				type_error.textContent = 'Нужно выбрать тип лица'
				event.preventDefault()
			} else {
				type_error.textContent = ''

				const fbRequired = form.querySelectorAll('[data-required="true"]')
				let dostup_phone = true
				for (let i = 0; i < fbRequired.length; i++) {
					if (fbRequired[i].value.length == 0) {
						fbRequired[i].setAttribute(
							'placeholder',
							'Впишите, пожалуйста, свой номер телефона'
						)
						dostup_phone = false
					}
				}
				if (!dostup_phone) {
					event.preventDefault()
					console.log('ffff')
				}
			}
		}

		// антибот
		const antirobot = document.createElement('input')
		antirobot.type = 'hidden'
		antirobot.name = 'antirobotpro'
		antirobot.value = 'gdfg56FG423er'
		form.appendChild(antirobot)

		//
		// change btn-type
		//
		// dom-s

		// function
		const change_btn_type = (n) => {
			for (let i = 0; i < type_btn.length; i++) {
				if (i == n) {
					type_btn[i].classList.add('--active')
					dostup_type = true
				} else {
					type_btn[i].classList.remove('--active')
				}
			}
		}

		// listener
		for (let i = 0; i < type_btn.length; i++) {
			type_btn[i].addEventListener('click', () => {
				change_btn_type(i)
			})
		}
	}
}
