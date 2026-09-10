//
// настройки проекта
//

// состояние разработки сайта
const production = false

// папка локальной сборки (корень, который отдаёт browser-sync)
const local_dist = 'dist'
// путь к шаблону локально (совпадает с абсолютными путями /design/template/... в разметке)
const local_template = 'design/template'
// папка, куда складываются css/js/images/fonts/files/json
const folder = `${local_dist}/${local_template}`

//
// SRC правила
//

// header
const header_src = [
	'app/menu__left__fixed__list-moving/*.html',
	'app/background-stars/*.html',
	'app/banner__multi/*.html',
]

// index.html
const index_html = [
	// index
	{
		type: 'page',
		id: 1,
		src: [
			'app/catalog/pvh.html',
			'app/catalog/tkan.html',
			'app/catalog/potolki.html',
			'app/catalog/carniz-potoloch.html',
			'app/catalog/carniz-dlya-shtor.html',
			'app/catalog/osveshenie.html',
			'app/between-section/section-1.html',
			'app/text/15-let.html',
			'app/tabs/index.html',
		],
	},
	//
	// categoryes
	//

	// ПВХ потолки cat-pvh
	{
		type: 'category',
		id: 9,
		src: [
			'app/category-heading/cat-pvh.html',
			'app/category-images/cat-pvh.html',
			'app/category-description/cat-pvh.html',
		],
	},
	// Глянцевый glyanec
	{
		type: 'category',
		id: 10,
		src: [
			'app/category-heading/glyanec.html',
			'app/category-images/glyanec.html',
			'app/category-description/glyanec.html',
		],
	},
	// Сатиновый satin
	{
		type: 'category',
		id: 11,
		src: [
			'app/category-heading/satin.html',
			'app/category-images/satin.html',
			'app/category-description/satin.html',
		],
	},
	// Матовый matov
	{
		type: 'category',
		id: 12,
		src: [
			'app/category-heading/matov.html',
			'app/category-images/matov.html',
			'app/category-description/matov.html',
		],
	},
	// Тканевые потолки cat-tkan
	{
		type: 'category',
		id: 13,
		src: [
			'app/category-heading/cat-tkan.html',
			'app/category-images/cat-tkan.html',
			'app/category-description/cat-tkan.html',
		],
	},
	// Descor descor
	{
		type: 'category',
		id: 14,
		src: [
			'app/category-heading/descor.html',
			'app/category-images/descor.html',
			'app/category-description/descor.html',
		],
	},
	// Clipso clipso
	{
		type: 'category',
		id: 15,
		src: [
			'app/category-heading/clipso.html',
			'app/category-images/clipso.html',
			'app/category-description/clipso.html',
		],
	},
	// натяжные потолки natyazhnye-potolki
	{
		type: 'category',
		id: 38,
		src: [
			'app/category-heading/natyazhnye-potolki.html',
			'app/category-images/natyazhnye-potolki.html',
			'app/category-description/natyazhnye-potolki.html',
		],
	},
	// Прозрачная и полупрозрачные prozr
	{
		type: 'category',
		id: 16,
		src: [
			'app/category-heading/prozr.html',
			'app/category-images/prozr.html',
			'app/category-description/prozr.html',
		],
	},
	// Теневой ten
	{
		type: 'category',
		id: 17,
		src: [
			'app/category-heading/ten.html',
			'app/category-images/ten.html',
			'app/category-description/ten.html',
		],
	},
	// Световой light
	{
		type: 'category',
		id: 18,
		src: [
			'app/category-heading/light.html',
			'app/category-images/light.html',
			'app/category-description/light.html',
		],
	},
	// Бесщелевой besshel
	{
		type: 'category',
		id: 19,
		src: [
			'app/category-heading/besshel.html',
			'app/category-images/besshel.html',
			'app/category-description/besshel.html',
		],
	},
	// Парящий paryash
	{
		type: 'category',
		id: 20,
		src: [
			'app/category-heading/paryash.html',
			'app/category-images/paryash.html',
			'app/category-description/paryash.html',
		],
	},
	// Демпферные dempfer
	{
		type: 'category',
		id: 21,
		src: [
			'app/category-heading/dempfer.html',
			'app/category-images/dempfer.html',
			'app/category-description/dempfer.html',
		],
	},
	// Ниши в потолке nishi
	{
		type: 'category',
		id: 22,
		src: [
			'app/category-heading/nishi.html',
			'app/category-images/nishi.html',
			'app/category-description/nishi.html',
		],
	},
	// Двухуровневый dvuhurovn
	{
		type: 'category',
		id: 23,
		src: [
			'app/category-heading/dvuhurovn.html',
			'app/category-images/dvuhurovn.html',
			'app/category-description/dvuhurovn.html',
		],
	},
	// Потолочные ниши potoloch-nishi
	{
		type: 'category',
		id: 24,
		src: [
			'app/category-heading/potoloch-nishi.html',
			'app/category-images/potoloch-nishi.html',
			'app/category-description/potoloch-nishi.html',
		],
	},
	// Карниз carniz
	{
		type: 'category',
		id: 25,
		src: [
			'app/category-heading/carniz.html',
			'app/category-images/carniz.html',
			'app/category-description/carniz.html',
		],
	},
	// Потолочный карниз с блендой на натяжном потолке carniz-blenda
	{
		type: 'category',
		id: 26,
		src: [
			'app/category-heading/carniz-blenda.html',
			'app/category-images/carniz-blenda.html',
			'app/category-description/carniz-blenda.html',
		],
	},
	// Скрытый потолочный карниз carniz-skryt
	{
		type: 'category',
		id: 27,
		src: [
			'app/category-heading/carniz-skryt.html',
			'app/category-images/carniz-skryt.html',
			'app/category-description/carniz-skryt.html',
		],
	},
	// Скрытый потолочный карниз для штор с закрытым брусом carniz-shtor-zakr
	{
		type: 'category',
		id: 28,
		src: [
			'app/category-heading/carniz-shtor-zakr.html',
			'app/category-images/carniz-shtor-zakr.html',
			'app/category-description/carniz-shtor-zakr.html',
		],
	},
	// Универсальный скрытый потолочный карниз для штор carniz-shtor-universal
	{
		type: 'category',
		id: 29,
		src: [
			'app/category-heading/carniz-shtor-universal.html',
			'app/category-images/carniz-shtor-universal.html',
			'app/category-description/carniz-shtor-universal.html',
		],
	},
	// Освещение osveshenie
	{
		type: 'category',
		id: 30,
		src: [
			'app/category-heading/osveshenie.html',
			'app/category-images/osveshenie.html',
			'app/category-description/osveshenie.html',
		],
	},
	// Светильники scetilniki
	{
		type: 'category',
		id: 31,
		src: [
			'app/category-heading/scetilniki.html',
			'app/category-images/scetilniki.html',
			'app/category-description/scetilniki.html',
		],
	},
	// Встраиваемые cat-built-in
	{
		type: 'category',
		id: 32,
		src: [
			'app/category-heading/cat-built-in.html',
			'app/category-images/cat-built-in.html',
			'app/category-description/cat-built-in.html',
		],
	},
	// Накладной cat-waybills
	{
		type: 'category',
		id: 33,
		src: [
			'app/category-heading/cat-waybills.html',
			'app/category-images/cat-waybills.html',
			'app/category-description/cat-waybills.html',
		],
	},
	// Трековые система cat-trek
	{
		type: 'category',
		id: 34,
		src: [
			'app/category-heading/cat-trek.html',
			'app/category-images/cat-trek.html',
			'app/category-description/cat-trek.html',
		],
	},
	// Люстры cat-chandelier
	{
		type: 'category',
		id: 35,
		src: [
			'app/category-heading/cat-chandelier.html',
			'app/category-images/cat-chandelier.html',
			'app/category-description/cat-chandelier.html',
		],
	},
	// Световые линии svet-lin
	{
		type: 'category',
		id: 36,
		src: [
			'app/category-heading/svet-lin.html',
			'app/category-images/svet-lin.html',
			'app/category-description/svet-lin.html',
		],
	},
	// Лайт боксы l-box
	{
		type: 'category',
		id: 37,
		src: [
			'app/category-heading/l-box.html',
			'app/category-images/l-box.html',
			'app/category-description/l-box.html',
		],
	},

	//
	// pages
	//

	// lighting
	{
		type: 'page',
		id: 12,
		src: ['app/gallery__multi-one-page/lighting.html'],
	},
	// portfolio
	{
		type: 'page',
		id: 7,
		src: [
			'app/category-heading/portfolio.html',
			'app/tabs/portfolio.html',
		],
	},
	// calculator
	{
		type: 'page',
		id: 10,
		src: ['app/calculator/*.html'],
	},
]

