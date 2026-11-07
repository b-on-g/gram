namespace $ {

	async function pair( $: $ ) {

		const king = await $.$giper_baza_auth._generate()
		const auth_a = await $.$giper_baza_auth._generate()
		const auth_b = await $.$giper_baza_auth._generate()

		const land0 = $giper_baza_land.make({ $, auth: ()=> king })
		land0.give( auth_a.pass(), $giper_baza_rank_post( 'just' ) )
		land0.give( auth_b.pass(), $giper_baza_rank_post( 'just' ) )

		const land_a = $giper_baza_land.make({ $, link: ()=> land0.link(), auth: ()=> auth_a })
		await $mol_wire_async( land_a ).units_steal( land0 )
		const land_b = $giper_baza_land.make({ $, link: ()=> land0.link(), auth: ()=> auth_b })
		await $mol_wire_async( land_b ).units_steal( land0 )

		const time = 100_000

		const room = ( land: $giper_baza_land, auth: $giper_baza_auth, name: string )=> $bog_gram_call_room.make({
			$,
			land: ()=> land,
			lord: ()=> auth.pass().lord().str,
			name: ()=> name,
			now: ()=> time,
			cam_able: ()=> true,
		})

		const room_a = room( land_a, auth_a, 'Аня' )
		const room_b = room( land_b, auth_b, 'Боря' )

		return {
			room_a,
			room_b,
			swap: async()=> {
				await $mol_wire_async( land_a ).units_steal( land_b )
				await $mol_wire_async( land_b ).units_steal( land_a )
			},
		}
	}

	$mol_test({

		async 'Вошедший виден собеседнику по имени, своё место в собеседниках не числится'( $ ) {

			const { room_a, room_b, swap } = await pair( $ )

			room_a.join()
			room_a.beat()
			room_b.join()
			room_b.beat()
			await swap()

			$mol_assert_equal( room_b.mates(), [ room_a.seat() ] )
			$mol_assert_equal( room_a.mates(), [ room_b.seat() ] )
			$mol_assert_equal( room_b.seat_name( room_a.seat() ), 'Аня' )
			$mol_assert_equal( room_a.seats_alive().length, 2 )

		},

		async 'Вышедший пропадает из звонка у собеседника'( $ ) {

			const { room_a, room_b, swap } = await pair( $ )

			room_a.join()
			room_a.beat()
			room_b.join()
			room_b.beat()
			await swap()

			room_a.leave()
			await swap()

			$mol_assert_equal( room_b.mates(), [] )
			$mol_assert_equal( room_a.joined(), false )

		},

		async 'Замолчавший без выхода считается ушедшим через окно присутствия'( $ ) {

			const { room_a, room_b, swap } = await pair( $ )

			room_a.join()
			room_a.beat()
			await swap()
			$mol_assert_equal( room_b.seats_alive(), [ room_a.seat() ] )

			const room_c = $bog_gram_call_room.make({
				$,
				land: ()=> room_b.land(),
				now: ()=> 100_000 + $bog_gram_call_room.alive_span + 1,
			})
			$mol_assert_equal( room_c.seats_alive(), [] )

		},

		async 'Повторный вход занимает новое место, чтобы пары сигналов не смешивались'( $ ) {

			const { room_a } = await pair( $ )

			room_a.join()
			const first = room_a.seat()
			room_a.leave()
			room_a.join()

			$mol_assert_unique( first, room_a.seat() )

		},

		async 'Предложение и ответ доходят через ленд по общему ключу пары'( $ ) {

			const { room_a, room_b, swap } = await pair( $ )

			room_a.join()
			room_b.join()

			const a = room_a.seat()
			const b = room_b.seat()

			$mol_assert_unique( $bog_gram_call_room.offerer( a, b ), $bog_gram_call_room.offerer( b, a ) )
			$mol_assert_equal( $bog_gram_call_room.pair( a, b ), $bog_gram_call_room.pair( b, a ) )

			const offerer = $bog_gram_call_room.offerer( a, b ) ? room_a : room_b
			const answerer = offerer === room_a ? room_b : room_a
			const key = $bog_gram_call_room.pair( a, b )

			offerer.signal_put( 'Offers', key, JSON.stringify({ id: '0.X', sdp: 'offer' }) )
			await swap()
			$mol_assert_equal( $bog_gram_call_room.signal_parse( answerer.signal( 'Offers', key ) ), { id: '0.X', sdp: 'offer' } )

			answerer.signal_put( 'Answers', key, JSON.stringify({ id: '0.X', sdp: 'answer' }) )
			await swap()
			$mol_assert_equal( $bog_gram_call_room.signal_parse( offerer.signal( 'Answers', key ) ), { id: '0.X', sdp: 'answer' } )

		},

		'Испорченный сигнал не ломает разбор'() {
			$mol_assert_equal( $bog_gram_call_room.signal_parse( '' ), null )
			$mol_assert_equal( $bog_gram_call_room.signal_parse( '{"id":1}' ), null )
		},

	})

}
