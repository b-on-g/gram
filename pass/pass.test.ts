namespace $ {

	$mol_test({

		async 'Ключ принимается только под своим лордом'( $ ) {

			const auth_a = await $.$giper_baza_auth._generate()
			const auth_b = await $.$giper_baza_auth._generate()

			const lord_a = auth_a.pass().lord().str
			const lord_b = auth_b.pass().lord().str

			$mol_assert_equal( $bog_gram_pass.verified( lord_a, auth_a.pass().toString() )?.lord().str, lord_a )
			$mol_assert_equal( $bog_gram_pass.verified( lord_a, auth_b.pass().toString() ), null )
			$mol_assert_equal( $bog_gram_pass.verified( lord_b, auth_a.pass().toString() ), null )

		},

		async 'Мусор вместо ключа не роняет разбор'( $ ) {

			const auth = await $.$giper_baza_auth._generate()
			const lord = auth.pass().lord().str

			$mol_assert_equal( $bog_gram_pass.verified( lord, 'не ключ' ), null )
			$mol_assert_equal( $bog_gram_pass.verified( lord, 'a'.repeat( 43 ) ), null )
			$mol_assert_equal( $bog_gram_pass.verified( lord, 'a'.repeat( 86 ) ), null )
			$mol_assert_equal( $bog_gram_pass.verified( lord, '' ), null )
			$mol_assert_equal( $bog_gram_pass.verified( '', auth.pass().toString() ), null )

		},

		async 'Одна строка ключа даёт один и тот же объект'( $ ) {

			const auth = await $.$giper_baza_auth._generate()
			const str = auth.pass().toString()

			$mol_assert_equal( $bog_gram_pass.parse( str ), $bog_gram_pass.parse( str ) )

		},

	})

}
