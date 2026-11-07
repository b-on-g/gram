namespace $ {

	$mol_test({

		'Чужой диалог показывается по сообщениям и знакомству'( $ ) {

			const roster = $bog_gram_roster.make({ $ })

			$mol_assert_equal( roster.sort( true, false, false ), 'plain' )
			$mol_assert_equal( roster.sort( true, true, false ), 'plain' )
			$mol_assert_equal( roster.sort( false, false, true ), 'skip' )
			$mol_assert_equal( roster.sort( false, false, false ), 'skip' )
			$mol_assert_equal( roster.sort( false, true, true ), 'plain' )
			$mol_assert_equal( roster.sort( false, true, false ), 'request' )

		},

		'Список раскладывает диалоги по полкам: общий, запросы, архив'( $ ) {

			const store = $giper_baza_land.make({ $ }).Data( $bog_gram_dialogs )
			const account = $bog_gram_account.make({ $, dialogs_store: ()=> store })

			const kinds: Record< string, 'plain' | 'request' | 'skip' > = {
				Mine: 'plain',
				Stranger: 'request',
				Empty: 'skip',
				Folded: 'plain',
			}

			const talk = $bog_gram_talk.make({ $, Account: ()=> account, fresh_first: ( ids: readonly string[] )=> [ ... ids ].sort() })
			const roster = $bog_gram_roster.make({ $,
				Account: ()=> account,
				Talk: ()=> talk,
				kind: ( id: string )=> kinds[ id ],
			})

			for( const id of Object.keys( kinds ) ) store.Dialogs( 'auto' )!.add( id )
			store.Archived( 'auto' )!.add( 'Folded' )

			$mol_assert_equal( roster.visible(), [ 'Mine' ] )
			$mol_assert_equal( roster.requests(), [ 'Stranger' ] )
			$mol_assert_equal( roster.archived(), [ 'Folded' ] )

			roster.unarchive( 'Folded' )
			$mol_assert_equal( roster.archived(), [] )
			$mol_assert_equal( roster.visible(), [ 'Folded', 'Mine' ] )

		},

		'Приглашённый диалог виден без копирования, убранный не возвращается, мусор отсеивается'( $ ) {

			const keep = 'AAAAAAAA_BBBBBBBB'
			const drop = 'CCCCCCCC_DDDDDDDD'
			const fresh = 'EEEEEEEE_FFFFFFFF'

			const store = $giper_baza_land.make({ $ }).Data( $bog_gram_dialogs )
			const monitor = $giper_baza_land.make({ $ }).Data( $bog_gram_monitor )
			const account = $bog_gram_account.make({ $,
				dialogs_store: ()=> store,
				monitor_store: ()=> monitor,
				invites: ()=> [ keep, drop, fresh, 'не ссылка' ],
			})
			const talk = $bog_gram_talk.make({ $, Account: ()=> account, links_of: ()=> [] })
			const roster = $bog_gram_roster.make({ $, Account: ()=> account, Talk: ()=> talk })

			store.Dialogs( 'auto' )!.add( keep )
			store.Archived( 'auto' )!.add( drop )

			$mol_assert_equal( [ ... roster.ids() ].sort(), [ keep, drop, fresh ].sort() )

			roster.drop( drop )

			$mol_assert_equal( [ ... roster.ids() ].sort(), [ keep, fresh ].sort() )
			$mol_assert_equal( roster.hidden(), [ drop ] )
			$mol_assert_equal( roster.archive_links(), [] )
			$mol_assert_equal( ( store.Dialogs()!.items() as readonly string[] ).map( String ), [ keep ] )

		},

	})

}
