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

	})

}
