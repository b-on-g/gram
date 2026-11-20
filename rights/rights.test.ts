namespace $ {

	$mol_test({

		async 'Уровень с ленда группы доходит до бакетов, где человек уже есть, и не открывает остальные'( $ ) {

			const king_dialog = await $.$giper_baza_auth._generate()
			const king_open = await $.$giper_baza_auth._generate()
			const king_shut = await $.$giper_baza_auth._generate()
			const mate = await $.$giper_baza_auth._generate()

			const dialog = $giper_baza_land.make({ $, auth: ()=> king_dialog })
			const open = $giper_baza_land.make({ $, auth: ()=> king_open })
			const shut = $giper_baza_land.make({ $, auth: ()=> king_shut })

			await $mol_wire_async( dialog ).encrypted( true )
			await $mol_wire_async( open ).encrypted( true )
			await $mol_wire_async( shut ).encrypted( true )

			const lord = mate.pass().lord()

			const rights = $bog_gram_rights.make({
				$,
				land: ()=> dialog,
				lands: ()=> [ open, shut ],
				lords: ()=> [ lord.str ],
			})

			const ops = {

				start() {
					dialog.give( mate.pass(), $giper_baza_rank_post( 'fast' ) )
					open.give( mate.pass(), $giper_baza_rank_post( 'fast' ) )
					return true
				},

				raise() {
					rights.gift_tier( lord, 'rule' )
					return true
				},

				read() {
					return {
						dialog: dialog.lord_rank( lord ),
						open: open.lord_rank( lord ),
						shut: shut.lord_rank( lord ),
						rows: rights.rows().length,
					}
				},

			}

			await $mol_wire_async( ops ).start()
			await $mol_wire_async( ops ).raise()

			const state = await $mol_wire_async( ops ).read()

			$mol_assert_equal( state.dialog, $giper_baza_rank_rule )
			$mol_assert_equal( state.open, $giper_baza_rank_rule )
			$mol_assert_equal( state.shut, $giper_baza_rank_deny )
			$mol_assert_equal( state.rows, 1 )

		},

	})

}
