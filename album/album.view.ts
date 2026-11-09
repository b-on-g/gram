namespace $.$$ {

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

		static chunks( count: number ) {
			const sizes = count % 3 === 1 ? [ 2, 2 ] : count % 3 === 2 ? [ 2 ] : []
			let rest = count - sizes.reduce( ( sum, size )=> sum + size, 0 )
			while( rest > 0 ) {
				sizes.push( 3 )
				rest -= 3
			}
			return sizes
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

			if( count === 2 ) return [ this.strip( ratios, 0, 2 ) ]

			if( count === 3 ) return [ { ratio: 1.5, cells: [ { tiles: [ 0 ], grow: 2 }, { tiles: [ 1, 2 ], grow: 1 } ] } ]

			if( count === 4 ) return [
				{ ratio: 2, cells: [ { tiles: [ 0 ], grow: 1 }, { tiles: [ 1 ], grow: 1 } ] },
				{ ratio: 2, cells: [ { tiles: [ 2 ], grow: 1 }, { tiles: [ 3 ], grow: 1 } ] },
			]

			const rows = [] as $bog_gram_album_row[]
			let from = 0
			for( const size of this.chunks( count ) ) {
				rows.push( this.strip( ratios, from, size ) )
				from += size
			}
			return rows
		}

		@ $mol_mem
		layout() {
			return $bog_gram_album.layout( this.shots().map( shot => this.ratio( shot ) ) )
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
					for( const index of cell.tiles ) out.set( this.shots()[ index ], cell.tiles.length > 1 ? 1 : cell.grow )
				}
			}
			return out
		}

		override tile_grow( shot: string ) {
			return String( this.grows().get( shot ) ?? 1 )
		}

	}

}
