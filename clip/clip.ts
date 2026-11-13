namespace $ {

	export class $bog_gram_clip extends $mol_object {

		static limit = 20 * 2 ** 20

		static wait = 3000

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

		static size( file: Blob ) {

			return new Promise< { width: number, height: number } >( done => {

				const dom = this.$.$mol_dom_context
				const video = dom.document.createElement( 'video' )
				const uri = dom.URL.createObjectURL( file )

				const finish = ( width: number, height: number )=> {
					clearTimeout( timer )
					video.removeAttribute( 'src' )
					dom.URL.revokeObjectURL( uri )
					done({ width, height })
				}

				const timer = setTimeout( ()=> finish( 0, 0 ), this.wait )

				video.preload = 'metadata'
				video.muted = true
				video.onloadedmetadata = ()=> finish( video.videoWidth, video.videoHeight )
				video.onerror = ()=> finish( 0, 0 )
				video.src = uri

			} )

		}

		static async read( file: File ) {
			const [ buffer, size ] = await Promise.all([ file.arrayBuffer(), this.size( file ) ])
			return { bytes: new Uint8Array( buffer ), type: this.type_of( file ), ... size }
		}

	}

}
