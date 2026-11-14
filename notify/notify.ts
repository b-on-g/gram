namespace $ {

	function proof( action: string, lord: string, monitor: string, endpoint: string, time: number ) {
		return [ 'gram-push', action, lord, monitor, endpoint, String( time ) ].join( '\n' )
	}

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

		async notifications( reg: ServiceWorkerRegistration ) {
			return await reg.getNotifications({ tag: 'gram' })
		},

		async signed( auth: $giper_baza_auth, action: string, lord: string, monitor: string, endpoint: string ) {
			const time = Date.now()
			const data = $mol_charset_encode( proof( action, lord, monitor, endpoint, time ) )
			const sign = new Uint8Array( await auth.signer().sign( data ) )
			return { time, pass: auth.pass().toString(), sign: $mol_base64_url_encode( sign ) }
		},

	}

	function key_bytes( key: string ) {
		const tail = '='.repeat( ( 4 - key.length % 4 ) % 4 )
		const raw = atob( ( key + tail ).replace( /-/g, '+' ).replace( /_/g, '/' ) )
		const bytes = new Uint8Array( raw.length )
		for( let i = 0; i < raw.length; ++ i ) bytes[ i ] = raw.charCodeAt( i )
		return bytes
	}

	function key_same( sub: PushSubscription, bytes: Uint8Array ) {
		const own = sub.options?.applicationServerKey
		if( !own ) return false
		const view = new Uint8Array( own )
		if( view.length !== bytes.length ) return false
		return view.every( ( byte, index )=> byte === bytes[ index ] )
	}

	export class $bog_gram_notify extends $mol_object {

		static base = 'https://push.91-188-212-151.ip.giper.dev'

		static api = api

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
				return $mol_wire_sync( this.api ).permission_ask()
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				$mol_fail_log( error )
				return 'default' as NotificationPermission
			}
		}

		static push_mode( windows: readonly { visibilityState?: string }[], agent: string ): 'show' | 'skip' | 'flash' {

			if( !windows.some( win => win.visibilityState === 'visible' ) ) return 'show'

			const apple = /AppleWebKit/.test( agent ) && !/Chrome|Chromium|Edg|Firefox/.test( agent )
			return apple ? 'flash' : 'skip'
		}

		@ $mol_action
		static clear() {
			try {

				if( !this.supported() ) return 0

				const reg = $mol_wire_sync( this.api ).registration()
				const list = $mol_wire_sync( this.api ).notifications( reg )
				for( const item of list ) item.close()

				return list.length

			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				$mol_fail_log( error )
				return 0
			}
		}

		static proof( action: string, lord: string, monitor: string, endpoint: string, time: number ) {
			return proof( action, lord, monitor, endpoint, time )
		}

		static signed( action: string, lord: string, monitor: string, endpoint: string ) {
			const auth = this.$.$giper_baza_auth.current()
			return $mol_wire_sync( this.api ).signed( auth, action, lord, monitor, endpoint )
		}

		static daemon() {
			return this.$.$mol_fetch.json( this.base + '/push/key', {
				cache: 'no-store',
			} ) as { key?: string, pass?: string } | null
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

				const granted = this.permission() === 'granted' || $mol_wire_sync( this.api ).permission_ask() === 'granted'
				if( !granted ) return false

				const reg = $mol_wire_sync( this.api ).registration()

				const key = this.daemon()?.key
				if( !key ) return false

				const bytes = key_bytes( key )

				const current = $mol_wire_sync( this.api ).subscription_get( reg )
				const same = current && key_same( current, bytes )
				if( current && !same ) $mol_wire_sync( this.api ).subscription_drop( current )

				const sub = same ? current : $mol_wire_sync( this.api ).subscription_make( reg, bytes )

				this.send( '/push/subscribe', {
					lord,
					monitor,
					subscription: sub.toJSON(),
					... this.signed( 'subscribe', lord, monitor, sub.endpoint ),
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
					const reg = $mol_wire_sync( this.api ).registration()
					const sub = $mol_wire_sync( this.api ).subscription_get( reg )
					if( sub ) {
						endpoint = sub.endpoint
						$mol_wire_sync( this.api ).subscription_drop( sub )
					}
				}

				if( lord ) this.send( '/push/unsubscribe', {
					lord,
					endpoint,
					... this.signed( 'unsubscribe', lord, '', endpoint ),
				} )

				return true

			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				$mol_fail_log( error )
				return false
			}
		}

	}

}
