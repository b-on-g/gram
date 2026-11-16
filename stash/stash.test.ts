namespace $ {

	$mol_test({

		async 'Куски записи склеиваются по порядку, длина и диалог берутся с последнего'() {

			const part = ( text: string, span: number )=> ({
				dialog: 'DialogA',
				kind: 'round' as const,
				type: 'video/mp4',
				span,
				data: new $mol_blob( [ text ], { type: 'video/mp4' } ),
			})

			const joined = $bog_gram_stash.join([ part( 'раз', 1 ), part( 'два', 2 ), part( 'три', 3 ) ])!

			$mol_assert_equal( joined.dialog, 'DialogA' )
			$mol_assert_equal( joined.kind, 'round' )
			$mol_assert_equal( joined.span, 3 )
			$mol_assert_equal( await joined.blob.text(), 'раздватри' )

			$mol_assert_equal( $bog_gram_stash.join( [] ), null )

		},

	})

}
