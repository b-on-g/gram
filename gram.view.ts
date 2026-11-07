namespace $.$$ {

	export class $bog_gram extends $.$bog_gram {

		@ $mol_mem
		saved_preview() {
			const id = this.saved_id()
			if( !id ) return ''
			return $bog_gram_soft( ()=> this.dialog_preview( id ), '' )
		}

		@ $mol_mem
		saved_time() {
			const id = this.saved_id()
			if( !id ) return ''
			return $bog_gram_soft( ()=> this.dialog_time( id ), '' )
		}

		@ $mol_mem
		saved_current_is() {
			return this.saved_is( this.dialog_active() )
		}

		@ $mol_action
		saved_open( next?: any ) {
			this.dialog_select( this.saved_land().link().str )
			return null
		}

		owner_me( id: string ) {
			return this.dialog_own( id )
		}

		admin_is( id: string, lord: string ) {
			return this.Talk().admin_is( id, lord )
		}

		@ $mol_mem
		override archive_fresh() {
			return this.Talk().fresh_first( this.archive_ids() )
		}

		override request_is( id: string ) {
			return this.dialog_kind( id ) === 'request'
		}

		@ $mol_action
		override dialog_archive( id: string, next?: any ) {
			this.Roster().archive( id )
			return null
		}

		@ $mol_action
		override dialog_unarchive( id: string, next?: any ) {
			this.Roster().unarchive( id )
			return null
		}

		@ $mol_action
		override request_accept( id: string, next?: any ) {
			if( !id ) return null
			this.peer_accept( this.dialog_owner( id ) )
			return null
		}

		@ $mol_mem
		dialog_current( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem_key
		dialog_current_is( id: string ) {
			return this.dialog_active() === id
		}

		@ $mol_action
		dialog_select( id: string, next?: any ) {
			this.Alerts().offer()
			this.compose_opened( false )
			this.settings_opened( false )
			this.group_opened( false )
			this.members_opened( false )
			this.dialog_current( id )
			return null
		}

		@ $mol_action
		dialog_close( next?: any ) {
			this.members_opened( false )
			this.dialog_current( '' )
			return null
		}

		@ $mol_action
		override dialog_delete( id: string, next?: any ) {

			if( !id ) return null
			if( this.saved_is( id ) ) return null

			const active = this.dialog_current() === id
			this.Roster().drop( id )
			if( active ) this.dialog_current( '' )

			return null
		}

		@ $mol_mem
		dialog_active() {
			const current = this.dialog_current()
			if( !current ) return ''
			if( this.saved_is( current ) ) return current
			if( this.dialog_ids().includes( current ) ) return current
			return ''
		}

		override chat_dialog( id: string ) {
			return id
		}

		@ $mol_mem
		compose_opened( next?: boolean ) {
			return next ?? false
		}

		@ $mol_mem
		settings_opened( next?: boolean ) {
			return next ?? false
		}

		@ $mol_mem
		group_opened( next?: boolean ) {
			return next ?? false
		}

		@ $mol_mem
		members_opened( next?: boolean ) {
			return next ?? false
		}

		@ $mol_action
		compose_open( next?: any ) {
			const open = !this.compose_opened()
			this.settings_opened( false )
			this.group_opened( false )
			this.compose_opened( open )
			return null
		}

		@ $mol_action
		compose_close( next?: any ) {
			this.compose_opened( false )
			return null
		}

		@ $mol_action
		settings_open( next?: any ) {
			const open = !this.settings_opened()
			this.compose_opened( false )
			this.group_opened( false )
			this.settings_opened( open )
			return null
		}

		@ $mol_action
		settings_close( next?: any ) {
			this.settings_opened( false )
			return null
		}

		@ $mol_action
		group_open( next?: any ) {
			const open = !this.group_opened()
			this.compose_opened( false )
			this.settings_opened( false )
			this.group_opened( open )
			return null
		}

		@ $mol_action
		group_close( next?: any ) {
			this.group_opened( false )
			return null
		}

		members_shown() {
			const id = this.dialog_active()
			return Boolean( id ) && this.group_is( id )
		}

		@ $mol_action
		members_open( next?: any ) {
			this.members_opened( !this.members_opened() )
			this.member_error( '' )
			return null
		}

		@ $mol_action
		members_close( next?: any ) {
			this.members_opened( false )
			return null
		}

		@ $mol_mem
		music_opened( next?: boolean ) {
			return next ?? false
		}

		@ $mol_mem
		music_alive( next?: boolean ) {
			return next ?? false
		}

		override music_hidden() {
			return !this.music_opened()
		}

		@ $mol_action
		music_open( next?: any ) {
			const open = !this.music_opened()
			this.music_alive( true )
			this.music_opened( open )
			if( open ) this.Music_page().bring()
			return null
		}

		@ $mol_action
		music_close( next?: any ) {
			this.music_opened( false )
			return null
		}

		override lights() {
			const theme = this.Theme()
			if( theme.mode() === 'system' ) return 'system'
			return theme.is_light_now() ? 'light' : 'dark'
		}

		override pages() {
			const active = this.dialog_active()
			return [
				this.Menu(),
				... this.settings_opened() ? [ this.Settings_page() ] : [],
				... this.compose_opened() ? [ this.Compose_page() ] : [],
				... this.group_opened() ? [ this.Group_page() ] : [],
				... active ? [ this.Chat_page( active ) ] : [],
				... this.members_opened() && this.members_shown() ? [ this.Members_page() ] : [],
				... this.music_alive() ? [ this.Music_page() ] : [],
			]
		}

		override Placeholder() {
			return this.dialog_active() || this.music_opened() ? null! : super.Placeholder()
		}

		@ $mol_action
		override dialog_open( lord: string, next?: any ) {
			if( !lord ) return null
			this.peer_accept( lord )
			const exist = this.dialog_with( lord )
			if( exist ) this.dialog_select( exist )
			else this.dialog_pending( lord )
			return null
		}

		@ $mol_mem
		dialog_autocreate() {
			const peer = this.Invite().ready()
			if( peer ) $mol_wire_async( this ).dialog_create( peer )
			return peer
		}

		dialog_create( peer: string ) {

			const id = this.Roster().create( peer )
			if( !id ) return null

			this.dialog_current( id )
			this.compose_opened( false )
			this.dialog_pending( '' )
			this.Invite().done()

			return id
		}

		@ $mol_action
		override group_make( next?: any ) {
			const picked = this.group_picked()
			if( !picked.length ) return null
			$mol_wire_async( this ).group_create( this.group_name().trim(), picked, this.group_lost().length > 0 )
			return null
		}

		group_create( title: string, lords: readonly string[], forced: boolean ) {

			const id = this.Crew().draft_build( title, lords, forced )
			if( !id ) return ''

			this.group_opened( false )
			this.dialog_current( id )

			return id
		}

		@ $mol_mem
		override member_lords() {
			const id = this.dialog_active()
			if( !id ) return [] as string[]
			return $bog_gram_soft( ()=> this.dialog_lords( id ), [] as string[] )
		}

		@ $mol_mem_key
		override member_status( lord: string ) {
			const id = this.dialog_active()
			if( !id ) return ''
			if( this.dialog_owner( id ) === lord ) return 'создатель'
			return this.admin_is( id, lord ) ? 'админ' : ''
		}

		override members_admin() {
			return this.admin_me( this.dialog_active() )
		}

		override members_owner() {
			return this.owner_me( this.dialog_active() )
		}

		override member_admin( lord: string ) {
			return this.admin_is( this.dialog_active(), lord )
		}

		override members_asks() {
			return this.Lobby().asks_of( this.dialog_active() )
		}

		@ $mol_mem
		override member_candidates() {
			const inside = new Set( this.member_lords() )
			return this.contact_lords().filter( lord => !inside.has( lord ) )
		}

		@ $mol_action
		override member_add( lord: string, next?: any ) {
			const id = this.dialog_active()
			if( !id || !lord ) return null
			$mol_wire_async( this.Crew() ).join( id, lord, this.member_history() )
			return null
		}

		@ $mol_action
		override member_drop( lord: string, next?: any ) {
			const id = this.dialog_active()
			if( !id || !lord ) return null
			$mol_wire_async( this.Crew() ).part( id, lord )
			return null
		}

		@ $mol_action
		override member_raise( lord: string, next?: any ) {
			const id = this.dialog_active()
			if( !id || !lord ) return null
			$mol_wire_async( this.Crew() ).promote( id, lord )
			return null
		}

		@ $mol_action
		override ask_accept( entry: string, next?: any ) {
			if( !entry ) return null
			$mol_wire_async( this.Lobby() ).apply( entry, this.member_history() )
			return null
		}

		@ $mol_action
		override ask_reject( entry: string, next?: any ) {
			if( !entry ) return null
			$mol_wire_async( this.Lobby() ).deny( entry )
			return null
		}

		@ $mol_action
		override group_leave( next?: any ) {
			const id = this.dialog_active()
			this.members_opened( false )
			this.dialog_delete( id )
			return null
		}

		@ $mol_mem_key
		unread_count( id: string ) {
			if( id === this.dialog_active() ) return 0
			return this.unread_total( id )
		}

		@ $mol_mem
		invite_handle() {
			const lord = this.Invite().lord()
			if( !lord ) return ''
			$mol_wire_async( this ).invite_accept( lord, this.Invite().key() )
			return lord
		}

		invite_accept( lord: string, key: string ) {
			const { plan, exist } = this.Invite().take( lord, key )
			if( plan === 'open' ) this.dialog_select( exist )
			return plan
		}

		override join_link() {
			return this.Lobby().join_uri( this.dialog_active() )
		}

		@ $mol_mem
		join_handle() {
			const id = this.Lobby().join_id()
			if( !id ) return ''
			$mol_wire_async( this ).join_request( id, this.Lobby().join_by() )
			return id
		}

		join_request( id: string, by: string ) {
			const plan = this.Lobby().join_take( id, by )
			if( plan === 'open' ) this.dialog_select( id )
			return plan
		}

		override auto() {
			super.auto()
			$bog_gram_soft( ()=> this.account_ready(), null )
			$bog_gram_soft( ()=> this.registry_remember(), null )
			$bog_gram_soft( ()=> this.registry_keys_fill(), null )
			$bog_gram_soft( ()=> this.invite_handle(), '' )
			$bog_gram_soft( ()=> this.join_handle(), '' )
			$bog_gram_soft( ()=> this.dialog_autocreate(), '' )
			$bog_gram_soft( ()=> this.pending_timer(), null )
			$bog_gram_soft( ()=> this.notify_auto(), null )
			$bog_gram_soft( ()=> this.outbox_flush(), null )
			$bog_gram_soft( ()=> this.asks_flush(), null )
			$bog_gram_soft( ()=> this.denies_merge(), null )
			$bog_gram_soft( ()=> this.inbox_merge(), null )
			$bog_gram_soft( ()=> this.monitor_fill(), null )
		}

	}

}
