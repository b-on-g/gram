namespace $ {

	function message_make( $: $ ) {
		const session = $giper_baza_land.make({ $ }).Data( $bog_gram_session )
		return session.Messages( 'auto' )!.make( null )
	}

	$mol_test({

		'Без реакций список пуст'( $ ) {

			$mol_assert_equal( $bog_gram_react.list( null ), [] )
			$mol_assert_equal( $bog_gram_react.list( message_make( $ ) ), [] )
			$mol_assert_equal( $bog_gram_react.mine( message_make( $ ), 'LordA' ), '' )

		},

		'У человека одна реакция: новая заменяет прежнюю, пустая снимает'( $ ) {

			const message = message_make( $ )

			$bog_gram_react.put( message, 'LordA', '👍' )
			$bog_gram_react.put( message, 'LordB', '👍' )
			$mol_assert_equal( $bog_gram_react.list( message ), [ '👍', '👍' ] )

			$bog_gram_react.put( message, 'LordA', '🔥' )
			$mol_assert_equal( $bog_gram_react.mine( message, 'LordA' ), '🔥' )
			$mol_assert_equal( $bog_gram_react.count( $bog_gram_react.list( message ), '👍' ), 1 )

			$bog_gram_react.put( message, 'LordA', '' )
			$mol_assert_equal( $bog_gram_react.mine( message, 'LordA' ), '' )
			$mol_assert_equal( $bog_gram_react.list( message ), [ '👍' ] )

		},

		'Посторонний текст вместо реакции не показывается, порядок постоянный'( $ ) {

			const message = message_make( $ )

			$bog_gram_react.put( message, 'LordA', 'не реакция' )
			$mol_assert_equal( $bog_gram_react.list( message ), [] )

			$mol_assert_equal( $bog_gram_react.shown([ '🔥', '👍', '🔥' ]), [ '👍', '🔥' ] )
			$mol_assert_equal( $bog_gram_react.count( [ '🔥', '👍', '🔥' ], '🔥' ), 2 )

		},

	})

}
