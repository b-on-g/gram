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
				case 'fps': return this.stat_fps().replace( '{n}', String( stats.fps ) )
				case 'size': return this.stat_size().replace( '{n}', `${ stats.width }×${ stats.height }` )
				case 'kbps': return this.stat_kbps().replace( '{n}', String( stats.kbps ) )
				case 'loss': return this.stat_loss().replace( '{n}', String( stats.loss ) )
				case 'rtt': return this.stat_rtt().replace( '{n}', String( stats.rtt ) )
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
