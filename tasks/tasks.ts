namespace $ {

	const prefix = /^\s*(?:--|—)[^\S\n]+(?=\S)/

	export function $bog_gram_tasks_prefix( text: string ) {
		return prefix.exec( text )?.[0].length ?? 0
	}

}
