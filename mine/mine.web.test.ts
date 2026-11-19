namespace $ {

	$mol_test({

		async 'Перенос старой базы после метки больше не трогает хранилище'( $ ) {

			let moved = 0

			class Mine extends $bog_gram_mine_web {

				static override $ = $

				static override async move() {
					++ moved
					return false
				}

			}

			$.$mol_state_local.value( Mine.done_key, true )

			$mol_assert_equal( await Mine.run(), false )
			$mol_assert_equal( moved, 0 )

		},

	})

}
