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

		static grab( passes: readonly $giper_baza_auth_pass[] | null, rulers: readonly $giper_baza_auth_pass[] = [] ) {

			const glob = this.$.$giper_baza_glob

			const land = passes
				? glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
				: glob.land_grab([ [ null, $giper_baza_rank_post( 'just' ) ] ])

			for( const pass of passes ?? [] ) {
				land.give( pass, rulers.includes( pass ) ? $giper_baza_rank_rule : $giper_baza_rank_post( 'just' ) )
			}

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

		static muted_grace = 3_000

		static restore_gap = 30_000

		static cam_keep_by( agent: string, touch: number ) {
			return /Android|iPhone|iPad|iPod|Mobile/i.test( agent ) || ( /Macintosh/.test( agent ) && touch > 1 )
		}

		static muted_due( muted_ms: number, since_restore: number ) {
			return muted_ms >= this.muted_grace && since_restore >= this.restore_gap
		}

		static audio_pick( ids: readonly string[], wanted: string ) {
			return wanted && ids.includes( wanted ) ? wanted : ''
		}

		static audio_constraints( id: string ): MediaTrackConstraints | boolean {
			return id ? { deviceId: { ideal: id } } : true
		}

		static level_of( bytes: ArrayLike< number > ) {

			if( !bytes.length ) return 0

			let sum = 0
			for( let i = 0; i < bytes.length; ++i ) {
				const val = ( bytes[ i ] - 128 ) / 128
				sum += val * val
			}

			return Math.min( 1, Math.sqrt( sum / bytes.length ) * 4 )
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

		@ $mol_mem
		screen( next?: boolean ) {
			return next ?? false
		}

		screen_able() {
			return Boolean( this.$.$mol_dom_context.navigator?.mediaDevices?.getDisplayMedia )
		}

		cam_keep() {
			const nav = this.$.$mol_dom_context.navigator
			return $bog_gram_call_room.cam_keep_by( nav?.userAgent ?? '', nav?.maxTouchPoints ?? 0 )
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
			this.screen( false )
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
			seat.Cam( 'auto' )!.val( ( this.cam() && this.cam_able() ) || this.screen() )
			seat.Screen( 'auto' )!.val( this.screen() )
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

		seat_screen( id: string ) {
			return this.seat_pawn( id )?.Screen()?.val() ?? false
		}

		signal( box:$bog_gram_call_box, key: string ) {
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
			const audio = this.audio_initial()

			let stream: MediaStream

			try {
				stream = devices.getUserMedia({
					audio,
					video: $bog_gram_call_room.video_constraints( 'user' ),
				})
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				this.log( `камера не открылась: ${ ( error as Error ).name || error }` )
				stream = devices.getUserMedia({ audio })
			}

			return Object.assign( stream, {
				destructor: ()=> stream.getTracks().forEach( track => track.stop() )
			} )
		}

		@ $mol_mem
		mic_device( next?: string ) {
			return this.$.$mol_state_local.value( '$bog_gram_call.mic_device', next ) ?? ''
		}

		@ $mol_mem
		speaker_device( next?: string ) {
			return this.$.$mol_state_local.value( '$bog_gram_call.speaker_device', next ) ?? ''
		}

		audio_constraints() {
			return $bog_gram_call_room.audio_constraints( this.mic_device() )
		}

		audio_initial() {

			const sub = $mol_wire_auto()
			$mol_wire_auto( null )

			try {
				return this.audio_constraints()
			} finally {
				$mol_wire_auto( sub )
			}

		}

		@ $mol_mem
		devices_changed( next?: number ) {
			return next ?? 0
		}

		@ $mol_mem
		devices_watch() {
			const devices = this.$.$mol_dom_context.navigator?.mediaDevices
			if( !devices ) return null
			return new $mol_dom_listener( devices, 'devicechange', ()=> {
				this.devices_changed( this.devices_changed() + 1 )
				$mol_wire_async( this ).audio_lost()
			} )
		}

		@ $mol_mem_key
		devices( kind: MediaDeviceKind ) {
			this.media()
			this.devices_changed()
			const list = $mol_wire_sync( navigator.mediaDevices ).enumerateDevices()
			return list.filter( device => device.kind === kind && device.deviceId )
		}

		mic_sources() {
			return this.devices( 'audioinput' )
		}

		@ $mol_mem
		audio_changed( next?: number ) {
			return next ?? 0
		}

		audio_close() {

			const stream = this.media()

			for( const old of stream.getAudioTracks() ) {
				old.stop()
				stream.removeTrack( old )
			}

		}

		@ $mol_action
		audio_open() {

			const ids = this.mic_sources().map( device => device.deviceId )
			const wanted = this.mic_device()
			const id = $bog_gram_call_room.audio_pick( ids, wanted )
			if( id !== wanted ) this.mic_device( id )

			let fresh: MediaStream
			try {
				fresh = $mol_wire_sync( navigator.mediaDevices ).getUserMedia({ audio: $bog_gram_call_room.audio_constraints( id ) })
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				this.log( `микрофон не открылся: ${ ( error as Error ).name || error }` )
				return
			}

			const track = fresh.getAudioTracks()[ 0 ]
			track.enabled = this.mic()

			this.audio_close()
			this.media().addTrack( track )
			for( const peer of this.peers() ) peer.audio_replace( track )

			this.audio_changed( this.audio_changed() + 1 )
			this.log( `микрофон: ${ track.label }` )
		}

		audio_lost() {

			if( !this.visible() ) return

			const track = this.media().getAudioTracks()[ 0 ]
			const ids = this.mic_sources().map( device => device.deviceId )
			if( track && track.readyState === 'live' && ids.includes( track.getSettings().deviceId ?? '' ) ) return

			this.audio_open()
		}

		@ $mol_mem
		audio_watch() {

			this.audio_changed()

			const track = this.media().getAudioTracks()[ 0 ]
			if( !track ) return null

			return new $mol_dom_listener( track, 'ended', ()=> $mol_wire_async( this ).audio_lost() )
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
			this.audio_changed()
			return new MediaStream( this.media().getTracks() )
		}

		video_close() {

			const stream = this.media()

			for( const old of stream.getVideoTracks() ) {
				old.stop()
				stream.removeTrack( old )
			}

		}

		@ $mol_action
		video_open( facing: $bog_gram_call_facing ) {

			if( !this.cam() || this.screen_track ) {
				this.facing( facing )
				return
			}

			this.video_close()

			const fresh = $mol_wire_sync( navigator.mediaDevices ).getUserMedia({
				video: $bog_gram_call_room.video_constraints( facing ),
			})

			const track = fresh.getVideoTracks()[ 0 ]

			this.facing( facing )

			this.media().addTrack( track )
			for( const peer of this.peers() ) peer.video_replace( track )

			this.video_changed( this.video_changed() + 1 )
		}

		screen_track = null as MediaStreamTrack | null

		screen_pending = false

		@ $mol_action
		screen_start() {

			let track: MediaStreamTrack

			try {
				const stream = $mol_wire_sync( navigator.mediaDevices ).getDisplayMedia({ video: true })
				track = stream.getVideoTracks()[ 0 ]
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				this.screen_pending = false
				this.screen( false )
				this.log( `экран не открылся: ${ ( error as Error ).name || error }` )
				return
			}

			this.video_close()
			this.screen_pending = false
			this.screen_track = track
			this.media().addTrack( track )

			track.addEventListener( 'ended', ()=> this.screen( false ) )

			for( const peer of this.peers() ) peer.video_replace( track )

			this.video_changed( this.video_changed() + 1 )
			this.log( 'показ экрана' )
		}

		@ $mol_action
		screen_stop() {

			const track = this.screen_track
			if( !track ) return

			this.screen_track = null
			track.stop()
			this.media().removeTrack( track )

			for( const peer of this.peers() ) peer.video_replace( null )

			this.video_changed( this.video_changed() + 1 )
			this.log( 'показ экрана окончен' )
		}

		@ $mol_mem
		screen_sync() {

			this.video_changed()

			const want = this.screen()
			const track = this.screen_track

			if( want && !track && !this.screen_pending ) {
				this.screen_pending = true
				$mol_wire_async( this ).screen_start().catch( $mol_fail_log )
			}

			if( !want && track ) $mol_wire_async( this ).screen_stop().catch( $mol_fail_log )

			return null
		}

		@ $mol_action
		video_off() {

			this.video_close()

			for( const peer of this.peers() ) peer.video_replace( null )

			this.video_changed( this.video_changed() + 1 )
		}

		@ $mol_mem
		video_sync() {

			this.video_changed()
			this.track_touched()
			if( !this.cam_able() ) return null
			if( this.screen_track ) return null

			const open = this.video_live()
			if( open === this.cam() ) return null

			if( open ) {
				if( !this.cam_keep() ) this.video_off()
			} else if( this.visible() ) {
				$mol_wire_async( this ).video_open( this.facing() ).catch( $mol_fail_log )
			}

			return null
		}

		video_live() {
			return this.media().getVideoTracks().some( track => track.readyState !== 'ended' )
		}

		@ $mol_mem
		track_touched( next?: number ) {
			return next ?? 0
		}

		video_paused() {

			this.track_touched()
			this.video_changed()

			if( !this.cam() || this.screen_track ) return false

			const track = this.media().getVideoTracks()[ 0 ]
			if( !track ) return false

			return track.readyState === 'ended' || track.muted
		}

		cam_switch() {
			const facing = this.facing() === 'user' ? 'environment' : 'user'
			if( this.cam() ) this.video_open( facing )
			else this.facing( facing )
		}

		video_restore() {
			this.video_open( this.facing() )
		}

		@ $mol_mem
		video_watch() {

			this.video_changed()

			const track = this.media().getVideoTracks()[ 0 ]
			if( !track ) return null

			const touch = ()=> this.track_touched( this.track_touched() + 1 )
			const kinds = [ 'ended', 'mute', 'unmute' ]

			for( const kind of kinds ) track.addEventListener( kind, touch )

			return {
				destructor: ()=> {
					for( const kind of kinds ) track.removeEventListener( kind, touch )
				},
			}
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

			this.track_touched()
			this.video_changed()

			const track = this.media().getVideoTracks()[ 0 ]

			if( !this.visible() || !this.cam() || this.screen_track || !track || track.readyState === 'ended' || !track.muted ) {
				this.muted_since = 0
				return null
			}

			const now = this.now( 1_000 )
			if( !this.muted_since ) this.muted_since = now

			if( $bog_gram_call_room.muted_due( now - this.muted_since, now - this.restore_at ) ) {
				this.restore_at = now
				this.muted_since = 0
				$mol_wire_async( this ).video_restore().catch( $mol_fail_log )
			}

			return null
		}

		muted_since = 0

		restore_at = Number.NEGATIVE_INFINITY

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
			this.audio_changed()

			const stream = this.media()

			for( const track of stream.getAudioTracks() ) track.enabled = this.mic()
			for( const track of stream.getVideoTracks() ) track.enabled = this.cam() || this.screen()

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
			this.screen_sync()
			this.video_sync()
			this.video_watch()
			this.video_check()
			this.devices_watch()
			this.audio_watch()
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
