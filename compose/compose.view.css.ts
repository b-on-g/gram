namespace $.$$ {

	$mol_style_define( $bog_gram_compose, {

		Peer_form: {
			flex: {
				direction: 'column',
			},
			gap: $mol_gap.block,
		},

		Users_title: {
			font: {
				weight: 'bold',
			},
			color: $mol_theme.shade,
			padding: {
				top: $mol_gap.block,
				bottom: 0,
				left: 0,
				right: 0,
			},
		},

		Users_list: {
			gap: '0.125rem',
		},

		Users_empty: {
			padding: $mol_gap.block,
			color: $mol_theme.shade,
		},

		Join_plate: {
			align: {
				items: 'center',
			},
			gap: '0.5rem',
			minWidth: 0,
			padding: {
				top: '0.5rem',
				bottom: '0.5rem',
				left: '0.75rem',
				right: '0.75rem',
			},
			background: {
				color: $bog_gram_tone.veil,
			},
			borderRadius: '0.75rem',
		},

		Join_plate_text: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			font: {
				size: '0.875rem',
			},
			color: $mol_theme.shade,
		},

		Join_plate_button: {
			flex: {
				shrink: 0,
			},
		},

		'@media': {
			'(max-width: 30rem)': {
				Users_list: {
					gap: 0,
				},
			},
		},

	} )

}
