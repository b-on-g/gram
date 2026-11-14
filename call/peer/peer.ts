namespace $ {

	export type $bog_gram_call_peer_stats = {
		time: number
		bytes: number
		fps: number
		width: number
		height: number
		kbps: number
		lost: number
		packets: number
		loss: number
		rtt: number
	}

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

		log( text: string ) {
			this.room().log( `${ $bog_gram_call_room.seat_short( this.mate() ) }: ${ text }` )
		}

		@ $mol_mem
		offer_their() {
			if( this.offerer() ) return null
			return $bog_gram_call_room.signal_parse( this.room().offer_text( this.key() ) )
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
			const born = Date.now()

			this.log( `соединение ${ round } создано, я ${ this.offerer() ? 'предлагаю' : 'отвечаю' }` )

			rtc.addEventListener( 'connectionstatechange', ()=> this.state_change( rtc, round, born ) )
			rtc.addEventListener( 'track', ()=> this.tracked( this.tracked() + 1 ) )

			return Object.assign( rtc, {
				destructor: ()=> {
					this.log( `соединение ${ round } закрыто` )
					rtc.close()
				}
			} )
		}

		state_change( rtc: RTCPeerConnection, round: string, born: number ) {

			const state = rtc.connectionState
			if( state === 'closed' ) return

			this.log( state === 'connected'
				? `соединение ${ round }: connected через ${ Date.now() - born } мс`
				: `соединение ${ round }: ${ state }`
			)

			this.changed( this.changed() + 1 )

			if( !this.offerer() ) return

			if( state === 'failed' ) this.restart( rtc, 'failed' )
			if( state === 'disconnected' ) setTimeout( ()=> {
				if( rtc.connectionState === 'disconnected' ) this.restart( rtc, `disconnected дольше ${ $bog_gram_call_peer.restart_after } мс` )
			}, $bog_gram_call_peer.restart_after )
		}

		restart( rtc: RTCPeerConnection, reason: string ) {
			if( rtc.connectionState === 'closed' ) return
			if( rtc.connectionState === 'connected' ) return
			this.log( `перезапуск после попытки ${ this.attempt() }: ${ reason }` )
			this.attempt( this.attempt() + 1 )
		}

		offer_build() {
			return $mol_wire_sync( $bog_gram_call_peer ).offer_make( this.rtc()!, this.room().media() )
		}

		answer_build( offer: string ) {
			return $mol_wire_sync( $bog_gram_call_peer ).answer_make( this.rtc()!, offer, this.room().media() )
		}

		answer_use( answer: string ) {
			$mol_wire_sync( $bog_gram_call_peer ).answer_apply( this.rtc()!, answer )
		}

		@ $mol_mem
		offer_mine() {

			if( !this.offerer() ) return null

			const rtc = this.rtc()!
			const sdp = this.offer_build()

			new this.$.$mol_after_timeout( $bog_gram_call_peer.connect_limit, ()=> this.restart( rtc, `нет связи за ${ $bog_gram_call_peer.connect_limit } мс` ) )

			return { id: `${ this.attempt() }.${ $mol_guid() }`, sdp } as $bog_gram_call_signal
		}

		offered = ''

		@ $mol_mem
		offer_post() {

			const offer = this.offer_mine()
			if( !offer ) return ''
			if( this.offered === offer.id ) return offer.id

			this.room().signal_put( 'Offers', this.key(), JSON.stringify( offer ) )
			this.offered = offer.id
			this.log( `предложение ${ offer.id } записано` )

			return offer.id
		}

		applied = ''

		@ $mol_mem
		answer_take() {

			const id = this.offer_post()
			if( !id ) return false

			const answer = $bog_gram_call_room.signal_parse( this.room().answer_text( this.key() ) )
			if( answer?.id !== id ) return false
			if( this.applied === id ) return true

			this.answer_use( answer.sdp )
			this.applied = id
			this.log( `ответ на ${ id } принят` )

			return true
		}

		answered = ''

		@ $mol_mem
		answer_post() {

			const offer = this.offer_their()
			if( !offer ) return false
			if( this.answered === offer.id ) return true

			const sdp = this.answer_build( offer.sdp )

			this.room().signal_put( 'Answers', this.key(), JSON.stringify({ id: offer.id, sdp }) )
			this.answered = offer.id
			this.log( `ответ на ${ offer.id } записан` )

			return true
		}

		@ $mol_mem
		sync() {
			return this.offerer() ? this.answer_take() : this.answer_post()
		}

		video_replace( track: MediaStreamTrack ) {

			const rtc = this.rtc()
			if( !rtc ) return

			for( const transceiver of rtc.getTransceivers() ) {
				if( transceiver.receiver.track.kind !== 'video' ) continue
				transceiver.sender.replaceTrack( track ).catch( $mol_fail_log )
			}

		}

		stats_last = null as $bog_gram_call_peer_stats | null

		@ $mol_mem
		stats() {

			this.room().now( 2_000 )

			const rtc = this.rtc()
			if( !rtc || this.state() !== 'connected' ) return null

			const report = $mol_wire_sync( rtc ).getStats()
			const next = $bog_gram_call_peer.stats_sum( [ ... report.values() ], this.stats_last )
			this.stats_last = next

			return next
		}

		static stats_limit = { fps: 15, loss: 2, rtt: 300 }

		static stats_bad( stats: $bog_gram_call_peer_stats ) {
			const limit = this.stats_limit
			return {
				fps: stats.fps < limit.fps,
				loss: stats.loss > limit.loss,
				rtt: stats.rtt > limit.rtt,
			}
		}

		static stats_sum( entries: readonly any[], last: $bog_gram_call_peer_stats | null ): $bog_gram_call_peer_stats {

			const sum: $bog_gram_call_peer_stats = {
				time: 0, bytes: 0, fps: 0, width: 0, height: 0, kbps: 0, lost: 0, packets: 0, loss: 0, rtt: 0,
			}

			let pair = ''
			for( const entry of entries ) {
				if( entry.type === 'transport' && entry.selectedCandidatePairId ) pair = entry.selectedCandidatePairId
			}

			for( const entry of entries ) {

				if( entry.type === 'inbound-rtp' ) {

					sum.time = Math.max( sum.time, entry.timestamp ?? 0 )
					sum.bytes += entry.bytesReceived ?? 0
					sum.lost += Math.max( 0, entry.packetsLost ?? 0 )
					sum.packets += entry.packetsReceived ?? 0

					if( entry.kind === 'video' ) {
						sum.fps = Math.round( entry.framesPerSecond ?? 0 )
						sum.width = entry.frameWidth ?? 0
						sum.height = entry.frameHeight ?? 0
					}

				}

				if( entry.type === 'candidate-pair' && ( pair ? entry.id === pair : entry.nominated && entry.state === 'succeeded' ) ) {
					sum.rtt = Math.round( ( entry.currentRoundTripTime ?? 0 ) * 1000 )
				}

			}

			const total = sum.lost + sum.packets
			sum.loss = total ? Math.round( sum.lost / total * 1000 ) / 10 : 0

			if( last && sum.time > last.time ) {
				sum.kbps = Math.round( Math.max( 0, sum.bytes - last.bytes ) * 8 / ( sum.time - last.time ) )
			}

			return sum
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
