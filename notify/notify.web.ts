namespace $ {

	/** Тот же бандл исполняется и как страница, и как сервис-воркер, а lib.dom
	 * знает только про страницу — формы воркерных событий описываем сами. */

	interface Gram_push_data {
		json(): unknown
	}

	interface Gram_push_event extends Event {
		data: Gram_push_data | null
		waitUntil( wait: Promise< unknown > ): void
	}

	interface Gram_notification {
		data: unknown
		close(): void
	}

	interface Gram_notification_event extends Event {
		notification: Gram_notification
		waitUntil( wait: Promise< unknown > ): void
	}

	interface Gram_client {
		url: string
		focus(): Promise< unknown >
	}

	interface Gram_scope {
		registration: {
			showNotification( title: string, options?: object ): Promise< void >
		}
		clients: {
			matchAll( options?: {
				type?: string,
				includeUncontrolled?: boolean,
			} ): Promise< readonly Gram_client[] >
			openWindow( url: string ): Promise< unknown >
		}
	}

	if( typeof window === 'undefined' ) {

		const scope = self as unknown as Gram_scope

		self.addEventListener( 'push', ( event: Event )=> {

			const push = event as unknown as Gram_push_event

			let title = 'Gram'
			let body = 'Новое сообщение'
			let url = './'

			// Пустое или чужое тело — не повод молчать: показываем заглушку,
			// иначе браузер сам нарисует «This site has been updated in background»
			try {
				const data = push.data?.json() as {
					title?: string,
					body?: string,
					url?: string,
				} | null
				if( data?.title ) title = data.title
				if( data?.body ) body = data.body
				if( data?.url ) url = data.url
			} catch( error ) {
				console.warn( error )
			}

			push.waitUntil( scope.registration.showNotification( title, {
				body,
				tag: 'gram',
				data: { url },
			} ) )

		} )

		self.addEventListener( 'notificationclick', ( event: Event )=> {

			const click = event as unknown as Gram_notification_event

			click.notification.close()

			const data = click.notification.data as { url?: string } | null
			const url = data?.url || './'

			click.waitUntil( ( async ()=> {

				const opened = await scope.clients.matchAll( {
					type: 'window',
					includeUncontrolled: true,
				} )

				const client = opened[0]
				if( client ) return await client.focus()

				return await scope.clients.openWindow( url )

			} )() )

		} )

	}

}
