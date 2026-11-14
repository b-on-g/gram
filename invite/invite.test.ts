namespace $ {

	$mol_test({

		async 'Ссылка несёт лорд и ключ, ключ адрес не ломает'( $ ) {

			const auth = await $.$giper_baza_auth._generate()
			const lord = auth.pass().lord().str
			const key = auth.pass().toString()

			const invite = $bog_gram_invite.make({ $ })

			$mol_assert_equal( invite.uri( lord, key ), $.$mol_state_arg.make_link({ invite: lord, key }) )
			$mol_assert_equal( invite.uri( lord, '' ), $.$mol_state_arg.make_link({ invite: lord }) )
			$mol_assert_equal( invite.uri( '', '' ), '' )
			$mol_assert_equal( encodeURIComponent( key ), key )

		},

		'Своя и битая ссылки диалога не заводят, знакомый открывается'( $ ) {

			const invite = $bog_gram_invite.make({ $ })

			const my = 'LordMine'
			const other = 'LordOthr_Bbbbbbbb'

			$mol_assert_equal( invite.plan( my, my, '' ), 'skip' )
			$mol_assert_equal( invite.plan( '', my, '' ), 'skip' )
			$mol_assert_equal( invite.plan( 'не ссылка', my, '' ), 'bad' )
			$mol_assert_equal( invite.plan( other, my, 'DialogLink' ), 'open' )
			$mol_assert_equal( invite.plan( other, my, '' ), 'start' )

		},

		'Ожидание ключа собеседника объясняется на экране'( $ ) {

			const invite = $bog_gram_invite.make({ $ })
			const other = 'LordOthr_Bbbbbbbb'

			$mol_assert_equal( invite.plate(), '' )

			invite.pending( other )
			$mol_assert_equal( invite.plate(), $bog_gram_text.make({ $ }).invite_wait() )

			invite.late( other )
			$mol_assert_equal( invite.plate(), $bog_gram_text.make({ $ }).invite_late() )

			invite.pending( 'LordThrd_Cccccccc' )
			$mol_assert_equal( invite.plate(), $bog_gram_text.make({ $ }).invite_wait() )

			invite.lost( 'мусор' )
			$mol_assert_equal( invite.plate(), $bog_gram_text.make({ $ }).invite_lost() )

			invite.drop()
			$mol_assert_equal( invite.plate(), '' )

		},

	})

}
