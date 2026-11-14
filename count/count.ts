namespace $ {

	export function $bog_gram_count_people( this: $, count: number ) {
		const text = this.$bog_gram_text.make({ $: this })
		return $bog_gram_text_plural( count, {
			one: text.count_people_one(),
			few: text.count_people_few(),
			many: text.count_people_many(),
			other: text.count_people_other(),
		}, this.$mol_locale.lang() )
	}

	export function $bog_gram_count_dialogs( this: $, count: number ) {
		const text = this.$bog_gram_text.make({ $: this })
		return $bog_gram_text_plural( count, {
			one: text.count_dialogs_one(),
			few: text.count_dialogs_few(),
			many: text.count_dialogs_many(),
			other: text.count_dialogs_other(),
		}, this.$mol_locale.lang() )
	}

}
