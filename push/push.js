// Пуш-демон Gram.
//
// Живёт рядом с мастером Гипер Базы и делает две вещи:
//   1) принимает от браузеров Web Push подписки (HTTPS, не через базу —
//      в публичном ленде endpoint+ключи означали бы, что слать пуши
//      подписчику может любой прохожий);
//   2) следит за monitor-лендами подписчиков: в них лежат ссылки на
//      session-ленды диалогов. Содержимое сессий зашифровано и демону
//      недоступно — он видит только рост числа юнитов у чужого пира,
//      чего достаточно для уведомления «новое сообщение».
//
// Запуск: node push.js (см. Dockerfile и compose.yml рядом).

const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const webpush = require('web-push')

const $ = require('./node.js')

const PORT = Number(process.env.GRAM_PUSH_PORT || 9099)
const MASTER = process.env.GRAM_PUSH_MASTER || 'https://baza.91-188-212-151.ip.giper.dev/'
const DATA = process.env.GRAM_PUSH_DATA || '/data'
const POLL = Number(process.env.GRAM_PUSH_POLL || 5000)
const APP_URL = process.env.GRAM_PUSH_APP || 'https://b-on-g.github.io/gram/'

const subs_file = path.join(DATA, 'subs.json')
const vapid_file = path.join(DATA, 'vapid.json')

const log = (...args) => console.log(new Date().toISOString(), ...args)
const debug = process.env.GRAM_PUSH_DEBUG ? log : () => {}

// ===== VAPID =====

function vapid() {
	if (fs.existsSync(vapid_file)) return JSON.parse(fs.readFileSync(vapid_file, 'utf8'))
	const keys = webpush.generateVAPIDKeys()
	fs.mkdirSync(DATA, { recursive: true })
	fs.writeFileSync(vapid_file, JSON.stringify(keys, null, '\t'))
	log('vapid keys generated')
	return keys
}

const keys = vapid()
webpush.setVapidDetails('mailto:noreply@giper.dev', keys.publicKey, keys.privateKey)

// ===== Подписки =====

/** lord → { lord, monitor, subscription, seen: { "session|peer": summ } } */
let subs = {}

function subs_load() {
	if (!fs.existsSync(subs_file)) return
	try {
		subs = JSON.parse(fs.readFileSync(subs_file, 'utf8'))
		log('subs loaded:', Object.keys(subs).length)
	} catch (error) {
		log('subs load failed:', error.message)
	}
}

let save_timer = null
function subs_save() {
	if (save_timer) return
	save_timer = setTimeout(() => {
		save_timer = null
		fs.mkdirSync(DATA, { recursive: true })
		fs.writeFileSync(subs_file, JSON.stringify(subs, null, '\t'))
	}, 500)
}

// ===== Клиент Гипер Базы =====

const auth_file = path.join(DATA, 'auth.key')

/** Своя постоянная личность демона: подписка на ленд заводится от лица
 * ключа, и без него синхронизация обрывается на проверке прав. Ключ
 * лежит в томе — при перезапуске демон остаётся тем же участником. */
async function auth_load() {
	if (fs.existsSync(auth_file)) {
		return $.$giper_baza_auth.from(fs.readFileSync(auth_file, 'utf8').trim())
	}
	const auth = await $.$giper_baza_auth.generate()
	fs.mkdirSync(DATA, { recursive: true })
	fs.writeFileSync(auth_file, auth.toString())
	log('auth key generated:', auth.pass().lord().str.slice(0, 10))
	return auth
}

let auth = null

/** Свежий изолированный клиент на каждый обход.
 *
 * Долгоживущий клиент вне браузера не догоняет обновления: он берёт
 * состояние ленда в момент подписки и застревает на нём — некому
 * прокручивать синхронизацию без рендер-цикла. Переподключение сокета
 * помогало лишь иногда, потому что запросы лендов уже закэшированы.
 * Поэтому на каждый цикл поднимаем клиента с нуля: он тянет ленды
 * заново и всегда видит актуальную картину. Ленды тут крошечные
 * (список ссылок и карта лиц), так что цена приемлемая. */
