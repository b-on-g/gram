namespace $.$$ {

	$mol_style_define( $bog_gram_sound, {

		align: {
			items: 'center',
		},
		gap: '0.5rem',
		minWidth: 0,
		maxWidth: '100%',
		padding: {
			top: '0.125rem',
			bottom: '0.125rem',
			left: 0,
			right: 0,
		},

		Toggle: {
			flex: {
				shrink: 0,
			},
			justify: {
				content: 'center',
			},
			align: {
				items: 'center',
			},
			minWidth: '2rem',
			minHeight: '2rem',
			padding: 0,
			borderRadius: '50%',
			background: {
				color: $mol_theme.control,
			},
			color: '#ffffff',
		},

		Play_icon: {
			width: '1.125rem',
			height: '1.125rem',
		},

		Pause_icon: {
			width: '1.125rem',
			height: '1.125rem',
		},

		Track: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: '3rem',
			height: '0.25rem',
			borderRadius: '0.25rem',
			background: {
				color: $bog_gram_tone.veil,
			},
			overflow: 'hidden',
		},

		Fill: {
			height: '100%',
			background: {
				color: $mol_theme.control,
			},
		},

		Stamp: {
			flex: {
				shrink: 0,
			},
			font: {
				size: '0.75rem',
			},
			opacity: .65,
			whiteSpace: 'nowrap',
		},

		Node: {
			display: 'none',
		},

	} )

}
