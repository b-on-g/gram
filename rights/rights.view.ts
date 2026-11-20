namespace $.$$ {

	export class $bog_gram_rights extends $.$bog_gram_rights {

		override rows() {
			return this.gifts()
		}

		@ $mol_mem
		override gifts() {

			const land = this.land()
			const lords = new Set( this.lords() )

			return [ ... land._gift.keys() ]
				.filter( link => lords.has( link ) )
				.reverse()
				.map( link => this.Gift( new $giper_baza_link( link ) ) )

		}

		override peer_title( lord: $giper_baza_link ) {
			return this.label( lord.str )
		}

		@ $mol_mem
		override tier_options() {
			const options = { ... super.tier_options() }
			delete ( options as Partial< typeof options > ).deny
			return options
		}

		override gift_tier( lord: $giper_baza_link, next?: keyof typeof $giper_baza_rank_tier ) {

			const tier = super.gift_tier( lord, next )
			if( next !== undefined ) this.spread( lord )

			return tier
		}

		override gift_rate( lord: $giper_baza_link, next?: string ) {

			const rate = super.gift_rate( lord, next )
			if( next !== undefined ) this.spread( lord )

			return rate
		}

		@ $mol_action
		spread( lord: $giper_baza_link ) {

			const rank = this.land().lord_rank( lord )

			for( const land of this.lands() ) {
				const pass = land.lord_pass( lord )
				if( !pass ) continue
				if( land.lord_rank( lord ) === rank ) continue
				land.give( pass, rank )
			}

		}

	}

}
