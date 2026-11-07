namespace $.$$ {

	const tg_blue = $mol_theme.control

	/** Нейтральная полупрозрачная заливка: чуть темнее на светлой теме, чуть светлее на тёмной. */
	const veil = '#8888881a'

	/** Красный для опасных мест: тот же, что у взведённой корзины в gram.view.css. */
	const alert_red = '#e14b4b'

	/** Палитра по номеру из хеша идентификатора: один и тот же лорд всегда
	 * красится одинаково — и узором кружка в списке, и подписью над своим
	 * пузырём в группе. */
	const tint_rules = {
		'0': { color: '#e17076' },
		'1': { color: '#faa774' },
		'2': { color: '#a695e7' },
		'3': { color: '#7bc862' },
		'4': { color: '#6ec9cb' },
		'5': { color: '#65aadd' },
		'6': { color: '#ee7aae' },
	} as const

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

		Chat_page: {
			width: '30rem',
			flex: {
				grow: 1,
			},
			background: {
				color: $mol_theme.back,
			},
		},

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

		/* Имя отправителя стоит только в группе и только над чужим пузырём.
		Цвет берётся из той же палитры, что и узор аватара: в длинной группе
		имена различаются ещё и на глаз, а не только буквами. */
		Message_author: {
			display: 'block',
			alignSelf: 'stretch',
			minWidth: 0,
			maxWidth: '100%',
			font: {
				size: '0.8rem',
				weight: 'bold',
			},
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',

			'@': {
				bog_gram_tint: tint_rules,
			},

		},

		Message_quote: {
			display: 'flex',
			flex: {
				direction: 'column',
			},
			alignSelf: 'stretch',
			alignItems: 'flex-start',
			minWidth: 0,
			padding: {
				top: '0.125rem',
				bottom: '0.125rem',
				left: '0.5rem',
				right: '0.5rem',
			},
			margin: {
				bottom: '0.25rem',
			},
			border: {
				left: {
					width: '2px',
					style: 'solid',
					color: tg_blue,
				},
			},
			borderRadius: '0.25rem',
			background: {
				color: $mol_theme.hover,
			},
			font: {
				size: '0.8rem',
			},
			textAlign: 'left',
		},

		Message_quote_author: {
			color: tg_blue,
			font: {
				weight: 'bold',
			},
			maxWidth: '100%',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		Message_quote_text: {
			color: $mol_theme.shade,
			maxWidth: '100%',
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
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

		// ===== Телефон =====
		// Страница занимает вьюпорт целиком, место дороже воздуха: строкам
		// списка режем отступы, а кнопкам внутри них, наоборот, добавляем —
		// 2.75rem это 44 точки, минимум под палец по гайдлайну Apple.
		// Блок последний: специфичность та же, что у базовых правил,
		// решает порядок.

		'@media': {

			'(max-width: 30rem)': {

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

		/* Вход в список участников: справа от заголовка, на месте крестика и
		того же роста. У переписки вдвоём этой кнопки нет вовсе. */
		Members: {
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

		Members_icon: {
			width: '1.25rem',
			height: '1.25rem',
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

		Reply_banner: {
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

		Reply_icon: {
			color: tg_blue,
			flex: {
				shrink: 0,
			},
		},

		Reply_info: {
			flex: {
				direction: 'column',
				grow: 1,
				shrink: 1,
			},
			minWidth: 0,
			font: {
				size: '0.8rem',
			},
		},

		Reply_title: {
			color: tg_blue,
			font: {
				weight: 'bold',
			},
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		},

		Reply_text: {
			color: $mol_theme.shade,
			whiteSpace: 'nowrap',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
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

				Members: {
					minWidth: '2.75rem',
					minHeight: '2.75rem',
				},

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

}
