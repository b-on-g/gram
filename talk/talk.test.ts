namespace $ {

	function message_of( land: $giper_baza_land, link: $giper_baza_link ) {
		return land.Pawn( $bog_gram_message ).Head( link.head() )
	}

	function list_of( land: $giper_baza_land ) {
		return ( land.Data( $bog_gram_session ).Messages()!.items() as readonly $giper_baza_link[] )
			.map( link => message_of( land, link ) )
	}

	function write( land: $giper_baza_land, moment: number, text: string, author = '' ) {
		const message = land.Data( $bog_gram_session ).Messages( 'auto' )!.make( null )
		message.Text( 'auto' )?.val( text )
		message.Moment( 'auto' )?.val( moment )
		if( author ) message.Author( 'auto' )?.val( author )
		return message
	}

	$mol_test({

		async 'Избранное собирается изо всех своих лендов, пишется в указанный'( $ ) {

			const store = $giper_baza_land.make({ $ }).Data( $bog_gram_dialogs )
			const account = $bog_gram_account.make({ $, dialogs_store: ()=> store })
			const talk = $bog_gram_talk.make({ $, Account: ()=> account })

			const first = 'AAAAAAAA_BBBBBBBB'
			const second = 'CCCCCCCC_DDDDDDDD'

			$mol_assert_equal( talk.saved_links().length, 0 )
			$mol_assert_equal( talk.saved_is( first ), false )

			store.Saved_land( 'auto' )?.val( first )
			store.Saved_lands( 'auto' )!.add( first )
			$mol_assert_equal( talk.saved_links().join(), first )

			store.Saved_lands( 'auto' )!.add( second )
			store.Saved_land( 'auto' )?.val( second )

			$mol_assert_equal( talk.saved_is( first ), true )
			$mol_assert_equal( talk.saved_is( second ), true )
			$mol_assert_equal( talk.saved_is( 'DialogPlain' ), false )
			$mol_assert_equal( talk.saved_is( '' ), false )

			const links = talk.saved_links()
			$mol_assert_equal( links.length, 2 )
			$mol_assert_equal( links[ links.length - 1 ], second )
			$mol_assert_equal( talk.links_of( second ).join(), links.join() )
			$mol_assert_equal( talk.links_of( first ).join(), links.join() )

		},

		'Бакеты идут друг за другом по первому сообщению, внутри порядок списка'( $ ) {

			const talk = $bog_gram_talk.make({ $ })

			const early = $giper_baza_land.make({ $ })
			const late = $giper_baza_land.make({ $ })

			write( early, 1000, 'первое' )
			write( early, 900, 'второе' )
			write( late, 5000, 'третье' )
			write( late, 6000, 'четвёртое' )

			const text = ( list: readonly $bog_gram_message[] )=> list.map( item => item.Text()!.val() ).join( ' ' )

			$mol_assert_equal( text( talk.messages_merge([ list_of( early ), list_of( late ) ]) ), 'первое второе третье четвёртое' )
			$mol_assert_equal( text( talk.messages_merge([ list_of( late ), list_of( early ) ]) ), 'первое второе третье четвёртое' )
			$mol_assert_equal( text( talk.messages_merge([ [], list_of( early ), [] ]) ), 'первое второе' )
			$mol_assert_equal( talk.messages_merge( [] ).length, 0 )

			const tie_one = $giper_baza_land.make({ $ })
			const tie_two = $giper_baza_land.make({ $ })
			write( tie_one, 5000, 'один' )
			write( tie_two, 5000, 'два' )

			$mol_assert_equal(
				text( talk.messages_merge([ list_of( tie_one ), list_of( tie_two ) ]) ),
				text( talk.messages_merge([ list_of( tie_two ), list_of( tie_one ) ]) ),
			)

		},

		'Своё сообщение в диалоге считается, чужое и удалённое нет'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const talk = $bog_gram_talk.make({ $ })

			$mol_assert_equal( talk.mine_among( [], 'LordMine' ), false )

			write( land, 1000, 'Эй', 'LordPeer' )
			$mol_assert_equal( talk.mine_among( list_of( land ), 'LordMine' ), false )

			const mine = write( land, 2000, 'Привет', 'LordMine' )
			$mol_assert_equal( talk.mine_among( list_of( land ), 'LordMine' ), true )

			mine.Deleted( 'auto' )?.val( 3000 )
			$mol_assert_equal( talk.mine_among( list_of( land ), 'LordMine' ), false )

		},

		'Непрочитанные считаются с хвоста до своей отметки, свои и удалённые не в счёт'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const talk = $bog_gram_talk.make({ $ })

			write( land, 1000, 'старое', 'LordPeer' )
			write( land, 2000, 'моё', 'LordMine' )
			write( land, 3000, 'новое', 'LordPeer' )
			write( land, 4000, 'ещё', 'LordPeer' ).Deleted( 'auto' )?.val( 4500 )
			write( land, 5000, 'последнее', 'LordPeer' )

			$mol_assert_equal( talk.unread_since( list_of( land ), 'LordMine', 0 ), 3 )
			$mol_assert_equal( talk.unread_since( list_of( land ), 'LordMine', 2000 ), 2 )
			$mol_assert_equal( talk.unread_since( list_of( land ), 'LordMine', 5000 ), 0 )
			$mol_assert_equal( talk.unread_since( list_of( land ), 'LordMine', 0, 2 ), 2 )

		},

		'Свой ответ отмечает прочитанным всё до него'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const talk = $bog_gram_talk.make({ $, lands_of: ()=> [ land ], messages_of: ()=> list_of( land ) })

			write( land, 1000, 'старое', 'LordPeer' )
			write( land, 2000, 'ещё старое', 'LordPeer' )
			$mol_assert_equal( talk.read_moment_of( 'dialog', 'LordMine' ), 0 )

			write( land, 3000, 'ответ', 'LordMine' )
			write( land, 4000, 'новое', 'LordPeer' )

			$mol_assert_equal( talk.read_moment_of( 'dialog', 'LordMine' ), 3000 )
			$mol_assert_equal( talk.read_moment_of( 'dialog', 'LordPeer' ), 4000 )

			land.Data( $bog_gram_session ).Reads( 'auto' )!.key( 'LordMine', 'auto' )!.Moment( 'auto' )!.val( 4000 )
			$mol_assert_equal( talk.read_moment_of( 'dialog', 'LordMine' ), 4000 )

		},

		'Пока отметка прочтения едет, её чтение ждёт, а не отдаёт ноль'( $ ) {

			const wait = new Promise( ()=> {} )
			const talk = $bog_gram_talk.make({ $, lands_of: ()=> [ { Data: ()=> { throw wait } } ] as any })

			let thrown = null as unknown
			try { talk.read_moment_of( 'dialog', 'Me' ) } catch( error ) { thrown = error }

			$mol_assert_equal( thrown, wait )

		},

	})

}
