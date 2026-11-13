namespace $ {

	type $bog_gram_mine_schema = {
		Unit: {
			Key: [ land: string, path: string ]
			Doc: [ ArrayBuffer ]
			Indexes: {}
		}
		Ball: {
			Key: [ land: string, path: string ]
			Doc: [ ArrayBuffer ]
			Indexes: {}
		}
	}

	/**
	 * Gram больше не держит своё хранилище: юниты лежат в общей базе домена, той
	 * же, что у Music. Здесь только разовый перенос из старой базы
	 * `bog_gram_mine`, чтобы после смены аккаунта не пришлось заново качать
	 * историю с мастеров.
	 */
	export class $bog_gram_mine extends $mol_object {

		static old_name = 'bog_gram_mine'

		static async old_exists() {
			const databases = await indexedDB.databases?.()
			if( !databases ) return false
			return databases.some( db => db.name === this.old_name )
		}

		static async copy() {

			if( typeof indexedDB === 'undefined' ) return false
			if( !await this.old_exists() ) return false

			const old = await this.$.$mol_db< $bog_gram_mine_schema >( this.old_name )

			const units = await old.read( 'Unit' ).Unit.select()
			if( !units.length ) {
				old.destructor()
				return false
			}
			const balls = await old.read( 'Ball' ).Ball.select()
			old.destructor()

			const next = await this.$.$giper_baza_mine_idb.db()
			if( await next.read( 'Unit' ).Unit.count() ) return false

			const change = next.change( 'Unit', 'Ball' )

			try {
				const { Unit, Ball } = change.stores
				for( const unit of units ) await Unit.put( unit )
				for( const ball of balls ) await Ball.put( ball )
				await change.commit()
			} catch( error ) {
				change.abort()
				throw error
			}

			const drop = await this.$.$mol_db< $bog_gram_mine_schema >( this.old_name )
			await drop.kill()

			return true
		}

	}

	$bog_gram_mine.copy().catch( error => {
		$$.$mol_log3_warn({
			place: '$bog_gram_mine.copy()',
			message: 'Не удалось перенести старую базу',
			hint: 'Старая база осталась как есть, База перекачает историю с мастеров',
		})
	})

}
