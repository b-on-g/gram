namespace $.$$ {

	$mol_test({

		'Отпущенная строка доезжает по порогу или по скорости'( $ ) {

			const row = $bog_gram_row.make({ $ })

			$mol_assert_equal( row.swipe_settle( 70, 0, 120 ), true )
			$mol_assert_equal( row.swipe_settle( 50, 0, 120 ), false )
			$mol_assert_equal( row.swipe_settle( 20, 0.5, 120 ), true )
			$mol_assert_equal( row.swipe_settle( 100, -0.5, 120 ), false )

		},

		'Направление решают первые пиксели, вертикаль и шаг назад отдаются прокрутке'( $ ) {

			const row = $bog_gram_row.make({ $ })

			$mol_assert_equal( row.swipe_axis( 3, 2, 0 ), 'wait' )
			$mol_assert_equal( row.swipe_axis( 12, 3, 0 ), 'drag' )
			$mol_assert_equal( row.swipe_axis( 4, 12, 0 ), 'skip' )
			$mol_assert_equal( row.swipe_axis( -12, 3, 0 ), 'skip' )
			$mol_assert_equal( row.swipe_axis( -12, 3, 120 ), 'drag' )

		},

		'Открытая строка сдвинута на ширину кнопок, тянущаяся — на палец'( $ ) {

			const row = $bog_gram_row.make({ $ })
			row.swipe_width = 120

			$mol_assert_equal( row.swipe_shift(), 0 )

			row.swipe_open( true )
			$mol_assert_equal( row.swipe_shift(), 120 )

			row.swipe_drag( 40 )
			$mol_assert_equal( row.swipe_shift(), 40 )
			$mol_assert_equal( row.swipe_dragging(), true )

		},

	})

}
