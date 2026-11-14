namespace $.$$ {

	$mol_test({

		'Избранное первым, архив и запросы входами по краям, пустой список говорит об этом'( $ ) {

			const empty = $bog_gram_menu.make({ $ })
			$mol_assert_equal( empty.dialog_rows(), [ empty.Saved_row(), empty.Dialogs_empty() ] )

			const full = $bog_gram_menu.make({ $,
				visible: ()=> [ 'A' ],
				archived: ()=> [ 'Z' ],
				requests: ()=> [ 'R' ],
			})
			$mol_assert_equal( full.dialog_rows(), [ full.Archive_row(), full.Saved_row(), full.Dialog_row( 'A' ), full.Requests_row() ] )

			full.archive_toggle()
			full.requests_toggle()
			$mol_assert_equal( full.dialog_rows(), [
				full.Archive_row(), full.Dialog_row( 'Z' ),
				full.Saved_row(), full.Dialog_row( 'A' ),
				full.Requests_row(), full.Dialog_row( 'R' ),
			] )

		},

		'Корзина удаляет со второго нажатия, другой клик снимает взвод'( $ ) {

			const dropped = [] as string[]
			const menu = $bog_gram_menu.make({ $, drop: ( id: string )=> { dropped.push( id ); return null } })

			menu.delete_click( 'A' )
			$mol_assert_equal( menu.delete_armed( 'A' ), true )
			$mol_assert_equal( menu.delete_hint( 'A' ), menu.delete_sure() )

			menu.archive_toggle()
			$mol_assert_equal( menu.delete_armed( 'A' ), false )

			menu.delete_click( 'A' )
			menu.delete_click( 'A' )
			$mol_assert_equal( dropped, [ 'A' ] )

		},

		'В строке запроса вместо архива и корзины согласие и отказ'( $ ) {

			const menu = $bog_gram_menu.make({ $, request_is: ( id: string )=> id === 'R' })

			$mol_assert_equal( menu.Dialog_archive( 'R' ), menu.Request_accept( 'R' ) )
			$mol_assert_equal( menu.Dialog_delete( 'R' ), menu.Request_reject( 'R' ) )
			$mol_assert_equal( menu.Dialog_archive( 'A' ) === menu.Request_accept( 'A' ), false )

		},

		'Непрочитанное в архиве складывается'( $ ) {

			const menu = $bog_gram_menu.make({ $,
				archived: ()=> [ 'X', 'Y' ],
				unread: ( id: string )=> id === 'X' ? 2 : 3,
			})

			$mol_assert_equal( menu.archive_unread_label(), '5' )
			$mol_assert_equal( menu.archive_note(), $.$bog_gram_count_dialogs( 2 ) )

		},

		'Открыта одна строка, тап по списку закрывает её вместо перехода'( $ ) {

			const picked = [] as string[]
			const menu = $bog_gram_menu.make({ $, select: ( id: string )=> { picked.push( id ); return null } })

			menu.Dialog_row( 'A' ).swipe_open( true )
			menu.Dialog_row( 'B' ).swipe_open( true )
			$mol_assert_equal( menu.Dialog_row( 'A' ).swipe_open(), false )
			$mol_assert_equal( menu.Dialog_row( 'B' ).swipe_open(), true )

			menu.pick( 'A' )
			$mol_assert_equal( menu.Dialog_row( 'B' ).swipe_open(), false )
			$mol_assert_equal( picked, [] )

			menu.pick( 'A' )
			$mol_assert_equal( picked, [ 'A' ] )

		},

		'Esc и клик мимо закрывают открытую строку, клик по ней самой — нет'( $ ) {

			const menu = $bog_gram_menu.make({ $ })
			const row = menu.Dialog_row( 'A' )
			row.dom_tree()

			row.swipe_open( true )
			menu.swipe_outside({ target: row.Info().dom_node() } as any )
			$mol_assert_equal( row.swipe_open(), true )

			menu.swipe_outside({ target: menu.Head().dom_node() } as any )
			$mol_assert_equal( row.swipe_open(), false )

			row.swipe_open( true )
			menu.swipe_key({ key: 'Enter' } as KeyboardEvent )
			$mol_assert_equal( row.swipe_open(), true )
			menu.swipe_key({ key: 'Escape' } as KeyboardEvent )
			$mol_assert_equal( row.swipe_open(), false )

		},

	})

}
