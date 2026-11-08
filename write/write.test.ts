namespace $.$$ {

	function key( mods: Partial< KeyboardEvent > = {} ) {
		const event = {
			keyCode: $mol_keyboard_code.enter,
			ctrlKey: false,
			metaKey: false,
			altKey: false,
			shiftKey: false,
			defaultPrevented: false,
			preventDefault() { event.defaultPrevented = true },
			... mods,
		}
		return event as unknown as KeyboardEvent
	}

	function make( $: $, fine: boolean ) {
		let sent = 0
		const write = $bog_gram_write.make({ $, enter_sends: ()=> fine, send: ()=> ( ++ sent, null ) })
		const press = ( event: KeyboardEvent )=> {
			write.Edit().Submit().keydown( event )
			write.press( event )
			return event
		}
		return { write, press, sent: ()=> sent }
	}

	$mol_test({

		'Enter отправляет, Shift+Enter переносит строку'( $ ) {

			const { write, press, sent } = make( $, true )
			write.value( 'Привет' )

			const shift = press( key({ shiftKey: true }) )
			$mol_assert_equal( sent(), 0 )
			$mol_assert_equal( shift.defaultPrevented, false )

			const enter = press( key() )
			$mol_assert_equal( sent(), 1 )
			$mol_assert_equal( enter.defaultPrevented, true )

		},

		'Ctrl+Enter и Cmd+Enter вставляют перевод строки на месте курсора'( $ ) {

			const { write, press, sent } = make( $, true )

			write.value( 'Приветмир' )
			write.selection([ 6, 6 ])
			const ctrl = press( key({ ctrlKey: true }) )
			$mol_assert_equal( write.value(), 'Привет\nмир' )
			$mol_assert_equal( write.selection(), [ 7, 7 ] )
			$mol_assert_equal( ctrl.defaultPrevented, true )

			write.selection([ 0, 6 ])
			press( key({ metaKey: true }) )
			$mol_assert_equal( write.value(), '\n\nмир' )

			$mol_assert_equal( sent(), 0 )

		},

		'На тач-экране Enter переносит строку, отправка кнопкой'( $ ) {

			const { write, press, sent } = make( $, false )
			write.value( 'Привет' )

			const enter = press( key() )
			$mol_assert_equal( sent(), 0 )
			$mol_assert_equal( enter.defaultPrevented, false )

		},

	})

}
