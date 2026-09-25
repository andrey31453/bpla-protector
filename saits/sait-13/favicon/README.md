# Фавиконы фортТех

Знак сайта — монограмма «ФТ» на оранжевой плите со срезанным углом. Это тот же
знак, что в шапке (`.brand__mark`), поэтому иконка во вкладке совпадает с логотипом.

## Как собрать

```bash
cd saits/sait-13
node favicon/build.mjs                      # всё: SVG-варианты, PNG, favicon.ico, превью
node favicon/build.mjs --primary v3-sight   # другой основной вариант знака
node favicon/build.mjs --only-svg           # только SVG и превью, без PNG/ICO
CHROME_PATH=/путь/к/chrome node favicon/build.mjs
```

Скрипт не добавляет зависимостей: растеризация идёт через headless Google Chrome
(по умолчанию `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`).
Иконки меньше 96 px рисуются с 4-кратным запасом и уменьшаются — иначе сглаживание
съедает тонкие штрихи монограммы.

## Что получается

- `favicon/variants/*.svg` — 4 варианта знака (`v1-shield`, `v2-fort`, `v3-sight`,
  `v4-mono`) плюс служебные версии основного знака: `primary-small` (32/48 px),
  `primary-tiny` (16 px), `primary-maskable` (маскируемые иконки). В сборку не попадают.
- `public/` — то, что уходит на сайт: `favicon.svg`, `favicon.ico` (16/32/48),
  `favicon-16/32/48x48.png`, `apple-touch-icon.png`, `android-chrome-192/512x512.png`,
  `maskable-192/512x512.png`, `safari-pinned-tab.svg`.
- `favicon/preview.html` — служебная страница: все варианты в размерах 16–128 px
  на тёмном и светлом фоне. Открывается локально, в сборку не попадает.

Основной вариант — `v1-shield`. После смены `--primary` пересоберите PNG/ICO и
проверьте `favicon/preview.html`.

## Где что лежит

- Имена файлов иконок — только в `src/data/site.json` (`site.icons`). Оттуда их берут
  `src/partials/head.njk`, `site.webmanifest` (генерируется `nunjucks-plugin.mjs`)
  и JSON-LD (`logo` → `android-chrome-512x512.png`). Дублировать имена в разметке нельзя.
- Палитра знака — в `favicon/build.mjs` (`NIGHT`, `INK`, `FLAME`…), она повторяет
  переменные из `src/style.css`. При смене фирменного цвета менять нужно оба места.
- Геометрия монограммы описана один раз в `monogram()`; варианты только комбинируют её
  с плитой, рамкой-визиром или фундаментом.
- Роли размеров заданы в `RASTER_PLAN` и `pick`: 16 px → `primary-tiny`, 32/48 px →
  `primary-small`, apple-touch и maskable — `primary-maskable`, остальное — основной
  вариант. Добавили размер — допишите строку в `RASTER_PLAN`; ICO в favicon.ico
  собирается из PNG с размерами из `ICO_SIZES` (сейчас 16/32/48).

## Важно

- Сгенерированные файлы в `public/` нужно коммитить: общий `saits/build.sh` их не
  пересобирает, он только копирует `public/` в `dist/` и запускает `vite build`.
- Ссылка на `site.webmanifest` в разметке абсолютная (`/site.webmanifest`) — как и
  остальные внутренние ссылки; `saits/fix-paths.mjs` переводит её в относительную,
  чтобы сайт работал из подпапки (GitHub Pages).
