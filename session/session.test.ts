namespace $ {

	function message_of( land: $giper_baza_land, link: $giper_baza_link ) {
		return land.Pawn( $bog_gram_message ).Head( link.head() )
	}

	$mol_test({

		async 'Сообщение пишется в сессию и читается из неё'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const session = land.Data( $bog_gram_session )

			const message = session.Messages( 'auto' )!.make( null )
			message.Text( 'auto' )?.val( 'Привет!' )
			message.Author( 'auto' )?.val( 'LordA' )
			message.Moment( 'auto' )?.val( 1000 )

			const links = session.Messages()!.items() as readonly $giper_baza_link[]
			$mol_assert_equal( links.length, 1 )

			const found = message_of( land, links[0] )
			$mol_assert_equal( found.Text()!.val(), 'Привет!' )
			$mol_assert_equal( found.Author()!.val(), 'LordA' )

		},

		async 'Два участника обмениваются сообщениями через синк сессии'( $ ) {

			const king_dialog = await $.$giper_baza_auth._generate()
			const king_session = await $.$giper_baza_auth._generate()
			const auth_a = await $.$giper_baza_auth._generate()
			const auth_b = await $.$giper_baza_auth._generate()

			const lord_a = auth_a.pass().lord().str
			const lord_b = auth_b.pass().lord().str

			const dialog0 = $giper_baza_land.make({ $, auth: ()=> king_dialog })
			dialog0.give( auth_a.pass(), $giper_baza_rank_rule )
			dialog0.give( auth_b.pass(), $giper_baza_rank_post( 'just' ) )

			const session0 = $giper_baza_land.make({ $, auth: ()=> king_session })
			session0.give( auth_a.pass(), $giper_baza_rank_rule )
			session0.give( auth_b.pass(), $giper_baza_rank_post( 'just' ) )

			const dialog_a = $giper_baza_land.make({ $, link: ()=> dialog0.link(), auth: ()=> auth_a })
			await $mol_wire_async( dialog_a ).units_steal( dialog0 )
			const session_a = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_a })
			await $mol_wire_async( session_a ).units_steal( session0 )

			const dialog_data_a = dialog_a.Data( $bog_gram_dialog )
			dialog_data_a.Peers( 'auto' )!.add( lord_a )
			dialog_data_a.Peers( 'auto' )!.add( lord_b )
			dialog_data_a.Sessions( 'auto' )!.add( session0.link().str )

			const msg_a = session_a.Data( $bog_gram_session ).Messages( 'auto' )!.make( null )
			msg_a.Text( 'auto' )?.val( 'Привет, B!' )
			msg_a.Author( 'auto' )?.val( lord_a )
			msg_a.Moment( 'auto' )?.val( 1000 )

			const dialog_b = $giper_baza_land.make({ $, link: ()=> dialog0.link(), auth: ()=> auth_b })
			await $mol_wire_async( dialog_b ).units_steal( dialog_a )
			const session_b = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_b })
			await $mol_wire_async( session_b ).units_steal( session_a )

			const peers_b = ( dialog_b.Data( $bog_gram_dialog ).Peers()!.items() as readonly string[] )
			$mol_assert_equal( peers_b.includes( lord_a ), true )
			$mol_assert_equal( peers_b.includes( lord_b ), true )

			const links_b = session_b.Data( $bog_gram_session ).Messages()!.items() as readonly $giper_baza_link[]
			$mol_assert_equal( links_b.length, 1 )
			$mol_assert_equal( message_of( session_b, links_b[0] ).Text()!.val(), 'Привет, B!' )

			const msg_b = session_b.Data( $bog_gram_session ).Messages( 'auto' )!.make( null )
			msg_b.Text( 'auto' )?.val( 'Привет, A!' )
			msg_b.Author( 'auto' )?.val( lord_b )
			msg_b.Moment( 'auto' )?.val( 2000 )

			await $mol_wire_async( session_a ).units_steal( session_b )

			const links_a = session_a.Data( $bog_gram_session ).Messages()!.items() as readonly $giper_baza_link[]
			$mol_assert_equal( links_a.length, 2 )

			const sorted = links_a
				.map( link => message_of( session_a, link ) )
				.sort( ( x, y )=> ( x.Moment()?.val() ?? 0 ) - ( y.Moment()?.val() ?? 0 ) )
			$mol_assert_equal( sorted[0].Author()!.val(), lord_a )
			$mol_assert_equal( sorted[1].Author()!.val(), lord_b )
			$mol_assert_equal( sorted[1].Text()!.val(), 'Привет, A!' )

		},

		async 'Порядок сообщений задаётся полем Moment, а не порядком доставки'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const session = land.Data( $bog_gram_session )

			const moments = [ 3000, 1000, 2000 ]
			const texts = [ 'третье', 'первое', 'второе' ]

			for( let i = 0; i < moments.length; ++i ) {
				const message = session.Messages( 'auto' )!.make( null )
				message.Text( 'auto' )?.val( texts[i] )
				message.Moment( 'auto' )?.val( moments[i] )
			}

			const links = session.Messages()!.items() as readonly $giper_baza_link[]
			const sorted = links
				.map( link => message_of( land, link ) )
				.sort( ( x, y )=> ( x.Moment()?.val() ?? 0 ) - ( y.Moment()?.val() ?? 0 ) )

			$mol_assert_equal( sorted[0].Text()!.val(), 'первое' )
			$mol_assert_equal( sorted[1].Text()!.val(), 'второе' )
			$mol_assert_equal( sorted[2].Text()!.val(), 'третье' )

		},

	})

}
