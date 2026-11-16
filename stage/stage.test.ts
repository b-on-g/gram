namespace $ {

	$mol_test({

		'Кадр камеры режется в квадрат по середине'() {

			$mol_assert_equal( $bog_gram_stage.crop( 640, 480 ), { left: 80, top: 0, side: 480 } )
			$mol_assert_equal( $bog_gram_stage.crop( 480, 640 ), { left: 0, top: 80, side: 480 } )
			$mol_assert_equal( $bog_gram_stage.crop( 480, 480 ), { left: 0, top: 0, side: 480 } )

		},

	})

}
