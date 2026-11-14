namespace $.$$ {

	export class $bog_gram_compose extends $.$bog_gram_compose {

		@ $mol_action
		override start( next?: any ) {
			const peer = this.peer().trim()
			if( !peer ) return null
			this.peer( '' )
			this.open( peer, null )
			return null
		}

		@ $mol_action
		override pick( lord: string, next?: any ) {
			if( !lord ) return null
			this.peer( '' )
			this.open( lord, null )
			return null
		}

		override Join_plate() {
			return this.join_needed() ? super.Join_plate() : null!
		}

		@ $mol_mem
		override user_rows() {
			const users = this.users()
			if( !users.length ) return [ this.Users_empty() ]
			return users.map( lord => this.User_row( lord ) )
		}

		override users_empty_text() {
			if( !this.registry_ids().length ) return this.users_none()
			return this.users_alone()
		}

		override user_lord( lord: string ) {
			return lord
		}

		override user_tint( lord: string ) {
			return $bog_gram_lord.tint( lord )
		}

	}

}
