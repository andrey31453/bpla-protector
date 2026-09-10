// Progress Bar
{
	const progress_bar =
		document.getElementsByClassName('progress-bar')[0]
	if (progress_bar != undefined) {
		const set_progress_bar = () => {
			const y_max =
				document.documentElement.scrollHeight -
				document.documentElement.clientHeight
			const y_current = window.scrollY

			progress_bar.style.width = `${(100 * y_current) / y_max}%`
		}
		window.addEventListener('scroll', set_progress_bar)
	}
}
