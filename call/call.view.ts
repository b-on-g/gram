namespace $.$$ {

	export class $bog_gram_call extends $.$bog_gram_call {

		joined() {
			return this.Room().joined()
		}

		@ $mol_mem
		override invite_link() {
			return $bog_gram_soft( ()=> String( this.Room().data().Invite()?.val() ?? '' ), '' )
		}

		override Invite() {
			return this.invite_link() ? super.Invite() : null!
		}

		override content() {
			return [
				... this.knocks().length ? [ this.Knocks() ] : [],
				this.joined() ? this.Grid() : this.Lobby(),
			]
		}

		override knocks_head() {
			return $bog_gram_text_fill( this.knocks_pattern(), { count: this.knocks().length } )
		}

		@ $mol_mem
		override knock_rows() {
			return [ this.Knocks_head(), ... this.knocks().map( entry => this.Knock( entry ) ) ]
		}

		override controls() {
			if( !this.joined() ) return []
			return [
				this.Mic(),
				this.Cam(),
				... this.Room().cam_switch_able() ? [ this.Flip() ] : [],
				this.Stats_show(),
				... this.pip_able() ? [ this.Pip() ] : [],
				this.Leave(),
			]
		}

		override tiles() {
			return [
				this.Self(),
				... this.Room().mates().map( mate => this.Mate( mate ) ),
			]
		}

		override lobby_text() {
			const names = this.Room().seats_alive().map( seat => this.Room().seat_name( seat ) )
			if( !names.length ) return this.lobby_empty()
			return $bog_gram_text_fill( this.lobby_some(), { names: names.join( ', ' ) } )
		}

		override join() {
			this.Room().join()
		}

		override leave() {
			this.Room().leave()
		}

		override close_click( next?: any ) {
			this.leave()
			this.close( next )
			return null
		}

		override mic( next?: boolean ) {
			return this.Room().mic( next )
		}

		override cam( next?: boolean ) {
			return this.Room().cam( next )
		}

		override cam_able() {
			return this.Room().cam_able()
		}

		override cam_switch() {
			this.Room().cam_switch()
		}

		override self_mirror() {
			return this.Room().facing() === 'user'
		}

		override awake() {
			return this.Room().visible()
		}

		override self_stream() {
			return this.Room().self_stream()
		}

		override mate_stream( mate: string ) {
			return this.Room().peer( mate ).remote()
		}

		override mate_status( mate: string ) {
			return this.Room().peer( mate ).status()
		}

		override mate_stats( mate: string ) {

			if( !this.stats_show() ) return null
			return this.Room().peer( mate ).stats()
		}

		override mate_name( mate: string ) {
			const lord = this.Room().seat_pawn( mate )?.Lord()?.val() ?? ''
			return ( lord && this.note( lord ) ) || this.Room().seat_name( mate )
		}

		override mate_mic( mate: string ) {
			return this.Room().seat_mic( mate )
		}

		override mate_cam( mate: string ) {
			return this.Room().seat_cam( mate )
		}

		pip_able() {
			return Boolean( $mol_dom_context.document.pictureInPictureEnabled )
		}

		pip_video() {
			const videos = [ ... this.Room().mates().map( mate => this.Mate( mate ) ), this.Self() ].map( tile => tile.Video().dom_node() as HTMLVideoElement )
			return videos.find( video => video.readyState >= 1 ) ?? null
		}

		override pip() {

			const doc = $mol_dom_context.document

			if( doc.pictureInPictureElement ) {
				doc.exitPictureInPicture().catch( $mol_fail_log )
				return null
			}

			this.pip_video()?.requestPictureInPicture().catch( $mol_fail_log )

			return null
		}

		@ $mol_mem
		session() {

			const session = $mol_dom_context.navigator.mediaSession
			if( !session ) return null

			const handlers: Record< string, MediaSessionActionHandler > = {
				enterpictureinpicture: ()=> this.pip(),
				hangup: ()=> this.leave(),
				togglemicrophone: ()=> this.mic( !this.mic() ),
				togglecamera: ()=> this.cam( !this.cam() ),
			}

			const put = ( action: string, handler: MediaSessionActionHandler | null )=> {
				try {
					session.setActionHandler( action as MediaSessionAction, handler )
				} catch {}
			}

			session.playbackState = 'playing'
			for( const action in handlers ) put( action, handlers[ action ] )

			return {
				destructor: ()=> {
					session.playbackState = 'none'
					for( const action in handlers ) put( action, null )
				}
			}
		}

		@ $mol_mem
		session_state() {

			const session = $mol_dom_context.navigator.mediaSession as any
			if( !session ) return null

			session.setMicrophoneActive?.( this.mic() )?.catch?.( ()=> {} )
			session.setCameraActive?.( this.cam() )?.catch?.( ()=> {} )

			return null
		}

		override auto() {
			this.Room().run()
			if( !this.joined() ) return
			this.session()
			this.session_state()
		}

	}

}
