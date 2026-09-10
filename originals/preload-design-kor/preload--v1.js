// preload--v1
{
	const preload = document.getElementsByClassName('preload--v1')
	const slaidText = document.getElementsByClassName('pv1__slaid-text')
	const animationSpeed = 800
	let i = 0


	const closePreload = () => {
		preload[0].classList.remove('--active')
		window.removeEventListener('click', closePreload)
		window.removeEventListener('keydown', closePreload)
	}


	const removeActive = () => {
		slaidText[i].classList.remove('--active')
		i++
		if (i < slaidText.length) {
			addActive()
		} else {
			closePreload()
		}
	}


	const addActive = () => {
		slaidText[i].classList.add('--active')
		setTimeout(() => {removeActive()}, animationSpeed)
	}
	setTimeout(() => {addActive()}, animationSpeed / 2)


	window.addEventListener('click', closePreload)
	window.addEventListener('keydown', closePreload)
}