namespace $ {

	const ask_period = 3000

	export class $bog_gram_sent extends $mol_object {

		static asking = new Set< string >()

		static peer( land: $giper_baza_land ) {
			return land.auth().pass().peer().str
		}

		static tick_of( pawn: $giper_baza_pawn ) {

			const land = pawn.land()
			const peer = this.peer( land )
			let last = 0

			const visit = ( sand: $giper_baza_unit_sand )=> {
				if( sand.lord().peer().str === peer ) last = Math.max( last, sand.time_tick() )
				if( sand.tag() === 'term' ) return
				land.Pawn( $giper_baza_pawn ).Head( sand.self() ).units_of( null ).forEach( visit )
			}
			pawn.units_of( null ).forEach( visit )

			return last
		}

		static covered( land: $giper_baza_land, faces: $giper_baza_face_map ) {

			const peer = this.peer( land )
			const face = faces.get( peer )
			if( !face ) return 0

			let mass = 0
			const count = ( unit: $giper_baza_unit_base )=> {
				if( unit.lord().peer().str === peer && unit.time_tick() <= face.time_tick ) ++ mass
			}

			for( const gift of land._gift.values() ) count( gift )
			for( const peers of land._sand.values() ) {
				for( const sands of peers.values() ) {
					for( const sand of sands.values() ) count( sand )
				}
			}

			return mass <= face.summ ? face.time_tick : 0
		}

		static key( land: $giper_baza_land ) {
			return `bog_gram_sent:${ this.peer( land ) }:${ land.link().str }`
		}

		static confirmed( land: $giper_baza_land, next?: number ) {
			return this.$.$mol_state_local.value< number >( this.key( land ), next ) ?? 0
		}

		static done( pawn: $giper_baza_pawn ) {

			const land = pawn.land()
			if( this.confirmed( land ) >= this.tick_of( pawn ) ) return true

			this.poll( land )

			return false
		}

		@ $mol_mem_key
		static poll( land: $giper_baza_land ) {

			this.$.$mol_state_time.now( ask_period )
			if( !this.$.$bog_gram_awake.active() ) return null

			const master = this.$.$giper_baza_glob.yard().master_current()
			if( master ) this.ask( master, land )

			return null
		}

		static async ask( master: string, land: $giper_baza_land ) {

			const key = this.key( land )
			if( this.asking.has( key ) ) return
			this.asking.add( key )

			try {
				const faces = await this.$.$bog_id_land_ask( master, land )
				if( faces ) this.confirmed( land, this.covered( land, faces ) )
			} catch( error ) {
				$mol_fail_log( error )
			} finally {
				this.asking.delete( key )
			}

		}

	}

}
