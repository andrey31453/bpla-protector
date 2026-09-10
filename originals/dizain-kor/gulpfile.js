//
// dizain-kor — локальная сборка и просмотр сайта
//

const { src, dest, series, watch } = require('gulp')
const browserSync = require('browser-sync').create()
const fs = require('fs')

// папка локальной сборки (корень, который отдаёт browser-sync)
const local_dist = 'dist'

//
// очистка папки сборки
//
const clean = (done) => {
	fs.rmSync(local_dist, { recursive: true, force: true })
	done()
}

//
// копирование исходников (index.html + design/**) в папку сборки
// base: '.' сохраняет относительную структуру, encoding: false — бинарные файлы как есть
//
const build_files = () =>
	src(['index.html', 'design/**/*'], { base: '.', encoding: false }).pipe(
		dest(local_dist)
	)

//
// запуск локального сервера
//
const serve = (done) => {
	browserSync.init({
		server: {
			baseDir: local_dist,
		},
		port: 3000,
		open: true,
		notify: false,
	})
	done()
}

//
// перезагрузка браузера после изменений
//
const reload = (done) => {
	browserSync.reload()
	done()
}

//
// наблюдение за исходниками
//
const toWatch = () => {
	watch(['index.html', 'design/**/*'], series(build_files, reload))
}

exports.clean = clean
exports.build = series(clean, build_files)
exports.default = series(clean, build_files, serve, toWatch)
