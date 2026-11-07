namespace $ {

	export class $bog_gram_lord extends $mol_object {

		static short( lord: string ) {
			if( lord.length <= 14 ) return lord
			return lord.slice( 0, 6 ) + '…' + lord.slice( -4 )
		}

		static label( lord: string, note: string, name: string ) {
			if( !lord ) return ''
			return note || name || this.short( lord )
		}

		static tint( lord: string ) {
			let hash = 0
			for( const symbol of lord ) hash = ( hash * 31 + symbol.charCodeAt( 0 ) ) % 7
			return hash
		}

		static check( lord: string ) {
			if( !$giper_baza_link.check( lord ) ) return false
			const link = new $giper_baza_link( lord )
			return link.lord().str === link.str
		}

	}

}
