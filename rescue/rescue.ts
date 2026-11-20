namespace $ {

	export type $bog_gram_rescue_found = {
		dialogs: string
		watch: string
	}

	export class $bog_gram_rescue extends $mol_object {

		lord() {
			return this.$.$giper_baza_auth.current().pass().lord()
		}

		links(): readonly string[] {
			return []
		}

		land( link: string ) {
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( link ) )
		}

		keys( link: string ) {

			const land = this.land( link )

			try {
				const keys = land.Data( $giper_baza_dict ).keys().map( String )
				if( land.lord_rank( this.lord() ) !== $giper_baza_rank_rule ) return []
				return keys
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				return []
			}

		}

		size( link: string ) {
			return this.land( link ).Data( $bog_gram_dialogs ).Dialogs()?.items().length ?? 0
		}

		@ $mol_mem
		found(): $bog_gram_rescue_found {

			const home = this.lord().str
			const dialogs = [] as string[]
			const watch = [] as string[]

			for( const link of this.links() ) {

				if( link === home ) continue
				if( link.split( '_' ).length !== 2 ) continue

				const keys = this.keys( link )

				if( keys.includes( 'Dialogs' ) || keys.includes( 'Saved_land' ) ) dialogs.push( link )
				else if( keys.length === 1 && keys[0] === 'Watch' ) watch.push( link )

			}

			return {
				dialogs: dialogs.sort( ( left, right )=> this.size( right ) - this.size( left ) )[0] ?? '',
				watch: watch[0] ?? '',
			}

		}

	}

}
