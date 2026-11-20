namespace $ {

	$mol_test({

		'Звать и убирать людей может только админ, блок прав есть только при ленде'( $ ) {

			const plain = $bog_gram_members.make({ $, me: ()=> 'Me', lords: ()=> [ 'Me', 'Ann' ] })
			$mol_assert_equal( plain.add_rows(), [] )
			$mol_assert_equal( plain.Drop( 'Ann' ), null )
			$mol_assert_equal( plain.Drop_note(), null )
			$mol_assert_equal( plain.Rights_block(), null )
			$mol_assert_equal( plain.Admin_note(), null )
			$mol_assert_equal( plain.member_title( 'Me' ), plain.self_name() )

			const admin = $bog_gram_members.make({ $, me: ()=> 'Me', admin: ()=> true })
			$mol_assert_equal( admin.Drop( 'Me' ), null )
			$mol_assert_equal( admin.Drop( 'Ann' ) === null, false )
			$mol_assert_equal( admin.Admin_note() === null, false )

		},

		'Убрать участника можно только вторым нажатием'( $ ) {

			const parted = [] as string[]
			const members = $bog_gram_members.make({ $,
				lords: ()=> [ 'Ann', 'Bob' ],
				part: ( lord: string )=> { parted.push( lord ); return null },
			})

			members.drop_click( 'Ann' )
			$mol_assert_equal( members.armed( 'Ann' ), true )
			$mol_assert_equal( members.drop_hint( 'Ann' ), members.drop_hint_armed() )

			members.drop_click( 'Bob' )
			$mol_assert_equal( members.armed( 'Ann' ), false )
			$mol_assert_equal( parted, [] )

			members.drop_click( 'Bob' )
			$mol_assert_equal( parted, [ 'Bob' ] )

		},

		'Набранный ID проверяется до добавления'( $ ) {

			const added = [] as string[]
			const members = $bog_gram_members.make({ $,
				me: ()=> 'ikjOnflc_WufmHhGH',
				add: ( lord: string )=> { added.push( lord ); return null },
			})

			members.id( 'ikjOnflc_WufmHhGH' )
			members.id_add()
			$mol_assert_equal( members.error(), members.error_self() )

			members.id( 'мусор' )
			members.id_add()
			$mol_assert_equal( members.error(), members.error_bad() )

			members.id( 'AAAAAAAA_BBBBBBBB' )
			members.id_add()
			$mol_assert_equal( members.error(), '' )
			$mol_assert_equal( added, [ 'AAAAAAAA_BBBBBBBB' ] )

		},

	})

}
