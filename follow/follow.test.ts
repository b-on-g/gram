namespace $ {

	$mol_test({

		'Из ссылки Gram берутся только свои параметры'() {

			const lord = 'AAAAAAAA_BBBBBBBB'

			$mol_assert_equal(
				$bog_gram_follow.params( 'https://b-on-g.github.io/gram/#!invite=' + lord + '/key=abc%2Fdef' ),
				{ invite: lord, key: 'abc/def' },
			)

			$mol_assert_equal(
				$bog_gram_follow.params( 'https://b-on-g.github.io/gram/#!join=' + lord + '/by=CCCCCCCC_DDDDDDDD' ),
				{ join: lord, by: 'CCCCCCCC_DDDDDDDD' },
			)

			$mol_assert_equal(
				$bog_gram_follow.params( 'https://b-on-g.github.io/gram/#!users=' + lord + '/giper_baza_yard_masters=https%3A%2F%2Fevil' ),
				{ users: lord },
			)

		},

		'Чужой QR и мусор ничего не открывают'() {
			$mol_assert_equal( $bog_gram_follow.params( 'https://example.com/' ), {} )
			$mol_assert_equal( $bog_gram_follow.params( 'просто текст' ), {} )
			$mol_assert_equal( $bog_gram_follow.params( 'https://x/#!key=only' ), {} )
			$mol_assert_equal( $bog_gram_follow.params( 'https://x/#!invite=%E0%A4%A' ), {} )
		},

	})

}
