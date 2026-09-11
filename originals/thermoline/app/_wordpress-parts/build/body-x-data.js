{
	window.addEventListener('alpine:init', () => {
		Alpine.data('body', () => ({
			body_data: {},
			submenu_open: false,
		}))
	})
}
