namespace $ {

	$mol_test({

		'Числительные склоняются по-русски'() {

			$mol_assert_equal( $bog_gram_count.dialogs( 1 ), '1 диалог' )
			$mol_assert_equal( $bog_gram_count.dialogs( 3 ), '3 диалога' )
			$mol_assert_equal( $bog_gram_count.dialogs( 5 ), '5 диалогов' )
			$mol_assert_equal( $bog_gram_count.dialogs( 11 ), '11 диалогов' )
			$mol_assert_equal( $bog_gram_count.dialogs( 21 ), '21 диалог' )
			$mol_assert_equal( $bog_gram_count.people( 112 ), '112 участников' )
			$mol_assert_equal( $bog_gram_count.people( 22 ), '22 участника' )

		},

	})

}
