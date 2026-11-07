namespace $ {

	$mol_test({

		'Без ключа человека группа сперва не создаётся, а называет потерю'( $ ) {

			const people = $bog_gram_people.make({ $, pass_of: ()=> null })
			const account = $bog_gram_account.make({ $, my_lord: ()=> 'LordMine' })
			const crew = $bog_gram_crew.make({ $, People: ()=> people, Account: ()=> account })

			$mol_assert_equal( crew.group_make( 'Дача', [ 'LordLost' ], false ), { id: '', lost: [ 'LordLost' ] } )
			$mol_assert_equal( crew.group_make( 'Дача', [ 'LordLost' ], true ), { id: '', lost: [] } )
			$mol_assert_equal( crew.group_make( 'Дача', [ 'LordMine' ], false ), { id: '', lost: [] } )

		},

		async 'Исключённый теряет новый бакет, но не старый'( $ ) {

			const king_dialog = await $.$giper_baza_auth._generate()
			const king_old = await $.$giper_baza_auth._generate()
			const king_new = await $.$giper_baza_auth._generate()
			const auth_stay = await $.$giper_baza_auth._generate()
			const auth_out = await $.$giper_baza_auth._generate()

			const lord_stay = auth_stay.pass().lord().str
			const lord_out = auth_out.pass().lord().str

			const dialog = $giper_baza_land.make({ $, auth: ()=> king_dialog })
			const old_bucket = $giper_baza_land.make({ $, auth: ()=> king_old })
			const new_bucket = $giper_baza_land.make({ $, auth: ()=> king_new })

			await $mol_wire_async( old_bucket ).encrypted( true )
			await $mol_wire_async( new_bucket ).encrypted( true )

			const ops = {

				start() {
					old_bucket.give( auth_stay.pass(), $giper_baza_rank_post( 'just' ) )
					old_bucket.give( auth_out.pass(), $giper_baza_rank_post( 'just' ) )
					return true
				},

				part() {
					new_bucket.give( auth_stay.pass(), $giper_baza_rank_post( 'just' ) )
					return true
				},

				fill() {
					const data = dialog.Data( $bog_gram_dialog )
					data.Peers( 'auto' )!.add( king_dialog.pass().lord().str )
					data.Peers( 'auto' )!.add( lord_stay )
					data.Peers( 'auto' )!.add( lord_out )
					data.Sessions( 'auto' )!.add( old_bucket.link().str )
					data.Sessions( 'auto' )!.add( new_bucket.link().str )
					data.Peers( 'auto' )!.cut( lord_out )
					return true
				},

				read() {
					const data = dialog.Data( $bog_gram_dialog )
					return {
						peers: ( data.Peers()!.items() as readonly string[] ).map( String ),
						sessions: ( data.Sessions()!.items() as readonly string[] ).map( String ),
						out_old: old_bucket.lord_rank( auth_out.pass().lord() ),
						out_new: new_bucket.lord_rank( auth_out.pass().lord() ),
						stay_new: new_bucket.lord_rank( auth_stay.pass().lord() ),
					}
				},

			}

			await $mol_wire_async( ops ).start()
			await $mol_wire_async( ops ).part()
			await $mol_wire_async( ops ).fill()

			const state = await $mol_wire_async( ops ).read()

			$mol_assert_equal( state.peers.includes( lord_out ), false )
			$mol_assert_equal( state.peers.includes( lord_stay ), true )
			$mol_assert_equal( state.sessions.length, 2 )
			$mol_assert_equal( state.sessions.includes( old_bucket.link().str ), true )
			$mol_assert_equal( state.sessions.includes( new_bucket.link().str ), true )
			$mol_assert_equal( state.out_old, $giper_baza_rank_post( 'just' ) )
			$mol_assert_equal( state.out_new, $giper_baza_rank_deny )
			$mol_assert_equal( state.stay_new, $giper_baza_rank_post( 'just' ) )

		},

		async 'Добавленный без истории видит только новый бакет'( $ ) {

			const king_dialog = await $.$giper_baza_auth._generate()
			const king_old = await $.$giper_baza_auth._generate()
			const king_fresh = await $.$giper_baza_auth._generate()
			const auth_old = await $.$giper_baza_auth._generate()
			const auth_new = await $.$giper_baza_auth._generate()

			const dialog = $giper_baza_land.make({ $, auth: ()=> king_dialog })
			const old_bucket = $giper_baza_land.make({ $, auth: ()=> king_old })
			const fresh = $giper_baza_land.make({ $, auth: ()=> king_fresh })

			await $mol_wire_async( old_bucket ).encrypted( true )
			await $mol_wire_async( fresh ).encrypted( true )

			const ops = {

				start() {
					old_bucket.give( auth_old.pass(), $giper_baza_rank_post( 'just' ) )
					return true
				},

				join() {
					fresh.give( auth_old.pass(), $giper_baza_rank_post( 'just' ) )
					fresh.give( auth_new.pass(), $giper_baza_rank_post( 'just' ) )
					return true
				},

				fill() {
					const data = dialog.Data( $bog_gram_dialog )
					data.Peers( 'auto' )!.add( auth_old.pass().lord().str )
					data.Sessions( 'auto' )!.add( old_bucket.link().str )
					data.Peers( 'auto' )!.add( auth_new.pass().lord().str )
					data.Sessions( 'auto' )!.add( fresh.link().str )
					return true
				},

				read() {
					const data = dialog.Data( $bog_gram_dialog )
					return {
						sessions: ( data.Sessions()!.items() as readonly string[] ).length,
						new_old: old_bucket.lord_rank( auth_new.pass().lord() ),
						new_fresh: fresh.lord_rank( auth_new.pass().lord() ),
						old_old: old_bucket.lord_rank( auth_old.pass().lord() ),
						old_fresh: fresh.lord_rank( auth_old.pass().lord() ),
						king_old_rank: old_bucket.lord_rank( king_old.pass().lord() ),
						king_fresh_rank: fresh.lord_rank( king_fresh.pass().lord() ),
					}
				},

			}

			await $mol_wire_async( ops ).start()
			await $mol_wire_async( ops ).join()
			await $mol_wire_async( ops ).fill()

			const state = await $mol_wire_async( ops ).read()

			$mol_assert_equal( state.sessions, 2 )
			$mol_assert_equal( state.new_old, $giper_baza_rank_deny )
			$mol_assert_equal( state.new_fresh, $giper_baza_rank_post( 'just' ) )
			$mol_assert_equal( state.old_old, $giper_baza_rank_post( 'just' ) )
			$mol_assert_equal( state.old_fresh, $giper_baza_rank_post( 'just' ) )
			$mol_assert_equal( state.king_old_rank, $giper_baza_rank_rule )
			$mol_assert_equal( state.king_fresh_rank, $giper_baza_rank_rule )

		},

	})

}
