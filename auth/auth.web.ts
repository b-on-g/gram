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
			console.log( '[bog_gram/auth] born: отмечаю лорда', auth.pass().lord().str )
			$mol_state_local.value( key, true )
		}

		/** Логируем, с каким ключом реально стартует приложение. */
		@ $mol_mem
		static override current( next?: $giper_baza_auth | null ) {
			const auth = super.current( next )
			console.log( '[bog_gram/auth] current: лорд =', auth?.pass().lord().str ?? '(нет)' )
			return auth
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

			const merged = $mol_state_local.value( key_merged )
			console.log( '[bog_gram/auth] migrate: start, merged =', merged )
			if( merged ) {
				console.log( '[bog_gram/auth] migrate: уже перенесено, пропуск' )
				return
			}

			const own = String( $mol_state_local.value( key_own ) ?? '' )
			console.log( '[bog_gram/auth] migrate: старый слот', key_own, 'длина =', own.length )
			if( !own ) {
				console.log( '[bog_gram/auth] migrate: старого ключа нет, переносить нечего' )
				return
			}

			const auth = this.restore( own )
			console.log( '[bog_gram/auth] migrate: старый ключ разобран =', Boolean( auth ),
				auth && 'лорд ' + auth.pass().lord().str )

			if( !auth ) {
				console.log( '[bog_gram/auth] migrate: старый ключ битый, помечаю как перенесённый' )
				$mol_state_local.value( key_merged, true )
				return
			}

			const shared = String( $mol_state_local.value( key_shared ) ?? '' )
			const prev = shared && this.restore( shared )
			console.log( '[bog_gram/auth] migrate: общий слот', key_shared,
				'длина =', shared.length,
				'лорд =', prev ? prev.pass().lord().str : '(нет или битый )' )

			if( prev && prev.pass().lord().str !== auth.pass().lord().str ) {
				console.log( '[bog_gram/auth] migrate: чужой ключ откладываю в', key_prev )
				$mol_state_local.value( key_prev, shared )
			}

			$mol_state_local.value( key_shared, auth.toString() + auth.toStringPrivate() )
			console.log( '[bog_gram/auth] migrate: общий слот перезаписан лордом', auth.pass().lord().str )

			$mol_state_local.value( key_merged, true )
			console.log( '[bog_gram/auth] migrate: готово' )
		}

	}

	$.$giper_baza_auth = $bog_gram_auth

	// Сводка хранилища: с ней видно, на каком ключе и какой базе стартует Gram.
	try {
		const slot = ( key: string )=> {
			const raw = $mol_state_local.value( key )
			const str = typeof raw === 'string' ? raw : ''
			const lord = str ? ( $bog_gram_auth.restore( str )?.pass().lord().str ?? '(битый)' ) : '(пусто)'
			return `длина ${ str.length }, лорд ${ lord }`
		}
		console.log( '[bog_gram/auth] слоты localStorage:\n'
			+ `  ${ key_own }: ${ slot( key_own ) }\n`
			+ `  ${ key_shared }: ${ slot( key_shared ) }\n`
			+ `  ${ key_prev }: ${ slot( key_prev ) }\n`
			+ `  ${ key_merged }: ${ $mol_state_local.value( key_merged ) }` )
	} catch( error ) {
		console.error( '[bog_gram/auth] не смог прочитать слоты', error )
	}

	// Временный помощник для проверки ключей из консоли.
	try {
		const store = $mol_dom_context.localStorage
		;( globalThis as any ).bogGram = {
			/** Показать все слоты с лордами. */
			slots() {
				for( const key of [ key_own, key_shared, key_prev, key_merged ] ) {
					const raw = store?.getItem( key ) ?? ''
					let str = ''
					try { str = JSON.parse( raw ) ?? '' } catch( error ) { str = '' }
					const lord = typeof str === 'string' && str
						? ( $bog_gram_auth.restore( str )?.pass().lord().str ?? '(битый)' )
						: '(пусто)'
					console.log( key, '→', lord )
				}
			},
			/** Скопировать ключ из одного слота в общий и перезагрузить. */
			use( from: string ) {
				const raw = store?.getItem( from )
				if( !raw ) return console.warn( 'Слот пуст:', from )
				store!.setItem( key_shared, raw )
				console.log( 'Общий слот ←', from, ', перезагрузка…' )
				$mol_dom_context.location.reload()
			},
			/** Сохранить текущий общий ключ в отдельный слот. */
			save( to: string ) {
				const raw = store?.getItem( key_shared )
				if( !raw ) return console.warn( 'Общий слот пуст' )
				store!.setItem( to, raw )
				console.log( 'Общий слот →', to )
			},
			/** Найти все валидные ключи аккаунта в localStorage и sessionStorage. */
			scan() {
				const found = [] as [ string, string ][]
				const scanOne = ( s: Storage | undefined, name: string )=> {
					if( !s ) return
					for( let i = 0; i < s.length; ++i ) {
						const key = s.key( i )!
						let val = s.getItem( key ) ?? ''
						try {
							const parsed = JSON.parse( val )
							if( typeof parsed === 'string' ) val = parsed
						} catch( error ) {}
						try {
							const auth = $bog_gram_auth.restore( val )
							if( auth ) found.push([ name + ':' + key, auth.pass().lord().str ])
						} catch( error ) {}
					}
				}
				scanOne( store, 'local' )
				scanOne( $mol_dom_context.sessionStorage, 'session' )
				console.log( '[bog_gram/auth] найденные ключи:', found )
				return found
			},
		}
	} catch( error ) {
		console.error( '[bog_gram/auth] не смог поставить помощник', error )
	}

	$bog_gram_auth.migrate()

}
