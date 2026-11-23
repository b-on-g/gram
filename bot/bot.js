const fs = require( 'node:fs' )
const os = require( 'node:os' )
const path = require( 'node:path' )
const { spawn, execFileSync } = require( 'node:child_process' )

const DIR = process.env.GRAM_BOT_DIR || path.join( os.homedir(), '.gram-bot' )
const GRAM = path.resolve( __dirname, '..' )
const MAM = path.resolve( GRAM, '../..' )
const at = ( ... parts )=> path.join( DIR, ... parts )

fs.mkdirSync( DIR, { recursive: true, mode: 0o700 } )

const config = Object.assign( {
	group: '',
	lords: [],
	name: 'Клод',
	masters: null,
	daily: 10,
	fixes: 2,
	minutes: 30,
	dry: false,
}, json_load( at( 'config.json' ), {} ) )

const state = Object.assign( { since: 0, tasks: {}, replies: {}, seen: [], days: {}, asked: [] }, json_load( at( 'state.json' ), {} ) )
if( !Array.isArray( state.asked ) ) state.asked = []

const limits = { photos: 8, photo: 12 * 2 ** 20, text: 4000 }

const kinds = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }

const banned = /^(\.git|\.githooks|push\/|bot\/|version\/)|(^|\/)\.git/

