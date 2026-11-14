namespace $.$$ {

	$mol_test({

		async 'Крестик выходит из звонка и закрывает страницу'( $ ) {

			const { room_a, room_b, swap } = await $bog_gram_call_room_pair( $ )

			let closed = 0
			const call = $bog_gram_call.make({
				$,
				Room: ()=> room_a,
				close: ()=> ++ closed,
			})

			call.join()
			room_a.beat()
			room_b.join()
			room_b.beat()
			await swap()
			$mol_assert_equal( room_b.mates(), [ room_a.seat() ] )

			call.close_click( {} )
			await swap()

			$mol_assert_equal( closed, 1 )
			$mol_assert_equal( call.joined(), false )
			$mol_assert_equal( room_b.mates(), [] )

		},

		async 'Собеседник подписан моим именем для него, а без подписи своим'( $ ) {

			const { room_a, room_b, swap } = await $bog_gram_call_room_pair( $ )

			room_a.join()
			room_a.beat()
			room_b.join()
			room_b.beat()
			await swap()

			const mate = room_b.seat()
			const named = $bog_gram_call.make({ $, Room: ()=> room_a, note: ( lord: string )=> lord === room_b.lord() ? 'Иван' : '' })
			const plain = $bog_gram_call.make({ $, Room: ()=> room_a })

			$mol_assert_equal( named.mate_name( mate ), 'Иван' )
			$mol_assert_equal( plain.mate_name( mate ), room_a.seat_name( mate ) )

		},

	})

}
