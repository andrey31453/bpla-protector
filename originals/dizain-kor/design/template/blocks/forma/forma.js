// forma
// модульные формы
let frm__modal = document.getElementsByClassName('frm__modal')
let frm__externalButton = document.getElementsByClassName(
	'frm__external-button'
)

// блокировка скролла
const disableScroll = () => {
	const widthScroll = window.innerWidth - document.body.offsetWidth
	document.body.setAttribute('scroll-to-modal', window.scrollY)

	document.body.style.cssText = `
		position: fixed;
		top: -${document.body.getAttribute('scroll-to-modal')}px;
		left: 0;
		right: 0;
		
		width: calc(100% - ${widthScroll}px);
		height: 100vh;
		overflow = 'hidden';
	`
}
const enableScroll = () => {
	document.body.style.cssText = ''
	window.scroll({
		top: `${document.body.getAttribute('scroll-to-modal')}`,
	})
}

// event на открытие модульной формы
const addTimeoutForListener = () => {
	for (let i = 0; i < frm__externalButton.length; i++) {
		frm__externalButton[i].addEventListener('click', () => {
			frm__modal[0].classList.add('__active')
			disableScroll()
		})
	}
}
addTimeoutForListener()

// event на закрытие модульной формы
frm__modal[0].addEventListener('click', (event) => {
	if (event.target.getAttribute('data-close') == 'true') {
		frm__modal[0].classList.remove('__active')
		enableScroll()
	}
})
window.addEventListener('keydown', (event) => {
	if (event.key == 'Escape')
		frm__modal[0].classList.remove('__active')
})

// проверка на обязательные поля
let frm__formExternal = document.getElementsByClassName(
	'frm__form__external'
)

frm__formExternal[0].onsubmit = () => {
	let dostup
	let fbRequired = frm__formExternal[0].querySelectorAll(
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
let antirobotExternal = document.createElement('input')
antirobotExternal.type = 'hidden'
antirobotExternal.name = 'antirobotpro'
antirobotExternal.value = 'gdfg56FG423er'
frm__formExternal[0].appendChild(antirobotExternal)
