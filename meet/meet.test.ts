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
					meet.Talk().lords = ()=> [] as string[]

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

	})

}
