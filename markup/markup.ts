namespace $ {

	/** Содержимое сообщения. Стили от другой ревизии текста не применяются. */
	export function $bog_gram_markup_read( message: $bog_gram_message | null | undefined ): $bog_rich_content {

		const text = String( message?.Text()?.val() ?? '' )
		const code = text && String( message?.Entities()?.val() ?? '' )
		if( !code ) return { text, entities: [] }

		const data = $mol_try( ()=> JSON.parse( code ) )
		if( data instanceof Error || data?.hash !== $mol_hash_string( text ) ) return { text, entities: [] }

		return $bog_rich_normalize({ text, entities: data.entities })
	}

	/** Пишет текст и стили одной ревизией, связывая их хешем текста. */
	export function $bog_gram_markup_write( message: $bog_gram_message, content: $bog_rich_content ) {

		const { text, entities } = $bog_rich_normalize( content )
		const code = entities.length ? JSON.stringify({ hash: $mol_hash_string( text ), entities }) : ''

		message.Text( 'auto' )?.val( text )
		if( code || message.Entities()?.val() ) message.Entities( 'auto' )?.val( code )
	}

}
