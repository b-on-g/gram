namespace $.$$ {

	export class $bog_gram_call_tile extends $.$bog_gram_call_tile {

		override letter() {
			return this.name().slice( 0, 1 ).toUpperCase()
		}

		override status_text() {
			const status = this.status()
			if( !status || status === 'connected' ) return ''
			if( status === 'paused' ) return this.paused_text()
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

		part( kind: 'audio' | 'video' ) {

			const stream = this.stream() as MediaStream | null
			if( !stream ) return null

			const tracks = stream.getTracks().filter( track => track.kind === kind )
			if( !tracks.length ) return null

			return new MediaStream( tracks )
		}

		@ $mol_mem
		override picture() {
			return this.part( 'video' )
		}

		@ $mol_mem
		override sound() {
			return this.part( 'audio' )
		}

		@ $mol_mem
		meter() {

			const sound = this.sound() as MediaStream | null
			const Context = this.$.$mol_dom_context.AudioContext
			if( !sound || !Context ) return null

			const context = new Context()
			const analyser = context.createAnalyser()
			analyser.fftSize = 256
			context.createMediaStreamSource( sound ).connect( analyser )

			return Object.assign( analyser, {
				bytes: new Uint8Array( analyser.fftSize ),
				destructor: ()=> { context.close().catch( ()=> {} ) },
			} )
		}

		@ $mol_mem
		level() {

			this.$.$mol_state_time.now( 100 )

			const meter = this.meter()
			if( !meter ) return 0

			meter.getByteTimeDomainData( meter.bytes )

			return $bog_gram_call_room.level_of( meter.bytes )
		}

		override level_size() {
			return `${ Math.round( this.level() * 100 ) }%`
		}

		video() {
			return this.Video().dom_node() as HTMLVideoElement
		}

		audio() {
			return this.Sound().dom_node() as HTMLAudioElement
		}

		override auto() {

			const video = this.video()
			video.muted = true

			const audio = this.audio()
			audio.muted = this.muted()

			const speaker = this.speaker()
			if( audio.setSinkId && audio.sinkId !== speaker ) audio.setSinkId( speaker ).catch( ()=> {} )

			this.Video().pause_event()
			this.Sound().pause_event()

			if( this.sound() && audio.paused ) audio.play().catch( ()=> {} )

			if( !this.awake() ) return
			if( this.picture() && video.paused ) video.play().catch( ()=> {} )

		}

	}

}
