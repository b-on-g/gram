namespace $.$$ {

	export class $bog_gram_body extends $.$bog_gram_body {

		@ $mol_mem
		tokens() {
			const tokens = [] as { name: string, found: string, chunks: readonly string[] }[]
			this.$.$mol_syntax2_md_line.tokenize(
				this.text(),
				( name, found, chunks )=> tokens.push({ name, found, chunks } ),
			)
			return tokens as readonly typeof tokens[ number ][]
		}

		@ $mol_mem
		override sub() {

			const parts = [] as $mol_view_content[]
			let text = ''

			for( const [ index, token ] of this.tokens().entries() ) {

				if( token.name !== 'text-link-http' && token.name !== 'text-link' ) {
					text += token.found
					continue
				}

				if( text ) {
					parts.push( text )
					text = ''
				}

				parts.push( this.Link( index ) )
			}

			if( text ) parts.push( text )

			return parts
		}

		override link_uri( index: number ) {
			const token = this.tokens()[ index ]
			return token.name === 'text-link'
				? token.chunks[ 1 ]
				: token.found
		}

		override link_text( index: number ) {
			const token = this.tokens()[ index ]
			return token.name === 'text-link'
				? token.chunks[ 0 ]
				: token.found
		}

	}

}
