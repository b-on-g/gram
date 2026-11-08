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

	})

}
