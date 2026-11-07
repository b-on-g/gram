namespace $.$$ {

	export class $bog_gram_members extends $.$bog_gram_members {

		override person( lord: string ) {
			return lord
		}

		override tint( lord: string ) {
			return $bog_gram_lord.tint( lord )
		}

		@ $mol_mem
		override member_rows() {
			return this.lords().map( lord => this.Member_row( lord ) )
		}

		@ $mol_mem_key
		override member_title( lord: string ) {
			if( lord === this.me() ) return 'Вы'
			return this.label( lord )
		}

		override Drop_note() {
			return this.admin() ? super.Drop_note() : null!
		}

		override Rule( lord: string ) {
			if( !this.owner() ) return null!
			if( lord === this.me() ) return null!
			if( this.admin_is( lord ) ) return null!
			return super.Rule( lord )
		}

		override Drop( lord: string ) {
			if( !this.admin() ) return null!
			if( lord === this.me() ) return null!
			return super.Drop( lord )
		}

		@ $mol_mem_key
		override drop_hint( lord: string ) {
			return this.armed( lord ) ? 'Точно убрать? Прошлые сообщения у него останутся' : 'Убрать из группы'
		}

		@ $mol_action
		disarm() {
			for( const lord of this.lords() ) this.armed( lord, false )
		}

		@ $mol_action
		override drop_click( lord: string, next?: any ) {
			if( !lord ) return null
			if( !this.armed( lord ) ) {
				this.disarm()
				this.armed( lord, true )
				return null
			}
			this.armed( lord, false )
			this.part( lord, null )
			return null
		}

		@ $mol_action
		override rule_click( lord: string, next?: any ) {
			if( !lord ) return null
			this.promote( lord, null )
			return null
		}

		override history_shut() {
			return !this.history()
		}

		override history_open() {
			return this.history()
		}

		@ $mol_action
		override history_all( next?: any ) {
			this.history( true )
			return null
		}

		@ $mol_action
		override history_new( next?: any ) {
			this.history( false )
			return null
		}

		override history_note() {
			return this.history()
				? 'Новый участник получит ключи от всех прошлых сообщений группы'
				: 'Заведём новый отсек переписки: прошлое останется закрытым, и все увидят только то, что напишут дальше'
		}

		@ $mol_mem
		override pick_rows() {
			return this.candidates().map( lord => this.Pick_row( lord ) )
		}

		@ $mol_action
		override id_add( next?: any ) {

			const lord = this.id().trim()
			if( !lord ) return null

			if( lord === this.me() ) {
				this.error( 'Это ваш собственный идентификатор' )
				return null
			}

			if( !$giper_baza_link.check( lord ) ) {
				this.error( 'Это не похоже на идентификатор' )
				return null
			}

			this.error( '' )
			this.id( '' )
			this.add( lord, null )

			return null
		}

		override asks_head() {
			return 'Заявки: ' + this.asks().length
		}

		@ $mol_mem
		override ask_rows() {
			return this.asks().map( entry => this.Ask_row( entry ) )
		}

		override ask_tint( entry: string ) {
			return $bog_gram_lord.tint( this.ask_lord( entry ) )
		}

		@ $mol_mem_key
		override ask_title( entry: string ) {
			return this.label( this.ask_lord( entry ) )
		}

		@ $mol_mem_key
		override ask_status( entry: string ) {
			return $bog_gram_lord.short( this.ask_lord( entry ) )
		}

		@ $mol_mem
		override add_rows() {
			if( !this.admin() ) return []
			return [
				this.Add_title(),
				this.History(),
				... this.error() ? [ this.Error() ] : [],
				this.Join(),
				... this.asks().length ? [ this.Asks_head(), this.Asks_list() ] : [],
				this.Id_form(),
				this.Pick_list(),
				... this.owner() ? [ this.Admin_note() ] : [],
			]
		}

		override leave_label() {
			return this.leave_armed() ? 'Точно выйти?' : 'Выйти из группы'
		}

		@ $mol_action
		override leave_click( next?: any ) {
			if( !this.leave_armed() ) {
				this.leave_armed( true )
				return null
			}
			this.leave_armed( false )
			this.leave( null )
			return null
		}

	}

}
