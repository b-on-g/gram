namespace $ {

	export type $bog_gram_call_signal = {
		id: string
		sdp: string
	}

	export type $bog_gram_call_box = 'Offers' | 'Answers'

	export class $bog_gram_call_room extends $mol_object {

		static beat_every = 10_000

		static alive_span = 35_000

		static grab( passes: readonly $giper_baza_auth_pass[] | null ) {

			const glob = this.$.$giper_baza_glob

			const land = passes
				? glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
				: glob.land_grab([ [ null, $giper_baza_rank_post( 'just' ) ] ])

			for( const pass of passes ?? [] ) land.give( pass, $giper_baza_rank_post( 'just' ) )

			land.Data( $bog_gram_call_land ).Created( 'auto' )!.val( Date.now() )
			land.sync()

			return land
		}

		static offerer( me: string, mate: string ) {
			return me < mate
		}

		static pair( me: string, mate: string ) {
			return this.offerer( me, mate ) ? `${ me }>${ mate }` : `${ mate }>${ me }`
		}

		static signal_parse( text: string ): $bog_gram_call_signal | null {
			try {
				const data = JSON.parse( text )
				if( typeof data?.id !== 'string' || typeof data?.sdp !== 'string' ) return null
				return { id: data.id, sdp: data.sdp }
			} catch {
				return null
			}
		}

		land(): $giper_baza_land {
			return null!
		}

		data() {
			return this.land().Data( $bog_gram_call_land )
		}

		lord() {
			return this.$.$giper_baza_auth.current().pass().lord().str
		}

		name() {
			return ''
		}

		now( precision: number ) {
			return this.$.$mol_state_time.now( precision )
		}

		@ $mol_mem
		seat( next?: string ) {
			return next ?? $mol_guid()
		}

		@ $mol_mem
		joined( next?: boolean ) {
			return next ?? false
		}

		@ $mol_mem
		mic( next?: boolean ) {
			return next ?? true
		}

		@ $mol_mem
		cam( next?: boolean ) {
			return next ?? true
		}

		@ $mol_action
		join() {
			this.seat( $mol_guid() )
			this.joined( true )
		}

		@ $mol_action
		leave() {
			this.data().Seats( 'auto' )?.key( this.seat(), 'auto' )?.Left( 'auto' )?.val( Date.now() )
			this.joined( false )
		}

		@ $mol_mem
		beat() {

			if( !this.joined() ) return null

			const moment = this.now( $bog_gram_call_room.beat_every )
			const seat = this.data().Seats( 'auto' )!.key( this.seat(), 'auto' )!

			seat.Lord( 'auto' )!.val( this.lord() )
			seat.Name( 'auto' )!.val( this.name() )
			seat.Mic( 'auto' )!.val( this.mic() )
			seat.Cam( 'auto' )!.val( this.cam() && this.cam_able() )
			seat.Beat( 'auto' )!.val( moment )

			return null
		}

		seat_pawn( id: string ) {
			return this.data().Seats()?.key( id ) ?? null
		}

		@ $mol_mem
		seats_alive(): readonly string[] {

			const now = this.now( 5_000 )
			const seats = this.data().Seats()
			if( !seats ) return []

			return ( seats.keys() as string[] )
				.filter( id => {
					const seat = seats.key( id )
					if( seat.Left()?.val() ) return false
					return now - ( seat.Beat()?.val() ?? 0 ) < $bog_gram_call_room.alive_span
				} )
				.sort()
		}

		@ $mol_mem
		mates(): readonly string[] {
			const me = this.seat()
			return this.seats_alive().filter( id => id !== me )
		}

		seat_name( id: string ) {
			const seat = this.seat_pawn( id )
			return seat?.Name()?.val() || seat?.Lord()?.val()?.slice( 0, 8 ) || id
		}

		seat_mic( id: string ) {
			return this.seat_pawn( id )?.Mic()?.val() ?? true
		}

		seat_cam( id: string ) {
			return this.seat_pawn( id )?.Cam()?.val() ?? true
		}

		signal( box: $bog_gram_call_box, key: string ) {
			return this.data()[ box ]()?.key( key )?.val() ?? ''
		}

		signal_put( box: $bog_gram_call_box, key: string, text: string ) {
			const atom = this.data()[ box ]( 'auto' )!.key( key, 'auto' )!
			if( atom.val() !== text ) atom.val( text )
		}

		@ $mol_mem
		media() {

			const devices = $mol_wire_sync( navigator.mediaDevices )

			let stream: MediaStream

			try {
				stream = devices.getUserMedia({
					audio: true,
					video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
				})
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				stream = devices.getUserMedia({ audio: true })
			}

			return Object.assign( stream, {
				destructor: ()=> stream.getTracks().forEach( track => track.stop() )
			} )
		}

		@ $mol_mem
		cam_able() {
			return this.media().getVideoTracks().length > 0
		}

		@ $mol_mem
		media_apply() {

			const stream = this.media()

			for( const track of stream.getAudioTracks() ) track.enabled = this.mic()
			for( const track of stream.getVideoTracks() ) track.enabled = this.cam()

			return stream
		}

		@ $mol_mem_key
		peer( mate: string ) {
			return $bog_gram_call_peer.make({
				room: $mol_const( this ),
				mate: $mol_const( mate ),
			})
		}

		@ $mol_mem
		peers() {
			if( !this.joined() ) return []
			return this.mates().map( mate => this.peer( mate ) )
		}

		@ $mol_mem
		run() {

			if( !this.joined() ) return null

			this.media_apply()
			this.beat()

			for( const peer of this.peers() ) peer.status()

			return null
		}

		destructor() {
			if( !$mol_wire_probe( ()=> this.joined() ) ) return
			try {
				this.data().Seats()?.key( this.seat() )?.Left( 'auto' )?.val( Date.now() )
			} catch( error ) {
				$mol_fail_log( error )
			}
		}

	}

}
