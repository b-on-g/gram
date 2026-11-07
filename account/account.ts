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
			if( next !== undefined ) this.user_store().Name( 'auto' )?.val( next )
			return this.user_store().Name()?.val() ?? ''
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

		@ $mol_action
		dialogs_land_make() {
			const land = this.$.$giper_baza_glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
			this.user_store().Dialogs_land( 'auto' )?.val( land.link().str )
			return land
		}

		dialogs_land() {
			const str = this.user_store().Dialogs_land()?.val()
			return str ? this.land( String( str ) ) : this.dialogs_land_make()
		}

		@ $mol_action
		monitor_land_make() {
			const land = this.$.$giper_baza_glob.land_grab([ [ null, $giper_baza_rank_read ] ])
			this.user_store().Monitor_land( 'auto' )?.val( land.link().str )
			return land
		}

		monitor_land() {
			const str = this.user_store().Monitor_land()?.val()
			return str ? this.land( String( str ) ) : this.monitor_land_make()
		}

		@ $mol_action
		devices_land_make() {
			const land = this.$.$giper_baza_glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
			this.user_store().Devices_land( 'auto' )?.val( land.link().str )
			return land
		}

		devices_land() {
			const str = this.user_store().Devices_land()?.val()
			return str ? this.land( String( str ) ) : this.devices_land_make()
		}

		dialogs_store() {
			return this.dialogs_land().Data( $bog_gram_dialogs )
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
			this.user_store()
			this.inbox_open()
			this.inbox_publish()
			this.dialogs_land()
			this.monitor_land()
			this.device_ready()
			return true
		}

	}

}
