namespace $.$$ {

	$mol_test({

		'Плашка реакции несёт счёт, повторное нажатие на свою снимает её'( $ ) {

			const puts = [] as string[]
			const bubble = $bog_gram_bubble.make({ $,
				reactions: ()=> [ '🔥', '👍', '🔥' ],
				react: ( next?: string )=> {
					if( next !== undefined ) puts.push( next )
					return '🔥'
				},
			})

			$mol_assert_equal( bubble.reaction_chips().length, 2 )
			$mol_assert_equal( bubble.reaction_label( '🔥' ), '🔥 2' )
			$mol_assert_equal( bubble.reaction_mine( '🔥' ), true )
			$mol_assert_equal( bubble.reaction_mine( '👍' ), false )

			bubble.reaction_toggle( '👍' )
			bubble.reaction_toggle( '🔥' )
			$mol_assert_equal( puts, [ '👍', '' ] )

		},

		'Без реакций строки плашек нет, выбор открыт только по кнопке'( $ ) {

			const bubble = $bog_gram_bubble.make({ $ })

			$mol_assert_equal( bubble.Reactions(), null! )
			$mol_assert_equal( bubble.Palette(), null! )

		},

		async 'Ссылка на объект Базы даёт карточку, без имени или без ссылки её нет'( $ ) {

			const land = await $mol_wire_async( ()=> {
				const land = $.$giper_baza_glob.land_grab()
				new $mol_wire_atom( 'bog_gram_bubble_card', ()=> $.$giper_baza_glob.Land( land.link() ) ).fresh()
				return land
			} )()

			const make = ( text: string )=> $bog_gram_bubble.make({ $, body: ()=> text })
			const bubble = make( `глянь https://x.y/#!link=${ land.link().str }` )

			$mol_assert_equal( make( 'привет personal_property' ).Card(), null! )
			$mol_assert_equal( await $mol_wire_async( bubble ).Card(), null! )

			await $mol_wire_async( land.Data( $giper_baza_flex_subj ) ).name( 'Молоко' )
			$mol_assert_equal( ( await $mol_wire_async( bubble ).Card() ).name(), 'Молоко' )

		},

	})

}
