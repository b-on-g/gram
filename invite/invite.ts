namespace $ {

	const wait = 15000

	export class $bog_gram_invite extends $mol_object {

		@ $mol_mem
		Account() {
			return this.$.$bog_gram_account.make({ $: this.$ })
		}

		@ $mol_mem
		People() {
			return this.$.$bog_gram_people.make({ $: this.$ })
		}

		@ $mol_mem
		Roster() {
			return this.$.$bog_gram_roster.make({ $: this.$ })
		}

		uri( lord: string, key: string ) {
			if( !lord ) return ''
			return this.$.$mol_state_arg.make_link( key ? { invite: lord, key } : { invite: lord } )
		}

		link() {
			return this.uri( this.Account().my_lord(), this.Account().my_pass() )
		}

		lord() {
			return this.$.$mol_state_arg.value( 'invite' ) ?? ''
		}

		key() {
			return this.$.$mol_state_arg.value( 'key' ) ?? ''
		}

		plan( lord: string, my: string, exist: string ): 'skip' | 'bad' | 'open' | 'start' {
			if( !lord ) return 'skip'
			if( lord === my ) return 'skip'
			if( !$bog_gram_lord.check( lord ) ) return 'bad'
			return exist ? 'open' : 'start'
		}

		@ $mol_mem
		lost( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		pending( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		late( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		timer() {
			const peer = this.pending()
			if( !peer ) return null
			return new this.$.$mol_after_timeout( wait, ()=> this.late( peer ) )
		}

		take( lord: string, key: string ) {

			if( !lord ) return { plan: 'skip' as const, exist: '' }

			const exist = this.Roster().with( lord )
			const plan = this.plan( lord, this.Account().my_lord(), exist )

			this.lost( plan === 'bad' ? lord : '' )

			if( plan === 'open' || plan === 'start' ) {
				this.People().pass_learn( lord, key )
				this.People().accept( lord )
			}

			if( plan === 'start' ) this.pending( lord )
			else this.done()

			return { plan, exist }
		}

		@ $mol_mem
		ready() {
			const peer = this.pending()
			if( !peer ) return ''
			return this.People().pass_of( peer ) ? peer : ''
		}

		done() {
			this.late( '' )
			this.$.$mol_state_arg.value( 'invite', null )
			this.$.$mol_state_arg.value( 'key', null )
		}

		@ $mol_action
		drop( next?: any ) {
			this.pending( '' )
			this.lost( '' )
			this.done()
			return null
		}

		@ $mol_mem
		plate() {

			if( this.lost() ) return 'Ссылка на диалог битая — попросите свежую'

			const peer = this.pending()
			if( !peer ) return ''

			if( this.late() !== peer ) return 'Открываем диалог — ищем ключ собеседника'

			return 'Ключ собеседника не нашёлся: скорее всего, он ещё не заходил в Gram или подключён к другому мастеру. Попросите свежую ссылку'
		}

	}

}
