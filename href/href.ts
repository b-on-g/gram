namespace $ {

	export class $bog_gram_href extends $mol_object {

		blob(): Blob | null {
			return null
		}

		made = ''

		url() {
			const blob = this.blob()
			if( !blob ) return ''
			return this.made ||= this.$.$mol_dom_context.URL.createObjectURL( blob )
		}

		override destructor() {
			if( this.made ) this.$.$mol_dom_context.URL.revokeObjectURL( this.made )
			this.made = ''
			super.destructor()
		}

	}

}
