namespace $ {

	export class $bog_gram_stage extends $mol_object {

		static able() {
			const document = $mol_dom_context.document
			if( !document ) return false
			return typeof document.createElement( 'canvas' ).captureStream === 'function'
		}

		static crop( width: number, height: number ) {
			const side = Math.min( width, height )
			return { left: ( width - side ) / 2, top: ( height - side ) / 2, side }
		}

		static flip( mirror: boolean, side: number ) {
			return mirror ? [ -1, 0, 0, 1, side, 0 ] as const : [ 1, 0, 0, 1, 0, 0 ] as const
		}

		side() {
			return 480
		}

		mirror() {
			return false
		}

		fps() {
			return 30
		}

		canvas = null as HTMLCanvasElement | null
		video = null as HTMLVideoElement | null
		output = null as MediaStream | null
		frame = 0

		start( source: MediaStream ) {

			const document = $mol_dom_context.document

			const canvas = this.canvas = document.createElement( 'canvas' )
			canvas.width = canvas.height = this.side()

			const video = this.video = document.createElement( 'video' )
			video.muted = true
			video.playsInline = true
			video.autoplay = true

			this.source( source )
			this.draw()

			this.output = canvas.captureStream( this.fps() )
			return this.output.getVideoTracks()
		}

		source( stream: MediaStream ) {
			const video = this.video
			if( !video ) return
			video.srcObject = stream
			video.play().catch( error => $mol_fail_log( error ) )
		}

		draw = ()=> {

			const canvas = this.canvas
			const video = this.video
			if( !canvas || !video ) return

			if( video.videoWidth && video.videoHeight ) {
				const crop = $bog_gram_stage.crop( video.videoWidth, video.videoHeight )
				const context = canvas.getContext( '2d' )
				const [ a, b, c, d, e, f ] = $bog_gram_stage.flip( this.mirror(), canvas.width )
				context?.setTransform( a, b, c, d, e, f )
				context?.drawImage( video, crop.left, crop.top, crop.side, crop.side, 0, 0, canvas.width, canvas.height )
			}

			this.frame = $mol_dom_context.requestAnimationFrame( this.draw )
		}

		override destructor() {

			$mol_dom_context.cancelAnimationFrame?.( this.frame )

			for( const track of this.output?.getTracks() ?? [] ) track.stop()

			if( this.video ) this.video.srcObject = null

			this.canvas = null
			this.video = null
			this.output = null

			super.destructor()
		}

	}

}
