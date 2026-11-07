namespace $.$$ {

	$mol_style_define( $bog_gram_field, {

		position: 'relative',
		align: {
			items: 'center',
		},
		minWidth: 0,
		maxWidth: '100%',

		Field: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			maxWidth: '100%',
			padding: {
				top: '0.125rem',
				bottom: '0.125rem',
				left: '0.375rem',
				right: '1.5rem',
			},
		},

		Edit_icon: {
			position: 'absolute',
			right: '0.375rem',
			flex: {
				shrink: 0,
			},
			width: '1rem',
			height: '1rem',
			color: $mol_theme.shade,
			pointerEvents: 'none',
		},

	} )

}
