//
// подключение модулей
//

const { src, dest, series, watch } = require('gulp') // галп
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
const fs = require('fs') // чтение файлов
const { Transform } = require('stream')

const sync = require('browser-sync').create() // создание локал хоста

//
// настройки проекта
//

// состояние разработки сайта
const production = false
// папка локальной сборки
const local_dist = 'dist'
// папка, куда складываются css/js/images/files/json/html
const folder = local_dist

//
// SRC правила
//

// meta
let meta_src = {} // var-s
const meta_src_for_watch = ['app/meta/data.json']

// header
const header_top_src = ['app/_template/header-top.html']

const header_bottom_src = [
	'app/_template/header-bottom.html',
	'app/menu/*.html',
]

// main
const main_top_src = ['app/_template/main-top.html']
// header-bottom
const main_bottom_src = ['app/_template/main-bottom.html']

// footer
const footer_src = [
	'app/footer/*.html',
	'app/callback--fixed-btn/*.html',
	// source
	'app/_template/svg-style.html',
	'app/go-top/*.html',
	'app/form__modal-callback/*.html',
	// php
	'app/**/*.php',
	// template
	'app/_template/footer-bottom.html',
]

const get_file_names = async () => {
	return await JSON.parse(fs.readFileSync(`./data.json`)).data
}

const file_names = [
	'index',
	'geologija',
	'geodezija',
	'ecologija',
	'gidromet',
	'nashi-raboty',
]

const file_folders = [
	`${folder}/`,
	`${folder}/${file_names[1]}/`,
	`${folder}/${file_names[2]}/`,
	`${folder}/${file_names[3]}/`,
	`${folder}/${file_names[4]}/`,
]

