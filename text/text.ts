namespace $ {

	export type $bog_gram_text_forms = {
		one: string
		few: string
		many: string
		other: string
	}

	export function $bog_gram_text_fill( pattern: string, vars: Record< string, string | number > ) {
		return pattern.replace( /\{(\w+)\}/g, ( all, key: string )=> key in vars ? String( vars[ key ] ) : all )
	}

	export function $bog_gram_text_plural( count: number, forms: $bog_gram_text_forms, lang: string ) {
		const rule = new Intl.PluralRules( lang ).select( count ) as keyof $bog_gram_text_forms
		return $bog_gram_text_fill( forms[ rule ] ?? forms.other, { n: count } )
	}

}
