namespace $.$$ {

	const control = {
		justify: {
			content: 'center',
		},
		align: {
			items: 'center',
		},
		minWidth: '2rem',
		minHeight: '2rem',
		padding: '0.25rem',
		borderRadius: '0.5rem',
	} as const

	const line = {
		maxWidth: '100%',
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	} as const

	$mol_style_define( $bog_gram_bubble, {

		position: 'relative',
		flex: {
			direction: 'column',
		},
		gap: '0.125rem',
		maxWidth: '70%',
		minWidth: 0,
		alignSelf: 'flex-start',
		padding: {
			top: '0.375rem',
			bottom: '0.375rem',
			left: '0.625rem',
			right: '0.625rem',
		},
		borderRadius: '0.75rem',
		touchAction: 'manipulation',

		'@': {
			bog_gram_bubble_out: {
				true: {
					alignSelf: 'flex-end',
				},
			},
		},

		Author: {
			... line,
			display: 'block',
			alignSelf: 'stretch',
			minWidth: 0,
			font: {
				size: '0.8rem',
				weight: 'bold',
			},
			'@': {
				bog_gram_tint: $bog_gram_tone.tints,
			},
		},

		Forwarded: {
			align: {
				items: 'center',
			},
			gap: '0.25rem',
			color: $mol_theme.shade,
			font: {
				size: '0.8rem',
				style: 'italic',
			},
		},

		Forwarded_icon: {
			width: '0.875rem',
			height: '0.875rem',
		},

		Contact: {
			align: {
				items: 'center',
			},
			gap: '0.5rem',
			minWidth: '12rem',
			padding: {
				top: '0.25rem',
				bottom: '0.25rem',
			},
		},

		Contact_icon: {
			width: '2rem',
			height: '2rem',
			flex: {
				shrink: 0,
			},
			color: $mol_theme.control,
		},

		Contact_name: {
			... line,
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			font: {
				weight: 'bold',
			},
		},

		Quote: {
			display: 'flex',
			flex: {
				direction: 'column',
			},
			alignSelf: 'stretch',
			alignItems: 'flex-start',
			minWidth: 0,
			padding: {
				top: '0.125rem',
				bottom: '0.125rem',
				left: '0.5rem',
				right: '0.5rem',
			},
			margin: {
				bottom: '0.25rem',
			},
			border: {
				left: {
					width: '2px',
					style: 'solid',
					color: $mol_theme.control,
				},
			},
			borderRadius: '0.25rem',
			background: {
				color: $mol_theme.hover,
			},
			font: {
				size: '0.8rem',
			},
			textAlign: 'left',
		},

		Quote_author: {
			... line,
			color: $mol_theme.control,
			font: {
				weight: 'bold',
			},
		},

		Quote_text: {
			... line,
			color: $mol_theme.shade,
		},

		Line: {
			flex: {
				wrap: 'wrap',
			},
			align: {
				items: 'flex-end',
			},
			columnGap: '0.5rem',
			minWidth: 0,
		},

		Body: {
			minWidth: 0,
			flex: {
				shrink: 1,
			},
			whiteSpace: 'pre-wrap',
			overflowWrap: 'anywhere',
		},

		Shot: {
			alignSelf: 'flex-start',
			maxWidth: '100%',
		},

		Clip: {
			display: 'block',
			width: '15rem',
			maxWidth: '100%',
			maxHeight: '60vh',
			borderRadius: '0.5rem',
			background: {
				color: '#000',
			},
		},

		Sound: {
			alignSelf: 'stretch',
			minWidth: 0,
			maxWidth: '100%',
		},

		Meta: {
			margin: {
				left: 'auto',
			},
			align: {
				items: 'center',
			},
			justify: {
				content: 'flex-end',
			},
			gap: '0.25rem',
			font: {
				size: '0.7rem',
			},
			lineHeight: '1rem',
			color: $mol_theme.shade,
		},

		Time: {
			whiteSpace: 'nowrap',
		},

		Edited: {
			font: {
				style: 'italic',
			},
		},

		Checks: {
			color: $mol_theme.control,
			whiteSpace: 'nowrap',
		},

		Actions: {
			display: 'none',
			position: 'absolute',
			right: '0.25rem',
			bottom: '0.25rem',
			zIndex: 1,
			align: {
				items: 'center',
			},
			gap: '0.25rem',
			padding: '0.125rem',
			borderRadius: '1rem',
			background: {
				color: $mol_theme.card,
			},
			box: {
				shadow: [
					{ x: 0, y: '0.125rem', blur: '0.5rem', spread: 0, color: '#00000040' },
				],
			},
		},

		Copy: control,

		Forward: control,

		Edit: control,

		Delete: control,

		Forward_icon: {
			width: '1.125rem',
			height: '1.125rem',
		},

		Edit_icon: {
			width: '1.125rem',
			height: '1.125rem',
		},

		Delete_icon: {
			width: '1.125rem',
			height: '1.125rem',
		},

		'@media': {
			'(max-width: 30rem)': {
				maxWidth: '85%',
				Copy: {
					minWidth: '2.75rem',
					minHeight: '2.75rem',
				},
				Forward: {
					minWidth: '2.75rem',
					minHeight: '2.75rem',
				},
				Edit: {
					minWidth: '2.75rem',
					minHeight: '2.75rem',
				},
				Delete: {
					minWidth: '2.75rem',
					minHeight: '2.75rem',
				},
			},
		},

	} )

}
