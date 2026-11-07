namespace $ {

	$mol_test({

		async 'Чужой пользователь доставляет приглашение в открытое лобби владельца'( $ ) {

			const owner = await $.$giper_baza_auth._generate()
			const stranger = await $.$giper_baza_auth._generate()

			const inbox0 = $giper_baza_land.make({ $, auth: ()=> owner })
			inbox0.give( null, $giper_baza_rank_post( 'just' ) )

			const inbox_stranger = $giper_baza_land.make({ $, link: ()=> inbox0.link(), auth: ()=> stranger })
			await $mol_wire_async( inbox_stranger ).units_steal( inbox0 )

			inbox_stranger.Data( $bog_gram_inbox ).Invites( 'auto' )!.add( 'NewDialogLink' )

			await $mol_wire_async( inbox0 ).units_steal( inbox_stranger )

			const invites = ( inbox0.Data( $bog_gram_inbox ).Invites()!.items() as readonly string[] )
			$mol_assert_equal( invites.includes( 'NewDialogLink' ), true )

		},

	})

}
