namespace $.$$ {

	$mol_test({

		'Открытый десктопный чат фокусирует поле сообщения'( $ ) {

			let outer_focused = 0
			let edit_focused = 0
			const chat = $bog_gram_chat.make({ $ })
			const match = chat.$.$mol_media.match
			chat.Message_field = ()=> ({
				bring: ()=> ++ outer_focused,
				Edit: ()=> ({ bring: ()=> ++ edit_focused }),
			}) as any
			chat.$.$mol_media.match = ()=> true

			chat.read_sync = ()=> 0
			chat.stick_watch = ()=> 0
			chat.stick_hold = ()=> 0
			chat.follow = ()=> undefined
			chat.auto()

			$mol_assert_equal( outer_focused, 0 )
			$mol_assert_equal( edit_focused, 1 )
			chat.$.$mol_media.match = match

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

		'Старое сообщение с одним кадром — альбом из одного, кадр без размеров — квадрат на полный предел'( $ ) {

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

			$mol_assert_equal( chat.message_shot_width( wide.link().str ), '15.00rem' )
			$mol_assert_equal( chat.shot_ratio( wide.link().str + '/0' ), 4 / 3 )
			$mol_assert_equal( chat.message_shots( text.link().str ), [] )

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