function client_make() {
	const ctx = $.$mol_ambient({})

	ctx.$giper_baza_mine = $.$giper_baza_mine_temp
	if (process.env.GRAM_PUSH_BAZA_LOG) ctx.$giper_baza_log = () => true

	class Yard extends $.$giper_baza_yard {}
	Yard.masters = $.$mol_const([MASTER])
	ctx.$giper_baza_yard = Yard

	class Glob extends $.$giper_baza_glob {}
	Glob.$ = ctx
	Glob.lands_touched = new $.$mol_wire_set()
	ctx.$giper_baza_glob = Glob

	class Auth extends $.$giper_baza_auth {}
	Auth.current = () => auth
	ctx.$giper_baza_auth = Auth

	const ops = {
		/** Ссылки на session-ленды из публичного monitor-ленда подписчика. */
		watch_list(monitor) {
			const land = Glob.Land(new $.$giper_baza_link(monitor))
			land.sync()
			Glob.yard().sync_land(land.link())
			const list = land.Data($.$bog_gram_monitor).Watch()?.items() ?? []
			return [...list].map(String)
		},
		/** Счётчики юнитов по пирам: содержимое сессий зашифровано и демону
		 * недоступно, а вот сколько юнитов чей пир добавил — видно. */
		session_faces(session) {
			const link = new $.$giper_baza_link(session)
			const land = Glob.Land(link)
			land.sync()
			Glob.yard().sync_land(link)

			const out = {}
			for (const [peer, face] of land.faces) out[peer] = face.summ ?? 0
			return out
		},

		/** Кто скрывается за пиром. Содержимое юнита зашифровано, а вот его
		 * подпись — нет: по ней и восстанавливаем полный идентификатор автора. */
		peer_lords(session) {
			const link = new $.$giper_baza_link(session)
			const land = Glob.Land(link)
			const out = {}
			for (const unit of land.diff_units()) {
				const lord = unit.lord()
				if (!lord?.str) continue
				out[lord.peer().str] = lord.str
			}
			return out
		},

		/** Публичное имя из профиля автора: профиль лежит в открытом ленде,
		 * так что демону он доступен, а вот сам текст сообщения — нет. */
		lord_name(lord) {
			const link = new $.$giper_baza_link(lord)
			const land = Glob.Land(link)
			land.sync()
			Glob.yard().sync_land(link)
			return String(land.Data($.$bog_gram_user).Name()?.val() ?? '')
		},
	}

	return {
		Glob,
		ops,
		async connect() {
			const atom = new $.$mol_wire_atom('master_' + (++ticks), () => {
				$.$mol_wire_solid()
				return Glob.yard().master()
			})
			const port = await atom.async()
			if (!port) throw new Error('no master port')
			return port
		},
		close(port) {
			try {
				const socket = port?.socket
				if (socket) socket.close()
			} catch (error) {
				debug('close failed', String(error?.message ?? error))
			}
		},
	}
}

// ===== Цикл слежения =====

async function notify(sub, names) {
	// Считать можно только юниты, а одно сообщение — это их несколько
	// (текст, автор, момент, порядок), поэтому числом не врём: сам факт
	// новостей демон видит точно, а сколько их — знает только клиент.
	// Имя отправителя берём из его открытого профиля; само тело пуша
	// шифруется браузерным ключом, так что мимо нас его никто не прочтёт.
	const who = names.filter(Boolean)
	const body = who.length === 1 ? 'Новое сообщение от ' + who[0]
		: who.length > 1 ? 'Новые сообщения: ' + who.join(', ')
		: 'Новое сообщение'

	const payload = JSON.stringify({
		title: 'Gram',
		body,
		url: APP_URL,
	})
	try {
		await webpush.sendNotification(sub.subscription, payload)
		log('pushed', sub.lord.slice(0, 8), body)
	} catch (error) {
		const code = error?.statusCode
		log('push failed', sub.lord.slice(0, 8), code, error?.body ?? error?.message)
		// 404/410 — подписка мертва (браузер отозвал), выкидываем
		if (code === 404 || code === 410) {
			delete subs[sub.lord]
			subs_save()
		}
	}
}

let ticks = 0

/** Имена меняются редко, а лишний ленд на каждый пуш — лишняя задержка. */
const names_cache = new Map()

/** Свежий клиент отвечает раньше, чем ленд успевает приехать с мастера:
 * пустой ответ тут означает не «пусто», а «ещё не доехало». Переспрашиваем
 * несколько раз, прежде чем поверить в пустоту. */
async function settle(read, filled, tries = 4, pause = 1200) {
	let value = await read()
	for (let i = 1; i < tries && !filled(value); ++i) {
		await new Promise(done => setTimeout(done, pause))
		value = await read()
	}
	return value
}

