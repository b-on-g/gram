namespace $ {

	$mol_test({

		'Скрытая вкладка и окно без фокуса не перед глазами'( $ ) {

			const doc = { visibilityState: 'visible', hasFocus: ()=> true }

			class Awake extends $bog_gram_awake {
				static override $ = $.$mol_ambient({ $mol_dom_context: { document: doc } as any })
			}

			$mol_assert_equal( Awake.now(), true )

			doc.visibilityState = 'hidden'
			$mol_assert_equal( Awake.now(), false )

			doc.visibilityState = 'visible'
			doc.hasFocus = ()=> false
			$mol_assert_equal( Awake.now(), false )

		},

	})

}
