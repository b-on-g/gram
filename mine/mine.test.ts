namespace $ {

	$mol_test({

		async 'Перенос кладёт юниты под их прежние ключи, а не под числовые'( $ ) {

			const old = await $.$mol_db< $bog_gram_mine_schema >( 'bog_gram_mine_test_old',
				mig => mig.store_make( 'Unit' ),
				mig => mig.store_make( 'Ball' ),
			)
			const next = await $.$mol_db< $bog_gram_mine_schema >( 'bog_gram_mine_test_new',
				mig => mig.store_make( 'Unit' ),
				mig => mig.store_make( 'Ball' ),
			)

			try {

				const change = old.change( 'Unit', 'Ball' )
				const unit: [ ArrayBuffer ] = [ new Uint8Array([ 1, 2, 3 ]).buffer ]
				const ball: [ ArrayBuffer ] = [ new Uint8Array([ 4, 5 ]).buffer ]
				await change.stores.Unit.put( unit, [ 'land_a', 'sand:x' ] )
				await change.stores.Ball.put( ball, [ 'land_a', 'sand:x' ] )
				await change.commit()

				$mol_assert_equal( await $bog_gram_mine.copy( old, next ), 1 )

				const unit_got = await next.read( 'Unit' ).Unit.get([ 'land_a', 'sand:x' ])
				const ball_got = await next.read( 'Ball' ).Ball.get([ 'land_a', 'sand:x' ])

				$mol_assert_equal( [ ... new Uint8Array( unit_got![0] ) ], [ 1, 2, 3 ] )
				$mol_assert_equal( [ ... new Uint8Array( ball_got![0] ) ], [ 4, 5 ] )

				const range = $.$mol_dom_context.IDBKeyRange.bound( [ 'land_a', '' ], [ 'land_a', '\uFFFF' ] )
				$mol_assert_equal( ( await next.read( 'Unit' ).Unit.select( range ) ).length, 1 )

			} finally {

				old.destructor()
				await old.kill()
				next.destructor()
				await next.kill()

			}

		},

		async 'Записи под числовыми ключами вычищаются, нормальные остаются'( $ ) {

			const db = await $.$mol_db< $bog_gram_mine_schema >( 'bog_gram_mine_test_clean',
				mig => mig.store_make( 'Unit' ),
				mig => mig.store_make( 'Ball' ),
			)

			try {

				const change = db.change( 'Unit', 'Ball' )
				await change.stores.Unit.put([ new Uint8Array([ 1 ]).buffer ])
				await change.stores.Unit.put([ new Uint8Array([ 2 ]).buffer ], [ 'land_a', 'sand:x' ])
				await change.stores.Ball.put([ new Uint8Array([ 3 ]).buffer ])
				await change.commit()

				await $bog_gram_mine.clean( db )

				$mol_assert_equal( await db.read( 'Unit' ).Unit.count(), 1 )
				$mol_assert_equal( await db.read( 'Ball' ).Ball.count(), 0 )

			} finally {

				db.destructor()
				await db.kill()

			}

		},

		'Из общей базы ничего не выкидывается, если ключи нормальные'( $ ) {

			$mol_assert_equal( $bog_gram_mine.key_ok([ 'land_a', 'sand:x' ]), true )
			$mol_assert_equal( $bog_gram_mine.key_ok([ 1 ]), false )
			$mol_assert_equal( $bog_gram_mine.key_ok([ 'land_a' ]), false )

		},

	})

}
