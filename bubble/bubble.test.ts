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

	})

}
