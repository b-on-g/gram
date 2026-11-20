namespace $ {

	$mol_test({

		async 'Стук в прихожую виден админу группы, а стук от чужого имени нет'( $ ) {

			const meet = $bog_gram_meet.make({ $ })
			const group = 'group_link'

			const ops = {
				run() {

					const land = $.$giper_baza_glob.land_grab([ [ null, $giper_baza_rank_post( 'just' ) ] ])
					const hall = land.Data( $bog_gram_meet_hall )
					const link = land.link().str

					hall.Group( 'auto' )!.val( group )

					meet.meet_of = ( id: string )=> id === group ? link : ''
					meet.Talk().member_is = ()=> false

					const pass = $.$giper_baza_auth.current().pass().toString()
					const own = meet.knock( link, group )
					hall.Knocks( 'auto' )!.add( meet.Lobby().entry( group, 'someone_else', pass ) )

					const owner = meet.Account().my_lord()

					return {
						own,
						group: meet.group_of([ link, owner ]),
						stranger: meet.group_of([ link, land.link().lord().str ]),
						uri: meet.group_of_uri( $.$mol_state_arg.make_link({ meet: link, by: owner }) ),
						knocks: meet.knocks_of( group ),
					}
				},
			}

			const result = await $mol_wire_async( ops ).run()

			$mol_assert_equal( result.group, group )
			$mol_assert_equal( result.stranger, '' )
			$mol_assert_equal( result.uri, group )
			$mol_assert_equal( result.knocks, [ result.own ] )

		},

		async 'Стук впущенного стирается из прихожей, а не прячется'( $ ) {

			const group = 'group_link'
			let hall = ''

			const admin = ( member: string )=> {
				const meet = $bog_gram_meet.make({ $, meet_of: ( id: string )=> id === group ? hall : '', mode: ()=> 'ask' as const })
				meet.Roster().ids = ()=> [ group ]
				meet.Talk().admin_me = ()=> true
				meet.Talk().member_is = ( id: string, lord: string )=> lord === member
				return meet
			}

			const ops = {
				knock() {
					hall = $.$giper_baza_glob.land_grab([ [ null, $giper_baza_rank_post( 'just' ) ] ]).link().str
					return admin( '' ).knock( hall, group )
				},
				admit( member: string ) {
					const meet = admin( member )
					meet.auto()
					return meet.knocks_all( group )
				},
			}

			const own = await $mol_wire_async( ops ).knock()
			const waiting = await $mol_wire_async( ops ).admit( 'someone_else' )
			const left = await $mol_wire_async( ops ).admit( $.$giper_baza_auth.current().pass().lord().str )

			$mol_assert_equal( waiting, [ own ] )
			$mol_assert_equal( left, [] as string[] )

		},

		async 'Приглашение без ключа не открывает чат встречи, ключ к группе и сессии открывает'( $ ) {

			const owner = await $.$giper_baza_auth._generate()
			const session_king = await $.$giper_baza_auth._generate()
			const guest = await $.$giper_baza_auth._generate()
			const guest_lord = guest.pass().lord().str

			const dialog = $giper_baza_land.make({ $, auth: ()=> owner })
			const session = $giper_baza_land.make({ $, auth: ()=> session_king })

			await $mol_wire_async( dialog ).encrypted( true )
			await $mol_wire_async( session ).encrypted( true )

			const group = dialog.link().str

			const dialog_seen = $giper_baza_land.make({ $, link: ()=> dialog.link(), auth: ()=> guest })
			const session_seen = $giper_baza_land.make({ $, link: ()=> session.link(), auth: ()=> guest })
			const lands = new Map([ [ group, dialog_seen ], [ session.link().str, session_seen ] ])

			const store = $giper_baza_land.make({ $ }).Data( $bog_gram_dialogs )
			const account = $bog_gram_account.make({ $, my_lord: ()=> guest_lord, dialogs_store: ()=> store })
			const talk = $bog_gram_talk.make({ $, Account: ()=> account, land: ( id: string )=> lands.get( id )! })
			const roster = $bog_gram_roster.make({ $, Account: ()=> account, ids: ()=> [ group ], hidden: ()=> [] })
			const lobby = $bog_gram_lobby.make({ $, Account: ()=> account, Talk: ()=> talk, Roster: ()=> roster, send: ()=> {} })
			const meet = $bog_gram_meet.make({ $,
				Account: ()=> account,
				Talk: ()=> talk,
				Roster: ()=> roster,
				Lobby: ()=> lobby,
				group_of: ()=> group,
				knock: ()=> '',
			})

			const watch = new $mol_wire_atom( 'watch', ()=> {
				$mol_wire_solid()
				return meet.entered()
			} )

			const ops = {
				fill() {
					const data = dialog.Data( $bog_gram_dialog )
					data.Peers( 'auto' )!.add( owner.pass().lord().str )
					data.Sessions( 'auto' )!.add( session.link().str )
					data.Title( 'auto' )!.val( 'Встреча' )
					return true
				},
				give_dialog() {
					dialog.give( guest.pass(), $giper_baza_rank_post( 'fast' ) )
					return true
				},
				give_session() {
					session.give( guest.pass(), $giper_baza_rank_post( 'fast' ) )
					return true
				},
				take() {
					return meet.take( 'hall', owner.pass().lord().str ).plan
				},
				entered() {
					talk.inside( group )
					return watch.sync()
				},
			}

			const deliver = async()=> {
				await $mol_wire_async( dialog_seen ).units_steal( dialog )
				await $mol_wire_async( session_seen ).units_steal( session )
			}

			await $mol_wire_async( ops ).fill()
			await deliver()
			const before = await $mol_wire_async( ops ).entered()
			const invited = await $mol_wire_async( ops ).take()

			await $mol_wire_async( ops ).give_dialog()
			await deliver()
			const half = await $mol_wire_async( ops ).take()
			const waiting = await $mol_wire_async( ops ).entered()

			await $mol_wire_async( ops ).give_session()
			await deliver()
			const entered = await $mol_wire_async( ops ).entered()
			const full = await $mol_wire_async( ops ).take()

			watch.destructor()

			$mol_assert_equal( before, '' )
			$mol_assert_equal( invited, 'ask' )
			$mol_assert_equal( half, 'ask' )
			$mol_assert_equal( waiting, '' )
			$mol_assert_equal( entered, group )
			$mol_assert_equal( full, 'open' )

		},

	})

}
