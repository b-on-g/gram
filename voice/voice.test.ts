namespace $ {

	$mol_test({

		'Длительность показывается минутами и секундами, доли округляются'() {

			$mol_assert_equal( $bog_gram_voice.stamp( 0 ), '0:00' )
			$mol_assert_equal( $bog_gram_voice.stamp( 7 ), '0:07' )
			$mol_assert_equal( $bog_gram_voice.stamp( 59 ), '0:59' )
			$mol_assert_equal( $bog_gram_voice.stamp( 60 ), '1:00' )
			$mol_assert_equal( $bog_gram_voice.stamp( 125 ), '2:05' )
			$mol_assert_equal( $bog_gram_voice.stamp( 5 * 60 ), '5:00' )
			$mol_assert_equal( $bog_gram_voice.stamp( 7.4 ), '0:07' )
			$mol_assert_equal( $bog_gram_voice.stamp( 7.6 ), '0:08' )
			$mol_assert_equal( $bog_gram_voice.stamp( -5 ), '0:00' )

		},

	})

}
