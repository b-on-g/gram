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
					override count_dialogs_one() { return '{n} диалог' }
					override count_dialogs_few() { return '{n} диалога' }
					override count_dialogs_many() { return '{n} диалогов' }
					override count_dialogs_other() { return '{n} диалога' }
					override count_people_one() { return '{n} участник' }
					override count_people_few() { return '{n} участника' }
					override count_people_many() { return '{n} участников' }
					override count_people_other() { return '{n} участника' }
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
