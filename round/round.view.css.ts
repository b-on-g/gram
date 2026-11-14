namespace $.$$ {

	const fill = {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		borderRadius: '50%',
	} as const

	$mol_style_define( $bog_gram_round, {

		position: 'relative',
		width: '13rem',
		maxWidth: '100%',
		aspectRatio: 1,
		borderRadius: '50%',
		overflow: 'hidden',
		cursor: 'pointer',
		background: {
			color: $bog_gram_tone.veil,
		},

		Video: {
			... fill,
			objectFit: 'cover',
		},

		Ring: fill,

		Stamp: {
			position: 'absolute',
			left: '50%',
			bottom: '0.75rem',
			transform: 'translateX(-50%)',
			padding: {
				top: 0,
				bottom: 0,
				left: '0.375rem',
				right: '0.375rem',
			},
			borderRadius: '0.5rem',
			background: {
				color: '#00000080',
			},
			color: '#ffffff',
			font: {
				size: '0.75rem',
			},
		},

		Play: {
			position: 'absolute',
			left: '50%',
			top: '50%',
			transform: 'translate(-50%, -50%)',
			justify: {
				content: 'center',
			},
			align: {
				items: 'center',
			},
			width: '3rem',
			height: '3rem',
			borderRadius: '50%',
			background: {
				color: '#00000080',
			},
			color: '#ffffff',
		},

		Play_icon: {
			width: '1.5rem',
			height: '1.5rem',
		},

	} )

}
