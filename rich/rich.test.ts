namespace $.$$ {

	$mol_test({

		'Заголовок, списки и пробелы между выделениями доезжают до пузыря'( $ ) {

			const html = '<section><p>тема</p></section><ol><p>раз</p></ol><p><strong>а</strong> <em>б</em></p>'
			const rich = $bog_gram_rich.make({ $, html: ()=> html })

			$mol_assert_equal( ( rich.dom_tree() as Element ).innerHTML, html )

		},

		'Чужая разметка чистится: нет картинок, обработчиков и опасных ссылок'( $ ) {

			const rich = $bog_gram_rich.make({ $, html: ()=> '<p onclick="x()">а<img src="https://evil/x.png"><a href="javascript:x()">б</a></p>' })

			$mol_assert_equal( ( rich.dom_tree() as Element ).innerHTML, '<p>аб</p>' )

		},

	})

}
