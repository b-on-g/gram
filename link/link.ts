namespace $ {

	/** Ссылка на пешку в чужом ленде, которая на чтении сама поднимает синк
	 * этого ленда. Базовый `remote()` только строит прокси, поэтому без
	 * такой обёртки содержимое отдельного ленда никогда не докачивается:
	 * ссылка есть, а данных по ней нет. Синк дёргается только на чтении —
	 * сразу после записи ленд ещё наш собственный и тянуть нечего. */
	export function $bog_gram_link_synced< const Value extends any >( Value: Value ) {

		const Base = $giper_baza_atom_link.to( Value )
		type Link = InstanceType< typeof Base >

		class $bog_gram_link_synced extends Base {

			remote( next?: Parameters< Link[ 'remote' ] >[ 0 ] ) {
				const target = super.remote( next )
				if( next === undefined ) this.target_sync()
				return target
			}

			/** Ленд, на который смотрит ссылка, тянется в фоне: обещание
			 * ловим и гасим, потому что ждать его тут нечем — чтение
			 * реактивно и повторится само, когда данные приедут. */
			target_sync() {

				const link = this.val()
				if( !link ) return

				try {
					this.$.$giper_baza_glob.Land( link.land() ).sync()
				} catch( error ) {
					if( !$mol_promise_like( error ) ) throw error
				}

			}

		}

		return $bog_gram_link_synced as typeof Base
	}

}
