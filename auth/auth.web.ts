namespace $ {

	/** Слот, в котором Gram держал свой ключ до перехода на общий аккаунт домена */
	const key_own = 'bog_gram_auth'

	const key_shared = '$giper_baza_auth'

	const key_size = 128

	const born_prefix = 'bog_gram_born_'

	/**
	 * Ключ аккаунта — общий для всех приложений на домене, тот же, что у Music.
	 * Класс больше не подменяет хранилище: он только переносит ключ из старого
	 * грамовского слота и отмечает ключи, созданные здесь, чтобы гейт не ждал
	 * загрузки home-ленда впустую.
	 */
	export class $bog_gram_auth extends $giper_baza_auth {

		static restore( key: string ) {
			try {
				const auth = this.from( key )
				return auth.byteLength === key_size ? auth : null
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				return null
			}
		}

		/** Метит лорда как созданного на этом устройстве. */
		static born( auth: $giper_baza_auth ) {
			const key = born_prefix + auth.pass().lord().str
			if( $mol_state_local.value( key ) ) return
			$mol_state_local.value( key, true )
		}

		/**
		 * Новый ключ рождается здесь, и home-ленд у него заведомо пустой: гейту
		 * незачем ждать его загрузки. Ключ, принесённый ссылкой или файлом, так
		 * не метится — там как раз надо дождаться данных.
		 */
		@ $mol_action
		static override grab() {
			const auth = super.grab()
			this.born( auth )
			return auth
		}

		/**
		 * Разовая миграция: ключ, который Gram держал отдельно, становится общим.
		 * Здесь грам побеждает — аккаунты других приложений домена на этом
		 * устройстве остаются в стороне. Обратной операции нет, поэтому ключ из
		 * старого слота стирается только после записи общего.
		 */
		static migrate() {
			const own = String( $mol_state_local.value( key_own ) ?? '' )
			if( !own ) return

			const auth = this.restore( own )
			if( !auth ) {
				$mol_state_local.value( key_own, null )
				return
			}

			if( !String( $mol_state_local.value( key_shared ) ?? '' ) ) {
				$mol_state_local.value( key_shared, auth.toString() + auth.toStringPrivate() )
			}

			$mol_state_local.value( key_own, null )
		}

	}

	$.$giper_baza_auth = $bog_gram_auth

	$bog_gram_auth.migrate()

}
