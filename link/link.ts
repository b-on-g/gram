namespace $ {

	export function $bog_gram_link_synced< const Value extends any >( Value: Value ) {

		const Base = $giper_baza_atom_link.to( Value )
		type Link = InstanceType< typeof Base >

		class $bog_gram_link_synced extends Base {

			remote( next?: Parameters< Link[ 'remote' ] >[ 0 ] ) {
				const target = super.remote( next )
				if( next === undefined ) this.target_sync()
				return target
			}

			target_sync() {

				const link = this.val()
				if( !link ) return

				try {
					this.$.$giper_baza_glob.Land( link.land() ).sync()
				} catch( error ) {
					if( !$mol_promise_like( error ) ) throw error
				}

			}

		}

		return $bog_gram_link_synced as typeof Base
	}

}
