namespace $.$$ {

	export class $bog_gram_round extends $.$bog_gram_round {

		override Video() {
			return this.uri() ? super.Video() : null!
		}

		override Play() {
			return this.playing() ? null! : super.Play()
		}

		video() {
			return this.Video() as $.$$.$mol_video_player | null
		}

		@ $mol_mem
		moment() {
			return $bog_gram_soft( ()=> this.video()?.time() ?? 0, 0 )
		}

		@ $mol_mem
		override stamp() {
			return this.$.$bog_gram_voice.stamp( this.playing() ? this.moment() : this.span() )
		}

		@ $mol_mem
		override share() {
			const span = this.span()
			if( !span || !this.playing() ) return '0'
			return Math.max( 0, Math.min( 1, this.moment() / span ) ).toFixed( 3 )
		}

		start() {
			const node = this.video()?.dom_node() as HTMLVideoElement | undefined
			if( !node ) return
			if( node.ended ) node.currentTime = 0
			node.play().catch( error => $mol_fail_log( error ) )
		}

		stop() {
			const node = this.video()?.dom_node() as HTMLVideoElement | undefined
			if( node && !node.paused ) node.pause()
		}

		override destructor() {
			this.stop()
			super.destructor()
		}

	}

}
