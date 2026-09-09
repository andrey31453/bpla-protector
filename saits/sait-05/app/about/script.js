{
	const about = document.getElementsByClassName('js__about')[0]
	if (about != undefined) {
		// DOM-s
		const open_more_text_link = about.getElementsByClassName(
			'js__open-more-text-link'
		)
		const close_more_text_link = about.getElementsByClassName(
			'js__close-more-text-link'
		)
		const more_text_cont = about.getElementsByClassName(
			'js__more-text-cont'
		)
		const more_text = about.getElementsByClassName('js__more-text')

		// functions
		const open_text = (i) => {
			open_more_text_link[i].classList.add('__more-text--active')
			more_text_cont[i].classList.add('__more-text--active')
			// prettier-ignore
			more_text_cont[i].style.height = `${more_text[i].clientHeight}px`
		}
		const close_text = (i) => {
			open_more_text_link[i].classList.remove('__more-text--active')
			more_text_cont[i].classList.remove('__more-text--active')
			more_text_cont[i].style.height = `0`
		}

		// listener
		for (let i = 0; i < open_more_text_link.length; i++) {
			open_more_text_link[i].addEventListener('click', () => {
				open_text(i)
			})
		}
		for (let i = 0; i < close_more_text_link.length; i++) {
			close_more_text_link[i].addEventListener('click', () => {
				close_text(i)
			})
		}
	}
}
