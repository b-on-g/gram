namespace $ {

	$mol_test({

		'Числительные склоняются по-русски'( $ ) {

			const ru = $.$mol_ambient({
				$mol_locale: class extends $.$mol_locale {
					static override lang() {
						return 'ru'
					}
				},
				$bog_gram_text: class extends $.$bog_gram_text {
					override count_dialogs() { return '{n} диалог|{n} диалога|{n} диалогов' }
					override count_people() { return '{n} участник|{n} участника|{n} участников' }
				},
			})

			$mol_assert_equal( ru.$bog_gram_count_dialogs( 1 ), '1 диалог' )
			$mol_assert_equal( ru.$bog_gram_count_dialogs( 3 ), '3 диалога' )
			$mol_assert_equal( ru.$bog_gram_count_dialogs( 5 ), '5 диалогов' )
			$mol_assert_equal( ru.$bog_gram_count_dialogs( 11 ), '11 диалогов' )
			$mol_assert_equal( ru.$bog_gram_count_dialogs( 21 ), '21 диалог' )
			$mol_assert_equal( ru.$bog_gram_count_people( 112 ), '112 участников' )
			$mol_assert_equal( ru.$bog_gram_count_people( 22 ), '22 участника' )

		},

	})

}
