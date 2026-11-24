namespace $.$$ {

	$mol_test({

		'Открытый десктопный чат фокусирует поле сообщения'( $ ) {

			let focused = 0
			const chat = $bog_gram_chat.make({ $ })
			const match = chat.$.$mol_media.match
			chat.Message_field = ()=> ({ bring: ()=> ++ focused }) as any
			chat.$.$mol_media.match = ()=> true

			chat.read_sync = ()=> 0
			chat.stick_hold = ()=> 0
			chat.follow = ()=> undefined
			chat.stick_observer = ()=> null
			chat.auto()

			$mol_assert_equal( focused, 1 )
			chat.$.$mol_media.match = match

		},

		'Чужое новое сообщение не срывает прокрутку вниз, своё возвращает к низу'( $ ) {

			const ids = [ 'a', 'b' ]
			const chat = $bog_gram_chat.make({ $ })
			chat.messages = ()=> ids.map( id => ({ link: ()=> ({ str: id }) }) ) as any
			chat.rows = ()=> ids.map( id => chat.Line( id ) )
			chat.message_out = ( id: string )=> id === 'mine'
			chat.focus = ()=> 'a'
			chat.reveal = ()=> {}

			chat.follow()
			chat.stick_end( false )

			ids.push( 'theirs' )
			chat.follow()
			$mol_assert_equal( chat.stick_end(), false )

			ids.push( 'mine' )
			chat.follow()
			$mol_assert_equal( chat.stick_end(), true )

		},

		'Последним считается последнее живое сообщение'( $ ) {

			const chat = $bog_gram_chat.make({ $ })
			chat.messages = ()=> [ 'a', 'b', 'dead' ].map( id => ({ link: ()=> ({ str: id }) }) ) as any
			chat.message_alive = ( id: string )=> id !== 'dead'

			$mol_assert_equal( chat.message_last( 'a' ), false )
			$mol_assert_equal( chat.message_last( 'b' ), true )
			$mol_assert_equal( chat.message_last( 'dead' ), false )

		},

		'Смена автора раздвигает сообщения, удалённые и новый день не в счёт'( $ ) {

			const lords: Record< string, string > = { a: 'Me', b: 'Me', dead: 'Peer', c: 'Me', d: 'Peer', e: 'Me' }
			const chat = $bog_gram_chat.make({ $ })
			chat.messages = ()=> Object.keys( lords ).map( id => ({ link: ()=> ({ str: id }) }) ) as any
			chat.message_dead = ( id: string )=> id === 'dead'
			chat.message_lord = ( id: string )=> lords[ id ]
			chat.message_day = ( id: string )=> id === 'e' ? '2026-01-02' : '2026-01-01'

			$mol_assert_equal( chat.message_turn( 'a' ), false )
			$mol_assert_equal( chat.message_turn( 'b' ), false )
			$mol_assert_equal( chat.message_turn( 'dead' ), false )
			$mol_assert_equal( chat.message_turn( 'c' ), false )
			$mol_assert_equal( chat.message_turn( 'd' ), true )
			$mol_assert_equal( chat.message_turn( 'e' ), false )

		},

		'Прилипание снимает только прокрутка вверх, а не смена высоты'( $ ) {

			const chat = $bog_gram_chat.make({ $ })

			chat.stick_track( 500, 1000, 500 )
			$mol_assert_equal( chat.stick_end(), true )

			chat.stick_track( 450, 1100, 500 )
			$mol_assert_equal( chat.stick_end(), true )

			chat.stick_track( 600, 1100, 500 )
			chat.stick_track( 520, 1100, 560 )
			$mol_assert_equal( chat.stick_end(), true )

			chat.stick_track( 518, 1100, 560 )
			$mol_assert_equal( chat.stick_end(), false )

			chat.stick_track( 518, 1200, 560 )
			chat.stick_track( 530, 1200, 560 )
			$mol_assert_equal( chat.stick_end(), false )

			chat.stick_track( 640, 1200, 560 )
			$mol_assert_equal( chat.stick_end(), true )

		},

		'Открывается с первого непрочитанного чужого сообщения'( $ ) {

			const chat = $bog_gram_chat.make({ $ })
			const session = $giper_baza_land.make({ $ }).Data( $bog_gram_session )

			const write = ( moment: number, author: string )=> {
				const message = session.Messages( 'auto' )!.make( null )
				message.Moment( 'auto' )?.val( moment )
				message.Author( 'auto' )?.val( author )
				return message
			}

			const list = [
				write( 1000, 'Peer' ),
				write( 2000, 'Me' ),
				write( 3000, 'Peer' ),
				write( 4000, 'Peer' ),
			]

			const id = ( index: number )=> list[ index ].link().str

			$mol_assert_equal( chat.unread_first( list, 'Me', 2000 ), id( 2 ) )
			$mol_assert_equal( chat.unread_first( list.slice( 0, 2 ), 'Me', 1000 ), '' )
			$mol_assert_equal( chat.unread_first( list, 'Me', 4000 ), '' )
			$mol_assert_equal( chat.unread_first( list, 'Me', 0 ), id( 0 ) )

			list[ 2 ].Deleted( 'auto' )?.val( 5000 )
			$mol_assert_equal( chat.unread_first( list, 'Me', 2000 ), id( 3 ) )

		},

		'Ответ вызывается двумя тапами по одному пузырю, а не по разным'( $ ) {

			const chat = $bog_gram_chat.make({ $ })

			$mol_assert_equal( chat.message_double_tap( 'a', 1000 ), false )
			$mol_assert_equal( chat.message_double_tap( 'a', 1200 ), true )
			$mol_assert_equal( chat.message_double_tap( 'a', 1300 ), false )
			$mol_assert_equal( chat.message_double_tap( 'b', 1400 ), false )
			$mol_assert_equal( chat.message_double_tap( 'b', 2000 ), false )

		},

		'В группе вместо галочек — сколько человек прочитало'( $ ) {

			const chat = $bog_gram_chat.make({ $ })

			const mates = [ 'LordA', 'LordB', 'LordC' ]
			const reads = { LordA: 3000, LordB: 1000, LordC: 0 }

			$mol_assert_equal( chat.read_tally( reads, mates, 1000 ), 2 )
			$mol_assert_equal( chat.read_tally( reads, mates, 3000 ), 1 )
			$mol_assert_equal( chat.read_tally( reads, mates, 4000 ), 0 )
			$mol_assert_equal( chat.read_tally( { ... reads, LordGone: 9000 }, mates, 3000 ), 1 )
			$mol_assert_equal( chat.read_tally( {}, mates, 1000 ), 0 )
			$mol_assert_equal( chat.read_tally( reads, [], 1000 ), 0 )

		},

		'Свайп влево отменяет запись, вверх закрепляет, мелкая дрожь пальца — ничего'() {

			const from = { x: 300, y: 500 }
			const shift = ( dx: number, dy: number )=> $bog_gram_chat_record_shift( from, { clientX: from.x + dx, clientY: from.y + dy } )

			$mol_assert_equal( shift( -120, 0 ), 'cancel' )
			$mol_assert_equal( shift( -120, -30 ), 'cancel' )
			$mol_assert_equal( shift( 0, -90 ), 'lock' )
			$mol_assert_equal( shift( -20, -90 ), 'lock' )
			$mol_assert_equal( shift( -40, -20 ), '' )
			$mol_assert_equal( shift( 150, 0 ), '' )
			$mol_assert_equal( shift( 0, 150 ), '' )

		},

		'Короткий тап по микрофону переключает на кружок и обратно, удержание начинает запись'( $ ) {

			const chat = $bog_gram_chat.make({ $ })
			chat.voice_ready = ()=> true
			chat.$.$bog_gram_voice = class extends $bog_gram_voice {
				static override supported() { return true }
			} as any

			const begun = [] as string[]
			chat.record_begin = ()=> { begun.push( chat.record_mode() ); return null }

			const mode = chat.record_mode()

			chat.voice_press( { clientX: 0, clientY: 0 } as PointerEvent )
			chat.voice_release()
			$mol_assert_equal( chat.record_mode(), mode === 'voice' ? 'round' : 'voice' )

			chat.voice_press( { clientX: 0, clientY: 0 } as PointerEvent )
			chat.voice_release()
			$mol_assert_equal( chat.record_mode(), mode )
			$mol_assert_equal( begun, [] )

			chat.voice_press( { clientX: 0, clientY: 0 } as PointerEvent )
			chat.tap_timer!.task()
			$mol_assert_equal( begun, [ mode ] )

		},

		'Черновик живёт у своего диалога, переживает перезагрузку и уходит с отправкой'( $ ) {

			const session = $giper_baza_land.make({ $ }).Data( $bog_gram_session )
			const talk = $bog_gram_talk.make({ $, session: ()=> session, saved_is: ()=> false })
			const alerts = $bog_gram_alerts.make({ $, offer: ()=> false })
			const page = ( dialog: string )=> $bog_gram_chat.make({ $, dialog: ()=> dialog, my_lord: ()=> 'LordMe', Talk: ()=> talk, Alerts: ()=> alerts })

			const first = page( 'DialogA' )
			first.message_text( 'Недописанное' )

			$mol_assert_equal( page( 'DialogB' ).message_text(), '' )
			$mol_assert_equal( page( 'DialogA' ).message_text(), 'Недописанное' )

			const own = session.Messages( 'auto' )!.make( null )
			own.Text( 'auto' )?.val( 'Старое' )
			first.message_pawn = ()=> own

			first.message_edit( own.link().str )
			$mol_assert_equal( first.message_text(), 'Старое' )
			first.edit_cancel()
			$mol_assert_equal( first.message_text(), 'Недописанное' )

			const reload = page( 'DialogA' )
			reload.message_send()
			$mol_assert_equal( page( 'DialogA' ).message_text(), '' )

		},

		'Текст длиннее лимита не уходит, черновик остаётся и под полем видно превышение'( $ ) {

			const session = $giper_baza_land.make({ $ }).Data( $bog_gram_session )
			const talk = $bog_gram_talk.make({ $, session: ()=> session, saved_is: ()=> false })
			const alerts = $bog_gram_alerts.make({ $, offer: ()=> false })
			const chat = $bog_gram_chat.make({ $, dialog: ()=> 'DialogLong', my_lord: ()=> 'LordMe', Talk: ()=> talk, Alerts: ()=> alerts, text_over_pattern: ()=> '{over}/{limit}' })

			const long = 'я'.repeat( 4100 )
			chat.message_text( long )

			$mol_assert_equal( chat.send_enabled(), false )
			$mol_assert_equal( chat.voice_note_text(), '4/4096' )

			chat.message_send()
			$mol_assert_equal( session.Messages()?.items().length ?? 0, 0 )
			$mol_assert_equal( chat.message_text(), long )

			chat.message_text( 'я'.repeat( 4096 ) )
			$mol_assert_equal( chat.send_enabled(), true )
			chat.message_send()

			const sent = ( session.Messages()!.items() as readonly $giper_baza_link[] )
				.map( link => session.land().Pawn( $bog_gram_message ).Head( link.head() ) )
			$mol_assert_equal( sent.length, 1 )
			$mol_assert_equal( sent[0].Text()?.val()?.length, 4096 )
			$mol_assert_equal( sent[0].Author()?.val(), 'LordMe' )
			$mol_assert_equal( chat.message_text(), '' )

		},

		'Набор, стили, форма, отмена и очистка поля не трогают Базу: ни home-ленд, ни какой другой'( $ ) {

			const touched = [] as string[]
			const touch = ( what: string )=> { touched.push( what ); return $mol_fail( new Error( `Поле полезло в Базу: ${ what }` ) ) }

			const context = $.$mol_ambient({
				$giper_baza_land: class extends $giper_baza_land {
					static override make(): any { return touch( 'land' ) }
				},
				$giper_baza_glob: class extends $giper_baza_glob {
					static override home(): any { return touch( 'home' ) }
					static override Land(): any { return touch( 'Land' ) }
					static override land_grab(): any { return touch( 'land_grab' ) }
				},
				$giper_baza_auth: class extends $giper_baza_auth {
					static override current(): any { return touch( 'auth' ) }
				},
			})

			const chat = $bog_gram_chat.make({ $: context, dialog: ()=> 'DialogSafe', my_lord: ()=> 'LordMe' })
			const field = chat.Message_field() as $.$$.$bog_rich_edit
			field.dom_tree()

			field.write( 0, 0, 'черновик' )
			field.selection({ anchor: 0, focus: 8 })
			for( const type of [ ... $bog_rich_toggles, 'blockquote', 'pre' ] as const ) {
				field.format_apply( type as any )
				field.format_apply( type as any )
			}
			field.format_apply( 'bold' )
			field.link_open()
			field.link_url( 'ya.ru' )
			field.link_apply()
			field.date_open()
			field.menu_close()
			field.undo()
			field.redo()

			$mol_assert_equal( chat.message_content().entities.map( mark => mark.type ), [ 'text_link', 'bold' ] )
			$mol_assert_equal( field.Content().dom_node().textContent, 'черновик' )

			chat.message_text( '' )
			field.dom_tree()
			$mol_assert_equal( field.Content().dom_node().textContent, '' )
			$mol_assert_equal( touched, [] )

		},

		'Старое сообщение с разметкой прежнего вида читается простым текстом'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const old = land.Data( $giper_baza_dict.with({ Text: $giper_baza_atom_text, Html: $giper_baza_atom_text }) )
			old.Text( 'auto' )!.val( 'старое' )
			old.Html( 'auto' )!.val( '<p><strong>старое</strong></p>' )

			const chat = $bog_gram_chat.make({ $, dialog: ()=> 'DialogOld', my_lord: ()=> 'LordMe', message_pawn: ()=> land.Data( $bog_gram_message ) })
			$mol_assert_equal( chat.message_rich( 'x' ), { text: 'старое', entities: [] } )

		},

		'Скрытое не видно в цитате ответа'( $ ) {

			const message = $giper_baza_land.make({ $ }).Data( $bog_gram_message )
			$bog_gram_markup_write( message, { text: 'убийца дворецкий', entities: [ { type: 'spoiler', offset: 7, length: 9 } ] } )

			const chat = $bog_gram_chat.make({ $, dialog: ()=> 'DialogHide', my_lord: ()=> 'LordMe', message_pawn: ()=> message })
			$mol_assert_equal( chat.quote_text( 'x' ), 'убийца ▒▒▒▒' )

		},

		'Форматированное сообщение уходит со стилями и текстом для старых клиентов, простое — только текстом'( $ ) {

			const session = $giper_baza_land.make({ $ }).Data( $bog_gram_session )
			const talk = $bog_gram_talk.make({ $, session: ()=> session, saved_is: ()=> false })
			const alerts = $bog_gram_alerts.make({ $, offer: ()=> false })
			const chat = $bog_gram_chat.make({ $, dialog: ()=> 'DialogRich', my_lord: ()=> 'LordMe', Talk: ()=> talk, Alerts: ()=> alerts })

			const sent = ()=> ( session.Messages()!.items() as readonly $giper_baza_link[] )
				.map( link => session.land().Pawn( $bog_gram_message ).Head( link.head() ) )
				.map( $bog_gram_markup_read )

			const rich: $bog_rich_content = { text: 'очень важно\nвторое', entities: [ { type: 'bold', offset: 6, length: 5 } ] }
			chat.message_content( rich )
			$mol_assert_equal( chat.message_text(), 'очень важно\nвторое' )
			chat.message_send()

			chat.message_text( 'просто' )
			chat.message_send()

			$mol_assert_equal( sent(), [
				rich,
				{ text: 'просто', entities: [] },
			] )
			$mol_assert_equal( chat.message_text(), '' )

			const link = ( session.Messages()!.items() as readonly $giper_baza_link[] )[0]
			const pawn = session.land().Pawn( $bog_gram_message ).Head( link.head() )
			chat.message_pawn = ()=> pawn
			chat.message_edit( link.str )
			$mol_assert_equal( chat.message_content(), rich )
			chat.edit_cancel()
			$mol_assert_equal( chat.message_text(), '' )

		},

		'Удержание кружка открывает камеру без записи, запись начинается кнопкой'( $ ) {

			const chat = $bog_gram_chat.make({ $ })
			chat.record_mode = ()=> 'round'

			const calls = [] as string[]
			chat.$.$bog_gram_voice = class extends $bog_gram_voice {
				override open() { calls.push( 'open:' + this.face() ); return Promise.resolve( true ) }
				override record() { calls.push( 'record' ); return true }
			} as any
			chat.voice_open = ( take: $bog_gram_voice )=> { take.open(); return true }
			chat.record_facing( 'environment' )

			chat.record_begin()
			$mol_assert_equal( chat.record_phase(), 'aim' )
			$mol_assert_equal( calls, [ 'open:environment' ] )

			chat.voice_release()
			$mol_assert_equal( chat.record_phase(), 'aim' )

			chat.record_go()
			$mol_assert_equal( chat.record_phase(), 'locked' )
			$mol_assert_equal( calls, [ 'open:environment', 'record' ] )

			chat.voice_cancel()
			chat.record_facing( 'user' )

		},

		async 'Запись, оборванная перезагрузкой, возвращается черновиком в свой чат'( $ ) {

			const chat = $bog_gram_chat.make({ $, dialog: ()=> 'DialogA', record_revived: ()=> 'restored' })

			const take = $bog_gram_voice.make({ $, kind: ()=> 'round', dialog: ()=> 'DialogA' })
			take.asked = true
			take.done({ bytes: new Uint8Array([ 1, 2, 3 ]), type: 'video/mp4', span: 18, wave: '' })

			chat.record_restore( take )
			$mol_assert_equal( chat.record_phase(), 'review' )
			$mol_assert_equal( chat.voice_hint(), 'restored' )

			await take.take()
			await new Promise( done => setTimeout( done ) )

			$mol_assert_equal( chat.record_draft()?.kind, 'round' )
			$mol_assert_equal( chat.draft_span(), 18 )

			const other = $bog_gram_voice.make({ $, kind: ()=> 'voice', dialog: ()=> 'DialogA' })
			chat.record_restore( other )
			$mol_assert_equal( chat.voice_live, take )

		},

		'Старое сообщение с одним кадром — альбом из одного, кадр без размеров — квадрат'( $ ) {

			const session = $giper_baza_land.make({ $ }).Data( $bog_gram_session )
			const picture = $giper_baza_land.make({ $ }).link()

			const bare = session.Messages( 'auto' )!.make( null )
			const zero = session.Messages( 'auto' )!.make( null )
			zero.Image_width( 'auto' )?.val( 0 )
			zero.Image_height( 'auto' )?.val( 0 )
			const wide = session.Messages( 'auto' )!.make( null )
			wide.Image_width( 'auto' )?.val( 1600 )
			wide.Image_height( 'auto' )?.val( 1200 )
			const text = session.Messages( 'auto' )!.make( null )

			for( const message of [ bare, zero, wide ] ) message.Image( 'auto' )!.val( picture )

			const pawns = new Map( [ bare, zero, wide, text ].map( message => [ message.link().str, message ] ) )
			const chat = $bog_gram_chat.make({ $, message_pawn: ( id: string )=> pawns.get( id ) ?? null })

			for( const message of [ bare, zero ] ) {
				const id = message.link().str
				$mol_assert_equal( chat.message_shots( id ), [ id + '/0' ] )
				$mol_assert_equal( chat.message_shot_width( id ), '15.00rem' )
				$mol_assert_equal( chat.shot_ratio( id + '/0' ), 1 )
			}

			$mol_assert_equal( chat.message_shot_width( wide.link().str ), '30.00rem' )
			$mol_assert_equal( chat.shot_ratio( wide.link().str + '/0' ), 4 / 3 )
			$mol_assert_equal( chat.message_shots( text.link().str ), [] )

		},

		'Адрес вложения не копится: докачка пересоздаёт его, а прежний отзывается'( $ ) {

			const made = [] as string[]
			const revoked = [] as string[]

			const context = $.$mol_ambient({
				$mol_dom_context: Object.assign( Object.create( $.$mol_dom_context ), {
					URL: {
						createObjectURL: ()=> { made.push( 'blob:' + made.length ); return made[ made.length - 1 ] },
						revokeObjectURL: ( url: string )=> { revoked.push( url ) },
					},
				} ),
			})

			const file = $giper_baza_land.make({ $: context }).Data( $giper_baza_file )
			const chat = $bog_gram_chat.make({ $: context })
			const watch = new $mol_wire_atom( 'watch', ()=> chat.file_uri( file ) )

			try {

				$mol_assert_equal( watch.sync(), '' )

				for( let chunks = 1; chunks <= 5; ++ chunks ) {
					file.buffer( new Uint8Array( chunks * 2 ** 15 ).fill( chunks ) )
					$mol_assert_equal( watch.sync(), made[ made.length - 1 ] )
				}

				$mol_assert_equal( made.length, 5 )
				$mol_assert_equal( revoked, made.slice( 0, -1 ) )

			} finally {
				watch.destructor()
			}

		},

		async 'Несколько фото уходят одним сообщением-альбомом по порядку выбора, без ключа — ни одного'( $ ) {

			const later = {
				async tick( name: string ) {
					await Promise.resolve()
					return name
				},
			}

			const context = $.$mol_ambient({
				$bog_gram_shrink: class extends $bog_gram_shrink {
					static override shrink( file: Blob ) {
						const name = $mol_wire_sync( later ).tick( ( file as File ).name )
						return { bytes: new Uint8Array([ 1 ]), type: 'image/png', width: Number( name ), height: 1 }
					}
				},
			})

			const file = ( name: string )=> new File( [], name, { type: 'image/png' } )

			const page = async ( saved: boolean, lost: boolean )=> {
				const session = ( await $mol_wire_async( $.$giper_baza_glob ).land_grab() ).Data( $bog_gram_session )
				const talk = $bog_gram_talk.make({ $: context, session: ()=> session, mates: ()=> saved ? [] : [ 'LordLost' ], saved_is: ()=> saved })
				const people = $bog_gram_people.make({ $: context, pass_of: ()=> lost ? null : {} as $giper_baza_auth_pass, label: ()=> 'Борис' })
				const chat = $bog_gram_chat.make({ $: context, lost_pattern: ()=> '{what}: no key for {names}', kind_photo: ()=> 'Photo', kind_voice: ()=> 'Voice', kind_round: ()=> 'Round', call_lost_pattern: ()=> 'Call: no key for {names}', dialog: ()=> 'Dialog', my_lord: ()=> 'LordMe', Talk: ()=> talk, People: ()=> people })
				chat.land_closed = ()=> $giper_baza_land.make({ $ }).Data( $giper_baza_file )
				const widths = ()=> ( session.Messages()?.remote_list() ?? [] ).map( message => [
					message.Image_width()?.val(),
					( message.Shots()?.remote_list() ?? [] ).map( shot => shot.Width()?.val() ),
				] )
				return { chat, widths }
			}

			const sent = await page( true, false )
			await sent.chat.images_start([ file( '1' ), new File( [], 'notes.txt', { type: 'text/plain' } ), file( '2' ), file( '3' ) ])
			$mol_assert_equal( sent.widths(), [ [ 1, [ 1, 2, 3 ] ] ] )

			const lost = await page( false, true )
			let hints = 0
			const hint = lost.chat.voice_hint.bind( lost.chat )
			lost.chat.voice_hint = ( next?: string )=> {
				if( next ) ++ hints
				return hint( next )
			}
			await lost.chat.images_start([ file( '1' ), file( '2' ), file( '3' ) ])
			$mol_assert_equal( lost.widths(), [] )
			$mol_assert_equal( hints, 1 )
			$mol_assert_equal( lost.chat.voice_hint(), 'Photo: no key for Борис' )

		},

		async 'Вложенный скриншот ждёт подписи и уходит с ней по кнопке отправки'( $ ) {

			const context = $.$mol_ambient({
				$bog_gram_shrink: class extends $bog_gram_shrink {
					static override shrink( file: Blob ) {
						return { bytes: new Uint8Array([ 1 ]), type: 'image/png', width: 2, height: 1 }
					}
				},
			})

			const session = ( await $mol_wire_async( $.$giper_baza_glob ).land_grab() ).Data( $bog_gram_session )
			const talk = $bog_gram_talk.make({ $: context, session: ()=> session, mates: ()=> [], saved_is: ()=> true })
			const people = $bog_gram_people.make({ $: context })
			const alerts = $bog_gram_alerts.make({ $: context, offer: ()=> false })
			const chat = $bog_gram_chat.make({ $: context, dialog: ()=> 'DialogShot', my_lord: ()=> 'LordMe', Talk: ()=> talk, People: ()=> people, Alerts: ()=> alerts })
			chat.land_closed = ()=> $giper_baza_land.make({ $ }).Data( $giper_baza_file )

			const messages = ()=> session.Messages()?.remote_list() ?? []

			let held = false
			chat.attach_hold({ preventDefault: ()=> { held = true } } as unknown as Event )
			$mol_assert_equal( held, true )

			chat.image_files([ new File( [], 'shot.png', { type: 'image/png' } ), new File( [], 'notes.txt', { type: 'text/plain' } ) ])
			$mol_assert_equal( chat.pending().length, 1 )
			$mol_assert_equal( messages().length, 0 )
			$mol_assert_equal( chat.send_enabled(), true )

			chat.message_text( 'вот баг' )
			await chat.pending_send()

			$mol_assert_equal( chat.pending().length, 0 )
			$mol_assert_equal( messages().map( message => [ message.Text()?.val(), message.Image_width()?.val() ] ), [ [ 'вот баг', 2 ] ] )
			$mol_assert_equal( chat.message_text(), '' )

		},

		'Без ключа участника фото и голосовое не уходят молча, а называют, чей ключ не доехал'( $ ) {

			const session = $giper_baza_land.make({ $ }).Data( $bog_gram_session )
			const talk = $bog_gram_talk.make({ $, session: ()=> session, mates: ()=> [ 'LordKnown', 'LordLost' ], saved_is: ()=> false })
			const pass = {} as $giper_baza_auth_pass
			const people = $bog_gram_people.make({ $,
				pass_of: ( lord: string )=> lord === 'LordKnown' ? pass : null,
				label: ( lord: string )=> lord === 'LordLost' ? 'Борис' : 'Алиса',
			})
			const chat = $bog_gram_chat.make({ $, lost_pattern: ()=> '{what}: no key for {names}', kind_photo: ()=> 'Photo', kind_voice: ()=> 'Voice', kind_round: ()=> 'Round', call_lost_pattern: ()=> 'Call: no key for {names}', dialog: ()=> 'Dialog', Talk: ()=> talk, People: ()=> people })

			$mol_assert_equal( chat.image_send( new File( [], 'a.jpg', { type: 'image/jpeg' } ) ), '' )
			$mol_assert_equal( chat.voice_hint(), 'Photo: no key for Борис' )

			chat.voice_hint( '' )
			$mol_assert_equal( chat.voice_send( { kind: ()=> 'voice' } as $bog_gram_voice ), '' )
			$mol_assert_equal( chat.voice_hint(), 'Voice: no key for Борис' )

			chat.voice_hint( '' )
			$mol_assert_equal( chat.voice_send( { kind: ()=> 'round' } as $bog_gram_voice ), '' )
			$mol_assert_equal( chat.voice_hint(), 'Round: no key for Борис' )

			$mol_assert_equal( session.Messages()?.items().length ?? 0, 0 )

		},

		'Без ключа участника звонок не начинается молча, а называет, чей ключ не доехал'( $ ) {

			const session = $giper_baza_land.make({ $ }).Data( $bog_gram_session )
			const talk = $bog_gram_talk.make({ $, session: ()=> session, mates: ()=> [ 'LordKnown', 'LordLost' ], saved_is: ()=> false })
			const pass = {} as $giper_baza_auth_pass
			const people = $bog_gram_people.make({ $,
				pass_of: ( lord: string )=> lord === 'LordKnown' ? pass : null,
				label: ( lord: string )=> lord === 'LordLost' ? 'Борис' : 'Алиса',
			})
			let opened = 0
			const chat = $bog_gram_chat.make({ $, lost_pattern: ()=> '{what}: no key for {names}', kind_photo: ()=> 'Photo', kind_voice: ()=> 'Voice', kind_round: ()=> 'Round', call_lost_pattern: ()=> 'Call: no key for {names}', dialog: ()=> 'Dialog', Talk: ()=> talk, People: ()=> people, call_open: ()=> ++ opened })

			$mol_assert_equal( chat.call_send(), '' )
			$mol_assert_equal( chat.voice_hint(), 'Call: no key for Борис' )
			$mol_assert_equal( session.Messages()?.items().length ?? 0, 0 )
			$mol_assert_equal( opened, 0 )

		},

	})

}
