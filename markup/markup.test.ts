namespace $ {

	const bold: $bog_rich_content = { text: 'очень важно', entities: [ { type: 'bold', offset: 6, length: 5 } ] }

	$mol_test({

		'Стили возвращаются вместе с текстом, простое сообщение их не пишет'( $ ) {
			const message = $giper_baza_land.make({ $ }).Data( $bog_gram_message )
			$bog_gram_markup_write( message, { text: 'просто', entities: [] } )
			$mol_assert_equal( [ message.Text()?.val(), message.Entities()?.val() ?? null ], [ 'просто', null ] )
			$bog_gram_markup_write( message, bold )
			$mol_assert_equal( $bog_gram_markup_read( message ), bold )
			$bog_gram_markup_write( message, { text: 'просто', entities: [] } )
			$mol_assert_equal( $bog_gram_markup_read( message ), { text: 'просто', entities: [] } )
		},

		'Старый клиент поправил только текст: стили прежней ревизии не показываются'( $ ) {
			const message = $giper_baza_land.make({ $ }).Data( $bog_gram_message )
			$bog_gram_markup_write( message, bold )
			message.Text( 'auto' )!.val( 'важно очень' )
			$mol_assert_equal( $bog_gram_markup_read( message ), { text: 'важно очень', entities: [] } )
		},

		'Чужой мусор в поле стилей не роняет сообщение'( $ ) {
			const message = $giper_baza_land.make({ $ }).Data( $bog_gram_message )
			message.Text( 'auto' )!.val( 'текст' )
			for( const code of [ '{', 'null', '[]', '{"hash":1}' ] ) {
				message.Entities( 'auto' )!.val( code )
				$mol_assert_equal( $bog_gram_markup_read( message ), { text: 'текст', entities: [] } )
			}
		},

	})

}
