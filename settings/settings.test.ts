namespace $.$$ {

	$mol_test({

		'Вставленная ссылка открывается, чужая — объясняется'( $ ) {

			const lord = 'AAAAAAAA_BBBBBBBB'
			const opened = [] as Record< string, string >[]
			let closed = 0

			const context = $.$mol_ambient({
				$bog_gram_follow: class extends $.$bog_gram_follow {
					static override go( uri: string ) {
						const params = this.params( uri )
						if( !Object.keys( params ).length ) return false
						opened.push( params )
						return true
					}
				},
			})

			const page = $bog_gram_settings.make({ $: context })
			page.close = ()=> ( ++ closed, null )

			page.paste_uri( 'https://example.com/#!x=1' )
			page.paste_open()

			$mol_assert_equal( closed, 0 )
			$mol_assert_equal( opened, [] )
			$mol_assert_equal( page.paste_uri(), 'https://example.com/#!x=1' )
			$mol_assert_equal( page.paste_error() !== '', true )

			page.paste_uri( ' https://b-on-g.github.io/gram/#!invite=' + lord + '/key=abc%2Fdef ' )
			$mol_assert_equal( page.paste_error(), '' )
			page.paste_open()

			$mol_assert_equal( closed, 1 )
			$mol_assert_equal( opened, [ { invite: lord, key: 'abc/def' } ] )
			$mol_assert_equal( page.paste_uri(), '' )

		},

	})

}
