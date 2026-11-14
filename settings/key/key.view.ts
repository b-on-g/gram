namespace $.$$ {

	export class $bog_gram_settings_key extends $.$bog_gram_settings_key {

		override text() {
			const auth = this.$.$giper_baza_auth.current()
			return auth.toString() + auth.toStringPrivate()
		}

		override blob() {
			return new Blob( [ this.text() ], { type: 'text/plain' } )
		}

		@ $mol_mem
		shown( next?: boolean ) {
			return next ?? false
		}

		override toggle_label() {
			return this.shown() ? this.toggle_hide() : this.toggle_show()
		}

		@ $mol_action
		override toggle( next?: any ) {
			this.shown( !this.shown() )
			return null
		}

		@ $mol_mem
		override rows() {
			if( !this.shown() ) return [ this.Toggle(), this.Import_form() ]
			return [ this.Toggle(), this.Warning(), this.Row(), this.Qr_box(), this.Save(), this.Import_form() ]
		}

		override Error() {
			return this.error() ? super.Error() : null!
		}

		override import_label() {
			return this.armed() ? this.import_sure() : this.import_idle()
		}

		auth_from( str: string ) {
			try {
				const auth = this.$.$giper_baza_auth.from( str )
				return auth.byteLength === 128 ? auth : null
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				return null
			}
		}

		@ $mol_action
		override import( next?: any ) {

			const str = this.input().trim()
			if( !str ) {
				this.error( this.error_empty() )
				return null
			}

			const auth = this.auth_from( str )
			if( !auth ) {
				this.armed( false )
				this.error( this.error_bad() )
				return null
			}

			if( !this.armed() ) {
				this.error( '' )
				this.armed( true )
				return null
			}

			this.notify_on( false )
			this.$.$giper_baza_auth.current( auth )
			this.$.$mol_dom_context.location.reload()

			return null
		}

		override file( next?: readonly File[] ) {
			const file = next?.[ 0 ]
			if( file ) $mol_wire_async( this ).file_read( file )
			return next ?? null
		}

		file_read( file: File ) {
			this.input( $mol_wire_sync( file ).text().trim() )
			this.armed( false )
			this.error( '' )
			return true
		}

		override scanned( next?: string ) {
			if( next === undefined ) return ''
			const str = next.trim()
			this.input( str )
			this.armed( false )
			this.error( this.auth_from( str ) ? '' : this.error_qr() )
			return str
		}

	}

}
