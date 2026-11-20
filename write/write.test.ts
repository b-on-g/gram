namespace $.$$ {

	function key( mods: Partial< KeyboardEvent > = {} ) {
		const event = {
			keyCode: $mol_keyboard_code.enter,
			ctrlKey: false,
			metaKey: false,
			altKey: false,
			shiftKey: false,
			isComposing: false,
			defaultPrevented: false,
			preventDefault() { event.defaultPrevented = true },
			... mods,
		}
		return event as unknown as KeyboardEvent
	}

	function input( data: string | null, inputType = 'insertText' ) {
		const event = {
			inputType,
			data,
			defaultPrevented: false,
			preventDefault() { event.defaultPrevented = true },
		}
		return event as unknown as InputEvent
	}

	function make( $: $, fine: boolean ) {
		let sent = 0
		const write = $bog_gram_write.make({ $, enter_sends: ()=> fine, send: ()=> ( ++ sent, null ) })
		return { write, sent: ()=> sent }
	}

	$mol_test({

		'Набор, правка и очистка поля не трогают Базу: ни home-ленд, ни какой другой'( $ ) {

			const touched = [] as string[]
			const touch = ( what: string )=> { touched.push( what ); return $mol_fail( new Error( `Поле полезло в Базу: ${ what }` ) ) }

			const context = $.$mol_ambient({
				$giper_baza_land: class extends $giper_baza_land {
					static override make(): any { return touch( 'land' ) }
				},
				$giper_baza_glob: class extends $giper_baza_glob {
					static override home(): any { return touch( 'home' ) }
					static override Land(): any { return touch( 'Land' ) }
					static override land_grab(): any { return touch( 'land_grab' ) }
				},
				$giper_baza_auth: class extends $giper_baza_auth {
					static override current(): any { return touch( 'auth' ) }
				},
			})

			const write = $bog_gram_write.make({ $: context, rich: ()=> true })
			write.html( '<p>черновик</p>' )

			const content = write.Content().dom_tree() as Element
			$mol_assert_equal( content.textContent, 'черновик' )

			content.querySelector( 'p' )!.textContent = 'черновик и ещё'
			write.save()
			$mol_assert_equal( write.html(), '<p>черновик и ещё</p>' )
			$mol_assert_equal( content.querySelector( 'p' ), write.nodes()[0] )

			write.html( '' )
			$mol_assert_equal( ( write.Content().dom_tree() as Element ).textContent, '' )

			$mol_assert_equal( touched, [] )

		},

		'Enter отправляет, Shift+Enter переносит строку'( $ ) {

			const { write, sent } = make( $, true )

			const shift = key({ shiftKey: true })
			write.press( shift )
			$mol_assert_equal( sent(), 0 )
			$mol_assert_equal( shift.defaultPrevented, false )

			const enter = key()
			write.press( enter )
			$mol_assert_equal( sent(), 1 )
			$mol_assert_equal( enter.defaultPrevented, true )

		},

		'На тач-экране Enter переносит строку, отправка кнопкой'( $ ) {

			const { write, sent } = make( $, false )

			const enter = key()
			write.press( enter )
			$mol_assert_equal( sent(), 0 )
			$mol_assert_equal( enter.defaultPrevented, false )

		},

		'Enter, подтверждающий набор иероглифов, сообщение не отправляет'( $ ) {

			const { write, sent } = make( $, true )

			const enter = key({ isComposing: true })
			write.press( enter )
			$mol_assert_equal( sent(), 0 )
			$mol_assert_equal( enter.defaultPrevented, false )

		},

		'Строки текста и абзацы поля переводятся друг в друга без потерь'( $ ) {

			const text = 'Привет\n\n<мир> & всё'
			const html = $bog_gram_write_html( text )

			$mol_assert_equal( html, '<p>Привет</p><p><br></p><p>&lt;мир&gt; &amp; всё</p>' )
			$mol_assert_equal( $bog_gram_write_text( html ), text )
			$mol_assert_equal( $bog_gram_write_text( '<section><p>раз<br>два</p></section><p>три<br></p>' ), 'раз\nдва\nтри' )

		},

		'Форматирование отличается от простых абзацев, чистка убирает ссылки на ленд и картинки'( $ ) {

			$mol_assert_equal( $bog_gram_write_rich_is( '<section><p>просто<br></p></section>' ), false )
			$mol_assert_equal( $bog_gram_write_rich_is( '<p>очень <strong>важно</strong></p>' ), true )

			$mol_assert_equal(
				$bog_gram_write_clean( '<p id="x" xmlns="http://www.w3.org/1999/xhtml"><span id="y">раз</span><span id="z"> два</span><img src="https://evil/track.png"><a href="https://ya.ru" onclick="alert()">ссылка</a></p>' ),
				'<p>раз два<a href="https://ya.ru">ссылка</a></p>',
			)

		},

		'Черновик с неразрывным пробелом и прочими сущностями HTML поле открывает, а не падает'( $ ) {

			const { write } = make( $, true )

			write.html( $bog_gram_write_clean( '<p>раз два&nbsp;&laquo;три&raquo; </p>' ) )

			$mol_assert_equal( write.nodes().map( node => node.textContent ).join( '' ), 'раз два «три» ' )

		},

		'Ввод сверх лимита браузер не вставляет, удаление и набор в пределах лимита проходят'( $ ) {

			const { write } = make( $, true )
			write.length_max = ()=> 5
			write.html( '<p>абвг</p>' )

			const fits = input( 'д' )
			write.before_input( fits )
			$mol_assert_equal( fits.defaultPrevented, false )

			const long = input( 'де' )
			write.before_input( long )
			$mol_assert_equal( long.defaultPrevented, true )

			write.html( '<p>абвгд</p>' )

			const more = input( 'е' )
			write.before_input( more )
			$mol_assert_equal( more.defaultPrevented, true )

			const line = input( null, 'insertParagraph' )
			write.before_input( line )
			$mol_assert_equal( line.defaultPrevented, true )

			const erase = input( null, 'deleteContentBackward' )
			write.before_input( erase )
			$mol_assert_equal( erase.defaultPrevented, false )

		},

		'В простом режиме нет панели форматирования и Tab не превращает строку в список'( $ ) {

			const { write } = make( $, true )

			$mol_assert_equal( write.sub().includes( write.Tools() ), false )

			const tab = key({ keyCode: $mol_keyboard_code.tab })
			write.block_rewrap( tab )
			$mol_assert_equal( tab.defaultPrevented, false )

			const rich = $bog_gram_write.make({ $, rich: ()=> true })
			$mol_assert_equal( rich.sub().includes( rich.Tools() ), true )

		},

	})

}
