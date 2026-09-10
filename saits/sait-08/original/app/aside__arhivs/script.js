{
	const arhives = document.getElementsByClassName('js__aside__arhivs')[0]
	if (arhives) {
		const links = arhives.querySelectorAll('#primary-menu-list > li > a')
		const link_container = arhives.querySelectorAll('#primary-menu-list > li')

		for (let i = 0; i < link_container.length; i++) {
			const link_current_text = links[i].textContent
			links[i].remove()

			link_container[i].insertAdjacentHTML(
				'afterbegin',
				`
					<span class='aa__sub-menu-target'>${link_current_text}</span>
				`
			)
		}

		// add listener for span
		const sub_menu_target = document.getElementsByClassName(
			'aa__sub-menu-target'
		)
		const sub_menu_toggle = document.querySelectorAll(
			'.aa__sub-menu-target + .sub-menu-toggle'
		)
		for (let i = 0; i < sub_menu_target.length; i++) {
			sub_menu_target[i].addEventListener('click', () => {
				twentytwentyoneExpandSubMenu(sub_menu_toggle[i])
			})
		}
	}
}
