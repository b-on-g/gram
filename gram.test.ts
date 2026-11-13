namespace $.$$ {

	$mol_test({

		async 'Тап по диалогу открывает его сразу'( $ ) {

			const app = $bog_gram.make({ $ })

			await $mol_wire_async( app ).dialog_select( 'dialog' )

			$mol_assert_equal( app.dialog_current(), 'dialog' )

		},

		'Полоса отмечает панель, которая перед глазами'( $ ) {

			const app = $bog_gram.make({ $ })
			const frames = [ [ 0, 390 ], [ 390, 390 ], [ 780, 390 ] ] as const

			$mol_assert_equal( app.page_at( frames, 195 ), 0 )
			$mol_assert_equal( app.page_at( frames, 390 + 195 ), 1 )
			$mol_assert_equal( app.page_at( frames, 780 + 195 ), 2 )
			$mol_assert_equal( app.page_at( frames, 5000 ), 2 )

		},

		'Пока все панели влезают, полосы нет'( $ ) {

			const app = $bog_gram.make({ $ })
			app.pages_overflow = ()=> false

			$mol_assert_equal( app.pager_count(), 0 )

		},

		'Настройки открываются по ссылке'( $ ) {

			const app = $bog_gram.make({ $ })

			$mol_assert_equal( app.settings_opened(), false )

			app.settings_open()
			$mol_assert_equal( app.settings_opened(), true )

			app.settings_close()
			$mol_assert_equal( app.settings_opened(), false )

		},

		'Музыка открывается по ссылке и остаётся в книге после закрытия'( $ ) {

			const app = $bog_gram.make({ $ })

			$mol_assert_equal( app.music_opened(), false )
			$mol_assert_equal( app.music_alive(), false )

			app.music_open()
			$mol_assert_equal( app.music_opened(), true )
			$mol_assert_equal( app.music_alive(), true )
			$mol_assert_equal( app.music_hidden(), false )

			app.music_close()
			$mol_assert_equal( app.music_opened(), false )
			$mol_assert_equal( app.music_alive(), true )
			$mol_assert_equal( app.music_hidden(), true )

		},

		'Ссылка на настройки разбирается как ссылка Gram'() {
			$mol_assert_equal(
				$bog_gram_follow.params( 'https://b-on-g.github.io/gram/#!settings' ),
				{ settings: '' },
			)
		},

		'Ссылка на музыку разбирается как ссылка Gram'() {
			$mol_assert_equal(
				$bog_gram_follow.params( 'https://b-on-g.github.io/gram/#!music' ),
				{ music: '' },
			)
		},

	})

}
