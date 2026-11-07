namespace $ {

	export class $bog_gram_call_peer extends $mol_object {

		static ice: RTCIceServer[] = [
			{ urls: [ 'stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478' ] },
		]

		static gather_limit = 3_000

		static connect_limit = 20_000

		static restart_after = 5_000

		static async gather( rtc: RTCPeerConnection ) {

			if( rtc.iceGatheringState !== 'complete' ) {
				await new Promise< void >( done => {
					const timer = setTimeout( done, this.gather_limit )
					rtc.addEventListener( 'icegatheringstatechange', ()=> {
						if( rtc.iceGatheringState !== 'complete' ) return
						clearTimeout( timer )
						done()
					} )
				} )
			}

			return rtc.localDescription!.sdp
		}

		static async offer_make( rtc: RTCPeerConnection, stream: MediaStream ) {

			for( const kind of [ 'audio', 'video' ] as const ) {
				const track = stream.getTracks().find( track => track.kind === kind )
				rtc.addTransceiver( track ?? kind, { direction: 'sendrecv', streams: [ stream ] } )
			}

			await rtc.setLocalDescription( await rtc.createOffer() )

			return this.gather( rtc )
		}

		static async answer_make( rtc: RTCPeerConnection, offer: string, stream: MediaStream ) {

			await rtc.setRemoteDescription({ type: 'offer', sdp: offer })

			for( const transceiver of rtc.getTransceivers() ) {
				const kind = transceiver.receiver.track.kind
				const track = stream.getTracks().find( track => track.kind === kind ) ?? null
				transceiver.direction = 'sendrecv'
				await transceiver.sender.replaceTrack( track )
				transceiver.sender.setStreams?.( stream )
			}

			await rtc.setLocalDescription( await rtc.createAnswer() )

			return this.gather( rtc )
		}

		static async answer_apply( rtc: RTCPeerConnection, answer: string ) {
			if( rtc.signalingState !== 'have-local-offer' ) return
			await rtc.setRemoteDescription({ type: 'answer', sdp: answer })
		}

		room(): $bog_gram_call_room {
			return null!
		}

		mate() {
			return ''
		}

		offerer() {
			return $bog_gram_call_room.offerer( this.room().seat(), this.mate() )
		}

		key() {
			return $bog_gram_call_room.pair( this.room().seat(), this.mate() )
		}

		@ $mol_mem
		attempt( next?: number ) {
			return next ?? 0
		}

		@ $mol_mem
		changed( next?: number ) {
			return next ?? 0
		}

		@ $mol_mem
		tracked( next?: number ) {
			return next ?? 0
		}

		@ $mol_mem
		state(): RTCPeerConnectionState {
			this.changed()
			return this.rtc()?.connectionState ?? 'new'
		}

		@ $mol_mem
		remote() {

			this.tracked()

			const rtc = this.rtc()
			if( !rtc ) return null

			const tracks = rtc.getReceivers().map( receiver => receiver.track )
			if( !tracks.length ) return null

			return new MediaStream( tracks )
		}

		@ $mol_mem
		offer_their() {
			if( this.offerer() ) return null
			return $bog_gram_call_room.signal_parse( this.room().signal( 'Offers', this.key() ) )
		}

		@ $mol_mem
		offer_id() {
			return this.offer_their()?.id ?? ''
		}

		@ $mol_mem
		rtc() {

			const round = this.offerer() ? String( this.attempt() ) : this.offer_id()
			if( !round ) return null

			const rtc = new RTCPeerConnection({ iceServers: $bog_gram_call_peer.ice })

			rtc.addEventListener( 'connectionstatechange', ()=> this.state_change( rtc ) )
			rtc.addEventListener( 'track', ()=> this.tracked( this.tracked() + 1 ) )

			return Object.assign( rtc, {
				destructor: ()=> rtc.close()
			} )
		}

		state_change( rtc: RTCPeerConnection ) {

			const state = rtc.connectionState
			if( state === 'closed' ) return

			this.changed( this.changed() + 1 )

			if( !this.offerer() ) return

			if( state === 'failed' ) this.restart( rtc )
			if( state === 'disconnected' ) setTimeout( ()=> {
				if( rtc.connectionState === 'disconnected' ) this.restart( rtc )
			}, $bog_gram_call_peer.restart_after )
		}

		restart( rtc: RTCPeerConnection ) {
			if( rtc.connectionState === 'closed' ) return
			if( rtc.connectionState === 'connected' ) return
			this.attempt( this.attempt() + 1 )
		}

		@ $mol_mem
		offer_mine() {

			if( !this.offerer() ) return null

			const rtc = this.rtc()!
			const sdp = $mol_wire_sync( $bog_gram_call_peer ).offer_make( rtc, this.room().media() )

			setTimeout( ()=> this.restart( rtc ), $bog_gram_call_peer.connect_limit )

			return { id: `${ this.attempt() }.${ $mol_guid() }`, sdp } as $bog_gram_call_signal
		}

		@ $mol_mem
		offer_post() {

			const offer = this.offer_mine()
			if( !offer ) return ''

			this.room().signal_put( 'Offers', this.key(), JSON.stringify( offer ) )

			return offer.id
		}

		@ $mol_mem
		answer_take() {

			const id = this.offer_post()
			if( !id ) return false

			const answer = $bog_gram_call_room.signal_parse( this.room().signal( 'Answers', this.key() ) )
			if( answer?.id !== id ) return false

			$mol_wire_sync( $bog_gram_call_peer ).answer_apply( this.rtc()!, answer.sdp )

			return true
		}

		@ $mol_mem
		answer_post() {

			const offer = this.offer_their()
			if( !offer ) return false

			const rtc = this.rtc()!
			const sdp = $mol_wire_sync( $bog_gram_call_peer ).answer_make( rtc, offer.sdp, this.room().media() )

			this.room().signal_put( 'Answers', this.key(), JSON.stringify({ id: offer.id, sdp }) )

			return true
		}

		@ $mol_mem
		sync() {
			return this.offerer() ? this.answer_take() : this.answer_post()
		}

		@ $mol_mem
		status(): string {

			try {
				if( !this.sync() ) return 'waiting'
			} catch( error ) {
				if( $mol_promise_like( error ) ) return 'connecting'
				$mol_fail_log( error )
				return 'failed'
			}

			return this.state()
		}

	}

}
