namespace $.$$ {

	export type $bog_gram_gallery_point = readonly [ x: number, y: number ]

	export type $bog_gram_gallery_view = {
		id: string
		zoom: number
		pan: $bog_gram_gallery_point
	}

	const zoom_max = 6

	const zoom_tap = 2.5

	const tap_span = 300

	const tap_reach = 30

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

		static zoom_fit( zoom: number ) {
			if( zoom < 1.02 ) return 1
			return Math.min( zoom_max, zoom )
		}

		static pan_zoom( pan: $bog_gram_gallery_point, from: $bog_gram_gallery_point, to: $bog_gram_gallery_point, scale: number ): $bog_gram_gallery_point {
			return [
				to[0] - ( from[0] - pan[0] ) * scale,
				to[1] - ( from[1] - pan[1] ) * scale,
			]
		}

		static pan_fit( pan: $bog_gram_gallery_point, zoom: number, shot: $bog_gram_gallery_point, box: $bog_gram_gallery_point ): $bog_gram_gallery_point {
			const fit = ( axis: 0 | 1 )=> {
				const limit = Math.max( 0, ( shot[ axis ] * zoom - box[ axis ] ) / 2 )
				return Math.max( -limit, Math.min( limit, pan[ axis ] ) )
			}
			return [ fit( 0 ), fit( 1 ) ]
		}

		@ $mol_mem
		view_state( next?: $bog_gram_gallery_view | null ) {
			return next ?? null
		}

		view(): $bog_gram_gallery_view {
			const id = this.current()
			const state = this.view_state()
			return state?.id === id ? state : { id, zoom: 1, pan: [ 0, 0 ] }
		}

		override zoomed() {
			return this.view().zoom > 1
		}

		box_size(): $bog_gram_gallery_point {
			const el = this.dom_node() as HTMLElement
			return [ el.clientWidth, el.clientHeight ]
		}

		shot_size(): $bog_gram_gallery_point {

			const img = this.Slide( this.current() ).dom_node() as HTMLImageElement
			const { offsetWidth, offsetHeight, naturalWidth, naturalHeight } = img
			if( !naturalWidth || !naturalHeight ) return [ offsetWidth, offsetHeight ]

			const scale = Math.min( offsetWidth / naturalWidth, offsetHeight / naturalHeight )

			return [ naturalWidth * scale, naturalHeight * scale ]
		}

		point( event: { clientX: number, clientY: number } ): $bog_gram_gallery_point {
			const { left, top, width, height } = this.dom_node().getBoundingClientRect()
			return [ event.clientX - left - width / 2, event.clientY - top - height / 2 ]
		}

		view_put( zoom: number, pan: $bog_gram_gallery_point ) {
			this.view_state({
				id: this.current(),
				zoom,
				pan: $bog_gram_gallery.pan_fit( pan, zoom, this.shot_size(), this.box_size() ),
			})
		}

		zoom_to( zoom: number, at: $bog_gram_gallery_point, from = this.view(), at_from = at ) {
			const next = $bog_gram_gallery.zoom_fit( zoom )
			this.view_put( next, $bog_gram_gallery.pan_zoom( from.pan, at_from, at, next / from.zoom ) )
		}

		pan_by( dx: number, dy: number ) {
			const { zoom, pan } = this.view()
			this.view_put( zoom, [ pan[0] + dx, pan[1] + dy ] )
		}

		override drag_block( event?: Event ) {
			event?.preventDefault()
			return null
		}

		gesture_from = null as $bog_gram_gallery_view | null

		override gesture_start( event?: Event ) {
			event?.preventDefault()
			this.gesture_from = this.fingers.size ? null : this.view()
			return null
		}

		override gesture_move( event?: Event ) {

			const from = this.gesture_from
			if( !event || !from ) return null

			event.preventDefault()
			const gesture = event as MouseEvent & { scale: number }
			this.zoom_to( from.zoom * gesture.scale, this.point( gesture ), from )

			return null
		}

		fingers = new Map< number, $bog_gram_gallery_point >()

		pinch_from = null as null | { view: $bog_gram_gallery_view, at: $bog_gram_gallery_point, reach: number }

