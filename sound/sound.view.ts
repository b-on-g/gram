namespace $.$$ {

	const rates = [ 1, 1.5, 2 ]

	const flat = 0.15

	export class $bog_gram_sound extends $.$bog_gram_sound {

		override Node() {
			return this.uri() ? super.Node() : null!
		}

		override Rate() {
			return this.playing() ? super.Rate() : null!
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
		share() {
			const span = this.span()
			if( !span ) return 0
			return Math.max( 0, Math.min( 1, this.moment() / span ) )
		}

		@ $mol_mem
		levels() {
			const code = this.wave()
			if( code ) return this.$.$bog_gram_voice.wave_levels( code )
			return Array.from( { length: 48 }, ()=> flat )
		}

		override bars() {
			return this.levels().map( ( _, index )=> this.Bar( index ) )
		}

		override bar_height( index: number ) {
			return Math.max( 12, Math.round( ( this.levels()[ index ] ?? 0 ) * 100 ) ) + '%'
		}

		override bar_played( index: number ) {
			const share = this.share()
			if( !share ) return false
			return ( index + 0.5 ) / this.levels().length <= share
		}

		@ $mol_mem
		override rate( next?: number ) {
			const rate = this.$.$mol_state_local.value< number >( 'bog_gram_voice_rate', next ) ?? 1
			return rates.includes( rate ) ? rate : 1
		}

		override rate_label() {
			return this.rate() + '×'
		}

		@ $mol_action
		override rate_next( next?: any ) {
			this.rate( rates[ ( rates.indexOf( this.rate() ) + 1 ) % rates.length ] )
			return null
		}

		@ $mol_action
		override seek( next?: MouseEvent ) {

			const node = this.node()
			const span = this.span()
			const rect = this.Wave().view_rect()
			if( !node || !span || !rect?.width || !next ) return null

			const share = Math.max( 0, Math.min( 1, ( next.clientX - rect.left ) / rect.width ) )
			node.seek( share * span )

			if( !this.playing() ) this.toggle( next )

			return null
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
