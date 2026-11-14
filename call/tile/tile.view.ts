namespace $.$$ {

	export class $bog_gram_call_tile extends $.$bog_gram_call_tile {

		override letter() {
			return this.name().slice( 0, 1 ).toUpperCase()
		}

		override status_text() {
			const status = this.status()
			if( !status || status === 'connected' ) return ''
			if( status === 'failed' ) return this.failed_text()
			return this.connecting_text()
		}

		override label() {
			return [
				this.Name(),
				... this.mic() ? [] : [ this.Mic_off() ],
				... this.status_text() ? [ this.Status() ] : [],
			]
		}

		override Stats() {
			return this.stats() ? super.Stats() : null!
		}

		override stat_parts() {
			return [ 'fps', 'size', 'kbps', 'loss', 'rtt' ].map( id => this.Stat( id ) )
		}

		override stat_text( id: string ) {

			const stats = this.stats() as $bog_gram_call_peer_stats | null
			if( !stats ) return ''

			switch( id ) {
				case 'fps': return $bog_gram_text_fill( this.stat_fps(), { n: stats.fps } )
				case 'size': return $bog_gram_text_fill( this.stat_size(), { n: `${ stats.width }×${ stats.height }` } )
				case 'kbps': return $bog_gram_text_fill( this.stat_kbps(), { n: stats.kbps } )
				case 'loss': return $bog_gram_text_fill( this.stat_loss(), { n: stats.loss } )
				case 'rtt': return $bog_gram_text_fill( this.stat_rtt(), { n: stats.rtt } )
			}

			return ''
		}

		override stat_bad( id: string ) {
			const stats = this.stats() as $bog_gram_call_peer_stats | null
			if( !stats ) return false
			return ( $bog_gram_call_peer.stats_bad( stats ) as Record< string, boolean > )[ id ] ?? false
		}

		video() {
			return this.Video().dom_node() as HTMLVideoElement
		}

		override auto() {

			const video = this.video()
			video.muted = this.muted()

			this.Video().pause_event()
			if( !this.awake() || !this.stream() || !video.paused ) return

			video.play().catch( ()=> {} )

		}

	}

}
