namespace $.$$ {

	export class $bog_gram_row extends $.$bog_gram_row {

		override sub() {
			return [
				... this.face(),
				this.Info(),
				... this.marks(),
				... this.tools().length ? [ this.Tools() ] : [],
			]
		}

		face() {
			if( this.Icon() ) return [ this.Sign() ]
			return this.faced() ? [ this.Avatar() ] : []
		}

		override Time() {
			return this.time() ? super.Time() : null!
		}

		override Bottom() {
			return this.note() || this.badge() ? super.Bottom() : null!
		}

		override Note() {
			return this.note() ? super.Note() : null!
		}

		override Badge() {
			return this.badge() ? super.Badge() : null!
		}

		@ $mol_action
		override tools_click( next?: Event ) {
			next?.stopPropagation()
			return null
		}

	}

}
