namespace $.$$ {

	export class $bog_gram_tasks extends $.$bog_gram_tasks {

		@ $mol_mem
		override rows() {
			const ids = this.ids()
			return [
				... ids.filter( id => !this.done( id ) ),
				... ids.filter( id => this.done( id ) ).reverse(),
			].map( id => this.Row( id ) )
		}

	}

}
