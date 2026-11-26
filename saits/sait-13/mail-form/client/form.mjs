// Переносимый модуль. Без JS форма делает обычный POST в PHP.
export function initForm() {
  const forms = Array.from(document.querySelectorAll('[data-form]'))
  if (!forms.length) return

  for (const form of forms) {
    const status = form.querySelector('[data-form-status]')
    const errorText = status ? status.dataset.formError || '' : ''
    const sendError = status ? status.dataset.formSendError || '' : ''
    const button = form.querySelector('[type="submit"]')
    let pending = false
    const showStatus = (message, isError = false) => {
      if (!status) return
      status.textContent = message
      status.classList.toggle('is-error', isError)
      status.classList.add('is-visible')
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault()
      if (pending) return
      if (!form.checkValidity()) {
        showStatus(errorText, true)
        if (typeof form.reportValidity === 'function') form.reportValidity()
        return
      }

      pending = true
      if (button) button.disabled = true
      form.setAttribute('aria-busy', 'true')
      showStatus(status ? status.dataset.formLoading || '' : '')
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
          credentials: 'same-origin',
        })
        const result = await response.json()
        if (!response.ok || result.ok !== true || typeof result.message !== 'string') {
          showStatus(typeof result.message === 'string' ? result.message : sendError, true)
          return
        }
        showStatus(result.message)
        form.reset()
      } catch {
        showStatus(sendError, true)
      } finally {
        pending = false
        if (button) button.disabled = false
        form.removeAttribute('aria-busy')
      }
    })
  }
}
