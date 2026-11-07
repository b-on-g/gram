namespace $.$$ {

	const head = {
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
	} as const

	const alarm = {
		font: {
			size: '0.875rem',
		},
		color: $bog_gram_tone.alert,
	} as const

	$mol_style_define( $bog_gram_group, {

		Name_field: {
			alignSelf: 'stretch',
		},

		Chosen_head: head,

		Chosen_list: {
			gap: '0.125rem',
		},

		Lost_note: alarm,

		Make: {
			alignSelf: 'stretch',
			justify: {
				content: 'center',
			},
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

		Id_error: alarm,

		Pick_head: head,

		Pick_list: {
			gap: '0.125rem',
		},

		'@media': {
			'(max-width: 30rem)': {
				Pick_list: {
					gap: 0,
				},
			},
		},

	} )

}
