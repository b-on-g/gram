namespace $.$$ {

	$mol_style_define( $bog_gram_tasks, {

		Row: {
			align: {
				items: 'flex-start',
			},
			minWidth: 0,
			'@': {
				bog_gram_tasks_done: {
					true: {
						color: $mol_theme.shade,
						textDecoration: 'line-through',
					},
				},
			},
		},

		Done: {
			flex: {
				shrink: 0,
			},
		},

		Jump: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			textAlign: 'left',
			whiteSpace: 'pre-wrap',
			overflowWrap: 'anywhere',
			color: 'inherit',
		},

	} )

}
