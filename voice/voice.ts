namespace $ {

	export type $bog_gram_voice_kind = 'voice' | 'round'

	export type $bog_gram_voice_facing = 'user' | 'environment'

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

	const stash_slice = 1000

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

		static hearing: MediaTrackConstraints = { echoCancellation: true, noiseSuppression: true, autoGainControl: true }

		static sight( facing: $bog_gram_voice_facing ): MediaTrackConstraints {
			return { facingMode: facing, width: { ideal: 480 }, height: { ideal: 480 }, aspectRatio: { ideal: 1 } }
		}

		static constraints( kind: $bog_gram_voice_kind, facing: $bog_gram_voice_facing = 'user' ): MediaStreamConstraints {
			if( kind === 'voice' ) return { audio: this.hearing }
			return { audio: this.hearing, video: this.sight( facing ) }
		}

		static preview( stream: MediaStream ) {
			return new $mol_dom_context.MediaStream( stream.getVideoTracks() )
		}

		static turn_live() {
			return $bog_gram_stage.able()
		}

		static async revive( dialog: string ) {

			const left = await $bog_gram_stash.left()
			if( !left || left.dialog !== dialog || left.span < span_min ) return null

			const wave = left.kind === 'voice' ? await this.wave( left.bytes ) : ''

			const take = this.make({ kind: ()=> left.kind, dialog: ()=> left.dialog })
			take.asked = true
			take.done({ bytes: left.bytes, type: left.type, span: left.span, wave })

			return take
		}

		static async cameras() {
			const devices = await $mol_dom_context.navigator.mediaDevices.enumerateDevices().catch( ()=> [] as MediaDeviceInfo[] )
			return devices.filter( device => device.kind === 'videoinput' ).length
		}

		kind(): $bog_gram_voice_kind {
			return 'voice'
		}

		facing(): $bog_gram_voice_facing {
			return 'user'
		}

		dialog() {
			return ''
		}

		stage = null as $bog_gram_stage | null

		face_now = null as $bog_gram_voice_facing | null

		face() {
			return this.face_now ?? this.facing()
		}

		filled = ()=> {}

		opened = ( preview: MediaStream )=> {}

		turning = null as Promise< boolean > | null

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

			const type = $bog_gram_voice.type( kind )
			if( !type ) throw new Error( this.Text().voice_unsupported() )

			const stream = await $mol_dom_context.navigator.mediaDevices.getUserMedia( $bog_gram_voice.constraints( kind, this.face() ) )

			if( this.asked ) {
				this.hush( stream )
				this.done( null )
				return false
			}

			this.stream = stream
			this.opened( $bog_gram_voice.preview( stream ) )

			return true
		}

		turnable() {
			if( this.asked || !this.stream ) return false
			return !this.recorder || Boolean( this.stage )
		}

		turn() {
			if( !this.turnable() ) return Promise.resolve( false )
			return this.turning ??= this.turn_run().finally( ()=> { this.turning = null } )
		}

		async turn_run() {

			const face = this.face() === 'user' ? 'environment' : 'user'

			for( const track of this.stream?.getVideoTracks() ?? [] ) track.stop()

			const sight = await $mol_dom_context.navigator.mediaDevices.getUserMedia({ video: $bog_gram_voice.sight( face ) })

			if( !this.turnable() ) {
				this.hush( sight )
				return false
			}

			this.face_now = face
			this.stream = new $mol_dom_context.MediaStream([ ... this.stream!.getAudioTracks(), ... sight.getVideoTracks() ])
			this.stage?.source( $bog_gram_voice.preview( this.stream ) )
			this.opened( $bog_gram_voice.preview( this.stream ) )

			return true
		}

		stage_make( stream: MediaStream ) {

			if( this.kind() !== 'round' || !$bog_gram_voice.turn_live() ) return stream

			try {
				const stage = $bog_gram_stage.make({ mirror: ()=> this.face() === 'user' })
				const sight = stage.start( $bog_gram_voice.preview( stream ) )
				this.stage = stage
				return new $mol_dom_context.MediaStream([ ... stream.getAudioTracks(), ... sight ])
			} catch( error ) {
				$mol_fail_log( error )
				this.stage?.destructor()
				this.stage = null
				return stream
			}

		}

		record() {

			if( !this.stream || this.recorder || this.asked || this.turning ) return false

			const kind = this.kind()
			const setup = kinds[ kind ]
			const type = $bog_gram_voice.type( kind )
			const dialog = this.dialog()

			const stream = this.stage_make( this.stream )
			const chunks = [] as Blob[]

			const recorder = new $mol_dom_context.MediaRecorder( stream, {
				mimeType: type,
				audioBitsPerSecond: setup.audio,
				... setup.video ? { videoBitsPerSecond: setup.video } : {},
			} )

			recorder.ondataavailable = event => {
				if( !event.data.size ) return
				chunks.push( event.data )
				const span = ( Date.now() - this.moment ) / 1000
				if( dialog ) void $bog_gram_stash.put({ dialog, kind, type, span, data: event.data })
			}

			recorder.onstop = ()=> {
				this.hush( stream )
				this.hush( this.stream )
				this.stage?.destructor()
				this.stage = null
				const span = ( Date.now() - this.moment ) / 1000
				if( span < span_min || !chunks.length ) return this.done( null )
				void this.pack( chunks, type, span )
			}

			this.recorder = recorder
			this.moment = Date.now()

			if( dialog ) void $bog_gram_stash.clear()
			recorder.start( stash_slice )

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

			if( !recorder || recorder.state === 'inactive' ) {
				this.hush( this.stream )
				this.stage?.destructor()
				this.stage = null
				this.done( null )
			} else {
				recorder.stop()
			}

		}

		drop() {
			this.stop()
			this.done( null )
			if( this.dialog() ) void $bog_gram_stash.clear()
		}

		take() {
			return this.result
		}

	}

}
