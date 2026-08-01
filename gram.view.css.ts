namespace $.$$ {

	/** Фирменный синий мессенджера — акцент поверх тем. */
	const tg_blue = '#229ED9'

	/** Нейтральная полупрозрачная заливка: чуть темнее на светлой теме, чуть светлее на тёмной. */
	const veil = '#8888881a'

	$mol_style_define( $bog_gram, {

		// ===== Страницы буклета =====
		// Книга сама даёт страницам flex-shrink: 0, а $mol_page — maxWidth: 100%.
		// Поэтому страницам задаётся ТОЛЬКО width: на телефоне она упирается
		// в 100% вьюпорта и буклет листается горизонтальным снапом; любые
		// shrink/grow/minWidth поверх этого ломают адаптивность.

		Menu: {
			width: '24rem',
			background: {
				color: $mol_theme.card,
			},
		},

		Chat_page: {
			width: '30rem',
			flex: {
				grow: 1,
			},
			background: {
				color: $mol_theme.back,
			},
		},

		Settings_page: {
			width: '26rem',
		},

		Compose_page: {
			width: '26rem',
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
				color: veil,
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

		// ===== Список диалогов =====

		Dialogs_list: {
			gap: '0.125rem',
		},

		Dialogs_empty: {
			padding: $mol_gap.block,
			color: $mol_theme.shade,
		},

		Dialog_row: {
			align: {
				items: 'center',
			},
			gap: '0.75rem',
			padding: {
				top: '0.5rem',
				bottom: '0.5rem',
				left: '0.5rem',
				right: '0.5rem',
			},
			borderRadius: '0.75rem',
			color: $mol_theme.text,
			minWidth: 0,
			/* подсветка активного диалога — в gram.view.css: кастомный
			атрибут на встроенной кнопке не проходит типизацию Attrs */
		},

		/* общий вид кружка — в блоке аватара ниже, здесь только размер:
		в списке диалогов он крупнее, чем в реестре */
		Dialog_avatar: {
			width: '3rem',
			height: '3rem',
			font: {
				size: '1.125rem',
			},
		},

		Dialog_info: {
			flex: {
				direction: 'column',
				grow: 1,
				shrink: 1,
			},
			/* без нуля ellipsis не срабатывает: колонка распирается содержимым */
			minWidth: 0,
			gap: '0.125rem',
		},

		Dialog_top: {
			align: {
				items: 'baseline',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		Dialog_title: {
			display: 'block',
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			font: {
				weight: 'bold',
			},
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		Dialog_time: {
			flex: {
				shrink: 0,
			},
			font: {
				size: '0.75rem',
			},
			/* приглушаем прозрачностью, а не цветом: на выделенной строке текст белый */
			opacity: .65,
			whiteSpace: 'nowrap',
		},

		Dialog_bottom: {
			align: {
				items: 'center',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		Dialog_preview: {
			display: 'block',
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			font: {
				size: '0.875rem',
			},
			opacity: .65,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		Unread_badge: {
			flex: {
				shrink: 0,
			},
			justify: {
				content: 'center',
			},
			align: {
				items: 'center',
			},
			background: {
				color: tg_blue,
			},
			color: '#ffffff',
			font: {
				size: '0.75rem',
				weight: 'bold',
			},
			lineHeight: '1.25rem',
			minWidth: '1.25rem',
			padding: {
				top: 0,
				bottom: 0,
				left: '0.5rem',
				right: '0.5rem',
			},
			borderRadius: '1rem',
		},

		// ===== Реестр пользователей =====

		Users_title: {
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
		},

		Users_list: {
			gap: '0.125rem',
		},

		Users_empty: {
			padding: $mol_gap.block,
			color: $mol_theme.shade,
		},

		User_row: {
			align: {
				items: 'center',
			},
			gap: '0.75rem',
			padding: {
				top: '0.5rem',
				bottom: '0.5rem',
				left: '0.5rem',
				right: '0.5rem',
			},
			borderRadius: '0.75rem',
			color: $mol_theme.text,
			minWidth: 0,
		},

		User_avatar: {
			width: '2.5rem',
			height: '2.5rem',
			font: {
				size: '1rem',
			},
		},

		User_title: {
			display: 'block',
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		// ===== Настройки и новый диалог =====

		Peer_form: {
			flex: {
				direction: 'column',
			},
			gap: $mol_gap.block,
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

		// ===== Разделитель дня =====

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
				color: veil,
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

		// ===== Пузыри сообщений =====

		Message_row: {
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
			background: {
				color: $mol_theme.card,
			},

			'@': {
				bog_gram_out: {
					true: {
						alignSelf: 'flex-end',
					},
				},
			},

		},

		Message_body: {
			minWidth: 0,
			whiteSpace: 'pre-wrap',
			overflowWrap: 'anywhere',
		},

		Message_meta: {
			alignSelf: 'flex-end',
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
			color: $mol_theme.shade,
		},

		Message_time: {
			whiteSpace: 'nowrap',
		},

		Message_edited: {
			font: {
				style: 'italic',
			},
		},

		Message_checks: {
			color: tg_blue,
			whiteSpace: 'nowrap',
		},

		Message_edit: {
			minWidth: '1.5rem',
			minHeight: '1.5rem',
			padding: '0.125rem',
		},

		Message_delete: {
			minWidth: '1.5rem',
			minHeight: '1.5rem',
			padding: '0.125rem',
		},

		Message_edit_icon: {
			width: '0.9rem',
			height: '0.9rem',
		},

		Message_delete_icon: {
			width: '0.9rem',
			height: '0.9rem',
		},

		// ===== Заливки пузырей по теме =====
		// Тема переключается атрибутом на корне (плагин темы + тумблер в шапке),
		// поэтому ветки — по значению атрибута, а не по prefers-color-scheme:
		// иначе ручное переключение света не меняло бы цвет своих сообщений.
		// Блок идёт последним: специфичность равна базовой, решает порядок.

		'[mol_theme]': {

			'$mol_theme_light': {
				Message_row: {
					background: {
						color: '#ffffff',
					},
					'@': {
						bog_gram_out: {
							true: {
								background: {
									color: '#effdde',
								},
							},
						},
					},
				},
			},

			'$mol_theme_dark': {
				Message_row: {
					background: {
						color: '#182533',
					},
					'@': {
						bog_gram_out: {
							true: {
								background: {
									color: '#2b5278',
								},
							},
						},
					},
				},
			},

		},

	} )

	// ===== Аватар-кружок с инициалом =====
	// Общий вид держим на самом компоненте: список диалогов и реестр
	// отличаются только размером, а палитра нужна обоим одинаковая.
	// Размер и кегль задаются на месте использования: селекторы тут
	// одной специфичности, повтори мы их здесь — перебили бы место вызова.

	$mol_style_define( $bog_gram_avatar, {

		flex: {
			shrink: 0,
		},
		justify: {
			content: 'center',
		},
		align: {
			items: 'center',
		},
		borderRadius: '50%',
		color: '#ffffff',
		font: {
			weight: 'bold',
		},
		userSelect: 'none',

		'@': {
			bog_gram_tint: {
				'0': {
					background: {
						color: '#e17076',
					},
				},
				'1': {
					background: {
						color: '#faa774',
					},
				},
				'2': {
					background: {
						color: '#a695e7',
					},
				},
				'3': {
					background: {
						color: '#7bc862',
					},
				},
				'4': {
					background: {
						color: '#6ec9cb',
					},
				},
				'5': {
					background: {
						color: '#65aadd',
					},
				},
				'6': {
					background: {
						color: '#ee7aae',
					},
				},
			},
		},

	} )

	$mol_style_define( $bog_gram_chat, {

		Title: {
			font: {
				weight: 'bold',
			},
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
			gap: '0.25rem',
			minWidth: 0,
			alignSelf: 'stretch',
		},

		Foot: {
			flex: {
				direction: 'column',
			},
			align: {
				items: 'stretch',
			},
			gap: '0.5rem',
			padding: '0.5rem',
		},

		Edit_banner: {
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
					color: tg_blue,
				},
			},
			borderRadius: '0.25rem',
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

		Message_field: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			borderRadius: '1rem',
			padding: {
				top: '0.5rem',
				bottom: '0.5rem',
				left: '0.875rem',
				right: '0.875rem',
			},
		},

		Send: {
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
			background: {
				color: tg_blue,
			},
			color: '#ffffff',
		},

	} )

}
