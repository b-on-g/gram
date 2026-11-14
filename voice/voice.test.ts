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

		'Волна — столбики пиков по отрезкам, громкий отрезок в самый верх, тишина в ноль'() {

			const samples = [ 0, 0.1, -0.5, 0.2, 0, 0, 1, -0.25 ]
			const code = $bog_gram_voice.wave_code( samples, 4 )

			$mol_assert_equal( code.length, 4 )
			$mol_assert_equal( $bog_gram_voice.wave_levels( code ).map( level => Math.round( level * 100 ) ), [ 10, 52, 0, 100 ] )
			$mol_assert_equal( $bog_gram_voice.wave_code( [ 0, 0, 0, 0 ], 2 ), '00' )
			$mol_assert_equal( $bog_gram_voice.wave_code( [] ), '' )

		},

	})

}
