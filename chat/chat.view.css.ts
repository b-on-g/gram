namespace $.$$ {

	const round = {
		flex: {
			shrink: 0,
		},
		justify: {
			content: 'center',
		},
		align: {
			items: 'center',
		},
		minWidth: '2.5rem',
		minHeight: '2.5rem',
		padding: 0,
		borderRadius: '50%',
	} as const

	const square = {
		flex: {
			shrink: 0,
		},
		justify: {
			content: 'center',
		},
		align: {
			items: 'center',
		},
		minWidth: '2.5rem',
		minHeight: '2.5rem',
		padding: '0.25rem',
		borderRadius: '0.5rem',
	} as const

	const banner = {
		align: {
			items: 'center',
		},
		gap: '0.5rem',
		padding: {
			top: '0.25rem',
			bottom: '0.25rem',
			left: '0.5rem',
			right: '0.5rem',
		},
		background: {
			color: $mol_theme.hover,
		},
		border: {
			left: {
				width: '2px',
				style: 'solid',
				color: $mol_theme.control,
			},
		},
		borderRadius: '0.25rem',
	} as const

	const line = {
		whiteSpace: 'nowrap',
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	} as const

	const finger = {
		minWidth: '2.75rem',
		minHeight: '2.75rem',
	} as const

	$mol_style_define( $bog_gram_chat, {

		width: '30rem',
		flex: {
			grow: 1,
		},
		background: {
			color: $mol_theme.back,
		},

		Head: {
			align: {
				items: 'center',
			},
		},

		Title: {
			minWidth: 0,
			font: {
				weight: 'bold',
			},
		},

		Note_field: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			maxWidth: '100%',
		},

		Title_text: {
			... line,
			display: 'block',
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			maxWidth: '100%',
		},

		Back: {
			... square,
			display: 'none',
		},

		Back_icon: {
			width: '1.5rem',
			height: '1.5rem',
		},

		Members: square,

		Members_icon: {
			width: '1.25rem',
			height: '1.25rem',
		},

		Body: {
			background: {
				color: $mol_theme.back,
			},
		},

		Body_content: {
			minWidth: 0,
			padding: {
				top: '0.5rem',
				bottom: '0.5rem',
				left: '0.75rem',
				right: '0.75rem',
			},
		},

		Messages: {
			flex: {
				direction: 'column',
				grow: 1,
			},
			minWidth: 0,
			alignSelf: 'stretch',
		},

		Line: {
			flex: {
				direction: 'column',
			},
			gap: '0.25rem',
			minWidth: 0,
			padding: {
				top: '0.125rem',
				bottom: '0.125rem',
			},
		},

		Day_row: {
			justify: {
				content: 'center',
			},
			padding: {
				top: '0.5rem',
				bottom: '0.5rem',
				left: 0,
				right: 0,
			},
		},

		Day_chip: {
			background: {
				color: $bog_gram_tone.veil,
			},
			color: $mol_theme.shade,
			font: {
				size: '0.75rem',
			},
			padding: {
				top: '0.125rem',
				bottom: '0.125rem',
				left: '0.625rem',
				right: '0.625rem',
			},
			borderRadius: '1rem',
		},

		Foot: {
			flex: {
				direction: 'column',
			},
			align: {
				items: 'stretch',
			},
			gap: '0.5rem',
			padding: {
				top: '0.5rem',
				bottom: $mol_style_func.calc( '0.5rem + env(safe-area-inset-bottom)' ),
				left: '0.5rem',
				right: '0.5rem',
			},
		},

		Edit_banner: banner,

		Reply_banner: banner,

		Reply_icon: {
			color: $mol_theme.control,
			flex: {
				shrink: 0,
			},
		},

		Reply_info: {
			flex: {
				direction: 'column',
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			font: {
				size: '0.8rem',
			},
		},

		Reply_title: {
			... line,
			color: $mol_theme.control,
			font: {
				weight: 'bold',
			},
		},

		Reply_text: {
			... line,
			color: $mol_theme.shade,
		},

		Edit_banner_text: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			font: {
				size: '0.8rem',
			},
			color: $mol_theme.shade,
		},

		Send_row: {
			align: {
				items: 'center',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		Message_box: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			maxHeight: '10rem',
			overflow: {
				y: 'auto',
			},
			borderRadius: '1rem',
		},

		Message_field: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			borderRadius: '1rem',
		},

		Send: {
			... round,
			background: {
				color: $mol_theme.control,
			},
			color: '#ffffff',
		},

		Attach: {
			... round,
			color: $mol_theme.shade,
			overflow: 'hidden',
		},

		Attach_icon: {
			width: '1.25rem',
			height: '1.25rem',
		},

		Voice: {
			... round,
			color: $mol_theme.shade,
		},

		Voice_icon: {
			width: '1.25rem',
			height: '1.25rem',
		},

		Record_state: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			align: {
				items: 'center',
			},
			gap: '0.5rem',
			padding: {
				top: '0.5rem',
				bottom: '0.5rem',
				left: '0.875rem',
				right: '0.875rem',
			},
		},

		Record_dot: {
			flex: {
				shrink: 0,
			},
			width: '0.625rem',
			height: '0.625rem',
			borderRadius: '50%',
			background: {
				color: $bog_gram_tone.alert,
			},
		},

		Record_time: {
			flex: {
				shrink: 0,
			},
			font: {
				family: 'monospace',
			},
			whiteSpace: 'nowrap',
		},

		Voice_cancel: {
			flex: {
				shrink: 0,
			},
			align: {
				items: 'center',
			},
			gap: '0.25rem',
			minHeight: '2.5rem',
			padding: {
				top: '0.25rem',
				bottom: '0.25rem',
				left: '0.625rem',
				right: '0.625rem',
			},
			borderRadius: '1rem',
			color: $bog_gram_tone.alert,
		},

		Voice_cancel_icon: {
			flex: {
				shrink: 0,
			},
			width: '1rem',
			height: '1rem',
		},

		Voice_cancel_text: {
			whiteSpace: 'nowrap',
		},

		Voice_note: {
			font: {
				size: '0.8rem',
			},
			color: $mol_theme.shade,
			padding: {
				top: 0,
				bottom: 0,
				left: '0.5rem',
				right: '0.5rem',
			},
		},

		'@media': {

			'(max-width: 54rem)': {
				Back: {
					display: 'flex',
				},
				Close: {
					display: 'none',
				},
			},

			'(max-width: 30rem)': {
				Members: finger,
				Attach: finger,
				Voice: finger,
				Voice_cancel: {
					minHeight: '2.75rem',
				},
			},

		},

	} )

}
