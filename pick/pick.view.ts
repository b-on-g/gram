namespace $.$$ {

	export class $bog_gram_pick extends $.$bog_gram_pick {

		override rows() {
			return [
				... this.saved() ? [ this.Saved_row() ] : [],
				... this.ids().filter( id => id !== this.saved() ).map( id => this.Row( id ) ),
			]
		}

		override saved_pick( next?: any ) {
			return this.pick( this.saved(), next )
		}

		override Error() {
			return this.error() ? super.Error() : null!
		}

	}

}