// метаданные страниц для локальной статической сборки
// (имя файла и <title> для каждой страницы/категории из index_html)
const page_meta = {
	'page_1': { name: 'index', title: 'Натяжные потолки' },
	'page_7': { name: 'portfolio', title: 'Портфолио' },
	'page_10': { name: 'calculator', title: 'Калькулятор' },
	'page_12': { name: 'lighting', title: 'Освещение' },
	'category_9': { name: 'catalog/cat-pvh', title: 'ПВХ потолки' },
	'category_10': { name: 'catalog/glyanec', title: 'Глянцевые потолки' },
	'category_11': { name: 'catalog/satin', title: 'Сатиновые потолки' },
	'category_12': { name: 'catalog/matov', title: 'Матовые потолки' },
	'category_13': { name: 'catalog/cat-tkan', title: 'Тканевые потолки' },
	'category_14': { name: 'catalog/descor', title: 'Descor' },
	'category_15': { name: 'catalog/clipso', title: 'Clipso' },
	'category_38': { name: 'catalog/natyazhnye-potolki', title: 'Натяжные потолки' },
	'category_16': { name: 'catalog/prozr', title: 'Прозрачные потолки' },
	'category_17': { name: 'catalog/ten', title: 'Теневой потолок' },
	'category_18': { name: 'catalog/light', title: 'Световой потолок' },
	'category_19': { name: 'catalog/besshel', title: 'Бесщелевой потолок' },
	'category_20': { name: 'catalog/paryash', title: 'Парящий потолок' },
	'category_21': { name: 'catalog/dempfer', title: 'Демпферные потолки' },
	'category_22': { name: 'catalog/nishi', title: 'Ниши в потолке' },
	'category_23': { name: 'catalog/dvuhurovn', title: 'Двухуровневый потолок' },
	'category_24': { name: 'catalog/potoloch-nishi', title: 'Потолочные ниши' },
	'category_25': { name: 'catalog/carniz', title: 'Карниз' },
	'category_26': { name: 'catalog/carniz-blenda', title: 'Потолочный карниз с блендой' },
	'category_27': { name: 'catalog/carniz-skryt', title: 'Скрытый потолочный карниз' },
	'category_28': { name: 'catalog/carniz-shtor-zakr', title: 'Скрытый карниз для штор' },
	'category_29': { name: 'catalog/carniz-shtor-universal', title: 'Универсальный скрытый карниз' },
	'category_30': { name: 'catalog/osveshenie', title: 'Освещение' },
	'category_31': { name: 'catalog/scetilniki', title: 'Светильники' },
	'category_32': { name: 'catalog/cat-built-in', title: 'Встраиваемые светильники' },
	'category_33': { name: 'catalog/cat-waybills', title: 'Накладные светильники' },
	'category_34': { name: 'catalog/cat-trek', title: 'Трековая система' },
	'category_35': { name: 'catalog/cat-chandelier', title: 'Люстры' },
	'category_36': { name: 'catalog/svet-lin', title: 'Световые линии' },
	'category_37': { name: 'catalog/l-box', title: 'Лайт боксы' },
}

