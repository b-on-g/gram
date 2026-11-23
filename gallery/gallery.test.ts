namespace $.$$ {

	$mol_test({

		'Листание на краях стоит на месте'() {

			const ids = [ 'a', 'b', 'c' ]

			$mol_assert_equal( $bog_gram_gallery.step( ids, 'b', 1 ), 'c' )
			$mol_assert_equal( $bog_gram_gallery.step( ids, 'b', -1 ), 'a' )
			$mol_assert_equal( $bog_gram_gallery.step( ids, 'c', 1 ), 'c' )
			$mol_assert_equal( $bog_gram_gallery.step( ids, 'a', -1 ), 'a' )

		},

		'Дописанный в конец кадр не сдвигает текущий, счётчик растёт'( $ ) {

			let ids = [ 'a', 'b' ]
			const gallery = $bog_gram_gallery.make({ $, ids: ()=> ids, counter_pattern: ()=> '{index} of {count}' })
			gallery.current( 'b' )

			$mol_assert_equal( gallery.counter(), '2 of 2' )
			$mol_assert_equal( gallery.Next(), null )

			ids = [ 'a', 'b', 'c' ]
			gallery.ids = ()=> ids

			$mol_assert_equal( gallery.current(), 'b' )
			$mol_assert_equal( gallery.counter(), '2 of 3' )

			gallery.next()
			$mol_assert_equal( gallery.current(), 'c' )

		},

		'Подгружаются только соседи текущего'( $ ) {

			const gallery = $bog_gram_gallery.make({ $, ids: ()=> [ 'a', 'b', 'c', 'd', 'e' ] })
			gallery.current( 'c' )

			$mol_assert_equal( gallery.slides(), [ gallery.Slide( 'b' ), gallery.Slide( 'c' ), gallery.Slide( 'd' ) ] )

		},

		'Отпущенный кадр перелистывается по порогу или скорости'() {

			$mol_assert_equal( $bog_gram_gallery.settle( -120, 0, 400 ), 1 )
			$mol_assert_equal( $bog_gram_gallery.settle( 120, 0, 400 ), -1 )
			$mol_assert_equal( $bog_gram_gallery.settle( -60, 0, 400 ), 0 )
			$mol_assert_equal( $bog_gram_gallery.settle( -20, -0.5, 400 ), 1 )
			$mol_assert_equal( $bog_gram_gallery.drop_settle( 60, 0, 800 ), false )
			$mol_assert_equal( $bog_gram_gallery.drop_settle( 200, 0, 800 ), true )
			$mol_assert_equal( $bog_gram_gallery.drop_settle( 30, 0.5, 800 ), true )

		},

		'Приближение держит точку под пальцем и не выпускает кадр за край'() {

			$mol_assert_equal( $bog_gram_gallery.pan_zoom( [ 0, 0 ], [ 50, -20 ], [ 50, -20 ], 2 ), [ -50, 20 ] )
			$mol_assert_equal( $bog_gram_gallery.pan_zoom( [ 0, 0 ], [ 50, 0 ], [ 60, 0 ], 1 ), [ 10, 0 ] )
			$mol_assert_equal( $bog_gram_gallery.pan_fit( [ 500, 500 ], 2, [ 400, 300 ], [ 400, 800 ] ), [ 200, 0 ] )
			$mol_assert_equal( $bog_gram_gallery.pan_fit( [ 30, 5 ], 1, [ 400, 300 ], [ 400, 800 ] ), [ 0, 0 ] )
			$mol_assert_equal( [ 0.5, 1.01, 3, 50 ].map( zoom => $bog_gram_gallery.zoom_fit( zoom ) ), [ 1, 1, 3, 6 ] )

		},

		'Двойной тап приближает и возвращает, у другого кадра своё приближение'( $ ) {

			const gallery = $bog_gram_gallery.make({
				$,
				ids: ()=> [ 'a', 'b' ],
				shot_size: ()=> [ 400, 300 ] as const,
				box_size: ()=> [ 400, 300 ] as const,
				point: ()=> [ 40, 0 ] as const,
			})
			gallery.current( 'a' )

			const tap = ( timeStamp: number )=> gallery.slide_tap( { timeStamp } as MouseEvent )

			tap( 0 )
			$mol_assert_equal( gallery.zoomed(), false )

			tap( 200 )
			$mol_assert_equal( gallery.view(), { id: 'a', zoom: 2.5, pan: [ -60, 0 ] } )

			gallery.next()
			$mol_assert_equal( gallery.zoomed(), false )

			gallery.prev()
			tap( 1000 )
			tap( 1200 )
			$mol_assert_equal( gallery.zoomed(), false )

		},

	})

}
