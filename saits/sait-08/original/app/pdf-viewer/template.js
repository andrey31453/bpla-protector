{
	const pdf_cont = document.getElementsByClassName('wp-block-file')[0]
	if (pdf_cont) {
		const link = pdf_cont.querySelector('a')
		link.classList.add('wp-block-file__button')
		link.classList.add('--cntrl')
		link.href = link.href.replace(/\/$/, '')
		link.setAttribute('target', '_blank')
		link.textContent = `Посмотреть в новой вкладке`

		if (document.documentElement.clientWidth < 769) pdf_cont.getElementsByClassName('wp-block-file__embed')[0].innerHTML = `<p>Не удалось показать документ на вашем устройстве. Вы можете скачать его или посмотреть в новой вкладке.</p>`
	}
}
