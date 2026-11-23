namespace $ {

	export type $bog_gram_mic_devices = Pick< MediaDevices, 'getUserMedia' | 'enumerateDevices' >

	export class $bog_gram_mic extends $mol_object {

		static raw: MediaTrackConstraints = { echoCancellation: false, noiseSuppression: false, autoGainControl: false }

		static refused( error: unknown ) {
			return [ 'NotAllowedError', 'SecurityError' ].includes( ( error as Error )?.name )
		}

		static async open( devices: $bog_gram_mic_devices, wanted: MediaTrackConstraints | boolean ) {

			let failure: unknown

			const attempt = async( audio: MediaTrackConstraints | boolean )=> {
				try {
					return await devices.getUserMedia({ audio })
				} catch( error ) {
					failure = error
					return null
				}
			}

			for( const audio of [ wanted, this.raw ] ) {
				const stream = await attempt( audio )
				if( stream ) return stream
				if( this.refused( failure ) ) throw failure
			}

			const list = await devices.enumerateDevices().catch( ()=> [] as MediaDeviceInfo[] )

			for( const { kind, deviceId } of list ) {
				if( kind !== 'audioinput' || !deviceId || deviceId === 'default' ) continue
				const stream = await attempt({ deviceId: { exact: deviceId } })
				if( stream ) return stream
				if( this.refused( failure ) ) throw failure
			}

			throw failure
		}

		static async open_both( devices: $bog_gram_mic_devices, audio: MediaTrackConstraints | boolean, video: MediaTrackConstraints ) {

			try {
				return { stream: await devices.getUserMedia({ audio, video }), errors: {} as { audio?: unknown, video?: unknown } }
			} catch {}

			const tracks = [] as MediaStreamTrack[]
			const errors = {} as { audio?: unknown, video?: unknown }

			try {
				tracks.push( ... ( await this.open( devices, audio ) ).getTracks() )
			} catch( error ) {
				errors.audio = error
			}

			try {
				tracks.push( ... ( await devices.getUserMedia({ video }) ).getTracks() )
			} catch( error ) {
				errors.video = error
			}

			return { stream: new $mol_dom_context.MediaStream( tracks ), errors }
		}

	}

}
