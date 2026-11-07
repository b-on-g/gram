namespace $ {

	$mol_test({

		async 'Участники и сессии пишутся и читаются'( $ ) {

			const land = $giper_baza_land.make({ $ })

			const dialog = land.Data( $bog_gram_dialog )
			dialog.Peers( 'auto' )!.add( 'LordA' )
			dialog.Peers( 'auto' )!.add( 'LordB' )
			dialog.Sessions( 'auto' )!.add( 'SessionLink1' )

			$mol_assert_equal( ( dialog.Peers()!.items() as readonly string[] ).length, 2 )
			$mol_assert_equal( ( dialog.Sessions()!.items() as readonly string[] )[0], 'SessionLink1' )

		},

		async 'Участник с выданным правом читает и пишет шифрованный ленд диалога'( $ ) {

			const king = await $.$giper_baza_auth._generate()
			const auth_b = await $.$giper_baza_auth._generate()

			const land0 = $giper_baza_land.make({ $, auth: ()=> king })
			await $mol_wire_async( land0 ).encrypted( true )
			$mol_assert_equal( land0.encrypted(), true )

			const land_b = $giper_baza_land.make({ $, link: ()=> land0.link(), auth: ()=> auth_b })

			const ops = {

				king_writes() {
					land0.give( auth_b.pass(), $giper_baza_rank_post( 'just' ) )
					land0.Data( $bog_gram_dialog ).Peers( 'auto' )!.add( 'SecretLordA' )
					return true
				},

				b_reads() {
					return ( land_b.Data( $bog_gram_dialog ).Peers()!.items() as readonly string[] ).slice()
				},

				b_writes() {
					land_b.Data( $bog_gram_dialog ).Peers( 'auto' )!.add( 'SecretLordB' )
					return true
				},

				king_reads() {
					return ( land0.Data( $bog_gram_dialog ).Peers()!.items() as readonly string[] ).slice()
				},

			}

			await $mol_wire_async( ops ).king_writes()
			await $mol_wire_async( land_b ).units_steal( land0 )

			const peers_b = await $mol_wire_async( ops ).b_reads()
			$mol_assert_equal( peers_b.includes( 'SecretLordA' ), true )

			await $mol_wire_async( ops ).b_writes()
			await $mol_wire_async( land0 ).units_steal( land_b )

			const peers0 = await $mol_wire_async( ops ).king_reads()
			$mol_assert_equal( peers0.includes( 'SecretLordB' ), true )

		},

	})

}
