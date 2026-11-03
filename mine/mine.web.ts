namespace $ {

	// Отдельная IDB-база для этого приложения, чтобы не конфликтовать
	// с хранилищами других сборок Гипер Базы на том же origin.
	export class $bog_gram_mine extends $giper_baza_mine_idb {

		@ $mol_memo.method
		static override async db() {

			return await this.$.$mol_db<{

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

			}>( 'bog_gram_mine',
				mig => mig.store_make( 'Unit' ),
				mig => mig.store_make( 'Ball' ),
			)

		}

	}

	$.$giper_baza_mine = $bog_gram_mine
	$.$giper_baza_mine_idb = $bog_gram_mine

}
