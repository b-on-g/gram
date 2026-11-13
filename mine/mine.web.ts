namespace $ {

	/**
	 * Браузерная часть: штатное хранилище Базы плюс разовый перенос из старой
	 * грамовской базы.
	 *
	 * Перенос идёт в фоне и чтение не задерживает. Гейт на чтении опасен: если
	 * транзакция почему-то не закроется, промис не разрешится, и `$mol_action`
	 * подвесит рендер навсегда — приложение так и будет висеть на «Загружаем
	 * данные аккаунта…». А без гейта худшее, что случится, — База прочитает кеш
	 * до переноса и докачает недостающее с мастеров, как на новом устройстве.
	 *
	 * Старую базу после копирования не удаляем: она маленькая и служит резервной
	 * копией.
	 */
	export class $bog_gram_mine_web extends $giper_baza_mine_idb {

		static migrated = null as Promise< boolean > | null

		/** Перенос запускается один раз на всю страницу. */
		static migrate() {
			return this.migrated ??= this.run().catch( error => {
				console.error( '[bog_gram/mine] migrate: упало', error )
				$$.$mol_log3_warn({
					place: '$bog_gram_mine.migrate()',
					message: 'Не удалось перенести старую базу',
					hint: 'Старая база осталась как есть, База перекачает историю с мастеров',
				})
				return false
			})
		}

		static async run() {

			console.log( '[bog_gram/mine] run: старт' )

			const next = await this.$.$giper_baza_mine_idb.db()
			console.log( '[bog_gram/mine] run: общая база открыта, версия', next.version )

			const junk = await $bog_gram_mine.clean( next )
			console.log( '[bog_gram/mine] run: вычищено мусорных записей =', junk )

			const exists = await $bog_gram_mine.old_exists()
			console.log( '[bog_gram/mine] run: старая база', $bog_gram_mine.old_name, 'есть =', exists )
			if( !exists ) {
				console.log( '[bog_gram/mine] run: переносить нечего' )
				return false
			}

			const old = await this.$.$mol_db< $bog_gram_mine_schema >( $bog_gram_mine.old_name )
			console.log( '[bog_gram/mine] run: старая база открыта, версия', old.version )

			try {
				const units = await $bog_gram_mine.dump( old, 'Unit' )
				const balls = await $bog_gram_mine.dump( old, 'Ball' )
				console.log( '[bog_gram/mine] run: в старой базе юнитов =', units.length,
					'болов =', balls.length,
					'пример ключа =', units[ 0 ]?.[ 0 ] )
				const copied = await $bog_gram_mine.copy( old, next )
				console.log( '[bog_gram/mine] run: перенесено юнитов =', copied )
				return Boolean( copied )
			} finally {
				old.destructor()
			}
		}

		/** Логируем, какой ленд читается из локальной базы. */
		@ $mol_action
		override units_load() {
			console.log( '[bog_gram/mine] units_load: ленд', this.land().str )
			return super.units_load()
		}

	}

	$.$giper_baza_mine_idb = $bog_gram_mine_web
	$.$giper_baza_mine = $bog_gram_mine_web

	console.log( '[bog_gram/mine] модуль загружен, запускаю перенос' )
	try {
		$.$mol_dom_context.indexedDB?.databases?.().then(
			list => console.log( '[bog_gram/mine] базы IndexedDB:', list.map( db => `${ db.name } v${ db.version }` ) ),
			error => console.error( '[bog_gram/mine] не смог перечислить базы', error ),
		)
	} catch( error ) {
		console.error( '[bog_gram/mine] не смог перечислить базы', error )
	}
	$bog_gram_mine_web.migrate().then(
		done => console.log( '[bog_gram/mine] migrate завершился =', done ),
	)

}
