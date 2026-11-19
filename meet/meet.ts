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

		trusted( link: string, owner: string, field: 'Group' | 'Title' | 'Mode' ) {
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
			hall.Mode( 'auto' )!.val( 'ask' )
			land.sync()

			this.Talk().store( id ).Meet( 'auto' )!.val( link )

			return link
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

			if( next !== undefined && this.owner_me( id ) ) this.hall( link ).Mode( 'auto' )!.val( next )

			return $bog_gram_soft( ()=> this.trusted( link, owner, 'Mode' ), '' ) === 'auto' ? 'auto' : 'ask'
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
			if( this.Roster().ids().includes( group ) ) return { plan: 'open', group }

			this.Lobby().send( group, owner )
			this.knock( link, group )

			return { plan: 'ask', group }
		}

		knock( link: string, group: string ) {

			const pass = this.$.$giper_baza_auth.current().pass().toString()
			const entry = this.Lobby().entry( group, this.Account().my_lord(), pass )

			const knocks = this.hall( link ).Knocks( 'auto' )!
			if( !knocks.items().map( String ).includes( entry ) ) knocks.add( entry )

			return entry
		}

		@ $mol_mem_key
		knocks_of( id: string ) {

			const link = this.meet_of( id )
			if( !link ) return [] as string[]

			const land = this.land( link )
			const units = $bog_gram_soft( ()=> land.Data( $bog_gram_meet_hall ).Knocks()?.units() ?? [], [] as readonly $giper_baza_unit_sand[] )
			const inside = new Set( $bog_gram_soft( ()=> this.Talk().lords( id ), [] as string[] ) )

			const out = [] as string[]

			for( const unit of units ) {

				const entry = String( land.sand_decode( unit ) ?? '' )
				const ask = this.Lobby().parse( entry )

				if( !ask || ask.group !== id ) continue
				if( ask.lord !== unit.lord().str ) continue
				if( inside.has( ask.lord ) ) continue
				if( out.includes( entry ) ) continue

				out.push( entry )
			}

			return out
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
				if( this.mode( id ) !== 'auto' ) continue

				for( const entry of this.knocks_of( id ) ) {
					if( !$bog_gram_soft( ()=> this.Lobby().apply( entry, true ), '' ) ) continue
					this.forget( entry )
					++ count
				}

			}

			return count
		}

	}

}
