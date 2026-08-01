namespace $ {

	/** Своё место в локальном хранилище: общий ключ Гипер Базы один на весь
	 * домен, поэтому смена аккаунта здесь меняла бы аккаунт и в соседних
	 * приложениях того же origin. */
	const key_own = 'bog_gram_auth'

	/** Общее хранилище Гипер Базы: из него въезжает уже заведённый аккаунт,
	 * но дальше мы его только читаем и никогда не переписываем. */
	const key_shared = '$giper_baza_auth'

	/** Полный размер ключа в байтах: публичная часть плюс приватная. */
	const key_size = 128

	export class $bog_gram_auth extends $giper_baza_auth {

		/** Строку из хранилища принимаем только целым ключом: обрезок бросил бы
		 * исключение прямо на старте, и приложение осталось бы без экрана. */
		static restore( key: string ) {
			try {
				const auth = this.from( key )
				return auth.byteLength === key_size ? auth : null
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				return null
			}
		}

		@ $mol_mem
		static override current( next?: $giper_baza_auth | null ) {

			$mol_wire_solid()

			if( next === undefined ) {

				let key = String( $mol_state_local.value( key_own ) ?? '' )

				// Первый запуск после переезда: копируем общий ключ себе, чтобы
				// сохранились текущий идентификатор и все диалоги. Общее значение
				// остаётся на месте — им продолжают жить соседние приложения.
				if( !key ) {
					const shared = String( $mol_state_local.value( key_shared ) ?? '' )
					if( shared ) {
						$mol_state_local.value( key_own, shared )
						key = shared
					}
				}

				if( key ) {

					const auth = this.restore( key )
					if( auth ) return auth

					$$.$mol_log3_warn({
						message: 'Wrong Auth size',
						hint: 'Relax. Right Auth is created.',
						place: `${this}.current()`,
					})

				}

			}

			if( !next ) next = this.grab()

			$mol_state_local.value( key_own, next.toString() + next.toStringPrivate() )

			return next
		}

	}

	$.$giper_baza_auth = $bog_gram_auth

}
