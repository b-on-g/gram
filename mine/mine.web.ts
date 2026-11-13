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
			return this.migrated ??= this.run().catch( ()=> {
				$$.$mol_log3_warn({
					place: '$bog_gram_mine.migrate()',
					message: 'Не удалось перенести старую базу',
					hint: 'Старая база осталась как есть, База перекачает историю с мастеров',
				})
				return false
			})
		}

		static async run() {

			const next = await this.$.$giper_baza_mine_idb.db()
			await $bog_gram_mine.clean( next )

			if( !await $bog_gram_mine.old_exists() ) return false

			const old = await this.$.$mol_db< $bog_gram_mine_schema >( $bog_gram_mine.old_name )

			try {
				return Boolean( await $bog_gram_mine.copy( old, next ) )
			} finally {
				old.destructor()
			}

		}

	}

	$.$giper_baza_mine_idb = $bog_gram_mine_web
	$.$giper_baza_mine = $bog_gram_mine_web

	$bog_gram_mine_web.migrate()

}
