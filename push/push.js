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

const ambient = $.$mol_ambient({})
ambient.$giper_baza_mine = $.$giper_baza_mine_temp
if (process.env.GRAM_PUSH_BAZA_LOG) ambient.$giper_baza_log = () => true

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

class Yard extends $.$giper_baza_yard {}
Yard.masters = $.$mol_const([MASTER])
ambient.$giper_baza_yard = Yard

class Glob extends $.$giper_baza_glob {}
Glob.$ = ambient
Glob.lands_touched = new $.$mol_wire_set()
ambient.$giper_baza_glob = Glob

/** Ленд остаётся подписанным, пока жив его корневой атом. */
const keepers = new Map()
function keep(link_str) {
	if (keepers.has(link_str)) return
	const link = new $.$giper_baza_link(link_str)
	const atom = new $.$mol_wire_atom('keep_' + link_str, () => {
		$.$mol_wire_solid()
		Glob.Land(link).sync()
		return true
	})
	keepers.set(link_str, atom)
	atom.async().catch(error => log('keep failed', link_str, String(error?.message ?? error)))
}

const ops = {
	/** Ссылки на session-ленды из публичного monitor-ленда подписчика. */
	watch_list(monitor, _tick) {
		const land = Glob.Land(new $.$giper_baza_link(monitor))
		Glob.yard().sync_land(land.link())
		const list = land.Data($.$bog_gram_monitor).Watch()?.items() ?? []
		return [...list].map(String)
	},
	/** Счётчики юнитов по пирам. Содержимое не читаем — оно зашифровано,
	 * а вот сколько юнитов чей пир добавил, видно из карты лиц.
	 *
	 * Карта лиц — обычное поле, чтение её ничего не подписывает. Поэтому
	 * сначала трогаем реактивный узел данных: он поднимает синхронизацию
	 * ленда и держит подписку живой, чтобы новые юниты доезжали сами.
	 * Расшифровать содержимое демон не может и не должен — ошибка тут
	 * ожидаема и гасится. */
	session_faces(session, _tick) {
		const link = new $.$giper_baza_link(session)
		const land = Glob.Land(link)
		Glob.yard().sync_land(link)

		const out = {}
		for (const [peer, face] of land.faces) out[peer] = face.summ ?? 0
		if (process.env.GRAM_PUSH_DEBUG) out['#total'] = land.total()
		return out
	},
}

async function connect() {
	const auth = await auth_load()
	class Auth extends $.$giper_baza_auth {}
	Auth.current = () => auth
	ambient.$giper_baza_auth = Auth
	log('lord', auth.pass().lord().str.slice(0, 10))

	const atom = new $.$mol_wire_atom('master', () => {
		$.$mol_wire_solid()
		return Glob.yard().master()
	})
	const port = await atom.async()
	if (!port) throw new Error('no master port')
	log('connected to', MASTER)
}

// ===== Цикл слежения =====

async function notify(sub, count) {
	// Считать можно только юниты, а одно сообщение — это их несколько
	// (текст, автор, момент, порядок), поэтому числом не врём: сам факт
	// новостей демон видит точно, а сколько их — знает только клиент.
	const payload = JSON.stringify({
		title: 'Gram',
		body: 'Новое сообщение',
		url: APP_URL,
	})
	try {
		await webpush.sendNotification(sub.subscription, payload)
		log('pushed', sub.lord.slice(0, 8), count)
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

/** Долгоживущая подписка в отдельном процессе дельты не догоняет: без
 * рендер-цикла некому прокручивать синхронизацию, и ленд застывает на
 * состоянии первой загрузки. Переподключение дёшево и надёжно — на новом
 * сокете клиент отдаёт свои лица, а мастер в ответ присылает всё, что
 * накопилось с тех пор. */
async function reconnect() {
	try {
		Glob.yard().reconnects(null)
		const atom = new $.$mol_wire_atom('reconnect_' + ticks, () => {
			$.$mol_wire_solid()
			return Glob.yard().master()
		})
		await atom.async()
		await new Promise(done => setTimeout(done, 700))
	} catch (error) {
		log('reconnect failed', String(error?.message ?? error))
	}
}

async function tick() {
	await reconnect()

	for (const sub of Object.values(subs)) {
		try {
			keep(sub.monitor)
			const sessions = await $.$mol_wire_async(ops).watch_list(sub.monitor, ++ticks)

			const my_peer = new $.$giper_baza_link(sub.lord).peer().str
			let fresh = 0

			debug('watch', sub.lord.slice(0, 8), 'sessions:', sessions.length)

			for (const session of sessions) {
				keep(session)
				const faces = await $.$mol_wire_async(ops).session_faces(session, ticks)
				debug('  session', session.slice(0, 8), JSON.stringify(faces), 'mine:', my_peer)

				// Пир самого ленда — это его король: гифты и права числятся за
				// ним, сообщениями они не являются и уведомлять о них не нужно
				const king_peer = new $.$giper_baza_link(session).peer().str

				for (const [peer, summ] of Object.entries(faces)) {
					if (peer === my_peer) continue
					if (peer === king_peer) continue
					if (peer.startsWith('#')) continue
					const key = session + '|' + peer
					const seen = sub.seen[key]
					// На первом обходе только запоминаем состояние, иначе
					// подписчик получил бы пуш по всей истории переписки.
					// Дальше уже и новый собеседник считается новостью:
					// иначе первое сообщение в новом диалоге пропало бы.
					if (seen === undefined) {
						sub.seen[key] = summ
						if (sub.primed) fresh += summ
						continue
					}
					if (summ > seen) { fresh += summ - seen; sub.seen[key] = summ }
				}
			}

			if (fresh) { sub.primed = true; subs_save(); await notify(sub, fresh) }
			else { sub.primed = true; subs_save() }

		} catch (error) {
			log('tick failed for', sub.lord.slice(0, 8), String(error?.message ?? error))
		}
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

	// Мастер может быть недоступен на старте или моргнуть позже: демон
	// не должен от этого умирать — HTTP-приём подписок работает всегда,
	// а слежение подхватится, как только связь восстановится.
	for (;;) {
		try {
			await connect()
			break
		} catch (error) {
			log('connect failed, retry in 10s:', String(error?.message ?? error))
			await new Promise(done => setTimeout(done, 10000))
		}
	}

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
