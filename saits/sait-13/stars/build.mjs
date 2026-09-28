// ============================================================
// stars/build.mjs — генератор поля звёзд для блока «Заявка на расчёт»
//
// Поле звёзд — это рисунок, а не дизайн: тысячи пар «x y» в box-shadow,
// которые руками не поддерживать. Поэтому рисунок собирается скриптом, а
// результат лежит в src/stars.css (данные, не токены). Правки вносим сюда и
// пересобираем файл, а координаты в CSS не правим.
//
// Запуск (из папки saits/sait-13):  npm run stars   (или node stars/build.mjs)
// Пишет:                            src/stars.css
//
// Сид фиксирован, поэтому запуск воспроизводим: повторный прогон даёт тот же
// файл (проверено по хэшу). Благодаря этому генератор встроен в сборку сайта
// («npm run build» вызывает «npm run stars» первым шагом) — расхождение между
// скриптом и src/stars.css невозможно.
//
// Зависимостей нет: только node:fs и node:path.
// ============================================================
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

// Полоса поля. По X — ширина, которую перекрываем: она шире колонки сайта
// (--shell: 1240px), чтобы на широком мониторе звёзды не обрывались у правого
// края. По Y — высота рисунка; в CSS она же становится шагом бесшовного
// дрейфа (--stars-band в style.css), поэтому менять полосу нужно здесь и в
// токене одновременно.
const WIDTH = 2800
const BAND = 1400

// Слой = один рисунок со своим размером точки. Размер, оттенок, бледность и
// скорость заданы токенами --stars-* в style.css; здесь только данные поля:
// сколько звёзд, какая минимальная дистанция между ними и сид. Сид фиксирован,
// поэтому один и тот же запуск даёт тот же файл — рисунок воспроизводим.
//
// Порядок массива = порядок правил в CSS и порядок слоёв в разметке: от
// дальнего к ближнему. Размер задаётся токеном --stars-<key>-size, но
// договорённость такая: чем позже слой, тем он крупнее и ближе.
const LAYERS = [
	{ key: 'far', count: 340, seed: 13061301, gap: 12 },
	{ key: 'mid', count: 280, seed: 13061302, gap: 13 },
	{ key: 'near', count: 170, seed: 13061303, gap: 22 },
	{ key: 'spark', count: 26, seed: 13061304, gap: 62 },
	{ key: 'giant', count: 18, seed: 13061305, gap: 104 },
]

