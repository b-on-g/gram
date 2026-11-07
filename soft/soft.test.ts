namespace $ {

	$mol_test({

		'Ожидание заменяется запасным значением, готовое отдаётся как есть'() {

			const wait = new Promise( ()=> {} )

			$mol_assert_equal( $bog_gram_soft( ()=> { throw wait }, 'запас' ), 'запас' )
			$mol_assert_equal( $bog_gram_soft( ()=> 'готово', 'запас' ), 'готово' )

		},

	})

}
