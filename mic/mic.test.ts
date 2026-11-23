namespace $ {

	const fail = ( name: string )=> Object.assign( new Error( name ), { name } )

	const setup = ( error: string, good: ( audio: any )=> boolean )=> {
		const asked = [] as any[]
		const devices = {
			async getUserMedia( { audio }: any ) {
				asked.push( audio )
				if( !good( audio ) ) throw fail( error )
				return 'stream' as any
			},
			async enumerateDevices() {
				return [
					{ kind: 'videoinput', deviceId: 'cam' },
					{ kind: 'audioinput', deviceId: 'default' },
					{ kind: 'audioinput', deviceId: 'a' },
					{ kind: 'audioinput', deviceId: 'b' },
				] as any
			},
		}
		return { asked, devices }
	}

	$mol_test({

		async 'Не открывшийся микрофон пробуется без обработки, потом остальные входы'() {

			const { asked, devices } = setup( 'NotReadableError', audio => audio.deviceId?.exact === 'b' )

			$mol_assert_equal( await $bog_gram_mic.open( devices, true ), 'stream' as any )
			$mol_assert_equal( asked, [ true, $bog_gram_mic.raw, { deviceId: { exact: 'a' } }, { deviceId: { exact: 'b' } } ] )

		},

		async 'Отказ в доступе не переспрашивается'() {

			const { asked, devices } = setup( 'NotAllowedError', ()=> false )
			const error = await $bog_gram_mic.open( devices, true ).catch( error => error )

			$mol_assert_equal( error.name, 'NotAllowedError' )
			$mol_assert_equal( asked, [ true ] )

		},

		async 'Если не открылся ни один вход, отдаётся ошибка устройства'() {

			const { asked, devices } = setup( 'NotReadableError', ()=> false )
			const error = await $bog_gram_mic.open( devices, true ).catch( error => error )

			$mol_assert_equal( error.name, 'NotReadableError' )
			$mol_assert_equal( asked.length, 4 )

		},

	})

}
