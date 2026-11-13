namespace $.$$ {

	export class $bog_gram_write extends $.$bog_gram_write {

		/**
		 * Enter отправляет только там, где есть физическая клавиатура.
		 * Тач без мыши и трекпада — это телефон: там Enter переносит строку,
		 * а отправка остаётся за кнопкой.
		 */
		enter_sends() {

			const nav = this.$.$mol_dom_context.navigator

			// Без тача клавиатура точно есть: ноутбук или десктоп.
			if( !nav?.maxTouchPoints ) return true

			// Тач есть, но есть и точный указатель — значит, это гибрид.
			if( this.$.$mol_media.match( '(any-pointer: fine)' ) ) return true

			// Мышь может не репортиться как fine, но наведение она даёт.
			if( this.$.$mol_media.match( '(hover: hover)' ) ) return true

			return false

		}

		/**
		 * Enter обрабатывает `press`, а не хоткей: так путь отправки один.
		 * Плагин `Submit` на том же поле иначе слал бы второе сообщение —
		 * его `keydown` приходит до всплытия до `press`.
		 */
		override submit( event?: KeyboardEvent ) {
			return null
		}

		newline() {
			const text = this.value()
			const [ from = text.length, to = from ] = this.selection()
			this.value( text.slice( 0, from ) + '\n' + text.slice( to ) )
			this.selection([ from + 1, from + 1 ])
		}

		override press( event: KeyboardEvent ) {

			if( event.keyCode === $mol_keyboard_code.tab ) return

			if( event.keyCode === $mol_keyboard_code.enter ) {

				if( event.ctrlKey || event.metaKey ) {
					event.preventDefault()
					this.newline()
					return
				}

				if( event.shiftKey || !this.enter_sends() ) return

				event.preventDefault()
				this.send( event )
				return
			}

			super.press( event )

		}

	}

}
