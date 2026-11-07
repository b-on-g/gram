namespace $.$$ {

	const note = {
		font: {
			size: '0.75rem',
		},
		color: $mol_theme.shade,
	} as const

	const plate = {
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
	} as const

	const choice = {
		flex: {
			grow: 1,
			shrink: 1,
		},
		justify: {
			content: 'center',
		},
		minWidth: 0,
		font: {
			size: '0.8rem',
		},
		padding: {
			top: '0.25rem',
			bottom: '0.25rem',
			left: '0.5rem',
			right: '0.5rem',
		},
		borderRadius: '0.5rem',
	} as const

	$mol_style_define( $bog_gram_members, {

		List: {
			gap: '0.125rem',
		},

		Drop_note: note,

		Leave_note: {
			... note,
			padding: {
				top: $mol_gap.block,
				bottom: 0,
				left: 0,
				right: 0,
			},
		},

		Add_block: {
			flex: {
				direction: 'column',
			},
			align: {
				items: 'stretch',
			},
			gap: '0.5rem',
			minWidth: 0,
			padding: {
				top: $mol_gap.block,
				bottom: 0,
				left: 0,
				right: 0,
			},
		},

		Add_title: {
			font: {
				weight: 'bold',
			},
			color: $mol_theme.shade,
		},

		History: {
			... plate,
			flex: {
				direction: 'column',
			},
			align: {
				items: 'stretch',
			},
			gap: '0.375rem',
			minWidth: 0,
		},

		History_head: {
			font: {
				size: '0.875rem',
			},
			color: $mol_theme.shade,
		},

		History_row: {
			align: {
				items: 'center',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		History_all: choice,

		History_new: choice,

		History_note: note,

		Error: {
			font: {
				size: '0.875rem',
			},
			color: $bog_gram_tone.alert,
		},

		Id_form: {
			flex: {
				direction: 'column',
			},
			align: {
				items: 'stretch',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		Pick_list: {
			gap: '0.125rem',
		},

		Pick_mark: {
			color: $mol_theme.shade,
		},

		Admin_note: note,

		Join: {
			... plate,
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
		},

		Join_head: {
			font: {
				size: '0.875rem',
				weight: 'bold',
			},
			color: $mol_theme.shade,
		},

		Join_hint: note,

		Join_text: {
			alignSelf: 'stretch',
			flex: {
				shrink: 1,
			},
			width: '100%',
			minWidth: 0,
			maxWidth: '100%',
			maxHeight: '6rem',
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
				color: $mol_theme.back,
			},
			padding: {
				top: '0.5rem',
				bottom: '0.5rem',
				left: '0.625rem',
				right: '0.625rem',
			},
			borderRadius: '0.5rem',
		},

		Join_copy: {
			alignSelf: 'flex-start',
		},

		Join_qr_box: {
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
		},

		Join_qr: {
			flex: {
				shrink: 0,
			},
			width: '12rem',
			height: '12rem',
			maxWidth: '100%',
		},

		Asks_head: {
			font: {
				weight: 'bold',
			},
			color: $mol_theme.shade,
		},

		Asks_list: {
			gap: '0.125rem',
		},

		Ask_row: {
			Note: {
				font: {
					family: 'monospace',
				},
			},
		},

		Leave: {
			alignSelf: 'flex-start',
			color: $bog_gram_tone.alert,
			padding: {
				top: '0.375rem',
				bottom: '0.375rem',
				left: '0.75rem',
				right: '0.75rem',
			},
			borderRadius: '0.5rem',
		},

		'@media': {
			'(max-width: 30rem)': {
				List: {
					gap: 0,
				},
				Pick_list: {
					gap: 0,
				},
				Asks_list: {
					gap: 0,
				},
				History_all: {
					minHeight: '2.75rem',
				},
				History_new: {
					minHeight: '2.75rem',
				},
			},
		},

	} )

}
