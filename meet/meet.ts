namespace $ {

	export type $bog_gram_meet_mode = 'ask' | 'auto'

	export class $bog_gram_meet extends $mol_object {

		@ $mol_mem
		Account() {
			return this.$.$bog_gram_account.make({ $: this.$ })
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
		Lobby() {
			return this.$.$bog_gram_lobby.make({ $: this.$ })
		}

		land( link: string ) {
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( link ) )
		}

		hall( link: string ) {
			return this.land( link ).Data( $bog_gram_meet_hall )
		}

		trusted( link: string, owner: string, field: 'Group' | 'Title' | 'Confirm' ) {
			const value = this.hall( link )[ field ]()?.vary_of( new $giper_baza_link( owner ) )
			return String( value ?? '' )
		}

		@ $mol_mem_key
		group_of( [ link, owner ]: readonly [ string, string ] ) {
			if( !link || !$giper_baza_link.check( link ) ) return ''
			if( !owner || !$giper_baza_link.check( owner ) ) return ''
			return $bog_gram_soft( ()=> this.trusted( link, owner, 'Group' ), '' )
		}

		@ $mol_mem_key
		group_of_uri( uri: string ) {
			const hall = /(?:^|[!\/ ?&#])meet=([^\/ &#]+)/.exec( uri )?.[1]
			const owner = /(?:^|[!\/ ?&#])by=([^\/ &#]+)/.exec( uri )?.[1]
			if( !hall || !owner ) return ''
			return this.group_of([ decodeURIComponent( hall ), decodeURIComponent( owner ) ])
		}

		@ $mol_mem_key
		meet_of( id: string ) {
			if( !id ) return ''
			return $bog_gram_soft( ()=> String( this.Talk().store( id ).Meet()?.val() ?? '' ), '' )
		}

		owner_me( id: string ) {
			return this.Lobby().join_owner_of( id ) === this.Account().my_lord()
		}

		@ $mol_action
		make( id: string ) {

			if( !id ) return ''
			if( !this.owner_me( id ) ) return ''

			const exist = this.meet_of( id )
			if( exist ) return exist

			const land = this.$.$giper_baza_glob.land_grab([ [ null, $giper_baza_rank_post( 'just' ) ] ])
			const hall = land.Data( $bog_gram_meet_hall )
			const link = land.link().str

			hall.Group( 'auto' )!.val( id )
			hall.Title( 'auto' )!.val( this.Talk().group_title( id ) )
			land.sync()

			this.Talk().store( id ).Meet( 'auto' )!.val( link )

			return link
		}

		@ $mol_action
		call( id: string ) {

			const session = this.Talk().session( id )
			if( !session ) return ''

			const land = this.$.$bog_gram_call_room.grab( [] )
			land.Data( $bog_gram_call_land ).Invite( 'auto' )!.val( this.uri( id ) )

			const message = session.Messages( 'auto' )!.make( null )
			message.Call( 'auto' )!.val( land.link() )
			message.Author( 'auto' )?.val( this.Account().my_lord() )
			message.Moment( 'auto' )?.val( Date.now() )

			return land.link().str
		}

		uri( id: string ) {
			const link = this.meet_of( id )
			const owner = this.Lobby().join_owner_of( id )
			return link && owner ? this.$.$mol_state_arg.make_link({ meet: link, by: owner }) : ''
		}

		@ $mol_mem_key
		mode( id: string, next?: $bog_gram_meet_mode ): $bog_gram_meet_mode {

			const link = this.meet_of( id )
			const owner = this.Lobby().join_owner_of( id )
			if( !link || !owner ) return 'ask'

			if( next !== undefined && this.owner_me( id ) ) this.hall( link ).Confirm( 'auto' )!.val( next === 'ask' ? 'on' : '' )

			return $bog_gram_soft( ()=> this.trusted( link, owner, 'Confirm' ), '' ) === 'on' ? 'ask' : 'auto'
		}

		hall_id() {
			return this.$.$mol_state_arg.value( 'meet' ) ?? ''
		}

		hall_by() {
			return this.$.$mol_state_arg.value( 'by' ) ?? ''
		}

		take( link: string, owner: string ): { plan: 'skip' | 'open' | 'ask', group: string } {

			const group = this.group_of([ link, owner ])
			this.$.$mol_state_arg.value( 'meet', null )
			this.$.$mol_state_arg.value( 'by', null )

			if( !group ) return { plan: 'skip', group }
			if( this.Talk().inside( group ) && this.Lobby().taken( group ) ) return { plan: 'open', group }

			this.Lobby().send( group, owner )
			this.knock( link, group )
			this.wait( group )

			return { plan: 'ask', group }
		}

		@ $mol_mem
		wait( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		entered() {
			const group = this.wait()
			if( !group ) return ''
			return this.Lobby().taken( group ) ? group : ''
		}

		room( id: string ) {
			const messages = this.Talk().messages_of( id )
			for( let i = messages.length - 1; i >= 0; -- i ) {
				const link = messages[ i ].Call()?.val()
				if( link ) return link.str
			}
			return ''
		}

		@ $mol_mem
		room_wait( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		room_ready() {

			const link = this.room_wait()
			if( !link ) return ''

			const land = this.land( link ).sync()
			if( !land.encrypted() ) return ''

			const my = new $giper_baza_link( this.Account().my_lord() )
			return land.lord_tier( my ) >= $giper_baza_rank_tier.read ? link : ''
		}

		knock( link: string, group: string ) {

			const pass = this.$.$giper_baza_auth.current().pass().toString()
			const entry = this.Lobby().entry( group, this.Account().my_lord(), pass )

			const knocks = this.hall( link ).Knocks( 'auto' )!
			if( !knocks.items().map( String ).includes( entry ) ) knocks.add( entry )

			return entry
		}

		@ $mol_mem_key
		knocks_all( id: string ) {

			const link = this.meet_of( id )
			if( !link ) return [] as string[]

			const land = this.land( link )
			const units = $bog_gram_soft( ()=> land.Data( $bog_gram_meet_hall ).Knocks()?.units() ?? [], [] as readonly $giper_baza_unit_sand[] )

			const out = [] as string[]

			for( const unit of units ) {

				const entry = String( land.sand_decode( unit ) ?? '' )
				const ask = this.Lobby().parse( entry )

				if( !ask || ask.group !== id ) continue
				if( ask.lord !== unit.lord().str ) continue
				if( out.includes( entry ) ) continue

				out.push( entry )
			}

			return out
		}

		@ $mol_mem_key
		knocks_of( id: string ) {
			return this.knocks_all( id ).filter( entry => !this.Talk().member_is( id, this.Lobby().parse( entry )!.lord ) )
		}

		forget( entry: string ) {

			const ask = this.Lobby().parse( entry )
			if( !ask ) return

			const link = this.meet_of( ask.group )
			if( !link ) return

			const hall = this.hall( link )
			if( !( hall.Knocks()?.items() ?? [] ).map( String ).includes( entry ) ) return

			hall.Knocks( 'auto' )!.cut( entry )
		}

		@ $mol_mem
		auto() {

			let count = 0

			for( const id of $bog_gram_soft( ()=> this.Roster().ids(), [] as string[] ) ) {

				if( !this.meet_of( id ) ) continue
				if( !$bog_gram_soft( ()=> this.Talk().admin_me( id ), false ) ) continue

				const auto = this.mode( id ) === 'auto'

				for( const entry of this.knocks_all( id ) ) {

					if( !this.Talk().member_is( id, this.Lobby().parse( entry )!.lord ) ) {
						if( !auto ) continue
						if( !$bog_gram_soft( ()=> this.Lobby().apply( entry, true ), '' ) ) continue
						++ count
					}

					this.forget( entry )
				}

			}

			return count
		}

	}

}
