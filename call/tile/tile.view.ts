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

		override auto() {
			const video = this.Video().dom_node() as HTMLVideoElement
			video.muted = this.muted()
		}

	}

}
