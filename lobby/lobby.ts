namespace $ {

	export class $bog_gram_lobby extends $mol_object {

		@ $mol_mem
		Account() {
			return this.$.$bog_gram_account.make({ $: this.$ })
		}

		@ $mol_mem
		People() {
			return this.$.$bog_gram_people.make({ $: this.$ })
		}

		@ $mol_mem
		Talk() {
			return this.$.$bog_gram_talk.make({ $: this.$ })
		}

		@ $mol_mem
		Roster() {
			return this.$.$bog_gram_roster.make({ $: this.$ })
		}

		@ $mol_mem
		Crew() {
			return this.$.$bog_gram_crew.make({ $: this.$ })
		}

		store() {
			return this.Account().dialogs_store()
		}

		inbox_of( lord: string ) {
			const link = this.People().inbox( lord )
			if( !link ) return null
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( link ) ).Data( $bog_gram_inbox )
		}

		@ $mol_mem_key
		sealed_close( [ kind, pass, open ]: readonly [ string, string, string ] ) {
			return $bog_gram_seal.close( this.$.$giper_baza_auth.current(), $bog_gram_pass.parse( pass ), kind, open )
		}

		@ $mol_mem_key
		sealed_open( [ kind, entry ]: readonly [ string, string ] ) {
			return $bog_gram_seal.open( this.$.$giper_baza_auth.current(), kind, entry )
		}

		@ $mol_mem_key
		invite_ready( id: string ) {
			if( !id ) return false
			const talk = this.Talk()
			if( talk.group_is( id ) ) return talk.alive( id )
			return talk.mine_wrote( id )
		}

		@ $mol_mem
		outbox_flush() {

			const entries = ( this.store().Outbox()?.items() ?? [] ).map( String )
			if( !entries.length ) return 0

			this.$.$mol_state_time.now( 3000 )

			for( const entry of entries ) {

				const [ peer, dialog ] = entry.split( '|' )
				if( !this.invite_ready( dialog ) ) continue

				try {

					const inbox = this.inbox_of( peer )
					if( !inbox ) continue

					const pass = this.People().pass_of( peer )
					if( !pass ) continue

					const sealed = this.sealed_close([ 'invite', pass.toString(), dialog ])
					const invites = inbox.Invites( 'auto' )
					if( !invites ) continue
					invites.add( sealed )

					const sent = ( inbox.Invites()?.items() ?? [] ).map( String ).includes( sealed )
					if( sent ) this.store().Outbox( 'auto' )!.cut( entry )

				} catch( error ) {
					if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
					$mol_fail_log( error )
				}

			}

			return entries.length
		}

		entry( group: string, lord: string, pass: string ) {
			return group + '|' + lord + '|' + pass
		}

		parse( entry: string ) {
			if( $bog_gram_seal.is( entry ) ) {
				const sealed = this.sealed_open([ 'join', entry ])
				if( !sealed?.open ) return null
				return { group: sealed.open, lord: sealed.lord, pass: sealed.pass }
			}
			const parts = String( entry ?? '' ).split( '|' )
			if( parts.length !== 3 ) return null
			const [ group, lord, pass ] = parts
			if( !group || !lord || !pass ) return null
			return { group, lord, pass }
		}

		@ $mol_mem
		asks_all() {
			return $bog_gram_soft( ()=> this.Account().joins(), [] as string[] )
		}

		@ $mol_mem_key
		asks_of( id: string ) {
			if( !id ) return [] as string[]
			const inside = new Set( $bog_gram_soft( ()=> this.Talk().lords( id ), [] as string[] ) )
			return this.asks_all().filter( entry => {
				const ask = this.parse( entry )
				if( !ask ) return false
				if( ask.group !== id ) return false
				return !inside.has( ask.lord )
			} )
		}

		lord_of( entry: string ) {
			return this.parse( entry )?.lord ?? ''
		}

		@ $mol_action
		forget( entry: string ) {
			if( !entry ) return
			this.Account().joins_cut( entry )
		}

		deny( entry: string ) {

			const ask = this.parse( entry )
			if( !ask ) {
				this.forget( entry )
				return ''
			}

			try {
				const inbox = this.inbox_of( ask.lord )
				const pass = $bog_gram_pass.verified( ask.lord, ask.pass )
				if( inbox && pass ) inbox.Denies( 'auto' )?.add( this.sealed_close([ 'deny', pass.toString(), ask.group ]) )
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				$mol_fail_log( error )
			}

			this.forget( entry )

			return ask.group
		}

		apply( entry: string, history: boolean ) {

			const ask = this.parse( entry )
			if( !ask ) {
				this.forget( entry )
				return ''
			}

			if( !this.Talk().admin_me( ask.group ) ) return ''

			const pass = $bog_gram_pass.verified( ask.lord, ask.pass )
			if( !pass ) {
				this.Crew().error( 'Ключ в заявке не сходится со своим владельцем: заявка отклонена' )
				this.forget( entry )
				return ''
			}

			const joined = this.Crew().join( ask.group, ask.lord, history, pass )
			if( !joined ) return ''

			this.forget( entry )

			return joined
		}

		join_owner_of( id: string ) {
			const owner = this.Talk().owner( id )
			if( owner ) return owner
			return this.Talk().own( id ) ? this.Account().my_lord() : ''
		}

		join_uri( id: string ) {
			if( !id ) return ''
			const owner = this.join_owner_of( id )
			return this.$.$mol_state_arg.make_link( owner ? { join: id, by: owner } : { join: id } )
		}

		join_id() {
			return this.$.$mol_state_arg.value( 'join' ) ?? ''
		}

		join_by() {
			return this.$.$mol_state_arg.value( 'by' ) ?? ''
		}

		@ $mol_mem
		lost( next?: string ) {
			return next ?? ''
		}

		join_plan( id: string, my: string, member: boolean ): 'skip' | 'open' | 'ask' {
			if( !id ) return 'skip'
			if( id === my ) return 'skip'
			if( !$giper_baza_link.check( id ) ) return 'skip'
			return member ? 'open' : 'ask'
		}

		join_take( id: string, by: string ) {

			const plan = this.join_plan( id, this.Account().my_lord(), this.Roster().ids().includes( id ) )

			if( plan === 'ask' ) {
				const owner = by || this.join_owner_of( id )
				this.lost( owner ? '' : id )
				if( owner ) this.send( id, owner )
			}

			this.$.$mol_state_arg.value( 'join', null )
			this.$.$mol_state_arg.value( 'by', null )

			return plan
		}

		task( group: string, owner: string ) {
			return owner ? group + '|' + owner : group
		}

		task_group( entry: string ) {
			return String( entry ?? '' ).split( '|' )[ 0 ] ?? ''
		}

		task_owner( entry: string ) {
			return String( entry ?? '' ).split( '|' )[ 1 ] ?? ''
		}

		@ $mol_action
		send( id: string, owner: string ) {

			if( !id || !owner ) return

			const store = this.store()

			if( this.Roster().hidden().includes( id ) ) store.Hidden( 'auto' )!.cut( id )
			if( this.denied().includes( id ) ) store.Denied( 'auto' )!.cut( id )

			if( this.groups().includes( id ) ) return
			store.Asks( 'auto' )!.add( this.task( id, owner ) )

		}

		@ $mol_mem
		queued() {
			return $bog_gram_soft( ()=> ( this.store().Asks()?.items() ?? [] ).map( String ), [] as string[] )
		}

		@ $mol_mem
		sent() {
			return $bog_gram_soft( ()=> ( this.store().Asked()?.items() ?? [] ).map( String ), [] as string[] )
		}

		@ $mol_mem
		denied() {
			return $bog_gram_soft( ()=> ( this.store().Denied()?.items() ?? [] ).map( String ), [] as string[] )
		}

		@ $mol_mem
		groups() {
			return [ ... this.queued(), ... this.sent() ].map( entry => this.task_group( entry ) )
		}

		waiting( entries: readonly string[] ) {
			const have = new Set( $bog_gram_soft( ()=> this.Roster().ids(), [] as string[] ) )
			const all = new Set( entries.map( entry => this.task_group( entry ) ) )
			return [ ... all ].filter( id => !have.has( id ) )
		}

		@ $mol_mem
		pending_queued() {
			return this.waiting( this.queued() )
		}

		@ $mol_mem
		pending_sent() {
			return this.waiting( this.sent() )
		}

		@ $mol_mem
		denies_merge() {

			const entries = $bog_gram_soft( ()=> this.Account().denies(), [] as string[] )
			if( !entries.length ) return 0

			const store = this.store()
			const mine = [ ... this.queued(), ... this.sent() ]

			for( const entry of entries ) {

				const group = $bog_gram_seal.is( entry )
					? this.sealed_open([ 'deny', entry ])?.open ?? ''
					: entry

				for( const task of mine ) {
					if( !group ) break
					if( this.task_group( task ) !== group ) continue
					store.Asks( 'auto' )!.cut( task )
					store.Asked( 'auto' )!.cut( task )
					if( !this.denied().includes( group ) ) store.Denied( 'auto' )!.add( group )
				}

				this.Account().denies_cut( entry )
			}

			return entries.length
		}

		@ $mol_mem
		plate() {

			if( this.lost() ) return 'В ссылке нет создателя группы — заявку нести некому, попросите свежую'

			const denied = this.denied().length
			if( denied === 1 ) return 'Заявку отклонили — попроситься снова можно по той же ссылке'
			if( denied ) return 'Заявок отклонено: ' + denied + ' — попроситься снова можно по тем же ссылкам'

			const queued = this.pending_queued().length
			if( queued === 1 ) return 'Заявка отправляется — это не мгновенно'
			if( queued ) return 'Отправляется заявок: ' + queued

			const sent = this.pending_sent().length
			if( sent === 1 ) return 'Заявка отправлена — ждём, пока её примут'
			if( sent ) return 'Заявок отправлено: ' + sent + ' — ждём, пока их примут'

			return ''
		}

		taken( entry: string ) {

			const id = this.task_group( entry )
			const inside = $bog_gram_soft( ()=> this.Talk().lords( id ).includes( this.Account().my_lord() ), false )
			if( !inside ) return false

			const store = this.store()
			const roster = this.Roster()
			if( !roster.ids().includes( id ) && !roster.hidden().includes( id ) ) store.Dialogs( 'auto' )!.add( id )

			store.Asks( 'auto' )!.cut( entry )
			store.Asked( 'auto' )!.cut( entry )

			return true
		}

		@ $mol_mem
		asks_flush() {

			const queued = this.queued()
			const sent = this.sent()
			if( !queued.length && !sent.length ) return 0

			for( const task of sent ) this.taken( task )

			if( !queued.length ) return sent.length

			this.$.$mol_state_time.now( 3000 )

			const store = this.store()

			for( const task of queued ) {

				if( this.taken( task ) ) continue

				try {

					const id = this.task_group( task )

					const owner = this.task_owner( task ) || this.Talk().owner( id )
					if( !owner ) {
						store.Asks( 'auto' )!.cut( task )
						continue
					}

					const inbox = this.inbox_of( owner )
					if( !inbox ) continue

					const owner_pass = this.People().pass_of( owner )
					if( !owner_pass ) continue

					const entry = this.sealed_close([ 'join', owner_pass.toString(), id ])
					const joins = inbox.Joins( 'auto' )
					if( !joins ) continue
					joins.add( entry )

					const delivered = ( inbox.Joins()?.items() ?? [] ).map( String ).includes( entry )
					if( !delivered ) continue

					store.Asked( 'auto' )!.add( task )
					store.Asks( 'auto' )!.cut( task )

				} catch( error ) {
					if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
					$mol_fail_log( error )
				}

			}

			return queued.length + sent.length
		}

	}

}
