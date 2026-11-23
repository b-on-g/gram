namespace $.$$ {

	export class $bog_gram_rich extends $.$bog_gram_rich {

		@ $mol_mem
		override nodes() {

			const document = this.$.$mol_dom_context.document
			const body = this.$.$mol_dom_parse( `<!doctype html><body>${ $bog_gram_write_clean( this.html() ) }</body>`, 'text/html' ).body

			for( const link of body.querySelectorAll( 'a' ) ) {

				if( !/^(https?:|mailto:|tel:)/i.test( link.getAttribute( 'href' ) ?? '' ) ) {
					link.replaceWith( ... link.childNodes )
					continue
				}

				link.setAttribute( 'target', '_blank' )
				link.setAttribute( 'rel', 'noopener noreferrer' )

			}

			return [ ... body.childNodes ].map( node => document.importNode( node, true ) ) as unknown as $mol_view_content[]
		}

	}

}
