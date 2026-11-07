namespace $.$$ {

	$mol_style_define( $bog_gram, {

		// ===== Страницы буклета =====
		// Книга сама даёт страницам flex-shrink: 0, а $mol_page — maxWidth: 100%.
		// Поэтому страницам задаётся ТОЛЬКО width: на телефоне она упирается
		// в 100% вьюпорта и буклет листается горизонтальным снапом; любые
		// shrink/grow/minWidth поверх этого ломают адаптивность.

		Music_page: {
			width: '30rem',
		},

		// ===== Заглушка при пустом выборе =====

		Intro: {
			flex: {
				grow: 1,
			},
			align: {
				items: 'center',
			},
			justify: {
				content: 'center',
			},
			padding: $mol_gap.block,
		},

		Intro_plate: {
			flex: {
				direction: 'column',
			},
			gap: '0.25rem',
			align: {
				items: 'center',
			},
			background: {
				color: $bog_gram_tone.veil,
			},
			color: $mol_theme.shade,
			padding: {
				top: '0.75rem',
				bottom: '0.75rem',
				left: '1.25rem',
				right: '1.25rem',
			},
			borderRadius: '1rem',
			textAlign: 'center',
		},

		Intro_hint: {
			font: {
				size: '0.875rem',
			},
		},

	} )

}
