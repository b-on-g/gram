namespace $ {

	export class $bog_gram_registry extends $mol_object {

		@ $mol_mem
		Account() {
			return this.$.$bog_gram_account.make({ $: this.$ })
		}

		active() {
			return this.$.$mol_state_arg.value( 'users' ) ?? ''
		}

		@ $mol_mem
		ids() {
			return ( this.Account().dialogs_store().Registries()?.items() ?? [] ).map( String )
		}

		land( id: string ) {
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( id ) )
		}

		store( id: string ) {
			return this.land( id ).Data( $bog_gram_users )
		}

		@ $mol_mem_key
		lords( id: string ) {
			return $bog_gram_soft( ()=> ( this.store( id ).Lords()?.items() ?? [] ).map( String ), [] as string[] )
		}

		@ $mol_mem_key
		title( id: string ) {
			return $bog_gram_soft( ()=> String( this.store( id ).Title()?.val() ?? '' ), '' ) || $bog_gram_lord.short( id )
		}

		@ $mol_mem_key
		joined( id: string ) {
			return this.lords( id ).includes( this.Account().my_lord() )
		}

		@ $mol_mem_key
		active_is( id: string ) {
			return this.active() === id
		}

		@ $mol_mem_key
		status( id: string ) {
			const mine = this.joined( id ) ? 'вы в списке' : 'только смотрите'
			return $bog_gram_count.people( this.lords( id ).length ) + ' · ' + mine
		}

		uri() {
			const id = this.active()
			if( !id ) return ''
			return this.$.$mol_state_arg.make_link({ users: id })
		}

		key_put( id: string ) {

			if( !id ) return

			const store = this.store( id )
			const my = this.Account().my_lord()
			const str = this.Account().my_pass()

			if( String( store.Keys()?.key( my )?.Pass()?.val() ?? '' ) === str ) return
			store.Keys( 'auto' )?.key( my, 'auto' )?.Pass( 'auto' )?.val( str )

		}

		@ $mol_mem
		keys_fill() {
			let count = 0
			for( const id of this.ids() ) {
				if( !this.joined( id ) ) continue
				count += $bog_gram_soft( ()=> ( this.key_put( id ), 1 ), 0 )
			}
			return count
		}

		@ $mol_mem
		name( next?: string ) {
			return next ?? ''
		}

		@ $mol_action
		make( next?: any ) {

			const title = this.name().trim()
			const my = this.Account().my_lord()

			const land = this.$.$giper_baza_glob.land_grab([ [ null, $giper_baza_rank_post( 'slow' ) ] ])
			const id = land.link().str

			const store = land.Data( $bog_gram_users )
			if( title ) store.Title( 'auto' )?.val( title )
			store.Lords( 'auto' )?.add( my )
			store.Keys( 'auto' )?.key( my, 'auto' )?.Pass( 'auto' )?.val( this.Account().my_pass() )

			land.units_saving()

			this.Account().dialogs_store().Registries( 'auto' )!.add( id )
			this.name( '' )
			this.$.$mol_state_arg.value( 'users', id )

			return null
		}

		@ $mol_mem
		remember() {
			const id = this.active()
			if( !id ) return ''
			if( !this.ids().includes( id ) ) this.Account().dialogs_store().Registries( 'auto' )!.add( id )
			return id
		}

		@ $mol_action
		join( id: string, next?: any ) {

			if( !id ) return null

			const my = this.Account().my_lord()

			if( !this.ids().includes( id ) ) this.Account().dialogs_store().Registries( 'auto' )!.add( id )
			if( !this.lords( id ).includes( my ) ) this.store( id ).Lords( 'auto' )?.add( my )

			this.key_put( id )
			this.land( id ).units_saving()

			return null
		}

		@ $mol_action
		join_active( next?: any ) {
			this.join( this.active() )
			return null
		}

		@ $mol_action
		forget( id: string, next?: any ) {
			if( !id ) return null
			this.Account().dialogs_store().Registries( 'auto' )!.cut( id )
			if( this.active() === id ) this.$.$mol_state_arg.value( 'users', null )
			return null
		}

		@ $mol_action
		open( id: string, next?: any ) {
			if( !id ) return null
			this.$.$mol_state_arg.value( 'users', id )
			return null
		}

		@ $mol_mem
		join_needed() {
			const id = this.active()
			if( !id ) return false
			return !this.joined( id )
		}

		@ $mol_mem
		sources() {
			const sources: Record< string, string > = {}
			const my = this.Account().my_lord()
			for( const id of this.ids() ) {
				for( const lord of this.lords( id ) ) {
					if( lord === my ) continue
					if( sources[ lord ] ) continue
					sources[ lord ] = id
				}
			}
			return sources
		}

		@ $mol_mem
		people() {
			return Object.keys( this.sources() )
		}

		@ $mol_mem_key
		source_title( lord: string ) {
			if( this.ids().length < 2 ) return ''
			const id = this.sources()[ lord ]
			return id ? this.title( id ) : ''
		}

		pass_of( lord: string ) {
			for( const id of this.ids() ) {
				const str = ()=> String( this.store( id ).Keys()?.key( lord )?.Pass()?.val() ?? '' )
				const pass = $bog_gram_soft( ()=> $bog_gram_pass.verified( lord, str() ), null )
				if( pass ) return pass
			}
			return null
		}

	}

}
