namespace $ {

	export class $bog_gram_people extends $mol_object {

		@ $mol_mem
		Account() {
			return this.$.$bog_gram_account.make({ $: this.$ })
		}

		@ $mol_mem
		Registry() {
			return this.$.$bog_gram_registry.make({ $: this.$ })
		}

		store( lord: string ) {
			return this.$.$giper_baza_glob.Land( new $giper_baza_link( lord ) ).Data( $bog_gram_user )
		}

		@ $mol_mem
		Roster() {
			return this.$.$bog_gram_roster.make({ $: this.$ })
		}

		@ $mol_mem_key
		name( lord: string ) {
			const shared = $bog_gram_soft( ()=> this.Roster().names()[ lord ] ?? '', '' )
			if( shared ) return shared
			return $bog_gram_soft( ()=> String( this.store( lord ).Name()?.val() ?? '' ), '' )
		}

		inbox( lord: string ) {
			return String( this.store( lord ).Inbox_land()?.val() ?? '' )
		}

		@ $mol_mem_key
		note( lord: string ) {
			if( !lord ) return ''
			return this.Account().dialogs_store().Notes()?.key( lord )?.Title()?.val() ?? ''
		}

		@ $mol_action
		note_set( lord: string, next?: string ) {

			if( !lord ) return null

			const title = next ?? ''
			const notes = this.Account().dialogs_store().Notes( 'auto' )
			if( !notes ) return null
			if( !title && !notes.key( lord ) ) return null

			notes.key( lord, 'auto' )?.Title( 'auto' )?.val( title )

			return null
		}

		label( lord: string ) {
			return $bog_gram_lord.label( lord, this.note( lord ), this.name( lord ) )
		}

		@ $mol_mem
		accepted() {
			return this.Account().decided( 'accepted' )
		}

		@ $mol_mem_key
		known( lord: string ) {
			if( !lord ) return false
			if( this.accepted().includes( lord ) ) return true
			return Boolean( this.Registry().sources()[ lord ] )
		}

		@ $mol_action
		accept( lord: string ) {
			if( !lord ) return null
			if( lord === this.Account().my_lord() ) return null
			if( !$giper_baza_link.check( lord ) ) return null
			if( this.accepted().includes( lord ) ) return null
			this.Account().decide( 'accepted', lord )
			return null
		}

		@ $mol_mem_key
		pass_given( lord: string, next?: $giper_baza_auth_pass | null ) {
			return next ?? null
		}

		@ $mol_mem_key
		pass_stored( lord: string ) {
			for( const str of this.Account().dialogs_store().Passes()?.items() ?? [] ) {
				try {
					const pass = $bog_gram_pass.parse( String( str ) )
					if( pass.lord().str === lord ) return pass
				} catch( error ) {
					if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				}
			}
			return null
		}

		@ $mol_mem_key
		pass_shared( lord: string ) {

			const link = new $giper_baza_link( lord )
			const roster = this.Roster()
			const talk = roster.Talk()

			for( const id of $bog_gram_soft( ()=> roster.ids(), [] as string[] ) ) {
				const links = [ id, ... $bog_gram_soft( ()=> talk.links_of( id ), [] as readonly string[] ) ]
				for( const land of links ) {
					const pass = talk.land( land ).lord_pass( link )
					if( pass?.lord().str === lord ) return pass
				}
			}

			return null
		}

		pass_learn( lord: string, key: string ) {
			if( !lord || !key ) return null
			const pass = $bog_gram_pass.verified( lord, key )
			if( !pass ) return null
			this.pass_given( lord, pass )
			if( !this.pass_stored( lord ) ) this.Account().dialogs_store().Passes( 'auto' )!.add( pass.toString() )
			return pass
		}

		pass_of( lord: string ): $giper_baza_auth_pass | null {

			if( !lord ) return null

			const given = this.pass_given( lord )
			if( given ) return given

			try {
				const stored = this.pass_stored( lord )
				if( stored ) return stored
			} catch( error ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				$mol_fail_log( error )
			}

			const shared = this.pass_shared( lord )
			if( shared ) return shared

			const land = this.$.$giper_baza_glob.Land( new $giper_baza_link( lord ) )
			$bog_gram_soft( ()=> ( land.sync(), true ), false )

			return land.king_pass() ?? this.Registry().pass_of( lord )
		}

		passes_of( lords: readonly string[] ) {
			const passes: $giper_baza_auth_pass[] = []
			for( const lord of lords ) {
				const pass = this.pass_of( lord )
				if( pass ) passes.push( pass )
			}
			return passes
		}

	}

}
