namespace $ {

	$mol_test({

		'Заголовок дня и время сообщения форматируются по-человечески'() {

			const now = new Date()

			$mol_assert_equal( $bog_gram_clock.day_title( now.toDateString() ), 'Сегодня' )
			$mol_assert_equal( $bog_gram_clock.day_title( new Date( now.getTime() - 24 * 60 * 60 * 1000 ).toDateString() ), 'Вчера' )
			$mol_assert_equal( $bog_gram_clock.day_title( '' ), '' )
			$mol_assert_equal( $bog_gram_clock.day_title( new Date( 2020, 0, 15 ).toDateString() ).includes( '2020' ), true )

			$mol_assert_equal( $bog_gram_clock.time( new Date( 2020, 0, 15, 9, 5 ).getTime() ), '09:05' )
			$mol_assert_equal( $bog_gram_clock.time( new Date( 2020, 0, 15, 23, 59 ).getTime() ), '23:59' )

		},

		'В списке сегодняшнее показывается временем, прошлое — датой'() {

			const now = new Date()
			const today = new Date( now.getFullYear(), now.getMonth(), now.getDate(), 9, 5 ).getTime()

			$mol_assert_equal( $bog_gram_clock.brief( today ), '09:05' )
			$mol_assert_equal( $bog_gram_clock.brief( new Date( 2020, 0, 15, 9, 5 ).getTime() ), '15.01' )
			$mol_assert_equal( $bog_gram_clock.brief( 0 ), '' )

		},

	})

}
