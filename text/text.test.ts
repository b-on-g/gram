namespace $ {

	class $bog_gram_text_locale extends $mol_locale {
		static override source( lang: string ) {
			return {}
		}
	}

	$mol_test_mocks.push( $ => {
		$.$mol_locale = $bog_gram_text_locale
	} )

	$mol_test({

		'Подстановка заполняет известные места и не трогает неизвестные'() {
			$mol_assert_equal( $bog_gram_text_fill( '{a} и {b}, {c}', { a: 1, b: 'два' } ), '1 и два, {c}' )
		},

		'Число склоняется по правилам языка'() {

			const forms = { one: '{n} диалог', few: '{n} диалога', many: '{n} диалогов', other: '{n} диалога' }

			$mol_assert_equal( $bog_gram_text_plural( 1, forms, 'ru' ), '1 диалог' )
			$mol_assert_equal( $bog_gram_text_plural( 3, forms, 'ru' ), '3 диалога' )
			$mol_assert_equal( $bog_gram_text_plural( 5, forms, 'ru' ), '5 диалогов' )
			$mol_assert_equal( $bog_gram_text_plural( 11, forms, 'ru' ), '11 диалогов' )
			$mol_assert_equal( $bog_gram_text_plural( 21, forms, 'ru' ), '21 диалог' )
			$mol_assert_equal( $bog_gram_text_plural( 22, forms, 'ru' ), '22 диалога' )
			$mol_assert_equal( $bog_gram_text_plural( 112, forms, 'ru' ), '112 диалогов' )

			const en = { one: '{n} dialog', few: '{n} dialogs', many: '{n} dialogs', other: '{n} dialogs' }
			$mol_assert_equal( $bog_gram_text_plural( 1, en, 'en' ), '1 dialog' )
			$mol_assert_equal( $bog_gram_text_plural( 3, en, 'en' ), '3 dialogs' )

			const zh = { one: '{n} 个', few: '-', many: '-', other: '{n} 个对话' }
			$mol_assert_equal( $bog_gram_text_plural( 1, zh, 'zh' ), '1 个对话' )

		},

	})

}
