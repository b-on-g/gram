namespace $ {

	const day = 24 * 60 * 60 * 1000

	export function $bog_gram_clock_day_title( this: $, key: string ) {

		if( !key ) return ''

		const now = new Date()
		const text = this.$bog_gram_text.make({ $: this })

		if( key === now.toDateString() ) return text.clock_today()
		if( key === new Date( now.getTime() - day ).toDateString() ) return text.clock_yesterday()

		return new Date( key ).toLocaleDateString( this.$mol_locale.lang() )
	}

	export class $bog_gram_clock extends $mol_object {

		static day_key( moment: number ) {
			if( !moment ) return ''
			return new Date( moment ).toDateString()
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
