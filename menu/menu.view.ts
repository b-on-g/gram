namespace $.$$ {

	export class $bog_gram_menu extends $.$bog_gram_menu {

		@ $mol_mem
		archive_opened( next?: boolean ) {
			return next ?? false
		}

		@ $mol_mem
		requests_opened( next?: boolean ) {
			return next ?? false
		}

		@ $mol_mem
		override dialog_rows() {

			const archived = this.archived()
			const requests = this.requests()
			const visible = this.visible()

			const empty = !visible.length && !archived.length && !requests.length

			return [
				... archived.length ? [ this.Archive_row() ] : [],
				... this.archive_opened() ? archived.map( id => this.Dialog_row( id ) ) : [],
				this.Saved_row(),
				... visible.map( id => this.Dialog_row( id ) ),
				... empty ? [ this.Dialogs_empty() ] : [],
				... requests.length ? [ this.Requests_row() ] : [],
				... this.requests_opened() ? requests.map( id => this.Dialog_row( id ) ) : [],
			]
		}

		override Invite_plate() {
			return this.invite_plate_text() ? super.Invite_plate() : null!
		}

		override Ask_plate() {
			return this.ask_plate_text() ? super.Ask_plate() : null!
		}

		override unread_label( id: string ) {
			const count = this.unread( id )
			if( count > 99 ) return '99+'
			return count ? String( count ) : ''
		}

		@ $mol_mem
		armed( next?: string ) {
			return next ?? ''
		}

		override delete_armed( id: string, next?: boolean ) {
			if( next !== undefined ) this.armed( next ? id : '' )
			return this.armed() === id
		}

		override delete_hint( id: string ) {
			return this.delete_armed( id ) ? 'Точно удалить?' : 'Удалить диалог'
		}

		@ $mol_mem
		swiped( next?: string ) {
			return next ?? ''
		}

		override swiped_is( id: string, next?: boolean ) {
			if( next !== undefined ) this.swiped( next ? id : '' )
			return this.swiped() === id
		}

		swipe_close() {
			if( !this.swiped() ) return false
			this.swiped( '' )
			return true
		}

		@ $mol_mem
		Swipe_reset() {
			this.body_scroll_top()
			this.swiped( '' )
			return null
		}

		swipe_outside( event: Event ) {
			const id = this.swiped()
			if( !id ) return
			if( this.Dialog_row( id ).dom_node().contains( event.target as Node ) ) return
			this.swiped( '' )
		}

		swipe_key( event: KeyboardEvent ) {
			if( event.key === 'Escape' ) this.swiped( '' )
		}

		@ $mol_mem
		Swipe_listen() {
			if( !this.swiped() ) return null
			const doc = this.$.$mol_dom_context.document
			const click = new this.$.$mol_dom_listener( doc, 'click', ( event: Event )=> this.swipe_outside( event ) )
			const key = new this.$.$mol_dom_listener( doc, 'keydown', ( event: Event )=> this.swipe_key( event as KeyboardEvent ) )
			return {
				destructor: ()=> {
					click.destructor()
					key.destructor()
				},
			}
		}

		override auto() {
			super.auto()
			this.Swipe_reset()
			this.Swipe_listen()
		}

		@ $mol_action
		override pick( id: string, next?: any ) {
			this.armed( '' )
			if( this.swipe_close() ) return null
			this.select( id, null )
			return null
		}

		@ $mol_action
		override saved_pick( next?: any ) {
			this.armed( '' )
			if( this.swipe_close() ) return null
			this.saved_open( null )
			return null
		}

		@ $mol_action
		override delete_click( id: string, next?: any ) {
			if( !id ) return null
			if( !this.delete_armed( id ) ) {
				this.delete_armed( id, true )
				return null
			}
			this.armed( '' )
			this.drop( id, null )
			return null
		}

		@ $mol_action
		override archive_click( id: string, next?: any ) {
			if( !id ) return null
			this.armed( '' )
			this.swiped( '' )
			if( this.archive_is( id ) ) this.unarchive( id, null )
			else this.archive( id, null )
			return null
		}

		override archive_hint( id: string ) {
			return this.archive_is( id ) ? 'Вернуть из архива' : 'В архив'
		}

		override archive_icons( id: string ) {
			return [ this.archive_is( id ) ? this.Dialog_unarchive_icon( id ) : this.Dialog_archive_icon( id ) ]
		}

		@ $mol_action
		override archive_toggle( next?: any ) {
			this.armed( '' )
			this.archive_opened( !this.archive_opened() )
			return null
		}

		@ $mol_action
		override requests_toggle( next?: any ) {
			this.armed( '' )
			this.requests_opened( !this.requests_opened() )
			return null
		}

		override archive_note() {
			return $bog_gram_count.dialogs( this.archived().length )
		}

		@ $mol_mem
		override archive_unread_label() {
			let count = 0
			for( const id of this.archived() ) count += $bog_gram_soft( ()=> this.unread( id ), 0 )
			return count ? String( count ) : ''
		}

		override requests_count_label() {
			return String( this.requests().length )
		}

		override Dialog_archive( id: string ) {
			if( this.request_is( id ) ) return this.Request_accept( id )
			return super.Dialog_archive( id )
		}

		override Dialog_delete( id: string ) {
			if( this.request_is( id ) ) return this.Request_reject( id )
			return super.Dialog_delete( id )
		}

		@ $mol_action
		override request_accept( id: string, next?: any ) {
			if( !id ) return null
			this.accept( id, null )
			return null
		}

		@ $mol_action
		override request_reject( id: string, next?: any ) {
			if( !id ) return null
			this.drop( id, null )
			return null
		}

	}

}
