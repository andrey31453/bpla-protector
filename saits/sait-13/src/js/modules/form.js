// form — проверка полей и статус отправки.
// Текст статуса лежит в HTML (data/form.json), модуль только
// переключает видимость и подставляет подсказку об ошибке из
// data-атрибута. Без JS форма отправляется нативной отправкой.
export function initForm() {
  const forms = Array.from(document.querySelectorAll('[data-form]'))
  if (!forms.length) return

  for (const form of forms) {
    const status = form.querySelector('[data-form-status]')
    const successText = status ? status.textContent : ''
    const errorText = status ? status.dataset.formError || '' : ''

    form.addEventListener('submit', (event) => {
      if (!form.checkValidity()) {
        event.preventDefault()
        if (status) {
          if (errorText) status.textContent = errorText
          status.classList.add('is-visible', 'is-error')
        }
        if (typeof form.reportValidity === 'function') form.reportValidity()
        return
      }

      if (status) {
        status.textContent = successText
        status.classList.remove('is-error')
        status.classList.add('is-visible')
      }
    })
  }
}
