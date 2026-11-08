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

		'Мышь тянет строку как палец, клик после тяги гасится, без тяги открывает'( $ ) {

			let clicks = 0
			const row = $bog_gram_row.make({ $,
				swipe: ()=> true,
				tools: ()=> [ new $mol_view ],
				click: ()=> { ++ clicks; return null },
			})
			row.swipe_measure = ()=> { row.swipe_width = 120 }

			const at = ( x: number, time: number )=> ({ pointerType: 'mouse', button: 0, pointerId: 1, clientX: x, clientY: 10, timeStamp: time }) as PointerEvent

			row.swipe_start( at( 0, 0 ) )
			for( let x = 4; x <= 100; x += 4 ) row.swipe_move( at( x, x * 10 ) )
			row.swipe_end( at( 100, 1000 ) )
			$mol_assert_equal( row.swipe_open(), true )

			row.event_activate( {} as Event )
			$mol_assert_equal( clicks, 0 )

			row.swipe_start( at( 50, 2000 ) )
			row.swipe_end( at( 50, 2010 ) )
			row.event_activate( {} as Event )
			$mol_assert_equal( clicks, 1 )

		},

		'Тачпад: горизонтальная прокрутка двигает строку, вертикальная и шаг влево у закрытой — нет'( $ ) {

			const row = $bog_gram_row.make({ $,
				swipe: ()=> true,
				tools: ()=> [ new $mol_view ],
			})
			row.swipe_measure = ()=> { row.swipe_width = 120 }

			let stopped = 0
			const wheel = ( deltaX: number, deltaY: number )=> row.swipe_wheel({ deltaX, deltaY, preventDefault: ()=> { ++ stopped } } as WheelEvent )

			for( let i = 0; i < 10; ++ i ) wheel( 0, 10 )
			row.swipe_wheel_end()
			$mol_assert_equal( stopped, 0 )
			$mol_assert_equal( row.swipe_open(), false )

			for( let i = 0; i < 10; ++ i ) wheel( 10, 1 )
			row.swipe_wheel_end()
			$mol_assert_equal( stopped, 0 )
			$mol_assert_equal( row.swipe_open(), false )

			for( let i = 0; i < 10; ++ i ) wheel( -8, 1 )
			$mol_assert_equal( row.swipe_shift(), 80 )
			row.swipe_wheel_end()
			$mol_assert_equal( row.swipe_open(), true )
			$mol_assert_equal( stopped > 0, true )

			for( let i = 0; i < 10; ++ i ) wheel( 8, 0 )
			row.swipe_wheel_end()
			$mol_assert_equal( row.swipe_open(), false )

		},

		'Фокус клавиатуры на кнопке открывает строку'( $ ) {

			const row = $bog_gram_row.make({ $,
				swipe: ()=> true,
				tools: ()=> [ new $mol_view ],
			})
			row.swipe_measure = ()=> { row.swipe_width = 120 }

			row.swipe_focus({ target: row.Info().dom_node() } as any )
			$mol_assert_equal( row.swipe_open(), false )

			row.swipe_focus({ target: row.Tools().dom_node() } as any )
			$mol_assert_equal( row.swipe_open(), true )

		},

	})

}
