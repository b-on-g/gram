namespace $.$$ {

	const plate = {
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
	} as const

	const plate_text = {
		flex: {
			grow: 1,
			shrink: 1,
		},
		minWidth: 0,
		font: {
			size: '0.875rem',
		},
		color: $mol_theme.shade,
	} as const

	$mol_style_define( $bog_gram_menu, {

		width: '24rem',
		background: {
			color: $mol_theme.back,
		},

		Title: {
			font: {
				family: $bog_builderui_tokens.font_head,
				size: '1.5rem',
				weight: 500,
			},
		},

		Invite_plate: plate,

		Invite_plate_text: plate_text,

		Ask_plate: plate,

		Ask_plate_text: plate_text,

		Dialogs_list: {
			gap: '0.125rem',
		},

		Dialogs_empty: {
			padding: $mol_gap.block,
			color: $mol_theme.shade,
		},

		Saved_icon: {
			color: $mol_theme.control,
		},

		'@media': {
			'(max-width: 30rem)': {
				Dialogs_list: {
					gap: 0,
				},
			},
		},

	} )

}
