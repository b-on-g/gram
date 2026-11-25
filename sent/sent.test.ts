namespace $ {

	$mol_test({

		async 'Сообщение отправлено, только когда мастер назвал его время и все юниты'( $ ) {

			class Sent extends $bog_gram_sent {
				static override $ = $
				static override poll() { return null }
			}

			const land = await $mol_wire_async( ()=> {
				const land = $.$giper_baza_glob.land_grab()
				new $mol_wire_atom( 'bog_gram_sent_test', ()=> $.$giper_baza_glob.Land( land.link() ) ).fresh()
				return land
			} )()

			const pawn = land.Data( $bog_gram_message )
			await $mol_wire_async( ()=> pawn.Text( 'auto' )!.val( 'привет' ) )()

			const peer = Sent.peer( land )
			const tick = await $mol_wire_async( ()=> Sent.tick_of( pawn ) )()
			const done = $mol_wire_async( ()=> Sent.done( pawn ) )
			const own = land.faces.get( peer )!

			$mol_assert_equal( tick > 0, true )
			$mol_assert_equal( await done(), false )

			$mol_assert_equal( Sent.covered( land, new $giper_baza_face_map ), 0 )
			$mol_assert_equal( Sent.covered( land, new $giper_baza_face_map([[ peer, new $giper_baza_face( own.time, own.tick, own.summ - 1 ) ]]) ), 0 )
			$mol_assert_equal( Sent.covered( land, land.faces ) >= tick, true )

			Sent.confirmed( land, tick - 1 )
			$mol_assert_equal( await done(), false )

			Sent.confirmed( land, tick )
			$mol_assert_equal( await done(), true )

		},

	})

}
