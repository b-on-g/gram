namespace $ {

	function stand( $: $, permission: NotificationPermission, current: { endpoint: string } | null ) {

		const calls = { ask: 0, make: 0, sent: [] as string[] }
		const sub = ( endpoint: string )=> ({
			endpoint,
			options: { applicationServerKey: new Uint8Array([ 1, 2, 3 ]).buffer },
			toJSON: ()=> ({ endpoint }),
		}) as unknown as PushSubscription

		class Notify extends $bog_gram_notify {
			static override $ = $
			static override api = {
				... $bog_gram_notify.api,
				async permission_ask() { ++ calls.ask; return permission },
				async registration() { return {} as ServiceWorkerRegistration },
				async subscription_get() { return current && sub( current.endpoint ) },
				async subscription_make() { ++ calls.make; return sub( 'https://push.example/new' ) },
			}
			static override supported() { return true }
			static override permission() { return permission }
			static override daemon() { return { key: 'AQID' } }
			static override signed() { return { time: 0, pass: '', sign: '' } }
			static override send( path: string, body: { subscription: { endpoint: string } } ) {
				calls.sent.push( body.subscription.endpoint )
				return null!
			}
		}

		return { Notify, calls }
	}

	$mol_test({

		async 'Разрешение есть, а подписки нет — подписываемся заново без вопроса'( $ ) {
			const { Notify, calls } = stand( $, 'granted', null )
			$mol_assert_equal( await $mol_wire_async( Notify ).subscribe( 'Lord', 'Monitor' ), true )
			$mol_assert_equal( calls, { ask: 0, make: 1, sent: [ 'https://push.example/new' ] } )
		},

		async 'Сменившийся адрес подписки уходит демону без новой подписки'( $ ) {
			const { Notify, calls } = stand( $, 'granted', { endpoint: 'https://push.example/rotated' } )
			$mol_assert_equal( await $mol_wire_async( Notify ).subscribe( 'Lord', 'Monitor' ), true )
			$mol_assert_equal( calls, { ask: 0, make: 0, sent: [ 'https://push.example/rotated' ] } )
		},

		async 'Запрещённые уведомления не трогаем'( $ ) {
			const { Notify, calls } = stand( $, 'denied', null )
			$mol_assert_equal( await $mol_wire_async( Notify ).subscribe( 'Lord', 'Monitor' ), false )
			$mol_assert_equal( calls, { ask: 1, make: 0, sent: [] } )
		},

		async 'Подпись переживает перезапуск фибры и не заводит новую на каждом заходе'( $ ) {

			const auth = await $.$giper_baza_auth._generate()
			const lord = auth.pass().lord().str

			class Notify extends $bog_gram_notify {
				static override $ = $.$mol_ambient({
					$giper_baza_auth: { current: ()=> auth } as any,
				})
			}

			const later = {
				async tick() {
					await Promise.resolve()
					return true
				},
			}

			const proofs = [] as ReturnType< typeof Notify.signed >[]

			const proof = await $mol_wire_async( ()=> {
				const proof = Notify.signed( 'subscribe', lord, 'Monitor', 'https://push.example/1' )
				proofs.push( proof )
				$mol_wire_sync( later ).tick()
				return proof
			} )()

			$mol_assert_equal( proofs.length, 2 )
			$mol_assert_equal( proofs[0], proof )

		},

		async 'Подпись запроса к демону сходится с ключом владельца и ломается от подмены'( $ ) {

			const auth = await $.$giper_baza_auth._generate()
			const other = await $.$giper_baza_auth._generate()
			const lord = auth.pass().lord().str

			class Notify extends $bog_gram_notify {
				static override $ = $.$mol_ambient({
					$giper_baza_auth: { current: ()=> auth } as any,
				})
			}

			const proof = await $mol_wire_async( Notify ).signed( 'subscribe', lord, 'Monitor', 'https://push.example/1' )

			$mol_assert_equal( $giper_baza_auth_pass.from( proof.pass ).lord().str, lord )

			const sign = $mol_base64_url_decode( proof.sign )
			const text = ( monitor: string )=> $mol_charset_encode( Notify.proof( 'subscribe', lord, monitor, 'https://push.example/1', proof.time ) )

			$mol_assert_equal( await auth.pass().auditor().verify( text( 'Monitor' ), sign ), true )
			$mol_assert_equal( await auth.pass().auditor().verify( text( 'Stolen' ), sign ), false )
			$mol_assert_equal( await other.pass().auditor().verify( text( 'Monitor' ), sign ), false )

		},

	})

}
