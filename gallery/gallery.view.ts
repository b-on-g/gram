namespace $.$$ {

	export class $bog_gram_gallery extends $.$bog_gram_gallery {

		static step( ids: readonly string[], current: string, dir: number ) {
			const index = ids.indexOf( current )
			if( index < 0 ) return current
			return ids[ index + dir ] ?? current
		}

		static settle( shift: number, speed: number, width: number ) {
			if( speed < -0.3 ) return 1
			if( speed > 0.3 ) return -1
			if( shift < -width / 4 ) return 1
			if( shift > width / 4 ) return -1
			return 0
		}

		static drop_settle( drop: number, speed: number, height: number ) {
			return speed > 0.3 || drop > height / 5
		}

		index() {
			return this.ids().indexOf( this.current() )
		}

		near( dir: number ) {
			return $bog_gram_gallery.step( this.ids(), this.current(), dir )
		}

		@ $mol_action
		go( dir: number ) {
			const id = this.near( dir )
			if( id !== this.current() ) this.current( id )
		}

		@ $mol_action
		override prev( next?: any ) {
			this.go( -1 )
			return null
		}

		@ $mol_action
		override next( next?: any ) {
			this.go( 1 )
			return null
		}

		@ $mol_mem
		override slides() {
			const current = this.current()
			if( !current ) return []
			const ids = new Set([ this.near( -1 ), current, this.near( 1 ) ])
			return [ ... ids ].map( id => this.Slide( id ) )
		}

		override slide_offset( id: string ) {
			return this.ids().indexOf( id ) - this.index()
		}

		override counter() {
			return $bog_gram_text_fill( this.counter_pattern(), {
				index: this.index() + 1,
				count: this.ids().length,
			} )
		}

		override Prev() {
			return this.near( -1 ) === this.current() ? null! : super.Prev()
		}

		override Next() {
			return this.near( 1 ) === this.current() ? null! : super.Next()
		}

		@ $mol_mem
		shift( next?: number ) {
			return next ?? 0
		}

		@ $mol_mem
		drop( next?: number ) {
			return next ?? 0
		}

		@ $mol_mem
		override dragging( next?: boolean ) {
			return next ?? false
		}

		height = 0

		override style() {
			const fade = this.height ? Math.max( 0, 1 - this.drop() / this.height ) : 1
			return {
				... super.style(),
				'--bog_gram_gallery_shift': this.shift() + 'px',
				'--bog_gram_gallery_drop': this.drop() + 'px',
				'--bog_gram_gallery_fade': String( fade ),
			}
		}

		swipe_from = null as null | {
			x: number
			y: number
			time: number
			axis: 'wait' | 'x' | 'y'
			speed: number
			width: number
		}

		swipe_moved = false

		swipe_axis( dx: number, dy: number ) {
			if( Math.abs( dx ) < 8 && Math.abs( dy ) < 8 ) return 'wait'
			if( Math.abs( dx ) > Math.abs( dy ) ) return 'x'
			return dy > 0 ? 'y' : 'skip'
		}

		override swipe_start( event?: PointerEvent ) {

			this.swipe_moved = false
			if( !event || event.pointerType === 'mouse' ) return null
			if( ( event.target as Element ).closest?.( '[mol_button]' ) ) return null

			const rect = this.view_rect()
			this.height = rect?.height ?? 0
			this.swipe_from = {
				x: event.clientX,
				y: event.clientY,
				time: event.timeStamp,
				axis: 'wait',
				speed: 0,
				width: rect?.width ?? 0,
			}

			return null
		}

		override swipe_move( event?: PointerEvent ) {

			const from = this.swipe_from
			if( !event || !from ) return null

			const dx = event.clientX - from.x
			const dy = event.clientY - from.y

			if( from.axis === 'wait' ) {

				const axis = this.swipe_axis( dx, dy )
				if( axis === 'wait' ) return null
				if( axis === 'skip' ) {
					this.swipe_from = null
					return null
				}

				from.axis = axis
				this.swipe_moved = true
				this.dragging( true )
				;( this.dom_node() as HTMLElement ).setPointerCapture?.( event.pointerId )

			}

			const time = Math.max( 1, event.timeStamp - from.time )
			from.time = event.timeStamp

			if( from.axis === 'x' ) {
				const edge = this.near( dx > 0 ? -1 : 1 ) === this.current()
				const next = edge ? dx / 3 : dx
				from.speed = ( next - this.shift() ) / time
				this.shift( next )
			} else {
				const next = Math.max( 0, dy )
				from.speed = ( next - this.drop() ) / time
				this.drop( next )
			}

			return null
		}

		override swipe_end( event?: PointerEvent ) {

			const from = this.swipe_from
			this.swipe_from = null
			if( !from || from.axis === 'wait' ) return null

			this.dragging( false )

			if( from.axis === 'x' ) {
				const dir = $bog_gram_gallery.settle( this.shift(), from.speed, from.width )
				if( dir ) this.go( dir )
				this.shift( 0 )
				return null
			}

			if( $bog_gram_gallery.drop_settle( this.drop(), from.speed, this.height ) ) {
				this.drop( 0 )
				this.close( null )
				return null
			}

			this.drop( 0 )
			return null
		}

		override swipe_cancel( event?: PointerEvent ) {
			if( this.swipe_from ) this.swipe_from.speed = 0
			return this.swipe_end( event )
		}

		wheel_sum = 0
		wheel_done = false
		wheel_idle = null as $mol_after_timeout | null

		override swipe_wheel( event?: WheelEvent ) {

			if( !event ) return null
			if( Math.abs( event.deltaX ) <= Math.abs( event.deltaY ) ) return null

			event.preventDefault()

			this.wheel_idle?.destructor()
			this.wheel_idle = new this.$.$mol_after_timeout( 200, ()=> {
				this.wheel_sum = 0
				this.wheel_done = false
			} )

			if( this.wheel_done ) return null

			this.wheel_sum += event.deltaX
			if( Math.abs( this.wheel_sum ) < 40 ) return null

			this.wheel_done = true
			this.go( this.wheel_sum > 0 ? 1 : -1 )

			return null
		}

		override back_click( event?: MouseEvent ) {

			if( this.swipe_moved ) {
				this.swipe_moved = false
				return null
			}

			const target = event?.target as Element | undefined
			if( !target ) return null
			if( target.closest?.( '[mol_button]' ) ) return null
			if( target.closest?.( '[bog_gram_gallery_slide]' ) ) return null

			this.close( null )
			return null
		}

		@ $mol_mem
		focus_grab() {
			return new this.$.$mol_after_frame( ()=> this.focused( true ) )
		}

		override auto() {
			this.view_rect()
			this.focus_grab()
		}

	}

}
