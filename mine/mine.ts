namespace $ {

	export type $bog_gram_mine_schema = {
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
	 * Перенос старой грамовской базы `bog_gram_mine` в общую `$giper_baza_mine`.
	 *
	 * Gram больше не держит своё хранилище: юниты лежат в общей базе домена, той
	 * же, что у Music. Перенос нужен, чтобы после смены аккаунта не качать
	 * историю заново с мастеров.
	 *
	 * Соединения приходят снаружи, поэтому это проверяется тестом без браузера.
	 * Важно: внутри одной транзакции запросы ставятся подряд, без `await` —
	 * транзакция IndexedDB закрывается, как только управление отдаётся событийному
	 * циклу, и следующий запрос упал бы, а `commit()` повис бы навсегда.
	 */
	export class $bog_gram_mine extends $mol_object {

		static old_name = 'bog_gram_mine'

		static async old_exists() {
			const databases = await this.$.$mol_dom_context.indexedDB?.databases?.()
			if( !databases ) return false
			return databases.some( db => db.name === this.old_name )
		}

		/** Ключ, по которому База найдёт запись: пара «ленд — путь». */
		static key_ok( key: IDBValidKey ) {
			return Array.isArray( key )
				&& key.length === 2
				&& typeof key[ 0 ] === 'string'
				&& typeof key[ 1 ] === 'string'
		}

		/**
		 * Достаёт пары «ключ — запись» из стора целиком. Ключ обязателен: стор
		 * заведён без `keyPath`, с автоинкрементом, так что `put` без ключа выдал
		 * бы записям новые числовые ключи, а База ищет их по `[ land, path ]`.
		 * `getAll` и `getAllKeys` обходят стор в одном порядке, поэтому пары
		 * складываются один к одному.
		 */
		static async dump< Name extends keyof $bog_gram_mine_schema >(
			db: $mol_db_database< $bog_gram_mine_schema >,
			name: Name,
		) {
			const store = db.read( name )[ name ]!
			const [ docs, keys ] = await Promise.all([
				$mol_db_response( store.native.getAll() as IDBRequest< $bog_gram_mine_schema[ Name ][ 'Doc' ][] > ),
				$mol_db_response( store.native.getAllKeys() as unknown as IDBRequest< $bog_gram_mine_schema[ Name ][ 'Key' ][] > ),
			])
			console.log( '[bog_gram/mine] dump', name, ': записей =', docs.length, 'ключей =', keys.length )
			return keys.map( ( key, i )=> [ key, docs[ i ] ] as const )
		}

		/**
		 * Копирует старое хранилище в общее, сохраняя прежние ключи. Возвращает
		 * число перенесённых юнитов: ноль значит, что переносить было нечего.
		 *
		 * Запросы внутри транзакции ставятся подряд, без `await` между ними:
		 * транзакция IndexedDB закрывается, как только управление отдаётся
		 * событийному циклу, и следующий запрос упал бы, а `commit()` — повис
		 * навсегда. Ждём только завершения транзакции.
		 */
		static async copy(
			old: $mol_db_database< $bog_gram_mine_schema >,
			next: $mol_db_database< $bog_gram_mine_schema >,
		) {

			const units = await this.dump( old, 'Unit' )
			const balls = await this.dump( old, 'Ball' )

			if( !units.length ) {
				console.log( '[bog_gram/mine] copy: юнитов нет, копировать нечего' )
				return 0
			}

			const change = next.change( 'Unit', 'Ball' )
			console.log( '[bog_gram/mine] copy: кладу юнитов =', units.length, 'болов =', balls.length )

			try {
				const { Unit, Ball } = change.stores
				for( const [ key, doc ] of units ) Unit.put( doc, key )
				for( const [ key, doc ] of balls ) Ball.put( doc, key )
				console.log( '[bog_gram/mine] copy: запросы отправлены, жду commit' )
				await change.commit()
				console.log( '[bog_gram/mine] copy: commit прошёл' )
			} catch( error ) {
				console.error( '[bog_gram/mine] copy: ошибка транзакции', error )
				change.abort()
				throw error
			}

			return units.length
		}

		/**
		 * Выкидывает записи, у которых ключ не `[ land, path ]`. Такие остались от
		 * первой версии переноса, писавшей без ключей: лежат под числовыми ключами
		 * вперемешку с лендами, разложить их обратно нечем, и База их всё равно не
		 * найдёт. Это кеш — настоящие данные живут на мастерах.
		 */
		static async clean( db: $mol_db_database< $bog_gram_mine_schema > ) {

			const junk = [] as [ 'Unit' | 'Ball', IDBValidKey ][]

			for( const name of [ 'Unit', 'Ball' ] as const ) {
				const store = db.read( name )[ name ]!
				const keys = await $mol_db_response(
					store.native.getAllKeys() as IDBRequest< IDBValidKey[] >
				)
				for( const key of keys ) {
					if( this.key_ok( key ) ) continue
					junk.push([ name, key ])
				}
			}

			if( !junk.length ) {
				console.log( '[bog_gram/mine] clean: мусора нет' )
				return 0
			}

			console.log( '[bog_gram/mine] clean: мусорных записей =', junk.length, 'пример ключа =', junk[0]?.[1] )

			const change = db.change( 'Unit', 'Ball' )

			try {
				for( const [ name, key ] of junk ) change.stores[ name ]!.drop( key as any )
				await change.commit()
				console.log( '[bog_gram/mine] clean: commit прошёл' )
			} catch( error ) {
				console.error( '[bog_gram/mine] clean: ошибка транзакции', error )
				change.abort()
				throw error
			}

			return junk.length
		}

	}

}
