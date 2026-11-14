namespace $ {

	$mol_test({

		'Ключ в старые реестры кладётся один раз, потом схема помечена и проход молчит'( $ ) {

			const my = 'LordMine'
			const pass = 'PassMine'

			const dialogs = $giper_baza_land.make({ $ }).Data( $bog_gram_dialogs )
			const joined = $giper_baza_land.make({ $ }).Data( $bog_gram_users )
			const foreign = $giper_baza_land.make({ $ }).Data( $bog_gram_users )

			const account = $bog_gram_account.make({ $, my_lord: ()=> my, my_pass: ()=> pass, dialogs_store: ()=> dialogs })
			const start = ()=> $bog_gram_registry.make({ $,
				Account: ()=> account,
				store: ( id: string )=> id === 'Joined' ? joined : foreign,
			})
			const registry = start()

			dialogs.Registries( 'auto' )!.add( 'Joined' )
			dialogs.Registries( 'auto' )!.add( 'Foreign' )
			joined.Lords( 'auto' )!.add( my )

			$mol_assert_equal( registry.keys_fill(), 1 )
			$mol_assert_equal( String( joined.Keys()?.key( my )?.Pass()?.val() ?? '' ), pass )
			$mol_assert_equal( foreign.Keys()?.key( my ) ?? null, null )
			$mol_assert_equal( dialogs.Schema()?.val(), 2 )

			joined.Keys( 'auto' )?.key( my, 'auto' )?.Pass( 'auto' )?.val( 'Stale' )
			$mol_assert_equal( start().keys_fill(), 0 )
			$mol_assert_equal( String( joined.Keys()?.key( my )?.Pass()?.val() ?? '' ), 'Stale' )

		},

		async 'Люди из реестров собираются без меня, их ключ находится по лорду'( $ ) {

			const me = await $.$giper_baza_auth._generate()
			const ann = await $.$giper_baza_auth._generate()

			const my = me.pass().lord().str
			const ann_lord = ann.pass().lord().str
			const id = 'AAAAAAAA_BBBBBBBB'

			const dialogs = $giper_baza_land.make({ $ }).Data( $bog_gram_dialogs )
			const users = $giper_baza_land.make({ $ }).Data( $bog_gram_users )

			const account = $bog_gram_account.make({ $, my_lord: ()=> my, dialogs_store: ()=> dialogs })
			const registry = $bog_gram_registry.make({ $, Account: ()=> account, store: ()=> users })

			dialogs.Registries( 'auto' )!.add( id )
			users.Title( 'auto' )?.val( 'Соседи по даче' )
			users.Lords( 'auto' )!.add( my )
			users.Lords( 'auto' )!.add( ann_lord )
			users.Keys( 'auto' )?.key( ann_lord, 'auto' )?.Pass( 'auto' )?.val( ann.pass().toString() )

			$mol_assert_equal( registry.title( id ), 'Соседи по даче' )
			$mol_assert_equal( registry.status( id ), $bog_gram_text_fill( registry.Text().registry_status(), { people: $.$bog_gram_count_people( 2 ), mine: registry.Text().registry_joined() } ) )
			$mol_assert_equal( Object.keys( registry.sources() ), [ ann_lord ] )
			$mol_assert_equal( registry.source_title( ann_lord ), '' )
			$mol_assert_equal( registry.pass_of( ann_lord )?.lord().str, ann_lord )
			$mol_assert_equal( registry.pass_of( my ), null )

		},

		async 'Забытый реестр уходит из своего списка и с адреса'( $ ) {

			const dialogs = $giper_baza_land.make({ $ }).Data( $bog_gram_dialogs )
			const account = $bog_gram_account.make({ $, dialogs_store: ()=> dialogs })
			const registry = $bog_gram_registry.make({ $, Account: ()=> account })

			const id = 'AAAAAAAA_BBBBBBBB'

			registry.open( id )
			$mol_assert_equal( registry.remember(), id )
			$mol_assert_equal( registry.ids(), [ id ] )

			registry.forget( id )
			$mol_assert_equal( registry.ids(), [] )
			$mol_assert_equal( registry.active(), '' )

		},

	})

}
