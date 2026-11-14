namespace $ {

	export type $bog_gram_voice_kind = 'voice' | 'round'

	const kinds = {
		voice: {
			types: [ 'audio/webm;codecs=opus', 'audio/webm', 'audio/mp4' ],
			audio: 32_000,
			video: 0,
			limit: 5 * 60,
		},
		round: {
			types: [ 'video/mp4;codecs=avc1,mp4a', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm' ],
			audio: 64_000,
			video: 1_000_000,
			limit: 60,
		},
	}

	const span_min = 0.7

	const wave_bars = 48

	const wave_digits = '0123456789abcdefghijklmnopqrstuv'

	export type $bog_gram_voice_take = {
		bytes: Uint8Array< ArrayBuffer >,
		type: string,
		span: number,
		wave: string,
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

		static wave_code( samples: ArrayLike< number >, bars = wave_bars ) {

			if( !samples.length ) return ''

			const peaks = [] as number[]
			const step = samples.length / bars

			for( let bar = 0; bar < bars; ++ bar ) {
				let peak = 0
				const end = Math.min( samples.length, Math.floor( ( bar + 1 ) * step ) )
				for( let i = Math.floor( bar * step ); i < end; ++ i ) peak = Math.max( peak, Math.abs( samples[ i ] ) )
				peaks.push( peak )
			}

			const top = Math.max( ... peaks )
			if( !top ) return wave_digits[ 0 ].repeat( bars )

			return peaks.map( peak => wave_digits[ Math.round( peak / top * ( wave_digits.length - 1 ) ) ] ).join( '' )
		}

		static wave_levels( code: string ) {
			return [ ... code ].map( digit => Math.max( 0, wave_digits.indexOf( digit ) ) / ( wave_digits.length - 1 ) )
		}

		static async wave( bytes: Uint8Array< ArrayBuffer > ) {

			const Context = $mol_dom_context.AudioContext ?? ( $mol_dom_context as any ).webkitAudioContext as typeof AudioContext | undefined
			if( !Context ) return ''

			const context = new Context()
			try {
				const audio = await context.decodeAudioData( bytes.slice().buffer )
				return this.wave_code( audio.getChannelData( 0 ) )
			} catch( error ) {
				$mol_fail_log( error )
				return ''
			} finally {
				context.close().catch( ()=> {} )
			}
		}

		static type( kind: $bog_gram_voice_kind = 'voice' ) {
			const maker = $mol_dom_context.MediaRecorder
			if( !maker ) return ''
			return kinds[ kind ].types.find( type => maker.isTypeSupported( type ) ) ?? ''
		}

		static supported( kind: $bog_gram_voice_kind = 'voice' ) {
			if( !$mol_dom_context.navigator?.mediaDevices?.getUserMedia ) return false
			return Boolean( this.type( kind ) )
		}

		static constraints( kind: $bog_gram_voice_kind ): MediaStreamConstraints {
			if( kind === 'voice' ) return { audio: true }
			return {
				audio: true,
				video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 }, aspectRatio: { ideal: 1 } },
			}
		}

		kind(): $bog_gram_voice_kind {
			return 'voice'
		}

		filled = ()=> {}

		opened = ( stream: MediaStream )=> {}

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

			const kind = this.kind()
			const setup = kinds[ kind ]

			const type = $bog_gram_voice.type( kind )
			if( !type ) throw new Error( this.Text().voice_unsupported() )

			const stream = await $mol_dom_context.navigator.mediaDevices.getUserMedia( $bog_gram_voice.constraints( kind ) )

			if( this.asked ) {
				this.hush( stream )
				this.done( null )
				return false
			}

			const chunks = [] as Blob[]

			const recorder = new $mol_dom_context.MediaRecorder( stream, {
				mimeType: type,
				audioBitsPerSecond: setup.audio,
				... setup.video ? { videoBitsPerSecond: setup.video } : {},
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
			this.opened( stream )

			this.limit = $mol_dom_context.setTimeout( ()=> this.filled(), setup.limit * 1000 )

			return true
		}

		async pack( chunks: readonly Blob[], type: string, span: number ) {
			try {
				const blob = new $mol_blob( chunks, { type } )
				const bytes = new Uint8Array( await blob.arrayBuffer() )
				const wave = this.kind() === 'voice' ? await $bog_gram_voice.wave( bytes ) : ''
				this.done({ bytes, type: blob.type || type, span, wave })
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
