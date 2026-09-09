{
	const quiz = document.getElementsByClassName('js__quiz')[0]
	if (quiz) {
		// module params
		const images_folder = 'images/quiz'
		const json_folder = 'json/quiz'
		const animation_time = 600
		const item_animation_delay = 50
		const scroll_speed = 20
		const after_scroll_top_margin = 20

		// DOM-s
		const wrapper = quiz.getElementsByClassName('js__wrapper')[0]
		const windows = quiz.getElementsByClassName('js__window')

		// sectors
		const sectors_node = quiz.getElementsByClassName('js__sectors')[0]
		const sectors_items_cont_node =
			sectors_node.getElementsByClassName('js__items-cont')[0]
		const sectors_next_btn_node =
			sectors_node.getElementsByClassName('js__next-button')[0]
		const sectors_errors_node =
			sectors_node.getElementsByClassName('js__errors')[0]
		let active_node = sectors_node

		// services
		const services_node =
			quiz.getElementsByClassName('js__services')[0]
		const services_items_cont_node =
			services_node.getElementsByClassName('js__items-cont')[0]
		const services_prev_btn_node =
			services_node.getElementsByClassName('js__prev-button')[0]
		const services_next_btn_node =
			services_node.getElementsByClassName('js__next-button')[0]
		const services_errors_node =
			services_node.getElementsByClassName('js__errors')[0]

		// rezults
		const rezults_node = quiz.getElementsByClassName('js__rezults')[0]
		const rezults_items_cont_node =
			rezults_node.getElementsByClassName('js__items-cont')[0]
		const rezults_prev_btn_node =
			rezults_node.getElementsByClassName('js__prev-button')[0]
		const rezults_next_btn_node =
			rezults_node.getElementsByClassName('js__next-button')[0]

		let summary_price

		// data
		let sectors_data
		let services_data

		// other
		const active_items = []

		//
		// functions declaration
		//

		//
		// template
		//

		// change_active_item
		const change_active_item = (elem) => {
			elem.classList.toggle('--active')
		}

		// change_active_window
		const change_active_window = (node) => {
			;[...windows].forEach((window) =>
				window.classList.remove('--active')
			)
			node.classList.add('--active')
		}

		// write_error
		const write_error = (error_node) => {
			error_node.style.opacity = 1
			setTimeout(() => {
				error_node.style.opacity = 0
			}, 3 * animation_time)
		}

		// check_active_items
		const check_active_items = (params) => {
			active_items.length = 0

			const items = params.node.getElementsByClassName('js__item')

			;[...items].forEach((item) => {
				if (item.classList.contains('--active'))
					active_items.push(item.dataset.type)
			})

			if (active_items.length !== 0) {
				change_active_window(params.open_node)
				return true
			} else {
				write_error(params.error_node)
				return false
			}
		}

		// get_items
		const get_items = (node) => {
			return node.getElementsByClassName('js__item')
		}

		// add_listeners_for_window_items
		const add_listeners_for_window_items = (w_items) => {
			// listeners
			;[...w_items].forEach((item) =>
				item.addEventListener('click', () => {
					change_active_item(item)
				})
			)
		}

		// scroll_to_quiz_top
		const scroll_to_quiz_top = () => {
			if (
				quiz.getBoundingClientRect().top >
				after_scroll_top_margin + 80
			) {
				window.scrollBy(0, 80)
				setTimeout(scroll_to_quiz_top, scroll_speed)
			} else if (
				quiz.getBoundingClientRect().top <
				after_scroll_top_margin - 80
			) {
				window.scrollBy(0, -80)
				setTimeout(scroll_to_quiz_top, scroll_speed)
			} else if (
				quiz.getBoundingClientRect().top != after_scroll_top_margin
			) {
				window.scrollBy(0, quiz.getBoundingClientRect().top)
			}
		}

		// open_window
		const open_window = (params) => {
			add_reload_data_animation()
			change_active_window(params.node)

			setTimeout(() => {
				active_node = params.node
				set_wrapper_height()
				scroll_to_quiz_top()
				delete_reload_data_animation()
				if (params.init_animation_status) {
					const items = get_items(params.node)
					init_animation(items)
				}
			}, animation_time)
		}

		// check_wrapper_height
		const check_wrapper_height = (params) => {
			if (params.current_height == params.node.clientHeight) {
				if (params.counter <= params.max_iterarion) {
					params.counter++

					setTimeout(() => {
						check_wrapper_height({
							node: params.node,
							counter: params.counter,
							max_iterarion: params.max_iterarion,
							current_height: params.current_height,
							timer: params.timer,
						})
					}, params.timer)
				} else return
			} else {
				active_node = params.node
				set_wrapper_height()
			}
		}

		// set_wrapper_height
		const set_wrapper_height = () => {
			wrapper.style.height = `${active_node.clientHeight}px`

			let counter = 0
			let max_iterarion = 10
			let timer = 300
			const current_height = active_node.clientHeight

			setTimeout(() => {
				check_wrapper_height({
					node: active_node,
					counter,
					max_iterarion,
					current_height,
					timer,
				})
			}, timer)
		}

		// add_reload_data_animation
		const add_reload_data_animation = () => {
			quiz.classList.add('--data-reload')
		}

		// delete_reload_data_animation
		const delete_reload_data_animation = () => {
			quiz.classList.remove('--data-reload')
		}

		// add_item
		const add_item = (params) => {
			params.node.insertAdjacentHTML(
				'beforeend',
				`
					<div class="quiz__item quiz__shade --shade-in js__item" data-type="${params.data.type}">
						<div class="quiz__item-wrapper quiz__shade-wrapper">
							<div class="quiz__item-active-icon"></div>
							<div class="quiz__img" style="background-image: url('/${images_folder}/${params.items_images_folder}/${params.data.type}.jpg')"></div>
							<div class="quiz__title">${params.data.title}</div>
						</div>
					</div>
				`
			)
		}

		// add_items
		const add_items = (params) => {
			const items_wrapper = document.createElement('div')
			items_wrapper.classList.add('quiz__items')

			params.data.forEach((item_data) =>
				add_item({
					node: items_wrapper,
					data: item_data,
					items_images_folder: params.items_images_folder,
				})
			)

			params.node.appendChild(items_wrapper)
		}

		// clear_items
		const clear_items = (node) => {
			node.innerHTML = ``
		}

		//
		// add_btns_listeners
		//
		const add_btns_listeners = () => {
			// sectors_next_btn
			sectors_next_btn_node.addEventListener('click', () => {
				if (
					check_active_items({
						node: sectors_items_cont_node,
						open_node: services_node,
						error_node: sectors_errors_node,
					})
				) {
					open_window({
						node: services_node,
						init_animation_status: true,
					})
					init_services()
				}
			})
			// services_prev_btn
			services_prev_btn_node.addEventListener('click', () => {
				open_window({
					node: sectors_node,
					init_animation_status: false,
				})
			})
			// services_next_btn
			services_next_btn_node.addEventListener('click', () => {
				if (
					check_active_items({
						node: services_items_cont_node,
						open_node: rezults_node,
						error_node: services_errors_node,
					})
				) {
					open_window({
						node: rezults_node,
						init_animation_status: true,
					})
					init_rezults()
				}
			})
			// rezults_prev_btn
			rezults_prev_btn_node.addEventListener('click', () => {
				open_window({
					node: services_node,
					init_animation_status: false,
				})
			})
			// rezults_next_btn
			rezults_next_btn_node.addEventListener('click', set_quiz_data)
		}

		//
		// init_animation
		//
		const animation_step = (items, num, num_max) => {
			if (num < num_max) {
				items[num].classList.remove('--shade-in')
				num++
				setTimeout(() => {
					animation_step(items, num, num_max)
				}, item_animation_delay)
			}
		}

		const init_animation = (items) => {
			const num_max = items.length
			setTimeout(() => {
				animation_step(items, 0, num_max)
			}, item_animation_delay)
		}

		//
		// sectors
		//

		// init_sectors
		const init_sectors = () => {
			add_items({
				node: sectors_items_cont_node,
				data: sectors_data,
				items_images_folder: 'sectors',
			})
			const items = get_items(sectors_items_cont_node)
			add_listeners_for_window_items(items)
			init_animation(items)

			active_node = sectors_node
			set_wrapper_height()
		}

		//
		// services
		//

		// init_services
		const init_services = () => {
			clear_items(services_items_cont_node)
			add_services()

			const items = get_items(services_items_cont_node)
			add_listeners_for_window_items(items)
		}

		// get_service_title
		const get_service_title = (name) => {
			for (let i = 0; i < sectors_data.length; i++) {
				if (sectors_data[i].type == name) return sectors_data[i].title
			}
		}

		// add_service
		const add_service = (service_name) => {
			const service_title = get_service_title(service_name)

			services_items_cont_node.insertAdjacentHTML(
				'beforeend',
				`
					<h2 class="quiz__items-heading">${service_title}</h2>
				`
			)
			add_items({
				node: services_items_cont_node,
				data: services_data[`${service_name}`],
				items_images_folder: 'services',
			})
		}

		// add_services
		const add_services = () => {
			active_items.forEach((active_item) => {
				add_service(active_item)
			})
		}

		//
		// rezults
		//

		// init_rezults
		const init_rezults = () => {
			clear_items(rezults_items_cont_node)
			add_rezults()
			add_summary_price()
			add_space_for_prices()
		}

		// add_space_for_price
		const add_space_for_price = (elem) => {
			elem.textContent = elem.textContent.replace(
				/(\d{1,3}(?=(?:\d\d\d)+(?!\d)))/g,
				'$1 '
			)
		}

		// add_space_for_prices
		const add_space_for_prices = () => {
			const prices =
				rezults_items_cont_node.getElementsByClassName('js__price')

			;[...prices].forEach((price) => add_space_for_price(price))
		}

		// add_summary_price
		const add_summary_price = () => {
			let summary_price = 0

			active_items.forEach((active_item) => {
				summary_price += get_sevice_data(active_item).price
			})

			rezults_items_cont_node.insertAdjacentHTML(
				'beforeend',
				`
					<div class="quiz__result-summary-price">
						Итого:
						<span class="js__price js__quiz-data__summary">${summary_price}</span>
						₽
					</div>
				`
			)
		}

		// get_sevice_data
		const get_sevice_data = (service_name) => {
			for (const key in services_data) {
				for (let i = 0; i < services_data[key].length; i++) {
					if (services_data[key][i][`type`] == service_name) {
						return Object.assign({}, services_data[key][i], {
							key: key,
						})
					}
				}
			}
		}

		// add_rezult
		const add_rezult = (service_name) => {
			const data = get_sevice_data(service_name)
			summary_price += data.price

			rezults_items_cont_node.insertAdjacentHTML(
				'beforeend',
				`
					<div class="quiz__result-item quiz__shade --shade-in js__item">
						<div class="quiz__shade-wrapper">
							<div class="quiz__result-item__head">
								<div class="quiz__result-item__name js__quiz-data__name">${data.title}</div>
								<div class="quiz__result-item__price">
									от
									<span class="js__price js__quiz-data__price">${data.price}</span>
									₽
								</div>
							</div>
							<div class="quiz__result-item__body">
								<div class="quiz__result-item__description">${data.description}</div>

								<div class="quiz__result-item__link-cont __f __fe">
									<a class="quiz__result-item__link __btn" href="/${data.key}/${data.type}" target="_blank">
									<span>
										Уточнить
									</span>	
									<div class="icon flex items-center">
										<svg viewBox="0 0 320 512" data-name="right">
											<path
												d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z">
											</path>
										</svg>
									</div>
									</a>
								</div>
							</div>
						</div>
					</div>
				`
			)
		}

		// add_rezults
		const add_rezults = () => {
			active_items.forEach((active_item) => {
				add_rezult(active_item)
			})
		}

		//
		// set_quiz_data
		//
		const set_quiz_data = () => {
			const names = rezults_node.getElementsByClassName(
				'js__quiz-data__name'
			)
			const prices = rezults_node.getElementsByClassName(
				'js__quiz-data__price'
			)
			const summary = rezults_node.getElementsByClassName(
				'js__quiz-data__summary'
			)[0]

			const quiz_data = get_quiz_data({ names, prices, summary })
			write_quiz_data_in_input(quiz_data)
		}

		const get_quiz_data = (params) => {
			let res = '<br>'

			for (let i = 0; i < params.names.length; i++) {
				res += `${params.names[i].textContent}: <strong>${params.prices[i].textContent}</strong> р<br>`
			}
			res += `Итого: <strong>${params.summary.textContent}</strong> р`

			return res
		}

		const write_quiz_data_in_input = (data) => {
			document.getElementsByClassName('js__quiz-data')[0].value = data

			console.log(
				'quiz-data ',
				document.getElementsByClassName('js__quiz-data')[0].value
			)
		}

		//
		// quiz_init
		//
		const quiz_init = async () => {
			// load data
			sectors_data = await get_data(`/${json_folder}/sectors.json`)
			services_data = await get_data(`/${json_folder}/services.json`)

			init_sectors()
			add_btns_listeners()
			window.addEventListener('resize', set_wrapper_height)
		}

		// call section
		quiz_init()
	}
}
