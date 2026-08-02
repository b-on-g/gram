namespace $.$$ {

	/** Фирменный синий мессенджера — акцент поверх тем. */
	const tg_blue = '#229ED9'

	/** Нейтральная полупрозрачная заливка: чуть темнее на светлой теме, чуть светлее на тёмной. */
	const veil = '#8888881a'

	/** Красный для опасных мест: тот же, что у взведённой корзины в gram.view.css. */
	const alert_red = '#e14b4b'

	/** Шапка страницы прижата к верху экрана, а на айфоне там статус-бар и
	 * вырез камеры: свой отступ складываем с системным. Вне телефона добавка
	 * нулевая, и вёрстка остаётся ровно той же. */
	const head_pad = {
		top: $mol_style_func.calc( `${ $mol_gap.block } + env(safe-area-inset-top)` ),
		bottom: $mol_gap.block,
		left: $mol_gap.block,
		right: $mol_gap.block,
	}

	/** То же снизу: последняя строка страницы не должна уезжать под
	 * системную полоску-«домой». */
	const body_pad = {
		top: $mol_gap.block,
		bottom: $mol_style_func.calc( `${ $mol_gap.block } + env(safe-area-inset-bottom)` ),
		left: $mol_gap.block,
		right: $mol_gap.block,
	}

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
			Head: {
				padding: head_pad,
			},
			Body_content: {
				padding: body_pad,
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
			Head: {
				padding: head_pad,
			},
			Body_content: {
				padding: body_pad,
			},
		},

		Compose_page: {
			width: '26rem',
			Head: {
				padding: head_pad,
			},
			Body_content: {
				padding: body_pad,
			},
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

		/* корзина не должна распирать строку: своя ширина, минимум отступов,
		цвет наследуется от строки — на выбранной он белый */
		Dialog_delete: {
			flex: {
				shrink: 0,
			},
			alignSelf: 'center',
			justify: {
				content: 'center',
			},
			align: {
				items: 'center',
			},
			minWidth: '1.75rem',
			minHeight: '1.75rem',
			padding: '0.25rem',
			borderRadius: '0.5rem',
			/* красная заливка взведённой корзины — в gram.view.css:
			кастомный атрибут на встроенной кнопке не проходит типизацию Attrs */
		},

		Dialog_delete_icon: {
			width: '1rem',
			height: '1rem',
		},

		/* кнопка архива стоит рядом с корзиной и повторяет её габариты:
		две соседние операции не должны прыгать в строке */
		Dialog_archive: {
			flex: {
				shrink: 0,
			},
			alignSelf: 'center',
			justify: {
				content: 'center',
			},
			align: {
				items: 'center',
			},
			minWidth: '1.75rem',
			minHeight: '1.75rem',
			padding: '0.25rem',
			borderRadius: '0.5rem',
		},

		Dialog_archive_icon: {
			width: '1rem',
			height: '1rem',
		},

		Dialog_unarchive_icon: {
			width: '1rem',
			height: '1rem',
		},

		// ===== Избранное =====
		// Первая строка списка, геометрия у неё ровно та же, что у обычной:
		// отличается только кружок — вместо узора собеседника закладка.

		Saved_row: {
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

		/* цвет закладки перебивается белым на выбранной строке — тем же
		правилом из gram.view.css, что красит и остальной её текст */
		Saved_avatar: {
			flex: {
				shrink: 0,
			},
			justify: {
				content: 'center',
			},
			align: {
				items: 'center',
			},
			width: '3rem',
			height: '3rem',
			borderRadius: '50%',
			background: {
				color: veil,
			},
			color: tg_blue,
		},

		Saved_avatar_icon: {
			width: '1.5rem',
			height: '1.5rem',
		},

		Saved_info: {
			flex: {
				direction: 'column',
				grow: 1,
				shrink: 1,
			},
			/* без нуля ellipsis не срабатывает: колонка распирается содержимым */
			minWidth: 0,
			gap: '0.125rem',
		},

		Saved_top: {
			align: {
				items: 'baseline',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		Saved_title: {
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

		Saved_time: {
			flex: {
				shrink: 0,
			},
			font: {
				size: '0.75rem',
			},
			opacity: .65,
			whiteSpace: 'nowrap',
		},

		Saved_bottom: {
			align: {
				items: 'center',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		Saved_preview: {
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

		// ===== Вход в архив =====
		// Последняя строка списка: тот же кружок и та же сетка, что у диалога,
		// чтобы раскрытый архив читался продолжением списка, а не врезкой.

		Archive_row: {
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

		Archive_avatar: {
			flex: {
				shrink: 0,
			},
			justify: {
				content: 'center',
			},
			align: {
				items: 'center',
			},
			width: '3rem',
			height: '3rem',
			borderRadius: '50%',
			background: {
				color: veil,
			},
			color: $mol_theme.shade,
		},

		Archive_avatar_icon: {
			width: '1.5rem',
			height: '1.5rem',
		},

		Archive_info: {
			flex: {
				direction: 'column',
				grow: 1,
				shrink: 1,
			},
			align: {
				items: 'flex-start',
			},
			minWidth: 0,
			gap: '0.125rem',
		},

		Archive_title: {
			display: 'block',
			alignSelf: 'stretch',
			minWidth: 0,
			font: {
				weight: 'bold',
			},
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		Archive_note: {
			display: 'block',
			alignSelf: 'stretch',
			minWidth: 0,
			font: {
				size: '0.875rem',
			},
			opacity: .65,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		/* свой бейдж вместо строчного: тот ключуется диалогом, а тут сумма по архиву */
		Archive_unread: {
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
		},

		User_info: {
			flex: {
				direction: 'column',
				grow: 1,
				shrink: 1,
			},
			align: {
				items: 'flex-start',
			},
			/* без нуля ellipsis не срабатывает: колонка распирается содержимым */
			minWidth: 0,
			gap: '0.125rem',
		},

		User_title: {
			display: 'block',
			alignSelf: 'stretch',
			minWidth: 0,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		/* откуда человек: подпись появляется, только когда реестров несколько */
		User_source: {
			display: 'block',
			alignSelf: 'stretch',
			minWidth: 0,
			font: {
				size: '0.75rem',
			},
			opacity: .65,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		/* открыт чужой реестр, а записи в нём нет: зовём вступить прямо тут */
		Join_plate: {
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
				color: veil,
			},
			borderRadius: '0.75rem',
		},

		Join_plate_text: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			font: {
				size: '0.875rem',
			},
			color: $mol_theme.shade,
		},

		Join_plate_button: {
			flex: {
				shrink: 0,
			},
		},

		// ===== Список реестров в настройках =====

		Registry_block: {
			Content: {
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
			},
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
			align: {
				items: 'center',
			},
			gap: '0.5rem',
			padding: {
				top: '0.5rem',
				bottom: '0.5rem',
				left: '0.5rem',
				right: '0.5rem',
			},
			borderRadius: '0.75rem',
			color: $mol_theme.text,
			minWidth: 0,
			/* подсветка активного реестра — в gram.view.css: тот же атрибут,
			что и у выбранного диалога, кастомный attr на встроенной кнопке
			не проходит типизацию Attrs */
		},

		Registry_info: {
			flex: {
				direction: 'column',
				grow: 1,
				shrink: 1,
			},
			align: {
				items: 'flex-start',
			},
			minWidth: 0,
			gap: '0.125rem',
		},

		Registry_title: {
			display: 'block',
			alignSelf: 'stretch',
			minWidth: 0,
			font: {
				weight: 'bold',
			},
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		Registry_status: {
			display: 'block',
			alignSelf: 'stretch',
			minWidth: 0,
			font: {
				size: '0.75rem',
			},
			/* приглушаем прозрачностью, а не цветом: на активной строке текст белый */
			opacity: .65,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		Registry_join: {
			flex: {
				shrink: 0,
			},
			font: {
				size: '0.75rem',
			},
			padding: {
				top: '0.25rem',
				bottom: '0.25rem',
				left: '0.5rem',
				right: '0.5rem',
			},
			borderRadius: '0.5rem',
		},

		/* крестик не должен распирать строку: своя ширина и минимум отступов */
		Registry_drop: {
			flex: {
				shrink: 0,
			},
			alignSelf: 'center',
			justify: {
				content: 'center',
			},
			align: {
				items: 'center',
			},
			minWidth: '1.75rem',
			minHeight: '1.75rem',
			padding: '0.25rem',
			borderRadius: '0.5rem',
		},

		Registry_drop_icon: {
			width: '1rem',
			height: '1rem',
		},

		Registry_note: {
			font: {
				size: '0.75rem',
			},
			color: $mol_theme.shade,
		},

		Registry_empty: {
			font: {
				size: '0.875rem',
			},
			color: $mol_theme.shade,
		},

		Registry_share: {
			align: {
				items: 'center',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		Registry_share_text: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			font: {
				size: '0.75rem',
			},
			color: $mol_theme.shade,
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

		// ===== Настройки и новый диалог =====


		Name_field: {
			alignSelf: 'stretch',
		},

		Peer_form: {
			flex: {
				direction: 'column',
			},
			gap: $mol_gap.block,
		},

		/* строка состояния над кнопкой, а не рядом: подпись длинная,
		в одну строку с кнопкой она ломает узкую колонку настроек */
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

		Notify_status: {
			font: {
				size: '0.875rem',
			},
			color: $mol_theme.shade,
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

		// ===== Личная ссылка-приглашение =====
		// Ссылка длинная и без пробелов, поэтому всей ветке нужен shrink
		// и нулевой минимум: у вьюх по умолчанию flex-shrink 0, и строка
		// иначе распирает колонку настроек вместо переноса внутри неё.

		Invite: {
			Content: {
				alignSelf: 'stretch',
				minWidth: 0,
				flex: {
					shrink: 1,
				},
			},
		},

		Invite_body: {
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

		Invite_hint: {
			font: {
				size: '0.875rem',
			},
			color: $mol_theme.shade,
		},

		/* Ломаем ссылку по символам, а не гоним в горизонтальный скролл.
		Перенос рисуется стилем и в текст не попадает — копируется цельная строка. */
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
				color: veil,
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

		/* Белая подложка обязательна: на тёмной теме цветной код выходит
		светлее фона, и сканеры такой инверсный код берут не всякие. */
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

		/* свой размер вместо трёхсот пикселей по умолчанию: колонка настроек узкая */
		Invite_qr: {
			flex: {
				shrink: 0,
			},
			width: '12rem',
			height: '12rem',
			maxWidth: '100%',
		},

		// ===== Ключ аккаунта =====

		/* Всей ветке нужен shrink и нулевой минимум: у вьюх по умолчанию
		flex-shrink 0, поэтому длинный ключ иначе распирает колонку настроек
		вместо того, чтобы переноситься внутри отведённой ширины. */
		Account: {
			Content: {
				alignSelf: 'stretch',
				minWidth: 0,
				flex: {
					shrink: 1,
				},
			},
		},

		Account_body: {
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

		Key_warning: {
			font: {
				size: '0.875rem',
			},
			color: alert_red,
		},

		Key_row: {
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

		/* Ключ длинный и без пробелов. Ломаем его по символам, а не гоним
		в горизонтальный скролл: так он не распирает колонку настроек.
		Перенос рисуется стилем и в текст не попадает — копируется цельная
		строка. Высоту ограничиваем, чтобы блок не занял пол-экрана. */
		Key_text: {
			alignSelf: 'stretch',
			flex: {
				shrink: 1,
			},
			width: '100%',
			minWidth: 0,
			maxWidth: '100%',
			maxHeight: '8rem',
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
				color: veil,
			},
			padding: {
				top: '0.5rem',
				bottom: '0.5rem',
				left: '0.625rem',
				right: '0.625rem',
			},
			borderRadius: '0.5rem',
		},

		Key_copy: {
			alignSelf: 'flex-start',
		},

		/* Подложка — как у ссылки-приглашения: тревожный красный на тёмном
		фоне без неё читается как инверсный код. */
		Key_qr_box: {
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

		/* свой размер вместо трёхсот пикселей по умолчанию: колонка настроек узкая */
		Key_qr: {
			flex: {
				shrink: 0,
			},
			width: '12rem',
			height: '12rem',
			maxWidth: '100%',
		},

		Key_import_form: {
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

		Key_load_row: {
			align: {
				items: 'center',
			},
			gap: '0.5rem',
			minWidth: 0,
		},

		Key_load_hint: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			font: {
				size: '0.875rem',
			},
			color: $mol_theme.shade,
		},

		Key_error: {
			font: {
				size: '0.875rem',
			},
			color: alert_red,
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
			/* якорь для всплывающей панели действий */
			position: 'relative',
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

		/* Размеры коробки приходят из данных сообщения (style в view.tree),
		здесь только предел по ширине пузыря: на узком экране кадр ужимается
		вместе с ним, а не вылезает наружу. */
		Message_shot: {
			alignSelf: 'flex-start',
			maxWidth: '100%',
		},

		/* Строка голосового растягивается на всю ширину пузыря: кнопка,
		полоса и длина иначе жались бы в комок у левого края. */
		Message_sound: {
			alignSelf: 'stretch',
			minWidth: 0,
			maxWidth: '100%',
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

		/* Панель правки и удаления: в пузыре её не видно, пока сообщение
		не выбрано долгим нажатием (на мыши — наведением). Показ включается
		в gram.view.css: там селектор по двум атрибутам сразу, а тут правило
		одноатрибутное и проиграло бы ему по специфичности.
		Из потока панель вынута и всплывает над нижним правым углом своего же
		пузыря: стань она обычной строкой, каждое наведение мыши сдвигало бы
		вниз всю переписку под сообщением. */
		Message_actions: {
			display: 'none',
			position: 'absolute',
			right: '0.25rem',
			bottom: '0.25rem',
			zIndex: 1,
			align: {
				items: 'center',
			},
			gap: '0.25rem',
			padding: '0.125rem',
			borderRadius: '1rem',
			background: {
				color: $mol_theme.card,
			},
			box: {
				shadow: [
					{ x: 0, y: '0.125rem', blur: '0.5rem', spread: 0, color: '#00000040' },
				],
			},
		},

		Message_edit: {
			justify: {
				content: 'center',
			},
			align: {
				items: 'center',
			},
			minWidth: '2rem',
			minHeight: '2rem',
			padding: '0.25rem',
			borderRadius: '0.5rem',
		},

		Message_delete: {
			justify: {
				content: 'center',
			},
			align: {
				items: 'center',
			},
			minWidth: '2rem',
			minHeight: '2rem',
			padding: '0.25rem',
			borderRadius: '0.5rem',
		},

		Message_edit_icon: {
			width: '1.125rem',
			height: '1.125rem',
		},

		Message_delete_icon: {
			width: '1.125rem',
			height: '1.125rem',
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

		// ===== Телефон =====
		// Страница занимает вьюпорт целиком, место дороже воздуха: строкам
		// списка режем отступы, а кнопкам внутри них, наоборот, добавляем —
		// 2.75rem это 44 точки, минимум под палец по гайдлайну Apple.
		// Блок последний: специфичность та же, что у базовых правил,
		// решает порядок.

		'@media': {

			'(max-width: 30rem)': {

				Dialogs_list: {
					gap: 0,
				},

				Users_list: {
					gap: 0,
				},

				Dialog_row: {
					gap: '0.5rem',
					minHeight: '2.75rem',
					padding: '0.375rem',
				},

				Saved_row: {
					gap: '0.5rem',
					minHeight: '2.75rem',
					padding: '0.375rem',
				},

				Archive_row: {
					gap: '0.5rem',
					minHeight: '2.75rem',
					padding: '0.375rem',
				},

				User_row: {
					gap: '0.5rem',
					minHeight: '2.75rem',
					padding: '0.375rem',
				},

				/* корзина и архив стоят вплотную, поэтому обеим нужен свой
				запас по краям: иначе палец накрывает сразу две */
				Dialog_archive: {
					minWidth: '2.75rem',
					minHeight: '2.75rem',
				},

				Dialog_delete: {
					minWidth: '2.75rem',
					minHeight: '2.75rem',
				},

				Dialog_archive_icon: {
					width: '1.125rem',
					height: '1.125rem',
				},

				Dialog_unarchive_icon: {
					width: '1.125rem',
					height: '1.125rem',
				},

				Dialog_delete_icon: {
					width: '1.125rem',
					height: '1.125rem',
				},

				Registry_drop: {
					minWidth: '2.75rem',
					minHeight: '2.75rem',
				},

				/* пузырю можно шире: соседней колонки на телефоне всё равно нет */
				Message_row: {
					maxWidth: '85%',
				},

				Message_edit: {
					minWidth: '2.75rem',
					minHeight: '2.75rem',
				},

				Message_delete: {
					minWidth: '2.75rem',
					minHeight: '2.75rem',
				},

			},

		},

	} )

	// ===== Аватар-кружок с инициалом =====
	// Общий вид держим на самом компоненте: список диалогов и реестр
	// отличаются только размером, а палитра нужна обоим одинаковая.
	// Размер и кегль задаются на месте использования: селекторы тут
	// одной специфичности, повтори мы их здесь — перебили бы место вызова.


	/* Поле с карандашом: заполненное выглядит обычной строкой текста, пока в
	него не ткнули, а иконка подсказывает, что строку можно править. Иконку
	кладём поверх правого края, чтобы поле оставалось цельным элементом и
	переиспользовалось и в настройках, и в шапке чата. */
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

	$mol_style_define( $bog_gram_avatar, {

		flex: {
			shrink: 0,
		},
		borderRadius: '50%',
		background: {
			color: veil,
		},
		padding: '0.25rem',

		// Узор рисуется обводкой currentColor, поэтому цвет из палитры
		// красит сами точки, а не подложку
		'@': {
			bog_gram_tint: {
				'0': { color: '#e17076' },
				'1': { color: '#faa774' },
				'2': { color: '#a695e7' },
				'3': { color: '#7bc862' },
				'4': { color: '#6ec9cb' },
				'5': { color: '#65aadd' },
				'6': { color: '#ee7aae' },
			},
		},

	} )

	$mol_style_define( $bog_gram_chat, {

		Head: {
			align: {
				items: 'center',
			},
			padding: head_pad,
		},

		/* Место в шапке поделено со стрелкой «назад» и кнопками, поэтому
		заголовку нужен нулевой минимум: без него длинная подпись распирает
		шапку вместо того, чтобы ужиматься в отведённой ей ширине. */
		Title: {
			minWidth: 0,
			font: {
				weight: 'bold',
			},
		},

		/* Подпись собеседника правится прямо в заголовке тем же полем, что и
		имя в настройках. У вьюх по умолчанию flex-shrink 0, поэтому полю
		нужен и shrink, и нулевой минимум — иначе оно распирает шапку. */
		Note_field: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			maxWidth: '100%',
		},

		/* Заголовок без поля: подписывать некого, поэтому просто строка
		с многоточием на конце. */
		Title_text: {
			display: 'block',
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			maxWidth: '100%',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		/* Стрелка «назад» слева от имени собеседника — так закрывают чат на
		телефоне. На широком экране рядом лежит открытый список диалогов,
		возвращаться некуда, и вместо стрелки работает крестик справа. */
		Back: {
			display: 'none',
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
		},

		Back_icon: {
			width: '1.5rem',
			height: '1.5rem',
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

		/* Панель ввода стоит у самого низа экрана, а на айфоне там системная
		полоска-«домой»: её высоту добавляем к своему отступу. */
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

		/* Скрепка — такой же круглый пятачок, что и отправка, только без
		заливки: две кнопки по краям поля ввода должны быть одного роста. */
		Attach: {
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
			color: $mol_theme.shade,
			/* Скрытое поле выбора файла вдвое выше своей кнопки и без обрезки
			перехватывало бы клики по строке правки над ней. */
			overflow: 'hidden',
		},

		Attach_icon: {
			width: '1.25rem',
			height: '1.25rem',
		},

		/* Микрофон занимает место отправки, когда писать нечего, поэтому и
		габариты у него те же: строка ввода не должна дёргаться от того,
		что в поле появилась буква. */
		Voice: {
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
			color: $mol_theme.shade,
			/* запрет выделения и системного меню — в gram.view.css: долгое
			нажатие тут жест, а не вызов лупы */
		},

		Voice_icon: {
			width: '1.25rem',
			height: '1.25rem',
		},

		/* Состояние записи занимает место поля ввода: мигающая точка и
		растущий таймер. */
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
				color: alert_red,
			},
			/* мигание — в gram.view.css: ключевые кадры в типизированные
			стили не входят */
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

		/* Крестик — цель для пальца, съехавшего с микрофона: отпускание над
		ним отменяет запись, поэтому кнопка широкая и подписанная. */
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
			color: alert_red,
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

		/* Отказ микрофона и промах по кнопке объясняются строкой над полем
		ввода: ни модалок, ни системных окон. */
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

		// ===== Одна страница на экран =====
		// Ниже этой ширины список диалогов (24rem) и чат (30rem) рядом уже
		// не помещаются, буклет листается по одной странице — и чат закрывает
		// стрелка слева, а не крестик справа. Обе кнопки зовут один и тот же
		// обработчик, поэтому лишнюю просто прячем. Блок последний:
		// специфичность та же, что у базовых правил, решает порядок.

		'@media': {

			'(max-width: 54rem)': {

				Back: {
					display: 'flex',
				},

				Close: {
					display: 'none',
				},

			},

			/* Скрепка стоит вплотную к полю ввода, поэтому на телефоне ей
			нужен тот же запас под палец, что и остальным кнопкам списка. */
			'(max-width: 30rem)': {

				Attach: {
					minWidth: '2.75rem',
					minHeight: '2.75rem',
				},

				Voice: {
					minWidth: '2.75rem',
					minHeight: '2.75rem',
				},

				Voice_cancel: {
					minHeight: '2.75rem',
				},

			},

		},

	} )

	/* Коробка кадра: размер задаётся в разметке из данных сообщения, здесь
	только вид. Пока картинка не приехала, коробка стоит пустой заливкой —
	лента уже разложена и от появления кадра не дёрнется. */
	$mol_style_define( $bog_gram_photo, {

		display: 'block',
		flex: {
			shrink: 0,
		},
		maxWidth: '100%',
		padding: 0,
		overflow: 'hidden',
		borderRadius: '0.5rem',
		background: {
			color: veil,
		},

		Image: {
			display: 'block',
			width: '100%',
			height: '100%',
			/* object-fit нет в словаре типизированных стилей — правило
			лежит в gram.view.css */
		},

	} )

	/* Голосовое в пузыре: кнопка, полоса прогресса и длина одной строкой.
	Сам элемент звука лежит тут же и не показывается — играть это ему не
	мешает. */
	$mol_style_define( $bog_gram_sound, {

		align: {
			items: 'center',
		},
		gap: '0.5rem',
		minWidth: 0,
		maxWidth: '100%',
		padding: {
			top: '0.125rem',
			bottom: '0.125rem',
			left: 0,
			right: 0,
		},

		Toggle: {
			flex: {
				shrink: 0,
			},
			justify: {
				content: 'center',
			},
			align: {
				items: 'center',
			},
			minWidth: '2rem',
			minHeight: '2rem',
			padding: 0,
			borderRadius: '50%',
			background: {
				color: tg_blue,
			},
			color: '#ffffff',
		},

		Play_icon: {
			width: '1.125rem',
			height: '1.125rem',
		},

		Pause_icon: {
			width: '1.125rem',
			height: '1.125rem',
		},

		/* Полоса тянется на всё свободное место, но не схлопывается в точку
		на узком пузыре: у вьюх flex-shrink нулевой, поэтому и растяжение, и
		сжатие задаются явно. */
		Track: {
			flex: {
				grow: 1,
				shrink: 1,
			},
			minWidth: '3rem',
			height: '0.25rem',
			borderRadius: '0.25rem',
			background: {
				color: veil,
			},
			overflow: 'hidden',
		},

		Fill: {
			height: '100%',
			background: {
				color: tg_blue,
			},
		},

		Stamp: {
			flex: {
				shrink: 0,
			},
			font: {
				size: '0.75rem',
			},
			opacity: .65,
			whiteSpace: 'nowrap',
		},

		Node: {
			display: 'none',
		},

	} )

	/* Развёрнутый кадр: слой на всю страницу чата, а не на весь экран —
	на широком мониторе список диалогов остаётся видимым. */
	$mol_style_define( $bog_gram_zoom, {

		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		zIndex: 2,
		justify: {
			content: 'center',
		},
		align: {
			items: 'center',
		},
		padding: '1rem',
		background: {
			color: '#000000cc',
		},
		outline: 'none',

		Shot: {
			maxWidth: '100%',
			maxHeight: '100%',
			borderRadius: '0.5rem',
		},

	} )

}
