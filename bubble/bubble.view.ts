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

		override album() {
			return this.shot() && this.shots().length > 1
		}

		override Sound() {
			return this.sound() ? super.Sound() : null!
		}

		override Round() {
			return this.round() ? super.Round() : null!
		}

		override bare() {
			return this.round() && !this.body() && !this.quote_shown() && !this.task()
		}

		override done() {
			return this.task() && this.task_done()
		}

		override Task() {
			return this.task() ? super.Task() : null!
		}

		override Task_mark() {
			return this.forwardable() ? super.Task_mark() : null!
		}

		override Clip() {
			return this.video() ? super.Clip() : null!
		}

		override Call() {
			return this.call() ? super.Call() : null!
		}

		override content(): $bog_rich_content {
			return $bog_rich_empty
		}

		body() {
			return this.content().text
		}

		override Body() {
			return this.body() ? super.Body() : null!
		}

		@ $mol_mem
		override card_link() {
			return $bog_dock_card_find( this.body() )
		}

		override Card() {
			if( !this.card_link() ) return null!
			const card = super.Card()
			return $bog_gram_soft( ()=> card.name(), '' ) ? card : null!
		}

		override Edited() {
			return this.edited() ? super.Edited() : null!
		}

		override Sent_wait() {
			return this.sent() === 'wait' ? super.Sent_wait() : null!
		}

		override Sent_done() {
			return this.sent() === 'done' ? super.Sent_done() : null!
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

		override reaction_chips() {
			return $bog_gram_react.shown( this.reactions() ).map( kind => this.Reaction( kind ) )
		}

		override Reactions() {
			return this.reaction_chips().length ? super.Reactions() : null!
		}

		override palette_picks() {
			return $bog_gram_react.kinds.map( kind => this.Pick( kind ) )
		}

		override Palette() {
			return this.react_open() ? super.Palette() : null!
		}

		override reaction_mine( kind: string ) {
			return this.react() === kind
		}

		override reaction_label( kind: string ) {
			return kind + ' ' + $bog_gram_react.count( this.reactions(), kind )
		}

		override pick_label( kind: string ) {
			return kind
		}

		@ $mol_action
		override reaction_toggle( kind: string, next?: any ) {
			this.react( this.reaction_mine( kind ) ? '' : kind )
			return null
		}

		players() {
			return [ this.Sound(), this.Round() ].filter( Boolean ) as ( $.$$.$bog_gram_sound | $.$$.$bog_gram_round )[]
		}

		sound_start() {
			for( const player of this.players() ) player.start()
		}

		sound_stop() {
			for( const player of this.players() ) player.stop()
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
