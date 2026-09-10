//
// настройки проекта
//

// состояние разработки сайта
const production = false
// папка локальной сборки
const local_dist = 'dist'
// путь к шаблону локально (совпадает с абсолютными путями /wp-content/themes/twentytwentyone/... в разметке)
const local_template = 'wp-content/themes/twentytwentyone'
// папка, куда складываются css/js/images/fonts/json/files
const folder = `${local_dist}/${local_template}`

//
// SRC правила
//

// header-top (шапка: head + <body> + <header>)
const header_top_src = ['app/_template/header-top.php']

// содержимое шапки (логотип, переключатель языка, баннер)
const header_body_src = [
	'app/header__logo/*.html',
	'app/multy-lang/index.html',
	'app/header__banner/*.html',
]

// header-bottom (закрытие <header>, <menu> с get_template_part('menu'), открытие <main>)
const header_bottom_src = ['app/_template/header-bottom.php']

// меню (подставляется вместо get_template_part('menu'))
const menu_src = ['app/header__menu/*.php']

// main (основной контент страницы)
const main_src = ['app/index/*.html']

// footer-top (закрытие <main>, <aside> с get_template_part('aside'), открытие <footer>)
const footer_top_src = ['app/_template/footer-top.php']

// aside (подставляется вместо get_template_part('aside'))
const aside_src = ['app/aside__arhivs/*.php', 'app/aside__btn/*.html']

// содержимое подвала (footer + source + кнопка "наверх")
const footer_body_src = [
	'app/footer/*.php',
	// source
	'app/_template/*.html',
	'app/go-top--quadr/*.html',
]

// footer-bottom (get_template_part('form'), закрытие <footer>, </body></html>)
const footer_bottom_src = ['app/_template/footer-bottom.php']

// js
const js_src = ['app/_template/*.js', 'app/**/*.js']

// sass
const sass_src = [
	'app/_template/_preset.sass',
	'app/**/_preset.sass',
	'app/_template/*.sass',
	'app/**/*.sass',
]

//images
const images_src = [
	'app/**/*.jpg',
	'app/**/*.svg',
	'app/**/*.png',
	'app/**/*.webp',
	'app/**/*.gif',
	'app/**/*.ico',
]

const json_src = ['app/**/*.json'] // json
const files_src = ['app/**/*.doc'] // files
// fonts
const fonts_src = [
	'app/_template/fonts/**/*.eot',
	'app/_template/fonts/**/*.svg',
	'app/_template/fonts/**/*.ttf',
	'app/_template/fonts/**/*.woff',
	'app/_template/fonts/**/*.woff2',
]

//
// подключение модулей
//

const { src, dest, series, watch } = require('gulp') // галп
const fs = require('fs')
const sass = require('gulp-sass')(require('sass'))
const csso = require('gulp-csso')
const auto_prefixer = require('gulp-autoprefixer')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default
const image_min = require('gulp-imagemin')
const del = require('del')
const gulp_if = require('gulp-if')

const sync = require('browser-sync').create() // создание локал хоста

//
// основное тело галпа
//

// заголовок страницы
const get_title = () => 'Вопросы региональной экономики'

// чтение всех файлов по glob-шаблонам и склейка в одну строку (в порядке шаблонов)
const read_files = (globs) =>
	new Promise((resolve, reject) => {
		let result = ''
		src(globs, { allowEmpty: true })
			.on('data', (file) => {
				result += file.contents.toString()
			})
			.on('end', () => resolve(result))
			.on('error', reject)
	})

// очистка php-вставок (<?php ... ?>, <?= ... ?>) для статического просмотра
const clean_tags = (str) =>
	str
		.replace(/<\?php[\s\S]*?\?>/g, '')
		.replace(/<\?=[\s\S]*?\?>/g, '')
		.replace(/<\?[\s\S]*?\?>/g, '')

// подстановка содержимого get_template_part('name') на место вызова
const inline_partial = (template, name, content) => {
	const call = `get_template_part('${name}')`
	const start = template.indexOf(call)
	if (start === -1) return template
	const open = template.lastIndexOf('<?php', start)
	const close = template.indexOf('?>', start) + 2
	return template.slice(0, open) + content + template.slice(close)
}

// очистка папки локальной сборки
const del_dist = () => {
	return del(`${local_dist}/`)
}

// сборка статической страницы index.html
const build_page = async () => {
	const header_top = await read_files(header_top_src)
	const header_body = await read_files(header_body_src)
	const header_bottom = await read_files(header_bottom_src)
	const menu = await read_files(menu_src)
	const main = await read_files(main_src)
	const footer_top = await read_files(footer_top_src)
	const aside = await read_files(aside_src)
	const footer_body = await read_files(footer_body_src)
	const footer_bottom = await read_files(footer_bottom_src)

	// шапка: header-top + содержимое + header-bottom (с меню внутри)
	const header = header_top + header_body + inline_partial(header_bottom, 'menu', menu)
	// подвал: footer-top (с aside внутри) + содержимое + footer-bottom
	const footer = inline_partial(footer_top, 'aside', aside) + footer_body + footer_bottom

	const page = header + main + footer

	let html = clean_tags(page)
	html = html.replace('<head>', `<head><title>${get_title()}</title>`)

	fs.mkdirSync(local_dist, { recursive: true })
	fs.writeFileSync(`${local_dist}/index.html`, html)

	return true
}

//
// сбор всех sass из папки src и перенос css в папку дист
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
	return src(images_src)
		.pipe(
			gulp_if(
				!production,
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
		)
		.pipe(dest(`${folder}/images`))
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

const get_min_img = () => {
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

const html_watch_src = [
	...header_top_src,
	...header_body_src,
	...header_bottom_src,
	...menu_src,
	...main_src,
	...footer_top_src,
	...aside_src,
	...footer_body_src,
	...footer_bottom_src,
]

const toWatch = () => {
	// html
	watch(html_watch_src, series(build_page, sync_reload))

	// css, js
	watch(sass_src, series(build_sass, sync_reload))
	watch(js_src, series(build_js, sync_reload))

	// other
	watch(images_src, series(export_images, sync_reload))
	watch(json_src, series(export_json, sync_reload))
	watch(files_src, series(export_files, sync_reload))
	watch(fonts_src, series(export_fonts, sync_reload))
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

exports.min = series(get_min_img) // минимизация всех изображений в папке src
exports.del = series(del_dist) // очистка папки локальной сборки

// сборка на локальный хост (одноразово, без watcher и сервера)
exports.build = series(
	del_dist,
	build_page,
	build_sass,
	build_js,
	export_images,
	export_json,
	export_fonts,
	export_files
)

// выполнение всех программ, запуск локального сервера и ватчинг
exports.default = series(
	del_dist,
	build_page,
	build_sass,
	build_js,
	export_images,
	export_json,
	export_fonts,
	export_files,
	sync_init,
	toWatch
)
