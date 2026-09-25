// phone-mask — аккуратное форматирование телефона при вводе.
// Это только улучшение: без JS поле принимает любой текст.
export function initPhoneMask() {
  const inputs = Array.from(document.querySelectorAll('input[type="tel"]'))
  if (!inputs.length) return

  const format = (raw) => {
    let digits = String(raw).replace(/\D/g, '')
    if (!digits) return ''
    if (digits[0] === '8') digits = `7${digits.slice(1)}`
    if (digits[0] !== '7') digits = `7${digits}`
    digits = digits.slice(0, 11)

    let out = '+7'
    if (digits.length > 1) out += ` (${digits.slice(1, 4)}`
    if (digits.length >= 5) out += `) ${digits.slice(4, 7)}`
    if (digits.length >= 8) out += `-${digits.slice(7, 9)}`
    if (digits.length >= 10) out += `-${digits.slice(9, 11)}`
    return out
  }

  for (const input of inputs) {
    input.addEventListener('input', () => {
      const atEnd = input.selectionStart === input.value.length
      const next = format(input.value)
      if (next === input.value) return
      input.value = next
      if (atEnd && typeof input.setSelectionRange === 'function') {
        input.setSelectionRange(next.length, next.length)
      }
    })
  }
}
