namespace $ {

	const prefix = /^\s*(?:--|—)[^\S\n]+(?=\S)/

	export function $bog_gram_tasks_is( text: string ) {
		return prefix.test( text )
	}

	export function $bog_gram_tasks_text( text: string ) {
		return text.replace( prefix, '' )
	}

	export function $bog_gram_tasks_html( html: string ) {

		const body = $mol_dom_parse( `<!doctype html><body>${ html }</body>`, 'text/html' ).body
		let rest = prefix.exec( body.textContent ?? '' )?.[0].length ?? 0

		const walk = ( node: Node )=> {

			if( node.nodeType === node.TEXT_NODE ) {
				const text = node.nodeValue ?? ''
				node.nodeValue = text.slice( rest )
				rest = Math.max( 0, rest - text.length )
				return
			}

			for( const kid of node.childNodes ) walk( kid )

		}

		walk( body )

		return body.innerHTML
	}

}