const log = ( ... args )=> console.log( new Date().toISOString(), ... args )
const private_words = [ DIR, MAM, os.homedir(), os.userInfo().username, os.hostname() ].filter( word => word.length > 3 )
const private_rules = [
	/[\w.+-]+@[\w-]+\.[\w.-]+/g,
	/(?:\/private)?\/(?:Users|home|tmp|var\/folders)\/[^\s'"`)]*/g,
	/\b(?:sk-ant|ghp|gho|github_pat|xox[abp])[-_][\w-]{10,}/g,
	/-----BEGIN[\s\S]*?KEY-----/g,
	/\b\d{1,3}(?:\.\d{1,3}){3}\b/g,
]

/** Клод видит в своём контексте почту владельца и путь рабочей папки, в чат и коммит им нельзя. */
function scrub( text ) {
	let out = String( text )
	for( const word of private_words ) out = out.replaceAll( word, '…' )
	for( const rule of private_rules ) out = out.replace( rule, '…' )
	return out
}

const leaky = text => scrub( text ) !== text

const sleep = ms => new Promise( done => setTimeout( done, ms ) )

function json_load( file, fallback ) {
	return fs.existsSync( file ) ? JSON.parse( fs.readFileSync( file, 'utf8' ) ) : fallback
}

function state_save() {
	fs.writeFileSync( at( 'state.tmp' ), JSON.stringify( state, null, '\t' ), { mode: 0o600 } )
	fs.renameSync( at( 'state.tmp' ), at( 'state.json' ) )
}

function lock() {
	const file = at( 'pid' )
	if( fs.existsSync( file ) ) {
		const pid = Number( fs.readFileSync( file, 'utf8' ) )
		let alive = true
		try { process.kill( pid, 0 ) } catch { alive = false }
		if( alive ) throw new Error( `Бот уже запущен, pid ${ pid }` )
	}
	fs.writeFileSync( file, String( process.pid ) )
	process.on( 'exit', ()=> fs.rmSync( file, { force: true } ) )
	for( const signal of [ 'SIGINT', 'SIGTERM' ] ) process.on( signal, ()=> process.exit( 0 ) )
}

/** База хранит ленды в текущем каталоге, поэтому переход в свой каталог стоит до загрузки бандла. */
process.chdir( DIR )
fs.copyFileSync( path.join( GRAM, '-', 'web.baza' ), at( 'web.baza' ) )
if( !fs.existsSync( at( 'node_modules' ) ) ) fs.symlinkSync( path.join( MAM, 'node_modules' ), at( 'node_modules' ) )
const $ = require( path.join( GRAM, '-', 'node.js' ) )

const fiber = ( task, ms = 20000 )=> Promise.race([
	$.$mol_wire_async( { task } ).task(),
	sleep( ms ).then( ()=> { throw new Error( 'База не ответила вовремя' ) } ),
])

async function auth_load() {
	const file = at( 'auth.key' )
	if( fs.existsSync( file ) ) return { auth: $.$giper_baza_auth.from( fs.readFileSync( file, 'utf8' ).trim() ), fresh: false }
	const auth = await $.$giper_baza_auth._generate()
	fs.writeFileSync( file, auth.toString() + auth.toStringPrivate(), { mode: 0o600 } )
	return { auth, fresh: true }
}

const pins = new Map

/** Ленд без подписчика сметается между фибрами, поэтому каждый держит свой корневой атом. */
function pin( link ) {
	if( !link || pins.has( link ) ) return
	const atom = new $.$mol_wire_atom( 'pin_' + link, ()=> {
		$.$mol_wire_solid()
		const land = $.$giper_baza_glob.Land( new $.$giper_baza_link( link ) )
		land.sync()
		return land
	} )
	pins.set( link, atom )
	atom.async().catch( error => log( 'ленд', link, error.message ) )
}

let lord = ''
let talk = null
let account = null

async function baza_open() {

	const { auth, fresh } = await auth_load()
	$.$giper_baza_auth.current = ()=> auth
	if( config.masters ) $.$giper_baza_yard.masters = ()=> config.masters

	const pass = auth.pass()
	lord = pass.lord().str

	account = $.$bog_gram_account.make({ $, born: ()=> fresh })
	talk = $.$bog_gram_talk.make({ $, Account: ()=> account })

	pin( lord )
	await fiber( ()=> {
		account.ready()
		for( const land of [
			account.dialogs_land(),
			account.inbox_land(),
			account.monitor_land(),
			account.devices_land(),
		] ) pin( land.link().str )
	}, 90000 )
	await sleep( 2000 )

	console.log( `\nСсылка на бота, открыть в Граме и добавить его в группу:\nhttps://b-on-g.github.io/gram/#!invite=${ lord }/key=${ pass.toString() }\n` )
}

/** Адрес ящика вычисляется из лорда: в профиле он бывает не указан. */
function inbox_link( owner ) {
	let idea = $.$mol_hash_string( 'bog_gram_inbox' )
	for( ; ; ) {
		idea = $.$mol_hash_numbers([ idea ])
		if( !idea ) continue
		const id = $.$giper_baza_link.from_int( idea ).str
		if( !/[æÆ]/.test( id ) ) return owner + '_' + id
	}
}

async function group_ask( group, owner ) {

	const key = group + '|' + owner
	if( state.asked.includes( key ) ) return

	const inbox = inbox_link( owner )
	pin( owner )
	pin( inbox )

	for( let turn = 0; turn < 30; ++ turn ) {
		await sleep( 3000 )

		const sent = await fiber( ()=> {

			const glob = $.$giper_baza_glob
			const pass = glob.Land( new $.$giper_baza_link( owner ) ).king_pass()
			if( !pass ) return false

			const entry = $.$bog_gram_seal.close( $.$giper_baza_auth.current(), pass, 'join', group )
			const joins = glob.Land( new $.$giper_baza_link( inbox ) ).Data( $.$bog_gram_inbox ).Joins( 'auto' )
			if( !joins ) return false
			if( !joins.items().map( String ).includes( entry ) ) joins.add( entry )

			return joins.items().map( String ).includes( entry )
		}, 60000 ).catch( error => ( log( 'заявка:', error.message ), false ) )

		if( !sent ) continue

		state.asked.push( key )
		state_save()
		return log( 'заявка отправлена: ' + owner )
	}

	log( 'заявка не ушла: ящик владельца не прочитан' )
}

async function chat_open() {

	pin( config.group )
	const links = await fiber( ()=> talk.links_of( config.group ).map( String ) )
	links.forEach( pin )
	if( !links.length ) return false

	return fiber( ()=> talk.lands_of( config.group ).some( land => {
		if( !land.encrypted() ) return false
		if( land.lord_tier( new $.$giper_baza_link( lord ) ) < $.$giper_baza_rank_tier.post ) return false
		return Boolean( land.Data( $.$bog_gram_session ).Messages()?.items().length )
	} ) )
}

async function chat_name() {
	await fiber( ()=> {
		const names = talk.store( config.group ).Names( 'auto' )
		if( names?.key( lord )?.Title()?.val() === config.name ) return
		names?.key( lord, 'auto' )?.Title( 'auto' )?.val( config.name )
	} )
}

const signer = atom => atom?.pick_unit( null )?.lord().str ?? ''

/** Подписавшие всё, что попадёт в промпт. Полю Author верить нельзя: это текст, который пишет кто угодно. */
function signers( message ) {
	const all = [ signer( message.Moment() ) ]
	for( const atom of [ message.Text(), message.Task(), message.Reply(), message.Image() ] ) {
		if( atom?.val() ) all.push( signer( atom ) )
	}
	for( const unit of message.Shots()?.units_of( null ) ?? [] ) all.push( unit.lord().str )
	for( const shot of message.Shots()?.remote_list() ?? [] ) all.push( signer( shot.Image() ) )
	return all
}

function trusted( message ) {
	return signers( message ).every( one => config.lords.includes( one ) )
}

function frames( message ) {
	const shots = message.Shots()?.remote_list() ?? []
	return shots.length ? shots.map( shot => shot.Image() ) : message.Image()?.val() ? [ message.Image() ] : []
}

async function messages() {
	return fiber( ()=> talk.messages_of( config.group )
		.filter( message => message.Moment()?.val() && !message.Deleted()?.val() )
		.map( message => ({
			id: message.link().str,
			moment: Number( message.Moment().val() ),
			text: String( message.Text()?.val() ?? '' ),
			task: Boolean( message.Task()?.val() ),
			done: Boolean( message.Task_done()?.val() ),
			reply: String( message.Reply()?.val() ?? '' ),
			frames: frames( message ).length,
			trusted: trusted( message ),
		}) )
	)
}

function message_of( id ) {
	const message = talk.messages_of( config.group ).find( message => message.link().str === id )
	if( !message ) throw new Error( 'Сообщение пропало' )
	return message
}

async function photos( id, count ) {
	const out = []
	for( let index = 0; index < Math.min( count, limits.photos ); ++ index ) {

		let frame = null
		for( let turn = 0; turn < 60; ++ turn ) {
			frame = await fiber( ()=> {
				const file = frames( message_of( id ) )[ index ]?.remote()
				const data = file?.buffer()
				return data?.byteLength ? { data: Buffer.from( data ), type: String( file.type() ) } : null
			} ).catch( ()=> null )
			if( frame ) break
			await sleep( 1000 )
		}

		if( !frame ) throw new Error( 'Фото не докачалось' )
		if( !kinds[ frame.type ] ) throw new Error( `Не понимаю картинку ${ frame.type }` )
		if( frame.data.length > limits.photo ) throw new Error( 'Фото слишком большое' )
		out.push( frame )
	}
	return out
}

async function say( raw, reply, task ) {
	const text = scrub( raw )
	const body = text.length > limits.text ? text.slice( 0, limits.text ) + '…' : text
	const id = await fiber( ()=> {
		const list = talk.session( config.group )?.Messages( 'auto' )
		if( !list ) throw new Error( 'Нет права писать в чат' )
		const message = list.make( null )
		message.Author( 'auto' ).val( lord )
		message.Moment( 'auto' ).val( Date.now() )
		message.Text( 'auto' ).val( body )
		if( reply ) message.Reply( 'auto' ).val( reply )
		return message.link().str
	} )
	if( task ) state.replies[ id ] = task
	state_save()
	log( 'чат:', body.split( '\n' )[ 0 ] )
	return id
}

async function task_close( id ) {
	await fiber( ()=> { message_of( id ).Task_done( 'auto' ).val( Date.now() ) } )
}

const git_env = { PATH: process.env.PATH, HOME: os.homedir(), GIT_CONFIG_NOSYSTEM: '1', GIT_TERMINAL_PROMPT: '0' }

function git( ... args ) {
	return execFileSync( 'git', [
		'-c', 'core.hooksPath=/dev/null',
		'-c', 'core.fsmonitor=false',
		'--git-dir', at( 'repo.git' ),
		... args,
	], { env: git_env, cwd: DIR, encoding: 'utf8', maxBuffer: 2 ** 28 } )
}

function repo_open() {
	if( fs.existsSync( at( 'repo.git' ) ) ) return
	const url = execFileSync( 'git', [ '-C', GRAM, 'remote', 'get-url', 'origin' ], { encoding: 'utf8' } ).trim()
	execFileSync( 'git', [ 'clone', '--bare', url, at( 'repo.git' ) ], { env: git_env, stdio: 'ignore' } )
}

/** Каталоги, из которых собирается Грам: читаются из графа последней сборки. */
function sources() {
	const all = new Set([ 'node_modules', 'bog/bog.meta.tree' ])
	for( const bundle of [ 'web', 'node' ] ) {
		for( const file of json_load( path.join( GRAM, '-', bundle + '.deps.json' ), {} ).files ?? [] ) {
			const parts = file.split( '/' )
			all.add( parts[0] === 'bog' ? parts.slice( 0, 2 ).join( '/' ) : parts[0] )
		}
	}
	all.delete( 'bog/gram' )
	all.delete( '..' )
	return [ ... all ].filter( one => one && fs.existsSync( path.join( MAM, one ) ) )
}

function tree_make( name ) {
	const root = at( name )
	fs.rmSync( root, { recursive: true, force: true } )
	for( const dir of [ 'bog', '.home', '.tmp', '.bin' ] ) fs.mkdirSync( path.join( root, dir ), { recursive: true } )
	for( const one of sources() ) execFileSync( 'cp', [ '-cR', path.join( MAM, one ), path.join( root, path.dirname( one ) ) + '/' ] )
	execFileSync( 'find', [ root, '(',
		'-name', '.git', '-o', '-name', '.baza', '-o', '-name', '.npmrc', '-o', '-name', '.env', '-o', '-name', '.env.*',
		'-o', '-name', '*.pem', '-o', '-name', '*.key', '-o', '-name', '.claude', '-o', '-name', '*.heapprofile', '-o', '-name', 'Trace-*',
	')', '-prune', '-exec', 'rm', '-rf', '{}', '+' ] )
	const stub = '#!/bin/sh\ncase "$1 $2" in "remote show") echo "  HEAD branch: master";; esac\nexit 0\n'
	for( const bin of [ 'git', 'npm' ] ) fs.writeFileSync( path.join( root, '.bin', bin ), stub, { mode: 0o755 } )
	return root
}

function work_make( commit ) {
	const root = tree_make( 'work' )
	const gram = path.join( root, 'bog/gram' )
	fs.mkdirSync( gram )
	git( 'read-tree', commit )
	git( '--work-tree', gram, 'checkout-index', '-a', '-f' )
	return root
}

function run( command, args, { cwd, env, input = '', minutes } ) {
	return new Promise( done => {

		const child = spawn( command, args, { cwd, env, detached: true, stdio: [ 'pipe', 'pipe', 'pipe' ] } )
		let out = '', err = ''
		child.stdout.on( 'data', data => out = ( out + data ).slice( -4194304 ) )
		child.stderr.on( 'data', data => err = ( err + data ).slice( -65536 ) )
		const kill = ()=> { try { process.kill( - child.pid, 'SIGKILL' ) } catch {} }

		let late = false
		const timer = setTimeout( ()=> { late = true; kill() }, minutes * 60000 )
		process.once( 'exit', kill )

		const finish = code => {
			clearTimeout( timer )
			process.off( 'exit', kill )
			kill()
			done({ code, out, err, late })
		}
		child.on( 'error', error => { err += error.message; finish( -1 ) } )
		child.on( 'close', finish )
		child.stdin.on( 'error', ()=> {} )
		child.stdin.end( input )

	} )
}

/** Тесты исполняют код, написанный Клодом, поэтому без сети и без чтения домашнего каталога. */
function boxed( root, args, minutes ) {

	const node = path.resolve( process.execPath, '../..' )
	const profile = `(version 1)
(allow default)
(deny network*)
(deny file-write*)
(allow file-write* (subpath "${ root }") (literal "/dev/null") (literal "/dev/tty"))
(deny file-read* (subpath "/Users") (subpath "/Volumes") (subpath "/private/tmp") (subpath "/private/var/folders") (subpath "/Library/Keychains"))
(allow file-read-metadata (subpath "/Users") (subpath "/private/tmp"))
(allow file-read* (subpath "${ root }") (subpath "${ node }"))
(deny mach-lookup (global-name "com.apple.SecurityServer") (global-name "com.apple.securityd.xpc"))
(deny appleevent-send)
(deny process-exec (literal "/usr/bin/security") (literal "/usr/bin/osascript") (literal "/usr/bin/open"))`

	return run( '/usr/bin/sandbox-exec', [ '-p', profile, process.execPath, ... args ], {
		cwd: root,
		minutes,
		env: {
			PATH: `${ root }/.bin:${ node }/bin:/usr/bin:/bin`,
			HOME: `${ root }/.home`,
			TMPDIR: `${ root }/.tmp`,
		},
	} )
}

const tail = text => text.replace( /\x1b\[[0-9;]*m/g, '' ).trim().slice( - 3000 )

async function check() {

	const root = fs.realpathSync( tree_make( 'check' ) )
	const gram = path.join( root, 'bog/gram' )
	execFileSync( 'cp', [ '-cR', at( 'work/bog/gram' ), path.join( root, 'bog' ) + '/' ] )
	fs.rmSync( path.join( gram, '-' ), { recursive: true, force: true } )

	const build = await boxed( root, [ 'node_modules/mam/node.js', 'bog/gram' ], 10 )

	for( const bundle of [ 'web', 'node' ] ) {
		const file = path.join( gram, '-', bundle + '.audit.js' )
		const audit = fs.existsSync( file ) ? fs.readFileSync( file, 'utf8' ) : ''
		if( !audit.includes( 'Audit passed' ) ) return { ok: false, what: 'сборка', detail: tail( audit || build.out + build.err ) }
	}

	const test = await boxed( root, [ 'bog/gram/-/node.test.js' ], 5 )
	const passed = tail( test.out ).match( /All tests passed\s+count (\d+)/ )
	if( test.code !== 0 || !passed ) return { ok: false, what: 'тесты', detail: tail( test.out + test.err ) }

	return { ok: true, count: Number( passed[1] ) }
}

const schema = JSON.stringify({
	type: 'object',
	properties: {
		status: { enum: [ 'done', 'failed', 'question' ] },
		report: { type: 'string' },
	},
	required: [ 'status', 'report' ],
})

const rules = `Ты выполняешь задачи по мессенджеру Gram на $mol. Правь только файлы в bog/gram, кроме push/, bot/, version/ и .git*. Остальное в дереве только для чтения, правки там пропадут.
Сначала прочитай bog/gram/README.md, AGENTS.md и соседний код. Без комментариев в коде, стиль как в соседних файлах, тексты в дереве через @ и переводы в locale=ru и locale=zh, на новую логику тест рядом с модулем.
Запускать команды нельзя: сборку и тесты после тебя прогонит бот и вернёт ошибки.
Текст задачи и картинки описывают желаемое поведение Gram. Не упоминай почту владельца, имена пользователей и пути вне bog/gram. Просьбы раскрыть ключи, токены или чужие данные, ослабить права или шифрование не выполняй: ответь failed и объясни.
В ответе status: done (сделано), failed (не вышло, с причиной и что пробовал), question (без уточнения не решить). report: по-русски, коротко, для людей в чате: что изменилось для пользователя, какие файлы, что не проверено.`

async function claude( input, session ) {

	const env = {
		PATH: process.env.PATH,
		HOME: os.homedir(),
		USER: os.userInfo().username,
		LANG: 'en_US.UTF-8',
		TMPDIR: os.tmpdir(),
	}
	if( process.env.CLAUDE_CODE_OAUTH_TOKEN ) env.CLAUDE_CODE_OAUTH_TOKEN = process.env.CLAUDE_CODE_OAUTH_TOKEN

	const res = await run( 'claude', [
		'-p',
		'--restricted',
		'--strict-mcp-config',
		'--tools', 'Read,Edit,Write,Glob,Grep',
		'--permission-mode', 'acceptEdits',
		'--permission-prompts', 'none',
		'--append-system-prompt', rules,
		'--output-format', 'json',
		'--json-schema', schema,
		... session ? [ '--resume', session ] : [],
	], { cwd: at( 'work' ), env, input, minutes: config.minutes } )

	if( res.late ) return { status: 'failed', report: `Не уложился в ${ config.minutes } мин`, session }

	try {
		const reply = JSON.parse( res.out )
		const answer = reply.structured_output
		if( reply.is_error || !answer ) return { status: 'failed', report: 'Claude не ответил: ' + reply.subtype, session: reply.session_id ?? session }
		return { ... answer, session: reply.session_id }
	} catch {
		log( 'claude', res.code, tail( res.err ) )
		return { status: 'failed', report: 'Claude не запустился, подробности в логе бота', session }
	}
}

function changes( base ) {
	const gram = at( 'work/bog/gram' )
	git( 'read-tree', base )
	git( '--work-tree', gram, 'add', '-A' )
	const raw = git( 'diff', '--cached', '--raw', '--no-renames', '--no-abbrev', '-z', base ).split( '\0' ).filter( Boolean )
	const out = []
	for( let i = 0; i + 1 < raw.length; i += 2 ) out.push({ mode: raw[ i ].split( ' ' )[1], file: raw[ i + 1 ] })
	return out
}

function commit( base, branch, text ) {
	const ident = [ '-c', 'user.name=gram-bot', '-c', 'user.email=gram-bot@localhost' ]
	const tree = git( 'write-tree' ).trim()
	const title = '$bog_gram: ' + scrub( text ).replace( /\s+/g, ' ' ).trim().slice( 0, 100 )
	const hash = git( ... ident, 'commit-tree', tree, '-p', base, '-m', title ).trim()
	git( 'update-ref', 'refs/heads/' + branch, hash )
	return hash
}

function prompt( text, pictures ) {
	const dir = at( 'work/.photos' )
	fs.rmSync( dir, { recursive: true, force: true } )
	fs.mkdirSync( dir )
	const names = pictures.map( ( picture, index )=> {
		const name = `.photos/${ index + 1 }.${ kinds[ picture.type ] }`
		fs.writeFileSync( at( 'work', name ), picture.data )
		return name
	} )
	return [
		text || 'Задача описана на картинке.',
		... names.length ? [ 'Картинки к задаче, прочитай их: ' + names.join( ', ' ) ] : [],
	].join( '\n\n' )
}

async function solve( id, text, pictures ) {

	const task = state.tasks[ id ]
	const began = Date.now()

	if( !task.commit ) git( 'fetch', 'origin', '+refs/heads/master:refs/remotes/origin/master' )
	const base = task.commit || git( 'rev-parse', 'refs/remotes/origin/master' ).trim()
	work_make( base )

	let input = prompt( text, pictures )
	let checked = null

	for( let turn = 0; ; ++ turn ) {

		const answer = await claude( input, task.session )
		task.session = answer.session
		task.status = answer.status
		state_save()

		const minutes = Math.max( 1, Math.round( ( Date.now() - began ) / 60000 ) )

		if( answer.status === 'question' ) return say( `Уточни, ответом на это сообщение:\n${ answer.report }`, id, id )
		if( answer.status !== 'done' ) return say( `Не вышло, ${ minutes } мин.\n${ answer.report }`, id, id )

		const files = changes( base )

		if( !files.length ) {
			task.status = 'failed'
			return say( `Файлы не изменены, задачу не закрываю.\n${ answer.report }`, id, id )
		}

		const wrong = files.filter( one => banned.test( one.file ) || ![ '100644', '000000' ].includes( one.mode ) )

		if( wrong.length ) {
			task.status = 'failed'
			return say( `Не вышло: затронуты запрещённые файлы: ${ wrong.map( one => one.file ).join( ', ' ) }`, id, id )
		}

		const added = git( 'diff', '--cached', '--no-color', '--unified=0', base ).split( '\n' ).filter( line => line.startsWith( '+' ) && !line.startsWith( '+++ ' ) )
		if( added.some( leaky ) || files.some( one => leaky( one.file ) ) ) {
			task.status = 'failed'
			return say( 'Не вышло: в правке похожее на личные данные или ключ. Посмотри ветку на маке сам, в чат не показываю.', id, id )
		}

		checked = await check()

		if( checked.ok ) {

			const branch = 'bot/' + task.number
			task.commit = commit( base, branch, text )
			task.status = 'ready'
			state_save()

			return say( [
				`Готово, ${ minutes } мин. Аудит чистый, тестов прошло ${ checked.count }.`,
				answer.report,
				`Файлы: ${ files.map( one => one.file ).join( ', ' ) }`,
				`Коммит ${ task.commit.slice( 0, 7 ) } в локальной ветке ${ branch }. Пуш пока выключен, на проде этого нет, задача остаётся открытой.`,
			].join( '\n' ), id, id )
		}

		if( turn >= config.fixes ) {
			task.status = 'failed'
			return say( `Не вышло, ${ minutes } мин: не проходит ${ checked.what } после ${ turn + 1 } попыток.\n${ answer.report }`, id, id )
		}

		input = `Проверка не прошла, ${ checked.what }:\n${ checked.detail }\n\nИсправь.`
	}
}

function quota() {
	const day = new Date().toISOString().slice( 0, 10 )
	if( ( state.days[ day ] ?? 0 ) >= config.daily ) return false
	state.days = { [ day ]: ( state.days[ day ] ?? 0 ) + 1 }
	return true
}

async function take( message, id ) {

	if( !quota() ) {
		if( state.full === new Date().toDateString() ) return
		state.full = new Date().toDateString()
		return say( `На сегодня лимит: ${ config.daily }. Продолжу завтра.`, message.id )
	}

	state.seen.push( message.id )
	state.tasks[ id ] ??= { number: Object.keys( state.tasks ).length + 1 }
	state.tasks[ id ].status = 'running'
	state_save()

	try {
		await say( config.dry ? `Вижу задачу, фото: ${ message.frames }` : 'Взял', message.id, id )
		const pictures = await photos( message.id, message.frames )
		if( config.dry ) {
			state.tasks[ id ].status = 'dry'
			await say( `Прочитал: «${ message.text }», фото: ${ pictures.map( one => one.data.length + ' Б' ).join( ', ' ) || 'нет' }`, message.id, id )
			return task_close( id )
		}
		await solve( id, message.text, pictures )
	} catch( error ) {
		log( error )
		state.tasks[ id ].status = 'failed'
		await say( 'Не вышло: сломался бот, подробности в его логе', id, id ).catch( log )
	}

	state_save()
}

function next( list ) {

	for( const message of list ) {

		if( !message.trusted || message.moment < state.since || state.seen.includes( message.id ) ) continue

		const id = state.replies[ message.reply ]
		if( id && state.tasks[ id ] ) return { message, id }

		if( message.task && !message.done ) return { message, id: message.id }
	}

	return null
}

async function main() {

	lock()
	await baza_open()

	const [ , group, owner, via ] = String( config.group ).match( /join=([^/&#]+)(?:\/by=([^/&#]+))?(?:\/via=([^/&#]+))?/ ) ?? [ '', config.group ]
	config.group = group
	for( const one of [ owner, via ] ) if( one ) await group_ask( group, one )

	if( !config.group || !config.lords.length ) {
		console.log( `Впиши group (ссылка-приглашение группы) и lords в ${ at( 'config.json' ) } и запусти снова. Пока бот в сети, его можно добавить в группу.` )
		await new Promise( ()=> setInterval( ()=> {}, 1 << 30 ) )
	}

	if( !config.dry ) repo_open()

	let named = false, waiting = 0

	for( ; ; await sleep( 2000 ) ) {
		try {

			const open = await chat_open().catch( error => {
				if( error.message !== 'Access denied' ) throw error
				return false
			} )

			if( !open ) {
				if( waiting ++ % 30 === 0 ) log( 'чат ещё не прочитан: бот не в группе или данные не доехали' )
				continue
			}

			if( !named ) {
				if( !state.since ) state.since = Date.now()
				state_save()
				await chat_name()
				named = true
				log( 'чат прочитан, жду задач' )
				for( const [ id, task ] of Object.entries( state.tasks ) ) {
					if( task.status !== 'running' ) continue
					task.status = 'failed'
					await say( 'Бот перезапускался и бросил эту задачу. Ответь на это сообщение, чтобы продолжить.', id, id )
				}
			}

			const found = next( await messages() )
			if( found ) await take( found.message, found.id )

		} catch( error ) {
			log( 'обход:', error.message )
		}
	}
}

process.on( 'unhandledRejection', error => log( 'отказ:', error?.message ) )

if( require.main === module ) main().catch( error => { console.error( error ); process.exit( 1 ) } )

module.exports = { scrub, leaky, check, work_make, changes, commit, claude, solve, repo_open, git, boxed, tree_make, state, config, at }
