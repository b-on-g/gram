namespace $.$$ {

	type Caret = ReturnType< $giper_baza_rich_edit[ 'selection' ] >

	const blocks = new Set([ 'P', 'DIV', 'SECTION', 'LI', 'PRE', 'BLOCKQUOTE', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6' ])

	const plain = new Set([ 'P', 'DIV', 'BR' ])

	const kept = new Set([ ... blocks, 'BR', 'STRONG', 'B', 'EM', 'I', 'INS', 'U', 'DEL', 'S', 'CODE', 'A', 'SUB', 'SUP' ])

	function body_of( html: string ) {
		return $mol_dom_parse( `<!doctype html><body>${ html }</body>`, 'text/html' ).body
	}

	function tidy( node: Element ) {
		for( const kid of [ ... node.children ] ) {

			tidy( kid )

			if( !kept.has( kid.nodeName ) ) {
				kid.replaceWith( ... kid.childNodes )
				continue
			}

			for( const attr of [ ... kid.attributes ] ) {
				if( kid.nodeName === 'A' && attr.name === 'href' ) continue
				kid.removeAttribute( attr.name )
			}

		}
	}

	export function $bog_gram_write_clean( html: string ) {
		const body = body_of( html )
		tidy( body )
		body.normalize()
		return body.innerHTML
	}

	export function $bog_gram_write_text( html: string ) {

		if( !html ) return ''

		const lines = [] as string[]
		let line = ''

		const walk = ( node: Node )=> {

			if( node.nodeType === node.TEXT_NODE ) {
				line += node.nodeValue
				return
			}

			if( node.nodeName === 'BR' ) {
				lines.push( line )
				line = ''
				return
			}

			const block = blocks.has( node.nodeName )
			if( block && line ) {
				lines.push( line )
				line = ''
			}

			for( const kid of node.childNodes ) walk( kid )

			if( block && line ) {
				lines.push( line )
				line = ''
			}

		}

		walk( body_of( html ) )
		if( line ) lines.push( line )

		return lines.join( '\n' )
	}

	export function $bog_gram_write_html( text: string ) {

		if( !text ) return ''

		const escape = ( line: string )=> line
			.replaceAll( '&', '&amp;' )
			.replaceAll( '<', '&lt;' )
			.replaceAll( '>', '&gt;' )

		return text.split( '\n' ).map( line => `<p>${ escape( line ) || '<br>' }</p>` ).join( '' )
	}

	export function $bog_gram_write_rich_is( html: string ) {
		if( !html ) return false
		return [ ... body_of( html ).querySelectorAll( '*' ) ].some( el => !plain.has( el.nodeName ) )
	}

	export class $bog_gram_write extends $.$bog_gram_write {

		override pawn( next?: $giper_baza_rich ): $giper_baza_rich {
			return $mol_fail( new Error( 'Поле сообщения не пишет в Базу' ) )
		}

		selection( next?: Caret ): Caret {
			return next ?? [ [ '', 0, 0 ], [ '', 0, 0 ] ]
		}

		selection_save() {}

		selection_load() {}

		@ $mol_mem
		override selected( next?: boolean ) {

			$mol_wire_watch()

			const root = this.Content().dom_node()
			if( !root.isConnected ) return false

			const selection = this.$.$mol_dom_context.document.getSelection()
			if( !selection?.rangeCount ) return false

			return root.contains( selection.anchorNode ) && root.contains( selection.focusNode )
		}

		html_last = ''

		@ $mol_mem
		nodes( next?: readonly Node[] ): readonly Node[] {

			const html = this.html()
			if( next ) return next

			const prev = $mol_mem_cached( ()=> this.nodes() )
			if( prev && html === this.html_last ) return prev

			this.html_last = html

			const document = this.$.$mol_dom_context.document
			return [ ... body_of( html ).childNodes ].map( node => document.importNode( node, true ) )
		}

		@ $mol_mem
		override content() {

			const nodes = this.nodes()
			if( nodes.length ) return nodes as $mol_view_content[]

			const document = this.$.$mol_dom_context.document
			const line = document.createElement( 'p' )
			line.append( document.createElement( 'br' ) )

			return [ line ]
		}

		override save( event?: Event ) {

			const root = this.Content().dom_node()
			const html = $bog_gram_write_clean( root.innerHTML )

			this.html_last = html
			this.nodes([ ... root.childNodes ])
			this.html( html )

		}

		paste_rich( html: string ) {

			const body = body_of( html )
			tidy( body )

			const range = $mol_dom_range.from_selection()
			if( !range ) return

			const document = this.$.$mol_dom_context.document
			const part = document.createDocumentFragment()
			for( const node of body.childNodes ) part.append( document.importNode( node, true ) )

			range.paste( part )
			this.save()

		}

		text() {
			return $bog_gram_write_text( this.html() )
		}

		@ $mol_mem
		override sub() {
			return [
				... this.text() ? [] : [ this.Hint() ],
				this.Content(),
				... this.rich() && this.enabled() ? [ this.Tools() ] : [],
			]
		}

		/**
		 * Enter отправляет только там, где есть физическая клавиатура.
		 * Тач без мыши и трекпада — это телефон: там Enter переносит строку,
		 * а отправка остаётся за кнопкой.
		 */
		enter_sends() {

			const nav = this.$.$mol_dom_context.navigator

			if( !nav?.maxTouchPoints ) return true

			if( this.$.$mol_media.match( '(any-pointer: fine)' ) ) return true

			if( this.$.$mol_media.match( '(hover: hover)' ) ) return true

			return false

		}

		newline() {
			this.$.$mol_dom_context.document.execCommand( 'insertLineBreak' )
		}

		override press( event?: KeyboardEvent ) {

			if( !event ) return null
			if( event.isComposing ) return null
			if( event.keyCode !== $mol_keyboard_code.enter ) return null

			if( event.ctrlKey || event.metaKey ) {
				event.preventDefault()
				this.newline()
				return null
			}

			if( event.shiftKey || !this.enter_sends() ) return null

			event.preventDefault()
			this.send( event )

			return null
		}

		chosen() {

			const selection = this.$.$mol_dom_context.document.getSelection()
			if( !selection?.rangeCount ) return 0
			if( !this.Content().dom_node().contains( selection.anchorNode ) ) return 0

			return selection.toString().length
		}

		room() {
			return Math.max( 0, this.length_max() - this.text().length + this.chosen() )
		}

		override before_input( event?: InputEvent ) {

			if( !event?.inputType.startsWith( 'insert' ) ) return null
			if( event.inputType === 'insertCompositionText' ) return null

			const size = event.data?.length ?? 1
			if( size > this.room() ) event.preventDefault()

			return null
		}

		override paste( event: ClipboardEvent ) {

			const transfer = event.clipboardData
			if( !transfer ) return
			if( transfer.files.length ) return

			event.preventDefault()

			const room = this.room()
			const text = transfer.getData( 'text/plain' )
			const html = transfer.getData( 'text/html' )

			if( this.rich() && html && text.length <= room ) return this.paste_rich( html )

			const part = text.slice( 0, room )
			if( !part ) return

			this.$.$mol_dom_context.document.execCommand( 'insertText', false, part )

		}

		aim() {

			const root = this.Content().dom_node()
			const document = this.$.$mol_dom_context.document
			const selection = document.getSelection()
			if( !selection ) return false

			const line = ()=> document.createElement( 'p' )

			if( !root.textContent && !root.querySelector( 'p' ) ) {
				const empty = line()
				empty.append( document.createElement( 'br' ) )
				root.replaceChildren( empty )
			}

			for( const kid of [ ... root.childNodes ] ) {
				if( kid.nodeName !== 'BR' ) continue
				const wrap = line()
				kid.before( wrap )
				wrap.append( kid )
			}

			const inner = ( node: Node | null, pos: number ): readonly[ Node, number ]=> {

				if( node && node !== root && root.contains( node ) ) return [ node, pos ]

				const kid = node === root ? root.childNodes[ pos ] : null
				let leaf: Node = kid ?? root.lastChild!
				while( true ) {
					const next: Node | null = kid ? leaf.firstChild : leaf.lastChild
					if( !next || next.nodeName === 'BR' ) break
					leaf = next
				}

				return [ leaf, kid ? 0 : leaf.nodeValue?.length ?? 0 ]
			}

			const from = inner( selection.anchorNode, selection.anchorOffset )
			const to = inner( selection.focusNode, selection.focusOffset )
			selection.setBaseAndExtent( from[0], from[1], to[0], to[1] )

			return true
		}

		caret_keep( task: ()=> void ) {

			if( !this.aim() ) return

			const root = this.Content().dom_node()
			const document = this.$.$mol_dom_context.document
			const selection = document.getSelection()!
			const mark = 'bog_gram_write_caret'

			const node = selection.focusNode!
			const line = ( node.nodeType === node.ELEMENT_NODE ? node as Element : node.parentElement! ).closest( 'p' )

			let rest = 0
			if( line && root.contains( line ) ) {
				const before = document.createRange()
				before.setStart( line, 0 )
				before.setEnd( node, selection.focusOffset )
				rest = before.toString().length
				line.setAttribute( mark, '' )
			}

			try {
				task()
			} finally {

				const marked = [ ... root.querySelectorAll( `[${ mark }]` ) ]
				for( const el of marked ) el.removeAttribute( mark )

				const place = ( node: Node ): boolean => {
					if( node.nodeType === node.TEXT_NODE ) {
						const length = node.nodeValue!.length
						if( rest <= length ) {
							selection.collapse( node, rest )
							return true
						}
						rest -= length
						return false
					}
					return [ ... node.childNodes ].some( place )
				}

				if( marked[0] && !place( marked[0] ) ) selection.collapse( marked[0], 0 )

			}

		}

		override block_wrap( type: string, event: KeyboardEvent ) {
			if( this.rich() ) this.caret_keep( ()=> super.block_wrap( type, event ) )
		}

		override block_rewrap( event: KeyboardEvent ) {
			if( !this.rich() ) return
			this.aim()
			super.block_rewrap( event )
		}

		override block_unwrap( event: KeyboardEvent ) {
			if( this.rich() ) this.caret_keep( ()=> super.block_unwrap( event ) )
		}

		override inline_toggle( type: string, event: KeyboardEvent ) {
			if( this.rich() ) this.caret_keep( ()=> super.inline_toggle( type, event ) )
		}

	}

}
