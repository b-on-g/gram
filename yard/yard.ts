namespace $ {

	export class $bog_gram_yard extends $giper_baza_yard {

		static stagger = 300 // ms

		port_make( socket: WebSocket, link: string ) {

			const port = new $mol_rest_port_ws_std
			port.socket = socket

			socket.onmessage = async( event )=> {

				if( event.data instanceof ArrayBuffer ) {
					if( !event.data.byteLength ) return
					await $mol_wire_async( this ).port_income( port, new Uint8Array( event.data ) )
					return
				}

				this.$.$mol_log3_fail({
					place: this,
					message: 'Wrong data',
					data: event.data,
				})

			}

			const beat = setInterval( ()=> socket.send( new Uint8Array ), 30000 )

			socket.onclose = ()=> {
				clearInterval( beat )
				setTimeout( ()=> this.reconnects( null ), 1000 )
			}

			port.destructor = ()=> {
				socket.onclose = ()=> {}
				clearInterval( beat )
				socket.close()
			}

			this.$.$mol_log3_come({
				place: this,
				message: 'Connected',
				port: $mol_key( port ),
				server: link,
			})

			return port
		}

		@ $mol_mem
		override master() {

			this.reconnects()

			const links = this.$.$giper_baza_yard.masters()
			if( !links.length ) return null

			const first = ( $mol_wire_probe( ()=> this.master_cursor() ) ?? 0 ) % links.length
			const order = links.map( ( _, index )=> ( first + index ) % links.length )

			const sockets = new Map< number, WebSocket >()
			const timers = new Set< any >()
			let won = false
			let started = 0
			let failed = 0

			const stop = ( keep?: number )=> {
				for( const timer of timers ) clearTimeout( timer )
				timers.clear()
				for( const [ index, socket ] of sockets ) {
					if( index === keep ) continue
					socket.onopen = null
					socket.onerror = null
					socket.onclose = null
					socket.close()
				}
			}

			const promise = new Promise< $mol_rest_port >( done => {

				const next = ()=> {

					if( won || started >= order.length ) return

					const index = order[ started ++ ]
					const link = links[ index ]

					const socket = new this.$.$mol_dom_context.WebSocket( link.replace( /^http/, 'ws' ), [ '$giper_baza_yard_2' ] )
					socket.binaryType = 'arraybuffer'
					sockets.set( index, socket )

					socket.onopen = ()=> {
						if( won ) return
						won = true
						stop( index )
						socket.onerror = null
						this.master_cursor( index )
						done( this.port_make( socket, link ) )
					}

					socket.onerror = ()=> {

						socket.onopen = null
						socket.onerror = null
						if( won ) return

						if( ++ failed >= order.length ) {
							timers.add( setTimeout( ()=> this.reconnects( null ), 1000 ) )
							return
						}

						next()
					}

					if( started < order.length ) timers.add( setTimeout( next, ( this.constructor as typeof $bog_gram_yard ).stagger ) )

				}

				next()

			} )

			return Object.assign( promise, { destructor: ()=> { if( !won ) stop() } } ) as any as $mol_rest_port
		}

	}

}
