namespace $ {

	export class $bog_gram_awake extends $mol_object {

		static now() {

			const doc = this.$.$mol_dom_context.document
			if( !doc ) return true

			if( doc.visibilityState === 'hidden' ) return false

			return doc.hasFocus?.() ?? true
		}

		@ $mol_mem
		static listeners() {

			const win = this.$.$mol_dom_context
			if( !win.document?.addEventListener ) return []

			const check = ()=> this.active( this.now() )

			return [
				new this.$.$mol_dom_listener( win.document, 'visibilitychange', check ),
				new this.$.$mol_dom_listener( win, 'focus', check ),
				new this.$.$mol_dom_listener( win, 'blur', check ),
			]
		}

		@ $mol_mem
		static active( next?: boolean ) {
			this.listeners()
			return next ?? this.now()
		}

	}

}
