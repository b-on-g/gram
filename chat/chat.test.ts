namespace $.$$ {

	$mol_test({

		'Открывается с первого непрочитанного чужого сообщения'( $ ) {

			const chat = $bog_gram_chat.make({ $ })

			const list = [
				{ moment: 1000, author: 'Peer' },
				{ moment: 2000, author: 'Me' },
				{ moment: 3000, author: 'Peer' },
				{ moment: 4000, author: 'Peer' },
			]

			$mol_assert_equal( chat.unread_first( list, 'Me', 2000 ), 2 )
			$mol_assert_equal( chat.unread_first( list.slice( 0, 2 ), 'Me', 1000 ), -1 )
			$mol_assert_equal( chat.unread_first( list, 'Me', 4000 ), -1 )
			$mol_assert_equal( chat.unread_first( list, 'Me', 0 ), 0 )

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

	})

}
