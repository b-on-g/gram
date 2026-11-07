namespace $ {

	$mol_test({

		'Своя подпись важнее имени, без обоих — сокращённый идентификатор'() {

			const peer = 'LordPeerWithVeryLongIdentifier'

			$mol_assert_equal( $bog_gram_lord.label( peer, 'Костя с работы', 'Иииии' ), 'Костя с работы' )
			$mol_assert_equal( $bog_gram_lord.label( peer, '', 'Иииии' ), 'Иииии' )
			$mol_assert_equal( $bog_gram_lord.label( peer, '', '' ), 'LordPe…fier' )
			$mol_assert_equal( $bog_gram_lord.label( '', 'Костя с работы', 'Иииии' ), '' )

		},

		'Лордом считается только полный идентификатор владельца'() {

			$mol_assert_equal( $bog_gram_lord.check( 'ikjOnflc_WufmHhGH' ), true )
			$mol_assert_equal( $bog_gram_lord.check( 'не ссылка' ), false )
			$mol_assert_equal( $bog_gram_lord.check( 'ikjOnflc_Wufm' ), false )
			$mol_assert_equal( $bog_gram_lord.check( 'ikjOnflc_WufmHhGH_Aaaaaaaa' ), false )

		},

		'Один лорд всегда красится одинаково'() {

			$mol_assert_equal( $bog_gram_lord.tint( 'LordA' ), $bog_gram_lord.tint( 'LordA' ) )
			$mol_assert_equal( $bog_gram_lord.tint( 'LordA' ) < 7, true )

		},

	})

}
