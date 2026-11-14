namespace $ {

	$mol_test({

		async 'Ключ из QR встаёт в поле входа, чужой QR даёт ошибку'( $ ) {

			const auth = await $.$giper_baza_auth._generate()
			const key = auth.toString() + auth.toStringPrivate()
			const block = $bog_gram_settings_key.make({ $ })

			block.armed( true )
			block.Scan().found( key )

			$mol_assert_equal( block.input(), key )
			$mol_assert_equal( block.error(), '' )
			$mol_assert_equal( block.armed(), false )

			block.Scan().found( 'https://example.org/' )

			$mol_assert_equal( block.input(), 'https://example.org/' )
			$mol_assert_equal( block.error(), block.error_qr() )

		},

		'Вход по ключу взводится первым нажатием, мусор до взвода не доходит'( $ ) {

			const block = $bog_gram_settings_key.make({ $ })

			block.import()
			$mol_assert_equal( block.error(), block.error_empty() )

			block.input( 'не ключ' )
			block.import()
			$mol_assert_equal( block.error(), block.error_bad() )
			$mol_assert_equal( block.armed(), false )

		},

		'Пока ключ скрыт, его нет ни в тексте, ни в коде'( $ ) {

			const block = $bog_gram_settings_key.make({ $ })

			$mol_assert_equal( block.rows().includes( block.Row() ), false )
			$mol_assert_equal( block.rows().includes( block.Qr_box() ), false )

			block.toggle()
			$mol_assert_equal( block.rows().includes( block.Row() ), true )
			$mol_assert_equal( block.toggle_label(), block.toggle_hide() )

		},

	})

}
