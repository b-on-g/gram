namespace $ {

	const side_limit = 1600

	const weight_limit = 1.5 * 1024 * 1024

	const quality_max = 0.8
	const quality_min = 0.5
	const quality_step = 0.15

	const scale_step = 0.75

	const tries_limit = 6

	export type $bog_gram_shrink_shot = {
		bytes: Uint8Array< ArrayBuffer >,
		type: string,
		width: number,
		height: number,
	}

	function encode( canvas: HTMLCanvasElement, type: string, quality: number ) {
		return new Promise< Blob | null >( done => canvas.toBlob( done, type, quality ) )
	}

	type $bog_gram_shrink_picture = {
		source: CanvasImageSource,
		width: number,
		height: number,
		close: ()=> void,
	}

	async function bitmap_of( file: Blob ): Promise< $bog_gram_shrink_picture | null > {
		try {
			const bitmap = await createImageBitmap( file )
			return { source: bitmap, width: bitmap.width, height: bitmap.height, close: ()=> bitmap.close() }
		} catch( error ) {
			return null
		}
	}

	async function image_of( file: Blob ): Promise< $bog_gram_shrink_picture | null > {

		const uri = $mol_dom_context.URL.createObjectURL( file )
		const image = $mol_dom_context.document.createElement( 'img' )

		try {
			image.src = uri
			await image.decode()
			return { source: image, width: image.naturalWidth, height: image.naturalHeight, close: ()=> $mol_dom_context.URL.revokeObjectURL( uri ) }
		} catch( error ) {
			$mol_dom_context.URL.revokeObjectURL( uri )
			return null
		}

	}

	async function type_of( file: Blob ) {
		const head = new Uint8Array( await file.slice( 0, 16 ).arrayBuffer() )
		return $bog_gram_shrink.sniff( head ) || $bog_gram_shrink.type_declared( file ) || $bog_gram_shrink.type_named( file ) || 'image/jpeg'
	}

	async function original( file: Blob, type: string, width: number, height: number ): Promise< $bog_gram_shrink_shot > {
		return {
			bytes: new Uint8Array( await file.arrayBuffer() ),
			type,
			width,
			height,
		}
	}

	const api = {

		async shrink( file: Blob, side: number, weight: number ): Promise< $bog_gram_shrink_shot > {

			const type = await type_of( file )

			const bitmap = await bitmap_of( file ) ?? await image_of( file )
			if( !bitmap ) return await original( file, type, 0, 0 )

			try {

				const fit = $bog_gram_shrink.fit( bitmap.width, bitmap.height, side )
				const same = fit.width === bitmap.width && fit.height === bitmap.height

				if( same && file.size <= weight && $bog_gram_shrink.portable( type ) ) return await original( file, type, bitmap.width, bitmap.height )

				let width = fit.width
				let height = fit.height
				let quality = quality_max
				let best: Blob | null = null

				for( let step = 0; step < tries_limit; ++ step ) {

					const canvas = $mol_dom_context.document.createElement( 'canvas' )
					canvas.width = width
					canvas.height = height

					const paper = canvas.getContext( '2d' )
					if( !paper ) break

					paper.drawImage( bitmap.source, 0, 0, width, height )

					let blob = await encode( canvas, 'image/webp', quality )
					if( blob?.type !== 'image/webp' ) blob = await encode( canvas, 'image/jpeg', quality )
					if( !blob ) break

					best = blob
					if( blob.size <= weight ) break

					if( quality > quality_min ) {
						quality = Math.max( quality_min, quality - quality_step )
					} else {
						const next = $bog_gram_shrink.fit( width, height, Math.round( Math.max( width, height ) * scale_step ) )
						if( next.width === width && next.height === height ) break
						width = next.width
						height = next.height
					}

				}

				if( !best ) return await original( file, type, bitmap.width, bitmap.height )

				return {
					bytes: new Uint8Array( await best.arrayBuffer() ),
					type: best.type || 'image/jpeg',
					width,
					height,
				}

			} finally {
				bitmap.close()
			}

		},

	}

	export class $bog_gram_shrink extends $mol_object {

		static fit( width: number, height: number, limit: number ) {

			const side = Math.max( width, height )
			if( !( limit > 0 ) || !( side > limit ) ) return { width, height }

			const scale = limit / side

			return {
				width: Math.max( 1, Math.round( width * scale ) ),
				height: Math.max( 1, Math.round( height * scale ) ),
			}

		}

		static extensions: Record< string, string > = {
			jpg: 'image/jpeg',
			jpeg: 'image/jpeg',
			jfif: 'image/jpeg',
			png: 'image/png',
			gif: 'image/gif',
			webp: 'image/webp',
			heic: 'image/heic',
			heif: 'image/heif',
			avif: 'image/avif',
		}

		static type_named( file: Blob ) {
			const name = String( ( file as File ).name ?? '' )
			if( !name.includes( '.' ) ) return ''
			return this.extensions[ name.split( '.' ).pop()!.toLowerCase() ] ?? ''
		}

		static type_declared( file: Blob ) {
			return file.type && file.type !== 'application/octet-stream' ? file.type : ''
		}

		static image_is( file: Blob ) {
			const type = this.type_declared( file )
			if( type ) return type.startsWith( 'image/' )
			return Boolean( this.type_named( file ) )
		}

		static sniff( head: Uint8Array ) {

			const ascii = ( from: number, till: number )=> String.fromCharCode( ... head.subarray( from, till ) )

			if( head[0] === 0xFF && head[1] === 0xD8 && head[2] === 0xFF ) return 'image/jpeg'
			if( head[0] === 0x89 && ascii( 1, 4 ) === 'PNG' ) return 'image/png'
			if( ascii( 0, 4 ) === 'GIF8' ) return 'image/gif'
			if( ascii( 0, 4 ) === 'RIFF' && ascii( 8, 12 ) === 'WEBP' ) return 'image/webp'

			if( ascii( 4, 8 ) === 'ftyp' ) {
				const brand = ascii( 8, 12 )
				if( brand === 'avif' || brand === 'avis' ) return 'image/avif'
				if( [ 'heic', 'heix', 'heim', 'heis', 'hevc', 'hevx', 'hevm', 'hevs' ].includes( brand ) ) return 'image/heic'
				if( brand === 'mif1' || brand === 'msf1' ) return 'image/heif'
			}

			return ''
		}

		static portable( type: string ) {
			return [ 'image/jpeg', 'image/png', 'image/webp', 'image/gif' ].includes( type )
		}

		static shrink( file: Blob ) {
			return $mol_wire_sync( api ).shrink( file, side_limit, weight_limit )
		}

	}

}
