namespace $.$$ {

	type Caret = ReturnType< $giper_baza_rich_edit[ 'selection' ] >

	const blocks = new Set([ 'P', 'DIV', 'SECTION', 'LI', 'PRE', 'BLOCKQUOTE', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6' ])

	const plain = new Set([ 'P', 'DIV', 'BR' ])

	const kept = new Set([ ... blocks, 'BR', 'STRONG', 'B', 'EM', 'I', 'INS', 'U', 'DEL', 'S', 'CODE', 'A', 'SUB', 'SUP' ])

	const blank = String.fromCharCode( 0x200b )

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
		return body.innerHTML.replaceAll( blank, '' )
	}

	function leaves( root: Node ): Node[] {
		if( root.nodeType === root.TEXT_NODE || root.nodeName === 'BR' ) return [ root ]
		return [ ... root.childNodes ].flatMap( leaves )
	}

	function leaf_size( leaf: Node ) {
		return leaf.nodeName === 'BR' ? 1 : leaf.nodeValue!.length
	}

	export function $bog_gram_write_spot( root: Node, node: Node, offset: number ) {

		const range = root.ownerDocument!.createRange()
		range.setStart( root, 0 )
		range.setEnd( node, offset )

		const at = leaves( range.cloneContents() ).reduce( ( sum, leaf )=> sum + leaf_size( leaf ), 0 )
		if( node.nodeType === node.TEXT_NODE ) return { at, tail: offset > 0 }

		const prev = node.childNodes[ offset - 1 ]
		const next = node.childNodes[ offset ]
		const tail = Boolean( prev ) && prev.nodeName !== 'BR' && ( !next || !blocks.has( prev.nodeName ) )

		return { at, tail }
	}

	export function $bog_gram_write_point( root: Node, spot: { at: number, tail: boolean } ): [ Node, number ] {

		let rest = spot.at

		for( const leaf of leaves( root ) ) {

			const size = leaf_size( leaf )

			if( leaf.nodeName === 'BR' ) {
				if( rest === 0 ) return [ leaf.parentNode!, [ ... leaf.parentNode!.childNodes ].indexOf( leaf as ChildNode ) ]
			} else {
				if( spot.tail && rest > 0 ? rest <= size : rest < size ) return [ leaf, rest ]
			}

			rest -= size

		}

		return [ root, root.childNodes.length ]
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

			if( !this.rich() ) return

			this.menu_hide()
			if( !this.aim() ) return

			if( this.inline_start( type ) ) event.preventDefault()
			else this.caret_keep( ()=> super.inline_toggle( type, event ) )

		}

		caret() {

			const selection = this.$.$mol_dom_context.document.getSelection()
			if( !selection?.rangeCount ) return null

			const root = this.Content().dom_node()
			if( !root.contains( selection.anchorNode ) || !root.contains( selection.focusNode ) ) return null

			return selection
		}

		caret_keep( change: ()=> void ) {

			if( !this.aim() ) return

			const selection = this.caret()
			if( !selection ) return

			const root = this.Content().dom_node() as HTMLElement
			const anchor = $bog_gram_write_spot( root, selection.anchorNode!, selection.anchorOffset )
			const focus = $bog_gram_write_spot( root, selection.focusNode!, selection.focusOffset )

			change()

			root.focus({ preventScroll: true })
			selection.setBaseAndExtent(
				... $bog_gram_write_point( root, anchor ),
				... $bog_gram_write_point( root, focus ),
			)

		}

		inline_start( type: string ) {

			const selection = this.caret()
			if( !selection?.isCollapsed ) return false

			const root = this.Content().dom_node() as HTMLElement
			const node = selection.anchorNode!
			const box = node.nodeType === node.ELEMENT_NODE ? node as Element : node.parentElement!

			const outer = box.closest( type )
			if( outer && outer !== root && root.contains( outer ) ) return false

			const document = this.$.$mol_dom_context.document
			const text = document.createTextNode( blank )
			const inline = document.createElement( type )
			inline.append( text )

			selection.getRangeAt( 0 ).insertNode( inline )
			this.save()

			root.focus({ preventScroll: true })
			selection.collapse( text, text.length )

			return true
		}

		menu_hide() {
			this.Inline_format_menu().showed( false )
		}

		override tools_hold( event?: Event ) {

			const target = event?.target as Node

			if( this.Tools().dom_node().contains( target ) ) event!.preventDefault()
			else this.menu_hide()

			return null
		}

		override tools_leave( event?: FocusEvent ) {
			if( !this.dom_node().contains( event?.relatedTarget as Node ) ) this.menu_hide()
			return null
		}

	}

}
