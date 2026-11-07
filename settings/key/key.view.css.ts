namespace $.$$ {

	const shrink = {
		alignSelf: 'stretch',
		flex: {
			direction: 'column',
			shrink: 1,
		},
		align: {
			items: 'stretch',
		},
		gap: '0.5rem',
		minWidth: 0,
		maxWidth: '100%',
	} as const

	const qr_box = {
		alignSelf: 'center',
		maxWidth: '100%',
		justify: {
			content: 'center',
		},
		background: {
			color: '#ffffff',
		},
		padding: '0.5rem',
		borderRadius: '0.75rem',
	} as const

	$mol_style_define( $bog_gram_settings_key, {

		... shrink,

		Warning: {
			font: {
				size: '0.875rem',
			},
			color: $bog_gram_tone.alert,
		},

		Row: shrink,

		Text: {
			alignSelf: 'stretch',
			flex: {
				shrink: 1,
			},
			width: '100%',
			minWidth: 0,
			maxWidth: '100%',
			maxHeight: '8rem',
			overflow: {
				y: 'auto',
			},
			font: {
				family: 'monospace',
				size: '0.75rem',
			},
			whiteSpace: 'pre-wrap',
			overflowWrap: 'anywhere',
			userSelect: 'all',
			background: {
				color: $bog_gram_tone.veil,
			},
			padding: {
				top: '0.5rem',
				bottom: '0.5rem',
				left: '0.625rem',
				right: '0.625rem',
			},
			borderRadius: '0.5rem',
		},

		Copy: {
			alignSelf: 'flex-start',
		},

		Save: {
			alignSelf: 'flex-start',
		},

		Qr_box: qr_box,

		Qr: {
			flex: {
				shrink: 0,
			},
			width: '12rem',
			height: '12rem',
			maxWidth: '100%',
		},

		Import_form: shrink,

		Load_row: {
			align: {
				items: 'center',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		Load_hint: {
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

		Error: {
			font: {
				size: '0.875rem',
			},
			color: $bog_gram_tone.alert,
		},

	} )

}
