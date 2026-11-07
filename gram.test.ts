namespace $.$$ {

	$mol_test({

		async 'Тап по диалогу открывает его сразу'( $ ) {

			const app = $bog_gram.make({ $ })

			await $mol_wire_async( app ).dialog_select( 'dialog' )

			$mol_assert_equal( app.dialog_current(), 'dialog' )

		},

	})

}
