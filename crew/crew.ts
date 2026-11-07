namespace $ {

	export class $bog_gram_crew extends $mol_object {

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
		error( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		draft_name( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		draft_picked( next?: readonly string[] ) {
			return next ?? [] as readonly string[]
		}

		@ $mol_mem
		draft_lost( next?: readonly string[] ) {
			return next ?? [] as readonly string[]
		}

		@ $mol_mem
		draft_id( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		draft_error( next?: string ) {
			return next ?? ''
		}

		@ $mol_action
		draft_pick( lord: string, next?: any ) {
			if( !lord ) return null
			const picked = this.draft_picked()
			this.draft_lost( [] )
			this.draft_picked( picked.includes( lord ) ? picked.filter( item => item !== lord ) : [ ... picked, lord ] )
			return null
		}

		@ $mol_action
		draft_drop( lord: string, next?: any ) {
			if( !lord ) return null
			this.draft_lost( [] )
			this.draft_picked( this.draft_picked().filter( item => item !== lord ) )
			return null
		}

		@ $mol_action
		draft_id_add( next?: any ) {

			const lord = this.draft_id().trim()
			if( !lord ) return null

			if( lord === this.Account().my_lord() ) {
				this.draft_error( 'Это ваш собственный идентификатор' )
				return null
			}

			if( !$giper_baza_link.check( lord ) ) {
				this.draft_error( 'Это не похоже на идентификатор' )
				return null
			}

			this.draft_error( '' )
			this.draft_id( '' )
			if( !this.draft_picked().includes( lord ) ) this.draft_pick( lord )

			return null
		}

		draft_build( title: string, lords: readonly string[], forced: boolean ) {

			const { id, lost } = this.group_make( title, lords, forced )
			this.draft_lost( lost )
			if( !id ) return ''

			this.draft_picked( [] )
			this.draft_name( '' )
			this.draft_id( '' )
			this.draft_error( '' )

			return id
		}

		grab() {
			return this.$.$giper_baza_glob.land_grab([ [ null, $giper_baza_rank_deny ] ])
		}

		watch( link: string ) {
			this.Account().monitor_store().Watch( 'auto' )!.add( link )
		}

		invite( lord: string, id: string ) {
			this.People().accept( lord )
			this.Account().dialogs_store().Outbox( 'auto' )!.add( lord + '|' + id )
		}

		stay( id: string, lord: string ) {
			const mates = this.Talk().mates( id ).filter( mate => mate !== lord )
			const stay: [ string, $giper_baza_auth_pass ][] = []
			for( const mate of mates ) {
				const pass = this.People().pass_of( mate )
				if( pass ) stay.push( [ mate, pass ] )
			}
			return stay.length < mates.length ? null : stay
		}

		group_make( title: string, lords: readonly string[], forced: boolean ) {

			const my = this.Account().my_lord()

			const known: string[] = []
			const passes: $giper_baza_auth_pass[] = []
			const lost: string[] = []

			for( const lord of lords ) {
				if( !lord || lord === my ) continue
				const pass = this.People().pass_of( lord )
				if( pass ) {
					known.push( lord )
					passes.push( pass )
				} else {
					lost.push( lord )
				}
			}

			if( lost.length && !forced ) return { id: '', lost }
			if( !known.length ) return { id: '', lost: [] as string[] }

			const dialog_land = this.grab()
			const session_land = this.grab()

			for( const pass of passes ) {
				dialog_land.give( pass, $giper_baza_rank_post( 'fast' ) )
				session_land.give( pass, $giper_baza_rank_post( 'fast' ) )
			}

			const id = dialog_land.link().str
			const session = session_land.link().str

			const dialog = dialog_land.Data( $bog_gram_dialog )
			dialog.Peers( 'auto' )!.add( my )
			for( const lord of known ) dialog.Peers( 'auto' )!.add( lord )
			dialog.Sessions( 'auto' )!.add( session )
			dialog.Session_last( 'auto' )?.val( session )
			dialog.Created( 'auto' )?.val( Date.now() )
			dialog.Owner( 'auto' )?.val( my )
			if( title ) dialog.Title( 'auto' )?.val( title )

			session_land.Data( $bog_gram_session ).Dialog_land( 'auto' )?.val( id )

			this.Account().dialogs_store().Dialogs( 'auto' )!.add( id )
			this.watch( session )
			for( const lord of known ) this.invite( lord, id )

			return { id, lost: [] as string[] }
		}

		join( id: string, lord: string, history: boolean, known?: $giper_baza_auth_pass | null ) {

			const talk = this.Talk()

			if( !id || !lord ) return ''
			if( lord === this.Account().my_lord() ) return ''
			if( !talk.admin_me( id ) ) return ''

			const pass = known ?? this.People().pass_of( lord )
			if( !pass ) {
				this.error( 'Не нашли ключ этого человека: без ключа он не прочитает переписку' )
				return ''
			}

			const links = talk.links_of( id )

			const stay = history ? [] : this.stay( id, lord )
			if( !stay ) {
				this.error( 'Не нашли ключей всех участников: новый отсек переписки без них не завести' )
				return ''
			}

			const fresh = history ? null : this.grab()

			const dialog_land = talk.land( id )
			dialog_land.give( pass, talk.member_rank( id, lord ) )

			if( fresh ) {
				for( const [ mate, mate_pass ] of stay ) fresh.give( mate_pass, talk.member_rank( id, mate ) )
				fresh.give( pass, talk.member_rank( id, lord ) )
			} else {
				for( const link of links ) talk.land( link ).give( pass, talk.member_rank( id, lord ) )
			}

			const dialog = dialog_land.Data( $bog_gram_dialog )
			dialog.Peers( 'auto' )!.add( lord )

			if( fresh ) {
				dialog.Sessions( 'auto' )!.add( fresh.link().str )
				dialog.Session_last( 'auto' )?.val( fresh.link().str )
				fresh.Data( $bog_gram_session ).Dialog_land( 'auto' )?.val( id )
				this.watch( fresh.link().str )
			}

			this.invite( lord, id )
			this.error( '' )

			return lord
		}

		part( id: string, lord: string ) {

			const talk = this.Talk()

			if( !id || !lord ) return ''
			if( lord === this.Account().my_lord() ) return ''
			if( !talk.admin_me( id ) ) return ''

			const stay = this.stay( id, lord )
			if( !stay ) {
				this.error( 'Не нашли ключей всех участников: новый отсек переписки без них не завести' )
				return ''
			}

			const fresh = this.grab()
			for( const [ mate, mate_pass ] of stay ) fresh.give( mate_pass, talk.member_rank( id, mate ) )

			const dialog = talk.store( id )
			dialog.Sessions( 'auto' )!.add( fresh.link().str )
			dialog.Session_last( 'auto' )?.val( fresh.link().str )
			dialog.Peers( 'auto' )!.cut( lord )
			if( talk.admins( id ).includes( lord ) ) dialog.Admins( 'auto' )!.cut( lord )

			fresh.Data( $bog_gram_session ).Dialog_land( 'auto' )?.val( id )
			this.watch( fresh.link().str )
			this.error( '' )

			return lord
		}

		promote( id: string, lord: string ) {

			const talk = this.Talk()

			if( !id || !lord ) return ''
			if( !talk.own( id ) ) return ''

			const pass = this.People().pass_of( lord )
			if( !pass ) {
				this.error( 'Не нашли ключ этого человека: права ему не выдать' )
				return ''
			}

			const links = talk.links_of( id )
			const dialog_land = talk.land( id )

			dialog_land.give( pass, $giper_baza_rank_rule )
			for( const link of links ) talk.land( link ).give( pass, $giper_baza_rank_rule )

			dialog_land.Data( $bog_gram_dialog ).Admins( 'auto' )!.add( lord )
			this.error( '' )

			return lord
		}

	}

}
