// banner__multi
{
	const bm = document.getElementsByClassName('__bm')[0]
	if (bm) {
		// logo update
		if (location.pathname !== '/') bm.classList.add('--not-index')
		// апдейт стилей баннера в зависимости от текущей страницы
		const bm_update = () => {
			if (window.location.pathname == '/') {
				// добавление класса index
				bm.classList.add('__index__bm')

				// добавление блока с контактами
				const elem = document.createElement('div')
				elem.classList.add('container')
				elem.classList.add('__flex')
				elem.classList.add('__fnw')
				elem.innerHTML = `
					<div class="bm__heading-cont __flex __fc">
					<div>
						<h1 class="bm__heading __heading">
							<span>Космически восхитительные</span>
							<br><span><mark>Натяжные потолки</mark></span>
						</span></h1>
						<button class="bm__btn --cntrl f__btn __btn-call-form">
							<span class="__btn-anim">Заказать звонок</span>
						</button>
					</div>
				</div>
		
				<div class="bm__images __flex __fcol">
					<img class="bm__content__img" src="/design/template/images/gallery__export__modal/gallery/index/mini/index_1.jpg">
					<img class="bm__content__img" src="/design/template/images/gallery__export__modal/gallery/index/mini/index_1.jpg">
					<img class="bm__content__img" src="/design/template/images/gallery__export__modal/gallery/index/mini/index_1.jpg">
				</div>
				`
				bm.appendChild(elem)
			}
		}
		bm_update()
	}
}
