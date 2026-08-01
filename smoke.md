# Смоук доставки через мастера

Проба «писатель → мастер → читатель» без браузера. Писатель шлёт паки сырым
сокетом (как giper/baza/bench), читатель — штатный yard-клиент с другим ключом.
Ярд-пуш из node не работает (mine_temp не двигает faces), поэтому только так.

Запуск: `MASTER=https://baza.87.120.36.150.ip.giper.dev/ COUNT=15 node smoke.js`
Путь к бандлу в require поправь под своё расположение MAM.

Замер 2026-08-01: локальный мастер — 5/5, медиана 20 мс; прод 87.120 — 15/15, медиана 108 мс, p90 153 мс.

```js
// Смоук доставки Gram через мастера Гипер Базы.
//
// Схема — как в giper/baza/bench: писатель формирует паки локально
// (diff_parts) и шлёт их мастеру сырым сокетом с сабпротоколом
// '$giper_baza_yard'; читатель — обычный yard-клиент с другим ключом,
// подписанный на ленд (Take Face), мастер ретранслирует ему юниты.
// Меряем задержку от записи до появления сообщения у читателя.
//
// MASTER=... COUNT=15 node smoke.js

const $ = require('/Users/cmyser/code/mam/bog/gram/-/node.js')

const MASTER = process.env.MASTER || 'https://baza.87.120.36.150.ip.giper.dev/'
const COUNT = Number(process.env.COUNT || 15)
const TIMEOUT = Number(process.env.TIMEOUT || 30000)

const sleep = ms => new Promise(done => setTimeout(done, ms))

function isolate(auth, tag) {
	const ctx = $.$mol_ambient({})

	ctx.$giper_baza_mine = $.$giper_baza_mine_temp

	// Изоляты в одном процессе: BroadcastChannel доставил бы в обход мастера.
	ctx.$mol_bus = class BusStub {
		constructor() {}
		send() {}
		destructor() {}
	}

	if (process.env.LOG) ctx.$giper_baza_log = () => true

	class Yard extends $.$giper_baza_yard {}
	Yard.masters = $.$mol_const([MASTER])
	ctx.$giper_baza_yard = Yard

	class Glob extends $.$giper_baza_glob {}
	Object.defineProperty(Glob, Symbol.toStringTag, { value: 'Glob_' + tag })
	Glob.$ = ctx
	Glob.lands_touched = new $.$mol_wire_set()
	ctx.$giper_baza_glob = Glob

	class Auth extends $.$giper_baza_auth {}
	Auth.current = () => auth
	ctx.$giper_baza_auth = Auth

	return ctx
}

async function socket_open(url, tries = 5) {
	for (let i = 0; i < tries; ++i) {
		try {
			return await new Promise((done, fail) => {
				const ws = new $.$mol_dom_context.WebSocket(url.replace(/^http/, 'ws'), ['$giper_baza_yard'])
				ws.binaryType = 'arraybuffer'
				ws.onopen = () => done(ws)
				ws.onclose = e => fail(new Error('ws closed ' + e.code))
				ws.onerror = () => fail(new Error('ws error'))
			})
		} catch (error) {
			// jsdom-сокет флапает на медленном TLS (1006 до коннекта) — ретраим
			console.log('ws retry', i + 1, String(error.message))
			await sleep(500)
		}
	}
	throw new Error('ws connect failed after ' + tries + ' tries')
}

async function main() {
	console.log('master:', MASTER, 'count:', COUNT)

	const auth_w = await $.$giper_baza_auth.generate()
	const auth_r = await $.$giper_baza_auth.generate()

	const W = isolate(auth_w, 'w')
	const R = isolate(auth_r, 'r')

	// Читатель — штатный yard-клиент.
	let t = Date.now()
	const connect_r = new $.$mol_wire_atom('master_r', () => {
		$.$mol_wire_solid()
		return R.$giper_baza_glob.yard().master()
	})
	const port_r = await connect_r.async()
	if (!port_r) throw new Error('no master port for reader')
	console.log('reader connected:', Date.now() - t, 'ms')

	// Писатель — сырой сокет для паков.
	t = Date.now()
	const socket = await socket_open(MASTER)
	console.log('writer socket:', Date.now() - t, 'ms')

	const ops = {
		land_make() {
			return W.$giper_baza_glob.land_grab([[null, $.$giper_baza_rank_post('just')]])
		},
		write(land, i) {
			const session = land.Data($.$bog_gram_session)
			const message = session.Messages('auto').make(null)
			message.Text('auto')?.val('smoke #' + i)
			message.Author('auto')?.val(auth_w.pass().lord().str)
			message.Moment('auto')?.val(Date.now())
			return true
		},
		diff(land, faces) {
			return land.diff_parts(faces)
		},
	}

	t = Date.now()
	const land_w = await $.$mol_wire_async(ops).land_make()
	const link = land_w.link()
	console.log('land:', link.str, 'grabbed in', Date.now() - t, 'ms')

	// Подписка читателя: land.sync() держим живым персистентным корнем.
	const keep_r = new $.$mol_wire_atom('keep_r', () => {
		$.$mol_wire_solid()
		R.$giper_baza_glob.Land(link).sync()
		return true
	})
	await keep_r.async()

	const reader_ops = {
		count() {
			// sync_land прокручивает стейл-мемы подписки (рендер-цикла тут нет)
			R.$giper_baza_glob.yard().sync_land(link)
			const land = R.$giper_baza_glob.Land(link)
			return (land.Data($.$bog_gram_session).Messages()?.items() ?? []).length
		},
	}

	let faces = new $.$giper_baza_face_map()

	const push = async () => {
		const parts = await $.$mol_wire_async(ops).diff(land_w, faces)
		faces = land_w.faces.clone()
		const pack = $.$giper_baza_pack.make(parts)
		socket.send(pack.asArray())
	}

	// Стартовый пуш: права ленда должны доехать до мастера до подписки на данные.
	await push()
	await sleep(300)

	const lats = []
	let delivered = 0

	for (let i = 0; i < COUNT; ++i) {
		const t0 = Date.now()
		await $.$mol_wire_async(ops).write(land_w, i)
		await push()

		let ok = false
		while (Date.now() - t0 < TIMEOUT) {
			const n = await $.$mol_wire_async(reader_ops).count()
			if (n >= i + 1) { ok = true; break }
			await sleep(15)
		}
		const lat = Date.now() - t0
		if (ok) { ++delivered; lats.push(lat); console.log(`#${i}: ${lat} ms`) }
		else console.log(`#${i}: TIMEOUT (${TIMEOUT} ms), reader has less than ${i + 1}`)
	}

	lats.sort((a, b) => a - b)
	const q = p => lats[Math.min(lats.length - 1, Math.floor(p * lats.length))] ?? NaN
	console.log(`\ndelivered: ${delivered}/${COUNT}`)
	if (lats.length) console.log(`median: ${q(0.5)} ms, p90: ${q(0.9)} ms, max: ${lats[lats.length - 1]} ms`)

	process.exit(delivered === COUNT ? 0 : 1)
}

main().catch(error => { console.error(error); process.exit(2) })
```
