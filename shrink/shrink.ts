namespace $ {

	/** Предел большей стороны кадра в пикселях. Оригинал с телефона весит
	 * мегабайты и в пузыре всё равно показывается мелким, а по сети едет
	 * целиком и целиком же оседает в памяти мастера. */
	const side_limit = 1600

	/** Предел веса готового кадра в байтах. */
	const weight_limit = 1.5 * 1024 * 1024

	/** Качество кодирования: с чего начинаем и ниже чего не опускаемся —
	 * дальше картинка идёт квадратами, и лучше отдать её потяжелее. */
	const quality_max = 0.8
	const quality_min = 0.5
	const quality_step = 0.15

	/** Во сколько ужимаем сторону, когда качество уже на нижнем пределе. */
	const scale_step = 0.75

	/** Сколько заходов пытаемся уложиться в вес: дальше отдаём что вышло. */
	const tries_limit = 6

	/** Кадр, готовый к записи в ленд. */
	export type $bog_gram_shrink_shot = {
		bytes: Uint8Array< ArrayBuffer >,
		type: string,
		width: number,
		height: number,
	}

	function encode( canvas: HTMLCanvasElement, type: string, quality: number ) {
		return new Promise< Blob | null >( done => canvas.toBlob( done, type, quality ) )
	}

	/** Всё пережатие — один промис на вызов, и это принципиально: фибра
	 * перезапускается на каждом ожидании, а холст на новом заходе был бы
	 * уже другим объектом — то есть другой задачей, и так до бесконечности.
	 * Внутри же обычный async без фибр, поэтому холстов можно сколько угодно. */
	const api = {

		async shrink( file: Blob, side: number, weight: number ): Promise< $bog_gram_shrink_shot > {

			const bitmap = await createImageBitmap( file )

			try {

				const fit = $bog_gram_shrink.fit( bitmap.width, bitmap.height, side )
				const same = fit.width === bitmap.width && fit.height === bitmap.height

				// Мелкий кадр не трогаем: перекодирование только испортило бы его
				if( same && file.size <= weight ) return {
					bytes: new Uint8Array( await file.arrayBuffer() ),
					type: file.type || 'image/jpeg',
					width: bitmap.width,
					height: bitmap.height,
				}

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

					// Тип результата проверяем всегда: браузер без WebP молча
					// отдаёт PNG, а он тяжелее исходной фотографии
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

				// Ни холст, ни кодек не дались: отправляем оригинал — это всё
				// же лучше, чем сообщение без картинки
				if( !best ) return {
					bytes: new Uint8Array( await file.arrayBuffer() ),
					type: file.type || 'image/jpeg',
					width: bitmap.width,
					height: bitmap.height,
				}

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

	/** Пережатие картинки перед отправкой. */
	export class $bog_gram_shrink extends $mol_object {

		/** Вписывает размеры в квадрат со стороной limit, сохраняя пропорции.
		 * То, что уже помещается, оставляем как есть: растянутый кадр только
		 * потяжелеет и станет мыльным. */
		static fit( width: number, height: number, limit: number ) {

			const side = Math.max( width, height )
			if( !( limit > 0 ) || !( side > limit ) ) return { width, height }

			const scale = limit / side

			return {
				width: Math.max( 1, Math.round( width * scale ) ),
				height: Math.max( 1, Math.round( height * scale ) ),
			}

		}

		/** Это картинка, а не документ и не видео. */
		static image_is( file: Blob ) {
			return file.type.startsWith( 'image/' )
		}

		/** Готовый к отправке кадр. Зовётся только из фибры: внутри промисы. */
		static shrink( file: Blob ) {
			return $mol_wire_sync( api ).shrink( file, side_limit, weight_limit )
		}

	}

}
