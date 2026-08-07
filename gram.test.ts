namespace $.$$ {

	function message_of( land: $giper_baza_land, link: $giper_baza_link ) {
		return land.Pawn( $bog_gram_message ).Head( link.head() )
	}

	$mol_test({

		async 'Схема: профиль, диалог, сессия, сообщение пишутся и читаются'( $ ) {

			const land = $giper_baza_land.make({ $ })

			const user = land.Data( $bog_gram_user )
			user.Name( 'auto' )?.val( 'Алиса' )
			user.Inbox_land( 'auto' )?.val( 'InboxLink1' )
			$mol_assert_equal( user.Name()!.val(), 'Алиса' )
			$mol_assert_equal( user.Inbox_land()!.val(), 'InboxLink1' )

			const dialog = land.Data( $bog_gram_dialog )
			dialog.Peers( 'auto' )!.add( 'LordA' )
			dialog.Peers( 'auto' )!.add( 'LordB' )
			dialog.Sessions( 'auto' )!.add( 'SessionLink1' )
			$mol_assert_equal( ( dialog.Peers()!.items() as readonly string[] ).length, 2 )
			$mol_assert_equal( ( dialog.Sessions()!.items() as readonly string[] )[0], 'SessionLink1' )

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

		async 'Диалог: два пользователя обмениваются сообщениями через CRDT-синк'( $ ) {

			const king_dialog = await $.$giper_baza_auth.generate()
			const king_session = await $.$giper_baza_auth.generate()
			const auth_a = await $.$giper_baza_auth.generate()
			const auth_b = await $.$giper_baza_auth.generate()

			const lord_a = auth_a.pass().lord().str
			const lord_b = auth_b.pass().lord().str

			// Инициатор (кинг ленда) раздаёт права обоим участникам
			const dialog0 = $giper_baza_land.make({ $, auth: ()=> king_dialog })
			dialog0.give( auth_a.pass(), $giper_baza_rank_rule )
			dialog0.give( auth_b.pass(), $giper_baza_rank_post( 'just' ) )

			const session0 = $giper_baza_land.make({ $, auth: ()=> king_session })
			session0.give( auth_a.pass(), $giper_baza_rank_rule )
			session0.give( auth_b.pass(), $giper_baza_rank_post( 'just' ) )

			// Копия пользователя A
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

			// Копия пользователя B: стягивает состояние A
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

			// B отвечает
			const msg_b = session_b.Data( $bog_gram_session ).Messages( 'auto' )!.make( null )
			msg_b.Text( 'auto' )?.val( 'Привет, A!' )
			msg_b.Author( 'auto' )?.val( lord_b )
			msg_b.Moment( 'auto' )?.val( 2000 )

			// A стягивает ответ B
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

		async 'Шифрование: участник с гифтом читает и пишет данные диалога'( $ ) {

			const king = await $.$giper_baza_auth.generate()
			const auth_b = await $.$giper_baza_auth.generate()

			const land0 = $giper_baza_land.make({ $, auth: ()=> king })
			await $mol_wire_async( land0 ).encrypted( true )
			$mol_assert_equal( land0.encrypted(), true )

			const land_b = $giper_baza_land.make({ $, link: ()=> land0.link(), auth: ()=> auth_b })

			// Крипто-операции асинхронные — каждый шаг гоняем в своей фибре с ретраями
			const ops = {

				king_writes() {
					land0.give( auth_b.pass(), $giper_baza_rank_post( 'just' ) )
					land0.Data( $bog_gram_dialog ).Peers( 'auto' )!.add( 'SecretLordA' )
					return true
				},

				b_reads() {
					return ( land_b.Data( $bog_gram_dialog ).Peers()!.items() as readonly string[] ).slice()
				},

				b_writes() {
					land_b.Data( $bog_gram_dialog ).Peers( 'auto' )!.add( 'SecretLordB' )
					return true
				},

				king_reads() {
					return ( land0.Data( $bog_gram_dialog ).Peers()!.items() as readonly string[] ).slice()
				},

			}

			await $mol_wire_async( ops ).king_writes()
			await $mol_wire_async( land_b ).units_steal( land0 )

			const peers_b = await $mol_wire_async( ops ).b_reads()
			$mol_assert_equal( peers_b.includes( 'SecretLordA' ), true )

			// Участник с правом post может дописывать в шифрованный ленд
			await $mol_wire_async( ops ).b_writes()
			await $mol_wire_async( land0 ).units_steal( land_b )
			const peers0 = await $mol_wire_async( ops ).king_reads()
			$mol_assert_equal( peers0.includes( 'SecretLordB' ), true )

		},

		async 'Inbox-лобби: чужой пользователь доставляет инвайт владельцу'( $ ) {

			const owner = await $.$giper_baza_auth.generate()
			const stranger = await $.$giper_baza_auth.generate()

			const inbox0 = $giper_baza_land.make({ $, auth: ()=> owner })
			inbox0.give( null, $giper_baza_rank_post( 'just' ) )

			const inbox_stranger = $giper_baza_land.make({ $, link: ()=> inbox0.link(), auth: ()=> stranger })
			await $mol_wire_async( inbox_stranger ).units_steal( inbox0 )

			inbox_stranger.Data( $bog_gram_inbox ).Invites( 'auto' )!.add( 'NewDialogLink' )

			await $mol_wire_async( inbox0 ).units_steal( inbox_stranger )

			const invites = ( inbox0.Data( $bog_gram_inbox ).Invites()!.items() as readonly string[] )
			$mol_assert_equal( invites.includes( 'NewDialogLink' ), true )

		},

		async 'Удалённый диалог не возвращается инвайтом'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const store = land.Data( $bog_gram_dialogs )

			store.Dialogs( 'auto' )!.add( 'DialogKeep' )
			store.Dialogs( 'auto' )!.add( 'DialogDrop' )

			// Удаление из своего списка: ссылка уходит из Dialogs и оседает в Hidden
			store.Dialogs( 'auto' )!.cut( 'DialogDrop' )
			store.Hidden( 'auto' )!.add( 'DialogDrop' )

			const dialogs = ( store.Dialogs()!.items() as readonly string[] ).map( String )
			$mol_assert_equal( dialogs.length, 1 )
			$mol_assert_equal( dialogs[0], 'DialogKeep' )

			const hidden = new Set( ( store.Hidden()!.items() as readonly string[] ).map( String ) )
			$mol_assert_equal( hidden.has( 'DialogDrop' ), true )
			$mol_assert_equal( hidden.has( 'DialogKeep' ), false )

			// Собеседник шлёт инвайты на оба ленда: скрытый отсеивается, живой проходит
			const merged = [ 'DialogKeep', 'DialogDrop' ].filter( link => !hidden.has( link ) )
			$mol_assert_equal( merged.length, 1 )
			$mol_assert_equal( merged[0], 'DialogKeep' )

		},

		async 'Реестр пользователей: конкурентная регистрация мержится без конфликтов'( $ ) {

			const king = await $.$giper_baza_auth.generate()
			const auth_a = await $.$giper_baza_auth.generate()
			const auth_b = await $.$giper_baza_auth.generate()

			const registry0 = $giper_baza_land.make({ $, auth: ()=> king })
			registry0.give( null, $giper_baza_rank_post( 'just' ) )

			const registry_a = $giper_baza_land.make({ $, link: ()=> registry0.link(), auth: ()=> auth_a })
			await $mol_wire_async( registry_a ).units_steal( registry0 )
			const registry_b = $giper_baza_land.make({ $, link: ()=> registry0.link(), auth: ()=> auth_b })
			await $mol_wire_async( registry_b ).units_steal( registry0 )

			// Оба регистрируются, не видя друг друга
			registry_a.Data( $bog_gram_users ).Lords( 'auto' )!.add( auth_a.pass().lord().str )
			registry_b.Data( $bog_gram_users ).Lords( 'auto' )!.add( auth_b.pass().lord().str )

			// Взаимный синк
			await $mol_wire_async( registry_a ).units_steal( registry_b )
			await $mol_wire_async( registry_b ).units_steal( registry_a )

			const lords_a = ( registry_a.Data( $bog_gram_users ).Lords()!.items() as readonly string[] )
			const lords_b = ( registry_b.Data( $bog_gram_users ).Lords()!.items() as readonly string[] )

			$mol_assert_equal( lords_a.includes( auth_a.pass().lord().str ), true )
			$mol_assert_equal( lords_a.includes( auth_b.pass().lord().str ), true )
			$mol_assert_equal( lords_a.length, lords_b.length )

		},

		async 'Вступление в реестр — явное действие, чтение список не меняет'( $ ) {

			const king = await $.$giper_baza_auth.generate()
			const guest = await $.$giper_baza_auth.generate()

			const guest_lord = guest.pass().lord().str

			const registry0 = $giper_baza_land.make({ $, auth: ()=> king })
			registry0.give( null, $giper_baza_rank_post( 'just' ) )

			// Гость просто открыл ссылку и прочитал реестр
			const registry_guest = $giper_baza_land.make({ $, link: ()=> registry0.link(), auth: ()=> guest })
			await $mol_wire_async( registry_guest ).units_steal( registry0 )

			const before = ( registry_guest.Data( $bog_gram_users ).Lords()?.items() ?? [] ) as readonly string[]
			$mol_assert_equal( before.length, 0 )

			// Запись появляется только от явного вступления
			registry_guest.Data( $bog_gram_users ).Lords( 'auto' )!.add( guest_lord )

			const after = ( registry_guest.Data( $bog_gram_users ).Lords()!.items() as readonly string[] )
			$mol_assert_equal( after.includes( guest_lord ), true )

			// И доезжает до владельца реестра
			await $mol_wire_async( registry0 ).units_steal( registry_guest )
			const owner_side = ( registry0.Data( $bog_gram_users ).Lords()!.items() as readonly string[] )
			$mol_assert_equal( owner_side.includes( guest_lord ), true )

		},

		async 'Название реестра задаёт создатель, видит участник'( $ ) {

			const king = await $.$giper_baza_auth.generate()
			const guest = await $.$giper_baza_auth.generate()

			const king_lord = king.pass().lord().str

			const registry0 = $giper_baza_land.make({ $, auth: ()=> king })
			registry0.give( null, $giper_baza_rank_post( 'just' ) )

			const data0 = registry0.Data( $bog_gram_users )
			data0.Title( 'auto' )?.val( 'Соседи по даче' )
			data0.Lords( 'auto' )!.add( king_lord )

			const registry_guest = $giper_baza_land.make({ $, link: ()=> registry0.link(), auth: ()=> guest })
			await $mol_wire_async( registry_guest ).units_steal( registry0 )

			const data_guest = registry_guest.Data( $bog_gram_users )
			$mol_assert_equal( data_guest.Title()!.val(), 'Соседи по даче' )
			$mol_assert_equal( ( data_guest.Lords()!.items() as readonly string[] ).includes( king_lord ), true )

		},

		async 'Забыть реестр — локальная операция, запись в нём остаётся'( $ ) {

			const king = await $.$giper_baza_auth.generate()
			const me = await $.$giper_baza_auth.generate()

			const my_lord = me.pass().lord().str

			const registry0 = $giper_baza_land.make({ $, auth: ()=> king })
			registry0.give( null, $giper_baza_rank_post( 'just' ) )

			const registry_me = $giper_baza_land.make({ $, link: ()=> registry0.link(), auth: ()=> me })
			await $mol_wire_async( registry_me ).units_steal( registry0 )
			registry_me.Data( $bog_gram_users ).Lords( 'auto' )!.add( my_lord )

			// Свой приватный список известных реестров
			const private_land = $giper_baza_land.make({ $, auth: ()=> me })
			const store = private_land.Data( $bog_gram_dialogs )
			const link = registry0.link().str

			store.Registries( 'auto' )!.add( link )
			store.Registries( 'auto' )!.add( 'OtherRegistry' )

			store.Registries( 'auto' )!.cut( link )

			const known = ( store.Registries()!.items() as readonly string[] ).map( String )
			$mol_assert_equal( known.includes( link ), false )
			$mol_assert_equal( known.includes( 'OtherRegistry' ), true )

			// Из самого реестра это не выкидывает
			const lords = ( registry_me.Data( $bog_gram_users ).Lords()!.items() as readonly string[] )
			$mol_assert_equal( lords.includes( my_lord ), true )

		},

		async 'Ключ участника доезжает до других через реестр'( $ ) {

			const king = await $.$giper_baza_auth.generate()
			const auth_a = await $.$giper_baza_auth.generate()
			const auth_b = await $.$giper_baza_auth.generate()

			const lord_a = auth_a.pass().lord().str
			const key_a = auth_a.pass().toString()

			const registry0 = $giper_baza_land.make({ $, auth: ()=> king })
			registry0.give( null, $giper_baza_rank_post( 'just' ) )

			// A вступает в реестр: рядом со своим идентификатором кладёт и ключ
			const registry_a = $giper_baza_land.make({ $, link: ()=> registry0.link(), auth: ()=> auth_a })
			await $mol_wire_async( registry_a ).units_steal( registry0 )

			const data_a = registry_a.Data( $bog_gram_users )
			data_a.Lords( 'auto' )!.add( lord_a )
			data_a.Keys( 'auto' )?.key( lord_a, 'auto' )?.Pass( 'auto' )?.val( key_a )

			// B стягивает реестр и находит там ключ A
			const registry_b = $giper_baza_land.make({ $, link: ()=> registry0.link(), auth: ()=> auth_b })
			await $mol_wire_async( registry_b ).units_steal( registry_a )

			const data_b = registry_b.Data( $bog_gram_users )
			$mol_assert_equal( ( data_b.Lords()!.items() as readonly string[] ).includes( lord_a ), true )

			const got = String( data_b.Keys()?.key( lord_a )?.Pass()?.val() ?? '' )
			$mol_assert_equal( got, key_a )

			// Из строки собирается тот самый ключ: по нему и выдаются права
			const app = $bog_gram.make({ $ })
			$mol_assert_equal( app.pass_verified( lord_a, got )?.lord().str, lord_a )

			// Ключи лежат по ключу-лорду и соседей не задевают
			$mol_assert_equal( Boolean( data_b.Keys()?.key( auth_b.pass().lord().str ) ), false )

		},

		async 'Подложенный ключ не принимается: идентификатор его не подтверждает'( $ ) {

			const auth_a = await $.$giper_baza_auth.generate()
			const auth_b = await $.$giper_baza_auth.generate()

			const lord_a = auth_a.pass().lord().str
			const app = $bog_gram.make({ $ })

			// Свой ключ под своей записью проходит
			$mol_assert_equal( app.pass_verified( lord_a, auth_a.pass().toString() )?.lord().str, lord_a )

			// Реестр открыт всем, и чужой ключ под записью A мог положить кто
			// угодно: идентификатор это хеш ключа, пересчёт ловит подмену
			$mol_assert_equal( app.pass_verified( lord_a, auth_b.pass().toString() ), null )
			$mol_assert_equal( app.pass_verified( auth_b.pass().lord().str, auth_a.pass().toString() ), null )

		},

		async 'Мусор вместо ключа не роняет разбор'( $ ) {

			const auth = await $.$giper_baza_auth.generate()
			const lord = auth.pass().lord().str
			const app = $bog_gram.make({ $ })

			// Ни строки короче ключа, ни строки нужной длины из чего попало
			$mol_assert_equal( app.pass_verified( lord, 'не ключ' ), null )
			$mol_assert_equal( app.pass_verified( lord, 'a'.repeat( 43 ) ), null )
			$mol_assert_equal( app.pass_verified( lord, 'a'.repeat( 86 ) ), null )

			// Пустого места в реестре тоже достаточно, чтобы ничего не делать
			$mol_assert_equal( app.pass_verified( lord, '' ), null )
			$mol_assert_equal( app.pass_verified( '', auth.pass().toString() ), null )

		},

		async 'Ссылка в группу: участника открывает, остальных ведёт к заявке'( $ ) {

			const owner = await $.$giper_baza_auth.generate()
			const owner_lord = owner.pass().lord().str
			const group = new $giper_baza_link( owner_lord + '_KJhgFdSa' ).str
			const my = 'LordMine'

			const app = $bog_gram.make({ $, join_owner_of: ()=> owner_lord })

			// В ссылке едут и ленд группы, и её создатель: заявку несут в его
			// лобби, а из шифрованного ленда группы просящий его не узнает —
			// прав на неё у него ещё нет, и ленд ему не читается вовсе
			const location = $.$mol_dom_context.location
			const uri = app.join_uri( group )
			$mol_assert_equal( uri, location.origin + location.pathname + '#!join=' + group + '/by=' + owner_lord )
			$mol_assert_equal( uri.slice( uri.indexOf( '#' ) ), '#!join=' + group + '/by=' + owner_lord )
			$mol_assert_equal( app.join_uri( '' ), '' )

			// Создателя взять неоткуда — ссылка выходит прежней, куцей
			const blind = $bog_gram.make({ $, join_owner_of: ()=> '' })
			$mol_assert_equal( blind.join_uri( group ), location.origin + location.pathname + '#!join=' + group )

			// Уже в группе — просто открываем, ещё нет — просимся
			$mol_assert_equal( app.join_plan( group, my, true ), 'open' )
			$mol_assert_equal( app.join_plan( group, my, false ), 'ask' )

			// Пустой параметр, свой же идентификатор и мусор заявку не заводят
			$mol_assert_equal( app.join_plan( '', my, false ), 'skip' )
			$mol_assert_equal( app.join_plan( my, my, false ), 'skip' )
			$mol_assert_equal( app.join_plan( 'не ссылка', my, false ), 'skip' )

		},

		async 'Запись очереди заявок помнит создателя группы'( $ ) {

			const app = $bog_gram.make({ $ })

			const group = 'AAAAAAAA_BBBBBBBB'
			const owner = 'CCCCCCCC_DDDDDDDD'

			// Очередь переживает перезагрузку страницы, а ссылка-приглашение
			// нет: лорд создателя оседает в самой записи, иначе нести заявку
			// станет некуда — ленд группы просящему не читается
			const task = app.ask_task( group, owner )
			$mol_assert_equal( task, group + '|' + owner )
			$mol_assert_equal( app.ask_task_group( task ), group )
			$mol_assert_equal( app.ask_task_owner( task ), owner )

			// Заявки, заведённые до появления лорда в записи, читаются по-прежнему
			$mol_assert_equal( app.ask_task( group, '' ), group )
			$mol_assert_equal( app.ask_task_group( group ), group )
			$mol_assert_equal( app.ask_task_owner( group ), '' )

		},

		async 'Плашка заявок не обещает отправку раньше времени'( $ ) {

			const group = 'AAAAAAAA_BBBBBBBB'
			const task = group + '|' + 'CCCCCCCC_DDDDDDDD'

			// Пока запись лежит в своей очереди, она никуда не доехала: в
			// чужое лобби пишут с перебором подписей, и это занимает время
			const queued = $bog_gram.make({ $, ask_queued: ()=> [ task ], ask_sent: ()=> [], dialog_ids: ()=> [] })
			$mol_assert_equal( queued.ask_plate_text(), 'Заявка отправляется — это не мгновенно' )

			const sent = $bog_gram.make({ $, ask_queued: ()=> [], ask_sent: ()=> [ task ], dialog_ids: ()=> [] })
			$mol_assert_equal( sent.ask_plate_text(), 'Заявка отправлена — ждём, пока её примут' )

			// Приняли — группа появилась в списке диалогов, и плашке нечего сказать
			const taken = $bog_gram.make({ $, ask_queued: ()=> [], ask_sent: ()=> [ task ], dialog_ids: ()=> [ group ] })
			$mol_assert_equal( taken.ask_plate_text(), '' )

			// Ссылка без создателя не притворяется отправленной заявкой
			const lost = $bog_gram.make({ $, ask_queued: ()=> [], ask_sent: ()=> [], dialog_ids: ()=> [] })
			lost.join_lost( group )
			$mol_assert_equal( lost.ask_plate_text(), 'В ссылке нет создателя группы — заявку нести некому, попросите свежую' )

		},

		async 'Заявка в группу: запись собирается и разбирается'( $ ) {

			const app = $bog_gram.make({ $ })

			const guest = await $.$giper_baza_auth.generate()
			const lord = guest.pass().lord().str
			const key = guest.pass().toString()
			const group = new $giper_baza_link( lord + '_KJhgFdSa' ).str

			const entry = app.ask_entry( group, lord, key )
			$mol_assert_equal( entry, group + '|' + lord + '|' + key )

			const ask = app.ask_parse( entry )
			$mol_assert_equal( ask?.group, group )
			$mol_assert_equal( ask?.lord, lord )
			$mol_assert_equal( ask?.pass, key )

			// Ключ приезжает вместе с заявкой: по нему админ и выдаёт права
			$mol_assert_equal( app.pass_verified( ask!.lord, ask!.pass )?.lord().str, lord )

			// Лобби открыто на запись всем, и мусор туда долетает наравне
			// с заявками: разбор его отвергает, а не роняет весь список
			$mol_assert_equal( app.ask_parse( '' ), null )
			$mol_assert_equal( app.ask_parse( 'ТолькоГруппа' ), null )
			$mol_assert_equal( app.ask_parse( group + '|' + lord ), null )
			$mol_assert_equal( app.ask_parse( group + '|' + lord + '|' + key + '|лишнее' ), null )
			$mol_assert_equal( app.ask_parse( '||' ), null )
			$mol_assert_equal( app.ask_parse( group + '||' + key ), null )

			// Мусор на месте ключа разбор проходит, а проверка — нет
			const junk = app.ask_parse( app.ask_entry( group, lord, 'не ключ' ) )
			$mol_assert_equal( junk?.pass, 'не ключ' )
			$mol_assert_equal( app.pass_verified( junk!.lord, junk!.pass ), null )

		},

		async 'Подложенный в заявке ключ не принимается'( $ ) {

			const app = $bog_gram.make({ $ })

			const auth_a = await $.$giper_baza_auth.generate()
			const auth_b = await $.$giper_baza_auth.generate()

			const lord_a = auth_a.pass().lord().str
			const group = new $giper_baza_link( lord_a + '_KJhgFdSa' ).str

			// Своя заявка со своим ключом проходит
			const honest = app.ask_parse( app.ask_entry( group, lord_a, auth_a.pass().toString() ) )
			$mol_assert_equal( app.pass_verified( honest!.lord, honest!.pass )?.lord().str, lord_a )

			// Лобби открыто на запись всем: под лордом A кто угодно кладёт свой
			// ключ. Идентификатор это хеш ключа, пересчёт ловит подмену — иначе
			// в группу попал бы подложивший, а не тот, кого туда звали
			const forged = app.ask_parse( app.ask_entry( group, lord_a, auth_b.pass().toString() ) )
			$mol_assert_equal( forged!.lord, lord_a )
			$mol_assert_equal( app.pass_verified( forged!.lord, forged!.pass ), null )

			// И наоборот: настоящий ключ A под чужим идентификатором
			const swapped = app.ask_parse( app.ask_entry( group, auth_b.pass().lord().str, auth_a.pass().toString() ) )
			$mol_assert_equal( app.pass_verified( swapped!.lord, swapped!.pass ), null )

		},

		async 'Заявка ложится в свой список лобби и снимается решением'( $ ) {

			const owner = await $.$giper_baza_auth.generate()
			const guest = await $.$giper_baza_auth.generate()

			const app = $bog_gram.make({ $ })

			const guest_lord = guest.pass().lord().str
			const group = new $giper_baza_link( owner.pass().lord().str + '_KJhgFdSa' ).str
			const entry = app.ask_entry( group, guest_lord, guest.pass().toString() )

			// Саму доставку через чужое лобби проверяет тест про инвайты: она
			// одна и та же. Здесь важно наше — что заявки живут отдельным
			// списком и что решение их убирает.
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

				/** Читаем отдельным заходом: в одной фибре с записью список
				 * застаётся ещё не осевшим, и счёт скачет от прогона к прогону. */
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

			// Заявки не мешаются с приглашениями: это разные списки
			$mol_assert_equal( filled.invites, 0 )

			// Из записи собирается тот самый ключ: по нему и выдаются права на
			// ленд группы, без всяких реестров
			const ask = app.ask_parse( entry )
			$mol_assert_equal( ask?.group, group )
			$mol_assert_equal( app.pass_verified( ask!.lord, ask!.pass )?.lord().str, guest_lord )

			// Решение по заявке снимает её из лобби, чтобы такие не копились
			await $mol_wire_async( ops ).drop()
			$mol_assert_equal( ( await $mol_wire_async( ops ).read() ).joins.length, 0 )

		},

		async 'Заявка проходит очередь, отправленное и приём'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const store = land.Data( $bog_gram_dialogs )

			const waiting = 'AAAAAAAA_BBBBBBBB'
			const answered = 'CCCCCCCC_DDDDDDDD'

			// Пока никуда не просились, списков заявок нет вовсе
			$mol_assert_equal( ( store.Asks()?.items() ?? [] ).length, 0 )
			$mol_assert_equal( ( store.Asked()?.items() ?? [] ).length, 0 )

			store.Asks( 'auto' )!.add( waiting )
			store.Asks( 'auto' )!.add( answered )

			// Повторный переход по той же ссылке ничего не задваивает
			store.Asks( 'auto' )!.add( waiting )
			$mol_assert_equal( ( store.Asks()!.items() as readonly string[] ).length, 2 )

			// Доехала до чужого лобби: уходит из очереди в отправленные, и
			// второй раз её оттуда уже не пошлют — иначе отклонённая заявка
			// возвращалась бы в лобби сама
			for( const id of [ waiting, answered ] ) {
				store.Asked( 'auto' )!.add( id )
				store.Asks( 'auto' )!.cut( id )
			}
			$mol_assert_equal( ( store.Asks()!.items() as readonly string[] ).length, 0 )
			$mol_assert_equal( ( store.Asked()!.items() as readonly string[] ).length, 2 )

			// Приняли: группа появилась в списке диалогов, заявка снята.
			// Порядок в списках задаётся слиянием, поэтому проверяем состав
			store.Dialogs( 'auto' )!.add( answered )
			store.Asked( 'auto' )!.cut( answered )

			const asked = new Set( ( store.Asked()!.items() as readonly string[] ).map( String ) )
			$mol_assert_equal( asked.has( waiting ), true )
			$mol_assert_equal( asked.has( answered ), false )

			// Ожидание рисуется по тем заявкам, чьих групп ещё нет в списке
			const have = new Set( ( store.Dialogs()!.items() as readonly string[] ).map( String ) )
			const pending = [ ... asked ].filter( id => !have.has( id ) )
			$mol_assert_equal( pending.length, 1 )
			$mol_assert_equal( pending[0], waiting )

			// Заявки не мешаются с отложенными приглашениями: разные списки
			$mol_assert_equal( ( store.Outbox()?.items() ?? [] ).length, 0 )

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

		async 'Правка сообщения синхронизируется вместе с меткой Edited'( $ ) {

			const king = await $.$giper_baza_auth.generate()
			const auth_a = await $.$giper_baza_auth.generate()
			const auth_b = await $.$giper_baza_auth.generate()

			const lord_a = auth_a.pass().lord().str

			const session0 = $giper_baza_land.make({ $, auth: ()=> king })
			session0.give( auth_a.pass(), $giper_baza_rank_rule )
			session0.give( auth_b.pass(), $giper_baza_rank_post( 'just' ) )

			const session_a = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_a })
			await $mol_wire_async( session_a ).units_steal( session0 )

			const msg_a = session_a.Data( $bog_gram_session ).Messages( 'auto' )!.make( null )
			msg_a.Text( 'auto' )?.val( 'первая редакция' )
			msg_a.Author( 'auto' )?.val( lord_a )
			msg_a.Moment( 'auto' )?.val( 1000 )

			const session_b = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_b })
			await $mol_wire_async( session_b ).units_steal( session_a )

			const links_b = session_b.Data( $bog_gram_session ).Messages()!.items() as readonly $giper_baza_link[]
			$mol_assert_equal( links_b.length, 1 )
			$mol_assert_equal( message_of( session_b, links_b[0] ).Text()!.val(), 'первая редакция' )
			$mol_assert_equal( message_of( session_b, links_b[0] ).Edited()?.val() ?? null, null )

			// A правит текст и проставляет момент правки
			msg_a.Text( 'auto' )?.val( 'вторая редакция' )
			msg_a.Edited( 'auto' )?.val( 1500 )

			await $mol_wire_async( session_b ).units_steal( session_a )

			const edited_b = message_of( session_b, links_b[0] )
			$mol_assert_equal( edited_b.Text()!.val(), 'вторая редакция' )
			$mol_assert_equal( edited_b.Edited()!.val(), 1500 )

		},

		async 'Удаление — это флаг Deleted, обе стороны его видят'( $ ) {

			const king = await $.$giper_baza_auth.generate()
			const auth_a = await $.$giper_baza_auth.generate()
			const auth_b = await $.$giper_baza_auth.generate()

			const lord_a = auth_a.pass().lord().str

			const session0 = $giper_baza_land.make({ $, auth: ()=> king })
			session0.give( auth_a.pass(), $giper_baza_rank_rule )
			session0.give( auth_b.pass(), $giper_baza_rank_post( 'just' ) )

			const session_a = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_a })
			await $mol_wire_async( session_a ).units_steal( session0 )

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

			const session_b = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_b })
			await $mol_wire_async( session_b ).units_steal( session_a )

			// Поун никуда не девается: удаление — это метка, а не выкидывание из списка
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

		async 'Позиции прочтения: Reads мержатся по ключу-лорду'( $ ) {

			const king = await $.$giper_baza_auth.generate()
			const auth_a = await $.$giper_baza_auth.generate()
			const auth_b = await $.$giper_baza_auth.generate()

			const lord_a = auth_a.pass().lord().str
			const lord_b = auth_b.pass().lord().str

			const session0 = $giper_baza_land.make({ $, auth: ()=> king })
			session0.give( auth_a.pass(), $giper_baza_rank_rule )
			session0.give( auth_b.pass(), $giper_baza_rank_post( 'just' ) )

			const session_a = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_a })
			await $mol_wire_async( session_a ).units_steal( session0 )
			const session_b = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_b })
			await $mol_wire_async( session_b ).units_steal( session0 )

			// Каждый ставит свою отметку, не видя чужой
			session_a.Data( $bog_gram_session ).Reads( 'auto' )?.key( lord_a, 'auto' )?.Moment( 'auto' )?.val( 1000 )
			session_b.Data( $bog_gram_session ).Reads( 'auto' )?.key( lord_b, 'auto' )?.Moment( 'auto' )?.val( 2000 )

			// Взаимный синк
			await $mol_wire_async( session_a ).units_steal( session_b )
			await $mol_wire_async( session_b ).units_steal( session_a )

			const reads_a = session_a.Data( $bog_gram_session ).Reads()
			$mol_assert_equal( reads_a?.key( lord_a )?.Moment()?.val(), 1000 )
			$mol_assert_equal( reads_a?.key( lord_b )?.Moment()?.val(), 2000 )

			const reads_b = session_b.Data( $bog_gram_session ).Reads()
			$mol_assert_equal( reads_b?.key( lord_a )?.Moment()?.val(), 1000 )
			$mol_assert_equal( reads_b?.key( lord_b )?.Moment()?.val(), 2000 )

		},

		async 'Отметка прочтения сдвигается вперёд и доезжает до собеседника'( $ ) {

			const king = await $.$giper_baza_auth.generate()
			const auth_a = await $.$giper_baza_auth.generate()
			const auth_b = await $.$giper_baza_auth.generate()

			const lord_a = auth_a.pass().lord().str

			const session0 = $giper_baza_land.make({ $, auth: ()=> king })
			session0.give( auth_a.pass(), $giper_baza_rank_rule )
			session0.give( auth_b.pass(), $giper_baza_rank_post( 'just' ) )

			const session_a = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_a })
			await $mol_wire_async( session_a ).units_steal( session0 )
			const session_b = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_b })
			await $mol_wire_async( session_b ).units_steal( session0 )

			session_a.Data( $bog_gram_session ).Reads( 'auto' )?.key( lord_a, 'auto' )?.Moment( 'auto' )?.val( 1000 )
			await $mol_wire_async( session_b ).units_steal( session_a )
			$mol_assert_equal( session_b.Data( $bog_gram_session ).Reads()?.key( lord_a )?.Moment()?.val(), 1000 )

			// Перезапись более поздним моментом: побеждает последняя запись
			session_a.Data( $bog_gram_session ).Reads( 'auto' )?.key( lord_a, 'auto' )?.Moment( 'auto' )?.val( 3000 )
			await $mol_wire_async( session_b ).units_steal( session_a )

			$mol_assert_equal( session_a.Data( $bog_gram_session ).Reads()?.key( lord_a )?.Moment()?.val(), 3000 )
			$mol_assert_equal( session_b.Data( $bog_gram_session ).Reads()?.key( lord_a )?.Moment()?.val(), 3000 )

		},

		async 'Заголовок дня и время сообщения форматируются по-человечески'( $ ) {

			const app = $bog_gram.make({ $ })

			const now = new Date()
			$mol_assert_equal( app.day_title( now.toDateString() ), 'Сегодня' )
			$mol_assert_equal( app.day_title( new Date( now.getTime() - 24 * 60 * 60 * 1000 ).toDateString() ), 'Вчера' )
			$mol_assert_equal( app.day_title( '' ), '' )

			$mol_assert_ok( app.day_title( new Date( 2020, 0, 15 ).toDateString() ).includes( '2020' ) )

			$mol_assert_equal( app.time_hm( new Date( 2020, 0, 15, 9, 5 ).getTime() ), '09:05' )
			$mol_assert_equal( app.time_hm( new Date( 2020, 0, 15, 23, 59 ).getTime() ), '23:59' )

		},

		async 'Приглашение не заводит диалог с самим собой'( $ ) {

			const app = $bog_gram.make({ $ })

			const my = 'LordMine'
			const other = 'LordOther'

			// Ссылка — адрес страницы с одним лишь лордом приглашающего
			const location = $.$mol_dom_context.location
			const uri = app.invite_uri( my )
			$mol_assert_equal( uri, location.origin + location.pathname + '#!invite=' + my )
			$mol_assert_equal( uri.slice( uri.indexOf( '#' ) ), '#!invite=LordMine' )
			$mol_assert_equal( app.invite_uri( '' ), '' )

			// Свою же ссылку и пустой параметр пропускаем мимо
			$mol_assert_equal( app.invite_plan( my, my, '' ), 'skip' )
			$mol_assert_equal( app.invite_plan( '', my, '' ), 'skip' )

			// Чужую: знакомого собеседника открываем, незнакомому заводим диалог
			$mol_assert_equal( app.invite_plan( other, my, 'DialogLink' ), 'open' )
			$mol_assert_equal( app.invite_plan( other, my, '' ), 'start' )

		},

		async 'Архив прячет диалог из списка, но не удаляет'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const store = land.Data( $bog_gram_dialogs )

			store.Dialogs( 'auto' )!.add( 'DialogPlain' )
			store.Dialogs( 'auto' )!.add( 'DialogFolded' )
			store.Archived( 'auto' )!.add( 'DialogFolded' )

			// Сам список диалогов архив не трогает: ссылка остаётся на месте
			const dialogs = ( store.Dialogs()!.items() as readonly string[] ).map( String )
			$mol_assert_equal( dialogs.length, 2 )
			$mol_assert_equal( new Set( dialogs ).has( 'DialogFolded' ), true )

			// Основной список отдаёт одну строку, архив — другую
			const archived = new Set( ( store.Archived()!.items() as readonly string[] ).map( String ) )
			const visible = dialogs.filter( id => !archived.has( id ) )
			$mol_assert_equal( visible.length, 1 )
			$mol_assert_equal( visible[0], 'DialogPlain' )
			$mol_assert_equal( archived.has( 'DialogFolded' ), true )

			// Удалённый диалог в архиве не показывается: он осел в Hidden
			store.Dialogs( 'auto' )!.cut( 'DialogFolded' )
			store.Hidden( 'auto' )!.add( 'DialogFolded' )

			const alive = new Set( ( store.Dialogs()!.items() as readonly string[] ).map( String ) )
			const dropped = new Set( ( store.Hidden()!.items() as readonly string[] ).map( String ) )
			const in_archive = ( store.Archived()!.items() as readonly string[] )
				.map( String )
				.filter( id => alive.has( id ) && !dropped.has( id ) )
			$mol_assert_equal( in_archive.length, 0 )

			// Возврат из архива — снятие одной ссылки, остальное не меняется
			store.Archived( 'auto' )!.cut( 'DialogFolded' )
			$mol_assert_equal( ( store.Archived()!.items() as readonly string[] ).length, 0 )
			$mol_assert_equal( ( store.Dialogs()!.items() as readonly string[] ).length, 1 )

		},

		async 'Избранное живёт в своём ленде'( $ ) {

			const owner = $giper_baza_land.make({ $ })

			// Ссылка на ленд заметок лежит в приватном списке диалогов владельца
			const store = owner.Data( $bog_gram_dialogs )
			store.Saved_land( 'auto' )?.val( 'SavedLandLink' )
			$mol_assert_equal( store.Saved_land()!.val(), 'SavedLandLink' )

			// Данные избранного — обычная сессия: сообщения пишутся и читаются
			const saved = $giper_baza_land.make({ $ })
			const session = saved.Data( $bog_gram_session )

			const note = session.Messages( 'auto' )!.make( null )
			note.Text( 'auto' )?.val( 'Не забыть купить хлеб' )
			note.Author( 'auto' )?.val( 'LordMine' )
			note.Moment( 'auto' )?.val( 1000 )

			const links = session.Messages()!.items() as readonly $giper_baza_link[]
			$mol_assert_equal( links.length, 1 )

			const found = message_of( saved, links[0] )
			$mol_assert_equal( found.Text()!.val(), 'Не забыть купить хлеб' )
			$mol_assert_equal( found.Author()!.val(), 'LordMine' )

			// Правка заметки — та же операция, что и в диалоге
			found.Text( 'auto' )?.val( 'Хлеб и молоко' )
			found.Edited( 'auto' )?.val( 1500 )
			$mol_assert_equal( message_of( saved, links[0] ).Text()!.val(), 'Хлеб и молоко' )

			// Собеседника нет, поэтому отметки прочтения в избранном никто не ставит
			$mol_assert_equal( session.Reads()?.key( 'LordMine' )?.Moment()?.val() ?? 0, 0 )

		},

		async 'Избранное собирается изо всех своих лендов'( $ ) {

			const owner = $giper_baza_land.make({ $ })
			const store = owner.Data( $bog_gram_dialogs )
			const app = $bog_gram.make({ $, dialogs_store: ()=> store })

			const first = 'AAAAAAAA_BBBBBBBB'
			const second = 'CCCCCCCC_DDDDDDDD'

			// Ленда заметок ещё нет: избранного нет ни у одной ссылки
			$mol_assert_equal( app.saved_links().length, 0 )
			$mol_assert_equal( app.saved_is( first ), false )

			store.Saved_land( 'auto' )?.val( first )
			store.Saved_lands( 'auto' )!.add( first )
			$mol_assert_equal( app.saved_links().join(), first )

			// Второе устройство успело завести своё избранное, пока список
			// диалогов был в пути: ссылка указывает на него, но заброшенный
			// ленд остаётся своим — иначе заметки из него пропали бы
			store.Saved_lands( 'auto' )!.add( second )
			store.Saved_land( 'auto' )?.val( second )

			$mol_assert_equal( app.saved_is( first ), true )
			$mol_assert_equal( app.saved_is( second ), true )
			$mol_assert_equal( app.saved_is( 'DialogPlain' ), false )
			$mol_assert_equal( app.saved_is( '' ), false )

			// Читаем изо всех, а пишем в указанный — он идёт последним, и
			// запись всегда уходит в последний отсек
			const links = app.saved_links()
			$mol_assert_equal( links.length, 2 )
			$mol_assert_equal( links[ links.length - 1 ], second )
			$mol_assert_equal( app.session_links_of( second ).join(), links.join() )
			$mol_assert_equal( app.session_links_of( first ).join(), links.join() )

		},

		async 'Картинка сообщения: ссылка и размеры доезжают до собеседника'( $ ) {

			const king = await $.$giper_baza_auth.generate()
			const auth_a = await $.$giper_baza_auth.generate()
			const auth_b = await $.$giper_baza_auth.generate()

			const lord_a = auth_a.pass().lord().str

			const session0 = $giper_baza_land.make({ $, auth: ()=> king })
			session0.give( auth_a.pass(), $giper_baza_rank_rule )
			session0.give( auth_b.pass(), $giper_baza_rank_post( 'just' ) )

			const session_a = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_a })
			await $mol_wire_async( session_a ).units_steal( session0 )

			// Сам кадр лежит в отдельном ленде, в переписку едет только ссылка на него
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

			const session_b = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_b })
			await $mol_wire_async( session_b ).units_steal( session_a )

			const links_b = session_b.Data( $bog_gram_session ).Messages()!.items() as readonly $giper_baza_link[]
			$mol_assert_equal( links_b.length, 1 )

			// Ленд самого кадра тут не поднимаем: он приезжает по сети отдельно,
			// у собеседника от сообщения есть ссылка на него и размеры
			const got = message_of( session_b, links_b[0] )
			$mol_assert_equal( got.Image()!.val()!.str, shot.link().str )
			$mol_assert_equal( got.Image_width()!.val(), 1200 )
			$mol_assert_equal( got.Image_height()!.val(), 900 )

		},

		async 'Сообщение с картинкой без текста остаётся живым и читаемым'( $ ) {

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

			// Подписи нет — и это норма: пустой текст сообщение не ломает
			$mol_assert_equal( found.Text()?.val() ?? '', '' )
			$mol_assert_equal( found.Deleted()?.val() ?? null, null )
			$mol_assert_equal( found.Image()!.val()!.str, shot.link().str )
			$mol_assert_equal( found.Image_width()!.val(), 800 )
			$mol_assert_equal( found.Image_height()!.val(), 600 )

			// Подпись можно дописать правкой, как и любой другой текст
			found.Text( 'auto' )?.val( 'Вид с балкона' )
			found.Edited( 'auto' )?.val( 1500 )
			$mol_assert_equal( message_of( land, links[0] ).Text()!.val(), 'Вид с балкона' )
			$mol_assert_equal( message_of( land, links[0] ).Image()!.val()!.str, shot.link().str )

		},

		async 'Голосовое: ссылка на запись и её длительность доезжают до собеседника'( $ ) {

			const king = await $.$giper_baza_auth.generate()
			const auth_a = await $.$giper_baza_auth.generate()
			const auth_b = await $.$giper_baza_auth.generate()

			const lord_a = auth_a.pass().lord().str

			const session0 = $giper_baza_land.make({ $, auth: ()=> king })
			session0.give( auth_a.pass(), $giper_baza_rank_rule )
			session0.give( auth_b.pass(), $giper_baza_rank_post( 'just' ) )

			const session_a = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_a })
			await $mol_wire_async( session_a ).units_steal( session0 )

			// Сама запись лежит в отдельном ленде, в переписку едет только ссылка
			const sound_land = $giper_baza_land.make({ $, auth: ()=> auth_a })
			const sound = sound_land.Data( $giper_baza_file )
			sound.buffer( new Uint8Array([ 9, 8, 7, 6 ]) )
			sound.type( 'audio/webm' )

			const msg_a = session_a.Data( $bog_gram_session ).Messages( 'auto' )!.make( null )
			msg_a.Author( 'auto' )?.val( lord_a )
			msg_a.Moment( 'auto' )?.val( 1000 )
			msg_a.Voice( 'auto' )!.remote( sound )
			msg_a.Voice_span( 'auto' )?.val( 7.5 )

			const session_b = $giper_baza_land.make({ $, link: ()=> session0.link(), auth: ()=> auth_b })
			await $mol_wire_async( session_b ).units_steal( session_a )

			const links_b = session_b.Data( $bog_gram_session ).Messages()!.items() as readonly $giper_baza_link[]
			$mol_assert_equal( links_b.length, 1 )

			// Ленд самой записи тут не поднимаем: он приезжает по сети отдельно,
			// у собеседника от сообщения есть ссылка на него и длительность
			const got = message_of( session_b, links_b[0] )
			$mol_assert_equal( got.Voice()!.val()!.str, sound.link().str )
			$mol_assert_equal( got.Voice_span()!.val(), 7.5 )

			// Подписи у голосового нет — и это норма
			$mol_assert_equal( got.Text()?.val() ?? '', '' )
			$mol_assert_equal( got.Image()?.val() ?? null, null )

		},

		async 'Длительность записи показывается минутами и секундами'( $ ) {

			$mol_assert_equal( $bog_gram_voice.stamp( 0 ), '0:00' )
			$mol_assert_equal( $bog_gram_voice.stamp( 7 ), '0:07' )
			$mol_assert_equal( $bog_gram_voice.stamp( 59 ), '0:59' )
			$mol_assert_equal( $bog_gram_voice.stamp( 60 ), '1:00' )
			$mol_assert_equal( $bog_gram_voice.stamp( 125 ), '2:05' )
			$mol_assert_equal( $bog_gram_voice.stamp( 5 * 60 ), '5:00' )

			// Доли секунды округляются, отрицательного времени не бывает
			$mol_assert_equal( $bog_gram_voice.stamp( 7.4 ), '0:07' )
			$mol_assert_equal( $bog_gram_voice.stamp( 7.6 ), '0:08' )
			$mol_assert_equal( $bog_gram_voice.stamp( -5 ), '0:00' )

		},

		async 'Пережатие вписывает большую сторону в предел, сохраняя пропорции'( $ ) {

			const wide = $bog_gram_shrink.fit( 4000, 3000, 1600 )
			$mol_assert_equal( wide.width, 1600 )
			$mol_assert_equal( wide.height, 1200 )

			const tall = $bog_gram_shrink.fit( 3000, 4000, 1600 )
			$mol_assert_equal( tall.width, 1200 )
			$mol_assert_equal( tall.height, 1600 )

			const square = $bog_gram_shrink.fit( 2000, 2000, 1600 )
			$mol_assert_equal( square.width, 1600 )
			$mol_assert_equal( square.height, 1600 )

			// Помещается — оставляем как есть: растянутый кадр только потяжелеет
			const small = $bog_gram_shrink.fit( 320, 200, 1600 )
			$mol_assert_equal( small.width, 320 )
			$mol_assert_equal( small.height, 200 )

			// Совсем узкая полоска не схлопывается в ноль
			const strip = $bog_gram_shrink.fit( 4000, 1, 1600 )
			$mol_assert_equal( strip.width, 1600 )
			$mol_assert_equal( strip.height, 1 )

			$mol_assert_equal( $bog_gram_shrink.image_is( new $mol_blob( [], { type: 'image/webp' } ) ), true )
			$mol_assert_equal( $bog_gram_shrink.image_is( new $mol_blob( [], { type: 'text/plain' } ) ), false )

		},

		async 'Подпись собеседника живёт в приватном ленде и перекрывает его имя'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const store = land.Data( $bog_gram_dialogs )

			const peer = 'LordPeerWithVeryLongIdentifier'

			// Пока никого не подписали, словаря подписей нет вовсе
			$mol_assert_equal( store.Notes()?.key( peer )?.Title()?.val() ?? '', '' )

			store.Notes( 'auto' )?.key( peer, 'auto' )?.Title( 'auto' )?.val( 'Костя с работы' )
			$mol_assert_equal( store.Notes()?.key( peer )?.Title()?.val() ?? '', 'Костя с работы' )

			// Подпись лежит по ключу-лорду и соседей не задевает
			$mol_assert_equal( Boolean( store.Notes()?.key( 'LordStranger' ) ), false )

			// Снятая подпись — это пустое значение, а не исчезнувшая запись
			store.Notes( 'auto' )?.key( peer, 'auto' )?.Title( 'auto' )?.val( '' )
			$mol_assert_equal( store.Notes()?.key( peer )?.Title()?.val() ?? '', '' )

			// Приоритет: своя подпись важнее имени из чужого профиля, а без
			// обоих человек показывается сокращённым идентификатором
			const app = $bog_gram.make({ $ })

			$mol_assert_equal( app.label_pick( peer, 'Костя с работы', 'Иииии' ), 'Костя с работы' )
			$mol_assert_equal( app.label_pick( peer, '', 'Иииии' ), 'Иииии' )
			$mol_assert_equal( app.label_pick( peer, '', '' ), app.lord_short( peer ) )
			$mol_assert_equal( app.label_pick( '', 'Костя с работы', 'Иииии' ), '' )

		},

		async 'Приглашение ждёт первого сообщения'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const session = land.Data( $bog_gram_session )
			const app = $bog_gram.make({ $ })

			const my = 'LordMine'
			const peer = 'LordPeer'

			// Диалог только что заведён: показывать собеседнику нечего
			$mol_assert_equal( app.mine_among( [], my ), false )

			// Чужое сообщение приглашения не отпускает: считаются только свои
			const alien = session.Messages( 'auto' )!.make( null )
			alien.Text( 'auto' )?.val( 'Эй' )
			alien.Author( 'auto' )?.val( peer )
			alien.Moment( 'auto' )?.val( 1000 )

			const one = ( session.Messages()!.items() as readonly $giper_baza_link[] )
				.map( link => message_of( land, link ) )
			$mol_assert_equal( one.length, 1 )
			$mol_assert_equal( app.mine_among( one, my ), false )

			// Написал сам — теперь диалогу есть чем себя показать
			const mine = session.Messages( 'auto' )!.make( null )
			mine.Text( 'auto' )?.val( 'Привет' )
			mine.Author( 'auto' )?.val( my )
			mine.Moment( 'auto' )?.val( 2000 )

			const both = ( session.Messages()!.items() as readonly $giper_baza_link[] )
				.map( link => message_of( land, link ) )
			$mol_assert_equal( both.length, 2 )
			$mol_assert_equal( app.mine_among( both, my ), true )

			// Удалённое сообщение из списка живых уходит вместе со своим правом
			// на доставку: список сообщений сюда приходит уже отфильтрованным
			mine.Deleted( 'auto' )?.val( 3000 )
			const alive = both.filter( message => !message.Deleted()?.val() )
			$mol_assert_equal( app.mine_among( alive, my ), false )

		},

		async 'Принятый собеседник уходит из запросов'( $ ) {

			const land = $giper_baza_land.make({ $ })
			const store = land.Data( $bog_gram_dialogs )

			const known = 'LordKnown'
			const stranger = 'LordStranger'

			// Пока никого не принимали, списка согласий нет вовсе
			$mol_assert_equal( ( store.Accepted()?.items() ?? [] ).length, 0 )

			store.Accepted( 'auto' )!.add( known )

			const accepted = new Set( ( store.Accepted()!.items() as readonly string[] ).map( String ) )
			$mol_assert_equal( accepted.has( known ), true )
			$mol_assert_equal( accepted.has( stranger ), false )

			// Повторное согласие ничего не задваивает
			store.Accepted( 'auto' )!.add( known )
			$mol_assert_equal( ( store.Accepted()!.items() as readonly string[] ).length, 1 )

			// Согласие даётся человеку, а отказ прячет ссылку на диалог:
			// это разные записи и друг друга они не задевают
			store.Hidden( 'auto' )!.add( 'DialogFromStranger' )

			const hidden = new Set( ( store.Hidden()!.items() as readonly string[] ).map( String ) )
			$mol_assert_equal( hidden.has( 'DialogFromStranger' ), true )
			$mol_assert_equal( hidden.has( known ), false )
			$mol_assert_equal( ( store.Accepted()!.items() as readonly string[] ).length, 1 )
			$mol_assert_equal( ( store.Archived()?.items() ?? [] ).length, 0 )

		},

		async 'Чужой диалог показывается по сообщениям и знакомству'( $ ) {

			const app = $bog_gram.make({ $ })

			// Свой диалог показывается всегда: пустым его завёл я сам
			$mol_assert_equal( app.dialog_sort( true, false, false ), 'plain' )
			$mol_assert_equal( app.dialog_sort( true, true, false ), 'plain' )

			// Чужой пустой не показывается вовсе, знаком его автор или нет
			$mol_assert_equal( app.dialog_sort( false, false, true ), 'skip' )
			$mol_assert_equal( app.dialog_sort( false, false, false ), 'skip' )

			// Чужой с сообщениями: от знакомого в общий список, от незнакомца в запросы
			$mol_assert_equal( app.dialog_sort( false, true, true ), 'plain' )
			$mol_assert_equal( app.dialog_sort( false, true, false ), 'request' )

			// Создателя приходится записывать прямо в ленд: королём числится
			// служебный ключ, выданный при захвате, и по ссылке ленда автора
			// не узнать. Без записи ответ честно пустой.
			$mol_assert_equal( app.dialog_owner( '' ), '' )

			const auth = await $.$giper_baza_auth.generate()
			const lord = auth.pass().lord().str
			const land = $giper_baza_land.make({ $, auth: ()=> auth })

			const ops = {
				write() {
					land.Data( $bog_gram_dialog ).Owner( 'auto' )?.val( lord )
					return true
				},
				read() {
					return String( land.Data( $bog_gram_dialog ).Owner()?.val() ?? '' )
				},
			}

			await $mol_wire_async( ops ).write()
			$mol_assert_equal( await $mol_wire_async( ops ).read(), lord )

		},

		async 'Сообщения из разных бакетов сливаются по моменту'( $ ) {

			const app = $bog_gram.make({ $ })

			const early = $giper_baza_land.make({ $ })
			const late = $giper_baza_land.make({ $ })

			const write = ( land: $giper_baza_land, moment: number, text: string )=> {
				const message = land.Data( $bog_gram_session ).Messages( 'auto' )!.make( null )
				message.Text( 'auto' )?.val( text )
				message.Moment( 'auto' )?.val( moment )
			}

			const list_of = ( land: $giper_baza_land )=>
				( land.Data( $bog_gram_session ).Messages()!.items() as readonly $giper_baza_link[] )
					.map( link => message_of( land, link ) )

			// Бакеты писались вперемешку: старый не кончается там, где
			// начинается новый — в него ещё дописывали, пока свежий уже жил
			write( early, 1000, 'первое' )
			write( early, 3000, 'третье' )
			write( late, 2000, 'второе' )
			write( late, 4000, 'четвёртое' )

			const merged = app.messages_merge([ list_of( early ), list_of( late ) ])
			$mol_assert_equal( merged.length, 4 )
			$mol_assert_equal( merged.map( item => item.Text()!.val() ).join( ' ' ), 'первое второе третье четвёртое' )

			// Порядок задают данные, а не порядок бакетов: та же склейка
			// наоборот даёт тот же результат
			const back = app.messages_merge([ list_of( late ), list_of( early ) ])
			$mol_assert_equal( back.map( item => item.Text()!.val() ).join( ' ' ), 'первое второе третье четвёртое' )

			// Недоступный бакет приходит сюда пустым списком и ничего не портит
			const alone = app.messages_merge([ [], list_of( early ), [] ])
			$mol_assert_equal( alone.map( item => item.Text()!.val() ).join( ' ' ), 'первое третье' )
			$mol_assert_equal( app.messages_merge( [] ).length, 0 )

			// Совпавшие моменты разводятся ссылкой, поэтому порядок не зависит
			// от того, какой бакет доехал первым
			const tie_one = $giper_baza_land.make({ $ })
			const tie_two = $giper_baza_land.make({ $ })
			write( tie_one, 5000, 'один' )
			write( tie_two, 5000, 'два' )

			const straight = app.messages_merge([ list_of( tie_one ), list_of( tie_two ) ])
			const reverse = app.messages_merge([ list_of( tie_two ), list_of( tie_one ) ])
			$mol_assert_equal(
				straight.map( item => item.Text()!.val() ).join( ' ' ),
				reverse.map( item => item.Text()!.val() ).join( ' ' ),
			)

		},

		async 'Исключённый теряет новый бакет, но не старый'( $ ) {

			// Ссылка ленда выводится из ключа его короля, поэтому каждому ленду
			// нужен свой: с общим ключом это был бы один и тот же ленд в трёх
			// обёртках, и шифрование с раздачей прав уходило бы в клинч
			const king_dialog = await $.$giper_baza_auth.generate()
			const king_old = await $.$giper_baza_auth.generate()
			const king_new = await $.$giper_baza_auth.generate()
			const auth_stay = await $.$giper_baza_auth.generate()
			const auth_out = await $.$giper_baza_auth.generate()

			const lord_stay = auth_stay.pass().lord().str
			const lord_out = auth_out.pass().lord().str

			const dialog = $giper_baza_land.make({ $, auth: ()=> king_dialog })
			const old_bucket = $giper_baza_land.make({ $, auth: ()=> king_old })
			const new_bucket = $giper_baza_land.make({ $, auth: ()=> king_new })

			// Бакеты закрыты ото всех, как и в самом приложении: без гифта
			// такой ленд не читается вовсе
			await $mol_wire_async( old_bucket ).encrypted( true )
			await $mol_wire_async( new_bucket ).encrypted( true )

			// Выдача прав на шифрованный ленд считает общий секрет, поэтому
			// каждый шаг гоняем в своей фибре с ретраями
			const ops = {

				/** Пока в группе трое, права на первый бакет у всех */
				start() {
					old_bucket.give( auth_stay.pass(), $giper_baza_rank_post( 'just' ) )
					old_bucket.give( auth_out.pass(), $giper_baza_rank_post( 'just' ) )
					return true
				},

				/** Исключение: свежий бакет открывается всем, кроме уходящего */
				part() {
					new_bucket.give( auth_stay.pass(), $giper_baza_rank_post( 'just' ) )
					return true
				},

				/** Записи в ленд подписываются, а подпись асинхронна: вне фибры
				 * приостановка не переживается и прогон замирает молча. */
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

				/** Права шифрованного ленда тоже читаем в фибре: обращение к
				 * ним считает секрет, а он приезжает асинхронно. */
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
			const peers = state.peers
			$mol_assert_equal( peers.includes( lord_out ), false )
			$mol_assert_equal( peers.includes( lord_stay ), true )

			// Старый бакет никуда не делся: переписка продолжается в свежем,
			// а прошлое остаётся там, где лежало
			// Порядок в списке задаётся слиянием, а не добавлением, поэтому
			// проверяем состав, а какой бакет свежий — знает отдельный указатель
			const sessions = state.sessions
			$mol_assert_equal( sessions.length, 2 )
			$mol_assert_equal( sessions.includes( old_bucket.link().str ), true )
			$mol_assert_equal( sessions.includes( new_bucket.link().str ), true )

			// Прошлые сообщения у исключённого остаются: ключ от старого бакета
			// ему уже выдали, и отобрать его нечем
			$mol_assert_equal( state.out_old, $giper_baza_rank_post( 'just' ) )

			// А свежего бакета у него нет — закрытый ленд без гифта не читается
			$mol_assert_equal( state.out_new, $giper_baza_rank_deny )
			$mol_assert_equal( state.stay_new, $giper_baza_rank_post( 'just' ) )

		},

		async 'Добавленный без истории видит только новый бакет'( $ ) {

			// Каждому ленду свой король: ссылка выводится из ключа, и общий
			// ключ склеил бы три ленда в один
			const king_dialog = await $.$giper_baza_auth.generate()
			const king_old = await $.$giper_baza_auth.generate()
			const king_fresh = await $.$giper_baza_auth.generate()
			const auth_old = await $.$giper_baza_auth.generate()
			const auth_new = await $.$giper_baza_auth.generate()

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

				/** Новичка зовут без истории: заводится свежий бакет и
				 * открывается нынешним участникам вместе с ним */
				join() {
					fresh.give( auth_old.pass(), $giper_baza_rank_post( 'just' ) )
					fresh.give( auth_new.pass(), $giper_baza_rank_post( 'just' ) )
					return true
				},

				/** Записи в ленд подписываются, а подпись асинхронна: вне фибры
				 * приостановка не переживается и прогон замирает молча. */
				fill() {
					const data = dialog.Data( $bog_gram_dialog )
					data.Peers( 'auto' )!.add( auth_old.pass().lord().str )
					data.Sessions( 'auto' )!.add( old_bucket.link().str )

					data.Peers( 'auto' )!.add( auth_new.pass().lord().str )
					data.Sessions( 'auto' )!.add( fresh.link().str )
					return true
				},

				/** И список бакетов, и права — одним чтением из фибры. */
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

			// В списке бакетов новичок видит оба, а открыть может только свежий
			$mol_assert_equal( state.sessions, 2 )
			$mol_assert_equal( state.new_old, $giper_baza_rank_deny )
			$mol_assert_equal( state.new_fresh, $giper_baza_rank_post( 'just' ) )

			// Старожил продолжает читать и то, и другое
			$mol_assert_equal( state.old_old, $giper_baza_rank_post( 'just' ) )
			$mol_assert_equal( state.old_fresh, $giper_baza_rank_post( 'just' ) )

			// Создатель — король обоих лендов, права у него полные и без гифта
			$mol_assert_equal( state.king_old_rank, $giper_baza_rank_rule )
			$mol_assert_equal( state.king_fresh_rank, $giper_baza_rank_rule )

		},

		async 'В группе вместо галочек — сколько человек прочитало'( $ ) {

			const app = $bog_gram.make({ $ })

			const mates = [ 'LordA', 'LordB', 'LordC' ]

			// Отметка участника — момент последнего прочитанного им сообщения
			const reads = { LordA: 3000, LordB: 1000, LordC: 0 }

			// Раннее сообщение прочитали все, кто вообще заглядывал
			$mol_assert_equal( app.read_tally( reads, mates, 1000 ), 2 )

			// Позднее — только тот, кто дочитал до него
			$mol_assert_equal( app.read_tally( reads, mates, 3000 ), 1 )

			// Самое свежее не прочитал никто
			$mol_assert_equal( app.read_tally( reads, mates, 4000 ), 0 )

			// Отметки того, кого в группе уже нет, счёт не задевают: считаем
			// по списку участников, а не по всему словарю
			$mol_assert_equal( app.read_tally( { ... reads, LordGone: 9000 }, mates, 3000 ), 1 )

			// Ни одной отметки — ноль, а не ошибка
			$mol_assert_equal( app.read_tally( {}, mates, 1000 ), 0 )
			$mol_assert_equal( app.read_tally( reads, [], 1000 ), 0 )

		},

	})

}
