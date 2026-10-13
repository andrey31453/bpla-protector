# Лендинги «Защитные конструкции от БПЛА»

Три варианта многостраничного лендинга (по 8 страниц каждый) на **Vite** + **Tailwind CSS v4**.

---

## Сайты

| ID       | Бренд / Тема                  | Порт | Описание                                                                  |
|----------|-------------------------------|------|---------------------------------------------------------------------------|
| `sait-00` | **ЗОК-ИНЖИНИРИНГ**<br>тёмная / cyan  | 8000 | Базовый лендинг: тёмный фон, минимализм, акценты cyan                     |
| `sait-01` | **ЗОК-ШИЛД**<br>тёмная / акцент      | 8001 | Вариант с более контрастными акцентами и приглушённой палитрой             |
| `sait-02` | **БАСТИОН · ЗОК**<br>светлая / olive | 8002 | Светлая тема, милитари-оливковая палитра (stone-50 bg + olive-7xx акценты)|

Все сайты используют **одну структуру** (8 страниц), **одинаковую логику** (JS-рендер header/footer, reveal-анимации, форма), но **разные цветовые схемы** и бренды.

---

## Структура страниц (8 страниц в каждом сайте)

1. **index.html** — главная (hero, назначение, форматы, два рубежа, CTA)
2. **ugrozy.html** — угрозы и расчётные сценарии
3. **konstrukcii.html** — конструкции и элементы (каркас, тросы, сетка)
4. **princip.html** — принцип работы защитного барьера
5. **proektirovanie.html** — проектирование и расчёт
6. **primenenie.html** — преимущества и сферы применения
7. **montazh.html** — монтаж и эксплуатация
8. **kompleksnaya.html** — ограничения и комплексная защита

---

## Команды

### 1. Dev-режим (все три сайта параллельно)

```bash
./dev.sh
```
- **sait-00** → http://localhost:8000
- **sait-01** → http://localhost:8001
- **sait-02** → http://localhost:8002

`Ctrl+C` остановит все три dev-сервера.

### 2. Prod-сборка (dist/)

```bash
./build.sh
```
Создаст `sait-00/dist/`, `sait-01/dist/`, `sait-02/dist/` с финальными HTML + CSS + JS.

### 3. Один сайт отдельно

```bash
cd sait-00  # или sait-01, sait-02
npm install
npm run dev   # → http://localhost:8000 (8001, 8002)
npm run build
```

---

## Технологии

- **Vite 6** — многостраничный MPA-билд (8 входных точек `.html`)
- **Tailwind CSS v4** — нативный режим через `@import "tailwindcss"` + `@theme` в `src/style.css`
- **Vanilla JS** — рендер header/footer (из массива `NAV`), форма, reveal-анимации через IntersectionObserver
- **Без сборщика config** — Tailwind v4 не требует `tailwind.config.js`, всё в `@theme { ... }`

---

## Особенности реализации

### 1. Tailwind CSS v4 (нативный `@import`)

Каждый сайт использует **Tailwind CSS v4 в нативном режиме**:
- `@import "tailwindcss"` в `src/style.css`
- Кастомные цвета и утилиты через `@theme { ... }` в том же файле
- Plugin `@tailwindcss/vite` в `vite.config.js`
- **Без** `tailwind.config.js`

### 2. JS-рендер header/footer

Весь `<header>` и `<footer>` рисуются из `src/main.js` через `document.getElementById('site-header').innerHTML = ...`.  
Массив `NAV` (8 пунктов) → генерирует меню, текущая страница подсвечивается по `location.pathname`.

### 3. Reveal-анимации

Класс `.reveal` + IntersectionObserver → элементы плавно появляются при скролле.  
Задержки через inline-стиль `style="--d:.05s"` → `transition-delay: var(--d, 0s)`.

### 4. Демо-форма

Форма с полями `name`, `phone`, `company`, `direction`, `message` → `submit` event → alert + reset (не отправляет на сервер).

### 5. Один подход для трёх брендов

- **sait-00**: тёмная, cyan
- **sait-01**: тёмная, глубокая палитра
- **sait-02**: светлая, olive + stone + amber

Все используют **одинаковую** структуру HTML, JS-логику и классы компонентов (`.btn`, `.card`, `.chip`, `.note`, `.kpi`, `.reveal`), но с **разными** цветовыми токенами.

---

## Нормативная база

Все лендинги ссылаются на **СП 542.1325800.2024** — актуальный СП для защитных сооружений от БПЛА.

---

## Контакты в демо (не реальные)

- **sait-00**: info@zok-eng.ru, +7 (800) 505-44-66
- **sait-01**: info@zok-shield.ru, +7 (800) 550-64-69
- **sait-02**: info@bastion-zok.ru, +7 (800) 550-64-69

_(Это демо-контакты для иллюстрации, не используются в реальных отправках)_

---

## Структура репо

