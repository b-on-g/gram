namespace $ {

	function message_of( land: $giper_baza_land, link: $giper_baza_link ) {
		return land.Pawn( $bog_gram_message ).Head( link.head() )
	}

	function strings( list: { items(): readonly unknown[] } | null | undefined ) {
		return ( list?.items() ?? [] ).map( String )
	}

	$mol_test({

		async 'Удалённый диалог оседает в Hidden и инвайтом не возвращается'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const store = land.Data( $bog_gram_dialogs )

			store.Dialogs( 'auto' )!.add( 'DialogKeep' )
			store.Dialogs( 'auto' )!.add( 'DialogDrop' )

			store.Dialogs( 'auto' )!.cut( 'DialogDrop' )
			store.Hidden( 'auto' )!.add( 'DialogDrop' )

			$mol_assert_equal( strings( store.Dialogs() ), [ 'DialogKeep' ] )

			const hidden = new Set( strings( store.Hidden() ) )
			$mol_assert_equal( hidden.has( 'DialogDrop' ), true )
			$mol_assert_equal( hidden.has( 'DialogKeep' ), false )

			const merged = [ 'DialogKeep', 'DialogDrop' ].filter( link => !hidden.has( link ) )
			$mol_assert_equal( merged, [ 'DialogKeep' ] )

		},

		async 'Заявка проходит очередь, отправленное и приём'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const store = land.Data( $bog_gram_dialogs )

			const waiting = 'AAAAAAAA_BBBBBBBB'
			const answered = 'CCCCCCCC_DDDDDDDD'

			$mol_assert_equal( strings( store.Asks() ).length, 0 )
			$mol_assert_equal( strings( store.Asked() ).length, 0 )

			store.Asks( 'auto' )!.add( waiting )
			store.Asks( 'auto' )!.add( answered )
			store.Asks( 'auto' )!.add( waiting )
			$mol_assert_equal( strings( store.Asks() ).length, 2 )

			for( const id of [ waiting, answered ] ) {
				store.Asked( 'auto' )!.add( id )
				store.Asks( 'auto' )!.cut( id )
			}
			$mol_assert_equal( strings( store.Asks() ).length, 0 )
			$mol_assert_equal( strings( store.Asked() ).length, 2 )

			store.Dialogs( 'auto' )!.add( answered )
			store.Asked( 'auto' )!.cut( answered )

			const asked = new Set( strings( store.Asked() ) )
			$mol_assert_equal( asked.has( waiting ), true )
			$mol_assert_equal( asked.has( answered ), false )

			const have = new Set( strings( store.Dialogs() ) )
			$mol_assert_equal( [ ... asked ].filter( id => !have.has( id ) ), [ waiting ] )

			$mol_assert_equal( strings( store.Outbox() ).length, 0 )

		},

		async 'Архив прячет диалог из списка, но не удаляет'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const store = land.Data( $bog_gram_dialogs )

			store.Dialogs( 'auto' )!.add( 'DialogPlain' )
			store.Dialogs( 'auto' )!.add( 'DialogFolded' )
			store.Archived( 'auto' )!.add( 'DialogFolded' )

			const dialogs = strings( store.Dialogs() )
			$mol_assert_equal( dialogs.length, 2 )
			$mol_assert_equal( new Set( dialogs ).has( 'DialogFolded' ), true )

			const archived = new Set( strings( store.Archived() ) )
			$mol_assert_equal( dialogs.filter( id => !archived.has( id ) ), [ 'DialogPlain' ] )
			$mol_assert_equal( archived.has( 'DialogFolded' ), true )

			store.Dialogs( 'auto' )!.cut( 'DialogFolded' )
			store.Hidden( 'auto' )!.add( 'DialogFolded' )

			const alive = new Set( strings( store.Dialogs() ) )
			const dropped = new Set( strings( store.Hidden() ) )
			const in_archive = strings( store.Archived() ).filter( id => alive.has( id ) && !dropped.has( id ) )
			$mol_assert_equal( in_archive.length, 0 )

			store.Archived( 'auto' )!.cut( 'DialogFolded' )
			$mol_assert_equal( strings( store.Archived() ).length, 0 )
			$mol_assert_equal( strings( store.Dialogs() ).length, 1 )

		},

		async 'Избранное — ссылка на свой ленд с обычной сессией без отметок прочтения'( $ ) {

			const owner = $giper_baza_land.make({ $ })

			const store = owner.Data( $bog_gram_dialogs )
			store.Saved_land( 'auto' )?.val( 'SavedLandLink' )
			$mol_assert_equal( store.Saved_land()!.val(), 'SavedLandLink' )

			const saved = $giper_baza_land.make({ $ })
			const session = saved.Data( $bog_gram_session )

			const note = session.Messages( 'auto' )!.make( null )
			note.Text( 'auto' )?.val( 'Не забыть купить хлеб' )
			note.Author( 'auto' )?.val( 'LordMine' )
			note.Moment( 'auto' )?.val( 1000 )

			const links = session.Messages()!.items() as readonly $giper_baza_link[]
			$mol_assert_equal( links.length, 1 )

			const found = message_of( saved, links[0] )
			$mol_assert_equal( found.Text()!.val(), 'Не забыть купить хлеб' )
			$mol_assert_equal( found.Author()!.val(), 'LordMine' )

			found.Text( 'auto' )?.val( 'Хлеб и молоко' )
			found.Edited( 'auto' )?.val( 1500 )
			$mol_assert_equal( message_of( saved, links[0] ).Text()!.val(), 'Хлеб и молоко' )

			$mol_assert_equal( session.Reads()?.key( 'LordMine' )?.Moment()?.val() ?? 0, 0 )

		},

		async 'Подпись собеседника лежит по ключу-лорду, снятая подпись пустая'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const store = land.Data( $bog_gram_dialogs )

			const peer = 'LordPeerWithVeryLongIdentifier'

			$mol_assert_equal( store.Notes()?.key( peer )?.Title()?.val() ?? '', '' )

			store.Notes( 'auto' )?.key( peer, 'auto' )?.Title( 'auto' )?.val( 'Костя с работы' )
			$mol_assert_equal( store.Notes()?.key( peer )?.Title()?.val() ?? '', 'Костя с работы' )
			$mol_assert_equal( Boolean( store.Notes()?.key( 'LordStranger' ) ), false )

			store.Notes( 'auto' )?.key( peer, 'auto' )?.Title( 'auto' )?.val( '' )
			$mol_assert_equal( store.Notes()?.key( peer )?.Title()?.val() ?? '', '' )

		},

		async 'Согласие на собеседника не задваивается и не задевает скрытые диалоги'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const store = land.Data( $bog_gram_dialogs )

			const known = 'LordKnown'

			$mol_assert_equal( strings( store.Accepted() ).length, 0 )

			store.Accepted( 'auto' )!.add( known )
			store.Accepted( 'auto' )!.add( known )
			$mol_assert_equal( strings( store.Accepted() ), [ known ] )

			store.Hidden( 'auto' )!.add( 'DialogFromStranger' )

			const hidden = new Set( strings( store.Hidden() ) )
			$mol_assert_equal( hidden.has( 'DialogFromStranger' ), true )
			$mol_assert_equal( hidden.has( known ), false )
			$mol_assert_equal( strings( store.Accepted() ).length, 1 )
			$mol_assert_equal( strings( store.Archived() ).length, 0 )

		},

		async 'Забыть реестр — локальная операция, запись в нём остаётся'( $ ) {

			const king = await $.$giper_baza_auth._generate()
			const me = await $.$giper_baza_auth._generate()

			const my_lord = me.pass().lord().str

			const registry0 = $giper_baza_land.make({ $, auth: ()=> king })
			registry0.give( null, $giper_baza_rank_post( 'just' ) )

			const registry_me = $giper_baza_land.make({ $, link: ()=> registry0.link(), auth: ()=> me })
			await $mol_wire_async( registry_me ).units_steal( registry0 )
			registry_me.Data( $bog_gram_users ).Lords( 'auto' )!.add( my_lord )

			const private_land = $giper_baza_land.make({ $, auth: ()=> me })
			const store = private_land.Data( $bog_gram_dialogs )
			const link = registry0.link().str

			store.Registries( 'auto' )!.add( link )
			store.Registries( 'auto' )!.add( 'OtherRegistry' )
			store.Registries( 'auto' )!.cut( link )

			const known = strings( store.Registries() )
			$mol_assert_equal( known.includes( link ), false )
			$mol_assert_equal( known.includes( 'OtherRegistry' ), true )

			const lords = strings( registry_me.Data( $bog_gram_users ).Lords() )
			$mol_assert_equal( lords.includes( my_lord ), true )

		},

	})

}
