namespace $.$$ {

	$mol_test({

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

		'Отпускание над крестиком отменяет запись, мимо него — нет'( $ ) {

			const chat = $bog_gram_chat.make({ $ })
			chat.cancel_rect = ()=> ({ left: 100, right: 200, top: 10, bottom: 50, width: 100, height: 40 })

			$mol_assert_equal( chat.voice_on_cancel( { clientX: 150, clientY: 30 } as PointerEvent ), true )
			$mol_assert_equal( chat.voice_on_cancel( { clientX: 250, clientY: 30 } as PointerEvent ), false )
			$mol_assert_equal( chat.voice_on_cancel( { clientX: 150, clientY: 60 } as PointerEvent ), false )
			$mol_assert_equal( chat.voice_on_cancel(), false )

		},

		'Кадр без размеров — квадрат на полный предел, а не точка'( $ ) {

			const session = $giper_baza_land.make({ $ }).Data( $bog_gram_session )

			const bare = session.Messages( 'auto' )!.make( null )
			const zero = session.Messages( 'auto' )!.make( null )
			zero.Image_width( 'auto' )?.val( 0 )
			zero.Image_height( 'auto' )?.val( 0 )
			const wide = session.Messages( 'auto' )!.make( null )
			wide.Image_width( 'auto' )?.val( 1600 )
			wide.Image_height( 'auto' )?.val( 1200 )

			const pawns = new Map( [ bare, zero, wide ].map( message => [ message.link().str, message ] ) )
			const chat = $bog_gram_chat.make({ $, message_pawn: ( id: string )=> pawns.get( id ) ?? null })

			for( const message of [ bare, zero ] ) {
				$mol_assert_equal( chat.message_shot_width( message.link().str ), '15.00rem' )
				$mol_assert_equal( chat.message_shot_ratio( message.link().str ), '240 / 240' )
			}

			$mol_assert_equal( chat.message_shot_width( wide.link().str ), '15.00rem' )
			$mol_assert_equal( chat.message_shot_ratio( wide.link().str ), '1600 / 1200' )

		},

		'Без ключа участника фото и голосовое не уходят молча, а называют, чей ключ не доехал'( $ ) {

			const session = $giper_baza_land.make({ $ }).Data( $bog_gram_session )
			const talk = $bog_gram_talk.make({ $, session: ()=> session, mates: ()=> [ 'LordKnown', 'LordLost' ], saved_is: ()=> false })
			const pass = {} as $giper_baza_auth_pass
			const people = $bog_gram_people.make({ $,
				pass_of: ( lord: string )=> lord === 'LordKnown' ? pass : null,
				label: ( lord: string )=> lord === 'LordLost' ? 'Борис' : 'Алиса',
			})
			const chat = $bog_gram_chat.make({ $, dialog: ()=> 'Dialog', Talk: ()=> talk, People: ()=> people })

			$mol_assert_equal( chat.image_send( new File( [], 'a.jpg', { type: 'image/jpeg' } ) ), '' )
			$mol_assert_equal( chat.voice_hint(), 'Фото не отправлено: не доехал ключ — Борис. Отправьте ещё раз чуть позже' )

			chat.voice_hint( '' )
			$mol_assert_equal( chat.voice_send( {} as $bog_gram_voice ), '' )
			$mol_assert_equal( chat.voice_hint(), 'Голосовое не отправлено: не доехал ключ — Борис. Отправьте ещё раз чуть позже' )

			$mol_assert_equal( session.Messages()?.items().length ?? 0, 0 )

		},

	})

}
