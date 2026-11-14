namespace $.$$ {

	export class $bog_gram_group extends $.$bog_gram_group {

		override person( lord: string ) {
			return lord
		}

		override tint( lord: string ) {
			return $bog_gram_lord.tint( lord )
		}

		@ $mol_mem_key
		override picked_is( lord: string ) {
			return this.picked().includes( lord )
		}

		override Pick_mark( lord: string ) {
			return this.picked_is( lord ) ? super.Pick_mark( lord ) : null!
		}

		@ $mol_mem
		override pick_rows() {
			return this.contact_lords().map( lord => this.Pick_row( lord ) )
		}

		@ $mol_mem
		override chosen_rows() {
			return this.picked().map( lord => this.Chosen_row( lord ) )
		}

		override chosen_head() {
			const count = this.picked().length
			if( !count ) return this.chosen_none()
			return this.$.$bog_gram_count_people( count )
		}

		override lost_note() {
			const lost = this.lost()
			if( !lost.length ) return ''
			const names = lost.map( lord => this.label( lord ) ).join( ', ' )
			return $bog_gram_text_fill( this.lost_pattern(), { names } )
		}

		override Lost_note() {
			return this.lost().length ? super.Lost_note() : null!
		}

		override make_label() {
			return this.lost().length ? this.make_without() : this.make_group()
		}

		override Id_error() {
			return this.id_error() ? super.Id_error() : null!
		}

	}

}
