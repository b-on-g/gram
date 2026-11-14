namespace $ {

	const rate = 32000

	const types = [ 'audio/webm;codecs=opus', 'audio/webm', 'audio/mp4' ]

	const span_limit = 5 * 60

	const span_min = 0.7

	export type $bog_gram_voice_take = {
		bytes: Uint8Array< ArrayBuffer >,
		type: string,
		span: number,
	}

	export class $bog_gram_voice extends $mol_object {

		@ $mol_mem
		Text() {
			return this.$.$bog_gram_text.make({ $: this.$ })
		}

		static stamp( span: number ) {
			const whole = Math.max( 0, Math.round( span ) )
			const min = Math.floor( whole / 60 )
			const sec = whole % 60
			return min + ':' + String( sec ).padStart( 2, '0' )
		}

		static type() {
			const maker = $mol_dom_context.MediaRecorder
			if( !maker ) return ''
			return types.find( type => maker.isTypeSupported( type ) ) ?? ''
		}

		static supported() {
			if( !$mol_dom_context.navigator?.mediaDevices?.getUserMedia ) return false
			return Boolean( this.type() )
		}

		filled = ()=> {}

		done = ( take: $bog_gram_voice_take | null )=> {}
		result = new Promise< $bog_gram_voice_take | null >( done => { this.done = done } )

		opening = null as Promise< boolean > | null

		stream = null as MediaStream | null
		recorder = null as MediaRecorder | null

		asked = false

		moment = 0

		limit = null as ReturnType< typeof setTimeout > | null

		open() {
			return this.opening ??= this.open_run()
		}

		async open_run() {

			const type = $bog_gram_voice.type()
			if( !type ) throw new Error( this.Text().voice_unsupported() )

			const stream = await $mol_dom_context.navigator.mediaDevices.getUserMedia({ audio: true })

			if( this.asked ) {
				this.hush( stream )
				this.done( null )
				return false
			}

			const chunks = [] as Blob[]

			const recorder = new $mol_dom_context.MediaRecorder( stream, {
				mimeType: type,
				audioBitsPerSecond: rate,
			} )

			recorder.ondataavailable = event => {
				if( event.data.size ) chunks.push( event.data )
			}

			recorder.onstop = ()=> {
				this.hush( stream )
				const span = ( Date.now() - this.moment ) / 1000
				if( span < span_min || !chunks.length ) return this.done( null )
				void this.pack( chunks, type, span )
			}

			this.stream = stream
			this.recorder = recorder
			this.moment = Date.now()

			recorder.start()

			this.limit = $mol_dom_context.setTimeout( ()=> this.filled(), span_limit * 1000 )

			return true
		}

		async pack( chunks: readonly Blob[], type: string, span: number ) {
			try {
				const blob = new $mol_blob( chunks, { type } )
				const bytes = new Uint8Array( await blob.arrayBuffer() )
				this.done({ bytes, type: blob.type || type, span })
			} catch( error ) {
				$mol_fail_log( error )
				this.done( null )
			}
		}

		hush( stream: MediaStream | null ) {
			for( const track of stream?.getTracks() ?? [] ) track.stop()
		}

		stop() {

			if( this.asked ) return
			this.asked = true

			if( this.limit !== null ) $mol_dom_context.clearTimeout( this.limit )
			this.limit = null

			const recorder = this.recorder
			if( !recorder ) return

			if( recorder.state === 'inactive' ) {
				this.hush( this.stream )
				this.done( null )
			} else {
				recorder.stop()
			}

		}

		drop() {
			this.stop()
			this.done( null )
		}

		take() {
			return this.result
		}

	}

}
