namespace $.$$ {

	export class $bog_gram_demo_call extends $.$bog_gram_demo_call {

		land_id( next?: string ) {
			return this.$.$mol_state_arg.value( 'call', next ) ?? ''
		}

		override land() {
			const id = this.land_id()
			if( !id ) return null
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( id ) )
		}

		@ $mol_mem
		opened( next?: boolean ) {
			return next ?? false
		}

		override pages() {
			return [
				this.Start(),
				... this.opened() && this.land() ? [ this.Call() ] : [],
			]
		}

		override start_rows() {
			return [
				this.Name(),
				this.Create(),
				... this.land() ? [ this.Card(), this.Share() ] : [],
			]
		}

		override name( next?: string ) {
			return this.$.$mol_state_local.value( 'bog_gram_demo_call_name', next ) ?? ''
		}

		override share_link() {
			const id = this.land_id()
			if( !id ) return ''
			return `${ location.origin }${ location.pathname }#!call=${ id }`
		}

		override create() {
			$mol_wire_async( this ).create_in_fiber()
		}

		create_in_fiber() {
			const land = this.$.$bog_gram_call_room.grab( null )
			this.land_id( land.link().str )
			this.opened( true )
		}

		override open() {
			this.opened( true )
		}

		override close() {
			this.opened( false )
		}

	}

}
