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

		override Clip() {
			return this.video() ? super.Clip() : null!
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

		override Forwarded() {
			return this.forwarded() ? super.Forwarded() : null!
		}

		override Contact() {
			return this.contact() ? super.Contact() : null!
		}

		override Copy() {
			return this.body() ? super.Copy() : null!
		}

		override Forward() {
			return this.forwardable() ? super.Forward() : null!
		}

		override Edit() {
			return this.out() ? super.Edit() : null!
		}

		override Delete() {
			return this.out() ? super.Delete() : null!
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
