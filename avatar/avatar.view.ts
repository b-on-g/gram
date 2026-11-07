namespace $.$$ {

	const start = 4
	const step = 4
	const center = 12
	const limit = center - 2.5

	export class $bog_gram_avatar extends $.$bog_gram_avatar {

		@ $mol_mem
		override path() {

			const id = $mol_hash_string( this.id() )
			let path = ''

			for( let x = 0; x < 3; ++x ) {
				for( let y = 0; y < 5; ++y ) {

					if( !( ( id >> ( x + y * 3 ) ) & 1 ) ) continue

					const px = step * x + start
					const py = step * y + start

					if( Math.hypot( px - center, py - center ) > limit ) continue

					path += `M ${ px } ${ py } l 0 0 ` + `M ${ 24 - px } ${ py } l 0 0 `

				}
			}

			return path
		}

	}

}
