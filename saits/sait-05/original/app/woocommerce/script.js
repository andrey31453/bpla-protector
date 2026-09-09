{
	const button21 = document.getElementsByClassName('button21')[0]
	if (button21) {
		button21.style.display = 'none'
	}

	if (location.pathname.match(/checkout/)) {
		const woocommerce =
			document.getElementsByClassName('woocommerce')[0]
		const form = woocommerce.getElementsByTagName('form')[0]

		woocommerce.classList.add('__skew')
		woocommerce.classList.add('--cntrl')
		woocommerce.classList.add('section')
		form.classList.add('__container')
		place_order.classList.add('__btn')
		place_order.classList.add('--no-price')

		document
			.getElementsByClassName('js__menu')[0]
			.classList.add('--scrolled-temporary')
	}
}
