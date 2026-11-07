namespace $ {

	function strings( list: { items(): readonly unknown[] } | null | undefined ) {
		return ( list?.items() ?? [] ).map( String )
	}

	async function open_registry( $: $ ) {
		const king = await $.$giper_baza_auth._generate()
		const registry0 = $giper_baza_land.make({ $, auth: ()=> king })
		registry0.give( null, $giper_baza_rank_post( 'just' ) )
		return { king, registry0 }
	}

	async function copy( $: $, of: $giper_baza_land, auth: $giper_baza_auth ) {
		const land = $giper_baza_land.make({ $, link: ()=> of.link(), auth: ()=> auth })
		await $mol_wire_async( land ).units_steal( of )
		return land
	}

	$mol_test({

		async 'Конкурентная регистрация мержится без конфликтов'( $ ) {

			const { registry0 } = await open_registry( $ )
			const auth_a = await $.$giper_baza_auth._generate()
			const auth_b = await $.$giper_baza_auth._generate()

			const registry_a = await copy( $, registry0, auth_a )
			const registry_b = await copy( $, registry0, auth_b )

			registry_a.Data( $bog_gram_users ).Lords( 'auto' )!.add( auth_a.pass().lord().str )
			registry_b.Data( $bog_gram_users ).Lords( 'auto' )!.add( auth_b.pass().lord().str )

			await $mol_wire_async( registry_a ).units_steal( registry_b )
			await $mol_wire_async( registry_b ).units_steal( registry_a )

			const lords_a = strings( registry_a.Data( $bog_gram_users ).Lords() )
			const lords_b = strings( registry_b.Data( $bog_gram_users ).Lords() )

			$mol_assert_equal( lords_a.includes( auth_a.pass().lord().str ), true )
			$mol_assert_equal( lords_a.includes( auth_b.pass().lord().str ), true )
			$mol_assert_equal( lords_a.length, lords_b.length )

		},

		async 'Вступление — явная запись, чтение список не меняет'( $ ) {

			const { registry0 } = await open_registry( $ )
			const guest = await $.$giper_baza_auth._generate()
			const guest_lord = guest.pass().lord().str

			const registry_guest = await copy( $, registry0, guest )

			$mol_assert_equal( strings( registry_guest.Data( $bog_gram_users ).Lords() ).length, 0 )

			registry_guest.Data( $bog_gram_users ).Lords( 'auto' )!.add( guest_lord )
			$mol_assert_equal( strings( registry_guest.Data( $bog_gram_users ).Lords() ).includes( guest_lord ), true )

			await $mol_wire_async( registry0 ).units_steal( registry_guest )
			$mol_assert_equal( strings( registry0.Data( $bog_gram_users ).Lords() ).includes( guest_lord ), true )

		},

		async 'Название задаёт создатель, видит участник'( $ ) {

			const { king, registry0 } = await open_registry( $ )
			const guest = await $.$giper_baza_auth._generate()
			const king_lord = king.pass().lord().str

			const data0 = registry0.Data( $bog_gram_users )
			data0.Title( 'auto' )?.val( 'Соседи по даче' )
			data0.Lords( 'auto' )!.add( king_lord )

			const data_guest = ( await copy( $, registry0, guest ) ).Data( $bog_gram_users )
			$mol_assert_equal( data_guest.Title()!.val(), 'Соседи по даче' )
			$mol_assert_equal( strings( data_guest.Lords() ).includes( king_lord ), true )

		},

		async 'Ключ участника доезжает до других и лежит по ключу-лорду'( $ ) {

			const { registry0 } = await open_registry( $ )
			const auth_a = await $.$giper_baza_auth._generate()
			const auth_b = await $.$giper_baza_auth._generate()

			const lord_a = auth_a.pass().lord().str
			const key_a = auth_a.pass().toString()

			const registry_a = await copy( $, registry0, auth_a )

			const data_a = registry_a.Data( $bog_gram_users )
			data_a.Lords( 'auto' )!.add( lord_a )
			data_a.Keys( 'auto' )?.key( lord_a, 'auto' )?.Pass( 'auto' )?.val( key_a )

			const data_b = ( await copy( $, registry_a, auth_b ) ).Data( $bog_gram_users )
			$mol_assert_equal( strings( data_b.Lords() ).includes( lord_a ), true )

			const got = String( data_b.Keys()?.key( lord_a )?.Pass()?.val() ?? '' )
			$mol_assert_equal( got, key_a )
			$mol_assert_equal( $bog_gram_pass.verified( lord_a, got )?.lord().str, lord_a )
			$mol_assert_equal( Boolean( data_b.Keys()?.key( auth_b.pass().lord().str ) ), false )

		},

	})

}
