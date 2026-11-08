namespace $ {

	$mol_test({

		async 'Имя собеседника берётся из общего диалога и только от него самого'( $ ) {

			const king = await $.$giper_baza_auth._generate()
			const ann = await $.$giper_baza_auth._generate()
			const bob = await $.$giper_baza_auth._generate()
			const ann_lord = ann.pass().lord().str
			const bob_lord = bob.pass().lord().str

			const land0 = $giper_baza_land.make({ $, auth: ()=> king })
			await $mol_wire_async( ()=> {
				land0.give( ann.pass(), $giper_baza_rank_post( 'just' ) )
				land0.give( bob.pass(), $giper_baza_rank_post( 'just' ) )
				return true
			} )()

			const write = async ( auth: $giper_baza_auth, lord: string, name: string )=> {
				const copy = $giper_baza_land.make({ $, link: ()=> land0.link(), auth: ()=> auth })
				await $mol_wire_async( copy ).units_steal( land0 )
				await $mol_wire_async( ()=> {
					copy.Data( $bog_gram_dialog ).Names( 'auto' )!.key( lord, 'auto' )!.Title( 'auto' )!.val( name )
					return true
				} )()
				await $mol_wire_async( land0 ).units_steal( copy )
			}

			await write( ann, ann_lord, 'Анна' )
			await write( bob, ann_lord, 'Подделка' )
			await write( bob, bob_lord, 'Боб' )

			const id = land0.link().str
			const talk = $bog_gram_talk.make({ $, store: ()=> land0.Data( $bog_gram_dialog ) })
			const roster = $bog_gram_roster.make({ $, Talk: ()=> talk, ids: ()=> [ id ] })

			$mol_assert_equal( roster.name_of( id, ann_lord ), 'Анна' )
			$mol_assert_equal( roster.name_of( id, bob_lord ), 'Боб' )
			$mol_assert_equal( roster.names()[ ann_lord ], 'Анна' )
			$mol_assert_equal( roster.names()[ bob_lord ], 'Боб' )
			$mol_assert_equal( Object.keys( roster.names() ).length, 2 )

		},

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
