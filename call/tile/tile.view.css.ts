namespace $.$$ {

	$mol_style_define( $bog_gram_call_tile, {

		position: 'relative',
		flex: {
			grow: 1,
			shrink: 1,
			basis: '18rem',
		},
		aspectRatio: '4 / 3',
		maxHeight: '100%',
		overflow: 'hidden',
		border: {
			radius: $mol_gap.round,
		},
		background: {
			color: $mol_theme.card,
		},

		Video: {
			position: 'absolute',
			inset: '0',
			width: '100%',
			height: '100%',
			objectFit: 'cover',
		},

		Face: {
			position: 'absolute',
			inset: '0',
			display: 'none',
			justify: {
				content: 'center',
			},
			align: {
				items: 'center',
			},
			font: {
				size: '3rem',
			},
			color: $mol_theme.shade,
		},

		Stats: {
			position: 'absolute',
			left: $mol_gap.block,
			top: $mol_gap.block,
			padding: {
				left: $mol_gap.text,
				right: $mol_gap.text,
			},
			border: {
				radius: $mol_gap.round,
			},
			background: {
				color: $mol_theme.back,
			},
			font: {
				size: '.75rem',
			},
			opacity: .8,
		},

		Label: {
			position: 'absolute',
			left: $mol_gap.block,
			bottom: $mol_gap.block,
			align: {
				items: 'center',
			},
			gap: $mol_gap.text,
			padding: {
				left: $mol_gap.text,
				right: $mol_gap.text,
			},
			border: {
				radius: $mol_gap.round,
			},
			background: {
				color: $mol_theme.back,
			},
		},

		'@': {
			bog_gram_call_tile_cam: {
				false: {
					Video: {
						opacity: 0,
					},
					Face: {
						display: 'flex',
					},
				},
			},
			bog_gram_call_tile_mirror: {
				true: {
					Video: {
						transform: 'scaleX(-1)',
					},
				},
			},
		},

	} )

}
