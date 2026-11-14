namespace $.$$ {

	export class $bog_gram_settings extends $.$bog_gram_settings {

		override follow( next?: string ) {
			if( next && this.$.$bog_gram_follow.go( next ) ) this.close( null )
			return ''
		}

		override paste_open() {

			if( !this.$.$bog_gram_follow.go( this.paste_uri().trim() ) ) {
				this.paste_error( this.link_unknown() )
				return null
			}

			this.paste_uri( '' )
			this.paste_error( '' )
			this.close( null )

			return null
		}

		override paste_uri( next?: string ) {
			if( next !== undefined ) this.paste_error( '' )
			return super.paste_uri( next )
		}

		override Paste_error() {
			return this.paste_error() ? super.Paste_error() : null!
		}

		override version() {
			return $bog_gram_version
		}

		override install_content() {
			return [ this.Install().Install_button(), this.Lang() ]
		}

		override Notify_toggle() {
			return this.notify_supported() ? super.Notify_toggle() : null!
		}

		override Registry_join( id: string ) {
			return this.registry_joined( id ) ? null! : super.Registry_join( id )
		}

		@ $mol_mem
		override registry_rows() {
			return this.registry_ids().map( id => this.Registry_row( id ) )
		}

		@ $mol_mem
		override registry_content() {
			if( !this.registry_ids().length ) return [ this.Registry_empty(), this.Registry_form() ]
			return [
				this.Registry_list(),
				this.Registry_note(),
				... this.registry_active() ? [ this.Registry_share() ] : [],
				this.Registry_form(),
			]
		}

	}

}
