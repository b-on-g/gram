namespace $ {

	async function stand( $: $ ) {

		const from = $giper_baza_land.make({ $ }).Data( $bog_gram_session )
		const into = $giper_baza_land.make({ $ }).Data( $bog_gram_session )

		const auth = await $.$giper_baza_auth._generate()
		const pass = auth.pass()

		const forward = $bog_gram_forward.make({
			$,
			Account: ()=> ({ my_lord: ()=> 'Me' }) as any,
			Talk: ()=> ({
				session: ()=> into,
				saved_is: ()=> false,
				mates: ()=> [ 'Mate' ],
			}) as any,
			People: ()=> ({
				passes_of: ( lords: readonly string[] )=> lords.map( ()=> pass ),
				pass_of: ( lord: string )=> lord === 'Known' ? pass : null,
				name: ()=> 'Иван',
				label: ( lord: string )=> lord,
			}) as any,
		})

		const write = ()=> {
			const message = from.Messages( 'auto' )!.make( null )
			message.Author( 'auto' )?.val( 'Author' )
			message.Moment( 'auto' )?.val( 1000 )
			return message
		}

		const file = ( bytes: number[] )=> {
			const store = $.$giper_baza_glob.land_grab([ [ null, $giper_baza_rank_deny ] ]).Data( $giper_baza_file )
			store.buffer( new Uint8Array( bytes ) )
			store.type( 'image/png' )
			return store
		}

		const sent = ()=> ( ( into.Messages()?.items() ?? [] ) as readonly $giper_baza_link[] )
			.map( link => into.land().Pawn( $bog_gram_message ).Head( link.head() ) )

		return { forward, write, file, sent, pass }
	}

	$mol_test({

		async 'Пересланный текст — копия без автора оригинала и без ответа'( $ ) {

			const { forward, write, sent } = await stand( $ )

			const source = write()
			source.Text( 'auto' )?.val( 'привет' )
			source.Reply( 'auto' )?.val( 'Somewhere' )

			$mol_assert_equal( Boolean( await $mol_wire_async( forward ).copy( source, 'Target' ) ), true )

			const [ copy ] = sent()
			$mol_assert_equal( sent().length, 1 )
			$mol_assert_equal( copy.Text()?.val(), 'привет' )
			$mol_assert_equal( copy.Forwarded()?.val(), true )
			$mol_assert_equal( copy.Author()?.val(), 'Me' )
			$mol_assert_equal( copy.Reply()?.val() ?? '', '' )

		},

		async 'Кадр пересылается в новый закрытый ленд с теми же байтами'( $ ) {

			const { forward, write, file, sent } = await stand( $ )

			const source = write()
			const origin = await $mol_wire_async( file )([ 1, 2, 3 ])
			source.Image( 'auto' )!.remote( origin )
			source.Image_width( 'auto' )?.val( 30 )
			source.Image_height( 'auto' )?.val( 20 )

			await $mol_wire_async( forward ).copy( source, 'Target' )

			const [ copy ] = sent()
			const image = copy.Image()!.remote()!

			$mol_assert_equal( [ ... await $mol_wire_async( image ).buffer() ], [ 1, 2, 3 ] )
			$mol_assert_equal( image.land().link().str === origin.land().link().str, false )
			$mol_assert_equal( copy.Image_width()?.val(), 30 )
			$mol_assert_equal( copy.Shots()?.remote_list().length, 1 )

		},

		async 'Незагруженное вложение не пересылается и ничего не пишет'( $ ) {

			const { forward, write, file, sent } = await stand( $ )

			const source = write()
			source.Voice( 'auto' )!.remote( await $mol_wire_async( file )( [] ) )

			$mol_assert_equal( await $mol_wire_async( forward ).copy( source, 'Target' ), '' )
			$mol_assert_equal( forward.error(), forward.Text().forward_unloaded() )
			$mol_assert_equal( sent().length, 0 )

		},

		async 'Контакт уходит ключом и именем, без ключа делиться нечем'( $ ) {

			const { forward, sent, pass: known } = await stand( $ )

			$mol_assert_equal( await $mol_wire_async( forward ).contact( 'Stranger', 'Target' ), '' )
			$mol_assert_equal( forward.error(), forward.Text().contact_unknown() )
			$mol_assert_equal( sent().length, 0 )

			await $mol_wire_async( forward ).contact( 'Known', 'Target' )

			const [ card ] = sent()
			const pass = String( card.Contact()?.val() )
			$mol_assert_equal( $bog_gram_forward.contact_lord( pass ), known.lord().str )
			$mol_assert_equal( card.Contact_name()?.val(), 'Иван' )
			$mol_assert_equal( $bog_gram_forward.contact_lord( 'мусор' ), '' )

		},

	})

}
