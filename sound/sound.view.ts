namespace $.$$ {

	export class $bog_gram_sound extends $.$bog_gram_sound {

		override Node() {
			return this.uri() ? super.Node() : null!
		}

		node() {
			return this.Node() as $.$$.$bog_gram_sound_node | null
		}

		@ $mol_mem
		moment() {
			return $bog_gram_soft( ()=> this.node()?.time() ?? 0, 0 )
		}

		@ $mol_mem
		override stamp() {
			return this.$.$bog_gram_voice.stamp( this.playing() ? this.moment() : this.span() )
		}

		@ $mol_mem
		override fill_width() {
			const span = this.span()
			if( !span ) return '0%'
			const share = Math.max( 0, Math.min( 1, this.moment() / span ) )
			return ( share * 100 ).toFixed( 1 ) + '%'
		}

		override toggle_icons() {
			return [ this.playing() ? this.Pause_icon() : this.Play_icon() ]
		}

		start() {
			this.node()?.start()
		}

		stop() {
			this.node()?.stop()
		}

	}

}
