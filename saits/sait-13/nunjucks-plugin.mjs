// ============================================================
// nunjucks-plugin.mjs — композиция разметки на этапе сборки.
//
// Плагин рендерит входные *.html (в них только {% extends %} и
// уникальные блоки) через Nunjucks: в dist/ попадает обычный
// статический HTML. Все повторяющиеся данные лежат в src/data/*.json
// и подставляются в шаблоны: меню, крошки, title/description,
// canonical, JSON-LD, sitemap.xml, robots.txt.
//
// JS на клиенте ничего не рендерит — только прогрессивное улучшение.
// ============================================================
import nunjucks from 'nunjucks'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export function nunjucksPlugin(siteRoot) {
	const srcDir = join(siteRoot, 'src')
	const dataDir = join(srcDir, 'data')

	let data = {}
	let env = null

	// ---------- данные ----------
	const loadData = () => {
		const out = {}
		for (const file of readdirSync(dataDir).sort()) {
			if (!file.endsWith('.json')) continue
			out[file.replace(/\.json$/, '')] = JSON.parse(
				readFileSync(join(dataDir, file), 'utf8')
			)
		}
		return out
	}

	const pageList = () => (data.pages && data.pages.items) || []
	const findPage = (slug) => pageList().find((p) => p.slug === slug) || null
	const linkTo = (slug, hash) =>
		(slug === 'index' ? '/' : `/${slug}.html`) +
		(hash ? `#${String(hash).replace(/^#/, '')}` : '')

	const groupList = () => {
		const groups = []
		for (const page of pageList()) {
			if (!page.nav || !page.group) continue
			let group = groups.find((g) => g.label === page.group)
			if (!group) {
				group = { label: page.group, items: [] }
				groups.push(group)
			}
			group.items.push(page)
		}
		return groups
	}

	// ---------- JSON-LD ----------
	const jsonLd = (page) => {
		const site = data.site
		const base = String(site.baseUrl).replace(/\/$/, '')
		const url = base + linkTo(page.slug)
		const crumbItems = [
			{
				'@type': 'ListItem',
				'position': 1,
				'name': 'Главная',
				'item': base + '/',
			},
			...(page.group && page.slug !== 'index'
				? [{ '@type': 'ListItem', 'position': 2, 'name': page.group }]
				: []),
			{
				'@type': 'ListItem',
				'position': page.group && page.slug !== 'index' ? 3 : 2,
				'name': page.nav || page.title,
				'item': url,
			},
		]

		const graph = [
			{
				'@type': 'Organization',
				'@id': `${base}/#org`,
				'name': site.brand,
				'url': base + '/',
				'telephone': site.phone.display,
				'email': site.email,
				'description': site.description,
				'areaServed': 'Россия',
			},
			{ '@type': 'BreadcrumbList', 'itemListElement': crumbItems },
		]

		if (page.service) {
			graph.push({
				'@type': 'Service',
				'name': page.nav || page.title,
				'serviceType': page.service,
				'description': page.description,
				'provider': { '@id': `${base}/#org` },
				'areaServed': 'Россия',
				url,
			})
		}

		const faqFile = data['faq-' + page.slug]
		if (faqFile && faqFile.items && faqFile.items.length) {
			graph.push({
				'@type': 'FAQPage',
				'mainEntity': faqFile.items.map((item) => ({
					'@type': 'Question',
					'name': item.q,
					'acceptedAnswer': { '@type': 'Answer', 'text': item.a },
				})),
			})
		}

		if (page.slug === 'index' && data.products) {
			graph.push({
				'@type': 'ItemList',
				'name': 'Направления защиты объектов от БПЛА',
				'itemListElement': data.products.items.map((item, index) => ({
					'@type': 'ListItem',
					'position': index + 1,
					'name': item.title,
					'url': base + linkTo(String(item.href).replace(/\.html$/, '')),
				})),
			})
		}

		return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
	}

	// ---------- окружение Nunjucks ----------
	const setup = () => {
		data = loadData()
		env = new nunjucks.Environment(
			new nunjucks.FileSystemLoader([srcDir], { noCache: true }),
			{ autoescape: true, trimBlocks: true, lstripBlocks: true }
		)
		env.addGlobal('site', data.site)
		env.addGlobal('data', data)
		env.addGlobal('pages', pageList())
		env.addGlobal('navGroups', groupList())
		env.addGlobal('pageBySlug', findPage)
		env.addGlobal('href', linkTo)
		env.addGlobal('jsonLd', jsonLd)
		env.addGlobal('year', new Date().getFullYear())
	}

	setup()

	const render = (html, locals) => env.renderString(html, locals || {})

	// ---------- sitemap.xml / robots.txt ----------
	const sitemap = () => {
		const base = String(data.site.baseUrl).replace(/\/$/, '')
		const today = new Date().toISOString().slice(0, 10)
		const urls = [
			{ loc: base + '/', priority: 1.0, changefreq: 'weekly', lastmod: today },
			...pageList()
				.filter((p) => p.slug !== 'index' && !p.noindex)
				.map((p) => ({
					loc: base + linkTo(p.slug),
					priority: p.priority || 0.8,
					changefreq: p.changefreq || 'monthly',
					lastmod: today,
				})),
		]
		const body = urls
			.map(
				(u) =>
					`  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority.toFixed(1)}</priority>\n  </url>`
			)
			.join('\n')
		return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
	}

	const robots = () => {
		const base = String(data.site.baseUrl).replace(/\/$/, '')
		return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`
	}

	return {
		name: 'fortteh-nunjucks',
		enforce: 'pre',

		transformIndexHtml: {
			order: 'pre',
			handler(html, ctx) {
				const slug =
					String((ctx && ctx.path) || '/')
						.replace(/^\//, '')
						.replace(/\.html$/, '') || 'index'
				const page = findPage(slug)
				return render(html, {
					page: page || { slug, title: '', description: '' },
				})
			},
		},

		generateBundle() {
			this.emitFile({
				type: 'asset',
				fileName: 'sitemap.xml',
				source: sitemap(),
			})
			this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots() })
		},

		configureServer(server) {
			const touch = (file) => {
				if (file.endsWith('.njk') || file.endsWith('.json')) {
					setup()
					server.ws.send({ type: 'full-reload' })
				}
			}
			server.watcher.on('change', touch)
			server.watcher.on('add', touch)
			server.watcher.on('unlink', touch)
		},
	}
}
