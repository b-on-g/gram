namespace $ {

	export type $bog_gram_clip_read = {
		bytes: Uint8Array< ArrayBuffer >
		type: string
		width: number
		height: number
	}

	export class $bog_gram_clip extends $mol_object {

		static lib = 'https://cdn.jsdelivr.net/npm/mediabunny@1.66.0/+esm'

		static limit = 20 * 2 ** 20

		static source_limit = 500 * 2 ** 20

		static side = 480

		static video_rate = 800_000

		static audio_rate = 64_000

		static video_is( file: File ) {
			if( file.type.startsWith( 'video/' ) ) return true
			return /\.(mp4|m4v|mov|webm|mkv|3gp)$/i.test( file.name )
		}

		static type_of( file: File ) {
			if( file.type ) return file.type
			if( /\.webm$/i.test( file.name ) ) return 'video/webm'
			if( /\.mov$/i.test( file.name ) ) return 'video/quicktime'
			return 'video/mp4'
		}

		static fit( width: number, height: number ) {
			const short = Math.min( width, height )
			const scale = short > this.side ? this.side / short : 1
			const even = ( side: number )=> Math.max( 2, Math.round( side * scale / 2 ) * 2 )
			return { width: even( width ), height: even( height ) }
		}

		static input( lib: any, file: Blob ) {
			return new lib.Input({ source: new lib.BlobSource( file ), formats: lib.ALL_FORMATS })
		}

		static async size( file: Blob ) {
			try {
				const lib = await this.$.$mol_import.module_async( this.lib )
				const track = await this.input( lib, file ).getPrimaryVideoTrack()
				if( !track ) return { width: 0, height: 0 }
				return { width: await track.getDisplayWidth() as number, height: await track.getDisplayHeight() as number }
			} catch( error ) {
				$mol_fail_log( error )
				return { width: 0, height: 0 }
			}
		}

		static async squeeze( file: File, progress?: ( done: number )=> void ): Promise< Blob | null > {

			if( typeof VideoEncoder === 'undefined' ) return null

			const lib = await this.$.$mol_import.module_async( this.lib )

			const input = this.input( lib, file )
			const target = new lib.BufferTarget()
			const output = new lib.Output({ format: new lib.Mp4OutputFormat({ fastStart: 'in-memory' }), target })

			const conversion = await lib.Conversion.init({
				input,
				output,
				video: async ( track: any )=> ({
					... this.fit( await track.getDisplayWidth(), await track.getDisplayHeight() ),
					fit: 'fill',
					codec: 'avc',
					bitrate: this.video_rate,
					forceTranscode: true,
				}),
				audio: {
					bitrate: this.audio_rate,
				},
			})

			const broken = [ 'unknown_source_codec', 'undecodable_source_codec', 'no_encodable_target_codec' ]
			const lost = ( conversion.discardedTracks as { reason: string }[] ).filter( one => broken.includes( one.reason ) )
			if( !conversion.isValid || lost.length ) return null

			if( progress ) conversion.onProgress = progress
			await conversion.execute()

			const buffer = target.buffer as ArrayBuffer | null
			return buffer ? new Blob( [ buffer ], { type: 'video/mp4' } ) : null
		}

		static async read( file: File, progress?: ( done: number )=> void ): Promise< $bog_gram_clip_read > {

			const squeezed = await this.squeeze( file, progress ).catch( error => {
				$mol_fail_log( error )
				return null
			} )

			const blob = squeezed && squeezed.size < file.size ? squeezed : file
			const type = blob === file ? this.type_of( file ) : 'video/mp4'

			const [ buffer, size ] = await Promise.all([ blob.arrayBuffer(), this.size( blob ) ])
			return { bytes: new Uint8Array( buffer ), type, ... size }
		}

	}

}