// mulberry32 — короткий детерминированный генератор случайных чисел: без сида
// рисунок каждый раз был бы новый, и файл в репозитории менялся бы сам собой.
function mulberry32(seed) {
	let a = seed >>> 0
	return () => {
		a = (a + 0x6d2b79f5) >>> 0
		let t = a
		t = Math.imul(t ^ (t >>> 15), t | 1)
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

// Поле слоя: точки раскидываются по полосе, но не ближе gap друг к другу.
// Проверка идёт по пространственной сетке, поэтому сгустков не остаётся,
// а поле собирается за доли секунды.
function buildField({ count, seed, gap }) {
	const rnd = mulberry32(seed)
	const cell = Math.max(4, Math.round(gap))
	const grid = new Map()
	const stars = []
	let guard = 0
	while (stars.length < count && guard < count * 80) {
		guard += 1
		const x = Math.round(rnd() * WIDTH)
		const y = Math.round(rnd() * BAND)
		const cx = Math.floor(x / cell)
		const cy = Math.floor(y / cell)
		let free = true
		for (let i = -1; i <= 1 && free; i += 1) {
			for (let j = -1; j <= 1; j += 1) {
				const bucket = grid.get(`${cx + i}:${cy + j}`)
				if (!bucket) continue
				for (const [px, py] of bucket) {
					if (Math.hypot(px - x, py - y) < gap) {
						free = false
						break
					}
				}
			}
		}
		if (!free) continue
		const key = `${cx}:${cy}`
		if (!grid.has(key)) grid.set(key, [])
		grid.get(key).push([x, y])
		stars.push([x, y])
	}
	return stars
}

// Значение пользовательского свойства переносим по строкам: одна строка на
// четыре звезды, иначе поле уходит в один ряд длиной в экран и файл нельзя
// ни читать, ни диффить. CSS перенос значения допускает.
function formatField(stars, indent = '\t\t', perLine = 4) {
	const lines = []
	for (let i = 0; i < stars.length; i += perLine) {
		const chunk = stars
			.slice(i, i + perLine)
			.map(([x, y]) => `${x}px ${y}px`)
			.join(', ')
		lines.push(indent + chunk + (i + perLine < stars.length ? ',' : ';'))
	}
	return lines.join('\n')
}

const fields = LAYERS.map((layer) => ({
	key: layer.key,
	stars: buildField(layer),
}))

const total = fields.reduce((sum, f) => sum + f.stars.length, 0)

// Правила слоёв собираем из того же массива LAYERS: новый слой достаточно
// добавить в LAYERS и описать токенами --stars-<key>-* в style.css. Если
// дописывать правила руками, слой легко забыть — и он молча останется пустым.
const layerRules = fields
	.map(
		({ key }) => `.stars--${key} {
	--stars-size: var(--stars-${key}-size);
	--stars-field: var(--stars-${key}-field);
	--stars-tint: var(--stars-${key}-tint);
	--stars-opacity: var(--stars-${key}-opacity);
	--stars-speed: var(--stars-${key}-speed);
}`,
	)
	.join('\n\n')

const header = `/* ============================================================
   stars.css — «ночное небо» под блоком «Заявка на расчёт»

   Файл собран генератором: npm run stars (node stars/build.mjs)
   (правки — в генераторе, координаты вручную не правятся).

   Метод: звезда — это элемент в 1–4 px с огромным полем теней box-shadow,
   а псевдоэлемент ::after повторяет то же поле сдвигом на высоту полосы
   (--stars-band). Слой медленно уезжает вверх на эту же высоту, поэтому
   рисунок прокручивается без шва и без второй копии данных в CSS.
   Тень без цвета берёт currentColor, поэтому оттенок слоя — это одна
   строка --stars-*-tint, а не цвет у каждой звезды.

   Пять слоёв идут с разной скоростью: дальний (${fields[0].stars.length} звёзд, 1 px) еле
   движется, ближний (${fields[2].stars.length} звёзд, 2 px) идёт заметно быстрее — поле читается
   как глубина, а не как одна плёнка. Два редких слоя задают передний план:
   искры (${fields[3].stars.length}, 3 px, --color-flame) связывают подложку с тёплым акцентом
   сайта, крупные звёзды (${fields[4].stars.length}, 4 px, --color-snow) держат «ближний план».
   Оба слоя нарочно разрежены, чтобы не спорить с заголовком и формой.

   Оформление слоёв (размер, оттенок, бледность, скорость) — токены
   --stars-* в src/style.css. Ниже только рисунок. Всего ${total} звёзд на полосе
   ${WIDTH}×${BAND} px; сиды фиксированы, поэтому пересборка файла рисунок не меняет.
   ============================================================ */

/* Рисунок поля: данные генератора, а не дизайн-токены — смысл имеет только
   пара «x y» на полосе и размер точки. Исключение из правила «ноль хардкода»
   осознанное и помечено маркерами ниже. */
/* ds-allow-hardcode:start */
:root {
`

const body = fields
	.map(
		({ key, stars }) => `\t--stars-${key}-field:
${formatField(stars)}
`,
	)
	.join('\n')

const footer = `}
/* ds-allow-hardcode:end */

/* ---------- подложка секции ---------- */
/* Слой лежит под контентом секции (z-index: -1 внутри stacking context .band,
   так же устроены .bg-scheme блока нормативов и .bg-survey блока контекста):
   звёзды видны поверх фона секции, но под текстом и карточкой формы.
   Секция выше окна, лишнее срезает overflow, поэтому по горизонтали страница
   не едет. Текста слой не несёт — он декоративный: aria-hidden в разметке,
   pointer-events выключены, порог 3:1 «UI / graphics» к нему не применяется. */
.stars-bg {
	position: absolute;
	inset: 0;
	z-index: -1;
	overflow: hidden;
	pointer-events: none;
}

/* Точка-звезда и её дубль. Правила общие: дубль обязан совпадать с
   оригиналом до пикселя, иначе на прокрутке появляется шов. */
.stars,
.stars::after {
	position: absolute;
	left: 0;
	width: var(--stars-size);
	height: var(--stars-size);
	border-radius: 50%;
	background: transparent;
	box-shadow: var(--stars-field);
}

.stars {
	top: 0;
	color: var(--stars-tint);
	opacity: var(--stars-opacity);
	animation: stars-drift var(--stars-speed) linear infinite;
}

/* Дубль поля ровно на полосу вниз: уезжая вверх на --stars-band, слой
   возвращается к своему же рисунку. */
.stars::after {
	content: '';
	top: var(--stars-band);
}

${layerRules}

@keyframes stars-drift {
	from {
		transform: translateY(0);
	}
	to {
		transform: translateY(calc(var(--stars-band) * -1));
	}
}

/* Движение выключаем полностью: небо остаётся статичной фактурой фона, как
   точки и декор светлых секций. */
@media (prefers-reduced-motion: reduce) {
	.stars {
		animation: none;
	}
}
`

writeFileSync(
	join(siteRoot, 'src', 'stars.css'),
	header + body + footer,
	'utf8',
)

console.log(
	`stars.css: ${total} звёзд — ${fields
		.map((f) => `${f.key} ${f.stars.length}`)
		.join(', ')}`,
)
