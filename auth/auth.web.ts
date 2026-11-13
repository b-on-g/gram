namespace $ {

	/** Слот, в котором Gram держал свой ключ до перехода на общий аккаунт домена */
	const key_own = 'bog_gram_auth'

	const key_shared = '$giper_baza_auth'

	/** Отметка, что ключ из `key_own` уже перенесён в общий слот. */
	const key_merged = 'bog_gram_auth_merged'

	/** Прежний общий ключ, который перезаписал грамовский: копия на всякий случай. */
	const key_prev = 'bog_gram_auth_prev'

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
		 * Здесь грам побеждает — даже если в общем слоте уже лежит ключ другого
		 * приложения домена (Music успел завести свой), он перезаписывается.
		 * Два лорда не сливаются, поэтому ключ из старого слота остаётся лежать
		 * как резервная копия, а от повторного переноса защищает отметка.
		 */
		static migrate() {

			if( $mol_state_local.value( key_merged ) ) return

			const own = String( $mol_state_local.value( key_own ) ?? '' )
			if( !own ) return

			const auth = this.restore( own )

			if( !auth ) {
				$mol_state_local.value( key_merged, true )
				return
			}

			const shared = String( $mol_state_local.value( key_shared ) ?? '' )
			const prev = shared && this.restore( shared )

			if( prev && prev.pass().lord().str !== auth.pass().lord().str ) {
				$mol_state_local.value( key_prev, shared )
			}

			$mol_state_local.value( key_shared, auth.toString() + auth.toStringPrivate() )
			$mol_state_local.value( key_merged, true )

		}

	}

	$.$giper_baza_auth = $bog_gram_auth

	$bog_gram_auth.migrate()

}
