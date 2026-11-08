namespace $.$$ {

	export class $bog_gram_row extends $.$bog_gram_row {

		override sub() {
			return [
				... this.face(),
				this.Info(),
				... this.marks(),
				... this.tools().length ? [ this.Tools() ] : [],
			]
		}

		face() {
			if( this.Icon() ) return [ this.Sign() ]
			return this.faced() ? [ this.Avatar() ] : []
		}

		override Time() {
			return this.time() ? super.Time() : null!
		}

		override Bottom() {
			return this.note() || this.badge() ? super.Bottom() : null!
		}

		override Note() {
			return this.note() ? super.Note() : null!
		}

		override Badge() {
			return this.badge() ? super.Badge() : null!
		}

		@ $mol_action
		override tools_click( next?: Event ) {
			next?.stopPropagation()
			return null
		}

		override style() {
			return {
				... super.style(),
				'--bog_gram_row_shift': this.swipe_shift() + 'px',
			}
		}

		swipe_from = null as null | {
			x: number
			y: number
			time: number
			base: number
			speed: number
			drag: boolean
		}

		swipe_moved = false

		@ $mol_mem
		swipe_drag( next?: number | null ) {
			return next === undefined ? null : next
		}

		swipe_width = 0

		swipe_shift() {
			const drag = this.swipe_drag()
			if( drag !== null ) return drag
			return this.swipe_open() ? this.swipe_width : 0
		}

		override swipe_dragging() {
			return this.swipe_drag() !== null
		}

		swipe_axis( dx: number, dy: number, base: number ) {
			if( Math.abs( dx ) < 8 && Math.abs( dy ) < 8 ) return 'wait'
			if( Math.abs( dy ) >= Math.abs( dx ) ) return 'skip'
			if( dx < 0 && !base ) return 'skip'
			return 'drag'
		}

		swipe_settle( shift: number, speed: number, width: number ) {
			if( speed > 0.3 ) return true
			if( speed < -0.3 ) return false
			return shift > width / 2
		}

		override swipe_start( event?: PointerEvent ) {

			this.swipe_moved = false
			if( !event || !this.swipe_able() ) return null
			if( event.pointerType === 'mouse' && event.button !== 0 ) return null

			this.swipe_measure()
			this.swipe_from = {
				x: event.clientX,
				y: event.clientY,
				time: event.timeStamp,
				base: this.swipe_shift(),
				speed: 0,
				drag: false,
			}

			return null
		}

		override swipe_move( event?: PointerEvent ) {

			const from = this.swipe_from
			if( !event || !from ) return null

			const dx = event.clientX - from.x
			const dy = event.clientY - from.y

			if( !from.drag ) {

				const axis = this.swipe_axis( dx, dy, from.base )
				if( axis === 'wait' ) return null
				if( axis === 'skip' ) {
					this.swipe_from = null
					return null
				}

				from.drag = true
				this.swipe_moved = true
				;( this.dom_node() as HTMLElement ).setPointerCapture?.( event.pointerId )
				if( !from.base ) this.swipe_open( false )

			}

			const prev = this.swipe_drag() ?? from.base
			const next = Math.max( 0, Math.min( this.swipe_width, from.base + dx ) )
			const time = Math.max( 1, event.timeStamp - from.time )

			from.speed = ( next - prev ) / time
			from.time = event.timeStamp
			this.swipe_drag( next )

			return null
		}

		override swipe_end( event?: PointerEvent ) {

			const from = this.swipe_from
			this.swipe_from = null
			if( !from?.drag ) return null

			const open = this.swipe_settle( this.swipe_shift(), from.speed, this.swipe_width )
			this.swipe_drag( null )
			this.swipe_open( open )

			return null
		}

		override swipe_cancel( event?: PointerEvent ) {
			if( this.swipe_from ) this.swipe_from.speed = 0
			return this.swipe_end( event )
		}

		swipe_able() {
			return this.swipe() && this.tools().length > 0
		}

		swipe_measure() {
			this.swipe_width = ( this.Tools().dom_node() as HTMLElement ).offsetWidth
		}

		wheel_from = null as null | {
			base: number
			x: number
			y: number
			axis: 'wait' | 'drag' | 'skip'
			idle: $mol_after_timeout | null
		}

		override swipe_wheel( event?: WheelEvent ) {

			if( !event || !this.swipe_able() ) return null

			if( !this.wheel_from ) {
				this.swipe_measure()
				this.wheel_from = { base: this.swipe_shift(), x: 0, y: 0, axis: 'wait', idle: null }
			}

			const from = this.wheel_from
			from.idle?.destructor()
			from.idle = new this.$.$mol_after_timeout( 150, ()=> this.swipe_wheel_end() )

			from.x -= event.deltaX
			from.y -= event.deltaY

			if( from.axis === 'wait' ) {
				from.axis = this.swipe_axis( from.x, from.y, from.base )
				if( from.axis === 'drag' && !from.base ) this.swipe_open( false )
			}
			if( from.axis !== 'drag' ) return null

			event.preventDefault()
			this.swipe_drag( Math.max( 0, Math.min( this.swipe_width, from.base + from.x ) ) )

			return null
		}

		swipe_wheel_end() {

			const from = this.wheel_from
			this.wheel_from = null
			if( from?.axis !== 'drag' ) return

			const open = this.swipe_settle( this.swipe_shift(), 0, this.swipe_width )
			this.swipe_drag( null )
			this.swipe_open( open )

		}

		override swipe_focus( event?: FocusEvent ) {

			if( !event || !this.swipe_able() || this.swipe_open() ) return null
			if( !( this.Tools().dom_node() as HTMLElement ).contains( event.target as Node ) ) return null

			this.swipe_measure()
			this.swipe_open( true )

			return null
		}

		override event_activate( next?: Event ) {
			if( this.swipe_moved ) {
				this.swipe_moved = false
				return
			}
			return super.event_activate( next! )
		}

	}

}