const get_page_meta = (data) =>
	page_meta[`${data.type}_${data.id}`] || {
		name: `${data.type}_${data.id}`,
		title: `Страница ${data.id}`,
	}

// footer
const footer_src = [
	'app/form/*.html',
	'app/between-section/section-4.html',
	'app/footer__catalog__pages/*.html',
	'app/footer-line/*.html',
	// source
	'app/go-top__quadr/*.html',
	'app/gallery__multi-one-page/modal.html',
]

// js
const js_src = ['template/*.js', 'app/**/*.js', 'revisions/*.js']

// sass
const sass_src = [
	'template/_preset.sass',
	'revisions/_preset.sass',
	'template/*.sass',
	'app/**/_preset.sass',
	'app/**/*.sass',
	'revisions/*.sass',
]

//images
const images_src = [
	'app/**/*.jpg',
	'template/**/*.jpg',
	'revisions/**/*.jpg',

	'app/**/*.svg',
	'template/**/*.svg',
	'revisions/**/*.svg',

	'app/**/*.png',
	'template/**/*.png',
	'revisions/**/*.png',

	'app/**/*.webp',
	'template/**/*.webp',
	'revisions/**/*.webp',

	'app/**/*.ico',
	'template/**/*.ico',
	'revisions/**/*.ico',
]

