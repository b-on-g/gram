namespace $ {

	export class $bog_gram_react extends $mol_object {

		static kinds: readonly string[] = [ '👍', '❤️', '😂', '😮', '😢', '🔥' ]

		static shown( all: readonly string[] ) {
			return this.kinds.filter( kind => all.includes( kind ) )
		}

		static count( all: readonly string[], kind: string ) {
			return all.filter( item => item === kind ).length
		}

		static list( message: $bog_gram_message | null ) {
			const store = message?.Reactions()
			if( !store ) return [] as string[]
			return store.keys()
				.map( lord => String( store.key( lord )?.val() ?? '' ) )
				.filter( kind => this.kinds.includes( kind ) )
		}

		static mine( message: $bog_gram_message | null, lord: string ) {
			return String( message?.Reactions()?.key( lord )?.val() ?? '' )
		}

		static put( message: $bog_gram_message, lord: string, kind: string ) {
			message.Reactions( 'auto' )?.key( lord, 'auto' )?.val( kind )
		}

	}

}
