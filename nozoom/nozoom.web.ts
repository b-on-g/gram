namespace $ {

	/**
	 * Сафари увеличивает всю страницу, когда фокус уходит в поле ввода, и
	 * обратно масштаб не возвращает — приходится разводить страницу пальцами,
	 * чтобы дотянуться до кнопки отправки. Шрифта в шестнадцать пикселей
	 * хватает не всегда: в приложении, добавленном на домашний экран, зум
	 * случается и при нём.
	 *
	 * Поэтому на время ввода запрещаем масштабирование, а как только фокус
	 * уходит — возвращаем. Пинч-зум остаётся доступен всегда, кроме короткого
	 * промежутка, пока человек печатает.
	 */
	function $bog_gram_nozoom_web() {

		if( typeof window === 'undefined' ) return

		const doc = $mol_dom_context.document
		if( !doc ) return

		const meta = doc.querySelector( 'meta[name="viewport"]' ) as HTMLMetaElement | null
		if( !meta ) return

		const free = meta.content
		const lock = free.includes( 'maximum-scale' ) ? free : free + ', maximum-scale=1'

		const editable = ( node: EventTarget | null ) => {
			const el = node as HTMLElement | null
			if( !el?.tagName ) return false
			return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
		}

		doc.addEventListener( 'focusin', event => {
			if( editable( event.target ) ) meta.content = lock
		} )

		doc.addEventListener( 'focusout', event => {
			if( !editable( event.target ) ) return
			// Возврат откладываем: при переходе между полями фокус успевает
			// моргнуть, и без паузы масштаб дёргался бы туда-сюда.
			new $mol_after_timeout( 300, ()=> {
				if( editable( doc.activeElement ) ) return
				meta.content = free
			} )
		} )

	}

	$bog_gram_nozoom_web()

}
