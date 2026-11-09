namespace $ {

	const key_own = 'bog_gram_auth'

	const key_shared = '$giper_baza_auth'

	const key_size = 128

	export class $bog_gram_auth extends $giper_baza_auth {

		static restore( key: string ) {
			try {
				const auth = this.from( key )
				return auth.byteLength === key_size ? auth : null
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				return null
			}
		}

		@ $mol_mem
		static override current( next?: $giper_baza_auth | null ) {

			$mol_wire_solid()

			if( next === undefined ) {

				let key = String( $mol_state_local.value( key_own ) ?? '' )

				if( !key ) {
					const shared = String( $mol_state_local.value( key_shared ) ?? '' )
					if( shared ) {
						$mol_state_local.value( key_own, shared )
						key = shared
					}
				}

				if( key ) {

					const auth = this.restore( key )
					if( auth ) return auth

					$$.$mol_log3_warn({
						message: 'Wrong Auth size',
						hint: 'Relax. Right Auth is created.',
						place: `${this}.current()`,
					})

				}

			}

			if( !next ) {
				next = this.grab()
				$mol_state_local.value( 'bog_gram_born_' + next.pass().lord().str, true )
			}

			$mol_state_local.value( key_own, next.toString() + next.toStringPrivate() )

			return next
		}

	}

	$.$giper_baza_auth = $bog_gram_auth

}
