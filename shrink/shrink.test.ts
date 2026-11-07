namespace $ {

	$mol_test({

		'Большая сторона вписывается в предел с сохранением пропорций'() {
			$mol_assert_equal( $bog_gram_shrink.fit( 4000, 3000, 1600 ), { width: 1600, height: 1200 } )
			$mol_assert_equal( $bog_gram_shrink.fit( 3000, 4000, 1600 ), { width: 1200, height: 1600 } )
			$mol_assert_equal( $bog_gram_shrink.fit( 2000, 2000, 1600 ), { width: 1600, height: 1600 } )
		},

		'Кадр мельче предела не растягивается, узкая полоска не схлопывается'() {
			$mol_assert_equal( $bog_gram_shrink.fit( 320, 200, 1600 ), { width: 320, height: 200 } )
			$mol_assert_equal( $bog_gram_shrink.fit( 4000, 1, 1600 ), { width: 1600, height: 1 } )
		},

		'Картинкой считается только файл с типом image'() {
			$mol_assert_equal( $bog_gram_shrink.image_is( new $mol_blob( [], { type: 'image/webp' } ) ), true )
			$mol_assert_equal( $bog_gram_shrink.image_is( new $mol_blob( [], { type: 'text/plain' } ) ), false )
		},

	})

}
