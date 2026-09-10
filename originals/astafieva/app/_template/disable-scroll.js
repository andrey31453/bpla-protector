// блокировка скролла
const disable_scroll = () => {
	const menu = document.getElementsByClassName('js__menu')[0]

	let width_scroll
	if (window.innerWidth > 976)
		width_scroll = window.innerWidth - document.body.offsetWidth
	else width_scroll = window.innerWidth - window.offsetWidth
	document.body.dataset.scrollToModal = window.scrollY

	document.body.style.cssText = `
		position: fixed;
		top: -${document.body.dataset.scrollToModal}px;
		left: 0;
		right: 0;
		
		width: calc(100% - ${width_scroll}px);
		height: 100vh;
		overflow = 'hidden';
	`
	menu.style.right = `${width_scroll + 1}px`
	menu.classList.add('--scrolled-temporary')
}
const enable_scroll = () => {
	document.body.removeAttribute('style')
	document
		.getElementsByClassName('js__menu')[0]
		.removeAttribute('style')
	window.scroll({
		top: `${document.body.dataset.scrollToModal}`,
	})
}
