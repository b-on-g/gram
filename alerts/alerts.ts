namespace $ {

	export class $bog_gram_alerts extends $mol_object {

		@ $mol_mem
		Account() {
			return this.$.$bog_gram_account.make({ $: this.$ })
		}

		supported() {
			return this.$.$bog_gram_notify.supported()
		}

		@ $mol_mem
		permission( next?: NotificationPermission ) {
			return next ?? this.$.$bog_gram_notify.permission()
		}

		on( next?: boolean ) {
			return this.$.$mol_state_local.value< boolean >( 'bog_gram_notify', next ) ?? false
		}

		off( next?: boolean ) {
			return this.$.$mol_state_local.value< boolean >( 'bog_gram_notify_off', next ) ?? false
		}

		asked( next?: boolean ) {
			return this.$.$mol_state_local.value< boolean >( 'bog_gram_notify_asked', next ) ?? false
		}

		plan(
			supported: boolean,
			permission: NotificationPermission,
			on: boolean,
			off: boolean,
			asked: boolean,
		): 'skip' | 'subscribe' | 'ask' {
			if( !supported ) return 'skip'
			if( off ) return 'skip'
			if( permission === 'granted' ) return 'subscribe'
			if( permission === 'denied' ) return 'skip'
			return asked ? 'skip' : 'ask'
		}

		plan_now() {
			return this.plan( this.supported(), this.permission(), this.on(), this.off(), this.asked() )
		}

		@ $mol_mem
		auto() {
			if( this.plan_now() !== 'subscribe' ) return false
			if( !this.Account().monitor_link() ) return false
			$mol_wire_async( this ).apply( true )
			return true
		}

		@ $mol_action
		offer() {
			if( this.plan_now() !== 'ask' ) return false
			if( !this.$.$bog_gram_notify.activated() ) return false
			this.asked( true )
			$mol_wire_async( this ).grant()
			return true
		}

		grant() {
			const answer = this.$.$bog_gram_notify.permission_request()
			this.permission( answer )
			return answer === 'granted'
		}

		label() {
			return this.on() ? 'Выключить' : 'Включить уведомления'
		}

		status() {
			if( !this.supported() ) return 'Не поддерживается этим браузером'
			if( this.permission() === 'denied' ) return 'Запрещены в браузере'
			if( this.on() ) return 'Уведомления включены'
			if( this.off() ) return 'Выключены'
			return 'Спросим разрешение, когда откроете диалог'
		}

		@ $mol_action
		toggle( next?: any ) {
			$mol_wire_async( this ).apply( !this.on() )
			return null
		}

		apply( on: boolean ) {

			const notify = this.$.$bog_gram_notify
			const lord = this.Account().my_lord()

			if( !on ) {
				notify.unsubscribe( lord )
				this.on( false )
				this.off( true )
				return false
			}

			const ok = notify.subscribe( lord, this.Account().monitor_link() )
			this.permission( notify.permission() )
			this.on( ok )
			if( ok ) this.off( false )
			return ok
		}

	}

}