const json_src = ['app/**/*.json'] // json
const files_src = ['app/**/*.doc'] // files
// fonts
const fonts_src = [
	'template/fonts/**/*.eot',
	'template/fonts/**/*.svg',
	'template/fonts/**/*.ttf',
	'template/fonts/**/*.woff',
	'template/fonts/**/*.woff2',
]

//
// подключение модулей
//

const { src, dest, series, watch } = require('gulp') // галп
const fs = require('fs')
const { Transform } = require('stream')
const sass = require('gulp-sass')(require('sass'))
const csso = require('gulp-csso')
const html_min = require('gulp-htmlmin')
const auto_prefixer = require('gulp-autoprefixer')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default
const image_min = require('gulp-imagemin')
const del = require('del')
const set_header = require('gulp-header')
const set_footer = require('gulp-footer')
const gulp_if = require('gulp-if')
const sync = require('browser-sync').create() // создание локал хоста

//
// основное тело галпа
//

//
// очистка php/smarty-вставок для статического просмотра на локалхосте
//

const clean_tags = () => {
	return new Transform({
		objectMode: true,
		transform(file, enc, cb) {
			if (file.isBuffer()) {
				let content = file.contents.toString()
				content = content
					// php-блоки и короткие вставки
					.replace(/<\?php[\s\S]*?\?>/g, '')
					.replace(/<\?=[\s\S]*?\?>/g, '')
					.replace(/<\?[\s\S]*?\?>/g, '')
					// smarty-теги
					.replace(/\{php\}[\s\S]*?\{\/php\}/g, '')
					.replace(/\{\*[\s\S]*?\*\}/g, '')
					.replace(/\{foreach[^}]*\}/g, '')
					.replace(/\{\/foreach\}/g, '')
					.replace(/\{if[^}]*\}/g, '')
					.replace(/\{\/if\}/g, '')
					.replace(/\{elseif[^}]*\}/g, '')
					.replace(/\{else\}/g, '')
					.replace(/\{\$[^}]*\}/g, '')
					.replace(/\{literal\}/g, '')
					.replace(/\{\/literal\}/g, '')
				file.contents = Buffer.from(content)
			}
			cb(null, file)
		},
	})
}

//
// исправление постоянных ссылок на статические .html (для локального просмотра)
//

