namespace $ {

	export function $bog_gram_count_people( this: $, count: number ) {
		return this.$bog_gram_text_plural( count, this.$bog_gram_text.make({ $: this }).count_people() )
	}

	export function $bog_gram_count_dialogs( this: $, count: number ) {
		return this.$bog_gram_text_plural( count, this.$bog_gram_text.make({ $: this }).count_dialogs() )
	}

}
