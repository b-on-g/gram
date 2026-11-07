namespace $ {

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

	function key_bytes( key: string ) {
		const tail = '='.repeat( ( 4 - key.length % 4 ) % 4 )
		const raw = atob( ( key + tail ).replace( /-/g, '+' ).replace( /_/g, '/' ) )
		const bytes = new Uint8Array( raw.length )
		for( let i = 0; i < raw.length; ++ i ) bytes[ i ] = raw.charCodeAt( i )
		return bytes
	}

	export class $bog_gram_notify extends $mol_object {

		static base = 'https://push.91-188-212-151.ip.giper.dev'

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

		static activated() {
			if( typeof navigator === 'undefined' ) return false
			const activation = ( navigator as any ).userActivation
			if( !activation ) return true
			return Boolean( activation.isActive )
		}

		@ $mol_action
		static permission_request() {
			try {
				if( !this.supported() ) return 'denied' as NotificationPermission
				return $mol_wire_sync( api ).permission_ask()
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				$mol_fail_log( error )
				return 'default' as NotificationPermission
			}
		}

		static send( path: string, body: object ) {
			return this.$.$mol_fetch.success( this.base + path, {
				method: 'POST',
				body: JSON.stringify( body ),
			} )
		}

		@ $mol_action
		static subscribe( lord: string, monitor: string ) {
			try {

				if( !lord || !monitor ) return false
				if( !this.supported() ) return false

				if( $mol_wire_sync( api ).permission_ask() !== 'granted' ) return false

				const reg = $mol_wire_sync( api ).registration()

				const answer = this.$.$mol_fetch.json( this.base + '/push/key', {
					cache: 'no-store',
				} ) as { key?: string } | null

				const key = answer?.key
				if( !key ) return false

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

		@ $mol_action
		static unsubscribe( lord: string ) {
			try {

				let endpoint = ''

				if( this.supported() ) {
					const reg = $mol_wire_sync( api ).registration()
					const sub = $mol_wire_sync( api ).subscription_get( reg )
					if( sub ) {
						endpoint = sub.endpoint
						$mol_wire_sync( api ).subscription_drop( sub )
					}
				}

				if( lord ) this.send( '/push/unsubscribe', { lord, endpoint } )

				return true

			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				$mol_fail_log( error )
				return false
			}
		}

	}

}
