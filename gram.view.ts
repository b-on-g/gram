namespace $.$$ {

	/** Сколько держать палец на своём пузыре, чтобы под ним раскрылись
	 * правка и удаление: короче — срабатывает на обычном тапе, длиннее —
	 * ощущается как зависший интерфейс. */
	const press_delay = 400

	/** Два отпускания на одном пузыре чаще этого — двойной тап, ответ. */
	const double_tap_delay = 350

	/** Предел большей стороны кадра в пузыре. Крупнее — и переписка
	 * превращается в ленту плакатов, где текста уже не видно. */
	const shot_side = 15

	/** Пикселей в одном rem: по нему понимаем, не мельче ли сама картинка
	 * отведённой ей коробки — растягивать мелкий кадр незачем. */
	const rem_px = 16

	/** Как часто перерисовывается таймер записи: чаще человек всё равно не
	 * заметит, а реже секунды начинают перескакивать через одну. */
	const clock_tick = 200

	/** Что показать под полем ввода, когда с записью не сложилось. Ни
	 * модалок, ни системных окон — одна строка на месте. */
	const voice_denied = 'Микрофон недоступен: разрешите запись в настройках браузера'
	const voice_short = 'Слишком коротко — запись отменена'

	export class $bog_gram extends $.$bog_gram {

		avatar_tint( lord: string ) {
			return $bog_gram_lord.tint( lord )
		}

		lord_short( lord: string ) {
			return $bog_gram_lord.short( lord )
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

		owner_me( id: string ) {
			return this.dialog_own( id )
		}

		admin_is( id: string, lord: string ) {
			return this.Talk().admin_is( id, lord )
		}

		@$mol_mem
		override archive_fresh() {
			return this.Talk().fresh_first( this.archive_ids() )
		}

		override request_is( id: string ) {
			return this.dialog_kind( id ) === 'request'
		}

		@$mol_action
		override dialog_archive( id: string, next?: any ) {
			this.Roster().archive( id )
			return null
		}

		@$mol_action
		override dialog_unarchive( id: string, next?: any ) {
			this.Roster().unarchive( id )
			return null
		}

		@$mol_action
		override request_accept( id: string, next?: any ) {
			if( !id ) return null
			this.peer_accept( this.dialog_owner( id ) )
			return null
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
			this.Alerts().offer()
			this.sound_hush()
			this.compose_opened( false )
			this.settings_opened( false )
			this.group_opened( false )
			this.members_opened( false )
			this.edit_id( '' )
			this.reply_id( '' )
			this.message_text( '' )
			this.message_menu( '' )
			this.zoom_id( '' )
			this.dialog_current( id )
			this.chat_bring()
			this.field_focus()
			this.chat_focus_reset( id )
			return null
		}

		/** Отметка прочтения после перезагрузки ещё едет, и пересчёт фокуса
		 * ждёт её. Тап по диалогу ждать не должен: решение досчитается само,
		 * когда отметка приедет. */
		chat_focus_reset( id: string ) {
			try {
				this.chat_focus( id, null )
			} catch( error ) {
				if( !$mol_promise_like( error ) ) $mol_fail_log( error )
			}
		}

		/** С мышью и клавиатурой открытый диалог сразу принимает текст. На
		 * сенсорном экране фокус вытащил бы клавиатуру на пол-экрана поверх
		 * переписки, которую человек открыл почитать. */
		field_focus() {
			if( !this.$.$mol_media.match( '(pointer: fine)' ) ) return
			new this.$.$mol_after_tick( ()=> {
				try {
					this.Chat_page().Message_field().focused( true )
				} catch( error ) {
					if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				}
			} )
		}

		/** Книга доводит страницу до края сама только когда та появляется
		 * впервые. При переходе между диалогами страница чата уже открыта и
		 * лишь меняет содержимое, поэтому на узком экране пользователь
		 * оставался на списке и дальше листал руками. Досылаем прокрутку
		 * после отрисовки, когда размеры страницы уже известны. */
		chat_bring() {
			this.page_bring( ()=> this.Chat_page() )
		}

		/** Новую страницу книга показывает сама. Ехать к ней отсюда можно
		 * только когда она уже стоит в книге: до отрисовки смещение у неё
		 * нулевое, и такая прокрутка сбивает прокрутку самой книги. */
		page_bring( target: ()=> $mol_view ) {
			new this.$.$mol_after_tick( ()=> {
				try {
					const book = this.dom_node() as HTMLElement
					const page = target().dom_node() as HTMLElement
					if( page.parentNode !== book ) return
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
			this.members_opened( false )
			this.dialog_current( '' )
			return null
		}

		@$mol_action
		override dialog_delete( id: string, next?: any ) {
			if( !id ) return null
			if( this.saved_is( id ) ) return null

			const active = this.dialog_current() === id
			this.Roster().drop( id )

			if( active ) {
				this.edit_id( '' )
				this.message_text( '' )
				this.dialog_current( '' )
			}

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
				if( next !== undefined ) this.Talk().group_title_set( id, next )
				return this.group_title( id )
			}
			const lord = this.chat_peer()
			if( !lord ) return ''
			if( next !== undefined ) this.People().note_set( lord, next )
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
			this.group_opened( false )
			this.compose_opened( open )
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
			return null
		}

		@$mol_action
		settings_close( next?: any ) {
			this.settings_opened( false )
			return null
		}

		override lights() {
			const theme = this.Theme()
			if( theme.mode() === 'system' ) return 'system'
			return theme.is_light_now() ? 'light' : 'dark'
		}

		override pages() {
			return [
				this.Menu(),
				... this.settings_opened() ? [ this.Settings_page() ] : [],
				... this.compose_opened() ? [ this.Compose_page() ] : [],
				... this.group_opened() ? [ this.Group_page() ] : [],
				... this.dialog_active() ? [ this.Chat_page() ] : [],
				... this.members_opened() && this.members_shown() ? [ this.Members_page() ] : [],
				... this.music_alive() ? [ this.Music_page() ] : [],
			]
		}

		override Placeholder() {
			return this.dialog_active() || this.music_opened() ? null! : super.Placeholder()
		}

		@$mol_mem
		music_opened( next?: boolean ) {
			return next ?? false
		}

		/** Фрейм музыки, убранный из документа, выгружается вместе с плеером,
		 * поэтому после первого открытия страница остаётся в книге и при
		 * закрытии только прячется: музыка играет дальше. */
		@$mol_mem
		music_alive( next?: boolean ) {
			return next ?? false
		}

		override music_hidden() {
			return !this.music_opened()
		}

		@$mol_action
		music_open( next?: any ) {
			const open = !this.music_opened()
			this.music_alive( true )
			this.music_opened( open )
			if( open ) this.page_bring( ()=> this.Music_page() )
			return null
		}

		@$mol_action
		music_close( next?: any ) {
			this.music_opened( false )
			return null
		}

		// ===== Создание диалога =====

		@$mol_action
		override dialog_open( lord: string, next?: any ) {
			if( !lord ) return null
			this.peer_accept( lord )
			const exist = this.dialog_with( lord )
			if( exist ) this.dialog_select( exist )
			else this.dialog_pending( lord )
			return null
		}

		@$mol_mem
		dialog_autocreate() {
			const peer = this.Invite().ready()
			if( peer ) $mol_wire_async( this ).dialog_create( peer )
			return peer
		}

		dialog_create( peer: string ) {

			const id = this.Roster().create( peer )
			if( !id ) return null

			this.dialog_current( id )
			this.compose_opened( false )
			this.dialog_pending( '' )
			this.Invite().done()
			this.chat_bring()

			return id
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
			return null
		}

		@$mol_action
		group_close( next?: any ) {
			this.group_opened( false )
			return null
		}

		@$mol_action
		override group_make( next?: any ) {
			const picked = this.group_picked()
			if( !picked.length ) return null
			$mol_wire_async( this ).group_create( this.group_name().trim(), picked, this.group_lost().length > 0 )
			return null
		}

		group_create( title: string, lords: readonly string[], forced: boolean ) {

			const id = this.Crew().draft_build( title, lords, forced )
			if( !id ) return ''

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
			return null
		}

		@$mol_action
		members_close( next?: any ) {
			this.members_opened( false )
			return null
		}

		@$mol_mem
		override member_lords() {
			const id = this.dialog_active()
			if( !id ) return [] as string[]
			return $bog_gram_soft( ()=> this.dialog_lords( id ), [] as string[] )
		}

		@$mol_mem_key
		override member_status( lord: string ) {
			const id = this.dialog_active()
			if( !id ) return ''
			if( this.dialog_owner( id ) === lord ) return 'создатель'
			return this.admin_is( id, lord ) ? 'админ' : ''
		}

		override members_admin() {
			return this.admin_me( this.dialog_active() )
		}

		override members_owner() {
			return this.owner_me( this.dialog_active() )
		}

		override member_admin( lord: string ) {
			return this.admin_is( this.dialog_active(), lord )
		}

		override members_asks() {
			return this.Lobby().asks_of( this.dialog_active() )
		}

		@$mol_mem
		override member_candidates() {
			const inside = new Set( this.member_lords() )
			return this.contact_lords().filter( lord => !inside.has( lord ) )
		}

		@$mol_action
		override member_add( lord: string, next?: any ) {
			const id = this.dialog_active()
			if( !id || !lord ) return null
			$mol_wire_async( this.Crew() ).join( id, lord, this.member_history() )
			return null
		}

		@$mol_action
		override member_drop( lord: string, next?: any ) {
			const id = this.dialog_active()
			if( !id || !lord ) return null
			$mol_wire_async( this.Crew() ).part( id, lord )
			return null
		}

		@$mol_action
		override member_raise( lord: string, next?: any ) {
			const id = this.dialog_active()
			if( !id || !lord ) return null
			$mol_wire_async( this.Crew() ).promote( id, lord )
			return null
		}

		@$mol_action
		override ask_accept( entry: string, next?: any ) {
			if( !entry ) return null
			$mol_wire_async( this.Lobby() ).apply( entry, this.member_history() )
			return null
		}

		@$mol_action
		override ask_reject( entry: string, next?: any ) {
			if( !entry ) return null
			$mol_wire_async( this.Lobby() ).deny( entry )
			return null
		}

		@$mol_action
		override group_leave( next?: any ) {
			const id = this.dialog_active()
			this.members_opened( false )
			this.dialog_delete( id )
			return null
		}

		// ===== Сообщения =====

		@$mol_mem
		messages() {
			return this.messages_alive_of( this.dialog_active() )
		}

		message_pawn( id: string ) {
			return this.messages().find( message => message.link().str === id ) ?? null
		}

		day_title( key: string ) {
			return $bog_gram_clock.day_title( key )
		}

		/** Лента чата: пузыри вперемешку с разделителями календарных дней. */
		@$mol_mem
		chat_rows() {
			let last_day = ''
			return this.messages().flatMap( message => {
				const day = $bog_gram_clock.day_key( Number( message.Moment()?.val() ?? 0 ) )
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
			return moment ? $bog_gram_clock.time( moment ) : ''
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
		tap_row = ''
		tap_at = 0

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
			if( next?.type === 'pointerup' && this.message_double_tap( id, Date.now() ) ) {
				this.$.$mol_dom_context.getSelection?.()?.removeAllRanges()
				this.message_reply( id )
			}
			return null
		}

		/** Двойной тап узнаём сами по двум отпусканиям подряд: dblclick на
		 * телефонах приходит не везде, а отпускание пальца — всегда. */
		message_double_tap( id: string, now: number ) {
			const double = this.tap_row === id && now - this.tap_at < double_tap_delay
			this.tap_row = double ? '' : id
			this.tap_at = double ? 0 : now
			return double
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

		@$mol_mem
		reply_id( next?: string ) {
			return next ?? ''
		}

		override reply_mode() {
			return Boolean( this.reply_id() ) && !this.edit_mode()
		}

		@$mol_action
		message_reply( id: string ) {
			this.message_menu( '' )
			if( this.edit_id() ) {
				this.edit_id( '' )
				this.message_text( '' )
			}
			this.reply_id( id )
			new this.$.$mol_after_tick( ()=> {
				try {
					this.Chat_page().Message_field().focused( true )
				} catch( error ) {
					if( !$mol_promise_like( error ) ) $mol_fail_log( error )
				}
			} )
			return null
		}

		@$mol_action
		reply_cancel( next?: any ) {
			this.reply_id( '' )
			return null
		}

		/** Кто написал сообщение, на которое отвечают: в цитате это видно
		 * и в переписке вдвоём, иначе непонятно, чьи слова процитированы. */
		quote_author( id: string ) {
			const lord = String( this.message_pawn( id )?.Author()?.val() ?? '' )
			if( !lord ) return ''
			if( lord === this.my_lord() ) return 'Вы'
			return this.peer_label( lord )
		}

		quote_text( id: string ) {
			const pawn = this.message_pawn( id )
			if( !pawn ) return ''
			const text = String( pawn.Text()?.val() ?? '' ).replace( /\s+/g, ' ' ).trim()
			if( text ) return text
			if( pawn.Image()?.val() ) return 'Фото'
			if( pawn.Voice()?.val() ) return 'Голосовое сообщение'
			return ''
		}

		override reply_title() {
			return 'Ответ ' + this.quote_author( this.reply_id() )
		}

		override reply_text() {
			return this.quote_text( this.reply_id() )
		}

		message_quote_id( id: string ) {
			const target = String( this.message_pawn( id )?.Reply()?.val() ?? '' )
			if( !target ) return ''
			return this.message_pawn( target ) ? target : ''
		}

		override Message_quote( id: string ) {
			return this.message_quote_id( id ) ? super.Message_quote( id ) : null!
		}

		override message_quote_author( id: string ) {
			return this.quote_author( this.message_quote_id( id ) )
		}

		override message_quote_text( id: string ) {
			return this.quote_text( this.message_quote_id( id ) )
		}

		@$mol_action
		message_quote_jump( id: string, next?: any ) {
			const target = this.message_quote_id( id )
			if( target ) ( this.Chat_page() as $$.$bog_gram_chat ).reveal( this.Message_row( target ), 'center' )
			return null
		}

		@$mol_action
		message_edit( id: string, next?: any ) {
			this.message_menu( '' )
			this.reply_id( '' )
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
			this.Alerts().offer()
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
			const reply = this.reply_id()
			if( reply ) message.Reply( 'auto' )?.val( reply )
			this.reply_id( '' )
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
			const passes = this.People().passes_of( mates )
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
			const passes = this.People().passes_of( mates )
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

		read_moment_of( id: string, lord: string ) {
			return this.Talk().read_moment_of( id, lord )
		}

		/** Первое непрочитанное чужое сообщение: его номер в ленте или -1, если читать нечего. */
		unread_first( list: readonly { moment: number, author: string }[], my: string, seen: number ) {
			return list.findIndex( item => item.author !== my && item.moment > seen )
		}

		/** С какого сообщения открыть диалог: с первого непрочитанного, а без них
		 * с конца (пустая строка). Решение запоминается до следующего открытия:
		 * отметка прочтения сдвигается сразу, и без этого лента тут же уехала бы вниз.
		 * Пока сообщений нет, решения нет (null), и запоминать нечего. */
		@$mol_mem_key
		chat_focus( id: string, reset?: null ): string | null {

			if( reset === undefined ) {
				const prev = $mol_wire_probe( ()=> this.chat_focus( id ) )
				if( typeof prev === 'string' ) return prev
			}

			if( !id ) return null

			const messages = this.messages_alive_of( id )
			if( !messages.length ) return null
			if( this.saved_is( id ) ) return ''

			const my = this.my_lord()
			const list = messages.map( message => ({
				moment: Number( message.Moment()?.val() ?? 0 ),
				author: String( message.Author()?.val() ?? '' ),
			}) )

			const index = this.unread_first( list, my, this.read_moment_of( id, my ) )
			return index < 0 ? '' : messages[ index ].link().str
		}

		override chat_dialog() {
			return this.dialog_active()
		}

		@$mol_mem
		override chat_focus_row() {
			const id = this.dialog_active()
			const focus = id ? this.chat_focus( id ) : null
			return focus ? this.Message_row( focus ) : null!
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
			if( id === this.dialog_active() ) return 0
			return this.unread_total( id )
		}

		// ===== Личная ссылка-приглашение =====

		@$mol_mem
		invite_handle() {
			const lord = this.Invite().lord()
			if( !lord ) return ''
			$mol_wire_async( this ).invite_accept( lord, this.Invite().key() )
			return lord
		}

		invite_accept( lord: string, key: string ) {
			const { plan, exist } = this.Invite().take( lord, key )
			if( plan === 'open' ) this.dialog_select( exist )
			return plan
		}

		// ===== Ссылка-приглашение в группу =====

		override join_link() {
			return this.Lobby().join_uri( this.dialog_active() )
		}

		@$mol_mem
		join_handle() {
			const id = this.Lobby().join_id()
			if( !id ) return ''
			$mol_wire_async( this ).join_request( id, this.Lobby().join_by() )
			return id
		}

		join_request( id: string, by: string ) {
			const plan = this.Lobby().join_take( id, by )
			if( plan === 'open' ) this.dialog_select( id )
			return plan
		}

		// ===== Автозапуск =====

		override auto() {
			super.auto()
			try { this.account_ready() } catch( error ) { $mol_fail_log( error ) }
			try { this.registry_remember() } catch( error ) { $mol_fail_log( error ) }
			try { this.registry_keys_fill() } catch( error ) { $mol_fail_log( error ) }
			try { this.invite_handle() } catch( error ) { $mol_fail_log( error ) }
			try { this.join_handle() } catch( error ) { $mol_fail_log( error ) }
			try { this.dialog_autocreate() } catch( error ) { $mol_fail_log( error ) }
			try { this.pending_timer() } catch( error ) { $mol_fail_log( error ) }
			try { this.notify_auto() } catch( error ) { $mol_fail_log( error ) }
			try { this.outbox_flush() } catch( error ) { $mol_fail_log( error ) }
			try { this.asks_flush() } catch( error ) { $mol_fail_log( error ) }
			try { this.denies_merge() } catch( error ) { $mol_fail_log( error ) }
			try { this.inbox_merge() } catch( error ) { $mol_fail_log( error ) }
			try { this.monitor_fill() } catch( error ) { $mol_fail_log( error ) }
			try { this.read_sync() } catch( error ) { $mol_fail_log( error ) }
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

		override Reply_banner() {
			return this.reply_mode() ? super.Reply_banner() : null!
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

		@$mol_mem
		focus_done( next?: string ) {
			return next ?? ''
		}

		@$mol_mem
		rows_seen( next?: number ) {
			return next ?? 0
		}

		/** Открытый диалог встаёт на первое непрочитанное, без них — на последнее
		 * сообщение; дальше лента едет вниз только за новыми сообщениями. Список
		 * ленивый: scrollHeight знает лишь отрисованную часть, поэтому к строке
		 * ведёт ensure_visible, он сам дорисует окно списка до неё. */
		override auto() {
			super.auto()
			try {

				this.stick_watch()

				const key = this.focus_key()
				if( !key ) {
					this.focus_done( '' )
					return
				}

				const rows = this.rows()
				if( !rows.length ) return

				const last = rows[ rows.length - 1 ]

				if( key !== this.focus_done() ) {
					const focus = this.focus_row()
					this.focus_done( key )
					this.rows_seen( rows.length )
					this.reveal( focus ?? last, focus ? 'start' : 'end' )
					return
				}

				if( rows.length > this.rows_seen() ) this.reveal( last, 'end' )
				this.rows_seen( rows.length )

			} catch( error ) {
				if( $mol_promise_like( error ) ) return
				$mol_fail_log( error )
			}
		}

		/** Первый показ строки после перезагрузки ждёт расшифровки ленда:
		 * ensure_visible приостанавливается, и без повтора лента оставалась
		 * наверху. Фибра доводит прокрутку, когда данные приедут. */
		reveal( row: $mol_view, align: ScrollLogicalPosition ) {
			this.stick_end( false )
			new this.$.$mol_after_tick( ()=> {
				$mol_wire_async( this ).ensure_visible( row, align )
					.then( ()=> this.stick_end( align === 'end' ) )
					.catch( $mol_fail_log )
			} )
		}

		@$mol_mem
		stick_end( next?: boolean ) {
			return next ?? false
		}

		/** Строки дорисовываются после прокрутки: тексты расшифровываются
		 * по одному, и лента растёт уже под открытым диалогом. Пока человек
		 * сам не ушёл вверх, держим её прижатой к последнему сообщению. */
		@$mol_mem
		stick_watch() {

			if( typeof ResizeObserver === 'undefined' ) return null

			const body = this.Body().dom_node() as HTMLElement
			const content = this.Body_content().dom_node() as HTMLElement

			let last = body.scrollTop

			const scrolled = ()=> {
				if( body.scrollTop < last - 4 ) this.stick_end( false )
				last = body.scrollTop
			}

			const observer = new ResizeObserver( ()=> {
				if( this.stick_end() ) body.scrollTop = body.scrollHeight
			} )

			observer.observe( content )
			body.addEventListener( 'scroll', scrolled, { passive: true } )

			return {
				destructor: ()=> {
					observer.disconnect()
					body.removeEventListener( 'scroll', scrolled )
				},
			}
		}

	}

}
