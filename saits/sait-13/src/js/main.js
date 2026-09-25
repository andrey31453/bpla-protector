// ============================================================
//   main.js — реестр модулей прогрессивного улучшения.
//   Модули ничего не рендерят: только переключают классы/атрибуты,
//   форматируют ввод и проверяют форму. Базовое состояние — контент
//   виден и доступен без JS. Каждый модуль в try/catch: падение
//   одного не ломает остальные.
//   ============================================================
import { initReveal } from './modules/reveal.js'
import { initMobileNav } from './modules/mobile-nav.js'
import { initPhoneMask } from './modules/phone-mask.js'
import { initForm } from './modules/form.js'

const MODULES = [
  ['reveal', initReveal],
  ['mobile-nav', initMobileNav],
  ['phone-mask', initPhoneMask],
  ['form', initForm],
]

function boot() {
  for (const [name, init] of MODULES) {
    try {
      init()
    } catch (error) {
      console.warn(`[fortteh] модуль «${name}» не запустился`, error)
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true })
} else {
  boot()
}
