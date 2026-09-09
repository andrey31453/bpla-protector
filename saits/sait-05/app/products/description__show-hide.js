{
	const products = document.getElementsByClassName('js__products')
	if (products[0]) {
		//
		// description show/hide treatment
		//

		// DOM-s
		const open_more_text_link = document.getElementsByClassName(
			'js__products__open-more-text-link'
		)
		const close_more_text_link = document.getElementsByClassName(
			'js__products__close-more-text-link'
		)
		const more_text_cont = document.getElementsByClassName(
			'js__products__more-text-cont'
		)
		const more_text = document.getElementsByClassName(
			'js__products__more-text'
		)
		// additional-link
		const additional_link = document.getElementsByClassName(
			'js__products__open-more-text-additional-link'
		)[0]

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
		// additional listener
		if (additional_link) {
			additional_link.addEventListener('click', () => {
				open_text(0)
			})
		}
	}
}
