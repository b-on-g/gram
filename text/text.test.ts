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

		'Число склоняется по правилам языка, недостающие формы берутся из последней'( $ ) {

			const lang = ( name: string )=> $.$mol_ambient({
				$mol_locale: class extends $.$mol_locale {
					static override lang() {
						return name
					}
				},
			})

			const ru = lang( 'ru' )
			const forms = '{n} диалог|{n} диалога|{n} диалогов'

			$mol_assert_equal( ru.$bog_gram_text_plural( 1, forms ), '1 диалог' )
			$mol_assert_equal( ru.$bog_gram_text_plural( 3, forms ), '3 диалога' )
			$mol_assert_equal( ru.$bog_gram_text_plural( 5, forms ), '5 диалогов' )
			$mol_assert_equal( ru.$bog_gram_text_plural( 11, forms ), '11 диалогов' )
			$mol_assert_equal( ru.$bog_gram_text_plural( 21, forms ), '21 диалог' )
			$mol_assert_equal( ru.$bog_gram_text_plural( 22, forms ), '22 диалога' )
			$mol_assert_equal( ru.$bog_gram_text_plural( 112, forms ), '112 диалогов' )

			const en = lang( 'en' )
			$mol_assert_equal( en.$bog_gram_text_plural( 1, '{n} dialog|{n} dialogs' ), '1 dialog' )
			$mol_assert_equal( en.$bog_gram_text_plural( 3, '{n} dialog|{n} dialogs' ), '3 dialogs' )

			const zh = lang( 'zh' )
			$mol_assert_equal( zh.$bog_gram_text_plural( 1, '{n} 个对话' ), '1 个对话' )
			$mol_assert_equal( zh.$bog_gram_text_plural( 5, '{n} 个对话' ), '5 个对话' )

		},

	})

}
