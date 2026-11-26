import { test } from 'node:test'
import assert from 'node:assert/strict'
import { initForm } from '../client/form.mjs'

test('form waits for server, handles errors and prevents duplicate requests', async () => {
  const previous = { document: globalThis.document, fetch: globalThis.fetch, FormData: globalThis.FormData }
  const classes = new Set()
  const status = {
    dataset: { formSendError: 'Failed', formError: 'Invalid', formLoading: 'Loading' },
    textContent: '',
    classList: {
      add: (...names) => names.forEach(name => classes.add(name)),
      toggle: (name, on) => on ? classes.add(name) : classes.delete(name),
    },
  }
  const button = { disabled: false }
  let submit, reset = 0, calls = 0, resolve
  const form = {
    action: 'https://zok.pro/api/lead.php',
    querySelector: selector => selector === '[data-form-status]' ? status : button,
    addEventListener: (_, handler) => { submit = handler },
    checkValidity: () => true,
    setAttribute() {}, removeAttribute() {},
    reset: () => { reset++ },
  }
  try {
    globalThis.document = { querySelectorAll: () => [form] }
    globalThis.FormData = class {}
    globalThis.fetch = () => { calls++; return new Promise(done => { resolve = done }) }
    initForm()
    const event = { preventDefault() {} }
    const pending = submit(event)
    assert.equal(button.disabled, true)
    assert.equal(status.textContent, 'Loading')
    await submit(event)
    assert.equal(calls, 1)
    resolve({ ok: true, json: async () => ({ ok: true, message: 'Accepted' }) })
    await pending
    assert.equal(status.textContent, 'Accepted')
    assert.equal(reset, 1)
    assert.equal(button.disabled, false)
    globalThis.fetch = async () => ({ ok: false, json: async () => ({ ok: false, message: 'Rejected' }) })
    await submit(event)
    assert.equal(status.textContent, 'Rejected')
    assert.equal(classes.has('is-error'), true)
    assert.equal(reset, 1)
    globalThis.fetch = async () => { throw new Error('Offline') }
    await submit(event)
    assert.equal(status.textContent, 'Failed')
    assert.equal(button.disabled, false)
  } finally {
    Object.assign(globalThis, previous)
  }
})