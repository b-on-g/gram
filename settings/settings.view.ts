namespace $.$$ {

	export class $bog_gram_settings extends $.$bog_gram_settings {

		override version() {
			return $bog_gram_version
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
