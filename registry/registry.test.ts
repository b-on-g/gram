namespace $ {

	$mol_test({

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
			$mol_assert_equal( registry.status( id ), '2 участника · вы в списке' )
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
