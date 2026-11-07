namespace $.$$ {

	export class $bog_gram_sound_node extends $.$bog_gram_sound_node {

		override dom_node( next?: Element ) {
			return super.dom_node( next ) as HTMLAudioElement
		}

		@ $mol_mem
		time() {
			this.retime()
			return this.dom_node().currentTime
		}

		start() {
			const node = this.dom_node()
			if( node.ended ) node.currentTime = 0
			node.play().catch( error => $mol_fail_log( error ) )
		}

		stop() {
			const node = this.dom_node()
			if( !node.paused ) node.pause()
		}

		override destructor() {
			$mol_wire_probe( ()=> this.dom_node() )?.pause()
			super.destructor()
		}

	}

}
