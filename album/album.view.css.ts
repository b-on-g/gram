namespace $.$$ {

	const gap = '2px'

	$mol_style_define( $bog_gram_album, {

		flex: {
			direction: 'column',
			shrink: 0,
		},
		gap,
		maxWidth: '100%',
		overflow: 'hidden',
		borderRadius: '0.5rem',

		Row: {
			flex: {
				direction: 'row',
			},
			gap,
			width: '100%',
			minHeight: 0,
			overflow: 'hidden',
		},

		Column: {
			flex: {
				direction: 'column',
				basis: 0,
			},
			gap,
			minWidth: 0,
			minHeight: 0,
		},

		Tile: {
			flex: {
				basis: 0,
				shrink: 1,
			},
			minWidth: 0,
			minHeight: 0,
			maxWidth: 'none',
			borderRadius: '0',
			Image: {
				objectFit: 'cover',
			},
		},

	} )

}
