{
	const tabs = document.getElementsByClassName('__tabs')[0]
	if (tabs) {
		const tabs_link = tabs.getElementsByClassName('__link')
		const tabs_item = tabs.getElementsByClassName('__content-item')

		const change_active_tab_item = () => {
			for (let i = 0; i < tabs_link.length; i++) {
				if (
					event.target == tabs_link[i] &&
					event.target.classList.contains('__light')
				) {
					tabs_link[i].classList.add('tabs__active')
					tabs_item[i].classList.add('tabs__active')
					tabs.classList.add('__light')
					tabs.classList.remove('__cntrl')
				} else if (event.target == tabs_link[i]) {
					tabs_link[i].classList.add('tabs__active')
					tabs_item[i].classList.add('tabs__active')
					tabs.classList.remove('__light')
					tabs.classList.add('__cntrl')
				} else {
					tabs_link[i].classList.remove('tabs__active')
					tabs_item[i].classList.remove('tabs__active')
				}
			}
		}

		for (let i = 0; i < tabs_link.length; i++) {
			tabs_link[i].addEventListener('click', change_active_tab_item)
		}
	}
}
