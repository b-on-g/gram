namespace $ {

	export class $bog_gram_follow extends $mol_object {

		static keys = [ 'invite', 'key', 'join', 'by', 'users' ] as const

		static params( uri: string ) {

			const hash = String( uri ?? '' ).split( /#!?/ )[ 1 ] ?? ''
			const out: Record< string, string > = {}

			for( const chunk of hash.split( '/' ) ) {
				if( !chunk ) continue
				const [ key, ... rest ] = chunk.split( '=' )
				const name = this.decode( key )
				if( !( this.keys as readonly string[] ).includes( name ) ) continue
				out[ name ] = this.decode( rest.join( '=' ) )
			}

			if( !out.invite && !out.join && !out.users ) return {}

			return out
		}

		static decode( str: string ) {
			try {
				return decodeURIComponent( str )
			} catch( error ) {
				return ''
			}
		}

		@ $mol_action
		static go( uri: string ) {
			const params = this.params( uri )
			if( !Object.keys( params ).length ) return false
			this.$.$mol_state_arg.dict({ ... this.$.$mol_state_arg.dict(), ... params })
			return true
		}

	}

}
