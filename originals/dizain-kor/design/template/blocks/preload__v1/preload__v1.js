// preload__v1
{
	const preload = document.getElementsByClassName('preload__v1')
	const animationSpeed = 3000
	let i = 0

	const closePreload = () => {
		preload[0].classList.remove('__active')
		window.removeEventListener('click', closePreload)
		window.removeEventListener('keydown', closePreload)
	}
	const deletePreload = () => {
		preload[0].style.display = 'none'
	}

	setTimeout(closePreload, animationSpeed)
	if (document.body.offsetWidth < 800) deletePreload()

	window.addEventListener('click', closePreload)
	window.addEventListener('keydown', closePreload)
}
