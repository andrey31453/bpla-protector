{
	const discount = document.getElementsByClassName('js__discount')[0]
	if (discount) {
		discount.innerHTML = `
			<div class="discount">
				<p class="discount__description">
					Наша организация готова предоставить дополнительную скидку от цены в
					прайсе
				</p>

				<p class="discount__small">
					Скидка будет предоставлена в следующих случаях: при предоплате заказа 100%, при заказе комплексных изысканий (Геологических, Экологических, Геодезических, Геофизических), или при значительных объемах заказа: 50, 100, 200 Га или больше
				</p>
			</div>
		`
	}
}
