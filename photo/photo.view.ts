namespace $.$$ {

	export class $bog_gram_photo extends $.$bog_gram_photo {

		override Image() {
			return this.uri() ? super.Image() : null!
		}

	}

}
