namespace $.$$ {

	function stand( $: $ ) {

		const session = $giper_baza_land.make({ $ }).Data( $bog_gram_session )
		const talk = $bog_gram_talk.make({ $,
			session: ()=> session,
			saved_is: ()=> false,
			messages_of: ()=> ( ( session.Messages()?.items() ?? [] ) as readonly $giper_baza_link[] )
				.map( link => session.land().Pawn( $bog_gram_message ).Head( link.head() ) ),
		})
		const alerts = $bog_gram_alerts.make({ $, offer: ()=> false })
		const chat = $bog_gram_chat.make({ $, dialog: ()=> 'DialogTasks', my_lord: ()=> 'LordMe', Talk: ()=> talk, Alerts: ()=> alerts })

		const send = ( text: string, ... entities: $bog_rich_entity[] )=> {
			chat.message_content({ text, entities })
			chat.message_send()
			return talk.messages_of( '' ).at( -1 )!
		}

		return { chat, send }
	}

	$mol_test({

		'Сообщение с двух минусов или тире уходит задачей без префикса, остальное — сообщением'( $ ) {

			const { send } = stand( $ )
			const sent = ( text: string )=> {
				const message = send( text )
				return [ message.Text()?.val(), Boolean( message.Task()?.val() ) ]
			}

			$mol_assert_equal( sent( '-- купить молоко' ), [ 'купить молоко', true ] )
			$mol_assert_equal( sent( '— купить хлеб' ), [ 'купить хлеб', true ] )
			$mol_assert_equal( sent( '--force' ), [ '--force', false ] )
			$mol_assert_equal( sent( '--' ), [ '--', false ] )
			$mol_assert_equal( sent( 'а -- б' ), [ 'а -- б', false ] )

		},

		'Префикс и пробелы по краям срезаются вместе со сдвигом стилей'( $ ) {

			const { send } = stand( $ )

			const message = send( '  -- очень важно ', { type: 'bold', offset: 3, length: 7 } )
			$mol_assert_equal( $bog_gram_markup_read( message ), { text: 'очень важно', entities: [ { type: 'bold', offset: 0, length: 5 } ] } )
			$mol_assert_equal( message.Task()?.val(), true )

		},

		'Сделанные уходят вниз панели, снятая отметка убирает задачу'( $ ) {

			const { chat, send } = stand( $ )
			const [ milk, bread ] = [ '-- молоко', '-- хлеб' ].map( text => send( text ).link().str )
			const talk = send( 'болтовня' ).link().str

			const panel = $bog_gram_tasks.make({ $,
				ids: ()=> chat.task_ids(),
				done: ( id: string, next?: boolean )=> chat.message_task_done( id, next ),
			})

			$mol_assert_equal( panel.rows(), [ panel.Row( milk ), panel.Row( bread ) ] )

			panel.done( milk, true )
			$mol_assert_equal( chat.message_task_done( milk ), true )
			$mol_assert_equal( panel.rows(), [ panel.Row( bread ), panel.Row( milk ) ] )

			panel.done( milk, false )
			chat.message_task( talk, true )
			chat.message_task( bread, false )
			$mol_assert_equal( chat.task_ids(), [ milk, talk ] )

		},

		async 'Чужую задачу закрывает любой участник, и автор открывает её снова'( $ ) {

			const king = await $.$giper_baza_auth._generate()
			const mate = await $.$giper_baza_auth._generate()

			const origin = $giper_baza_land.make({ $, auth: ()=> king })
			await $mol_wire_async( ()=> {
				origin.give( mate.pass(), $giper_baza_rank_post( 'just' ) )
				const message = origin.Data( $bog_gram_message )
				message.Task( 'auto' )!.val( true )
				return true
			} )()

			const copy = $giper_baza_land.make({ $, link: ()=> origin.link(), auth: ()=> mate })
			await $mol_wire_async( copy ).units_steal( origin )
			await $mol_wire_async( ()=> {
				copy.Data( $bog_gram_message ).Task_done( 'auto' )!.val( 1000 )
				return true
			} )()

			await $mol_wire_async( origin ).units_steal( copy )
			$mol_assert_equal( origin.Data( $bog_gram_message ).Task_done()?.val(), 1000 )

			await $mol_wire_async( ()=> {
				origin.Data( $bog_gram_message ).Task_done( 'auto' )!.val( 0 )
				return true
			} )()

			await $mol_wire_async( copy ).units_steal( origin )
			$mol_assert_equal( copy.Data( $bog_gram_message ).Task_done()?.val(), 0 )

		},

	})

}
