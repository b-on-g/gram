namespace $ {

	export class $bog_gram_count extends $mol_object {

		static plural( count: number, one: string, few: string, many: string ) {
			const tens = count % 100
			const ones = count % 10
			if( tens < 11 || tens > 14 ) {
				if( ones === 1 ) return count + ' ' + one
				if( ones >= 2 && ones <= 4 ) return count + ' ' + few
			}
			return count + ' ' + many
		}

		static people( count: number ) {
			return this.plural( count, 'участник', 'участника', 'участников' )
		}

		static dialogs( count: number ) {
			return this.plural( count, 'диалог', 'диалога', 'диалогов' )
		}

	}

}