const fix_links = () => {
	return new Transform({
		objectMode: true,
		transform(file, enc, cb) {
			if (file.isBuffer()) {
				let content = file.contents.toString()
				// категории /catalog/{slug} -> /catalog/{slug}.html
				for (let i = 0; i < index_html.length; i++) {
					const { name } = get_page_meta(index_html[i])
					if (name.indexOf('catalog/') === 0) {
						const slug = name.replace('catalog/', '')
						content = content.replace(
							new RegExp(`href="/catalog/${slug}"`, 'g'),
							`href="/catalog/${slug}.html"`
						)
					}
				}
				// главная страница
				content = content.replace(/href="\/"/g, 'href="/index.html"')
				// остальные страницы (lighting, portfolio, calculator)
				for (let i = 0; i < index_html.length; i++) {
					const { name } = get_page_meta(index_html[i])
					if (name.indexOf('catalog/') !== 0 && name !== 'index') {
						content = content.replace(
							new RegExp(`href="/${name}"`, 'g'),
							`href="/${name}.html"`
						)
					}
				}
				file.contents = Buffer.from(content)
			}
			cb(null, file)
		},
	})
}

//
// очистка папок сборки
//

// временная папка для промежуточных файлов
const tmp_folder = 'local/'

const del_local = () => {
	return del(tmp_folder)
}

const del_dist = () => {
	return del(`${local_dist}/`)
}

//
// общий минификатор html
//

const html_minify = () =>
	html_min({
		collapseWhitespace: true,
		removeComments: true,
		removeTagWhitespace: true,
		ignoreCustomFragments: [/<svg.*\/svg>/],
	})

// сборка шапки во временный файл
const build_header = () => {
	return src(header_src).pipe(concat('header.html')).pipe(clean_tags()).pipe(dest(tmp_folder))
}

// сборка подвала во временный файл
const build_footer = () => {
	return src(footer_src).pipe(concat('footer.html')).pipe(clean_tags()).pipe(dest(tmp_folder))
}

//
// сборка контента страниц во временные файлы
//

const build_local_file = (data) => {
	return src(data.src)
		.pipe(concat(`${data.type}_${data.id}.html`))
		.pipe(clean_tags())
		.pipe(dest(tmp_folder))
}

const stream_done = (stream) =>
	new Promise((resolve, reject) => {
		stream.on('end', resolve)
		stream.on('error', reject)
	})

const build_local = async () => {
	for (let i = 0; i < index_html.length; i++) {
		await stream_done(build_local_file(index_html[i]))
	}
	return true
}

//
// сборка статических html-страниц (скелет + шапка + контент + подвал)
//

const page_skeleton = (title, header, content, footer) => `<!doctype html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${title}</title>
	<link rel="shortcut icon" href="/design/template/images/template-icon/favicon.ico">
	<link rel="stylesheet" href="/design/template/css/style.min.css">
</head>
<body>
	${header}
	${content}
	${footer}
	<script src="/design/template/js/script.min.js"></script>
</body>
</html>`

const build_page = (data, header, footer) => {
	const { name, title } = get_page_meta(data)
	return src(`${tmp_folder}${data.type}_${data.id}.html`)
		.pipe(
			new Transform({
				objectMode: true,
				transform(file, enc, cb) {
					if (file.isBuffer()) {
						const html = page_skeleton(title, header, file.contents.toString(), footer)
						file.contents = Buffer.from(html)
					}
					cb(null, file)
				},
			})
		)
		.pipe(html_minify())
		.pipe(fix_links())
		.pipe(concat(`${name}.html`))
		.pipe(dest(local_dist))
}

const build_pages = async () => {
	const header = fs.readFileSync(`${tmp_folder}header.html`, 'utf8')
	const footer = fs.readFileSync(`${tmp_folder}footer.html`, 'utf8')
	for (let i = 0; i < index_html.length; i++) {
		await stream_done(build_page(index_html[i], header, footer))
	}
	return true
}

