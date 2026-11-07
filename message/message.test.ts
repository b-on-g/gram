namespace $ {

	function message_of( land: $giper_baza_land, link: $giper_baza_link ) {
		return land.Pawn( $bog_gram_message ).Head( link.head() )
	}

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

		return { auth_a, lord_a: auth_a.pass().lord().str, session_a, session_b }
	}

	$mol_test({

		async 'Правка синхронизируется вместе с меткой Edited'( $ ) {

			const { lord_a, session_a, session_b } = await pair( $ )

			const msg_a = session_a.Data( $bog_gram_session ).Messages( 'auto' )!.make( null )
			msg_a.Text( 'auto' )?.val( 'первая редакция' )
			msg_a.Author( 'auto' )?.val( lord_a )
			msg_a.Moment( 'auto' )?.val( 1000 )

			await $mol_wire_async( session_b ).units_steal( session_a )

			const links_b = session_b.Data( $bog_gram_session ).Messages()!.items() as readonly $giper_baza_link[]
			$mol_assert_equal( links_b.length, 1 )
			$mol_assert_equal( message_of( session_b, links_b[0] ).Text()!.val(), 'первая редакция' )
			$mol_assert_equal( message_of( session_b, links_b[0] ).Edited()?.val() ?? null, null )

			msg_a.Text( 'auto' )?.val( 'вторая редакция' )
			msg_a.Edited( 'auto' )?.val( 1500 )

			await $mol_wire_async( session_b ).units_steal( session_a )

			const edited_b = message_of( session_b, links_b[0] )
			$mol_assert_equal( edited_b.Text()!.val(), 'вторая редакция' )
			$mol_assert_equal( edited_b.Edited()!.val(), 1500 )

		},

		async 'Удаление — метка Deleted, сообщение остаётся в списке у обеих сторон'( $ ) {

			const { lord_a, session_a, session_b } = await pair( $ )

			const data_a = session_a.Data( $bog_gram_session )

			const alive_a = data_a.Messages( 'auto' )!.make( null )
			alive_a.Text( 'auto' )?.val( 'доживёт' )
			alive_a.Author( 'auto' )?.val( lord_a )
			alive_a.Moment( 'auto' )?.val( 1000 )

			const dead_a = data_a.Messages( 'auto' )!.make( null )
			dead_a.Text( 'auto' )?.val( 'сотрут' )
			dead_a.Author( 'auto' )?.val( lord_a )
			dead_a.Moment( 'auto' )?.val( 2000 )

			dead_a.Deleted( 'auto' )?.val( 2500 )

			await $mol_wire_async( session_b ).units_steal( session_a )

			const links_b = session_b.Data( $bog_gram_session ).Messages()!.items() as readonly $giper_baza_link[]
			$mol_assert_equal( links_b.length, 2 )

			const pawns_b = links_b.map( link => message_of( session_b, link ) )
			const alive_b = pawns_b.filter( message => !message.Deleted()?.val() )
			const dead_b = pawns_b.filter( message => message.Deleted()?.val() )

			$mol_assert_equal( alive_b.length, 1 )
			$mol_assert_equal( alive_b[0].Text()!.val(), 'доживёт' )
			$mol_assert_equal( dead_b.length, 1 )
			$mol_assert_equal( dead_b[0].Text()!.val(), 'сотрут' )
			$mol_assert_equal( dead_b[0].Deleted()!.val(), 2500 )

		},

		async 'Ссылка на кадр и его размеры доезжают до собеседника без самого кадра'( $ ) {

			const { auth_a, lord_a, session_a, session_b } = await pair( $ )

			const shot_land = $giper_baza_land.make({ $, auth: ()=> auth_a })
			const shot = shot_land.Data( $giper_baza_file )
			shot.buffer( new Uint8Array([ 1, 2, 3, 4 ]) )
			shot.type( 'image/webp' )

			const msg_a = session_a.Data( $bog_gram_session ).Messages( 'auto' )!.make( null )
			msg_a.Author( 'auto' )?.val( lord_a )
			msg_a.Moment( 'auto' )?.val( 1000 )
			msg_a.Image( 'auto' )!.remote( shot )
			msg_a.Image_width( 'auto' )?.val( 1200 )
			msg_a.Image_height( 'auto' )?.val( 900 )

			await $mol_wire_async( session_b ).units_steal( session_a )

			const links_b = session_b.Data( $bog_gram_session ).Messages()!.items() as readonly $giper_baza_link[]
			$mol_assert_equal( links_b.length, 1 )

			const got = message_of( session_b, links_b[0] )
			$mol_assert_equal( got.Image()!.val()!.str, shot.link().str )
			$mol_assert_equal( got.Image_width()!.val(), 1200 )
			$mol_assert_equal( got.Image_height()!.val(), 900 )

		},

		async 'Кадр без подписи остаётся живым сообщением, подпись дописывается правкой'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const session = land.Data( $bog_gram_session )

			const shot_land = $giper_baza_land.make({ $ })
			const shot = shot_land.Data( $giper_baza_file )
			shot.buffer( new Uint8Array([ 7, 7, 7 ]) )
			shot.type( 'image/webp' )

			const message = session.Messages( 'auto' )!.make( null )
			message.Author( 'auto' )?.val( 'LordMine' )
			message.Moment( 'auto' )?.val( 1000 )
			message.Image( 'auto' )!.remote( shot )
			message.Image_width( 'auto' )?.val( 800 )
			message.Image_height( 'auto' )?.val( 600 )

			const links = session.Messages()!.items() as readonly $giper_baza_link[]
			const found = message_of( land, links[0] )

			$mol_assert_equal( found.Text()?.val() ?? '', '' )
			$mol_assert_equal( found.Deleted()?.val() ?? null, null )
			$mol_assert_equal( found.Image()!.val()!.str, shot.link().str )
			$mol_assert_equal( found.Image_width()!.val(), 800 )
			$mol_assert_equal( found.Image_height()!.val(), 600 )

			found.Text( 'auto' )?.val( 'Вид с балкона' )
			found.Edited( 'auto' )?.val( 1500 )
			$mol_assert_equal( message_of( land, links[0] ).Text()!.val(), 'Вид с балкона' )
			$mol_assert_equal( message_of( land, links[0] ).Image()!.val()!.str, shot.link().str )

		},

		async 'Ссылка на запись и её длительность доезжают до собеседника без самой записи'( $ ) {

			const { auth_a, lord_a, session_a, session_b } = await pair( $ )

			const sound_land = $giper_baza_land.make({ $, auth: ()=> auth_a })
			const sound = sound_land.Data( $giper_baza_file )
			sound.buffer( new Uint8Array([ 9, 8, 7, 6 ]) )
			sound.type( 'audio/webm' )

			const msg_a = session_a.Data( $bog_gram_session ).Messages( 'auto' )!.make( null )
			msg_a.Author( 'auto' )?.val( lord_a )
			msg_a.Moment( 'auto' )?.val( 1000 )
			msg_a.Voice( 'auto' )!.remote( sound )
			msg_a.Voice_span( 'auto' )?.val( 7.5 )

			await $mol_wire_async( session_b ).units_steal( session_a )

			const links_b = session_b.Data( $bog_gram_session ).Messages()!.items() as readonly $giper_baza_link[]
			$mol_assert_equal( links_b.length, 1 )

			const got = message_of( session_b, links_b[0] )
			$mol_assert_equal( got.Voice()!.val()!.str, sound.link().str )
			$mol_assert_equal( got.Voice_span()!.val(), 7.5 )
			$mol_assert_equal( got.Text()?.val() ?? '', '' )
			$mol_assert_equal( got.Image()?.val() ?? null, null )

		},

	})

}
