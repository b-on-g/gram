namespace $ {

	async function pair( $: $ ) {

		const king = await $.$giper_baza_auth._generate()
		const auth_a = await $.$giper_baza_auth._generate()
		const auth_b = await $.$giper_baza_auth._generate()

		const session0 = $giper_baza_land.make({ $, auth: ()=> king })
		session0.give( auth_a.pass(), $giper_baza_rank_rule )
		session0.give( auth_b.pass(), $giper_baza_rank_post( 'just' ) )

		const session_a = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_a })
		await $mol_wire_async( session_a ).units_steal( session0 )
		const session_b = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_b })
		await $mol_wire_async( session_b ).units_steal( session0 )

		return {
			lord_a: auth_a.pass().lord().str,
			lord_b: auth_b.pass().lord().str,
			reads_a: ()=> session_a.Data( $bog_gram_session ),
			reads_b: ()=> session_b.Data( $bog_gram_session ),
			session_a,
			session_b,
		}
	}

	$mol_test({

		async 'Отметки участников лежат по ключу-лорду и мержатся без конфликтов'( $ ) {

			const { lord_a, lord_b, reads_a, reads_b, session_a, session_b } = await pair( $ )

			reads_a().Reads( 'auto' )?.key( lord_a, 'auto' )?.Moment( 'auto' )?.val( 1000 )
			reads_b().Reads( 'auto' )?.key( lord_b, 'auto' )?.Moment( 'auto' )?.val( 2000 )

			await $mol_wire_async( session_a ).units_steal( session_b )
			await $mol_wire_async( session_b ).units_steal( session_a )

			$mol_assert_equal( reads_a().Reads()?.key( lord_a )?.Moment()?.val(), 1000 )
			$mol_assert_equal( reads_a().Reads()?.key( lord_b )?.Moment()?.val(), 2000 )
			$mol_assert_equal( reads_b().Reads()?.key( lord_a )?.Moment()?.val(), 1000 )
			$mol_assert_equal( reads_b().Reads()?.key( lord_b )?.Moment()?.val(), 2000 )

		},

		async 'Сдвинутая вперёд отметка доезжает до собеседника'( $ ) {

			const { lord_a, reads_a, reads_b, session_a, session_b } = await pair( $ )

			reads_a().Reads( 'auto' )?.key( lord_a, 'auto' )?.Moment( 'auto' )?.val( 1000 )
			await $mol_wire_async( session_b ).units_steal( session_a )
			$mol_assert_equal( reads_b().Reads()?.key( lord_a )?.Moment()?.val(), 1000 )

			reads_a().Reads( 'auto' )?.key( lord_a, 'auto' )?.Moment( 'auto' )?.val( 3000 )
			await $mol_wire_async( session_b ).units_steal( session_a )

			$mol_assert_equal( reads_a().Reads()?.key( lord_a )?.Moment()?.val(), 3000 )
			$mol_assert_equal( reads_b().Reads()?.key( lord_a )?.Moment()?.val(), 3000 )

		},

	})

}
