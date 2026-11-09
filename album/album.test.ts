namespace $.$$ {

	$mol_test({

		'Раскладка альбома как в TG: рядом, большой и два, сетка, дальше рядами'() {

			const shape = ( ratios: number[] )=> $bog_gram_album.layout( ratios ).map( row => row.cells.map( cell => cell.tiles ) )

			$mol_assert_equal( $bog_gram_album.layout([ 4 / 3 ]), [ { ratio: 4 / 3, cells: [ { tiles: [ 0 ], grow: 1 } ] } ] )
			$mol_assert_equal( $bog_gram_album.layout([ 0 ])[0].ratio, 1 )

			$mol_assert_equal( $bog_gram_album.layout([ 1.5, 0.5 ]), [ { ratio: 2, cells: [ { tiles: [ 0 ], grow: 1.5 }, { tiles: [ 1 ], grow: 0.5 } ] } ] )
			$mol_assert_equal( $bog_gram_album.layout([ 10, 0.01 ])[0].ratio, 2.5 )

			$mol_assert_equal( shape([ 1, 1, 1 ]), [ [ [ 0 ], [ 1, 2 ] ] ] )
			$mol_assert_equal( shape([ 1, 1, 1, 1 ]), [ [ [ 0 ], [ 1 ] ], [ [ 2 ], [ 3 ] ] ] )
			$mol_assert_equal( shape([ 1, 1, 1, 1, 1 ]), [ [ [ 0 ], [ 1 ] ], [ [ 2 ], [ 3 ], [ 4 ] ] ] )
			$mol_assert_equal( shape([ 1, 1, 1, 1, 1, 1, 1 ]), [ [ [ 0 ], [ 1 ] ], [ [ 2 ], [ 3 ] ], [ [ 4 ], [ 5 ], [ 6 ] ] ] )
			$mol_assert_equal( $bog_gram_album.layout([]), [] )

		},

	})

}
