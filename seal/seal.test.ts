namespace $ {

	$mol_test({

		async 'Запечатанную ссылку открывает только адресат, подмену печать отвергает'( $ ) {

			const sender = await $.$giper_baza_auth._generate()
			const target = await $.$giper_baza_auth._generate()
			const stranger = await $.$giper_baza_auth._generate()

			const seal = $mol_wire_async( $bog_gram_seal )
			const link = 'ABCDEFGH_IJKLMNOP'

			const entry = await seal.close( sender, target.pass(), 'invite', link )
			const again = await seal.close( sender, target.pass(), 'invite', link )

			const parts = entry.split( '|' )
			parts[ 3 ] = parts[ 3 ].slice( 0, -2 ) + ( parts[ 3 ].endsWith( 'AA' ) ? 'BB' : 'AA' )
			const forged = parts.join( '|' )

			const opened = await seal.open( target, 'invite', entry )
			const alien = await seal.open( stranger, 'invite', entry )
			const other_kind = await seal.open( target, 'deny', entry )
			const broken = await seal.open( target, 'invite', forged )

			$mol_assert_equal( entry, again )
			$mol_assert_equal( entry.includes( link ), false )
			$mol_assert_equal( opened?.open, link )
			$mol_assert_equal( opened?.lord, sender.pass().lord().str )
			$mol_assert_equal( alien, null )
			$mol_assert_equal( other_kind, null )
			$mol_assert_equal( broken, null )

		},

	})

}
