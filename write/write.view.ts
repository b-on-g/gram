namespace $.$$ {

	export class $bog_gram_write extends $.$bog_gram_write {

		enter_sends() {
			return this.$.$mol_media.match( '(pointer: fine)' )
		}

		override submit( event?: KeyboardEvent ) {
			if( !this.enter_sends() ) return null
			event?.preventDefault()
			this.send( event )
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

			if( event.keyCode === $mol_keyboard_code.enter && ( event.ctrlKey || event.metaKey ) && !event.altKey ) {
				event.preventDefault()
				this.newline()
				return
			}

			super.press( event )
		}

	}

}