```
saits/
├─ dev.sh               # запуск всех трёх сайтов в dev
├─ build.sh             # prod-сборка всех трёх
├─ README.md            # этот файл
├─ sait-00/
│  ├─ src/
│  │  ├─ main.js        # header, footer, форма, reveal
│  │  └─ style.css      # Tailwind v4 + custom theme (cyan)
│  ├─ vite.config.js    # порт 8000, 8 входных точек
│  ├─ package.json
│  ├─ index.html, ugrozy.html, ... (8 страниц)
│  └─ dist/             # после npm run build
├─ sait-01/
│  ├─ src/              # аналогично, порт 8001
│  ├─ ...
│  └─ dist/
└─ sait-02/
   ├─ src/              # аналогично, порт 8002, olive-тема
   ├─ ...
   └─ dist/
```

---

## Что дальше

1. **Уточнить контент** — тексты, цифры, кейсы
2. **Добавить изображения** — схемы, фото объектов (в `public/` каждого сайта)
3. **Подключить отправку форм** — если нужен реальный backend
4. **Настроить deploy** — Netlify/Vercel или свой сервер (каждый `dist/` — отдельный статический сайт)
5. **SEO-оптимизация** — OpenGraph, robots.txt, sitemap.xml

---

## Ветки и две площадки публикации

Пуш ветки — это сразу публикация. В репозитории две площадки, и у каждой своя
ветка-источник:

| Ветка | Что собирается | Workflow | Куда попадает |
| --- | --- | --- | --- |
| `develop` | все сайты `sait-*` + хаб-страница | `.github/workflows/deploy-pages.yml` | витрина на GitHub Pages: хаб `https://<user>.github.io/bpla-protector/`, сайты `…/sait-XX/` |
| `main` | только сайты со своим `hosting.json` | `.github/workflows/deploy-hosting.yml` | боевой хостинг этих сайтов (FTP/FTPS) |

Логика простая: в `develop` попадает всё, что нужно посмотреть; в `main`
мержится только готовое, и оттуда оно уезжает на хостинг. Сайты без
`hosting.json` на хостинг не едут — они остаются на витрине Pages.

Сборка сайтов локально — та же, что в CI:

```bash
./build.sh                         # все сайты (dist/) + перевод путей в относительные
./build.sh sait-13                 # только один сайт
node assemble.mjs saits            # _site/ (хаб-страница + все сайты) — для витрины Pages
```

> Чтобы витрина заработала, включите GitHub Pages: **Settings → Pages → Source → GitHub Actions**.
> Если Pages не деплоится из `develop`, разрешите ветку в **Settings → Environments → github-pages → Deployment branches**.

## Выкладка на хостинг

Выкладывается только тот сайт, у которого в его папке лежит `hosting.json`.
Пример-шаблон — `saits/hosting.example.json`, живой конфиг — `saits/sait-13/hosting.json`.

```
saits/sait-13/hosting.json     # адрес хостинга, логин, каталог, имя секрета с паролем
```

Паролей в репозитории нет: репозиторий публичный, поэтому в конфиге указано
только **имя GitHub-секрета** (`passwordSecret`), а сам пароль лежит в
**Settings → Secrets and variables → Actions**.

Порядок для нового сайта:

1. Скопируйте `saits/hosting.example.json` в `saits/sait-XX/hosting.json` и
   заполните адрес, логин FTP, имя секрета и каталог документ-рута (`remoteDir`).
2. Добавьте GitHub-секрет с этим именем и паролем FTP.
3. Смержите сайт в `main` — workflow `Deploy to hosting (main)` соберёт сайт и
   выложит его зеркалом (`mirror -R`) в `remoteDir`: файлы из `dist/` ложатся
   как есть, а лишнее из прошлых сборок удаляется.

Проверка и ручной запуск:

```bash
cd saits
node hosting-list.mjs                    # какие сайты умеют выкладываться на хостинг
node hosting-list.mjs --matrix           # то же в виде JSON для workflow
HOSTING_PASSWORD=… ./hosting-deploy.sh sait-13   # выкладка вручную (нужен lftp)
```

Разовый запуск из GitHub: **Actions → Deploy to hosting (main) → Run workflow**
(можно указать один сайт, например `sait-13`).

Что важно знать про конфиг:

- `remoteDir` — путь документ-рута внутри FTP-аккаунта. У сайта `sait-13` это
  `web` (внутри лежат `stats/`, `error/`, `standard_index.html` панели) — именно
  этот каталог отдаётся доменом `forttex.ru`.
- `exclude` — что не зеркалим и не удаляем на хостинге (служебные каталоги
  панели). Всё остальное приводится к состоянию `dist/`.
- `protocol: ftps` — явный TLS поверх 21-го порта; `ftp` — без шифрования.
- `verifyCertificate: false` — отключает проверку сертификата (например, если
  сертификат выпущен не на имя хоста FTP).

**Статус:** все 13 лендингов собираются и публикуются на витрине Pages из
ветки `develop`; `sait-13` (фортТех) настроен на выкладку на хостинг из `main`.
