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

		'Сообщения из разных бакетов сливаются по моменту'( $ ) {

			const talk = $bog_gram_talk.make({ $ })

			const early = $giper_baza_land.make({ $ })
			const late = $giper_baza_land.make({ $ })

			write( early, 1000, 'первое' )
			write( early, 3000, 'третье' )
			write( late, 2000, 'второе' )
			write( late, 4000, 'четвёртое' )

			const text = ( list: readonly $bog_gram_message[] )=> list.map( item => item.Text()!.val() ).join( ' ' )

			$mol_assert_equal( text( talk.messages_merge([ list_of( early ), list_of( late ) ]) ), 'первое второе третье четвёртое' )
			$mol_assert_equal( text( talk.messages_merge([ list_of( late ), list_of( early ) ]) ), 'первое второе третье четвёртое' )
			$mol_assert_equal( text( talk.messages_merge([ [], list_of( early ), [] ]) ), 'первое третье' )
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
			const alive = list_of( land ).filter( message => !message.Deleted()?.val() )
			$mol_assert_equal( talk.mine_among( alive, 'LordMine' ), false )

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
