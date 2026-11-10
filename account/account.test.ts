namespace $ {

	$mol_test({

		'Создание нового аккаунта меняет только ключ Gram и перезагружает приложение'( $ ) {

			let key: any = undefined
			let reloads = 0
			const account = $bog_gram_account.make({ $: {
				... $,
				$giper_baza_auth: { current: ( next?: any )=> ( key = next ) },
				$mol_dom_context: { location: { reload: ()=> ++ reloads } },
			} as any })

			account.account_fresh()

			$mol_assert_equal( key, null )
			$mol_assert_equal( reloads, 1 )

		},

		'Ключ со стороны и пустой домашний ленд: ленды не заводятся, ждём указатель'( $ ) {

			const profile = $giper_baza_land.make({ $ }).Data( $bog_gram_user )
			const account = $bog_gram_account.make({ $, my_lord: ()=> 'LordForeignWait', user_store: ()=> profile })

			$mol_assert_equal( account.pointer_state(), 'wait' )
			$mol_assert_equal( $bog_gram_soft( ()=> account.ready(), false ), false )

			$mol_assert_equal( String( profile.Dialogs_land()?.val() ?? '' ), '' )
			$mol_assert_equal( String( profile.Watch_land()?.val() ?? '' ), '' )
			$mol_assert_equal( String( profile.Devices_land()?.val() ?? '' ), '' )
			$mol_assert_equal( String( profile.Inbox_land()?.val() ?? '' ), '' )

		},

		'Указатель приехал позже первого чтения: читается он, новый ленд не заводится'( $ ) {

			const profile = $giper_baza_land.make({ $ }).Data( $bog_gram_user )
			const old = $giper_baza_land.make({ $ })
			const account = $bog_gram_account.make({ $, my_lord: ()=> 'LordForeignLate', user_store: ()=> profile })

			$mol_assert_equal( account.pointer_state(), 'wait' )

			profile.Dialogs_land( 'auto' )!.val( old.link().str )

			$mol_assert_equal( account.pointer_state(), 'ready' )
			$mol_assert_equal( account.dialogs_land().link().str, old.link().str )
			$mol_assert_equal( String( profile.Dialogs_land()?.val() ?? '' ), old.link().str )

		},

		'Минута без указателя: не удалось, ленда нет, повтор снова ждёт'( $ ) {

			const profile = $giper_baza_land.make({ $ }).Data( $bog_gram_user )
			const account = $bog_gram_account.make({ $, my_lord: ()=> 'LordForeignLost', user_store: ()=> profile })

			$mol_assert_equal( account.pointer_state(), 'wait' )

			$mol_after_mock_warp()

			$mol_assert_equal( account.pointer_state(), 'lost' )
			$mol_assert_equal( String( profile.Dialogs_land()?.val() ?? '' ), '' )

			account.pointer_retry()
			$mol_assert_equal( account.pointer_state(), 'wait' )
			$mol_assert_equal( String( profile.Dialogs_land()?.val() ?? '' ), '' )

		},

		async 'Ключ со стороны, указатель диалогов приехал, монитора нет: монитор заводится'( $ ) {

			const profile = $giper_baza_land.make({ $ }).Data( $bog_gram_user )
			const old = $giper_baza_land.make({ $ })
			const account = $bog_gram_account.make({ $, my_lord: ()=> 'LordForeignArrived', user_store: ()=> profile })

			profile.Dialogs_land( 'auto' )!.val( old.link().str )

			const land = await $mol_wire_async( account ).monitor_land()

			$mol_assert_equal( String( profile.Watch_land()?.val() ?? '' ), land.link().str )
			$mol_assert_equal( String( profile.Dialogs_land()?.val() ?? '' ), old.link().str )

		},

		async 'Ключ родился здесь: ленд заводится сразу'( $ ) {

			const profile = $giper_baza_land.make({ $ }).Data( $bog_gram_user )
			const account = $bog_gram_account.make({ $, my_lord: ()=> 'LordBornHere', user_store: ()=> profile })
			$.$mol_state_local.value( 'bog_gram_born_LordBornHere', true )

			const land = await $mol_wire_async( account ).dialogs_land()

			$mol_assert_equal( String( profile.Dialogs_land()?.val() ?? '' ), land.link().str )
			$mol_assert_equal( account.pointer_state(), 'ready' )

		},

		'Своё имя хранится в приватном списке, открытое из профиля переезжает туда и стирается'( $ ) {

			const dialogs = $giper_baza_land.make({ $ }).Data( $bog_gram_dialogs )
			const profile = $giper_baza_land.make({ $ }).Data( $bog_gram_user )
			const account = $bog_gram_account.make({ $, dialogs_store: ()=> dialogs, user_store: ()=> profile })

			profile.Name( 'auto' )!.val( 'Кирилл' )
			$mol_assert_equal( account.user_name(), 'Кирилл' )

			account.name_hide()
			$mol_assert_equal( String( dialogs.Name()?.val() ?? '' ), 'Кирилл' )
			$mol_assert_equal( String( profile.Name()?.val() ?? '' ), '' )

			account.user_name( 'Кирилл Н.' )
			$mol_assert_equal( account.user_name(), 'Кирилл Н.' )
			$mol_assert_equal( String( profile.Name()?.val() ?? '' ), '' )

		},

		async 'Монитор закрыт для всех, а демон с выданным правом его читает'( $ ) {

			const daemon = await $.$giper_baza_auth._generate()
			const stranger = await $.$giper_baza_auth._generate()

			const profile = $giper_baza_land.make({ $ }).Data( $bog_gram_user )
			const account = $bog_gram_account.make({ $, my_lord: ()=> 'LordMonitor', user_store: ()=> profile })
			$.$mol_state_local.value( 'bog_gram_born_LordMonitor', true )

			const land = await $mol_wire_async( account ).monitor_land()
			$mol_assert_equal( land.encrypted(), true )
			$mol_assert_equal( String( profile.Watch_land()?.val() ?? '' ), land.link().str )

			await $mol_wire_async( ()=> {
				account.monitor_store().Watch( 'auto' )!.add( 'SessionLink' )
				return true
			} )()

			$mol_assert_equal( await $mol_wire_async( account ).monitor_grant( daemon.pass().toString() ), true )
			$mol_assert_equal( await $mol_wire_async( account ).monitor_grant( daemon.pass().toString() ), false )

			$mol_assert_equal( land.pass_rank( daemon.pass() ), $giper_baza_rank_read )
			$mol_assert_equal( land.pass_rank( stranger.pass() ), $giper_baza_rank_deny )
			$mol_assert_equal( land.lord_rank( null ), $giper_baza_rank_deny )

		},

		async 'Запрос принимается и убирается локально, даже когда свой список не пишется, и переезжает в него потом'( $ ) {

			const king = await $.$giper_baza_auth._generate()
			const owned = $giper_baza_land.make({ $, auth: ()=> king })
			const locked = $giper_baza_land.make({ $, link: ()=> owned.link() }).Data( $bog_gram_dialogs )
			const open = $giper_baza_land.make({ $ }).Data( $bog_gram_dialogs )

			$mol_assert_equal( locked.can_change(), false )

			const lord = 'AAAAAAAA_BBBBBBBB'
			const dialog = 'CCCCCCCC_DDDDDDDD'

			const offline = $bog_gram_account.make({ $, my_lord: ()=> 'LordLocal', dialogs_store: ()=> locked })
			const people = $bog_gram_people.make({ $, Account: ()=> offline })
			const talk = $bog_gram_talk.make({ $, Account: ()=> offline, links_of: ()=> [], saved_is: ()=> false })
			const roster = $bog_gram_roster.make({ $, Account: ()=> offline, Talk: ()=> talk })

			await $mol_wire_async( people ).accept( lord )
			await $mol_wire_async( roster ).drop( dialog )

			$mol_assert_equal( people.accepted(), [ lord ] )
			$mol_assert_equal( roster.hidden(), [ dialog ] )

			const online = $bog_gram_account.make({ $, my_lord: ()=> 'LordLocal', dialogs_store: ()=> open })
			$mol_assert_equal( online.decisions_flush(), 2 )

			$mol_assert_equal( ( open.Accepted()!.items() as readonly string[] ).map( String ), [ lord ] )
			$mol_assert_equal( ( open.Hidden()!.items() as readonly string[] ).map( String ), [ dialog ] )
			$mol_assert_equal( online.local_list( 'accepted' ), [] )
			$mol_assert_equal( online.local_list( 'hidden' ), [] )

		},

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
