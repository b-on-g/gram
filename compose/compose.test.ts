namespace $ {

	$mol_test({

		'Набранный ID и выбранный человек открывают диалог, поле очищается'( $ ) {

			const opened = [] as string[]
			const compose = $bog_gram_compose.make({ $, open: ( lord: string )=> { opened.push( lord ); return null } })

			compose.start()
			$mol_assert_equal( opened, [] )

			compose.peer( '  LordPeer_Aaaaaaaa  ' )
			compose.start()
			compose.pick( 'LordUser_Bbbbbbbb' )

			$mol_assert_equal( opened, [ 'LordPeer_Aaaaaaaa', 'LordUser_Bbbbbbbb' ] )
			$mol_assert_equal( compose.peer(), '' )

		},

		'Без людей список объясняет, откуда их взять'( $ ) {

			const lonely = $bog_gram_compose.make({ $, users: ()=> [], registry_ids: ()=> [] })
			$mol_assert_equal( lonely.user_rows(), [ lonely.Users_empty() ] )
			$mol_assert_equal( lonely.users_empty_text(), 'Вы не состоите ни в одном реестре. Создайте свой в настройках' )

			const alone = $bog_gram_compose.make({ $, users: ()=> [], registry_ids: ()=> [ 'Registry' ] })
			$mol_assert_equal( alone.users_empty_text(), 'Кроме вас в реестрах пока никого нет' )

			const crowd = $bog_gram_compose.make({ $, users: ()=> [ 'LordA', 'LordB' ] })
			$mol_assert_equal( crowd.user_rows().length, 2 )

		},

	})

}
