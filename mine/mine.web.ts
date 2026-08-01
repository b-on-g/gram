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

	// Сид пиров (web.baza) может не распарситься текущей сборкой —
	// тогда работаем только по masters_default, не роняя весь синк.
	const masters_base = $giper_baza_yard.masters.bind( $giper_baza_yard )
	$giper_baza_yard.masters = ()=> {
		try {
			return masters_base()
		} catch( error ) {
			if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
			$mol_fail_log( error )
			return [ ... $giper_baza_yard.masters_default ]
		}
	}

}