async function tick() {

	const client = client_make()
	let port = null

	try {
		port = await client.connect()
	} catch (error) {
		log('connect failed:', String(error?.message ?? error))
		return
	}

	try {

		for (const sub of Object.values(subs)) {
			try {
				const sessions = await settle(
					() => $.$mol_wire_async(client.ops).watch_list(sub.monitor),
					list => list.length > 0,
				)
				debug('watch', sub.lord.slice(0, 8), 'sessions:', sessions.length)

				const my_peer = new $.$giper_baza_link(sub.lord).peer().str
				let fresh = 0
				const authors = new Set()

				for (const session of sessions) {
					const faces = await settle(
						() => $.$mol_wire_async(client.ops).session_faces(session),
						map => Object.keys(map).length > 0,
					)
					debug('  session', session.slice(0, 8), JSON.stringify(faces), 'mine:', my_peer)

					// Пир самого ленда — это его король: гифты и права числятся за
					// ним, сообщениями они не являются и уведомлять о них не нужно
					const king_peer = new $.$giper_baza_link(session).peer().str

					for (const [peer, summ] of Object.entries(faces)) {
						if (peer === my_peer) continue
						if (peer === king_peer) continue

						const key = session + '|' + peer
						const seen = sub.seen[key]

						// На первом обходе только запоминаем состояние, иначе
						// подписчик получил бы пуш по всей истории переписки.
						// Дальше уже и новый собеседник считается новостью:
						// иначе первое сообщение в новом диалоге пропало бы.
						if (seen === undefined) {
							sub.seen[key] = summ
							if (sub.primed) { fresh += summ; authors.add(session + '|' + peer) }
							continue
						}
						if (summ > seen) {
							fresh += summ - seen
							sub.seen[key] = summ
							authors.add(session + '|' + peer)
						}
					}
				}

				sub.primed = true
				subs_save()

				if (fresh) {
					const names = []
					for (const mark of authors) {
						const [ session, peer ] = mark.split('|')
						try {
							const lords = await $.$mol_wire_async(client.ops).peer_lords(session)
							const lord = lords[ peer ]
							if (!lord) continue
							const name = names_cache.get(lord) ?? await settle(
								() => $.$mol_wire_async(client.ops).lord_name(lord),
								value => Boolean(value),
								3,
								1000,
							)
							if (name) names_cache.set(lord, name)
							if (name && !names.includes(name)) names.push(name)
						} catch (error) {
							debug('name lookup failed', String(error?.message ?? error))
						}
					}
					await notify(sub, names)
				}

			} catch (error) {
				log('tick failed for', sub.lord.slice(0, 8), String(error?.message ?? error))
			}
		}

	} finally {
		client.close(port)
	}

}

// ===== HTTP =====

function json(res, code, body) {
	const data = JSON.stringify(body)
	res.writeHead(code, {
		'content-type': 'application/json; charset=utf-8',
		'access-control-allow-origin': '*',
		'access-control-allow-headers': 'content-type',
		'access-control-allow-methods': 'GET,POST,OPTIONS',
		'content-length': Buffer.byteLength(data),
	})
	res.end(data)
}

function body_read(req) {
	return new Promise((done, fail) => {
		let raw = ''
		req.on('data', chunk => {
			raw += chunk
			if (raw.length > 64 * 1024) { fail(new Error('body too large')); req.destroy() }
		})
		req.on('end', () => {
			try { done(JSON.parse(raw || '{}')) } catch (error) { fail(error) }
		})
		req.on('error', fail)
	})
}

const server = http.createServer(async (req, res) => {
	const url = new URL(req.url, 'http://localhost')

	if (req.method === 'OPTIONS') return json(res, 204, {})

	if (url.pathname === '/push/health') return json(res, 200, { ok: true, subs: Object.keys(subs).length })
	if (url.pathname === '/push/key') return json(res, 200, { key: keys.publicKey })

	if (url.pathname === '/push/subscribe' && req.method === 'POST') {
		try {
			const data = await body_read(req)
			const lord = String(data.lord ?? '')
			const monitor = String(data.monitor ?? '')
			const subscription = data.subscription
			if (!lord || !monitor || !subscription?.endpoint) return json(res, 400, { error: 'lord, monitor, subscription required' })

			const prev = subs[lord]
			subs[lord] = { lord, monitor, subscription, seen: prev?.seen ?? {} }
			subs_save()
			log('subscribed', lord.slice(0, 8), 'monitor', monitor.slice(0, 8))
			return json(res, 200, { ok: true })
		} catch (error) {
			return json(res, 400, { error: String(error?.message ?? error) })
		}
	}

	if (url.pathname === '/push/unsubscribe' && req.method === 'POST') {
		try {
			const data = await body_read(req)
			const lord = String(data.lord ?? '')
			if (subs[lord]) { delete subs[lord]; subs_save() }
			return json(res, 200, { ok: true })
		} catch (error) {
			return json(res, 400, { error: String(error?.message ?? error) })
		}
	}

	return json(res, 404, { error: 'not found' })
})

async function main() {
	subs_load()
	server.listen(PORT, () => log('http up on', PORT))

	auth = await auth_load()
	log('lord', auth.pass().lord().str.slice(0, 10), 'master', MASTER)

	for (;;) {
		try {
			await tick()
		} catch (error) {
			log('tick crashed:', String(error?.message ?? error))
		}
		await new Promise(done => setTimeout(done, POLL))
	}
}

main().catch(error => { log('fatal', error); process.exit(1) })
