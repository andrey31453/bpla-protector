{
	const arhives = document.getElementById('menu-item-144')
	if (arhives) {
		const links = document.querySelectorAll(
			'#menu-item-144 > .sub-menu > li > a'
		)
		const link_container = document.querySelectorAll(
			'#menu-item-144 > .sub-menu > li'
		)

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
	}
}
