namespace $ {

	export async function $bog_gram_call_room_pair( $: $ ) {

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
			room,
			land_a,
			auth_a,
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

			const { room_a, room_b, swap } = await $bog_gram_call_room_pair( $ )

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

			const { room_a, room_b, swap } = await $bog_gram_call_room_pair( $ )

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

			const { room_a, room_b, swap } = await $bog_gram_call_room_pair( $ )

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

			const { room_a } = await $bog_gram_call_room_pair( $ )

			room_a.join()
			const first = room_a.seat()
			room_a.leave()
			room_a.join()

			$mol_assert_unique( first, room_a.seat() )

		},

		async 'Предложение и ответ доходят через ленд по общему ключу пары'( $ ) {

			const { room_a, room_b, swap } = await $bog_gram_call_room_pair( $ )

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

		async 'Повторный вход того же человека заменяет прежнее место, а не добавляет второе'( $ ) {

			const { room, land_a, auth_a, room_a, room_b, swap } = await $bog_gram_call_room_pair( $ )

			room_a.join()
			room_a.beat()

			const twin = room( land_a, auth_a, 'Аня' )
			twin.join()
			twin.beat()

			room_b.join()
			room_b.beat()
			await swap()

			$mol_assert_equal( room_b.mates(), [ twin.seat() ] )
			$mol_assert_equal( room_b.seats_alive().length, 2 )
			$mol_assert_equal( room_a.joined(), false )
			$mol_assert_equal( twin.joined(), true )
			$mol_assert_equal( twin.mates(), [ room_b.seat() ] )

		},

		async 'Из двух живых мест одного человека в звонке остаётся последнее'( $ ) {

			const { room, room_a, room_b, auth_a, swap } = await $bog_gram_call_room_pair( $ )

			room_a.join()
			room_a.beat()
			room_a.seat_pawn( room_a.seat() )!.Joined( 'auto' )!.val( 1 )

			const twin = room( room_b.land(), auth_a, 'Аня' )
			twin.join()
			twin.beat()

			await swap()

			$mol_assert_equal( room_a.seat_pawn( room_a.seat() )!.Left()?.val() ?? null, null )
			$mol_assert_equal( room_b.seats_alive(), [ twin.seat() ] )
			$mol_assert_equal( room_a.joined(), false )
			$mol_assert_equal( twin.joined(), true )

		},

		'Сводка соединения считает кадры, битрейт, потери и задержку'() {

			const entries = ( time: number, bytes: number )=> [
				{ type: 'transport', selectedCandidatePairId: 'P' },
				{ type: 'candidate-pair', id: 'P', currentRoundTripTime: 0.042 },
				{ type: 'candidate-pair', id: 'Q', currentRoundTripTime: 9 },
				{ type: 'inbound-rtp', kind: 'video', timestamp: time, bytesReceived: bytes, packetsLost: 1, packetsReceived: 99, framesPerSecond: 29.7, frameWidth: 640, frameHeight: 480 },
				{ type: 'inbound-rtp', kind: 'audio', timestamp: time, bytesReceived: 0, packetsLost: 0, packetsReceived: 100 },
			]

			const first = $bog_gram_call_peer.stats_sum( entries( 1_000, 0 ), null )
			$mol_assert_equal( first.kbps, 0 )

			const next = $bog_gram_call_peer.stats_sum( entries( 3_000, 250_000 ), first )
			$mol_assert_equal( [ next.fps, next.width, next.height, next.kbps, next.loss, next.rtt ], [ 30, 640, 480, 1000, 0.5, 42 ] )

		},

		'Камера, потерянная в фоне, не запрашивается, пока страница скрыта'( $ ) {

			let opened = 0
			const room = $bog_gram_call_room.make({ $, video_restore: ()=> { ++ opened } })

			room.visible( false )
			room.video_lost()
			$mol_assert_equal( opened, 0 )

			room.visible( true )
			room.video_lost()
			$mol_assert_equal( opened, 1 )

		},

		'Уход в фон со страницей в кэше не выходит из звонка, закрытие выходит'( $ ) {

			let left = 0
			const room = $bog_gram_call_room.make({ $, leave: ()=> { ++ left } })

			room.page_hide({ persisted: true })
			$mol_assert_equal( left, 0 )

			room.page_hide({ persisted: false })
			$mol_assert_equal( left, 1 )

		},

		'На время звонка аудиосессия держит микрофон и звук, после возвращается в auto'( $ ) {

			const session = { type: 'auto' }
			const room = $bog_gram_call_room.make({ $: $.$mol_ambient({ $mol_dom_context: { navigator: { audioSession: session } } as any }) })

			const hold = room.audio_session()!
			$mol_assert_equal( session.type, 'play-and-record' )

			hold.destructor()
			$mol_assert_equal( session.type, 'auto' )

		},

		'Испорченный сигнал не ломает разбор'() {
			$mol_assert_equal( $bog_gram_call_room.signal_parse( '' ), null )
			$mol_assert_equal( $bog_gram_call_room.signal_parse( '{"id":1}' ), null )
		},

	})

}
