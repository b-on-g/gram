namespace $ {

	$mol_test({

		async 'Отвечающий не пересобирает ответ, когда в комнате рукопожатие чужой пары'( $ ) {

			const { room_a } = await $bog_gram_call_room_pair( $ )
			room_a.seat( 'b' )

			let built = 0
			const peer = $bog_gram_call_peer.make({
				$,
				room: ()=> room_a,
				mate: ()=> 'a',
				answer_build: ()=> `answer ${ ++ built }`,
			})

			room_a.signal_put( 'Offers', 'a>b', JSON.stringify({ id: '0.X', sdp: 'offer' }) )
			$mol_assert_equal( peer.sync(), true )
			$mol_assert_equal( built, 1 )

			room_a.signal_put( 'Offers', 'b>c', JSON.stringify({ id: '0.Y', sdp: 'offer' }) )
			room_a.signal_put( 'Answers', 'b>c', JSON.stringify({ id: '0.Y', sdp: 'answer' }) )
			$mol_assert_equal( peer.sync(), true )
			$mol_assert_equal( built, 1 )

			room_a.signal_put( 'Offers', 'a>b', JSON.stringify({ id: '1.Z', sdp: 'offer' }) )
			$mol_assert_equal( peer.sync(), true )
			$mol_assert_equal( built, 2 )

		},

		async 'Предлагающий принимает ответ один раз, чужие пары его не трогают'( $ ) {

			const { room_a } = await $bog_gram_call_room_pair( $ )
			room_a.seat( 'a' )

			let applied = 0
			const peer = $bog_gram_call_peer.make({
				$,
				room: ()=> room_a,
				mate: ()=> 'b',
				rtc: ()=> ({ connectionState: 'connected' }) as any,
				offer_build: ()=> 'offer',
				answer_use: ()=> { ++ applied },
			})

			$mol_assert_equal( peer.sync(), false )

			const id = $bog_gram_call_room.signal_parse( room_a.signal( 'Offers', 'a>b' ) )!.id
			room_a.signal_put( 'Answers', 'a>b', JSON.stringify({ id, sdp: 'answer' }) )
			$mol_assert_equal( peer.sync(), true )
			$mol_assert_equal( applied, 1 )

			room_a.signal_put( 'Offers', 'a>c', JSON.stringify({ id: '0.Y', sdp: 'offer' }) )
			room_a.signal_put( 'Answers', 'a>c', JSON.stringify({ id: '0.Y', sdp: 'answer' }) )
			$mol_assert_equal( peer.sync(), true )
			$mol_assert_equal( applied, 1 )
			$mol_assert_equal( $bog_gram_call_room.signal_parse( room_a.signal( 'Offers', 'a>b' ) )!.id, id )

		},

		'Сводка краснеет при низких кадрах, потерях выше 2% и задержке выше 300 мс'() {

			const stats = { time: 0, bytes: 0, fps: 30, width: 640, height: 480, kbps: 500, lost: 0, packets: 0, loss: 0, rtt: 40 }

			$mol_assert_equal( $bog_gram_call_peer.stats_bad( stats ), { fps: false, loss: false, rtt: false } )
			$mol_assert_equal( $bog_gram_call_peer.stats_bad({ ... stats, fps: 10, loss: 2.5, rtt: 450 }), { fps: true, loss: true, rtt: true } )
			$mol_assert_equal( $bog_gram_call_peer.stats_bad({ ... stats, fps: 15, loss: 2, rtt: 300 }), { fps: false, loss: false, rtt: false } )

		},

	})

}
