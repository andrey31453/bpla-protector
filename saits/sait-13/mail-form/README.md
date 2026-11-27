# Переносимая форма через RuSender API

Скопируйте всю папку в другой проект; агент начинает с `AGENTS.md`.
PHP 8.1+ с cURL отправляет HTTPS POST на
`https://api.rusender.ru/api/v1/public/emails`. SMTP, Postfix и `mail()` не используются.
Документация: https://rusender.ru/docs/sending/transactional

## Состав и подключение

- `config/form.json`: поля, статусы, получатель, отправитель и тема.
- `server/lead.php`: единственный обработчик, валидация и API-транспорт.
- `client/form.mjs`: улучшение статической формы, без генерации контента.
- `build.mjs`: независимая от Vite сборка двух PHP-файлов.
- `deploy/`: Debian/Ubuntu setup, пул PHP-FPM и nginx-фрагмент.
- `tests/`: автономные тесты без отправки настоящих писем.

1. Уточните получателя и подтверждённого отправителя целевого проекта.
   На сайте 13 отправитель строго `info@zok.pro`; актуальный получатель указан в `config/form.json`.
2. Передайте JSON сайта с `brand` и `baseUrl` (пример: `config/site.example.json`):

```sh
node mail-form/build.mjs src/data/site.json dist
```

В Vite импортируйте `loadForm` и `mailAssets` из `build.mjs`:
`data.form = loadForm()` для Nunjucks; в `generateBundle` передайте каждый
элемент `mailAssets(data.site, data.form)` в `this.emitFile({type: 'asset', ...asset})`.
Строятся только `api/lead.php` и `api/lead-config.php`; исходный комплект не публикуйте в web-root.
Base64 в конфигурации — не шифрование. Никаких секретов при сборке нет.

## Секрет и сервер

Домен отправителя должен быть подтверждён в RuSender, ключ отправки enabled,
токен должен иметь `email.send`. DNS для аутентификации настраивается по инструкции
RuSender, не для прямой доставки с IP веб-сервера.

Токен хранится в `/etc/site-lead/rusender-token`, вне document root:
каталог root:www-data 750, файл root:www-data 640. Не коммитьте токен,
не включайте его в HTML/JS/JSON сборки, логи, аргументы команд или примеры.
Для другой установки путь можно передать через серверную переменную
`RUSENDER_TOKEN_FILE` (PHP-FPM очищает окружение: используйте `env[...]` пула).

Штатный workflow сайта 13 читает GitHub Actions Secret **`RUSENDER_API_TOKEN`**,
передаёт его по SSH stdin и атомарно устанавливает файл. Если Secret не задан,
используется уже существующий файл; при его отсутствии setup остановится.
Добавьте/обновите Secret перед разрешённой боевой выкладкой.

На Debian/Ubuntu от root после установки секрета:

```sh
bash mail-form/deploy/setup.sh
```

Скрипт устанавливает PHP-FPM/cURL/CA, проверяет PHP 8.1+, ставит пул и проверяет
конфигурацию перед перезапуском. Существующий Postfix не меняет и не удаляет.
Прежний `sendmail_path` удаляется заменой собственного пула.
Подключите `deploy/nginx.conf` в server nginx; сокет `/run/php/site-lead.sock`.
На сайте 13 этим занимается `deploy/install-tls.sh`. Другие PHP-пути закрыты.
Нужен исходящий HTTPS/443 к RuSender, SMTP/25 не нужен.

## HTML/JS-контракт

Статическая форма: `method="post"`, `action` из `endpoint`, `data-form`.
Поля: обязательные `name`, `phone`, необязательный `comment`, поле раздела
из `hidden.name`, пустой honeypot `website`. PHP ограничивает длины и размер POST,
проверяет телефон, Origin при наличии и разрешает одну попытку в минуту с IP.
Это не полноценная антибот-система. За reverse proxy настройте доверенный real IP.
Файлы лимита в temp требуют штатной очистки.

Статус: `data-form-status`, `role="status"`, `aria-live="polite"`,
`data-form-error`, `data-form-send-error`, `data-form-loading`.
Модуль переключает `is-visible`, `is-error`, disabled и `aria-busy`,
сохраняет поля при ошибке и очищает только при успехе.

```js
import { initForm } from './mail-form/client/form.mjs'
initForm()
```

Без JS сервер отдаёт HTML результата. С `Accept: application/json` возвращает
`{ok, message}`: 200 принятие RuSender, 405 метод, 413 размер, 422 поля,
403 Origin, 429 локальный лимит, 503 API/секрет/cURL.

В API передаётся `{data: {from, to, subject, html}}`, пользовательские поля
экранируются. Успех — только HTTP 202 с `data.id`, не доказательство доставки.
В журнал попадают только HTTP-код и номер ошибки cURL, не тело/токен.
Каждая серверная операция получает случайный `Idempotency-Key`; один повтор
при сетевой ошибке/5xx использует тот же ключ и тело. Общий сетевой таймаут до 20 с.
Отдельный повтор формы пользователем — новая операция/ключ; сквозной дедупликации
между отдельными POST нет. После неопределённого результата проверяйте историю RuSender.

## Проверки

```sh
node --test mail-form/tests/form.test.mjs
python3 mail-form/tests/test_lead.py
python3 mail-form/tests/test_lead.py dist/api
bash -n mail-form/deploy/setup.sh
```

PHP-тест использует подмену cURL только во временной копии обработчика:
настоящих HTTP-запросов нет. Проверяются валидация, адреса/auth, payload,
повтор с неизменным ключом, ошибки API/секрета и HTML без JS.
После разрешённой выкладки: GET обработчика → 405, конфигурация → 404,
заявка → приём API; доставку проверьте в RuSender и ящике получателя.
GitHub Pages и Vite preview PHP не исполняют.