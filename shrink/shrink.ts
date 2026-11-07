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

	async function original( file: Blob, bitmap: ImageBitmap ): Promise< $bog_gram_shrink_shot > {
		return {
			bytes: new Uint8Array( await file.arrayBuffer() ),
			type: file.type || 'image/jpeg',
			width: bitmap.width,
			height: bitmap.height,
		}
	}

	const api = {

		async shrink( file: Blob, side: number, weight: number ): Promise< $bog_gram_shrink_shot > {

			const bitmap = await createImageBitmap( file )

			try {

				const fit = $bog_gram_shrink.fit( bitmap.width, bitmap.height, side )
				const same = fit.width === bitmap.width && fit.height === bitmap.height

				if( same && file.size <= weight ) return await original( file, bitmap )

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

					paper.drawImage( bitmap, 0, 0, width, height )

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

				if( !best ) return await original( file, bitmap )

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

		static image_is( file: Blob ) {
			return file.type.startsWith( 'image/' )
		}

		static shrink( file: Blob ) {
			return $mol_wire_sync( api ).shrink( file, side_limit, weight_limit )
		}

	}

}
