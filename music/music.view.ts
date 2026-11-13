namespace $.$$ {

	export class $bog_gram_music extends $.$bog_gram_music {

		/** В книге Gram страница называется по-русски, как и остальные. */
		override title() {
			return 'Музыка'
		}

		/** Палитра приходит от Gram: свой Skin тут только спорил бы с ним. */
		override Skin() {
			return null!
		}

		/** И режим темы тоже общий — его хранит та же ячейка, что у грама. */
		override Theme() {
			return null!
		}

		/** Освещённость по общей теме: своя тут больше не заведена. */
		override lights() {
			const theme = this.$.$bog_theme_auto.make({ $: this.$ })
			if( theme.mode() === 'system' ) return 'system'
			return theme.is_light_now() ? 'light' : 'dark'
		}

		/**
		 * Сброса аккаунта здесь нет: аккаунт общий с Gram, и стирать его из
		 * музыки значит стирать переписку. Кнопку заменяем текстом, который
		 * честно говорит, что вместе с аккаунтом пропадут и треки.
		 */
		@ $mol_mem
		override Account() {

			const account = super.Account()

			const hint = new this.$.$mol_paragraph()
			hint.title = () => 'Аккаунт в Music общий с Gram: ключ, переписка и скачанные треки одни на оба приложения. Сброса здесь нет — он стёр бы аккаунт в Gram, а треки тоже будут удалены. Сменить аккаунт можно в Gram, но треки тоже будут удалены.'

			const reset = new this.$.$mol_view()
			reset.sub = () => [ hint ]

			account.Reset = () => reset

			return account
		}

	}

}
