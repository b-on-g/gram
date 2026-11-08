namespace $ {

	export class $bog_gram_roster extends $mol_object {

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

		store() {
			return this.Account().dialogs_store()
		}

		@ $mol_mem
		ids() {
			const all = new Set( ( this.store().Dialogs()?.items() ?? [] ).map( String ) )
			for( const link of this.invited() ) all.add( link )
			const hidden = new Set( this.hidden() )
			return [ ... all ].filter( id => !hidden.has( id ) )
		}

		@ $mol_mem
		invited() {
			const links = [] as string[]
			for( const entry of $bog_gram_soft( ()=> this.Account().invites(), [] as string[] ) ) {
				const link = $bog_gram_soft( ()=> this.invite_open( entry ), '' )
				if( link && $giper_baza_link.check( link ) ) links.push( link )
			}
			return links
		}

		@ $mol_mem
		hidden() {
			return this.Account().decided( 'hidden' )
		}

		sort( own: boolean, alive: boolean, known: boolean ): 'plain' | 'request' | 'skip' {
			if( own ) return 'plain'
			if( !alive ) return 'skip'
			return known ? 'plain' : 'request'
		}

		@ $mol_mem_key
		kind( id: string ): 'plain' | 'request' | 'skip' {
			if( this.archive_is( id ) ) return 'plain'
			const talk = this.Talk()
			const known = this.People().known( talk.owner( id ) || this.inviter( id ) ) || talk.mine_wrote( id )
			return this.sort( talk.own( id ), talk.alive( id ), known )
		}

		@ $mol_mem
		requests() {
			const dropped = new Set( this.hidden() )
			return this.Talk().fresh_first( this.ids().filter( id => {
				if( dropped.has( id ) ) return false
				return this.kind( id ) === 'request'
			} ) )
		}

		@ $mol_mem
		archive_links() {
			return ( this.store().Archived()?.items() ?? [] ).map( String )
		}

		@ $mol_mem
		archived() {
			const alive = new Set( this.ids() )
			const dropped = new Set( this.hidden() )
			return this.archive_links().filter( id => alive.has( id ) && !dropped.has( id ) )
		}

		@ $mol_mem_key
		archive_is( id: string ) {
			return this.archive_links().includes( id )
		}

		@ $mol_mem
		visible() {
			const folded = new Set( this.archived() )
			const asked = new Set( this.requests() )
			return this.Talk().fresh_first( this.ids().filter( id => {
				if( folded.has( id ) ) return false
				if( asked.has( id ) ) return false
				return this.kind( id ) !== 'skip'
			} ) )
		}

		@ $mol_action
		archive( id: string ) {
			if( !id ) return
			if( this.Talk().saved_is( id ) ) return
			this.store().Archived( 'auto' )!.add( id )
		}

		@ $mol_action
		unarchive( id: string ) {
			if( !id ) return
			this.store().Archived( 'auto' )!.cut( id )
		}

		@ $mol_action
		drop( id: string ) {

			if( !id ) return
			if( this.Talk().saved_is( id ) ) return

			const store = this.store()
			this.Account().decide( 'hidden', id )
			$bog_gram_soft( ()=> ( store.Dialogs( 'auto' )?.cut( id ), true ), false )
			if( this.archive_is( id ) ) $bog_gram_soft( ()=> ( store.Archived( 'auto' )?.cut( id ), true ), false )

			$bog_gram_soft( ()=> {
				const sessions = this.Talk().links_of( id )
				const watch = this.Account().monitor_store().Watch( 'auto' )!
				for( const link of sessions ) watch.cut( link )
				return true
			}, false )

		}

		with( peer: string ) {
			if( !peer ) return ''
			const talk = this.Talk()
			for( const id of this.ids() ) {
				const found = $bog_gram_soft( ()=> !talk.group_is( id ) && talk.peer( id ) === peer, false )
				if( found ) return id
			}
			return ''
		}

		create( peer: string ) {

			const exist = this.with( peer )
			if( exist ) return exist

			const pass = this.People().pass_of( peer )
			if( !pass ) return ''

			const glob = this.$.$giper_baza_glob
			const my = this.Account().my_lord()

			const dialog_land = glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
			const session_land = glob.land_grab([ [ null, $giper_baza_rank_deny ] ])

			dialog_land.give( pass, $giper_baza_rank_post( 'fast' ) )
			session_land.give( pass, $giper_baza_rank_post( 'fast' ) )

			const id = dialog_land.link().str
			const session = session_land.link().str

			const dialog = dialog_land.Data( $bog_gram_dialog )
			dialog.Peers( 'auto' )!.add( my )
			dialog.Peers( 'auto' )!.add( peer )
			dialog.Sessions( 'auto' )!.add( session )
			dialog.Session_last( 'auto' )?.val( session )
			dialog.Created( 'auto' )?.val( Date.now() )
			dialog.Owner( 'auto' )?.val( my )

			session_land.Data( $bog_gram_session ).Dialog_land( 'auto' )?.val( id )

			this.store().Dialogs( 'auto' )!.add( id )
			this.Account().monitor_store().Watch( 'auto' )!.add( session )
			this.store().Outbox( 'auto' )!.add( peer + '|' + id )

			return id
		}

		invite_open( entry: string ) {
			if( !$bog_gram_seal.is( entry ) ) return entry
			return this.sealed( entry )?.open ?? ''
		}

		@ $mol_mem
		inviters() {
			const out: Record< string, string > = {}
			for( const entry of $bog_gram_soft( ()=> this.Account().invites(), [] as string[] ) ) {
				if( !$bog_gram_seal.is( entry ) ) continue
				const sealed = $bog_gram_soft( ()=> this.sealed( entry ), null )
				if( sealed?.open && !out[ sealed.open ] ) out[ sealed.open ] = sealed.lord
			}
			return out
		}

		inviter( id: string ) {
			return this.inviters()[ id ] ?? ''
		}

		@ $mol_mem_key
		sealed( entry: string ) {
			return $bog_gram_seal.open( this.$.$giper_baza_auth.current(), 'invite', entry )
		}

		@ $mol_mem
		contacts() {

			const sources: Record< string, string > = {}
			const my = this.Account().my_lord()
			const talk = this.Talk()

			for( const id of this.ids() ) {
				if( talk.group_is( id ) ) continue
				const peer = $bog_gram_soft( ()=> talk.peer( id ), '' )
				if( !peer || peer === my || sources[ peer ] ) continue
				sources[ peer ] = 'из переписки'
			}

			const registry = this.People().Registry()
			const registries = registry.sources()
			for( const lord of Object.keys( registries ) ) {
				if( sources[ lord ] ) continue
				sources[ lord ] = registry.title( registries[ lord ] )
			}

			return sources
		}

		@ $mol_mem
		contact_lords() {
			return Object.keys( this.contacts() )
		}

		@ $mol_mem_key
		contact_source( lord: string ) {
			return this.contacts()[ lord ] ?? ''
		}

		name_of( id: string, lord: string ) {
			const atom = this.Talk().store( id ).Names()?.key( lord )?.Title()
			if( !atom ) return ''
			for( const unit of atom.units_of( null ) ) {
				if( unit.lord().str !== lord ) continue
				return String( atom.land().sand_decode( unit ) ?? '' )
			}
			return ''
		}

		@ $mol_mem
		names() {
			const out: Record< string, string > = {}
			for( const id of this.ids() ) {
				const keys = $bog_gram_soft( ()=> this.Talk().store( id ).Names()?.keys() ?? [], [] as readonly $giper_baza_vary_type[] )
				for( const key of keys ) {
					const lord = String( key )
					if( out[ lord ] ) continue
					const name = $bog_gram_soft( ()=> this.name_of( id, lord ), '' )
					if( name ) out[ lord ] = name
				}
			}
			return out
		}

		@ $mol_mem
		names_fill() {
			const my = this.Account().my_lord()
			const name = this.Account().user_name()
			let count = 0
			for( const id of this.ids() ) {
				if( this.Talk().saved_is( id ) ) continue
				const done = $bog_gram_soft( ()=> {
					if( this.name_of( id, my ) === name ) return false
					const title = this.Talk().store( id ).Names( 'auto' )?.key( my, 'auto' )?.Title( 'auto' )
					if( !title ) return false
					title.val( name )
					return true
				}, false )
				if( done ) ++ count
			}
			return count
		}

		@ $mol_mem
		watch_fill() {
			const watch = this.Account().monitor_store()
			const have = new Set( ( watch.Watch()?.items() ?? [] ).map( String ) )
			for( const id of this.ids() ) {
				for( const link of this.Talk().links_of( id ) ) {
					if( have.has( link ) ) continue
					watch.Watch( 'auto' )!.add( link )
				}
			}
			return true
		}

	}

}
