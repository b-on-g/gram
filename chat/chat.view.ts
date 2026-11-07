namespace $.$$ {

	const press_delay = 400

	const double_tap_delay = 350

	const shot_side = 15

	const rem_px = 16

	const clock_tick = 200

	const voice_denied = 'Микрофон недоступен: разрешите запись в настройках браузера'

	const voice_short = 'Слишком коротко — запись отменена'

	export class $bog_gram_chat extends $.$bog_gram_chat {

		saved() {
			return this.Talk().saved_is( this.dialog() )
		}

		group() {
			return this.Talk().group_is( this.dialog() )
		}

		override title() {
			return this.Talk().title( this.dialog() )
		}

		@ $mol_mem
		peer() {
			if( this.saved() ) return ''
			if( this.group() ) return ''
			return this.Talk().peer( this.dialog() )
		}

		override note_editable() {
			if( this.group() ) return this.Talk().admin_me( this.dialog() )
			return Boolean( this.peer() )
		}

		override note_hint() {
			if( this.group() ) return this.Talk().group_name_auto( this.dialog() )
			const lord = this.peer()
			if( !lord ) return ''
			return this.People().name( lord ) || $bog_gram_lord.short( lord )
		}

		@ $mol_mem
		override note( next?: string ) {

			const id = this.dialog()

			if( this.group() ) {
				if( next !== undefined ) this.Talk().group_title_set( id, next )
				return this.Talk().group_title( id )
			}

			const lord = this.peer()
			if( !lord ) return ''

			if( next !== undefined ) this.People().note_set( lord, next )
			return this.People().note( lord )
		}

		override Note_field() {
			return this.note_editable() ? super.Note_field() : null!
		}

		override Title_text() {
			return this.note_editable() ? null! : super.Title_text()
		}

		override members_shown() {
			return this.group()
		}

		override Members() {
			return this.members_shown() ? super.Members() : null!
		}

		override Call() {
			return this.saved() ? null! : super.Call()
		}

		@ $mol_mem_key
		override message_call( id: string ) {
			return Boolean( this.message_pawn( id )?.Call()?.val() )
		}

		override message_call_land( id: string ) {
			const link = this.message_pawn( id )?.Call()?.val()
			return link ? this.$.$giper_baza_glob.Land( link ) : null
		}

		@ $mol_action
		override message_call_open( id: string, next?: any ) {
			const link = this.message_pawn( id )?.Call()?.val()
			if( link ) this.call_open( link.str )
			return null
		}

		@ $mol_action
		override call_start( next?: any ) {
			this.Alerts().offer()
			$mol_wire_async( this ).call_send()
			return null
		}

		call_send() {

			const session = this.Talk().session( this.dialog() )
			if( !session ) return ''

			const passes = this.passes()
			if( !passes ) return ''

			const land = this.$.$bog_gram_call_room.grab( passes )

			const message = session.Messages( 'auto' )!.make( null )
			message.Call( 'auto' )!.val( land.link() )
			message.Author( 'auto' )?.val( this.my_lord() )
			message.Moment( 'auto' )?.val( Date.now() )

			this.call_open( land.link().str )

			return message.link().str
		}

		messages() {
			return this.Talk().messages_of( this.dialog() )
		}

		@ $mol_mem
		messages_index() {
			return new Map( this.messages().map( ( message, index )=> [ message.link().str, index ] ) )
		}

		message_pawn( id: string ) {
			const index = this.messages_index().get( id )
			return index === undefined ? null : this.messages()[ index ]
		}

		message_dead( id: string ) {
			return Boolean( this.message_pawn( id )?.Deleted()?.val() )
		}

		message_alive( id: string ) {
			return Boolean( this.message_pawn( id ) ) && !this.message_dead( id )
		}

		message_day( id: string ) {
			return $bog_gram_clock.day_key( this.message_moment( id ) )
		}

		@ $mol_mem_key
		message_day_head( id: string ) {

			const day = this.message_day( id )
			if( !day ) return ''

			const messages = this.messages()
			for( let i = ( this.messages_index().get( id ) ?? 0 ) - 1; i >= 0; -- i ) {
				const prev = messages[ i ].link().str
				if( this.message_dead( prev ) ) continue
				return this.message_day( prev ) === day ? '' : day
			}

			return day
		}

		@ $mol_mem_key
		override line_content( id: string ) {
			if( !this.message_alive( id ) ) return []
			const day = this.message_day_head( id )
			return [ ... day ? [ this.Day_row( day ) ] : [], this.Bubble( id ) ]
		}

		message_lord( id: string ) {
			return String( this.message_pawn( id )?.Author()?.val() ?? '' )
		}

		message_moment( id: string ) {
			return Number( this.message_pawn( id )?.Moment()?.val() ?? 0 )
		}

		override day_title( key: string ) {
			return $bog_gram_clock.day_title( key )
		}

		@ $mol_mem
		override rows() {
			return this.messages().map( message => this.Line( message.link().str ) )
		}

		@ $mol_mem_key
		override message_body( id: string ) {
			return this.message_pawn( id )?.Text()?.val() ?? ''
		}

		@ $mol_mem_key
		override message_out( id: string ) {
			return this.message_lord( id ) === this.my_lord()
		}

		@ $mol_mem_key
		override message_time( id: string ) {
			const moment = this.message_moment( id )
			return moment ? $bog_gram_clock.time( moment ) : ''
		}

		@ $mol_mem_key
		override message_edited( id: string ) {
			return Boolean( this.message_pawn( id )?.Edited()?.val() )
		}

		read_tally( reads: Readonly< Record< string, number > >, mates: readonly string[], moment: number ) {
			return mates.filter( lord => ( reads[ lord ] ?? 0 ) >= moment ).length
		}

		@ $mol_mem_key
		override message_checks( id: string ) {

			if( !this.message_out( id ) ) return ''
			if( this.saved() ) return ''

			const dialog = this.dialog()
			const moment = this.message_moment( id )

			if( this.group() ) {

				const mates = $bog_gram_soft( ()=> this.Talk().mates( dialog ), [] as readonly string[] )
				if( !mates.length ) return ''

				const reads: Record< string, number > = {}
				for( const lord of mates ) reads[ lord ] = this.Talk().read_moment_of( dialog, lord )

				return 'Прочитали ' + this.read_tally( reads, mates, moment ) + ' из ' + mates.length

			}

			const peer = this.Talk().peer( dialog )
			if( !peer ) return '✓'

			return this.Talk().read_moment_of( dialog, peer ) >= moment ? '✓✓' : '✓'
		}

		@ $mol_mem_key
		override message_author( id: string ) {
			if( this.message_out( id ) ) return ''
			if( !this.group() ) return ''
			const lord = this.message_lord( id )
			return lord ? this.People().label( lord ) : ''
		}

		@ $mol_mem_key
		override message_author_tint( id: string ) {
			const lord = this.message_lord( id )
			return lord ? $bog_gram_lord.tint( lord ) : 0
		}

		@ $mol_mem_key
		override message_menu_is( id: string ) {
			return this.message_menu() === id
		}

		press_timer: $mol_after_timeout | null = null
		press_row = ''
		press_held = false
		tap_row = ''
		tap_at = 0

		press_stop() {
			this.press_timer?.destructor()
			this.press_timer = null
		}

		@ $mol_action
		override message_press( id: string, next?: Event ) {

			this.press_stop()
			this.press_row = id
			this.press_held = false

			if( !this.message_out( id ) ) return null

			this.press_timer = new this.$.$mol_after_timeout( press_delay, ()=> this.message_hold( id ) )

			return null
		}

		@ $mol_action
		message_hold( id: string ) {
			this.press_timer = null
			this.press_held = true
			this.message_menu( id )
			return null
		}

		@ $mol_action
		override message_release( id: string, next?: Event ) {

			const held = this.press_held && this.press_row === id

			this.press_stop()
			this.press_held = false

			if( held ) return null

			if( this.message_menu() === id ) this.message_menu( '' )
			if( next?.type === 'pointerup' && this.message_double_tap( id, Date.now() ) ) this.message_reply( id )

			return null
		}

		message_double_tap( id: string, now: number ) {
			const double = this.tap_row === id && now - this.tap_at < double_tap_delay
			this.tap_row = double ? '' : id
			this.tap_at = double ? 0 : now
			return double
		}

		@ $mol_action
		override message_context( id: string, next?: Event ) {

			if( !this.message_out( id ) ) return null

			next?.preventDefault()

			this.press_stop()
			this.press_held = true
			this.message_menu( id )

			return null
		}

		override edit_mode() {
			return Boolean( this.edit_id() )
		}

		override reply_mode() {
			return Boolean( this.reply_id() ) && !this.edit_mode()
		}

		override Edit_banner() {
			return this.edit_mode() ? super.Edit_banner() : null!
		}

		override Reply_banner() {
			return this.reply_mode() ? super.Reply_banner() : null!
		}

		@ $mol_mem
		field_focus() {
			if( !this.$.$mol_media.match( '(pointer: fine)' ) ) return false
			this.Message_field().bring()
			return true
		}

		@ $mol_action
		message_reply( id: string ) {

			this.message_menu( '' )

			if( this.edit_id() ) {
				this.edit_id( '' )
				this.message_text( '' )
			}

			this.reply_id( id )
			this.Message_field().bring()

			return null
		}

		@ $mol_action
		override reply_cancel( next?: any ) {
			this.reply_id( '' )
			return null
		}

		quote_author( id: string ) {
			const lord = this.message_lord( id )
			if( !lord ) return ''
			if( lord === this.my_lord() ) return 'Вы'
			return this.People().label( lord )
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
			return this.message_alive( target ) ? target : ''
		}

		override message_quote_shown( id: string ) {
			return Boolean( this.message_quote_id( id ) )
		}

		override message_quote_author( id: string ) {
			return this.quote_author( this.message_quote_id( id ) )
		}

		override message_quote_text( id: string ) {
			return this.quote_text( this.message_quote_id( id ) )
		}

		@ $mol_action
		override message_quote_jump( id: string, next?: any ) {
			const target = this.message_quote_id( id )
			if( target ) this.reveal( this.Line( target ), 'center' )
			return null
		}

		@ $mol_action
		override message_edit( id: string, next?: any ) {
			this.message_menu( '' )
			this.reply_id( '' )
			this.edit_id( id )
			this.message_text( this.message_body( id ) )
			return null
		}

		@ $mol_action
		override edit_cancel( next?: any ) {
			this.edit_id( '' )
			this.message_text( '' )
			return null
		}

		@ $mol_action
		override message_delete( id: string, next?: any ) {

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

		@ $mol_action
		override message_send( next?: any ) {

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

			const session = this.Talk().session( this.dialog() )
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

		@ $mol_mem_key
		override message_shot( id: string ) {
			return Boolean( this.message_pawn( id )?.Image()?.val() )
		}

		@ $mol_mem_key
		message_shot_size( id: string ) {

			const pawn = this.message_pawn( id )
			const width = Number( pawn?.Image_width()?.val() ?? 0 )
			const height = Number( pawn?.Image_height()?.val() ?? 0 )

			if( !width || !height ) return { width: 1, height: 1 }

			return { width, height }
		}

		@ $mol_mem_key
		override message_shot_ratio( id: string ) {
			const size = this.message_shot_size( id )
			return size.width + ' / ' + size.height
		}

		@ $mol_mem_key
		override message_shot_width( id: string ) {
			const size = this.message_shot_size( id )
			const side = Math.max( size.width, size.height )
			const limit = Math.min( shot_side, side / rem_px )
			return ( limit * size.width / side ).toFixed( 2 ) + 'rem'
		}

		file_uri( file: $giper_baza_file | null | undefined ) {
			if( !file ) return ''
			if( !file.buffer().byteLength ) return ''
			return this.$.$mol_dom_context.URL.createObjectURL( file.blob() )
		}

		@ $mol_mem_key
		override message_shot_uri( id: string ) {
			return $bog_gram_soft( ()=> this.file_uri( this.message_pawn( id )?.Image()?.remote() ), '' )
		}

		override zoom_uri() {
			const id = this.zoom_id()
			if( !id ) return ''
			return this.message_shot_uri( id )
		}

		@ $mol_action
		override message_zoom( id: string, next?: any ) {
			if( this.message_menu() === id ) return null
			if( !this.message_shot_uri( id ) ) return null
			this.zoom_id( id )
			return null
		}

		@ $mol_action
		override zoom_close( next?: any ) {
			this.zoom_id( '' )
			return null
		}

		override sub() {
			if( !this.zoom_uri() ) return super.sub()
			return [ ... super.sub(), this.Zoom() ]
		}

		@ $mol_action
		override image_files( next?: readonly File[] ) {
			const file = ( next ?? [] ).find( item => this.$.$bog_gram_shrink.image_is( item ) )
			if( file ) this.image_start( file )
			return next ?? null
		}

		@ $mol_action
		override image_paste( next?: Event ) {

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

		@ $mol_action
		override image_over( next?: Event ) {
			next?.preventDefault()
			return null
		}

		@ $mol_action
		override image_drop( next?: Event ) {

			const event = next as DragEvent | undefined
			event?.preventDefault()

			const files = event?.dataTransfer?.files
			if( !files ) return null

			const file = Array.from( files ).find( item => this.$.$bog_gram_shrink.image_is( item ) )
			if( file ) this.image_start( file )

			return null
		}

		image_start( file: File ) {

			if( this.edit_id() ) {
				this.edit_id( '' )
				this.message_text( '' )
			}

			$mol_wire_async( this ).image_send( file )
		}

		passes() {
			const mates = this.saved() ? [] : this.Talk().mates( this.dialog() )
			const passes = this.People().passes_of( mates )
			return passes.length < mates.length ? null : passes
		}

		land_closed( bytes: Uint8Array< ArrayBuffer >, type: string, passes: readonly $giper_baza_auth_pass[] ) {

			const land = this.$.$giper_baza_glob.land_grab([ [ null, $giper_baza_rank_deny ] ])

			const store = land.Data( $giper_baza_file )
			store.buffer( bytes )
			store.type( type )

			for( const pass of passes ) land.give( pass, $giper_baza_rank_read )

			land.sync()

			return store
		}

		image_send( file: File ) {

			const session = this.Talk().session( this.dialog() )
			if( !session ) return ''

			const passes = this.passes()
			if( !passes ) return ''

			const shot = this.$.$bog_gram_shrink.shrink( file )
			const store = this.land_closed( shot.bytes, shot.type, passes )

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

		override voice_ready() {
			return this.$.$bog_gram_voice.supported()
		}

		voice_live: $bog_gram_voice | null = null

		override voice_on() {
			return Boolean( this.voice_start() )
		}

		@ $mol_mem
		override voice_clock() {
			const start = this.voice_start()
			if( !start ) return ''
			const now = this.$.$mol_state_time.now( clock_tick )
			return this.$.$bog_gram_voice.stamp( ( now - start ) / 1000 )
		}

		override Voice_note() {
			return this.voice_hint() ? super.Voice_note() : null!
		}

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

		@ $mol_mem
		override send_tools() {
			if( this.voice_on() ) return [ this.Record_state(), this.Voice_cancel(), this.Voice() ]
			return [ this.Attach(), this.Message_field(), this.Send(), this.Voice() ]
		}

		@ $mol_action
		override voice_press( next?: Event ) {

			if( this.voice_live ) return null
			if( !this.voice_ready() ) return null

			const take = this.$.$bog_gram_voice.make({
				filled: ()=> this.voice_finish(),
			})

			this.voice_live = take
			this.voice_hint( '' )
			this.voice_start( Date.now() )

			$mol_wire_async( this ).voice_open( take )

			return null
		}

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

		@ $mol_mem
		cancel_rect() {
			if( !this.voice_on() ) return null
			return this.Voice_cancel().view_rect()
		}

		voice_on_cancel( next?: Event ) {

			const event = next as PointerEvent | undefined
			if( event?.clientX === undefined ) return false

			const rect = this.cancel_rect()
			if( !rect ) return false

			if( event.clientX < rect.left || event.clientX > rect.right ) return false
			if( event.clientY < rect.top || event.clientY > rect.bottom ) return false

			return true
		}

		@ $mol_action
		override voice_release( next?: Event ) {
			if( !this.voice_live ) return null
			if( this.voice_on_cancel( next ) ) return this.voice_cancel()
			return this.voice_finish()
		}

		@ $mol_action
		voice_finish() {

			const take = this.voice_live
			if( !take ) return null

			this.voice_live = null
			this.voice_start( 0 )
			take.stop()

			$mol_wire_async( this ).voice_send( take )

			return null
		}

		@ $mol_action
		override voice_cancel( next?: any ) {
			const take = this.voice_live
			this.voice_live = null
			this.voice_start( 0 )
			take?.drop()
			return null
		}

		voice_send( take: $bog_gram_voice ) {

			const session = this.Talk().session( this.dialog() )
			if( !session ) return ''

			const passes = this.passes()
			if( !passes ) return ''

			const sound = $mol_wire_sync( take ).take()
			if( !sound ) {
				this.voice_hint( voice_short )
				return ''
			}

			const store = this.land_closed( sound.bytes, sound.type, passes )
			const message = session.Messages( 'auto' )!.make( null )

			message.Voice( 'auto' )!.remote( store )
			message.Voice_span( 'auto' )?.val( sound.span )
			message.Author( 'auto' )?.val( this.my_lord() )
			message.Moment( 'auto' )?.val( Date.now() )

			this.voice_hint( '' )

			return message.link().str
		}

		@ $mol_mem_key
		override message_sound( id: string ) {
			return Boolean( this.message_pawn( id )?.Voice()?.val() )
		}

		@ $mol_mem_key
		override message_sound_span( id: string ) {
			return Number( this.message_pawn( id )?.Voice_span()?.val() ?? 0 )
		}

		@ $mol_mem_key
		override message_sound_uri( id: string ) {
			return $bog_gram_soft( ()=> this.file_uri( this.message_pawn( id )?.Voice()?.remote() ), '' )
		}

		@ $mol_mem_key
		override message_sound_playing( id: string ) {
			return this.voice_playing() === id
		}

		bubble( id: string ) {
			return this.Bubble( id ) as $.$$.$bog_gram_bubble
		}

		@ $mol_action
		override message_sound_toggle( id: string, next?: any ) {

			const now = this.voice_playing()
			if( now ) this.bubble( now ).sound_stop()

			if( now === id || !this.message_sound_uri( id ) ) {
				this.voice_playing( '' )
				return null
			}

			this.voice_playing( id )
			this.bubble( id ).sound_start()

			return null
		}

		@ $mol_action
		override message_sound_ended( id: string, next?: any ) {
			if( this.voice_playing() === id ) this.voice_playing( '' )
			return null
		}

		unread_first( messages: readonly $bog_gram_message[], my: string, seen: number ) {

			let found = ''

			for( let i = messages.length - 1; i >= 0; -- i ) {
				const message = messages[ i ]
				if( Number( message.Moment()?.val() ?? 0 ) <= seen ) break
				if( message.Deleted()?.val() ) continue
				if( String( message.Author()?.val() ?? '' ) !== my ) found = message.link().str
			}

			return found
		}

		@ $mol_mem
		focus(): string | null {

			const prev = $mol_wire_probe( ()=> this.focus() )
			if( typeof prev === 'string' ) return prev

			const messages = this.messages()
			if( !messages.length ) return null
			if( this.saved() ) return ''

			const my = this.my_lord()

			return this.unread_first( messages, my, this.Talk().read_moment_of( this.dialog(), my ) )
		}

		@ $mol_mem
		read_sync() {

			if( this.saved() ) return 0
			if( !this.$.$bog_gram_awake.active() ) return 0

			const id = this.dialog()
			const my = this.my_lord()

			const messages = this.messages()

			let last = 0
			for( let i = messages.length - 1; i >= 0; -- i ) {
				if( String( messages[ i ].Author()?.val() ?? '' ) === my ) continue
				if( messages[ i ].Deleted()?.val() ) continue
				last = Number( messages[ i ].Moment()?.val() ?? 0 )
				break
			}
			if( !last ) return 0

			const seen = this.Talk().read_moment_of( id, my )
			if( seen >= last ) return seen

			this.Talk().session( id )?.Reads( 'auto' )?.key( my, 'auto' )?.Moment( 'auto' )?.val( last )

			return last
		}

		follow() {

			const rows = this.rows()
			if( !rows.length ) return

			const last = rows[ rows.length - 1 ]

			if( !this.rows_seen() ) {
				const focus = this.focus()
				const row = focus ? this.Line( focus ) : last
				this.rows_seen( rows.length )
				this.reveal( row, focus ? 'start' : 'end' )
				return
			}

			if( rows.length > this.rows_seen() ) this.reveal( last, 'end' )
			this.rows_seen( rows.length )
		}

		reveal( row: $mol_view, align: ScrollLogicalPosition ) {
			this.stick_end( false )
			new this.$.$mol_after_tick( ()=> {
				$mol_wire_async( this ).ensure_visible( row, align )
					.then( ()=> this.stick_end( align === 'end' ) )
					.catch( $mol_fail_log )
			} )
		}

		@ $mol_mem
		stick_watch(): number {
			const top = this.Body().scroll_top()
			const last = $mol_wire_probe( ()=> this.stick_watch() ) ?? top
			if( top < last - 4 ) this.stick_end( false )
			return top
		}

		@ $mol_mem
		content_height() {
			return this.Body_content().view_rect()?.height ?? 0
		}

		@ $mol_mem
		stick_hold() {
			const height = this.content_height()
			if( !height ) return 0
			if( !this.stick_end() ) return 0
			return this.Body().scroll_top( height )
		}

		override auto() {
			super.auto()
			$bog_gram_soft( ()=> this.read_sync(), 0 )
			$bog_gram_soft( ()=> this.field_focus(), false )
			$bog_gram_soft( ()=> this.stick_watch(), 0 )
			$bog_gram_soft( ()=> this.stick_hold(), 0 )
			$bog_gram_soft( ()=> this.cancel_rect(), null )
			$bog_gram_soft( ()=> this.follow(), undefined )
		}

	}

}
