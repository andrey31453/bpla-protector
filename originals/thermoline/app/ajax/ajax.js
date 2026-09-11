// ссылка на элемент <main> — используется в x-init шапки и в классе Ajax
// (в исходной WordPress-теме main объявлялась на сервере; для локального просмотра
// берём элемент из DOM — он уже есть в разметке к моменту выполнения defer-скрипта)
const main = document.querySelector('main')

class Ajax {
	constructor(main, data) {
		// params
		this.timer = 800 // общее время анимации перезагруки страницы
		this.anim_time = 200 // время анимации включения подложки
		this.loading_class = '--loading' // класс анимации перезагрузки страницы

		// main
		this.main = main
		this.main_name = location.pathname

		// links
		this.new_main_name
		this.links = document.getElementsByClassName('js__ajax-link')

		// history
		this.history_click = false

		// title
		this.title_dom = document.querySelector('title')
		this.data = data

		// init
		this.init_main()
	}

	//
	// main
	//

	async init_main() {
		this.new_main_name = this.get_file_name(location.pathname)

		this.change_main()
		this.add_change_page_listeners()
		this.add_history_event()
	}

	async load_main(name) {
		return await fetch(
			`/wp-content/themes/twentytwentyone/mains/${name}.html`
		).then((response) => response.text())
	}

	add_load_window() {
		this.main.classList.add(this.loading_class)
	}
	remove_load_window() {
		this.main.classList.remove(this.loading_class)
	}

	fixed_main() {
		this.main.style.height = `${this.main.clientHeight}px`
	}
	unfixed_main() {
		this.main.style.height = ''
	}

	async change_main() {
		this.main.innerHTML = await this.load_main(this.new_main_name)
		this.main_name = this.new_main_name
		document.documentElement.dataset.pageName = this.main_name
		this.rewrite_title()
		return
	}

	async timeout(time) {
		return await new Promise((resolve) => setTimeout(resolve, time))
	}

	async reload_main() {
		// start
		this.add_load_window()
		this.fixed_main()
		await this.timeout(this.anim_time)

		// load
		await this.change_main()
		if (!this.history_click) this.add_history()
		else this.history_click = false

		// close
		await this.timeout(this.timer)
		this.unfixed_main()
		this.remove_load_window()
	}

	//
	// links
	//

	get_file_name(name) {
		for (const key in this.data) {
			if (this.data[key].pathname == name) {
				return key
			}
		}
	}

	is_new_page() {
		if (this.new_main_name === this.main_name) return false
		return true
	}

	reload_if_correct(pathname) {
		this.new_main_name = this.get_file_name(pathname)
		if (this.is_new_page()) {
			this.reload_main()
		}
	}

	link_treatment(link) {
		event.preventDefault()
		this.reload_if_correct(link.getAttribute('href'))
	}

	add_change_page_listeners() {
		;[...this.links].forEach((link) => {
			link.addEventListener('click', () => {
				this.link_treatment(link)
			})
		})
	}

	//
	// history
	//

	add_history() {
		window.history.pushState(
			{},
			'',
			this.data[this.main_name].pathname
		)
	}

	add_history_event() {
		window.addEventListener('popstate', () => {
			this.history_click = true
			this.reload_if_correct(location.pathname)
		})
	}

	// title
	rewrite_title() {
		this.title_dom.textContent = this.data[this.main_name].tytle
	}
}
