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

		'Пузырь растянут под сетку только при нескольких кадрах'( $ ) {

			const album = ( shots: string[] )=> $bog_gram_bubble.make({ $, shot: ()=> shots.length > 0, shots: ()=> shots }).album()

			$mol_assert_equal( album([]), false )
			$mol_assert_equal( album([ 'a' ]), false )
			$mol_assert_equal( album([ 'a', 'b' ]), true )

		},

		'Без реакций строки плашек нет, выбор открыт только по кнопке'( $ ) {

			const bubble = $bog_gram_bubble.make({ $ })

			$mol_assert_equal( bubble.Reactions(), null! )
			$mol_assert_equal( bubble.Palette(), null! )

		},

	})

}
