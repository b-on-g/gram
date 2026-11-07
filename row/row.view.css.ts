namespace $.$$ {

	const veil = '#8888881a'

	const line = {
		display: 'block',
		minWidth: 0,
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	} as const

	$mol_style_define( $bog_gram_row, {

		align: {
			items: 'center',
		},
		gap: '0.75rem',
		padding: {
			top: '0.5rem',
			bottom: '0.5rem',
			left: '0.5rem',
			right: '0.5rem',
		},
		borderRadius: '0.75rem',
		color: $mol_theme.text,
		minWidth: 0,

		'@': {
			disabled: {
				true: {
					pointerEvents: 'auto',
					cursor: 'default',
				},
			},
		},

		Avatar: {
			width: '2.5rem',
			height: '2.5rem',
		},

		Sign: {
			flex: {
				shrink: 0,
			},
			justify: {
				content: 'center',
			},
			align: {
				items: 'center',
			},
			width: '2.5rem',
			height: '2.5rem',
			borderRadius: '50%',
			background: {
				color: veil,
			},
			color: $mol_theme.shade,
		},

		Info: {
			flex: {
				direction: 'column',
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			gap: '0.125rem',
		},

		Top: {
			align: {
				items: 'baseline',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		Title: {
			... line,
			flex: {
				grow: 1,
				shrink: 1,
			},
		},

		Time: {
			flex: {
				shrink: 0,
			},
			font: {
				size: '0.75rem',
			},
			opacity: .65,
			whiteSpace: 'nowrap',
		},

		Bottom: {
			align: {
				items: 'center',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		Note: {
			... line,
			flex: {
				grow: 1,
				shrink: 1,
			},
			font: {
				size: '0.75rem',
			},
			opacity: .65,
		},

		Badge: {
			flex: {
				shrink: 0,
			},
			justify: {
				content: 'center',
			},
			align: {
				items: 'center',
			},
			background: {
				color: $mol_theme.control,
			},
			color: '#ffffff',
			font: {
				size: '0.75rem',
				weight: 'bold',
			},
			lineHeight: '1.25rem',
			minWidth: '1.25rem',
			padding: {
				top: 0,
				bottom: 0,
				left: '0.5rem',
				right: '0.5rem',
			},
			borderRadius: '1rem',
		},

		Tools: {
			flex: {
				shrink: 0,
			},
			alignSelf: 'center',
			align: {
				items: 'center',
			},
			gap: '0.75rem',
		},

		'@media': {
			'(max-width: 30rem)': {
				gap: '0.5rem',
				minHeight: '2.75rem',
				padding: {
					top: '0.375rem',
					bottom: '0.375rem',
					left: '0.375rem',
					right: '0.375rem',
				},
				Tools: {
					gap: '0.5rem',
				},
			},
		},

	} )

}
