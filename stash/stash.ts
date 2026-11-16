namespace $ {

	export type $bog_gram_stash_part = {
		dialog: string,
		kind: $bog_gram_voice_kind,
		type: string,
		span: number,
		data: Blob,
	}

	export type $bog_gram_stash_left = {
		dialog: string,
		kind: $bog_gram_voice_kind,
		type: string,
		span: number,
		bytes: Uint8Array< ArrayBuffer >,
	}

	type $bog_gram_stash_schema = {
		Parts: {
			Key: number,
			Doc: $bog_gram_stash_part,
			Indexes: {},
		},
	}

	export class $bog_gram_stash extends $mol_object {

		static base = null as Promise< $mol_db_database< $bog_gram_stash_schema > > | null

		static db() {
			return this.base ??= this.$.$mol_db< $bog_gram_stash_schema >( '$bog_gram_stash', mig => mig.store_make( 'Parts' ) )
		}

		static queue = Promise.resolve() as Promise< unknown >

		static task( work: ()=> Promise< unknown > ) {
			const next = this.queue.then( work ).catch( error => $mol_fail_log( error ) )
			this.queue = next
			return next
		}

		static put( part: $bog_gram_stash_part ) {
			return this.task( async ()=> {
				const db = await this.db()
				await db.change( 'Parts' ).stores.Parts.put( part )
			} )
		}

		static clear() {
			return this.task( async ()=> {
				const db = await this.db()
				await db.change( 'Parts' ).stores.Parts.clear()
			} )
		}

		static join( parts: readonly $bog_gram_stash_part[] ) {
			if( !parts.length ) return null
			const last = parts[ parts.length - 1 ]
			return {
				dialog: last.dialog,
				kind: last.kind,
				type: last.type,
				span: last.span,
				blob: new $mol_blob( parts.map( part => part.data ), { type: last.type } ),
			}
		}

		static async left(): Promise< $bog_gram_stash_left | null > {

			await this.queue

			try {

				const db = await this.db()
				const joined = this.join( await db.read( 'Parts' ).Parts.select() )
				if( !joined ) return null

				const bytes = new Uint8Array( await joined.blob.arrayBuffer() )
				return { ... joined, bytes }

			} catch( error ) {
				$mol_fail_log( error )
				return null
			}

		}

	}

}
