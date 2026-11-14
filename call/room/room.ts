namespace $ {

	export type $bog_gram_call_signal = {
		id: string
		sdp: string
	}

	export type $bog_gram_call_box = 'Offers' | 'Answers'

	export type $bog_gram_call_facing = 'user' | 'environment'

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

		static seat_short( id: string ) {
			return id.slice( 0, 4 )
		}

		static signal_parse(text: string ): $bog_gram_call_signal | null {
			try {
				const data = JSON.parse( text )
				if( typeof data?.id !== 'string' || typeof data?.sdp !== 'string' ) return null
				return { id: data.id, sdp: data.sdp }
			} catch {
				return null
			}
		}

		static video_constraints( facing: $bog_gram_call_facing ): MediaTrackConstraints {
			return { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: facing }
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
		entered( next?: boolean ) {
			return next ?? false
		}

		@ $mol_mem
		joined() {

			if( !this.entered() ) return false

			const me = this.seat()
			if( this.seat_pawn( me )?.Left()?.val() ) return false

			const top = this.lords_seats().get( this.lord() )
			return !top || top === me
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

			const me = $mol_guid()
			const lord = this.lord()
			const seats = this.data().Seats( 'auto' )!

			for( const id of seats.keys() as string[] ) {
				const seat = seats.key( id )
				if( seat.Lord()?.val() !== lord ) continue
				if( seat.Left()?.val() ) continue
				seat.Left( 'auto' )!.val( Date.now() )
			}

			const seat = seats.key( me, 'auto' )!
			seat.Lord( 'auto' )!.val( lord )
			seat.Joined( 'auto' )!.val( Date.now() )

			this.seat( me )
			this.entered( true )
			this.mates_logged = []
			this.log( `вошёл, место ${ $bog_gram_call_room.seat_short( me ) }` )
		}

		@ $mol_action
		leave() {
			if( !this.entered() ) return
			this.data().Seats( 'auto' )?.key( this.seat(), 'auto' )?.Left( 'auto' )?.val( Date.now() )
			this.entered( false )
			this.log( 'вышел' )
		}

		log( text: string ) {
			$bog_music_log.act( `звонок: ${ text }` )
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

		seat_newer( left: string, right: string ) {
			const left_time = this.seat_pawn( left )?.Joined()?.val() ?? 0
			const right_time = this.seat_pawn( right )?.Joined()?.val() ?? 0
			if( left_time !== right_time ) return left_time > right_time
			return left > right
		}

		@ $mol_mem
		lords_seats() {

			const now = this.now( 5_000 )
			const seats = this.data().Seats()
			const lords = new Map< string, string >()
			if( !seats ) return lords

			for( const id of seats.keys() as string[] ) {

				const seat = seats.key( id )
				if( seat.Left()?.val() ) continue
				if( now - ( seat.Beat()?.val() ?? 0 ) >= $bog_gram_call_room.alive_span ) continue

				const lord = seat.Lord()?.val() || id
				const prev = lords.get( lord )
				if( !prev || this.seat_newer( id, prev ) ) lords.set( lord, id )

			}

			return lords
		}

		@ $mol_mem
		seats_alive(): readonly string[] {
			return [ ... this.lords_seats().values() ].sort()
		}

		@ $mol_mem
		mates(): readonly string[] {
			const me = this.seat()
			const lord = this.lord()
			return this.seats_alive().filter( id => id !== me && this.seat_pawn( id )?.Lord()?.val() !== lord )
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

		@ $mol_mem_key
		offer_text( key: string ) {
			return this.signal( 'Offers', key )
		}

		@ $mol_mem_key
		answer_text( key: string ) {
			return this.signal( 'Answers', key )
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
					video: $bog_gram_call_room.video_constraints( 'user' ),
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
		video_changed( next?: number ) {
			return next ?? 0
		}

		@ $mol_mem
		facing( next?: $bog_gram_call_facing ) {
			return next ?? 'user'
		}

		@ $mol_mem
		cam_able() {
			this.video_changed()
			return this.media().getVideoTracks().length > 0
		}

		@ $mol_mem
		cameras() {
			this.media()
			const devices = $mol_wire_sync( navigator.mediaDevices ).enumerateDevices()
			return devices.filter( device => device.kind === 'videoinput' ).length
		}

		cam_switch_able() {
			return this.cameras() > 1
		}

		@ $mol_mem
		self_stream() {
			this.video_changed()
			return new MediaStream( this.media().getTracks() )
		}

		@ $mol_action
		video_open( facing: $bog_gram_call_facing ) {

			const stream = this.media()

			for( const old of stream.getVideoTracks() ) {
				old.stop()
				stream.removeTrack( old )
			}

			const fresh = $mol_wire_sync( navigator.mediaDevices ).getUserMedia({
				video: $bog_gram_call_room.video_constraints( facing ),
			})

			const track = fresh.getVideoTracks()[ 0 ]
			track.enabled = this.cam()
			stream.addTrack( track )

			for( const peer of this.peers() ) peer.video_replace( track )

			this.facing( facing )
			this.video_changed( this.video_changed() + 1 )
		}

		cam_switch() {
			this.video_open( this.facing() === 'user' ? 'environment' : 'user' )
		}

		video_restore() {
			this.video_open( this.facing() )
		}

		video_broken() {
			const track = this.media().getVideoTracks()[ 0 ]
			if( !track ) return false
			return track.readyState === 'ended' || track.muted
		}

		video_lost() {
			if( !this.visible() ) return
			this.video_restore()
		}

		@ $mol_mem
		video_watch() {

			this.video_changed()

			const track = this.media().getVideoTracks()[ 0 ]
			if( !track ) return null

			return new $mol_dom_listener( track, 'ended', ()=> $mol_wire_async( this ).video_lost() )
		}

		@ $mol_mem
		visible( next?: boolean ) {
			return next ?? $mol_dom_context.document.visibilityState !== 'hidden'
		}

		@ $mol_mem
		visible_watch() {
			const doc = $mol_dom_context.document
			return new $mol_dom_listener( doc, 'visibilitychange', ()=> this.visible( doc.visibilityState !== 'hidden' ) )
		}

		@ $mol_mem
		video_check() {
			if( !this.visible() ) return null
			if( this.video_broken() ) $mol_wire_async( this ).video_restore()
			return null
		}

		@ $mol_mem
		unload_watch() {
			return new $mol_dom_listener( $mol_dom_context, 'pagehide', ( event: PageTransitionEvent )=> this.page_hide( event ) )
		}

		page_hide( event: { persisted: boolean } ) {
			if( event.persisted ) return
			this.leave()
		}

		@ $mol_mem
		audio_session() {

			const session = ( this.$.$mol_dom_context.navigator as any )?.audioSession as { type: string } | undefined
			if( !session ) return null

			session.type = 'play-and-record'

			return {
				destructor: ()=> { session.type = 'auto' },
			}
		}

		@ $mol_mem
		media_apply() {

			this.video_changed()

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

		mates_logged = [] as readonly string[]

		mates_log( mates: readonly string[] ) {

			const prev = this.mates_logged
			this.mates_logged = mates

			const label = ( id: string )=> `${ this.seat_name( id ) } ${ $bog_gram_call_room.seat_short( id ) }`

			for( const id of mates ) if( !prev.includes( id ) ) this.log( `пришёл ${ label( id ) }` )
			for( const id of prev ) if( !mates.includes( id ) ) this.log( `ушёл ${ label( id ) }` )

		}

		@ $mol_mem
		peers() {

			if( !this.joined() ) return []

			const mates = this.mates()
			this.mates_log( mates )

			return mates.map( mate => this.peer( mate ) )
		}

		@ $mol_mem
		run() {

			if( !this.joined() ) return null

			this.unload_watch()
			this.audio_session()
			this.visible_watch()
			this.media_apply()
			this.video_watch()
			this.video_check()
			this.beat()

			for( const peer of this.peers() ) peer.status()

			return null
		}

		destructor() {
			if( !$mol_wire_probe( ()=> this.entered() ) ) return
			try {
				this.data().Seats()?.key( this.seat() )?.Left( 'auto' )?.val( Date.now() )
			} catch( error ) {
				$mol_fail_log( error )
			}
		}

	}

}
