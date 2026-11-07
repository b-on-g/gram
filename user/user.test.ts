namespace $ {

	$mol_test({

		async 'Имя и ссылка на лобби пишутся и читаются'( $ ) {

			const land = $giper_baza_land.make({ $ })

			const user = land.Data( $bog_gram_user )
			user.Name( 'auto' )?.val( 'Алиса' )
			user.Inbox_land( 'auto' )?.val( 'InboxLink1' )

			$mol_assert_equal( user.Name()!.val(), 'Алиса' )
			$mol_assert_equal( user.Inbox_land()!.val(), 'InboxLink1' )

		},

	})

}
