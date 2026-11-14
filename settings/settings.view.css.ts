namespace $.$$ {

	const column = {
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

	const hint = {
		font: {
			size: '0.875rem',
		},
		color: $mol_theme.shade,
	} as const

	const note = {
		font: {
			size: '0.75rem',
		},
		color: $mol_theme.shade,
	} as const

	$mol_style_define( $bog_gram_settings, {

		Install: {
			Content: {
				gap: $mol_gap.block,
			},
		},

		Name_field: {
			alignSelf: 'stretch',
		},

		My_id: {
			Content: {
				align: {
					items: 'center',
				},
			},
		},

		My_id_text: {
			font: {
				family: 'monospace',
				size: '0.75rem',
			},
			minWidth: 0,
			overflow: {
				x: 'auto',
			},
			whiteSpace: 'nowrap',
		},

		Invite: {
			Content: {
				alignSelf: 'stretch',
				minWidth: 0,
				flex: {
					shrink: 1,
				},
			},
		},

		Invite_body: column,

		Invite_hint: hint,

		Invite_text: {
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

		Invite_copy: {
			alignSelf: 'flex-start',
		},

		Invite_qr_box: {
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

		Invite_qr: {
			flex: {
				shrink: 0,
			},
			width: '14rem',
			height: '14rem',
			maxWidth: '100%',
		},

		Paste: {
			alignSelf: 'stretch',
			align: {
				items: 'center',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		Paste_field: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
		},

		Paste_open: {
			flex: {
				shrink: 0,
			},
		},

		Paste_error: hint,

		Notify_body: {
			flex: {
				direction: 'column',
			},
			align: {
				items: 'flex-start',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		Notify_status: hint,

		Registry_block: {
			Content: column,
		},

		Registry_list: {
			gap: '0.125rem',
		},

		Registry_row: {
			alignSelf: 'stretch',
			flex: {
				shrink: 1,
			},
			maxWidth: '100%',
			Title: {
				font: {
					weight: 'bold',
				},
			},
		},

		Registry_join: {
			font: {
				size: '0.75rem',
			},
		},

		Registry_note: note,

		Registry_empty: hint,

		Registry_share: {
			align: {
				items: 'center',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		Registry_share_text: {
			... note,
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
		},

		Registry_share_copy: {
			flex: {
				shrink: 0,
			},
		},

		Registry_form: {
			flex: {
				direction: 'column',
			},
			align: {
				items: 'stretch',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		Account: {
			Content: {
				alignSelf: 'stretch',
				minWidth: 0,
				flex: {
					shrink: 1,
				},
			},
		},

	} )

}
