namespace $ {

	class Alerts_switch extends $mol_object {

		@ $mol_mem
		static on( next?: boolean ) {
			return next ?? false
		}

	}

	$mol_test({

		async 'Подписка поднимается один раз, даже когда сама включает уведомления'( $ ) {

			let applied = 0

			const alerts = $bog_gram_alerts.make({ $,
				supported: ()=> true,
				permission: ()=> 'granted' as NotificationPermission,
				on: ( next?: boolean )=> Alerts_switch.on( next ),
				off: ()=> false,
				asked: ()=> false,
				Account: ()=> ({ monitor_link: ()=> 'Monitor', my_lord: ()=> 'Lord' }) as any,
				apply: ( on: boolean )=> {
					++ applied
					Promise.resolve().then( ()=> alerts.on( on ) )
					return on
				},
			})

			alerts.auto()
			await Promise.resolve()
			await Promise.resolve()
			$mol_assert_equal( applied, 1 )
			$mol_assert_equal( alerts.on(), true )

			alerts.auto()
			await Promise.resolve()
			$mol_assert_equal( applied, 1 )

		},

		'Сбой подписки на старте не выключает уведомления, а сброшенное разрешение называется прямо'( $ ) {

			let tried = 0

			const context = $.$mol_ambient({
				$bog_gram_notify: class extends $bog_gram_notify {
					static override daemon() { return null }
					static override subscribe() { ++ tried; return false }
				},
			})

			const make = ( permission: NotificationPermission )=> $bog_gram_alerts.make({ $: context,
				supported: ()=> true,
				permission: ()=> permission,
				on: ( next?: boolean )=> Alerts_switch.on( next ),
				off: ()=> false,
				Account: ()=> ({ monitor_link: ()=> 'Monitor', my_lord: ()=> 'Lord' }) as any,
			})

			Alerts_switch.on( true )

			$mol_assert_equal( make( 'granted' ).apply( true ), false )
			$mol_assert_equal( tried, 1 )
			$mol_assert_equal( Alerts_switch.on(), true )
			$mol_assert_equal( make( 'granted' ).status(), 'Уведомления включены' )

			const reset = make( 'default' )
			$mol_assert_equal( reset.status(), 'Браузер сбросил разрешение — включите снова' )
			$mol_assert_equal( reset.label(), 'Включить уведомления' )

			Alerts_switch.on( false )

		},

		'Уведомления включаются сами, но выключенные руками не возвращаются'( $ ) {

			const alerts = $bog_gram_alerts.make({ $ })

			const plan = ( permission: NotificationPermission, on: boolean, off: boolean, asked: boolean )=>
				alerts.plan( true, permission, on, off, asked )

			$mol_assert_equal( plan( 'granted', false, false, false ), 'subscribe' )
			$mol_assert_equal( plan( 'default', false, false, false ), 'ask' )
			$mol_assert_equal( plan( 'default', false, false, true ), 'skip' )
			$mol_assert_equal( plan( 'denied', false, false, false ), 'skip' )
			$mol_assert_equal( plan( 'granted', true, false, false ), 'subscribe' )
			$mol_assert_equal( plan( 'denied', true, false, false ), 'skip' )
			$mol_assert_equal( plan( 'granted', false, true, false ), 'skip' )
			$mol_assert_equal( plan( 'default', false, true, false ), 'skip' )
			$mol_assert_equal( alerts.plan( false, 'granted', false, false, false ), 'skip' )

		},

		'Подпись под тумблером говорит, что будет дальше'( $ ) {

			const make = ( supported: boolean, permission: NotificationPermission, on: boolean, off: boolean )=> $bog_gram_alerts.make({ $,
				supported: ()=> supported,
				permission: ()=> permission,
				on: ()=> on,
				off: ()=> off,
			})

			$mol_assert_equal( make( false, 'default', false, false ).status(), 'Не поддерживается этим браузером' )
			$mol_assert_equal( make( true, 'denied', false, false ).status(), 'Запрещены в браузере' )
			$mol_assert_equal( make( true, 'granted', true, false ).status(), 'Уведомления включены' )
			$mol_assert_equal( make( true, 'default', false, true ).status(), 'Выключены' )
			$mol_assert_equal( make( true, 'default', false, false ).status(), 'Спросим разрешение, когда откроете диалог' )

		},

	})

}
