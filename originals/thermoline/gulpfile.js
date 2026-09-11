//
// настройки проекта
//

// состояние разработки сайта
const production = false

// папка локальной сборки
const local_dist = 'dist'
// путь к шаблону локально (совпадает с абсолютными путями /wp-content/themes/twentytwentyone/... в разметке)
const local_template = 'wp-content/themes/twentytwentyone'
// папка, куда складываются css/js/images/fonts/files/json
const folder = `${local_dist}/${local_template}`

//
// SRC правила
//

// header
const header_src = [
	'app/_wordpress-parts/build/header-top.php',
	'app/menu/index.html',
	'app/_wordpress-parts/build/header-bottom.php',
]

// footer
const footer_src = [
	'app/_wordpress-parts/build/footer-top.php',

	// source
	'app/form__modal-callback/*.html',
	'app/go-top--quadr/*.html',
	'app/svg-style/*.html',

	'app/_wordpress-parts/build/footer-bottom.php',
]

// mains
const mains_data = require('./app/_template/data.json')

// js
const js_src = ['app/_template/*.js', 'app/**/*.js']

// sass
const sass_src = [
	'app/_template/_preset.sass',
	'app/**/_preset.sass',
	'app/_template/*.sass',
	'app/**/*.sass',
]

//
// export
//

//images
const images_src = [
	'app/**/*.jpg',
	'app/**/*.svg',
	'app/**/*.png',
	'app/**/*.webp',
	'app/**/*.gif',
	'app/**/*.ico',
]

// json
const json_src = ['app/**/*.json']

// files
const files_src = ['app/**/*.doc']

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
const { Transform } = require('stream')
const sass = require('gulp-sass')(require('sass'))
const csso = require('gulp-csso')
const html_min = require('gulp-htmlmin')
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

//
// очистка php-вставок (<?php ... ?>, <?= ... ?>) для статического просмотра
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
				file.contents = Buffer.from(content)
			}
			cb(null, file)
		},
	})
}

//
// сборка статических html-страниц
//

// временная папка для промежуточных файлов
const tmp_folder = 'local/'

// общий минификатор html
const html_minify = () =>
	html_min({
		collapseWhitespace: true,
		removeComments: true,
		removeTagWhitespace: true,
		ignoreCustomFragments: [/<svg.*\/svg>/],
	})

// сборка шапки во временный файл (без минификации — соберём полный документ и сожмём его целиком)
const build_header_html = () => {
	return src(header_src)
		.pipe(concat('header.html'))
		.pipe(clean_tags())
		.pipe(dest(tmp_folder))
}

// сборка подвала во временный файл
const build_footer_html = () => {
	return src(footer_src)
		.pipe(concat('footer.html'))
		.pipe(clean_tags())
		.pipe(dest(tmp_folder))
}

//
// очистка папок сборки
//

// очистка временной папки
const del_local = () => {
	return del(tmp_folder)
}

// очистка папки локальной сборки
const del_dist = () => {
	return del(`${local_dist}/`)
}

// каркас <main> (как в оригинальном index.php: <main id="main" class="main"></main>)
const main_open = '<main id="main" class="main">'
const main_close = '</main>'

// ожидание завершения потока
const stream_done = (stream) =>
	new Promise((resolve, reject) => {
		stream.on('end', resolve)
		stream.on('error', reject)
	})

// сборка страницы-оболочки (header + пустой <main> + footer) в dist/index.html
// содержимое <main> подгружается скриптом ajax из mains/*.html
const build_shell = () => {
	const header = fs.readFileSync(`${tmp_folder}header.html`, 'utf8')
	const footer = fs.readFileSync(`${tmp_folder}footer.html`, 'utf8')
	// вставляем <title> сразу после <head> (в оригинале его выводит wp_head())
	const title = (mains_data['index'] && mains_data['index'].tytle) || 'Главная'
	const page_header = header.replace('<head>', `<head><title>${title}</title>`)
	const html = page_header + main_open + main_close + footer

	return src('app/ajax/template.html')
		.pipe(
			new Transform({
				objectMode: true,
				transform(file, enc, cb) {
					file.contents = Buffer.from(html)
					cb(null, file)
				},
			})
		)
		.pipe(html_minify())
		.pipe(concat('index.html'))
		.pipe(dest(local_dist))
}

//
// build mains (ajax-фрагменты)
//

// сборка одного ajax-фрагмента из mains_data
const build_main = (source, name) => {
	return src(source)
		.pipe(concat(`${name}.html`))
		.pipe(clean_tags())
		.pipe(html_minify())
		.pipe(dest(`${folder}/mains`))
}

// сборка всех ajax-фрагментов
const build_mains = async () => {
	await Promise.all(
		Object.keys(mains_data).map((key) =>
			stream_done(build_main(mains_data[key].src, key))
		)
	)
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

const toWatch = () => {
	// html
	watch(header_src, series(build_header_html, build_shell, sync_reload))
	watch(footer_src, series(build_footer_html, build_shell, sync_reload))

	for (const key in mains_data) {
		watch(
			mains_data[key].src,
			series(async () => {
				await stream_done(build_main(mains_data[key].src, key))
			}, sync_reload)
		)
	}

	// css, js
	watch(sass_src, series(build_sass, sync_reload))
	watch(js_src, series(build_js, sync_reload))

	// other
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
		// По умолчанию browser-sync вставляет свой скрипт сразу после открывающего
		// тега <body ...> по регэкспу /<body[^>]*>/i. В атрибуте x-init тега <body>
		// есть стрелочная функция "=>", из-за которой этот регэксп обрывает разметку
		// на её символе ">" и ломает атрибут. Поэтому вставляем скрипт перед </body>.
		snippetOptions: {
			rule: {
				match: /<\/body>/i,
				fn: (snippet, match) => snippet + match,
			},
		},
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

exports.del = series(del_local, del_dist) // очистка папок сборки

// сборка на локальный хост (одноразово, без watcher и сервера)
exports.build = series(
	del_local,
	del_dist,
	build_sass,
	build_js,

	build_header_html,
	build_footer_html,

	export_images,
	export_json,
	export_fonts,
	export_files,

	build_mains,
	build_shell
)

// выполнение всех программ, запуск локального сервера и ватчинг
exports.default = series(
	del_local,
	del_dist,
	build_sass,
	build_js,

	build_header_html,
	build_footer_html,

	export_images,
	export_json,
	export_fonts,
	export_files,

	build_mains,
	build_shell,
	sync_init,
	toWatch
)
