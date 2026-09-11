{
	window.addEventListener('alpine:init', () => {
		Alpine.data('menu', () => ({
			// submenu_disable_scroll
			submenu_disable_scroll() {
				document.body.dataset.scrollToModal = window.scrollY

				document.body.style.cssText = `
					position: fixed;
					// top: -${document.body.dataset.scrollToModal}px;
					height: 100vh;
					overflow: 'hidden';
				`
			},

			// submenu_enable_scroll
			submenu_enable_scroll() {
				document.body.removeAttribute('style')
			},

			// change_submenu_enable_scroll
			change_submenu_enable_scroll(submenu_open) {
				if (submenu_open) this.submenu_disable_scroll()
				else this.submenu_enable_scroll()
			},

			// change_submenu_top_position
			change_submenu_top_position(submenu_open) {
				if (submenu_open) {
				}
			},
		}))
	})
}
