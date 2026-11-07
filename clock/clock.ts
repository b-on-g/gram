namespace $ {

	const day = 24 * 60 * 60 * 1000

	export class $bog_gram_clock extends $mol_object {

		static day_key( moment: number ) {
			if( !moment ) return ''
			return new Date( moment ).toDateString()
		}

		static day_title( key: string ) {
			if( !key ) return ''
			const now = new Date()
			if( key === now.toDateString() ) return 'Сегодня'
			if( key === new Date( now.getTime() - day ).toDateString() ) return 'Вчера'
			return new Date( key ).toLocaleDateString( 'ru' )
		}

		static time( moment: number ) {
			const date = new Date( moment )
			return String( date.getHours() ).padStart( 2, '0' ) + ':' + String( date.getMinutes() ).padStart( 2, '0' )
		}

		static brief( moment: number ) {
			if( !moment ) return ''
			const date = new Date( moment )
			if( date.toDateString() === new Date().toDateString() ) return this.time( moment )
			return String( date.getDate() ).padStart( 2, '0' ) + '.' + String( date.getMonth() + 1 ).padStart( 2, '0' )
		}

	}

}
