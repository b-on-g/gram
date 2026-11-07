namespace $ {

	$mol_test({

		async 'Новое лобби открыто всем и встаёт в профиль, прежнее читается дальше'( $ ) {

			const king_lobby = await $.$giper_baza_auth._generate()
			const king_user = await $.$giper_baza_auth._generate()
			const king_dialogs = await $.$giper_baza_auth._generate()

			const lobby = $giper_baza_land.make({ $, auth: ()=> king_lobby })
			const profile = $giper_baza_land.make({ $, auth: ()=> king_user }).Data( $bog_gram_user )
			const dialogs = $giper_baza_land.make({ $, auth: ()=> king_dialogs }).Data( $bog_gram_dialogs )

			profile.Inbox_land( 'auto' )?.val( 'OldLobbyLink' )

			const account = $bog_gram_account.make({ $,
				inbox_land: ()=> lobby,
				user_store: ()=> profile,
				dialogs_store: ()=> dialogs,
			})

			account.inbox_open()
			account.inbox_publish()

			$mol_assert_equal( lobby.lord_rank( null ), $giper_baza_rank_post( 'slow' ) )
			$mol_assert_equal( profile.Inbox_land()?.val(), lobby.link().str )
			$mol_assert_equal( account.lobbies_old(), [ 'OldLobbyLink' ] )

		},

		async 'Записи лобби читаются одним списком и снимаются по одной'( $ ) {

			const inbox = $giper_baza_land.make({ $ }).Data( $bog_gram_inbox )
			const dialogs = $giper_baza_land.make({ $ }).Data( $bog_gram_dialogs )

			const account = $bog_gram_account.make({ $,
				inbox_store: ()=> inbox,
				dialogs_store: ()=> dialogs,
			})

			inbox.Joins( 'auto' )!.add( 'первая' )
			inbox.Joins( 'auto' )!.add( 'вторая' )
			inbox.Denies( 'auto' )!.add( 'отказ' )

			$mol_assert_equal( new Set( account.joins() ).size, 2 )
			$mol_assert_equal( account.denies(), [ 'отказ' ] )
			$mol_assert_equal( account.invites(), [] )

			account.joins_cut( 'первая' )
			$mol_assert_equal( account.joins(), [ 'вторая' ] )

		},

	})

}
