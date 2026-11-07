namespace $ {

	$mol_test({

		async 'Подпись переживает перезапуск фибры и не заводит новую на каждом заходе'( $ ) {

			const auth = await $.$giper_baza_auth._generate()
			const lord = auth.pass().lord().str

			class Notify extends $bog_gram_notify {
				static override $ = $.$mol_ambient({
					$giper_baza_auth: { current: ()=> auth } as any,
				})
			}

			const later = {
				async tick() {
					await Promise.resolve()
					return true
				},
			}

			const proofs = [] as ReturnType< typeof Notify.signed >[]

			const proof = await $mol_wire_async( ()=> {
				const proof = Notify.signed( 'subscribe', lord, 'Monitor', 'https://push.example/1' )
				proofs.push( proof )
				$mol_wire_sync( later ).tick()
				return proof
			} )()

			$mol_assert_equal( proofs.length, 2 )
			$mol_assert_equal( proofs[0], proof )

		},

		async 'Подпись запроса к демону сходится с ключом владельца и ломается от подмены'( $ ) {

			const auth = await $.$giper_baza_auth._generate()
			const other = await $.$giper_baza_auth._generate()
			const lord = auth.pass().lord().str

			class Notify extends $bog_gram_notify {
				static override $ = $.$mol_ambient({
					$giper_baza_auth: { current: ()=> auth } as any,
				})
			}

			const proof = await $mol_wire_async( Notify ).signed( 'subscribe', lord, 'Monitor', 'https://push.example/1' )

			$mol_assert_equal( $giper_baza_auth_pass.from( proof.pass ).lord().str, lord )

			const sign = $mol_base64_url_decode( proof.sign )
			const text = ( monitor: string )=> $mol_charset_encode( Notify.proof( 'subscribe', lord, monitor, 'https://push.example/1', proof.time ) )

			$mol_assert_equal( await auth.pass().auditor().verify( text( 'Monitor' ), sign ), true )
			$mol_assert_equal( await auth.pass().auditor().verify( text( 'Stolen' ), sign ), false )
			$mol_assert_equal( await other.pass().auditor().verify( text( 'Monitor' ), sign ), false )

		},

	})

}
