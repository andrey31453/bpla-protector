{
	const video = document.getElementsByClassName('js__video')
	if (video != undefined) {
		;[...video].forEach((elem) => {
			elem.style.height = `${(315 * elem.clientWidth) / 560}px`
		})
	}
}
