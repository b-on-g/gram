namespace $ {

	$mol_test({

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
