namespace $.$$ {

	$mol_style_define( $bog_gram_call_card, {

		align: {
			items: 'center',
		},
		flex: {
			shrink: 1,
		},
		minWidth: 0,
		maxWidth: '100%',
		gap: $mol_gap.block,

		Icon: {
			flex: {
				shrink: 0,
			},
			width: '2rem',
			height: '2rem',
		},

		Info: {
			flex: {
				direction: 'column',
				shrink: 1,
			},
			align: {
				items: 'flex-start',
			},
			minWidth: 0,
			overflowWrap: 'anywhere',
		},

		Title: {
			maxWidth: '100%',
		},

		Count: {
			maxWidth: '100%',
			color: $mol_theme.shade,
		},

	} )

}
