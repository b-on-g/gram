namespace $ {

	export class $bog_gram_rescue_web extends $bog_gram_rescue {

		@ $mol_mem
		override links() {
			return $mol_wire_sync( this.$.$bog_gram_rescue_web ).stored()
		}

		static async stored() {

			const db = await this.$.$giper_baza_mine_idb.db()
			const { Unit } = db.read( 'Unit' )
			const keys = await $mol_db_response( Unit.native.getAllKeys() as unknown as IDBRequest< IDBValidKey[] > )

			const links = new Set< string >()
			for( const key of keys ) {
				if( Array.isArray( key ) && typeof key[0] === 'string' ) links.add( key[0] )
			}

			return [ ... links ]
		}

	}

	$.$bog_gram_rescue = $bog_gram_rescue_web

}
