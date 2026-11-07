namespace $.$$ {

	export class $bog_gram_bubble extends $.$bog_gram_bubble {

		override Author() {
			return this.author() ? super.Author() : null!
		}

		override Quote() {
			return this.quote_shown() ? super.Quote() : null!
		}

		override Shot() {
			return this.shot() ? super.Shot() : null!
		}

		override Sound() {
			return this.sound() ? super.Sound() : null!
		}

		override Call() {
			return this.call() ? super.Call() : null!
		}

		override Body() {
			return this.body() ? super.Body() : null!
		}

		override Edited() {
			return this.edited() ? super.Edited() : null!
		}

		override Checks() {
			return this.checks() ? super.Checks() : null!
		}

		override Actions() {
			return this.out() ? super.Actions() : null!
		}

		sound_start() {
			( this.Sound() as $.$$.$bog_gram_sound | null )?.start()
		}

		sound_stop() {
			( this.Sound() as $.$$.$bog_gram_sound | null )?.stop()
		}

		@ $mol_action
		override actions_touch( next?: Event ) {
			next?.stopPropagation()
			return null
		}

		@ $mol_action
		override mouse_down( next?: MouseEvent ) {
			if( ( next?.detail ?? 0 ) > 1 ) next!.preventDefault()
			return null
		}

	}

}
