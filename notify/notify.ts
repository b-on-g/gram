namespace $ {

	/** Промисные браузерные API одной кучей: фибра дёргает их через
	 * синхронную обёртку, поэтому здесь только голые await-ы без логики. */
	const api = {

		async permission_ask() {
			return await Notification.requestPermission()
		},

		async registration() {
			return await navigator.serviceWorker.ready
		},

		async subscription_get( reg: ServiceWorkerRegistration ) {
			return await reg.pushManager.getSubscription()
		},

		async subscription_make( reg: ServiceWorkerRegistration, key: Uint8Array< ArrayBuffer > ) {
			return await reg.pushManager.subscribe( {
				userVisibleOnly: true,
				applicationServerKey: key,
			} )
		},

		async subscription_drop( sub: PushSubscription ) {
			return await sub.unsubscribe()
		},

	}

	/** Ключ демона приезжает в base64url, а браузер ждёт сырые байты. */
	function key_bytes( key: string ) {
		const tail = '='.repeat( ( 4 - key.length % 4 ) % 4 )
		const raw = atob( ( key + tail ).replace( /-/g, '+' ).replace( /_/g, '/' ) )
		const bytes = new Uint8Array( raw.length )
		for( let i = 0; i < raw.length; ++ i ) bytes[ i ] = raw.charCodeAt( i )
		return bytes
	}

	/** Клиент пуш-демона: подписка браузера плюс её регистрация на сервере.
	 * Демон держит endpoint у себя, а не в ленде: в публичном ленде ключи
	 * подписки означали бы, что слать пуши может любой прохожий. */
	export class $bog_gram_notify extends $mol_object {

		static base = 'https://push.91-188-212-151.ip.giper.dev'

		/** По http воркер не регистрируется, а ожидание готового так и висит:
		 * лучше честно сказать «не поддерживается», чем подвесить кнопку. */
		static supported() {
			if( typeof window === 'undefined' ) return false
			if( typeof navigator === 'undefined' ) return false
			if( location.protocol !== 'https:' && location.hostname !== 'localhost' ) return false
			return 'serviceWorker' in navigator
				&& 'PushManager' in window
				&& 'Notification' in window
		}

		static permission(): NotificationPermission {
			if( typeof Notification === 'undefined' ) return 'default'
			return Notification.permission
		}

		/** Тело POST-ов шлём без заголовка типа: строка уходит как text/plain,
		 * это простой CORS-запрос без preflight, а демон всё равно парсит JSON. */
		static send( path: string, body: object ) {
			return this.$.$mol_fetch.success( this.base + path, {
				method: 'POST',
				body: JSON.stringify( body ),
			} )
		}

		/** Разрешение, подписка в браузере и отправка её демону. Наружу не роняем:
		 * при отказе кнопка в настройках просто останется выключенной. */
		@ $mol_action
		static subscribe( lord: string, monitor: string ) {
			try {

				if( !lord || !monitor ) return false
				if( !this.supported() ) return false

				if( $mol_wire_sync( api ).permission_ask() !== 'granted' ) return false

				const reg = $mol_wire_sync( api ).registration()

				// Ключ мог смениться вместе с томом демона, поэтому не кэшируем
				const answer = this.$.$mol_fetch.json( this.base + '/push/key', {
					cache: 'no-store',
				} ) as { key?: string } | null

				const key = answer?.key
				if( !key ) return false

				// Старая подписка могла быть выпущена под другой ключ: обновить
				// такую браузер не даст, поэтому сперва снимаем её целиком
				const stale = $mol_wire_sync( api ).subscription_get( reg )
				if( stale ) $mol_wire_sync( api ).subscription_drop( stale )

				const sub = $mol_wire_sync( api ).subscription_make( reg, key_bytes( key ) )

				this.send( '/push/subscribe', {
					lord,
					monitor,
					subscription: sub.toJSON(),
				} )

				return true

			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				$mol_fail_log( error )
				return false
			}
		}

		/** Снимаем подписку с обеих сторон. Браузерная может уже не существовать —
		 * это не повод не сказать демону, что слать больше некому. */
		@ $mol_action
		static unsubscribe( lord: string ) {
			try {

				if( this.supported() ) {
					const reg = $mol_wire_sync( api ).registration()
					const sub = $mol_wire_sync( api ).subscription_get( reg )
					if( sub ) $mol_wire_sync( api ).subscription_drop( sub )
				}

				if( lord ) this.send( '/push/unsubscribe', { lord } )

				return true

			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				$mol_fail_log( error )
				return false
			}
		}

	}

}
