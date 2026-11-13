namespace $ {

	export class $bog_gram_account extends $mol_object {

		user_store() {
			return this.$.$giper_baza_glob.home().land().Data( $bog_gram_user )
		}

		@ $mol_mem
		my_lord() {
			return this.$.$giper_baza_auth.current().pass().lord().str
		}

		@ $mol_mem
		my_pass() {
			return this.$.$giper_baza_auth.current().pass().toString()
		}

		@ $mol_mem
		user_name( next?: string ) {
			const store = this.dialogs_store()
			if( next !== undefined ) {
				store.Name( 'auto' )?.val( next )
				this.name_hide()
			}
			return String( store.Name()?.val() ?? '' ) || this.name_public()
		}

		name_public() {
			return String( $bog_gram_soft( ()=> this.user_store().Name()?.val() ?? '', '' ) )
		}

		@ $mol_mem
		name_hide() {
			const open = this.name_public()
			if( !open ) return false
			const store = this.dialogs_store()
			if( !String( store.Name()?.val() ?? '' ) ) store.Name( 'auto' )?.val( open )
			this.user_store().Name( 'auto' )?.val( '' )
			return true
		}

		@ $mol_mem
		inbox_land() {
			const home = this.$.$giper_baza_glob.Land( new $giper_baza_link( this.my_lord() ) )
			return home.area_make( $mol_hash_string( 'bog_gram_inbox' ) )
		}

		@ $mol_mem
		inbox_open() {
			const land = this.inbox_land()
			const rank = $giper_baza_rank_post( 'slow' )
			if( land.lord_rank( null ) !== rank ) land.give( null, rank )
			return true
		}

		@ $mol_mem
		inbox_publish() {

			this.dialogs_store()

			const link = this.inbox_land().link().str
			const prev = String( this.user_store().Inbox_land()?.val() ?? '' )
			if( prev === link ) return link

			if( prev && !this.lobbies_old().includes( prev ) ) this.dialogs_store().Lobbies( 'auto' )!.add( prev )
			this.user_store().Inbox_land( 'auto' )?.val( link )

			return link
		}

		@ $mol_mem
		lobbies_old() {
			return ( this.dialogs_store().Lobbies()?.items() ?? [] ).map( String )
		}

		@ $mol_mem
		inbox_stores() {
			const old = $bog_gram_soft( ()=> this.lobbies_old(), [] as string[] )
			return [
				this.inbox_store(),
				... old.map( link => this.$.$giper_baza_glob.Land( new $giper_baza_link( link ) ).Data( $bog_gram_inbox ) ),
			]
		}

		inbox_items( pick: ( store: $bog_gram_inbox )=> $giper_baza_list_str | null ) {

			const all = [] as string[]

			for( const store of this.inbox_stores() ) {
				try {
					for( const item of pick( store )?.items() ?? [] ) all.push( String( item ) )
				} catch( error ) {
					if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
					$mol_fail_log( error )
				}
			}

			return [ ... new Set( all ) ]
		}

		inbox_cut( pick: ( store: $bog_gram_inbox, auto?: 'auto' )=> $giper_baza_list_str | null, entry: string ) {
			for( const store of this.inbox_stores() ) {
				try {
					if( !( pick( store )?.items() ?? [] ).map( String ).includes( entry ) ) continue
					pick( store, 'auto' )!.cut( entry )
				} catch( error ) {
					if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
					$mol_fail_log( error )
				}
			}
		}

		@ $mol_mem
		invites() {
			return this.inbox_items( store => store.Invites() )
		}

		@ $mol_mem
		joins() {
			return this.inbox_items( store => store.Joins() )
		}

		@ $mol_mem
		denies() {
			return this.inbox_items( store => store.Denies() )
		}

		@ $mol_action
		joins_cut( entry: string ) {
			this.inbox_cut( ( store, auto )=> store.Joins( auto ), entry )
		}

		@ $mol_action
		denies_cut( entry: string ) {
			this.inbox_cut( ( store, auto )=> store.Denies( auto ), entry )
		}

		land( str: string ) {
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( str ) )
		}

		@ $mol_mem
		born() {
			return Boolean( this.$.$mol_state_local.value( 'bog_gram_born_' + this.my_lord() ) )
		}

		pointer_limit() {
			return 60_000
		}

		@ $mol_mem
		pointer_lost( next?: boolean ) {
			return next ?? false
		}

		@ $mol_mem
		pointer_timer() {
			return new this.$.$mol_after_timeout( this.pointer_limit(), ()=> {
				this.pointer_lost( true )
			} )
		}

		pointer_wait() {

			const born = this.born()
			const dialogs = String( this.user_store().Dialogs_land()?.val() ?? '' )

			if( born ) return
			if( dialogs ) return
			if( this.pointer_lost() ) $mol_fail( new Error( 'Не удалось загрузить данные аккаунта' ) )
			this.pointer_timer()
			$mol_fail_hidden( new Promise( ()=> {} ) )
		}

		@ $mol_mem
		pointer_state(): 'wait' | 'lost' | 'ready' {
			try {
				this.dialogs_land()
				return 'ready'
			} catch( error ) {
				if( $mol_promise_like( error ) ) return 'wait'
				if( this.pointer_lost() ) return 'lost'
				$mol_fail_hidden( error )
			}
		}

		@ $mol_action
		pointer_retry( next?: any ) {
			this.pointer_lost( false )
			return null
		}

		@ $mol_action
		account_fresh( next?: any ) {
			this.$.$giper_baza_auth.current( null )
			this.$.$mol_dom_context.location.reload()
			return null
		}

		@ $mol_action
		dialogs_land_make() {
			const land = this.$.$giper_baza_glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
			this.user_store().Dialogs_land( 'auto' )?.val( land.link().str )
			return land
		}

		dialogs_land() {
			const str = String( this.user_store().Dialogs_land()?.val() ?? '' )
			if( str ) return this.land( str )
			this.pointer_wait()
			return this.dialogs_land_make()
		}

		@ $mol_action
		monitor_land_make() {
			const land = this.$.$giper_baza_glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
			this.user_store().Watch_land( 'auto' )?.val( land.link().str )
			return land
		}

		monitor_land() {
			const str = String( this.user_store().Watch_land()?.val() ?? '' )
			if( str ) return this.land( str )
			this.pointer_wait()
			return this.monitor_land_make()
		}

		@ $mol_action
		monitor_grant( pass: string ) {
			const daemon = $bog_gram_pass.parse( pass )
			const land = this.monitor_land()
			if( land.pass_rank( daemon ) >= $giper_baza_rank_read ) return false
			land.give( daemon, $giper_baza_rank_read )
			return true
		}

		@ $mol_action
		devices_land_make() {
			const land = this.$.$giper_baza_glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
			this.user_store().Devices_land( 'auto' )?.val( land.link().str )
			return land
		}

		devices_land() {
			const str = String( this.user_store().Devices_land()?.val() ?? '' )
			if( str ) return this.land( str )
			this.pointer_wait()
			return this.devices_land_make()
		}

		dialogs_store() {
			return this.dialogs_land().Data( $bog_gram_dialogs )
		}

		local_key( kind: 'accepted' | 'hidden' ) {
			return 'bog_gram_' + kind + '_' + this.my_lord()
		}

		local_list( kind: 'accepted' | 'hidden', next?: readonly string[] ): readonly string[] {
			const key = this.local_key( kind )
			if( next === undefined ) return this.$.$mol_state_local.value< readonly string[] >( key ) ?? []
			return this.$.$mol_state_local.value( key, next.length ? next : null ) ?? []
		}

		local_add( kind: 'accepted' | 'hidden', item: string ) {
			const prev = this.local_list( kind )
			if( !prev.includes( item ) ) this.local_list( kind, [ ... prev, item ] )
		}

		decision_list( kind: 'accepted' | 'hidden' ) {
			const store = this.dialogs_store()
			return kind === 'accepted' ? store.Accepted( 'auto' ) : store.Hidden( 'auto' )
		}

		@ $mol_action
		decide( kind: 'accepted' | 'hidden', item: string ) {
			const list = $bog_gram_soft( ()=> this.decision_list( kind ), null )
			if( list ) list.add( item )
			else this.local_add( kind, item )
		}

		@ $mol_action
		undecide( kind: 'accepted' | 'hidden', item: string ) {
			const prev = this.local_list( kind )
			if( prev.includes( item ) ) this.local_list( kind, prev.filter( one => one !== item ) )
			const store = this.dialogs_store()
			const list = kind === 'accepted' ? store.Accepted() : store.Hidden()
			if( !$bog_gram_soft( ()=> ( list?.items() ?? [] ).map( String ).includes( item ), false ) ) return
			$bog_gram_soft( ()=> ( this.decision_list( kind )?.cut( item ), true ), false )
		}

		decided( kind: 'accepted' | 'hidden' ) {
			const store = this.dialogs_store()
			const list = kind === 'accepted' ? store.Accepted() : store.Hidden()
			const stored = $bog_gram_soft( ()=> ( list?.items() ?? [] ).map( String ), [] as string[] )
			return [ ... new Set([ ... stored, ... this.local_list( kind ) ]) ]
		}

		@ $mol_mem
		decisions_flush() {
			let moved = 0
			for( const kind of [ 'accepted', 'hidden' ] as const ) {
				const local = this.local_list( kind )
				if( !local.length ) continue
				const list = $bog_gram_soft( ()=> this.decision_list( kind ), null )
				if( !list ) continue
				for( const item of local ) list.add( item )
				this.local_list( kind, [] )
				moved += local.length
			}
			return moved
		}

		inbox_store() {
			return this.inbox_land().Data( $bog_gram_inbox )
		}

		monitor_store() {
			return this.monitor_land().Data( $bog_gram_monitor )
		}

		devices_store() {
			return this.devices_land().Data( $bog_gram_devices )
		}

		monitor_link() {
			return this.monitor_land().link().str
		}

		@ $mol_mem
		device_ready() {
			const dev = this.devices_store().Registry( 'auto' )?.key( 'web', 'auto' )
			if( dev && !dev.Title()?.val() ) {
				dev.Title( 'auto' )?.val( 'Web client' )
				dev.Token( 'auto' )?.val( 'stub' )
			}
			return true
		}

		@ $mol_mem
		ready() {
			this.dialogs_store()
			this.inbox_open()
			this.inbox_publish()
			this.monitor_land()
			this.device_ready()
			$bog_gram_soft( ()=> this.decisions_flush(), 0 )
			$bog_gram_soft( ()=> this.name_hide(), false )
			return true
		}

	}

}
