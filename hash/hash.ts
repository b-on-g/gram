namespace $ {

	const hash_native = $giper_baza_unit_base.prototype.hash

	const cache = new WeakMap< $giper_baza_unit_base, { bin: Uint8Array, link: $giper_baza_link } >()

	export function $bog_gram_hash( this: $giper_baza_unit_base ) {

		const bin = this.asArray()

		const prev = cache.get( this )
		if( prev && $mol_compare_array( prev.bin, bin ) ) return prev.link

		const link = hash_native.call( this )
		cache.set( this, { bin: bin.slice(), link } )

		return link
	}

	$giper_baza_unit_base.prototype.hash = $bog_gram_hash

}
