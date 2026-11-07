namespace $.$$ {

	export class $bog_gram_hold extends $.$bog_gram_hold {

		@ $mol_action
		override down( next?: PointerEvent ) {
			if( next?.pointerId !== undefined ) this.dom_node().setPointerCapture?.( next.pointerId )
			this.press( next )
			return null
		}

		@ $mol_action
		override menu( next?: Event ) {
			next?.preventDefault()
			return null
		}

	}

}
