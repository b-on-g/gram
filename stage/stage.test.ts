namespace $ {

	$mol_test({

		'Кадр камеры режется в квадрат по середине'() {

			$mol_assert_equal( $bog_gram_stage.crop( 640, 480 ), { left: 80, top: 0, side: 480 } )
			$mol_assert_equal( $bog_gram_stage.crop( 480, 640 ), { left: 0, top: 80, side: 480 } )
			$mol_assert_equal( $bog_gram_stage.crop( 480, 480 ), { left: 0, top: 0, side: 480 } )

		},

		'Фронтальная камера пишется зеркально, как в превью: икс разворачивается от правого края'() {

			const point = ( matrix: readonly number[], x: number )=> matrix[0] * x + matrix[4]

			const mirror = $bog_gram_stage.flip( true, 480 )
			$mol_assert_equal( point( mirror, 0 ), 480 )
			$mol_assert_equal( point( mirror, 480 ), 0 )
			$mol_assert_equal( point( mirror, 100 ), 380 )

			const plain = $bog_gram_stage.flip( false, 480 )
			$mol_assert_equal( point( plain, 100 ), 100 )

		},

	})

}
