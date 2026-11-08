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
