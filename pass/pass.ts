namespace $ {

	const parsed = new Map< string, $giper_baza_auth_pass >()

	export class $bog_gram_pass extends $mol_object {

		static parse( str: string ) {

			let pass = parsed.get( str )
			if( pass ) return pass

			pass = $giper_baza_auth_pass.from( str )
			parsed.set( str, pass )

			return pass
		}

		static verified( lord: string, str: string ): $giper_baza_auth_pass | null {

			if( !lord || !str ) return null

			try {

				const pass = this.parse( str )
				if( pass.lord().str === lord ) return pass

				$mol_fail_log( new Error( 'Ключ не сходится со своим владельцем', { cause: lord } ) )
				return null

			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				$mol_fail_log( error )
				return null
			}

		}

	}

}