		pinch() {
			const [ a, b ] = [ ... this.fingers.values() ]
			return {
				at: [ ( a[0] + b[0] ) / 2, ( a[1] + b[1] ) / 2 ] as const,
				reach: Math.max( 1, Math.hypot( a[0] - b[0], a[1] - b[1] ) ),
			}
		}

		pinch_begin() {
			this.swipe_from = null
			this.swipe_moved = true
			this.shift( 0 )
			this.drop( 0 )
			this.dragging( true )
			this.pinch_from = { view: this.view(), ... this.pinch() }
		}

		finger_drop( event?: PointerEvent ) {
			if( event ) this.fingers.delete( event.pointerId )
			else this.fingers.clear()
			if( this.fingers.size < 2 ) this.pinch_from = null
			if( !this.fingers.size ) this.dragging( false )
		}

		pan_move( event: PointerEvent, prev: $bog_gram_gallery_point, next: $bog_gram_gallery_point ) {

			if( !this.swipe_moved ) {

				const from = this.pan_from
				if( Math.hypot( next[0] - from[0], next[1] - from[1] ) < 8 ) {
					this.fingers.set( event.pointerId, prev )
					return
				}

				this.swipe_moved = true
				this.dragging( true )
				;( this.dom_node() as HTMLElement ).setPointerCapture?.( event.pointerId )

			}

			this.pan_by( next[0] - prev[0], next[1] - prev[1] )
		}

		pan_from = [ 0, 0 ] as $bog_gram_gallery_point

		tap_last = { time: Number.NEGATIVE_INFINITY, at: [ 0, 0 ] as $bog_gram_gallery_point }

		slide_tap( event: MouseEvent ) {

			const at = this.point( event )
			const last = this.tap_last
			const double = event.timeStamp - last.time < tap_span && Math.hypot( at[0] - last.at[0], at[1] - last.at[1] ) < tap_reach

			this.tap_last = { time: double ? Number.NEGATIVE_INFINITY : event.timeStamp, at }
			if( double ) this.zoom_to( this.zoomed() ? 1 : zoom_tap, at )

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
				'--bog_gram_gallery_zoom': String( this.view().zoom ),
				'--bog_gram_gallery_pan_x': this.view().pan[0] + 'px',
				'--bog_gram_gallery_pan_y': this.view().pan[1] + 'px',
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

			if( !event ) return null
			if( event.isPrimary ) {
				this.swipe_moved = false
				this.finger_drop()
			}
			if( event.button > 0 ) return null
			if( ( event.target as Element ).closest?.( '[mol_button]' ) ) return null

			this.pan_from = this.point( event )
			this.fingers.set( event.pointerId, this.pan_from )

			if( this.fingers.size === 2 ) this.pinch_begin()
			if( this.fingers.size > 1 ) return null
			if( this.zoomed() || event.pointerType === 'mouse' ) return null

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

			if( !event ) return null

			const prev = this.fingers.get( event.pointerId )
			if( !prev ) return null

			const point = this.point( event )
			this.fingers.set( event.pointerId, point )

			const pinch = this.pinch_from
			if( pinch ) {
				const { at, reach } = this.pinch()
				this.zoom_to( pinch.view.zoom * reach / pinch.reach, at, pinch.view, pinch.at )
				return null
			}

			const from = this.swipe_from

			if( !from ) {
				if( this.zoomed() ) this.pan_move( event, prev, point )
				return null
			}

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

			this.finger_drop( event )

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

			event.preventDefault()

			const flat = !event.ctrlKey && Math.abs( event.deltaX ) > Math.abs( event.deltaY )

			if( !flat ) {
				const delta = Math.max( -100, Math.min( 100, event.deltaY * ( event.deltaMode ? 33 : 1 ) ) )
				this.zoom_to( this.view().zoom * Math.exp( - delta * ( event.ctrlKey ? 0.01 : 0.003 ) ), this.point( event ) )
				return null
			}

			if( this.zoomed() ) {
				this.pan_by( - event.deltaX, 0 )
				return null
			}

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
			if( target.closest?.( '[bog_gram_gallery_slide]' ) ) {
				this.slide_tap( event! )
				return null
			}

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
