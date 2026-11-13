namespace $ {

	$mol_test({

		'видео узнаётся по типу и по расширению, картинка нет'() {
			const file = ( name: string, type = '' )=> new File( [], name, { type } )
			$mol_assert_equal(
				[
					file( 'a.bin', 'video/mp4' ),
					file( 'IMG_1.MOV' ),
					file( 'a.png', 'image/png' ),
				].map( one => $bog_gram_clip.video_is( one ) ),
				[ true, true, false ],
			)
		},

	})

}
