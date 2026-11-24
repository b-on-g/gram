namespace $.$$ {

	const row_target = 2.5

	const cost_step = 1e-9

	export type $bog_gram_album_cell = {
		tiles: readonly number[],
		grow: number,
	}

	export type $bog_gram_album_row = {
		ratio: number,
		cells: readonly $bog_gram_album_cell[],
	}

	export class $bog_gram_album extends $.$bog_gram_album {

		static clamp( ratio: number ) {
			if( !( ratio > 0 ) ) return 1
			return Math.min( 2, Math.max( 0.5, ratio ) )
		}

		static chunks( ratios: readonly number[] ): readonly number[] {

			const count = ratios.length
			const best = [] as { cost: number, sizes: readonly number[] }[]
			best[ count ] = { cost: 0, sizes: [] }

			for( let from = count - 1; from >= 0; -- from ) {

				best[ from ] = { cost: Infinity, sizes: [] }
				let sum = 0

				for( let till = from + 1; till <= count; ++ till ) {
					sum += this.clamp( ratios[ till - 1 ] )
					const cost = Math.log( sum / row_target ) ** 2 + best[ till ].cost
					if( cost > best[ from ].cost - cost_step ) continue
					best[ from ] = { cost, sizes: [ till - from, ... best[ till ].sizes ] }
				}

			}

			return best[ 0 ].sizes
		}

		static strip( ratios: readonly number[], from: number, size: number ): $bog_gram_album_row {
			const cells = [] as $bog_gram_album_cell[]
			for( let index = from; index < from + size; ++ index ) {
				cells.push({ tiles: [ index ], grow: this.clamp( ratios[ index ] ) })
			}
			return { ratio: cells.reduce( ( sum, cell )=> sum + cell.grow, 0 ), cells }
		}

		static layout( ratios: readonly number[] ): readonly $bog_gram_album_row[] {

			const count = ratios.length

			if( !count ) return []

			if( count === 1 ) return [ { ratio: ratios[0] > 0 ? ratios[0] : 1, cells: [ { tiles: [ 0 ], grow: 1 } ] } ]

			if( count === 3 ) {
				const [ big, upper, lower ] = ratios.map( ratio => this.clamp( ratio ) )
				if( big < 1 && upper >= 1 && lower >= 1 ) {
					const side = 1 / ( 1 / upper + 1 / lower )
					return [ { ratio: big + side, cells: [ { tiles: [ 0 ], grow: big }, { tiles: [ 1, 2 ], grow: side } ] } ]
				}
			}

			const rows = [] as $bog_gram_album_row[]
			let from = 0
			for( const size of this.chunks( ratios ) ) {
				rows.push( this.strip( ratios, from, size ) )
				from += size
			}
			return rows
		}

		@ $mol_mem
		layout() {
			return $bog_gram_album.layout( this.shots().map( shot => this.ratio( shot ) ) )
		}

		override single() {
			return this.shots().length === 1
		}

		cell( key: string ) {
			const [ row, cell ] = key.split( ':' ).map( Number )
			return this.layout()[ row ].cells[ cell ]
		}

		@ $mol_mem
		override rows() {
			return this.layout().map( ( _, index )=> this.Row( index ) )
		}

		override row_ratio( index: number ) {
			return String( this.layout()[ index ].ratio )
		}

		override row_cells( index: number ) {
			return this.layout()[ index ].cells.map( ( cell, at )=> cell.tiles.length > 1
				? this.Column( index + ':' + at )
				: this.Tile( this.shots()[ cell.tiles[0] ] )
			)
		}

		override column_grow( key: string ) {
			return String( this.cell( key ).grow )
		}

		override column_tiles( key: string ) {
			return this.cell( key ).tiles.map( index => this.Tile( this.shots()[ index ] ) )
		}

		@ $mol_mem
		grows() {
			const out = new Map< string, number >()
			for( const row of this.layout() ) {
				for( const cell of row.cells ) {
					for( const index of cell.tiles ) {
						const shot = this.shots()[ index ]
						out.set( shot, cell.tiles.length > 1 ? 1 / $bog_gram_album.clamp( this.ratio( shot ) ) : cell.grow )
					}
				}
			}
			return out
		}

		override tile_grow( shot: string ) {
			return String( this.grows().get( shot ) ?? 1 )
		}

	}

}
