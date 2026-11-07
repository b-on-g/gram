namespace $.$$ {

	export class $bog_gram_call_card extends $.$bog_gram_call_card {

		override count_text() {
			const count = this.Room().seats_alive().length
			if( !count ) return this.count_none()
			return this.count_some().replace( '{count}', String( count ) )
		}

	}

}
