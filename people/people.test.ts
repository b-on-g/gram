namespace $ {

	$mol_test({

		async 'Ключ из ссылки проверяется и не теряется после ухода экрана'( $ ) {

			const peer = await $.$giper_baza_auth._generate()
			const other = await $.$giper_baza_auth._generate()
			const lord = peer.pass().lord().str
			const key = peer.pass().toString()

			const king = await $.$giper_baza_auth._generate()
			const dialogs = $giper_baza_land.make({ $, auth: ()=> king }).Data( $bog_gram_dialogs )
			const account = $bog_gram_account.make({ $, dialogs_store: ()=> dialogs })

			const first = $bog_gram_people.make({ $, Account: ()=> account })

			$mol_assert_equal( first.pass_learn( lord, other.pass().toString() ), null )
			$mol_assert_equal( first.pass_learn( lord, 'мусор' ), null )
			$mol_assert_equal( first.pass_learn( lord, '' ), null )

			const learned = first.pass_learn( lord, key )
			$mol_assert_equal( learned?.lord().str, lord )
			$mol_assert_equal( first.pass_of( lord ), learned )

			const next = $bog_gram_people.make({ $, Account: ()=> account })
			$mol_assert_equal( next.pass_given( lord ), null )
			$mol_assert_equal( next.pass_of( lord )?.lord().str, lord )

		},

		async 'Подпись собеседника перекрывает его имя, а пустая возвращает имя'( $ ) {

			const dialogs = $giper_baza_land.make({ $ }).Data( $bog_gram_dialogs )
			const account = $bog_gram_account.make({ $, dialogs_store: ()=> dialogs })
			const people = $bog_gram_people.make({ $, Account: ()=> account, name: ()=> 'Иииии' })

			const peer = 'LordPeerWithVeryLongIdentifier'

			$mol_assert_equal( people.label( peer ), 'Иииии' )

			people.note_set( peer, 'Костя с работы' )
			$mol_assert_equal( people.label( peer ), 'Костя с работы' )

			people.note_set( peer, '' )
			$mol_assert_equal( people.label( peer ), 'Иииии' )

		},

		async 'Согласие даётся человеку один раз и только настоящему лорду'( $ ) {

			const auth = await $.$giper_baza_auth._generate()
			const lord = auth.pass().lord().str

			const dialogs = $giper_baza_land.make({ $ }).Data( $bog_gram_dialogs )
			const account = $bog_gram_account.make({ $, dialogs_store: ()=> dialogs, my_lord: ()=> 'LordMine' })
			const registry = $bog_gram_registry.make({ $, Account: ()=> account, sources: ()=> ({}) })
			const people = $bog_gram_people.make({ $, Account: ()=> account, Registry: ()=> registry })

			$mol_assert_equal( people.known( lord ), false )

			people.accept( lord )
			people.accept( lord )
			people.accept( 'не лорд' )
			people.accept( 'LordMine' )

			$mol_assert_equal( people.accepted(), [ lord ] )
			$mol_assert_equal( people.known( lord ), true )

		},

	})

}
