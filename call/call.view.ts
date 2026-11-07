namespace $.$$ {

	export class $bog_gram_call extends $.$bog_gram_call {

		joined() {
			return this.Room().joined()
		}

		override content() {
			return [ this.joined() ? this.Grid() : this.Lobby() ]
		}

		override controls() {
			if( !this.joined() ) return []
			return [ this.Mic(), this.Cam(), this.Leave() ]
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
			return this.lobby_some().replace( '{names}', names.join( ', ' ) )
		}

		override join() {
			this.Room().join()
		}

		override leave() {
			this.Room().leave()
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

		override self_stream() {
			return this.Room().media()
		}

		override mate_stream( mate: string ) {
			return this.Room().peer( mate ).remote()
		}

		override mate_status( mate: string ) {
			return this.Room().peer( mate ).status()
		}

		override mate_name( mate: string ) {
			return this.Room().seat_name( mate )
		}

		override mate_mic( mate: string ) {
			return this.Room().seat_mic( mate )
		}

		override mate_cam( mate: string ) {
			return this.Room().seat_cam( mate )
		}

		override auto() {
			this.Room().run()
		}

	}

}
