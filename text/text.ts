namespace $ {

	export function $bog_gram_text_fill( pattern: string, vars: Record< string, string | number > ) {
		return pattern.replace( /\{(\w+)\}/g, ( all, key: string )=> key in vars ? String( vars[ key ] ) : all )
	}

	const $bog_gram_text_rules = [ 'one', 'few', 'many', 'other' ]

	export function $bog_gram_text_plural( this: $, count: number, forms: string ) {
		const list = forms.split( '|' )
		const rule = new Intl.PluralRules( this.$mol_locale.lang() ).select( count )
		const form = list[ Math.min( $bog_gram_text_rules.indexOf( rule ), list.length - 1 ) ] ?? list[ list.length - 1 ]
		return $bog_gram_text_fill( form, { n: count } )
	}

}
