namespace $ {

	const passes = new Map< string, $giper_baza_auth_pass >()

	export class $bog_gram_seal extends $mol_object {

		static prefix = 'seal'

		static pass( str: string ) {

			let pass = passes.get( str )
			if( pass ) return pass

			pass = $giper_baza_auth_pass.from( str )
			passes.set( str, pass )

			return pass
		}

		static nonce( kind: string, open: string ) {
			return $mol_crypto2_hash( $mol_charset_encode( kind + '|' + open ) ).slice( 0, 16 )
		}

		static is( entry: string ) {
			return String( entry ?? '' ).startsWith( this.prefix + '|' )
		}

		static close( auth: $giper_baza_auth, mate: $giper_baza_auth_pass, kind: string, open: string ) {

			const secret = auth.secret_mutual( mate )
			const nonce = this.nonce( kind, open )
			const code = $mol_wire_sync( secret ).encrypt( $mol_charset_encode( open ), nonce )

			return [
				this.prefix,
				auth.pass().toString(),
				$mol_base64_url_encode( nonce ),
				$mol_base64_url_encode( code ),
			].join( '|' )
		}

		static open( auth: $giper_baza_auth, kind: string, entry: string ) {

			if( !this.is( entry ) ) return null

			const parts = entry.split( '|' )
			if( parts.length !== 4 ) return null

			try {

				const pass = this.pass( parts[ 1 ] )
				const nonce = $mol_base64_url_decode( parts[ 2 ] )
				const code = $mol_base64_url_decode( parts[ 3 ] )

				const secret = auth.secret_mutual( pass )
				const open = $mol_charset_decode( $mol_wire_sync( secret ).decrypt( code, nonce ) )

				const check = this.nonce( kind, open )
				if( $mol_base64_url_encode( check ) !== $mol_base64_url_encode( nonce ) ) return null

				return { open, pass: parts[ 1 ], lord: pass.lord().str }

			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				return null
			}

		}

	}

}
