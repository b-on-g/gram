namespace $ {

	$mol_test({

		'Выбранные отмечаются в списке и называются числом'( $ ) {

			const group = $bog_gram_group.make({ $,
				contact_lords: ()=> [ 'LordA', 'LordB' ],
				picked: ()=> [ 'LordB' ],
			})

			$mol_assert_equal( group.pick_rows().length, 2 )
			$mol_assert_equal( group.Pick_mark( 'LordA' ), null )
			$mol_assert_equal( group.Pick_mark( 'LordB' ) === null, false )
			$mol_assert_equal( group.chosen_rows().length, 1 )
			$mol_assert_equal( group.chosen_head(), '1 участник' )

			const empty = $bog_gram_group.make({ $ })
			$mol_assert_equal( empty.chosen_head(), 'Пока никого не выбрали' )

		},

		'Потерянные ключи называются по именам, а кнопка создаёт без них'( $ ) {

			const group = $bog_gram_group.make({ $,
				lost: ()=> [ 'LordA' ],
				label: ( lord: string )=> lord === 'LordA' ? 'Аня' : lord,
			})

			$mol_assert_equal( group.lost_note().startsWith( 'Не нашли ключей: Аня.' ), true )
			$mol_assert_equal( group.make_label(), 'Создать без них' )

			const clean = $bog_gram_group.make({ $ })
			$mol_assert_equal( clean.Lost_note(), null )
			$mol_assert_equal( clean.make_label(), 'Создать группу' )

		},

	})

}
