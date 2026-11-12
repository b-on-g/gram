namespace $.$$ {

	$mol_test({

		'В тексте сообщения http-адрес становится ссылкой, остальное остаётся текстом'( $ ) {

			const body = $bog_gram_body.make({ $, text: ()=> 'смотри https://example.com/a?b=1 или https://ya.ru. всё' })
			const parts = body.sub() as readonly any[]

			$mol_assert_equal( parts.length, 5 )
			$mol_assert_equal( parts[0], 'смотри ' )
			$mol_assert_equal( String( parts[1] ), '$bog_gram_body<>.Link<1>' )
			$mol_assert_equal( parts[2], ' или ' )
			$mol_assert_equal( String( parts[3] ), '$bog_gram_body<>.Link<3>' )
			$mol_assert_equal( parts[4], '. всё' )

		},

		'Ссылка ведёт по адресу из текста и подписана им же'( $ ) {

			const body = $bog_gram_body.make({ $, text: ()=> 'https://example.com/a?b=1' })

			$mol_assert_equal( body.link_uri( 0 ), 'https://example.com/a?b=1' )
			$mol_assert_equal( body.link_text( 0 ), 'https://example.com/a?b=1' )

		},

		'Разметка в тексте сообщения не толкуется: звёздочки и обратные кавычки остаются как есть'( $ ) {

			const body = $bog_gram_body.make({ $, text: ()=> '**жирный** и `код` без адресов' })

			$mol_assert_equal( body.sub(), [ '**жирный** и `код` без адресов' ] )

		},

		'Пустой текст не даёт ни частей, ни ссылок'( $ ) {

			const body = $bog_gram_body.make({ $, text: ()=> '' })

			$mol_assert_equal( body.sub(), [] )

		},

	})

}