//
// сбор всех scss из папки src и перенос css в папку дист
//

const build_sass = () => {
	return src(sass_src)
		.pipe(concat('style.sass'))
		.pipe(
			sass({
				indentedSyntax: false,
			})
		)
		.pipe(
			auto_prefixer({
				overrideBrowserslist: 'last 2 versions',
			})
		)
		.pipe(concat('style.min.css'))
		.pipe(gulp_if(!production, csso()))
		.pipe(dest(`${folder}/css`))
}

//
// сбор всех js из папки src и перенос их в папку дист
//

const build_js = () => {
	return src(js_src)
		.pipe(concat('script.min.js'))
		.pipe(gulp_if(!production, uglify()))
		.pipe(dest(`${folder}/js`))
}

//
// сбор всех фаилов и перенос их в папку дист
//
const export_images = () => {
	return src(images_src).pipe(dest(`${folder}/images`))
}
const export_json = () => {
	return src(json_src).pipe(dest(`${folder}/json`))
}
const export_files = () => {
	return src(files_src).pipe(dest(`${folder}/files`))
}
const export_fonts = () => {
	return src(fonts_src).pipe(dest(`${folder}/fonts`))
}
//
// минимизация всех изображений в папке src/app и записывание их на то же место
//

const get_src_min_img = () => {
	return src('src/**/*')
		.pipe(
			image_min([
				image_min.gifsicle({ interlaced: true }),
				image_min.mozjpeg({
					quality: 75,
					progressive: true,
				}),
				image_min.optipng({
					optimizationLevel: 5,
				}),
				image_min.svgo({
					plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
				}),
			])
		)
		.pipe(dest('src/'))
}
const get_app_min_img = () => {
	return src('app/**/*')
		.pipe(
			image_min([
				image_min.gifsicle({ interlaced: true }),
				image_min.mozjpeg({
					quality: 75,
					progressive: true,
				}),
				image_min.optipng({
					optimizationLevel: 5,
				}),
				image_min.svgo({
					plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
				}),
			])
		)
		.pipe(dest('app/'))
}

//
// to watch
//

const toWatch = () => {
	for (let i = 0; i < index_html.length; i++) {
		watch(index_html[i].src, series(build_local, build_pages, sync_reload))
	}
	watch(header_src, series(build_header, build_pages, sync_reload))
	watch(footer_src, series(build_footer, build_pages, sync_reload))
	watch(sass_src, series(build_sass, sync_reload))
	watch(js_src, series(build_js, sync_reload))

	watch(images_src, series(export_images, sync_reload))
	watch(json_src, series(export_json, sync_reload))
	watch(files_src, series(export_files, sync_reload))
}

//
// локальный сервер (browser-sync)
//

// запуск локального сервера на папке dist
const sync_init = (done) => {
	sync.init({
		server: {
			baseDir: local_dist,
		},
		port: 3000,
		notify: false,
		open: true,
	})
	done()
}

// перезагрузка браузера после изменений
const sync_reload = (done) => {
	sync.reload()
	done()
}

//
// объявление функции для консоли
//

exports.del = series(del_local, del_dist) // очистка папок сборки
exports.min = series(get_app_min_img, get_src_min_img) // минимизация всех изображений в папке src

// сборка на локальный хост (одноразово, без watcher и сервера)
exports.build = series(
	del_local,
	del_dist,
	build_sass,
	build_js,

	build_header,
	build_footer,
	build_local,

	export_images,
	export_json,
	export_fonts,
	export_files,

	build_pages
)

// выполнение всех программ, запуск локального сервера и ватчинг
exports.default = series(
	del_local,
	del_dist,
	build_sass,
	build_js,

	build_header,
	build_footer,
	build_local,

	export_images,
	export_json,
	export_fonts,
	export_files,

	build_pages,
	sync_init,
	toWatch
)
