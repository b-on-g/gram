namespace $.$$ {

	const prod_master = 'https://baza.87.120.36.150.ip.giper.dev/'

	const day_ms = 24 * 60 * 60 * 1000

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

		// ===== Диалоги =====

		@$mol_mem
		dialog_ids() {
			return ( this.dialogs_store().Dialogs()?.items() ?? [] ).map( String )
		}

		dialog_store( id: string ) {
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( id ) ).Data( $bog_gram_dialog )
		}

		@$mol_mem_key
		dialog_peer( id: string ) {
			const peers = ( this.dialog_store( id ).Peers()?.items() ?? [] ).map( String )
			return peers.find( lord => lord !== this.my_lord() ) ?? peers[0] ?? ''
		}

		@$mol_mem_key
		dialog_title( id: string ) {
			const peer = this.dialog_peer( id )
			if( !peer ) return id.slice( 0, 8 ) + '…'
			return this.peer_name( peer ) || peer.slice( 0, 8 ) + '…'
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

		@$mol_mem
		dialog_rows() {
			const ids = this.dialog_ids()
			if( !ids.length ) return [ this.Dialogs_empty() ]
			return [ ... ids ]
				.sort( ( a, b )=> this.dialog_moment( b ) - this.dialog_moment( a ) )
				.map( id => this.Dialog_row( id ) )
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
			this.edit_id( '' )
			this.message_text( '' )
			this.dialog_current( id )
			return null
		}

		@$mol_action
		dialog_close( next?: any ) {
			this.edit_id( '' )
			this.message_text( '' )
			this.dialog_current( '' )
			return null
		}

		/** Только явно выбранный диалог: на узком экране чат не должен открываться сам. */
		@$mol_mem
		dialog_active() {
			const current = this.dialog_current()
			if( current && this.dialog_ids().includes( current ) ) return current
			return ''
		}

		@$mol_mem
		chat_title() {
			const id = this.dialog_active()
			if( !id ) return 'Выберите диалог'
			return this.dialog_title( id )
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
		compose_open( next?: any ) {
			this.settings_opened( false )
			this.compose_opened( true )
			return null
		}

		@$mol_action
		compose_close( next?: any ) {
			this.compose_opened( false )
			return null
		}

		@$mol_action
		settings_open( next?: any ) {
			this.compose_opened( false )
			this.settings_opened( true )
			return null
		}

		@$mol_action
		settings_close( next?: any ) {
			this.settings_opened( false )
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

		@$mol_mem
		dialog_pending( next?: string ) {
			return next ?? ''
		}

		@$mol_action
		dialog_start( next?: any ) {
			const peer = this.peer_lord().trim()
			if( !peer ) return null
			this.dialog_pending( peer )
			this.peer_lord( '' )
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
			for( const link of invites ) {
				if( have.has( link ) ) continue
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

		/** Последняя сессия-бакет диалога: в ней живут и сообщения, и позиции прочтения. */
		session_land_of( id: string ) {
			if( !id ) return null
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

		/** Одна галочка — доставлено, две — собеседник прочитал. Только для своих сообщений. */
		@$mol_mem_key
		message_checks( id: string ) {
			if( !this.message_out( id ) ) return ''
			const dialog = this.dialog_active()
			const peer = this.dialog_peer( dialog )
			if( !peer ) return '✓'
			const moment = Number( this.message_pawn( id )?.Moment()?.val() ?? 0 )
			return this.read_moment_of( dialog, peer ) >= moment ? '✓✓' : '✓'
		}

		override Message_checks( id: string ) {
			return this.message_out( id ) ? super.Message_checks( id ) : null!
		}

		override Message_edit( id: string ) {
			return this.message_out( id ) ? super.Message_edit( id ) : null!
		}

		override Message_delete( id: string ) {
			return this.message_out( id ) ? super.Message_delete( id ) : null!
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

		// ===== Общий реестр пользователей =====

		users_land() {
			const str = this.$.$mol_state_arg.value( 'users' )
			if( !str ) return null
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( str ) )
		}

		@$mol_action
		registry_make( next?: any ) {
			const land = this.$.$giper_baza_glob.land_grab([
				[ null, $giper_baza_rank_post( 'slow' ) ],
			])
			this.$.$mol_state_arg.value( 'users', land.link().str )
			return null
		}

		users_store() {
			const land = this.users_land()
			if( !land ) return null
			return land.Data( $bog_gram_users )
		}

		@$mol_mem
		user_lords() {
			const store = this.users_store()
			if( !store ) return [] as string[]
			return ( store.Lords()?.items() ?? [] ).map( String )
		}

		@$mol_mem
		users_register() {
			const store = this.users_store()
			if( !store ) return false
			if( !this.user_lords().includes( this.my_lord() ) ) {
				store.Lords( 'auto' )?.add( this.my_lord() )
			}
			return true
		}

		@$mol_mem
		registry_content() {
			if( !this.users_land() ) return [ this.Registry_make() ]
			return [ this.Registry_ready() ]
		}

		@$mol_mem
		user_rows() {
			const lords = this.user_lords().filter( lord => lord !== this.my_lord() )
			if( !lords.length ) return [ this.Users_empty() ]
			return lords.map( lord => this.User_row( lord ) )
		}

		override users_empty_text() {
			if( !this.users_land() ) return 'Общий реестр не подключён. Создайте его в настройках'
			return 'В реестре пока только вы'
		}

		user_lord( lord: string ) {
			return lord
		}

		@$mol_mem_key
		user_title( lord: string ) {
			return this.peer_name( lord ) || lord.slice( 0, 8 ) + '…'
		}

		@$mol_action
		user_pick( lord: string, next?: any ) {
			if( !lord ) return null
			this.dialog_pending( lord )
			this.peer_lord( '' )
			return null
		}

		// ===== Автозапуск =====

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
			try { this.users_register() } catch( error ) { $mol_fail_log( error ) }
			try { this.dialog_autocreate() } catch( error ) { $mol_fail_log( error ) }
			try { this.outbox_flush() } catch( error ) { $mol_fail_log( error ) }
			try { this.inbox_merge() } catch( error ) { $mol_fail_log( error ) }
			try { this.monitor_fill() } catch( error ) { $mol_fail_log( error ) }
			try { this.read_sync() } catch( error ) { $mol_fail_log( error ) }
		}

	}

	export class $bog_gram_chat extends $.$bog_gram_chat {

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
