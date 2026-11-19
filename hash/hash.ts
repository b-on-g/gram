namespace $ {

	const cache = new WeakMap< $giper_baza_unit_base, { bin: Uint8Array, link: $giper_baza_link } >()

	export function $bog_gram_hash( this: $giper_baza_unit_base ) {

		const bin = new Uint8Array( this.buffer, this.byteOffset, this.byteLength )

		const prev = cache.get( this )
		if( prev && $mol_compare_array( prev.bin, bin ) ) return prev.link

		const link = $giper_baza_link.hash_bin( bin )
		cache.set( this, { bin: bin.slice(), link } )

		return link
	}

	$giper_baza_unit_base.prototype.hash = $bog_gram_hash

}
