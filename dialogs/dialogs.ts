namespace $.$$ {

	/** Приватный (шифрованный ленд) список диалогов пользователя. */
	export class $bog_gram_dialogs extends $giper_baza_dict.with({
		Dialogs: $giper_baza_list_str,
		/** Неотправленные инвайты вида "lord|dialog" — шлются, когда доедут права чужого inbox */
		Outbox: $giper_baza_list_str,
		/** Убранные из своего списка диалоги — иначе повторный инвайт вернул бы их обратно */
		Hidden: $giper_baza_list_str,
	}) {}

}
