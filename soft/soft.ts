namespace $ {

	export function $bog_gram_soft< Result >( task: ()=> Result, fallback: Result ): Result {
		try {
			return task()
		} catch( error ) {
			if( !$mol_promise_like( error ) ) $mol_fail_log( error )
			return fallback
		}
	}

}
