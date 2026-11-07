namespace $ {

	$mol_test({

		'Звать людей может только админ, назначать админов только создатель'( $ ) {

			const plain = $bog_gram_members.make({ $, me: ()=> 'Me', lords: ()=> [ 'Me', 'Ann' ] })
			$mol_assert_equal( plain.add_rows(), [] )
			$mol_assert_equal( plain.Rule( 'Ann' ), null )
			$mol_assert_equal( plain.Drop( 'Ann' ), null )
			$mol_assert_equal( plain.Drop_note(), null )

			const admin = $bog_gram_members.make({ $, me: ()=> 'Me', admin: ()=> true })
			$mol_assert_equal( admin.add_rows().includes( admin.Admin_note() ), false )
			$mol_assert_equal( admin.Rule( 'Ann' ), null )
			$mol_assert_equal( admin.Drop( 'Me' ), null )
			$mol_assert_equal( admin.Drop( 'Ann' ) === null, false )

			const owner = $bog_gram_members.make({ $, me: ()=> 'Me', admin: ()=> true, owner: ()=> true, admin_is: ( lord: string )=> lord === 'Bob' })
			$mol_assert_equal( owner.add_rows().includes( owner.Admin_note() ), true )
			$mol_assert_equal( owner.Rule( 'Ann' ) === null, false )
			$mol_assert_equal( owner.Rule( 'Bob' ), null )
			$mol_assert_equal( owner.member_title( 'Me' ), 'Вы' )

		},

		'Убрать участника можно только вторым нажатием'( $ ) {

			const parted = [] as string[]
			const members = $bog_gram_members.make({ $,
				lords: ()=> [ 'Ann', 'Bob' ],
				part: ( lord: string )=> { parted.push( lord ); return null },
			})

			members.drop_click( 'Ann' )
			$mol_assert_equal( members.armed( 'Ann' ), true )
			$mol_assert_equal( members.drop_hint( 'Ann' ), 'Точно убрать? Прошлые сообщения у него останутся' )

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
			$mol_assert_equal( members.error(), 'Это ваш собственный идентификатор' )

			members.id( 'мусор' )
			members.id_add()
			$mol_assert_equal( members.error(), 'Это не похоже на идентификатор' )

			members.id( 'AAAAAAAA_BBBBBBBB' )
			members.id_add()
			$mol_assert_equal( members.error(), '' )
			$mol_assert_equal( added, [ 'AAAAAAAA_BBBBBBBB' ] )

		},

	})

}
