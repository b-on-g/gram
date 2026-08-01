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

		@$mol_mem_key
		peer_name( lord: string ) {
			return this.peer_store( lord ).Name()?.val() ?? ''
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
		 * сохраняется, узор и цвет проявятся сами. */
		@$mol_mem_key
		dialog_avatar_id( id: string ) {
			try {
				return this.dialog_peer( id )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return ''
			}
		}

		@$mol_mem_key
		dialog_tint( id: string ) {
			try {
				return this.avatar_tint( this.dialog_peer( id ) )
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
		 * поэтому уже записанная ссылка всегда важнее только что захваченной. */
		@$mol_action
		saved_land_make() {
			const land = this.$.$giper_baza_glob.land_grab([
				[ null, $giper_baza_rank_deny ],
			])
			const str = this.dialogs_store().Saved_land()?.val()
			if( str ) return this.$.$giper_baza_glob.Land( new $giper_baza_link( String( str ) ) )
			this.dialogs_store().Saved_land( 'auto' )?.val( land.link().str )
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

		/** Единственная развилка на всё приложение: у избранного нет собеседника,
		 * поэтому ни галочек прочтения, ни счётчика непрочитанных, ни «вы:»
		 * в превью ему не полагается. */
		saved_is( id: string ) {
			const saved = this.saved_id()
			return Boolean( saved ) && id === saved
		}

		override saved_title() {
			return saved_name
		}

		/** На новом устройстве ленд избранного приезжает не мгновенно: пока он
		 * в пути, строка стоит с пустым превью, а не вешает весь список. */
		@$mol_mem
		saved_preview() {
			try {
				return this.dialog_preview( this.saved_id() )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				return ''
			}
		}

		@$mol_mem
		saved_time() {
			try {
				return this.dialog_time( this.saved_id() )
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
			const peers = ( this.dialog_store( id ).Peers()?.items() ?? [] ).map( String )
			return peers.find( lord => lord !== this.my_lord() ) ?? peers[0] ?? ''
		}

		/** Безымянного собеседника показываем началом и концом идентификатора:
		 * у одного только начала первые символы у разных людей совпадают глазом. */
		lord_short( lord: string ) {
			if( lord.length <= 14 ) return lord
			return lord.slice( 0, 6 ) + '…' + lord.slice( -4 )
		}

		@$mol_mem_key
		dialog_title( id: string ) {
			if( this.saved_is( id ) ) return saved_name
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

		/** Избранное стоит первой строкой всегда, вход в архив — последней и
		 * только пока архив не пуст; развёрнутый архив досыпает строки туда же. */
		@$mol_mem
		dialog_rows() {

			const archived = this.archive_ids()
			const folded = new Set( archived )
			const visible = this.fresh_first( this.dialog_ids().filter( id => !folded.has( id ) ) )
			const empty = !visible.length && !archived.length

			return [
				this.Saved_row(),
				... visible.map( id => this.Dialog_row( id ) ),
				... empty ? [ this.Dialogs_empty() ] : [],
				... archived.length ? [ this.Archive_row() ] : [],
				... this.archive_opened() ? this.fresh_first( archived ).map( id => this.Dialog_row( id ) ) : [],
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
			this.compose_opened( false )
			this.settings_opened( false )
			this.account_reset()
			this.edit_id( '' )
			this.message_text( '' )
			this.message_menu( '' )
			this.delete_disarm()
			this.dialog_current( id )
			return null
		}

		@$mol_action
		dialog_close( next?: any ) {
			this.edit_id( '' )
			this.message_text( '' )
			this.message_menu( '' )
			this.delete_disarm()
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
				const sessions = ( this.dialog_store( id ).Sessions()?.items() ?? [] ).map( String )
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

		/** Собеседник открытого диалога: у избранного его нет, поэтому и
		 * подписывать там некого. */
		@$mol_mem
		chat_peer() {
			const id = this.dialog_active()
			if( !id ) return ''
			if( this.saved_is( id ) ) return ''
			return this.dialog_peer( id )
		}

		/** Заголовок чата — это подпись собеседника, и правится она прямо
		 * в шапке. У избранного заголовок фиксированный, поле там не нужно. */
		override chat_note_editable() {
			return Boolean( this.chat_peer() )
		}

		/** Пустое поле не должно выглядеть потерей имени: подсказкой в нём
		 * стоит то, как человек назвал себя сам. */
		override chat_note_hint() {
			const lord = this.chat_peer()
			if( !lord ) return ''
			return this.peer_name( lord ) || this.lord_short( lord )
		}

		@$mol_mem
		chat_note( next?: string ) {
			const lord = this.chat_peer()
			if( !lord ) return ''
			if( next !== undefined ) this.peer_note_set( lord, next )
			return this.peer_note( lord )
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
				... this.dialog_active() ? [ this.Chat_page() ] : [],
			]
		}

		override Placeholder() {
			return this.dialog_active() ? null! : super.Placeholder()
		}

		// ===== Создание диалога =====

		/** Уже существующий диалог с этим собеседником — повторный старт
		 * не должен плодить новые ленды, а должен открывать старый.
		 * Незасинканный диалог считаем несовпадением, чтобы не виснуть. */
		dialog_with( peer: string ) {
			if( !peer ) return ''
			for( const id of this.dialog_ids() ) {
				try {
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
			this.peer_lord( '' )
			const exist = this.dialog_with( peer )
			if( exist ) {
				this.dialog_select( exist )
				return null
			}
			this.dialog_pending( peer )
			return null
		}

		// Ждём реактивно, пока home собеседника приедет с мастера, и только тогда создаём диалог
		@$mol_mem
		dialog_autocreate() {
			const peer = this.dialog_pending()
			if( !peer ) return ''

			const peer_user = this.peer_store( peer )
			peer_user.keys()
			peer_user.Name()?.val()

			const pass = this.$.$giper_baza_glob.Land( new $giper_baza_link( peer ) ).king_pass()
			if( !pass ) return ''

			$mol_wire_async( this ).dialog_create( peer )
			return peer
		}

		dialog_create( peer: string ) {

			// Гонка: пока ждали king_pass, диалог мог появиться (или второй клик)
			const exist = this.dialog_with( peer )
			if( exist ) {
				this.dialog_current( exist )
				this.compose_opened( false )
				this.dialog_pending( '' )
				return exist
			}

			const glob = this.$.$giper_baza_glob
			const peer_user = this.peer_store( peer )
			peer_user.Name()?.val()

			const peer_pass = glob.Land( new $giper_baza_link( peer ) ).king_pass()
			if( !peer_pass ) return null

			const dialog_land = glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
			const session_land = glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
			dialog_land.give( peer_pass, $giper_baza_rank_post( 'just' ) )
			session_land.give( peer_pass, $giper_baza_rank_post( 'just' ) )

			const dialog = dialog_land.Data( $bog_gram_dialog )
			dialog.Peers( 'auto' )!.add( this.my_lord() )
			dialog.Peers( 'auto' )!.add( peer )
			dialog.Sessions( 'auto' )!.add( session_land.link().str )
			dialog.Created( 'auto' )?.val( Date.now() )

			const session = session_land.Data( $bog_gram_session )
			session.Dialog_land( 'auto' )?.val( dialog_land.link().str )

			this.dialogs_store().Dialogs( 'auto' )!.add( dialog_land.link().str )
			this.monitor_store().Watch( 'auto' )!.add( session_land.link().str )

			this.dialogs_store().Outbox( 'auto' )!.add( peer + '|' + dialog_land.link().str )

			this.dialog_current( dialog_land.link().str )
			this.compose_opened( false )
			this.dialog_pending( '' )
			return dialog_land.link().str
		}

		// Доставка инвайтов: ретраим, пока не приедут права чужого inbox-ленда
		@$mol_mem
		outbox_flush() {
			const entries = ( this.dialogs_store().Outbox()?.items() ?? [] ).map( String )
			if( !entries.length ) return 0
			this.$.$mol_state_time.now( 3000 )
			for( const entry of entries ) {
				const [ peer, dialog_link ] = entry.split( '|' )
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
				const sessions = ( this.dialog_store( id ).Sessions()?.items() ?? [] ).map( String )
				for( const link of sessions ) {
					if( have.has( link ) ) continue
					watch.Watch( 'auto' )!.add( link )
				}
			}
			return true
		}

		// ===== Сообщения =====

		/** Последняя сессия-бакет диалога: в ней живут и сообщения, и позиции
		 * прочтения. У избранного делить нечего и не с кем, поэтому его ленд
		 * сам себе сессия — остальной код от этого ничем не отличается. */
		session_land_of( id: string ) {
			if( !id ) return null
			if( this.saved_is( id ) ) return this.saved_land()
			const sessions = ( this.dialog_store( id ).Sessions()?.items() ?? [] ).map( String )
			const last = sessions[ sessions.length - 1 ]
			if( !last ) return null
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( last ) )
		}

		session_land_active() {
			return this.session_land_of( this.dialog_active() )
		}

		session_store_of( id: string ) {
			const land = this.session_land_of( id )
			if( !land ) return null
			return land.Data( $bog_gram_session )
		}

		@$mol_mem_key
		messages_of( id: string ) {
			const list = this.session_store_of( id )?.Messages()?.remote_list() ?? []
			return [ ... list ].sort( ( a, b )=> ( a.Moment()?.val() ?? 0 ) - ( b.Moment()?.val() ?? 0 ) )
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

		/** Одна галочка — доставлено, две — собеседник прочитал. Только для своих
		 * сообщений и только там, где есть кому читать: в избранном галочек нет. */
		@$mol_mem_key
		message_checks( id: string ) {
			if( !this.message_out( id ) ) return ''
			const dialog = this.dialog_active()
			if( this.saved_is( dialog ) ) return ''
			const peer = this.dialog_peer( dialog )
			if( !peer ) return '✓'
			const moment = Number( this.message_pawn( id )?.Moment()?.val() ?? 0 )
			return this.read_moment_of( dialog, peer ) >= moment ? '✓✓' : '✓'
		}

		override Message_checks( id: string ) {
			return this.message_checks( id ) ? super.Message_checks( id ) : null!
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
			const session = this.session_store_of( this.dialog_active() )
			if( !session ) return null
			const message = session.Messages( 'auto' )!.make( null )
			message.Text( 'auto' )?.val( text )
			message.Author( 'auto' )?.val( this.my_lord() )
			message.Moment( 'auto' )?.val( Date.now() )
			this.message_text( '' )
			return null
		}

		// ===== Прочтения =====

		read_moment_of( id: string, lord: string ) {
			const session = this.session_store_of( id )
			if( !session ) return 0
			return Number( session.Reads()?.key( lord )?.Moment()?.val() ?? 0 )
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

			const session = this.session_store_of( id )
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

		@$mol_mem_key
		dialog_preview( id: string ) {
			const messages = this.messages_alive_of( id )
			const last = messages[ messages.length - 1 ]
			if( !last ) return ''
			const text = String( last.Text()?.val() ?? '' )
			if( this.saved_is( id ) ) return text
			const mine = String( last.Author()?.val() ?? '' ) === this.my_lord()
			return mine ? 'Вы: ' + text : text
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

		registry_store( id: string ) {
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( id ) ).Data( $bog_gram_users )
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
		 * делом гасим всплытие: иначе тот же клик ещё и переключил бы реестр. */
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

			if( plan === 'open' ) this.dialog_select( exist )
			if( plan === 'start' ) this.dialog_pending( lord )

			this.$.$mol_state_arg.value( 'invite', null )

			return plan
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

		@$mol_mem
		setup_ready() {
			this.user_store()
			this.inbox_land()
			this.dialogs_land()
			this.saved_land()
			this.monitor_land()
			this.device_ready()
			return true
		}

		override auto() {
			super.auto()
			try { this.baza_master() } catch( error ) { $mol_fail_log( error ) }
			try { this.setup_ready() } catch( error ) { $mol_fail_log( error ) }
			try { this.registry_remember() } catch( error ) { $mol_fail_log( error ) }
			try { this.invite_handle() } catch( error ) { $mol_fail_log( error ) }
			try { this.dialog_autocreate() } catch( error ) { $mol_fail_log( error ) }
			try { this.outbox_flush() } catch( error ) { $mol_fail_log( error ) }
			try { this.inbox_merge() } catch( error ) { $mol_fail_log( error ) }
			try { this.monitor_fill() } catch( error ) { $mol_fail_log( error ) }
			try { this.read_sync() } catch( error ) { $mol_fail_log( error ) }
		}

	}

	export class $bog_gram_avatar extends $.$bog_gram_avatar {

		/** Базовый узор кладёт точки с шагом 2.7 при их толщине 3.5 — они
		 * перекрываются, и у длинных идентификаторов картинка сливается в
		 * сплошное пятно. Берём сетку 3×5 с шагом крупнее толщины: точек
		 * меньше, зато узор читается и остаётся узнаваемым. */
		@ $mol_mem
		override path() {

			const id = $mol_hash_string( this.id() )
			const start = 3
			const step = 4.5

			let path = ''

			for( let x = 0; x < 3; ++x ) {
				for( let y = 0; y < 5; ++y ) {

					if( !( ( id >> ( x + y * 3 ) ) & 1 ) ) continue

					const px = Math.ceil( step * x + start )
					const py = Math.ceil( step * y + start )

					path += `M ${ px } ${ py } l 0 0 ` + `M ${ 24 - px } ${ py } l 0 0 `

				}
			}

			return path
		}

	}

	export class $bog_gram_chat extends $.$bog_gram_chat {

		/** Заголовок чата — это подпись собеседника, поэтому он и правится
		 * прямо на месте. Подписывать, однако, есть кого не всегда: у избранного
		 * заголовок остаётся обычной строкой. */
		override Note_row() {
			return this.note_editable() ? super.Note_row() : null!
		}

		override Title_text() {
			return this.note_editable() ? null! : super.Title_text()
		}

		override Edit_banner() {
			return this.edit_mode() ? super.Edit_banner() : null!
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
