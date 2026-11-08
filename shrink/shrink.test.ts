namespace $ {

	$mol_test({

		'Большая сторона вписывается в предел с сохранением пропорций'() {
			$mol_assert_equal( $bog_gram_shrink.fit( 4000, 3000, 1600 ), { width: 1600, height: 1200 } )
			$mol_assert_equal( $bog_gram_shrink.fit( 3000, 4000, 1600 ), { width: 1200, height: 1600 } )
			$mol_assert_equal( $bog_gram_shrink.fit( 2000, 2000, 1600 ), { width: 1600, height: 1600 } )
		},

		'Кадр мельче предела не растягивается, узкая полоска не схлопывается'() {
			$mol_assert_equal( $bog_gram_shrink.fit( 320, 200, 1600 ), { width: 320, height: 200 } )
			$mol_assert_equal( $bog_gram_shrink.fit( 4000, 1, 1600 ), { width: 1600, height: 1 } )
		},

		'Картинкой считается только файл с типом image'() {
			$mol_assert_equal( $bog_gram_shrink.image_is( new $mol_blob( [], { type: 'image/webp' } ) ), true )
			$mol_assert_equal( $bog_gram_shrink.image_is( new $mol_blob( [], { type: 'text/plain' } ) ), false )
		},

		'Без перекодирования уезжают только форматы, которые покажет любой браузер'() {
			$mol_assert_equal( $bog_gram_shrink.portable( 'image/jpeg' ), true )
			$mol_assert_equal( $bog_gram_shrink.portable( 'image/webp' ), true )
			$mol_assert_equal( $bog_gram_shrink.portable( 'image/heic' ), false )
			$mol_assert_equal( $bog_gram_shrink.portable( 'image/tiff' ), false )
		},

		'Файл без типа узнаётся по расширению, а чужой тип расширением не перебить'() {
			$mol_assert_equal( $bog_gram_shrink.image_is( new File( [], 'IMG_0001.HEIC' ) ), true )
			$mol_assert_equal( $bog_gram_shrink.image_is( new File( [], 'photo.jpeg', { type: 'application/octet-stream' } ) ), true )
			$mol_assert_equal( $bog_gram_shrink.image_is( new File( [], 'notes.txt' ) ), false )
			$mol_assert_equal( $bog_gram_shrink.image_is( new File( [], 'jpg' ) ), false )
			$mol_assert_equal( $bog_gram_shrink.image_is( new File( [], 'fake.jpg', { type: 'application/pdf' } ) ), false )
		},

		'Настоящий тип берётся из первых байт'() {

			const bytes = ( ... parts: ( string | number[] )[] )=> new Uint8Array( parts.flatMap( part => typeof part === 'string' ? [ ... part ].map( char => char.charCodeAt( 0 ) ) : part ) )

			$mol_assert_equal( $bog_gram_shrink.sniff( bytes( [ 0xFF, 0xD8, 0xFF, 0xE1 ] ) ), 'image/jpeg' )
			$mol_assert_equal( $bog_gram_shrink.sniff( bytes( [ 0x89 ], 'PNG', [ 13, 10, 26, 10 ] ) ), 'image/png' )
			$mol_assert_equal( $bog_gram_shrink.sniff( bytes( 'GIF89a' ) ), 'image/gif' )
			$mol_assert_equal( $bog_gram_shrink.sniff( bytes( 'RIFF', [ 0, 0, 0, 0 ], 'WEBPVP8 ' ) ), 'image/webp' )
			$mol_assert_equal( $bog_gram_shrink.sniff( bytes( [ 0, 0, 0, 24 ], 'ftypheic' ) ), 'image/heic' )
			$mol_assert_equal( $bog_gram_shrink.sniff( bytes( [ 0, 0, 0, 24 ], 'ftypmif1' ) ), 'image/heif' )
			$mol_assert_equal( $bog_gram_shrink.sniff( bytes( [ 0, 0, 0, 24 ], 'ftypavif' ) ), 'image/avif' )
			$mol_assert_equal( $bog_gram_shrink.sniff( bytes( [ 0, 0, 0, 24 ], 'ftypisom' ) ), '' )
			$mol_assert_equal( $bog_gram_shrink.sniff( bytes( '%PDF-1.7' ) ), '' )
			$mol_assert_equal( $bog_gram_shrink.sniff( bytes() ), '' )

		},

	})

}