// main
const main_src = [
	//
	// index
	//
	{
		file_name: file_names[0],
		file_folder: file_folders[0],
		src: [
			`app/banner/${file_names[0]}.html`,
			'app/vse-prosto/*.html',
			'app/nashi-uslugi/*.html',
			'app/quiz/*.html',
			// `app/gallery/${file_names[0]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
		],
	},

	//
	// geologija
	//

	// index-geologija
	{
		file_name: file_names[1],
		file_folder: file_folders[0],
		src: [
			`app/banner/${file_names[1]}.html`,
			`app/description/${file_names[1]}.html`,
			`app/price/${file_names[1]}.html`,
			'app/vse-prosto/*.html',
			// `app/gallery/${file_names[1]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// geologiya_uchastka
	{
		file_name: 'geologiya_uchastka',
		file_folder: file_folders[1],
		src: [
			`app/banner/${file_names[1]}.html`,
			`app/description/${file_names[1]}/geologiya_uchastka.html`,
			`app/price/${file_names[1]}/geologiya_uchastka.html`,
			'app/vse-prosto/*.html',
			// `app/gallery/${file_names[1]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// razvedochnoe_burenie
	{
		file_name: 'razvedochnoe_burenie',
		file_folder: file_folders[1],
		src: [
			`app/banner/${file_names[1]}.html`,
			`app/description/${file_names[1]}/razvedochnoe_burenie.html`,
			`app/price/${file_names[1]}/razvedochnoe_burenie.html`,
			'app/vse-prosto/*.html',
			// `app/gallery/${file_names[1]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// gidrogeologicheskie_iziskaniya
	{
		file_name: 'gidrogeologicheskie_iziskaniya',
		file_folder: file_folders[1],
		src: [
			`app/banner/${file_names[1]}.html`,
			`app/description/${file_names[1]}/gidrogeologicheskie_iziskaniya.html`,
			`app/price/${file_names[1]}/gidrogeologicheskie_iziskaniya.html`,
			'app/vse-prosto/*.html',
			// `app/gallery/${file_names[1]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// geofizicheskie_iziskaniya
	{
		file_name: 'geofizicheskie_iziskaniya',
		file_folder: file_folders[1],
		src: [
			`app/banner/${file_names[1]}.html`,
			`app/description/${file_names[1]}/geofizicheskie_iziskaniya.html`,
			`app/price/${file_names[1]}/geofizicheskie_iziskaniya.html`,
			'app/vse-prosto/*.html',
			// `app/gallery/${file_names[1]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// staticheskoe_zondirovanie
	{
		file_name: 'staticheskoe_zondirovanie',
		file_folder: file_folders[1],
		src: [
			`app/banner/${file_names[1]}.html`,
			`app/description/${file_names[1]}/staticheskoe_zondirovanie.html`,
			`app/price/${file_names[1]}/staticheskoe_zondirovanie.html`,
			'app/vse-prosto/*.html',
			// `app/gallery/${file_names[1]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// snyatie_zamechanii_ekspertizi
	// {
	// 	file_name: 'snyatie_zamechanii_ekspertizi',
	// 	file_folder: file_folders[1],
	// 	src: [
	// 		`app/banner/${file_names[1]}.html`,
	// 		`app/description/${file_names[1]}/snyatie_zamechanii_ekspertizi.html`,
	// 		`app/price/${file_names[1]}/snyatie_zamechanii_ekspertizi.html`,
	// 		'app/vse-prosto/*.html',
	// 		// `app/gallery/${file_names[1]}.html`,
	// 		`app/gallery/sro.html`, `app/gallery/${file_names[5]}.html`,
	// 		'app/quiz/*.html',
	// 		'app/nashi-uslugi/*.html',
	// 	],
	// },

	// laboratornie_issledovaniya_gruntov
	{
		file_name: 'laboratornie_issledovaniya_gruntov',
		file_folder: file_folders[1],
		src: [
			`app/banner/${file_names[1]}.html`,
			`app/description/${file_names[1]}/laboratornie_issledovaniya_gruntov.html`,
			`app/price/${file_names[1]}/laboratornie_issledovaniya_gruntov.html`,
			'app/vse-prosto/*.html',
			// `app/gallery/${file_names[1]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// osvidetelstvovanie_kotlovana
	{
		file_name: 'osvidetelstvovanie_kotlovana',
		file_folder: file_folders[1],
		src: [
			`app/banner/${file_names[1]}.html`,
			`app/description/${file_names[1]}/osvidetelstvovanie_kotlovana.html`,
			`app/price/${file_names[1]}/osvidetelstvovanie_kotlovana.html`,
			'app/vse-prosto/*.html',
			// `app/gallery/${file_names[1]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	//
	// geodezija
	//

	// index-geodezija
	{
		file_name: file_names[2],
		file_folder: file_folders[0],
		src: [
			`app/banner/${file_names[2]}.html`,
			`app/description/${file_names[2]}.html`,
			`app/price/${file_names[2]}.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[2]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// proverka_na_sootvetstvie_granic_uchastka
	{
		file_name: 'proverka_na_sootvetstvie_granic_uchastka',
		file_folder: file_folders[2],
		src: [
			`app/banner/${file_names[2]}.html`,
			`app/description/${file_names[2]}/proverka_na_sootvetstvie_granic_uchastka.html`,
			`app/price/${file_names[2]}/proverka_na_sootvetstvie_granic_uchastka.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[2]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// topograficheskaya_semka
	{
		file_name: 'topograficheskaya_semka',
		file_folder: file_folders[2],
		src: [
			`app/banner/${file_names[2]}.html`,
			`app/description/${file_names[2]}/topograficheskaya_semka.html`,
			`app/price/${file_names[2]}/topograficheskaya_semka.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[2]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// vinos_granic_zemelnogo_uchastka
	{
		file_name: 'vinos_granic_zemelnogo_uchastka',
		file_folder: file_folders[2],
		src: [
			`app/banner/${file_names[2]}.html`,
			`app/description/${file_names[2]}/vinos_granic_zemelnogo_uchastka.html`,
			`app/price/${file_names[2]}/vinos_granic_zemelnogo_uchastka.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[2]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// topograficheskaya_semka_pod_landshaftnii_dizain
	{
		file_name: 'topograficheskaya_semka_pod_landshaftnii_dizain',
		file_folder: file_folders[2],
		src: [
			`app/banner/${file_names[2]}.html`,
			`app/description/${file_names[2]}/topograficheskaya_semka_pod_landshaftnii_dizain.html`,
			`app/price/${file_names[2]}/topograficheskaya_semka_pod_landshaftnii_dizain.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[2]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// topograficheskaya_semka_dlya_gpzu
	{
		file_name: 'topograficheskaya_semka_dlya_gpzu',
		file_folder: file_folders[2],
		src: [
			`app/banner/${file_names[2]}.html`,
			`app/description/${file_names[2]}/topograficheskaya_semka_dlya_gpzu.html`,
			`app/price/${file_names[2]}/topograficheskaya_semka_dlya_gpzu.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[2]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// poderevnaya_topograficheskaya_semka_mestnosti
	{
		file_name: 'poderevnaya_topograficheskaya_semka_mestnosti',
		file_folder: file_folders[2],
		src: [
			`app/banner/${file_names[2]}.html`,
			`app/description/${file_names[2]}/poderevnaya_topograficheskaya_semka_mestnosti.html`,
			`app/price/${file_names[2]}/poderevnaya_topograficheskaya_semka_mestnosti.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[2]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// geodezicheskaya_razbivka_osei_zdanii
	{
		file_name: 'geodezicheskaya_razbivka_osei_zdanii',
		file_folder: file_folders[2],
		src: [
			`app/banner/${file_names[2]}.html`,
			`app/description/${file_names[2]}/geodezicheskaya_razbivka_osei_zdanii.html`,
			`app/price/${file_names[2]}/geodezicheskaya_razbivka_osei_zdanii.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[2]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// soprovozhdenie_dorozhnogo_stroitelstva
	{
		file_name: 'soprovozhdenie_dorozhnogo_stroitelstva',
		file_folder: file_folders[2],
		src: [
			`app/banner/${file_names[2]}.html`,
			`app/description/${file_names[2]}/soprovozhdenie_dorozhnogo_stroitelstva.html`,
			`app/price/${file_names[2]}/soprovozhdenie_dorozhnogo_stroitelstva.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[2]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// vinos_kommunikacii
	{
		file_name: 'vinos_kommunikacii',
		file_folder: file_folders[2],
		src: [
			`app/banner/${file_names[2]}.html`,
			`app/description/${file_names[2]}/vinos_kommunikacii.html`,
			`app/price/${file_names[2]}/vinos_kommunikacii.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[2]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// topograficheskaya_semka_lineinih_obektov
	{
		file_name: 'topograficheskaya_semka_lineinih_obektov',
		file_folder: file_folders[2],
		src: [
			`app/banner/${file_names[2]}.html`,
			`app/description/${file_names[2]}/topograficheskaya_semka_lineinih_obektov.html`,
			`app/price/${file_names[2]}/topograficheskaya_semka_lineinih_obektov.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[2]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// vinos_proekta_v_naturu
	{
		file_name: 'vinos_proekta_v_naturu',
		file_folder: file_folders[2],
		src: [
			`app/banner/${file_names[2]}.html`,
			`app/description/${file_names[2]}/vinos_proekta_v_naturu.html`,
			`app/price/${file_names[2]}/vinos_proekta_v_naturu.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[2]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// opredelenie_mestopolozheniya_podzemnih_kommunikacii
	{
		file_name: 'opredelenie_mestopolozheniya_podzemnih_kommunikacii',
		file_folder: file_folders[2],
		src: [
			`app/banner/${file_names[2]}.html`,
			`app/description/${file_names[2]}/opredelenie_mestopolozheniya_podzemnih_kommunikacii.html`,
			`app/price/${file_names[2]}/opredelenie_mestopolozheniya_podzemnih_kommunikacii.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[2]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// soglasovanie_topograficheskoi_semki
	{
		file_name: 'soglasovanie_topograficheskoi_semki',
		file_folder: file_folders[2],
		src: [
			`app/banner/${file_names[2]}.html`,
			`app/description/${file_names[2]}/soglasovanie_topograficheskoi_semki.html`,
			`app/price/${file_names[2]}/soglasovanie_topograficheskoi_semki.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[2]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	//
	// ecologija
	//

	// index-ecologija
	{
		file_name: file_names[3],
		file_folder: file_folders[0],
		src: [
			`app/banner/${file_names[3]}.html`,
			`app/description/${file_names[3]}.html`,
			`app/price/${file_names[3]}.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[3]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// istoriko_kulturnaya_ekspertiza
	{
		file_name: 'istoriko_kulturnaya_ekspertiza',
		file_folder: file_folders[3],
		src: [
			`app/banner/${file_names[3]}.html`,
			`app/description/${file_names[3]}/istoriko_kulturnaya_ekspertiza.html`,
			`app/price/${file_names[3]}/istoriko_kulturnaya_ekspertiza.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[3]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// razrabotka_oos_i_ovos
	{
		file_name: 'razrabotka_oos_i_ovos',
		file_folder: file_folders[3],
		src: [
			`app/banner/${file_names[3]}.html`,
			`app/description/${file_names[3]}/razrabotka_oos_i_ovos.html`,
			`app/price/${file_names[3]}/razrabotka_oos_i_ovos.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[3]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// laboratornie_issledovaniya_pochv
	{
		file_name: 'laboratornie_issledovaniya_pochv',
		file_folder: file_folders[3],
		src: [
			`app/banner/${file_names[3]}.html`,
			`app/description/${file_names[3]}/laboratornie_issledovaniya_pochv.html`,
			`app/price/${file_names[3]}/laboratornie_issledovaniya_pochv.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[3]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// radiacionnoe_obsledovanie
	{
		file_name: 'radiacionnoe_obsledovanie',
		file_folder: file_folders[3],
		src: [
			`app/banner/${file_names[3]}.html`,
			`app/description/${file_names[3]}/radiacionnoe_obsledovanie.html`,
			`app/price/${file_names[3]}/radiacionnoe_obsledovanie.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[3]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// snyatie_zamechanii_ekspertizi_ecologija
	{
		file_name: 'snyatie_zamechanii_ekspertizi_ecologija',
		file_folder: file_folders[3],
		src: [
			`app/banner/${file_names[3]}.html`,
			`app/description/${file_names[3]}/snyatie_zamechanii_ekspertizi_ecologija.html`,
			`app/price/${file_names[3]}/snyatie_zamechanii_ekspertizi_ecologija.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[3]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// se_mb_se_issledovaniya
	{
		file_name: 'se_mb_se_issledovaniya',
		file_folder: file_folders[3],
		src: [
			`app/banner/${file_names[3]}.html`,
			`app/description/${file_names[3]}/se_mb_se_issledovaniya.html`,
			`app/price/${file_names[3]}/se_mb_se_issledovaniya.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[3]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// issledovanie_zagryazneniya_vozduha
	{
		file_name: 'issledovanie_zagryazneniya_vozduha',
		file_folder: file_folders[3],
		src: [
			`app/banner/${file_names[3]}.html`,
			`app/description/${file_names[3]}/issledovanie_zagryazneniya_vozduha.html`,
			`app/price/${file_names[3]}/issledovanie_zagryazneniya_vozduha.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[3]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// inzhenerno_ekologicheskaya_semka
	{
		file_name: 'inzhenerno_ekologicheskaya_semka',
		file_folder: file_folders[3],
		src: [
			`app/banner/${file_names[3]}.html`,
			`app/description/${file_names[3]}/inzhenerno_ekologicheskaya_semka.html`,
			`app/price/${file_names[3]}/inzhenerno_ekologicheskaya_semka.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[3]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	//
	// gidromet
	//

	// index-gidromet
	{
		file_name: file_names[4],
		file_folder: file_folders[0],
		src: [
			`app/banner/${file_names[4]}.html`,
			`app/description/${file_names[4]}.html`,
			`app/price/${file_names[4]}.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[4]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	// inzhenerno_gidrometeorologicheskie_iziskaniya
	{
		file_name: 'inzhenerno_gidrometeorologicheskie_iziskaniya',
		file_folder: file_folders[4],
		src: [
			`app/banner/${file_names[4]}.html`,
			`app/description/${file_names[4]}/inzhenerno_gidrometeorologicheskie_iziskaniya.html`,
			`app/price/${file_names[4]}/inzhenerno_gidrometeorologicheskie_iziskaniya.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[4]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},
	// soglasovanie_tochki_sbrosa
	{
		file_name: 'soglasovanie_tochki_sbrosa',
		file_folder: file_folders[4],
		src: [
			`app/banner/${file_names[4]}.html`,
			`app/description/${file_names[4]}/soglasovanie_tochki_sbrosa.html`,
			`app/price/${file_names[4]}/soglasovanie_tochki_sbrosa.html`,
			'app/vse-prosto/*.html',
			// // `app/gallery/${file_names[4]}.html`,
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},

	//
	// pages
	//

	// nashi-raboty
	{
		file_name: file_names[5],
		file_folder: file_folders[0],
		src: [
			`app/gallery/sro.html`,
			`app/gallery/${file_names[5]}.html`,
			'app/vse-prosto/*.html',
			'app/quiz/*.html',
			'app/nashi-uslugi/*.html',
		],
	},
]

// js
const js_src = [
	'app/assets/js/swiper.js',
	'app/assets/js/app.js',
	'app/_template/*.js',
	'app/**/*.js',
]

// css
const css_src = [
	'app/assets/css/fonts.css',
	'app/assets/css/swiper.css',
	'app/assets/css/tailwind.css',
	'app/assets/css/style.css',
]

// sass
const sass_src = [
	'app/_template/_preset.sass',
	'app/**/_preset.sass',
	'app/_template/*.sass',
	'app/**/*.sass',
]

// htaccess_src
const htaccess_src = ['app/_template/.htaccess']

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
const files_src = ['app/**/*.doc', 'app/**/*.pdf'] // files

//
// основное тело галпа
//

// очистка папки локальной сборки
const del_dist = () => {
	return del(`${local_dist}/`)
}

//
// создание meta
//
const build_meta = async () => {
	const meta = await JSON.parse(
		fs.readFileSync(`./app/meta/data.json`)
	)

	for (const key in meta) {
		const data = `
		<title>${meta[key].title}</title>
		<meta name="description" content="${meta[key].description}" />
		<meta name="keywords" content="${meta[key].keywords}" />
		`

		await fs.writeFile(`app/meta/pages/${key}.html`, data, (err) => {
			if (err) console.log(err)
		})
	}

	for (const key in meta) {
		meta_src[key] = `app/meta/pages/${key}.html`
	}
	for (let i = 0; i < main_src.length; i++) {
		if (!meta_src[main_src[i].file_name])
			meta_src[main_src[i].file_name] = 'app/meta/pages/empty.html'
	}
}

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
// исправление постоянных ссылок на статические .html (для локального просмотра)
//
const fix_links = () => {
	return new Transform({
		objectMode: true,
		transform(file, enc, cb) {
			if (file.isBuffer()) {
				let content = file.contents.toString()
				content = content
					.replace(/href="\/"/g, 'href="/index.html"')
					.replace(/href="\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_]+)"/g, 'href="/$1/$2.html"')
					.replace(/href="\/([a-zA-Z0-9-_]+)"/g, 'href="/$1.html"')
				file.contents = Buffer.from(content)
			}
			cb(null, file)
		},
	})
}

//
// создание html
//
const build_page = async (i) => {
	return src(
		[
			...header_top_src,
			meta_src[main_src[i].file_name],
			...header_bottom_src,
			...main_top_src,
			...main_src[i].src,
			...main_bottom_src,
			...footer_src,
		],
		{ allowEmpty: true }
	)
		.pipe(concat(`${main_src[i].file_name}.html`))
		.pipe(clean_tags())
		.pipe(fix_links())
		.pipe(dest(`${main_src[i].file_folder}`))
}
const build_pages = async () => {
	for (let i = 0; i < main_src.length; i++) {
		await build_page(i)
	}
	return true
}

//
// сбор всех sass из папки src и перенос css в папку дист
//
const build_css = () => {
	return src(css_src)
		.pipe(concat('assets.min.css'))
		.pipe(
			auto_prefixer({
				overrideBrowserslist: 'last 2 versions',
			})
		)
		.pipe(concat('assets.min.css'))
		.pipe(csso())
		.pipe(dest(`${folder}/css`))
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
const export_htaccess = () => {
	return src(htaccess_src).pipe(dest(`${folder}`))
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
	for (let i = 0; i < main_src.length; i++) {
		watch(
			main_src[i].src,
			series(async () => await build_page(i), sync_reload)
		)
	}
	watch(
		footer_src,
		series(async () => await build_pages(), sync_reload)
	)
	watch(
		header_top_src,
		series(async () => await build_pages(), sync_reload)
	)
	watch(
		header_bottom_src,
		series(async () => await build_pages(), sync_reload)
	)

	watch(
		meta_src_for_watch,
		series(async () => {
			await build_meta()
			await build_pages()
		}, sync_reload)
	)

	watch(css_src, series(build_css, sync_reload))
	watch(sass_src, series(build_sass, sync_reload))
	watch(js_src, series(build_js, sync_reload))

	watch(images_src, series(export_images, sync_reload))
	watch(json_src, series(export_json, sync_reload))
	watch(files_src, series(export_files, sync_reload))

	watch(htaccess_src, series(export_htaccess, sync_reload))
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

	build_meta,
	build_pages,

	build_css,
	build_sass,
	build_js,

	export_images,
	export_json,
	export_files,
	export_htaccess,
)

// выполнение всех программ, запуск локального сервера и ватчинг
exports.default = series(
	del_dist,

	build_meta,
	build_pages,

	build_css,
	build_sass,
	build_js,

	export_images,
	export_json,
	export_files,
	export_htaccess,

	sync_init,
	toWatch
)
