namespace $ {

	$mol_test({

		'Хеш юнита считается один раз и пересчитывается после правки байтов'() {

			const unit = new $giper_baza_unit_seal( new ArrayBuffer( 128 ) )
			unit.kind( 'seal' )

			let count = 0
			const hash_bin = $giper_baza_link.hash_bin
			$giper_baza_link.hash_bin = function( bin ) {
				++ count
				return hash_bin.call( this, bin )
			}

			try {

				const before = unit.hash()
				$mol_assert_equal( unit.hash(), before )
				$mol_assert_equal( count, 1 )

				unit.time( 1 )
				const after = unit.hash()

				$mol_assert_equal( count, 2 )
				$mol_assert_unique( after.str, before.str )
				$mol_assert_equal( after.str, hash_bin.call( $giper_baza_link, unit.asArray() ).str )

			} finally {
				$giper_baza_link.hash_bin = hash_bin
			}

		},

	})

}
