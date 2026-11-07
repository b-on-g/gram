namespace $ {

	function lobby_with( context: typeof $$,inbox: $bog_gram_inbox, store: $bog_gram_dialogs ) {
		const account = $bog_gram_account.make({ $: context, inbox_store: ()=> inbox, dialogs_store: ()=> store })
		const roster = $bog_gram_roster.make({ $: context, Account: ()=> account })
		return $bog_gram_lobby.make({ $: context, Account: ()=> account, Roster: ()=> roster })
	}

	$mol_test({

		async 'Ссылка в группу несёт создателя: участника открывает, остальных ведёт к заявке'( $ ) {

			const owner = await $.$giper_baza_auth._generate()
			const owner_lord = owner.pass().lord().str
			const group = new $giper_baza_link( owner_lord + '_KJhgFdSa' ).str
			const my = 'LordMine'

			const lobby = $bog_gram_lobby.make({ $, join_owner_of: ()=> owner_lord })
			const uri = lobby.join_uri( group )
			$mol_assert_equal( uri, $.$mol_state_arg.make_link({ join: group, by: owner_lord }) )
			$mol_assert_equal( lobby.join_uri( '' ), '' )

			const blind = $bog_gram_lobby.make({ $, join_owner_of: ()=> '' })
			$mol_assert_equal( blind.join_uri( group ), $.$mol_state_arg.make_link({ join: group }) )

			$mol_assert_equal( lobby.join_plan( group, my, true ), 'open' )
			$mol_assert_equal( lobby.join_plan( group, my, false ), 'ask' )
			$mol_assert_equal( lobby.join_plan( '', my, false ), 'skip' )
			$mol_assert_equal( lobby.join_plan( my, my, false ), 'skip' )
			$mol_assert_equal( lobby.join_plan( 'не ссылка', my, false ), 'skip' )

		},

		'Запись очереди заявок помнит создателя группы'( $ ) {

			const lobby = $bog_gram_lobby.make({ $ })

			const group = 'AAAAAAAA_BBBBBBBB'
			const owner = 'CCCCCCCC_DDDDDDDD'

			const task = lobby.task( group, owner )
			$mol_assert_equal( task, group + '|' + owner )
			$mol_assert_equal( lobby.task_group( task ), group )
			$mol_assert_equal( lobby.task_owner( task ), owner )

			$mol_assert_equal( lobby.task( group, '' ), group )
			$mol_assert_equal( lobby.task_group( group ), group )
			$mol_assert_equal( lobby.task_owner( group ), '' )

		},

		'Плашка заявок не обещает отправку раньше времени'( $ ) {

			const group = 'AAAAAAAA_BBBBBBBB'
			const task = group + '|CCCCCCCC_DDDDDDDD'

			const make = ( queued: string[], sent: string[], ids: string[] )=> $bog_gram_lobby.make({ $,
				queued: ()=> queued,
				sent: ()=> sent,
				denied: ()=> [],
				Roster: ()=> $bog_gram_roster.make({ $, ids: ()=> ids }),
			})

			$mol_assert_equal( make( [ task ], [], [] ).plate(), 'Заявка отправляется — это не мгновенно' )
			$mol_assert_equal( make( [], [ task ], [] ).plate(), 'Заявка отправлена — ждём, пока её примут' )
			$mol_assert_equal( make( [], [ task ], [ group ] ).plate(), '' )

			const lost = make( [], [], [] )
			lost.lost( group )
			$mol_assert_equal( lost.plate(), 'В ссылке нет создателя группы — заявку нести некому, попросите свежую' )

		},

		'Отказ доезжает до просящего и снимает заявку, но не банит'( $ ) {

			const inbox = $giper_baza_land.make({ $ }).Data( $bog_gram_inbox )
			const store = $giper_baza_land.make({ $ }).Data( $bog_gram_dialogs )
			const lobby = lobby_with( $, inbox, store )

			const group = 'AAAAAAAA_BBBBBBBB'
			const owner = 'CCCCCCCC_DDDDDDDD'
			const task = lobby.task( group, owner )

			store.Asked( 'auto' )!.add( task )
			$mol_assert_equal( lobby.plate(), 'Заявка отправлена — ждём, пока её примут' )

			inbox.Denies( 'auto' )!.add( group )
			lobby.denies_merge()

			$mol_assert_equal( ( store.Asked()!.items() as readonly string[] ).length, 0 )
			$mol_assert_equal( ( inbox.Denies()!.items() as readonly string[] ).length, 0 )
			$mol_assert_equal( lobby.denied().join(), group )
			$mol_assert_equal( lobby.plate(), 'Заявку отклонили — попроситься снова можно по той же ссылке' )

			lobby.send( group, owner )
			$mol_assert_equal( lobby.denied().length, 0 )
			$mol_assert_equal( ( store.Asks()!.items() as readonly string[] ).map( String ).join(), task )
			$mol_assert_equal( lobby.plate(), 'Заявка отправляется — это не мгновенно' )

		},

		'Чужой отказ снимает только свою заявку, а мусор из лобби убирается'( $ ) {

			const inbox = $giper_baza_land.make({ $ }).Data( $bog_gram_inbox )
			const store = $giper_baza_land.make({ $ }).Data( $bog_gram_dialogs )
			const lobby = lobby_with( $, inbox, store )

			store.Asked( 'auto' )!.add( lobby.task( 'AAAAAAAA_BBBBBBBB', 'CCCCCCCC_DDDDDDDD' ) )

			inbox.Denies( 'auto' )!.add( 'EEEEEEEE_FFFFFFFF' )
			lobby.denies_merge()

			$mol_assert_equal( ( store.Asked()!.items() as readonly string[] ).length, 1 )
			$mol_assert_equal( lobby.denied().length, 0 )
			$mol_assert_equal( ( inbox.Denies()!.items() as readonly string[] ).length, 0 )

		},

		async 'Заявка собирается и разбирается, мусор и подложенный ключ отсекаются'( $ ) {

			const lobby = $bog_gram_lobby.make({ $ })

			const guest = await $.$giper_baza_auth._generate()
			const other = await $.$giper_baza_auth._generate()
			const lord = guest.pass().lord().str
			const key = guest.pass().toString()
			const group = new $giper_baza_link( lord + '_KJhgFdSa' ).str

			const entry = lobby.entry( group, lord, key )
			$mol_assert_equal( entry, group + '|' + lord + '|' + key )

			const ask = lobby.parse( entry )
			$mol_assert_equal( ask?.group, group )
			$mol_assert_equal( ask?.lord, lord )
			$mol_assert_equal( $bog_gram_pass.verified( ask!.lord, ask!.pass )?.lord().str, lord )

			$mol_assert_equal( lobby.parse( '' ), null )
			$mol_assert_equal( lobby.parse( 'ТолькоГруппа' ), null )
			$mol_assert_equal( lobby.parse( group + '|' + lord ), null )
			$mol_assert_equal( lobby.parse( group + '|' + lord + '|' + key + '|лишнее' ), null )
			$mol_assert_equal( lobby.parse( '||' ), null )
			$mol_assert_equal( lobby.parse( group + '||' + key ), null )

			const junk = lobby.parse( lobby.entry( group, lord, 'не ключ' ) )
			$mol_assert_equal( junk?.pass, 'не ключ' )
			$mol_assert_equal( $bog_gram_pass.verified( junk!.lord, junk!.pass ), null )

			const forged = lobby.parse( lobby.entry( group, lord, other.pass().toString() ) )
			$mol_assert_equal( $bog_gram_pass.verified( forged!.lord, forged!.pass ), null )

			const swapped = lobby.parse( lobby.entry( group, other.pass().lord().str, key ) )
			$mol_assert_equal( $bog_gram_pass.verified( swapped!.lord, swapped!.pass ), null )

		},

		async 'Заявки живут отдельным списком лобби и снимаются решением'( $ ) {

			const owner = await $.$giper_baza_auth._generate()
			const guest = await $.$giper_baza_auth._generate()

			const lobby = $bog_gram_lobby.make({ $ })
			const group = new $giper_baza_link( owner.pass().lord().str + '_KJhgFdSa' ).str
			const entry = lobby.entry( group, guest.pass().lord().str, guest.pass().toString() )

			const inbox = $giper_baza_land.make({ $, auth: ()=> owner })

			const ops = {
				ask() {
					inbox.Data( $bog_gram_inbox ).Joins( 'auto' )!.add( entry )
					return true
				},
				drop() {
					inbox.Data( $bog_gram_inbox ).Joins( 'auto' )!.cut( entry )
					return true
				},
				read() {
					const data = inbox.Data( $bog_gram_inbox )
					return {
						joins: ( data.Joins()!.items() as readonly string[] ).map( String ),
						invites: ( data.Invites()?.items() ?? [] ).length,
					}
				},
			}

			await $mol_wire_async( ops ).ask()

			const filled = await $mol_wire_async( ops ).read()
			$mol_assert_equal( filled.joins.includes( entry ), true )
			$mol_assert_equal( filled.invites, 0 )

			await $mol_wire_async( ops ).drop()
			$mol_assert_equal( ( await $mol_wire_async( ops ).read() ).joins.length, 0 )

		},

	})

}
