namespace $ {

	export type $bog_gram_forward_file = {
		bytes: Uint8Array< ArrayBuffer >
		type: string
	}

	export class $bog_gram_forward extends $mol_object {

		@ $mol_mem
		Text() {
			return this.$.$bog_gram_text.make({ $: this.$ })
		}

		@ $mol_mem
		Account() {
			return this.$.$bog_gram_account.make({ $: this.$ })
		}

		@ $mol_mem
		People() {
			return this.$.$bog_gram_people.make({ $: this.$ })
		}

		@ $mol_mem
		Talk() {
			return this.$.$bog_gram_talk.make({ $: this.$ })
		}

		@ $mol_mem
		error( next?: string ) {
			return next ?? ''
		}

		fail( text: string ) {
			this.error( text )
			return ''
		}

		mates( target: string ) {
			return this.Talk().saved_is( target ) ? [] : this.Talk().mates( target )
		}

		passes( target: string ) {
			const mates = this.mates( target )
			const passes = this.People().passes_of( mates )
			return passes.length < mates.length ? null : passes
		}

		lost( target: string ) {
			return this.mates( target )
				.filter( lord => !this.People().pass_of( lord ) )
				.map( lord => this.People().label( lord ) )
				.join( ', ' )
		}

		file( file: $giper_baza_file | null | undefined ): $bog_gram_forward_file | null {
			if( !file ) return null
			const bytes = file.buffer()
			if( !bytes.byteLength ) return null
			return { bytes, type: file.type() }
		}

		closed( file: $bog_gram_forward_file, passes: readonly $giper_baza_auth_pass[] ) {

			const land = this.$.$giper_baza_glob.land_grab([ [ null, $giper_baza_rank_deny ] ])

			const store = land.Data( $giper_baza_file )
			store.buffer( file.bytes )
			store.type( file.type )

			for( const pass of passes ) land.give( pass, $giper_baza_rank_read )

			land.sync()

			return store
		}

		frames( source: $bog_gram_message ) {

			const shots = source.Shots()?.remote_list() ?? []
			if( shots.length ) return shots.map( shot => ({
				file: shot.Image()?.remote() ?? null,
				width: Number( shot.Width()?.val() ?? 0 ),
				height: Number( shot.Height()?.val() ?? 0 ),
			}) )

			if( !source.Image()?.val() ) return []

			return [ {
				file: source.Image()?.remote() ?? null,
				width: Number( source.Image_width()?.val() ?? 0 ),
				height: Number( source.Image_height()?.val() ?? 0 ),
			} ]
		}

		message( target: string ) {

			const message = this.Talk().session( target )?.Messages( 'auto' )!.make( null )
			if( !message ) return null

			message.Author( 'auto' )?.val( this.Account().my_lord() )
			message.Moment( 'auto' )?.val( Date.now() )

			return message
		}

		@ $mol_action
		copy( source: $bog_gram_message, target: string ) {

			this.error( '' )

			const frames = this.frames( source ).map( frame => ({ ... frame, data: this.file( frame.file ) }) )
			const voice = source.Voice()?.val() ? this.file( source.Voice()?.remote() ) : null
			const video = source.Video()?.val() ? this.file( source.Video()?.remote() ) : null
			const round = source.Round()?.val() ? this.file( source.Round()?.remote() ) : null

			const unloaded = frames.some( frame => !frame.data )
				|| ( Boolean( source.Voice()?.val() ) && !voice )
				|| ( Boolean( source.Video()?.val() ) && !video )
				|| ( Boolean( source.Round()?.val() ) && !round )
			if( unloaded ) return this.fail( this.Text().forward_unloaded() )

			const passes = frames.length || voice || video || round ? this.passes( target ) : []
			if( !passes ) return this.fail( $bog_gram_text_fill( this.Text().forward_lost(), { names: this.lost( target ) } ) )

			const message = this.message( target )
			if( !message ) return ''

			message.Forwarded( 'auto' )?.val( true )

			const text = String( source.Text()?.val() ?? '' )
			if( text ) message.Text( 'auto' )?.val( text )

			if( frames.length ) {

				const stores = frames.map( frame => this.closed( frame.data!, passes ) )

				const shots = message.Shots( 'auto' )!
				frames.forEach( ( frame, index )=> {
					const shot = shots.make( null )
					shot.Image( 'auto' )!.remote( stores[ index ] )
					shot.Width( 'auto' )?.val( frame.width )
					shot.Height( 'auto' )?.val( frame.height )
				} )

				message.Image( 'auto' )!.remote( stores[ 0 ] )
				message.Image_width( 'auto' )?.val( frames[ 0 ].width )
				message.Image_height( 'auto' )?.val( frames[ 0 ].height )

			}

			if( voice ) {
				message.Voice( 'auto' )!.remote( this.closed( voice, passes ) )
				message.Voice_span( 'auto' )?.val( Number( source.Voice_span()?.val() ?? 0 ) )
				const wave = String( source.Voice_wave()?.val() ?? '' )
				if( wave ) message.Voice_wave( 'auto' )?.val( wave )
			}

			if( video ) {
				message.Video( 'auto' )!.remote( this.closed( video, passes ) )
				const width = Number( source.Video_width()?.val() ?? 0 )
				const height = Number( source.Video_height()?.val() ?? 0 )
				if( width && height ) {
					message.Video_width( 'auto' )?.val( width )
					message.Video_height( 'auto' )?.val( height )
				}
			}

			if( round ) {
				message.Round( 'auto' )!.remote( this.closed( round, passes ) )
				message.Round_span( 'auto' )?.val( Number( source.Round_span()?.val() ?? 0 ) )
			}

			const contact = String( source.Contact()?.val() ?? '' )
			if( contact ) {
				message.Contact( 'auto' )?.val( contact )
				const name = String( source.Contact_name()?.val() ?? '' )
				if( name ) message.Contact_name( 'auto' )?.val( name )
			}

			return message.link().str
		}

		@ $mol_action
		contact( lord: string, target: string ) {

			this.error( '' )

			const pass = this.People().pass_of( lord )
			if( !pass ) return this.fail( this.Text().contact_unknown() )

			const message = this.message( target )
			if( !message ) return ''

			message.Contact( 'auto' )?.val( pass.toString() )

			const name = this.People().name( lord )
			if( name ) message.Contact_name( 'auto' )?.val( name )

			return message.link().str
		}

		static contact_lord( pass: string ) {
			try {
				return $giper_baza_auth_pass.from( pass ).lord().str
			} catch {
				return ''
			}
		}

	}

}
