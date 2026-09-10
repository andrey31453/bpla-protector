{
	const gallerys = document.getElementsByClassName('js__gallery')
	if (gallerys[0]) {
		const gallery_section_init = (gallery) => {
			//
			// DOM-s
			//

			// active_wrapper
			const active_wrapper = gallery.getElementsByClassName(
				'js__active-wrapper'
			)[0]
			const active_images = active_wrapper.getElementsByClassName(
				'js__active-images'
			)[0]
			const a_prev_btn =
				active_wrapper.getElementsByClassName('js__prev-btn')[0]
			const a_next_btn =
				active_wrapper.getElementsByClassName('js__next-btn')[0]
			const a_img_number =
				active_wrapper.getElementsByClassName('js__img-number')[0]
			const a_name =
				active_wrapper.getElementsByClassName('js__active-name')[0]

			const current_img_number =
				active_wrapper.getElementsByClassName(
					'js__current-active-img-number'
				)[0]
			const quantity_img_number =
				active_wrapper.getElementsByClassName(
					'js__quantity-active-img-number'
				)[0]

			// hashtags
			const hashtags =
				gallery.getElementsByClassName('js__hashtags')[0]
			let hashtag_clear
			let hashtags_set

			// other_wrapper
			const other_wrapper = gallery.getElementsByClassName(
				'js__other-wrapper'
			)[0]
			const other_images = other_wrapper.getElementsByClassName(
				'js__other-images'
			)[0]
			const o_prev_btn =
				other_wrapper.getElementsByClassName('js__prev-btn')[0]
			const o_next_btn =
				other_wrapper.getElementsByClassName('js__next-btn')[0]

			// VAR-s
			let gallery_data
			const type = gallery.dataset.type

			let max_a_img_cont = 992
			let number_active_slide = 0
			let number_other_slide = 0

			let quantity_active_slide
			let quantity_other_slide
			let par_window_size = 4
			let o_img_width = 0

			let system_i = 0
			let o_imgs
			let a_imgs
			let hashtag_nodes

			// import

			//
			// functions
			//

			//
			// active
			//

			// add img in .gallery__active-proect__img
			const add_active_img = (folder_name, folder_type, number) => {
				active_images.insertAdjacentHTML(
					'beforeend',
					`
				<img class="gallery__active-proect__img js__a-img" src="/images/gallery/images/${folder_name}/${number}.${folder_type}">
			`
				)
			}

			// check correct type in data item
			const has_type = (string) => {
				const string_div = string.split(' ')

				for (let i = 0; i < string_div.length; i++) {
					if (string_div[i] == type || gallery.dataset.all)
						return true
				}
				return false
			}

			// delete in data item has incorrect type
			const get_correct_data = (data) => {
				const result = []

				data.forEach((elem) => {
					if (has_type(elem.type)) result.push(elem)
				})

				return result
			}

			//add_project_name
			const add_project_name = (name) => {
				a_name.textContent = `${name}`
			}

			// add_active_imgs
			const add_active_imgs = (data) => {
				for (let i = 1; i <= data['image-quantity']; i++) {
					add_active_img(data['folder-name'], data['folder-type'], i)
				}
			}

			// add_listeners_for_a_imgs
			const add_listeners_for_a_imgs = () => {
				a_imgs = gallery.getElementsByClassName('js__a-img')
				;[...a_imgs].forEach((img) =>
					img.addEventListener('click', next_active_slide)
				)
			}

			// images_cont_width_more_maximum
			const images_cont_width_more_maximum = (cont_width) => {
				if (cont_width > max_a_img_cont) return true
				return false
			}

			// get_styles_for_active_img_in_big_cont
			const get_styles_for_active_img_in_big_cont = (img, width) => {
				img.style = `
					left: ${
						(system_i - number_active_slide) * (width + 100) +
						(width - max_a_img_cont) / 2
					}px
				`
				system_i++
			}

			// get_styles_for_active_img
			const get_styles_for_active_img = (img, width) => {
				img.style = `
					left: ${(system_i - number_active_slide) * (width + 100)}px
				`
				system_i++
			}

			// get_styles_for_img_number_and_project_name
			const get_styles_for_img_number_and_project_name = (width) => {
				a_img_number.style = `
				padding-left: ${(width - max_a_img_cont) / 2}px
			`
				a_name.style = `
				padding-right: ${(width - max_a_img_cont) / 2}px
			`
			}

			// delete_styles_for_img_number_and_project_name
			const delete_styles_for_img_number_and_project_name = () => {
				a_img_number.removeAttribute('style')
				a_name.removeAttribute('style')
			}

			// add styles for active project imgs
			const add_styles_active_imgs = () => {
				const imgs =
					active_wrapper.getElementsByClassName('js__a-img')
				const images_cont_width = gallery.clientWidth

				if (images_cont_width_more_maximum(images_cont_width)) {
					system_i = 0
					;[...imgs].forEach((img) => {
						get_styles_for_active_img_in_big_cont(
							img,
							images_cont_width
						)
					})
					get_styles_for_img_number_and_project_name(
						images_cont_width
					)
				} else {
					system_i = 0
					;[...imgs].forEach((img) => {
						get_styles_for_active_img(img, images_cont_width)
					})
					delete_styles_for_img_number_and_project_name()
				}
			}

			// set_active_image_styles
			const set_active_image_styles = (num, first) => {
				if (a_imgs[num].naturalWidth == 0) {
					setTimeout(() => {
						set_active_image_styles(num, first)
					}, 50)
				} else {
					active_images.style.maxWidth = `${a_imgs[num].naturalWidth}px`
					a_imgs[num].style.top = `calc(50% - ${
						a_imgs[num].offsetHeight / 2
					}px)`

					if (first) {
						first = false
						set_close_btn_styles()
						set_active_imgs()
					}
				}
			}

			// set_close_btn_styles
			const set_close_btn_styles = () => {
				const close_btn =
					gallery.getElementsByClassName('js__close-btn')[0]

				close_btn.style.top = `calc(50% - ${
					a_imgs[number_active_slide].offsetHeight / 2
				}px )`
			}

			// set_active_images_styles
			const set_active_images_styles = () => {
				let first = true
				for (let i = 0; i < a_imgs.length; i++) {
					set_active_image_styles(i, first)
				}
			}

			// set_active_imgs
			const set_active_imgs = () => {
				for (let i = 0; i < a_imgs.length; i++) {
					if (i == number_active_slide) {
						a_imgs[i].classList.add('--active')
					} else {
						a_imgs[i].classList.remove('--active')
					}
				}
			}

			// add_height_active_gallery
			const add_height_active_gallery = () => {
				active_wrapper.style = `height: ${
					active_wrapper.getElementsByClassName('js__a-img')[0]
						.clientHeight
				}px`
			}

			// get_correct_number_active_slide
			const get_correct_number_active_slide = () => {
				if (number_active_slide > quantity_active_slide - 1) {
					return (number_active_slide = 0)
				} else if (number_active_slide < 0) {
					return (number_active_slide = quantity_active_slide - 1)
				} else return number_active_slide
			}

			// write_active_img_number
			const write_active_img_number = () => {
				current_img_number.textContent = number_active_slide + 1
			}
			// write_active_img_number
			const write_quantity_img_number = () => {
				quantity_img_number.textContent = quantity_active_slide
			}

			const change_active_slide = () => {
				number_active_slide = get_correct_number_active_slide()

				if (!hashtags) add_styles_active_imgs()
				if (hashtags) set_active_imgs()
				write_active_img_number()
			}

			// next active slide
			const next_active_slide = () => {
				number_active_slide++
				change_active_slide()
			}

			// prev active slide
			const prev_active_slide = () => {
				number_active_slide--
				change_active_slide()
			}

			// check_data_close
			const check_data_close = (event) => {
				if (event.target.dataset.close) off_active_gallery()
			}

			// add_close_listener
			const add_close_listener = () => {
				window.addEventListener('click', check_data_close)
				window.addEventListener('resize', set_active_images_styles)
			}

			// remove_close_listener
			const remove_close_listener = () => {
				window.removeEventListener('click', check_data_close)
				window.removeEventListener('resize', set_active_images_styles)
			}

			// on_active_gallery
			const on_active_gallery = () => {
				active_wrapper.classList.add('--active')
				set_active_images_styles()
				disable_scroll()
				add_close_listener()
			}

			// off_active_gallery
			const off_active_gallery = () => {
				active_wrapper.classList.remove('--active')
				enable_scroll()
				remove_close_listener()
			}

			//
			// other
			//

			// add img in .gallery__other-proect__img
			const add_other_img = (folder_name, name) => {
				other_images.insertAdjacentHTML(
					'beforeend',
					`
				<div class="gallery__other-proect__img-item js__o-img __bi __fcolc">
					<div class="gallery__other-proect__img-name __fcolc">
						<span>${name}</span>
					</div>
					<div class="gallery__other-proect__img-cont">
						<img class="gallery__other-proect__img" src="/images/gallery/images/${folder_name}/min.jpg">
					</div>
				</div>
			`
				)
			}

			// set_o_pars
			const set_o_pars = () => {
				const window_size = document.documentElement.clientWidth

				if (window_size > 1199) {
					o_img_width = Math.ceil(
						other_images.clientWidth / 4 + 10 / 3
					)
					par_window_size = 4
				} else if (window_size > 768) {
					o_img_width = Math.ceil(
						other_images.clientWidth / 3 + 10 / 2
					)
					par_window_size = 3
				} else {
					o_img_width = Math.ceil(other_images.clientWidth / 2 + 10)
					par_window_size = 2
				}
			}

			// add_styles_o_img
			const add_styles_o_img = (img) => {
				img.setAttribute(
					'style',
					`
				left: ${(system_i - number_other_slide) * o_img_width}px;
			`
				)
				system_i++
			}

			// add_styles_o_imgs
			const add_styles_o_imgs = () => {
				system_i = 0

				//
				;[...o_imgs].forEach((img) => {
					add_styles_o_img(img)
				})
			}

			// set_correct_number_other_slide
			const set_correct_number_other_slide = () => {
				if (
					number_other_slide >
					quantity_other_slide - par_window_size
				) {
					number_other_slide = 0
				} else if (number_other_slide < 0) {
					number_other_slide = quantity_other_slide - par_window_size
				}
			}

			// next_other_slide
			const next_other_slide = () => {
				number_other_slide++
				set_correct_number_other_slide()
				if (!hashtags) add_styles_o_imgs()
			}

			// prev_other_slide
			const prev_other_slide = () => {
				number_other_slide--
				set_correct_number_other_slide()
				if (!hashtags) add_styles_o_imgs()
			}

			// add_a_project
			const add_a_project = (n) => {
				// get active imgs quantity
				quantity_active_slide = gallery_data[n]['image-quantity']
				write_quantity_img_number()

				// add active project img-s in active-proect wrapper
				add_active_imgs(gallery_data[n])
				add_project_name(gallery_data[n].name)
				add_listeners_for_a_imgs()

				// write active project imgs styles for 0 images
				if (!hashtags) add_styles_active_imgs()

				// write

				// check for load active-img[0]
				if (!hashtags) {
					const check_load_images = setInterval(() => {
						if (
							active_wrapper.getElementsByClassName('js__a-img')[0]
								.clientHeight != 0
						) {
							clearInterval(check_load_images)
							// write height .gallery__active-proect__images
							add_height_active_gallery()
						}
					}, 50)
				}
			}

			// set_active_o_project
			const set_active_o_project = (n) => {
				for (let i = 0; i < o_imgs.length; i++) {
					if (i == n) o_imgs[i].classList.add('--active')
					else o_imgs[i].classList.remove('--active')
				}
			}

			// set_active_o_projects
			const set_active_o_projects = () => {
				for (let i = 0; i < o_imgs.length; i++) {
					o_imgs[i].classList.add('--active')
				}
			}

			// change_project
			const change_project = (n) => {
				if (!hashtags) {
					active_images.innerHTML = ''
				} else {
					active_images.innerHTML = `
					<div class="gallery__btn --close js__close-btn __fcolc" data-close="true">
						<svg viewBox="0 0 352 512" data-close="true">
							<path data-close="true"
								d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z">
							</path>
						</svg>
					</div>
					`
				}
				number_active_slide = 0
				if (!hashtags) set_active_o_project(n)
				add_a_project(n)
				write_active_img_number()
			}

			// add_listeners_for_o_imgs
			const add_listeners_for_o_imgs = () => {
				o_imgs = other_wrapper.getElementsByClassName('js__o-img')

				if (!hashtags) set_active_o_project(0)
				else set_active_o_projects()

				for (let i = 0; i < o_imgs.length; i++) {
					o_imgs[i].addEventListener('click', () => {
						change_project(i)
						if (hashtags) on_active_gallery()
					})
				}
			}

			// check for minimize quamtity projects
			const check_minimize = () => {
				if (quantity_other_slide > par_window_size) return false
				return true
			}

			// correct_styles_in_o_wrapper
			const correct_styles_in_o_wrapper = () => {
				other_images.setAttribute(
					'style',
					`
					width: 100%;
				`
				)
				o_prev_btn.setAttribute(
					'style',
					`
					display: none;
				`
				)
				o_next_btn.setAttribute(
					'style',
					`
					display: none;
				`
				)
			}

			//
			// hashtags
			//

			// add_hashtags_in_hashtags_node
			const add_hashtags_in_hashtags_node = () => {
				hashtags_set = new Set()

				gallery_data.forEach((item_data) =>
					hashtags_set.add(item_data.hashtag)
				)

				hashtags_set.forEach((hashtag) =>
					hashtags.insertAdjacentHTML(
						'beforeend',
						`
					<span class="gallery__hashtag js__hashtag" data-hashtag="${hashtag}">#${hashtag}</span>
				`
					)
				)
			}

			// add_hashtags_in_other_images
			const add_hashtags_in_other_images = () => {
				for (let i = 0; i < gallery_data.length; i++) {
					o_imgs[i].dataset.hashtag = `${gallery_data[i].hashtag}`
					o_imgs[i].classList.add(`--${gallery_data[i].hashtag}`)
				}
			}

			// init_hashtags
			const init_hashtags = () => {
				add_hashtags_in_hashtags_node()
				add_hashtags_in_other_images()
			}

			// get_active_hashtags
			const get_active_hashtags = () => {
				const res = new Set()

				;[...hashtag_nodes].forEach((hashtag_node) => {
					if (hashtag_node.classList.contains('--active')) {
						res.add(hashtag_node.dataset.hashtag)
					}
				})

				if (res.size == 0) return hashtags_set
				else return res
			}

			// hashtags_reload
			const hashtags_reload = () => {
				// set active_hashtags
				const active_hashtags = get_active_hashtags()

				;[...o_imgs].forEach((o_img) => {
					if (active_hashtags.has(o_img.dataset.hashtag)) {
						o_img.classList.add('--active')
					} else {
						o_img.classList.remove('--active')
					}
				})
				//
			}

			// toggle_hashtag
			const toggle_hashtag = (num) => {
				hashtag_nodes[num].classList.toggle('--active')
				hashtags_reload()
			}

			// clear_hashtag
			const clear_hashtag = () => {
				;[...hashtag_nodes].forEach((hashtag_node) =>
					hashtag_node.classList.remove('--active')
				)

				hashtags_reload()
			}

			// add_hastags_listeners
			const add_hastags_listeners = () => {
				// node
				hashtag_nodes = hashtags.getElementsByClassName('js__hashtag')
				hashtag_clear = hashtags.getElementsByClassName(
					'js__hashtag-clear'
				)[0]

				// add listeners
				hashtag_clear.addEventListener('click', clear_hashtag)
				for (let i = 0; i < hashtag_nodes.length; i++) {
					hashtag_nodes[i].addEventListener('click', () => {
						toggle_hashtag(i)
					})
				}
			}

			//
			// template
			//

			// set_gallery_params
			const set_gallery_params = () => {
				// active
				add_styles_active_imgs()
				add_height_active_gallery()
				// other
				set_o_pars()
				add_styles_o_imgs()
			}

			// gallery_init
			const gallery_init = async () => {
				// fetch data
				gallery_data = await get_data('/json/gallery/data.json')

				// delete incorrect data
				gallery_data = get_correct_data(gallery_data)

				//
				// active project
				//
				add_a_project(0)

				// listeners
				a_next_btn.addEventListener('click', next_active_slide)
				a_prev_btn.addEventListener('click', prev_active_slide)

				//
				// other-proect
				//

				// get other imgs quantity
				quantity_other_slide = gallery_data.length

				// add min.jpg in other-proect
				gallery_data.forEach((item) => {
					add_other_img(item['folder-name'], item['name'])
				})
				o_imgs = document.getElementsByClassName('js__o-img')

				// add style for other imgs
				set_o_pars()
				if (!hashtags) add_styles_o_imgs()

				// add listeners for o-imgs
				add_listeners_for_o_imgs()

				// check for minimize quamtity projects and correct styles
				if (check_minimize()) {
					correct_styles_in_o_wrapper()
					set_o_pars()
					if (!hashtags) add_styles_o_imgs()
					setTimeout(() => {
						// other
						set_o_pars()
						if (!hashtags) add_styles_o_imgs()
					}, 200)
				}

				//
				//	hashtags
				//
				if (hashtags) init_hashtags()

				//
				// listeners
				//
				if (!hashtags)
					o_next_btn.addEventListener('click', next_other_slide)
				if (!hashtags)
					o_prev_btn.addEventListener('click', prev_other_slide)
				// hastags
				if (hashtags) add_hastags_listeners()

				// resize listener
				if (!hashtags)
					window.addEventListener('resize', () => {
						set_gallery_params()
						setTimeout(set_gallery_params, 100)
						setTimeout(set_gallery_params, 200)
					})
			}
			gallery_init()
		}

		// gallerys
		;[...gallerys].forEach((gallery) => {
			gallery_section_init(gallery)
		})
	}
}
