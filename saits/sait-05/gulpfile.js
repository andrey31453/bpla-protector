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
	'app/_template/header-top.php',
	'app/menu/*.html',
	'app/_template/header-bottom.php',
]

// страницы (header + main + footer)
const main_html = [
	// index
	{
		name: 'index',
		src: [
			'app/banner/*.html',
			'app/about/*.html',
			'app/products/videouroki.html',
			'app/products/client.html',
			'app/products/vody.html',
			'app/products/treningi.html',
			'app/products/indi.html',
			'app/products/sopr.html',
		],
	},
	// статьи (имена совпадают с постоянными ссылками сайта)
	{ name: 'information', src: ['app/_info-page/info.html'] },
	{ name: 'polz-sogl', src: ['app/_info-page/polz.html'] },
	{ name: 'conf', src: ['app/_info-page/conf.html'] },
]

// footer
const footer_src = [
	'app/_template/footer-top.php',
	'app/contacts/*.html',
	'app/ur-contacts/*.html',
	// source
	'app/_template/*.html',
	'app/form__modal-callback/*.html',
	'app/progress-bar/*.html',
	'app/go-top--quadr/*.html',
	'app/_template/footer-bottom.php',
]

// js
const js_src = ['app/_template/*.js', 'app/**/*.js']

// sass
const sass_src = [
	'app/_template/_preset.sass',
	'app/**/_preset.sass',
	'app/_template/*.sass',
	'app/**/*.sass',
]

// images
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
// заголовки страниц
//

const get_title = (name) => {
	const titles = {
		index: 'Защита объектов от БПЛА — ООО «ЗМК «ЕВРОСТАЛЬ»',
		information: 'Информация для покупателей',
		'polz-sogl': 'Пользовательское соглашение',
		conf: 'Политика конфиденциальности',
	}
	return titles[name] || name
}

//
// очистка php-вставок (<?php ... ?>, <?= ... ?>) и шаблонных тегов движка для статического просмотра
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
					// smarty-теги (на всякий случай)
					.replace(/\{php\}[\s\S]*?\{\/php\}/g, '')
					.replace(/\{\*[\s\S]*?\*\}/g, '')
					.replace(/\{foreach[^}]*\}/g, '')
					.replace(/\{\/foreach\}/g, '')
					.replace(/\{if[^}]*\}/g, '')
					.replace(/\{\/if\}/g, '')
					.replace(/\{\$[^}]*\}/g, '')
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
				content = content
					.replace(/href="\/information"/g, 'href="/information.html"')
					.replace(/href="\/polz-sogl"/g, 'href="/polz-sogl.html"')
					.replace(/href="\/conf"/g, 'href="/conf.html"')
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

// сборка подвала во временный файл (без минификации — соберём полный документ и сожмём его целиком)
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

// каркас <main> (как в оригинальном index.php: <main class="main" id="site-content" role="main">)
const main_open = '<main class="main" id="site-content" role="main">'
const main_close = '</main>'

// сборка одной страницы
const build_page = (data, header, footer) => {
	const title = get_title(data.name)
	// вставляем <title> сразу после <head>
	const page_header = header.replace('<head>', `<head><title>${title}</title>`)
	return src(data.src)
		.pipe(concat('content.html'))
		.pipe(clean_tags())
		.pipe(set_header(page_header + main_open))
		.pipe(set_footer(main_close + footer))
		.pipe(html_minify())
		.pipe(fix_links())
		.pipe(concat(`${data.name}.html`))
		.pipe(dest(local_dist))
}

// ожидание завершения потока
const stream_done = (stream) =>
	new Promise((resolve, reject) => {
		stream.on('end', resolve)
		stream.on('error', reject)
	})

// сборка всех страниц
const build_pages = async () => {
	const header = fs.readFileSync(`${tmp_folder}header.html`, 'utf8')
	const footer = fs.readFileSync(`${tmp_folder}footer.html`, 'utf8')
	await Promise.all(main_html.map((data) => stream_done(build_page(data, header, footer))))
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
// to watch
//

const toWatch = () => {
	for (let i = 0; i < main_html.length; i++) {
		watch(main_html[i].src, series(build_pages, sync_reload))
	}
	watch(header_src, series(build_header_html, build_pages, sync_reload))
	watch(footer_src, series(build_footer_html, build_pages, sync_reload))
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
		port: 8005,
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

	build_pages
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

	build_pages,
	sync_init,
	toWatch
)

