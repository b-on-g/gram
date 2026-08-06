namespace $.$$ {

	const prod_master = 'https://baza.87.120.36.150.ip.giper.dev/'

	const day_ms = 24 * 60 * 60 * 1000

	/** Ключ локального хранилища: подписка на пуши переживает перезагрузку. */
	const notify_key = 'bog_gram_notify'

	/** Полный размер ключа аккаунта в байтах: публичная часть плюс приватная. */
	const auth_size = 128

	/** Имя файла, в который сохраняется ключ аккаунта. */
	const auth_file = 'gram-account.key'

	/** Заголовок избранного: он же в списке, он же в шапке чата. */
	const saved_name = 'Избранное'

	/** Сколько держать палец на своём пузыре, чтобы под ним раскрылись
	 * правка и удаление: короче — срабатывает на обычном тапе, длиннее —
	 * ощущается как зависший интерфейс. */
	const press_delay = 400

	/** Предел большей стороны кадра в пузыре. Крупнее — и переписка
	 * превращается в ленту плакатов, где текста уже не видно. */
	const shot_side = 15

	/** Пикселей в одном rem: по нему понимаем, не мельче ли сама картинка
	 * отведённой ей коробки — растягивать мелкий кадр незачем. */
	const rem_px = 16

	/** Как часто перерисовывается таймер записи: чаще человек всё равно не
	 * заметит, а реже секунды начинают перескакивать через одну. */
	const clock_tick = 200

	/** Разобранные ключи участников: одной и той же строке должен отвечать
	 * один и тот же объект. Выдача права на шифрованный ленд считает общий
	 * секрет и держит его при самом объекте ключа, а фибра перезапускается с
	 * начала на каждом ожидании — свежий разбор на каждой попытке заводил бы
	 * счёт заново, и попытки не кончились бы никогда. */
	const pass_parsed = new Map< string, $giper_baza_auth_pass >()

	/** Что показать под полем ввода, когда с записью не сложилось. Ни
	 * модалок, ни системных окон — одна строка на месте. */
	const voice_denied = 'Микрофон недоступен: разрешите запись в настройках браузера'
	const voice_short = 'Слишком коротко — запись отменена'

	export class $bog_gram extends $.$bog_gram {

		// ===== Подключение к мастеру =====

		@$mol_mem
		baza_master() {
			const custom = this.$.$mol_state_arg.value( 'baza' ) ?? ''
			const url = custom || prod_master
			const masters = this.$.$giper_baza_yard.masters_default
			if( !masters.includes( url ) ) masters.unshift( url )
			return url
		}

		// ===== Текущий пользователь =====

		user_store() {
			return this.$.$giper_baza_glob.home().land().Data( $bog_gram_user )
		}

		@$mol_mem
		my_lord() {
			return this.$.$giper_baza_auth.current().pass().lord().str
		}

		/** Публичная часть своего ключа строкой. Приватная сюда не попадает:
		 * это ровно то, что можно класть в открытый реестр — по нему мне и
		 * выдадут право читать шифрованный ленд диалога. */
		@$mol_mem
		my_pass_str() {
			return this.$.$giper_baza_auth.current().pass().toString()
		}

		@$mol_mem
		user_name( next?: string ) {
			if( next !== undefined ) this.user_store().Name( 'auto' )?.val( next )
			return this.user_store().Name()?.val() ?? ''
		}

		// ===== Служебные ленды пользователя (ссылки хранятся в профиле) =====

		@$mol_action
		inbox_land_make() {
			const land = this.$.$giper_baza_glob.land_grab([
				[ null, $giper_baza_rank_post( 'slow' ) ],
			])
			this.user_store().Inbox_land( 'auto' )?.val( land.link().str )
			return land
		}

		inbox_land() {
			const str = this.user_store().Inbox_land()?.val()
			if( !str ) return this.inbox_land_make()
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( String( str ) ) )
		}

		@$mol_action
		dialogs_land_make() {
			const land = this.$.$giper_baza_glob.land_grab([
				[ null, $giper_baza_rank_deny ],
			])
			this.user_store().Dialogs_land( 'auto' )?.val( land.link().str )
			return land
		}

		dialogs_land() {
			const str = this.user_store().Dialogs_land()?.val()
			if( !str ) return this.dialogs_land_make()
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( String( str ) ) )
		}

		@$mol_action
		monitor_land_make() {
			const land = this.$.$giper_baza_glob.land_grab([
				[ null, $giper_baza_rank_read ],
			])
			this.user_store().Monitor_land( 'auto' )?.val( land.link().str )
			return land
		}

		monitor_land() {
			const str = this.user_store().Monitor_land()?.val()
			if( !str ) return this.monitor_land_make()
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( String( str ) ) )
		}

		@$mol_action
		devices_land_make() {
			const land = this.$.$giper_baza_glob.land_grab([
				[ null, $giper_baza_rank_deny ],
			])
			this.user_store().Devices_land( 'auto' )?.val( land.link().str )
			return land
		}

		devices_land() {
			const str = this.user_store().Devices_land()?.val()
			if( !str ) return this.devices_land_make()
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( String( str ) ) )
		}

		dialogs_store() {
			return this.dialogs_land().Data( $bog_gram_dialogs )
		}

		inbox_store() {
			return this.inbox_land().Data( $bog_gram_inbox )
		}

		monitor_store() {
			return this.monitor_land().Data( $bog_gram_monitor )
		}

		devices_store() {
			return this.devices_land().Data( $bog_gram_devices )
		}

		@$mol_mem
		device_ready() {
			const dev = this.devices_store().Registry( 'auto' )?.key( 'web', 'auto' )
			if( dev && !dev.Title()?.val() ) {
				dev.Title( 'auto' )?.val( 'Web client' )
				dev.Token( 'auto' )?.val( 'stub' )
			}
			return true
		}

		// ===== Чужие профили =====

		peer_store( lord: string ) {
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( lord ) ).Data( $bog_gram_user )
		}

		/** Имя человек хранит в своём ленде, и тот приезжает не сразу — а с
		 * ключом из реестра диалог заводится и вовсе без сети. Ждать имени
		 * поэтому нельзя: пока его нет, показываем сокращённый идентификатор,
		 * подписка на приход ленда сохраняется, и имя проявится само. */
		@$mol_mem_key
		peer_name( lord: string ) {
			try {
				return this.peer_store( lord ).Name()?.val() ?? ''
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return ''
			}
		}

		// ===== Свои подписи собеседников =====

		/** Как я назвал человека для себя. Подписи лежат в том же приватном
		 * ленде, что и список диалогов, поэтому собеседник их не видит и
		 * своего имени в профиле из-за них не теряет. */
		@$mol_mem_key
		peer_note( lord: string ) {
			if( !lord ) return ''
			return this.dialogs_store().Notes()?.key( lord )?.Title()?.val() ?? ''
		}

		/** Пустая подпись означает «показывать настоящее имя»: ради неё запись
		 * в словаре не заводим, а уже заведённую просто очищаем. */
		@$mol_action
		peer_note_set( lord: string, next?: string ) {

			if( !lord ) return null

			const title = next ?? ''
			const notes = this.dialogs_store().Notes( 'auto' )
			if( !notes ) return null
			if( !title && !notes.key( lord ) ) return null

			notes.key( lord, 'auto' )?.Title( 'auto' )?.val( title )

			return null
		}

		/** Порядок один на всё приложение: моя подпись важнее имени из чужого
		 * профиля, а безымянного и неподписанного показываем сокращённым
		 * идентификатором. Аватар при этом остаётся привязан к лорду —
		 * от переименования человек не должен менять лицо. */
		label_pick( lord: string, note: string, name: string ) {
			if( !lord ) return ''
			return note || name || this.lord_short( lord )
		}

		peer_label( lord: string ) {
			return this.label_pick( lord, this.peer_note( lord ), this.peer_name( lord ) )
		}

		// ===== Аватары =====

		/** Номер цвета из палитры: один и тот же лорд всегда красится одинаково. */
		avatar_tint( lord: string ) {
			let hash = 0
			for( const symbol of lord ) hash = ( hash * 31 + symbol.charCodeAt( 0 ) ) % 7
			return hash
		}

		/** Ленды собеседников приезжают не сразу: suspend в аватаре подвесил бы
		 * весь список, поэтому пока рисуем пустой кружок — подписка
		 * сохраняется, узор и цвет проявятся сами.
		 *
		 * У группы собеседника нет, зато есть свой ленд: по его ссылке узор и
		 * рисуем — он у группы один на всех участников. */
		@$mol_mem_key
		dialog_avatar_id( id: string ) {
			try {
				if( this.group_is( id ) ) return id
				return this.dialog_peer( id )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return ''
			}
		}

		@$mol_mem_key
		dialog_tint( id: string ) {
			try {
				return this.avatar_tint( this.dialog_avatar_id( id ) )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return 0
			}
		}

		user_tint( lord: string ) {
			return this.avatar_tint( lord )
		}

		// ===== Избранное: диалог с самим собой =====

		/** Заметки для себя лежат в приватном шифрованном ленде, как и список
		 * диалогов: ссылка на него хранится там же, а не в открытом профиле.
		 * Захват небыстрый, и клик по строке может позвать сюда второй раз —
		 * поэтому уже записанная ссылка всегда важнее только что захваченной.
		 *
		 * Заводим ленд только отсюда, то есть по явному клику: список диалогов
		 * приезжает не мгновенно, и на свежем устройстве пустая ссылка какое-то
		 * время выглядит как «ленда ещё нет». Захват на старте приложения
		 * попадал в это окно всегда. */
		@$mol_action
		saved_land_make() {

			const land = this.$.$giper_baza_glob.land_grab([
				[ null, $giper_baza_rank_deny ],
			])

			const str = this.dialogs_store().Saved_land()?.val()
			if( str ) return this.$.$giper_baza_glob.Land( new $giper_baza_link( String( str ) ) )

			const link = land.link().str
			this.dialogs_store().Saved_land( 'auto' )?.val( link )
			this.dialogs_store().Saved_lands( 'auto' )!.add( link )

			return land
		}

		saved_land() {
			const str = this.dialogs_store().Saved_land()?.val()
			if( !str ) return this.saved_land_make()
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( String( str ) ) )
		}

		/** Ссылка на уже заведённый ленд: строка избранного рисуется с первого
		 * кадра, а захват ленда идёт своим чередом — ждать его список не должен. */
		@$mol_mem
		saved_id() {
			return String( this.dialogs_store().Saved_land()?.val() ?? '' )
		}

		/** Все ленды заметок, какие про этот аккаунт известны, и указанный
		 * последним. Их больше одного, если избранное успело завестись на двух
		 * устройствах сразу: заметки при этом разъезжаются по разным лендам, и
		 * терять один из них только потому, что ссылка указывает на другой,
		 * незачем — читаем изо всех, а пишем всегда в указанный. */
		@$mol_mem
		saved_links() {
			const current = this.saved_id()
			let all: string[] = []
			try {
				all = ( this.dialogs_store().Saved_lands()?.items() ?? [] ).map( String )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
			}
			const rest = all.filter( link => link && link !== current )
			return current ? [ ... rest, current ] : rest
		}

		/** Единственная развилка на всё приложение: у избранного нет собеседника,
		 * поэтому ни галочек прочтения, ни счётчика непрочитанных, ни «вы:»
		 * в превью ему не полагается.
		 *
		 * Заброшенный ленд заметок остаётся избранным наравне с указанным:
		 * иначе открытая с него страница схлопывалась бы сама, а отправка с
		 * неё молча ничего не делала. */
		saved_is( id: string ) {
			if( !id ) return false
			return this.saved_links().includes( id )
		}

		override saved_title() {
			return saved_name
		}

		/** На новом устройстве ленд избранного приезжает не мгновенно: пока он
		 * в пути, строка стоит с пустым превью, а не вешает весь список. */
		@$mol_mem
		saved_preview() {
			const id = this.saved_id()
			if( !id ) return ''
			try {
				return this.dialog_preview( id )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return ''
			}
		}

		@$mol_mem
		saved_time() {
			const id = this.saved_id()
			if( !id ) return ''
			try {
				return this.dialog_time( id )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return ''
			}
		}

		@$mol_mem
		saved_current_is() {
			return this.saved_is( this.dialog_active() )
		}

		/** Клик по строке заводит ленд, если его ещё нет: действие живёт в фибре,
		 * поэтому захват с его перебором степеней тут уместен. */
		@$mol_action
		saved_open( next?: any ) {
			this.dialog_select( this.saved_land().link().str )
			return null
		}

		// ===== Диалоги =====

		@$mol_mem
		dialog_ids() {
			return ( this.dialogs_store().Dialogs()?.items() ?? [] ).map( String )
		}

		/** Убранные из своего списка диалоги: инвайт на такой ленд игнорируем,
		 * иначе собеседник вернул бы диалог обратно на следующем же синке. */
		@$mol_mem
		hidden_ids() {
			return ( this.dialogs_store().Hidden()?.items() ?? [] ).map( String )
		}

		dialog_store( id: string ) {
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( id ) ).Data( $bog_gram_dialog )
		}

		@$mol_mem_key
		dialog_peer( id: string ) {
			if( this.saved_is( id ) ) return ''
			const peers = this.dialog_lords( id )
			return peers.find( lord => lord !== this.my_lord() ) ?? peers[0] ?? ''
		}

		/** Все участники диалога, включая меня. Ленд может быть ещё не
		 * засинкан — тогда чтение приостанавливается, и это правильно: по
		 * этому списку выдаются права, и неполным он быть не должен. Места,
		 * где ждать нечем, прикрываются сами. */
		dialog_lords( id: string ) {
			if( !id ) return [] as string[]
			if( this.saved_is( id ) ) return [] as string[]
			return ( this.dialog_store( id ).Peers()?.items() ?? [] ).map( String )
		}

		/** Все, кроме меня: кому выдавать права и чьи прочтения считать. */
		dialog_mates( id: string ) {
			const my = this.my_lord()
			return this.dialog_lords( id ).filter( lord => lord !== my )
		}

		/** Ключи участников одним списком. Неполный список — это отказ: писать
		 * в ленд, который часть группы никогда не откроет, незачем. Ключи
		 * умеют ждать, поэтому зовётся только из фибры. */
		passes_of( lords: readonly string[] ) {
			const passes: $giper_baza_auth_pass[] = []
			for( const lord of lords ) {
				const pass = this.peer_pass_of( lord )
				if( pass ) passes.push( pass )
			}
			return passes
		}

		/** Безымянного собеседника показываем началом и концом идентификатора:
		 * у одного только начала первые символы у разных людей совпадают глазом. */
		lord_short( lord: string ) {
			if( lord.length <= 14 ) return lord
			return lord.slice( 0, 6 ) + '…' + lord.slice( -4 )
		}

		// ===== Группы =====

		/** Название группы. Пустое — группу не назвали, и подписываться она
		 * будет своими участниками. Ленд может быть ещё не засинкан: заголовок
		 * это косметика, ждать её незачем — подписка сохраняется, название
		 * проявится само. */
		@$mol_mem_key
		group_title( id: string ) {
			if( !id ) return ''
			if( this.saved_is( id ) ) return ''
			try {
				return String( this.dialog_store( id ).Title()?.val() ?? '' )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return ''
			}
		}

		/** Группа отличается от переписки вдвоём числом участников: третий
		 * человек делает её группой. Названная — тоже группа, даже если в ней
		 * пока двое: название заводят осознанно, и от того, что кто-то вышел,
		 * группа обратно в личную переписку превращаться не должна. */
		@$mol_mem_key
		group_is( id: string ) {
			if( !id ) return false
			if( this.saved_is( id ) ) return false
			try {
				if( this.dialog_lords( id ).length > 2 ) return true
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
			}
			return Boolean( this.group_title( id ) )
		}

		/** Группа без названия подписывается своими участниками: список имён
		 * говорит больше, чем «5 участников». */
		@$mol_mem_key
		group_name_auto( id: string ) {
			let mates: readonly string[] = []
			try {
				mates = this.dialog_mates( id )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
			}
			if( !mates.length ) return this.lord_short( id )
			return mates.map( lord => this.peer_label( lord ) ).join( ', ' )
		}

		@$mol_mem_key
		admin_lords( id: string ) {
			if( !id ) return [] as string[]
			try {
				return ( this.dialog_store( id ).Admins()?.items() ?? [] ).map( String )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return [] as string[]
			}
		}

		/** Создатель группы — король её ленда, и админом остаётся всегда:
		 * отдельной записи для него не нужно. */
		admin_is( id: string, lord: string ) {
			if( !id || !lord ) return false
			if( this.dialog_owner( id ) === lord ) return true
			if( lord === this.my_lord() && this.dialog_own( id ) ) return true
			return this.admin_lords( id ).includes( lord )
		}

		admin_me( id: string ) {
			return this.admin_is( id, this.my_lord() )
		}

		/** Назначает админов создатель: раздавать право раздавать права — его
		 * решение, а не решение назначенного. */
		owner_me( id: string ) {
			return this.dialog_own( id )
		}

		/** Ранг участника в лендах группы. Чтобы админ мог выдать право новому
		 * человеку, ему самому нужно полное управление лендом — а вместе с ним
		 * он получает и возможность менять чужие права: разделить эти
		 * способности в Базе нечем. */
		member_rank( id: string, lord: string ) {
			return this.admin_is( id, lord ) ? $giper_baza_rank_rule : $giper_baza_rank_post( 'fast' )
		}

		@$mol_mem_key
		dialog_title( id: string ) {
			if( this.saved_is( id ) ) return saved_name
			if( this.group_is( id ) ) return this.group_title( id ) || this.group_name_auto( id )
			const peer = this.dialog_peer( id )
			if( !peer ) return this.lord_short( id )
			return this.peer_label( peer )
		}

		/** Момент последней активности — по нему диалоги сортируются в списке.
		 * Ленды могут быть ещё не засинканы: suspend любого из них не должен
		 * вешать весь список, поэтому недоступное заменяем нулём — подписка
		 * на приход данных при этом сохраняется, список пересортируется сам. */
		@$mol_mem_key
		dialog_moment( id: string ) {
			try {
				const messages = this.messages_alive_of( id )
				const last = messages[ messages.length - 1 ]
				if( last ) return Number( last.Moment()?.val() ?? 0 )
				return Number( this.dialog_store( id ).Created()?.val() ?? 0 )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return 0
			}
		}

		/** Порядок один и тот же и в основном списке, и в архиве: свежие сверху. */
		fresh_first( ids: readonly string[] ) {
			return [ ... ids ].sort( ( a, b )=> this.dialog_moment( b ) - this.dialog_moment( a ) )
		}

		// ===== Кого пускать в список =====

		/** Создатель диалога — лорд его ленда: ленд заводит тот, кто начал
		 * переписку. Ссылка приезжает из инбокса, открытого на запись всем,
		 * поэтому мусор вместо неё — обычное дело: разбор его отвергает, и
		 * весь список из-за одной такой строки падать не должен. */
		dialog_owner( id: string ) {
			if( !id ) return ''
			try {
				return String( this.dialog_store( id ).Owner()?.val() ?? '' )
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				$mol_fail_log( error )
				return ''
			}
		}

		/** Моя ли это переписка. У заведённых до появления записи о создателе
		 * спрашивать некого, поэтому смотрим на права: полное управление лендом
		 * получает тот, кто его захватил, а в старых диалогах админов не было. */
		@$mol_mem_key
		dialog_own( id: string ) {
			if( !id ) return false
			try {

				const owner = this.dialog_owner( id )
				if( owner ) return owner === this.my_lord()

				const land = this.$.$giper_baza_glob.Land( new $giper_baza_link( id ) )
				return land.lord_rank( new $giper_baza_link( this.my_lord() ) ) === $giper_baza_rank_rule

			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return false
			}
		}

		/** Есть ли в диалоге хоть одно живое сообщение — чьё угодно. Ленд может
		 * быть ещё не засинкан: тогда сообщений «нет», и чужой диалог просто
		 * подождёт снаружи списка. Подписка на приход данных сохраняется, так
		 * что строка появится сама вместе с первым сообщением. */
		@$mol_mem_key
		dialog_alive( id: string ) {
			try {
				return this.messages_alive_of( id ).length > 0
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return false
			}
		}

		/** Собеседники, с которыми я согласился переписываться. Список свой,
		 * приватный: собеседник не знает ни что попал в запросы, ни что вышел
		 * из них. */
		@$mol_mem
		accepted_lords() {
			return ( this.dialogs_store().Accepted()?.items() ?? [] ).map( String )
		}

		/** Знакомый — тот, кого я встречал в своих реестрах или принял руками.
		 * Реестр может быть ещё не засинкан: чтение уже прикрыто, подписка на
		 * его приход сохраняется, и запрос уедет в общий список сам. */
		@$mol_mem_key
		peer_known( lord: string ) {
			if( !lord ) return false
			if( this.accepted_lords().includes( lord ) ) return true
			return Boolean( this.user_sources()[ lord ] )
		}

		/** Собеседник, к которому я пришёл сам, знаком по определению: диалог с
		 * ним не должен оказаться в запросах, даже если ленд под него завёл он.
		 * Сюда попадает и строка, набранная руками в поле собеседника, поэтому
		 * заведомую опечатку отсеиваем: копить мусор в приватном ленде незачем.
		 * Запись идемпотентна — обработчик события перезапускается на каждом
		 * ожидании, и повторный заход не должен ничего дописывать. */
		@$mol_action
		peer_accept( lord: string ) {
			if( !lord ) return null
			if( lord === this.my_lord() ) return null
			if( !$giper_baza_link.check( lord ) ) return null
			if( this.accepted_lords().includes( lord ) ) return null
			this.dialogs_store().Accepted( 'auto' )!.add( lord )
			return null
		}

		/** Куда попадает диалог в списке. Свой показываем всегда — пустым его
		 * завёл я сам, и это моё решение. Чужой пустой не показываем вовсе:
		 * человек мог открыть диалог со мной и передумать, а строка от него
		 * уже стояла бы в списке. Чужой с сообщениями от незнакомого человека
		 * уходит в запросы: знакомство предлагают, а не назначают. */
		dialog_sort( own: boolean, alive: boolean, known: boolean ): 'plain' | 'request' | 'skip' {
			if( own ) return 'plain'
			if( !alive ) return 'skip'
			return known ? 'plain' : 'request'
		}

		/** То же по ссылке на диалог. Заархивированный не разбираем: он уже
		 * прошёл через мои руки, и второй раз спрашивать про него незачем.
		 * Свой ответ в диалоге — то же согласие, только данное молча: иначе
		 * давняя переписка с человеком не из реестра уехала бы в запросы. */
		@$mol_mem_key
		dialog_kind( id: string ): 'plain' | 'request' | 'skip' {
			if( this.archive_is( id ) ) return 'plain'
			const lord = this.dialog_owner( id )
			const own = this.dialog_own( id )
			const known = this.peer_known( lord ) || this.mine_wrote( id )
			return this.dialog_sort( own, this.dialog_alive( id ), known )
		}

		/** Запросы на переписку: чужие диалоги с сообщениями от людей, которых
		 * я нигде не встречал. Убранные из списка сюда не попадают — отказ
		 * такое же решение, как и согласие. */
		@$mol_mem
		request_ids() {
			const dropped = new Set( this.hidden_ids() )
			return this.fresh_first( this.dialog_ids().filter( id => {
				if( dropped.has( id ) ) return false
				return this.dialog_kind( id ) === 'request'
			} ) )
		}

		/** Избранное стоит первой строкой всегда, вход в архив и вход в запросы —
		 * последними и только пока им есть что показать; развёрнутый раздел
		 * досыпает строки туда же. */
		@$mol_mem
		dialog_rows() {

			const archived = this.archive_ids()
			const folded = new Set( archived )
			const requests = this.request_ids()
			const asked = new Set( requests )

			const visible = this.fresh_first( this.dialog_ids().filter( id => {
				if( folded.has( id ) ) return false
				if( asked.has( id ) ) return false
				return this.dialog_kind( id ) !== 'skip'
			} ) )

			const empty = !visible.length && !archived.length && !requests.length

			return [
				this.Saved_row(),
				... visible.map( id => this.Dialog_row( id ) ),
				... empty ? [ this.Dialogs_empty() ] : [],
				... archived.length ? [ this.Archive_row() ] : [],
				... this.archive_opened() ? this.fresh_first( archived ).map( id => this.Dialog_row( id ) ) : [],
				... requests.length ? [ this.Requests_row() ] : [],
				... this.requests_opened() ? requests.map( id => this.Dialog_row( id ) ) : [],
			]
		}

		@$mol_mem
		dialog_current( next?: string ) {
			return next ?? ''
		}

		@$mol_mem_key
		dialog_current_is( id: string ) {
			return this.dialog_active() === id
		}

		@$mol_action
		dialog_select( id: string, next?: any ) {
			this.sound_hush()
			this.compose_opened( false )
			this.settings_opened( false )
			this.group_opened( false )
			this.members_opened( false )
			this.leave_armed( false )
			this.account_reset()
			this.edit_id( '' )
			this.message_text( '' )
			this.message_menu( '' )
			this.zoom_id( '' )
			this.delete_disarm()
			this.dialog_current( id )
			this.chat_bring()
			return null
		}

		/** Книга доводит страницу до края сама только когда та появляется
		 * впервые. При переходе между диалогами страница чата уже открыта и
		 * лишь меняет содержимое, поэтому на узком экране пользователь
		 * оставался на списке и дальше листал руками. Досылаем прокрутку
		 * после отрисовки, когда размеры страницы уже известны. */
		chat_bring() {
			new this.$.$mol_after_tick( ()=> {
				try {
					const book = this.dom_node() as HTMLElement
					const page = this.Chat_page().dom_node() as HTMLElement
					if( !book || !page ) return
					book.scroll({
						left: page.offsetLeft + page.offsetWidth - book.offsetWidth,
						behavior: 'smooth',
					})
				} catch( error ) {
					if( $mol_promise_like( error ) ) return
					$mol_fail_log( error )
				}
			} )
		}

		@$mol_action
		dialog_close( next?: any ) {
			this.sound_hush()
			this.edit_id( '' )
			this.message_text( '' )
			this.message_menu( '' )
			this.zoom_id( '' )
			this.delete_disarm()
			this.members_opened( false )
			this.leave_armed( false )
			this.dialog_current( '' )
			return null
		}

		// ===== Удаление диалога из своего списка =====

		/** Взвод корзины живёт на своей строке: первый клик красит её,
		 * второй удаляет — без модалок и системных алертов. */
		@$mol_mem_key
		delete_armed( id: string, next?: boolean ) {
			return next ?? false
		}

		delete_hint( id: string ) {
			return this.delete_armed( id ) ? 'Точно удалить?' : 'Удалить диалог'
		}

		/** Красной ждёт подтверждения максимум одна строка: любой другой клик
		 * по списку снимает взвод, чтобы забытая корзина не сработала потом. */
		@$mol_action
		delete_disarm( next?: any ) {
			for( const id of this.dialog_ids() ) this.delete_armed( id, false )
			return null
		}

		/** Корзина лежит внутри кликабельной строки, поэтому первым делом гасим
		 * всплытие: иначе тот же клик ещё и открыл бы удаляемый диалог. */
		@$mol_action
		dialog_delete_click( id: string, next?: Event ) {
			next?.stopPropagation()
			if( !id ) return null
			if( !this.delete_armed( id ) ) {
				this.delete_disarm()
				this.delete_armed( id, true )
				return null
			}
			this.dialog_delete( id )
			return null
		}

		/** Диалог живёт в шаренном ленде и у собеседника остаётся:
		 * убираем только свою ссылку и свою слежку за сессиями. */
		@$mol_action
		dialog_delete( id: string, next?: any ) {
			if( !id ) return null
			if( this.saved_is( id ) ) return null

			const active = this.dialog_current() === id
			const store = this.dialogs_store()

			store.Dialogs( 'auto' )!.cut( id )
			store.Hidden( 'auto' )!.add( id )
			if( this.archive_is( id ) ) store.Archived( 'auto' )!.cut( id )

			// Ленд диалога может быть ещё не засинкан: список сессий тогда недоступен,
			// но выкидывание из своего списка важнее — просто не чистим монитор
			try {
				const sessions = this.session_links_of( id )
				const watch = this.monitor_store().Watch( 'auto' )!
				for( const link of sessions ) watch.cut( link )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
			}

			if( active ) {
				this.edit_id( '' )
				this.message_text( '' )
				this.dialog_current( '' )
			}
			this.delete_armed( id, false )

			return null
		}

		// ===== Архив: спрятанные, но живые диалоги =====

		/** Сырые ссылки из хранилища: по ним рисуется состояние кнопки в строке,
		 * даже когда сам диалог из списка уже выпал. */
		@$mol_mem
		archive_links() {
			return ( this.dialogs_store().Archived()?.items() ?? [] ).map( String )
		}

		/** В архиве показываем только живые диалоги: удалённый осел в Hidden
		 * и вернуться на экран не должен ни в списке, ни в архиве. */
		@$mol_mem
		archive_ids() {
			const alive = new Set( this.dialog_ids() )
			const dropped = new Set( this.hidden_ids() )
			return this.archive_links().filter( id => alive.has( id ) && !dropped.has( id ) )
		}

		@$mol_mem_key
		archive_is( id: string ) {
			return this.archive_links().includes( id )
		}

		@$mol_mem
		archive_opened( next?: boolean ) {
			return next ?? false
		}

		/** Архив разворачивается прямо в списке: отдельная страница ради
		 * пары спрятанных диалогов — лишний шаг навигации. */
		@$mol_action
		archive_toggle( next?: any ) {
			this.delete_disarm()
			this.archive_opened( !this.archive_opened() )
			return null
		}

		/** Кнопка лежит внутри кликабельной строки, поэтому первым делом гасим
		 * всплытие: иначе тот же клик ещё и открыл бы прячущийся диалог.
		 * Подтверждения не спрашиваем — операция обратима, в отличие от корзины. */
		@$mol_action
		dialog_archive_click( id: string, next?: Event ) {
			next?.stopPropagation()
			if( !id ) return null
			this.delete_disarm()
			if( this.archive_is( id ) ) this.dialog_unarchive( id )
			else this.dialog_archive( id )
			return null
		}

		/** Диалог остаётся в своём списке и продолжает принимать сообщения:
		 * архив — это только вторая полка, а не удаление. */
		@$mol_action
		dialog_archive( id: string, next?: any ) {
			if( !id ) return null
			if( this.saved_is( id ) ) return null
			this.dialogs_store().Archived( 'auto' )!.add( id )
			return null
		}

		@$mol_action
		dialog_unarchive( id: string, next?: any ) {
			if( !id ) return null
			this.dialogs_store().Archived( 'auto' )!.cut( id )
			return null
		}

		@$mol_mem_key
		archive_hint( id: string ) {
			return this.archive_is( id ) ? 'Вернуть из архива' : 'В архив'
		}

		/** Одна и та же кнопка прячет и возвращает, поэтому и стрелка на ней
		 * смотрит в ту сторону, куда уедет диалог. */
		@$mol_mem_key
		archive_icons( id: string ) {
			return [ this.archive_is( id ) ? this.Dialog_unarchive_icon( id ) : this.Dialog_archive_icon( id ) ]
		}

		override archive_note() {
			return this.plural( this.archive_ids().length, 'диалог', 'диалога', 'диалогов' )
		}

		/** Непрочитанное в архиве не теряется: складываем счётчики спрятанных
		 * диалогов. Ленд любого из них может быть ещё в пути — такой не считаем. */
		@$mol_mem
		archive_unread() {
			let count = 0
			for( const id of this.archive_ids() ) {
				try {
					count += this.unread_count( id )
				} catch( error ) {
					if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				}
			}
			return count
		}

		override archive_unread_label() {
			return this.archive_unread() ? String( this.archive_unread() ) : ''
		}

		override Archive_unread() {
			return this.archive_unread() ? super.Archive_unread() : null!
		}

		// ===== Запросы на переписку =====

		@$mol_mem
		requests_opened( next?: boolean ) {
			return next ?? false
		}

		/** Запросы разворачиваются прямо в списке, как и архив: отдельная
		 * страница ради пары незнакомцев — лишний шаг навигации. */
		@$mol_action
		requests_toggle( next?: any ) {
			this.delete_disarm()
			this.requests_opened( !this.requests_opened() )
			return null
		}

		override requests_count_label() {
			return String( this.request_ids().length )
		}

		/** В строке запроса на месте архива и корзины стоят согласие и отказ:
		 * прятать на вторую полку то, о чём решение ещё не принято, незачем.
		 * Сама строка остаётся обычной строкой диалога — по клику она так же
		 * открывает переписку, и прочитать её до решения это нормально. */
		override Dialog_archive( id: string ) {
			if( this.dialog_kind( id ) === 'request' ) return this.Request_accept( id )
			return super.Dialog_archive( id )
		}

		override Dialog_delete( id: string ) {
			if( this.dialog_kind( id ) === 'request' ) return this.Request_reject( id )
			return super.Dialog_delete( id )
		}

		/** Кнопка лежит внутри кликабельной строки, поэтому первым делом гасим
		 * всплытие: иначе тот же клик ещё и открыл бы диалог. Согласие даётся
		 * человеку, а не диалогу — следующий его диалог придёт уже в общий список. */
		@$mol_action
		request_accept( id: string, next?: Event ) {
			next?.stopPropagation()
			if( !id ) return null
			this.peer_accept( this.dialog_owner( id ) )
			return null
		}

		/** Отказ — то же самое, что удаление диалога из своего списка: ссылка
		 * уходит в скрытые, и повторное приглашение её не вернёт. У собеседника
		 * диалог остаётся: сообщить ему об отказе нечем, и это к лучшему. */
		@$mol_action
		request_reject( id: string, next?: Event ) {
			next?.stopPropagation()
			if( !id ) return null
			this.dialog_delete( id )
			return null
		}

		/** Только явно выбранный диалог: на узком экране чат не должен открываться сам.
		 * Избранного нет в списке диалогов, но открывается оно так же. */
		@$mol_mem
		dialog_active() {
			const current = this.dialog_current()
			if( !current ) return ''
			if( this.saved_is( current ) ) return current
			if( this.dialog_ids().includes( current ) ) return current
			return ''
		}

		@$mol_mem
		chat_title() {
			const id = this.dialog_active()
			if( !id ) return 'Выберите диалог'
			return this.dialog_title( id )
		}

		/** Собеседник открытого диалога: ни у избранного, ни у группы его нет,
		 * поэтому и подписывать там некого. */
		@$mol_mem
		chat_peer() {
			const id = this.dialog_active()
			if( !id ) return ''
			if( this.saved_is( id ) ) return ''
			if( this.group_is( id ) ) return ''
			return this.dialog_peer( id )
		}

		/** Заголовок чата правится прямо в шапке. В переписке вдвоём это моя
		 * подпись собеседника, в группе — её название, и менять его может
		 * админ. У избранного заголовок фиксированный, поля там нет. */
		override chat_note_editable() {
			const id = this.dialog_active()
			if( id && this.group_is( id ) ) return this.admin_me( id )
			return Boolean( this.chat_peer() )
		}

		/** Пустое поле не должно выглядеть потерей имени: подсказкой в нём
		 * стоит то, как человек назвал себя сам, а у неназванной группы —
		 * её участники. */
		override chat_note_hint() {
			const id = this.dialog_active()
			if( id && this.group_is( id ) ) return this.group_name_auto( id )
			const lord = this.chat_peer()
			if( !lord ) return ''
			return this.peer_name( lord ) || this.lord_short( lord )
		}

		@$mol_mem
		chat_note( next?: string ) {
			const id = this.dialog_active()
			if( id && this.group_is( id ) ) {
				if( next !== undefined ) this.group_title_set( id, next )
				return this.group_title( id )
			}
			const lord = this.chat_peer()
			if( !lord ) return ''
			if( next !== undefined ) this.peer_note_set( lord, next )
			return this.peer_note( lord )
		}

		/** Название лежит в общем ленде группы, поэтому и видят его все.
		 * Менять его может тот, у кого есть право писать в этот ленд, — админ;
		 * поле у остальных и не показывается, но решение принимается тут. */
		@$mol_action
		group_title_set( id: string, next?: string ) {
			if( !id ) return null
			if( !this.admin_me( id ) ) return null
			this.dialog_store( id ).Title( 'auto' )?.val( next ?? '' )
			return null
		}

		// ===== Страницы буклета =====

		@$mol_mem
		compose_opened( next?: boolean ) {
			return next ?? false
		}

		@$mol_mem
		settings_opened( next?: boolean ) {
			return next ?? false
		}

		@$mol_action
		/** Кнопка в шапке работает как переключатель: повторный клик
		 * закрывает уже открытую страницу, а не оставляет её висеть. */
		compose_open( next?: any ) {
			const open = !this.compose_opened()
			this.settings_opened( false )
			this.group_opened( false )
			this.compose_opened( open )
			this.account_reset()
			return null
		}

		@$mol_action
		compose_close( next?: any ) {
			this.compose_opened( false )
			return null
		}

		@$mol_action
		settings_open( next?: any ) {
			const open = !this.settings_opened()
			this.compose_opened( false )
			this.group_opened( false )
			this.settings_opened( open )
			this.account_reset()
			return null
		}

		@$mol_action
		settings_close( next?: any ) {
			this.settings_opened( false )
			this.account_reset()
			return null
		}

		override pages() {
			return [
				this.Menu(),
				... this.settings_opened() ? [ this.Settings_page() ] : [],
				... this.compose_opened() ? [ this.Compose_page() ] : [],
				... this.group_opened() ? [ this.Group_page() ] : [],
				... this.dialog_active() ? [ this.Chat_page() ] : [],
				... this.members_opened() && this.members_shown() ? [ this.Members_page() ] : [],
			]
		}

		override Placeholder() {
			return this.dialog_active() ? null! : super.Placeholder()
		}

		// ===== Создание диалога =====

		/** Уже существующий диалог с этим собеседником — повторный старт
		 * не должен плодить новые ленды, а должен открывать старый.
		 * Незасинканный диалог считаем несовпадением, чтобы не виснуть.
		 * Группы тут не в счёт: человек может быть в общей группе и всё равно
		 * не иметь с тобой личной переписки. */
		dialog_with( peer: string ) {
			if( !peer ) return ''
			for( const id of this.dialog_ids() ) {
				try {
					if( this.group_is( id ) ) continue
					if( this.dialog_peer( id ) === peer ) return id
				} catch( error ) {
					if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				}
			}
			return ''
		}

		@$mol_mem
		dialog_pending( next?: string ) {
			return next ?? ''
		}

		@$mol_action
		dialog_start( next?: any ) {
			const peer = this.peer_lord().trim()
			if( !peer ) return null
			this.peer_accept( peer )
			this.peer_lord( '' )
			const exist = this.dialog_with( peer )
			if( exist ) {
				this.dialog_select( exist )
				return null
			}
			this.dialog_pending( peer )
			return null
		}

		/** Разбор ключа из реестра с проверкой подлинности. Реестр открыт на
		 * запись всем, поэтому положить туда свой ключ под чужой записью может
		 * кто угодно — и тогда диалог, заведённый для одного человека,
		 * открылся бы совсем другому. Идентификатор это хеш ключа, так что
		 * подмена ловится пересчётом: не сошлось — считаем, что ключа нет
		 * вовсе. Мусор вместо ключа сюда тоже долетает: разбор бросает
		 * исключение, и оно не должно мешать заводить диалог. */
		pass_verified( lord: string, str: string ): $giper_baza_auth_pass | null {

			if( !lord || !str ) return null

			try {

				let pass = pass_parsed.get( str )
				if( !pass ) {
					pass = $giper_baza_auth_pass.from( str )
					pass_parsed.set( str, pass )
				}

				if( pass.lord().str === lord ) return pass

				$mol_fail_log( new Error( 'Ключ в реестре не сходится со своим владельцем', { cause: lord } ) )
				return null

			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				$mol_fail_log( error )
				return null
			}

		}

		/** Ключ собеседника: без него ни ленд диалога, ни ленд сессии ему не
		 * открыть. Штатно ключ приезжает вместе с его домашним лендом, и
		 * когда тот уже осел в хранилище, всё работает и офлайн. Незнакомый
		 * ленд ждёт сети — но у человека из реестра ключ лежит ещё и там,
		 * поэтому запрос ленда шлём, а доставки не дожидаемся. */
		peer_pass_of( lord: string ): $giper_baza_auth_pass | null {

			if( !lord ) return null

			const land = this.$.$giper_baza_glob.Land( new $giper_baza_link( lord ) )

			try {
				land.sync()
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
			}

			const own = land.king_pass()
			if( own ) return own

			for( const id of this.registry_ids() ) {
				try {
					const str = String( this.registry_store( id ).Keys()?.key( lord )?.Pass()?.val() ?? '' )
					const pass = this.pass_verified( lord, str )
					if( pass ) return pass
				} catch( error ) {
					if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				}
			}

			return null
		}

		// Ждём реактивно, пока ключ собеседника не окажется под рукой, и только
		// тогда создаём диалог. Имени не ждём: оно косметика и подъедет само
		@$mol_mem
		dialog_autocreate() {
			const peer = this.dialog_pending()
			if( !peer ) return ''

			const pass = this.peer_pass_of( peer )
			if( !pass ) return ''

			$mol_wire_async( this ).dialog_create( peer )
			return peer
		}

		dialog_create( peer: string ) {

			// Гонка: пока ждали ключ, диалог мог появиться (или второй клик)
			const exist = this.dialog_with( peer )
			if( exist ) {
				this.dialog_current( exist )
				this.compose_opened( false )
				this.dialog_pending( '' )
				this.chat_bring()
				return exist
			}

			const glob = this.$.$giper_baza_glob

			// Имя собеседника тут не читаем: оно живёт в его ленде и офлайн
			// подвесило бы фибру целиком, хотя для самого диалога не нужно
			const peer_pass = this.peer_pass_of( peer )
			if( !peer_pass ) return null

			const dialog_land = glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
			const session_land = glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
			// Ранг задаёт цену записи: на `just` подпись принимается с первой
			// попытки, то есть работы ноль и поток сообщений ничем не ограничен.
			// Берём следующую ступень — сотни подписей на сообщение: человек
			// разницы не заметит, а заливать тысячами станет невыгодно.
			dialog_land.give( peer_pass, $giper_baza_rank_post( 'fast' ) )
			session_land.give( peer_pass, $giper_baza_rank_post( 'fast' ) )

			const dialog = dialog_land.Data( $bog_gram_dialog )
			dialog.Peers( 'auto' )!.add( this.my_lord() )
			dialog.Peers( 'auto' )!.add( peer )
			dialog.Sessions( 'auto' )!.add( session_land.link().str )
			dialog.Session_last( 'auto' )?.val( session_land.link().str )
			dialog.Created( 'auto' )?.val( Date.now() )
			dialog.Owner( 'auto' )?.val( this.my_lord() )

			const session = session_land.Data( $bog_gram_session )
			session.Dialog_land( 'auto' )?.val( dialog_land.link().str )

			this.dialogs_store().Dialogs( 'auto' )!.add( dialog_land.link().str )
			this.monitor_store().Watch( 'auto' )!.add( session_land.link().str )

			this.dialogs_store().Outbox( 'auto' )!.add( peer + '|' + dialog_land.link().str )

			this.dialog_current( dialog_land.link().str )
			this.chat_bring()
			this.compose_opened( false )
			this.dialog_pending( '' )
			return dialog_land.link().str
		}

		// ===== Создание группы =====

		@$mol_mem
		group_opened( next?: boolean ) {
			return next ?? false
		}

		/** Кнопка в шапке работает переключателем, как и у нового диалога:
		 * повторный клик закрывает уже открытую страницу. */
		@$mol_action
		group_open( next?: any ) {
			const open = !this.group_opened()
			this.compose_opened( false )
			this.settings_opened( false )
			this.group_opened( open )
			this.account_reset()
			return null
		}

		@$mol_action
		group_close( next?: any ) {
			this.group_opened( false )
			return null
		}

		/** Кого можно позвать: собеседники своих переписок и участники
		 * реестров. Ключи первых уже лежат в их лендах, поэтому такой список
		 * работает и без сети. Один человек — одна строка, даже если он
		 * встречается в обоих источниках: подписью берём переписку, она ближе.
		 * Незасинканный диалог просто не даёт своего собеседника — весь список
		 * из-за одного такого молчать не должен. */
		@$mol_mem
		group_sources() {

			const sources: Record< string, string > = {}
			const my = this.my_lord()

			for( const id of this.dialog_ids() ) {
				if( this.group_is( id ) ) continue
				let peer = ''
				try {
					peer = this.dialog_peer( id )
				} catch( error ) {
					if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				}
				if( !peer || peer === my ) continue
				if( sources[ peer ] ) continue
				sources[ peer ] = 'из переписки'
			}

			const registries = this.user_sources()
			for( const lord of Object.keys( registries ) ) {
				if( sources[ lord ] ) continue
				sources[ lord ] = this.registry_title( registries[ lord ] )
			}

			return sources
		}

		@$mol_mem
		group_picked( next?: readonly string[] ) {
			return next ?? [] as readonly string[]
		}

		/** Список ненайденных ключей относился к прежнему составу: любая
		 * правка выбора его снимает, и кнопка возвращается к обычной. */
		@$mol_action
		group_pick( lord: string, next?: any ) {
			if( !lord ) return null
			const picked = this.group_picked()
			this.group_lost( [] )
			this.group_picked(
				picked.includes( lord )
					? picked.filter( item => item !== lord )
					: [ ... picked, lord ]
			)
			return null
		}

		@$mol_action
		group_chosen_drop( lord: string, next?: Event ) {
			next?.stopPropagation()
			if( !lord ) return null
			this.group_lost( [] )
			this.group_picked( this.group_picked().filter( item => item !== lord ) )
			return null
		}

		@$mol_mem
		group_id_error( next?: string ) {
			return next ?? ''
		}

		override Group_id_error() {
			return this.group_id_error() ? super.Group_id_error() : null!
		}

		/** Идентификатор руками. Заведомую опечатку отсеиваем сразу: группа с
		 * несуществующим участником всё равно бы его не дождалась. */
		@$mol_action
		group_id_add( next?: any ) {

			const lord = this.group_id().trim()
			if( !lord ) return null

			if( lord === this.my_lord() ) {
				this.group_id_error( 'Это ваш собственный идентификатор' )
				return null
			}

			if( !$giper_baza_link.check( lord ) ) {
				this.group_id_error( 'Это не похоже на идентификатор' )
				return null
			}

			this.group_id_error( '' )
			this.group_id( '' )

			if( !this.group_picked().includes( lord ) ) {
				this.group_lost( [] )
				this.group_picked( [ ... this.group_picked(), lord ] )
			}

			return null
		}

		@$mol_mem
		group_pick_rows() {
			return Object.keys( this.group_sources() ).map( lord => this.Group_pick_row( lord ) )
		}

		group_pick_lord( lord: string ) {
			return lord
		}

		group_pick_tint( lord: string ) {
			return this.avatar_tint( lord )
		}

		@$mol_mem_key
		group_pick_title( lord: string ) {
			return this.peer_label( lord )
		}

		@$mol_mem_key
		group_pick_source( lord: string ) {
			return this.group_sources()[ lord ] ?? ''
		}

		@$mol_mem_key
		group_picked_is( lord: string ) {
			return this.group_picked().includes( lord )
		}

		override Group_pick_mark( lord: string ) {
			return this.group_picked_is( lord ) ? super.Group_pick_mark( lord ) : null!
		}

		@$mol_mem
		group_chosen_rows() {
			return this.group_picked().map( lord => this.Group_chosen_row( lord ) )
		}

		override group_chosen_head() {
			const count = this.group_picked().length
			if( !count ) return 'Пока никого не выбрали'
			return this.people_count( count )
		}

		group_chosen_lord( lord: string ) {
			return lord
		}

		group_chosen_tint( lord: string ) {
			return this.avatar_tint( lord )
		}

		@$mol_mem_key
		group_chosen_name( lord: string ) {
			return this.peer_label( lord )
		}

		@$mol_mem
		group_lost( next?: readonly string[] ) {
			return next ?? [] as readonly string[]
		}

		override group_lost_note() {
			const lost = this.group_lost()
			if( !lost.length ) return ''
			const names = lost.map( lord => this.peer_label( lord ) ).join( ', ' )
			return 'Не нашли ключей: ' + names
				+ '. Без ключа человек не прочитает переписку — группу можно создать без него.'
		}

		override Group_lost_note() {
			return this.group_lost().length ? super.Group_lost_note() : null!
		}

		override group_make_label() {
			return this.group_lost().length ? 'Создать без них' : 'Создать группу'
		}

		@$mol_action
		group_make( next?: any ) {
			const picked = this.group_picked()
			if( !picked.length ) return null
			$mol_wire_async( this ).group_create( this.group_name().trim(), picked, this.group_lost().length > 0 )
			return null
		}

		/** Создание группы целиком. Порядок здесь не косметика: всё, что умеет
		 * ждать — ключи участников, захват лендов, выдача прав, — стоит до
		 * первой записи. Фибра перезапускается с начала на каждом ожидании, и
		 * заведённая раньше группа завелась бы заново, оставив в списке пустые
		 * копии. Название и состав приезжают сюда аргументами по той же
		 * причине: очищенные поля следующий заход прочитал бы уже пустыми.
		 *
		 * Ключ может не найтись ни в ленде человека, ни в реестрах: без него
		 * шифрованный ленд ему не открыть, и группа с ним вышла бы молча
		 * кривой. Поэтому первый заход только показывает, кого не удалось
		 * добавить, а создаёт уже второй — когда с потерей согласились. */
		group_create( title: string, lords: readonly string[], forced: boolean ) {

			const my = this.my_lord()

			const known: string[] = []
			const passes: $giper_baza_auth_pass[] = []
			const lost: string[] = []

			for( const lord of lords ) {
				if( !lord || lord === my ) continue
				const pass = this.peer_pass_of( lord )
				if( pass ) {
					known.push( lord )
					passes.push( pass )
				} else {
					lost.push( lord )
				}
			}

			if( lost.length && !forced ) {
				this.group_lost( lost )
				return ''
			}

			if( !known.length ) return ''

			const glob = this.$.$giper_baza_glob

			const dialog_land = glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
			const session_land = glob.land_grab([ [ null, $giper_baza_rank_deny ] ])

			// Ранг тот же, что и в переписке вдвоём: сотни подписей на сообщение
			// человек не заметит, а заливать группу тысячами станет невыгодно.
			// Создатель — король обоих лендов, полное управление у него и так
			for( const pass of passes ) {
				dialog_land.give( pass, $giper_baza_rank_post( 'fast' ) )
				session_land.give( pass, $giper_baza_rank_post( 'fast' ) )
			}

			const dialog = dialog_land.Data( $bog_gram_dialog )
			dialog.Peers( 'auto' )!.add( my )
			for( const lord of known ) dialog.Peers( 'auto' )!.add( lord )
			dialog.Sessions( 'auto' )!.add( session_land.link().str )
			dialog.Session_last( 'auto' )?.val( session_land.link().str )
			dialog.Created( 'auto' )?.val( Date.now() )
			dialog.Owner( 'auto' )?.val( this.my_lord() )
			if( title ) dialog.Title( 'auto' )?.val( title )

			const session = session_land.Data( $bog_gram_session )
			session.Dialog_land( 'auto' )?.val( dialog_land.link().str )

			const id = dialog_land.link().str

			this.dialogs_store().Dialogs( 'auto' )!.add( id )
			this.monitor_store().Watch( 'auto' )!.add( session_land.link().str )

			for( const lord of known ) {
				this.peer_accept( lord )
				this.dialogs_store().Outbox( 'auto' )!.add( lord + '|' + id )
			}

			this.group_picked( [] )
			this.group_lost( [] )
			this.group_name( '' )
			this.group_id( '' )
			this.group_id_error( '' )
			this.group_opened( false )
			this.dialog_current( id )
			this.chat_bring()

			return id
		}

		// ===== Участники группы =====

		@$mol_mem
		members_opened( next?: boolean ) {
			return next ?? false
		}

		/** Экран участников есть только у группы: в переписке вдвоём
		 * перечислять некого. */
		members_shown() {
			const id = this.dialog_active()
			return Boolean( id ) && this.group_is( id )
		}

		override chat_members_shown() {
			return this.members_shown()
		}

		@$mol_action
		members_open( next?: any ) {
			this.members_opened( !this.members_opened() )
			this.member_error( '' )
			this.leave_armed( false )
			return null
		}

		@$mol_action
		members_close( next?: any ) {
			this.members_opened( false )
			this.leave_armed( false )
			return null
		}

		@$mol_mem
		member_error( next?: string ) {
			return next ?? ''
		}

		/** Что значит «убрать», объясняем на месте и только тому, кто может
		 * убирать: остальным эта кнопка и не показывается. Прятать пояснение
		 * в подсказку кнопки нельзя — на телефоне её никто не увидит, а
		 * операция необратимая. */
		override Members_drop_note() {
			return this.admin_me( this.dialog_active() ) ? super.Members_drop_note() : null!
		}

		/** Ленд группы может быть ещё не засинкан: список участников тогда
		 * пуст, а подписка на его приход сохраняется — строки дорисуются. */
		@$mol_mem
		member_lords() {
			const id = this.dialog_active()
			if( !id ) return [] as string[]
			try {
				return this.dialog_lords( id )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return [] as string[]
			}
		}

		@$mol_mem
		member_rows() {
			return this.member_lords().map( lord => this.Member_row( lord ) )
		}

		member_lord( lord: string ) {
			return lord
		}

		member_tint( lord: string ) {
			return this.avatar_tint( lord )
		}

		@$mol_mem_key
		member_title( lord: string ) {
			if( lord === this.my_lord() ) return 'Вы'
			return this.peer_label( lord )
		}

		/** Создателя отмечаем отдельно от назначенных админов: его права никто
		 * не отберёт — он король ленда. */
		@$mol_mem_key
		member_status( lord: string ) {
			const id = this.dialog_active()
			if( !id ) return ''
			if( this.dialog_owner( id ) === lord ) return 'создатель'
			return this.admin_is( id, lord ) ? 'админ' : ''
		}

		override Member_status( lord: string ) {
			return this.member_status( lord ) ? super.Member_status( lord ) : null!
		}

		/** Назначает админов создатель, и только тех, кто им ещё не стал. */
		override Member_rule( lord: string ) {
			const id = this.dialog_active()
			if( !this.owner_me( id ) ) return null!
			if( lord === this.my_lord() ) return null!
			if( this.admin_is( id, lord ) ) return null!
			return super.Member_rule( lord )
		}

		/** Убирает людей админ. Себя убрать нельзя: для этого есть выход из
		 * группы, он не трогает остальных. */
		override Member_drop( lord: string ) {
			const id = this.dialog_active()
			if( !this.admin_me( id ) ) return null!
			if( lord === this.my_lord() ) return null!
			return super.Member_drop( lord )
		}

		@$mol_mem_key
		member_armed( lord: string, next?: boolean ) {
			return next ?? false
		}

		@$mol_mem_key
		member_drop_hint( lord: string ) {
			return this.member_armed( lord )
				? 'Точно убрать? Прошлые сообщения у него останутся'
				: 'Убрать из группы'
		}

		@$mol_action
		member_disarm( next?: any ) {
			for( const lord of this.member_lords() ) this.member_armed( lord, false )
			return null
		}

		/** Первый клик взводит кнопку, второй убирает человека — как корзина в
		 * списке диалогов. Строка участника не кликабельна, но всплытие гасим
		 * так же: кнопка лежит внутри неё. */
		@$mol_action
		member_drop_click( lord: string, next?: Event ) {
			next?.stopPropagation()
			if( !lord ) return null
			if( !this.member_armed( lord ) ) {
				this.member_disarm()
				this.member_armed( lord, true )
				return null
			}
			this.member_armed( lord, false )
			const id = this.dialog_active()
			if( id ) $mol_wire_async( this ).member_part( id, lord )
			return null
		}

		@$mol_action
		member_rule_click( lord: string, next?: Event ) {
			next?.stopPropagation()
			const id = this.dialog_active()
			if( !id || !lord ) return null
			$mol_wire_async( this ).member_promote( id, lord )
			return null
		}

		/** Что достанется новому участнику: ключи от всех бакетов группы или
		 * только от свежего. */
		@$mol_mem
		history_open( next?: boolean ) {
			return next ?? true
		}

		history_shut() {
			return !this.history_open()
		}

		@$mol_action
		members_history_all( next?: any ) {
			this.history_open( true )
			return null
		}

		@$mol_action
		members_history_new( next?: any ) {
			this.history_open( false )
			return null
		}

		override members_history_note() {
			return this.history_open()
				? 'Новый участник получит ключи от всех прошлых сообщений группы'
				: 'Заведём новый отсек переписки: прошлое останется закрытым, и все увидят только то, что напишут дальше'
		}

		/** Кого ещё можно позвать: те же источники, что и при создании, минус
		 * те, кто в группе уже есть. */
		@$mol_mem
		member_pick_lords() {
			const inside = new Set( this.member_lords() )
			return Object.keys( this.group_sources() ).filter( lord => !inside.has( lord ) )
		}

		@$mol_mem
		member_pick_rows() {
			return this.member_pick_lords().map( lord => this.Member_pick_row( lord ) )
		}

		member_pick_lord( lord: string ) {
			return lord
		}

		member_pick_tint( lord: string ) {
			return this.avatar_tint( lord )
		}

		@$mol_mem_key
		member_pick_title( lord: string ) {
			return this.peer_label( lord )
		}

		@$mol_mem_key
		member_pick_source( lord: string ) {
			return this.group_sources()[ lord ] ?? ''
		}

		override Member_pick_source( lord: string ) {
			return this.member_pick_source( lord ) ? super.Member_pick_source( lord ) : null!
		}

		@$mol_action
		member_pick( lord: string, next?: any ) {
			const id = this.dialog_active()
			if( !id || !lord ) return null
			$mol_wire_async( this ).member_join( id, lord, this.history_open() )
			return null
		}

		@$mol_action
		member_id_add( next?: any ) {

			const id = this.dialog_active()
			const lord = this.member_id().trim()
			if( !id || !lord ) return null

			if( lord === this.my_lord() ) {
				this.member_error( 'Это ваш собственный идентификатор' )
				return null
			}

			if( !$giper_baza_link.check( lord ) ) {
				this.member_error( 'Это не похоже на идентификатор' )
				return null
			}

			this.member_error( '' )
			this.member_id( '' )
			$mol_wire_async( this ).member_join( id, lord, this.history_open() )

			return null
		}

		/** Звать людей может админ, поэтому у остальных этого блока нет вовсе —
		 * вместе со ссылкой-приглашением и заявками по ней: принять заявку
		 * всё равно некому, а ссылка без приёма бесполезна.
		 *
		 * Выбор истории стоит наверху блока и распространяется на все способы
		 * добавить человека сразу: и на заявку, и на ссылку из реестра, и на
		 * набранный руками идентификатор. */
		@$mol_mem
		members_add_rows() {

			const id = this.dialog_active()
			if( !this.admin_me( id ) ) return []

			const asks = this.ask_entries( id )

			return [
				this.Members_add_title(),
				this.Members_history(),
				... this.member_error() ? [ this.Members_error() ] : [],
				this.Members_join(),
				... asks.length ? [ this.Members_asks_head(), this.Members_asks_list() ] : [],
				this.Members_id_form(),
				this.Members_pick_list(),
				... this.owner_me( id ) ? [ this.Members_admin_note() ] : [],
			]
		}

		@$mol_mem
		leave_armed( next?: boolean ) {
			return next ?? false
		}

		override group_leave_label() {
			return this.leave_armed() ? 'Точно выйти?' : 'Выйти из группы'
		}

		/** Выход — то же самое, что удаление диалога из своего списка: ленд
		 * остаётся у остальных, а свою ссылку и слежку за бакетами мы снимаем.
		 * Из списка участников при этом не вычёркиваемся: сделать это можно
		 * только записью в тот же ленд, а писать в группу, из которой уходишь,
		 * — лишнее. */
		@$mol_action
		group_leave_click( next?: any ) {
			if( !this.leave_armed() ) {
				this.leave_armed( true )
				return null
			}
			const id = this.dialog_active()
			this.leave_armed( false )
			this.members_opened( false )
			this.dialog_delete( id )
			return null
		}

		/** Добавление участника. Всё, что умеет ждать — ключ человека, ключи
		 * остальных, захват свежего бакета, выдача прав, — стоит до первой
		 * записи: фибра перезапускается с начала на каждом ожидании.
		 *
		 * С историей: выдаём право на все бакеты, что уже есть, и новичок
		 * читает переписку с самого начала. Без истории: заводим свежий бакет,
		 * открываем его нынешним участникам и новичку, а старые ему не
		 * открываем вовсе — ключей от них у него не появится.
		 *
		 * Готовый ключ приходит сюда из заявки: там он приезжает вместе с
		 * просьбой, уже проверенный пересчётом, и разыскивать человека по
		 * реестрам не нужно. Во всех остальных местах ключ ищется как прежде. */
		member_join( id: string, lord: string, history: boolean, known?: $giper_baza_auth_pass | null ) {

			if( !id || !lord ) return ''
			if( lord === this.my_lord() ) return ''
			if( !this.admin_me( id ) ) return ''

			const pass = known ?? this.peer_pass_of( lord )
			if( !pass ) {
				this.member_error( 'Не нашли ключ этого человека: без ключа он не прочитает переписку' )
				return ''
			}

			const links = this.session_links_of( id )
			const mates = this.dialog_mates( id ).filter( mate => mate !== lord )

			// Ключи остающихся нужны только свежему бакету: старым права уже
			// выданы, и трогать их незачем
			const stay: [ string, $giper_baza_auth_pass ][] = []
			if( !history ) {
				for( const mate of mates ) {
					const mate_pass = this.peer_pass_of( mate )
					if( mate_pass ) stay.push( [ mate, mate_pass ] )
				}
				if( stay.length < mates.length ) {
					this.member_error( 'Не нашли ключей всех участников: новый отсек переписки без них не завести' )
					return ''
				}
			}

			const glob = this.$.$giper_baza_glob
			const fresh = history ? null : glob.land_grab([ [ null, $giper_baza_rank_deny ] ])

			const dialog_land = glob.Land( new $giper_baza_link( id ) )
			dialog_land.give( pass, this.member_rank( id, lord ) )

			if( fresh ) {
				for( const [ mate, mate_pass ] of stay ) fresh.give( mate_pass, this.member_rank( id, mate ) )
				fresh.give( pass, this.member_rank( id, lord ) )
			} else {
				for( const link of links ) {
					this.session_land_by( link ).give( pass, this.member_rank( id, lord ) )
				}
			}

			const dialog = dialog_land.Data( $bog_gram_dialog )
			dialog.Peers( 'auto' )!.add( lord )

			if( fresh ) {
				dialog.Sessions( 'auto' )!.add( fresh.link().str )
				dialog.Session_last( 'auto' )?.val( fresh.link().str )
				fresh.Data( $bog_gram_session ).Dialog_land( 'auto' )?.val( id )
				this.monitor_store().Watch( 'auto' )!.add( fresh.link().str )
			}

			this.peer_accept( lord )
			this.dialogs_store().Outbox( 'auto' )!.add( lord + '|' + id )
			this.member_error( '' )

			return lord
		}

		/** Исключение — это свежий бакет без исключённого. Ключ от уже выданных
		 * бакетов отобрать нельзя: прошлые сообщения у него остаются навсегда,
		 * а новых он не увидит — права на свежий бакет ему не выдают.
		 *
		 * Порядок тот же: ключи остающихся и захват бакета умеют ждать и стоят
		 * до первой записи. */
		member_part( id: string, lord: string ) {

			if( !id || !lord ) return ''
			if( lord === this.my_lord() ) return ''
			if( !this.admin_me( id ) ) return ''

			const mates = this.dialog_mates( id ).filter( mate => mate !== lord )

			const stay: [ string, $giper_baza_auth_pass ][] = []
			for( const mate of mates ) {
				const mate_pass = this.peer_pass_of( mate )
				if( mate_pass ) stay.push( [ mate, mate_pass ] )
			}

			if( stay.length < mates.length ) {
				this.member_error( 'Не нашли ключей всех участников: новый отсек переписки без них не завести' )
				return ''
			}

			const glob = this.$.$giper_baza_glob
			const fresh = glob.land_grab([ [ null, $giper_baza_rank_deny ] ])

			for( const [ mate, mate_pass ] of stay ) fresh.give( mate_pass, this.member_rank( id, mate ) )

			const dialog = glob.Land( new $giper_baza_link( id ) ).Data( $bog_gram_dialog )
			dialog.Sessions( 'auto' )!.add( fresh.link().str )
			dialog.Session_last( 'auto' )?.val( fresh.link().str )
			dialog.Peers( 'auto' )!.cut( lord )
			if( this.admin_lords( id ).includes( lord ) ) dialog.Admins( 'auto' )!.cut( lord )

			fresh.Data( $bog_gram_session ).Dialog_land( 'auto' )?.val( id )
			this.monitor_store().Watch( 'auto' )!.add( fresh.link().str )
			this.member_error( '' )

			return lord
		}

		/** Назначение админом. Право звать людей — это право управлять лендом,
		 * поэтому выдаётся оно и на ленд группы, и на каждый её бакет: иначе
		 * новый админ не смог бы открыть бакет новому человеку. Вместе с ним
		 * он получает и возможность менять чужие права — разделить эти
		 * способности в Базе нечем, и в интерфейсе об этом сказано прямо. */
		member_promote( id: string, lord: string ) {

			if( !id || !lord ) return ''
			if( !this.owner_me( id ) ) return ''

			const pass = this.peer_pass_of( lord )
			if( !pass ) {
				this.member_error( 'Не нашли ключ этого человека: права ему не выдать' )
				return ''
			}

			const glob = this.$.$giper_baza_glob
			const links = this.session_links_of( id )
			const dialog_land = glob.Land( new $giper_baza_link( id ) )

			dialog_land.give( pass, $giper_baza_rank_rule )
			for( const link of links ) this.session_land_by( link ).give( pass, $giper_baza_rank_rule )

			dialog_land.Data( $bog_gram_dialog ).Admins( 'auto' )!.add( lord )
			this.member_error( '' )

			return lord
		}

		// ===== Заявки в группу: сторона админа =====

		/** Все заявки, что долетели в моё лобби. Лобби открыто на запись всем,
		 * поэтому мусор там обычное дело: разбор его отвергает, а на новом
		 * устройстве ленд может быть ещё в пути — подписка на его приход
		 * сохраняется, и заявки дорисуются сами. */
		@$mol_mem
		ask_all() {
			try {
				return ( this.inbox_store().Joins()?.items() ?? [] ).map( String )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return [] as string[]
			}
		}

		/** Заявки в конкретную группу. Того, кто уже внутри, не показываем: его
		 * заявку либо приняли, либо он пришёл своим путём — и принимать её
		 * второй раз незачем. */
		@$mol_mem_key
		ask_entries( id: string ) {

			if( !id ) return [] as string[]

			let inside = new Set< string >()
			try {
				inside = new Set( this.dialog_lords( id ) )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
			}

			return this.ask_all().filter( entry => {
				const ask = this.ask_parse( entry )
				if( !ask ) return false
				if( ask.group !== id ) return false
				return !inside.has( ask.lord )
			} )
		}

		override members_asks_head() {
			return 'Заявки: ' + this.ask_entries( this.dialog_active() ).length
		}

		@$mol_mem
		members_ask_rows() {
			return this.ask_entries( this.dialog_active() ).map( entry => this.Ask_row( entry ) )
		}

		/** Строка заявки ключуется самой записью: одна и та же запись должна
		 * дать один и тот же ряд, а лорда из неё достаёт разбор. */
		ask_lord( entry: string ) {
			return this.ask_parse( entry )?.lord ?? ''
		}

		ask_tint( entry: string ) {
			return this.avatar_tint( this.ask_lord( entry ) )
		}

		@$mol_mem_key
		ask_title( entry: string ) {
			return this.peer_label( this.ask_lord( entry ) )
		}

		/** Под именем стоит сокращённый идентификатор: имя человек задаёт себе
		 * сам, и по одному только имени понять, того ли впускаешь, нельзя. */
		@$mol_mem_key
		ask_status( entry: string ) {
			return this.lord_short( this.ask_lord( entry ) )
		}

		/** Выдача прав — это криптография с перебором степеней, поэтому из
		 * обработчика уходим в фибру. */
		@$mol_action
		ask_accept( entry: string, next?: Event ) {
			next?.stopPropagation()
			if( !entry ) return null
			$mol_wire_async( this ).ask_apply( entry )
			return null
		}

		/** Отказ — снятие записи из своего лобби. Повторную заявку от того же
		 * человека это не блокирует: отказ не бан, а просто нерешение. */
		@$mol_action
		ask_reject( entry: string, next?: Event ) {
			next?.stopPropagation()
			if( !entry ) return null
			this.ask_forget( entry )
			return null
		}

		/** Обработанную заявку убираем из лобби, чтобы они не копились. Лобби
		 * моё, я его король — снять из него запись есть чем. */
		@$mol_action
		ask_forget( entry: string ) {
			if( !entry ) return null
			this.inbox_store().Joins( 'auto' )!.cut( entry )
			return null
		}

		/** Приём заявки. Ключ проверяем пересчётом до всего остального: лобби
		 * открыто на запись всем, и свой ключ под чужим идентификатором может
		 * положить кто угодно — тогда в группу попал бы он, а не тот, кого
		 * туда позвали. Не сошлось — заявку отклоняем с пояснением.
		 *
		 * Дальше это обычное добавление участника: тем же кодом, с тем же
		 * выбором истории, что и при добавлении руками. Ключ передаём готовым —
		 * он приехал вместе с заявкой, и разыскивать человека по реестрам,
		 * которых у меня может и не быть, не приходится. */
		ask_apply( entry: string ) {

			const ask = this.ask_parse( entry )
			if( !ask ) {
				this.ask_forget( entry )
				return ''
			}

			if( !this.admin_me( ask.group ) ) return ''

			const pass = this.pass_verified( ask.lord, ask.pass )
			if( !pass ) {
				this.member_error( 'Ключ в заявке не сходится со своим владельцем: заявка отклонена' )
				this.ask_forget( entry )
				return ''
			}

			const joined = this.member_join( ask.group, ask.lord, this.history_open(), pass )
			if( !joined ) return ''

			this.ask_forget( entry )

			return joined
		}

		/** Есть ли среди сообщений хоть одно моё. Отсюда два вывода сразу:
		 * приглашение до первого своего сообщения никуда не едет, а диалог,
		 * в котором я уже отвечал, никаким запросом быть не может. */
		mine_among( messages: readonly $bog_gram_message[], my: string ) {
			return messages.some( message => String( message.Author()?.val() ?? '' ) === my )
		}

		/** То же по ссылке на диалог. Ленд может быть ещё не засинкан: тогда
		 * считаем, что писать было нечего — приглашение подождёт, а подписка
		 * на приход данных сохраняется, и флаш вернётся сам. */
		@$mol_mem_key
		mine_wrote( id: string ) {
			try {
				return this.mine_among( this.messages_alive_of( id ), this.my_lord() )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return false
			}
		}

		/** Когда приглашение можно отправлять. В переписке вдвоём — после
		 * первого своего сообщения: пустой диалог собеседнику показывать
		 * незачем, он мог быть и заведён по ошибке. В группе довольно любого
		 * сообщения: человека туда позвали осознанно, и ждать, пока напишет
		 * именно позвавший, нелепо — переписка там уже идёт. */
		@$mol_mem_key
		invite_ready( id: string ) {
			if( !id ) return false
			if( this.group_is( id ) ) return this.dialog_alive( id )
			return this.mine_wrote( id )
		}

		// Доставка инвайтов: ретраим, пока не приедут права чужого inbox-ленда
		@$mol_mem
		outbox_flush() {
			const entries = ( this.dialogs_store().Outbox()?.items() ?? [] ).map( String )
			if( !entries.length ) return 0
			this.$.$mol_state_time.now( 3000 )
			for( const entry of entries ) {
				const [ peer, dialog_link ] = entry.split( '|' )
				if( !this.invite_ready( dialog_link ) ) continue
				try {
					const inbox_link = this.peer_store( peer ).Inbox_land()?.val()
					if( !inbox_link ) continue
					const inbox = this.$.$giper_baza_glob
						.Land( new $giper_baza_link( String( inbox_link ) ) )
						.Data( $bog_gram_inbox )
					inbox.Invites( 'auto' )!.add( dialog_link )
					const sent = ( inbox.Invites()?.items() ?? [] ).map( String ).includes( dialog_link )
					if( sent ) this.dialogs_store().Outbox( 'auto' )!.cut( entry )
				} catch( error ) {
					if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
					$mol_fail_log( error )
				}
			}
			return entries.length
		}

		// ===== Входящие инвайты =====

		@$mol_mem
		inbox_merge() {
			const invites = ( this.inbox_store().Invites()?.items() ?? [] ).map( String )
			if( !invites.length ) return 0
			const have = new Set( this.dialog_ids() )
			const hidden = new Set( this.hidden_ids() )
			for( const link of invites ) {
				if( have.has( link ) ) continue
				if( hidden.has( link ) ) continue
				this.dialogs_store().Dialogs( 'auto' )!.add( link )
			}
			return invites.length
		}

		@$mol_mem
		monitor_fill() {
			const watch = this.monitor_store()
			const have = new Set( ( watch.Watch()?.items() ?? [] ).map( String ) )
			for( const id of this.dialog_ids() ) {
				for( const link of this.session_links_of( id ) ) {
					if( have.has( link ) ) continue
					watch.Watch( 'auto' )!.add( link )
				}
			}
			return true
		}

		// ===== Сессии-бакеты =====

		/** Ссылки на все бакеты диалога. Бакетов больше одного, когда кого-то
		 * убрали из группы или добавили без истории: ключ от уже выданного
		 * бакета отобрать нельзя, поэтому переписка продолжается в свежем.
		 * Читаем изо всех, до каких дотягиваемся, а пишем всегда в последний.
		 * У избранного делить нечего и не с кем, поэтому его ленд сам себе
		 * единственный бакет — остальной код от этого ничем не отличается. */
		session_links_of( id: string ): readonly string[] {
			if( !id ) return []
			if( this.saved_is( id ) ) return this.saved_links()
			return ( this.dialog_store( id ).Sessions()?.items() ?? [] ).map( String )
		}

		session_land_by( link: string ) {
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( link ) )
		}

		session_lands_of( id: string ) {
			return this.session_links_of( id ).map( link => this.session_land_by( link ) )
		}

		/** Свежий бакет: в него уходит вся запись — сообщения, картинки,
		 * голосовые, отметки прочтения.
		 *
		 * Берём его по явному указателю, а не по хвосту списка: порядок в
		 * списке определяется слиянием, а не тем, что добавили позже, и после
		 * ротации запись легко ушла бы в покинутый бакет. Хвост оставлен
		 * запасным путём для диалогов, заведённых до появления указателя. */
		session_land_of( id: string ) {
			const links = this.session_links_of( id )
			if( !links.length ) return null

			if( !this.saved_is( id ) ) {
				const marked = String( this.dialog_store( id ).Session_last()?.val() ?? '' )
				if( marked && links.includes( marked ) ) return this.session_land_by( marked )
			}

			return this.session_land_by( links[ links.length - 1 ] )
		}

		session_land_active() {
			return this.session_land_of( this.dialog_active() )
		}

		session_store_last( id: string ) {
			const land = this.session_land_of( id )
			if( !land ) return null
			return land.Data( $bog_gram_session )
		}

		// ===== Сообщения =====

		/** Склейка лент нескольких бакетов. Порядок задаётся полем момента в
		 * самих данных, а не порядком доставки, поэтому склейка — это просто
		 * сортировка. Совпавшие моменты разводим ссылкой: без этого два
		 * сообщения, отправленные в одну миллисекунду, менялись бы местами от
		 * синка к синку. */
		messages_merge( buckets: readonly ( readonly $bog_gram_message[] )[] ) {
			const all: $bog_gram_message[] = []
			for( const bucket of buckets ) all.push( ... bucket )
			return all.sort( ( a, b )=> {
				const shift = Number( a.Moment()?.val() ?? 0 ) - Number( b.Moment()?.val() ?? 0 )
				if( shift ) return shift
				const left = a.link().str
				const right = b.link().str
				return left < right ? -1 : left > right ? 1 : 0
			} )
		}

		/** Бакет, который не читается — не приехал, не расшифровался, прав на
		 * него не выдавали, — молча пропускаем: один недоступный не должен
		 * уносить с собой всю остальную переписку. Подписка на его приход при
		 * этом сохраняется, и лента дособерётся сама. */
		@$mol_mem_key
		messages_of( id: string ) {
			const buckets: ( readonly $bog_gram_message[] )[] = []
			for( const land of this.session_lands_of( id ) ) {
				try {
					buckets.push( land.Data( $bog_gram_session ).Messages()?.remote_list() ?? [] )
				} catch( error ) {
					if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				}
			}
			return this.messages_merge( buckets )
		}

		@$mol_mem_key
		messages_alive_of( id: string ) {
			return this.messages_of( id ).filter( message => !message.Deleted()?.val() )
		}

		@$mol_mem
		messages() {
			return this.messages_alive_of( this.dialog_active() )
		}

		message_pawn( id: string ) {
			return this.messages().find( message => message.link().str === id ) ?? null
		}

		day_key( moment: number ) {
			if( !moment ) return ''
			return new Date( moment ).toDateString()
		}

		day_title( key: string ) {
			if( !key ) return ''
			const now = new Date()
			if( key === now.toDateString() ) return 'Сегодня'
			if( key === new Date( now.getTime() - day_ms ).toDateString() ) return 'Вчера'
			return new Date( key ).toLocaleDateString( 'ru' )
		}

		time_hm( moment: number ) {
			const date = new Date( moment )
			return String( date.getHours() ).padStart( 2, '0' ) + ':' + String( date.getMinutes() ).padStart( 2, '0' )
		}

		/** Лента чата: пузыри вперемешку с разделителями календарных дней. */
		@$mol_mem
		chat_rows() {
			let last_day = ''
			return this.messages().flatMap( message => {
				const day = this.day_key( Number( message.Moment()?.val() ?? 0 ) )
				const head = day && day !== last_day ? [ this.Day_row( day ) ] : []
				last_day = day
				return [ ... head, this.Message_row( message.link().str ) ]
			} )
		}

		@$mol_mem_key
		message_body( id: string ) {
			return this.message_pawn( id )?.Text()?.val() ?? ''
		}

		@$mol_mem_key
		message_out( id: string ) {
			return String( this.message_pawn( id )?.Author()?.val() ?? '' ) === this.my_lord()
		}

		@$mol_mem_key
		message_time( id: string ) {
			const moment = Number( this.message_pawn( id )?.Moment()?.val() ?? 0 )
			return moment ? this.time_hm( moment ) : ''
		}

		@$mol_mem_key
		message_edited( id: string ) {
			return Boolean( this.message_pawn( id )?.Edited()?.val() )
		}

		override Message_edited( id: string ) {
			return this.message_edited( id ) ? super.Message_edited( id ) : null!
		}

		/** Сколько участников успело прочитать сообщение. Автора не считаем ни
		 * в числителе, ни в знаменателе: своё сообщение он не читает. */
		read_tally( reads: Readonly< Record< string, number > >, mates: readonly string[], moment: number ) {
			return mates.filter( lord => ( reads[ lord ] ?? 0 ) >= moment ).length
		}

		/** Одна галочка — доставлено, две — собеседник прочитал. В группе
		 * галочки не годятся: прочитавших там сколько угодно, поэтому вместо
		 * них счёт. Только для своих сообщений и только там, где есть кому
		 * читать: в избранном отметок нет. */
		@$mol_mem_key
		message_checks( id: string ) {

			if( !this.message_out( id ) ) return ''

			const dialog = this.dialog_active()
			if( this.saved_is( dialog ) ) return ''

			const moment = Number( this.message_pawn( id )?.Moment()?.val() ?? 0 )

			if( this.group_is( dialog ) ) {

				let mates: readonly string[] = []
				try {
					mates = this.dialog_mates( dialog )
				} catch( error ) {
					if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				}
				if( !mates.length ) return ''

				const reads: Record< string, number > = {}
				for( const lord of mates ) reads[ lord ] = this.read_moment_of( dialog, lord )

				return 'Прочитали ' + this.read_tally( reads, mates, moment ) + ' из ' + mates.length

			}

			const peer = this.dialog_peer( dialog )
			if( !peer ) return '✓'
			return this.read_moment_of( dialog, peer ) >= moment ? '✓✓' : '✓'

		}

		override Message_checks( id: string ) {
			return this.message_checks( id ) ? super.Message_checks( id ) : null!
		}

		/** Имя отправителя стоит только в группе и только над чужим пузырём:
		 * в переписке вдвоём оно ничего не добавляет — там и так двое. Порядок
		 * тот же, что и везде: моя подпись, потом его имя, потом сокращённый
		 * идентификатор. */
		@$mol_mem_key
		message_author( id: string ) {
			if( this.message_out( id ) ) return ''
			if( !this.group_is( this.dialog_active() ) ) return ''
			const lord = String( this.message_pawn( id )?.Author()?.val() ?? '' )
			if( !lord ) return ''
			return this.peer_label( lord )
		}

		/** Цвет подписи — тот же, что у аватара автора: в длинной группе имена
		 * различаются ещё и на глаз, не только буквами. */
		@$mol_mem_key
		message_author_tint( id: string ) {
			const lord = String( this.message_pawn( id )?.Author()?.val() ?? '' )
			return lord ? this.avatar_tint( lord ) : 0
		}

		override Message_author( id: string ) {
			return this.message_author( id ) ? super.Message_author( id ) : null!
		}

		// ===== Действия над сообщением =====

		/** Чужое сообщение править и удалять нечем: панель есть только у своих. */
		override Message_actions( id: string ) {
			return this.message_out( id ) ? super.Message_actions( id ) : null!
		}

		/** Пузырь с раскрытой панелью ровно один: второе долгое нажатие
		 * переносит её на новое сообщение, а не плодит вторую. */
		@$mol_mem
		message_menu( next?: string ) {
			return next ?? ''
		}

		@$mol_mem_key
		message_menu_is( id: string ) {
			return this.message_menu() === id
		}

		/** Отсчёт удержания живёт между двумя разными обработчиками, поэтому это
		 * обычные поля, а не мемы: мем сбросился бы вместе с фиброй предыдущего
		 * события, и отпускание пальца не увидело бы, что нажатие было долгим. */
		press_timer: ReturnType< typeof setTimeout > | null = null
		press_row = ''
		press_held = false

		press_stop() {
			if( this.press_timer !== null ) this.$.$mol_dom_context.clearTimeout( this.press_timer )
			this.press_timer = null
		}

		@$mol_action
		message_press( id: string, next?: Event ) {
			this.press_stop()
			this.press_row = id
			this.press_held = false
			if( !this.message_out( id ) ) return null
			this.press_timer = this.$.$mol_dom_context.setTimeout( ()=> this.message_hold( id ), press_delay )
			return null
		}

		@$mol_action
		message_hold( id: string ) {
			this.press_timer = null
			this.press_held = true
			this.message_menu( id )
			return null
		}

		/** Отпускание пальца внутри самой панели: по нему прятать её нельзя.
		 * Клик браузер шлёт уже после отпускания, и кнопка, успевшая пропасть
		 * из вёрстки, его не получит — правка и удаление просто не сработают. */
		press_on_actions( next?: Event ) {
			const spot = next?.target
			if( !( spot instanceof this.$.$mol_dom_context.Element ) ) return false
			return Boolean( spot.closest( '[bog_gram_message_actions]' ) )
		}

		/** Короткий тап по своему пузырю прячет раскрытую панель обратно. Отмена
		 * жеста (палец поехал прокручивать ленту) приходит сюда же и делает то
		 * же самое, а вот отпускание после сработавшего удержания — нет, иначе
		 * панель закрывалась бы в тот же момент, когда открылась. */
		@$mol_action
		message_release( id: string, next?: Event ) {
			const held = this.press_held && this.press_row === id
			this.press_stop()
			this.press_held = false
			if( held ) return null
			if( this.press_on_actions( next ) ) return null
			if( this.message_menu() === id ) this.message_menu( '' )
			return null
		}

		/** На телефоне это тот же долгий тап, на десктопе — правый клик.
		 * Показываем свою панель, поэтому системное меню гасим. */
		@$mol_action
		message_context( id: string, next?: Event ) {
			if( !this.message_out( id ) ) return null
			next?.preventDefault()
			this.press_stop()
			this.press_held = true
			this.message_menu( id )
			return null
		}

		// ===== Отправка, правка, удаление =====

		@$mol_mem
		edit_id( next?: string ) {
			return next ?? ''
		}

		override edit_mode() {
			return Boolean( this.edit_id() )
		}

		@$mol_action
		message_edit( id: string, next?: any ) {
			this.message_menu( '' )
			this.edit_id( id )
			this.message_text( this.message_body( id ) )
			return null
		}

		@$mol_action
		edit_cancel( next?: any ) {
			this.edit_id( '' )
			this.message_text( '' )
			return null
		}

		@$mol_action
		message_delete( id: string, next?: any ) {
			this.message_menu( '' )
			const pawn = this.message_pawn( id )
			if( !pawn ) return null
			pawn.Deleted( 'auto' )?.val( Date.now() )
			if( this.edit_id() === id ) {
				this.edit_id( '' )
				this.message_text( '' )
			}
			return null
		}

		@$mol_action
		message_send( next?: any ) {
			this.message_menu( '' )
			const text = this.message_text().trim()
			const editing = this.edit_id()

			if( editing ) {
				if( !text ) return null
				const pawn = this.message_pawn( editing )
				if( pawn ) {
					pawn.Text( 'auto' )?.val( text )
					pawn.Edited( 'auto' )?.val( Date.now() )
				}
				this.edit_id( '' )
				this.message_text( '' )
				return null
			}

			if( !text ) return null
			const session = this.session_store_last( this.dialog_active() )
			if( !session ) return null
			const message = session.Messages( 'auto' )!.make( null )
			message.Text( 'auto' )?.val( text )
			message.Author( 'auto' )?.val( this.my_lord() )
			message.Moment( 'auto' )?.val( Date.now() )
			this.message_text( '' )
			return null
		}

		// ===== Картинки =====

		/** Кадр есть, если у сообщения есть ссылка на его ленд. Сама
		 * картинка при этом может быть ещё в пути — коробку под неё
		 * рисуем всё равно, иначе лента дёрнется при её появлении. */
		@$mol_mem_key
		message_shot( id: string ) {
			return Boolean( this.message_pawn( id )?.Image()?.val() )
		}

		override Message_shot( id: string ) {
			return this.message_shot( id ) ? super.Message_shot( id ) : null!
		}

		/** Картинка без подписи — обычное дело, и пустой абзац под ней
		 * оставлял бы в пузыре лишнюю полосу. */
		override Message_body( id: string ) {
			return this.message_body( id ) ? super.Message_body( id ) : null!
		}

		/** Размеры кадра приезжают вместе с сообщением, до самой картинки.
		 * Пока их нет, считаем кадр квадратным: перепрыгнуть один раз при
		 * загрузке лучше, чем схлопнуть пузырь в ноль. */
		@$mol_mem_key
		message_shot_size( id: string ) {
			const pawn = this.message_pawn( id )
			const width = Number( pawn?.Image_width()?.val() ?? 0 )
			const height = Number( pawn?.Image_height()?.val() ?? 0 )
			if( !width || !height ) return { width: 1, height: 1 }
			return { width, height }
		}

		@$mol_mem_key
		message_shot_ratio( id: string ) {
			const size = this.message_shot_size( id )
			return size.width + ' / ' + size.height
		}

		/** В предел упирается большая сторона, меньшая считается от неё по
		 * пропорциям. Кадр мельче предела показываем как есть. */
		@$mol_mem_key
		message_shot_width( id: string ) {
			const size = this.message_shot_size( id )
			const side = Math.max( size.width, size.height )
			const limit = Math.min( shot_side, side / rem_px )
			return ( limit * size.width / side ).toFixed( 2 ) + 'rem'
		}

		/** Ленд картинки приезжает отдельно от переписки: пока буфер пуст,
		 * отдаём пустую ссылку — место уже занято коробкой, а подписка на
		 * приход ленда сохраняется, и кадр проявится сам. */
		@$mol_mem_key
		message_shot_uri( id: string ) {
			try {
				const file = this.message_pawn( id )?.Image()?.remote()
				if( !file ) return ''
				if( !file.buffer().byteLength ) return ''
				return this.$.$mol_dom_context.URL.createObjectURL( file.blob() )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return ''
			}
		}

		// ===== Развёрнутый кадр =====

		@$mol_mem
		zoom_id( next?: string ) {
			return next ?? ''
		}

		override zoom_uri() {
			const id = this.zoom_id()
			if( !id ) return ''
			return this.message_shot_uri( id )
		}

		/** Долгое нажатие уже раскрыло под пузырём правку с удалением —
		 * тот же жест не должен вдобавок разворачивать картинку. */
		@$mol_action
		message_zoom( id: string, next?: any ) {
			if( this.message_menu() === id ) return null
			if( !this.message_shot_uri( id ) ) return null
			this.zoom_id( id )
			this.zoom_focus()
			return null
		}

		@$mol_action
		zoom_close( next?: any ) {
			this.zoom_id( '' )
			return null
		}

		/** Слой ловит Esc, только пока на нём фокус, а в разметке он
		 * появляется лишь следующим кадром — тогда же его и фокусируем. */
		zoom_focus() {
			new this.$.$mol_after_tick( ()=> {
				try {
					const node = this.Chat_page().Zoom().dom_node() as HTMLElement
					node.focus()
				} catch( error ) {
					if( $mol_promise_like( error ) ) return
					$mol_fail_log( error )
				}
			} )
		}

		// ===== Отправка картинки =====

		/** Кнопка со скрепкой. Из выбранного берём первую картинку:
		 * множественный выбор в поле отключён, но система может подсунуть
		 * заодно и что-нибудь постороннее. */
		@$mol_action
		image_files( next?: readonly File[] ) {
			const file = ( next ?? [] ).find( item => this.$.$bog_gram_shrink.image_is( item ) )
			if( file ) this.image_start( file )
			this.attach_reset()
			return next ?? null
		}

		/** Поле выбора файла помнит прошлый выбор и о повторе того же самого
		 * файла уже не сообщает: без сброса одну картинку нельзя было бы
		 * отправить дважды. */
		attach_reset() {
			new this.$.$mol_after_tick( ()=> {
				try {
					const node = this.Chat_page().Attach().Native().dom_node() as HTMLInputElement
					node.value = ''
				} catch( error ) {
					if( $mol_promise_like( error ) ) return
					$mol_fail_log( error )
				}
			} )
		}

		/** Вставка из буфера. Картинку достаём синхронно, пока событие живо,
		 * и тут же уходим в фибру: ждать прямо в обработчике нельзя — mol
		 * перезапускает его на каждом ожидании, а каждый перезапуск доставал
		 * бы из буфера новый файл, то есть отправлял бы копию. */
		@$mol_action
		image_paste( next?: Event ) {

			const event = next as ClipboardEvent | undefined
			const items = event?.clipboardData?.items
			if( !items ) return null

			for( let i = 0; i < items.length; ++ i ) {
				const file = items[ i ].getAsFile()
				if( !file ) continue
				if( !this.$.$bog_gram_shrink.image_is( file ) ) continue
				event?.preventDefault()
				this.image_start( file )
				break
			}

			return null
		}

		/** Без отмены умолчания браузер откроет брошенный файл вместо
		 * страницы — и переписка просто исчезнет с экрана. */
		@$mol_action
		image_over( next?: Event ) {
			next?.preventDefault()
			return null
		}

		@$mol_action
		image_drop( next?: Event ) {

			const event = next as DragEvent | undefined
			event?.preventDefault()

			const files = event?.dataTransfer?.files
			if( !files ) return null

			const file = Array.from( files ).find( item => this.$.$bog_gram_shrink.image_is( item ) )
			if( file ) this.image_start( file )

			return null
		}

		/** Пережатие, захват ленда и подпись — это криптография с перебором
		 * степеней: из обработчика уходим в фибру, иначе каждое ожидание
		 * начинало бы перебор заново, а интерфейс всё это время стоял бы. */
		image_start( file: File ) {

			// Картинка — всегда новое сообщение, а начатая правка держит в поле
			// чужой текст: подписью к кадру он стать не должен
			if( this.edit_id() ) {
				this.edit_id( '' )
				this.message_text( '' )
			}

			$mol_wire_async( this ).image_send( file )
		}

		/** Кадр едет в своём ленде, закрытом так же, как ленд диалога: право
		 * читать выдаём каждому участнику, для всех остальных — включая
		 * мастера — там шифрованный мусор. В избранном выдавать право некому,
		 * ленд просто остаётся закрытым.
		 *
		 * Порядок здесь не косметика. Всё, что умеет ждать — пережатие,
		 * захват ленда, выдача права, — стоит до создания сообщения: фибра
		 * перезапускается с начала на каждом ожидании, и созданное раньше
		 * сообщение она завела бы заново, оставив в переписке копии. */
		image_send( file: File ) {

			const id = this.dialog_active()
			if( !id ) return ''

			const session = this.session_store_last( id )
			if( !session ) return ''

			const glob = this.$.$giper_baza_glob
			const mates = this.saved_is( id ) ? [] : this.dialog_mates( id )

			// Ключи участников приезжают вместе с их лендами. Пока хоть одного
			// нет, не пишем ничего: кадр в закрытом ленде он не прочитал бы
			// никогда, а так отправку можно просто повторить
			const passes = this.passes_of( mates )
			if( passes.length < mates.length ) return ''

			const shot = this.$.$bog_gram_shrink.shrink( file )

			const land = glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
			const store = land.Data( $giper_baza_file )
			store.buffer( shot.bytes )
			store.type( shot.type )

			for( const pass of passes ) land.give( pass, $giper_baza_rank_read )

			// Ленд кадра лежит в стороне от переписки, поэтому пуш на мастер
			// зовём сами — сам он туда не поедет
			land.sync()

			const text = this.message_text().trim()
			const message = session.Messages( 'auto' )!.make( null )

			message.Image( 'auto' )!.remote( store )
			message.Image_width( 'auto' )?.val( shot.width )
			message.Image_height( 'auto' )?.val( shot.height )
			if( text ) message.Text( 'auto' )?.val( text )
			message.Author( 'auto' )?.val( this.my_lord() )
			message.Moment( 'auto' )?.val( Date.now() )

			this.message_text( '' )

			return message.link().str
		}

		// ===== Голосовые: запись =====

		/** Микрофон показываем, только если браузер умеет писать звук: иначе
		 * кнопка обещала бы то, чего не будет. */
		override voice_ready() {
			return this.$.$bog_gram_voice.supported()
		}

		/** Живая запись между двумя событиями: нажатие её заводит, отпускание
		 * забирает результат. Это обычное поле, а не мем — фибра нажатия к
		 * моменту отпускания давно кончилась, и мем обнулился бы вместе с ней. */
		voice_live: $bog_gram_voice | null = null

		/** Момент начала записи, ноль — не пишем. По нему же идёт таймер. */
		@$mol_mem
		voice_start( next?: number ) {
			return next ?? 0
		}

		override voice_on() {
			return Boolean( this.voice_start() )
		}

		@$mol_mem
		voice_hint( next?: string ) {
			return next ?? ''
		}

		/** Растущий таймер. Пока не пишем, время не читаем вовсе: иначе вся
		 * страница пересчитывалась бы пять раз в секунду впустую. */
		@$mol_mem
		override voice_clock() {
			const start = this.voice_start()
			if( !start ) return ''
			const now = this.$.$mol_state_time.now( clock_tick )
			return this.$.$bog_gram_voice.stamp( ( now - start ) / 1000 )
		}

		/** Нажали микрофон. Разрешение и кодировщик умеют ждать, поэтому
		 * уходим в фибру: держать обработчик события нельзя, mol перезапускает
		 * его на каждом ожидании. */
		@$mol_action
		voice_press( next?: Event ) {

			if( this.voice_live ) return null
			if( !this.voice_ready() ) return null

			const take = this.$.$bog_gram_voice.make({
				filled: ()=> this.voice_finish(),
			})

			this.voice_live = take
			this.voice_hint( '' )
			this.voice_start( Date.now() )
			this.voice_grab( next )

			$mol_wire_async( this ).voice_open( take )

			return null
		}

		/** Палец может съехать с кнопки, а мышь — уйти вообще со страницы:
		 * без захвата указателя отпускание пришло бы другому элементу, и
		 * запись осталась бы висеть включённой. */
		voice_grab( next?: Event ) {
			try {
				const event = next as PointerEvent | undefined
				if( event?.pointerId === undefined ) return
				this.Chat_page().Voice().dom_node().setPointerCapture( event.pointerId )
			} catch( error ) {
				if( $mol_promise_like( error ) ) return
				$mol_fail_log( error )
			}
		}

		/** Разрешение спрашивает браузер, и ответа можно ждать сколько угодно.
		 * Отказ объясняем строкой над полем ввода, ничего не отправляя. */
		voice_open( take: $bog_gram_voice ) {

			try {
				$mol_wire_sync( take ).open()
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				$mol_fail_log( error )
				if( this.voice_live === take ) {
					this.voice_live = null
					this.voice_start( 0 )
				}
				this.voice_hint( voice_denied )
				return false
			}

			return true
		}

		/** Отпустили палец. На крестике это отмена: во время удержания все
		 * события указателя захвачены самим микрофоном, и дотянуться до
		 * крестика можно только отпустив палец над ним. */
		@$mol_action
		voice_release( next?: Event ) {
			if( !this.voice_live ) return null
			if( this.voice_on_cancel( next ) ) return this.voice_cancel()
			return this.voice_finish()
		}

		/** Смотрим точку отпускания, а не цель события: цель захвачена кнопкой
		 * микрофона и на всё время жеста остаётся ею же. */
		voice_on_cancel( next?: Event ) {
			const event = next as PointerEvent | undefined
			if( !event ) return false
			const spot = this.$.$mol_dom_context.document.elementFromPoint( event.clientX, event.clientY )
			if( !spot ) return false
			return Boolean( spot.closest( '[bog_gram_chat_voice_cancel]' ) )
		}

		/** Конец записи: останавливаем её прямо здесь, синхронно. Уйди
		 * остановка в фибру — микрофон писал бы всё время, пока та ждёт
		 * права собеседника, и в сообщение попала бы лишняя тишина. */
		@$mol_action
		voice_finish( next?: any ) {

			const take = this.voice_live
			if( !take ) return null

			this.voice_live = null
			this.voice_start( 0 )
			take.stop()

			$mol_wire_async( this ).voice_send( take )

			return null
		}

		/** Отмена: микрофон отпускаем так же, а записанное выкидываем. */
		@$mol_action
		voice_cancel( next?: any ) {
			const take = this.voice_live
			this.voice_live = null
			this.voice_start( 0 )
			take?.drop()
			return null
		}

		/** Жест прервала система — входящий звонок, переключение окна. */
		@$mol_action
		voice_abort( next?: any ) {
			return this.voice_cancel()
		}

		/** Долгое нажатие на тач-экране — это ещё и вызов системного меню,
		 * а на мыши правый клик. Здесь и то, и другое только мешает. */
		@$mol_action
		voice_menu( next?: Event ) {
			next?.preventDefault()
			return null
		}

		/** Запись едет в своём ленде, закрытом так же, как ленд диалога: право
		 * читать выдаём каждому участнику, для всех остальных — включая
		 * мастера — там шифрованный мусор. В избранном выдавать право некому,
		 * ленд просто остаётся закрытым.
		 *
		 * Порядок тот же, что и у кадра, и по той же причине: всё, что умеет
		 * ждать, стоит до создания сообщения — фибра перезапускается с начала
		 * на каждом ожидании, и созданное раньше сообщение она завела бы
		 * заново, оставив в переписке копии. */
		voice_send( take: $bog_gram_voice ) {

			const id = this.dialog_active()
			if( !id ) return ''

			const session = this.session_store_last( id )
			if( !session ) return ''

			const glob = this.$.$giper_baza_glob
			const mates = this.saved_is( id ) ? [] : this.dialog_mates( id )

			// Ключи участников приезжают вместе с их лендами. Пока хоть одного
			// нет, не пишем ничего: запись в закрытом ленде он не прочитал бы никогда
			const passes = this.passes_of( mates )
			if( passes.length < mates.length ) return ''

			const sound = $mol_wire_sync( take ).take()
			if( !sound ) {
				this.voice_hint( voice_short )
				return ''
			}

			const land = glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
			const store = land.Data( $giper_baza_file )
			store.buffer( sound.bytes )
			store.type( sound.type )

			for( const pass of passes ) land.give( pass, $giper_baza_rank_read )

			// Ленд записи лежит в стороне от переписки, поэтому пуш на мастер
			// зовём сами — сам он туда не поедет
			land.sync()

			const message = session.Messages( 'auto' )!.make( null )

			message.Voice( 'auto' )!.remote( store )
			message.Voice_span( 'auto' )?.val( sound.span )
			message.Author( 'auto' )?.val( this.my_lord() )
			message.Moment( 'auto' )?.val( Date.now() )

			this.voice_hint( '' )

			return message.link().str
		}

		// ===== Голосовые: воспроизведение =====

		/** Голос есть, если у сообщения есть ссылка на его ленд. Сам звук при
		 * этом может быть ещё в пути: строку с кнопкой и длиной рисуем всё
		 * равно, иначе лента дёрнется при её появлении. */
		@$mol_mem_key
		message_sound( id: string ) {
			return Boolean( this.message_pawn( id )?.Voice()?.val() )
		}

		override Message_sound( id: string ) {
			return this.message_sound( id ) ? super.Message_sound( id ) : null!
		}

		/** Длина приезжает вместе с сообщением, до самой записи: пузырь
		 * сообщает её сразу, ещё до того, как звук можно включить. */
		@$mol_mem_key
		message_sound_span( id: string ) {
			return Number( this.message_pawn( id )?.Voice_span()?.val() ?? 0 )
		}

		/** Ленд записи приезжает отдельно от переписки: пока буфер пуст,
		 * отдаём пустую ссылку — подписка на приход ленда сохраняется, и
		 * звук включится сам, как только доедет. */
		@$mol_mem_key
		message_sound_uri( id: string ) {
			try {
				const file = this.message_pawn( id )?.Voice()?.remote()
				if( !file ) return ''
				if( !file.buffer().byteLength ) return ''
				return this.$.$mol_dom_context.URL.createObjectURL( file.blob() )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return ''
			}
		}

		/** Звучит ровно одно сообщение на всё приложение. */
		@$mol_mem
		voice_playing( next?: string ) {
			return next ?? ''
		}

		@$mol_mem_key
		message_sound_playing( id: string ) {
			return this.voice_playing() === id
		}

		/** Включение нового гасит предыдущее: два голоса разом — это шум. */
		@$mol_action
		message_sound_toggle( id: string, next?: any ) {

			const now = this.voice_playing()
			if( now ) this.sound_stop( now )

			if( now === id ) {
				this.voice_playing( '' )
				return null
			}

			// Записи ещё нет — включать нечего, и подсвечивать паузу незачем
			if( !this.message_sound_uri( id ) ) {
				this.voice_playing( '' )
				return null
			}

			this.voice_playing( id )
			this.sound_start( id )

			return null
		}

		/** Дослушали до конца: кнопка возвращается к треугольнику сама. */
		@$mol_action
		message_sound_ended( id: string, next?: any ) {
			if( this.voice_playing() === id ) this.voice_playing( '' )
			return null
		}

		/** Пузырь мог уехать из ленты вместе со своим сообщением: тогда
		 * управлять уже нечем, и это не ошибка. */
		sound_start( id: string ) {
			try {
				( this.Message_sound( id ) as $.$$.$bog_gram_sound )?.start()
			} catch( error ) {
				if( $mol_promise_like( error ) ) return
				$mol_fail_log( error )
			}
		}

		sound_stop( id: string ) {
			try {
				( this.Message_sound( id ) as $.$$.$bog_gram_sound )?.stop()
			} catch( error ) {
				if( $mol_promise_like( error ) ) return
				$mol_fail_log( error )
			}
		}

		/** Смена диалога не должна оставлять голос звучать из закрытой
		 * переписки. Зовётся только из действий, поэтому обычный метод. */
		sound_hush() {
			const now = this.voice_playing()
			if( !now ) return
			this.sound_stop( now )
			this.voice_playing( '' )
		}

		// ===== Прочтения =====

		/** Отметка прочтения участника. Своя отметка пишется в последний бакет,
		 * но человек читает переписку целиком, а не по отсекам: у прошлых
		 * бакетов остались свои отметки, и дальняя из них и есть ответ.
		 * Недоступный бакет пропускаем — он ничего не добавит. */
		read_moment_of( id: string, lord: string ) {
			let last = 0
			for( const land of this.session_lands_of( id ) ) {
				try {
					const moment = Number( land.Data( $bog_gram_session ).Reads()?.key( lord )?.Moment()?.val() ?? 0 )
					if( moment > last ) last = moment
				} catch( error ) {
					if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				}
			}
			return last
		}

		/** Двигаем свою отметку прочтения только вперёд и только по открытому диалогу. */
		@$mol_mem
		read_sync() {
			const id = this.dialog_active()
			if( !id ) return 0
			if( this.saved_is( id ) ) return 0
			const my = this.my_lord()

			let last = 0
			for( const message of this.messages_alive_of( id ) ) {
				if( String( message.Author()?.val() ?? '' ) === my ) continue
				const moment = Number( message.Moment()?.val() ?? 0 )
				if( moment > last ) last = moment
			}
			if( !last ) return 0

			const seen = this.read_moment_of( id, my )
			if( seen >= last ) return seen

			const session = this.session_store_last( id )
			session?.Reads( 'auto' )?.key( my, 'auto' )?.Moment( 'auto' )?.val( last )
			return last
		}

		@$mol_mem_key
		unread_count( id: string ) {
			if( !id ) return 0
			if( this.saved_is( id ) ) return 0
			if( id === this.dialog_active() ) return 0
			const my = this.my_lord()
			const seen = this.read_moment_of( id, my )
			return this.messages_alive_of( id ).filter( message => {
				if( String( message.Author()?.val() ?? '' ) === my ) return false
				return Number( message.Moment()?.val() ?? 0 ) > seen
			} ).length
		}

		@$mol_mem_key
		unread_label( id: string ) {
			const count = this.unread_count( id )
			return count ? String( count ) : ''
		}

		override Unread_badge( id: string ) {
			return this.unread_count( id ) ? super.Unread_badge( id ) : null!
		}

		// ===== Превью в списке диалогов =====

		/** Вложение в строке списка называем словом: ни кадра, ни звука там
		 * показать негде, а подпись под ними, если она есть, идёт следом.
		 * В группе перед текстом стоит имя написавшего: без него непонятно,
		 * кто из пятерых сейчас говорит. */
		@$mol_mem_key
		dialog_preview( id: string ) {
			const messages = this.messages_alive_of( id )
			const last = messages[ messages.length - 1 ]
			if( !last ) return ''
			const text = String( last.Text()?.val() ?? '' )
			const kind = last.Image()?.val() ? 'Фото'
				: last.Voice()?.val() ? 'Голосовое сообщение'
				: ''
			const body = kind ? ( text ? kind + ' · ' + text : kind ) : text
			if( this.saved_is( id ) ) return body
			const author = String( last.Author()?.val() ?? '' )
			if( author === this.my_lord() ) return 'Вы: ' + body
			if( author && this.group_is( id ) ) return this.peer_label( author ) + ': ' + body
			return body
		}

		@$mol_mem_key
		dialog_time( id: string ) {
			const messages = this.messages_alive_of( id )
			const last = messages[ messages.length - 1 ]
			const moment = Number( last?.Moment()?.val() ?? 0 )
			if( !moment ) return ''
			const date = new Date( moment )
			if( date.toDateString() === new Date().toDateString() ) return this.time_hm( moment )
			return String( date.getDate() ).padStart( 2, '0' ) + '.' + String( date.getMonth() + 1 ).padStart( 2, '0' )
		}

		// ===== Реестры пользователей =====

		/** Реестр из адреса страницы: по такой ссылке зовут в реестр, а свой
		 * список известных реестров ведётся отдельно, в приватном ленде. */
		registry_active() {
			return this.$.$mol_state_arg.value( 'users' ) ?? ''
		}

		@$mol_mem
		registry_ids() {
			return ( this.dialogs_store().Registries()?.items() ?? [] ).map( String )
		}

		registry_land( id: string ) {
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( id ) )
		}

		registry_store( id: string ) {
			return this.registry_land( id ).Data( $bog_gram_users )
		}

		/** Чужой реестр может быть ещё не засинкан: подписка на его приход
		 * сохраняется, а пустой список не даёт одному ленду подвесить весь
		 * экран настроек — строка дорисуется сама. */
		@$mol_mem_key
		registry_lords( id: string ) {
			try {
				return ( this.registry_store( id ).Lords()?.items() ?? [] ).map( String )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return [] as string[]
			}
		}

		/** Название задаёт создатель. Пока оно не приехало (или его не задали),
		 * показываем сокращённую ссылку — молчащая строка хуже. */
		@$mol_mem_key
		registry_title( id: string ) {
			try {
				return String( this.registry_store( id ).Title()?.val() ?? '' ) || this.lord_short( id )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return this.lord_short( id )
			}
		}

		@$mol_mem_key
		registry_size( id: string ) {
			return this.registry_lords( id ).length
		}

		@$mol_mem_key
		registry_joined( id: string ) {
			return this.registry_lords( id ).includes( this.my_lord() )
		}

		@$mol_mem_key
		registry_active_is( id: string ) {
			return this.registry_active() === id
		}

		/** Русское склонение числительных: 1 диалог, 2 диалога, 5 диалогов. */
		plural( count: number, one: string, few: string, many: string ) {
			const tens = count % 100
			const ones = count % 10
			if( tens < 11 || tens > 14 ) {
				if( ones === 1 ) return count + ' ' + one
				if( ones >= 2 && ones <= 4 ) return count + ' ' + few
			}
			return count + ' ' + many
		}

		people_count( count: number ) {
			return this.plural( count, 'участник', 'участника', 'участников' )
		}

		@$mol_mem_key
		registry_status( id: string ) {
			const mine = this.registry_joined( id ) ? 'вы в списке' : 'только смотрите'
			return this.people_count( this.registry_size( id ) ) + ' · ' + mine
		}

		override Registry_join( id: string ) {
			return this.registry_joined( id ) ? null! : super.Registry_join( id )
		}

		@$mol_mem
		registry_rows() {
			return this.registry_ids().map( id => this.Registry_row( id ) )
		}

		/** Приглашение — адрес страницы с одним лишь реестром: остальные
		 * параметры (свой мастер, открытый диалог) чужому человеку не нужны. */
		override registry_uri() {
			const id = this.registry_active()
			if( !id ) return ''
			const location = this.$.$mol_dom_context.location
			return location.origin + location.pathname + '#!users=' + id
		}

		@$mol_mem
		registry_content() {
			if( !this.registry_ids().length ) return [ this.Registry_empty(), this.Registry_form() ]
			return [
				this.Registry_list(),
				this.Registry_note(),
				... this.registry_active() ? [ this.Registry_share() ] : [],
				this.Registry_form(),
			]
		}

		/** Свой ключ рядом со своей записью: по одному идентификатору диалог со
		 * мной не завести, а так скачанного реестра собеседнику хватает.
		 * Запись идемпотентна — уже лежащий там ключ второй раз не пишем,
		 * поэтому звать её можно и из действия, и из реактивной дозаписи. */
		registry_key_put( id: string ) {

			if( !id ) return null

			const store = this.registry_store( id )
			const my = this.my_lord()
			const str = this.my_pass_str()

			if( String( store.Keys()?.key( my )?.Pass()?.val() ?? '' ) === str ) return null
			store.Keys( 'auto' )?.key( my, 'auto' )?.Pass( 'auto' )?.val( str )

			return null
		}

		/** Реестры, куда я вступил до появления ключей: там лежит только мой
		 * идентификатор, и собеседник без сети диалог со мной не заведёт.
		 * Дописываем ключ туда, где я уже числюсь. Чужой реестр может быть ещё
		 * не засинкан — подписка на его приход сохраняется, дозапись случится
		 * сама, а один незасинканный не должен мешать остальным. */
		@$mol_mem
		registry_keys_fill() {

			let count = 0

			for( const id of this.registry_ids() ) {
				if( !this.registry_joined( id ) ) continue
				try {
					this.registry_key_put( id )
					++ count
				} catch( error ) {
					if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				}
			}

			return count
		}

		/** Создатель реестра сразу и его участник: свой реестр без себя бессмыслен. */
		@$mol_action
		registry_make( next?: any ) {

			const title = this.registry_name().trim()

			const land = this.$.$giper_baza_glob.land_grab([
				[ null, $giper_baza_rank_post( 'slow' ) ],
			])
			const id = land.link().str

			const store = land.Data( $bog_gram_users )
			if( title ) store.Title( 'auto' )?.val( title )
			store.Lords( 'auto' )?.add( this.my_lord() )
			store.Keys( 'auto' )?.key( this.my_lord(), 'auto' )?.Pass( 'auto' )?.val( this.my_pass_str() )

			/** Дожидаемся, пока записи подпишутся и осядут в хранилище. Ждём не
			 * ради вида: право писать всем выдаётся отдельной записью, и пока
			 * та не подписана, чужой клиент её не примет — люди приходили бы в
			 * реестр, где им можно только смотреть. Заодно обработчик всё это
			 * время висит в фибре, и кнопка сама мигает.
			 *
			 * Стоит до очистки поля с названием: фибра перезапускается с начала
			 * на каждом ожидании, а очищенное название следующий заход прочитал
			 * бы уже пустым. */
			land.units_saving()

			this.dialogs_store().Registries( 'auto' )!.add( id )
			this.registry_name( '' )
			this.$.$mol_state_arg.value( 'users', id )

			return null
		}

		/** Открытая ссылка только запоминает реестр: попасть в чужой список
		 * людей — отдельное решение, поэтому лорд туда не дописывается. */
		@$mol_mem
		registry_remember() {
			const id = this.registry_active()
			if( !id ) return ''
			if( !this.registry_ids().includes( id ) ) {
				this.dialogs_store().Registries( 'auto' )!.add( id )
			}
			return id
		}

		/** Кнопка вступления лежит внутри кликабельной строки, поэтому первым
		 * делом гасим всплытие: иначе тот же клик ещё и переключил бы реестр.
		 *
		 * Дописать запись мало: подпись с перебором степеней и сохранение
		 * уезжают в фон, действие кончается мгновенно, и человек видит, что
		 * ничего не произошло. Поэтому подтверждения дожидаемся тут же, не
		 * выходя из фибры: обработчик приостанавливается, кнопка мигает сама,
		 * пока запись не осядет, и перестаёт, когда та подтвердилась.
		 *
		 * Перезапуск фибры при этом ничего не задваивает: список сам отказывает
		 * уже лежащему в нём значению, а ключ пишется только когда отличается
		 * от записанного. */
		@$mol_action
		registry_join( id: string, next?: Event ) {
			next?.stopPropagation()
			if( !id ) return null
			if( !this.registry_ids().includes( id ) ) {
				this.dialogs_store().Registries( 'auto' )!.add( id )
			}
			if( !this.registry_lords( id ).includes( this.my_lord() ) ) {
				this.registry_store( id ).Lords( 'auto' )?.add( this.my_lord() )
			}
			this.registry_key_put( id )
			this.registry_land( id ).units_saving()
			return null
		}

		@$mol_action
		registry_join_active( next?: any ) {
			this.registry_join( this.registry_active() )
			return null
		}

		/** Убрать — значит забыть ссылку у себя: запись в самом реестре остаётся,
		 * выйти из него нельзя. Заодно снимаем реестр с адреса, иначе он
		 * вернулся бы в список на ближайшем же заходе. */
		@$mol_action
		registry_forget( id: string, next?: Event ) {
			next?.stopPropagation()
			if( !id ) return null
			this.dialogs_store().Registries( 'auto' )!.cut( id )
			if( this.registry_active() === id ) this.$.$mol_state_arg.value( 'users', null )
			return null
		}

		@$mol_action
		registry_open( id: string, next?: any ) {
			if( !id ) return null
			this.$.$mol_state_arg.value( 'users', id )
			return null
		}

		/** Открытый чужой реестр, в котором нет твоей записи: собеседники
		 * листают его список и тебя там не видят. */
		@$mol_mem
		registry_join_needed() {
			const id = this.registry_active()
			if( !id ) return false
			return !this.registry_joined( id )
		}

		override Join_plate() {
			return this.registry_join_needed() ? super.Join_plate() : null!
		}

		// ===== Люди из реестров =====

		/** Один человек — одна строка, даже если он числится в нескольких
		 * реестрах: подписью берём тот, где он встретился первым. */
		@$mol_mem
		user_sources() {
			const sources: Record< string, string > = {}
			const my = this.my_lord()
			for( const id of this.registry_ids() ) {
				for( const lord of this.registry_lords( id ) ) {
					if( lord === my ) continue
					if( sources[ lord ] ) continue
					sources[ lord ] = id
				}
			}
			return sources
		}

		@$mol_mem
		user_lords() {
			return Object.keys( this.user_sources() )
		}

		@$mol_mem
		user_rows() {
			const lords = this.user_lords()
			if( !lords.length ) return [ this.Users_empty() ]
			return lords.map( lord => this.User_row( lord ) )
		}

		override users_empty_text() {
			if( !this.registry_ids().length ) return 'Вы не состоите ни в одном реестре. Создайте свой в настройках'
			return 'Кроме вас в реестрах пока никого нет'
		}

		/** Строка человека ключуется его же лордом — по нему и рисуется узор. */
		user_lord( lord: string ) {
			return lord
		}

		@$mol_mem_key
		user_title( lord: string ) {
			return this.peer_label( lord )
		}

		/** Пока реестр один, называть его в каждой строке незачем. */
		@$mol_mem_key
		user_source( lord: string ) {
			if( this.registry_ids().length < 2 ) return ''
			const id = this.user_sources()[ lord ]
			return id ? this.registry_title( id ) : ''
		}

		override User_source( lord: string ) {
			return this.user_source( lord ) ? super.User_source( lord ) : null!
		}

		@$mol_action
		user_pick( lord: string, next?: any ) {
			if( !lord ) return null
			this.peer_accept( lord )
			this.peer_lord( '' )
			const exist = this.dialog_with( lord )
			if( exist ) {
				this.dialog_select( exist )
				return null
			}
			this.dialog_pending( lord )
			return null
		}

		// ===== Личная ссылка-приглашение =====

		/** Приглашение — адрес страницы с одним лишь лордом: остальные
		 * параметры (свой мастер, открытый реестр) чужому человеку не нужны. */
		invite_uri( lord: string ) {
			if( !lord ) return ''
			const location = this.$.$mol_dom_context.location
			return location.origin + location.pathname + '#!invite=' + lord
		}

		override invite_link() {
			return this.invite_uri( this.my_lord() )
		}

		/** Лорд из адреса страницы: по такой ссылке зовут в личный диалог. */
		invite_lord() {
			return this.$.$mol_state_arg.value( 'invite' ) ?? ''
		}

		/** Своя же ссылка диалога не заводит, знакомый собеседник просто
		 * открывается, а незнакомый уходит обычным путём — через ожидание. */
		invite_plan( lord: string, my: string, exist: string ): 'skip' | 'open' | 'start' {
			if( !lord ) return 'skip'
			if( lord === my ) return 'skip'
			return exist ? 'open' : 'start'
		}

		/** Свой аккаунт и список диалогов поднимаются не мгновенно, поэтому
		 * приём уезжает в фибру: она сама перезапустится, когда ленды приедут. */
		@$mol_mem
		invite_handle() {
			const lord = this.invite_lord()
			if( !lord ) return ''
			$mol_wire_async( this ).invite_accept( lord )
			return lord
		}

		/** Параметр из адреса снимаем в любом случае: иначе перезагрузка
		 * страницы принимала бы то же приглашение снова и снова. */
		invite_accept( lord: string ) {

			if( !lord ) return 'skip'

			const exist = this.dialog_with( lord )
			const plan = this.invite_plan( lord, this.my_lord(), exist )

			/** По ссылке приходят сами: человек, чьё приглашение я открыл,
			 * в запросах оказаться не должен, кто бы ни завёл ленд диалога. */
			if( plan !== 'skip' ) this.peer_accept( lord )

			if( plan === 'open' ) this.dialog_select( exist )
			if( plan === 'start' ) this.dialog_pending( lord )

			this.$.$mol_state_arg.value( 'invite', null )

			return plan
		}

		// ===== Ссылка-приглашение в группу =====

		/** Приглашение в группу — адрес страницы со ссылкой на её ленд и лордом
		 * создателя. Вступить по ней мгновенно нельзя: ленд группы шифрованный,
		 * и ключ от него заворачивается на ключ конкретного человека тем, у
		 * кого есть права. Поэтому ссылка ведёт к заявке.
		 *
		 * Создатель едет вторым параметром, и без него ссылка бесполезна:
		 * заявку несут в его лобби, а взять его из ленда группы просящему
		 * неоткуда — прав на неё у него ещё нет, и ленд ему не читается вовсе.
		 * Свой мастер и открытые реестры чужому человеку по-прежнему не нужны. */
		join_uri( id: string ) {
			if( !id ) return ''
			const location = this.$.$mol_dom_context.location
			const owner = this.join_owner_of( id )
			const tail = owner ? '/by=' + owner : ''
			return location.origin + location.pathname + '#!join=' + id + tail
		}

		/** Создателя берём из ленда группы: у того, кто копирует ссылку, права
		 * на неё есть. У групп, заведённых до появления явной записи о
		 * создателе, её нет — там на него указывает полное управление лендом,
		 * и такую ссылку может дать только он сам. */
		join_owner_of( id: string ) {
			const owner = this.dialog_owner( id )
			if( owner ) return owner
			return this.dialog_own( id ) ? this.my_lord() : ''
		}

		override join_link() {
			return this.join_uri( this.dialog_active() )
		}

		/** Группа из адреса страницы: по такой ссылке просятся в группу. */
		join_id() {
			return this.$.$mol_state_arg.value( 'join' ) ?? ''
		}

		/** Создатель группы из адреса страницы. */
		join_by() {
			return this.$.$mol_state_arg.value( 'by' ) ?? ''
		}

		/** Ссылка без создателя: нести заявку некому, и молчать об этом нельзя —
		 * иначе переход по ссылке выглядит как будто ничего не произошло. */
		@$mol_mem
		join_lost( next?: string ) {
			return next ?? ''
		}

		/** Уже участнику показываем группу, остальным заводим заявку. Мусор
		 * вместо ссылки отсеиваем сразу: заявка в несуществующую группу
		 * осела бы в приватном ленде навсегда и никуда бы не уехала. */
		join_plan( id: string, my: string, member: boolean ): 'skip' | 'open' | 'ask' {
			if( !id ) return 'skip'
			if( id === my ) return 'skip'
			if( !$giper_baza_link.check( id ) ) return 'skip'
			return member ? 'open' : 'ask'
		}

		/** Свой аккаунт и список диалогов поднимаются не мгновенно, поэтому
		 * приём уезжает в фибру: она сама перезапустится, когда ленды приедут. */
		@$mol_mem
		join_handle() {
			const id = this.join_id()
			if( !id ) return ''
			$mol_wire_async( this ).join_request( id, this.join_by() )
			return id
		}

		/** Параметры из адреса снимаем в любом случае: иначе перезагрузка
		 * страницы просилась бы в ту же группу снова и снова. */
		join_request( id: string, by: string ) {

			const plan = this.join_plan( id, this.my_lord(), this.dialog_ids().includes( id ) )

			if( plan === 'open' ) this.dialog_select( id )

			if( plan === 'ask' ) {
				// Своими правами создателя пользуемся, только если ссылка о нём
				// умолчала: в ней он приезжает от того, у кого права уже есть
				const owner = by || this.join_owner_of( id )
				this.join_lost( owner ? '' : id )
				if( owner ) this.ask_send( id, owner )
			}

			this.$.$mol_state_arg.value( 'join', null )
			this.$.$mol_state_arg.value( 'by', null )

			return plan
		}

		/** Запись заявки: группа, лорд просящего и его ключ. Разделитель тот
		 * же, что в отложенной доставке приглашений. */
		ask_entry( group: string, lord: string, pass: string ) {
			return group + '|' + lord + '|' + pass
		}

		/** Запись очереди: группа и лорд её создателя. Лорд оседает тут же,
		 * потому что взять его больше неоткуда — ленд группы просящему не
		 * читается, а очередь переживает перезагрузку страницы, после которой
		 * от ссылки-приглашения уже ничего не остаётся. */
		ask_task( group: string, owner: string ) {
			return owner ? group + '|' + owner : group
		}

		ask_task_group( entry: string ) {
			return String( entry ?? '' ).split( '|' )[ 0 ] ?? ''
		}

		/** У заявок, заведённых до появления лорда в записи, его нет: для них
		 * остаётся прежний путь — прочитать создателя из ленда группы, если
		 * права на неё за это время всё же выдали. */
		ask_task_owner( entry: string ) {
			return String( entry ?? '' ).split( '|' )[ 1 ] ?? ''
		}

		/** Лобби открыто на запись всем, поэтому мусор туда долетает наравне
		 * с заявками: разбор отвергает всё, что не сходится по числу частей
		 * или недосчитывается любой из них. */
		ask_parse( entry: string ) {
			const parts = String( entry ?? '' ).split( '|' )
			if( parts.length !== 3 ) return null
			const [ group, lord, pass ] = parts
			if( !group || !lord || !pass ) return null
			return { group, lord, pass }
		}

		/** Заявка встаёт в свою очередь, а уезжает отдельным потоком: право
		 * писать в чужое лобби приезжает не сразу, и с первого раза запись
		 * может не пройти. Повтор ничего не задваивает — ни очередь, ни
		 * отправленное второй ссылки не примут. */
		@$mol_action
		ask_send( id: string, owner: string ) {

			if( !id || !owner ) return null

			// По ссылке приходят сами: однажды убранная из своего списка группа
			// не должна молча отказать во второй попытке в неё попасть
			if( this.hidden_ids().includes( id ) ) this.dialogs_store().Hidden( 'auto' )!.cut( id )

			if( this.ask_groups().includes( id ) ) return null
			this.dialogs_store().Asks( 'auto' )!.add( this.ask_task( id, owner ) )

			return null
		}

		/** Свой приватный ленд шифрованный и на новом устройстве приезжает не
		 * мгновенно. Строка ожидания стоит прямо в теле страницы списка, и
		 * suspend тут подвесил бы её целиком: пока ленда нет, заявок «нет»,
		 * а подписка на его приход сохраняется — строка появится сама. */
		@$mol_mem
		ask_queued() {
			try {
				return ( this.dialogs_store().Asks()?.items() ?? [] ).map( String )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return [] as string[]
			}
		}

		@$mol_mem
		ask_sent() {
			try {
				return ( this.dialogs_store().Asked()?.items() ?? [] ).map( String )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return [] as string[]
			}
		}

		/** Группы, в которые уже просимся — и те, что ждут отправки, и те, что
		 * уже доехали. Записи очереди несут ещё и лорда, поэтому сравнивать с
		 * ссылками на группы можно только их первую половину. */
		@$mol_mem
		ask_groups() {
			const all = [ ... this.ask_queued(), ... this.ask_sent() ]
			return all.map( entry => this.ask_task_group( entry ) )
		}

		/** Заявки, на которые ещё не ответили — и те, что ждут отправки, и те,
		 * что уже доехали. Принятая уходит отсюда сама: группа появляется в
		 * списке диалогов, и записи там больше нечего ждать. */
		@$mol_mem
		ask_pending() {
			let have = new Set< string >()
			try {
				have = new Set( this.dialog_ids() )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
			}
			const all = new Set( this.ask_groups() )
			return [ ... all ].filter( id => !have.has( id ) )
		}

		/** Ссылка привела к заявке, а не к группе: без этой строки экран после
		 * перехода по ссылке просто молчал бы. Ссылка без создателя молчала бы
		 * так же, поэтому и о ней говорим прямо. */
		override ask_plate_text() {
			if( this.join_lost() ) return 'В ссылке нет создателя группы — заявку нести некому, попросите свежую'
			const count = this.ask_pending().length
			if( !count ) return ''
			if( count === 1 ) return 'Заявка отправлена — ждём, пока её примут'
			return 'Заявок отправлено: ' + count + ' — ждём, пока их примут'
		}

		override Ask_plate() {
			return this.ask_plate_text() ? super.Ask_plate() : null!
		}

		/** Заявку приняли: права на ленд группы приехали, и в списке участников
		 * уже стоит мой идентификатор. Ленд без выданных прав не читается
		 * вовсе — это обычное состояние ожидания, а не ошибка. */
		ask_taken( entry: string ) {

			const store = this.dialogs_store()
			const id = this.ask_task_group( entry )

			try {
				if( !this.dialog_lords( id ).includes( this.my_lord() ) ) return false
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return false
			}

			if( !this.dialog_ids().includes( id ) && !this.hidden_ids().includes( id ) ) {
				store.Dialogs( 'auto' )!.add( id )
			}

			store.Asks( 'auto' )!.cut( entry )
			store.Asked( 'auto' )!.cut( entry )

			return true
		}

		/** Доставка заявок. Повторами ретраится только очередь: право писать в
		 * чужое лобби приезжает не сразу, и с первого раза запись может не
		 * пройти. Доехавшую заявку второй раз не шлём — отклонённую админ из
		 * лобби убирает, и повтор возвращал бы её туда снова, сводя отказ на
		 * нет. Отправленные при этом остаются под присмотром без всякого
		 * таймера: чтение ленда группы подписывает на его приход, и выданные
		 * права разбудят этот пересчёт сами. */
		@$mol_mem
		asks_flush() {

			const queued = this.ask_queued()
			const sent = this.ask_sent()
			if( !queued.length && !sent.length ) return 0

			for( const task of sent ) this.ask_taken( task )

			if( !queued.length ) return sent.length

			this.$.$mol_state_time.now( 3000 )

			const my = this.my_lord()
			const store = this.dialogs_store()

			for( const task of queued ) {

				if( this.ask_taken( task ) ) continue

				try {

					const id = this.ask_task_group( task )

					// Записанный лорд важнее ленда группы: пока прав нет, ленд
					// не читается, и спрашивать его о создателе бесполезно.
					// Прочитать его удаётся только у старых записей — там лорда
					// нет, зато права к этому времени могли и выдать
					const owner = this.ask_task_owner( task ) || this.dialog_owner( id )
					if( !owner ) {
						store.Asks( 'auto' )!.cut( task )
						continue
					}

					const inbox_link = this.peer_store( owner ).Inbox_land()?.val()
					if( !inbox_link ) continue

					const inbox = this.$.$giper_baza_glob
						.Land( new $giper_baza_link( String( inbox_link ) ) )
						.Data( $bog_gram_inbox )

					const entry = this.ask_entry( id, my, this.my_pass_str() )
					inbox.Joins( 'auto' )!.add( entry )

					const delivered = ( inbox.Joins()?.items() ?? [] ).map( String ).includes( entry )
					if( !delivered ) continue

					store.Asked( 'auto' )!.add( task )
					store.Asks( 'auto' )!.cut( task )

				} catch( error ) {
					if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
					$mol_fail_log( error )
				}

			}

			return queued.length + sent.length
		}

		// ===== Уведомления =====

		notify_supported() {
			return this.$.$bog_gram_notify.supported()
		}

		override Notify_toggle() {
			return this.notify_supported() ? super.Notify_toggle() : null!
		}

		/** Разрешение браузера само о себе не сообщает: держим копию в меме
		 * и обновляем её после запроса, иначе подпись останется старой. */
		@$mol_mem
		notify_permission( next?: NotificationPermission ) {
			return next ?? this.$.$bog_gram_notify.permission()
		}

		/** Сам браузер о живой подписке расскажет только через воркер, а демон
		 * помнит её по лорду — нам достаточно своей отметки в хранилище. */
		notify_on( next?: boolean ) {
			return this.$.$mol_state_local.value< boolean >( notify_key, next ) ?? false
		}

		notify_label() {
			return this.notify_on() ? 'Выключить' : 'Включить уведомления'
		}

		notify_status() {
			if( !this.notify_supported() ) return 'Не поддерживается этим браузером'
			if( this.notify_permission() === 'denied' ) return 'Запрещены в браузере'
			return this.notify_on() ? 'Уведомления включены' : 'Выключены'
		}

		@$mol_action
		notify_toggle( next?: any ) {
			$mol_wire_async( this ).notify_apply( !this.notify_on() )
			return null
		}

		/** Разрешение и сеть ждать из обработчика клика нечем, поэтому вся
		 * работа уезжает в фибру, а сюда возвращается уже итог. */
		notify_apply( on: boolean ) {

			const notify = this.$.$bog_gram_notify

			if( !on ) {
				notify.unsubscribe( this.my_lord() )
				this.notify_on( false )
				return false
			}

			const ok = notify.subscribe( this.my_lord(), this.monitor_land().link().str )
			this.notify_permission( notify.permission() )
			this.notify_on( ok )
			return ok
		}

		// ===== Ключ аккаунта: показ и экспорт =====

		/** Строка ключа — это полный доступ к аккаунту, поэтому она никуда
		 * не уезжает: только на экран и только по явной просьбе. */
		override key_text() {
			const auth = this.$.$giper_baza_auth.current()
			return auth.toString() + auth.toStringPrivate()
		}

		@$mol_mem
		key_shown( next?: boolean ) {
			return next ?? false
		}

		override key_toggle_label() {
			return this.key_shown() ? 'Скрыть ключ' : 'Показать ключ'
		}

		@$mol_action
		key_toggle( next?: any ) {
			this.key_shown( !this.key_shown() )
			return null
		}

		/** Уходя из настроек, прячем ключ и снимаем взвод импорта: иначе секрет
		 * останется на экране, а следующий одиночный клик сменит аккаунт. */
		account_reset() {
			this.key_shown( false )
			this.import_armed( false )
			this.key_error( '' )
		}

		/** Пока ключ скрыт, его не читает никто: ни абзац, ни кнопка копирования,
		 * ни QR — в дереве компонентов их просто нет. */
		@$mol_mem
		account_rows() {
			if( !this.key_shown() ) return [ this.Key_toggle(), this.Key_import_form() ]
			return [
				this.Key_toggle(),
				this.Key_warning(),
				this.Key_row(),
				this.Key_qr_box(),
				this.Key_save(),
				this.Key_import_form(),
			]
		}

		/** Ключ уезжает в файл через временный объектный URL: ссылку кликаем
		 * программно и тут же освобождаем, в документе она не остаётся. */
		@$mol_action
		key_save( next?: any ) {

			const context = this.$.$mol_dom_context
			const blob = new Blob( [ this.key_text() ], { type: 'text/plain' } )
			const uri = context.URL.createObjectURL( blob )

			const link = context.document.createElement( 'a' )
			link.href = uri
			link.download = auth_file

			context.document.body.appendChild( link )
			link.click()
			link.remove()

			context.URL.revokeObjectURL( uri )

			return null
		}

		// ===== Вход по чужому ключу =====

		@$mol_mem
		key_error( next?: string ) {
			return next ?? ''
		}

		override Key_error() {
			return this.key_error() ? super.Key_error() : null!
		}

		@$mol_mem
		import_armed( next?: boolean ) {
			return next ?? false
		}

		override key_import_label() {
			return this.import_armed() ? 'Точно войти? Текущий аккаунт будет заменён' : 'Войти по ключу'
		}

		/** Ключом считаем только строку полного размера: обрезок или случайный
		 * текст молча увели бы пользователя в пустой аккаунт без диалогов. */
		auth_from( str: string ) {
			try {
				const auth = this.$.$giper_baza_auth.from( str )
				return auth.byteLength === auth_size ? auth : null
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				return null
			}
		}

		/** Первый клик взводит кнопку, второй применяет — как корзина в списке диалогов.
		 * Заведомый мусор до подтверждения не доходит: строка проверяется сразу. */
		@$mol_action
		key_import( next?: any ) {

			const str = this.key_input().trim()
			if( !str ) {
				this.key_error( 'Вставьте ключ или загрузите файл' )
				return null
			}

			const auth = this.auth_from( str )
			if( !auth ) {
				this.import_armed( false )
				this.key_error( 'Это не похоже на ключ аккаунта' )
				return null
			}

			if( !this.import_armed() ) {
				this.key_error( '' )
				this.import_armed( true )
				return null
			}

			// Подписка на пуши выдана прежнему лорду и новому уже не подходит:
			// снимаем отметку, чтобы настройки не обещали то, чего нет
			this.notify_on( false )

			this.$.$giper_baza_auth.current( auth )

			// Весь граф данных завязан на текущий ключ, поэтому проще начать страницу заново
			this.$.$mol_dom_context.location.reload()

			return null
		}

		/** Файл читается асинхронно, поэтому из обработчика уезжаем в фибру. */
		key_file( next?: readonly File[] ) {
			const file = next?.[ 0 ]
			if( file ) $mol_wire_async( this ).key_file_read( file )
			return next ?? null
		}

		key_file_read( file: File ) {
			const text = $mol_wire_sync( file ).text()
			this.key_input( text.trim() )
			this.import_armed( false )
			this.key_error( '' )
			return true
		}

		// ===== Автозапуск =====

		/** Ленд заметок тут не заводим: он нужен не раньше первого клика по
		 * строке избранного, а на старте список диалогов ещё в пути, и захват
		 * попадал бы в окно, когда своей ссылки на него как бы нет. */
		@$mol_mem
		setup_ready() {
			this.user_store()
			this.inbox_land()
			this.dialogs_land()
			this.monitor_land()
			this.device_ready()
			return true
		}

		override auto() {
			super.auto()
			try { this.baza_master() } catch( error ) { $mol_fail_log( error ) }
			try { this.setup_ready() } catch( error ) { $mol_fail_log( error ) }
			try { this.registry_remember() } catch( error ) { $mol_fail_log( error ) }
			try { this.registry_keys_fill() } catch( error ) { $mol_fail_log( error ) }
			try { this.invite_handle() } catch( error ) { $mol_fail_log( error ) }
			try { this.join_handle() } catch( error ) { $mol_fail_log( error ) }
			try { this.dialog_autocreate() } catch( error ) { $mol_fail_log( error ) }
			try { this.outbox_flush() } catch( error ) { $mol_fail_log( error ) }
			try { this.asks_flush() } catch( error ) { $mol_fail_log( error ) }
			try { this.inbox_merge() } catch( error ) { $mol_fail_log( error ) }
			try { this.monitor_fill() } catch( error ) { $mol_fail_log( error ) }
			try { this.read_sync() } catch( error ) { $mol_fail_log( error ) }
		}

	}

	export class $bog_gram_avatar extends $.$bog_gram_avatar {

		/** Базовый узор кладёт точки с шагом 2.7 при их толщине 3.5 — они
		 * перекрываются, и у длинных идентификаторов картинка сливается в
		 * сплошное пятно. Берём шаг крупнее толщины: точек меньше, зато
		 * узор читается и остаётся узнаваемым.
		 *
		 * Сетка прямоугольная, а рамка круглая, поэтому угловые точки
		 * срезались краем. Вписываем узор в окружность: точку, которая не
		 * помещается целиком, просто не рисуем — обрезков не остаётся,
		 * а сам узор становится круглым, как и аватар. */
		@ $mol_mem
		override path() {

			const id = $mol_hash_string( this.id() )
			const start = 4
			const step = 4
			const center = 12
			/** Радиус точки — половина её толщины, плюс небольшой зазор от края. */
			const limit = center - 2.5

			let path = ''

			for( let x = 0; x < 3; ++x ) {
				for( let y = 0; y < 5; ++y ) {

					if( !( ( id >> ( x + y * 3 ) ) & 1 ) ) continue

					const px = step * x + start
					const py = step * y + start

					const dx = px - center
					const dy = py - center
					if( Math.sqrt( dx * dx + dy * dy ) > limit ) continue

					path += `M ${ px } ${ py } l 0 0 ` + `M ${ 24 - px } ${ py } l 0 0 `

				}
			}

			return path
		}

	}

	export class $bog_gram_photo extends $.$bog_gram_photo {

		/** Пока кадр не докачался, коробка стоит пустой: картинку с пустым
		 * адресом браузер рисует значком битой. */
		override Image() {
			return this.uri() ? super.Image() : null!
		}

	}

	/** Строка голосового в пузыре: кнопка, полоса и длина. Сам элемент
	 * звука лежит тут же, просто не показывается. */
	export class $bog_gram_sound extends $.$bog_gram_sound {

		/** Пока запись не приехала, элемент звука не заводим: пустой адрес
		 * источника браузер честно пытается загрузить — и ругается. */
		override Node() {
			return this.uri() ? super.Node() : null!
		}

		/** Сколько уже прозвучало. Ленд может быть ещё в пути, а разметка —
		 * не отрисована: тогда просто стоим в начале. */
		@$mol_mem
		moment() {
			try {
				return ( this.Node() as $.$$.$bog_gram_sound_node )?.time() ?? 0
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return 0
			}
		}

		/** Молчит — показываем общую длину, на ходу — сколько прозвучало. */
		@$mol_mem
		override stamp() {
			const span = this.playing() ? this.moment() : this.span()
			return this.$.$bog_gram_voice.stamp( span )
		}

		@$mol_mem
		override fill_width() {
			const span = this.span()
			if( !span ) return '0%'
			const share = Math.max( 0, Math.min( 1, this.moment() / span ) )
			return ( share * 100 ).toFixed( 1 ) + '%'
		}

		override toggle_icons() {
			return [ this.playing() ? this.Pause_icon() : this.Play_icon() ]
		}

		/** Играет ровно то, что решил список: решение принимается снаружи,
		 * иначе два голосовых заговорили бы разом.
		 *
		 * Управление объявлено в наследнике, а свойство отдаёт тип базы —
		 * отсюда приведение: без него сборка не видит этих методов. */
		start() {
			( this.Node() as $.$$.$bog_gram_sound_node )?.start()
		}

		stop() {
			( this.Node() as $.$$.$bog_gram_sound_node )?.stop()
		}

	}

	export class $bog_gram_sound_node extends $.$bog_gram_sound_node {

		override dom_node( next?: Element ) {
			return super.dom_node( next ) as HTMLAudioElement
		}

		/** Позиция звучания: событие сдвига объявляет её устаревшей, и полоса
		 * прогресса едет сама. */
		@$mol_mem
		time() {
			this.retime()
			return this.dom_node().currentTime
		}

		/** Обещание запуска не ждём: браузер отказывает, только когда звук
		 * включают без участия человека, а тут за кнопкой стоит его нажатие.
		 * Дослушанное до конца начинаем сначала. */
		start() {
			const node = this.dom_node()
			if( node.ended ) node.currentTime = 0
			node.play().catch( error => $mol_fail_log( error ) )
		}

		stop() {
			const node = this.dom_node()
			if( !node.paused ) node.pause()
		}

	}

	export class $bog_gram_chat extends $.$bog_gram_chat {

		/** Заголовок чата — это подпись собеседника, поэтому он и правится
		 * прямо на месте. Подписывать, однако, есть кого не всегда: у избранного
		 * заголовок остаётся обычной строкой. */
		override Note_field() {
			return this.note_editable() ? super.Note_field() : null!
		}

		override Title_text() {
			return this.note_editable() ? null! : super.Title_text()
		}

		/** Список участников есть только у группы: в переписке вдвоём
		 * перечислять некого. */
		override Members() {
			return this.members_shown() ? super.Members() : null!
		}

		override Edit_banner() {
			return this.edit_mode() ? super.Edit_banner() : null!
		}

		override Voice_note() {
			return this.voice_hint() ? super.Voice_note() : null!
		}

		/** Микрофон стоит на месте отправки, пока писать нечего — как в телеге.
		 * В правке его нет: она про текст. Нет и там, где браузер не умеет
		 * писать звук: тогда отправка остаётся единственной кнопкой. */
		send_is() {
			if( this.edit_mode() ) return true
			if( !this.voice_ready() ) return true
			return Boolean( this.message_text().trim() )
		}

		override Send() {
			return this.send_is() ? super.Send() : null!
		}

		override Voice() {
			return this.send_is() ? null! : super.Voice()
		}

		/** Пока идёт запись, поле ввода со скрепкой уступают место таймеру и
		 * отмене. Сам микрофон при этом остаётся на месте и той же кнопкой:
		 * палец всё ещё лежит на ней, и отпускание должно прийти именно туда. */
		@$mol_mem
		override send_tools() {
			if( this.voice_on() ) return [ this.Record_state(), this.Voice_cancel(), this.Voice() ]
			return [ this.Attach(), this.Message_field(), this.Send(), this.Voice() ]
		}

		/** Развёрнутый кадр лежит поверх всей страницы, а не внутри ленты:
		 * в ленте он ездил бы вместе с прокруткой переписки. */
		override sub() {
			if( !this.zoom_uri() ) return super.sub()
			return [ ... super.sub(), this.Zoom() ]
		}

		// Лента прокручивается вниз после рендера: auto() зовётся из dom_tree,
		// когда DOM уже актуален. Чтение rows() подписывает на новые сообщения.
		override auto() {
			super.auto()
			try {
				void this.rows()
				const el = this.Body().dom_node() as HTMLElement
				el.scrollTop = el.scrollHeight
			} catch( error ) {
				if( $mol_promise_like( error ) ) return
				$mol_fail_log( error )
			}
		}

	}

}
