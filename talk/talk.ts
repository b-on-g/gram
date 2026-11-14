namespace $ {

	export class $bog_gram_talk extends $mol_object {

		@ $mol_mem
		Account() {
			return this.$.$bog_gram_account.make({ $: this.$ })
		}

		@ $mol_mem
		People() {
			return this.$.$bog_gram_people.make({ $: this.$ })
		}

		my() {
			return this.Account().my_lord()
		}

		land( id: string ) {
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( id ) )
		}

		@ $mol_mem
		Text() {
			return this.$.$bog_gram_text.make({ $: this.$ })
		}

		saved_title() {
			return this.Text().talk_saved()
		}

		@ $mol_action
		saved_land_make() {

			const land = this.$.$giper_baza_glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
			const store = this.Account().dialogs_store()

			const str = store.Saved_land()?.val()
			if( str ) return this.land( String( str ) )

			const link = land.link().str
			store.Saved_land( 'auto' )?.val( link )
			store.Saved_lands( 'auto' )!.add( link )

			return land
		}

		saved_land() {
			const str = this.Account().dialogs_store().Saved_land()?.val()
			return str ? this.land( String( str ) ) : this.saved_land_make()
		}

		@ $mol_mem
		saved_id() {
			return String( this.Account().dialogs_store().Saved_land()?.val() ?? '' )
		}

		@ $mol_mem
		saved_links() {
			const current = this.saved_id()
			const all = $bog_gram_soft( ()=> ( this.Account().dialogs_store().Saved_lands()?.items() ?? [] ).map( String ), [] as string[] )
			const rest = all.filter( link => link && link !== current )
			return current ? [ ... rest, current ] : rest
		}

		saved_is( id: string ) {
			if( !id ) return false
			return this.saved_links().includes( id )
		}

		store( id: string ) {
			return this.land( id ).Data( $bog_gram_dialog )
		}

		lords( id: string ) {
			if( !id ) return [] as string[]
			if( this.saved_is( id ) ) return [] as string[]
			return ( this.store( id ).Peers()?.items() ?? [] ).map( String )
		}

		mates( id: string ) {
			const my = this.my()
			return this.lords( id ).filter( lord => lord !== my )
		}

		@ $mol_mem_key
		peer( id: string ) {
			if( this.saved_is( id ) ) return ''
			const peers = this.lords( id )
			return peers.find( lord => lord !== this.my() ) ?? peers[0] ?? ''
		}

		@ $mol_mem_key
		group_title( id: string ) {
			if( !id ) return ''
			if( this.saved_is( id ) ) return ''
			return $bog_gram_soft( ()=> String( this.store( id ).Title()?.val() ?? '' ), '' )
		}

		@ $mol_mem_key
		group_is( id: string ) {
			if( !id ) return false
			if( this.saved_is( id ) ) return false
			if( $bog_gram_soft( ()=> this.lords( id ).length > 2, false ) ) return true
			return Boolean( this.group_title( id ) )
		}

		@ $mol_mem_key
		group_name_auto( id: string ) {
			const mates = $bog_gram_soft( ()=> this.mates( id ), [] as string[] )
			if( !mates.length ) return $bog_gram_lord.short( id )
			return mates.map( lord => this.People().label( lord ) ).join( ', ' )
		}

		@ $mol_action
		group_title_set( id: string, next?: string ) {
			if( !id ) return null
			if( !this.admin_me( id ) ) return null
			this.store( id ).Title( 'auto' )?.val( next ?? '' )
			return null
		}

		@ $mol_mem_key
		admins( id: string ) {
			if( !id ) return [] as string[]
			return $bog_gram_soft( ()=> ( this.store( id ).Admins()?.items() ?? [] ).map( String ), [] as string[] )
		}

		admin_is( id: string, lord: string ) {
			if( !id || !lord ) return false
			if( this.owner( id ) === lord ) return true
			if( lord === this.my() && this.own( id ) ) return true
			return this.admins( id ).includes( lord )
		}

		admin_me( id: string ) {
			return this.admin_is( id, this.my() )
		}

		member_rank( id: string, lord: string ) {
			return this.admin_is( id, lord ) ? $giper_baza_rank_rule : $giper_baza_rank_post( 'fast' )
		}

		owner( id: string ) {
			if( !id ) return ''
			try {
				return String( this.store( id ).Owner()?.val() ?? '' )
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				$mol_fail_log( error )
				return ''
			}
		}

		@ $mol_mem_key
		own( id: string ) {
			if( !id ) return false
			return $bog_gram_soft( ()=> {
				const owner = this.owner( id )
				if( owner ) return owner === this.my()
				return this.land( id ).lord_rank( new $giper_baza_link( this.my() ) ) === $giper_baza_rank_rule
			}, false )
		}

		@ $mol_mem_key
		title( id: string ) {
			if( this.saved_is( id ) ) return this.saved_title()
			if( this.group_is( id ) ) return this.group_title( id ) || this.group_name_auto( id )
			const peer = this.peer( id )
			if( !peer ) return $bog_gram_lord.short( id )
			return this.People().label( peer )
		}

		@ $mol_mem_key
		avatar_id( id: string ) {
			return $bog_gram_soft( ()=> this.group_is( id ) ? id : this.peer( id ), '' )
		}

		@ $mol_mem_key
		tint( id: string ) {
			return $bog_gram_soft( ()=> $bog_gram_lord.tint( this.avatar_id( id ) ), 0 )
		}

		@ $mol_mem_key
		moment( id: string ) {
			return $bog_gram_soft( ()=> {
				const last = this.last( id )
				if( last ) return Number( last.Moment()?.val() ?? 0 )
				return Number( this.store( id ).Created()?.val() ?? 0 )
			}, 0 )
		}

		fresh_first( ids: readonly string[] ) {
			return [ ... ids ].sort( ( a, b )=> this.moment( b ) - this.moment( a ) )
		}

		@ $mol_mem_key
		alive( id: string ) {
			return $bog_gram_soft( ()=> Boolean( this.last( id ) ), false )
		}

		links_of( id: string ): readonly string[] {
			if( !id ) return []
			if( this.saved_is( id ) ) return this.saved_links()
			return ( this.store( id ).Sessions()?.items() ?? [] ).map( String )
		}

		lands_of( id: string ) {
			return this.links_of( id ).map( link => this.land( link ) )
		}

		land_of( id: string ) {

			const links = this.links_of( id )
			if( !links.length ) return null

			if( !this.saved_is( id ) ) {
				const marked = String( this.store( id ).Session_last()?.val() ?? '' )
				if( marked && links.includes( marked ) ) return this.land( marked )
			}

			return this.land( links[ links.length - 1 ] )
		}

		session( id: string ) {
			return this.land_of( id )?.Data( $bog_gram_session ) ?? null
		}

		messages_merge( buckets: readonly ( readonly $bog_gram_message[] )[] ) {
			return buckets
				.filter( bucket => bucket.length )
				.map( bucket => ({
					bucket,
					start: Number( bucket[0].Moment()?.val() ?? 0 ),
					link: bucket[0].link().str,
				}) )
				.sort( ( a, b )=> ( a.start - b.start ) || ( a.link < b.link ? -1 : a.link > b.link ? 1 : 0 ) )
				.flatMap( item => item.bucket )
		}

		@ $mol_mem_key
		messages_of( id: string ) {
			return this.messages_merge( this.lands_of( id ).map( land => $bog_gram_soft(
				()=> land.Data( $bog_gram_session ).Messages()?.remote_list() ?? [],
				[] as readonly $bog_gram_message[],
			) ) )
		}

		@ $mol_mem_key
		messages_alive_of( id: string ) {
			return this.messages_of( id ).filter( message => !message.Deleted()?.val() )
		}

		@ $mol_mem_key
		last( id: string ) {
			const all = this.messages_of( id )
			for( let i = all.length - 1; i >= 0; -- i ) {
				if( !all[ i ].Deleted()?.val() ) return all[ i ]
			}
			return null
		}

		@ $mol_mem_key
		wrote_moment_of( key: readonly [ string, string ] ) {
			const [ id, lord ] = key
			const all = this.messages_of( id )
			for( let i = all.length - 1; i >= 0; -- i ) {
				if( String( all[ i ].Author()?.val() ?? '' ) === lord ) return Number( all[ i ].Moment()?.val() ?? 0 )
			}
			return 0
		}

		read_moment_of( id: string, lord: string ) {
			let last = this.wrote_moment_of([ id, lord ])
			for( const land of this.lands_of( id ) ) {
				try {
					const moment = Number( land.Data( $bog_gram_session ).Reads()?.key( lord )?.Moment()?.val() ?? 0 )
					if( moment > last ) last = moment
				} catch( error ) {
					if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
					$mol_fail_log( error )
				}
			}
			return last
		}

		@ $mol_mem_key
		unread( id: string ) {
			if( !id ) return 0
			if( this.saved_is( id ) ) return 0
			const my = this.my()
			const seen = this.read_moment_of( id, my )
			return this.unread_since( this.messages_of( id ), my, seen )
		}

		unread_since( messages: readonly $bog_gram_message[], my: string, seen: number, limit = 100 ) {
			let count = 0
			for( let i = messages.length - 1; i >= 0 && count < limit; -- i ) {
				const message = messages[ i ]
				if( Number( message.Moment()?.val() ?? 0 ) <= seen ) break
				if( message.Deleted()?.val() ) continue
				if( String( message.Author()?.val() ?? '' ) === my ) continue
				++ count
			}
			return count
		}

		@ $mol_mem_key
		preview( id: string ) {

			const last = this.last( id )
			if( !last ) return ''

			const text = String( last.Text()?.val() ?? '' )
			const words = this.Text()
			const kind = last.Image()?.val() ? words.talk_photo()
				: last.Voice()?.val() ? words.talk_voice()
				: last.Video()?.val() ? words.talk_video()
				: last.Call()?.val() ? words.talk_call()
				: last.Contact()?.val() ? words.talk_contact()
				: ''
			const body = kind ? ( text ? kind + ' · ' + text : kind ) : text
			if( this.saved_is( id ) ) return body

			const author = String( last.Author()?.val() ?? '' )
			if( author === this.my() ) return $bog_gram_text_fill( words.talk_mine(), { text: body } )
			if( author && this.group_is( id ) ) return this.People().label( author ) + ': ' + body

			return body
		}

		@ $mol_mem_key
		time( id: string ) {
			return $bog_gram_clock.brief( Number( this.last( id )?.Moment()?.val() ?? 0 ) )
		}

		mine_among( messages: readonly $bog_gram_message[], my: string ) {
			for( let i = messages.length - 1; i >= 0; -- i ) {
				const message = messages[ i ]
				if( String( message.Author()?.val() ?? '' ) !== my ) continue
				if( !message.Deleted()?.val() ) return true
			}
			return false
		}

		@ $mol_mem_key
		mine_wrote( id: string ) {
			return $bog_gram_soft( ()=> this.mine_among( this.messages_of( id ), this.my() ), false )
		}

	}

}
