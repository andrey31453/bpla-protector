{
	const gallery_folder =
		'/design/template/images/gallery__multi-one-page/gallery' // место хранения папки с изображениями галлереи

	import_multi_gallery = document.getElementsByClassName(
		'__import-multi-gallery'
	)
	modal = document.getElementsByClassName('__gmop__modal')[0]

	if (import_multi_gallery && modal) {
		//
		// генерация img list
		//
		generate_img = (folder, i, imgSRC, item) => {
			new_img = document.createElement('img')
			new_img.classList.add('gmop__img')
			new_img.classList.add('__img')
			new_img.setAttribute('data-original-SRC', imgSRC)
			new_img.setAttribute('data-gallery-name', folder)
			new_img.src = `${gallery_folder}/${folder}/mini/${i}.jpg`

			item.appendChild(new_img)
		}

		generate_img_items = (folder, item) => {
			for (let i = 1; true; i++) {
				let imgSRC = `${gallery_folder}/${folder}/${i}.jpg`
				let xhr = new XMLHttpRequest()
				xhr.open('HEAD', imgSRC, false)
				xhr.send()

				if (xhr.status == 200) {
					generate_img(folder, i, imgSRC, item)
				} else break
			}
		}

		//
		// запуск генераций img
		//
		;[...import_multi_gallery].forEach((item) => {
			let folder_initial = item.getAttribute('data-galery-folder')
			let folder = folder_initial.split(' ')
			generate_img_items(folder[0], item)
		})

		//
		// 	отработка со слайдером
		//
		const img = document.getElementsByClassName('__img')
		const modal_image_container = modal.getElementsByClassName(
			'__modal-image-container'
		)[0]

		let active_number = -1
		let modal_window = document.createElement('img')
		modal_window.classList.add('gmop__modal-window')

		// замена src картинки
		const write_src = (i) => {
			modal_window.src = img[i].getAttribute('data-original-SRC')
		}

		// переключение слайда
		const prev_slaid = () => {
			active_number != 0 ? active_number-- : (active_number = img.length - 1)
			write_src(active_number)
		}
		const next_slaid = () => {
			active_number != img.length - 1 ? active_number++ : (active_number = 0)
			write_src(active_number)
		}

		// листенеры во время работы слайдера
		const slaider_click_listener = () => {
			if (event.target.closest('.gmop__prev-slaid')) prev_slaid()
			else if (event.target.closest('.gmop__next-slaid')) next_slaid()
			else if (event.target.dataset.close) close_slaider()
		}
		const slaider_keydown_listener = () => {
			if (event.key == 'Escape') close_slaider()
			if (event.keyCode == '37') prev_slaid()
			if (event.keyCode == '39') next_slaid()
		}

		// закрытие слайдера
		const close_slaider = () => {
			window.removeEventListener('click', slaider_click_listener)
			window.removeEventListener('keydown', slaider_keydown_listener)
			enable_scroll()
			menu_btn_show()
			modal.classList.remove('__active')
			active_number = -1
			setTimeout(() => {
				modal_image_container.removeChild(modal_window)
			}, 300)
		}

		// открытие слайдера
		const open_slaider = (event) => {
			window.addEventListener('click', slaider_click_listener)
			window.addEventListener('keydown', slaider_keydown_listener)
			disable_scroll()
			menu_btn_hidden()
			modal_image_container.appendChild(modal_window)
			setTimeout(() => {
				modal.classList.add('__active')
				for (let i = 0; i < img.length; i++) {
					if (img[i] == event.target) {
						active_number = i
						write_src(active_number)
					}
				}
			}, 100)
		}

		//
		// эвент открытие слайдера
		//
		for (let i = 0; i < img.length; i++) {
			img[i].addEventListener('click', open_slaider)
		}
	}
}
