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

	})

}
